---
tags:
  - reservia
  - moc
  - dashboard
cssclasses:
  - wide-page
---

# 🍽️ Reservia — Centro de Documentación

> [!abstract] 🌟 ¿Qué es Reservia?
> **ReserVia** es una plataforma de reservas de restaurantes con integración de IA. Permite descubrir restaurantes, explorarlos en un mapa interactivo, seleccionar mesas visualmente y hacer reservas con asistencia de un chatbot impulsado por ==Claude==.
>
> 🔗 **Live**: https://reservia.up.railway.app

---

## 📋 Visión General

> [!tip] 🔎 Conoce el Proyecto
> - 📖 [[Project Overview]] — Qué es, para qué sirve, funcionalidades principales
> - 🧰 [[Tech Stack]] — Todas las tecnologías usadas

---

## 🏗️ Arquitectura

> [!info] 🧱 Diseño del Sistema
> - 🏛️ [[System Architecture]] — Visión general del sistema y flujo de datos
> - 📂 [[Project Structure]] — Estructura de carpetas y archivos clave
> - 🗄️ [[Database Schema]] — Modelos y relaciones de base de datos

---

## ⚙️ Backend

> [!warning] 🔧 Motor del Servidor
> - 🌐 [[API Endpoints]] — Todas las rutas REST disponibles
> - 🔐 [[Authentication]] — Sistema JWT, tokens, permisos
> - 📦 [[Models]] — Modelos Django detallados
> - 🤖 [[AI Chat Integration]] — Integración con Claude (Anthropic)

---

## 🖥️ Frontend

> [!example] 🎨 Interfaz de Usuario
> - 🗺️ [[Pages & Routing]] — Páginas y rutas de React Router
> - 🧩 [[Components]] — Componentes reutilizables
> - 📊 [[State Management]] — AuthContext y estado global
> - 🌐 [[Internationalization]] — i18n EN/ES

---

## ✨ Funcionalidades

> [!success] 💡 Características Clave
> - 🔍 [[Restaurant Discovery]] — Búsqueda y filtrado de restaurantes
> - 📅 [[Reservation System]] — Flujo completo de reservas
> - 🪑 [[Floor Plan System]] — Editor visual de planos y selección de asientos
> - 🗺️ [[Map Explorer]] — Mapa interactivo con geolocalización

---

## 🚀 Despliegue

> [!quote] ☁️ Infraestructura
> - 🐳 [[Docker Setup]] — Dockerfile multi-stage y docker-compose
> - 🔑 [[Environment Variables]] — Variables de entorno necesarias
> - 🚂 [[Railway Deployment]] — Despliegue en Railway.app

---

## 🛠️ Desarrollo

> [!note] 👨‍💻 Entorno Local
> - 💻 [[Local Setup]] — Cómo correr el proyecto en local
> - 🌱 [[Database Seeding]] — Datos de prueba pre-cargados

---

## 🔐 Seguridad

> [!danger] 🚨 Incidencias y Riesgos
> - 🚨 [[Security Incidents]] — Vulnerabilidades identificadas y su estado

---

## 🩺 Troubleshooting & Decisiones

> [!danger] 🛠️ Bitácora de Problemas Resueltos
> - 📒 [[Index|Troubleshooting Index]] — Lista completa de incidencias documentadas
> - 🔐 [[Auth Redesign & Proxy Fix]] — Rediseño del modal de auth + bug del proxy IPv6 (2026-04-15)

---

## 🔑 Quick Reference

> [!abstract] 🧰 Stack Tecnológico de un Vistazo
>
> > [!tip] 🎨 Frontend
> > **React 19** + TypeScript + Vite · Estilos con **Tailwind CSS v4**
>
> > [!info] ⚙️ Backend
> > **Django 4.2** + Django REST Framework · Auth con **JWT (SimpleJWT)**
>
> > [!success] 🗄️ Base de Datos
> > **SQLite** *(dev)* · **PostgreSQL** *(prod)*
>
> > [!warning] 🤖 Inteligencia Artificial
> > **Anthropic Claude Haiku 4.5** — Chatbot de recomendaciones
>
> > [!example] 🚀 Despliegue
> > **Docker** + **Railway** · Mapas con **Leaflet.js** · i18n con **i18next** *(EN/ES)*

---

> [!quote] 🗺️ Flujo del Sistema
> **Usuario** → *Frontend (React)* → **API REST** → *Backend (Django)* → **Base de Datos**
>
> El backend también se comunica con la **API de Anthropic** para el chatbot, y el frontend usa **Leaflet** para los mapas interactivos.
