from celery.schedules import crontab
from datetime import timedelta

from celery.schedules import crontab

from config import Config
from .celery_factory import make_celery
from .factory import create_app
from .utils import create_reminders_logic, process_payments_logic

celery = make_celery()

def get_schedule():
    schedule_type = Config.reminder_schedule_type
    if schedule_type == 'time':
        return timedelta(minutes=5)
    elif schedule_type == 'interval':
        return timedelta(minutes=1)
    elif schedule_type == 'daily':
        return crontab(minute=9, hour=22)
    else:
        raise ValueError("Invalid reminder_schedule_type in config")

celery.conf.beat_schedule = {
    'create-reminders': {
        'task': 'app.celery.create_reminders',
        'schedule': get_schedule()
    },
    'process-payments-every-month': {
        'task': 'app.celery.process_payments',
        'schedule': crontab(minute=0, hour=0, day_of_month='1')  # Use fixed crontab for monthly processing
    },
}

celery.conf.timezone = 'Europe/Moscow'
celery.conf.broker_connection_retry_on_startup = True

@celery.task
def create_reminders():
    print("Celery task create_reminders is running")
    app = create_app()
    with app.app_context():
        create_reminders_logic()

@celery.task
def process_payments():
    print("Celery task process_payments is running")
    app = create_app()
    with app.app_context():
        process_payments_logic()
