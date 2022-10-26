import os,json
from flask import Flask,jsonify,request, session
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from flask_jwt_extended import get_current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required,JWTManager \
    ,get_jwt,get_jwt_identity,current_user,create_refresh_token
from flask_jwt_extended import decode_token
from flask_socketio import SocketIO, emit, join_room, leave_room, \
    close_room, rooms, disconnect
from flask_socketio import ConnectionRefusedError
from sqlalchemy import and_

basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__, instance_relative_config=True)
app.config.from_mapping(
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    ,SQLALCHEMY_TRACK_MODIFICATIONS = False
    ,SECRET_KEY = "secret"
    ,JWT_SECRET_KEY = "secret"
    ,JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=3)
    ,JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    ,JWT_TOKEN_LOCATION = ["headers", "query_string"]
    ,JSON_AS_ASCII = False
)
socketIo = SocketIO(app, cors_allowed_origins="*")
cors = CORS(app, responses={r"/*": {"origins": "*"}})
db = SQLAlchemy(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

###########################################
###########################################
##########          DB           ##########
###########################################

###########################################
# followers -> friends
# follower -> requester
# followed -> requested
friends = db.Table('friends',
    db.Column('requester', db.Integer, db.ForeignKey('user.id')),
    db.Column('requested', db.Integer, db.ForeignKey('user.id'))
)

class User(db.Model):  # type: ignore
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(), nullable=False)
    password = db.Column(db.String())
    icon = db.Column(db.String())
    secret_key = db.Column(db.String())
    requested = db.relationship(
        'User', secondary=friends,
        primaryjoin=(friends.c.requester == id),
        secondaryjoin=(friends.c.requested == id),
        backref=db.backref('friends', lazy='dynamic'), lazy='dynamic')
    def set_password(self, password):
        self.password = generate_password_hash(password)
    def check_password(self, password):
        return check_password_hash(self.password, password)
    def set_secret_key(self, key):
        self.secret_key = generate_password_hash(key)
    def check_secret_key(self, key):
        return check_password_hash(self.secret_key, key)

    def request(self, user):
        if not self.is_requested(user) and not user == self:
            self.requested.append(user)

    def un_request(self, user):
        if self.is_requested(user):
            self.requested.remove(user)

    def is_requested(self, user):
        return self.requested.filter(
            friends.c.requested == user.id
            ).count() > 0

    def get_friends_list(self):
        #return User.query.all()
        users = self.requested.all()
        r = []
        for user in users:
            if self in user.requested.all():
                r.append(user)
        return r
        #return User.query.filter(User.id != self.id)
def get_user_data(user: User):
    return {
        "id": user.id,
        "name": user.name,
    }
    

class Space(db.Model): # type: ignore
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String())
    secret_key = db.Column(db.String())
    def set_secret_key(self, key):
        self.secret_key = generate_password_hash(key)
    def check_secret_key(self, key):
        return check_password_hash(self.secret_key, key)
def get_space_data(space: Space):
    return {
        "id": space.id,
        "name": space.name,
    }

class Space_user(db.Model): # type: ignore
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    admin = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    space_id = db.Column(db.Integer, db.ForeignKey("space.id"))

class  Message_space(db.Model): # type: ignore
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    to_space = db.Column(db.Integer, db.ForeignKey("space.id"))
    to_space_name = db.Column(db.String)
    from_user = db.Column(db.Integer, db.ForeignKey("user.id"))
    from_user_name = db.Column(db.String)
    body = db.Column(db.String)
    timestamp = db.Column(db.DateTime, index=True, server_default=func.now())
def get_space_message_data(message: Message_space):
    return {
        "id": message.id,
        "to_space": message.to_space,
        "to_space_name": message.to_space_name,
        "from_user": message.from_user,
        "from_user_name": message.from_user_name,
        "body": message.body,
        "timestamp": message.timestamp
    }

class Message_user(db.Model):  # type: ignore
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    to_user = db.Column(db.Integer, db.ForeignKey("user.id"))
    to_user_name = db.Column(db.String())
    from_user = db.Column(db.Integer, db.ForeignKey("user.id"))
    from_user_name = db.Column(db.String())
    body = db.Column(db.String)
    timestamp = db.Column(db.DateTime, index=True, server_default=func.now())
def get_message_data(message: Message_user):
    return {
        "id": message.id,
        "to_user": message.to_user,
        "to_user_name": message.to_user_name,
        "from_user": message.from_user,
        "from_user_name": message.from_user_name,
        "body": message.body,
        "timestamp": message.timestamp
    }
def get_messages_user(me: int, you: int)-> Message_user:
    messages = Message_user.query.filter(and_(Message_user.to_user == me,Message_user.from_user == you) | and_(Message_user.to_user == you,Message_user.from_user == me))
    return messages


