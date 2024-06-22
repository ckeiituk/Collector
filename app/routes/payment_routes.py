# app/routes/payment_routes.py

from flask import Blueprint, render_template, request, redirect, url_for, flash
from app.models import db, Payment, User, Reminder
from decimal import Decimal
from datetime import datetime

payment_bp = Blueprint('payment_bp', __name__)

@payment_bp.route('/payments')
def payments():
    payments = Payment.query.order_by(Payment.created_at.desc()).all()
    return render_template('payments_table.html', payments=payments)

@payment_bp.route('/add_payment', methods=['POST'])
def add_payment():
    user_id = int(request.form.get('user_id'))
    status = request.form.get('status')

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
    flash('Payment added successfully!', 'success')
    return redirect(url_for('payment_bp.payments'))

@payment_bp.route('/delete_payment/<int:payment_id>', methods=['POST'])
def delete_payment(payment_id):
    payment = Payment.query.get_or_404(payment_id)
    db.session.delete(payment)
    db.session.commit()
    flash('Payment deleted successfully!', 'success')
    return redirect(url_for('payment_bp.payments'))

@payment_bp.route('/update_payment_status/<int:payment_id>', methods=['POST'])
def update_payment_status(payment_id):
    payment = Payment.query.get_or_404(payment_id)
    new_status = 'paid' if payment.status == 'pending' else 'pending'
    payment.status = new_status

    reminder = Reminder.query.filter_by(user_id=payment.user_id, status='pending').first()
    if reminder:
        reminder.status = new_status

    db.session.commit()
    flash('Payment status updated successfully!', 'success')
    return redirect(url_for('payment_bp.payments'))

@payment_bp.route('/create_reminder/<int:payment_id>', methods=['POST'])
def create_reminder(payment_id):
    payment = Payment.query.get_or_404(payment_id)
    reminder = Reminder(user_id=payment.user_id, reminder_date=datetime.utcnow(), status='pending')
    db.session.add(reminder)
    db.session.commit()
    flash('Reminder created successfully!', 'success')
    return redirect(url_for('payment_bp.payments'))
