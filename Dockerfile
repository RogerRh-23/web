FROM node:22-alpine as builder
RUN echo "This layer ensures fresh build" && date

FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends build-essential && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt ./requirements.txt
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY backend/ ./
COPY public/ /public/

EXPOSE 8000
ENV PORT=8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
