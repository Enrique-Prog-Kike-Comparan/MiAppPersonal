

let tareas = JSON.parse(localStorage.getItem("tareas")) || [];

let tareaEditando = null;

function mostrarTareas() {
    document.getElementById("seccionTareas").scrollIntoView({
        behavior: "smooth"
    });
}

function guardarTareas() {
    localStorage.setItem("tareas", JSON.stringify(tareas));
}

function mostrarListaTareas() {

    const lista = document.getElementById("listaTareas");

    lista.innerHTML = "";


    tareas.forEach(function(tarea, indice) {

        const elemento = document.createElement("div");
        elemento.className = "tarea";

        let informacion = "";

        if (tarea.fecha) {
            informacion += "📅 " + tarea.fecha;
        } else {
            informacion += "📅 Sin fecha";
        }

        if (tarea.hora) {
            informacion += " · ⏰ " + tarea.hora;
        }

        let prioridad = "🟡 Media";

        if (tarea.prioridad === "alta") {
            prioridad = "🔴 Alta";
        }

        if (tarea.prioridad === "baja") {
            prioridad = "🟢 Baja";
        }

        let categoria = "📌 Otros";

        if (tarea.categoria === "trabajo") {
            categoria = "💼 Trabajo";
        }

        if (tarea.categoria === "personal") {
            categoria = "👤 Personal";
        }

        if (tarea.categoria === "familia") {
            categoria = "🏠 Familia";
        }

        if (tarea.categoria === "estudio") {
            categoria = "📚 Estudio";
        }

        let recordatorio = "🔕 Sin recordatorio";

         if (tarea.recordatorio === "5") {
          recordatorio = "🔔 5 minutos antes";
           }

         if (tarea.recordatorio === "15") {
           recordatorio = "🔔 15 minutos antes";
           }

         if (tarea.recordatorio === "30") {
         recordatorio = "🔔 30 minutos antes";
          }

         if (tarea.recordatorio === "60") {
         recordatorio = "🔔 1 hora antes";
         }

         if (tarea.recordatorio === "1440") {
         recordatorio = "🔔 1 día antes";
         }

         let repeticion = "🔁 No repetir";

         if (tarea.repeticion === "diaria") {
          repeticion = "🔁 Cada día";
          }

          if (tarea.repeticion === "semanal") {
           repeticion = "🔁 Cada semana";
            }

         if (tarea.repeticion === "quincenal") {
         repeticion = "🔁 Cada 2 semanas";
           }

         if (tarea.repeticion === "mensual") {
          repeticion = "🔁 Cada mes";
           }

         if (tarea.repeticion === "anual") {
         repeticion = "🔁 Cada año";
          }


          elemento.innerHTML =
            '<input type="checkbox" ' +
            (tarea.completada ? "checked" : "") +
            ' onchange="completarTarea(' + indice + ')">' +

            '<div class="contenido-tarea">' +

            '<strong>' + tarea.texto + '</strong>' +

            '<div>' + informacion + '</div>' +

            '<div>' + prioridad + " · " + categoria + '</div>' +

            '<div>' + recordatorio + " · " + repeticion + '</div>' +

            '<div class="acciones-tarea">' +

            '<button onclick="editarTarea(' + indice + ')">' +
            '✏️ Editar' +
            '</button>' +

            '<button onclick="eliminarTarea(' + indice + ')">' +
            '🗑️ Eliminar' +
            '</button>' +

            '</div>' +

            '</div>';

        lista.appendChild(elemento);
    });
}

function agregarTarea() {

    const texto = document.getElementById("textoTarea").value.trim();

    const fecha = document.getElementById("fechaTarea").value;

    const hora = document.getElementById("horaTarea").value;

    const prioridad = document.getElementById("prioridadTarea").value;

    const categoria = document.getElementById("categoriaTarea").value;

    const recordatorio = document.getElementById("recordatorioTarea").value;

    const repeticion = document.getElementById("repeticionTarea").value;

    if (texto === "") {
        alert("Escribe una tarea primero.");
        return;
    }

    const nuevaTarea = {
        texto: texto,
        fecha: fecha,
        hora: hora,
        prioridad: prioridad,
        categoria: categoria,
        recordatorio: recordatorio,
        repeticion: repeticion,
        completada: false
    };

    tareas.push(nuevaTarea);

    guardarTareas();

    mostrarListaTareas();

    document.getElementById("textoTarea").value = "";
    document.getElementById("fechaTarea").value = "";
    document.getElementById("horaTarea").value = "";
    document.getElementById("prioridadTarea").value = "media";
    document.getElementById("categoriaTarea").value = "trabajo";
    document.getElementById("recordatorioTarea").value = "ninguno";
    document.getElementById("repeticionTarea").value = "ninguna";
}

