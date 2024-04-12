import os
from flask_restful import Resource, Api, reqparse, marshal, fields
from application.sec import datastore
from sqlalchemy import or_
from werkzeug.security import generate_password_hash
from .models import Song, db
from flask_security import auth_required, roles_required, current_user
from werkzeug.datastructures import FileStorage
from flask import request, jsonify
from werkzeug.utils import secure_filename
api = Api(prefix='/api')

parser = reqparse.RequestParser()
parser.add_argument('name', type=str, help='Name of the Song')
parser.add_argument('lyrics', type=str, help='lyrics of the Song')
parser.add_argument('duration', type=int, help='duration of the Song in mins')
parser.add_argument('file', type=str, location='files', help='MP3 file of the song', required=True)
class Creator(fields.Raw):
    def format(self, user):
        return user.email


songs_field = {
  "id" : fields.Integer,
  "name": fields.String,
  "lyrics": fields.String,
  "duration": fields.Integer,
  "creator": Creator,
  "music_file" : fields.String,
}

class SongResource(Resource):
    @auth_required("token")
    def get(self):
        song_resource = Song.query.all()
        if len(song_resource) > 0:
            return marshal(song_resource, songs_field)
        else:
            return {"message": "No Resources Found"}, 404
    @auth_required("token")
    @roles_required("creator")
    def post(self):
        music_file = request.files['file']
        args = parser.parse_args()
        print(music_file.filename)

        if 'file' not in request.files or music_file.filename == '':
            return jsonify({'message': 'No file selected'}), 400

        filename = secure_filename(music_file.filename)
        music_file.save(os.path.join('uploads/', filename))
        song_resource = Song(name=args.get("name"), lyrics=args.get("lyrics"),duration=args.get("duration"),creator_id=current_user.id, music_file=filename)
        
        db.session.add(song_resource)
        db.session.commit()
        return {"message": "Song added Successfully"}

parser_regis = reqparse.RequestParser()
parser_regis.add_argument('email', type=str, help='Email Id of user')
parser_regis.add_argument('password', type=str, help='Password of User')
parser_regis.add_argument('roles', type=str, help='Role of user')
parser_regis.add_argument('username', type=str, help='user name')

class Registration(Resource):
    def post(self):
        args = parser_regis.parse_args()
        if not datastore.find_user(email=args.email):
            if args.roles == 'creator':
                datastore.create_user(email=args.email, password=generate_password_hash(args.password), roles=[args.roles], active=False, username = args.username)
            else:
                datastore.create_user(email=args.email, password=generate_password_hash(args.password), roles=[args.roles], username = args.username)    
        db.session.commit()

        return {"message": "User added Successfully"}


# api.add_resource(SongResource, '/get_song')
api.add_resource(Registration, '/registration')