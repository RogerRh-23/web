
# Usa una imagen oficial de Python como base
FROM python:3.11-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia e instala dependencias en una sola capa para mejor cacheo
COPY backend/requirements.txt ./requirements.txt
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copia el resto del código de la aplicación
COPY backend /app
COPY public /app/public

# Elimina archivos innecesarios y limpia caché
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Expone el puerto en el que correrá FastAPI
EXPOSE 8000

# Permite que la plataforma (p.ej. Railway) asigne un puerto mediante la variable PORT
ENV PORT=8000

# Comando para iniciar el servidor. Usamos la forma shell para que se expanda ${PORT}
# Si la plataforma no define PORT, se usará 8000 por defecto.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
