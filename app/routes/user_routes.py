from collections import defaultdict
from decimal import Decimal
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from app.models import db, User, Payment, Reminder, Subscription

user_bp = Blueprint('user_bp', __name__)
csrf = CSRFProtect()

from datetime import datetime, timedelta

@user_bp.route('/', methods=['GET'])
def index():
    csrf_token = generate_csrf()
    users = User.query.order_by(User.id.asc()).all()
    one_time_subscriptions = Subscription.query.filter_by(period='one-time').order_by(Subscription.id.asc()).all()
    regular_subscriptions = Subscription.query.filter(Subscription.period != 'one-time').order_by(Subscription.id.asc()).all()
    payments = Payment.query.order_by(Payment.id.desc()).all()
    reminders = Reminder.query.order_by(Reminder.reminder_date.desc(), Reminder.id.desc()).all()
    now = datetime.utcnow()
    payments_by_date = defaultdict(list)
    for payment in payments:
        payments_by_date[payment.created_at.date()].append(payment)
    current_date = now.strftime('%Y-%m-%d')

    return render_template('index.html', users=users, one_time_subscriptions=one_time_subscriptions,
                           regular_subscriptions=regular_subscriptions, payments_by_date=payments_by_date,
                           reminders=reminders, current_date=current_date, now=now, timedelta=timedelta, csrf_token=csrf_token)

@user_bp.route('/add_user', methods=['POST'])
def add_user():
    if request.is_json:
        data = request.get_json()
        try:
            name = data.get('name')
            discord_id = data.get('discord_id')
            vk_id = data.get('vk_id')
            telegram_id = data.get('telegram_id')
            preferred_platform = data.get('preferred_platform')
            notification_time = data.get('notification_time')
            balance = Decimal(data.get('balance'))

            new_user = User(
                name=name,
                discord_id=discord_id,
                vk_id=vk_id,
                telegram_id=telegram_id,
                preferred_platform=preferred_platform,
                notification_time=notification_time,
                balance=balance
            )
            db.session.add(new_user)
            db.session.commit()
            return jsonify({'success': True, 'message': 'User added successfully!'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': str(e)})
    return jsonify({'message': 'Invalid content type. Expected JSON.'}), 415

@user_bp.route('/update_user/<int:user_id>', methods=['POST'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    if request.is_json:
        data = request.get_json()
        try:
            user.name = data.get('name', user.name)
            user.discord_id = data.get('discord_id', user.discord_id)
            user.vk_id = data.get('vk_id', user.vk_id)
            user.telegram_id = data.get('telegram_id', user.telegram_id)
            user.preferred_platform = data.get('preferred_platform', user.preferred_platform)
            user.notification_time = data.get('notification_time', user.notification_time)
            user.balance = Decimal(data.get('balance', user.balance))

            db.session.commit()

            return jsonify({'message': 'User updated successfully!'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    return jsonify({'message': 'Invalid content type. Expected JSON.'}), 415

@user_bp.route('/delete_user/<int:user_id>', methods=['POST'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': f'User {user.name} deleted successfully!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@user_bp.route('/get_user_form/<int:user_id>', methods=['GET'])
def get_user_form(user_id):
    user = User.query.get_or_404(user_id)
    return render_template('forms/edit_user.html', user=user, csrf_token=generate_csrf())

@user_bp.route('/edit_user/<int:user_id>', methods=['POST'])
def edit_user(user_id):
    user = User.query.get_or_404(user_id)
    if request.is_json:
        data = request.get_json()
        try:
            user.name = data.get('name', user.name)
            user.discord_id = data.get('discord_id', user.discord_id)
            user.vk_id = data.get('vk_id', user.vk_id)
            user.telegram_id = data.get('telegram_id', user.telegram_id)
            user.preferred_platform = data.get('preferred_platform', user.preferred_platform)
            user.notification_time = data.get('notification_time', user.notification_time)
            user.balance = Decimal(data.get('balance', user.balance))

            db.session.commit()

            return jsonify({'message': 'User updated successfully!'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    return jsonify({'message': 'Invalid content type. Expected JSON.'}), 415

@user_bp.route('/get_users_partial', methods=['GET'])
def get_users_partial():
    users = User.query.order_by(User.id.asc()).all()
    users_html = render_template('partials/users.html', users=users)
    return jsonify({'users_html': users_html})


@user_bp.route('/user_subscriptions/<int:user_id>', methods=['GET'])
def user_subscriptions(user_id):
    print(f"Fetching subscriptions for user {user_id}")  # Отладка
    user = User.query.get_or_404(user_id)
    user_subscriptions = user.subscriptions
    subscriptions_data = []
    for user_subscription in user_subscriptions:
        if not (user_subscription.subscription.is_paused and user_subscription.subscription.period == 'one-time'):
            subscriptions_data.append({
                'id': user_subscription.id,
                'subscription_id': user_subscription.subscription.id,
                'name': user_subscription.subscription.name,
                'description': user_subscription.subscription.description,
                'amount': str(user_subscription.amount),
                'is_manual': user_subscription.is_manual,
                'is_paused': user_subscription.is_paused,
                'csrf_token': generate_csrf()  # Generate CSRF token for each form
            })
    print(f"Subscriptions data for user {user_id}: {subscriptions_data}")  # Отладка
    return jsonify(subscriptions_data)