function completarTarea(indice) {

    tareas[indice].completada =
        !tareas[indice].completada;

    guardarTareas();

    mostrarListaTareas();
}

function editarTarea(indice) {

    tareaEditando = indice;

    const tarea = tareas[indice];

    document.getElementById("editarTexto").value =
        tarea.texto || "";

    document.getElementById("editarFecha").value =
        tarea.fecha || "";

    document.getElementById("editarHora").value =
        tarea.hora || "";

    document.getElementById("editarPrioridad").value =
        tarea.prioridad || "media";

    document.getElementById("editarCategoria").value =
        tarea.categoria || "otros";

    document.getElementById("editarRecordatorio").value =
        tarea.recordatorio || "ninguno";

    document.getElementById("editarRepeticion").value =
        tarea.repeticion || "ninguna";

    document.getElementById("ventanaEdicion").style.display =
        "flex";
}

function cerrarEdicion() {

    tareaEditando = null;

    document.getElementById("ventanaEdicion").style.display =
        "none";
}

function guardarEdicion() {

    if (tareaEditando === null) {
        return;
    }

    const texto =
        document.getElementById("editarTexto").value.trim();

    if (texto === "") {
        alert("La tarea no puede quedar vacía.");
        return;
    }

    tareas[tareaEditando].texto = texto;

    tareas[tareaEditando].fecha =
        document.getElementById("editarFecha").value;

    tareas[tareaEditando].hora =
        document.getElementById("editarHora").value;

    tareas[tareaEditando].prioridad =
        document.getElementById("editarPrioridad").value;

    tareas[tareaEditando].categoria =
        document.getElementById("editarCategoria").value;

    tareas[tareaEditando].recordatorio =
        document.getElementById("editarRecordatorio").value;

    tareas[tareaEditando].repeticion =
        document.getElementById("editarRepeticion").value;

    guardarTareas();

    mostrarListaTareas();

    cerrarEdicion();
}

function eliminarTarea(indice) {

    const confirmar = confirm(
        "¿Seguro que quieres eliminar esta tarea?"
    );

    if (!confirmar) {
        return;
    }

    tareas.splice(indice, 1);

    guardarTareas();

    mostrarListaTareas();
}

mostrarListaTareas();



function calcularEdad(fechaNacimiento) {

    const nacimiento =
        new Date(fechaNacimiento + "T00:00:00");

    const hoy =
        new Date();

    let anioCumpleanos =
        hoy.getFullYear();

    const mesNacimiento =
        nacimiento.getMonth();

    const diaNacimiento =
        nacimiento.getDate();

    const cumpleanosEsteAnio =
        new Date(
            anioCumpleanos,
            mesNacimiento,
            diaNacimiento
        );

    if (cumpleanosEsteAnio < hoy) {
        anioCumpleanos++;
    }

    return (
        anioCumpleanos -
        nacimiento.getFullYear()
    );
}




function obtenerProximaFecha(fecha) {

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);


    const fechaOriginal =
        new Date(fecha + "T00:00:00");


    let añoActual =
        hoy.getFullYear();


    let mesOriginal =
        fechaOriginal.getMonth();


    let diaOriginal =
        fechaOriginal.getDate();


    let proximaFecha =
        new Date(
            añoActual,
            mesOriginal,
            diaOriginal
        );

    /*
       Caso especial:
       29 de febrero en año no bisiesto
    */

    if (
        mesOriginal === 1 &&
        diaOriginal === 29 &&
        proximaFecha.getMonth() !== 1
    ) {

        proximaFecha =
            new Date(
                añoActual,
                1,
                28
            );

    }

    if (proximaFecha < hoy) {

        añoActual++;


        proximaFecha =
            new Date(
                añoActual,
                mesOriginal,
                diaOriginal
            );


        /*
           Volvemos a revisar
           el caso 29 de febrero
        */

        if (
            mesOriginal === 1 &&
            diaOriginal === 29 &&
            proximaFecha.getMonth() !== 1
        ) {

            proximaFecha =
                new Date(
                    añoActual,
                    1,
                    28
                );

        }

    }


    return proximaFecha;

}


