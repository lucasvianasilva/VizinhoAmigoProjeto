# run.py

# 1. Aplica o patch do eventlet PRIMEIRO
import eventlet
eventlet.monkey_patch()

# 2. Importa a fábrica de app e a instância do socketio
from backend.app import create_app
from backend.extensions import socketio

# 3. Cria a instância do app
app = create_app()

# 4. Inicializa o SocketIO com o app (importante para o servidor de desenvolvimento)
socketio.init_app(app)

# 5. Executa o servidor de desenvolvimento através do SocketIO
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)