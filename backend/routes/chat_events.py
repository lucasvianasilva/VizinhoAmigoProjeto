# backend/routes/chat_events.py
from flask import request
from flask_socketio import emit, join_room, leave_room
from backend.extensions import socketio, db
from backend.models.chat import Mensagem
from backend.models.user import Usuario

# Dicionário para rastrear usuários conectados: { user_id: socket_id }
connected_users = {}

@socketio.on('connect')
def handle_connect():
    print(f'Cliente conectado com socket_id: {request.sid}')

# Novo evento para o usuário se "registrar" com seu ID após conectar
@socketio.on('register_user')
def handle_register_user(data):
    user_id = data.get('user_id')
    if user_id:
        connected_users[user_id] = request.sid
        print(f"Usuário {user_id} registrado com socket_id {request.sid}")

@socketio.on('join_room')
def handle_join_room(data):
    room = data['room']
    join_room(room)
    print(f"Socket {request.sid} entrou na sala: {room}")

@socketio.on('send_message')
def handle_send_message(data):
    conteudo = data['conteudo']
    conversa_id = data['conversa_id']
    remetente_id = data['remetente_id']
    destinatario_id = data.get('destinatario_id') # ID de quem deve receber a notificação

    # 1. Salva a mensagem no banco de dados
    nova_mensagem = Mensagem(
        conteudo=conteudo,
        conversa_id=conversa_id,
        remetente_id=remetente_id
    )
    db.session.add(nova_mensagem)
    db.session.commit()

    # 2. Emite a mensagem para a sala de chat, para que a conversa seja atualizada em tempo real
    room = f'conversa_{conversa_id}'
    emit('receive_message', nova_mensagem.to_dict(), room=room)
    
    # 3. LÓGICA DE NOTIFICAÇÃO: Envia uma notificação apenas para o destinatário
    if destinatario_id and destinatario_id in connected_users:
        recipient_socket_id = connected_users[destinatario_id]
        remetente = Usuario.query.get(remetente_id)
        emit('new_notification', {
            'message': f'Você tem uma nova mensagem de {remetente.nome}',
            'conversa_id': conversa_id,
            'remetente_nome': remetente.nome
        }, room=recipient_socket_id)
        print(f"Notificação enviada para o usuário {destinatario_id}")

@socketio.on('disconnect')
def handle_disconnect():
    # Remove o usuário do nosso dicionário quando ele se desconectar
    user_id_to_remove = None
    for user_id, sid in connected_users.items():
        if sid == request.sid:
            user_id_to_remove = user_id
            break
    if user_id_to_remove:
        del connected_users[user_id_to_remove]
        print(f"Usuário {user_id_to_remove} desconectado e removido do rastreamento.")