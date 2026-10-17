# Bitácora de MiAppPersonal

**Última actualización:** 16 de octubre de 2026
**Ubicación del proyecto:** `C:\MiAppPersonal`
**Rama registrada en la conversación:** `master`

## Propósito del proyecto

MiAppPersonal es una aplicación web personal instalable (PWA) para organizar información y actividades, incluyendo una Agenda con fechas importantes. El proyecto está escrito principalmente en JavaScript, HTML y CSS, usa Firebase para la configuración de la aplicación y está incorporando notificaciones push.

## Configuración y arquitectura conocida

- `index.html`: estructura y vistas/interfaz principal.
- `app.js`: lógica de la aplicación, tareas, fechas importantes, Agenda y búsqueda.
- `estilos.css`: estilos de la interfaz.
- `manifest.json`: metadatos de instalación de la PWA.
- `service-worker.js`: service worker, Firebase Messaging en segundo plano y una notificación de prueba solicitada desde la página.
- `firebase-config.js`: inicialización del SDK de Firebase para el cliente.
- `Icono.png`: icono utilizado por la PWA y las notificaciones.

Los archivos anteriores estaban presentes al revisar `C:\MiAppPersonal` el 11/10/2026. No se detectó un archivo de bitácora existente con el nombre previsto. Esta bitácora no contiene credenciales nuevas; evita copiar valores de configuración sensibles.

## Hitos confirmados

### Búsqueda de fechas en Agenda

- El último commit reportado es `e10a159` — **Corregir busqueda global de fechas en Agenda** (11/10/2026).
- El resumen del commit indica cambios en `app.js` e `index.html` (22 inserciones y 12 eliminaciones).
- En la conversación se reportó el árbol de trabajo limpio después del commit.
- La conversación indica que se hizo la corrección y se ejecutaron pruebas. No quedó disponible en el contexto consultado el detalle de los casos ni su salida; confirmar los casos específicos al retomarlos, sin asumir cobertura adicional.

### Notificaciones push

- La implementación/progreso se ha seguido con la numeración del proyecto hasta **12H.23.5.5**.
- **12H.23.5.6** quedó implementado y validado manualmente en computadora: la alerta apareció y no se repitió durante el minuto de observación.
- **12H.23.5.7** quedó implementado y validado manualmente con resultado exitoso, según reporte de la persona usuaria.
- El código revisado incluye carga de Firebase App y Messaging compat en el service worker, registro de `onBackgroundMessage`, y un mensaje `PRUEBA_NOTIFICACION` que invoca `showNotification`. Esto demuestra infraestructura/código de notificación de prueba, pero por sí solo no confirma el flujo push completo en un dispositivo o navegador.

## Estado de Git y respaldo

- Commit base antes de los avances recientes: `e10a159` — **Corregir busqueda global de fechas en Agenda**.
- El respaldo previo fue `4f74a73` — **Completar recordatorios y documentar avance 12H.23.5.7**.
- Ese commit se publicó en GitHub en la rama `backup/2026-10-11-12H-23-5-7`; la rama remota `main` se dejó intacta porque tiene un historial independiente.
- El cambio de 12H.23.5.8 se guardó en `11cb13b` — **Abrir Agenda al tocar una notificacion** y se publicó en `backup/2026-10-11-12H-23-5-8`.
- El 12/10/2026, GitHub Pages se cambió de `main` a `backup/2026-10-11-12H-23-5-8` (carpeta raíz). La publicación automática terminó correctamente en la ejecución `38245762860`; `main` no se modificó.
- Verificación del sitio publicado: `app.js` y `service-worker.js` respondieron HTTP 200 y contienen el destino `abrir=agenda` y el manejador `notificationclick`.

## Pendientes conocidos

1. Definir y numerar la siguiente actividad después de completar 12H.23.5.8, conservando el contexto disponible.
2. Registrar cada cambio con su punto numerado, qué se hizo y cómo se verificó; diferenciar trabajo completado de trabajo pendiente.
3. Confirmar y documentar los casos concretos de pruebas de la búsqueda global de fechas de Agenda si hace falta continuar esa parte.
4. Seguir validando el flujo de notificaciones push; distinguir la notificación local/de prueba del envío y recepción push reales en segundo plano.
5. Mantener los siguientes respaldos en ramas nuevas; no modificar `main` hasta resolver el historial independiente.

