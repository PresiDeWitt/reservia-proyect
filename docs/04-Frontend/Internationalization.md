---
tags:
  - reservia
  - frontend
  - i18n
---

# 🌍 Internationalization (i18n)

[[Home|← Volver al Home]]

---

## 🌐 Overview

> [!globe] Idiomas Soportados
> Reservia soporta ==dos idiomas== con detección automática del browser:
>
> | 🌐 | Idioma | Código |
> |---|--------|--------|
> | 🇬🇧 | **Inglés** | en |
> | 🇪🇸 | **Español** | es |

> [!info] Detección de Idioma
> Se usa **navigator.language** para detectar el idioma del browser. Si comienza con **es**, usa español; en cualquier otro caso, usa ==inglés como fallback==.

---

## 📦 Librerías

> [!info] Stack de i18n
> - **i18next** v25.8.0 → Motor de traducciones
> - **react-i18next** v16.5.3 → Integración con React
>
> Ver [[Tech Stack]] para más versiones.

---

## ⚙️ Configuración

> [!settings] Archivo de configuración
> **Ubicación:** ==frontend/src/i18n/config.ts==
>
> **Comportamiento:**
> - Importa los archivos de traducción **en.json** y **es.json**
> - Inicializa i18next con el plugin **initReactI18next**
> - Detecta idioma del browser automáticamente
> - Fallback a ==inglés== si el idioma no es español
> - Interpolación con **escapeValue: false**

---

## 📁 Archivos de Traducción

> [!info] Directorio: frontend/src/i18n/
> - 🇬🇧 **en.json** → Traducciones en inglés
> - 🇪🇸 **es.json** → Traducciones en español

---

## 🔑 Namespaces de Traducción

> [!list] Namespaces disponibles
> - 🧭 **header** → Navegación y header
> - 🌟 **hero** → Sección hero del home
> - 🏠 **home** → Página principal
> - 🍽️ **restaurant** → Página de detalle de restaurante
> - 📋 **footer** → Pie de página
> - 🔐 **auth** → Modal de login/registro
> - 📅 **bookings** → Página de mis reservas
> - 🏷️ **cuisines** → Nombres de tipos de cocina
> - 🗺️ **floorPlan** → Editor y selector de planos
> - 🤖 **chat** → Chatbot UI

---

## 🍽️ Cocinas Traducidas

> [!globe] Traducciones de cocinas
>
> | 🇬🇧 Inglés | 🇪🇸 Español |
> |-----------|------------|
> | Italian | Italiana |
> | Japanese | Japonesa |
> | Steakhouse | Parrilla |
> | Fusion | Fusión |
> | Healthy | Saludable |
> | French | Francesa |
> | Mexican | Mexicana |
> | Burgers | Hamburguesas |
> | Bakery | Panadería |
> | Asian | Asiática |
> | Sushi | Sushi |

---

## 💻 Uso en Componentes

> [!example] Cómo usar traducciones
> Se importa el hook **useTranslation** de react-i18next y se usa la función **t()** para acceder a las claves de traducción.
>
> **Ejemplos de claves:**
> - **t('hero.title')** → Título del hero
> - **t('hero.subtitle')** → Subtítulo del hero
> - **t('auth.login')** → Texto del botón login
>
> **Con interpolación de variables:**
> - **t('restaurant.guestsCount', { count: 2 })** → ==2 guests== (EN) / ==2 comensales== (ES)

---

## 🤖 Chatbot y Multiidioma

> [!info] IA Multiidioma
> El chatbot IA también detecta el idioma del usuario ==automáticamente==. Claude responde en el mismo idioma que el usuario escribe, independiente del idioma configurado en la UI.
>
> Ver [[AI Chat Integration]] para más detalles.

---

## 🔗 Links Relacionados

- [[Tech Stack]] — Versiones de i18next
- [[AI Chat Integration]] — El chatbot también es multiidioma
- [[Components]] — Componentes que usan traducciones
