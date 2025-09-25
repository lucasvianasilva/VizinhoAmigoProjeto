# backend/routes/group_routes.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from backend.extensions import db 
from backend.models.group import Grupo
from backend.models.user import Usuario
from backend.models.association import GrupoUsuario
from backend.services.utils import gerar_pin

group_bp = Blueprint('group', __name__, url_prefix='/group')

# Rota para criar um novo grupo (Sua versão já estava correta)
@group_bp.route('/create', methods=['POST'])
@jwt_required()
def create_group():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    nome_grupo = data.get('nome')

    if not nome_grupo:
        return jsonify({"message": "Nome do grupo é obrigatório."}), 400
    
    for _ in range(10):
        pin = gerar_pin()
        if not Grupo.query.filter_by(pin_convite=pin).first():
            break
    else:
        return jsonify({"message": "Erro ao gerar PIN único."}), 500
    
    try:
        novo_grupo = Grupo(nome=nome_grupo, pin_convite=pin, criador_id=user_id)
        db.session.add(novo_grupo)
        db.session.flush()

        membro = GrupoUsuario(grupo_id=novo_grupo.id, usuario_id=user_id)
        db.session.add(membro)
        db.session.commit()

        return jsonify({
            "message": "Grupo criado com sucesso!",
            "grupo": novo_grupo.to_dict(),
            "pin_convite": pin
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message":f"Erro ao criar grupo: {str(e)}"}), 500

# ROTA ATUALIZADA: Apenas o criador pode editar o grupo
@group_bp.route('/<int:group_id>', methods=['PUT'])
@jwt_required()
def editar_grupo(group_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    novo_nome = data.get('nome')
    
    if not novo_nome:
        return jsonify({"message": "Novo nome é obrigatório."}), 400
    
    grupo = Grupo.query.get_or_404(group_id)
    
    # Verifica se o usuário logado é o criador do grupo
    if grupo.criador_id != user_id:
        return jsonify({"message": "Apenas o criador pode editar o grupo."}), 403
    
    try:
        grupo.nome = novo_nome
        db.session.commit()
        return jsonify({"message": "Grupo atualizado com sucesso.", "grupo": grupo.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao atualizar grupo: {str(e)}"}), 500

# ROTA NOVA: Deletar um grupo
@group_bp.route('/<int:group_id>', methods=['DELETE'])
@jwt_required()
def delete_group(group_id):
    user_id = int(get_jwt_identity())
    grupo = Grupo.query.get_or_404(group_id)

    # Apenas o criador pode deletar o grupo
    if grupo.criador_id != user_id:
        return jsonify({"message": "Apenas o criador pode deletar o grupo."}), 403

    try:
        # No futuro, adicione aqui a lógica para deletar ofertas e solicitações do grupo
        GrupoUsuario.query.filter_by(grupo_id=group_id).delete()
        db.session.delete(grupo)
        db.session.commit()
        return jsonify({"message": "Grupo deletado com sucesso."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao deletar grupo: {str(e)}"}), 500

# ROTA NOVA: Sair de um grupo
@group_bp.route('/<int:group_id>/leave', methods=['POST'])
@jwt_required()
def leave_group(group_id):
    user_id = int(get_jwt_identity())
    grupo = Grupo.query.get_or_404(group_id)

    # O criador não pode sair do grupo, ele deve deletá-lo
    if grupo.criador_id == user_id:
        return jsonify({"message": "O criador não pode sair do grupo. Você pode deletá-lo."}), 400

    associacao = GrupoUsuario.query.filter_by(grupo_id=group_id, usuario_id=user_id).first()
    if not associacao:
        return jsonify({"message": "Você não é membro deste grupo."}), 404
        
    try:
        db.session.delete(associacao)
        db.session.commit()
        return jsonify({"message": "Você saiu do grupo com sucesso."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao sair do grupo: {str(e)}"}), 500

# --- Rotas existentes que permanecem iguais ---

@group_bp.route('/join', methods=['POST'])
@jwt_required()
def join_group():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    pin = data.get('pin')
    if not pin:
        return jsonify({"message": "PIN do grupo é obrigatório."}), 400
    
    grupo = Grupo.query.filter_by(pin_convite=pin).first()
    if not grupo:
        return jsonify({"message": "PIN inválido ou grupo não encontrado."}), 404
    
    ja_membro = GrupoUsuario.query.filter_by(grupo_id=grupo.id, usuario_id=user_id).first()
    if ja_membro:
        return jsonify({"message": "Você já está neste grupo."}), 409
    
    try:
        novo_membro = GrupoUsuario(grupo_id=grupo.id, usuario_id=user_id)
        db.session.add(novo_membro)
        db.session.commit()
        return jsonify({"message": "Você entrou no grupo com sucesso!", "grupo": grupo.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao entrar no grupo: {str(e)}"}), 500
    

@group_bp.route('/<int:group_id>/members', methods=['GET'])
@jwt_required()
def listar_membros_grupo(group_id):
    user_id = int(get_jwt_identity())
    grupo = Grupo.query.get_or_404(group_id)
    membro = GrupoUsuario.query.filter_by(grupo_id=grupo.id, usuario_id=user_id).first()
    if not membro:
        return jsonify({"message": "Você não tem permissão para visualizar membros deste grupo."}), 403
    
    membros = GrupoUsuario.query.filter_by(grupo_id=grupo.id).all()
    usuarios = [Usuario.query.get(m.usuario_id).to_dict() for m in membros]
    return jsonify({"grupo": grupo.to_dict(), "membros": usuarios}), 200


@group_bp.route('/<int:group_id>/invite-link', methods=['GET'])
@jwt_required()
def gerar_link_convite(group_id):
    user_id = int(get_jwt_identity())
    grupo = Grupo.query.get_or_404(group_id)
    if not grupo:
        return jsonify({"message": "Grupo não encontrado."}), 404
    
    membro = GrupoUsuario.query.filter_by(grupo_id=group_id, usuario_id=user_id).first()
    if not membro:
        return jsonify({"message": "Você não tem permissão para gerar convites deste grupo."}), 403

    link = f"http://localhost:5173/groups/join?pin={grupo.pin_convite}" # URL do frontend
    return jsonify({"message": "Link de convite gerado com sucesso!", "convite": link}), 200

@group_bp.route('/my-groups', methods=['GET'])
@jwt_required()
def get_my_groups():
    try:
        user_id = int(get_jwt_identity())
        user_groups_associations = GrupoUsuario.query.filter_by(usuario_id=user_id).all()
        groups_list = []
        for association in user_groups_associations:
            grupo = Grupo.query.get(association.grupo_id)
            if grupo:
                groups_list.append(grupo.to_dict())
        return jsonify({"grupos_do_usuario": groups_list}), 200
    except Exception as e:
        return jsonify({"message": "Erro interno do servidor ao carregar grupos."}), 500