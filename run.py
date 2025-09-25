# run.py

# Importar o pacote 'backend' é a primeira coisa que fazemos.
# Isso garante que o código no arquivo 'backend/__init__.py' (incluindo o eventlet.monkey_patch())
# seja executado antes de qualquer outra importação da nossa aplicação.
import backend

# Agora que o patch foi aplicado, podemos importar o restante com segurança.
from backend.app import create_app
from backend.extensions import socketio

app = create_app()

if __name__ == '__main__':
    # Usamos host='0.0.0.0' para garantir que o servidor seja acessível
    # a partir de fora do container no ambiente de produção.
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)