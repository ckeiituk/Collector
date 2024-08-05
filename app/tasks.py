# tasks.py
from datetime import datetime, timedelta
from decimal import Decimal
import logging

from sqlalchemy import extract

from .factory import create_app
from app.models import db, Payment, User, Reminder

app = create_app()
logger = logging.getLogger('celery')


def create_reminders_logic():
    with app.app_context():
        logger.info("Запуск логики создания напоминаний")
        now = datetime.utcnow() + timedelta(hours=3)  # Корректировка времени на московское
        today = now.date()
        users = User.query.all()

        logger.info(f"Найдено {len(users)} пользователей для проверки напоминаний.")

        for user in users:
            logger.info(f"Проверка пользователя {user.name} с временем уведомления {user.notification_time}.")
            if user.notification_time:
                user_notification_datetime = datetime.combine(today, user.notification_time)
                logger.info(
                    f"Время уведомления пользователя {user.name} сегодня: {user_notification_datetime}. Текущее время: {now}.")
                if user_notification_datetime <= now < user_notification_datetime + timedelta(minutes=5):
                    logger.info(f"Пользователь {user.name} находится в окне времени уведомления.")
                    unpaid_payments = Payment.query.filter_by(user_id=user.id, status='pending').all()
                    logger.info(f"У пользователя {user.name} {len(unpaid_payments)} неоплаченных платежей.")

                    for payment in unpaid_payments:
                        logger.info(f"Проверка, существует ли напоминание для пользователя {user.name}.")
                        existing_reminder = Reminder.query.filter_by(
                            user_id=user.id
                        ).filter(Reminder.reminder_date >= today,
                                 Reminder.reminder_date < today + timedelta(days=1)).first()

                        if existing_reminder:
                            logger.info(f"Напоминание уже существует для пользователя {user.name} сегодня.")
                        else:
                            reminder = Reminder(user_id=user.id, reminder_date=now, status='pending')
                            db.session.add(reminder)
                            logger.info(f"Создано напоминание для пользователя {user.name}.")

        db.session.commit()
        logger.info("Напоминания зафиксированы в базе данных")


def process_payments_logic():
    with app.app_context():
        logger.info("Запуск логики обработки платежей")
        users = User.query.all()
        logger.info(f"Найдено {len(users)} пользователей для обработки платежей.")

        for user in users:
            logger.info(f"Обработка платежей для пользователя {user.name}.")
            total_amount = Decimal(0)
            comment_parts = []

            for user_subscription in user.subscriptions:
                logger.info(f"Проверка подписки {user_subscription.subscription_id} для пользователя {user.name}.")
                if not user_subscription.is_paused:
                    logger.info(f"Подписка {user_subscription.subscription_id} активна.")

                    # Проверка одноразовой подписки
                    if user_subscription.subscription.period == 'one-time':
                        if user_subscription.next_due_date <= datetime.utcnow().date():
                            existing_payment = Payment.query.filter(
                                Payment.user_id == user.id,
                                Payment.comment.like(f'%{user_subscription.subscription.name}%')
                            ).first()
                            if existing_payment:
                                logger.info(
                                    f"Уже существует одноразовый платеж для пользователя {user.name} по подписке {user_subscription.subscription_id}.")
                                continue
                            logger.info(
                                f"Подписка {user_subscription.subscription_id} является разовой и должна быть оплачена.")
                            total_amount += user_subscription.amount
                            comment_parts.append(
                                f"{user_subscription.subscription.name} - {user_subscription.amount:.2f} RUB (Разовая)")
                    else:
                        # Проверка существования платежа для текущего периода подписки
                        current_month = datetime.utcnow().month
                        current_year = datetime.utcnow().year

                        if user_subscription.subscription.period == 'monthly':
                            existing_payment = Payment.query.filter_by(user_id=user.id).filter(
                                extract('month', Payment.created_at) == current_month,
                                extract('year', Payment.created_at) == current_year
                            ).first()
                        elif user_subscription.subscription.period == 'semiannual':
                            existing_payment = Payment.query.filter_by(user_id=user.id).filter(
                                (extract('month', Payment.created_at) >= (current_month - 6) % 12) &
                                (extract('year', Payment.created_at) == current_year)
                            ).first()
                        elif user_subscription.subscription.period == 'annual':
                            existing_payment = Payment.query.filter_by(user_id=user.id).filter(
                                extract('month', Payment.created_at) == current_month,
                                extract('year', Payment.created_at) == (current_year - 1)
                            ).first()

                        if existing_payment:
                            logger.info(f"Уже существует платеж для пользователя {user.name} за текущий период подписки.")
                            continue

                        logger.info(f"Подписка {user_subscription.subscription_id} является регулярной.")
                        total_amount += user_subscription.amount
                        comment_parts.append(
                            f"{user_subscription.subscription.name} - {user_subscription.amount:.2f} RUB")

            # Проверка, если общая сумма равна нулю
            if total_amount == 0:
                logger.info(f"Для пользователя {user.name} общая сумма платежа равна нулю. Платеж не будет создан.")
                continue
            else:
                logger.info(f"Для пользователя {user.name} общая сумма платежа видимо не равна нулю.")

            balance = user.balance
            final_amount = total_amount - balance
            comment = " | ".join(comment_parts)
            comment += f" | Общая сумма ({total_amount:.2f} RUB) - Баланс({balance:.2f} RUB) = Итого: {final_amount:.2f} RUB"

            status = 'paid' if balance >= total_amount else 'pending'
            if status == 'paid':
                logger.info(f"У пользователя {user.name} достаточно средств для оплаты общей суммы.")
                user.balance -= total_amount  # Вычесть общую сумму из баланса пользователя
                final_amount = 0

            new_payment = Payment(user_id=user.id, amount=final_amount, status=status, comment=comment)
            db.session.add(new_payment)
            logger.info(f"Обработан платеж для пользователя {user.name}, сумма: {final_amount}, статус: {status}")

        db.session.commit()
        logger.info("Платежи обработаны и зафиксированы в базе данных")

