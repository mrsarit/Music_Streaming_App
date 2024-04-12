from flask import current_app as app, jsonify, request, render_template, send_file
from flask_security import auth_required, roles_required, current_user
from flask_restful import marshal, fields
from .models import User, db
from .sec import datastore
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename
from .models import *
from datetime import datetime


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
    song_list = [{'id': song.id, 'name': song.name} for song in songs]
    return jsonify(song_list)

@app.route('/api/get_song/<int:song_id>')
@auth_required("token")
def get_song(song_id):
    song = Song.query.get(song_id)
    if not song:
        return jsonify({"message": "Song not found"}), 404
    return jsonify({'id': song.id, 'name': song.name, 'music_file': song.music_file})

@app.route('/api/play_song/<int:song_id>')
@auth_required("token")
def play_song(song_id):
    song = Song.query.get(song_id)
    if not song:
        return jsonify({"message": "Song not found"}), 404    
    return send_file(song.music_file, mimetype='audio/mpeg')

