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

### Siguiente actividad

**12H.23.5.9.2 — Revisar y publicar las reglas e índices de Firestore, y validar el flujo de invitación con ambas cuentas.** La autorización de Kike para publicar ya fue concedida. El 16/10/2026 se publicaron con éxito las reglas e índices en el proyecto real; el flujo de invitación fue validado con las cuentas reales.

### Continuación y cierre de sesión — 15/10/2026

- Kike autorizó publicar las reglas e índices de Firestore en el proyecto `miapppersonal-5068d`, únicamente para Firestore; no se autorizó cambiar Hosting ni hacer commit/push.
- Antes de publicar se comprobó que `firebase-config.js` señala el proyecto `miapppersonal-5068d` y que `firebase.json` configura únicamente las reglas e índices de Firestore.
- La publicación no se realizó: Firebase CLI no tenía una cuenta autorizada. Se inició el acceso de CLI, pero Kike no tenía visible la terminal que esperaba el código. No compartir códigos de autorización ni contraseñas por el chat.
- El flujo de acceso temporal se cerró sin completar el inicio de sesión. No se cambió la base Firebase; las reglas de producción siguen sin publicarse y los índices siguen pendientes.
- Se abrió el panel Terminal de Codex, pero la terminal disponible estaba vacía y no era la sesión CLI pendiente.
- El punto 12H.23.5.9.2 quedó completado el 16/10/2026: reglas e índices publicados y vínculo aceptado con ambas cuentas.
- La prueba del flujo con las dos cuentas se completó el 16/10/2026; la app confirmó el vínculo activo y que ambas cuentas pueden iniciar el uso compartido. No hubo commit ni push.


### Avance 12H.23.5.9.2 — 16/10/2026

- Kike completó el inicio de sesión de Firebase CLI. El CLI reconoció la cuenta `claudiocomparan24@gmail.com`.
- Se ejecutó `firebase deploy --only firestore --project miapppersonal-5068d`; el resultado fue **Deploy complete**. El CLI confirmó que `firestore.rules` compiló correctamente y liberó las reglas a Cloud Firestore; también confirmó el despliegue de `firestore.indexes.json` en la base `(default)`.
- Se verificó la definición publicada de los dos índices compuestos para `records`. La salida de listado no confirmó explícitamente el estado `READY` de construcción; no marcarlo como verificado hasta comprobarlo en Firebase Console o mediante una consulta que los requiera.
- La publicación inicial requirió repetir el despliegue con acceso de red porque la primera llamada a `serviceusage.googleapis.com` falló en el entorno restringido. Firebase confirmó que la API de Firestore está habilitada.
- No se cambió Firebase Hosting ni se hizo commit o push.
- Completado: la sección **Vincular las dos cuentas** mostró “Cuenta vinculada” y confirmó que ambas cuentas pueden iniciar el uso compartido. Aún falta probar el acceso real a elementos compartidos y privados.


### Siguiente punto propuesto

**12H.23.5.9.3 — Conectar la Agenda a Firestore**, conservando los datos privados por defecto y permitiendo marcar cada elemento para compartirlo con la cuenta vinculada. Antes de sincronizar datos existentes, revisar una estrategia que preserve la información guardada actualmente en `localStorage`. Después validar con ambas cuentas que los elementos privados permanezcan aislados y que los compartidos se puedan ver y editar.



### Avance 12H.23.5.9.3 — 16/10/2026

- Se conectó el módulo Agenda con Cloud Firestore para cargar en tiempo real las fechas propias y las que la otra cuenta comparte con la cuenta activa.
- Las fechas nuevas se guardan como privadas por defecto. Con las cuentas vinculadas, cada fecha puede compartirse o volver a ser privada desde su edición. Ambos usuarios pueden editar una fecha compartida; solo quien la creó puede eliminarla o cambiar sus permisos.
- Las fechas que ya existían en el almacenamiento local se dejaron fuera de las cuentas. Al iniciar sesión se muestran los datos de esa cuenta; al cerrar sesión vuelve a mostrarse la copia local de prueba. No se borraron ni se importaron esos datos.
- Se agregó un estado visible de sincronización y etiquetas para identificar fechas locales, privadas y compartidas. Las Tareas continúan en almacenamiento local.
- Se corrigieron los textos de la sección de cuentas para describir el alcance actual de la sincronización.
- La implementación quedó lista para validación manual con ambas cuentas. Falta comprobar en la app que una fecha privada no aparece en la otra cuenta y que una fecha compartida aparece y se puede editar desde ambas sesiones. No se ejecutaron pruebas automatizadas y no se hizo commit ni push.

