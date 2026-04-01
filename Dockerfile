# Usa una imagen oficial de Python como base
FROM python:3.11-slim

# Actualizar el sistema y instalar dependencias básicas
RUN apt-get update && apt-get install -y build-essential && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo
WORKDIR /app

# Copia e instala dependencias Python
COPY backend/requirements.txt ./requirements.txt
RUN pip install --upgrade pip --no-cache-dir && \
    pip install --no-cache-dir -r requirements.txt

# Copia el código de la aplicación
COPY backend/ /app/

# Copiar archivos estáticos públicos
COPY public/ /public/

# Expone el puerto en el que correrá FastAPI
EXPOSE 8000

# Permite que la plataforma (p.ej. Railway) asigne un puerto mediante la variable PORT
ENV PORT=8000

# Comando para iniciar el servidor. Usamos la forma shell para que se expanda ${PORT}
# Si la plataforma no define PORT, se usará 8000 por defecto.
CMD ["sh", "-c", "cd /app && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
