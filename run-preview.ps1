# ReserVia - Script para arrancar la previsualización local (PowerShell)
param(
  [switch]$Stop,
  [switch]$Logs
)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $PSCommandPath
$COMPOSE_FILE = Join-Path $ROOT "docker-compose.preview.yml"

if ($Stop) {
  Write-Host ""
  Write-Host "========================================" -ForegroundColor Yellow
  Write-Host "  Deteniendo Previsualización Local..." -ForegroundColor Yellow
  Write-Host "========================================" -ForegroundColor Yellow
  Write-Host ""
  docker compose -f $COMPOSE_FILE down
  Write-Host "Previsualización detenida." -ForegroundColor Green
  exit 0
}

if ($Logs) {
  docker compose -f $COMPOSE_FILE logs -f
  exit 0
}

Write-Host ""
Write-Host "=================================================="
Write-Host "  ReserVia - Previsualización Local de Producción"
Write-Host "=================================================="
Write-Host ""

# Verificar si Docker está corriendo
$dockerCheck = docker info 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERROR: Docker no está en ejecución. Por favor arranca Docker Desktop antes de continuar." -ForegroundColor Red
  exit 1
}

Write-Host "Construyendo e iniciando contenedores en modo previsualización (puerto 8080)..." -ForegroundColor Yellow
docker compose -f $COMPOSE_FILE up --build -d

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  ¡PREVISUALIZACIÓN COMPLETAMENTE INICIADA!      " -ForegroundColor Green
Write-Host "  Accede en: http://localhost:8080"                 -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para ver los logs del contenedor, ejecuta:"
Write-Host "  .\run-preview.ps1 -Logs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para detener la previsualización y limpiar los contenedores, ejecuta:"
Write-Host "  .\run-preview.ps1 -Stop" -ForegroundColor Cyan
Write-Host ""
