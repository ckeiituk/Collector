# app/__init__.py

from flask import Flask
from config import Config
from .database import db
from .routes.user_routes import user_bp
from .routes.subscription_routes import subscription_bp
from .routes.payment_routes import payment_bp
from .routes.reminder_routes import reminder_bp
from flask_wtf import CSRFProtect

csrf = CSRFProtect()

def create_app(config_class=Config):
    app = Flask(__name__, static_url_path='/static')
    app.config.from_object(config_class)

    csrf.init_app(app)  # Инициализация CSRF защиты

    db.init_app(app)

    with app.app_context():
        db.create_all()

    # Register blueprints
    app.register_blueprint(user_bp)
    app.register_blueprint(subscription_bp, url_prefix='/subscriptions')
    app.register_blueprint(payment_bp, url_prefix='/payments')
    app.register_blueprint(reminder_bp, url_prefix='/reminders')

    return app

