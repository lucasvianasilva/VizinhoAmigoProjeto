# backend/routes/auth.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from backend.extensions import db
from backend.models.user import Usuario

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# --- Rotas de Autentificação e Autorização ---
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() # Pega os dados JSON enviados na requisição
    
    # Extrai os dados esperados
    nome = data.get('nome')
    email = data.get('email')
    senha_texto_puro = data.get('senha') #senha antes do hash

    # Validação básica de entrada
    if not nome or not email or not senha_texto_puro:
        return jsonify ({"message":"Nome, email e senha são campos obrigatórios."}), 400 # Bad Request
    
    existing_user = Usuario.query.filter_by(email=email).first()
    if existing_user:
        return jsonify ({"message":"Este email já está cadastrado."}), 409 # Conflito

    # Cria um novo objeto Usuario
    new_user = Usuario(nome=nome, email=email)

    # Define e hashiza a senha usando o método que criado no modelo Usuario
    new_user.set_password(senha_texto_puro)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message":"Usuário registrado com sucesso!"}), 201 # Created
    
    except Exception as e:
        print(f"Erro ao registrar usuário> {e}")

        db.session.rollback() #Em caso de erro desfaz a operação
        return jsonify({"message":f"Erro ao registrar usuário: {str(e)}"}), 500 #Internal Server Error
        
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    senha = data.get('senha')

    if not email or not senha:
        return jsonify({"message": "Email e senha são obrigatórios."}), 400 #Bad Request
    
    usuario = Usuario.query.filter_by(email=email).first()

    # Verifica se o usuário existe e se a senha está correta
    if usuario and usuario.check_password(senha):
        # Se as credenciais estiverem corretas, cria um token de acesso
        access_token = create_access_token(identity=str(usuario.id))
        return jsonify({
                "message": "Login realizado com sucesso!",
                "access_token": access_token,
                "usuario": usuario.to_dict()
            }), 200 #OK
    else:
        return jsonify({"message": "Email ou senha inválidos."}), 401 #Não autorizado
        

# --- Rota de Teste Protegida com JWT ---
@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    # Acessa a identidade do usuário atual do token JWT
    current_user_id = get_jwt_identity()

    user = Usuario.query.get(current_user_id)
    if user:
        return jsonify({
            "message": f"Bem-vindo, {user.nome}! Esta rota é protegida.",
            "your_user_id": current_user_id
        }), 200
    else:
        return jsonify({"message": "Usuário do token não encontrado no banco de dados."}), 404
    
@auth_bp.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_details(user_id):
    user = Usuario.query.get_or_404(user_id)
    return jsonify(user.to_dict())

# Rota para ATUALIZAR o perfil do usuário logado
@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = Usuario.query.get_or_404(user_id)
    data = request.get_json()

    # Atualiza os campos se eles forem fornecidos no request
    user.nome = data.get('nome', user.nome)
    user.telefone = data.get('telefone', user.telefone)
    user.horarios_disponiveis = data.get('horarios_disponiveis', user.horarios_disponiveis)
    user.info_contato = data.get('info_contato', user.info_contato)

    try:
        db.session.commit()
        return jsonify({
            "message": "Perfil atualizado com sucesso!",
            "usuario": user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Erro ao atualizar perfil: {str(e)}"}), 500