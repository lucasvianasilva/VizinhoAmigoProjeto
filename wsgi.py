# wsgi.py

# 1. Aplica o patch do eventlet. Este é o primeiro passo absoluto.
import eventlet
eventlet.monkey_patch()

# 2. Importa as fábricas de app e a instância do socketio
from backend.app import create_app
from backend.extensions import socketio

# 3. Cria a instância do app, que também inicializa o socketio
app = create_app()

# Gunicorn usará a instância 'socketio' deste arquivo, que agora está
# totalmente configurada e ciente do patch do eventlet.