### Siguiente actividad propuesta

**12H.23.5.9.4 — Validación manual de Agenda con ambas cuentas**, primero con fechas nuevas de prueba: comprobar privacidad, compartir, edición desde la cuenta receptora, revocación de permisos y conservación de las fechas locales antiguas. Después registrar resultados y corregir cualquier incidencia antes de iniciar Tareas.


### Actualización de prioridad — 12H.23.5.9.4 — 16/10/2026

- Kike indicó que desea conservar los campos y funciones, pero replantear la estructura visual antes de seguir completando módulos. La idea incluye navegación persistente a la izquierda, avisos cerrables arriba, calendario contextual a la derecha en vistas programadas, y vistas de proyectos y resultados sin calendario.
- Se preparó el documento PROPUESTA_DISEÑO_VISUAL_12H.23.5.9.4.md y un prototipo interactivo para revisión. El prototipo incluye Agenda, fechas especiales, tareas, pagos, finanzas, entrenamiento, registro del tiempo, proyectos y cuatro vistas de resultados.
- La vista de teléfono propone una barra izquierda compacta y el calendario debajo del contenido; queda pendiente confirmar comodidad y navegación en móvil. Finanzas sin calendario queda como propuesta pendiente de confirmación.
- Esta actualización sustituye el orden que proponía validar la Agenda como siguiente paso: primero se revisará y aprobará el mapa visual; después se integrará el cascarón de navegación y se validará la sincronización con ambas cuentas.
- El prototipo es de revisión, no está conectado con Firebase y sus datos son ejemplos ficticios. No se modificó la interfaz funcional en este paso. No hubo pruebas, publicación, commit ni push.

### Siguiente actividad propuesta

**12H.23.5.9.5 — Ajustar y aprobar el mapa visual y llevar la navegación principal a la app.** Al quedar aprobada la estructura, continuar con la validación de privacidad y sincronización de Agenda en la nueva interfaz.


### Aclaración de Kike sobre Proyectos y Resultados — 16/10/2026

- Proyectos contendrá únicamente proyectos que Kike agregue manualmente, con sus subtareas y estados. No se poblará automáticamente desde Agenda, Tareas u otros módulos y no requiere calendario lateral.
- Cada botón de Resultados presentará un resumen exclusivo de su propio campo. En Proyectos y en todas las vistas de Resultados se oculta el calendario lateral.
- Se actualizaron el prototipo y el documento PROPUESTA_DISEÑO_VISUAL_12H.23.5.9.4.md para reflejar esta decisión.

- Se corrigió el prototipo para que, en pantallas angostas, la barra izquierda quede junto al contenido y el calendario use una fila completa debajo; los accesos de Resultados ya no invaden su área.


### Aclaración de distribución de pantalla — 16/10/2026

- La navegación es una sola barra vertical a la izquierda y ocupa toda la altura: Organizar y todos sus botones van arriba; Resultados y sus botones van en la parte inferior de esa misma barra.
- A la derecha quedan el encabezado/avisos y el área de trabajo; para módulos con calendario, el campo abierto y el calendario aparecen lado a lado. Proyectos y Resultados siguen sin calendario, según la aclaración previa de Kike.
- Se actualizó el prototipo para reflejar esta disposición.


### 12H.23.5.9.5 — Navegación principal integrada localmente — 16/10/2026

- Kike aprobó la distribución: una barra izquierda persistente, “Organizar” arriba y “Resultados” abajo; a la derecha queda el espacio de trabajo y el calendario cuando corresponde.
- Se sustituyó la cuadrícula inicial por navegación a Agenda, Fechas especiales, Tareas, Pagos pendientes, Finanzas, Entrenamiento, registro del tiempo, Proyectos, ¿Qué aprendí? y Objetivos. Se añadieron cuatro accesos de Resultados. “Mi cuenta” queda en el encabezado para mantener Resultados al fondo de la barra.
- Se conservaron las vistas y controles existentes de Agenda y Tareas. Se añadió un calendario mensual contextual que muestra elementos de Agenda o tareas en las fechas correspondientes y permite seleccionar días y cambiar de mes.
- Los módulos aún no construidos muestran un mensaje de pendiente; no se consideran funcionalidades terminadas. El aviso superior cerrable es por ahora una ubicación visual y texto provisional, todavía no genera alertas reales.
- La Agenda conserva su sincronización actual con Firestore y las Tareas continúan locales. El nuevo calendario consulta los datos ya cargados y no migra ni modifica registros.
- No se ejecutaron pruebas, no se hizo commit ni push. La validación manual de la navegación y el calendario en computadora y celular está pendiente.

