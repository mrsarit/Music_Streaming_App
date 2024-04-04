from main import app
from application.models import db, Role
from application.sec import datastore
from flask_security import hash_password
from werkzeug.security import generate_password_hash

with app.app_context():
    db.create_all()
    datastore.find_or_create_role(name='admin', description='User is an admin')
    datastore.find_or_create_role(name="user", description="User is an User")
    datastore.find_or_create_role(name="creator", description="creator is a Student")
    db.session.commit()
    if not datastore.find_user(email="admin@email.com"):
        datastore.create_user(
            email="admin@email.com", password=generate_password_hash("admin"), roles=["admin"])
    db.session.commit()
