# app/tasks.py
from datetime import datetime
from decimal import Decimal

from app import create_app
from app.models import db, Payment, User, Reminder

app = create_app()

@app.celery.task
def create_reminders():
    with app.app_context():
        users = User.query.all()
        for user in users:
            unpaid_payments = Payment.query.filter_by(user_id=user.id, status='pending').all()
            for payment in unpaid_payments:
                reminder = Reminder(user_id=user.id, reminder_date=datetime.utcnow(), status='pending')
                db.session.add(reminder)
        db.session.commit()

@app.celery.task
def process_payments():
    print("Celery task process_payments is running")
    app = create_app()
    with app.app_context():
        users = User.query.all()
        for user in users:
            total_amount = Decimal(0)
            comment_parts = []

            for user_subscription in user.subscriptions:
                if not user_subscription.is_paused:
                    if user_subscription.subscription.period == 'one-time' and user_subscription.next_due_date <= datetime.utcnow().date():
                        total_amount += user_subscription.amount
                        comment_parts.append(f"{user_subscription.subscription.name} - {user_subscription.amount:.2f} RUB (One-time)")
                    elif user_subscription.subscription.period != 'one-time':
                        total_amount += user_subscription.amount
                        comment_parts.append(f"{user_subscription.subscription.name} - {user_subscription.amount:.2f} RUB")

            balance = user.balance
            final_amount = total_amount - balance
            comment = " | ".join(comment_parts)
            comment += f" | Общая сумма ({total_amount:.2f} RUB) - Баланс({balance:.2f} RUB) = Итого: {final_amount:.2f} RUB"

            status = 'paid' if balance >= total_amount else 'pending'
            if status == 'paid':
                final_amount = 0

            new_payment = Payment(user_id=user.id, amount=final_amount, status=status, comment=comment)
            db.session.add(new_payment)
        db.session.commit()
        print("Payments processed and committed to the database")