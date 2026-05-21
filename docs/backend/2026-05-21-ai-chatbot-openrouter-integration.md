# Tarea: Integración y Robustez del Chatbot de IA de ReservIA con OpenRouter

- **Fecha**: 2026-05-21
- **Carpeta**: `docs/backend/`
- **Nombre**: `2026-05-21-ai-chatbot-openrouter-integration.md`

---

## Problema
El Chatbot de IA de ReservIA presentaba un fallo debido a que el modelo preconfigurado (`google/gemma-3-4b-it:free`) fue deprecado por OpenRouter, devolviendo un error `404` (y por consiguiente, error `502` / `choices` en el backend). Además, cuando el servidor se iniciaba de forma local fuera de Docker (por ejemplo, con `./run-dev.sh`), el backend no lograba leer las credenciales del archivo `.env` al estar este ubicado en el directorio raíz del proyecto y no dentro del subdirectorio `backend/`.

## Solución
1. **Actualización de Modelo**: Migrar a `"openrouter/free"`, un alias dinámico y libre de fallos por deprecación de modelos concretos en OpenRouter.
2. **Carga Inteligente de Dotenv**: Modificar la lógica de carga en `settings.py` para buscar el archivo `.env` del directorio raíz si Django se levanta de forma local.
3. **Copia de seguridad (.env)**: Añadir un `.env` en la carpeta `backend/` para mayor inmunidad, manteniéndolo correctamente ignorado por Git.

## Qué se hizo
- **`backend/api/views.py`**: Cambiado el string de modelo a `"openrouter/free"`.
- **`backend/reservia/settings.py`**: Añadido soporte para buscar y cargar `.env` del directorio padre (`BASE_DIR.parent / ".env"`).
- **`backend/.env`**: Creado localmente con las credenciales correspondientes.

## Cómo
Se implementó un enfoque centrado en la **redundancia** y la **robustez**:
1. El backend de Django ahora es agnóstico del punto de arranque. Sea cual sea la ruta actual de ejecución local, la API key se cargará perfectamente.
2. Al realizar la llamada al endpoint `/api/chat/`, se inyecta la lista de hasta 30 restaurantes registrados en la base de datos (con su nombre, cocina, valoración, precio, dirección y descripción) directamente en el `system_prompt` del chat de IA, lo que dota a la inteligencia artificial de información veraz de ReservIA en tiempo real.

## Riesgos
- **Consumo de Tokens**: Aunque se utiliza un enrutador gratuito, las cuotas y límites de llamadas concurrentes de OpenRouter se aplican al token proporcionado. Se ha mitigado controlando el historial a los últimos 10 mensajes y limitando la longitud máxima a 400 tokens.

## Notas adicionales
- Las claves de API están blindadas de forma segura locales y nunca se subirán a Git debido al `.gitignore` del proyecto.
