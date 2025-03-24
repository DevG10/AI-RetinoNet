import io
import os
import re
import smtplib
import logging
import numpy as np
import dns.resolver
import cv2
import mediapipe as mp
from datetime import datetime
from dotenv import load_dotenv
from PIL import Image
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Image as RLImage, HRFlowable, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Load class names for predictions
CLASS_NAMES = ["Bilateral Retinoblastoma", "Left Eye Retinoblastoma", "Right Eye Retinoblastoma", "Healthy"]


def generate_pdf_report(predictions, image_path):
    """Generate a visually enhanced PDF report with logo and professional styling."""
    print("INSIDE generate_pdf_report")
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    report_content = []
    
    # Custom Styles
    title_style = styles['Title']
    title_style.textColor = colors.HexColor('#1E40AF')
    title_style.fontSize = 24
    title_style.leading = 30

    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor= colors.HexColor('#4B5563'),
        alignment=1,
        spaceAfter=20
    )

    # Header with Logo
    try:
        logo_path = os.getenv("LOGO_PATH")
        if logo_path and os.path.exists(logo_path):
            logo = RLImage(logo_path, width=120, height=60)
        else:
            logging.error("Logo file not found!")
            logo = None
        header = Table(
            [[logo, Paragraph("<b>RetinoNet Diagnostics</b><br/>"
                            "Pimpri Chinchwad, MH 411044<br/>"
                            "contact@retinonet.com<br/>"
                            "retinonet.streamlit.app", styles['BodyText'])]],
            colWidths=[150, 400]
        )
        header.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (0,0), (0,0), 'CENTER'),
            ('LEFTPADDING', (1,0), (1,0), 20),
            ('BOTTOMPADDING', (0,0), (-1,-1), 15),
        ]))
        report_content.append(header)
        report_content.append(HRFlowable(width="100%", thickness=1, 
                                       color=colors.HexColor('#1E40AF')))
    except Exception as e:
        logging.error(f"Logo not found - using text header {e}")
        report_content.append(Paragraph("RetinoNet Diagnostics", title_style))
    
    # Title Section
    report_content.append(Spacer(1, 15))
    report_content.append(Paragraph("Diagnostic Report", title_style))
    report_content.append(Paragraph("AI-Powered Retinal Analysis Report", subtitle_style))
    
    # Patient Info Section (Sample - can be expanded)
    patient_info = [
        ["Date of Analysis:", datetime.now().strftime("%Y-%m-%d")],
        ["Analysis Type:", "Retinoblastoma Screening"]
    ]
    patient_table = Table(patient_info, colWidths=[120, 300])
    patient_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F3F4F6')),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#1F2937')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
    ]))
    report_content.append(patient_table)
    report_content.append(Spacer(1, 25))

    # Image Section
    report_content.append(Paragraph("<b>Analyzed Image</b>", styles['Heading2']))
    report_content.append(Spacer(1, 10))
    img = RLImage(image_path, width=300, height=300, kind='proportional')
    img.hAlign = 'CENTER'
    report_content.append(img)
    report_content.append(Spacer(1, 25))
    report_content.append(Spacer(1, 25))
    report_content.append(Spacer(1, 25))

    # Results Section
    report_content.append(Paragraph("<b>Diagnostic Findings</b>", styles['Heading2']))
    
    # Create confidence level color scale
    prediction_data = []
    for pred in predictions:
        sorted_indices = np.argsort(pred)[::-1]
        for idx in sorted_indices:
            confidence = pred[idx]
            class_name = CLASS_NAMES[idx]
            color = colors.HexColor('#10B981') if confidence > 0.65 else \
                    colors.HexColor('#F59E0B') if confidence > 0.3 else \
                    colors.HexColor('#EF4444')
            prediction_data.append([
                Paragraph(class_name, styles['Normal']),
                Paragraph(f"{confidence:.2%}", 
                         ParagraphStyle('Confidence', textColor=color))
            ])

    # Create results table
    results_table = Table(prediction_data, colWidths=[300, 100])
    results_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E40AF')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 12),
        ('BOTTOMPADDING', (0,0), (-1,0), 10),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
    ]))
    report_content.append(results_table)
    report_content.append(Spacer(1, 25))

    # Recommendation Section
    recommendation = get_recommendation(predictions)
    recommendation_style = ParagraphStyle(
        'Recommendation',
        parent=styles['BodyText'],
        backColor=colors.HexColor('#DBEAFE'),
        borderColor=colors.HexColor('#1E40AF'),
        borderWidth=1,
        borderPadding=(10, 5, 10, 5),
        leftIndent=10,
        fontSize=12,
        leading=18
    )
    report_content.append(Paragraph("<b>Clinical Recommendation</b>", styles['Heading2']))
    report_content.append(Spacer(1, 10))
    report_content.append(Paragraph(recommendation, recommendation_style))
    report_content.append(Spacer(1, 25))

    # Footer Function
    def add_footer(canvas, doc):
        canvas.saveState()
        footer_text = f"Page {doc.page} | Confidential Report - RetinoNet AI Diagnostics"
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.HexColor('#6B7280'))
        canvas.drawCentredString(letter[0]/2.0, 0.4*inch, footer_text)
        canvas.restoreState()

    # Build document with footer
    try:
        doc.build(report_content, onFirstPage=add_footer, onLaterPages=add_footer)
    except Exception as e:
        logging.error(f"Error building PDF: {e}")
    buffer.seek(0)
    return buffer



