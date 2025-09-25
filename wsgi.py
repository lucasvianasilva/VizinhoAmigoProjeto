# wsgi.py

# 1. Aplica o patch do eventlet PRIMEIRO
import eventlet
eventlet.monkey_patch()

# 2. Importa a fábrica de app e a instância do socketio
from backend.app import create_app
from backend.extensions import socketio

# 3. Cria a instância do app
app = create_app()

# 4. Inicializa o SocketIO com o app
socketio.init_app(app)

# O Gunicorn irá importar e usar a variável 'app', mas o Socket.IO
# irá interceptar e gerenciar a comunicação.
# Para compatibilidade máxima, vamos expor o próprio app,
# pois o socketio já foi "anexado" a ele.