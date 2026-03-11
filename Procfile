web: python backend/manage.py migrate && gunicorn -w 3 backend.reservia.wsgi:application --bind 0.0.0.0:$PORT
