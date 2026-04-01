
# Usa una imagen oficial de Python como base
FROM python:3.11-slim as builder

# Instalar Node.js para compilar Vite
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copiar package.json y compilar frontend
COPY package.json package-lock.json ./
RUN npm install

# Copiar configuración de Vite y archivos públicos
COPY vite.config.js ./
COPY public/ ./public/
RUN npm run build

# Copiar componentes, locales y JS que no están importados al dist
RUN cp -r ./public/components ./public/dist/ && \
    cp -r ./public/locales ./public/dist/ && \
    cp -r ./public/js ./public/dist/ && \
    cp -r ./public/styles ./public/dist/styles

# Etapa 2: Runtime con Python
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

# Copiar archivos compilados de Vite desde la etapa anterior
COPY --from=builder /build/public/dist /public/dist

# Expone el puerto en el que correrá FastAPI
EXPOSE 8000

# Permite que la plataforma (p.ej. Railway) asigne un puerto mediante la variable PORT
ENV PORT=8000

# Comando para iniciar el servidor. Usamos la forma shell para que se expanda ${PORT}
# Si la plataforma no define PORT, se usará 8000 por defecto.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
