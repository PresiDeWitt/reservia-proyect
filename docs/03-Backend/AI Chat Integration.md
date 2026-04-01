---
tags:
  - reservia
  - backend
  - ai
  - claude
---

# 🤖 AI Chat Integration

[[Home|← Volver al Home]]

## 🌟 Overview

Reservia integra ==Anthropic Claude== para ofrecer un chatbot conversacional que ayuda a los usuarios a descubrir restaurantes y recibir recomendaciones personalizadas.

---

## ⚙️ Configuración del Modelo

> [!info] 🧠 Parámetros de Claude
>
> - **Modelo** → ==claude-haiku-4-5-20251001==
> - **Max tokens** → ==400== por respuesta
> - **Historial máximo** → últimas ==10 interacciones==
> - **Idioma** → auto-detectado (==EN== / ==ES==)
> - **Autenticación** → API Key vía variable de entorno

> [!info] 🔑 API Key
>
> La variable de entorno requerida es ==ANTHROPIC_API_KEY==
>
> Ver [[Environment Variables]] para configuración completa.

> [!warning] 🔒 Seguridad
> La API key se mantiene ==exclusivamente en el backend==. El frontend ==nunca== tiene acceso directo a la clave de Anthropic.

---

## 📡 Endpoint

> [!abstract] **POST** /api/chat/
>
> ==No requiere autenticación== — el chat es público.
>
> Ver detalles completos en [[API Endpoints#🤖 Chat IA]]

---

## 💬 Flujo de Conversación

> [!tip] 1️⃣ El usuario escribe un mensaje
> El usuario tipea su pregunta en el componente ==ChatBot.tsx== del frontend.

⬇️

> [!tip] 2️⃣ Frontend envía la petición
> Se realiza un **POST** a ==/api/chat/== con:
> - **message** → el texto del usuario
> - **history** → conversación previa (últimas 10)
> - **lat** / **lng** → ubicación GPS (si está disponible)

⬇️

> [!tip] 3️⃣ Backend construye el contexto
> La ==ChatView== prepara el system prompt con:
> - Lista completa de restaurantes (nombre, cocina, rating, precio, descripción)
> - Ubicación del usuario (si fue proporcionada)
> - Instrucciones de comportamiento para el asistente

⬇️

> [!tip] 4️⃣ Llamada a Claude API
> Se envía el system prompt + historial + mensaje del usuario a ==Anthropic Claude==.

⬇️

> [!tip] 5️⃣ Respuesta al usuario
> La respuesta generada se devuelve al frontend y se muestra en el chat.
> El historial se actualiza localmente en el componente.

---

## 🧠 System Prompt

> [!info] 📋 Contexto que recibe el asistente
>
> El system prompt incluye tres bloques de información:
>
> **1. Datos de restaurantes**
> - Nombre, cocina, rating, precio y descripción de ==todos los restaurantes== de la base de datos
>
> **2. Ubicación del usuario** _(opcional)_
> - Coordenadas GPS para recomendaciones basadas en ==proximidad==
>
> **3. Instrucciones de comportamiento**
> - Responder en el ==mismo idioma== que el usuario (EN/ES)
> - Máximo ==200 palabras== por respuesta
> - Ayudar a encontrar restaurantes y hacer reservas

---

## 🌐 Soporte Multiidioma

> [!info] 🗣️ Detección automática de idioma
>
> - Si el usuario escribe en **español** → responde en ==español==
> - Si el usuario escribe en **inglés** → responde en ==inglés==
> - Consistente con la configuración ==i18n== de la app

---

## 🖥️ Frontend

> [!abstract] Componentes del chatbot
>
> - **Componente principal** → ==ChatBot.tsx==
> - **Cliente API** → ==frontend/src/api/chat.ts==
> - **Estado** → lista de mensajes con ==role== (user/assistant) y ==content==
> - **UI** → botón flotante que abre/cierra el panel de chat

> [!tip] 📍 Geolocalización
> El chatbot solicita la ubicación del navegador al abrirse. Si el usuario concede permisos, las coordenadas ==lat== y ==lng== se envían con cada mensaje para mejorar las recomendaciones por cercanía.

---

## 💡 Casos de Uso

> [!tip] 🎯 Ejemplos de consultas
>
> - =="¿Qué restaurante italiano me recomiendas?"==
> - =="Busco algo económico cerca de mí"==
> - =="¿Cuál tiene mejor rating?"==
> - =="Necesito un sitio para una cena romántica"==
> - =="¿Qué restaurantes tienen opciones veganas?"==

---

## 🔗 Links Relacionados

- [[API Endpoints]] — Endpoint /api/chat/
- [[Environment Variables]] — ANTHROPIC_API_KEY
- [[Tech Stack]] — Anthropic SDK en las dependencias
