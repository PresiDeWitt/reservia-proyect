# Reducción de espaciado y compactación de la interfaz de Registro en AuthModal

## Problema
En la pantalla de Registro de usuarios (`Register` dentro del `AuthModal`), existía un exceso de espaciado vertical entre los elementos del formulario (gaps y paddings amplios). Dado que el formulario de Registro tiene muchos más campos y elementos que el de Inicio de sesión (Nombre, Apellidos, Teléfono, Tipo de cuenta, Email, Contraseña), el formulario se extendía demasiado verticalmente. Esto provocaba una apariencia dispersa con grandes áreas en blanco y obligaba al usuario a realizar scroll innecesario en pantallas estándar.

## Solución
Se decidió compactar y optimizar de forma dinámica el diseño del panel de formulario en el `AuthModal` cuando se encuentra activo el modo `Register`. El objetivo es mantener el espaciado elegante del inicio de sesión (que tiene pocos campos), pero reducir de forma dinámica los paddings, margins, gaps y la altura de los campos a un formato `compact` cuando se muestra el flujo de registro.

## Qué se hizo
- **Archivo modificado**: `frontend/src/components/AuthModal.tsx`
- **Cambios realizados**:
  1. Reducción dinámica del padding del contenedor principal (`section`) de `p-5 sm:p-8 lg:p-12` a `p-4 sm:p-6 lg:py-6 lg:px-8` cuando `isRegister` es verdadero.
  2. Reducción dinámica del gap del div de animación y animación de subida (`auth-rise`) de `gap-6` a `gap-4` en modo registro.
  3. Reducción de la separación interna del formulario (`form`) de `gap-5` a `gap-3.5`.
  4. Disminución del gap de la grid de Nombre y Apellidos de `gap-4` a `gap-3`.
  5. Rediseño y compactación de la selección del tipo de cuenta (`Account Type`): se cambió la disposición vertical de los botones (icono arriba, texto abajo con padding `py-3`) por una disposición horizontal en fila más limpia e integrada (`flex-row items-center justify-center gap-2 py-2.5`) con iconos un poco más pequeños (de `20px` a `18px`).
  6. Se extendió la interfaz `FloatFieldProps` para recibir un booleano opcional `compact`.
  7. Se adaptó el componente `FloatField` para que, al activarse `compact`, disminuya su altura de `h-14` a `h-12`, reduzca los paddings internos de la etiqueta flotante y el input, y use fuentes ligeramente más pequeñas de forma adaptativa.
  8. Se aplicó `compact={isRegister}` a todos los campos del formulario.
  9. Se ajustó dinámicamente la altura y radio de borde del botón principal de acción para pasar de `h-14 rounded-2xl` a `h-12 rounded-xl` en el flujo de registro.

## Cómo
1. Se analizaron las proporciones del layout y se detectó que el espaciado fijo e incondicional de Tailwind (especialmente los gaps grandes de 20-24px y los paddings de 48px en resoluciones de escritorio) eran los causantes de la dispersión visual del formulario.
2. Se introdujeron expresiones ternarias en JSX basadas en la variable `isRegister` para inyectar clases específicas de espaciado condicionado.
3. Se modificó el componente `FloatField` agregándole soporte para una variante compacta reutilizable mediante CSS adaptativo en Tailwind.
4. Se optimizó la maquetación del selector de rol (Customer / Restaurant Owner) para ahorrar más de 40px de espacio vertical alineando los iconos en horizontal con el texto.

## Riesgos
- **Ninguno detectado**. Los cambios son puramente estilísticos y adaptativos. No alteran la lógica de negocio ni la interacción con el backend.
- Se mantiene el 100% de la compatibilidad visual y accesibilidad del formulario.

## Notas adicionales
- El linter de TypeScript fue ejecutado de manera local y no arrojó errores asociados a esta modificación.
- La solución implementa un comportamiento dinámico: si el usuario regresa al modo de inicio de sesión (`Sign In`), el modal recupera su tamaño y aireado elegante estándar de manera fluida gracias a las transiciones de Framer Motion.
