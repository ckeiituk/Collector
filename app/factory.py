# app/factory.py

from flask import Flask
from .database import db
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__, static_url_path='/static')
    app.config.from_object(config_class)
    db.init_app(app)

    with app.app_context():
        from .routes.user_routes import user_bp
        from .routes.subscription_routes import subscription_bp
        app.register_blueprint(user_bp)
        app.register_blueprint(subscription_bp)
        db.create_all()

    return app
