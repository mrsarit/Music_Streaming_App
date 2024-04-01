from flask import Flask
from application.models import db

def create_app():
    app = Flask(__name__)
    db.init_app(app)
    with app.app_context():
        import application.views
    return app
app = create_app()
if __name__ == '__main__':
    app.run(debug=True)