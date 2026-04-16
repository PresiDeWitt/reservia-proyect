# Migrar chat IA de Anthropic a OpenRouter

## Problema

El chatbot de IA usaba la API de Anthropic (claude-haiku) que requiere una API key de pago. Se necesitaba cambiar a un modelo gratuito usando una API key de OpenRouter.

## Solucion

Reemplazar el SDK de Anthropic por llamadas HTTP directas a la API de OpenRouter usando el modelo gratuito `google/gemma-3-4b-it:free`.

## Que se hizo

- **`backend/.env`** — Creado con `OPENROUTER_API_KEY` (excluido de git via `.gitignore`)
- **`backend/reservia/settings.py`** — Cambiado `ANTHROPIC_API_KEY` por `OPENROUTER_API_KEY`
- **`backend/api/views.py`** — Reescrito `chat_view` para usar OpenRouter REST API en vez del SDK de Anthropic
- **`backend/requirements.txt`** — Reemplazado `anthropic` por `requests`

## Como

1. Se creo el `.env` con la API key de OpenRouter
2. Se actualizo settings.py para leer la nueva variable de entorno
3. Se reescribio la funcion `chat_view` para hacer POST a `https://openrouter.ai/api/v1/chat/completions` con formato OpenAI-compatible
4. El system prompt se inserta como primer mensaje con role `system` (formato OpenAI) en vez de parametro separado (formato Anthropic)
5. Se cambio la dependencia de `anthropic` a `requests` en requirements.txt

## Riesgos

- **Modelo gratuito**: `gemma-3-4b-it:free` puede tener limites de rate o menor calidad que claude-haiku
- **Sin reintentos**: Si OpenRouter falla, se devuelve error 502 directamente. No hay retry logic
- **Timeout**: Se puso timeout de 30s, si el modelo tarda mas se corta la peticion
- **API key en .env**: Si alguien clona el repo necesita crear su propio `.env` con la key

## Notas adicionales

- El frontend (`chat.ts`) no necesito cambios — la API del backend sigue devolviendo `{ reply: "..." }`
- El `.env` ya estaba en `.gitignore`, no se sube a GitHub
