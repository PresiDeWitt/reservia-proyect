# ReserVia - Setup & Run

## 🚀 Opción 1: Desarrollo Local (Recomendado para Windows)

### Backend (Django)

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # En Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed
python manage.py runserver
```

Accede a: `http://localhost:8000/api/restaurants/`

### Frontend (React)

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Accede a: `http://localhost:5173`

**Nota**: El frontend proxy automáticamente `/api` a `http://localhost:8000`

---

## 🐳 Opción 2: Docker (Requiere Docker Desktop con permisos de admin)

### Requisitos
- Docker Desktop instalado y ejecutándose
- Abre PowerShell **Como Administrador**

### Ejecutar

```bash
cd reservia-proyect

# Opcional: añade tu API key de Anthropic
# Edita docker-compose.yml y pon tu key en ANTHROPIC_API_KEY

docker compose up --build
```

Accede a: `http://localhost`

---

## 🤖 Configurar Chatbot IA

El chatbot usa Claude para hacer búsquedas inteligentes. Necesitas una API key:

1. Crea una en: https://console.anthropic.com/
2. En **desarrollo local**:
   - Crea un archivo `.env` en `backend/`:
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
   ```
3. En **Docker**: edita `docker-compose.yml` línea 10

---

## 📋 Features Completos

✅ Búsqueda de restaurantes (nombre, cocina, ubicación)
✅ Filtros por cocina
✅ Mapa interactivo con geolocalización
✅ Reservas de mesas
✅ Mis reservas con cancelación
✅ Autenticación JWT
✅ Chatbot IA con búsqueda inteligente
✅ Soporte ES/EN
✅ Dark/Light mode ready

---

## 🗂️ Estructura

```
reservia-proyect/
├── backend/          # Django REST API
│   ├── api/         # Models, views, serializers
│   ├── reservia/    # Config
│   └── requirements.txt
├── frontend/        # React + TypeScript
│   ├── src/
│   │   ├── api/     # API clients
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
│   └── package.json
└── docker-compose.yml
```

---

## 🔧 Troubleshooting

**Frontend no se conecta al backend**:
- Verifica que backend corre en `http://localhost:8000`
- Revisa el proxy en `frontend/vite.config.ts`

**Chatbot no funciona**:
- Comprueba que `ANTHROPIC_API_KEY` está definida
- Verifica en `backend/.env` o `docker-compose.yml`

**Base de datos vacía**:
```bash
cd backend
python manage.py seed
```

