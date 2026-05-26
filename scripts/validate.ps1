# Validación local completa — replica exactamente lo que corre el CI.
# Uso: .\scripts\validate.ps1
param()
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Red = "`e[31m"; $Green = "`e[32m"; $Yellow = "`e[33m"; $NC = "`e[0m"

function Ok($msg)   { Write-Host "${Green}✓ $msg${NC}" }
function Fail($msg) { Write-Host "${Red}✗ $msg${NC}"; exit 1 }
function Info($msg) { Write-Host "${Yellow}▶ $msg${NC}" }

# ── Backend ────────────────────────────────────────────────────────────────
Set-Location "$Root\backend"

Info "Backend: activando entorno virtual..."
$activate = if (Test-Path "venv\Scripts\Activate.ps1") { "venv\Scripts\Activate.ps1" }
            elseif (Test-Path "venv\bin\activate")      { "venv\bin\activate" }
            else { Fail "No se encontró venv. Ejecuta: cd backend; python -m venv venv; pip install -r requirements.txt" }

. $activate

Info "Backend: ejecutando tests (tests + api.tests)..."
python manage.py test tests api.tests --verbosity=1
if ($LASTEXITCODE -ne 0) { Fail "Backend tests fallaron" }
Ok "Backend tests: OK"

Info "Backend: SAST con Bandit..."
if (Get-Command bandit -ErrorAction SilentlyContinue) {
  bandit -r api reservia -x api/migrations -ll -ii -q
  if ($LASTEXITCODE -ne 0) { Fail "Bandit SAST falló" }
  Ok "Bandit SAST: OK"
} else {
  Write-Host "${Yellow}⚠ Bandit no instalado — saltando SAST (pip install bandit para activarlo)${NC}"
}

# ── Frontend ───────────────────────────────────────────────────────────────
Set-Location "$Root\frontend"

Info "Frontend: instalando dependencias..."
pnpm install --frozen-lockfile --silent
if ($LASTEXITCODE -ne 0) { Fail "pnpm install falló" }

Info "Frontend: build (tsc + vite)..."
pnpm build
if ($LASTEXITCODE -ne 0) { Fail "Frontend build falló" }
Ok "Frontend build: OK"

Info "Frontend: ESLint..."
pnpm lint
if ($LASTEXITCODE -ne 0) { Fail "ESLint falló" }
Ok "Frontend lint: OK"

Info "Frontend: Vitest..."
pnpm test:run
if ($LASTEXITCODE -ne 0) { Fail "Frontend tests fallaron" }
Ok "Frontend tests: OK"

# ── Resultado ─────────────────────────────────────────────────────────────
Write-Host ""
Ok "════════════════════════════════════"
Ok "  Todo OK — seguro para hacer push  "
Ok "════════════════════════════════════"
