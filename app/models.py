from datetime import datetime, timedelta
from decimal import Decimal, ROUND_UP

from sqlalchemy.orm import relationship

from .database import db


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    discord_id = db.Column(db.String(255))
    vk_id = db.Column(db.String(255))
    telegram_id = db.Column(db.String(255))
    preferred_platform = db.Column(db.String(50))
    balance = db.Column(db.Numeric(10, 2), default=0)
    subscriptions = db.relationship('UserSubscription', back_populates='user')
    reminders = db.relationship('Reminder', back_populates='user')
    payments = db.relationship('Payment', back_populates='user')
    notification_time = db.Column(db.Time)  # Добавляем новое поле

class Subscription(db.Model):
    __tablename__ = 'subscriptions'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    description = db.Column(db.Text)
    monthly_amount = db.Column(db.Numeric(10, 2))
    is_variable = db.Column(db.Boolean)
    period = db.Column(db.String(10))  # Already present
    is_paused = db.Column(db.Boolean, default=False)
    user_subscriptions = relationship('UserSubscription', back_populates='subscription')

    @property
    def is_one_time(self):
        return self.period == 'one-time'

class UserSubscription(db.Model):
    __tablename__ = 'user_subscriptions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    subscription_id = db.Column(db.Integer, db.ForeignKey('subscriptions.id'))
    next_due_date = db.Column(db.Date)
    amount = db.Column(db.Numeric(10, 2))
    is_paused = db.Column(db.Boolean, default=False)
    coefficient = db.Column(db.Numeric(3, 2), default=1.0)
    is_manual = db.Column(db.Boolean, default=False)

    user = relationship('User', back_populates='subscriptions')
    subscription = relationship('Subscription', back_populates='user_subscriptions')

    def __init__(self, user_id, subscription_id, next_due_date=None, amount=None, is_paused=False, coefficient=1.0, is_manual=False):
        self.user_id = user_id
        self.subscription_id = subscription_id
        self.coefficient = Decimal(coefficient)
        self.is_manual = is_manual
        self.is_paused = is_paused
        self.next_due_date = next_due_date if next_due_date else self.set_next_due_date()
        self.amount = amount if amount else self.calculate_amount()

    def calculate_amount(self):
        subscription = Subscription.query.get(self.subscription_id)
        if subscription and not self.is_manual:
            total_users = UserSubscription.query.filter_by(subscription_id=self.subscription_id, is_paused=False).count()
            amount = (subscription.monthly_amount * self.coefficient) / total_users if total_users > 0 else subscription.monthly_amount
            self.amount = Decimal(amount).quantize(Decimal('1'), rounding=ROUND_UP)
        return self.amount

    def set_next_due_date(self):
        subscription = Subscription.query.get(self.subscription_id)
        if subscription.period == 'one-time':
            self.next_due_date = datetime.utcnow().date() + timedelta(days=30)  # Set the due date for the loan
        else:
            self.next_due_date = datetime.utcnow().date() + timedelta(days=30)
        return self.next_due_date

    def total_paid(self):
        transactions = Transaction.query.filter_by(user_id=self.user_id).all()
        return sum(transaction.amount for transaction in transactions)

# app/models.py
class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    amount = db.Column(db.Numeric(10, 2))
    status = db.Column(db.String(10))
    comment = db.Column(db.Text)  # Добавляем поле для комментария
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Добавляем поле для даты создания
    user = relationship('User', back_populates='payments')

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    amount = db.Column(db.Numeric(10, 2))
    transaction_date = db.Column(db.Date, default=datetime.utcnow)
    transaction_type = db.Column(db.String(10))
    # Removed subscription_id


class Reminder(db.Model):
    __tablename__ = 'reminders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    reminder_date = db.Column(db.Date)
    status = db.Column(db.String(10))
    user = relationship('User', back_populates='reminders')

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    message = db.Column(db.Text)
    notification_type = db.Column(db.String(50))
    status = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ReminderTemplate(db.Model):
    __tablename__ = 'reminder_templates'
    id = db.Column(db.Integer, primary_key=True)
    template_name = db.Column(db.String(255))
    template_text = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)