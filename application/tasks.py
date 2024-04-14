from celery import shared_task
from datetime import datetime, timedelta
import pytz
from application.models import User
from smtplib import SMTP
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from .models import *
from flask_security import current_user

@shared_task(ignore_result=True)
def send_visit_reminder():
    users = User.query.all()
    for user in users:
        if not user_visited_today(user):
            send_email(user.email, 'Reminder: Visit the app', 'Please visit the app')

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
def send_email(recipient_email, subject, content):
    
    # sender_email = 'admin@email.com'
    # password = 'admin'

    message = MIMEMultipart()
    message['From'] = SENDER_EMAIL
    message['To'] = recipient_email
    message['Subject'] = subject
    body = content
    message.attach(MIMEText(body, 'plain'))
    client = SMTP(host=SMTP_HOST, port=SMTP_PORT)
    client.send_message(msg=message)
    client.quit()

@shared_task(ignore_result=True)
def generate_monthly_activity_report():
    creator_role = Role.query.filter_by(name="creator").first()
    creators = User.query.filter(User.roles.contains(creator_role)).all()
    for creator in creators:
        songs_created = Song.query.filter_by(creator_id=creator.id).count()
        albums_created = SongAlbum.query.filter_by(creator_id=creator.id).count()
        ratings_received = Rating.query.filter_by(song_id=Song.id).count()
        
        # Generate the HTML or PDF report
        report_content = f"Monthly Activity Report\nSongs Created: {songs_created}\nAlbums Created: {albums_created}\nRatings Received: {ratings_received}"
        
        # Send the report as an email
        send_email(creator.email, 'Monthly Activity Report', report_content)