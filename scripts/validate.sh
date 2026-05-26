#!/usr/bin/env bash
# Validación local completa — replica exactamente lo que corre el CI.
# Uso: bash scripts/validate.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

ok()   { echo -e "${GREEN}✓ $1${NC}"; }
fail() { echo -e "${RED}✗ $1${NC}"; exit 1; }
info() { echo -e "${YELLOW}▶ $1${NC}"; }

# ── Backend ────────────────────────────────────────────────────────────────
info "Backend: activando entorno virtual..."
cd "$ROOT/backend"

if [[ -f "venv/Scripts/activate" ]]; then
  # shellcheck disable=SC1091
  source venv/Scripts/activate
elif [[ -f "venv/bin/activate" ]]; then
  # shellcheck disable=SC1091
  source venv/bin/activate
else
  fail "No se encontró venv. Ejecuta: cd backend && python -m venv venv && pip install -r requirements.txt"
fi

info "Backend: ejecutando tests (tests + api.tests)..."
python manage.py test tests api.tests --verbosity=1
ok "Backend tests: OK"

info "Backend: SAST con Bandit..."
bandit -r api reservia -x api/migrations -ll -ii -q
ok "Bandit SAST: OK"

# ── Frontend ───────────────────────────────────────────────────────────────
cd "$ROOT/frontend"

info "Frontend: instalando dependencias..."
pnpm install --frozen-lockfile --silent

info "Frontend: build (tsc + vite)..."
pnpm build
ok "Frontend build: OK"

info "Frontend: ESLint..."
pnpm lint
ok "Frontend lint: OK"

info "Frontend: Vitest..."
pnpm test:run
ok "Frontend tests: OK"

# ── Resultado ─────────────────────────────────────────────────────────────
echo ""
ok "════════════════════════════════════"
ok "  Todo OK — seguro para hacer push  "
ok "════════════════════════════════════"