function obtenerMomentoRecordatorio(fecha) {

    if (
        !fecha ||
        !fecha.fecha ||
        !fecha.hora ||
        !fecha.recordatorio ||
        fecha.recordatorio === "ninguno"
    ) {
        return null;
    }

    const proximaFecha =
        obtenerProximaFecha(fecha.fecha);

    const partesHora =
        fecha.hora.split(":");

    const horas =
        parseInt(partesHora[0], 10);

    const minutos =
        parseInt(partesHora[1], 10);

    proximaFecha.setHours(
        horas,
        minutos,
        0,
        0
    );

    const minutosRecordatorio =
        parseInt(fecha.recordatorio, 10);

    proximaFecha.setMinutes(
        proximaFecha.getMinutes() -
        minutosRecordatorio
    );

    return proximaFecha;
}

function verificarRecordatorioFecha(fecha) {

    const momentoRecordatorio =
        obtenerMomentoRecordatorio(fecha);

    if (!momentoRecordatorio) {
        return false;
    }

    const ahora =
        new Date();

    return ahora >= momentoRecordatorio;
}


function obtenerAñoRecordatorio(fecha) {

    if (
        !fecha ||
        !fecha.fecha
    ) {
        return null;
    }

    const proximaFecha =
        obtenerProximaFecha(fecha.fecha);

    return proximaFecha.getFullYear();
}


function debeProcesarRecordatorio(fecha) {

    if (
        !fecha ||
        !fecha.hora ||
        !fecha.recordatorio ||
        fecha.recordatorio === "ninguno"
    ) {
        return false;
    }

    const recordatorioLlegado =
        verificarRecordatorioFecha(fecha);

    if (!recordatorioLlegado) {
        return false;
    }

    const añoRecordatorio =
        obtenerAñoRecordatorio(fecha);

    if (
        fecha.recordatorioProcesado ===
        añoRecordatorio
    ) {
        return false;
    }

    return true;
}


function marcarRecordatorioProcesado(fecha) {

    if (!fecha) {
        return;
    }

    const añoRecordatorio =
        obtenerAñoRecordatorio(fecha);

    if (añoRecordatorio === null) {
        return;
    }

    fecha.recordatorioProcesado =
        añoRecordatorio;

    guardarFechas();
}


function procesarRecordatorioFecha(fecha) {

    if (!debeProcesarRecordatorio(fecha)) {
        return false;
    }

    marcarRecordatorioProcesado(fecha);

    return true;
}

function revisarRecordatoriosFechas() {

    fechasImportantes.forEach(function(fecha) {

        procesarRecordatorioFecha(fecha);

    });
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker.register("service-worker.js")
            .then(function() {
                console.log("MiAppPersonal: Service Worker registrado");
            })
            .catch(function(error) {
                console.error("Error al registrar Service Worker:", error);
            });
    });
}





let fechasImportantes =
    JSON.parse(localStorage.getItem("fechasImportantes")) || [];


function formatearFecha(fecha) {

    const fechaObjeto =
        new Date(fecha + "T00:00:00");

    const opciones = {
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    return fechaObjeto.toLocaleDateString(
        "es-MX",
        opciones
    );
}


function calcularDiasFaltantes(fecha) {

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    const proximaFecha =
        obtenerProximaFecha(fecha);

    const diferencia =
        proximaFecha - hoy;

    const dias =
        Math.round(
            diferencia /
            (1000 * 60 * 60 * 24)
        );

    return dias;
}

function obtenerTextoProximidad(fecha) {

    const dias =
        calcularDiasFaltantes(fecha);

    if (dias === 0) {
        return "🎉 ¡Es hoy!";
    }

    if (dias === 1) {
        return "🔔 ¡Mañana!";
    }

    return "⏳ En " + dias + " días";
}


function obtenerNombreMes(fecha) {

    const fechaObjeto =
        new Date(fecha);

    const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
    ];

    return meses[fechaObjeto.getMonth()];
}



function esFechaEsteMes(fecha) {

    const hoy = new Date();

    const fechaOriginal =
        new Date(fecha + "T00:00:00");

    return (
        fechaOriginal.getMonth() === hoy.getMonth()
    );
}

