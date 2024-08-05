import logging
from logging.handlers import RotatingFileHandler
from celery import Celery
from config import Config

def setup_logger():
    logger = logging.getLogger('celery')
    logger.setLevel(logging.INFO)
    handler = RotatingFileHandler('celery.log', maxBytes=10000, backupCount=1)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    return logger

def make_celery(app_name=__name__):
    backend = Config.result_backend
    broker = Config.broker_url
    celery = Celery(app_name, backend=backend, broker=broker)
    celery.conf.update(
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='Europe/Moscow',
        enable_utc=True
    )
    celery.conf.update(worker_hijack_root_logger=False)
    setup_logger()
    return celery
