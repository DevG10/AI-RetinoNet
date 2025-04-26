FROM python:3.10-slim

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Make sure script is executable (explicitly set permissions)
RUN chmod +x /app/start.sh

# Use shell form directly to avoid permission issues
CMD bash -c "uvicorn main:app --host 0.0.0.0 --port \${PORT:-8000}"