---
tags: [reservia, development, setup, local, installation]
---

# Local Setup

[[Home|← Volver al Home]]

## Prerequisitos

| Herramienta | Versión mínima | Verificar |
|------------|---------------|-----------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Python | 3.11+ | `python --version` |
| pip | — | `pip --version` |
| Git | — | `git --version` |

> [!tip] Alternativa con Docker
> Si tienes Docker instalado, puedes saltar todo y usar [[Docker Setup#🐙 Docker Compose (Desarrollo Local)]].

---

## 🛠️ Setup Completo

### 1. Clonar el Repositorio

```bash
git clone <url-del-repo>
cd reservia-proyect
```

### 2. Configurar Variables de Entorno

```bash
# Copiar el template
cp .env.example .env

# Editar con tus valores
nano .env  # o cualquier editor
```

Variables mínimas para desarrollo:
```env
SECRET_KEY=django-insecure-dev-key-only
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
ANTHROPIC_API_KEY=sk-ant-api03-tu-key-aqui
```

> [!warning] ANTHROPIC_API_KEY requerida
> Sin esta key, el chatbot no funcionará. Obtenerla en [console.anthropic.com](https://console.anthropic.com).

---

### 3. Backend (Django)

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones
python manage.py migrate

# Cargar datos de prueba
python manage.py seed

# Iniciar servidor
python manage.py runserver
```

El backend estará disponible en: `http://localhost:8000`

---

### 4. Frontend (React)

Abrir una nueva terminal:

```bash
cd frontend

# Instalar dependencias
npm install

# Crear archivo de entorno de desarrollo
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

---

## ✅ Verificar Instalación

1. Abre `http://localhost:5173` en el navegador
2. Deberías ver la página principal de Reservia con los 6 restaurantes
3. Prueba el chatbot (icono en esquina inferior derecha)
4. Regístrate y haz una reserva de prueba

---

## 🧪 Comandos Útiles

### Backend

```bash
# Correr desde /backend con venv activado

# Limpiar y re-seedar la base de datos
python manage.py flush --noinput && python manage.py seed

# Crear superusuario para Django Admin
python manage.py createsuperuser

# Ver Django Admin
# http://localhost:8000/admin/

# Correr tests
python manage.py test

# Ver todas las rutas registradas
python manage.py show_urls

# Shell interactivo
python manage.py shell
```

### Frontend

```bash
# Correr desde /frontend

# Desarrollo con hot reload
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Lint
npm run lint
```

---

## 🗄️ Django Admin

Con el servidor de desarrollo corriendo:

1. Crear superusuario: `python manage.py createsuperuser`
2. Ir a: `http://localhost:8000/admin/`
3. Desde aquí puedes gestionar todos los modelos directamente

---

## 🔄 Resetear Base de Datos

```bash
# Eliminar todos los datos
python manage.py flush --noinput

# O eliminar el archivo SQLite directamente
rm db.sqlite3

# Re-aplicar migraciones
python manage.py migrate

# Re-seedar
python manage.py seed
```

---

## 🐛 Troubleshooting

### Error: Module not found
```bash
# Asegúrate de que el venv está activado
source venv/bin/activate
pip install -r requirements.txt
```

### Error: CORS
Verifica que `CORS_ALLOWED_ORIGINS` en `.env` incluye `http://localhost:5173`.

### Error: API no responde
Verifica que el backend está corriendo en `http://localhost:8000`.

### Error: Chatbot no funciona
Verifica que `ANTHROPIC_API_KEY` está correctamente configurada en `.env`.

### Frontend no carga restaurantes
Verifica que `VITE_API_URL=http://localhost:8000` está en `frontend/.env.local`.

---

## 🔗 Links Relacionados

- [[Docker Setup]] — Alternativa con Docker
- [[Environment Variables]] — Todas las variables explicadas
- [[Database Seeding]] — Datos de prueba
- [[Railway Deployment]] — Despliegue en producción
