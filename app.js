

let tareas = JSON.parse(localStorage.getItem("tareas")) || [];
let gastos = JSON.parse(localStorage.getItem("gastosFinanzas") || "[]");
let gastoEditando = null;

let tareaEditando = null;
let tipoFiltroActivo = null;
let mesContextual=new Date(new Date().getFullYear(),new Date().getMonth(),1),diaSeleccionado=claveDiaCalendario(new Date());
let aprendizajes=JSON.parse(localStorage.getItem("aprendizajes")||"[]"),aprendizajeEditando=null;
let entrenamientos=JSON.parse(localStorage.getItem("entrenamientos")||"[]"),entrenamientoEditando=null;
let pagosPendientes=JSON.parse(localStorage.getItem("pagosPendientes")||"[]"),pagoEditando=null;

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
        elemento.dataset.prioridad = tarea.prioridad || "ninguna";
        elemento.dataset.indice = indice;
        elemento.dataset.fecha = tarea.fecha || "";

        let informacion = tarea.fecha ? "📅 " + tarea.fecha : "📅 Sin fecha";
        if (tarea.hora) informacion += " · ⏰ " + tarea.hora;
        let prioridad = tarea.prioridad === "alta" ? "🔴 Alta" : tarea.prioridad === "baja" ? "🟢 Baja" : !tarea.prioridad || tarea.prioridad === "ninguna" ? "⚪ Sin prioridad" : "🟡 Media";
        let categoria = "📌 Otros";
        if (tarea.categoria === "trabajo") categoria = "💼 Trabajo";
        if (tarea.categoria === "personal") categoria = "👤 Personal";
        if (tarea.categoria === "familia") categoria = "🏠 Familia";
        if (tarea.categoria === "estudio") categoria = "📚 Estudio";

        let recordatorio = "🔕 Sin recordatorio";
        if (tarea.recordatorio === "5") recordatorio = "🔔 5 minutos antes";
        if (tarea.recordatorio === "15") recordatorio = "🔔 15 minutos antes";
        if (tarea.recordatorio === "30") recordatorio = "🔔 30 minutos antes";
        if (tarea.recordatorio === "60") recordatorio = "🔔 1 hora antes";
        if (tarea.recordatorio === "1440") recordatorio = "🔔 1 día antes";
        let repeticion = "🔁 No repetir";
        if (tarea.repeticion === "diaria") repeticion = "🔁 Cada día";
        if (tarea.repeticion === "semanal") repeticion = "🔁 Cada semana";
        if (tarea.repeticion === "quincenal") repeticion = "🔁 Cada 2 semanas";
        if (tarea.repeticion === "mensual") repeticion = "🔁 Cada mes";
        if (tarea.repeticion === "anual") repeticion = "🔁 Cada año";

        const completadaEnDiaSeleccionado = tareaCompletadaEnFecha(tarea, diaSeleccionado);
        const ocurreEnDiaSeleccionado = tareaOcurreEnFecha(tarea, diaSeleccionado);
        const repeticionHasta = tarea.repeticion && tarea.repeticion !== "ninguna"
            ? (tarea.repeticionHasta ? " · Se repetirá hasta " + formatoFechaCorta(tarea.repeticionHasta) : " · Sin fecha límite")
            : "";
        elemento.innerHTML =
            '<input type="checkbox" ' + (completadaEnDiaSeleccionado ? "checked" : "") + (ocurreEnDiaSeleccionado ? "" : " disabled") + ' onchange="completarTarea(' + indice + ', diaSeleccionado)">' +
            '<div class="contenido-tarea">' +
            '<strong>' + tarea.texto + '</strong>' +
            '<div>' + informacion + '</div>' +
            '<div>' + prioridad + " · " + categoria + '</div>' +
            '<div>' + recordatorio + " · " + repeticion + repeticionHasta + '</div>' +
            '<div class="acciones-tarea">' +
            '<button onclick="editarTarea(' + indice + ')">✏️ Editar</button>' +
            '<button onclick="eliminarTarea(' + indice + ')">🗑️ Eliminar</button>' +
            '</div></div>';
        lista.appendChild(elemento);
    });

    filtrarTareas();
    if (typeof actualizarCalendarioContextual === "function") actualizarCalendarioContextual();
}

function formatoFechaCorta(fecha) {
    if (!fecha) return "";
    const [anio, mes, dia] = fecha.split("-").map(Number);
    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return dia + "-" + meses[mes - 1] + "-" + anio;
}

function tareaCompletadaEnFecha(tarea, fechaClave) {
    if (!tarea) return false;
    if (!tarea.repeticion || tarea.repeticion === "ninguna") return Boolean(tarea.completada);
    if (tarea.completada) return true;
    return Array.isArray(tarea.fechasCompletadas) && tarea.fechasCompletadas.includes(fechaClave);
}

function tareaOcurreEnFecha(tarea, fechaClave) {
    if (!tarea || !tarea.fecha || !fechaClave) return false;
    const partesInicio = tarea.fecha.split("-").map(Number);
    const partesObjetivo = fechaClave.split("-").map(Number);
    if (partesInicio.length !== 3 || partesObjetivo.length !== 3 || partesInicio.some(Number.isNaN) || partesObjetivo.some(Number.isNaN)) return false;

    const [anioInicio, mesInicio, diaInicio] = partesInicio;
    const [anioObjetivo, mesObjetivo, diaObjetivo] = partesObjetivo;
    const inicioUTC = Date.UTC(anioInicio, mesInicio - 1, diaInicio);
    const objetivoUTC = Date.UTC(anioObjetivo, mesObjetivo - 1, diaObjetivo);
    const diasDesdeInicio = Math.round((objetivoUTC - inicioUTC) / 86400000);
    if (diasDesdeInicio < 0) return false;
    if (tarea.repeticionHasta && fechaClave > tarea.repeticionHasta) return false;

    const repeticion = tarea.repeticion || "ninguna";
    if (repeticion === "diaria") return true;
    if (repeticion === "semanal") return diasDesdeInicio % 7 === 0;
    if (repeticion === "quincenal") return diasDesdeInicio % 14 === 0;

    const mesesDesdeInicio = (anioObjetivo - anioInicio) * 12 + (mesObjetivo - mesInicio);
    if (repeticion === "mensual") {
        if (mesesDesdeInicio < 0) return false;
        const ultimoDiaDelMes = new Date(Date.UTC(anioObjetivo, mesObjetivo, 0)).getUTCDate();
        return diaObjetivo === Math.min(diaInicio, ultimoDiaDelMes);
    }
    if (repeticion === "anual") {
        if (anioObjetivo < anioInicio || mesObjetivo !== mesInicio) return false;
        const ultimoDiaDelMes = new Date(Date.UTC(anioObjetivo, mesObjetivo, 0)).getUTCDate();
        return diaObjetivo === Math.min(diaInicio, ultimoDiaDelMes);
    }
    return diasDesdeInicio === 0;
}
function filtrarTareas() {
    const texto = (document.getElementById("buscarTarea")?.value || "").trim().toLocaleLowerCase("es-MX");
    const prioridad = document.getElementById("filtroPrioridadTarea")?.value || "";
    const buscarEnTodasLasFechas = Boolean(texto || prioridad);
    const tarjetas = document.querySelectorAll("#listaTareas .tarea");
    let visibles = 0;

    tarjetas.forEach(function(tarjeta) {
        const coincideTexto = !texto || tarjeta.textContent.toLocaleLowerCase("es-MX").includes(texto);
        const coincidePrioridad = !prioridad || tarjeta.dataset.prioridad === prioridad;
        const tarea = tareas[Number(tarjeta.dataset.indice)];
        const coincideFecha = buscarEnTodasLasFechas || tareaOcurreEnFecha(tarea, diaSeleccionado);
        const mostrar = coincideTexto && coincidePrioridad && coincideFecha;
        tarjeta.hidden = !mostrar;
        if (mostrar) visibles++;
    });

    const contador = document.getElementById("contadorTareasFiltradas");
    const estado = document.getElementById("estadoFiltrosTareas");
    if (contador) {
        const total = tareas.length;
        contador.textContent = buscarEnTodasLasFechas
            ? visibles + (visibles === 1 ? " tarea encontrada" : " tareas encontradas") + " de " + total
            : visibles + (visibles === 1 ? " tarea para este día" : " tareas para este día");
    }
    if (estado) {
        estado.hidden = visibles > 0;
        estado.textContent = buscarEnTodasLasFechas
            ? "No hay tareas que coincidan. Cambia o limpia los filtros."
            : "No hay tareas para este día. Selecciona otra fecha en el calendario o usa los filtros para buscar.";
    }
}

function limpiarFiltrosTareas() {
    document.getElementById("buscarTarea").value = "";
    document.getElementById("filtroPrioridadTarea").value = "";
    filtrarTareas();
}

function agregarTarea() {
    tareaEditando = null;
    document.getElementById("editarTexto").value = "";
    document.getElementById("editarFecha").value = "";
    document.getElementById("editarHora").value = "";
    document.getElementById("editarPrioridad").value = "media";
    document.getElementById("editarCategoria").value = "trabajo";
    document.getElementById("editarRecordatorio").value = "ninguno";
    document.getElementById("editarRepeticion").value = "ninguna";
    document.getElementById("editarRepeticionHasta").value = "";
    actualizarCampoFinRepeticion();
    document.getElementById("tituloEdicionTarea").textContent = "➕ Nueva tarea";
    document.getElementById("botonGuardarTarea").textContent = "Agregar tarea";
    document.getElementById("ventanaEdicion").style.display = "flex";
    document.getElementById("editarTexto").focus();
}
function completarTarea(indice, fechaClave = diaSeleccionado) {
    const tarea = tareas[indice];
    if (!tarea || !tareaOcurreEnFecha(tarea, fechaClave)) return;
    if (tarea.repeticion && tarea.repeticion !== "ninguna") {
        if (tarea.completada) {
            tarea.completada = false;
            tarea.fechasCompletadas = [];
        } else {
            if (!Array.isArray(tarea.fechasCompletadas)) tarea.fechasCompletadas = [];
            const posicion = tarea.fechasCompletadas.indexOf(fechaClave);
            if (posicion >= 0) tarea.fechasCompletadas.splice(posicion, 1);
            else tarea.fechasCompletadas.push(fechaClave);
        }
    } else {
        tarea.completada = !tarea.completada;
    }
    guardarTareas();
    mostrarListaTareas();
}