function guardarFechas() {
    localStorage.setItem(
        "fechasImportantes",
        JSON.stringify(fechasImportantes)
    );
}


function agregarFecha() {

    const nombre =
        document.getElementById("nombreFecha").value.trim();

    const tipo =
        document.getElementById("tipoFecha").value;

    const fecha =
        document.getElementById("fechaImportante").value;

    const hora = 
         document.getElementById("horaImportante").value;

    const recordatorio =
        document.getElementById("recordatorioFecha").value;

    if (nombre === "") {
        alert("Escribe el nombre de la fecha.");
        return;
    }

    if (fecha === "") {
        alert("Selecciona una fecha.");
        return;
    }

    const nuevaFecha = {
        nombre: nombre,
        tipo: tipo,
        fecha: fecha,
        hora: hora,
        recordatorio: recordatorio,
        recordatorioProcesado: null

    };

    fechasImportantes.push(nuevaFecha);

    guardarFechas();

    mostrarFechas();

    document.getElementById("nombreFecha").value = "";
    document.getElementById("tipoFecha").value = "cumpleanos";
    document.getElementById("fechaImportante").value = "";
    document.getElementById("horaImportante").value = "";
    document.getElementById("recordatorioFecha").value = "ninguno";
}




function eliminarFechaImportante(indice) {

    const confirmar =
        confirm("¿Seguro que quieres eliminar esta fecha?");

    if (!confirmar) {
        return;
    }

    fechasImportantes.splice(indice, 1);

    guardarFechas();

    mostrarFechas();
       }


     
function editarFechaImportante(indice) {

    window.fechaEditando = indice;

    const fecha = fechasImportantes[indice];

    document.getElementById("editarNombreFecha").value =
        fecha.nombre || "";

    document.getElementById("editarTipoFecha").value =
        fecha.tipo || "importante";

    document.getElementById("editarFechaImportante").value =
        fecha.fecha || "";

    document.getElementById("editarHoraImportante").value =
        fecha.hora || "";

    document.getElementById("editarRecordatorioFecha").value =
        fecha.recordatorio || "ninguno";

    document.getElementById("ventanaEdicionFecha").style.display =
        "flex";
}



function guardarEdicionFecha() {

    const nombre =
        document.getElementById("editarNombreFecha").value.trim();

    const tipo =
        document.getElementById("editarTipoFecha").value;

    const fecha =
        document.getElementById("editarFechaImportante").value;

    const hora =
        document.getElementById("editarHoraImportante").value;

    const recordatorio =
        document.getElementById("editarRecordatorioFecha").value;

    if (nombre === "") {
        alert("El nombre no puede estar vacío.");
        return;
    }

    if (fecha === "") {
        alert("Selecciona una fecha.");
        return;
    }

    const indice =
        window.fechaEditando;

    if (indice === undefined) {
        return;
    }

    fechasImportantes[indice].nombre = nombre;
    fechasImportantes[indice].tipo = tipo;
    fechasImportantes[indice].fecha = fecha;
    fechasImportantes[indice].hora = hora;
    fechasImportantes[indice].recordatorio = recordatorio;
    fechasImportantes[indice].recordatorioProcesado = null;

    guardarFechas();

    window.fechaEditando = undefined;

    document.getElementById("ventanaEdicionFecha").style.display =
        "none";

    mostrarFechas();
}



function cancelarEdicionFecha() {

    document.getElementById("ventanaEdicionFecha").style.display =
        "none";

    window.fechaEditando = undefined;
}


function actualizarTituloMesAgenda() {

    const titulo =
        document.getElementById("mesAgendaTitulo");

    if (!titulo) {
        return;
    }

    const fecha =
        new Date(
            mesAgendaSeleccionado.año,
            mesAgendaSeleccionado.mes,
            1
        );

    const nombreMes =
        fecha.toLocaleDateString("es-MX", {
            month: "long",
            year: "numeric"
        });

    const mesCapitalizado =
        nombreMes.charAt(0).toUpperCase() +
        nombreMes.slice(1);

    titulo.textContent =
        mesCapitalizado;
}

function esMesAgendaSeleccionado(fecha) {

    const fechaAgenda =
        new Date(fecha + "T00:00:00");

    return (
        fechaAgenda.getMonth() ===
            mesAgendaSeleccionado.mes
        &&
        fechaAgenda.getFullYear() ===
            mesAgendaSeleccionado.año
    );

}

