from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('user.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))

class AlbumSongs(db.Model):
    __tablename__ = 'album_songs'
    id = db.Column(db.Integer(), primary_key=True)
    album_id = db.Column('album_id', db.Integer(), db.ForeignKey('album.id'))
    song_id = db.Column('song_id', db.Integer(), db.ForeignKey('song.id'))

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=False)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary='roles_users',
                         backref=db.backref('users', lazy='dynamic'))
    music_resource = db.relationship('Song', backref='creator')
class Role(db.Model):
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))
class Song(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    lyrics = db.Column(db.String, nullable=False)
    duration = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_approved = db.Column(db.Boolean(), default=False)
class Album(db.Model): 
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    songs = db.relationship('Song', secondary='album_songs',
                         backref=db.backref('album', lazy='dynamic'))