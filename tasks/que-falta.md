**2:26 p.m.**

que nos falta realmente para tener la web / servicio listo?

**2:28 p.m.**

**Procesado durante 4m**

Sí:  **para demo/TFG está muy cerca** . Para “servicio real en producción”, aún faltan unas cuantas piezas operativas y de honestidad de producto.

Checks que acabo de contrastar:

* **npm run lint**: OK
* **python backend/manage.py check --deploy**: OK con env de producción razonable
* Ya venían OK: backend tests, frontend tests y build
* La rama actual es **owner-reservation-attendance**; el deploy solo salta desde **main**

**Falta Imprescindible**

1. **Integrar lo último en **main****
   Lo de asistencia/no-show está en **owner-reservation-attendance**. Hasta merge/push a **main**, no entra en producción.
2. **Cerrar **.env** de producción**
   El código exige **SECRET_KEY** y **FIELD_ENCRYPTION_KEY** en prod, pero **backend/.env.example (line 1)** está incompleto. Hay que documentar/configurar:
   FIELD_ENCRYPTION_KEY, **DB_PATH** o **DATABASE_URL**, **REDIS_URL**, **GOOGLE_CLIENT_ID**, **STAFF_OWNER_EMAIL**, **FRONTEND_URL**, SMTP/email, CORS/CSRF.
3. **Asegurar persistencia de BD**
   Si usáis SQLite en Hetzner, **DB_PATH=/data/db.sqlite3** es obligatorio. Si no, al recrear contenedor se puede perder la BD. Para servicio real, mejor PostgreSQL.
4. **Conectar notificaciones reales**
   Backend y API existen, pero **NotificationsMenu.tsx (line 11)** sigue usando datos hardcodeados. Esto canta como mock.
5. **Conectar plano del owner a datos reales**
   En **OwnerDashboard.tsx (line 11)** el plano de sala sigue hardcodeado. Para un restaurante real, debe usar **/restaurants/:id/tables/**.
6. **Quitar o implementar promesas no reales**
   La home habla de “pre pedido”, “pre-pago”, “lista de espera”, etc. Si no existen, mejor quitarlo del copy antes de enseñar la web como servicio.

**Para Estar Tranquilos**

* Hacer smoke test manual en servidor: registro, login, reserva, cancelar, owner login, marcar llegada/no-show, favoritos, chat.
* Configurar SMTP si queréis recuperación de contraseña real.
* Configurar Google OAuth con dominio real.
* Añadir backup/restore probado de la BD.
* Revisar deploy: el input **image_tag** del workflow no parece afectar al **docker-compose.prod.yml**, así que el rollback manual está a medias.
* Actualizar docs obsoletos: todavía hay referencias a Anthropic/Claude/Leaflet en documentación.

Mi lectura honesta:  **1 día para dejarlo presentable y desplegable** , si aceptamos algunos mocks menores;  **3-5 días para dejarlo sólido como MVP público** ; **1-2 semanas** si quieres que sea “servicio real” con datos reales en todo, backups, E2E y operación decente.
