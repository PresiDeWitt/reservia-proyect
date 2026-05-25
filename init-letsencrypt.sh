#!/bin/bash
# Script de inicialización de Let's Encrypt — ejecutar UNA sola vez en el servidor.
# Uso: bash init-letsencrypt.sh

set -e

DOMAIN="reservia.website"
EMAIL="alexchaconortega@gmail.com"
CERT_PATH="./certbot/certs/live/$DOMAIN"

echo "==> Creando directorios de Certbot..."
mkdir -p ./certbot/certs ./certbot/www

echo "==> Iniciando nginx en modo HTTP para el challenge..."
docker compose up -d frontend

echo "==> Esperando a que nginx arranque..."
sleep 5

echo "==> Solicitando certificado para $DOMAIN..."
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

echo "==> Recargando nginx con HTTPS habilitado..."
docker compose exec frontend nginx -s reload

echo ""
echo "Certificado obtenido. La web debería estar accesible en https://$DOMAIN"
echo "La renovación automática ya está configurada vía el servicio certbot."
