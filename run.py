# run.py

import eventlet
eventlet.monkey_patch()

import os
import sys

# Pega o caminho absoluto da pasta onde o run.py está
project_root = os.path.dirname(os.path.abspath(__file__))
# Adiciona a pasta raiz do projeto ao início do caminho de busca do Python
sys.path.insert(0, project_root)

# Agora, com o patch aplicado, as outras importações são seguras.
from backend.app import create_app
from backend.extensions import socketio

app = create_app()

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)