function editarTarea(indice) {
    const tarea = tareas[indice];
    if (!tarea) return;
    tareaEditando = indice;
    document.getElementById("editarTexto").value = tarea.texto || "";
    document.getElementById("editarFecha").value = tarea.fecha || "";
    document.getElementById("editarHora").value = tarea.hora || "";
    document.getElementById("editarPrioridad").value = tarea.prioridad || "ninguna";
    document.getElementById("editarCategoria").value = tarea.categoria || "otros";
    document.getElementById("editarRecordatorio").value = tarea.recordatorio || "ninguno";
    document.getElementById("editarRepeticion").value = tarea.repeticion || "ninguna";
    document.getElementById("editarRepeticionHasta").value = tarea.repeticionHasta || "";
    actualizarCampoFinRepeticion();
    document.getElementById("tituloEdicionTarea").textContent = "✏️ Editar tarea";
    document.getElementById("botonGuardarTarea").textContent = "Guardar cambios";
    document.getElementById("ventanaEdicion").style.display = "flex";
    document.getElementById("editarTexto").focus();
}
function cerrarEdicion() {

    tareaEditando = null;

    document.getElementById("ventanaEdicion").style.display =
        "none";
}

function actualizarCampoFinRepeticion() {
    const repeticion = document.getElementById("editarRepeticion").value;
    const grupo = document.getElementById("grupoFinRepeticion");
    const campo = document.getElementById("editarRepeticionHasta");
    const mostrar = repeticion !== "ninguna";
    grupo.hidden = !mostrar;
    campo.required = mostrar;
    if (!mostrar) campo.value = "";
}