## Reglas para continuar

- Trabajar en `C:\MiAppPersonal`; conservar los archivos del proyecto y revisar el estado antes de modificar.
- Seguir la numeración vigente, sin añadir subpasos ni marcar puntos completos sin contexto o verificación.
- Avanzar paso a paso y explicar en español claro qué archivo se toca, qué cambio se realiza y cómo comprobarlo. La persona usuaria prefiere instrucciones adecuadas para alguien que está aprendiendo.
- Al cerrar cada paso, actualizar esta bitácora con fecha, resultado, pruebas realmente ejecutadas, commit si existe y siguiente paso confirmado.
- Respaldar los cambios en la rama de respaldo de GitHub después de validar el punto; no forzar actualizaciones sobre `main`.

## Registro de continuación

| Fecha | Punto | Resultado | Verificación / siguiente paso |
|---|---|---|---|
| 11/10/2026 | Creación de bitácora | Documento inicial creado a partir del contexto disponible. | Recuperar criterios exactos de 12H.23.5.6 y continuar el desarrollo. |

## Avance 12H.23.5.6 — Notificación de recordatorio de fecha

**Fecha:** 11/10/2026

- Se conectó la revisión de recordatorios con `ServiceWorkerRegistration.showNotification()`.
- La comprobación corre al iniciar la aplicación y después cada minuto.
- La alerta solo se intenta mostrar cuando el navegador concede permiso y el Service Worker está disponible.
- El recordatorio se marca como procesado después de que el navegador acepta mostrarlo; si falla, queda pendiente para volver a intentarlo.
- Se agregó una protección temporal contra ejecuciones simultáneas del mismo recordatorio.
- No se ejecutaron pruebas automatizadas. Prueba manual en computadora: la notificación apareció y no se repitió durante el minuto de observación. **12H.23.5.6 queda validado manualmente con la aplicación abierta.** El escenario sin permiso no se probó.
- El alcance probado aquí es con MiAppPersonal abierta; la programación con la aplicación cerrada sigue pendiente de un servicio de backend.

### Siguiente acción

12H.23.5.7 se completó y validó manualmente; ver el registro siguiente.
## Avance 12H.23.5.7 — Calcular recordatorios para eventos de hoy

**Fecha:** 11/10/2026

- Se ajustó `obtenerMomentoRecordatorio()` para usar la ocurrencia de este año cuando el evento cae hoy y su hora aún no ha pasado.
- El cambio es local al cálculo del recordatorio; `obtenerProximaFecha()` y las funciones visuales de la Agenda no se modificaron.
- Prueba manual en computadora reportada exitosa por la persona usuaria con una fecha de hoy y aviso de 5 minutos. No se ejecutaron pruebas automatizadas.

## Avance 12H.23.5.8 — Abrir Agenda al tocar una notificación

**Fecha:** 11/10/2026

- Las notificaciones de recordatorio y de prueba ahora incluyen un destino a la Agenda.
- Se agregó al Service Worker la acción de toque: enfoca una ventana MiAppPersonal existente y le solicita abrir la Agenda; si no hay ventana, abre `index.html` directamente en esa sección.
- `app.js` atiende el mensaje del Service Worker y también reconoce el parámetro de destino al iniciar la app.
- Revisión estática del diff completada; `git diff --check` no reportó errores de formato. No se ejecutaron pruebas automatizadas.
- La persona usuaria reportó que la prueba manual en computadora fue exitosa. El detalle de los escenarios exactos no quedó especificado.
- El 12/10/2026, la persona usuaria informó que la prueba en el teléfono fue exitosa: al tocar la notificación, MiAppPersonal regresó a la Agenda.
- **12H.23.5.8 queda validado manualmente en computadora y teléfono según los reportes de la persona usuaria.**
- Commit: `11cb13b` — **Abrir Agenda al tocar una notificacion**. Respaldo en GitHub: `backup/2026-10-11-12H-23-5-8`; `main` sigue intacta.
- Publicado el 12/10/2026 en la misma rama de Pages; la página pública sirve los archivos actualizados. La actualización y el toque de notificación quedaron validados en el celular.
## Acuerdos para la siguiente etapa — cuentas y módulos

