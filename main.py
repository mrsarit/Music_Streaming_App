from flask import Flask
def create_app():
    app = Flask(__name__)
    with app.app_context():
        import application.views
    return app
app = create_app()
if __name__ == '__main__':
    app.run(debug=True)