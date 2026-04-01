# Usa una imagen oficial de Python como base
FROM python:3.11-slim

# Invalidar caché con timestamp único - FUERZA REBUILD
# Build timestamp: 2026-04-01T03:50:00Z
ARG BUILD_DATE=2026-04-01

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

# Copiar script de entrypoint
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# TRUCO: Crear un fake 'npm' que ejecuta uvicorn si existe npm en el PATH
# Esto previene que Railway ejecute npm start
RUN echo '#!/bin/sh\n# Intercepted npm command - redirecting to uvicorn\ncd /app\nexec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}' > /usr/local/bin/npm && chmod +x /usr/local/bin/npm

# Expone el puerto en el que correrá FastAPI
EXPOSE 8000

# Permite que la plataforma (p.ej. Railway) asigne un puerto mediante la variable PORT
ENV PORT=8000

# Usar ENTRYPOINT en lugar de CMD para que sea muy difícil de anular
ENTRYPOINT ["/entrypoint.sh"]
