broker_url = "redis://localhost:6379/1"
result_backend = "redis://localhost:6379/2"
timezone = "Asia/kolkata"
broker_connection_retry_on_startup=True
from celery.schedules import crontab

beat_schedule = {
    'send-visit-reminder': {
        'task': 'task.send_visit_reminder',
        'schedule': crontab(hour=12, minute=26),  # Daily at 6:00 PM
    },
}
