@echo off
REM ReserVia Docker Runner para Windows
REM Este script requiere Docker Desktop instalado y ejecutándose

echo ========================================
echo ReserVia - Docker Container
echo ========================================
echo.

REM Verifica si Docker está disponible
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no está instalado o no está en el PATH
    echo Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Verifica si el contenedor anterior está corriendo y lo detiene
echo Deteniendo contenedores anteriores...
docker compose down 2>nul

REM Construye e inicia los contenedores
echo.
echo Construyendo e iniciando contenedores...
echo (Esto puede tardar algunos minutos la primera vez)
echo.

docker compose up --build

REM Si Docker falla, intenta con permisos elevados
if %errorlevel% neq 0 (
    echo.
    echo NOTA: Docker requiere permisos elevados.
    echo Por favor, abre PowerShell como Administrador y ejecuta:
    echo   cd %cd%
    echo   docker compose up --build
    pause
)
