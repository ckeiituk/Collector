from datetime import datetime, timedelta
from decimal import Decimal

from .models import db, User, Reminder, Payment


def create_reminders_logic():
    print("Running create_reminders_logic")
    now = datetime.utcnow()
    users_with_pending_payments = db.session.query(User).join(Payment).filter(Payment.status == 'pending').all()

    for user in users_with_pending_payments:
        if user.notification_time:
            reminder_time = datetime.combine(now.date(), user.notification_time)
            if reminder_time < now:
                reminder_time += timedelta(days=1)

            existing_reminder = Reminder.query.filter_by(user_id=user.id, reminder_date=reminder_time).first()
            if not existing_reminder:
                new_reminder = Reminder(user_id=user.id, reminder_date=reminder_time, status='pending')
                db.session.add(new_reminder)

    db.session.commit()
    print("Reminders committed to the database")

def process_payments_logic():
    print("Running process_payments_logic")
    users = User.query.all()

    for user in users:
        total_amount = Decimal(0)
        comment_parts = []

        for user_subscription in user.subscriptions:
            if not user_subscription.is_paused:
                total_amount += user_subscription.amount
                comment_parts.append(f"{user_subscription.subscription.name} - {user_subscription.amount:.2f} RUB")

        balance = Decimal(user.balance)
        final_amount = total_amount - balance
        comment = " | ".join(comment_parts)
        comment += f" | Общая сумма ({total_amount:.2f} RUB) - Баланс({balance:.2f} RUB) = Итого: {final_amount:.2f} RUB"

        status = 'paid' if balance >= total_amount else 'pending'
        if status == 'paid':
            final_amount = Decimal(0)
            user.balance -= total_amount

        new_payment = Payment(user_id=user.id, amount=final_amount, status=status, comment=comment)
        db.session.add(new_payment)

    db.session.commit()
    print("Payments processed and committed to the database")