function mesAgendaAnterior() {

    mesAgendaSeleccionado.mes--;

    if (mesAgendaSeleccionado.mes < 0) {

        mesAgendaSeleccionado.mes = 11;
        mesAgendaSeleccionado.año--;

    }

    actualizarTituloMesAgenda();

}

function mesAgendaSiguiente() {

    mesAgendaSeleccionado.mes++;

    if (mesAgendaSeleccionado.mes > 11) {

        mesAgendaSeleccionado.mes = 0;
        mesAgendaSeleccionado.año++;

    }

    actualizarTituloMesAgenda();

}

function obtenerMesAgendaActual() {

    const ahora = new Date();

    return {
        mes: ahora.getMonth(),
        año: ahora.getFullYear()
    };
}


function mostrarFechas() {



    const lista =
        document.getElementById("listaFechas");

    lista.innerHTML = "";

    document
        .getElementById("seccionFechas")
        .scrollIntoView({
            behavior: "smooth"
        });


    fechasImportantes.sort(function(a, b) {

        const proximaA =
            obtenerProximaFecha(a.fecha);

        const proximaB =
            obtenerProximaFecha(b.fecha);

        return proximaA - proximaB;

    });


    const proximaFechaAgenda =
        fechasImportantes.length > 0
            ? fechasImportantes[0]
            : null;


    /* =====================================
       MES ACTUAL
       ===================================== */

    const contenedorEsteMes =
        document.createElement("div");

    let contenedorTarjetasEsteMes = null;

    let tituloEsteMesMostrado = false;


    /* =====================================
       MES DE PRÓXIMAMENTE
       ===================================== */

    const contenedorProximamente =
        document.createElement("div");


    /* =====================================
       ESTABLECER MES DE PRÓXIMAMENTE
       ===================================== */

       

    if (mesAgendaSeleccionado === null) {

        mesAgendaSeleccionado =
            obtenerMesAgendaActual();

        mesAgendaSeleccionado.mes++;

        if (mesAgendaSeleccionado.mes > 11) {

            mesAgendaSeleccionado.mes = 0;

            mesAgendaSeleccionado.año++;

        }

    }


    const gruposPorMes = {};


    /* =====================================
       CREAR TARJETAS
       ===================================== */

    fechasImportantes.forEach(function(fecha, indice) {

        const elemento =
            document.createElement("div");

        let informacionHora = "";

         if (fecha.hora) {

        informacionHora =
           '<div>🕐 ' +
          fecha.hora +
          '</div>';

        }

        elemento.className =
            "fecha-importante";

        elemento.dataset.tipo =
            fecha.tipo;


        /* Próxima fecha destacada */

        if (fecha === proximaFechaAgenda) {

            elemento.classList.add(
                "proxima-fecha"
            );

        }


        let tituloProximaFecha = "";


        if (fecha === proximaFechaAgenda) {

            tituloProximaFecha =
                '<div class="titulo-proxima-fecha">' +
                '⭐ Próxima fecha' +
                '</div>';

        }


        /* Icono */

        let icono = "📅";


        if (fecha.tipo === "cumpleanos") {
            icono = "🎂";
        }


        if (fecha.tipo === "aniversario") {
            icono = "❤️";
        }


        /* Información de edad */

        let informacionEdad = "";

        
        let recordatorioFecha =
        "🔕 Sin recordatorio";

        if (fecha.recordatorio === "5") {
        recordatorioFecha =
        "🔔 5 minutos antes";
         }

       if (fecha.recordatorio === "15") {
       recordatorioFecha =
        "🔔 15 minutos antes";
         }

       if (fecha.recordatorio === "30") {
        recordatorioFecha =
        "🔔 30 minutos antes";
       }

       if (fecha.recordatorio === "60") {
       recordatorioFecha =
        "🔔 1 hora antes";
       }

        if (fecha.recordatorio === "1440") {
        recordatorioFecha =
        "🔔 1 día antes";
        }



        let momentoRecordatorio =
         obtenerMomentoRecordatorio(fecha);

        let informacionRecordatorio =
          "";

        if (momentoRecordatorio) {

         informacionRecordatorio =
          '<div>⏰ Recordatorio: ' +
          momentoRecordatorio.toLocaleDateString() +
          " " +
          momentoRecordatorio.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
           }) +
          '</div>';

        }


        const fechaRegistro =
            new Date(
                fecha.fecha + "T00:00:00"
            );


        const hoy =
            new Date();


        if (fecha.tipo === "cumpleanos") {

            const edad =
            calcularEdad(fecha.fecha);


            const esCumpleanos =
                fechaRegistro.getMonth() ===
                    hoy.getMonth() &&
                fechaRegistro.getDate() ===
                    hoy.getDate();


            informacionEdad =
                '<div>🎂 ' +
                edad +
                ' años</div>';


            if (esCumpleanos) {

                informacionEdad +=
                    '<div>🎉 ¡Hoy es el cumpleaños de ' +
                    fecha.nombre +
                    '!</div>';

            }

        }


        if (fecha.tipo === "aniversario") {

            const años =
                hoy.getFullYear() -
                fechaRegistro.getFullYear();


            const aunNoLlega =
                hoy.getMonth() <
                    fechaRegistro.getMonth() ||
                (
                    hoy.getMonth() ===
                        fechaRegistro.getMonth() &&
                    hoy.getDate() <
                        fechaRegistro.getDate()
                );


            const añosAniversario =
                aunNoLlega
                    ? años - 1
                    : años;


            const esAniversario =
                fechaRegistro.getMonth() ===
                    hoy.getMonth() &&
                fechaRegistro.getDate() ===
                    hoy.getDate();


            informacionEdad =
                '<div>❤️ ' +
                añosAniversario +
                ' años</div>';


            if (esAniversario) {

                informacionEdad +=
                    '<div>🎉 ¡Hoy es ' +
                    fecha.nombre +
                    '!</div>';

            }

        }


        /* Proximidad */

        const textoProximidad =
            obtenerTextoProximidad(
                fecha.fecha
            );


        const informacionDias =
            '<div>' +
            textoProximidad +
            '</div>';


        /* Contenido tarjeta */

        elemento.innerHTML =

            '<div class="contenido-fecha">' +

            tituloProximaFecha +

            '<strong>' +
            icono +
            " " +
            fecha.nombre +
            '</strong>' +

            '<div>📅 ' +
            formatearFecha(fecha.fecha) +
            '</div>' +

           informacionHora +

           informacionEdad +

           informacionDias +

           '<div>' +
           recordatorioFecha +
           '</div>' +

informacionRecordatorio +

          '<div class="acciones-fecha">' +


            '<button onclick="editarFechaImportante(' +
            indice +
            ')">✏️ Editar</button>' +

            '<button onclick="eliminarFechaImportante(' +
            indice +
            ')">🗑️ Eliminar</button>' +

            '</div>' +

            '</div>';


        /* =====================================
           ¿ES DEL MES ACTUAL?
           ===================================== */

        const proximaFecha =
            obtenerProximaFecha(
                fecha.fecha
            );


        const hoyActual =
            new Date();


        const esEsteMes =
            proximaFecha.getMonth() ===
                hoyActual.getMonth() &&
            proximaFecha.getFullYear() ===
                hoyActual.getFullYear();


        if (esEsteMes) {

            if (!tituloEsteMesMostrado) {

                const titulo =
                    document.createElement("h2");


                const nombreMes =
                    hoyActual.toLocaleDateString(
                        "es-MX",
                        {
                            month: "long"
                        }
                    );


                const mesCapitalizado =
                    nombreMes.charAt(0).toUpperCase() +
                    nombreMes.slice(1);


                titulo.textContent =
                    "🗓️ Este mes — " +
                    mesCapitalizado;


                contenedorEsteMes.appendChild(
                    titulo
                );


                tituloEsteMesMostrado = true;

            }


            if (!contenedorTarjetasEsteMes) {

                contenedorTarjetasEsteMes =
                    document.createElement("div");


                contenedorTarjetasEsteMes.className =
                    "contenedor-fechas-grid";


                contenedorEsteMes.appendChild(
                    contenedorTarjetasEsteMes
                );

            }


            contenedorTarjetasEsteMes.appendChild(
                elemento
            );


        } else {

            /* =====================================
               PRÓXIMAMENTE
               SOLO MES SELECCIONADO
               ===================================== */

            const mesFecha =
                proximaFecha.getMonth();


            const añoFecha =
                proximaFecha.getFullYear();



                if (
                    mesFecha !== mesAgendaSeleccionado.mes ||
                    añoFecha !== mesAgendaSeleccionado.año
                ) {

                    return;

                }


            const nombreMes =
                obtenerNombreMes(
                    proximaFecha
                );


            const añoMes =
                proximaFecha.getFullYear();


            const claveMes =
                añoMes +
                "-" +
                proximaFecha.getMonth();


            if (!gruposPorMes[claveMes]) {

                gruposPorMes[claveMes] = {

                    nombre: nombreMes,

                    año: añoMes,

                    contenedor:
                        document.createElement("div")

                };

            }


            gruposPorMes[claveMes]
                .contenedor
                .appendChild(elemento);

        }

    });


    /* =====================================
       MOSTRAR ESTE MES
       ===================================== */

    if (tituloEsteMesMostrado) {

        lista.appendChild(
            contenedorEsteMes
        );

    }


    /* =====================================
       MOSTRAR PRÓXIMAMENTE
       ===================================== */

    const clavesMeses =
    Object.keys(gruposPorMes);


