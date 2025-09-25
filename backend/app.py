# backend/app.py

import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_migrate import Migrate
from backend.config import Config
from backend.extensions import db, jwt, socketio


def create_app():
    app = Flask(__name__)
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')

    print(f"--- INICIANDO APP COM ORIGEM DE FRONTEND: {frontend_url} ---")

    CORS(
        app,
        origins=[frontend_url], # Usa a variável dinâmica aqui
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"]
    )

    app.config.from_object(Config)

    # Inicializa as extensões
    db.init_app(app)
    jwt.init_app(app)
    socketio.init_app(app)
    Migrate(app, db, directory='backend/migrations')

    # --- IMPORTAÇÕES E REGISTRO DAS BLUEPRINTS DENTRO DA FUNÇÃO ---
    # Ao importar aqui, garantimos que o app já existe e o contexto está correto.
    from backend.routes.auth import auth_bp
    from backend.routes.group_routes import group_bp
    from backend.routes.offer_request_routes import offer_request_bp
    from backend.routes.chat_routes import chat_bp
    
    # Importação dos eventos do Socket.IO para garantir que sejam registrados
    from backend.routes import chat_events

    app.register_blueprint(auth_bp)
    app.register_blueprint(group_bp)
    app.register_blueprint(offer_request_bp)
    app.register_blueprint(chat_bp)

    # --- Rotas Globais/Utilitárias ---
    # (O resto do seu código que estava dentro da função create_app permanece aqui)
    @app.route('/')
    def home():
        return "Backend da Rede de Apoio Comunitário Funcionando!"

    @app.route('/create_db_tables')
    def create_db_tables():
        try:
            with app.app_context():
                db.create_all()
            return jsonify({"message" : "Tabelas criadas com sucesso!"}), 200
        except Exception as e:
            return jsonify({"message": f"Erro ao criar tabelas: {str(e)}"}), 500
    
    @app.route('/invite', methods=['GET'])
    def invite_from_link():
        pin = request.args.get('pin')
        if not pin:
            return jsonify({"message": "PIN de convite não fornecido."}), 400

        with app.app_context():
            # Precisamos importar o modelo aqui dentro ou no topo da função
            from backend.models.group import Grupo
            grupo = Grupo.query.filter_by(pin_convite=pin).first()
            if not grupo:
                return jsonify({"message": "PIN inválido ou grupo não encontrado."}), 404
            
            return jsonify({
                "message": "Link de convite válido. Redirecionando para entrada no grupo...",
                "grupo": grupo.to_dict(),
                "pin": pin
            }), 200

    return app