FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOME=/home/user \
    TRANSFORMERS_CACHE=/tmp/huggingface \
    HF_HOME=/tmp/huggingface

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set up user for Hugging Face Spaces / Cloud compliance
RUN useradd -m -u 1000 user
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Ensure permissions
RUN chown -R user:user /app
USER user

EXPOSE 8000 7860 10000

# Run uvicorn on dynamic PORT supplied by cloud provider (Render, HF Spaces, Koyeb)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]