### Siguiente actividad propuesta

La validación manual inicialmente propuesta para este punto se reprogramó a **12H.23.5.9.7** por solicitud de Kike para construir primero el módulo ¿Qué aprendí?.

- Ajuste solicitado por Kike: se retiró el acceso duplicado “Agenda”; “Fechas especiales” conserva el panel completo de Agenda (crear, buscar, filtrar, editar, borrar, compartir y ver fechas en el calendario contextual). Se renombró el encabezado del panel.

### 12H.23.5.9.6 — ¿Qué aprendí? con registro por día — 16/10/2026

- Se reemplazó la pantalla pendiente por un formulario para guardar varios aprendizajes asociados a una fecha.
- Cada registro se guarda localmente en este dispositivo; puede consultarse, editarse y eliminarse. El calendario contextual marca los días con aprendizajes y al elegir un día llena la fecha del formulario.
- No se comparte ni sincroniza con Firestore en esta etapa. No se hizo commit ni push; la revisión manual continúa pendiente.

### Siguiente actividad propuesta

**12H.23.5.9.7 — Validar la navegación, el calendario y el registro de aprendizajes en computadora y celular**, verificando alta, edición, eliminación y persistencia local.

- Ajuste de navegación solicitado por Kike: Proyectos quedó al final de los accesos de Organizar, inmediatamente antes del grupo Resultados.

- Orden de navegación solicitado por Kike: Objetivos quedó debajo del encabezado Organizar; ¿En qué se me fue el tiempo? quedó inmediatamente antes de Proyectos y ambos permanecen al final de Organizar.

### 12H.23.5.9.7.1 — Registro y resumen local de Pagos — 16/10/2026

- Se agregó el acceso **Resumen de pagos** en la sección Resultados.
- Pagos pendientes ahora permite registrar concepto, fecha de vencimiento, monto en pesos y estado pagado/pendiente; también permite editar, cambiar estado y eliminar registros.
- El resumen muestra cantidades y montos pendientes, realizados y el total registrado, además de las listas separadas por estado.
- Los vencimientos se señalan en el calendario contextual cuando está abierto Pagos pendientes.
- Los datos se guardan en localStorage de este dispositivo y aún no se sincronizan con Firestore ni con el otro usuario. No se migraron ni alteraron datos de otros módulos.
- No se hizo commit ni push. La validación manual queda pendiente.

### Siguiente actividad

**12H.23.5.9.7.2 — Validar Pagos y su resumen en computadora**, creando registros de prueba, verificando el cambio de estado y las sumas, y luego repetir la revisión en el celular. Antes de registrar pagos reales, decidir más adelante cómo sincronizarlos con Firestore.
### Validación 12H.23.5.9.7.2 — Pagos en computadora — 16/10/2026

- En la app local de la computadora se registró un pago de prueba realizado por $100.25 y otro pendiente por $200.50.
- El resumen presentó 1 pendiente ($200.50), 1 realizado ($100.25) y $300.75 total; al cambiar temporalmente el estado, las cifras se actualizaron correctamente.
- Se comprobó que los registros persistieron después de recargar la app y que el calendario mostró el vencimiento seleccionado.
- La carga detectó un orden incorrecto de inicialización de variables y una llamada a una función de fecha con nombre inexistente. Se adelantaron las variables de estado y se unificó el nombre; tras recargar, Pagos abrió y guardó correctamente.
- Kike autorizó borrar las dos muestras; ambas se eliminaron y el resumen volvió a cero. No se capturaron pagos reales.
- La app del celular no se actualizó ni se probó con esta versión local. No se hizo commit ni push.

### Siguiente actividad

**12H.23.5.9.8 — Usar la ventana emergente para crear y editar Tareas**, conservando sus campos actuales y las funciones de completar y eliminar.
### 12H.23.5.9.8 — Tareas con ventana emergente de alta y edición — 16/10/2026

