from main import app
from application.models import db, Role
from application.sec import datastore

with app.app_context():
    db.create_all()
    datastore.find_or_create_role(name='admin', description='User is an admin')
    datastore.find_or_create_role(name="user", description="User is an User")
    datastore.find_or_create_role(name="creator", description="creator is a Student")
    db.session.commit()
    if not datastore.find_user(email="admin@email.com"):
        datastore.create_user(
            email="admin@email.com", password="admin", roles=["admin"])
    if not datastore.find_user(email="user@email.com"):
        datastore.create_user(
            email="user@email.com", password="user", roles=["user"], active=False)
    if not datastore.find_user(email="creator@email.com"):
        datastore.create_user(
            email="creator@email.com", password="creator", roles=["creator"])
    db.session.commit()