function guardarEdicion() {
    const texto = document.getElementById("editarTexto").value.trim();
    if (texto === "") {
        alert("Escribe el nombre de la tarea.");
        document.getElementById("editarTexto").focus();
        return;
    }
    const fecha = document.getElementById("editarFecha").value;
    const repeticion = document.getElementById("editarRepeticion").value;
    const repeticionHasta = document.getElementById("editarRepeticionHasta").value;
    if (repeticion !== "ninguna" && !fecha) {
        alert("Selecciona la fecha de inicio para la tarea que se repetirá.");
        document.getElementById("editarFecha").focus();
        return;
    }
    if (repeticion !== "ninguna" && !repeticionHasta) {
        alert("Selecciona hasta qué fecha se repetirá la tarea.");
        document.getElementById("editarRepeticionHasta").focus();
        return;
    }
    if (repeticion !== "ninguna" && fecha && repeticionHasta < fecha) {
        alert("La fecha final debe ser igual o posterior a la fecha de inicio.");
        document.getElementById("editarRepeticionHasta").focus();
        return;
    }
    const tareaAnterior = tareaEditando === null ? null : tareas[tareaEditando];
    const mismaSerie = tareaAnterior && tareaAnterior.fecha === fecha && (tareaAnterior.repeticion || "ninguna") === repeticion;
    const nuevaTarea = {
        texto,
        fecha,
        hora: document.getElementById("editarHora").value,
        prioridad: document.getElementById("editarPrioridad").value,
        categoria: document.getElementById("editarCategoria").value,
        recordatorio: document.getElementById("editarRecordatorio").value,
        repeticion,
        repeticionHasta: repeticion === "ninguna" ? "" : repeticionHasta,
        fechasCompletadas: mismaSerie && Array.isArray(tareaAnterior.fechasCompletadas) ? tareaAnterior.fechasCompletadas : [],
        completada: tareaEditando === null ? false : Boolean(tareaAnterior && tareaAnterior.completada)
    };
    if (tareaEditando === null) {
        tareas.push(nuevaTarea);
    } else {
        if (!tareas[tareaEditando]) return;
        tareas[tareaEditando] = nuevaTarea;
    }
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

    const ahora =
        new Date();

    const fechaOriginal =
        new Date(fecha.fecha + "T00:00:00");

    const fechaEsHoy =
        fechaOriginal.getMonth() === ahora.getMonth() &&
        fechaOriginal.getDate() === ahora.getDate();

    if (fechaEsHoy) {

        const eventoHoy =
            new Date(
                ahora.getFullYear(),
                fechaOriginal.getMonth(),
                fechaOriginal.getDate(),
                horas,
                minutos,
                0,
                0
            );

        if (eventoHoy >= ahora) {
            proximaFecha.setTime(eventoHoy.getTime());
        }

    }

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


async function procesarRecordatorioFecha(fecha) {

    if (!debeProcesarRecordatorio(fecha)) {
        return false;
    }

    if (
        typeof Notification === "undefined" ||
        Notification.permission !== "granted" ||
        !("serviceWorker" in navigator)
    ) {
        return false;
    }

    if (fecha.recordatorioEnProceso) {
        return false;
    }

    fecha.recordatorioEnProceso = true;

    try {

        const registro =
            await navigator.serviceWorker.ready;

        await registro.showNotification(
            "🔔 MiAppPersonal",
            {
                body:
                    "Es momento de: " +
                    (fecha.nombre || "una fecha importante"),
                icon: "Icono.png",
                badge: "Icono.png",
                data: {
                    url: "./index.html?abrir=agenda"
                }
            }
        );

        delete fecha.recordatorioEnProceso;

        marcarRecordatorioProcesado(fecha);

        return true;

    } catch (error) {

        console.error(
            "Error al mostrar el recordatorio:",
            error
        );

        return false;

    } finally {

        delete fecha.recordatorioEnProceso;

    }
}

async function revisarRecordatoriosFechas() {

    for (const fecha of fechasImportantes) {

        await procesarRecordatorioFecha(fecha);

    }
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
let agendaUsuarioUid = null;
let agendaVinculoActivo = false;
const fechasLocalesDePrueba = fechasImportantes.slice();

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
    const llave = agendaUsuarioUid ? "fechasImportantes:" + agendaUsuarioUid : "fechasImportantes";
    localStorage.setItem(llave, JSON.stringify(fechasImportantes));
}
function mensajeAgenda(texto, error) {
    const estado = document.getElementById("estadoSincronizacionAgenda");
    if (estado) { estado.textContent = texto; estado.dataset.error = error ? "true" : "false"; }
}
function actualizarControlCompartir() {
    const nuevo = document.getElementById("compartirNuevaFecha");
    const ayuda = document.getElementById("ayudaCompartirNuevaFecha");
    if (nuevo) {
        nuevo.disabled = !agendaUsuarioUid || !agendaVinculoActivo;
        if (ayuda) ayuda.textContent = !agendaUsuarioUid ? "Inicia sesión para sincronizar. Las fechas de prueba siguen locales." : (!agendaVinculoActivo ? "Vincula las dos cuentas antes de compartir." : "Si no marcas la casilla, la fecha será privada.");
    }
}

function abrirNuevaFecha() {
    window.modoFechaEspecial = "crear";
    window.fechaEditando = undefined;
    document.getElementById("editarNombreFecha").value = "";
    document.getElementById("editarTipoFecha").value = "cumpleanos";
    document.getElementById("editarFechaImportante").value = "";
    document.getElementById("editarHoraImportante").value = "";
    document.getElementById("editarRecordatorioFecha").value = "ninguno";
    const compartir = document.getElementById("editarCompartirFecha");
    compartir.checked = false;
    compartir.disabled = !agendaUsuarioUid || !agendaVinculoActivo;
    document.getElementById("ayudaEditarCompartirFecha").textContent = !agendaUsuarioUid ? "Las fechas nuevas son privadas por defecto. Inicia sesión para sincronizarlas." : (!agendaVinculoActivo ? "Las fechas nuevas son privadas. Vincula las cuentas para compartir." : "Si no marcas la casilla, la fecha será privada.");
    document.getElementById("tituloEdicionFecha").textContent = "＋ Nueva fecha especial";
    document.getElementById("botonGuardarFecha").textContent = "Guardar fecha";
    document.getElementById("ventanaEdicionFecha").style.display = "flex";
    document.getElementById("editarNombreFecha").focus();
}

async function agregarFecha() {
    abrirNuevaFecha();
}

async function eliminarFechaImportante(indice) {
    const fecha = fechasImportantes[indice]; if (!fecha) return;
    if (agendaUsuarioUid && fecha.ownerUid !== agendaUsuarioUid) { alert("Solo puedes eliminar las fechas que creaste."); return; }
    if (!confirm("¿Seguro que quieres eliminar esta fecha?")) return;
    try { if (agendaUsuarioUid && fecha.id) await window.miappAgendaCloud.eliminar(fecha); fechasImportantes.splice(indice, 1); guardarFechas(); mostrarFechas(); }
    catch (error) { alert(error.message || "No se pudo eliminar la fecha."); }
}


function editarFechaImportante(indice) {
    window.fechaEditando = indice;
    window.modoFechaEspecial = "editar";

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
    const controlCompartir = document.getElementById("editarCompartirFecha");
    const ayudaCompartir = document.getElementById("ayudaEditarCompartirFecha");
    const esPropia = !agendaUsuarioUid || fecha.ownerUid === agendaUsuarioUid;
    controlCompartir.checked = Boolean(fecha.sharedWithUids && fecha.sharedWithUids.length);
    controlCompartir.disabled = !agendaUsuarioUid || !esPropia || !agendaVinculoActivo;
    ayudaCompartir.textContent = !agendaUsuarioUid ? "Las fechas de prueba siguen siendo locales." : (!esPropia ? "Puedes editar esta fecha compartida; solo quien la creó puede cambiar quién la ve." : (!agendaVinculoActivo ? "Vincula las cuentas para cambiar el uso compartido." : "Sin marcar, esta fecha será privada."));

    document.getElementById("tituloEdicionFecha").textContent = "✏️ Editar fecha especial";
    document.getElementById("botonGuardarFecha").textContent = "Guardar cambios";
    document.getElementById("ventanaEdicionFecha").style.display = "flex";
    document.getElementById("editarNombreFecha").focus();
}



async function guardarEdicionFecha() {
    const nombre = document.getElementById("editarNombreFecha").value.trim();
    const tipo = document.getElementById("editarTipoFecha").value;
    const fecha = document.getElementById("editarFechaImportante").value;
    const hora = document.getElementById("editarHoraImportante").value;
    const recordatorio = document.getElementById("editarRecordatorioFecha").value;
    const compartir = document.getElementById("editarCompartirFecha").checked;
    if (!nombre) { alert("Escribe el nombre de la fecha."); return; }
    if (!fecha) { alert("Selecciona una fecha."); return; }

    const esNueva = window.modoFechaEspecial === "crear";
    const indice = window.fechaEditando;
    if (!esNueva && (indice === undefined || !fechasImportantes[indice])) return;

    const base = esNueva ? {} : fechasImportantes[indice];
    const registro = { ...base, nombre, tipo, fecha, hora, recordatorio, recordatorioProcesado: null };
    try {
        if (agendaUsuarioUid) {
            registro.id = base.id;
            const guardada = await window.miappAgendaCloud.guardar(registro, compartir);
            if (esNueva) fechasImportantes.push(guardada);
            else fechasImportantes[indice] = guardada;
            mensajeAgenda(esNueva ? "Fecha guardada en tu cuenta" + (compartir ? " y compartida." : " como privada.") : "Cambios guardados en tu cuenta.");
        } else {
            if (esNueva) fechasImportantes.push(registro);
            else fechasImportantes[indice] = registro;
            mensajeAgenda(esNueva ? "Fecha guardada solo en este dispositivo. Inicia sesión para sincronizar nuevas fechas." : "Cambios guardados solo en este dispositivo.");
        }
        guardarFechas();
        window.fechaEditando = undefined;
        window.modoFechaEspecial = undefined;
        document.getElementById("ventanaEdicionFecha").style.display = "none";
        mostrarFechas(true);
    } catch (error) { alert(error.message || "No se pudo guardar la fecha."); }
}

function cancelarEdicionFecha() {
    document.getElementById("ventanaEdicionFecha").style.display = "none";
    window.fechaEditando = undefined;
    window.modoFechaEspecial = undefined;
}


function fechaEspecialEnDia(fecha, claveDia) {
    if (!fecha || !fecha.fecha || !claveDia) return null;
    const original = new Date(fecha.fecha + "T00:00:00");
    if (Number.isNaN(original.getTime())) return null;
    if (fecha.tipo === "cumpleanos" || fecha.tipo === "aniversario") {
        const seleccionada = new Date(claveDia + "T00:00:00");
        if (original.getMonth() !== seleccionada.getMonth()) return null;
        const ultimoDia = new Date(seleccionada.getFullYear(), seleccionada.getMonth() + 1, 0).getDate();
        const diaAnual = Math.min(original.getDate(), ultimoDia);
        return diaAnual === seleccionada.getDate() ? claveDia : null;
    }
    return fecha.fecha === claveDia ? claveDia : null;
}

function fechaEspecialEnMes(fecha, anio, mes) {
    if (!fecha || !fecha.fecha) return null;
    const original = new Date(fecha.fecha + "T00:00:00");
    if (Number.isNaN(original.getTime())) return null;
    if (fecha.tipo === "cumpleanos" || fecha.tipo === "aniversario") {
        if (original.getMonth() !== mes) return null;
        const ultimoDia = new Date(anio, mes + 1, 0).getDate();
        return claveDiaCalendario(new Date(anio, mes, Math.min(original.getDate(), ultimoDia)));
    }
    return original.getFullYear() === anio && original.getMonth() === mes ? fecha.fecha : null;
}

function mostrarFechas(omitirDesplazamiento) {
    const lista = document.getElementById("listaFechas");
    if (!lista) return;
    lista.replaceChildren();
    if (!omitirDesplazamiento) document.getElementById("seccionFechas").scrollIntoView({ behavior: "smooth" });

    const textoBusqueda = (document.getElementById("buscarFecha")?.value || "").trim().toLocaleLowerCase("es-MX");
    const mostrarTodasLasFechas = Boolean(textoBusqueda || tipoFiltroActivo !== null);
    const fechaSeleccionada = mostrarTodasLasFechas ? null : diaSeleccionado;
    const registrosVisibles = fechasImportantes
        .map((fecha, indice) => ({ fecha, indice }))
        .filter(({ fecha }) => !tipoFiltroActivo || fecha.tipo === tipoFiltroActivo)
        .filter(({ fecha }) => !textoBusqueda || (fecha.nombre || "").toLocaleLowerCase("es-MX").includes(textoBusqueda) || (fecha.tipo || "").toLocaleLowerCase("es-MX").includes(textoBusqueda))
        .filter(({ fecha }) => mostrarTodasLasFechas || Boolean(fechaEspecialEnDia(fecha, fechaSeleccionada)));

    const encabezado = document.createElement("h2");
    encabezado.textContent = fechaSeleccionada
        ? "Fechas del " + new Date(fechaSeleccionada + "T00:00:00").toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        : "Fechas especiales encontradas";
    lista.appendChild(encabezado);

    const anioMes = mesContextual.getFullYear();
    const numeroMes = mesContextual.getMonth();
    const cumpleanosMes = fechasImportantes
        .map((fecha, indice) => ({ fecha, indice, fechaVista: fechaEspecialEnMes(fecha, anioMes, numeroMes) }))
        .filter(item => item.fecha.tipo === "cumpleanos" && item.fechaVista)
        .filter(item => !tipoFiltroActivo || item.fecha.tipo === tipoFiltroActivo)
        .filter(item => !textoBusqueda || (item.fecha.nombre || "").toLocaleLowerCase("es-MX").includes(textoBusqueda));

    if (cumpleanosMes.length) {
        const resumen = document.createElement("section");
        resumen.className = "resumen-cumpleanos";
        const tituloResumen = document.createElement("h3");
        tituloResumen.textContent = "🎂 Cumpleaños de " + mesContextual.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
        const fila = document.createElement("div");
        fila.className = "fila-cumpleanos";
        cumpleanosMes.sort((a, b) => a.fechaVista.localeCompare(b.fechaVista));
        cumpleanosMes.forEach(({ fecha, indice, fechaVista }) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "mini-tarjeta-cumpleanos";
            const nombre = document.createElement("strong");
            nombre.textContent = fecha.nombre || "Cumpleaños";
            const dia = document.createElement("span");
            dia.textContent = new Date(fechaVista + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" });
            const acciones = document.createElement("div");
            acciones.className = "acciones-mini-cumpleanos";
            const irAlDia = document.createElement("button");
            irAlDia.type = "button";
            irAlDia.textContent = "Ver día";
            irAlDia.onclick = function() {
                diaSeleccionado = fechaVista;
                actualizarCalendarioContextual();
                mostrarFechas(true);
            };
            const editar = document.createElement("button");
            editar.type = "button";
            editar.textContent = "Editar";
            editar.onclick = function() { editarFechaImportante(indice); };
            acciones.append(irAlDia, editar);
            tarjeta.append(nombre, dia, acciones);
            fila.appendChild(tarjeta);
        });
        resumen.append(tituloResumen, fila);
        lista.appendChild(resumen);
    }

    if (!registrosVisibles.length) {
        const vacio = document.createElement("p");
        vacio.className = "estado-vacio-fechas";
        vacio.textContent = fechaSeleccionada
            ? "No hay fechas especiales para este día. Elige otra fecha en el calendario o usa la búsqueda y los filtros."
            : "No hay fechas que coincidan con la búsqueda o el filtro.";
        lista.appendChild(vacio);
    }

    registrosVisibles.sort((a, b) => {
        const aFecha = fechaSeleccionada || fechaEspecialEnMes(a.fecha, anioMes, numeroMes) || a.fecha.fecha;
        const bFecha = fechaSeleccionada || fechaEspecialEnMes(b.fecha, anioMes, numeroMes) || b.fecha.fecha;
        return aFecha.localeCompare(bFecha);
    });
    registrosVisibles.forEach(({ fecha, indice }) => {
        const fechaVista = fechaSeleccionada || fechaEspecialEnMes(fecha, anioMes, numeroMes) || fecha.fecha;
        const tarjeta = document.createElement("article");
        tarjeta.className = "fecha-importante";
        tarjeta.dataset.tipo = fecha.tipo || "importante";
        const contenido = document.createElement("div");
        contenido.className = "contenido-fecha";
        const esCompartida = Boolean(fecha.sharedWithUids && fecha.sharedWithUids.length);
        const esPropia = !agendaUsuarioUid || !fecha.ownerUid || fecha.ownerUid === agendaUsuarioUid;
        const privacidad = document.createElement("span");
        privacidad.className = "etiqueta-privacidad";
        privacidad.textContent = !agendaUsuarioUid ? "Solo en este dispositivo" : esCompartida ? "Compartida" : "Privada";
        const icono = fecha.tipo === "cumpleanos" ? "🎂" : fecha.tipo === "aniversario" ? "❤️" : "🗓️";
        const nombre = document.createElement("strong");
        nombre.textContent = icono + " " + (fecha.nombre || "Fecha especial");
        const fechaTexto = document.createElement("div");
        fechaTexto.textContent = "📅 " + formatearFecha(fechaVista);
        contenido.append(privacidad, nombre, fechaTexto);
        if (fecha.hora) {
            const hora = document.createElement("div");
            hora.textContent = "🕐 " + fecha.hora;
            contenido.appendChild(hora);
        }
        if (fecha.tipo === "cumpleanos" || fecha.tipo === "aniversario") {
            const anioOriginal = new Date(fecha.fecha + "T00:00:00").getFullYear();
            const edad = document.createElement("div");
            edad.textContent = (fecha.tipo === "cumpleanos" ? "🎂 " : "❤️ ") + (new Date(fechaVista + "T00:00:00").getFullYear() - anioOriginal) + " años";
            contenido.appendChild(edad);
        }
        const recordatorios = { "5": "5 minutos antes", "15": "15 minutos antes", "30": "30 minutos antes", "60": "1 hora antes", "1440": "1 día antes" };
        const etiquetaRecordatorio = document.createElement("div");
        etiquetaRecordatorio.textContent = fecha.recordatorio && fecha.recordatorio !== "ninguno"
            ? "🔔 " + (recordatorios[fecha.recordatorio] || "Recordatorio")
            : "🔕 Sin recordatorio";
        contenido.appendChild(etiquetaRecordatorio);
        const momentoRecordatorio = obtenerMomentoRecordatorio(fecha);
        if (momentoRecordatorio) {
            const detalleRecordatorio = document.createElement("div");
            detalleRecordatorio.textContent = "⏰ Recordatorio: " + momentoRecordatorio.toLocaleDateString("es-MX") + " " + momentoRecordatorio.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
            contenido.appendChild(detalleRecordatorio);
        }
        const proximidad = document.createElement("div");
        proximidad.textContent = obtenerTextoProximidad(fechaVista);
        contenido.appendChild(proximidad);
        const acciones = document.createElement("div");
        acciones.className = "acciones-fecha";
        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "✏️ Editar";
        editar.onclick = function() { editarFechaImportante(indice); };
        acciones.appendChild(editar);
        if (esPropia) {
            const eliminar = document.createElement("button");
            eliminar.type = "button";
            eliminar.textContent = "🗑️ Eliminar";
            eliminar.onclick = function() { eliminarFechaImportante(indice); };
            acciones.appendChild(eliminar);
        }
        contenido.appendChild(acciones);
        tarjeta.appendChild(contenido);
        lista.appendChild(tarjeta);
    });
    buscarFechas();
    if (typeof actualizarCalendarioContextual === "function") actualizarCalendarioContextual();
}
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
    const contador = document.getElementById("contadorFechas");
    if (contador) {
        const visibles = Array.from(tarjetas).filter(tarjeta => tarjeta.style.display !== "none").length;
        contador.textContent = visibles + (visibles === 1 ? " resultado" : " resultados");
    }

}

