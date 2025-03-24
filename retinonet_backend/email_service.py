import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import os

def send_email_report(email, pdf_buffer, image_path):
    """Send an email with the attached PDF report."""
    sender_email = os.getenv('SENDER_EMAIL')
    sender_password = os.getenv('SENDER_PASSWORD')
    smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = email
    msg['Subject'] = 'RetinoNet Diagnostic Report'

    body = "Your diagnostic report is attached."
    msg.attach(MIMEText(body, 'plain'))

    pdf_part = MIMEApplication(pdf_buffer.getvalue(), _subtype='pdf')
    pdf_part.add_header('Content-Disposition', 'attachment', filename='RetinoNet_Report.pdf')
    msg.attach(pdf_part)

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
    
    return True
