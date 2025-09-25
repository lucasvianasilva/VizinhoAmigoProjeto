# wsgi.py

# 1. Aplica o patch do eventlet.
import eventlet
eventlet.monkey_patch()

# 2. Importa a fábrica de app e as extensões
from backend.app import create_app
from backend.extensions import socketio, db, jwt # Importa as extensões

# 3. Cria a instância do app Flask
app = create_app()

# 4. Inicializa o SocketIO com o app criado.
#    O objeto 'socketio' importado é agora reconfigurado e se torna o 'callable'
#    que o Gunicorn precisa.
socketio.init_app(app)

# O Gunicorn vai importar e executar a variável 'socketio' deste arquivo,
# que agora está garantidamente inicializada com a aplicação Flask.