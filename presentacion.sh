#!/bin/bash
# ============================================================
#  ReserVia — Script de Presentación
#  Uso: ./presentacion.sh
# ============================================================

set -euo pipefail

# ── Colores ──────────────────────────────────────────────────
BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
DIM='\033[2m'
NC='\033[0m'

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── Banner ───────────────────────────────────────────────────
clear
echo ""
echo -e "${CYAN}${BOLD}"
echo "  ██████╗ ███████╗███████╗███████╗██████╗ ██╗   ██╗██╗ █████╗ "
echo "  ██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗██║   ██║██║██╔══██╗"
echo "  ██████╔╝█████╗  ███████╗█████╗  ██████╔╝██║   ██║██║███████║"
echo "  ██╔══██╗██╔══╝  ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██║██╔══██║"
echo "  ██║  ██║███████╗███████║███████╗██║  ██║ ╚████╔╝ ██║██║  ██║"
echo "  ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚═╝╚═╝  ╚═╝"
echo -e "${NC}"
echo -e "${DIM}  Plataforma de reservas de restaurantes${NC}"
echo ""
echo -e "  ${DIM}────────────────────────────────────────────────────────${NC}"
echo ""

# ── Función: imprimir paso ────────────────────────────────────
step() { echo -e "  ${CYAN}▶${NC} ${BOLD}$1${NC}"; }
ok()   { echo -e "  ${GREEN}✔${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC}  $1"; }
fail() { echo -e "  ${RED}✘${NC} $1"; }

# ── Función: cleanup al Ctrl+C ────────────────────────────────
cleanup() {
  echo ""
  echo ""
  warn "Deteniendo ReserVia..."
  cd "$ROOT"
  docker compose down --timeout 10 2>/dev/null || true
  echo -e "  ${GREEN}✔${NC} Contenedores detenidos. ¡Hasta luego!"
  echo ""
  exit 0
}
trap cleanup INT TERM

# ── 1. Verificar Docker ───────────────────────────────────────
step "Verificando Docker..."
if ! command -v docker &>/dev/null; then
  fail "Docker no está instalado. Instálalo desde https://docker.com"
  exit 1
fi

if ! docker info &>/dev/null; then
  fail "Docker no está arrancado. Ábrelo primero."
  echo ""
  echo -e "  ${DIM}→ Abre Docker Desktop y espera a que el icono deje de girar.${NC}"
  exit 1
fi
ok "Docker está corriendo"

# ── 2. Verificar docker compose ───────────────────────────────
if ! docker compose version &>/dev/null; then
  fail "docker compose no disponible. Actualiza Docker Desktop."
  exit 1
fi

# ── 3. Ir al directorio del proyecto ─────────────────────────
cd "$ROOT"

# ── 4. Verificar .env ────────────────────────────────────────
step "Verificando variables de entorno..."
if [ ! -f ".env" ]; then
  warn ".env no encontrado. Creando uno mínimo de emergencia..."
  cat > .env <<'ENVEOF'
SECRET_KEY=presentacion-secret-key-reservia-2024
OPENROUTER_API_KEY=
STAFF_OWNER_CODE=OWNER123
STAFF_ADMIN_CODE=ADMIN123
ENVEOF
  warn "Chatbot IA desactivado (sin OPENROUTER_API_KEY). El resto funciona."
else
  ok "Archivo .env encontrado"
fi

# ── 5. Limpiar contenedores viejos ────────────────────────────
step "Limpiando contenedores anteriores..."
docker compose down --remove-orphans --timeout 10 2>/dev/null || true
ok "Limpieza completada"

# ── 6. Build y arranque ───────────────────────────────────────
step "Construyendo imágenes y levantando servicios..."
echo -e "  ${DIM}(Esto puede tardar 1-3 min la primera vez)${NC}"
echo ""

if ! docker compose up --build -d 2>&1; then
  fail "Error al levantar Docker Compose."
  echo ""
  echo -e "  ${DIM}Mostrando logs de error:${NC}"
  docker compose logs --tail=30
  exit 1
fi

ok "Contenedores en marcha"

# ── 7. Esperar a que el backend esté listo ────────────────────
step "Esperando que el backend esté listo..."
BACKEND_URL="http://localhost/api/health/"
MAX_WAIT=120   # segundos máximos de espera
ELAPSED=0
INTERVAL=3

printf "  "
while true; do
  if curl -sf "$BACKEND_URL" &>/dev/null; then
    echo ""
    ok "Backend respondiendo en $BACKEND_URL"
    break
  fi

  if [ "$ELAPSED" -ge "$MAX_WAIT" ]; then
    echo ""
    fail "El backend no respondió en ${MAX_WAIT}s."
    echo ""
    echo -e "  ${DIM}Logs del backend:${NC}"
    docker compose logs backend --tail=40
    echo ""
    echo -e "  ${YELLOW}¿Sigue sin funcionar? Prueba: docker compose logs${NC}"
    exit 1
  fi

  printf "${CYAN}.${NC}"
  sleep "$INTERVAL"
  ELAPSED=$((ELAPSED + INTERVAL))
done

# ── 8. Verificar frontend ─────────────────────────────────────
step "Verificando frontend..."
FRONTEND_URL="http://localhost"
if curl -sf "$FRONTEND_URL" &>/dev/null; then
  ok "Frontend accesible en $FRONTEND_URL"
else
  warn "Frontend todavía cargando, espera unos segundos..."
fi

# ── 9. Resumen final ──────────────────────────────────────────
echo ""
echo -e "  ${DIM}────────────────────────────────────────────────────────${NC}"
echo ""
echo -e "  ${GREEN}${BOLD}🚀 ¡ReserVia está listo para la presentación!${NC}"
echo ""
echo -e "  ${BOLD}URL de la app:${NC}     ${CYAN}http://localhost${NC}"
echo -e "  ${BOLD}API backend:${NC}       ${CYAN}http://localhost/api/${NC}"
echo ""
echo -e "  ${BOLD}Credenciales de demo:${NC}"
echo -e "  ${DIM}→ Crea un usuario nuevo desde la interfaz${NC}"
echo -e "  ${DIM}→ Código owner: ${NC}${BOLD}OWNER123${NC}"
echo -e "  ${DIM}→ Código admin: ${NC}${BOLD}ADMIN123${NC}"
echo ""
echo -e "  ${DIM}────────────────────────────────────────────────────────${NC}"
echo ""
echo -e "  ${YELLOW}Ctrl+C${NC} para detener todo cuando termines."
echo ""

# ── 10. Abrir navegador automáticamente ──────────────────────
step "Abriendo navegador..."
sleep 1
open "http://localhost" 2>/dev/null || xdg-open "http://localhost" 2>/dev/null || true

# ── 11. Mostrar logs en vivo (opcional) ──────────────────────
echo ""
echo -e "  ${DIM}── Logs en vivo (Ctrl+C para parar todo) ──────────────${NC}"
echo ""
docker compose logs -f --tail=20
