from flask import current_app as app, jsonify, request, render_template, send_file, Blueprint
from flask_security import auth_required, roles_required, current_user
from flask_restful import marshal, fields
from .models import User, db
from .sec import datastore
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename
from .models import *
from datetime import datetime
from sqlalchemy import desc, text
from sqlalchemy import or_
from sqlalchemy import func
import pytz


@app.route('/')
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
        if  user.roles[0].name=='creator' and user.active==False:
            return jsonify({"message" : "Creator not Activated"}), 400
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
   song_resource = Song(name=request.form['name'], lyrics=request.form['lyrics'],duration=request.form['duration'],creator_id=current_user.id, \
                        music_file=f"uploads/{new_filename}.{ext}", album_id=request.form['selectedAlbumId'])
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

    # Calculate the average rating for the song
    average_rating = db.session.query(func.avg(Rating.rating)).filter(Rating.song_id == song_id).scalar()

    # Get the current user's existing rating for the song
    current_user_rating = None
    if current_user.is_authenticated:
        current_user_rating_obj = Rating.query.filter_by(song_id=song_id, user_id=current_user.id).first()
        if current_user_rating_obj:
            current_user_rating = current_user_rating_obj.rating

    return jsonify({
        'id': song.id,
        'name': song.name,
        'creator': creator.username,
        'lyrics': song.lyrics,
        'average_rating': average_rating or 0,  # Set to 0 if average_rating is None
        'current_user_rating': current_user_rating
    })

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
@app.route('/api/creator_songs', methods=['GET'])
@auth_required("token")
def get_creator_songs():
    if current_user.has_role('admin'):
        songs = Song.query.all()
    elif current_user.has_role('creator'):
        songs = Song.query.filter_by(creator=current_user).all()
    serialized_songs = []
    for song in songs:
        serialized_songs.append({
            'id': song.id,
            'name': song.name,
            'lyrics': song.lyrics,
            'duration': song.duration,
        })
    return jsonify(serialized_songs)
@app.route('/api/delete_song/<int:song_id>', methods=['DELETE'])
@auth_required("token")
def delete_song( song_id):
    song = Song.query.get(song_id)
    if not song:
        return jsonify({'message': 'Song not found'}), 404
    if song.creator != current_user:
        return jsonify({'message': 'Unauthorized'}), 403
    db.session.delete(song)
    db.session.commit()
    return jsonify({'message': 'Song deleted'}), 200
@app.route('/api/edit_song/<int:song_id>', methods=['PUT'])
@auth_required("token")
def edit_song(song_id):
    song = Song.query.get(song_id)
    if not song:
        return jsonify({'error': 'Song not found'}), 404
    data = request.get_json()
    song.name = data.get('name', song.name)
    song.lyrics = data.get('lyrics', song.lyrics)
    song.duration = data.get('duration', song.duration)
    db.session.commit()

    return jsonify({'message': 'Song updated successfully'}), 200
@app.route('/api/rate_song/<int:song_id>/<int:rating>', methods=['POST'])
@auth_required('token')
def rate_song(song_id, rating):
    song = Song.query.filter_by(id=song_id).first()
    if not song:
        return jsonify(message='Song not found'), 404

    # Check if the user has already rated the song
    existing_rating = Rating.query.filter_by(song_id=song_id, user_id=current_user.id).first()
    if existing_rating:
        existing_rating.rating = rating
    else:
        new_rating = Rating(song_id=song_id, user_id=current_user.id, rating=rating)
        db.session.add(new_rating)
    
    db.session.commit()
    return jsonify(message='Rating submitted successfully'), 200

@app.route('/api/recently_added_songs')
@auth_required('token')
def get_recently_added_songs():
    songs = Song.query.order_by(Song.updated_at.desc()).limit(5).all()
    return jsonify([
        {
            'id': song.id,
            'name': song.name,
            'creator': User.query.get(song.creator_id).username,
            'lyrics': song.lyrics,
            'average_rating': db.session.query(func.avg(Rating.rating)).filter(Rating.song_id == song.id).scalar() or 0,
            'current_user_rating': Rating.query.filter_by(song_id=song.id, user_id=current_user.id).first().rating if Rating.query.filter_by(song_id=song.id, user_id=current_user.id).first() else None
        } for song in songs
    ])
@app.route('/api/top_rated_songs')
@auth_required('token')
def get_top_rated_songs():
    songs = db.session.query(Song, func.avg(Rating.rating).label('average_rating'))\
            .join(Rating, Song.id == Rating.song_id)\
            .group_by(Song.id)\
            .order_by(desc('average_rating'))\
            .limit(5)\
            .all()
    return jsonify([{'id': song[0].id, 'name': song[0].name, 'average_rating': song[1]} for song in songs])

@app.route('/api/add_song_with_album', methods=['POST'])
@roles_required("creator")
@auth_required('token')
def add_song_with_album():
    data = request.json
    name = data.get('name')
    lyrics = data.get('lyrics')
    duration = data.get('duration')
    album_name = data.get('albumName')

    if not name or not album_name:
        return jsonify({"message": "Name and Album are required"}), 400

    album = SongAlbum.query.filter_by(name=album_name).first()
    if not album:
        album = SongAlbum(name=album_name)
        db.session.add(album)
        db.session.commit()

    song = Song(name=name, lyrics=lyrics, duration=duration, album_id=album.id)
    db.session.add(song)
    db.session.commit()

    return jsonify({"message": "Song added successfully"}), 201
# Create an album
@app.route('/api/song-albums', methods=['POST'])
@auth_required("token")
def create_song_album():
    data = request.json
    album_name = data.get('name')
    
    # Check if the album name is provided
    if not album_name:
        return jsonify({'message': 'Album name is required'}), 400
    
    # Check if the album with the same name already exists
    existing_album = SongAlbum.query.filter_by(name=album_name).first()
    if existing_album:
        return jsonify({'message': 'Album with the same name already exists'}), 400

    # Create a new album
    album = SongAlbum(name=album_name, creator_id=current_user.id)
    db.session.add(album)
    db.session.commit()
    return jsonify({'message': 'Album created successfully'}), 201
@app.route('/api/get_user_albums')
@auth_required("token")
def get_user_song_albums():
    user_id = current_user.id
    albums = SongAlbum.query.filter_by(creator_id=user_id).all()
    album_list = []
    for album in albums:
        album_list.append({
            'id': album.id,
            'name': album.name,
        })
    return jsonify(album_list)
@app.route('/api/last_visit')
@auth_required("token")
def update_last_visit():
    user = User.query.get(current_user.id)
    user.last_visit = datetime.now(pytz.timezone('Asia/Kolkata'))
    db.session.commit()

    return jsonify({"message": "Last visit updated"})