/* =====================================
   PRÓXIMAMENTE
   ===================================== */

const tituloProximamente =
    document.createElement("h2");

tituloProximamente.textContent =
    "🔜 Próximamente";

lista.appendChild(
    tituloProximamente
);


/* =====================================
   NAVEGACIÓN DEL MES
   ===================================== */

const navegacionMes =
    document.createElement("div");

navegacionMes.id =
    "navegacionMesAgenda";

navegacionMes.className =
    "navegacion-mes-agenda";


const botonAnterior =
    document.createElement("button");

botonAnterior.textContent =
    "‹";


botonAnterior.onclick =
    function() {

        mesAgendaSeleccionado.mes--;

        if (mesAgendaSeleccionado.mes < 0) {

            mesAgendaSeleccionado.mes = 11;
            mesAgendaSeleccionado.año--;

        }

        mostrarFechas();

    };


const tituloMesSeleccionado =
    document.createElement("span");

tituloMesSeleccionado.textContent =
    obtenerNombreMes(
        new Date(
            mesAgendaSeleccionado.año,
            mesAgendaSeleccionado.mes,
            1
        )
    ) +
    " " +
    mesAgendaSeleccionado.año;


const botonSiguiente =
    document.createElement("button");

botonSiguiente.textContent =
    "›";


