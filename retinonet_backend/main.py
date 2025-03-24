from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import numpy as np
from models import load_model, predict
from report import generate_pdf_report, crop_to_retinal_area, is_printed_image
from email_service import send_email_report
from PIL import Image
import os
import sys

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

app = FastAPI()

origins = [
    "http://localhost:5173",  # Your React frontend URL (Vite default)
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specific frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)


# Load ML Model on startup
MODEL_PATH = os.getenv("MODEL_PATH")
model = load_model(MODEL_PATH)

@app.get("/")
def home():
    return {"message": "RetinoNet API is running"}

@app.post("/predict/")
async def analyze_image(file: UploadFile = File(...)):
    """Endpoint to analyze retinal image and return predictions."""
    try:
        # Read Image
        image = Image.open(file.file).convert("RGB")
        cropped_image = crop_to_retinal_area(image)
        image_array = np.array(cropped_image) / 255.0
        image_array = np.expand_dims(image_array, axis=0)

        # Handle live-captured images: Return cropped image instead of predictions
        if "live_captured_image" in file.filename:  # Detect live capture based on filename
            img_io = io.BytesIO()
            cropped_image.save(img_io, format="JPEG")
            img_io.seek(0)
            return StreamingResponse(img_io, media_type="image/jpeg")
        else:
            predictions = predict(model, image_array)

        # Format response
        class_names = ["Bilateral Retinoblastoma", "Left Eye Retinoblastoma", "Right Eye Retinoblastoma", "Healthy"]
        results = {class_names[i]: f"{predictions[0][i]:.2%}" for i in range(len(class_names))}

        return JSONResponse(content={"predictions": results})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate_report/")
async def generate_report(file: UploadFile = File(...), predictions: str = Form(...)):
    """Generate a PDF report for given predictions and image."""
    try:
        predictions = np.array(eval(predictions))  # Convert string to NumPy array
        image_path = f"temp_{file.filename}"
        
        # Save temporary image
        with open(image_path, "wb") as img_file:
            img_file.write(file.file.read())
        # Generate PDF
        print("GENERATING PDF REPORT")
        pdf_buffer = generate_pdf_report(predictions, image_path)
        print("PDF REPORT GENERATED")
        # Cleanup
        os.remove(image_path)

        return StreamingResponse(io.BytesIO(pdf_buffer.getvalue()), media_type="application/pdf",
                                 headers={"Content-Disposition": "attachment; filename=RetinoNet_Report.pdf"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/send_report/")
async def send_report(email: str = Form(...), file: UploadFile = File(...), predictions: str = Form(...)):
    """Send an email with the diagnostic report."""
    try:
        predictions = np.array(eval(predictions))
        image_path = f"temp_{file.filename}"

        # Save temporary image
        with open(image_path, "wb") as img_file:
            img_file.write(file.file.read())

        # Generate PDF report
        pdf_buffer = generate_pdf_report(predictions, image_path)

        # Send Email
        success = send_email_report(email, pdf_buffer, image_path)

        # Cleanup
        os.remove(image_path)

        if success:
            return {"message": "Report sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
