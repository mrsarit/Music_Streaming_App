from flask_restful import Resource, Api, reqparse, marshal_with, fields
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

api.add_resource(SongResource, '/get_song')