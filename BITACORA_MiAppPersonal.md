# Bitácora final de MiAppPersonal

**Actualizada:** 18 de octubre de 2026
**Proyecto:** `C:\MiAppPersonal`
**Rama de publicación:** `backup/2026-10-11-12H-23-5-8` (Git local: `master`)
**Último commit de código antes del cierre documental:** `769792b`

## 1. Propósito

MiAppPersonal es una aplicación web instalable (PWA) para organizar actividades, fechas, cuentas y resultados desde computadora y celular. Usa Firebase Authentication y Cloud Firestore para sincronizar registros nuevos entre dispositivos de la misma cuenta.

## 2. Versión final confirmada

Kike confirmó pruebas satisfactorias de todos los módulos y Resultados, incluidas privacidad entre las cuentas y las últimas mejoras de Salud e Izel.

### 2.1 Módulos de Organizar

Objetivos; Fechas especiales; Tareas; Pagos pendientes; Finanzas; Entrenamiento; ¿Qué aprendí?; ¿En qué se me fue el tiempo?; Salud; Mi peque Izel; Compra Pen. Despensa; Proyectos.

### 2.2 Resultados

Resultados financieros, pagos, entrenamiento, tareas, tiempo, Salud, Izel y aprendizajes. Cada resultado usa datos disponibles para la cuenta activa y, donde aplica, elementos que esa cuenta tiene compartidos.

### 2.3 Privacidad y sincronización

1. Registros nuevos sincronizan entre dispositivos donde inicia sesión la misma cuenta.
2. Salud, Finanzas, Objetivos, ¿Qué aprendí? y ¿En qué se me fue el tiempo? son privados del propietario. Yesica puede usar los módulos con sus propios datos; no ve los de Kike y viceversa.
3. En Entrenamiento, Proyectos, Compra Pen. Despensa, Tareas, Fechas especiales, Pagos pendientes y Mi peque Izel se puede elegir compartir cada elemento con la cuenta vinculada. Ambos pueden ver y editar; solo quien lo creó puede eliminarlo.
4. Los datos locales anteriores no se importan automáticamente. Se acordó sincronizar solo registros nuevos.
5. Las cuentas Firebase y el vínculo son distintos de los datos de módulos; se conservan durante la limpieza de registros.

### 2.4 Salud e Izel

Se puede registrar enfermedad, fecha de inicio, término y medicamentos. El calendario muestra 🤒 en cada día del intervalo, inclusive. Los Resultados muestran episodios por mes/año de inicio, duración y medicamentos. El resumen de Izel está en **Resultados de Izel**, no al final de su módulo.

### 2.5 Avisos y costo

Las notificaciones en el celular funcionan con la app instalada. No se acordaron notificaciones automáticas cuando la app está cerrada ni servicios que requieran facturación. Mantener el plan gratuito.

## 3. Limpieza de datos de prueba — 18/10/2026

Kike autorizó eliminar todos los registros de prueba acumulados hasta hoy.

- En el proyecto Firebase `miapppersonal-5068d` se ejecutó Firebase CLI para borrar recursivamente la colección `records`, donde se guardan los registros de los módulos. La operación terminó con código de salida 0.
- Se conservaron `accountPairs`, Firebase Authentication, reglas y archivos de la aplicación.
- En esta computadora se limpiaron 20 claves de `localStorage` y `sessionStorage` del origen `http://127.0.0.1:5500`. La página temporal se retiró.
- El celular tiene almacenamiento independiente. **Pendiente:** Kike debe borrar el almacenamiento del sitio `enrique-prog-kike-comparan.github.io` en Chrome Android y volver a iniciar sesión. Esto puede cerrar la sesión local pero no elimina la cuenta ni su contraseña.
- Si Yesica usó la app instalada y guardó datos locales anteriores, tendrá que repetir la limpieza en su propio celular.

## 4. Archivos del proyecto

