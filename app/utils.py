# utils.py
from datetime import datetime, timedelta
from decimal import Decimal
import logging
from .models import db, User, Reminder, Payment

logger = logging.getLogger('celery')

def create_reminders_logic():
    logger.info("Running create_reminders_logic")
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
                logger.info(f"Created reminder for user {user.id}")

    db.session.commit()
    logger.info("Reminders committed to the database")

def process_payments_logic():
    logger.info("Running process_payments_logic")
    users = User.query.all()

    for user in users:
        total_amount = Decimal(0)
        comment_parts = []
        create_payment = False

        for user_subscription in user.subscriptions:
            if not user_subscription.is_paused and user_subscription.next_due_date <= datetime.utcnow().date():
                total_amount += user_subscription.amount
                comment_parts.append(f"{user_subscription.subscription.name} - {user_subscription.amount:.2f} RUB")
                create_payment = True

                if user_subscription.subscription.period == 'monthly':
                    user_subscription.next_due_date += timedelta(days=30)
                elif user_subscription.subscription.period == 'semiannual':
                    user_subscription.next_due_date += timedelta(days=182)
                elif user_subscription.subscription.period == 'annual':
                    user_subscription.next_due_date += timedelta(days=365)
                elif user_subscription.subscription.period == 'one-time':
                    user_subscription.next_due_date = None

        if create_payment:
            balance = Decimal(user.balance)
            final_amount = total_amount - balance
            comment = "\n".join(comment_parts)
            comment += f"\nОбщая сумма ({total_amount:.2f} RUB) - Баланс({balance:.2f} RUB) = Итого: {final_amount:.2f} RUB"
            status = 'paid' if balance >= total_amount else 'pending'

            if status == 'paid':
                final_amount = Decimal(0)
                user.balance -= total_amount

            new_payment = Payment(user_id=user.id, amount=final_amount, status=status, comment=comment)
            db.session.add(new_payment)
            logger.info(f"Processed payment for user {user.id}, amount: {final_amount}")

    db.session.commit()
    logger.info("Payments processed and committed to the database")
