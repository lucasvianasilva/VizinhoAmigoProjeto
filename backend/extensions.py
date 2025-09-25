#backend/extensions.py

from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_socketio import SocketIO
import socketio

db = SQLAlchemy()
jwt = JWTManager()
socketio = SocketIO()