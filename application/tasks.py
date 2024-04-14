from celery import shared_task
from datetime import datetime, timedelta
import pytz
from application.models import User
from smtplib import SMTP
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

@shared_task(ignore_result=True)
def send_visit_reminder():
    users = User.query.all()
    for user in users:
        if not user_visited_today(user):
            send_email(user.email)

def user_visited_today(user):
    # Implement logic to check if the user has visited the app today
    # For example, check the last visit timestamp in the database
    last_visit = user.last_visit
    if last_visit:
        now = datetime.now(pytz.timezone('Asia/Kolkata'))
        last_visit_aware = pytz.timezone('Asia/Kolkata').localize(last_visit)
        return now - last_visit_aware <= timedelta(minutes=1)
    return False
SMTP_HOST = "localhost"
SMTP_PORT = 1025
SENDER_EMAIL = 'admin@email.com'
SENDER_PASSWORD = ''
def send_email(recipient_email):
    
    # sender_email = 'admin@email.com'
    # password = 'admin'

    message = MIMEMultipart()
    message['From'] = SENDER_EMAIL
    message['To'] = recipient_email
    message['Subject'] = 'Reminder: Visit the app'
    body = 'Please visit the app'
    message.attach(MIMEText(body, 'plain'))
    client = SMTP(host=SMTP_HOST, port=SMTP_PORT)
    client.send_message(msg=message)
    client.quit()

    # with smtplib.SMTP('localhost', 1025) as server:
    #     server.starttls()
    #     server.login(sender_email, password)
    #     text = message.as_string()
    #     server.sendmail(sender_email, recipient_email, text)