botonSiguiente.onclick =

    function() {

        mesAgendaSeleccionado.mes++;

        if (mesAgendaSeleccionado.mes > 11) {

            mesAgendaSeleccionado.mes = 0;
            mesAgendaSeleccionado.año++;

        }

        mostrarFechas();

    };


navegacionMes.appendChild(
    botonAnterior
);

navegacionMes.appendChild(
    tituloMesSeleccionado
);

navegacionMes.appendChild(
    botonSiguiente
);

lista.appendChild(
    navegacionMes
);


/* =====================================
   MOSTRAR TARJETAS DEL MES SELECCIONADO
   ===================================== */

clavesMeses.forEach(function(clave) {

    const grupo =
        gruposPorMes[clave];


    const tituloMes =
        document.createElement("h3");

    tituloMes.className =
        "titulo-mes-agenda";

    tituloMes.textContent =
        "📅 " +
        grupo.nombre +
        " " +
        grupo.año;


    lista.appendChild(
        tituloMes
    );


    grupo.contenedor.className =
        "contenedor-fechas-grid";


    lista.appendChild(
        grupo.contenedor
    );

});

}
let tipoFiltroActivo = null;
let mesAgendaSeleccionado = null;


function buscarFechas() {

    const textoBusqueda =
        document.getElementById("buscarFecha")
            .value
            .toLowerCase()
            .trim();

    const tarjetas =
        document.querySelectorAll(".fecha-importante");

    tarjetas.forEach(function(tarjeta) {

        const textoTarjeta =
            tarjeta.textContent.toLowerCase();

        const tipoFecha =
            tarjeta.dataset.tipo;

        const coincideTexto =
            textoBusqueda === "" ||
            textoTarjeta.includes(textoBusqueda);

        const coincideTipo =
            tipoFiltroActivo === null ||
            tipoFecha === tipoFiltroActivo;

        if (
            coincideTexto &&
            coincideTipo
        ) {

            tarjeta.style.display = "";

        } else {

            tarjeta.style.display = "none";
        }
    });
}

