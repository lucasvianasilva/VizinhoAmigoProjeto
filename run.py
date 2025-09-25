# run.py
import backend
from backend.app import create_app

# Chama a fábrica e desempacota os dois objetos retornados
app, socketio = create_app()

# Este bloco é para execução local na sua máquina
if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)

# Para o Render, o Gunicorn irá importar a variável 'socketio' deste arquivo,
# que agora já está totalmente configurada e pronta para uso.