function limpiarBusqueda() {
    document.getElementById("buscarFecha").value = "";
    filtrarFechasPorTipo(null);
}

function filtrarFechasPorTipo(tipo) {
    tipoFiltroActivo = tipo;
    document.querySelectorAll(".filtros-fechas button").forEach(function (boton) {
        boton.classList.toggle("filtro-activo", boton.dataset.filtro === (tipo || "todos"));
    });
    mostrarFechas(true);
}


function mostrarPantalla(id){document.querySelectorAll(".pantalla").forEach(p=>p.classList.remove("activa"));const modal=document.getElementById("ventanaEdicion");if(modal)modal.style.display="none";const modalGasto=document.getElementById("modalGasto");if(modalGasto)modalGasto.style.display="none";const modalEntrenamiento=document.getElementById("modalEntrenamiento");if(modalEntrenamiento)modalEntrenamiento.style.display="none";const v=document.getElementById(id);if(!v)return;v.classList.add("activa");
const useCal=["seccionFechas","seccionTareas","seccionPagos","seccionFinanzas","seccionEntrenamiento","seccionTiempo","seccionAprendizajes","seccionObjetivos"].includes(id),cal=document.getElementById("calendarioContextual");if(cal)cal.hidden=!useCal;
document.querySelectorAll(".boton-nav").forEach(x=>{const on=x.dataset.pantalla===id;x.classList.toggle("activo",on);if(on)x.setAttribute("aria-current","page");else x.removeAttribute("aria-current");});const title=document.getElementById("tituloCalendario");if(title)title.textContent=id==="seccionFechas"?"Fechas especiales":id==="seccionTareas"?"Tareas":id==="seccionFinanzas"?"Finanzas":"Calendario";
if(id==="seccionFechas")mostrarFechas();if(id==="seccionEntrenamiento")mostrarListaEntrenamientos();if(id==="seccionFinanzas")mostrarListaFinanzas();if(id==="resultadoFinanzas")mostrarResumenFinanzas();if(id==="seccionAprendizajes")mostrarListaAprendizajes();if(id==="seccionPagos")mostrarListaPagos();if(id==="resultadoPagos")mostrarResumenPagos();if(typeof actualizarCalendarioContextual==="function")actualizarCalendarioContextual();window.scrollTo({top:0,behavior:"smooth"});}
function mostrarInicio(){mostrarPantalla("inicio");}
revisarRecordatoriosFechas();

setInterval(function() {

    revisarRecordatoriosFechas();

}, 60000);

function abrirAgendaDesdeNotificacion() {

    mostrarPantalla("seccionFechas");

}

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.addEventListener("message", function(event) {

        if (
            event.data &&
            event.data.tipo === "ABRIR_AGENDA"
        ) {
            abrirAgendaDesdeNotificacion();
        }

    });

}

const parametrosPagina =
    new URLSearchParams(window.location.search);

if (parametrosPagina.get("abrir") === "agenda") {

    abrirAgendaDesdeNotificacion();

    window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.hash
    );

}


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
    "✅ Token FCM obtenido y copiado al portapapeles.\n\n" +
    "Ya puedes pegarlo en Firebase Console."
);

} catch (error) {

console.error("Error al copiar el token:", error);

alert(
    "✅ Token FCM obtenido.\n\n" +
    "No se pudo copiar automáticamente. " +
    "Revisa la consola para obtener más información."
);

}


} catch (error) {

    console.error(
        "ERROR EN NOTIFICACIONES:",
        error
    );

    alert(
    "❌ Error en notificaciones:\n\n" +
    error.message
   );

}

}

window.addEventListener("miapp:agenda-usuario", function(event) {
    const uid=event.detail&&event.detail.uid; agendaUsuarioUid=uid||null;
    if(agendaUsuarioUid){fechasImportantes=JSON.parse(localStorage.getItem("fechasImportantes:"+agendaUsuarioUid)||"[]");mensajeAgenda("Conectando Agenda de esta cuenta. Tus fechas de prueba siguen locales.");}
    else {fechasImportantes=fechasLocalesDePrueba.slice();mensajeAgenda("Sesión cerrada. Las fechas de prueba siguen en este dispositivo.");}
    actualizarControlCompartir();mostrarFechas(true);
});
window.addEventListener("miapp:agenda-datos", function(event){if(!agendaUsuarioUid||!event.detail||event.detail.uid!==agendaUsuarioUid)return;fechasImportantes=event.detail.fechas||[];guardarFechas();mostrarFechas(true);});
window.addEventListener("miapp:agenda-vinculo", function(event){if(!agendaUsuarioUid||!event.detail||event.detail.uid!==agendaUsuarioUid)return;agendaVinculoActivo=Boolean(event.detail.activo);actualizarControlCompartir();});
window.addEventListener("miapp:agenda-estado", function(event){if(!event.detail||event.detail.uid!==agendaUsuarioUid)return;mensajeAgenda(event.detail.mensaje||"",event.detail.error);});


