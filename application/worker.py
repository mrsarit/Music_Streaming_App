from celery import Celery, Task
from celery.schedules import crontab
from application.tasks import send_visit_reminder

def celery_init_app(app):
    class FlaskTask(Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object("celeryconfig")
    celery_app.conf.beat_schedule = {
    'send-visit-reminder': {
        'task': 'application.tasks.send_visit_reminder',
        'schedule': crontab(hour=12, minute=26),  # Daily at 6:00 PM
    },
}
    return celery_app