# Bitácora de MiAppPersonal

**Última actualización:** 11 de octubre de 2026  
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

- Último commit conocido: `e10a159`.
- Estado limpio reportado inmediatamente después de ese commit.
- La decisión conversada fue **continuar el desarrollo y después respaldar en GitHub**. No se debe interpretar como que ya se hizo el push. Registrar aquí el commit de respaldo cuando se realice.
- Durante esta revisión, `git rev-parse --show-toplevel` identificó `C:/MiAppPersonal`, pero `git status` devolvió que no está dentro de un árbol de trabajo. El estado limpio anterior se conserva como dato reportado por la conversación y conviene verificar Git antes de respaldar.

## Pendientes conocidos

1. Definir la siguiente actividad y su numeración desde la continuidad del plan; no asignar un nuevo subpaso sin confirmar su alcance.
2. Registrar cada cambio con su punto numerado, qué se hizo y cómo se verificó; diferenciar trabajo completado de trabajo pendiente.
3. Confirmar y documentar los casos concretos de pruebas de la búsqueda global de fechas de Agenda si hace falta continuar esa parte.
4. Seguir validando el flujo de notificaciones push; distinguir la notificación local/de prueba del envío y recepción push reales en segundo plano.
5. Después de continuar el desarrollo, verificar rama, estado y commit y realizar el respaldo en GitHub según lo acordado. No hay evidencia en el contexto de que el push ya se haya hecho.

## Reglas para continuar

- Trabajar en `C:\MiAppPersonal`; conservar los archivos del proyecto y revisar el estado antes de modificar.
- Seguir la numeración vigente, sin añadir subpasos ni marcar puntos completos sin contexto o verificación.
- Avanzar paso a paso y explicar en español claro qué archivo se toca, qué cambio se realiza y cómo comprobarlo. La persona usuaria prefiere instrucciones adecuadas para alguien que está aprendiendo.
- Al cerrar cada paso, actualizar esta bitácora con fecha, resultado, pruebas realmente ejecutadas, commit si existe y siguiente paso confirmado.
- No subir cambios a GitHub hasta el momento acordado: primero continuar el desarrollo y luego respaldar.

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