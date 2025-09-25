# backend/models/chat.py

from backend.extensions import db
from datetime import datetime

class Conversa(db.Model):
    __tablename__ = 'conversas'
    id = db.Column(db.Integer, primary_key=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    # A conversa está sempre ligada a uma solicitação específica
    solicitacao_id = db.Column(db.Integer, db.ForeignKey('solicitacoes.id'), nullable=False, unique=True)
    solicitacao = db.relationship('Solicitacao', backref=db.backref('conversa', uselist=False, lazy=True))

    # Relacionamento com as mensagens da conversa
    mensagens = db.relationship('Mensagem', backref='conversa', lazy='dynamic', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'solicitacao_id': self.solicitacao_id,
            'data_criacao': self.data_criacao.isoformat()
        }

class Mensagem(db.Model):
    __tablename__ = 'mensagens'
    id = db.Column(db.Integer, primary_key=True)
    conteudo = db.Column(db.Text, nullable=False)
    data_envio = db.Column(db.DateTime, default=datetime.utcnow)

    # Chave estrangeira para a conversa à qual a mensagem pertence
    conversa_id = db.Column(db.Integer, db.ForeignKey('conversas.id'), nullable=False)
    
    # Chave estrangeira para o usuário que enviou a mensagem (remetente)
    remetente_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    remetente = db.relationship('Usuario', backref='mensagens_enviadas')

    def to_dict(self):
        return {
            'id': self.id,
            'conteudo': self.conteudo,
            'data_envio': self.data_envio.isoformat(),
            'conversa_id': self.conversa_id,
            'remetente_id': self.remetente_id
        }