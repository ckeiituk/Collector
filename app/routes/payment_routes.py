from datetime import datetime
from decimal import Decimal
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from collections import defaultdict

from app.models import db, Payment, User, Reminder

payment_bp = Blueprint('payment_bp', __name__)
csrf = CSRFProtect()

@payment_bp.route('/payments')
def payments():
    return render_template('partials/payments.html', payments_by_date=payments_by_date)

@payment_bp.route('/add_payment', methods=['POST'])
def add_payment():
    try:
        data = request.get_json()
        user_id = int(data.get('user_id'))
        status = data.get('status')

        user = User.query.get_or_404(user_id)
        subscriptions = user.subscriptions
        total_amount = Decimal(0)
        comment_parts = []

        for user_subscription in subscriptions:
            if not user_subscription.is_paused:
                total_amount += user_subscription.amount
                comment_parts.append(f"{user_subscription.subscription.name} - {user_subscription.amount:.2f} RUB")

        balance = Decimal(user.balance)
        final_amount = total_amount - balance
        comment = " | ".join(comment_parts)
        comment += f" | Общая сумма ({total_amount:.2f} RUB) - Баланс({balance:.2f} RUB) = Итого: {final_amount:.2f} RUB"

        if status == 'pending' and balance >= total_amount:
            status = 'paid'
            final_amount = Decimal(0)
            balance -= total_amount
            user.balance = balance

        new_payment = Payment(user_id=user.id, amount=final_amount, status=status, comment=comment)
        db.session.add(new_payment)
        db.session.commit()

        return jsonify({'message': 'Payment added successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500



@payment_bp.route('/delete_payment/<int:payment_id>', methods=['POST'])
def delete_payment(payment_id):
    payment = Payment.query.get_or_404(payment_id)
    db.session.delete(payment)
    db.session.commit()
    return jsonify({'message': 'Payment deleted successfully!'}), 200

@payment_bp.route('/update_payment_status/<int:payment_id>', methods=['POST'])
def update_payment_status(payment_id):
    payment = Payment.query.get_or_404(payment_id)
    new_status = 'paid' if payment.status == 'pending' else 'pending'
    payment.status = new_status

    reminder = Reminder.query.filter_by(user_id=payment.user_id, status='pending').first()
    if reminder:
        reminder.status = new_status

    db.session.commit()
    return jsonify({'message': 'Payment status updated successfully!'}), 200

@payment_bp.route('/create_reminder/<int:payment_id>', methods=['POST'])
def create_reminder(payment_id):
    payment = Payment.query.get_or_404(payment_id)
    reminder = Reminder(user_id=payment.user_id, reminder_date=datetime.utcnow(), status='pending')
    db.session.add(reminder)
    db.session.commit()
    return jsonify({'message': 'Reminder created successfully!'}), 200

@payment_bp.route('/get_payment_form/<int:payment_id>', methods=['GET'])
def get_payment_form(payment_id):
    payment = Payment.query.get_or_404(payment_id)
    users = User.query.all()
    return render_template('forms/edit_payment.html', payment=payment, users=users, csrf_token=generate_csrf())

@payment_bp.route('/edit_payment/<int:payment_id>', methods=['POST'])
def edit_payment(payment_id):
    payment = Payment.query.get_or_404(payment_id)
    data = request.get_json()

    try:
        payment.user_id = data.get('user_id', payment.user_id)
        payment.amount = Decimal(data.get('amount', payment.amount))
        payment.status = data.get('status', payment.status)
        payment.comment = data.get('comment', payment.comment)

        db.session.commit()

        return jsonify({'message': 'Payment updated successfully!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