| Archivo | Función |
|---|---|
| `index.html` | Estructura, navegación, formularios, ventanas y paneles de la app. |
| `app.js` | Lógica de módulos, calendarios, avisos, resultados, almacenamiento y sincronización privada. |
| `estilos.css` | Diseño adaptable para computadora y celular. |
| `firebase-config.js` | Inicializa Firebase para el navegador. No guardar credenciales privadas aquí. |
| `cuenta.js` | Registro, inicio/cierre de sesión y recuperación de acceso. |
| `vinculo.js` | Invitaciones, aceptación, cancelación y estado del vínculo. |
| `firestore.rules` | Permisos y privacidad de Firestore. |
| `firestore.indexes.json` | Índices compuestos requeridos por consultas de Firestore. |
| `agenda-cloud.js` | Sincronización de Fechas especiales. |
| `tareas-cloud.js` | Sincronización de tareas, repeticiones y checks. |
| `pagos-cloud.js` | Sincronización de pagos pendientes y pagos hechos. |
| `entrenamiento-cloud.js` | Sincronización de rutinas, repeticiones y checks. |
| `proyectos-cloud.js` | Sincronización de proyectos, ramas y avance. |
| `despensa-cloud.js` | Sincronización de listas, productos, checks y repeticiones. |
| `izel-cloud.js` | Sincronización privada/compartida de registros de Izel. |
| `modulos-privados-cloud.js` | Sincronización privada de módulos de cada propietario. |
| `despensa.js` | Catálogo, formularios, listas e interfaz de Compra Pen. Despensa. |
| `service-worker.js` | Instalación PWA, caché y notificaciones procesables con la app activa. |
| `manifest.json` | Nombre, icono y opciones de instalación. |
| `Icono.png` | Icono de la aplicación. |
| `firebase.json` | Ubicación de reglas/índices y configuración del emulador. |
| `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` | Dependencias y herramientas de desarrollo. |
| `tests/firestore-rules.test.js` | Pruebas de reglas con el emulador; no prueba la interfaz. |
| `PROPUESTA_DISEÑO_VISUAL_12H.23.5.9.4.md` | Referencia de diseño. |
| `BITACORA_MiAppPersonal.md` | Acuerdos, progreso, validaciones y pendientes. |

## 5. Acuerdos vigentes

1. No migrar datos locales antiguos automáticamente.
2. Compartir por elemento solo en los siete módulos acordados.
3. Mantener privados los módulos personales de cada cuenta.
4. Mantener el plan gratuito; no activar facturación ni servicios que la requieran.
5. No borrar cuentas, vínculo, código ni reglas como parte de la limpieza de registros.
6. Publicar cambios en la rama de respaldo; no modificar `main`.
7. Explicar el trabajo en español claro, con su numeración y pruebas realmente realizadas.

## 6. Historial numerado reorganizado

Se conserva la numeración asentada. Los huecos no se reconstruyen ni se inventan.

### 6.1 Agenda y notificaciones

- **12H.23.5.6 — Recordatorio de fecha:** notificación con la app abierta; Kike reportó éxito en computadora.
- **12H.23.5.7 — Momento del recordatorio:** usa la ocurrencia de hoy si la hora aún no pasó; prueba manual reportada exitosa.
- **12H.23.5.8 — Abrir Agenda desde la notificación:** Kike confirmó en computadora y celular; GitHub Pages publicado desde la rama de respaldo.

### 6.2 Cuentas, sincronización y módulos

