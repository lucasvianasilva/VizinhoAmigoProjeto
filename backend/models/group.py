# backend/models/group.py
from backend.extensions import db

class Grupo(db.Model):
    __tablename__ = 'grupos'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False, unique=True)
    pin_convite = db.Column(db.String(6), unique=True, nullable=False)
    
    # --- NOVA COLUNA ADICIONADA ---
    # Armazena o ID do usuário que criou o grupo
    criador_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    
    # Relacionamento para acessar facilmente os dados do criador
    criador = db.relationship('Usuario', backref='grupos_criados')

    # --- MÉTODO ATUALIZADO ---
    def to_dict(self):
        return{
            'id': self.id,
            'nome': self.nome,
            'pin_convite': self.pin_convite,
            'criador_id': self.criador_id # Inclui o ID do criador na resposta da API
        }