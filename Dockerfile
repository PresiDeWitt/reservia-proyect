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

# Copiar todo el código DESPUÉS
COPY . .

# Crear directorio para static files
RUN mkdir -p /app/backend/staticfiles

# Cambiar al directorio del backend
WORKDIR /app/backend

# Servir con Gunicorn
CMD python manage.py migrate && gunicorn -w 3 reservia.wsgi:application --bind 0.0.0.0:$PORT
