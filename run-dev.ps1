# ReserVia - Arranca backend y frontend con un solo comando (PowerShell)
param()

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $PSCommandPath
$VENV = Join-Path $ROOT ".venv"

# Development mode
$env:DEBUG = "True"

Write-Host ""
Write-Host "========================================"
Write-Host "  ReserVia - Modo Desarrollo"
Write-Host "========================================"
Write-Host ""

# Clean up any stale processes from previous runs
$pid8000 = (Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue).OwningProcess
if ($pid8000) { Stop-Process -Id $pid8000 -Force -ErrorAction SilentlyContinue }
$pids5173 = (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue).OwningProcess
if ($pids5173) { $pids5173 | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }
Start-Sleep -Seconds 1

# --- Backend setup ---
Push-Location (Join-Path $ROOT "backend")

$pythonExe = Join-Path $VENV "Scripts\python.exe"
$pipExe = Join-Path $VENV "Scripts\pip3.exe"
if (-not (Test-Path $pipExe)) {
  $pipExe = Join-Path $VENV "Scripts\pip.exe"
}

# Crear venv si no existe
if (-not (Test-Path $pythonExe)) {
  Write-Host "Creando entorno virtual Python en .venv..." -ForegroundColor Yellow
  $sysPython = Get-Command python -ErrorAction SilentlyContinue
  if (-not $sysPython) { $sysPython = Get-Command python3 -ErrorAction SilentlyContinue }
  if (-not $sysPython) {
    Write-Host "No se encontro Python en el sistema" -ForegroundColor Red
    exit 1
  }
  & $sysPython.Source -m venv $VENV
}

Write-Host "Instalando dependencias Python..." -ForegroundColor Yellow
& $pipExe install -r requirements.txt -q

Write-Host "Ejecutando migraciones..." -ForegroundColor Yellow
& $pythonExe manage.py migrate --run-syncdb -v 0
if ($LASTEXITCODE -ne 0) {
  & $pythonExe manage.py migrate -v 0
}

Write-Host "Ejecutando seed..." -ForegroundColor Yellow
& $pythonExe manage.py seed 2>$null
if ($LASTEXITCODE -ne 0) { $true }

# --- Frontend setup ---
Pop-Location
Push-Location (Join-Path $ROOT "frontend")

if (-not (Test-Path "node_modules")) {
  Write-Host "Instalando dependencias npm..." -ForegroundColor Yellow
  npm install
}

Pop-Location

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8000"        -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173"        -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Ctrl+C para parar todo"
Write-Host ""

# --- Arrancar servidores ---
Push-Location (Join-Path $ROOT "backend")
$backendProc = Start-Process -FilePath $pythonExe `
  -ArgumentList "manage.py","runserver","--noreload" `
  -NoNewWindow -PassThru

Push-Location (Join-Path $ROOT "frontend")
$frontendProc = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c","npm run dev" `
  -NoNewWindow -PassThru

Pop-Location
Pop-Location

try {
  while (-not ($backendProc.HasExited -and $frontendProc.HasExited)) {
    Start-Sleep -Seconds 1
  }
}
finally {
  Write-Host ""
  Write-Host "Apagando servidores..." -ForegroundColor Yellow
  if ($backendProc -and -not $backendProc.HasExited) { Stop-Process $backendProc.Id -Force -ErrorAction SilentlyContinue }
  if ($frontendProc -and -not $frontendProc.HasExited) { Stop-Process $frontendProc.Id -Force -ErrorAction SilentlyContinue }
  Write-Host "Servidores detenidos." -ForegroundColor Green
}
