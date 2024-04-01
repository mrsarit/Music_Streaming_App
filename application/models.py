from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

class User(db.Model):
    pass
class Role(db.Model):
    pass
class MusicResource(db.Model):
    pass