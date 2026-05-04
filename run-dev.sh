#!/bin/bash
# ReserVia - Arranca backend y frontend con un solo comando

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "========================================"
echo "  ReserVia - Modo Desarrollo"
echo "========================================"
echo ""

# Setup backend si es necesario
cd "$ROOT/backend"
if [ ! -d "venv" ]; then
  echo -e "${YELLOW}Creando entorno virtual Python...${NC}"
  python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt -q
python manage.py migrate -v 0
python manage.py seed 2>/dev/null || true

# Setup frontend si es necesario
cd "$ROOT/frontend"
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Instalando dependencias npm...${NC}"
  npm install -q
fi

echo ""
echo -e "${GREEN}Backend:  http://localhost:8000${NC}"
echo -e "${GREEN}Frontend: http://localhost:5173${NC}"
echo ""
echo "Ctrl+C para parar todo"
echo "========================================"
echo ""

# Arranca ambos en paralelo
cd "$ROOT/backend"
source venv/bin/activate
python manage.py runserver --noreload &
BACKEND_PID=$!

cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

# Al hacer Ctrl+C mata ambos
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait $BACKEND_PID $FRONTEND_PID
