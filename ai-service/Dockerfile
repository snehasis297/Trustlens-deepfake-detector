# Multi-stage / lightweight Python image for TrustLens AI Inference Microservice
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (curl for healthchecks, libgomp for ONNX runtime)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Generate and verify the ONNX model inside the image
RUN python export_model.py

# Expose microservice port
EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Start FastAPI server
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
