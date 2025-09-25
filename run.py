# run.py
import eventlet
eventlet.monkey_patch()

import backend
from backend.app import create_app
from backend.extensions import socketio

app = create_app()

# Este bloco de execução __main__ é usado apenas para desenvolvimento local.
# O Gunicorn (no Render) não executará este bloco.
if __name__ == '__main__':
    # O socketio.run inicia um servidor de desenvolvimento especial que
    # suporta tanto requisições normais quanto WebSockets.
    socketio.run(app, host='0.0.0.0', port=5000)

# O Gunicorn no Render irá importar a variável 'app' diretamente deste arquivo.
# Como o socketio.init_app(app) já foi chamado dentro da função create_app,
# a variável 'app' já está "preparada" para lidar com as conexões do chat.