function claveDiaCalendario(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}function fechaClaveCalendario(d){return claveDiaCalendario(d);}
function moverMesCalendario(n){const seleccionado=new Date(diaSeleccionado+"T00:00:00"),mesNuevo=new Date(mesContextual.getFullYear(),mesContextual.getMonth()+n,1),ultimoDia=new Date(mesNuevo.getFullYear(),mesNuevo.getMonth()+1,0).getDate();mesContextual=mesNuevo;diaSeleccionado=claveDiaCalendario(new Date(mesNuevo.getFullYear(),mesNuevo.getMonth(),Math.min(seleccionado.getDate(),ultimoDia)));const pantalla=document.querySelector(".contenedor>.pantalla.activa")?.id;if(pantalla==="seccionFechas")mostrarFechas(true);else if(pantalla==="seccionTareas")mostrarListaTareas();else if(pantalla==="seccionEntrenamiento")mostrarListaEntrenamientos();else{if(pantalla==="seccionAprendizajes"){const input=document.getElementById("fechaAprendizaje");if(input)input.value=diaSeleccionado;}if(pantalla==="seccionPagos"){const input=document.getElementById("fechaPago");if(input)input.value=diaSeleccionado;}if(pantalla==="seccionFinanzas"){const input=document.getElementById("fechaFinanzas");if(input)input.value=diaSeleccionado;mostrarListaFinanzas();}actualizarCalendarioContextual();}}
function actualizarCalendarioContextual() {
    const grid = document.getElementById("cuadriculaCalendario");
    const title = document.getElementById("mesCalendarioTitulo");
    const detail = document.getElementById("detalleCalendario");
    if (!grid || !title || !detail) return;

    const pantalla = document.querySelector(".contenedor>.pantalla.activa");
    const id = pantalla ? pantalla.id : "";
    const isDates = id === "seccionFechas";
    const isTasks = id === "seccionTareas";
    const isLearning = id === "seccionAprendizajes";
    const isPayments = id === "seccionPagos";
    const isFinance = id === "seccionFinanzas";
    const isTraining = id === "seccionEntrenamiento";
    const items = [];

    if (isDates && Array.isArray(fechasImportantes)) {
        fechasImportantes.forEach(item => {
            if (!item.fecha) return;
            const original = new Date(item.fecha + "T00:00:00");
            if (Number.isNaN(original.getTime())) return;
            let clave = item.fecha;
            if (item.tipo === "cumpleanos" || item.tipo === "aniversario") {
                if (original.getMonth() !== mesContextual.getMonth()) return;
                const ultimoDia = new Date(mesContextual.getFullYear(), mesContextual.getMonth() + 1, 0).getDate();
                clave = claveDiaCalendario(new Date(mesContextual.getFullYear(), mesContextual.getMonth(), Math.min(original.getDate(), ultimoDia)));
            } else if (original.getFullYear() !== mesContextual.getFullYear() || original.getMonth() !== mesContextual.getMonth()) return;
            const icono = item.tipo === "cumpleanos" ? "🎂" : item.tipo === "aniversario" ? "❤️" : "🗓️";
            items.push({ fecha: clave, texto: icono + " " + (item.nombre || "Fecha importante"), tipoFecha: item.tipo || "importante", iconoFecha: icono });
        });
    }
    if (isTasks && Array.isArray(tareas)) {
        tareas.forEach((tarea, indice) => {
            if (!tarea.fecha) return;
            const totalDias = new Date(mesContextual.getFullYear(), mesContextual.getMonth() + 1, 0).getDate();
            for (let dia = 1; dia <= totalDias; dia++) {
                const clave = claveDiaCalendario(new Date(mesContextual.getFullYear(), mesContextual.getMonth(), dia));
                if (tareaOcurreEnFecha(tarea, clave)) {
                    items.push({
                        fecha: clave,
                        texto: (tareaCompletadaEnFecha(tarea, clave) ? "☑️ " : "✅ ") + (tarea.texto || "Tarea"),
                        esTarea: true,
                        indice,
                        prioridad: tarea.prioridad || "ninguna",
                        completada: tareaCompletadaEnFecha(tarea, clave)
                    });
                }
            }
        });
    }
    if (isLearning && Array.isArray(aprendizajes)) {
        aprendizajes.forEach(item => {
            if (item.fecha) items.push({ fecha: item.fecha, texto: "🧠 " + (item.texto || "Aprendizaje") });
        });
    }
    if (isPayments && Array.isArray(pagosPendientes)) {
        pagosPendientes.forEach(item => {
            if (item.fecha) items.push({ fecha: item.fecha, texto: (item.pagado ? "☑️ " : "💡 ") + (item.nombre || "Pago") });
        });
    }
    if (isFinance && Array.isArray(gastos)) {
        gastos.forEach(item => {
            if (item.fecha) {
                const categoria = informacionCategoriaGasto(item.categoria);
                items.push({ fecha: item.fecha, texto: categoria.icono + " " + (item.concepto || "Gasto") + " · " + formatoMonedaPago(item.monto), tipoGasto: normalizarCategoriaGasto(item.categoria), iconoGasto: categoria.icono });
            }
        });
    }

    if (isTraining && Array.isArray(entrenamientos)) {
        const totalDiasEntrenamiento = new Date(mesContextual.getFullYear(), mesContextual.getMonth() + 1, 0).getDate();
        entrenamientos.forEach(item => {
            const icono = item.tipo === "mental" ? "🧠" : "🏋️";
            for (let dia = 1; dia <= totalDiasEntrenamiento; dia++) {
                const clave = claveDiaCalendario(new Date(mesContextual.getFullYear(), mesContextual.getMonth(), dia));
                if (entrenamientoOcurreEnFecha(item, clave)) {
                    const completada = entrenamientoCompletadoEnFecha(item, clave);
                    items.push({ fecha: clave, texto: (completada ? "☑️ " : icono + " ") + (item.actividad || "Entrenamiento"), completada, tipoEntrenamiento: item.tipo === "mental" ? "mental" : "fisico", iconoEntrenamiento: icono });
                }
            }
        });
    }

    title.textContent = mesContextual.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    grid.replaceChildren();
    ["D", "L", "M", "M", "J", "V", "S"].forEach(nombre => {
        const elemento = document.createElement("span");
        elemento.className = "dia-semana";
        elemento.textContent = nombre;
        grid.appendChild(elemento);
    });

    const primerDia = new Date(mesContextual.getFullYear(), mesContextual.getMonth(), 1).getDay();
    const totalDiasMes = new Date(mesContextual.getFullYear(), mesContextual.getMonth() + 1, 0).getDate();
    const hoy = claveDiaCalendario(new Date());
    for (let espacio = 0; espacio < primerDia; espacio++) grid.appendChild(document.createElement("span"));

    for (let numeroDia = 1; numeroDia <= totalDiasMes; numeroDia++) {
        const fechaDia = new Date(mesContextual.getFullYear(), mesContextual.getMonth(), numeroDia);
        const clave = claveDiaCalendario(fechaDia);
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "dia-calendario";
        boton.textContent = String(numeroDia);
        boton.setAttribute("aria-label", fechaDia.toLocaleDateString("es-MX", { dateStyle: "long" }));
        if (clave === hoy) boton.classList.add("hoy");
        if (clave === diaSeleccionado) boton.classList.add("seleccionado");

        const elementosDia = items.filter(item => item.fecha === clave);
        if (isDates && elementosDia.length) {
            boton.classList.add("con-fechas-especiales");
            const tipos = ["cumpleanos", "aniversario", "importante"].filter(tipo => elementosDia.some(item => item.tipoFecha === tipo));
            const iconos = document.createElement("span");
            iconos.className = "iconos-fechas-especiales";
            iconos.setAttribute("aria-hidden", "true");
            tipos.forEach(tipo => {
                const item = elementosDia.find(elemento => elemento.tipoFecha === tipo);
                const mini = document.createElement("span");
                mini.className = "mini-icono-fecha mini-icono-" + tipo;
                mini.textContent = item.iconoFecha;
                iconos.appendChild(mini);
            });
            boton.appendChild(iconos);
            boton.setAttribute("aria-label", boton.getAttribute("aria-label") + ". " + elementosDia.map(item => item.texto).join(", "));
        } else if (isTraining && elementosDia.length) {
            const tipos = ["fisico", "mental"].filter(tipo => elementosDia.some(item => item.tipoEntrenamiento === tipo && !item.completada));
            const iconos = document.createElement("span");
            iconos.className = "iconos-entrenamiento";
            iconos.setAttribute("aria-hidden", "true");
            tipos.forEach(tipo => {
                const item = elementosDia.find(elemento => elemento.tipoEntrenamiento === tipo);
                const mini = document.createElement("span");
                mini.className = "mini-icono-entrenamiento mini-icono-entrenamiento-" + tipo;
                mini.textContent = item.iconoEntrenamiento;
                iconos.appendChild(mini);
            });
            boton.appendChild(iconos);
            boton.classList.add("con-entrenamientos");
            boton.setAttribute("aria-label", boton.getAttribute("aria-label") + ". Entrenamientos: " + elementosDia.map(item => item.texto).join(", "));
        } else if (isFinance && elementosDia.length) {
            const categorias = [...new Set(elementosDia.filter(item => item.tipoGasto).map(item => item.tipoGasto))];
            const iconos = document.createElement("span");
            iconos.className = "iconos-categorias-gasto";
            iconos.setAttribute("aria-hidden", "true");
            categorias.forEach(categoria => {
                const item = elementosDia.find(elemento => elemento.tipoGasto === categoria);
                const mini = document.createElement("span");
                mini.className = "mini-icono-gasto mini-icono-gasto-" + categoria;
                mini.textContent = item.iconoGasto;
                iconos.appendChild(mini);
            });
            boton.appendChild(iconos);
            boton.classList.add("con-gastos");
            const nombres = categorias.map(categoria => informacionCategoriaGasto(categoria).nombre);
            boton.setAttribute("aria-label", boton.getAttribute("aria-label") + ". Gastos: " + nombres.join(", "));
        } else if (isTasks) {
            const tareasPendientesDia = elementosDia.filter(item => item.esTarea && !item.completada);
            const prioridades = ["alta", "media", "baja"].filter(prioridad => tareasPendientesDia.some(item => item.prioridad === prioridad));
            if (prioridades.length) {
                boton.classList.add("con-tareas");
                const marcadores = document.createElement("span");
                marcadores.className = "marcadores-tareas";
                marcadores.setAttribute("aria-hidden", "true");
                prioridades.slice(0, 3).forEach(prioridad => {
                    const punto = document.createElement("span");
                    punto.className = "marcador-prioridad prioridad-" + prioridad;
                    marcadores.appendChild(punto);
                });
                boton.appendChild(marcadores);
            }
        } else if (elementosDia.length) {
            boton.classList.add("con-elementos");
        }

        boton.onclick = function() {
            diaSeleccionado = clave;
            if (isTasks) {
                mostrarListaTareas();
                return;
            }
            if (isDates) {
                mostrarFechas(true);
                return;
            }
            if (isLearning) {
                const input = document.getElementById("fechaAprendizaje");
                if (input) input.value = clave;
            }
            if (isPayments) {
                const input = document.getElementById("fechaPago");
                if (input) input.value = clave;
            }
            if (isFinance) {
                const input = document.getElementById("fechaFinanzas");
                if (input) input.value = clave;
                mostrarListaFinanzas();
                return;
            }
            if (isTraining) {
                const input = document.getElementById("fechaEntrenamiento");
                if (input) input.value = clave;
                mostrarListaEntrenamientos();
                return;
            }
            actualizarCalendarioContextual();
        };
        grid.appendChild(boton);
    }

    const fechaSeleccionada = new Date(diaSeleccionado + "T00:00:00");
    const encabezado = document.createElement("h3");
    encabezado.textContent = fechaSeleccionada.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
    detail.replaceChildren(encabezado);
    const coincidencias = items.filter(item => item.fecha === diaSeleccionado);
    if (!coincidencias.length) {
        const mensaje = document.createElement("p");
        mensaje.textContent = isDates || isTasks || isLearning || isPayments || isFinance || isTraining ? "No hay elementos registrados para este día." : "Los elementos aparecerán aquí cuando se construya el módulo.";
        detail.appendChild(mensaje);
        return;
    }

    const lista = document.createElement("ul");
    coincidencias.forEach(item => {
        const linea = document.createElement("li");
        linea.textContent = item.texto;
        lista.appendChild(linea);
    });
    detail.appendChild(lista);
}
function cerrarAvisos(){const a=document.getElementById("barraAvisos");if(a)a.hidden=true;}function mostrarAvisos(){const a=document.getElementById("barraAvisos");if(a)a.hidden=false;}


