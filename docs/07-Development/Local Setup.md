---
tags:
  - reservia
  - development
  - setup
---

# 🛠️ Local Setup

[[Home|← Volver al Home]]

---

## 📋 Prerequisitos

> [!warning] ⚠️ Herramientas Necesarias
>
> Asegúrate de tener instaladas las siguientes herramientas antes de continuar:
>
> | Herramienta | Versión Mínima | Cómo verificar |
> |------------|:--------------:|----------------|
> | 🟢 Node.js | ==18+== | ejecutar node --version |
> | 📦 npm | ==9+== | ejecutar npm --version |
> | 🐍 Python | ==3.11+== | ejecutar python --version |
> | 📦 pip | cualquiera | ejecutar pip --version |
> | 🔀 Git | cualquiera | ejecutar git --version |

> [!tip] 🐳 Alternativa Rápida
> Si tienes Docker instalado, puedes saltar todo este proceso y usar [[Docker Setup]] directamente.

---

## 🚀 Setup Paso a Paso

> [!abstract] 1️⃣ Clonar el Repositorio
> Usando Git, clonar el repositorio del proyecto y entrar al directorio creado.
> El directorio se llamará ==reservia-proyect==.

> [!abstract] 2️⃣ Configurar Variables de Entorno
> Copiar el archivo .env.example a un nuevo archivo llamado ==[.env]== en la raíz del proyecto, y editarlo con tus valores personales.
>
> **Variables mínimas para desarrollo:**
>
> | Variable | Valor |
> |----------|-------|
> | SECRET_KEY | cualquier clave para desarrollo |
> | DEBUG | ==True== |
> | ALLOWED_HOSTS | localhost,127.0.0.1 |
> | CORS_ALLOWED_ORIGINS | http://localhost:5173 |
> | ANTHROPIC_API_KEY | tu clave de API personal |

> [!warning] 🤖 ANTHROPIC_API_KEY requerida
> Sin esta clave, ==el chatbot no funcionará==. Obtenerla en console.anthropic.com

> [!abstract] 3️⃣ Configurar el Backend (Django)
> Desde el directorio ==backend/==, realizar los siguientes pasos en orden:
>
> 1. **Crear entorno virtual** → usar python -m venv venv
> 2. **Activar el entorno virtual:**
>    - 🍎 macOS/Linux → source venv/bin/activate
>    - 🪟 Windows → venv\Scripts\activate
> 3. **Instalar dependencias** → pip install -r requirements.txt
> 4. **Aplicar migraciones** → python manage.py migrate
> 5. **Cargar datos de prueba** → python manage.py seed
> 6. **Iniciar el servidor** → python manage.py runserver
>
> 🌐 Backend disponible en ==http://localhost:8000==

> [!abstract] 4️⃣ Configurar el Frontend (React)
> Abrir una ==nueva terminal== y desde el directorio ==frontend/==:
>
> 1. **Instalar dependencias** → npm install
> 2. **Crear archivo de entorno** → crear frontend/.env.local con VITE_API_URL apuntando a http://localhost:8000
> 3. **Iniciar servidor de desarrollo** → npm run dev
>
> 🌐 Frontend disponible en ==http://localhost:5173==

---

## ✅ Verificar Instalación

> [!success] 🎉 ¡Todo listo!
>
> 1. Abrir ==http://localhost:5173== en el navegador
> 2. Deberías ver la página principal de Reservia con los ==6 restaurantes==
> 3. Probar el chatbot (icono en la esquina inferior derecha) 💬
> 4. Registrarte y hacer una reserva de prueba 📝

---

## 🧪 Comandos Útiles

> [!info] 🐍 Backend (desde /backend con venv activado)
>
> - **Limpiar y re-seedar la BD** → flush con --noinput, luego seed
> - **Crear superusuario** → python manage.py createsuperuser
> - **Panel de admin** → visitar http://localhost:8000/admin/
> - **Correr tests** → python manage.py test
> - **Ver rutas registradas** → python manage.py show_urls
> - **Shell interactivo** → python manage.py shell

> [!info] ⚡ Frontend (desde /frontend)
>
> - **Desarrollo con hot reload** → npm run dev
> - **Build de producción** → npm run build
> - **Preview del build** → npm run preview
> - **Lint** → npm run lint

---

## 🗄️ Django Admin

> [!info] 👤 Panel de Administración
>
> 1. Crear un superusuario ejecutando el comando createsuperuser de manage.py
> 2. Visitar ==http://localhost:8000/admin/==
> 3. Desde aquí puedes gestionar todos los modelos: restaurantes, mesas, reservas, usuarios...

---

## 🔄 Resetear Base de Datos

> [!warning] 🗑️ Opciones para resetear
>
> **Opción A — Solo limpiar datos:**
> Ejecutar flush con --noinput, luego re-aplicar el seed
>
> **Opción B — Reset completo (incluye esquema):**
> Eliminar el archivo db.sqlite3, luego ejecutar migrate y seed nuevamente
>
> ==Ambas opciones requieren re-ejecutar el seed para tener datos de prueba.==

---

## 🐛 Troubleshooting

> [!bug] 💥 Error: Module not found
> Asegúrate de que el entorno virtual está activado. Luego reinstala las dependencias con pip install -r requirements.txt desde el directorio backend.

> [!bug] 🔗 Error: CORS
> Verificar que la variable ==CORS_ALLOWED_ORIGINS== en el archivo .env incluye exactamente http://localhost:5173 (sin barra final).

> [!bug] 📡 Error: API no responde
> Verificar que el backend está corriendo en http://localhost:8000. Revisar la terminal del backend por errores.

> [!bug] 🤖 Error: Chatbot no funciona
> Verificar que ==ANTHROPIC_API_KEY== está correctamente configurada en el archivo .env. La clave debe comenzar con sk-ant-api03-.

> [!bug] 🍽️ Frontend no carga restaurantes
> Verificar que el archivo frontend/.env.local existe y contiene ==VITE_API_URL=http://localhost:8000== (sin barra final).

---

## 🔗 Links Relacionados

- [[Docker Setup]] — Alternativa con Docker
- [[Environment Variables]] — Todas las variables explicadas
- [[Database Seeding]] — Datos de prueba en detalle
- [[Railway Deployment]] — Despliegue en producción
