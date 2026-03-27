---
tags: [reservia, frontend, i18n, internationalization, translations]
---

# Internationalization (i18n)

[[Home|← Volver al Home]]

## Overview

Reservia soporta **inglés (en)** y **español (es)** usando **i18next** con detección automática del idioma del browser.

---

## 📦 Librerías

| Librería | Versión | Uso |
|---------|---------|-----|
| `i18next` | 25.8.0 | Motor de traducciones |
| `react-i18next` | 16.5.3 | Integración con React |

---

## ⚙️ Configuración

**Archivo**: `frontend/src/i18n/config.ts`

```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import es from './es.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: navigator.language.startsWith('es') ? 'es' : 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })
```

> [!info] Detección de idioma
> Se usa `navigator.language` para detectar el idioma del browser. Si comienza con `es`, usa español; en cualquier otro caso, usa inglés.

---

## 📁 Archivos de Traducción

**Directorio**: `frontend/src/i18n/`

- `en.json` — Inglés
- `es.json` — Español

---

## 🔑 Namespaces de Traducción

| Namespace | Descripción |
|-----------|-------------|
| `header` | Navegación y header |
| `hero` | Sección hero del home |
| `home` | Página principal |
| `restaurant` | Página de detalle de restaurante |
| `footer` | Pie de página |
| `auth` | Modal de login/registro |
| `bookings` | Página de mis reservas |
| `cuisines` | Nombres de tipos de cocina |
| `floorPlan` | Editor y selector de planos |
| `chat` | Chatbot UI |

---

## 🍽️ Cocinas Traducidas

Las cocinas se traducen de inglés a español:

| Inglés | Español |
|--------|---------|
| Italian | Italiana |
| Japanese | Japonesa |
| Steakhouse | Parrilla |
| Fusion | Fusión |
| Healthy | Saludable |
| French | Francesa |
| Mexican | Mexicana |
| Burgers | Hamburguesas |
| Bakery | Panadería |
| Asian | Asiática |
| Sushi | Sushi |

---

## 💻 Uso en Componentes

```typescript
import { useTranslation } from 'react-i18next'

const MyComponent = () => {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
      <button>{t('auth.login')}</button>
    </div>
  )
}
```

### Con interpolación de variables

```typescript
// Ejemplo de traducción con variable
t('restaurant.guestsCount', { count: 2 })
// → "2 guests" (EN) / "2 comensales" (ES)
```

---

## 🤖 Chatbot y Multiidioma

El chatbot IA también detecta el idioma del usuario automáticamente. Claude responde en el mismo idioma que el usuario escribe, independiente del idioma configurado en la UI.

Ver [[AI Chat Integration]] para más detalles.

---

## 🔗 Links Relacionados

- [[Tech Stack]] — Versiones de i18next
- [[AI Chat Integration]] — El chatbot también es multiidioma
