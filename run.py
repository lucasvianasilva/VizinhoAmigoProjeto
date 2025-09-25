# run.py
import os
import sys

# --- INÍCIO DA SOLUÇÃO FORÇADA ---
# Pega o caminho absoluto da pasta onde o run.py está (ex: C:\...\\PROJETO VIZINHO AMIGO)
project_root = os.path.dirname(os.path.abspath(__file__))
# Adiciona a pasta raiz do projeto ao início do caminho de busca do Python
sys.path.insert(0, project_root)
# --- FIM DA SOLUÇÃO FORÇADA ---

# Agora, com o caminho do projeto explicitamente definido,
# as importações devem funcionar sem erro.
from backend.app import create_app
from backend.extensions import socketio

app = create_app()

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)