###########################################
###########################################
##########       Socket          ##########
###########################################
###########################################
@socketIo.on('connect')
def connect():
    if not token_auth(request.args.get('token')):
        raise ConnectionRefusedError("Token not found")

    #print(decode_token(request.args.get("token")))  # type: ignore
    #print("Connecting")
    #print("token:",request.args.get("token"))

@socketIo.event
def socket_join_room(message):
    data = decode_token(message["token"])
    if not data:
        raise ConnectionRefusedError("token not found")
    if str(data["sub"]) == str(message["room"]):
        join_room(str(message["room"]))

@socketIo.event
def socket_leave_room(message):
    leave_room(message["room"])

#@socketIo.event
#def socket_send_message_to(message):
#    for i in range(0,2):
#        emit("message_from_user",{"data":message["data"] + "," + str(i),"to":message["to"],"from":message["from"]}, to=message["to"])

@socketIo.event
def socket_send_message_to_user(message):
    if not token_auth(request.args.get('token')):
        raise ConnectionRefusedError("Token not found")
    token_data = decode_token(request.args.get('token'))  # type: ignore
    user_id = token_data["sub"]

    u = User.query.get(int(token_data["sub"]))
    t: User = User.query.get(int(message["to"]))
    if not t in u.get_friends_list():
        return jsonify("user not found"), 403
        
    msg = Message_user(
        to_user=t.id,
        to_user_name=t.name,
        from_user=u.id,
        from_user_name=u.name,
        body=message["body"]
    )

    db.session.add(msg)
    db.session.commit()

    emit("message_from_user",{
        "body":message["body"],
        "to":message["to"],
        "from":user_id,
        "timestamp":str(msg.timestamp),
        "from_user_name":msg.from_user_name
    },to=str(message["to"]))
    emit("message_to_user",{
        "body":message["body"],
        "to":message["to"],
        "from":user_id,
        "timestamp":str(msg.timestamp),
        "from_user_name":msg.from_user_name
    }, to=str(user_id))

@socketIo.event
def socket_send_message_to_space(message):
    if not token_auth(request.args.get('token')):
        raise ConnectionRefusedError("Token not found")
    token_data = decode_token(request.args.get('token'))  # type: ignore
    user_id = token_data["sub"]
    u:User = User.query.get(int(token_data["sub"]))
    t:Space = Space.query.get(int(message["to"]))
    if not t or not Space_user.query.filter(Space_user.space_id==t.id).filter(Space_user.user_id==u.id).first():
        return jsonify("space not found"), 403
    

    msg = Message_space(
        to_space=t.id,
        to_space_name=t.name,
        from_user= u.id,
        from_user_name=u.name,
        body= message["body"],
    )
    db.session.add(msg)
    db.session.commit()

    space_users = Space_user.query.filter(Space_user.space_id == t.id).filter(Space_user.user_id != u.id)
    for user in space_users:
        emit("message_from_space",{
            "body": message["body"],
            "to": message["to"],
            "from": u.id,
            "from_user_name": u.name,
            "timestamp": str(msg.timestamp)
        }, to=str(user.user_id))
    emit("message_to_space",{
        "body": message["body"],
        "to": message["to"],
        "from": u.id,
        "from_user_name": u.name,
        "timestamp": str(msg.timestamp)
    }, to=str(u.id))

@socketIo.event
def socket_request_reply(message):
    if not token_auth(request.args.get('token')):
        raise ConnectionRefusedError("Token not found")
    token_data = decode_token(request.args.get('token'))  # type: ignore
    u:User = User.query.get(int(token_data["sub"]))
    y = User.query.filter(message["name"] == User.name).first()
    if u and y:
        print("send",y.id)
        emit("chat_request_replay",{
            "from": u.id,
            "from_user_name": u.name,
        }, to=str(y.id))

@socketIo.event
def socket_un_request_reply(message):
    if not token_auth(request.args.get('token')):
        raise ConnectionRefusedError("Token not found")
    token_data = decode_token(request.args.get('token'))  # type: ignore
    u:User = User.query.get(int(token_data["sub"]))
    y = User.query.filter(message["name"] == User.name).first()
    if u and y:
        print("send",y.id)
        emit("chat_un_request_replay",{
            "from": u.id,
            "from_user_name": u.name,
        }, to=str(y.id))




#@socketIo.event
#def socket_connect(message):
#    print(message)
#    session['receive_count'] = session.get('receive_count', 0) + 1
#    emit('my_response',
#            {'data': message['data'], 'count': session['receive_count']})