function guardarAprendizajesEnDispositivo(){localStorage.setItem("aprendizajes",JSON.stringify(aprendizajes));}
function mostrarListaAprendizajes(){const lista=document.getElementById("listaAprendizajes");if(!lista)return;lista.replaceChildren();if(!aprendizajes.length){const p=document.createElement("p");p.textContent="Aún no has guardado aprendizajes.";lista.appendChild(p);if(typeof actualizarCalendarioContextual==="function")actualizarCalendarioContextual();return;}
const ordenados=aprendizajes.map((item,indice)=>({item,indice})).sort((a,b)=>b.item.fecha.localeCompare(a.item.fecha));ordenados.forEach(({item,indice})=>{const tarjeta=document.createElement("article");tarjeta.className="tarjeta-aprendizaje";const fecha=document.createElement("h3");const d=new Date(item.fecha+"T00:00:00");fecha.textContent=d.toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"});const texto=document.createElement("p");texto.textContent=item.texto;const acciones=document.createElement("div");acciones.className="acciones-tarjeta-aprendizaje";const editar=document.createElement("button");editar.type="button";editar.textContent="Editar";editar.onclick=function(){editarAprendizaje(indice);};const borrar=document.createElement("button");borrar.type="button";borrar.textContent="Eliminar";borrar.onclick=function(){eliminarAprendizaje(indice);};acciones.append(editar,borrar);tarjeta.append(fecha,texto,acciones);lista.appendChild(tarjeta);});if(typeof actualizarCalendarioContextual==="function")actualizarCalendarioContextual();}
function guardarAprendizaje(){const campoFecha=document.getElementById("fechaAprendizaje"),campoTexto=document.getElementById("textoAprendizaje"),fecha=campoFecha.value,texto=campoTexto.value.trim();if(!fecha){alert("Selecciona el día del aprendizaje.");return;}if(!texto){alert("Escribe qué aprendiste.");campoTexto.focus();return;}if(aprendizajeEditando===null)aprendizajes.push({fecha,texto});else{aprendizajes[aprendizajeEditando]={...aprendizajes[aprendizajeEditando],fecha,texto};aprendizajeEditando=null;}guardarAprendizajesEnDispositivo();campoFecha.value=fechaClaveCalendario(new Date());campoTexto.value="";document.getElementById("botonGuardarAprendizaje").textContent="Guardar aprendizaje";document.getElementById("botonCancelarAprendizaje").hidden=true;mostrarListaAprendizajes();}
function editarAprendizaje(indice){const item=aprendizajes[indice];if(!item)return;aprendizajeEditando=indice;document.getElementById("fechaAprendizaje").value=item.fecha;document.getElementById("textoAprendizaje").value=item.texto;document.getElementById("botonGuardarAprendizaje").textContent="Guardar cambios";document.getElementById("botonCancelarAprendizaje").hidden=false;document.getElementById("textoAprendizaje").focus();}
function cancelarEdicionAprendizaje(){aprendizajeEditando=null;document.getElementById("fechaAprendizaje").value=fechaClaveCalendario(new Date());document.getElementById("textoAprendizaje").value="";document.getElementById("botonGuardarAprendizaje").textContent="Guardar aprendizaje";document.getElementById("botonCancelarAprendizaje").hidden=true;}
function eliminarAprendizaje(indice){if(!aprendizajes[indice])return;if(!confirm("¿Quieres eliminar este aprendizaje?"))return;aprendizajes.splice(indice,1);guardarAprendizajesEnDispositivo();mostrarListaAprendizajes();}
if(document.getElementById("fechaAprendizaje"))document.getElementById("fechaAprendizaje").value=fechaClaveCalendario(new Date());mostrarListaAprendizajes();


function guardarEntrenamientosEnDispositivo() {
    localStorage.setItem("entrenamientos", JSON.stringify(entrenamientos));
}

function abrirNuevoEntrenamiento() {
    entrenamientoEditando = null;
    document.getElementById("tipoEntrenamiento").value = "fisico";
    document.getElementById("repeticionEntrenamiento").value = "ninguna";
    document.getElementById("repeticionHastaEntrenamiento").value = "";
    actualizarCampoFinRepeticionEntrenamiento();
    document.getElementById("actividadEntrenamiento").value = "";
    document.getElementById("fechaEntrenamiento").value = diaSeleccionado;
    document.getElementById("duracionEntrenamiento").value = "";
    document.getElementById("notaEntrenamiento").value = "";
    document.getElementById("tituloModalEntrenamiento").textContent = "＋ Nueva actividad";
    document.getElementById("botonGuardarEntrenamiento").textContent = "Guardar actividad";
    document.getElementById("modalEntrenamiento").style.display = "flex";
    document.getElementById("actividadEntrenamiento").focus();
}

function editarEntrenamiento(indice) {
    const item = entrenamientos[indice];
    if (!item) return;
    entrenamientoEditando = indice;
    document.getElementById("tipoEntrenamiento").value = item.tipo === "mental" ? "mental" : "fisico";
    document.getElementById("repeticionEntrenamiento").value = item.repeticion || "ninguna";
    document.getElementById("repeticionHastaEntrenamiento").value = item.repeticionHasta || "";
    actualizarCampoFinRepeticionEntrenamiento();
    document.getElementById("actividadEntrenamiento").value = item.actividad || "";
    document.getElementById("fechaEntrenamiento").value = item.fecha || diaSeleccionado;
    document.getElementById("duracionEntrenamiento").value = item.duracion || "";
    document.getElementById("notaEntrenamiento").value = item.nota || "";
    document.getElementById("tituloModalEntrenamiento").textContent = "✏️ Editar actividad";
    document.getElementById("botonGuardarEntrenamiento").textContent = "Guardar cambios";
    document.getElementById("modalEntrenamiento").style.display = "flex";
    document.getElementById("actividadEntrenamiento").focus();
}

function actualizarCampoFinRepeticionEntrenamiento() {
    const repeticion = document.getElementById("repeticionEntrenamiento").value;
    const grupo = document.getElementById("grupoFinRepeticionEntrenamiento");
    const campo = document.getElementById("repeticionHastaEntrenamiento");
    const mostrar = repeticion !== "ninguna";
    grupo.hidden = !mostrar;
    campo.required = mostrar;
    if (!mostrar) campo.value = "";
}

function entrenamientoOcurreEnFecha(item, fechaClave) {
    if (!item) return false;
    return tareaOcurreEnFecha({ fecha: item.fecha, repeticion: item.repeticion || "ninguna", repeticionHasta: item.repeticionHasta || "" }, fechaClave);
}

function entrenamientoCompletadoEnFecha(item, fechaClave) {
    if (!item) return false;
    if (!item.repeticion || item.repeticion === "ninguna") return Boolean(item.completada);
    if (item.completada) return true;
    return Array.isArray(item.fechasCompletadas) && item.fechasCompletadas.includes(fechaClave);
}

function cerrarModalEntrenamiento() {
    const modal = document.getElementById("modalEntrenamiento");
    if (modal) modal.style.display = "none";
    entrenamientoEditando = null;
}

function guardarEntrenamiento() {
    const actividadCampo = document.getElementById("actividadEntrenamiento");
    const fecha = document.getElementById("fechaEntrenamiento").value;
    const actividad = actividadCampo.value.trim();
    const duracion = Number(document.getElementById("duracionEntrenamiento").value) || null;
    const repeticion = document.getElementById("repeticionEntrenamiento").value;
    const repeticionHasta = document.getElementById("repeticionHastaEntrenamiento").value;
    if (!actividad) { alert("Escribe o elige una actividad."); actividadCampo.focus(); return; }
    if (!fecha) { alert("Selecciona el día de la actividad."); return; }
    if (repeticion !== "ninguna" && !repeticionHasta) { alert("Selecciona hasta qué fecha se repetirá la actividad."); document.getElementById("repeticionHastaEntrenamiento").focus(); return; }
    if (repeticion !== "ninguna" && repeticionHasta < fecha) { alert("La fecha final debe ser igual o posterior a la fecha de inicio."); document.getElementById("repeticionHastaEntrenamiento").focus(); return; }
    const anterior = entrenamientoEditando === null ? null : entrenamientos[entrenamientoEditando];
    const mismaSerie = anterior && anterior.fecha === fecha && (anterior.repeticion || "ninguna") === repeticion;
    const registro = {
        id: anterior?.id || "entrenamiento-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        tipo: document.getElementById("tipoEntrenamiento").value === "mental" ? "mental" : "fisico",
        actividad,
        fecha,
        duracion,
        nota: document.getElementById("notaEntrenamiento").value.trim(),
        repeticion,
        repeticionHasta: repeticion === "ninguna" ? "" : repeticionHasta,
        fechasCompletadas: mismaSerie && Array.isArray(anterior.fechasCompletadas) ? anterior.fechasCompletadas : [],
        completada: repeticion === "ninguna" ? Boolean(anterior?.completada) : Boolean(anterior?.completada && mismaSerie)
    };
    if (entrenamientoEditando === null) entrenamientos.push(registro);
    else entrenamientos[entrenamientoEditando] = registro;
    diaSeleccionado = fecha;
    const seleccionada = new Date(fecha + "T00:00:00");
    mesContextual = new Date(seleccionada.getFullYear(), seleccionada.getMonth(), 1);
    guardarEntrenamientosEnDispositivo();
    cerrarModalEntrenamiento();
    mostrarListaEntrenamientos();
}

function cambiarEstadoEntrenamiento(indice, fechaClave, completada) {
    const item = entrenamientos[indice];
    if (!item || !entrenamientoOcurreEnFecha(item, fechaClave)) return;
    if (item.repeticion && item.repeticion !== "ninguna") {
        if (!Array.isArray(item.fechasCompletadas)) item.fechasCompletadas = [];
        const posicion = item.fechasCompletadas.indexOf(fechaClave);
        if (completada && posicion < 0) item.fechasCompletadas.push(fechaClave);
        if (!completada && posicion >= 0) item.fechasCompletadas.splice(posicion, 1);
    } else {
        item.completada = completada;
    }
    guardarEntrenamientosEnDispositivo();
    mostrarListaEntrenamientos();
}

function eliminarEntrenamiento(indice) {
    if (!entrenamientos[indice] || !confirm("¿Quieres eliminar esta actividad de entrenamiento?")) return;
    entrenamientos.splice(indice, 1);
    guardarEntrenamientosEnDispositivo();
    mostrarListaEntrenamientos();
}

function mostrarListaEntrenamientos() {
    const lista = document.getElementById("listaEntrenamientos");
    if (!lista) return;
    const fecha = document.getElementById("fechaEntrenamiento");
    if (fecha) fecha.value = diaSeleccionado;
    lista.replaceChildren();
    const actividades = entrenamientos.map((item, indice) => ({ item, indice })).filter(({ item }) => entrenamientoOcurreEnFecha(item, diaSeleccionado));
    if (!actividades.length) {
        const vacio = document.createElement("p");
        vacio.className = "estado-vacio-entrenamiento";
        vacio.textContent = "No hay actividades para este día. Agrega una rutina física o un ejercicio mental.";
        lista.appendChild(vacio);
    }
    actividades.forEach(({ item, indice }) => {
        const tarjeta = document.createElement("article");
        const completadaHoy = entrenamientoCompletadoEnFecha(item, diaSeleccionado);
        tarjeta.className = "tarjeta-entrenamiento" + (completadaHoy ? " entrenamiento-completado" : "");
        const encabezado = document.createElement("div");
        encabezado.className = "encabezado-entrenamiento";
        const nombre = document.createElement("h3");
        nombre.textContent = (item.tipo === "mental" ? "🧠 " : "🏋️ ") + item.actividad;
        const tipo = document.createElement("span");
        tipo.textContent = item.tipo === "mental" ? "Ejercicio mental" : "Ejercicio físico";
        encabezado.append(nombre, tipo);
        tarjeta.appendChild(encabezado);
        if (item.repeticion && item.repeticion !== "ninguna") {
            const nombresRepeticion = { diaria: "Cada día", semanal: "Cada semana", quincenal: "Cada 2 semanas", mensual: "Cada mes", anual: "Cada año" };
            const repeticionTexto = document.createElement("p");
            repeticionTexto.className = "detalle-entrenamiento";
            repeticionTexto.textContent = "🔁 " + (nombresRepeticion[item.repeticion] || "Recurrente") + " · Se repetirá hasta " + formatoFechaCorta(item.repeticionHasta);
            tarjeta.appendChild(repeticionTexto);
        }
        if (item.duracion) {
            const duracionTexto = document.createElement("p");
            duracionTexto.className = "detalle-entrenamiento";
            duracionTexto.textContent = item.duracion + (item.duracion === 1 ? " minuto" : " minutos");
            tarjeta.appendChild(duracionTexto);
        }
        if (item.nota) {
            const nota = document.createElement("p");
            nota.className = "nota-entrenamiento";
            nota.textContent = item.nota;
            tarjeta.appendChild(nota);
        }
        const acciones = document.createElement("div");
        acciones.className = "acciones-tarjeta-entrenamiento";
        const etiqueta = document.createElement("label");
        etiqueta.className = "check-entrenamiento";
        const check = document.createElement("input");
        check.type = "checkbox";
        check.checked = completadaHoy;
        check.onchange = function () { cambiarEstadoEntrenamiento(indice, diaSeleccionado, check.checked); };
        etiqueta.append(check, document.createTextNode("Realizada"));
        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "Editar";
        editar.onclick = function () { editarEntrenamiento(indice); };
        const borrar = document.createElement("button");
        borrar.type = "button";
        borrar.textContent = "Eliminar";
        borrar.onclick = function () { eliminarEntrenamiento(indice); };
        acciones.append(etiqueta, editar, borrar);
        tarjeta.appendChild(acciones);
        lista.appendChild(tarjeta);
    });
    actualizarCalendarioContextual();
}
function guardarGastosEnDispositivo(){localStorage.setItem("gastosFinanzas",JSON.stringify(gastos));}
function normalizarCategoriaGasto(categoria){const categorias=["fijos_esenciales","variables_necesarios","compromisos_financieros","gustos_salidas"];if(categorias.includes(categoria))return categoria;const anteriores={vivienda:"fijos_esenciales",educacion:"fijos_esenciales",comida:"variables_necesarios",transporte:"variables_necesarios",salud:"variables_necesarios",entretenimiento:"gustos_salidas",otros:"variables_necesarios"};return anteriores[categoria]||"variables_necesarios";}
function informacionCategoriaGasto(categoria){const categoriaNormalizada=normalizarCategoriaGasto(categoria);const opciones={fijos_esenciales:{icono:"🏠",nombre:"Fijos y esenciales"},variables_necesarios:{icono:"🛒",nombre:"Variables necesarios"},compromisos_financieros:{icono:"💳",nombre:"Compromisos financieros"},gustos_salidas:{icono:"🎉",nombre:"Gustos y salidas"}};return opciones[categoriaNormalizada];}
function seleccionarFechaFinanzas(fecha){if(!fecha)return;diaSeleccionado=fecha;const seleccionada=new Date(fecha+"T00:00:00");mesContextual=new Date(seleccionada.getFullYear(),seleccionada.getMonth(),1);mostrarListaFinanzas();}
function abrirNuevoGasto(){gastoEditando=null;document.getElementById("conceptoGasto").value="";document.getElementById("montoGasto").value="";document.getElementById("fechaGasto").value=diaSeleccionado;document.getElementById("categoriaGasto").value="variables_necesarios";document.getElementById("notaGasto").value="";document.getElementById("tituloModalGasto").textContent="＋ Nuevo gasto";document.getElementById("botonGuardarGasto").textContent="Guardar gasto";document.getElementById("modalGasto").style.display="flex";document.getElementById("conceptoGasto").focus();}
function editarGasto(indice){const gasto=gastos[indice];if(!gasto)return;gastoEditando=indice;document.getElementById("conceptoGasto").value=gasto.concepto||"";document.getElementById("montoGasto").value=Number(gasto.monto)||"";document.getElementById("fechaGasto").value=gasto.fecha||"";document.getElementById("categoriaGasto").value=normalizarCategoriaGasto(gasto.categoria);document.getElementById("notaGasto").value=gasto.nota||"";document.getElementById("tituloModalGasto").textContent="✏️ Editar gasto";document.getElementById("botonGuardarGasto").textContent="Guardar cambios";document.getElementById("modalGasto").style.display="flex";document.getElementById("conceptoGasto").focus();}
function cerrarModalGasto(){gastoEditando=null;document.getElementById("modalGasto").style.display="none";}
function guardarGasto(){const conceptoCampo=document.getElementById("conceptoGasto"),montoCampo=document.getElementById("montoGasto"),fechaCampo=document.getElementById("fechaGasto"),concepto=conceptoCampo.value.trim(),monto=Number(montoCampo.value),fecha=fechaCampo.value;if(!concepto){alert("Escribe el concepto del gasto.");conceptoCampo.focus();return;}if(!Number.isFinite(monto)||monto<=0){alert("Escribe un monto mayor que cero.");montoCampo.focus();return;}if(!fecha){alert("Selecciona la fecha del gasto.");fechaCampo.focus();return;}const registro={id:gastoEditando===null?"gasto-"+Date.now()+"-"+Math.random().toString(36).slice(2,8):gastos[gastoEditando].id,concepto,monto,fecha,categoria:document.getElementById("categoriaGasto").value,nota:document.getElementById("notaGasto").value.trim()};if(gastoEditando===null)gastos.push(registro);else gastos[gastoEditando]=registro;diaSeleccionado=fecha;mesContextual=new Date(new Date(fecha+"T00:00:00").getFullYear(),new Date(fecha+"T00:00:00").getMonth(),1);guardarGastosEnDispositivo();cerrarModalGasto();document.getElementById("fechaFinanzas").value=fecha;mostrarListaFinanzas();}
function eliminarGasto(indice){if(!gastos[indice]||!confirm("¿Quieres eliminar este gasto?"))return;gastos.splice(indice,1);guardarGastosEnDispositivo();mostrarListaFinanzas();}
function mostrarListaFinanzas(){const lista=document.getElementById("listaGastos");if(!lista)return;const selector=document.getElementById("fechaFinanzas");if(selector)selector.value=diaSeleccionado;lista.replaceChildren();const gastosDelDia=gastos.map((gasto,indice)=>({gasto,indice})).filter(({gasto})=>gasto.fecha===diaSeleccionado).sort((a,b)=>a.gasto.concepto.localeCompare(b.gasto.concepto,"es-MX"));const total=gastosDelDia.reduce((suma,{gasto})=>suma+(Number(gasto.monto)||0),0);const resumen=document.getElementById("resumenDiaFinanzas");if(resumen)resumen.textContent=gastosDelDia.length?gastosDelDia.length+(gastosDelDia.length===1?" gasto":" gastos")+" · Total del día: "+formatoMonedaPago(total):"Sin gastos registrados para este día.";if(!gastosDelDia.length){const vacio=document.createElement("p");vacio.className="estado-vacio-finanzas";vacio.textContent="Agrega un gasto o elige otro día en el calendario.";lista.appendChild(vacio);}gastosDelDia.forEach(({gasto,indice})=>{const tarjeta=document.createElement("article");tarjeta.className="tarjeta-gasto";const infoCategoria=informacionCategoriaGasto(gasto.categoria);const titulo=document.createElement("h3");titulo.textContent=infoCategoria.icono+" "+gasto.concepto;const importe=document.createElement("strong");importe.textContent=formatoMonedaPago(gasto.monto);const detalle=document.createElement("p");detalle.textContent=infoCategoria.nombre+(gasto.nota?" · "+gasto.nota:"");const acciones=document.createElement("div");acciones.className="acciones-gasto";const editar=document.createElement("button");editar.type="button";editar.textContent="Editar";editar.onclick=function(){editarGasto(indice);};const eliminar=document.createElement("button");eliminar.type="button";eliminar.textContent="Eliminar";eliminar.onclick=function(){eliminarGasto(indice);};acciones.append(editar,eliminar);tarjeta.append(titulo,importe,detalle,acciones);lista.appendChild(tarjeta);});actualizarCalendarioContextual();}
if(document.getElementById("fechaFinanzas"))document.getElementById("fechaFinanzas").value=diaSeleccionado;
mostrarListaFinanzas();

function obtenerRangoResumenFinanzas(periodo, fechaClave) {
    const referencia = new Date(fechaClave + "T00:00:00");
    let inicio;
    let fin;
    if (periodo === "dia") {
        inicio = new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate());
        fin = new Date(inicio);
    } else if (periodo === "semana") {
        const diasDesdeLunes = (referencia.getDay() + 6) % 7;
        inicio = new Date(referencia.getFullYear(), referencia.getMonth(), referencia.getDate() - diasDesdeLunes);
        fin = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 6);
    } else if (periodo === "anio") {
        inicio = new Date(referencia.getFullYear(), 0, 1);
        fin = new Date(referencia.getFullYear(), 11, 31);
    } else {
        inicio = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
        fin = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 0);
    }
    const cantidadDias = Math.round((Date.UTC(fin.getFullYear(), fin.getMonth(), fin.getDate()) - Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())) / 86400000) + 1;
    return { inicio, fin, cantidadDias, desde: claveDiaCalendario(inicio), hasta: claveDiaCalendario(fin) };
}

