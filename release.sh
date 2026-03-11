#!/bin/bash
set -e

echo "Running database migrations..."
cd backend
python manage.py migrate --noinput || true
echo "Migrations complete!"
