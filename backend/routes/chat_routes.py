# backend/routes/chat_routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db

from backend.models.chat import Conversa, Mensagem
from backend.models.offer_request import Solicitacao

chat_bp = Blueprint('chat', __name__, url_prefix='/api')

# Endpoint para obter ou criar uma conversa para uma solicitação
@chat_bp.route('/solicitacao/<int:solicitacao_id>/conversa', methods=['GET'])
@jwt_required()
def get_or_create_conversa(solicitacao_id):
    user_id = int(get_jwt_identity())
    
    solicitacao = Solicitacao.query.get_or_404(solicitacao_id)
    conversa = Conversa.query.filter_by(solicitacao_id=solicitacao_id).first()

    if not conversa:
        # Se não existe conversa, cria uma nova.
        # Aqui, a lógica de quem pode criar a conversa pode ser mais complexa
        # (ex: apenas o solicitante e quem se oferece para ajudar)
        # Por enquanto, vamos simplificar.
        conversa = Conversa(solicitacao_id=solicitacao_id)
        db.session.add(conversa)
        db.session.commit()
    
    return jsonify(conversa.to_dict()), 200

# Endpoint para buscar todas as mensagens de uma conversa
@chat_bp.route('/conversa/<int:conversa_id>/mensagens', methods=['GET'])
@jwt_required()
def get_mensagens(conversa_id):
    # A verificação de permissão (se o usuário pertence a esta conversa) deve ser adicionada aqui
    mensagens = Mensagem.query.filter_by(conversa_id=conversa_id).order_by(Mensagem.data_envio.asc()).all()
    return jsonify([msg.to_dict() for msg in mensagens]), 200