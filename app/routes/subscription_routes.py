from datetime import datetime
from decimal import Decimal, ROUND_UP

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask import current_app as app
from flask_wtf.csrf import CSRFProtect, generate_csrf

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


@subscription_bp.route('/subscriptions')
def subscription_list():
    one_time_subscriptions = Subscription.query.filter_by(period='one-time').all()
    regular_subscriptions = Subscription.query.filter(Subscription.period != 'one-time').all()
    # Передаем данные в 'index.html' и используем соответствующие частичные шаблоны для отображения данных
    return render_template('index.html', one_time_subscriptions=one_time_subscriptions,
                           regular_subscriptions=regular_subscriptions)


@subscription_bp.route('/add_subscription', methods=['POST'])
def add_subscription():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    monthly_amount = data.get('monthly_amount')
    is_variable = data.get('is_variable', False)
    period = data.get('period')

    # Преобразование значения в boolean
    is_variable = True if is_variable == 'on' else False

    if not all([name, description, monthly_amount, period]):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        new_subscription = Subscription(
            name=name,
            description=description,
            monthly_amount=Decimal(monthly_amount) if monthly_amount else Decimal(0),
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
        subscription.period = data.get('period', subscription.period)

        # Преобразование значения в boolean
        subscription.is_variable = True if data.get('is_variable') == 'on' else False

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


@subscription_bp.route('/attach_user_to_subscription', methods=['POST'])
def attach_user_to_subscription():
    data = request.get_json()
    user_id = data.get('user_id')
    subscription_id = data.get('subscription_id')
    next_due_date = data.get('next_due_date')
    amount = data.get('amount')
    is_paused = data.get('is_paused', False)

    # Преобразование 'is_paused' в булевое значение
    if isinstance(is_paused, str):
        is_paused = is_paused.lower() in ['true', '1', 'yes', 'on']

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


@subscription_bp.route('/get_unattached_users/<int:subscription_id>', methods=['GET'])
def get_unattached_users(subscription_id):
    attached_users = db.session.query(User.id).join(UserSubscription).filter(
        UserSubscription.subscription_id == subscription_id).all()
    attached_user_ids = [user_id for (user_id,) in attached_users]
    unattached_users = User.query.filter(User.id.notin_(attached_user_ids)).all()
    return jsonify({'users': [{'id': user.id, 'name': user.name} for user in unattached_users]})


@subscription_bp.route('/get_subscription_form/<int:subscription_id>', methods=['GET'])
def get_subscription_form(subscription_id):
    subscription = Subscription.query.get_or_404(subscription_id)
    return render_template('forms/edit_subscription.html', subscription=subscription, csrf_token=generate_csrf())


@subscription_bp.route('/get_attach_user_form/<int:subscription_id>', methods=['GET'])
def get_attach_user_form(subscription_id):
    subscription = Subscription.query.get_or_404(subscription_id)
    attached_users = db.session.query(User.id).join(UserSubscription).filter(
        UserSubscription.subscription_id == subscription_id).all()
    attached_user_ids = [user_id for (user_id,) in attached_users]
    unattached_users = User.query.filter(User.id.notin_(attached_user_ids)).all()
    return render_template('forms/attach_user_to_subscription.html', subscription=subscription, users=unattached_users,
                           csrf_token=generate_csrf())


@subscription_bp.route('/get_subscriptions_partial', methods=['GET'])
def get_subscriptions_partial():
    one_time_subscriptions = Subscription.query.filter_by(period='one-time').all()
    regular_subscriptions = Subscription.query.filter(Subscription.period != 'one-time').all()

    # Load relationships to avoid lazy loading in template
    for subscription in one_time_subscriptions:
        db.session.query(UserSubscription).filter_by(subscription_id=subscription.id).all()

    for subscription in regular_subscriptions:
        db.session.query(UserSubscription).filter_by(subscription_id=subscription.id).all()

    one_time_subscriptions_html = render_template('partials/one_time_subscriptions.html',
                                                  one_time_subscriptions=one_time_subscriptions)
    regular_subscriptions_html = render_template('partials/regular_subscriptions.html',
                                                 regular_subscriptions=regular_subscriptions)

    return jsonify({
        'one_time_subscriptions': one_time_subscriptions_html,
        'regular_subscriptions': regular_subscriptions_html
    })


@subscription_bp.route('/toggle_user_subscription_pause', methods=['POST'])
def toggle_user_subscription_pause():
    data = request.get_json()
    user_subscription_id = data.get('id')
    user_subscription = UserSubscription.query.get_or_404(user_subscription_id)
    user_subscription.is_paused = not user_subscription.is_paused

    db.session.commit()

    status = 'paused' if user_subscription.is_paused else 'resumed'
    return jsonify({'message': f'User subscription {status} successfully.'})

@subscription_bp.route('/get_user_subscription_form/<int:user_subscription_id>', methods=['GET'])
def get_user_subscription_form(user_subscription_id):
    user_subscription = UserSubscription.query.get_or_404(user_subscription_id)
    return render_template('forms/edit_user_subscription.html', user_subscription=user_subscription, csrf_token=generate_csrf())

@subscription_bp.route('/update_user_subscription/<int:user_subscription_id>', methods=['POST'])
def update_user_subscription(user_subscription_id):
    user_subscription = UserSubscription.query.get_or_404(user_subscription_id)
    data = request.get_json()

    try:
        user_subscription.amount = Decimal(data.get('amount', user_subscription.amount))
        user_subscription.is_manual = data.get('is_manual', user_subscription.is_manual) == 'on'
        user_subscription.next_due_date = datetime.strptime(data.get('next_due_date'), '%Y-%m-%d')

        db.session.commit()

        return jsonify({'message': 'User subscription updated successfully!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500