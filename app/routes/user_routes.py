from flask import Blueprint, render_template, request, redirect, url_for, flash
from app.models import db, User, Payment, Reminder, Subscription
from decimal import Decimal
from collections import defaultdict
from datetime import datetime, timedelta

user_bp = Blueprint('user_bp', __name__)



from datetime import datetime, timedelta

@user_bp.route('/', methods=['GET'])
def index():
    users = User.query.order_by(User.id.asc()).all()
    one_time_subscriptions = Subscription.query.filter_by(period='one-time').order_by(Subscription.id.asc()).all()
    regular_subscriptions = Subscription.query.filter(Subscription.period != 'one-time').order_by(Subscription.id.asc()).all()
    payments = Payment.query.order_by(Payment.created_at.desc()).all()
    reminders = Reminder.query.order_by(Reminder.reminder_date.desc()).all()
    now = datetime.utcnow()
    payments_by_date = defaultdict(list)
    for payment in payments:
        payments_by_date[payment.created_at.date()].append(payment)
    current_date = now.strftime('%Y-%m-%d')

    return render_template('index.html', users=users, one_time_subscriptions=one_time_subscriptions,
                           regular_subscriptions=regular_subscriptions, payments_by_date=payments_by_date,
                           reminders=reminders, current_date=current_date, now=now, timedelta=timedelta)



@user_bp.route('/add_user', methods=['POST'])
def add_user():
    name = request.form.get('name')
    discord_id = request.form.get('discord_id')
    vk_id = request.form.get('vk_id')
    telegram_id = request.form.get('telegram_id')
    preferred_platform = request.form.get('preferred_platform')
    notification_time = request.form.get('notification_time')
    new_user = User(
        name=name,
        discord_id=discord_id,
        vk_id=vk_id,
        telegram_id=telegram_id,
        preferred_platform=preferred_platform,
        notification_time=notification_time
    )
    db.session.add(new_user)
    db.session.commit()
    flash('User added successfully!', 'success')
    return redirect(url_for('user_bp.index'))

@user_bp.route('/update_user/<int:user_id>', methods=['POST'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    user.name = request.form.get('name')
    user.discord_id = request.form.get('discord_id')
    user.vk_id = request.form.get('vk_id')
    user.telegram_id = request.form.get('telegram_id')
    user.preferred_platform = request.form.get('preferred_platform')
    user.notification_time = request.form.get('notification_time')
    user.balance = Decimal(request.form.get('balance'))
    db.session.commit()
    flash('User updated successfully!', 'success')
    return redirect(url_for('user_bp.index'))

@user_bp.route('/delete_user/<int:user_id>', methods=['POST'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    flash(f'User {user.name} deleted successfully!', 'success')
    return redirect(url_for('user_bp.index'))
