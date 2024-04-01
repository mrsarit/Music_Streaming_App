from main import app
from application.models import db, Role

with app.app_context():
    db.create_all()
    admin = Role(id='admin', name='Admin', description='Admin description')
    db.session.add(admin)
    creator = Role(id='creator', name='Creator', description='Creator description')
    db.session.add(creator)
    user = Role(id='user', name='User', description='User description')
    db.session.add(user)
    db.session.commit()