#@socketIo.event
#def socket_message(message):
#    print(message)
#    emit('my_response',
#            {'data': "", 'count': ""})



###########################################
###########################################
##########         API           ##########
###########################################
###########################################
@app.route("/friends/list/", methods=["GET"])
@cross_origin()
@jwt_required()
def get_friends_list():
    u:User = User.query.get(current_user.id)  # type: ignore
    #if not u:
    #    return jsonify(False), 400
    friends_list = u.get_friends_list()
    result = []
    for friend in friends_list:
        result.append(get_user_data(friend))
    return jsonify({"data":result})


@app.route("/friends/request/<user_name>", methods=["POST"])
@cross_origin()
@jwt_required()
def friends_request(user_name):
    u:User = User.query.get(current_user.id)  # type: ignore
    y:User = User.query.filter(User.name == user_name).first() # type: ignore
    if not u or not y:
        return jsonify("false"), 403
    print(u,y)
    u.request(y)
    db.session.commit()
    #print(u.requested.all(),u.requester.all())
    #print(y.requested.all(),y.requester.all())
    return jsonify({"data":get_user_data(y)})

@app.route("/friends/unrequest/<user_name>", methods=["POST"])
@cross_origin()
@jwt_required()
def friends_un_request(user_name):
    u:User = User.query.get(current_user.id)  # type: ignore
    y:User = User.query.filter(User.name == user_name).first() # type: ignore
    if not u or not y:
        return jsonify("false"), 403
    u.un_request(y)
    db.session.commit()
    return jsonify({"data":get_user_data(y)})

@app.route("/friends/requester", methods=["GET"])
@cross_origin()
@jwt_required()
def get_requester():
    u = User.query.get(current_user.id) # type: ignore
    u_requested = u.requested.all()
    users = User.query.all()
    requesters = []
    for user in users:
        if u in user.requested.all() and not user in u.requested:
            requesters.append(user)
    result = []
    for requester in requesters:
        result.append(get_user_data(requester))
    #users = u.requested.all()
    #r = []
    #for user in users:
    #    if not u in user.requested.all():
    #        r.append(user)
    #result = []
    #for r in r:
    #    result.append(get_user_data(r))
    return jsonify({"data": result})

@app.route("/friends/requesting", methods=["GET"])
@cross_origin()
@jwt_required()
def get_requesting():
    u = User.query.get(current_user.id) # type: ignore
    requested = u.requested.all()
    result = []
    for r in requested:
        if not u in r.requested.all():
            result.append(get_user_data(r))
    return jsonify({"data": result})



@app.route("/chat/get/<user_id>", methods=["GET"])
@cross_origin()
@jwt_required()
def get_chat_data(user_id):
    u: User = User.query.get(current_user.id) # type: ignore
    f: User = User.query.get(int(user_id))
    if not f in u.get_friends_list():
        return jsonify("user not found"), 403
    messages = get_messages_user(u.id, f.id)
    result = []
    for msg in messages:
        data = get_message_data(msg)
        result.append({
            "body":data["body"],
            "to":data["to_user"],
            "from":data["from_user"],
            "timestamp":data["timestamp"],
            "from_user_name":data["from_user_name"]
        })
    return jsonify({"data": result})


@app.route("/space/chat/get/<space_id>", methods=["GET"])
@cross_origin()
@jwt_required()
def get_space_chat_data(space_id):
    space = Space.query.get(int(space_id))
    if not Space_user.query.filter(Space_user.space_id==space.id).filter(Space_user.user_id==current_user.id).first(): # type: ignore
        return jsonify("error"), 403
    messages = Message_space.query.filter(Message_space.to_space == space.id)
    result = []
    for msg in messages:
        data = get_space_message_data(msg)
        result.append({
            "body": data["body"],
            "to":data["to_space"],
            "from": data["from_user"],
            "timestamp": data["timestamp"],
            "from_user_name": data["from_user_name"]
        })
    return jsonify({"data":result})


@app.route("/space/list", methods=["GET"])
@cross_origin()
@jwt_required()
def get_space_list():
    spaces = Space_user.query.filter(Space_user.user_id==current_user.id) # type: ignore
    s = []
    for space in spaces:
        s.append(Space.query.get(space.space_id))
    result = []
    for space in s:
        result.append(get_space_data(space))
    return jsonify({"data": result})


@app.route("/space/create", methods=["POST"])
@cross_origin()
@jwt_required()
def create_space():
    name = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["name"]
    key = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["key"]
    if not name or not key or Space.query.filter(Space.name == name).first():
        return jsonify("error"), 403
    space = Space(name=name)
    space.set_secret_key(key)
    db.session.add(space)
    db.session.commit()
    u = Space_user(admin=True, user_id=current_user.id, space_id=space.id)  # type: ignore
    db.session.add(u)
    db.session.commit()
    return jsonify({"data":get_space_data(space)})