def get_recommendation(predictions):
    """Generate recommendations based on predictions."""
    try:
        recommendations = {
            "Bilateral Retinoblastoma": "Seek immediate consultation with a specialist.",
            "Left Eye Retinoblastoma": "Consult an ophthalmologist as soon as possible.",
            "Right Eye Retinoblastoma": "Immediate consultation with a specialist is recommended.",
            "Healthy": "Your scan appears normal, but regular checkups are advised."
        }
        
        # Convert percentage strings to float values
        float_predictions = [float(prob.strip('%')) / 100 for prob in predictions.values()]
        
        # Find the index of the highest probability
        top_prediction_idx = np.argmax(float_predictions)
        
        return recommendations.get(CLASS_NAMES[top_prediction_idx], "No recommendation available.")
    
    except Exception as e:
        logging.error(f"Error generating recommendation: {e}")
        return "Unable to determine recommendation due to an error."



def send_email_report(email, pdf_buffer):
    """Send an email with the attached diagnostic report."""
    try:
        sender_email = os.getenv('SENDER_EMAIL')
        sender_password = os.getenv('SENDER_PASSWORD')
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', 587))

        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = email
        msg['Subject'] = 'RetinoNet Diagnostic Report'

        # Email body
        body = """Dear Patient,
        
        Please find your attached RetinoNet diagnostic report.
        
        IMPORTANT: Always consult a medical professional for a definitive diagnosis.
        
        Regards,
        RetinoNet Team
        """
        msg.attach(MIMEText(body, 'plain'))

        # Attach PDF
        if pdf_buffer:
            pdf_part = MIMEApplication(pdf_buffer.getvalue(), _subtype='pdf')
            pdf_part.add_header('Content-Disposition', 'attachment', filename='RetinoNet_Report.pdf')
            msg.attach(pdf_part)
        else:
            logging.error("PDF buffer is empty. Email will not be sent.")
            return False

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
            return True
    except Exception as e:
        logging.error(f"Error sending email: {e}")
        return False


def crop_to_retinal_area(image, target_size=(224, 224)):
    """
    Detects the face using Mediapipe Face Detection and crops the image
    to focus on the eye region.
    
    Args:
        image: PIL Image object (or None)
        
    Returns:
        PIL Image cropped to focus on the eyes, or the original image if no face is detected.
    """
    if image is None:
        return None  # Return None if no image is provided

    # Convert PIL image to OpenCV format (RGB->BGR)
    image_cv = cv2.cvtColor(np.array(image.convert("RGB")), cv2.COLOR_RGB2BGR)
    ih, iw, _ = image_cv.shape

    # Initialize Mediapipe Face Detection
    mp_face_detection = mp.solutions.face_detection
    with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection:
        results = face_detection.process(cv2.cvtColor(image_cv, cv2.COLOR_BGR2RGB))
        
        if results.detections:
            detection = results.detections[0]
            bboxC = detection.location_data.relative_bounding_box
            
            # Compute absolute coordinates
            x = int(bboxC.xmin * iw)
            y = int(bboxC.ymin * ih)
            w = int(bboxC.width * iw)
            h = int(bboxC.height * ih)

            # Adjust cropping to focus on the eyes
            eye_region_y = y + int(0.2 * h)  # Move down to the eye region
            eye_region_h = int(0.3 * h)  # Take only 30% of the face height
            eye_region_x = x + int(0.15 * w)  # Crop some sides to focus on eyes
            eye_region_w = int(0.7 * w)  # Reduce width to focus on eyes
            
            # Ensure crop stays within image boundaries
            min_x = max(0, eye_region_x)
            min_y = max(0, eye_region_y)
            max_x = min(iw, eye_region_x + eye_region_w)
            max_y = min(ih, eye_region_y + eye_region_h)
            
            cropped_cv = image_cv[min_y:max_y, min_x:max_x]
            result_image = Image.fromarray(cv2.cvtColor(cropped_cv, cv2.COLOR_BGR2RGB))
            return result_image

    return image  # If no face detected, return original image


def is_printed_image(image):
    """Detect if an image is a printed retinal scan using edge detection."""
    try:
        gray = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        edge_ratio = np.sum(edges) / (edges.shape[0] * edges.shape[1])
        return edge_ratio > 0.08
    except Exception as e:
        logging.error(f"Error detecting printed image: {e}")
        return False


def is_valid_email(email):
    """Validate email format and domain using regex and MX lookup."""
    try:
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, email):
            return False, "Invalid email format."

        domain = email.split('@')[-1]
        try:
            dns.resolver.resolve(domain, 'MX')
            return True, "Valid email domain."
        except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
            return False, "Email domain does not have a mail server."

    except Exception as e:
        logging.error(f"Error validating email: {e}")
        return False, "An error occurred during validation."