- Se sustituyeron los campos fijos de captura por el botón **+ Nueva tarea**.
- El botón abre la ventana emergente que ahora sirve tanto para crear como para editar.
- Se conservaron los campos de tarea, fecha, hora, prioridad, categoría, recordatorio y repetición; también permanecen las opciones para marcar como completada y eliminar.
- Los registros existentes continúan en el almacenamiento local; no se migraron ni modificaron los datos ya guardados.
- No se hizo commit ni push. La revisión visual y funcional queda pendiente.

### Siguiente actividad

**12H.23.5.9.9 — Validar Tareas y el resumen de pagos en computadora y preparar una prueba en celular cuando exista una versión actualizada accesible desde ese dispositivo.**
### 12H.23.5.9.9 — Fechas especiales con ventana emergente y filtros mejorados — 16/10/2026

- Se reorganizó la pantalla Fechas especiales: la captura en línea pasa a un botón que abre la misma ventana emergente usada para editar.
- La ventana emergente ahora admite alta y edición, con nombre, tipo, fecha, hora opcional, recordatorio y opción de compartir. Se conserva la lógica actual de privacidad y sincronización con Firestore.
- Se agregaron etiquetas accesibles, un botón explícito “Todas”, filtros por cumpleaños/aniversarios/fechas importantes, búsqueda más clara y contador de fechas.
- Los registros preexistentes no se migraron ni eliminaron. No se hizo commit ni push.
- La revisión funcional y visual en computadora y celular queda pendiente; no se ejecutaron pruebas automatizadas.

### Siguiente actividad propuesta

**12H.23.5.9.10 — Validación manual de Fechas especiales y Tareas en computadora y celular**, comprobando alta y edición emergentes, búsqueda, cada filtro y retorno a “Todas”, además de compartir/privacidad desde las dos cuentas.
### Avance de 12H.23.5.9.10 — Fechas especiales en computadora — 16/10/2026

- Kike confirmó que la ventana emergente de alta abre correctamente.
- Kike comprobó que los filtros de Cumpleaños, Aniversarios, Importantes y Todas funcionan; también confirmó que la búsqueda y su limpieza responden correctamente.
- Kike creó una fecha temporal, la editó y confirmó que se guardó el cambio de nombre.
- La fecha temporal creada para la prueba permanece en la app. No se ha eliminado.
- Sigue pendiente validar Tareas, repetir la revisión en celular y comprobar el compartir/privacidad entre las dos cuentas. No se hizo commit ni push.

### Siguiente actividad

Continuar **12H.23.5.9.10** con validación de alta y edición de Tareas en computadora; después revisar Fechas especiales en celular y el uso compartido entre cuentas.
### 12H.23.5.9.11 — Filtros de Tareas por texto y prioridad — 16/10/2026

- A petición de Kike, se añadió búsqueda por texto en el contenido visible de cada tarea y filtro por prioridad Alta, Media o Baja.
- Se agregó opción para limpiar ambos filtros y un contador de tareas visibles respecto del total.
- El filtrado solo oculta tarjetas que no coinciden; no elimina, modifica ni mueve tareas del almacenamiento local. Completar, editar y eliminar siguen usando el índice original de cada tarea.
- La validación manual de estos controles queda pendiente. No se hizo commit ni push.

### Siguiente actividad

**12H.23.5.9.11.1 — Validar la búsqueda y prioridad en Tareas en computadora**, comprobando que los filtros se pueden combinar y limpiar; después continuar la validación de Tareas y Fechas especiales en celular.
### 12H.23.5.9.12 — Tareas por día de calendario y prioridad opcional — 16/10/2026

- A petición de Kike, la vista inicial de Tareas muestra únicamente las tareas con fecha igual al día seleccionado en el calendario contextual. Al seleccionar otro día, la lista se actualiza.
- Si se escribe texto o se selecciona una prioridad, la búsqueda abarca tareas de cualquier fecha; al limpiar filtros se regresa al día seleccionado.
- Se añadió **Sin prioridad** en el filtro y en el editor de tareas. **Todas las prioridades** permanece como valor predeterminado; las tareas antiguas sin prioridad se identifican como tales.
- Cuando no hay coincidencias, se muestra un mensaje orientativo. Los filtros no eliminan tareas ni alteran su almacenamiento local.
- No se hizo commit ni push. Queda pendiente validar manualmente el comportamiento por día, las búsquedas globales y la opción Sin prioridad.

