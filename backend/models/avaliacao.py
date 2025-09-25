# backend/models/avaliacao.py

from backend.extensions import db
from datetime import datetime

class Avaliacao(db.Model):
    __tablename__ = 'avaliacoes'
    id = db.Column(db.Integer, primary_key=True)
    
    nota = db.Column(db.Integer, nullable=False) # Ex: 1 a 5 estrelas
    comentario = db.Column(db.Text, nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    # Chave estrangeira para a solicitação que foi avaliada
    solicitacao_id = db.Column(db.Integer, db.ForeignKey('solicitacoes.id'), nullable=False)
    
    # Quem fez a avaliação (o solicitante)
    avaliador_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    
    # Quem recebeu a avaliação (o vizinho que ajudou)
    avaliado_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    
    # Relacionamentos
    solicitacao = db.relationship('Solicitacao', backref=db.backref('avaliacao', uselist=False))
    avaliador = db.relationship('Usuario', foreign_keys=[avaliador_id])
    avaliado = db.relationship('Usuario', foreign_keys=[avaliado_id])

    def to_dict(self):
        return {
            'id': self.id,
            'nota': self.nota,
            'comentario': self.comentario,
            'solicitacao_id': self.solicitacao_id,
            'avaliador_id': self.avaliador_id,
            'avaliado_id': self.avaliado_id
        }