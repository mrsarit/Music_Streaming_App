from flask import current_app as app, jsonify, request, render_template
from flask_security import auth_required, roles_required
from flask_restful import marshal, fields
from .models import User, db
from .sec import datastore
from werkzeug.security import check_password_hash
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
