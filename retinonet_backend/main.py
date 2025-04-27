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
import logging
from contextlib import asynccontextmanager

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

# Global variables
MODEL_PATH = "volume/appdata/resnet_model.weights.h5"
model = None
model_loaded = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Correct lifespan implementation for FastAPI
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load model
    global model, model_loaded
    logger.info("🚀 Starting up... Waiting for model to load.")
    try:
        if os.path.exists(MODEL_PATH):
            model = load_model(MODEL_PATH)
            model_loaded = True
            logger.info("✅ Model loaded successfully!")
        else:
            logger.error(f"❌ Model file not found at {MODEL_PATH}")
    except Exception as e:
        logger.error(f"❌ Error loading model: {e}")
    
    yield  # This is where the app runs
    
    # Shutdown: Clean up resources if needed
    logger.info("Shutting down...")

# Create FastAPI app with the lifespan
app = FastAPI(lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ai-retinonet-production.up.railway.app",
    "https://retinonet-frontend-9dajyumbo-dev-govindanis-projects.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "RetinoNet API is running"}

@app.get("/status")
async def status():
    """Check if model is loaded."""
    global model_loaded
    logger.info(f"Status check: Model loaded = {model_loaded}")
    return {"status": model_loaded}

@app.post("/predict/")
async def analyze_image(file: UploadFile = File(...)):
    """Endpoint to analyze retinal image and return predictions."""
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded yet. Please wait.")
    
    try:
        # Read Image
        image = Image.open(file.file).convert("RGB")
        cropped_image = crop_to_retinal_area(image)
        image_array = np.array(cropped_image) / 255.0
        image_array = np.expand_dims(image_array, axis=0)

        if "live_captured_image" in file.filename:
            img_io = io.BytesIO()
            cropped_image.save(img_io, format="JPEG")
            img_io.seek(0)
            return StreamingResponse(img_io, media_type="image/jpeg")
        else:
            predictions = predict(model, image_array)

        class_names = ["Bilateral Retinoblastoma", "Left Eye Retinoblastoma", "Right Eye Retinoblastoma", "Healthy"]
        results = {class_names[i]: f"{predictions[0][i]:.2%}" for i in range(len(class_names))}
        print(results)
        return JSONResponse(content={"predictions": results})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate_report/")
async def generate_report(file: UploadFile = File(...), predictions: str = Form(...)):
    """Generate a PDF report for given predictions and image."""
    try:
        import json
        import numpy as np

        parsed_predictions = json.loads(predictions)  

        if isinstance(parsed_predictions, list):
            CLASS_NAMES = ["Bilateral Retinoblastoma", "Left Eye Retinoblastoma", "Right Eye Retinoblastoma", "Healthy"]
            if len(parsed_predictions) != len(CLASS_NAMES):
                raise ValueError("Number of predictions does not match expected class count.")
            predictions_dict = {CLASS_NAMES[i]: parsed_predictions[i] for i in range(len(CLASS_NAMES))}
        
        elif isinstance(parsed_predictions, dict):
            predictions_dict = parsed_predictions  
        
        else:
            raise ValueError("Predictions should be a list or dictionary.")

        image_path = f"temp_{file.filename}"

        with open(image_path, "wb") as img_file:
            img_file.write(file.file.read())

        pdf_buffer = generate_pdf_report(predictions_dict, image_path)

        os.remove(image_path)

        return StreamingResponse(
            io.BytesIO(pdf_buffer.getvalue()),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=RetinoNet_Report.pdf"}
        )

    except Exception as e:
        logging.error(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/send_report/")
async def send_report(email: str = Form(...), file: UploadFile = File(...), predictions: str = Form(...)):
    """Send an email with the diagnostic report."""
    try:
        predictions = np.array(eval(predictions))
        image_path = f"temp_{file.filename}"

        with open(image_path, "wb") as img_file:
            img_file.write(file.file.read())

        pdf_buffer = generate_pdf_report(predictions, image_path)

        success = send_email_report(email, pdf_buffer, image_path)

        os.remove(image_path)

        if success:
            return {"message": "Report sent successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send email")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