function limpiarBusqueda() {

    const buscador =
        document.getElementById("buscarFecha");

    buscador.value = "";

    tipoFiltroActivo = null;

    const botones =
        document.querySelectorAll(".filtros-fechas button");

    botones.forEach(function(boton) {

        boton.classList.remove("filtro-activo");

    });

    buscarFechas();
}


function filtrarFechasPorTipo(tipo) {

    tipoFiltroActivo = tipo;

    const botones =
        document.querySelectorAll(".filtros-fechas button");

    botones.forEach(function(boton) {

        boton.classList.remove("filtro-activo");

    });

    botones.forEach(function(boton) {

        if (
            boton.getAttribute("onclick") ===
            "filtrarFechasPorTipo('" + tipo + "')"
        ) {

            boton.classList.add("filtro-activo");

        }

    });

    buscarFechas();
}


function mostrarPantalla(id) {

    const pantallas = document.querySelectorAll(".pantalla");

    pantallas.forEach(function(pantalla) {
        pantalla.classList.remove("activa");
    });

    const ventanaEdicion =
        document.getElementById("ventanaEdicion");

    if (ventanaEdicion) {
        ventanaEdicion.style.display = "none";
    }

    const pantallaSeleccionada =
        document.getElementById(id);

    if (pantallaSeleccionada) {
        pantallaSeleccionada.classList.add("activa");
        pantallaSeleccionada.scrollIntoView({
            behavior: "smooth"
        });
    }
    if (id === "seccionFechas") {
        mostrarFechas();
    }
}

function mostrarInicio() {

    const pantallas = document.querySelectorAll(".pantalla");

    pantallas.forEach(function(pantalla) {
        pantalla.classList.remove("activa");
    });

    const ventanaEdicion =
        document.getElementById("ventanaEdicion");

    if (ventanaEdicion) {
        ventanaEdicion.style.display = "none";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

setInterval(function() {

    revisarRecordatoriosFechas();

}, 60000);


function probarRecordatoriosFechas() {

    fechasImportantes.forEach(function(fecha) {

        const debeProcesar =
            debeProcesarRecordatorio(fecha);

        console.log(
            "Recordatorio:",
            fecha.nombre,
            "| Debe procesarse:",
            debeProcesar,
            "| Procesado:",
            fecha.recordatorioProcesado
        );

    });
}


async function solicitarPermisoNotificaciones() {

    const permiso =
        await Notification.requestPermission();

    console.log(
        "Permiso de notificaciones:",
        permiso
    );

    if (permiso !== "granted") {

        console.log(
            "Las notificaciones no fueron autorizadas."
        );

        return;
    }

    try {

    console.log("PASO 1: Entró al bloque de notificaciones");

    const registro =
        await navigator.serviceWorker.ready;

    console.log("PASO 2: Service Worker listo");

    const { getMessaging, getToken } =
        await import(
            "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging.js"
        );

    console.log("PASO 3: Firebase Messaging cargado");

    const { app } =
        await import("./firebase-config.js");

    console.log("PASO 4: Firebase Config cargado");

    const messaging =
        getMessaging(app);

    console.log("PASO 5: Messaging creado");

    console.log("PASO 6: Intentando obtener token FCM");

const token =
    await getToken(messaging, {

        vapidKey:
            "BMPwZmDjhAjIT_-m8rbw4u2uIWFJGDRKPQzxEYUAOICcDIRb9SjWiYE08ZADbKXxgjaiGtpz6s19oXw2FQ809L4",

        serviceWorkerRegistration:
            registro

    });

console.log("PASO 7: Token FCM obtenido");

console.log(
    "Token FCM:",
    token
);

try {
    await navigator.clipboard.writeText(token);

    alert(
        "✅ Token FCM obtenido y COPIADO.\n\n" +
        "Ahora puedes pegarlo directamente en Firebase."
    );

} catch (error) {

    alert(
        "⚠️ El token se obtuvo, pero no se pudo copiar automáticamente."
    );

}

} catch (error) {

    console.error(
        "ERROR EN NOTIFICACIONES:",
        error
    );

    alert(
    "✅ Token FCM obtenido:\n\n" +
    token
    );

}

}
