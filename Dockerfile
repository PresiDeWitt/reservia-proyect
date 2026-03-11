FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY backend/requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código
COPY . .

# Crear directorio para static files
RUN mkdir -p backend/staticfiles

# Ejecutar migraciones y recopilar static files
RUN cd backend && python manage.py collectstatic --noinput || true

# Servir con Gunicorn
CMD cd backend && python manage.py migrate && gunicorn -w 3 reservia.wsgi:application --bind 0.0.0.0:$PORT
