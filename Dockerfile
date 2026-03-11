# Build stage para el frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Copiar package.json y package-lock.json
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código del frontend
COPY frontend/ .

# Compilar el frontend
RUN npm run build

# Stage final con Python
FROM python:3.11-slim

WORKDIR /app

# Establecer variable de entorno
ENV PYTHONUNBUFFERED=1

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements PRIMERO
COPY backend/requirements.txt ./backend/

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copiar todo el código
COPY . .

# Copiar frontend compilado desde el stage anterior
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Crear directorio para static files
RUN mkdir -p /app/backend/staticfiles

# Cambiar al directorio del backend
WORKDIR /app/backend

# Servir con Gunicorn
CMD gunicorn -w 3 reservia.wsgi:application --bind 0.0.0.0:$PORT
