from flask_restful import Resource, Api, reqparse, marshal_with, fields
from application.sec import datastore
from flask_security import hash_password
from .models import Song, db
api = Api(prefix='/api')

parser = reqparse.RequestParser()
parser.add_argument('name', type=str, help='Name of the Song')
parser.add_argument('lyrics', type=str, help='lyrics of the Song')
parser.add_argument('duration', type=int, help='duration of the Song in mins')

songs_field = {
  "name": fields.String,
  "lyrics": fields.String,
  "duration": fields.Integer
}

class SongResource(Resource):
    @marshal_with(songs_field)
    def get(self):
        all_songs = Song.query.all()
        if len(all_songs)<1:
            return {"message": "No songs found"}, 404
        return all_songs
    def post(self):
        args = parser.parse_args()
        song_resource = Song(**args)
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
                datastore.create_user(email=args.email, password=hash_password(args.password), roles=[args.roles], active=False, username = args.username)
            else:
                datastore.create_user(email=args.email, password=hash_password(args.password), roles=[args.roles], username = args.username)    
        db.session.commit()

        return {"message": "User added Successfully"}


api.add_resource(SongResource, '/get_song')
api.add_resource(Registration, '/registration')