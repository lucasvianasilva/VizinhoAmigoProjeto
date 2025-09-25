# backend/models/offer_request.py

from backend.extensions import db
from datetime import datetime

class Oferta(db.Model):
    __tablename__ = 'ofertas'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(255), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    # GARANTIR QUE ESTE CAMPO SE CHAMA 'categoria'
    categoria = db.Column(db.String(50), nullable=False) 
    status = db.Column(db.String(50), default='disponivel')
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    ofertante_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    ofertante = db.relationship('Usuario', backref=db.backref('ofertas_criadas', lazy=True))

    grupo_id = db.Column(db.Integer, db.ForeignKey('grupos.id'), nullable=False)
    grupo = db.relationship('Grupo', backref=db.backref('ofertas', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descricao': self.descricao,
            'categoria': self.categoria, # Atualizado aqui
            'status': self.status,
            'data_criacao': self.data_criacao.isoformat(),
            'data_atualizacao': self.data_atualizacao.isoformat(),
            'ofertante_id': self.ofertante_id,
            'grupo_id': self.grupo_id
        }

class Solicitacao(db.Model):
    __tablename__ = 'solicitacoes'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(255), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    # GARANTIR QUE ESTE CAMPO SE CHAMA 'categoria'
    categoria = db.Column(db.String(50), nullable=False)
    # GARANTIR QUE ESTE CAMPO 'urgencia' EXISTE
    urgencia = db.Column(db.String(20), default='normal') 
    status = db.Column(db.String(50), default='pendente')
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    solicitante_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    solicitante = db.relationship('Usuario', foreign_keys=[solicitante_id], backref=db.backref('solicitacoes_criadas', lazy=True))

    grupo_id = db.Column(db.Integer, db.ForeignKey('grupos.id'), nullable=False)
    atendido_por_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)
    atendido_por = db.relationship('Usuario', foreign_keys=[atendido_por_id])
    grupo = db.relationship('Grupo', backref=db.backref('solicitacoes', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descricao': self.descricao,
            'categoria': self.categoria,
            'urgencia': self.urgencia,
            'status': self.status,
            'data_criacao': self.data_criacao.isoformat(),
            'data_atualizacao': self.data_atualizacao.isoformat(),
            'solicitante_id': self.solicitante_id,
            'atendido_por_id': self.atendido_por_id,
            'grupo_id': self.grupo_id,
            'solicitante': self.solicitante.to_dict() if self.solicitante else None
        }