#backend/models/association.py
from backend.extensions import db

# Tabela de associação para Usuários e Grupos (muitos-para-muitos)
class GrupoUsuario(db.Model):
    __tablename__ = 'grupos_usuarios'
    id = db.Column(db.Integer, primary_key=True)
    grupo_id = db.Column(db.Integer, db.ForeignKey('grupos.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)

    __table_args__ = (db.UniqueConstraint('grupo_id', 'usuario_id', name='_grupo_usuario_uc'),)

    grupo = db.relationship('Grupo', backref=db.backref('membros_associados'), lazy=True)
    usuario = db.relationship('Usuario', backref=db.backref('grupos_associados'), lazy=True)

    def to_dict(self):
        return{
            'id': self.id,
            'grupo_id': self.grupo_id,
            'usuario_id': self.usuario_id
        }