# config.py

import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
                              'postgresql://ckeiituk:a0be0d7a-f5f1-4eca-b34a-9a76446c16cb@localhost/payment_management'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    broker_url = 'redis://localhost:6379/0'
    result_backend = 'redis://localhost:6379/0'
    reminder_schedule_type = 'interval'  # Допустимые значения: 'time', 'interval' 'daily'
    SECRET_KEY = os.urandom(32)
    WTF_CSRF_ENABLED = True
    WTF_CSRF_SECRET_KEY = 'your_csrf_secret_key'