#!/bin/bash
# ReserVia - Script para arrancar la previsualización local (Bash)

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_FILE="$ROOT/docker-compose.preview.yml"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

show_help() {
  echo "Uso: $0 [opciones]"
  echo ""
  echo "Opciones:"
  echo "  -s, --stop    Detener y limpiar los contenedores de la previsualización."
  echo "  -l, --logs    Ver y seguir los logs en tiempo real."
  echo "  -h, --help    Mostrar esta ayuda."
}

if [ "$1" == "-s" ] || [ "$1" == "--stop" ]; then
  echo ""
  echo -e "${YELLOW}========================================${NC}"
  echo -e "${YELLOW}  Deteniendo Previsualización Local...${NC}"
  echo -e "${YELLOW}========================================${NC}"
  echo ""
  docker compose -f "$COMPOSE_FILE" down
  echo -e "${GREEN}Previsualización detenida.${NC}"
  exit 0
fi

if [ "$1" == "-l" ] || [ "$1" == "--logs" ]; then
  docker compose -f "$COMPOSE_FILE" logs -f
  exit 0
fi

if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
  show_help
  exit 0
fi

echo ""
echo "=================================================="
echo "  ReserVia - Previsualización Local de Producción"
echo "=================================================="
echo ""

# Verificar si Docker está corriendo
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}ERROR: Docker no está en ejecución. Por favor arranca Docker Desktop antes de continuar.${NC}"
  exit 1
fi

echo -e "${YELLOW}Construyendo e iniciando contenedores en modo previsualización (puerto 8080)...${NC}"
docker compose -f "$COMPOSE_FILE" up --build -d

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}  ¡PREVISUALIZACIÓN COMPLETAMENTE INICIADA!      ${NC}"
echo -e "${GREEN}  Accede en: http://localhost:8080${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "Para ver los logs del contenedor, ejecuta:"
echo -e "  ${CYAN}./run-preview.sh --logs${NC}"
echo ""
echo -e "Para detener la previsualización y limpiar los contenedores, ejecuta:"
echo -e "  ${CYAN}./run-preview.sh --stop${NC}"
echo ""
