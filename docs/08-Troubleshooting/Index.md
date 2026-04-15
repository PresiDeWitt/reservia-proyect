---
tags:
  - reservia
  - troubleshooting
  - moc
---

# 🩺 Troubleshooting & Decisiones Técnicas

[[Home|← Volver al Home]]

> [!abstract] 📖 Qué encontrarás aquí
> Bitácora de problemas reales que aparecieron durante el desarrollo, sus
> soluciones aplicadas, alternativas descartadas y riesgos pendientes.
> Cada entrada sigue la misma estructura: **Síntoma → Causa raíz → Fix →
> Riesgos → Lecciones**.

---

## 📚 Entradas

> [!note] 🗂️ Bitácora
>
> | Fecha       | Tema                                                 | Área              |
> |-------------|------------------------------------------------------|-------------------|
> | 2026-04-15  | [[Auth Redesign & Proxy Fix]]                        | Auth · Frontend · Infra |

---

## ✍️ Cómo añadir una entrada nueva

> [!tip] 📝 Plantilla sugerida
>
> 1. Crea un archivo `docs/08-Troubleshooting/<Título Corto>.md`.
> 2. Usa frontmatter con `tags: [reservia, troubleshooting, <área>]`.
> 3. Secciones mínimas:
>    - **Resumen** — qué pasó, en una frase
>    - **Síntoma** — qué veía el usuario/dev
>    - **Investigación** — comandos y pistas
>    - **Causa raíz** — la razón real
>    - **Solución** — el fix aplicado
>    - **Alternativas descartadas** — y por qué
>    - **Riesgos / deuda técnica** — lo que queda pendiente
>    - **Lecciones aprendidas** — para no repetirlo
> 4. Añade la entrada a la tabla de arriba.
> 5. Enlaza referencias cruzadas a otros docs con `[[wiki-links]]`.