function mostrarResumenFinanzas() {
    const panel = document.getElementById("panelResumenFinanzas");
    const selectorPeriodo = document.getElementById("periodoResumenFinanzas");
    const selectorFecha = document.getElementById("fechaReferenciaFinanzas");
    if (!panel || !selectorPeriodo || !selectorFecha) return;
    if (!selectorFecha.value) selectorFecha.value = diaSeleccionado || fechaClaveCalendario(new Date());
    panel.replaceChildren();

    const periodo = selectorPeriodo.value;
    const referencia = selectorFecha.value;
    const rango = obtenerRangoResumenFinanzas(periodo, referencia);
    const gastosPeriodo = gastos.filter(gasto => gasto.fecha >= rango.desde && gasto.fecha <= rango.hasta);
    const total = gastosPeriodo.reduce((suma, gasto) => suma + (Number(gasto.monto) || 0), 0);
    const promedioDiario = rango.cantidadDias ? total / rango.cantidadDias : 0;
    const mayorGasto = gastosPeriodo.reduce((mayor, gasto) => Number(gasto.monto) > Number(mayor?.monto || 0) ? gasto : mayor, null);
    const nombrePeriodo = { dia: "del día", semana: "de la semana", mes: "del mes", anio: "del año" }[periodo];

    const resumen = document.createElement("div");
    resumen.className = "tarjetas-resumen-finanzas";
    [
        [formatoMonedaPago(total), "Total gastado " + nombrePeriodo],
        [String(gastosPeriodo.length), gastosPeriodo.length === 1 ? "Gasto registrado" : "Gastos registrados"],
        [formatoMonedaPago(promedioDiario), "Promedio por día"],
        [mayorGasto ? formatoMonedaPago(mayorGasto.monto) : formatoMonedaPago(0), mayorGasto ? "Gasto más alto · " + mayorGasto.concepto : "Gasto más alto"]
    ].forEach(([valor, etiqueta]) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-metrica-finanzas";
        const numero = document.createElement("strong");
        numero.textContent = valor;
        const texto = document.createElement("span");
        texto.textContent = etiqueta;
        tarjeta.append(numero, texto);
        resumen.appendChild(tarjeta);
    });
    panel.appendChild(resumen);

    const totalesPorCategoria = ["fijos_esenciales", "variables_necesarios", "compromisos_financieros", "gustos_salidas"].map(categoria => ({
        categoria,
        total: gastosPeriodo.filter(gasto => normalizarCategoriaGasto(gasto.categoria) === categoria).reduce((suma, gasto) => suma + (Number(gasto.monto) || 0), 0)
    }));
    const maximoCategoria = Math.max(...totalesPorCategoria.map(item => item.total), 0);
    const bloqueCategorias = document.createElement("section");
    bloqueCategorias.className = "grafica-categorias-finanzas";
    const tituloCategorias = document.createElement("h3");
    tituloCategorias.textContent = "Gastos por tipo";
    bloqueCategorias.appendChild(tituloCategorias);
    totalesPorCategoria.forEach(item => {
        const info = informacionCategoriaGasto(item.categoria);
        const fila = document.createElement("div");
        fila.className = "fila-grafica-finanzas";
        const etiqueta = document.createElement("div");
        etiqueta.className = "etiqueta-grafica-finanzas";
        etiqueta.textContent = info.icono + " " + info.nombre;
        const barraFondo = document.createElement("div");
        barraFondo.className = "barra-grafica-fondo";
        const barra = document.createElement("span");
        barra.className = "barra-grafica-valor barra-" + item.categoria;
        barra.style.width = maximoCategoria ? (item.total / maximoCategoria * 100) + "%" : "0%";
        barra.setAttribute("aria-label", info.nombre + ": " + formatoMonedaPago(item.total));
        barraFondo.appendChild(barra);
        const valor = document.createElement("strong");
        valor.textContent = formatoMonedaPago(item.total);
        fila.append(etiqueta, barraFondo, valor);
        bloqueCategorias.appendChild(fila);
    });
    panel.appendChild(bloqueCategorias);

    const serie = [];
    if (periodo === "anio") {
        for (let mes = 0; mes < 12; mes++) {
            const desde = claveDiaCalendario(new Date(rango.inicio.getFullYear(), mes, 1));
            const hasta = claveDiaCalendario(new Date(rango.inicio.getFullYear(), mes + 1, 0));
            serie.push({ etiqueta: new Date(rango.inicio.getFullYear(), mes, 1).toLocaleDateString("es-MX", { month: "short" }), total: gastosPeriodo.filter(gasto => gasto.fecha >= desde && gasto.fecha <= hasta).reduce((suma, gasto) => suma + (Number(gasto.monto) || 0), 0) });
        }
    } else if (periodo === "dia") {
        gastosPeriodo.forEach(gasto => serie.push({ etiqueta: gasto.concepto, total: Number(gasto.monto) || 0 }));
    } else {
        for (let dia = 0; dia < rango.cantidadDias; dia++) {
            const fecha = new Date(rango.inicio.getFullYear(), rango.inicio.getMonth(), rango.inicio.getDate() + dia);
            const clave = claveDiaCalendario(fecha);
            const totalDia = gastosPeriodo.filter(gasto => gasto.fecha === clave).reduce((suma, gasto) => suma + (Number(gasto.monto) || 0), 0);
            serie.push({ etiqueta: periodo === "semana" ? fecha.toLocaleDateString("es-MX", { weekday: "short" }) : String(fecha.getDate()), total: totalDia });
        }
    }
    const bloqueTendencia = document.createElement("section");
    bloqueTendencia.className = "grafica-tendencia-finanzas";
    const tituloTendencia = document.createElement("h3");
    tituloTendencia.textContent = periodo === "anio" ? "Gasto por mes" : periodo === "dia" ? "Gastos registrados ese día" : "Gasto por día";
    bloqueTendencia.appendChild(tituloTendencia);
    if (!gastosPeriodo.length) {
        const vacio = document.createElement("p");
        vacio.textContent = "Aún no hay gastos en este periodo.";
        bloqueTendencia.appendChild(vacio);
    } else {
        const grafica = document.createElement("div");
        grafica.className = "grafica-barras-finanzas";
        const maximo = Math.max(...serie.map(item => item.total), 0);
        serie.forEach(item => {
            const columna = document.createElement("div");
            columna.className = "columna-grafica-finanzas";
            columna.title = item.etiqueta + ": " + formatoMonedaPago(item.total);
            const barra = document.createElement("span");
            barra.className = "barra-periodo-finanzas";
            barra.style.height = maximo ? Math.max(3, item.total / maximo * 100) + "%" : "0%";
            const etiqueta = document.createElement("small");
            etiqueta.textContent = item.etiqueta;
            columna.append(barra, etiqueta);
            grafica.appendChild(columna);
        });
        bloqueTendencia.appendChild(grafica);
    }
    panel.appendChild(bloqueTendencia);
}