@app.route("/space/join/<space_name>", methods=["POST"])
@cross_origin()
@jwt_required()
def join_space(space_name):
    key = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["key"]
    space = Space.query.filter(Space.name == space_name).first()
    if space is None or not space.check_secret_key(key) or Space_user.query.filter(Space_user.user_id==current_user.id).filter(Space_user.space_id==space.id).first(): # type: ignore
        return jsonify("error"), 403
    u = Space_user(user_id=current_user.id, space_id=space.id) # type: ignore
    db.session.add(u)
    db.session.commit()
    return jsonify({"data":get_space_data(space)})


@app.route("/space/leave/<space_name>", methods=["DELETE"])
@cross_origin()
@jwt_required()
def leave_space(space_name):
    space = Space.query.filter(Space.name == space_name).first()
    space_user = Space_user.query.filter(Space_user.user_id==current_user.id).filter(Space_user.space_id==space.id).first()  # type: ignore
    db.delete(space_user)
    db.session.commit()
    return jsonify("success")

@app.route("/friends/delete/<user_id>", methods=["DELETE"])
@cross_origin()
@jwt_required()
def delete_friend(user_id):
    u = User.query.get(current_user.id) # type: ignore
    y = User.query.get(int(user_id))
    if not u or not y:
        return jsonify("error"), 403
    u.un_request(y)
    y.un_request(u)
    db.session.commit()
    return jsonify("success")



###########################################
###########################################
##########      Function         ##########
###########################################
###########################################
def token_auth(jwt):
    try:
        if not decode_token(jwt):
            return False
    except:
        return False
    return True

def get_token_data(jwt):
    if not token_auth(jwt):
        return False
    data = decode_token(jwt)
    return data

############################################################################################################################################################
############################################################################################################################################################
##########        TOKEN          ###########################################################################################################################
############################################################################################################################################################
############################################################################################################################################################
class TokenBlocklist(db.Model): # type: ignore
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    type = db.Column(db.String(16), nullable=False)
    user_id = db.Column(db.ForeignKey('user.id'), default=lambda: get_current_user().id, nullable=False)
    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)

@app.route('/register', methods=['POST'])
@cross_origin()
def register():
    username = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["username"]
    password = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["password"]
    if password is None or username is None or password == "" or username == "": return jsonify({"msg": "password or username has not been entered"}), 400
    if len(password) < 5: return jsonify({"msg": "password is too short"}), 400
    if len(username) < 3: return jsonify({"msg": "username is too short"}), 400
    if User.query.filter_by(name=username).first() is not None: return jsonify({"msg": "The username is already in use"}), 409
    user = User(name=username)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify("create account")

@app.route('/token', methods=['POST'])
@cross_origin()
def create_token():
    username = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["username"]
    password = json.loads(json.loads(request.get_data().decode('utf-8'))["body"])["password"]
    user = User.query.filter_by(name=username).first()
    if user is None or not user.check_password(password):
        return jsonify({"msg": "Incorrect password or username"}), 401
    access_token = create_access_token(identity=username)
    refresh_token = create_refresh_token(identity=username)
    return jsonify(access_token=access_token, refresh_token=refresh_token)

@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
@cross_origin()
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token)

@app.route("/logout", methods=["DELETE"])
@jwt_required(verify_type=False)
@cross_origin()
def modify_token():
    token = get_jwt()
    jti = token["jti"]
    ttype = token["type"]
    now = datetime.now(timezone.utc)
    db.session.add(TokenBlocklist(jti=jti, type=ttype, created_at=now))
    db.session.commit()
    return jsonify(msg=f"{ttype.capitalize()} token successfully revoked")

@jwt.user_identity_loader
def user_identity_lookup(user):
    u = User.query.filter_by(name=user).first()
    if type(user) is int:
        u = User.query.filter_by(id=user).first()
    if u == None:return
    return u.id

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).one_or_none()

@jwt.token_in_blocklist_loader
def token_block(_jwt_header, jwt_data):
    if TokenBlocklist.query.filter_by(jti=jwt_data["jti"]).first():
        return True
    return False

if __name__ == '__main__':
    #db.drop_all()
    #db.create_all()

    #apple = User(name="apple")
    #apple.set_password("apple")
    #db.session.add(apple)
    #
    #mango = User(name="mango")
    #mango.set_password("mango")
    #db.session.add(mango)
    #
    #db.drop_all()
    #db.create_all()
    #db.session.commit()

    app.run(debug=True, host='0.0.0.0', port=5000)