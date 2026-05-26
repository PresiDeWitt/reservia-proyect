# Tarea: Traducción Completa de la Aplicación (Español / Inglés)

## Problema
Al cambiar el idioma de la aplicación a inglés, varios componentes de la interfaz de usuario, botones de acción, menús dinámicos, descripciones de restaurantes y platos destacados de la carta seguían visualizándose exclusivamente en español. Además, ciertos componentes (como la animación de escritura en el Hero y la bandeja de notificaciones mockeadas) no respondían reactivamente al selector de idiomas.

## Solución
Implementar una cobertura total del sistema de internacionalización (i18n) en todo el frontend. Esto incluye la extracción de todos los literales hardcodeados en español, el rediseño de componentes funcionales y de clase para enlazarse de forma reactiva al hook de traducción `useTranslation` o de forma directa a la instancia `i18n`, y el desarrollo de un mapeador dinámico en el frontend para traducir datos crudos almacenados en la base de datos (como descripciones de restaurantes y nombres/descripciones de platos destacados) en función del idioma activo.

## Qué se hizo
Se modificaron los siguientes archivos en la ruta de trabajo `frontend/`:
*   `src/i18n/es.json` y `src/i18n/en.json`: Agregados diccionarios para los namespaces `auth` (flujo editorial y recuperación de accesos), `hero` (líneas typewriter y selectores del buscador), `notifications` (avisos mockeados localizados), `errorBoundary` (mensajes de error de renderizado), `api` (error de conexión de red), y `restaurantDetail` (mapeadores de descripciones y menuItems).
*   `src/components/AuthModal.tsx`: Localizada la interfaz del panel izquierdo editorial y todo el flujo de "¿Olvidaste tu contraseña?" (`isForgot`), además de los atributos `aria-label`.
*   `src/components/Hero.tsx`: Localizado el titular del typewriter, la descripción editorial, pestañas de búsqueda, etiquetas de selección, placeholders, sugerencias IA y pistas de scroll. Rediseñado el custom hook `useTypewriter` para que sea reactivo al idioma activo (`i18n.language`).
*   `src/components/NotificationsMenu.tsx`: Refactorizado para cargar y mapear dinámicamente los avisos mockeados mediante claves de i18n, manteniendo persistente el estado de lectura.
*   `src/components/MobileDrawer.tsx`: Traducido el descriptor de cierre (`aria-label`) del cajón móvil.
*   `src/components/ErrorBoundary.tsx`: Traducidos los mensajes de error grave importando la configuración directa `i18n` y llamando a `i18n.t()`.
*   `src/pages/MyBookings.tsx`: Localizado el diálogo confirmador de cancelación de reserva del navegador.
*   `src/pages/RestaurantDetails.tsx`: Implementado el mapeador dinámico por nombre de restaurante y plato destacado para traducir descripciones de base de datos de manera fluida y fluida en ES/EN.
*   `src/api/client.ts`: Localizado el mensaje de error de conexión en red lanzado en el interceptor de peticiones.

## Cómo
1.  **Mapeadores en Frontend para DB**: Se determinó que los registros de base de datos devueltos por la API de Django (descripciones e ítems) venían hardcodeados en español desde la base de datos sqlite. En lugar de modificar la base de datos y complicar la sincronización en producción, se implementó en `RestaurantDetails.tsx` un lookup dinámico: si `t('restaurantDetail.descriptions.' + name)` difiere del literal de la clave, se renderiza la traducción; de lo contrario, se realiza un fallback seguro al contenido original de la base de datos.
2.  **Typewriter Hook Reactivo**: El custom hook `useTypewriter` se re-inicializaba únicamente bajo `replayKey` (evento de viewport scroll). Se añadió `lang` (idioma activo) como dependencia de su `useEffect` para forzar el re-renderizado instantáneo de la animación al pinchar en las banderas del menú.
3.  **Extracción de Accesibilidad**: Se localizaron claves de accesibilidad (`aria-label`) críticas en `RestaurantCard.tsx` (para el guardado de favoritos) y modales que no estaban previamente expuestos al diccionario inglés.

## Riesgos
*   **Actualizaciones de Semilla (Seed)**: Si en el futuro se modifican los nombres de los restaurantes en la base de datos de producción (`seed.py`), las descripciones de la pestaña "About" y "Menu" podrían volver a mostrarse en español si no se agregan las nuevas claves en los JSONs. Se mitigó garantizando un fallback automático a la descripción original de la base de datos.
*   **Rendimiento**: El mapeo de traducciones es extremadamente eficiente debido a que las búsquedas en diccionarios JSON en JS ocurren en tiempo constante $O(1)$.

## Notas adicionales
*   Suite completa de Vitest verificada (`28 de 28 tests exitosos`).
*   Entorno local validado y en funcionamiento en `http://localhost:5173`.