**Fecha:** 12/10/2026
**Estado:** Requisitos acordados.

La persona usuaria confirmó que MiAppPersonal debe contemplar dos cuentas —una para Kike y otra para su esposa— y permitir compartir selectivamente fechas de Agenda y actividades. La información debe sincronizarse entre computadora y teléfonos; cada elemento será privado hasta que su propietario decida compartirlo. Al compartirlo, ambas personas podrán verlo y editarlo.

### Orden de trabajo acordado

1. Preparar las cuentas y la estructura de datos compartidos con privacidad por elemento.
2. Terminar el módulo Agenda.
3. Completar Tareas, incluida una ventana emergente para crear y editar, siguiendo como referencia la ventana de edición de fechas de Agenda.
4. Desarrollar los módulos pendientes: ¿Qué aprendí?, Finanzas, Entrenamiento, Objetivos, ¿En qué se me fue el tiempo? y Proyectos.
5. Validar con ambas cuentas y dispositivos.
6. Dejar las notificaciones en segundo plano y la configuración de facturación para el final.

Al cierre del 12/10/2026 aún no se asignaba un nuevo subpaso. El 13/10/2026 se inició 12H.23.5.9 sin inventar una subsección no confirmada.

## Acuerdo de visión futura — Juny y MiAppPersonal

**Fecha:** 13/10/2026
**Estado:** Visión futura; no implementar todavía.

- No crear ahora un módulo conversacional “Juny” dentro de MiAppPersonal. Kike desea continuar usando a Juny desde ChatGPT.
- Después de terminar los módulos principales y respaldar el proyecto en GitHub, se podrá estudiar una conexión para consultar información autorizada de MiAppPersonal desde ChatGPT. No existe actualmente esa conexión ni se acordó compartir contraseñas.
- Antes de implementarla se revisarán seguridad, permisos, disponibilidad y costos, evitando afectar las funciones que ya operan.
- Noticias, búsqueda de regalos, voz y otras ideas se comentaron como posibilidades; no se acordó incorporarlas todavía.

## 12H.23.5.9 — Preparar cuentas y base de datos compartida

**Inicio:** 13/10/2026
**Estado:** En curso. Las dos cuentas y la base Firestore fueron preparadas manualmente; las reglas locales pasaron siete pruebas en emulador el 15/10/2026. La aplicación aún no sincroniza Agenda ni Tareas y las reglas no están publicadas.

- El modelo local de `firestore.rules` contempla propietario, módulo, contenido, fechas de creación/actualización y destinatario compartido opcional. Un registro sin destinatario es privado; la pareja autorizada puede leer y editar el elemento compartido. El modelo actual limita el uso compartido a una cuenta adicional.
- `index.html`, `estilos.css` y `cuenta.js` ofrecen registro, inicio de sesión, recuperación de contraseña y cierre de sesión. La interfaz aclara que Agenda y Tareas siguen en el dispositivo y que iniciar sesión no sincroniza ni migra datos.
- Las contraseñas se gestionan mediante Firebase Authentication y no se guardan en el almacenamiento local de la aplicación.
- El 13/10/2026 Kike confirmó que el proveedor Correo electrónico/contraseña estaba habilitado y que `127.0.0.1` aparecía como dominio autorizado. El 14/10/2026 reportó éxito al crear e iniciar sesión con su cuenta y al iniciar sesión con la cuenta de su esposa.
- El 14/10/2026 se creó Cloud Firestore en `northamerica-south1` (Querétaro), conforme a la ubicación elegida por Kike. Las copias de seguridad programadas se dejaron desactivadas para posponer costos.
- Kike confirmó que Firebase Console tenía la regla `allow read, write: if false`. La base real mantiene el acceso bloqueado; las reglas locales no se han publicado. No se migraron datos ni se configuró facturación.

### Progreso del flujo de invitación

Se preparó localmente un borrador en ambos sentidos: cualquiera de las dos cuentas puede generar un código y la otra cuenta debe aceptarlo desde su propia sesión. Vincular las cuentas no comparte automáticamente Agenda ni Tareas.

