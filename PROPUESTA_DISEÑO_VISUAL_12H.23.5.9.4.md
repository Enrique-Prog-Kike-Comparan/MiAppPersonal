# Propuesta de diseño visual y navegación — MiAppPersonal

**Punto:** 12H.23.5.9.4
**Fecha:** 16/10/2026
**Estado:** Borrador visual listo para revisión de Kike. No se modificó la interfaz funcional de la app en este paso.

## Propósito

Conservar los campos y funciones personales que distinguen MiAppPersonal, y organizar su uso en una vista más práctica: navegación persistente, calendario contextual, formularios por módulo, proyectos y resultados.

## Mapa de navegación

### Organizar

- **Agenda:** visión del día y calendario general.
- **Fechas especiales:** cumpleaños, aniversarios y fechas importantes.
- **Tareas:** pendientes con prioridad, fecha y casilla para marcar finalizadas.
- **Pagos pendientes:** pagos periódicos como agua, luz y predial, con vencimiento en el calendario.
- **Finanzas:** captura de gastos e ingresos y sus categorías.
- **Entrenamiento:** rutinas físicas y mentales programadas por día y con casilla de avance.
- **¿En qué se me fue el tiempo?:** comentarios o registro de uso del tiempo asociados a cada día.
- **Proyectos:** únicamente los proyectos que Kike agregue, con sus subtareas propias y estado modificable. No se crean automáticamente desde Agenda, Tareas u otros módulos. Esta vista no lleva calendario.

### Resultados

- **Resultados financieros**
- **Resumen de entrenamiento**
- **Resultado de tareas**
- **Resultado del tiempo**

Cada botón de Resultados tendrá una vista separada que resumirá solamente su propio campo, con periodo día, semana, mes o año y tarjetas y gráficas basadas en sus datos. Ninguna vista de Resultados llevará calendario.

## Distribución de pantalla propuesta

### Computadora

1. **Barra izquierda única y persistente:** ocupa toda la altura. “Organizar” aparece en la parte superior con sus botones debajo. “Resultados” aparece en la parte inferior de esa misma barra con sus botones debajo.
2. **Área derecha:** contiene la barra superior con avisos cerrables y el espacio de trabajo.
3. **Área de trabajo:** muestra el campo o módulo abierto y, a su lado, el calendario cuando corresponde. El calendario refleja el módulo seleccionado.
4. **Proyectos y Resultados:** se abren en el área derecha sin calendario. Proyectos muestra solo elementos agregados manualmente por Kike; cada Resultado resume solamente su propio campo.

### Celular

En pantallas angostas se mantiene la barra izquierda completa; el área de trabajo se apila a su derecha, con el calendario debajo del campo abierto. En celular la barra mantiene los dos grupos y sus nombres, con botones compactos.

## Reglas de comportamiento

- El calendario muestra solamente los elementos pertinentes al módulo activo; Agenda es la vista combinada.
- Las fechas especiales, tareas, pagos y rutinas muestran su vencimiento o programación en el calendario.
- Las tareas y rutinas permiten marcar avance sin abandonar el calendario del módulo.
- Finanzas se propone como captura y consulta de movimientos; no se muestra el calendario en esa vista.
- Proyectos muestra subtareas y estados sin calendario.
- Las alertas superiores pueden mostrar cumpleaños y pagos del día, y se pueden cerrar.
- Mantener los campos ya acordados. El prototipo usa ejemplos ficticios solo para mostrar distribución, no son datos del proyecto.

## Mapa de pantalla

┌────────────────┬───────────────────────────────────────────────┐
│ Organizar      │ MiAppPersonal · avisos cerrables              │
│ botones        ├───────────────────────────────┬───────────────┤
│ ...            │ Campo abierto                 │ Calendario    │
│                │ formularios, listas y checks  │ del campo     │
│                │                               │ seleccionado  │
│ Resultados     │                               │               │
│ botones        │                               │               │
└────────────────┴───────────────────────────────┴───────────────┘

La barra izquierda ocupa toda la altura. Resultados queda anclado en su parte inferior, debajo de Organizar. Proyectos y Resultados usan toda el área derecha sin calendario.

## Relación con el trabajo actual

- Se conserva como base la autenticación, el vínculo entre las dos cuentas y el modelo de registros de Firestore.
- La conexión de Agenda a Firestore de 12H.23.5.9.3 sigue pendiente de validación manual; todavía no se publicó ni se probó con ambas cuentas.
- Este diseño no cambia reglas de Firestore, datos existentes, permisos ni módulos funcionales.
- No se hizo commit ni push.

## Revisión pendiente

Antes de implementar la nueva estructura, confirmar o ajustar:

1. Si el calendario de la computadora debe permanecer siempre a la derecha para los seis módulos enumerados.
2. Si el teléfono debe usar la barra izquierda compacta que muestra el prototipo.
3. Si Finanzas debe quedarse sin calendario o también mostrar movimientos por fecha.
4. Confirmar que Proyectos solo contenga entradas agregadas por Kike, sin importar datos de otros módulos.
5. Confirmar nombres y agrupación de las vistas de Resultados, cada una con resumen exclusivo de su campo.

## Siguiente paso propuesto

**12H.23.5.9.5 — Ajustar y aprobar el mapa visual, y después llevar la navegación principal a la app.** Al aprobar la estructura, retomar la validación de privacidad y sincronización de Agenda con ambas cuentas dentro de la nueva interfaz.
