apt-get update && apt-get install -y libgl1-mesa-glx

# Start the FastAPI app
uvicorn main:app --host 0.0.0.0 --port $PORT
