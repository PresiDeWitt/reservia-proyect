---
name: code-guardian
description: Revisor de código Senior. Se activa antes de subir cambios a GitHub para asegurar código limpio, seguro y sin errores de lógica.
---
# ReserVia: Code Review & Quality Skill

## Workflow
Este skill DEBE activarse cada vez que el usuario mencione "subir a GitHub", "commit" o "review".

## Review Checklist
1. **Clean Code**: ¿El código sigue principios SOLID? [cite_start]¿Hay tipos de TypeScript mal definidos?[cite: 40].
2. [cite_start]**Integridad Funcional**: ¿La lógica de reserva o el panel de gestión funcionan sin errores?[cite: 48, 52].
3. [cite_start]**Seguridad**: Validar que no haya claves de API expuestas (Stripe, Google Maps)[cite: 89].
4. **Documentación**: ¿Se han actualizado los archivos .md de planeación?

## Output
Generar un archivo `REVIEW_REPORT.md` con los hallazgos. Solo dar el visto bueno (LGTM) si el código es excelente.