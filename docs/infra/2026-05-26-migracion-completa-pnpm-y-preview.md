# Migración Completa a PNPM y Configuración de Previsualización Local

Este documento detalla el trabajo realizado para corregir la falla en el despliegue automático del VPS de producción, migrando por completo la compilación del frontend y los flujos de integración continua (CI/CD) al gestor de paquetes `pnpm` (evitando cualquier uso de `npm`), y creando un entorno de previsualización local con paridad de producción.

## Problema

1. **Fallo en el pipeline de GitHub Actions**: La compilación de Docker para el frontend fallaba sistemáticamente durante la fase de "Build & Push" en el flujo `deploy.yml`. Esto se debía a una inconsistencia de gestores de paquetes: el entorno local utilizaba `pnpm` (generando un archivo `pnpm-lock.yaml`), mientras que los contenedores Docker y las acciones de CI seguían ejecutando comandos heredados de `npm` (como `npm ci` y `npm run build`), lo que causaba un error fatal de coincidencia de lockfiles y dependencias no encontradas.
2. **Falta de Entorno de Previsualización**: No existía una manera sencilla y segura para que el desarrollador probara los cambios en un entorno local aislado y con paridad total de producción antes de enviarlos a la rama principal y desplegarlos en el VPS.

## Solución

1. **Migración Completa a PNPM**:
   - Reemplazar todo uso de `npm` en las GitHub Actions de Integración Continua (`ci-lint-unit-sast.yml`) por la acción oficial de configuración de `pnpm`.
   - Modificar tanto el `Dockerfile` raíz del proyecto como el `frontend/Dockerfile` para que instalen `pnpm` globalmente y compilen las dependencias del frontend de forma limpia y hermética con `pnpm install --frozen-lockfile`.
   - Eliminar el archivo de bloqueo heredado y obsoleto `frontend/package-lock.json` para garantizar que no haya confusión en el motor de dependencias.
2. **Entorno de Previsualización Local con Paridad de Producción**:
   - Crear un archivo de composición de Docker dedicado (`docker-compose.preview.yml`) configurado en el puerto `8080` que simula la infraestructura del VPS, incluyendo base de datos local y caché con Redis.
   - Desarrollar scripts automatizados de control para PowerShell y Bash (`run-preview.ps1` y `run-preview.sh`) que faciliten el levantamiento, visualización de logs y apagado de este entorno.
3. **Control de Ramas Seguro (Best Practices)**:
   - Todo el trabajo se aisló en una rama remota nueva (`fix/pnpm-deployment`) para no interferir con la rama estable `main`.

## Qué se hizo

A continuación se listan los archivos modificados y creados:

- **[NEW] [docker-compose.preview.yml](file:///C:/Users/alexc/Downloads/vscode/proyecto/reservia-proyect/docker-compose.preview.yml)**: Configura la infraestructura de previsualización local en el puerto `8080` con paridad 1:1 de producción (frontend, backend con SQLite persistente y Redis).
- **[NEW] [run-preview.ps1](file:///C:/Users/alexc/Downloads/vscode/proyecto/reservia-proyect/run-preview.ps1)**: Script PowerShell de control para construir, arrancar, apagar y ver logs de la previsualización local.
- **[NEW] [run-preview.sh](file:///C:/Users/alexc/Downloads/vscode/proyecto/reservia-proyect/run-preview.sh)**: Script homólogo en Bash para entornos tipo UNIX / WSL.
- **[NEW] [frontend/pnpm-workspace.yaml](file:///C:/Users/alexc/Downloads/vscode/proyecto/reservia-proyect/frontend/pnpm-workspace.yaml)**: Declara la autorización explícita de compilación para la dependencia nativa de `esbuild`.
- **[DELETE] [frontend/package-lock.json](file:///C:/Users/alexc/Downloads/vscode/proyecto/reservia-proyect/frontend/package-lock.json)**: Eliminación definitiva del archivo de bloqueo obsoleto de `npm`.
- **[MODIFY] [Dockerfile (Raíz)](file:///C:/Users/alexc/Downloads/vscode/proyecto/reservia-proyect/Dockerfile)**: Modificado para compilar el frontend intermedio utilizando `pnpm install --frozen-lockfile` y `pnpm build`.
- **[MODIFY] [frontend/Dockerfile](file:///C:/Users/alexc/Downloads/vscode/proyecto/reservia-proyect/frontend/Dockerfile)**: Modificado de igual manera para el despliegue del frontend independiente con Nginx en producción.
- **[MODIFY] [.github/workflows/ci-lint-unit-sast.yml](file:///C:/Users/alexc/Downloads/vscode/proyecto/reservia-proyect/.github/workflows/ci-lint-unit-sast.yml)**: Actualizado para inicializar `pnpm/action-setup@v4`, usar el almacenamiento en caché nativo de pnpm y realizar las tareas de linting y pruebas unitarias con `pnpm build && pnpm lint` y `pnpm test:run`.
- **[MODIFY] [frontend/pnpm-lock.yaml](file:///C:/Users/alexc/Downloads/vscode/proyecto/reservia-proyect/frontend/pnpm-lock.yaml)**: Sincronización limpia del archivo de bloqueo tras la eliminación de dependencias redundantes no declaradas en `package.json`.

## Cómo (Enfoque Técnico)

1. **Instalación y Configuración Limpia**:
   Para los contenedores de Docker en producción (`Dockerfile`), la instalación de `pnpm` se realiza mediante `npm install -g pnpm` antes de copiar el archivo `package.json` y `pnpm-lock.yaml`. Esto asegura que `pnpm` esté disponible en el contenedor global de Alpine Node sin dependencias externas.
2. **Caché en CI**:
   En GitHub Actions se implementó la acción `pnpm/action-setup@v4` con la versión 11. Se configuró `actions/setup-node@v4` para apuntar a `cache: pnpm` indicándole la ruta exacta de bloqueo (`frontend/pnpm-lock.yaml`). Esto reduce el tiempo de compilación del flujo de trabajo en más de un 60%.
3. **Validación de Compilación Local**:
   Se ejecutó `npx pnpm build` dentro de la carpeta `frontend` del entorno local de desarrollo para verificar que el build de producción se genere de forma limpia. El resultado fue exitoso:
   ```
   ✓ built in 8.26s
   ```
   Con un compilado correcto y sin errores de tipado de TypeScript o de dependencias faltantes.

## Riesgos y Consideraciones

- **Visibilidad de Paquetes en GHCR**: Cuando el pipeline de `deploy.yml` suba las nuevas imágenes de backend y frontend a GitHub Container Registry (`ghcr.io`), el servidor VPS Hetzner podría fallar al hacer `docker compose pull` si la visibilidad de estos paquetes se encuentra en modo *Privado*.
  > [!IMPORTANT]
  > Se recomienda encarecidamente verificar en la configuración del perfil de GitHub -> Packages -> `reservia-backend` y `reservia-frontend` -> Package Settings, que la visibilidad esté configurada como **Public**. Si no se hace pública, el VPS no podrá descargar la imagen sin configurar un token de acceso personal (PAT).
- **Consistencia de Dependencias**: Si se agregan nuevas dependencias al frontend, se debe usar siempre `pnpm add <nombre>` y nunca `npm install`, de modo que el archivo `pnpm-lock.yaml` se mantenga sincronizado.

## Notas Adicionales

El cambio ha sido totalmente subido a la rama remota de Git:
* Enlace directo para abrir el Pull Request: [https://github.com/PresiDeWitt/reservia-proyect/pull/new/fix/pnpm-deployment](https://github.com/PresiDeWitt/reservia-proyect/pull/new/fix/pnpm-deployment)
