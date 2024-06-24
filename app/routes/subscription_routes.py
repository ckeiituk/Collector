from datetime import datetime
from decimal import Decimal, ROUND_UP

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask import current_app as app
from flask_wtf.csrf import CSRFProtect

from app.models import db, Subscription, User, UserSubscription
import json

csrf = CSRFProtect(app)

subscription_bp = Blueprint('subscription_bp', __name__)

@subscription_bp.route('/toggle_subscription_pause', methods=['POST'])
def toggle_subscription_pause():
    data = request.get_json()
    subscription_id = data.get('id')
    subscription = Subscription.query.get_or_404(subscription_id)
    subscription.is_paused = not subscription.is_paused

    # Обновление всех связанных user_subscriptions только в случае займов
    if subscription.period == 'one-time':
        user_subscriptions = UserSubscription.query.filter_by(subscription_id=subscription_id).all()
        for user_subscription in user_subscriptions:
            user_subscription.is_paused = subscription.is_paused

    db.session.commit()

    status = 'paused' if subscription.is_paused else 'resumed'
    return jsonify({'message': f'Subscription {status} successfully.'})



def subscription_list():
    one_time_subscriptions = Subscription.query.filter_by(period='one-time').all()
    regular_subscriptions = Subscription.query.filter(Subscription.period != 'one-time').all()
    return render_template('partials/subscriptions.html', one_time_subscriptions=one_time_subscriptions, regular_subscriptions=regular_subscriptions)
@subscription_bp.route('/add_subscription', methods=['POST'])
def add_subscription():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    monthly_amount = data.get('monthly_amount')
    is_variable = data.get('is_variable', False)
    period = data.get('period')

    if not all([name, description, monthly_amount, period]):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        new_subscription = Subscription(
            name=name,
            description=description,
            monthly_amount=Decimal(monthly_amount) if monthly_amount else Decimal(0),  # Убедитесь, что monthly_amount не пусто
            is_variable=is_variable,
            period=period
        )
        db.session.add(new_subscription)
        db.session.commit()
        return jsonify({'message': 'Subscription added successfully!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
@subscription_bp.route('/edit_subscription/<int:id>', methods=['POST'])
def edit_subscription(id):
    subscription = Subscription.query.get_or_404(id)
    data = request.get_json()

    try:
        subscription.name = data.get('name', subscription.name)
        subscription.description = data.get('description', subscription.description)
        subscription.monthly_amount = Decimal(data.get('monthly_amount', subscription.monthly_amount))
        subscription.is_variable = data.get('is_variable', subscription.is_variable)
        subscription.period = data.get('period', subscription.period)

        db.session.commit()

        return jsonify({'message': 'Subscription updated successfully!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@subscription_bp.route('/delete_subscription/<int:id>', methods=['POST'])
def delete_subscription(id):
    try:
        subscription = Subscription.query.get_or_404(id)
        db.session.delete(subscription)
        db.session.commit()
        return jsonify({'message': 'Subscription deleted successfully!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@subscription_bp.route('/pause_subscription/<int:subscription_id>', methods=['POST'])
def pause_subscription(subscription_id):
    subscription = Subscription.query.get_or_404(subscription_id)
    user_subscriptions = UserSubscription.query.filter_by(subscription_id=subscription_id).all()

    for user_subscription in user_subscriptions:
        user_subscription.is_paused = True

    db.session.commit()
    flash(f'Subscription {subscription.name} paused successfully!', 'success')
    return redirect(url_for('user_bp.index'))

@subscription_bp.route('/unpause_subscription/<int:subscription_id>', methods=['POST'])
def unpause_subscription(subscription_id):
    subscription = Subscription.query.get_or_404(subscription_id)
    user_subscriptions = UserSubscription.query.filter_by(subscription_id=subscription_id).all()

    for user_subscription in user_subscriptions:
        user_subscription.is_paused = False

    db.session.commit()
    flash(f'Subscription {subscription.name} unpaused successfully!', 'success')
    return redirect(url_for('user_bp.index'))

@subscription_bp.route('/update_user_subscription/<int:user_subscription_id>', methods=['POST'])
def update_user_subscription(user_subscription_id):
    user_subscription = UserSubscription.query.get_or_404(user_subscription_id)
    new_amount = request.form.get('amount')
    is_manual = 'is_manual' in request.form
    user_subscription.amount = Decimal(new_amount).quantize(Decimal('1'), rounding=ROUND_UP)
    user_subscription.is_manual = is_manual
    db.session.commit()
    flash('User subscription updated successfully!', 'success')
    return redirect(url_for('user_bp.index'))


@subscription_bp.route('/attach_user_to_subscription', methods=['POST'])
def attach_user_to_subscription():
    data = request.get_json()
    user_id = data.get('user_id')
    subscription_id = data.get('subscription_id')
    next_due_date = data.get('next_due_date')
    amount = data.get('amount')
    is_paused = data.get('is_paused', False)

    if not all([user_id, subscription_id, next_due_date, amount]):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        new_user_subscription = UserSubscription(
            user_id=user_id,
            subscription_id=subscription_id,
            next_due_date=datetime.strptime(next_due_date, '%Y-%m-%d'),
            amount=Decimal(amount),
            is_paused=is_paused
        )
        db.session.add(new_user_subscription)
        db.session.commit()
        return jsonify({'message': 'User attached to subscription successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@subscription_bp.route('/detach_user_subscription/<int:user_subscription_id>/<int:subscription_id>', methods=['POST'])
def detach_user_from_subscription(user_subscription_id, subscription_id):
    user_subscription = UserSubscription.query.get_or_404(user_subscription_id)
    try:
        db.session.delete(user_subscription)
        db.session.commit()

        # Recalculate amounts for remaining users attached to this subscription
        user_subscriptions = UserSubscription.query.filter_by(subscription_id=subscription_id).all()
        for user_subscription in user_subscriptions:
            user_subscription.calculate_amount()
        db.session.commit()

        return jsonify({'message': 'User detached from subscription successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


