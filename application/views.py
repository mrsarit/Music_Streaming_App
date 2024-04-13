from flask import current_app as app, jsonify, request, render_template, send_file, Blueprint
from flask_security import auth_required, roles_required, current_user
from flask_restful import marshal, fields
from .models import User, db
from .sec import datastore
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename
from .models import *
from datetime import datetime
from sqlalchemy import text
from sqlalchemy import or_


@app.get('/')
def home():
    return render_template("index.html")

@app.get('/admin')
@auth_required("token")
@roles_required("admin")
def admin():
    return "Wecome admin"

@app.get('/admin/activate/<int:user_id>')
@auth_required("token")
@roles_required("admin")
def activate_creator(user_id):
    user = User.query.get(user_id)
    if not user or "creator" not in user.roles:
        return jsonify({"message" : "User not Found"}), 404
    user.active = True
    db.session.commit()
    return jsonify({"message" : "Creator Activated"})

@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message" : "Email not provided"}), 400
    user = datastore.find_user(email=email)
    if not user:
        return jsonify({"message" : "User not found"}), 404
    if check_password_hash(user.password, data.get('password')):
        return jsonify({"token" : user.get_auth_token(), "email" : user.email, "role" : user.roles[0].name})
    else: 
        return jsonify({"message" : "Wrong Password"}), 400

user_fields = {
    "id": fields.Integer,
    "email": fields.String,
    "active": fields.Boolean
}

@app.get('/users')
@auth_required("token")
@roles_required("admin")
def all_users():
    users = User.query.all()
    if len(users) == 0:
        return jsonify({"message" : "No User Found"}), 404
    return marshal(users, user_fields)

@app.route('/upload', methods=['POST'])
@auth_required("token")
@roles_required("creator")
def upload_file():
   file = request.files['file']
   new_filename =  str(datetime.now().timestamp()).replace(".", "") # Generating unique name for the file
   split_filename = file.filename.split(".")
   ext_pos = len(split_filename)-1 
   ext = split_filename[ext_pos]
   file.save(f"uploads/{new_filename}.{ext}")
   song_resource = Song(name=request.form['name'], lyrics=request.form['lyrics'],duration=request.form['duration'],creator_id=current_user.id, music_file=f"uploads/{new_filename}.{ext}")
   db.session.add(song_resource)
   db.session.commit()
   return {"message": "Song added Successfully"}

# @app.route('/play_song/<int:song_id>')
# @auth_required("token")
# def play_song(song_id):
#     song = Song.query.get(song_id)
#     if not song:
#         return jsonify({"message": "Song not found"}), 404

#     music_file_path = song.music_file
#     return send_file(music_file_path, as_attachment=True)

@app.route('/api/get_song')
@auth_required("token")
def get_songs():
    songs = Song.query.all()
    song_list = [{'id': song.id, 'name': song.name} for song in songs[::-1]]
    return jsonify(song_list)

@app.route('/api/get_song/<int:song_id>')
@auth_required("token")
def get_song(song_id):
    song = Song.query.get(song_id)
    creator = User.query.get(song.creator_id)
    if not song:
        return jsonify({"message": "Song not found"}), 404
    return jsonify({'id': song.id, 'name': song.name, 'creator': creator.username})

@app.route('/api/play_song/<int:song_id>')
@auth_required("token")
def play_song(song_id):
    song = Song.query.get(song_id)
    if not song:
        return jsonify({"message": "Song not found"}), 404    
    return send_file(song.music_file, mimetype='audio/mpeg')


# Create an album
@app.route('/api/albums', methods=['POST'])
@auth_required("token")
def create_album():
    data = request.json
    album_name = data.get('name')
    song_ids = data.get('songs', [])
    
    # Check if the album name is provided
    if not album_name:
        return jsonify({'message': 'Album name is required'}), 400
    
    # Check if the album with the same name already exists
    existing_album = Album.query.filter_by(name=album_name).first()
    if existing_album:
        return jsonify({'message': 'Album with the same name already exists'}), 400

    # Create a new album
    album = Album(name=album_name, creator_id=current_user.id)
    db.session.add(album)
    db.session.commit()

    # Add songs to the album
    for song_id in song_ids:
        song = Song.query.get(song_id)
        if song:
            album_song = AlbumSongs(album_id=album.id, song_id=song_id)
            db.session.add(album_song)

    db.session.commit()
    return jsonify({'message': 'Album created successfully'}), 201

# Get all albums
@app.route('/api/albums', methods=['GET'])
@auth_required("token")
def get_albums():
    albums = Album.query.all()
    album_list = [{'id': album.id, 'name': album.name, 'creator_id': album.creator_id} for album in albums]
    return jsonify(album_list)
@app.route('/api/user_albums')
@auth_required("token")
def get_user_albums():
    user_id = current_user.id
    albums = Album.query.filter_by(creator_id=user_id).all()
    album_list = []

    for album in albums:
        songs = AlbumSongs.query.filter_by(album_id=album.id).order_by(AlbumSongs.id.desc()).limit(5).all()
        song_list = []

        for song in songs:
            song_data = Song.query.filter_by(id=song.song_id).first()
            song_list.append({
                'id': song_data.id,
                'name': song_data.name
            })

        album_list.append({
            'id': album.id,
            'name': album.name,
            'songs': song_list
        })

    return jsonify(album_list)

@app.route('/api/search_songs')
@auth_required("token")
def search_songs():
    query = request.args.get('q', '')
    songs = Song.query.filter(
        or_(
            Song.name.ilike(f'%{query}%'),
            Song.lyrics.ilike(f'%{query}%'),
            Song.creator_id.in_(
                db.session.query(User.id).filter(User.username.ilike(f'%{query}%'))
            ),
            Song.id.in_(
                db.session.query(AlbumSongs.song_id).filter(
                    AlbumSongs.album_id.in_(
                        db.session.query(Album.id).filter(Album.name.ilike(f'%{query}%'))
                    )
                )
            )
        )
    ).all()
    song_list = [{'id': song.id, 'name': song.name, 'creator': song.creator.username if song.creator else None} for song in songs]
    return jsonify(song_list)
@app.route('/api/add_to_album/<int:song_id>/<int:album_id>', methods=['POST'])
@auth_required("token")
def add_to_album(song_id, album_id):
    song = Song.query.get(song_id)
    if not song:
        return jsonify({"message": "Song not found"}), 404

    album = Album.query.get(album_id)
    if not album:
        return jsonify({"message": "Album not found"}), 404

    album.songs.append(song)
    db.session.commit()

    return jsonify({"message": "Song added to album successfully"}), 200

@app.route('/api/delete_song_from_album/<int:song_id>/<int:album_id>', methods=['DELETE'])
@auth_required("token")
def delete_song_from_album(song_id, album_id):
    try:
        album = Album.query.get(album_id)
        if not album:
            return jsonify({'message': 'Album not found'}), 404

        song = Song.query.get(song_id)
        if not song:
            return jsonify({'message': 'Song not found'}), 404

        if song not in album.songs:
            return jsonify({'message': 'Song not in album'}), 400

        album.songs.remove(song)
        db.session.commit()
        return jsonify({'message': 'Song removed from album'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
@app.route('/api/delete_album/<int:album_id>', methods=['DELETE'])
@auth_required("token")
def delete_album(album_id):
    try:
        album = Album.query.get(album_id)
        if not album:
            return jsonify({'message': 'Album not found'}), 404

        db.session.delete(album)
        db.session.commit()
        return jsonify({'message': 'Album deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500