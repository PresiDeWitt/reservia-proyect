#!/bin/bash
# ReserVia - Arranca backend y frontend con un solo comando

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
VENV="$ROOT/.venv"

# Development mode
export DEBUG=True

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cleanup() {
  echo ""
  echo -e "${YELLOW}Apagando servidores...${NC}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo -e "${GREEN}Servidores detenidos.${NC}"
  exit 0
}
trap cleanup INT TERM

echo ""
echo "========================================"
echo "  ReserVia - Modo Desarrollo"
echo "========================================"
echo ""

# --- Backend setup ---
cd "$ROOT/backend"

# Crear venv si no existe
if [ ! -f "$VENV/Scripts/python.exe" ] && [ ! -f "$VENV/bin/python" ]; then
  echo -e "${YELLOW}Creando entorno virtual Python en .venv...${NC}"
  python3 -m venv "$VENV" || python -m venv "$VENV"
fi

# Activar venv (Windows Git Bash vs Unix)
if [ -f "$VENV/Scripts/activate" ]; then
  source "$VENV/Scripts/activate"
elif [ -f "$VENV/bin/activate" ]; then
  source "$VENV/bin/activate"
else
  echo -e "${RED}No se encontró el script de activación del venv${NC}"
  exit 1
fi

echo -e "${YELLOW}Instalando dependencias Python...${NC}"
pip install -r requirements.txt -q

echo -e "${YELLOW}Ejecutando migraciones...${NC}"
python manage.py migrate --run-syncdb -v 0 2>/dev/null || python manage.py migrate -v 0

echo -e "${YELLOW}Ejecutando seed...${NC}"
python manage.py seed 2>/dev/null || true

# --- Frontend setup ---
cd "$ROOT/frontend"
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Instalando dependencias npm...${NC}"
  npm install
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Backend:  http://localhost:8000${NC}"
echo -e "${GREEN}  Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Ctrl+C para parar todo"
echo ""

# --- Arrancar servidores ---
cd "$ROOT/backend"
python manage.py runserver --noreload &
BACKEND_PID=$!

cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

wait $BACKEND_PID $FRONTEND_PID
