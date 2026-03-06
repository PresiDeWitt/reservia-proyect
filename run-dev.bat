@echo off
REM ReserVia Development Runner para Windows
REM Abre dos ventanas: una para backend y otra para frontend

echo ========================================
echo ReserVia - Modo Desarrollo
echo ========================================
echo.

REM Verifica si Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python no está instalado
    echo Descarga Python desde: https://www.python.org/
    pause
    exit /b 1
)

REM Verifica si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado
    echo Descarga Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

echo Python encontrado:
python --version
echo Node.js encontrado:
node --version
echo.

REM Inicia Backend en nueva ventana
echo Iniciando Backend (Django en http://localhost:8000)...
start "ReserVia Backend" cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && python manage.py migrate && python manage.py seed && python manage.py runserver"

REM Espera a que el backend arranque
timeout /t 5 /nobreak

REM Inicia Frontend en nueva ventana
echo Iniciando Frontend (React en http://localhost:5173)...
start "ReserVia Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ========================================
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Abre tu navegador y accede a: http://localhost:5173
echo.
pause