### Siguiente actividad

**12H.23.5.9.12.1 — Validar Tareas por fecha y prioridad en computadora**, verificando que al seleccionar días cambie la lista, que buscar texto o prioridad encuentre tareas de cualquier fecha y que Limpiar filtros vuelva al día seleccionado.

### 12H.23.5.9.12.1 — Repeticiones de Tareas visibles en calendario — 16/10/2026

- Kike detectó que las tareas con repetición se guardaban y mostraban su etiqueta, pero el calendario solo incluía la fecha inicial.
- Se añadió cálculo de ocurrencias para tareas diarias, semanales, quincenales, mensuales y anuales, desde la fecha inicial y sin fecha de término.
- El calendario marca las ocurrencias del mes y la lista del día incluye la tarea recurrente al seleccionar la fecha correspondiente. La búsqueda global por texto/prioridad sigue encontrando la tarea una sola vez como registro.
- La repetición comparte actualmente el estado completada de la tarea; no se añadió un estado independiente para cada ocurrencia.
- La revisión manual de recurrencias queda pendiente. No se hizo commit ni push.

### Siguiente actividad

**12H.23.5.9.12.2 — Validar la repetición semanal de Tareas en computadora**, comprobando la fecha inicial, la misma fecha siete días después, las fechas intermedias y el marcador del calendario.

### 12H.23.5.9.13 — Puntos de prioridad y check de tareas en calendario — 16/10/2026

- Se solicitó mostrar hasta tres puntos por día en el calendario de Tareas, según las prioridades pendientes: rojo (alta), naranja (media) y verde (baja). Se muestra un punto por cada nivel presente ese día.
- Las tareas sin prioridad no generan punto de prioridad. Las tareas completadas conservan su registro y aparecen en la lista/detalle, pero dejan de aportar puntos al calendario.
- El detalle del día permite marcar una tarea realizada o pendiente desde el calendario. Al cambiar el estado, los puntos se actualizan sin eliminar la tarea.
- En tareas recurrentes, el check afecta el estado de la tarea completa y por ello quita sus puntos en todas sus ocurrencias. No se implementó estado separado por cada repetición.
- La validación visual y funcional queda pendiente. No se hizo commit ni push.

### Siguiente actividad

**12H.23.5.9.13.1 — Validar los puntos y el check en calendario de Tareas**, comprobando puntos por cada prioridad, desaparición al completar, conservación de la tarea y reaparición del punto al marcarla pendiente.

### 12H.23.5.9.14 — Finalización por ocurrencia y término de repetición en Tareas — 16/10/2026

- Se retiró el control de check del detalle del calendario; el check queda en la tarjeta de tarea.
- Al completar una ocurrencia recurrente desde su tarjeta, se guarda la fecha realizada. Las otras repeticiones conservan su estado y sus puntos; las tareas que no se repiten mantienen su check habitual.
- Al elegir una frecuencia distinta de “No repetir”, aparece “Se repetirá hasta”. La fecha final es obligatoria, debe ser igual o posterior al inicio y se considera inclusiva al calcular ocurrencias.
- La tarjeta informa la fecha límite en formato corto (por ejemplo, “20-oct-2026”). Las tareas antiguas que ya repetían sin fecha límite siguen abiertas hasta que se editen; al guardarlas como recurrentes se solicitará el término.
- Si se edita una misma serie (misma fecha de inicio y frecuencia), se conservan sus fechas completadas. Cambiar el inicio o la frecuencia inicia el historial de ocurrencias completadas.
- Falta la validación manual en navegador. No se hizo commit ni push.

### Siguiente actividad

**12H.23.5.9.14.1 — Validar en computadora las repeticiones y su fecha límite**, comprobando una tarea semanal con al menos dos ocurrencias, completar solo una, confirmar que las demás conservan sus puntos, validar que la fecha final se incluye y que después de ella no aparece ninguna repetición.

### 12H.23.5.9.14.1 — Validación manual de repeticiones y fecha límite — 16/10/2026

- Kike confirmó que la prueba manual fue exitosa y que le gustó el comportamiento: el check completa solo la ocurrencia elegida y la repetición termina conforme a la fecha límite.

### 12H.23.5.9.15 — Calendario compartido e iconos para Fechas especiales — 16/10/2026

