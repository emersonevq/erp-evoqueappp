"""
Configurações da aplicação Flask
"""
import os
from datetime import timedelta
from dotenv import load_dotenv
from urllib.parse import quote_plus

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

class Config:
    """Configuração base da aplicação"""

    # Configurações básicas do Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-production'

    # Configurações do banco de dados MySQL Azure
    DB_HOST = os.environ.get('DB_HOST')
    DB_PORT = int(os.environ.get('DB_PORT', 3306))
    DB_USER = os.environ.get('DB_USER')
    DB_PASSWORD = os.environ.get('DB_PASSWORD')
    DB_NAME = os.environ.get('DB_NAME')

    # Configurar URI do banco se as variáveis estão presentes
    _db_host = os.environ.get('DB_HOST')
    _db_user = os.environ.get('DB_USER')
    _db_password = os.environ.get('DB_PASSWORD')
    _db_name = os.environ.get('DB_NAME')
    _db_port = int(os.environ.get('DB_PORT', 3306))

    if _db_host and _db_user and _db_password and _db_name:
        SQLALCHEMY_DATABASE_URI = (
            f'mysql+pymysql://{_db_user}:{quote_plus(_db_password)}@{_db_host}:{_db_port}/{_db_name}'
            '?charset=utf8mb4'
            '&ssl_disabled=false'
        )
    else:
        SQLALCHEMY_DATABASE_URI = None

    # Configurações do SQLAlchemy
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_timeout': 30,
        'max_overflow': 5,
        'pool_size': 10
    }
    
    # Configurações do Microsoft Graph API
    CLIENT_ID = os.environ.get('CLIENT_ID')
    CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
    TENANT_ID = os.environ.get('TENANT_ID')
    USER_ID = os.environ.get('USER_ID')
    
    # Configurações de email
    EMAIL_SISTEMA = os.environ.get('EMAIL_SISTEMA', 'sistema@evoquefitness.com')
    EMAIL_TI = os.environ.get('EMAIL_TI', 'ti@academiaevoque.com.br')
    SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
    SMTP_USE_TLS = os.environ.get('SMTP_USE_TLS', 'True').lower() == 'true'
    
    # Configurações de segurança
    MAX_LOGIN_ATTEMPTS = int(os.environ.get('MAX_LOGIN_ATTEMPTS', 5))
    SESSION_TIMEOUT = int(os.environ.get('SESSION_TIMEOUT', 30))
    PASSWORD_MIN_LENGTH = int(os.environ.get('PASSWORD_MIN_LENGTH', 6))
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=SESSION_TIMEOUT)
    
    # Configurações de logs
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE_PATH = os.environ.get('LOG_FILE_PATH', 'logs/app.log')
    
    # Configurações de backup
    BACKUP_PATH = os.environ.get('BACKUP_PATH', 'backups/')
    BACKUP_RETENTION_DAYS = int(os.environ.get('BACKUP_RETENTION_DAYS', 30))
    
    # Configurações de upload
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads/')
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 16777216))  # 16MB
    
    # Configurações de timezone
    TIMEZONE = os.environ.get('TIMEZONE', 'America/Sao_Paulo')
    
    # Configurações de cache
    CACHE_TYPE = os.environ.get('CACHE_TYPE', 'simple')
    CACHE_DEFAULT_TIMEOUT = int(os.environ.get('CACHE_DEFAULT_TIMEOUT', 300))
    
    # Configurações específicas do Flask
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None
    
    @staticmethod
    def validate_required_env_vars():
        """Valida se todas as variáveis de ambiente obrigatórias estão configuradas"""
        required_vars = [
            'CLIENT_ID', 'CLIENT_SECRET', 'TENANT_ID', 'USER_ID',
            'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'
        ]

        missing_vars = []
        for var in required_vars:
            if not os.environ.get(var):
                missing_vars.append(var)

        if missing_vars:
            raise ValueError(f"Variáveis de ambiente obrigatórias não configuradas: {', '.join(missing_vars)}")

        return True

class DevelopmentConfig(Config):
    """Configuração para desenvolvimento"""
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')

