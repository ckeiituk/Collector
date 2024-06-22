from celery import Celery
from config import Config

def make_celery(app_name=__name__):
    backend = Config.result_backend
    broker = Config.broker_url
    return Celery(app_name, backend=backend, broker=broker)