function guardarPagosEnDispositivo(){localStorage.setItem("pagosPendientes",JSON.stringify(pagosPendientes));}
function formatoMonedaPago(monto){return new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(Number(monto)||0);}
function mostrarListaPagos(){const lista=document.getElementById("listaPagos");if(!lista)return;lista.replaceChildren();if(!pagosPendientes.length){const p=document.createElement("p");p.textContent="Aún no has registrado pagos.";lista.appendChild(p);actualizarCalendarioContextual();return;}pagosPendientes.map((pago,indice)=>({pago,indice})).sort((a,b)=>(a.pago.fecha||"").localeCompare(b.pago.fecha||"")).forEach(({pago,indice})=>{const tarjeta=document.createElement("article");tarjeta.className="tarjeta-pago";const titulo=document.createElement("h3");titulo.textContent=pago.nombre;const detalle=document.createElement("p");detalle.textContent=(pago.pagado?"✅ Pagado":"⏳ Pendiente")+" · Vence: "+(pago.fecha||"Sin fecha")+" · "+formatoMonedaPago(pago.monto);const acciones=document.createElement("div");acciones.className="acciones-pago-tarjeta";const estado=document.createElement("button");estado.type="button";estado.textContent=pago.pagado?"Marcar pendiente":"Marcar pagado";estado.onclick=function(){cambiarEstadoPago(indice);};const editar=document.createElement("button");editar.type="button";editar.textContent="Editar";editar.onclick=function(){editarPago(indice);};const borrar=document.createElement("button");borrar.type="button";borrar.textContent="Eliminar";borrar.onclick=function(){eliminarPago(indice);};acciones.append(estado,editar,borrar);tarjeta.append(titulo,detalle,acciones);lista.appendChild(tarjeta);});actualizarCalendarioContextual();}
function guardarPago(){const nombre=document.getElementById("nombrePago"),fecha=document.getElementById("fechaPago"),monto=document.getElementById("montoPago"),pagado=document.getElementById("pagoRealizado"),concepto=nombre.value.trim(),importe=Number(monto.value);if(!concepto){alert("Escribe el concepto del pago.");nombre.focus();return;}if(!fecha.value){alert("Selecciona la fecha de vencimiento.");fecha.focus();return;}if(!Number.isFinite(importe)||importe<=0){alert("Escribe un monto mayor que cero.");monto.focus();return;}if(pagoEditando===null){pagosPendientes.push({id:"pago-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),nombre:concepto,fecha:fecha.value,monto:importe,pagado:pagado.checked});}else{pagosPendientes[pagoEditando]={...pagosPendientes[pagoEditando],nombre:concepto,fecha:fecha.value,monto:importe,pagado:pagado.checked};}pagoEditando=null;guardarPagosEnDispositivo();cancelarEdicionPago();mostrarListaPagos();mostrarResumenPagos();}
function editarPago(indice){const pago=pagosPendientes[indice];if(!pago)return;pagoEditando=indice;document.getElementById("nombrePago").value=pago.nombre||"";document.getElementById("fechaPago").value=pago.fecha||"";document.getElementById("montoPago").value=Number(pago.monto)||"";document.getElementById("pagoRealizado").checked=Boolean(pago.pagado);document.getElementById("botonGuardarPago").textContent="Guardar cambios";document.getElementById("botonCancelarPago").hidden=false;document.getElementById("nombrePago").focus();}
function cancelarEdicionPago(){pagoEditando=null;const nombre=document.getElementById("nombrePago");if(!nombre)return;nombre.value="";document.getElementById("fechaPago").value=fechaClaveCalendario(new Date());document.getElementById("montoPago").value="";document.getElementById("pagoRealizado").checked=false;document.getElementById("botonGuardarPago").textContent="Agregar pago";document.getElementById("botonCancelarPago").hidden=true;}
function cambiarEstadoPago(indice){const pago=pagosPendientes[indice];if(!pago)return;pago.pagado=!pago.pagado;guardarPagosEnDispositivo();mostrarListaPagos();mostrarResumenPagos();}
function eliminarPago(indice){if(!pagosPendientes[indice])return;if(!confirm("¿Quieres eliminar este pago?"))return;pagosPendientes.splice(indice,1);guardarPagosEnDispositivo();mostrarListaPagos();mostrarResumenPagos();}
function mostrarResumenPagos(){const area=document.getElementById("resumenPagos");if(!area)return;area.replaceChildren();const pendientes=pagosPendientes.filter(p=>!p.pagado),pagados=pagosPendientes.filter(p=>p.pagado),totalPendiente=pendientes.reduce((s,p)=>s+(Number(p.monto)||0),0),totalPagado=pagados.reduce((s,p)=>s+(Number(p.monto)||0),0),totalRegistrado=totalPendiente+totalPagado;const tarjetas=document.createElement("div");tarjetas.className="tarjetas-resumen-pagos";[[String(pendientes.length),"Pagos pendientes"],[formatoMonedaPago(totalPendiente),"Monto pendiente"],[String(pagados.length),"Pagos realizados"],[formatoMonedaPago(totalPagado),"Monto pagado"],[formatoMonedaPago(totalRegistrado),"Total registrado"]].forEach(([valor,etiqueta])=>{const tarjeta=document.createElement("article");tarjeta.className="tarjeta-metrica-pago";const fuerte=document.createElement("strong");fuerte.textContent=valor;const texto=document.createElement("span");texto.textContent=etiqueta;tarjeta.append(fuerte,texto);tarjetas.appendChild(tarjeta);});area.appendChild(tarjetas);[[pendientes,"Pendientes","No hay pagos pendientes."],[pagados,"Realizados","Aún no has marcado pagos como realizados."]].forEach(([items,titulo,vacio])=>{const grupo=document.createElement("section");grupo.className="grupo-resumen-pagos";const h=document.createElement("h3");h.textContent=titulo+" ("+items.length+")";grupo.appendChild(h);if(!items.length){const p=document.createElement("p");p.textContent=vacio;grupo.appendChild(p);}else{const lista=document.createElement("ul");items.slice().sort((a,b)=>(a.fecha||"").localeCompare(b.fecha||"")).forEach(pago=>{const li=document.createElement("li");li.textContent=(pago.nombre||"Pago")+" · "+(pago.fecha||"Sin fecha")+" · "+formatoMonedaPago(pago.monto);lista.appendChild(li);});grupo.appendChild(lista);}area.appendChild(grupo);});}
if(document.getElementById("fechaPago"))document.getElementById("fechaPago").value=fechaClaveCalendario(new Date());
mostrarListaPagos();mostrarResumenPagos();