- Cambios del flujo: `index.html`, `estilos.css`, `cuenta.js`, `vinculo.js` y `firestore.rules`.
- Se agregaron controles para generar, copiar, aceptar y cancelar una invitación, además de revocar una vinculación activa.
- Las reglas locales permiten el flujo de invitación y el futuro modelo de registros privados/compartidos. **No están publicadas en Firebase Console.**
- Todavía falta la interfaz para seleccionar qué fecha o tarea se comparte; la aplicación tampoco está conectada a Firestore.
- No se probó la interfaz de invitación con cuentas reales; las pruebas actuales son simuladas con cuentas de prueba en el emulador.

## 12H.23.5.9.1 — Validar consultas filtradas de Agenda y Tareas

**Fecha:** 15/10/2026
**Estado:** Completado en el emulador local; 7/7 pruebas pasaron.

- Se confirmó que Agenda y Tareas aún guardan sus datos en `localStorage`; las consultas a Firestore son un diseño futuro, no una integración ya realizada.
- Se probaron consultas de registros propios filtradas por `ownerUid` y `module`, y de registros compartidos filtradas por `ownerUid`, `pairId`, `module` y la lista exacta `sharedWithUids` de la pareja.
- La lista exacta corresponde al modelo acordado, que permite compartir cada elemento con una sola cuenta adicional. Las reglas de Firestore no funcionan como filtros de resultados.
- Se agregó `firestore.indexes.json` con índices compuestos propuestos y se asoció desde `firebase.json`. Los índices aún no se publicaron ni se validaron en la base real.
- Se probaron siete casos: acceso anónimo denegado; invitaciones A→B y B→A; consultas de invitaciones del emisor y receptor; consultas filtradas de Agenda y Tareas; privacidad de registros propios; lectura/edición de registros compartidos y protección de sus permisos; y revocación del vínculo con pérdida de acceso. **Las siete pruebas pasaron.** El mensaje `PERMISSION_DENIED` de la prueba que intenta modificar permisos fue esperado.
- El emulador usó el proyecto de demostración `demo-miapppersonal-rules`, no la base real. Se prepararon `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` y `tests/firestore-rules.test.js`. Java 21 portátil quedó en el perfil local de Windows, sin instalación global; pnpm aprobó los scripts de preparación únicamente para `@firebase/util`, `protobufjs` y `re2`.
- No se hizo commit ni push.

### 12H.23.5.9.31 — Validar repetición de Pagos pendientes — completado — 17/10/2026

La validación manual de repetición quedó documentada arriba: se comprobó fecha límite inclusiva, marcación independiente de ocurrencias y conservación tras recargar. El registro de QA permanece para la limpieza general al final.

### 12H.23.5.9.32 — Implementación de sincronización de Entrenamiento y Proyectos — implementada; validación manual confirmada por Kike — 17/10/2026

- Se agregaron `entrenamiento-cloud.js` y `proyectos-cloud.js` para sincronizar en tiempo real los documentos propios y los compartidos de cada módulo mediante Firestore.
- Al iniciar sesión, los registros nuevos se guardan privados en la cuenta. Compartir es una decisión explícita; los registros que ya existían en el dispositivo no se migran solos. Si se abre un registro local y se marca compartir, se copia a la cuenta y queda vinculado a la sincronización.
- Las dos cuentas pueden ver y editar registros compartidos; solo quien los creó puede eliminarlos. En Entrenamiento también se sincronizan repetición, fecha límite y checks por ocurrencia. En Proyectos se sincronizan proyecto, ramas, subramas, porcentajes, estado y progreso.
- Las vistas usan los datos locales junto con los de la cuenta. Se añadieron los controles de compartir y mensajes de estado a los formularios, los nuevos módulos a `index.html` y la identificación de Entrenamiento y Proyectos en los mensajes de cuenta.
- Finanzas permanece local, según lo acordado. Las reglas de Firestore ya incluyen ambos módulos y los índices genéricos cubren las consultas; no se modificaron ni se publicaron reglas en este paso.
- No se movieron registros locales, no se crearon datos de QA, no se hizo commit ni push. Kike confirmó que probó ambos campos con las cuentas vinculadas; el alcance reportado se registra en 12H.23.5.9.32.1.

