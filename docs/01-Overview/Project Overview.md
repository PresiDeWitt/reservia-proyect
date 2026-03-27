---
tags: [reservia, overview, features]
---

# Project Overview

[[Home|← Volver al Home]]

## ¿Qué es Reservia?

**ReserVia** es una plataforma web full-stack para la gestión de reservas en restaurantes. Combina una experiencia de usuario moderna con capacidades de IA para hacer el proceso de descubrir y reservar restaurantes más intuitivo.

---

## 🎯 Objetivos del Proyecto

- Permitir a los usuarios **descubrir restaurantes** por cocina, nombre o ubicación
- Facilitar **reservas de mesas** con selección visual de asientos
- Ofrecer un **chatbot con IA** (Claude) para recomendaciones personalizadas
- Proveer un **mapa interactivo** para explorar restaurantes cercanos
- Dar a los restaurantes una herramienta de **editor de planos** para configurar su distribución

---

## ✨ Funcionalidades Principales

### Para Usuarios

| Funcionalidad | Descripción |
|--------------|-------------|
| 🔍 Búsqueda | Filtrar por nombre y tipo de cocina |
| 📅 Reservas | Seleccionar fecha, hora y número de comensales |
| 💺 Selección de asientos | Visualizar y elegir asientos específicos en el plano |
| 📋 Mis Reservas | Ver y cancelar reservas existentes |
| 🤖 Chatbot IA | Pedir recomendaciones en lenguaje natural |
| 🗺️ Mapa | Explorar restaurantes en un mapa con geolocalización |
| 🌐 Idiomas | Interfaz en Español e Inglés |

### Para Administradores

| Funcionalidad | Descripción |
|--------------|-------------|
| ✏️ Editor de planos | Crear/editar distribución de mesas con forma, posición y capacidad |
| 👁️ Vista de disponibilidad | Ver qué asientos están ocupados en tiempo real |

---

## 🍽️ Restaurantes Disponibles

Reservia viene pre-cargado con 6 restaurantes de ejemplo:

| # | Restaurante | Cocina | Características |
|---|-------------|--------|----------------|
| 1 | The Golden Fork | Italiana | Clásico europeo, 10 mesas |
| 2 | Sakura Gardens | Japonesa | Minimalista, 8 mesas |
| 3 | Prime Cuts | Steakhouse | Espacioso, 7 mesas grandes |
| 4 | El Centro Fusion | Fusión | Combinaciones diversas, 40 opciones |
| 5 | Green Leaf | Saludable/Vegana | Farm-to-table orgánico |
| 6 | Petit Paris Bistro | Francesa | Bistró clásico parisino |

> [!info] Seeding
> Todos los restaurantes se crean automáticamente al iniciar el servidor mediante el comando `python manage.py seed`. Ver [[Database Seeding]].

---

## 🔗 Links Relacionados

- [[Tech Stack]] — Stack tecnológico completo
- [[System Architecture]] — Cómo encajan todas las piezas
- [[Reservation System]] — Flujo detallado de reservas
- [[AI Chat Integration]] — Cómo funciona el chatbot
