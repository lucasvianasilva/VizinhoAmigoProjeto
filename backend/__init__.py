# backend/__init__.py

# Aplica o monkey-patch do eventlet no momento em que o pacote 'backend' é importado
import eventlet
eventlet.monkey_patch()

# Deixa o resto do arquivo vazio