- Fechas especiales ahora sigue la navegación por día del calendario contextual, como Tareas. Se retiró del área de Fechas especiales el control separado para navegar “Próximamente”; los meses se cambian desde las flechas del calendario y la lista principal muestra el día seleccionado. La búsqueda y los filtros siguen disponibles.
- El calendario muestra mini iconos: 🎂 cumpleaños, ❤️ aniversarios y 🗓️ fechas importantes. Cumpleaños y aniversarios aparecen cada año; en años no bisiestos el 29 de febrero se representa el 28. Las fechas importantes siguen siendo de fecha única.
- El cambio de mes avanza también la fecha seleccionada al mismo día del siguiente/anterior mes, ajustando al último día cuando ese mes es más corto. Se conserva ese comportamiento común para todos los módulos con calendario: Fechas especiales, Tareas, Pagos pendientes, Finanzas, Entrenamiento, registro del tiempo, ¿Qué aprendí? y Objetivos. Proyectos y Resultados siguen sin calendario.
- Se añadió un resumen mensual de cumpleaños en una fila horizontal de tarjetas compactas, con accesos para ver el día o editar el registro.
- Pendiente validar manualmente la navegación entre meses/días y los iconos y tarjetas de cumpleaños. No se hizo commit ni push.

### Siguiente actividad

**12H.23.5.9.15.1 — Validar navegación del calendario y resumen mensual de cumpleaños** en computadora y teléfono, incluyendo cambio de mes, cumpleaños y aniversarios anuales, fechas importantes de fecha única, días con varios tipos y filtros de Fechas especiales.

### 12H.23.5.9.15.1 — Validación manual de calendario y Fechas especiales — 16/10/2026

- Kike confirmó que navegó el calendario manualmente, que funcionó y que le agradaron los cambios de Fechas especiales.
- El nombre acordado para la persona usuaria es Kike; el asistente se llama Yuny.

### 12H.23.5.9.16 — Registro de gastos por día en Finanzas — 16/10/2026

- Se inició el módulo Finanzas, siguiente área pendiente según el orden de trabajo acordado después de ¿Qué aprendí?.
- El formulario emergente permite registrar concepto, monto en pesos, fecha, categoría y una nota opcional; también permite editar y eliminar registros.
- La lista y el total diario siguen el día elegido en el calendario contextual. Al seleccionar otra fecha, el formulario refleja el cambio. El calendario indica los días con gastos y el detalle diario los identifica con 💸.
- Los gastos se almacenan localmente en este dispositivo, sin sincronización con Firebase. Los resultados financieros (resúmenes por día/semana/mes/año y gráficas) quedan para un subpaso posterior.
- Falta la prueba manual en computadora y teléfono. No se hizo commit ni push.

### Siguiente actividad

**12H.23.5.9.16.1 — Validar el registro de gastos por día**, comprobando alta, edición, eliminación, cálculo del total diario y navegación del calendario. Después continuar con resultados financieros.

### 12H.23.5.9.16.2 — Cuatro tipos de gasto e iconos en calendario — 16/10/2026

- Finanzas ofrece exactamente cuatro tipos de gasto: Fijos y esenciales 🏠, Variables necesarios 🛒, Compromisos financieros 💳 y Gustos y salidas 🎉.
- La tarjeta del gasto presenta el icono y el nombre del tipo. Los días con gastos muestran en el calendario un mini icono por cada tipo presente; al coincidir varios tipos aparecen juntos, sin repetir categoría.
- Los registros anteriores se conservan. Sus antiguas categorías se interpretan en el grupo más cercano al abrir o mostrar el gasto y solo se transforman al guardar una edición.
- El nombre específico del concepto sigue siendo un campo aparte; el resumen financiero completo y sus gráficas quedan pendientes.
- La validación manual de las cuatro categorías y sus iconos está pendiente. No se hizo commit ni push.

### Siguiente actividad

**12H.23.5.9.16.2.1 — Validar categorías e iconos de gastos**, comprobando guardar y editar un gasto de cada tipo, varios tipos en un mismo día y que los registros existentes sigan disponibles.

### 12H.23.5.9.16.3 — Resumen financiero por día, semana, mes y año — 16/10/2026