### 12H.23.5.9.32.1 — Validar sincronización de Entrenamiento y Proyectos — confirmado por Kike — 17/10/2026

Kike confirmó que probó por separado la privacidad, edición y eliminación en Entrenamiento y Proyectos, y que las pruebas funcionaron. También había confirmado la vinculación de cuentas. No se registró aquí el resultado separado de repetición/checks ni de la prueba en celular. No se hizo commit ni push.

### 12H.23.5.9.33 — Ajuste del alcance de sincronización — 17/10/2026

Kike decidió que no desea sincronizar otros módulos. La sincronización queda limitada a los módulos ya conectados, incluido Entrenamiento y Proyectos; Finanzas permanece local. La implementación de sincronización de Objetivos, que se había preparado pero no validado ni usado, se retiró y el módulo vuelve a conservar su comportamiento local. No se crearon datos de Objetivos en Firestore ni se tocaron datos existentes. No se hizo commit ni push.

### Siguiente actividad

La validación pendiente de Objetivos se cancela. No se implementará sincronización en otros módulos.

**12H.23.5.9.34 — Publicar la versión actual en GitHub Pages y validar en el celular.** Kike aceptó continuar con esta actividad. La publicación debe ir a `backup/2026-10-11-12H-23-5-8`; `main` permanece intacta. Kike confirmó que la versión llegó al teléfono; observó tamaños pequeños en Proyectos y Resultados, atendidos en 12H.23.5.9.35. Finanzas permanece local y no se sincronizan módulos adicionales.
### 12H.23.5.9.35 — Mejorar lectura móvil de Proyectos y Resultados — publicado; validación manual pendiente — 17/10/2026

- Se ajustó la barra lateral y el ancho disponible para el contenido en teléfonos.
- Las ramas y subramas de Proyectos conservan un ancho legible y pueden recorrerse horizontalmente; checks, selectores y porcentajes tienen controles más cómodos al tacto.
- Los campos de Resultados acomodan controles, tarjetas y gráficos en el ancho disponible, con texto más legible y sin desbordar sus contenedores.
- Se revisó el formato del cambio (`git diff --check`); no se ejecutaron pruebas automatizadas ni se confirmó aún la apariencia final en el teléfono.
- Commit `4826556` — **Mejorar vista móvil de módulos y resultados**. Publicado en `backup/2026-10-11-12H-23-5-8`; `main` sigue intacta.
- Siguiente paso: recargar la app en el teléfono y confirmar la vista de Proyectos y los Resultados que antes se veían pequeños.
### 12H.23.5.9.36 — Menú lateral desplegable en celular — implementado; validación manual pendiente — 17/10/2026

- En pantallas de hasta 560 px, la barra de navegación se oculta y se abre con el botón «Menú».
- Al elegir una sección, tocar el fondo oscuro o presionar Escape, el menú se cierra. La barra lateral de escritorio conserva su comportamiento.
- Se añadieron el botón, el fondo de cierre, los estados accesibles del control y los estilos móviles. No se cambiaron datos de la aplicación.
- Revisión de formato con `git diff --check`; no se ejecutaron pruebas automatizadas ni se ha validado manualmente en el celular.
- Siguiente paso: publicar en la rama `backup/2026-10-11-12H-23-5-8` y probar abrir/cerrar el menú y seleccionar una sección desde el teléfono.

### 12H.23.5.9.37 — Forzar actualización del menú en celular — publicado; validación pendiente — 17/10/2026

- Kike reportó que el botón «Menú» aparecía, pero no respondía y la barra seguía visible. El comportamiento es consistente con que el teléfono conservara los archivos CSS y JavaScript anteriores.
- Se agregaron versiones en las referencias de `estilos.css` y `app.js` para que la app solicite archivos nuevos después de actualizarse. No se borraron datos ni se cambió la lógica del menú.
- Se revisó el diff y `git diff --check`; no se ejecutaron pruebas automatizadas ni se pudo confirmar aún en el teléfono.
- Siguiente paso: publicar y pedir a Kike que cierre y reabra la app con internet para comprobar el botón y el cierre de la barra.
