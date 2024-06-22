# app/routes.py

from flask import render_template, request, redirect, url_for
from .database import db
from .models import User, Subscription

def init_routes(app):
    @app.route('/')
    def index():
        users = User.query.all()
        subscriptions = Subscription.query.all()
        return render_template('index.html', users=users, subscriptions=subscriptions)

    @app.route('/add_user', methods=['POST'])
    def add_user():
        name = request.form['name']
        discord_id = request.form['discord_id']
        vk_id = request.form['vk_id']
        telegram_id = request.form['telegram_id']
        preferred_platform = request.form['preferred_platform']
        user = User(name=name, discord_id=discord_id, vk_id=vk_id, telegram_id=telegram_id, preferred_platform=preferred_platform)
        db.session.add(user)
        db.session.commit()
        return redirect(url_for('index'))

    @app.route('/add_subscription', methods=['POST'])
    def add_subscription():
        name = request.form['name']
        description = request.form['description']
        monthly_amount = request.form['monthly_amount']
        is_variable = request.form['is_variable'] == 'true'
        period = request.form['period']
        subscription = Subscription(name=name, description=description, monthly_amount=monthly_amount, is_variable=is_variable, period=period)
        db.session.add(subscription)
        db.session.commit()
        return redirect(url_for('index'))

    # Добавление маршрутов для других действий
    @app.route('/update_user/<int:user_id>', methods=['POST'])
    def update_user(user_id):
        user = User.query.get(user_id)
        if user:
            user.name = request.form['name']
            user.discord_id = request.form['discord_id']
            user.vk_id = request.form['vk_id']
            user.telegram_id = request.form['telegram_id']
            user.preferred_platform = request.form['preferred_platform']
            db.session.commit()
        return redirect(url_for('index'))

    @app.route('/delete_user/<int:user_id>', methods=['GET'])
    def delete_user(user_id):
        user = User.query.get(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
        return redirect(url_for('index'))


