FROM node:22-alpine

# Install Python and build essentials
RUN apk add --no-cache python3 py3-pip build-base

WORKDIR /app

# Copy and install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip3 install --upgrade pip && \
    pip3 install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ ./
COPY public/ /public/

EXPOSE 8000
ENV PORT=8000

# Start Python uvicorn (npm start will call this script)
CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
