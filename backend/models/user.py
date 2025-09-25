#backend/models/user.py
from backend.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

# --- Definição dos Modelos de Banco de Dados (SQLAlchemy) ---
class Usuario(db.Model):
    __tablename__='usuarios'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha = db.Column(db.String(255), nullable=False)

    telefone = db.Column(db.String(20), nullable=True)
    horarios_disponiveis = db.Column(db.String(255), nullable=True)
    info_contato = db.Column(db.Text, nullable=True)

    # Método para hashizar a senha
    def set_password(self, password):
        self.senha = generate_password_hash(password)

    # Método para verificar a senha
    def check_password(self, password):
        return check_password_hash(self.senha, password)
    
    def to_dict(self):
        return{
            'id' : self.id,
            'nome' : self.nome,
            'email' : self.email,
            'telefone': self.telefone,
            'horarios_disponiveis': self.horarios_disponiveis,
            'info_contato': self.info_contato
        }