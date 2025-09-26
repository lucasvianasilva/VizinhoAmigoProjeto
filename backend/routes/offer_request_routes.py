# backend/routes/offer_request_routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from backend.extensions import db
from backend.models.user import Usuario
from backend.models.group import Grupo
from backend.models.association import GrupoUsuario
from backend.models.offer_request import Oferta, Solicitacao
from backend.models.avaliacao import Avaliacao

# Cria a Blueprint para as rotas de ofertas e solicitações
offer_request_bp = Blueprint('offer_request', __name__, url_prefix='/api')

# --- Rotas para OFERTAS ---

# [POST] Criar uma nova oferta
@offer_request_bp.route('/ofertas', methods=['POST'])
@jwt_required()
def create_oferta():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    titulo = data.get('titulo')
    descricao = data.get('descricao')
    categoria = data.get('categoria') 
    grupo_id = data.get('grupo_id')

    if not all([titulo, descricao, categoria, grupo_id]):
        return jsonify({"message": "Título, descrição, categoria e ID do grupo são obrigatórios."}), 400

    grupo = Grupo.query.get(grupo_id)
    if not grupo:
        return jsonify({"message": "Grupo não encontrado."}), 404

    is_member = GrupoUsuario.query.filter_by(grupo_id=grupo_id, usuario_id=current_user_id).first()
    if not is_member:
        return jsonify({"message": "Você não é membro deste grupo para criar ofertas."}), 403

    try:
        nova_oferta = Oferta(
            titulo=titulo,
            descricao=descricao,
            categoria=categoria, 
            ofertante_id=current_user_id,
            grupo_id=grupo_id
        )
        db.session.add(nova_oferta)
        db.session.commit()
        return jsonify({
            "message": "Oferta criada com sucesso!",
            "oferta": nova_oferta.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao criar oferta: {str(e)}"}), 500

# [GET] Listar ofertas (filtrar por grupo_id é obrigatório para um início mais seguro)
@offer_request_bp.route('/ofertas', methods=['GET'])
@jwt_required()
def get_ofertas():
    current_user_id = int(get_jwt_identity())
    grupo_id = request.args.get('grupo_id', type=int)

    if not grupo_id:
        return jsonify({"message": "Por favor, forneça um 'grupo_id' para listar as ofertas."}), 400

    # Verificar se o usuário é membro do grupo para ter permissão de listar as ofertas dele
    is_member = GrupoUsuario.query.filter_by(grupo_id=grupo_id, usuario_id=current_user_id).first()
    if not is_member:
        return jsonify({"message": "Você não tem permissão para ver as ofertas deste grupo."}), 403

    ofertas = Oferta.query.filter_by(grupo_id=grupo_id).all()
    return jsonify([oferta.to_dict() for oferta in ofertas]), 200

# [GET] Obter detalhes de uma oferta específica
@offer_request_bp.route('/ofertas/<int:oferta_id>', methods=['GET'])
@jwt_required()
def get_oferta_details(oferta_id):
    current_user_id = int(get_jwt_identity())
    oferta = Oferta.query.get(oferta_id)

    if not oferta:
        return jsonify({"message": "Oferta não encontrada."}), 404

    # Verificar se o usuário tem permissão para ver esta oferta (é membro do grupo)
    is_member = GrupoUsuario.query.filter_by(grupo_id=oferta.grupo_id, usuario_id=current_user_id).first()
    if not is_member:
        return jsonify({"message": "Você não tem permissão para ver esta oferta."}), 403

    return jsonify(oferta.to_dict()), 200

# Rota para listar ofertas de um grupo específico
@offer_request_bp.route('/grupos/<int:grupo_id>/ofertas', methods=['GET'])
@jwt_required()
def get_ofertas_do_grupo(grupo_id):
    user_id = int(get_jwt_identity())

    # 1. Verifica se o usuário é membro do grupo
    membro = GrupoUsuario.query.filter_by(grupo_id=grupo_id, usuario_id=user_id).first()
    if not membro:
        return jsonify({"message": "Você não tem permissão para ver este grupo."}), 403

    status_ativos = ['disponivel', 'em andamento']
    ofertas = Oferta.query.filter(
        Oferta.grupo_id == grupo_id,
        Oferta.status.in_(status_ativos)
    ).all()

    ofertas_list = [oferta.to_dict() for oferta in ofertas]
    return jsonify({"ofertas": ofertas_list}), 200

# Rota para listar solicitações de um grupo específico
@offer_request_bp.route('/grupos/<int:grupo_id>/solicitacoes', methods=['GET'])
@jwt_required()
def get_solicitacoes_do_grupo(grupo_id):
    user_id = int(get_jwt_identity())
    
    # 1. Verifica se o usuário é membro do grupo
    membro = GrupoUsuario.query.filter_by(grupo_id=grupo_id, usuario_id=user_id).first()
    if not membro:
        return jsonify({"message": "Você não tem permissão para ver este grupo."}), 403

    # 2. Busca todas as solicitações associadas a esse grupo
    solicitacoes = Solicitacao.query.filter_by(grupo_id=grupo_id, status='pendente').all()
    solicitacoes_list = [solicitacao.to_dict() for solicitacao in solicitacoes]

    return jsonify({"solicitacoes": solicitacoes_list}), 200

# [PUT] Atualizar uma oferta
@offer_request_bp.route('/ofertas/<int:oferta_id>', methods=['PUT'])
@jwt_required()
def update_oferta(oferta_id):
    current_user_id = int(get_jwt_identity())
    oferta = Oferta.query.get(oferta_id)

    if not oferta:
        return jsonify({"message": "Oferta não encontrada."}), 404

    if oferta.ofertante_id != current_user_id:
        return jsonify({"message": "Você não tem permissão para atualizar esta oferta."}), 403

    data = request.get_json()
    oferta.titulo = data.get('titulo', oferta.titulo)
    oferta.descricao = data.get('descricao', oferta.descricao)
    # CORREÇÃO AQUI
    oferta.categoria = data.get('categoria', oferta.categoria)
    oferta.status = data.get('status', oferta.status)

    try:
        db.session.commit()
        return jsonify({
            "message": "Oferta atualizada com sucesso!",
            "oferta": oferta.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao atualizar oferta: {str(e)}"}), 500

# [DELETE] Excluir uma oferta
@offer_request_bp.route('/ofertas/<int:oferta_id>', methods=['DELETE'])
@jwt_required()
def delete_oferta(oferta_id):
    current_user_id = int(get_jwt_identity())
    oferta = Oferta.query.get(oferta_id)

    if not oferta:
        return jsonify({"message": "Oferta não encontrada."}), 404

    # Apenas o criador da oferta pode excluí-la
    if oferta.ofertante_id != current_user_id:
        return jsonify({"message": "Você não tem permissão para excluir esta oferta."}), 403

    try:
        db.session.delete(oferta)
        db.session.commit()
        return jsonify({"message": "Oferta excluída com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao excluir oferta: {str(e)}"}), 500


# --- Rotas para SOLICITAÇÕES ---

# [POST] Criar uma nova solicitação
@offer_request_bp.route('/solicitacoes', methods=['POST'])
@jwt_required()
def create_solicitacao():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    titulo = data.get('titulo')
    descricao = data.get('descricao')
    categoria = data.get('categoria') 
    urgencia = data.get('urgencia', 'normal') 
    grupo_id = data.get('grupo_id')

    if not all([titulo, descricao, categoria, grupo_id]):

        return jsonify({"message": "Título, descrição, categoria e ID do grupo são obrigatórios."}), 400

    grupo = Grupo.query.get(grupo_id)
    if not grupo:
        return jsonify({"message": "Grupo não encontrado."}), 404

    is_member = GrupoUsuario.query.filter_by(grupo_id=grupo_id, usuario_id=current_user_id).first()
    if not is_member:
        return jsonify({"message": "Você não é membro deste grupo para criar solicitações."}), 403

    try:
        nova_solicitacao = Solicitacao(
            titulo=titulo,
            descricao=descricao,
            categoria=categoria, 
            urgencia=urgencia,     
            solicitante_id=current_user_id,
            grupo_id=grupo_id
        )
        db.session.add(nova_solicitacao)
        db.session.commit()
        return jsonify({
            "message": "Solicitação criada com sucesso!",
            "solicitacao": nova_solicitacao.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao criar solicitação: {str(e)}"}), 500

# [GET] Listar solicitações (filtrar por grupo_id é obrigatório para um início mais seguro)
@offer_request_bp.route('/solicitacoes', methods=['GET'])
@jwt_required()
def get_solicitacoes():
    current_user_id = int(get_jwt_identity())
    grupo_id = request.args.get('grupo_id', type=int)

    if not grupo_id:
        return jsonify({"message": "Por favor, forneça um 'grupo_id' para listar as solicitações."}), 400

    # Verificar se o usuário é membro do grupo para ter permissão de listar as solicitações dele
    is_member = GrupoUsuario.query.filter_by(grupo_id=grupo_id, usuario_id=current_user_id).first()
    if not is_member:
        return jsonify({"message": "Você não tem permissão para ver as solicitações deste grupo."}), 403

    solicitacoes = Solicitacao.query.filter_by(grupo_id=grupo_id).all()
    return jsonify([solicitacao.to_dict() for solicitacao in solicitacoes]), 200

# [GET] Obter detalhes de uma solicitação específica
@offer_request_bp.route('/solicitacoes/<int:solicitacao_id>', methods=['GET'])
@jwt_required()
def get_solicitacao_details(solicitacao_id):
    current_user_id = int(get_jwt_identity())
    solicitacao = Solicitacao.query.get(solicitacao_id)

    if not solicitacao:
        return jsonify({"message": "Solicitação não encontrada."}), 404

    # Verificar se o usuário tem permissão para ver esta solicitação (é membro do grupo)
    is_member = GrupoUsuario.query.filter_by(grupo_id=solicitacao.grupo_id, usuario_id=current_user_id).first()
    if not is_member:
        return jsonify({"message": "Você não tem permissão para ver esta solicitação."}), 403

    return jsonify(solicitacao.to_dict()), 200

# [PUT] Atualizar uma solicitação
@offer_request_bp.route('/solicitacoes/<int:solicitacao_id>', methods=['PUT'])
@jwt_required()
def update_solicitacao(solicitacao_id):
    current_user_id = int(get_jwt_identity())
    solicitacao = Solicitacao.query.get(solicitacao_id)

    if not solicitacao:
        return jsonify({"message": "Solicitação não encontrada."}), 404

    if solicitacao.solicitante_id != current_user_id:
        return jsonify({"message": "Você não tem permissão para atualizar esta solicitação."}), 403

    data = request.get_json()
    solicitacao.titulo = data.get('titulo', solicitacao.titulo)
    solicitacao.descricao = data.get('descricao', solicitacao.descricao)
    # CORREÇÃO AQUI
    solicitacao.categoria = data.get('categoria', solicitacao.categoria)
    solicitacao.urgencia = data.get('urgencia', solicitacao.urgencia)
    solicitacao.status = data.get('status', solicitacao.status)

    try:
        db.session.commit()
        return jsonify({
            "message": "Solicitação atualizada com sucesso!",
            "solicitacao": solicitacao.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao atualizar solicitação: {str(e)}"}), 500
    
# ROTA PARA CONCLUIR UMA SOLICITAÇÃO
@offer_request_bp.route('/solicitacoes/<int:solicitacao_id>/concluir', methods=['POST'])
@jwt_required()
def concluir_solicitacao(solicitacao_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    ajudante_id = data.get('ajudante_id') # ID do usuário que ajudou

    solicitacao = Solicitacao.query.get_or_404(solicitacao_id)

    # Apenas o criador da solicitação pode marcá-la como concluída
    if solicitacao.solicitante_id != user_id:
        return jsonify({"message": "Apenas o dono do post pode concluí-lo."}), 403

    solicitacao.status = 'atendida'
    solicitacao.atendido_por_id = ajudante_id
    db.session.commit()
    
    return jsonify({"message": "Solicitação concluída com sucesso!"}), 200

# ROTA PARA ENVIAR UMA AVALIAÇÃO
@offer_request_bp.route('/avaliacoes', methods=['POST'])
@jwt_required()
def criar_avaliacao():
    user_id = int(get_jwt_identity()) # Este é o avaliador
    data = request.get_json()

    solicitacao_id = data.get('solicitacao_id')
    avaliado_id = data.get('avaliado_id') # Quem está sendo avaliado
    nota = data.get('nota')
    comentario = data.get('comentario')

    # Validação básica
    if not all([solicitacao_id, avaliado_id, nota]):
        return jsonify({"message": "Campos obrigatórios faltando."}), 400

    nova_avaliacao = Avaliacao(
        solicitacao_id=solicitacao_id,
        avaliador_id=user_id,
        avaliado_id=avaliado_id,
        nota=nota,
        comentario=comentario
    )
    db.session.add(nova_avaliacao)
    db.session.commit()
    return jsonify({"message": "Avaliação enviada com sucesso!"}), 201

# ROTA PARA BUSCAR O HISTÓRICO DE UM GRUPO
@offer_request_bp.route('/grupos/<int:grupo_id>/historico', methods=['GET'])
@jwt_required()
def get_historico_grupo(grupo_id):
    # (Você pode adicionar a verificação se o usuário é membro do grupo aqui)
    
    solicitacoes_concluidas = Solicitacao.query.filter_by(
        grupo_id=grupo_id, status='atendida'
    ).order_by(Solicitacao.data_atualizacao.desc()).all()
    
    # No futuro, podemos adicionar ofertas concluídas também
    
    return jsonify({
        "historico": [s.to_dict() for s in solicitacoes_concluidas]
    }), 200

@offer_request_bp.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_details(user_id):
    user = Usuario.query.get_or_404(user_id)
    return jsonify(user.to_dict())

# [DELETE] Excluir uma solicitação
@offer_request_bp.route('/solicitacoes/<int:solicitacao_id>', methods=['DELETE'])
@jwt_required()
def delete_solicitacao(solicitacao_id):
    current_user_id = int(get_jwt_identity())
    solicitacao = Solicitacao.query.get(solicitacao_id)

    if not solicitacao:
        return jsonify({"message": "Solicitação não encontrada."}), 404

    if solicitacao.solicitante_id != current_user_id:
        return jsonify({"message": "Você não tem permissão para excluir esta solicitação."}), 403

    try:
        # Antes de deletar a solicitação, deletamos a conversa associada se existir
        if solicitacao.conversa:
            db.session.delete(solicitacao.conversa)
        
        db.session.delete(solicitacao)
        db.session.commit()
        return jsonify({"message": "Solicitação excluída com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao excluir solicitação: {str(e)}"}), 500
    
# ROTA PARA BUSCAR TODAS AS ATIVIDADES (OFERTAS E SOLICITAÇÕES) DO USUÁRIO LOGADO
@offer_request_bp.route('/my-activities', methods=['GET'])
@jwt_required()
def get_my_activities():
    user_id = int(get_jwt_identity())

    try:
        # Busca todas as solicitações criadas pelo usuário, ordenadas pela mais recente
        my_solicitacoes = Solicitacao.query.filter_by(solicitante_id=user_id).order_by(Solicitacao.data_criacao.desc()).all()
        
        # Busca todas as ofertas criadas pelo usuário, ordenadas pela mais recente
        my_ofertas = Oferta.query.filter_by(ofertante_id=user_id).order_by(Oferta.data_criacao.desc()).all()

        return jsonify({
            "solicitacoes": [s.to_dict() for s in my_solicitacoes],
            "ofertas": [o.to_dict() for o in my_ofertas]
        }), 200

    except Exception as e:
        return jsonify({"message": f"Erro ao buscar atividades: {str(e)}"}), 500