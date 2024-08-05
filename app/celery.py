from datetime import timedelta
from celery.schedules import crontab
from config import Config
from .celery_factory import make_celery, setup_logger
from .tasks import create_reminders_logic, process_payments_logic

celery = make_celery()
logger = setup_logger()

def get_schedule():
    schedule_type = Config.reminder_schedule_type
    if schedule_type == 'time':
        return timedelta(minutes=5)
    elif schedule_type == 'interval':
        return timedelta(minutes=1)
    elif schedule_type == 'daily':
        return crontab(minute=0, hour=18)
    else:
        raise ValueError("Invalid reminder_schedule_type in config")

celery.conf.beat_schedule = {
    'create-reminders': {
        'task': 'app.celery.create_reminders',
        'schedule': get_schedule()
    },
    'process-payments-every-day': {
        'task': 'app.celery.process_payments',
        'schedule': crontab(minute=0, hour=4)  # Run the task every day at midnight
    },
}

celery.conf.timezone = 'Europe/Moscow'
celery.conf.broker_connection_retry_on_startup = True

@celery.task
def create_reminders():
    logger.info("Celery task create_reminders is running")
    create_reminders_logic()

@celery.task
def process_payments():
    logger.info("Celery task process_payments is running")
    process_payments_logic()
