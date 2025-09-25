#backend/config.py
import os

class Config:
    # --- Configurações do Banco de Dados com SQLAlchemy ---
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'Alo102030!')
    DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
    DB_PORT = os.getenv('DB_PORT', '3306')
    DB_NAME = os.getenv('DB_NAME', 'condominio_amigo_db')

    SQLALCHEMY_DATABASE_URI = \
        f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False # Desabilita um warning chato do SQLAlchemy

    # --- Configurações do JWT ---
    JWT_SECRET_KEY = os.getenv(
        'JWT_SECRET_KEY', 
        'aed22e9d759ee492302db93314b563fecfc914f2bf11534edc825da9ba061c0a'
        )