class DevelopmentMySQLConfig:
    """Configuração para desenvolvimento com MySQL Azure - URI direta"""
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-production'

    # Configurações do banco de dados MySQL Azure (somente via variáveis de ambiente)
    DB_HOST = os.environ.get('DB_HOST')
    DB_PORT = int(os.environ.get('DB_PORT', 3306))
    DB_USER = os.environ.get('DB_USER')
    DB_PASSWORD = os.environ.get('DB_PASSWORD')
    DB_NAME = os.environ.get('DB_NAME')

    # URI de conexão MySQL direta - construída com os valores de ambiente
    _db_host = os.environ.get('DB_HOST')
    _db_user = os.environ.get('DB_USER')
    _db_password = os.environ.get('DB_PASSWORD')
    _db_name = os.environ.get('DB_NAME')
    _db_port = int(os.environ.get('DB_PORT', 3306))

    if _db_host and _db_user and _db_password and _db_name:
        SQLALCHEMY_DATABASE_URI = (
            f'mysql+pymysql://{_db_user}:{quote_plus(_db_password)}@{_db_host}:{_db_port}/{_db_name}'
            '?charset=utf8mb4'
            '&ssl_disabled=false'
        )
    else:
        # Evitar URI inválida quando variáveis não estão definidas
        SQLALCHEMY_DATABASE_URI = 'sqlite:///dev_database.db'

    # Configurações do SQLAlchemy
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_timeout': 30,
        'max_overflow': 5,
        'pool_size': 10
    }

    # Configurações do Microsoft Graph API
    CLIENT_ID = os.environ.get('CLIENT_ID')
    CLIENT_SECRET = os.environ.get('CLIENT_SECRET')
    TENANT_ID = os.environ.get('TENANT_ID')
    USER_ID = os.environ.get('USER_ID')

    # Configurações de email
    EMAIL_SISTEMA = os.environ.get('EMAIL_SISTEMA', 'sistema@evoquefitness.com')
    EMAIL_TI = os.environ.get('EMAIL_TI', 'ti@academiaevoque.com.br')
    SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
    SMTP_USE_TLS = os.environ.get('SMTP_USE_TLS', 'True').lower() == 'true'

    # Configurações de segurança
    MAX_LOGIN_ATTEMPTS = int(os.environ.get('MAX_LOGIN_ATTEMPTS', 5))
    SESSION_TIMEOUT = int(os.environ.get('SESSION_TIMEOUT', 30))
    PASSWORD_MIN_LENGTH = int(os.environ.get('PASSWORD_MIN_LENGTH', 6))
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=SESSION_TIMEOUT)

    # Configurações de logs
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE_PATH = os.environ.get('LOG_FILE_PATH', 'logs/app.log')

    # Configurações de backup
    BACKUP_PATH = os.environ.get('BACKUP_PATH', 'backups/')
    BACKUP_RETENTION_DAYS = int(os.environ.get('BACKUP_RETENTION_DAYS', 30))

    # Configurações de upload
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', 'uploads/')
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 16777216))  # 16MB

    # Configurações de timezone
    TIMEZONE = os.environ.get('TIMEZONE', 'America/Sao_Paulo')

    # Configurações de cache
    CACHE_TYPE = os.environ.get('CACHE_TYPE', 'simple')
    CACHE_DEFAULT_TIMEOUT = int(os.environ.get('CACHE_DEFAULT_TIMEOUT', 300))

    # Configurações específicas do Flask
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None

class DevelopmentSQLiteConfig:
    """Configuração para desenvolvimento com SQLite (sem dependências MySQL)"""
    DEBUG = True
    FLASK_ENV = 'development'
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///dev_database.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {}

    # Configurações de email (desabilitadas para dev)
    EMAIL_SISTEMA = 'sistema@dev.local'
    EMAIL_TI = 'ti@dev.local'

    # Configurações de segurança
    MAX_LOGIN_ATTEMPTS = 5
    SESSION_TIMEOUT = 30
    PASSWORD_MIN_LENGTH = 6
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)

    # Configurações de logs
    LOG_LEVEL = 'INFO'
    LOG_FILE_PATH = 'logs/app.log'

    # Configurações de backup
    BACKUP_PATH = 'backups/'
    BACKUP_RETENTION_DAYS = 30

    # Configurações de upload
    UPLOAD_FOLDER = 'uploads/'
    MAX_CONTENT_LENGTH = 16777216  # 16MB

    # Configurações de timezone
    TIMEZONE = 'America/Sao_Paulo'

    # Configurações de cache
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 300

    # Configurações específicas do Flask
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None

class ProductionConfig(Config):
    """Configuração para produção"""
    DEBUG = False
    FLASK_ENV = 'production'

    # Configurações de segurança adicionais para produção
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

    def __init__(self):
        super().__init__()

    @classmethod
    def init_app(cls, app):
        """Inicialização específica para produção"""
        Config.validate_required_env_vars()

class TestingConfig(Config):
    """Configuração para testes"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    SQLALCHEMY_ENGINE_OPTIONS = {}  # Remove MySQL-specific options for SQLite

    def __init__(self):
        # Override database validation for testing
        pass

# Dicionário de configurações
config = {
    'development': DevelopmentMySQLConfig,  # Usar MySQL como padrão
    'dev-mysql': DevelopmentMySQLConfig,
    'dev-sqlite': DevelopmentSQLiteConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentMySQLConfig  # Use MySQL Azure como padrão
}

def get_config():
    """Retorna a configuração baseada nas variáveis de ambiente de banco"""
    use_mysql = all(os.environ.get(k) for k in ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'])
    if use_mysql:
        return config['dev-mysql']
    return config['dev-sqlite']
