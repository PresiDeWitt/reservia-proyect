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

## Variables de entorno

Crea un archivo `backend/.env`:

```
SECRET_KEY=tu-secret-key
DEBUG=True
ANTHROPIC_API_KEY=tu-clave-anthropic
```
