FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del backend
COPY . .

# Exponer el puerto
EXPOSE 8000

# Ejecutar migraciones y arrancar con gunicorn
CMD python manage.py migrate --noinput && gunicorn -w 3 reservia.wsgi:application --bind 0.0.0.0:8000