- Se añadió una vista de Resultados financieros con selector de periodo y fecha de referencia. La semana se calcula de lunes a domingo; el día, mes y año se delimitan con sus fechas correspondientes.
- El resumen presenta total gastado, cantidad de gastos, promedio diario, gasto más alto, desglose por las cuatro categorías y gráfica temporal. Para el año muestra meses; para semana o mes, días; para el día, los gastos registrados de esa fecha.
- Los cálculos usan los gastos locales existentes y respetan los iconos y categorías actuales. No se migran ni sincronizan datos a Firebase.
- Se añadieron estilos adaptables a celular. La revisión manual visual y funcional queda pendiente. No se hizo commit ni push.

### Siguiente actividad

**12H.23.5.9.16.3.1 — Validar Resultados financieros**, seleccionando día, semana, mes y año; contrastando totales y categorías con registros conocidos; y revisando que las gráficas se lean en computadora y teléfono. También queda pendiente la validación de alta, edición y borrado de gastos y sus iconos de calendario.

### 12H.23.5.9.16.3.1 — Validación manual de Resultados financieros — 16/10/2026

- Kike confirmó que la vista quedó perfecta y le gustó. Se toma como validación manual satisfactoria del resumen financiero que revisó.
- La confirmación no especifica por separado todas las opciones de periodo ni el comportamiento en teléfono; quedan como comprobaciones adicionales si se detecta algún problema. No se hizo commit ni push.

### 12H.23.5.9.17 — Registro diario de Entrenamiento — 16/10/2026

- Se reemplazó el texto provisional de Entrenamiento por un módulo para registrar actividades físicas y mentales vinculadas al día seleccionado en el calendario.
- Incluye sugerencias como caminar, fuerza, movilidad, cardio, respiración consciente, meditación, lectura enfocada y memoria/atención; también permite escribir una actividad propia.
- Cada registro puede incluir fecha, duración opcional y nota. Las tarjetas permiten marcarlo realizado sin borrar el registro, editarlo o eliminarlo.
- El calendario muestra mini iconos 🏋️ y 🧠 en los días con actividades físicas o mentales. El listado sigue la fecha seleccionada y los datos se guardan localmente en el dispositivo, sin sincronización de Firebase.
- Pendiente validar manualmente alta, edición, eliminación, check y calendario en computadora y teléfono. No se hizo commit ni push.

### Siguiente actividad

**12H.23.5.9.17.1 — Añadir repetición y fecha límite a Entrenamiento**, según la solicitud de Kike; la validación general del módulo queda después de incorporar este comportamiento.
### 12H.23.5.9.17.1 — Repetición y fecha límite en Entrenamiento — 16/10/2026

- El formulario de Entrenamiento ahora ofrece las mismas frecuencias que Tareas: cada día, cada semana, cada 2 semanas, cada mes y cada año.
- Al elegir una frecuencia aparece “Se repetirá hasta”; la fecha final es obligatoria, debe ser igual o posterior al inicio y se incluye en las ocurrencias.
- Las actividades recurrentes aparecen en cada fecha correspondiente del calendario y en la lista del día. Cada repetición mantiene su propio check, de modo que completar una fecha no completa las demás. La tarjeta muestra la frecuencia y la fecha límite.
- Al editar una misma serie se conserva el historial de fechas completadas. Cambiar fecha de inicio o frecuencia comienza un historial nuevo.
- Pendiente validar manualmente las frecuencias y los checks por ocurrencia en computadora y teléfono. No se hizo commit ni push.

### Siguiente actividad

**12H.23.5.9.17.1.1 — Validar repetición de Entrenamiento**, comprobando ocurrencias diarias, semanales y mensuales, inclusión de la fecha final y que completar una fecha no oculte las demás.
### 12H.23.5.9.17.1.1 — Marcadores de Entrenamiento solo para actividades pendientes — 16/10/2026

- En la prueba manual, Kike observó que el icono de un día seguía visible después de marcar como realizada la actividad.
- Se corrigió el calendario: los iconos 🏋️ y 🧠 ahora solo representan actividades pendientes. Completar una ocurrencia recurrente quita el icono de esa fecha sin ocultar su registro en Entrenamiento ni afectar otros días. Si hay otra actividad pendiente del mismo tipo en esa fecha, el icono permanece.
- La validación del comportamiento corregido queda pendiente. No se hizo commit ni push.

### Siguiente actividad

**12H.23.5.9.17.1.2 — Validar repetición y marcadores de Entrenamiento**, comprobando que al completar una ocurrencia se quite su icono en ese día, las demás repeticiones mantengan sus iconos y la actividad siga visible en su lista.