- **12H.23.5.9 — Cuentas y base compartida:** dos cuentas, Firestore en `northamerica-south1` (Querétaro) y vínculo en ambos sentidos. No se migran registros locales antiguos.
- **12H.23.5.9.1 — Consultas filtradas:** siete pruebas del emulador pasaron para invitaciones, privacidad, edición, revocación y consultas de Agenda/Tareas.
- **12H.23.5.9.31 — Repetición de pagos:** Kike informó éxito de la validación de fecha límite y ocurrencias.
- **12H.23.5.9.32 / .32.1 — Entrenamiento y Proyectos:** sincronización, privacidad, edición y eliminación confirmadas por Kike.
- **12H.23.5.9.33 — Alcance temporal:** Finanzas quedó local y se retiró sincronización de Objetivos. Este acuerdo fue reemplazado después por `.52`.
- **12H.23.5.9.34–.39 — Publicación y vista móvil:** mejoras de lectura, menú desplegable y título móvil publicadas y validadas por Kike.
- **12H.23.5.9.40–.41 — Avisos y calendarios:** avisos separados, notificaciones móviles y navegación de calendarios validados.
- **12H.23.5.9.42–.44 — Compra Pen. Despensa y avisos:** catálogo, calendario, iconos, avisos diarios, posponer y navegación al módulo.
- **12H.23.5.9.45–.46 — Acceso sin sesión:** módulos ocultos hasta iniciar sesión; prueba en computadora y celular confirmada.
- **12H.23.5.9.47–.49 — Cierre, costo y notificaciones:** se mantuvo el plan gratuito y se descartaron avisos automáticos con la app cerrada.
- **12H.23.5.9.50–.51 — Módulos compartibles:** reglas aprobadas en emulador y validación manual de Tareas, Fechas especiales y Despensa; pruebas de Pagos, Izel, Entrenamiento y Proyectos asentadas previamente.
- **12H.23.5.9.52 — Alcance final:** todos los módulos sincronizan entre dispositivos de su propietario; solo siete permiten compartir elementos con la pareja.
- **12H.23.5.9.53–.55 — Módulos privados:** Finanzas, Salud, Objetivos, Aprendizajes y Tiempo conectados a Firestore privada; reglas de Salud publicadas y app enviada a la rama de respaldo.
- **12H.23.5.9.56 — Carrera de conexión:** altas nuevas esperan conexión de sincronización; no se confirmó que esa fuera la causa exacta del fallo original.
- **12H.23.5.9.57 — Validación general:** Kike confirmó todos los módulos y Resultados.

### 6.3 Enfermedades y resultados

- **12H.23.5.9.58 — Enfermedades en Salud e Izel:** campos de enfermedad, fechas, medicamentos e icono 🤒 en cada día del intervalo.
- **12H.23.5.9.59 — Resumen de Izel:** trasladado a Resultados de Izel.
- **12H.23.5.9.60 — Resumen de Salud:** añadido a Resultados de Salud.
- **12H.23.5.9.61 — Validación:** Kike confirmó que los cambios funcionan y le gustan.
- **12H.23.5.9.62 — Limpieza y cierre:** Kike autorizó borrar pruebas; Firestore y el navegador de esta computadora se limpiaron. Falta el almacenamiento local del celular.
- **12H.23.5.9.63 — Reorganización y respaldo comentado:** bitácora reordenada; se preparó una copia de fuentes, historial Git y código comentado en `C:\MiAppPersonal_Respaldo_Final_2026-10-18`.

## 7. Git y publicación

- GitHub Pages usa `backup/2026-10-11-12H-23-5-8`; `main` permanece intacta.
- El último commit de código antes del cierre documental es `769792b` — reorganizar bitácora para la versión final.
- Se registrarán la bitácora final y la copia comentada en un nuevo commit; no incluir datos privados ni contraseñas.

## 8. Copia de seguridad y comentarios del código

Ubicación: `C:\MiAppPersonal_Respaldo_Final_2026-10-18`. Contiene fuentes originales en ZIP, historial Git en bundle, copia comentada del código y bitácora anterior íntegra. En la copia comentada se añadió el propósito de cada archivo y comentarios antes de cada función con nombre. Los archivos JSON no admiten comentarios válidos; su propósito se documenta en la bitácora y el README del respaldo.

## 9. Próximos pasos

1. Limpiar en Chrome Android los datos del sitio de MiAppPersonal y volver a iniciar sesión. Si Yesica conservó datos locales antiguos en su teléfono, repetirlo allí.
2. Conservar el respaldo comentado en `C:\MiAppPersonal_Respaldo_Final_2026-10-18`.
3. Empezar a usar la app con datos reales solo cuando Kike lo decida.

## 10. Reglas para continuar

- Revisar la bitácora y el estado de Git antes de cambiar archivos.
- Trabajar en `C:\MiAppPersonal`; los archivos `sources/` del espejo del proyecto ChatGPT son solo lectura.
- Seguir la numeración sin inventar pasos completados.
- Distinguir claramente lo validado, lo pendiente y lo que reportó Kike.
- No borrar cuentas ni vínculo al limpiar datos de los módulos.

