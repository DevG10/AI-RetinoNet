#!/bin/bash
set -e  # Exit on error

# Install required system dependencies
apt-get update && apt-get install -y libgl1-mesa-glx

# Start Uvicorn server
uvicorn main:app --host 0.0.0.0 --port $PORT