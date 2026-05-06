# ReserVia 🍽️

Plataforma de reservas de restaurantes con IA. Encuentra y reserva los mejores restaurantes cerca de ti.

**Live**: [reservia.up.railway.app](https://reservia.up.railway.app)

## Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Django + Django REST Framework + JWT
- **Base de datos**: PostgreSQL
- **IA**: Anthropic Claude
- **Deploy**: Railway

## Desarrollo local

```bash
# Clonar repo
git clone https://github.com/PresiDeWitt/reservia-proyect.git
cd reservia-proyect

# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed
python manage.py runserver

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

## Tests

### Backend (Django)

```bash
cd backend
pip install -r requirements.txt
python manage.py test tests --verbosity 2
```

Bloques por tipo:

```bash
# Unit (modelos y serializers)
python manage.py test tests.test_models_unit tests.test_serializers_unit --verbosity 2

# API / Integracion
python manage.py test tests.test_auth_api tests.test_restaurants_api tests.test_reservations_api tests.test_chat_api --verbosity 2

# Smoke
python manage.py test tests.test_smoke_system --verbosity 2
```

### Frontend (Vitest + Testing Library)

```bash
cd frontend
npm install

# Ejecutar toda la suite una vez
npm run test:run

# Modo watch
npm run test

# Con coverage
npm run test:coverage
```

## Variables de entorno

Crea un archivo `backend/.env`:

```dotenv
SECRET_KEY=tu-secret-key
DEBUG=True
ANTHROPIC_API_KEY=tu-clave-anthropic
```
