# app/factory.py

from flask import Flask
from flask_wtf import CSRFProtect

from config import Config
from .database import db

csrf = CSRFProtect()

def create_app(config_class=Config):
    app = Flask(__name__, static_url_path='/static')
    app.config.from_object(config_class)

    csrf.init_app(app)
    db.init_app(app)

    with app.app_context():
        from .routes.user_routes import user_bp
        from .routes.subscription_routes import subscription_bp
        from .routes.payment_routes import payment_bp
        from .routes.reminder_routes import reminder_bp

        app.register_blueprint(user_bp)
        app.register_blueprint(subscription_bp, url_prefix='/subscriptions')
        app.register_blueprint(payment_bp, url_prefix='/payments')
        app.register_blueprint(reminder_bp, url_prefix='/reminders')

        db.create_all()

    return app
