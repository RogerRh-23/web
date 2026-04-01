
FROM node:22-alpine

# Install Python and build essentials
RUN apk add --no-cache python3 py3-pip build-base

# Establece el directorio de trabajo
WORKDIR /app

# Copia e instala dependencias Python
COPY backend/requirements.txt ./requirements.txt
RUN pip3 install --upgrade pip --no-cache-dir && \
    pip3 install --no-cache-dir -r requirements.txt

# Copia el código de la aplicación
COPY backend/ /app/

# Copiar archivos estáticos públicos
COPY public/ /public/

# Expone el puerto en el que correrá FastAPI
EXPOSE 8000

# Permite que la plataforma (p.ej. Railway) asigne un puerto mediante la variable PORT
ENV PORT=8000

# Comando para iniciar el servidor
CMD ["python3", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
