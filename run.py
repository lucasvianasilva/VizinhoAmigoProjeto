# run.py
import backend
from backend.app import create_app
from backend.extensions import socketio

# Cria as instâncias do app e do socketio no escopo global do arquivo
app = create_app()

# O bloco de execução __main__ é usado apenas para desenvolvimento local
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)