---
tags: [reservia, tech-stack, dependencies]
---

# Tech Stack

[[Home|← Volver al Home]]

## 🖥️ Frontend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 19.2.0 | Framework UI principal |
| TypeScript | — | Tipado estático |
| Vite | 7.2.4 | Build tool y dev server |
| Tailwind CSS | 4.1.18 | Estilos utilitarios |
| Framer Motion | 12.29.0 | Animaciones |
| React Router | 7.12.0 | Navegación SPA |
| Leaflet + React Leaflet | 1.9.4 / 5.0.0 | Mapas interactivos |
| i18next + react-i18next | 25.8.0 / 16.5.3 | Internacionalización |

### Paleta de Colores (Tailwind Custom)

```css
--color-primary:          #f97415  /* Naranja principal */
--color-navy:             #0F172A  /* Azul oscuro */
--color-emerald:          #10B981  /* Verde */
--color-background-light: #f8f7f5  /* Crema */
--color-background-dark:  #23170f  /* Marrón oscuro */
```

> [!tip] Fuente
> La fuente principal es **Inter** (sans-serif).

---

## ⚙️ Backend

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Python | 3.11 | Lenguaje del backend |
| Django | 4.2 | Framework web |
| Django REST Framework | 3.15 | API REST |
| SimpleJWT | 5.3 | Autenticación JWT |
| django-cors-headers | 4.3 | Gestión de CORS |
| Gunicorn | 21.2 | WSGI server de producción |
| WhiteNoise | 6.6 | Servir archivos estáticos |
| python-dotenv | 1.0 | Variables de entorno |
| Anthropic SDK | — | Integración con Claude |
| psycopg2-binary | 2.9 | Driver PostgreSQL |
| dj-database-url | 2.1 | URL de base de datos |

---

## 🗄️ Base de Datos

| Entorno | Motor | Notas |
|---------|-------|-------|
| Desarrollo | SQLite3 | Archivo `db.sqlite3` local |
| Producción | PostgreSQL | Servicio Railway |

---

## 🤖 IA

| Servicio | Modelo | Uso |
|---------|--------|-----|
| Anthropic Claude | `claude-haiku-4-5-20251001` | Chatbot de recomendaciones |

**Configuración del chatbot**:
- Max tokens: 400
- Historial: últimas 10 interacciones
- Idioma: Auto-detectado (EN/ES)
- Contexto: Lista de restaurantes + ubicación GPS opcional

---

## 🚀 Despliegue e Infraestructura

| Componente | Tecnología | Notas |
|-----------|-----------|-------|
| Containerización | Docker | Multi-stage build |
| Orquestación local | Docker Compose | Backend + Frontend |
| Hosting | Railway.app | Auto-deploy desde Git |
| Build frontend | Node 22-alpine | Stage 1 del Dockerfile |
| Runtime backend | Python 3.11-slim | Stage 2 del Dockerfile |

---

## 📦 Gestión de Paquetes

| Área | Tool |
|------|------|
| Frontend | npm |
| Backend | pip + requirements.txt |

---

## 🔗 Links Relacionados

- [[System Architecture]] — Cómo se comunican estos componentes
- [[Docker Setup]] — Configuración Docker detallada
- [[AI Chat Integration]] — Integración con Anthropic
- [[Authentication]] — Sistema JWT con SimpleJWT
