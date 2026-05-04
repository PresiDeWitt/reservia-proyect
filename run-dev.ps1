# ReserVia - Arranca backend y frontend con un solo comando (PowerShell)
param()

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $PSCommandPath
$VENV = Join-Path $ROOT ".venv"

$Green = "`e[0;32m"
$Yellow = "`e[1;33m"
$Red = "`e[0;31m"
$NC = "`e[0m"

# Cleanup handler
$backendProc = $null
$frontendProc = $null

$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -SupportEvent -Action {
  if ($backendProc) { Stop-Process $backendProc.Id -Force -ErrorAction SilentlyContinue }
  if ($frontendProc) { Stop-Process $frontendProc.Id -Force -ErrorAction SilentlyContinue }
}

Write-Host ""
Write-Host "========================================"
Write-Host "  ReserVia - Modo Desarrollo"
Write-Host "========================================"
Write-Host ""

# --- Backend setup ---
Push-Location (Join-Path $ROOT "backend")

$pythonExe = Join-Path $VENV "Scripts\python.exe"
$pipExe = Join-Path $VENV "Scripts\pip3.exe"
if (-not (Test-Path $pipExe)) {
  $pipExe = Join-Path $VENV "Scripts\pip.exe"
}

# Crear venv si no existe
if (-not (Test-Path $pythonExe)) {
  Write-Host "$Yellow Creando entorno virtual Python en .venv...$NC"
  $sysPython = Get-Command python -ErrorAction SilentlyContinue
  if (-not $sysPython) { $sysPython = Get-Command python3 -ErrorAction SilentlyContinue }
  if (-not $sysPython) {
    Write-Host "$Red No se encontro Python en el sistema$NC"
    exit 1
  }
  & $sysPython.Source -m venv $VENV
}

Write-Host "$Yellow Instalando dependencias Python...$NC"
& $pipExe install -r requirements.txt -q

Write-Host "$Yellow Ejecutando migraciones...$NC"
& $pythonExe manage.py migrate --run-syncdb -v 0 2>$null
if ($LASTEXITCODE -ne 0) {
  & $pythonExe manage.py migrate -v 0
}

Write-Host "$Yellow Ejecutando seed...$NC"
& $pythonExe manage.py seed 2>$null

# --- Frontend setup ---
Pop-Location
Push-Location (Join-Path $ROOT "frontend")

if (-not (Test-Path "node_modules")) {
  Write-Host "$Yellow Instalando dependencias npm...$NC"
  npm install
}

Pop-Location

Write-Host ""
Write-Host "$Green ========================================$NC"
Write-Host "$Green   Backend:  http://localhost:8000$NC"
Write-Host "$Green   Frontend: http://localhost:5173$NC"
Write-Host "$Green ========================================$NC"
Write-Host ""
Write-Host "Ctrl+C para parar todo"
Write-Host ""

# --- Arrancar servidores ---
Push-Location (Join-Path $ROOT "backend")
$backendProc = Start-Process -FilePath $pythonExe -ArgumentList "manage.py","runserver","--noreload" -NoNewWindow -PassThru

Push-Location (Join-Path $ROOT "frontend")
$frontendProc = Start-Process -FilePath "npm" -ArgumentList "run","dev" -NoNewWindow -PassThru

Pop-Location
Pop-Location

try {
  while (-not ($backendProc.HasExited -and $frontendProc.HasExited)) {
    Start-Sleep -Seconds 1
  }
}
finally {
  Write-Host ""
  Write-Host "$Yellow Apagando servidores...$NC"
  if ($backendProc -and -not $backendProc.HasExited) { Stop-Process $backendProc.Id -Force -ErrorAction SilentlyContinue }
  if ($frontendProc -and -not $frontendProc.HasExited) { Stop-Process $frontendProc.Id -Force -ErrorAction SilentlyContinue }
  Write-Host "$Green Servidores detenidos.$NC"
}
