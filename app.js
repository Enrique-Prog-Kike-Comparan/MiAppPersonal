

let saludRegistros = JSON.parse(localStorage.getItem("saludRegistros") || "[]"), saludEditando = null;
let izelRegistrosLocales = JSON.parse(localStorage.getItem("izelRegistros") || "[]"), izelRegistros = izelRegistrosLocales.slice(), izelRegistrosNube = [], izelEditando = null, izelUsuarioUid = null, izelVinculoActivo = false;
let tareas = JSON.parse(localStorage.getItem("tareas")) || [];
let tareasLocalesEnDispositivo = tareas.filter(tarea => !tarea.ownerUid);
let tareasNube = [];
let tareasUsuarioUid = null;
let tareasVinculoActivo = false;
let gastos = JSON.parse(localStorage.getItem("gastosFinanzas") || "[]");
let gastoEditando = null;

let tareaEditando = null;
let tipoFiltroActivo = null;
let mesContextual=new Date(new Date().getFullYear(),new Date().getMonth(),1),diaSeleccionado=claveDiaCalendario(new Date());
let aprendizajes=JSON.parse(localStorage.getItem("aprendizajes")||"[]"),aprendizajeEditando=null;
let entrenamientosLocalesEnDispositivo=JSON.parse(localStorage.getItem("entrenamientos")||"[]").filter(item=>!item.ownerUid),entrenamientos=entrenamientosLocalesEnDispositivo.slice(),entrenamientosNube=[],entrenamientoUsuarioUid=null,entrenamientoVinculoActivo=false,entrenamientoEditando=null;
let objetivos=JSON.parse(localStorage.getItem("objetivos")||"[]"),objetivoEditando=null;
let registrosTiempo=JSON.parse(localStorage.getItem("registrosTiempo")||"[]"),registroTiempoEditando=null;
let proyectosLocalesEnDispositivo=JSON.parse(localStorage.getItem("proyectos")||"[]").filter(item=>!item.ownerUid),proyectos=proyectosLocalesEnDispositivo.slice(),proyectosNube=[],proyectosUsuarioUid=null,proyectosVinculoActivo=false,proyectoEditando=null;
const firmasProyectosSincronizados=new Map(),colasProyectosSincronizando=new Map();
let pagosLocalesEnDispositivo=JSON.parse(localStorage.getItem("pagosPendientes")||"[]").filter(pago=>!pago.ownerUid),pagosPendientes=pagosLocalesEnDispositivo.slice(),pagosNube=[],pagosUsuarioUid=null,pagosVinculoActivo=false,pagoEditando=null;
const notificacionesEnProceso = new Set();

function mostrarTareas() {
    document.getElementById("seccionTareas").scrollIntoView({
        behavior: "smooth"
    });
}

function guardarTareas() {
    tareasLocalesEnDispositivo = tareas.filter(tarea => !tarea.ownerUid);
    localStorage.setItem("tareas", JSON.stringify(tareasLocalesEnDispositivo));
    if (tareasUsuarioUid) localStorage.setItem("tareas:" + tareasUsuarioUid, JSON.stringify(tareasNube));
    if (typeof actualizarAvisosDelDia === "function") actualizarAvisosDelDia();
}

function actualizarControlCompartirTarea() {
    const check = document.getElementById("compartirTarea");
    const ayuda = document.getElementById("ayudaCompartirTarea");
    if (!check) return;
    const tarea = tareaEditando === null ? null : tareas[tareaEditando];
    const esCompartidaAjena = Boolean(tarea?.ownerUid && tarea.ownerUid !== tareasUsuarioUid);
    check.checked = Boolean(tarea?.ownerUid && tarea.sharedWithUids?.length);
    const esPropiaYaCompartida = Boolean(tarea?.ownerUid === tareasUsuarioUid && tarea.sharedWithUids?.length);
    check.disabled = !tareasUsuarioUid || (!tareasVinculoActivo && !esPropiaYaCompartida) || esCompartidaAjena;
    if (ayuda) ayuda.textContent = !tareasUsuarioUid
        ? "Sin sesión: la tarea se guardará solo en este dispositivo."
        : esCompartidaAjena
            ? "Tarea compartida: ambas cuentas pueden editarla; solo quien la creó puede eliminarla."
            : !tareasVinculoActivo
                ? "La tarea se guardará privada en tu cuenta. Vincula las cuentas para compartirla."
                : tarea && !tarea.ownerUid
                    ? "Si compartes esta tarea local, se copiará a tu cuenta; desmarcada seguirá solo en este dispositivo."
                    : "Las tareas nuevas se guardan privadas en tu cuenta. Puedes elegir compartirlas.";
}

function reconstruirTareas() {
    const ids = new Set(tareasNube.map(tarea => tarea.id));
    tareas = tareasLocalesEnDispositivo.filter(tarea => !ids.has(tarea.id)).concat(tareasNube);
    guardarTareas();
    mostrarListaTareas();
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
        const privacidad = !tarea.ownerUid ? "Solo en este dispositivo" : tarea.sharedWithUids?.length ? "Compartida con la cuenta vinculada" : "Privada en tu cuenta";
        const puedeEliminar = !tarea.ownerUid || tarea.ownerUid === tareasUsuarioUid;
        elemento.innerHTML =
            '<input type="checkbox" ' + (completadaEnDiaSeleccionado ? "checked" : "") + (ocurreEnDiaSeleccionado ? "" : " disabled") + ' onchange="completarTarea(' + indice + ', diaSeleccionado)">' +
            '<div class="contenido-tarea">' +
            '<strong>' + tarea.texto + '</strong>' +
            '<div class="privacidad-tarea">' + privacidad + '</div>' +
            '<div>' + informacion + '</div>' +
            '<div>' + prioridad + " · " + categoria + '</div>' +
            '<div>' + recordatorio + " · " + repeticion + repeticionHasta + '</div>' +
            '<div class="acciones-tarea">' +
            '<button onclick="editarTarea(' + indice + ')">✏️ Editar</button>' +
            '<button onclick="eliminarTarea(' + indice + ')"' + (puedeEliminar ? "" : " disabled title=\"Solo quien creó la tarea puede eliminarla\"") + '>🗑️ Eliminar</button>' +
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
    actualizarControlCompartirTarea();
    document.getElementById("tituloEdicionTarea").textContent = "➕ Nueva tarea";
    document.getElementById("botonGuardarTarea").textContent = "Agregar tarea";
    document.getElementById("ventanaEdicion").style.display = "flex";
    document.getElementById("editarTexto").focus();
}
async function completarTarea(indice, fechaClave = diaSeleccionado) {
    const tarea = tareas[indice];
    if (!tarea || !tareaOcurreEnFecha(tarea, fechaClave)) return;
    const anterior = JSON.parse(JSON.stringify(tarea));
    const completada = !tareaCompletadaEnFecha(tarea, fechaClave);
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
    if (tarea.ownerUid && window.miappTareasCloud) {
        try {
            await window.miappTareasCloud.marcar(tarea, fechaClave, completada);
        } catch (error) {
            const actual = tareas.findIndex(item => item.id === tarea.id);
            if (actual >= 0) tareas[actual] = anterior;
            tareasNube = tareasNube.map(item => item.id === anterior.id ? anterior : item);
            guardarTareas(); mostrarListaTareas();
            alert("No se pudo guardar el check de la tarea: " + error.message);
        }
    }
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
    actualizarControlCompartirTarea();
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

async function guardarEdicion() {
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
        id: tareaAnterior?.id || "tarea-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        texto,
        fecha,
        hora: document.getElementById("editarHora").value,
        prioridad: document.getElementById("editarPrioridad").value,
        categoria: document.getElementById("editarCategoria").value,
        recordatorio: document.getElementById("editarRecordatorio").value,
        repeticion,
        repeticionHasta: repeticion === "ninguna" ? "" : repeticionHasta,
        fechasCompletadas: mismaSerie && Array.isArray(tareaAnterior.fechasCompletadas) ? tareaAnterior.fechasCompletadas : [],
        completada: tareaEditando === null ? false : Boolean(tareaAnterior && tareaAnterior.completada),
        ...(tareaAnterior?.ownerUid ? { ownerUid: tareaAnterior.ownerUid, sharedWithUids: tareaAnterior.sharedWithUids || [], pairId: tareaAnterior.pairId || null } : {})
    };
    const compartir = document.getElementById("compartirTarea").checked;
    const indiceAnterior = tareaEditando;
    if (indiceAnterior !== null && !tareas[indiceAnterior]) return;
    if (tareasUsuarioUid && (tareaAnterior?.ownerUid || indiceAnterior === null || (tareaAnterior && !tareaAnterior.ownerUid && compartir))) {
        try {
            const guardada = await window.miappTareasCloud.guardar(nuevaTarea, compartir);
            Object.assign(nuevaTarea, guardada);
        } catch (error) {
            alert("No se pudo guardar la tarea en tu cuenta: " + error.message);
            return;
        }
    }
    if (indiceAnterior === null) tareas.push(nuevaTarea);
    else tareas[indiceAnterior] = nuevaTarea;
    if (nuevaTarea.ownerUid) tareasNube = tareasNube.filter(item => item.id !== nuevaTarea.id).concat(nuevaTarea);
    else tareasLocalesEnDispositivo = tareasLocalesEnDispositivo.filter(item => item.id !== nuevaTarea.id).concat(nuevaTarea);
    guardarTareas();
    mostrarListaTareas();
    cerrarEdicion();
}
async function eliminarTarea(indice) {

    const confirmar = confirm(
        "¿Seguro que quieres eliminar esta tarea?"
    );

    if (!confirmar) {
        return;
    }

    const tarea = tareas[indice];
    if (!tarea) return;
    if (tarea.ownerUid && tarea.ownerUid !== tareasUsuarioUid) { alert("Solo quien creó esta tarea puede eliminarla."); return; }
    if (tarea.ownerUid) {
        try { await window.miappTareasCloud.eliminar(tarea); }
        catch (error) { alert("No se pudo eliminar la tarea: " + error.message); return; }
        tareasNube = tareasNube.filter(item => item.id !== tarea.id);
    } else {
        tareasLocalesEnDispositivo = tareasLocalesEnDispositivo.filter(item => item.id !== tarea.id);
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
let fechasLocalesEnDispositivo = fechasImportantes.slice();

function combinarFechas(...listas) {
    const resultado = [];
    const ids = new Set();
    for (const lista of listas) {
        for (const fecha of lista || []) {
            if (fecha && fecha.id) {
                if (ids.has(fecha.id)) {
                    const posicion = resultado.findIndex(item => item.id === fecha.id);
                    if (posicion >= 0) resultado[posicion] = fecha;
                    continue;
                }
                ids.add(fecha.id);
            }
            resultado.push(fecha);
        }
    }
    return resultado;
}

function leerFechasLocales() {
    try {
        const datos = JSON.parse(localStorage.getItem("fechasImportantes") || "[]");
        return Array.isArray(datos) ? datos : [];
    } catch (_) {
        return [];
    }
}

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
    if (agendaUsuarioUid) {
        fechasLocalesEnDispositivo = fechasImportantes.filter(fecha => !fecha.ownerUid);
        localStorage.setItem("fechasImportantes", JSON.stringify(fechasLocalesEnDispositivo));
        localStorage.setItem(
            "fechasImportantes:" + agendaUsuarioUid,
            JSON.stringify(fechasImportantes.filter(fecha => Boolean(fecha.ownerUid)))
        );
    } else {
        fechasLocalesEnDispositivo = fechasImportantes.slice();
        localStorage.setItem("fechasImportantes", JSON.stringify(fechasImportantes));
    }
    if (typeof actualizarAvisosDelDia === "function") actualizarAvisosDelDia();
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
    try { if (agendaUsuarioUid && fecha.ownerUid) await window.miappAgendaCloud.eliminar(fecha); fechasImportantes.splice(indice, 1); guardarFechas(); mostrarFechas(); }
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
    const esLocalEnDispositivo = !fecha.ownerUid;
    const esPropia = esLocalEnDispositivo || fecha.ownerUid === agendaUsuarioUid;
    controlCompartir.checked = Boolean(fecha.sharedWithUids && fecha.sharedWithUids.length);
    controlCompartir.disabled = !agendaUsuarioUid || !esPropia || !agendaVinculoActivo;
    ayudaCompartir.textContent = !agendaUsuarioUid
        ? "Esta fecha sigue solo en este dispositivo. Inicia sesión y marca compartir para compartirla."
        : esLocalEnDispositivo
            ? (agendaVinculoActivo
                ? "Esta fecha sigue solo en este dispositivo. Marca la casilla para compartirla; si la dejas desmarcada, seguirá local."
                : "Esta fecha sigue solo en este dispositivo. Vincula las cuentas para poder compartirla.")
            : (!esPropia
                ? "Puedes editar esta fecha compartida; solo quien la creó puede cambiar quién la ve."
                : (!agendaVinculoActivo
                    ? "Vincula las cuentas para cambiar el uso compartido."
                    : "Sin marcar, esta fecha será privada en tu cuenta."));

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
    const esLocalExistente = !esNueva && !base.ownerUid;
    try {
        if (agendaUsuarioUid && (!esLocalExistente || compartir)) {
            if (esLocalExistente) {
                delete registro.id;
                delete registro.ownerUid;
                delete registro.sharedWithUids;
                delete registro.pairId;
            } else {
                registro.id = base.id;
            }
            const guardada = await window.miappAgendaCloud.guardar(registro, compartir);
            if (esNueva) fechasImportantes.push(guardada);
            else fechasImportantes[indice] = guardada;
            mensajeAgenda(esLocalExistente
                ? "Fecha del dispositivo compartida con la cuenta vinculada."
                : esNueva
                    ? "Fecha guardada en tu cuenta" + (compartir ? " y compartida." : " como privada.")
                    : "Cambios guardados en tu cuenta.");
        } else {
            if (esNueva) fechasImportantes.push(registro);
            else fechasImportantes[indice] = registro;
            mensajeAgenda(esLocalExistente
                ? "Cambios guardados solo en este dispositivo. Puedes compartir esta fecha después."
                : esNueva
                    ? "Fecha guardada solo en este dispositivo. Inicia sesión para sincronizar nuevas fechas."
                    : "Cambios guardados solo en este dispositivo.");
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
        privacidad.textContent = !agendaUsuarioUid || !fecha.ownerUid
            ? "Solo en este dispositivo"
            : esCompartida
                ? "Compartida"
                : "Privada";
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


function alternarMenuMovil(forzarAbierto) {
    const barra = document.getElementById("barraLateral");
    const boton = document.getElementById("botonMenuMovil");
    const fondo = document.getElementById("fondoMenuMovil");
    if (!barra || !boton) return;
    const abierto = typeof forzarAbierto === "boolean"
        ? forzarAbierto
        : !barra.classList.contains("menu-movil-abierto");
    barra.classList.toggle("menu-movil-abierto", abierto);
    document.body.classList.toggle("menu-movil-abierto", abierto);
    if (fondo) fondo.hidden = !abierto;
    boton.setAttribute("aria-expanded", String(abierto));
    boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
}
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") alternarMenuMovil(false);
});
function mostrarPantalla(id){document.querySelectorAll(".pantalla").forEach(p=>p.classList.remove("activa"));const modal=document.getElementById("ventanaEdicion");if(modal)modal.style.display="none";const modalGasto=document.getElementById("modalGasto");if(modalGasto)modalGasto.style.display="none";const modalEntrenamiento=document.getElementById("modalEntrenamiento");if(modalEntrenamiento)modalEntrenamiento.style.display="none";const modalObjetivo=document.getElementById("modalObjetivo");if(modalObjetivo)modalObjetivo.style.display="none";const modalProyecto=document.getElementById("modalProyecto");if(modalProyecto)modalProyecto.style.display="none";const modalSalud=document.getElementById("modalSalud");if(modalSalud)modalSalud.style.display="none";const modalIzel=document.getElementById("modalIzel");if(modalIzel)modalIzel.style.display="none";const modalDespensa=document.getElementById("modalDespensa");if(modalDespensa)modalDespensa.style.display="none";const v=document.getElementById(id);if(!v)return;alternarMenuMovil(false);v.classList.add("activa");
const useCal=["seccionFechas","seccionTareas","seccionPagos","seccionFinanzas","seccionEntrenamiento","seccionTiempo","seccionAprendizajes","seccionObjetivos","seccionSalud","seccionIzel","seccionDespensa"].includes(id),cal=document.getElementById("calendarioContextual");if(cal)cal.hidden=!useCal;
document.querySelectorAll(".boton-nav").forEach(x=>{const on=x.dataset.pantalla===id;x.classList.toggle("activo",on);if(on)x.setAttribute("aria-current","page");else x.removeAttribute("aria-current");});const title=document.getElementById("tituloCalendario");if(title)title.textContent=id==="seccionFechas"?"Fechas especiales":id==="seccionTareas"?"Tareas":id==="seccionFinanzas"?"Finanzas":id==="seccionSalud"?"Salud":id==="seccionIzel"?"Mi peque Izel":id==="seccionDespensa"?"Compra Pen. Despensa":"Calendario";
if(id==="seccionFechas")mostrarFechas();if(id==="seccionDespensa"&&typeof mostrarListasDespensa==="function"){const fechaDespensa=document.getElementById("fechaDespensa");if(fechaDespensa)fechaDespensa.value=diaSeleccionado;mostrarListasDespensa();}if(id==="seccionTiempo")mostrarListaTiempo();if(id==="seccionProyectos")mostrarListaProyectos();if(id==="seccionObjetivos")mostrarListaObjetivos();if(id==="seccionEntrenamiento")mostrarListaEntrenamientos();if(id==="seccionFinanzas")mostrarListaFinanzas();if(id==="resultadoEntrenamiento")mostrarResumenEntrenamiento();if(id==="resultadoTiempo")mostrarResumenTiempo();if(id==="resultadoAprendizajes")mostrarResumenAprendizajes();if(id==="resultadoFinanzas")mostrarResumenFinanzas();if(id==="seccionAprendizajes")mostrarListaAprendizajes();if(id==="seccionPagos")mostrarListaPagos();if(id==="resultadoPagos")mostrarResumenPagos();if(id==="seccionSalud")mostrarListaSalud();if(id==="seccionIzel")mostrarListaIzel();if(id==="resultadoSalud")mostrarResumenSalud();if(id==="resultadoIzel")mostrarResumenIzel();if(id==="resultadoTareas")mostrarResumenTareas();if(typeof actualizarAvisosDelDia==="function")actualizarAvisosDelDia();if(typeof actualizarCalendarioContextual==="function")actualizarCalendarioContextual();window.scrollTo({top:0,behavior:"smooth"});}
function mostrarInicio(){mostrarPantalla("inicio");}
revisarRecordatoriosFechas();

actualizarAvisosDelDia();
revisarRecordatoriosTareas();

setInterval(function() {
    revisarRecordatoriosFechas();
    revisarRecordatoriosTareas();
    actualizarAvisosDelDia();
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
    const uid = event.detail && event.detail.uid;
    agendaUsuarioUid = uid || null;
    if (agendaUsuarioUid) {
        let guardadasDeCuenta = [];
        try {
            const datos = JSON.parse(localStorage.getItem("fechasImportantes:" + agendaUsuarioUid) || "[]");
            guardadasDeCuenta = Array.isArray(datos) ? datos : [];
        } catch (_) {}
        fechasLocalesEnDispositivo = combinarFechas(
            leerFechasLocales(),
            guardadasDeCuenta.filter(fecha => !fecha.ownerUid)
        );
        fechasImportantes = combinarFechas(
            fechasLocalesEnDispositivo,
            guardadasDeCuenta.filter(fecha => Boolean(fecha.ownerUid))
        );
        mensajeAgenda("Conectando Agenda de esta cuenta. Las fechas del dispositivo siguen locales.");
        guardarFechas();
    } else {
        fechasLocalesEnDispositivo = leerFechasLocales();
        fechasImportantes = fechasLocalesEnDispositivo.slice();
        mensajeAgenda("Sesión cerrada. Las fechas siguen en este dispositivo.");
    }
    actualizarControlCompartir();
    mostrarFechas(true);
});
window.addEventListener("miapp:agenda-datos", function(event) {
    if (!agendaUsuarioUid || !event.detail || event.detail.uid !== agendaUsuarioUid) return;
    fechasImportantes = combinarFechas(fechasLocalesEnDispositivo, event.detail.fechas || []);
    guardarFechas();
    mostrarFechas(true);
});
window.addEventListener("miapp:agenda-vinculo", function(event){if(!agendaUsuarioUid||!event.detail||event.detail.uid!==agendaUsuarioUid)return;agendaVinculoActivo=Boolean(event.detail.activo);actualizarControlCompartir();});
window.addEventListener("miapp:agenda-estado", function(event){if(!event.detail||event.detail.uid!==agendaUsuarioUid)return;mensajeAgenda(event.detail.mensaje||"",event.detail.error);});
window.addEventListener("miapp:izel-usuario", event => { const uid = event.detail?.uid || null; if (uid !== izelUsuarioUid) { izelRegistrosNube = []; reconstruirRegistrosIzel(); } izelUsuarioUid = uid; actualizarControlesCompartirIzel(); });
window.addEventListener("miapp:izel-vinculo", event => { if (event.detail?.uid !== izelUsuarioUid) return; izelVinculoActivo = Boolean(event.detail.active); actualizarControlesCompartirIzel(); });
window.addEventListener("miapp:izel-estado", event => { if (event.detail?.uid !== izelUsuarioUid) return; const el = document.getElementById("estadoIzelNube"); if (el) { el.textContent = event.detail.message || ""; el.dataset.error = String(Boolean(event.detail.error)); } });
window.addEventListener("miapp:izel-datos", event => { if (!event.detail?.uid) { izelRegistrosNube = []; reconstruirRegistrosIzel(); return; } if (!izelUsuarioUid || event.detail.uid !== izelUsuarioUid) return; izelRegistrosNube = event.detail.records || []; reconstruirRegistrosIzel(); });
window.addEventListener("miapp:tareas-usuario", event => {
    const uid = event.detail?.uid || null;
    if (uid !== tareasUsuarioUid) {
        tareasNube = [];
        let cache = [];
        if (uid) { try { const parsed = JSON.parse(localStorage.getItem("tareas:" + uid) || "[]"); cache = Array.isArray(parsed) ? parsed : []; } catch (_) {} }
        tareasLocalesEnDispositivo = tareas.filter(item => !item.ownerUid).concat(cache.filter(item => !item.ownerUid));
        tareasNube = cache.filter(item => Boolean(item.ownerUid));
        tareasUsuarioUid = uid;
        reconstruirTareas();
    }
    actualizarControlCompartirTarea();
});
window.addEventListener("miapp:tareas-vinculo", event => { if (event.detail?.uid !== tareasUsuarioUid) return; tareasVinculoActivo = Boolean(event.detail.active); actualizarControlCompartirTarea(); });
window.addEventListener("miapp:tareas-datos", event => { if (!tareasUsuarioUid || event.detail?.uid !== tareasUsuarioUid) return; tareasNube = event.detail.tasks || []; guardarTareas(); mostrarListaTareas(); });
window.addEventListener("miapp:tareas-estado", event => { if (event.detail?.uid && event.detail.uid !== tareasUsuarioUid) return; const el = document.getElementById("estadoSincronizacionTareas"); if (el) { el.textContent = event.detail.message || ""; el.dataset.error = String(Boolean(event.detail.error)); } });
window.addEventListener("miapp:pagos-usuario", event => {
    const uid = event.detail?.uid || null;
    if (uid !== pagosUsuarioUid) { pagosNube = []; pagosUsuarioUid = uid; reconstruirPagos(); }
    actualizarControlCompartirPago();
});
window.addEventListener("miapp:pagos-vinculo", event => { if (event.detail?.uid !== pagosUsuarioUid) return; pagosVinculoActivo = Boolean(event.detail.active); actualizarControlCompartirPago(); });
window.addEventListener("miapp:pagos-datos", event => { if (!pagosUsuarioUid || event.detail?.uid !== pagosUsuarioUid) return; pagosNube = event.detail.payments || []; reconstruirPagos(); });
window.addEventListener("miapp:pagos-estado", event => { if (event.detail?.uid && event.detail.uid !== pagosUsuarioUid) return; const el = document.getElementById("estadoSincronizacionPagos"); if (el) { el.textContent = event.detail.message || ""; el.dataset.error = String(Boolean(event.detail.error)); } });
window.addEventListener("miapp:entrenamiento-usuario", event => { const uid=event.detail?.uid||null; if(uid!==entrenamientoUsuarioUid){entrenamientoNube=[];entrenamientoUsuarioUid=uid;reconstruirEntrenamientos();} actualizarControlCompartirEntrenamiento(); });
window.addEventListener("miapp:entrenamiento-vinculo", event => { if(event.detail?.uid!==entrenamientoUsuarioUid)return;entrenamientoVinculoActivo=Boolean(event.detail.active);actualizarControlCompartirEntrenamiento(); });
window.addEventListener("miapp:entrenamiento-datos", event => { if(event.detail?.uid!==entrenamientoUsuarioUid)return;entrenamientosNube=event.detail.items||[];reconstruirEntrenamientos(); });
window.addEventListener("miapp:entrenamiento-estado", event => { if(event.detail?.uid&&event.detail.uid!==entrenamientoUsuarioUid)return;const el=document.getElementById("estadoSincronizacionEntrenamiento");if(el){el.textContent=event.detail.message||"";el.dataset.error=String(Boolean(event.detail.error));} });
window.addEventListener("miapp:proyectos-usuario", event => { const uid=event.detail?.uid||null;if(uid!==proyectosUsuarioUid){proyectosNube=[];proyectosUsuarioUid=uid;reconstruirProyectos();}actualizarControlCompartirProyecto(); });
window.addEventListener("miapp:proyectos-vinculo", event => { if(event.detail?.uid!==proyectosUsuarioUid)return;proyectosVinculoActivo=Boolean(event.detail.active);actualizarControlCompartirProyecto(); });
window.addEventListener("miapp:proyectos-datos", event => { if(event.detail?.uid!==proyectosUsuarioUid)return;proyectosNube=event.detail.projects||[];reconstruirProyectos(); });
window.addEventListener("miapp:proyectos-estado", event => { if(event.detail?.uid&&event.detail.uid!==proyectosUsuarioUid)return;const el=document.getElementById("estadoSincronizacionProyectos");if(el){el.textContent=event.detail.message||"";el.dataset.error=String(Boolean(event.detail.error));} });
function reconstruirPagos() { const ids = new Set(pagosNube.map(pago => pago.id)); pagosPendientes = pagosLocalesEnDispositivo.filter(pago => !ids.has(pago.id)).concat(pagosNube); mostrarListaPagos(); mostrarResumenPagos(); if (typeof actualizarAvisosDelDia === "function") actualizarAvisosDelDia(); }
function actualizarControlCompartirPago() { const check = document.getElementById("compartirPago"), ayuda = document.getElementById("ayudaCompartirPago"); if (!check) return; const pago = pagoEditando === null ? null : pagosPendientes[pagoEditando]; const compartidoAjeno = Boolean(pago?.ownerUid && pago.ownerUid !== pagosUsuarioUid); const yaCompartidoPropio = Boolean(pago?.ownerUid === pagosUsuarioUid && pago.sharedWithUids?.length); check.checked = Boolean(pago?.ownerUid && pago.sharedWithUids?.length); check.disabled = !pagosUsuarioUid || (!pagosVinculoActivo && !yaCompartidoPropio) || compartidoAjeno; if (ayuda) ayuda.textContent = !pagosUsuarioUid ? "Sin sesión: el pago se guardará solo en este dispositivo." : compartidoAjeno ? "Pago compartido: ambas cuentas pueden verlo y editarlo; solo quien lo creó puede eliminarlo." : !pagosVinculoActivo ? "El pago se guardará privado en tu cuenta. Vincula las cuentas para compartirlo." : pago && !pago.ownerUid ? "Si compartes este pago local, se copiará a tu cuenta; desmarcado seguirá solo en este dispositivo." : "Los pagos nuevos se guardan privados en tu cuenta. Puedes elegir compartirlos."; }
function reconstruirEntrenamientos(){const ids=new Set(entrenamientosNube.map(item=>item.id));entrenamientos=entrenamientosLocalesEnDispositivo.filter(item=>!ids.has(item.id)).concat(entrenamientosNube);if(typeof mostrarListaEntrenamientos==="function")mostrarListaEntrenamientos();if(typeof mostrarResumenEntrenamiento==="function")mostrarResumenEntrenamiento();if(typeof actualizarAvisosDelDia==="function")actualizarAvisosDelDia();}
function actualizarControlCompartirEntrenamiento(){const check=document.getElementById("compartirEntrenamiento"),ayuda=document.getElementById("ayudaCompartirEntrenamiento");if(!check)return;const item=entrenamientoEditando===null?null:entrenamientos[entrenamientoEditando],ajeno=Boolean(item?.ownerUid&&item.ownerUid!==entrenamientoUsuarioUid),yaCompartido=Boolean(item?.ownerUid===entrenamientoUsuarioUid&&item.sharedWithUids?.length);check.checked=Boolean(item?.ownerUid&&item.sharedWithUids?.length);check.disabled=!entrenamientoUsuarioUid||(!entrenamientoVinculoActivo&&!yaCompartido)||ajeno;if(ayuda)ayuda.textContent=!entrenamientoUsuarioUid?"Sin sesión: la actividad se guarda en este dispositivo.":ajeno?"Actividad compartida: ambas cuentas pueden verla y editarla; solo quien la creó puede eliminarla.":!entrenamientoVinculoActivo?"La actividad se guardará privada en tu cuenta. Vincula las cuentas para compartirla.":item&&!item.ownerUid?"Si compartes esta actividad local, se copiará a tu cuenta; si no, seguirá en este dispositivo.":"Las actividades nuevas se guardan privadas en tu cuenta. Puedes elegir compartirlas.";}
function reconstruirProyectos(){const ids=new Set(proyectosNube.map(item=>item.id));proyectos=proyectosLocalesEnDispositivo.filter(item=>!ids.has(item.id)).concat(proyectosNube.map(item=>JSON.parse(JSON.stringify(item))));firmasProyectosSincronizados.clear();proyectosNube.forEach(item=>firmasProyectosSincronizados.set(item.id,firmaProyecto(item)));if(typeof mostrarListaProyectos==="function")mostrarListaProyectos();}
function actualizarControlCompartirProyecto(){const check=document.getElementById("compartirProyecto"),ayuda=document.getElementById("ayudaCompartirProyecto");if(!check)return;const item=proyectoEditando===null?null:proyectos[proyectoEditando],ajeno=Boolean(item?.ownerUid&&item.ownerUid!==proyectosUsuarioUid),yaCompartido=Boolean(item?.ownerUid===proyectosUsuarioUid&&item.sharedWithUids?.length);check.checked=Boolean(item?.ownerUid&&item.sharedWithUids?.length);check.disabled=!proyectosUsuarioUid||(!proyectosVinculoActivo&&!yaCompartido)||ajeno;if(ayuda)ayuda.textContent=!proyectosUsuarioUid?"Sin sesión: el proyecto se guarda en este dispositivo.":ajeno?"Proyecto compartido: ambas cuentas pueden verlo y editarlo; solo quien lo creó puede eliminarlo.":!proyectosVinculoActivo?"El proyecto se guardará privado en tu cuenta. Vincula las cuentas para compartirlo.":item&&!item.ownerUid?"Si compartes este proyecto local, se copiará a tu cuenta; si no, seguirá en este dispositivo.":"Los proyectos nuevos se guardan privados en tu cuenta. Puedes elegir compartirlos.";}
function reconstruirRegistrosIzel() { const ids = new Set(izelRegistrosNube.map(item => item.id)); izelRegistros = izelRegistrosLocales.filter(item => !ids.has(item.id)).concat(izelRegistrosNube); mostrarListaIzel(); mostrarResumenIzel(); }
function persistirRegistrosLocalesIzel() { localStorage.setItem("izelRegistros", JSON.stringify(izelRegistrosLocales)); reconstruirRegistrosIzel(); }
function actualizarControlesCompartirIzel() { const check = document.getElementById("compartirRegistroIzel"), ayuda = document.getElementById("ayudaCompartirIzel"); if (!check) return; check.disabled = !izelVinculoActivo || Boolean(izelRegistros[izelEditando]?.ownerUid && izelRegistros[izelEditando].ownerUid !== izelUsuarioUid); if (ayuda) ayuda.textContent = !izelUsuarioUid ? "Sin sesión: el registro se guardará solo en este dispositivo." : !izelVinculoActivo ? "El registro se guardará en tu cuenta como privado. Vincula las cuentas para compartirlo." : "Puedes compartirlo con la cuenta vinculada o dejarlo privado."; }


function claveDiaCalendario(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}function fechaClaveCalendario(d){return claveDiaCalendario(d);}
function irAHoyCalendario(){
    const ahora=new Date();
    diaSeleccionado=claveDiaCalendario(ahora);
    mesContextual=new Date(ahora.getFullYear(),ahora.getMonth(),1);
    const pantalla=document.querySelector(".contenedor>.pantalla.activa")?.id;
    const camposFecha={seccionPagos:"fechaPago",seccionFinanzas:"fechaFinanzas",seccionEntrenamiento:"fechaEntrenamiento",seccionTiempo:"fechaTiempo",seccionAprendizajes:"fechaAprendizaje",seccionSalud:"fechaSalud",seccionIzel:"fechaIzel",seccionDespensa:"fechaDespensa"};
    const campo=document.getElementById(camposFecha[pantalla]||"");
    if(campo)campo.value=diaSeleccionado;
    if(pantalla==="seccionFechas")mostrarFechas(true);
    else if(pantalla==="seccionTareas")mostrarListaTareas();
    else if(pantalla==="seccionPagos")mostrarListaPagos();
    else if(pantalla==="seccionFinanzas")mostrarListaFinanzas();
    else if(pantalla==="seccionEntrenamiento")mostrarListaEntrenamientos();
    else if(pantalla==="seccionTiempo")mostrarListaTiempo();
    else if(pantalla==="seccionAprendizajes")mostrarListaAprendizajes();
    else if(pantalla==="seccionSalud")mostrarListaSalud();
    else if(pantalla==="seccionIzel")mostrarListaIzel();
    else if(pantalla==="seccionDespensa")mostrarListasDespensa();
    else if(pantalla==="seccionObjetivos")mostrarListaObjetivos();
    actualizarCalendarioContextual();
}
function moverMesCalendario(n){const seleccionado=new Date(diaSeleccionado+"T00:00:00"),mesNuevo=new Date(mesContextual.getFullYear(),mesContextual.getMonth()+n,1),ultimoDia=new Date(mesNuevo.getFullYear(),mesNuevo.getMonth()+1,0).getDate();mesContextual=mesNuevo;diaSeleccionado=claveDiaCalendario(new Date(mesNuevo.getFullYear(),mesNuevo.getMonth(),Math.min(seleccionado.getDate(),ultimoDia)));const pantalla=document.querySelector(".contenedor>.pantalla.activa")?.id;if(pantalla==="seccionFechas")mostrarFechas(true);else if(pantalla==="seccionTareas")mostrarListaTareas();else if(pantalla==="seccionEntrenamiento")mostrarListaEntrenamientos();else if(pantalla==="seccionDespensa"){const input=document.getElementById("fechaDespensa");if(input)input.value=diaSeleccionado;mostrarListasDespensa();}else{if(pantalla==="seccionSalud"){const input=document.getElementById("fechaSalud");if(input)input.value=diaSeleccionado;mostrarListaSalud();}if(pantalla==="seccionIzel"){const input=document.getElementById("fechaIzel");if(input)input.value=diaSeleccionado;mostrarListaIzel();}if(pantalla==="seccionAprendizajes"){const input=document.getElementById("fechaAprendizaje");if(input)input.value=diaSeleccionado;}if(pantalla==="seccionPagos"){const input=document.getElementById("fechaPago");if(input)input.value=diaSeleccionado;mostrarListaPagos();return;}if(pantalla==="seccionFinanzas"){const input=document.getElementById("fechaFinanzas");if(input)input.value=diaSeleccionado;mostrarListaFinanzas();}actualizarCalendarioContextual();}}
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
    const isObjectives = id === "seccionObjetivos";
    const isTime = id === "seccionTiempo";
    const isHealth = id === "seccionSalud";
    const isIzel = id === "seccionIzel";
    const isDespensa = id === "seccionDespensa";
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
    if (isHealth && Array.isArray(saludRegistros)) {
        saludRegistros.forEach(item => {
            if (item.fecha) items.push({ fecha: item.fecha, texto: "🩺 Chequeo de salud" + (item.doctor ? " · " + item.doctor : "") });
            if (item.proximaFecha) items.push({ fecha: item.proximaFecha, texto: "📅 Próxima revisión médica indicada" });
        });
    }
    if (isIzel && Array.isArray(izelRegistros)) {
        const totalDiasIzel = new Date(mesContextual.getFullYear(), mesContextual.getMonth() + 1, 0).getDate();
        izelRegistros.forEach(item => {
            for (let dia = 1; dia <= totalDiasIzel; dia++) {
                const clave = claveDiaCalendario(new Date(mesContextual.getFullYear(), mesContextual.getMonth(), dia));
                if (!tareaOcurreEnFecha(item, clave)) continue;
                const completado = izelRegistroCompletadoEnFecha(item, clave);
                const icono = item.tipo === "vacuna" ? (completado ? "✅" : "💉") : item.tipo === "pendiente" ? (completado ? "☑️" : "✅") : "🌟";
                items.push({ fecha: clave, texto: icono + " " + (item.titulo || "Registro de Izel"), tipoIzel: item.tipo, iconoIzel: icono });
            }
        });
    }
    if (isDespensa && Array.isArray(listasDespensa)) {
        const totalDiasDespensa = new Date(mesContextual.getFullYear(), mesContextual.getMonth() + 1, 0).getDate();
        listasDespensa.forEach(item => {
            for (let dia = 1; dia <= totalDiasDespensa; dia++) {
                const clave = claveDiaCalendario(new Date(mesContextual.getFullYear(), mesContextual.getMonth(), dia));
                if (listaDespensaOcurreEnFecha(item, clave)) items.push({ fecha: clave, texto: "🛒 " + (item.nombre || "Lista de despensa") + " · " + (item.productos || []).length + " productos", esDespensa: true });
            }
        });
    }
    if (isLearning && Array.isArray(aprendizajes)) {
        aprendizajes.forEach(item => {
            if (item.fecha) items.push({ fecha: item.fecha, texto: "🧠 " + (item.texto || "Aprendizaje") });
        });
    }
    if (isTime && Array.isArray(registrosTiempo)) {
        registrosTiempo.forEach(item => {
            if (item.fecha && item.texto) items.push({ fecha: item.fecha, texto: "⏱️ " + item.texto + (Number(item.minutos) > 0 ? " · " + item.minutos + " min" : "") });
        });
    }
    if (isPayments && Array.isArray(pagosPendientes)) {
        const totalDiasPagos = new Date(mesContextual.getFullYear(), mesContextual.getMonth() + 1, 0).getDate();
        pagosPendientes.forEach(item => {
            if (!item.fecha) return;
            for (let dia = 1; dia <= totalDiasPagos; dia++) {
                const clave = claveDiaCalendario(new Date(mesContextual.getFullYear(), mesContextual.getMonth(), dia));
                if (!pagoOcurreEnFecha(item, clave)) continue;
                const pagadoEnDia = pagoPagadoEnFecha(item, clave);
                items.push({ fecha: clave, texto: (pagadoEnDia ? "✅ Pagado · " : "💡 Pendiente · ") + (item.nombre || "Pago"), esPago: true, pagado: pagadoEnDia, iconoPago: pagadoEnDia ? "✅" : "💡" });
            }
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

    if (isObjectives && Array.isArray(objetivos)) {
        objetivos.forEach(item => {
            if (item.fechaMeta && item.estado !== "completado") items.push({ fecha: item.fechaMeta, texto: "🎯 " + (item.titulo || "Objetivo"), esObjetivo: true });
        });
    }    if (isTraining && Array.isArray(entrenamientos)) {
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
        if (isPayments && elementosDia.length) {
            const pagosDia=elementosDia.filter(item=>item.esPago);
            const iconos=document.createElement("span");
            iconos.className="iconos-pagos-dia";
            iconos.setAttribute("aria-hidden","true");
            pagosDia.slice(0,3).forEach(item=>{
                const mini=document.createElement("span");
                mini.className=item.pagado?"mini-icono-pago pago-realizado":"mini-icono-pago pago-pendiente";
                mini.textContent=item.iconoPago;
                iconos.appendChild(mini);
            });
            if(pagosDia.length>3){const extra=document.createElement("span");extra.className="mas-iconos-pago";extra.textContent="+"+(pagosDia.length-3);iconos.appendChild(extra);}
            boton.appendChild(iconos);
            boton.classList.add("con-pagos");
            boton.setAttribute("aria-label",boton.getAttribute("aria-label")+". Pagos: "+pagosDia.map(item=>item.texto).join(", "));
        } else if (isDespensa && elementosDia.length) {
            const listasDia = elementosDia.filter(item => item.esDespensa);
            const iconos = document.createElement("span");
            iconos.className = "iconos-despensa-dia";
            iconos.setAttribute("aria-hidden", "true");
            listasDia.slice(0, 3).forEach(() => { const mini = document.createElement("span"); mini.className = "mini-icono-despensa"; mini.textContent = "🛒"; iconos.appendChild(mini); });
            if (listasDia.length > 3) { const extra = document.createElement("span"); extra.className = "mas-iconos-despensa"; extra.textContent = "+" + (listasDia.length - 3); iconos.appendChild(extra); }
            boton.appendChild(iconos);
            boton.classList.add("con-listas-despensa");
            boton.setAttribute("aria-label", boton.getAttribute("aria-label") + ". Compras pendientes: " + listasDia.map(item => item.texto).join(", "));
        } else if (isDates && elementosDia.length) {
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
        } else if (isTime && elementosDia.length) {
            const icono = document.createElement("span");
            icono.className = "iconos-registro-tiempo";
            icono.setAttribute("aria-hidden", "true");
            const mini = document.createElement("span");
            mini.className = "mini-icono-registro-tiempo";
            mini.textContent = "⏱️";
            icono.appendChild(mini);
            boton.appendChild(icono);
            boton.classList.add("con-registros-tiempo");
            boton.setAttribute("aria-label", boton.getAttribute("aria-label") + ". Registros de tiempo: " + elementosDia.map(item => item.texto).join(", "));
        } else if (isObjectives && elementosDia.length) {
            const icono = document.createElement("span");
            icono.className = "iconos-objetivos";
            icono.setAttribute("aria-hidden", "true");
            const mini = document.createElement("span");
            mini.className = "mini-icono-objetivo";
            mini.textContent = "🎯";
            icono.appendChild(mini);
            boton.appendChild(icono);
            boton.classList.add("con-objetivos");
            boton.setAttribute("aria-label", boton.getAttribute("aria-label") + ". Objetivos: " + elementosDia.map(item => item.texto).join(", "));
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
        } else if (isLearning && elementosDia.length) {
            const icono = document.createElement("span");
            icono.className = "iconos-aprendizajes";
            icono.setAttribute("aria-hidden", "true");
            const mini = document.createElement("span");
            mini.className = "mini-icono-aprendizaje";
            mini.textContent = "🧠";
            icono.appendChild(mini);
            boton.appendChild(icono);
            boton.classList.add("con-aprendizajes");
            boton.setAttribute("aria-label", boton.getAttribute("aria-label") + ". Aprendizajes: " + elementosDia.map(item => item.texto).join(", "));
        } else if (isHealth && elementosDia.length) {
            const icono = document.createElement("span");
            icono.className = "iconos-salud";
            icono.setAttribute("aria-hidden", "true");
            icono.textContent = "🩺";
            boton.appendChild(icono);
            boton.classList.add("con-registros-salud");
            boton.setAttribute("aria-label", boton.getAttribute("aria-label") + ". Registro de salud: " + elementosDia.map(item => item.texto).join(", "));
        } else if (isIzel && elementosDia.length) {
            const iconos = document.createElement("span");
            iconos.className = "iconos-izel";
            iconos.setAttribute("aria-hidden", "true");
            [...new Set(elementosDia.map(item => item.tipoIzel))].forEach(tipo => {
                const item = elementosDia.find(elemento => elemento.tipoIzel === tipo);
                const mini = document.createElement("span");
                mini.className = "mini-icono-izel";
                mini.textContent = item.iconoIzel;
                iconos.appendChild(mini);
            });
            boton.appendChild(iconos);
            boton.classList.add("con-registros-izel");
            boton.setAttribute("aria-label", boton.getAttribute("aria-label") + ". Registros de Izel: " + elementosDia.map(item => item.texto).join(", "));
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
            if (isDespensa) {
                const input = document.getElementById("fechaDespensa");
                if (input) input.value = clave;
                mostrarListasDespensa();
                return;
            }
            if (isTasks) {
                mostrarListaTareas();
                return;
            }
            if (isDates) {
                mostrarFechas(true);
                return;
            }
            if (isHealth) {
                const input = document.getElementById("fechaSalud");
                if (input) input.value = clave;
                mostrarListaSalud();
                return;
            }
            if (isIzel) {
                const input = document.getElementById("fechaIzel");
                if (input) input.value = clave;
                mostrarListaIzel();
                return;
            }
            if (isLearning) {
                const input = document.getElementById("fechaAprendizaje");
                if (input) input.value = clave;
            }
            if (isTime) {
                diaSeleccionado = clave;
                const input = document.getElementById("fechaTiempo");
                if (input) input.value = clave;
                mostrarListaTiempo();
                return;
            }
            if (isPayments) {
                const input = document.getElementById("fechaPago");
                if (input) input.value = clave;
                mostrarListaPagos();
                return;
            }
            if (isFinance) {
                const input = document.getElementById("fechaFinanzas");
                if (input) input.value = clave;
                mostrarListaFinanzas();
                return;
            }
            if (isObjectives) {
                actualizarCalendarioContextual();
                return;
            }            if (isTraining) {
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
        mensaje.textContent = isDates || isTasks || isLearning || isPayments || isFinance || isTraining || isObjectives || isTime || isHealth || isIzel || isDespensa ? "No hay elementos registrados para este día." : "Los elementos aparecerán aquí cuando se construya el módulo.";
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
function claveAvisosOcultos(fechaHoy){return "avisosCategoriasOcultas:"+fechaHoy;}
function obtenerCategoriasAvisosOcultas(fechaHoy){try{const guardadas=JSON.parse(localStorage.getItem(claveAvisosOcultos(fechaHoy))||"[]");return new Set(Array.isArray(guardadas)?guardadas:[]);}catch{return new Set();}}
function cerrarAvisosCategoria(categoria){const hoy=fechaClaveCalendario(new Date()),ocultas=obtenerCategoriasAvisosOcultas(hoy);ocultas.add(categoria);localStorage.setItem(claveAvisosOcultos(hoy),JSON.stringify(Array.from(ocultas)));actualizarAvisosDelDia();}
function mostrarAvisos(){localStorage.removeItem(claveAvisosOcultos(fechaClaveCalendario(new Date())));actualizarAvisosDelDia();}

function obtenerAvisosDelDia(fechaHoy) {
    const avisos = [];
    fechasImportantes.forEach(fecha => {
        if (fechaEspecialEnDia(fecha, fechaHoy)) avisos.push({ categoria:"Fechas especiales", texto:(fecha.nombre||"Fecha especial")+(fecha.tipo?" · "+fecha.tipo.replace("cumpleanos","cumpleaños"):"") });
    });
    tareas.forEach(tarea => {
        if (tarea.prioridad === "alta" && tareaOcurreEnFecha(tarea, fechaHoy) && !tareaCompletadaEnFecha(tarea, fechaHoy)) avisos.push({ categoria:"Tarea de prioridad alta", texto:tarea.texto||"Tarea sin título" });
    });
    pagosPendientes.forEach(pago => {
        if (pagoOcurreEnFecha(pago, fechaHoy) && !pagoPagadoEnFecha(pago, fechaHoy)) avisos.push({ categoria:"Pago pendiente", texto:(pago.nombre||"Pago")+" · "+formatoMonedaPago(pago.monto) });
    });
    entrenamientos.forEach(item => {
        if (entrenamientoOcurreEnFecha(item, fechaHoy) && !entrenamientoCompletadoEnFecha(item, fechaHoy)) avisos.push({ categoria:"Entrenamiento", texto:item.actividad||"Actividad programada" });
    });
    saludRegistros.forEach(item => {
        if (item.fecha === fechaHoy) avisos.push({ categoria:"Salud", texto:"Chequeo"+(item.doctor?" · "+item.doctor:"") });
        if (item.proximaFecha === fechaHoy) avisos.push({ categoria:"Salud", texto:"Revisión médica programada" });
    });
    izelRegistros.forEach(item => {
        if (!izelOcurreEnFecha(item, fechaHoy)) return;
        const estado = item.tipo !== "fecha" && izelRegistroCompletadoEnFecha(item, fechaHoy) ? " · realizada" : "";
        avisos.push({ categoria:"Mi peque Izel", texto:(item.titulo||"Registro")+estado });
    });
    if (typeof listasPendientesDespensaEnFecha === "function") listasPendientesDespensaEnFecha(fechaHoy).forEach(item => avisos.push({ categoria:"Compra Pen. Despensa", texto:item.nombre+" · "+item.productos.length+" producto(s)" }));
    return avisos;
}

function crearAvisoSistema(titulo, cuerpo, etiqueta) {
    if (typeof Notification === "undefined" || Notification.permission !== "granted" || !("serviceWorker" in navigator)) return Promise.resolve(false);
    return navigator.serviceWorker.ready.then(registro => registro.showNotification(titulo, { body:cuerpo, icon:"Icono.png", badge:"Icono.png", tag:etiqueta, data:{ url:"./index.html" } })).then(() => true).catch(error => { console.error("No se pudo mostrar el aviso:", error); return false; });
}

function actualizarAvisosDelDia() {
    const barra=document.getElementById("barraAvisos"), lista=document.getElementById("listaAvisosDelDia");
    if(!barra||!lista)return;
    const hoy=fechaClaveCalendario(new Date()), avisos=obtenerAvisosDelDia(hoy);
    lista.replaceChildren();
    const titulo=document.createElement("strong");titulo.className="titulo-avisos-del-dia";titulo.textContent="Avisos de hoy";lista.appendChild(titulo);
    const ocultas=obtenerCategoriasAvisosOcultas(hoy),grupos=new Map();
    avisos.forEach(aviso=>{if(!grupos.has(aviso.categoria))grupos.set(aviso.categoria,[]);grupos.get(aviso.categoria).push(aviso.texto);});
    let gruposVisibles=0;
    grupos.forEach((mensajes,categoria)=>{
        if(ocultas.has(categoria))return;
        gruposVisibles++;
        const grupo=document.createElement("section");grupo.className="grupo-aviso-del-dia";
        const encabezado=document.createElement("div");encabezado.className="encabezado-aviso-del-dia";
        const nombre=document.createElement("strong");nombre.className="nombre-categoria-aviso";nombre.textContent=categoria;
        const cerrar=document.createElement("button");cerrar.type="button";cerrar.className="cerrar-categoria-aviso";cerrar.textContent="×";cerrar.setAttribute("aria-label","Ocultar avisos de "+categoria+" hasta mañana");cerrar.title="Ocultar hasta mañana";cerrar.onclick=()=>cerrarAvisosCategoria(categoria);
        encabezado.append(nombre,cerrar);grupo.appendChild(encabezado);
        mensajes.forEach(mensaje=>{const elemento=document.createElement("div");elemento.className="aviso-del-dia";elemento.textContent=mensaje;grupo.appendChild(elemento);});
        lista.appendChild(grupo);
    });
    if(!gruposVisibles){const vacio=document.createElement("span");vacio.className="aviso-del-dia sin-avisos-visibles";vacio.textContent=avisos.length?"Ya ocultaste los avisos de hoy.":"No hay avisos para hoy.";lista.appendChild(vacio);}
    barra.hidden=false;
    const avisosNotificables=avisos.filter(aviso=>aviso.categoria!=="Entrenamiento");
    const llave="avisosDiariosNotificados:"+hoy;
    if(avisosNotificables.length&&!localStorage.getItem(llave)&&!notificacionesEnProceso.has(llave)){
        const resumen=avisosNotificables.slice(0,5).map(aviso=>aviso.categoria+": "+aviso.texto).join("\n");
        notificacionesEnProceso.add(llave);
        crearAvisoSistema("MiAppPersonal · avisos de hoy",resumen+(avisosNotificables.length>5?"\nY "+(avisosNotificables.length-5)+" aviso(s) más.":""),llave).then(mostrado=>{if(mostrado)localStorage.setItem(llave,"1");}).finally(()=>notificacionesEnProceso.delete(llave));
    }
}

function revisarRecordatoriosTareas() {
    if(typeof Notification==="undefined"||Notification.permission!=="granted"||!("serviceWorker" in navigator))return;
    const ahora=new Date();
    tareas.forEach((tarea,indice)=>{
        if(!tarea.recordatorio||tarea.recordatorio==="ninguno"||!tarea.hora)return;
        const [hora,minuto]=tarea.hora.split(":").map(Number);
        if(!Number.isFinite(hora)||!Number.isFinite(minuto))return;
        const identidad=tarea.id||[indice,tarea.fecha,tarea.texto].join(":");
        for(let desplazamiento=0;desplazamiento<=1;desplazamiento++){
            const fechaEvento=claveDiaCalendario(new Date(ahora.getFullYear(),ahora.getMonth(),ahora.getDate()+desplazamiento));
            if(!tareaOcurreEnFecha(tarea,fechaEvento)||tareaCompletadaEnFecha(tarea,fechaEvento))continue;
            const fechaPartes=fechaEvento.split("-").map(Number);
            const momentoEvento=new Date(fechaPartes[0],fechaPartes[1]-1,fechaPartes[2],hora,minuto,0,0);
            const momentoAviso=new Date(momentoEvento.getTime()-Number(tarea.recordatorio)*60000);
            if(ahora<momentoAviso)continue;
            const llave="recordatorioTarea:"+identidad+":"+fechaEvento;
            if(localStorage.getItem(llave)||notificacionesEnProceso.has(llave))continue;
            notificacionesEnProceso.add(llave);
            crearAvisoSistema("🔔 Recordatorio de tarea",(tarea.texto||"Tarea")+" · "+tarea.hora,"tarea-"+identidad+"-"+fechaEvento).then(mostrado=>{if(mostrado)localStorage.setItem(llave,"1");}).finally(()=>notificacionesEnProceso.delete(llave));
        }
    });
}


function guardarAprendizajesEnDispositivo(){localStorage.setItem("aprendizajes",JSON.stringify(aprendizajes));}
function mostrarListaAprendizajes(){const lista=document.getElementById("listaAprendizajes");if(!lista)return;lista.replaceChildren();if(!aprendizajes.length){const p=document.createElement("p");p.textContent="Aún no has guardado aprendizajes.";lista.appendChild(p);if(typeof actualizarCalendarioContextual==="function")actualizarCalendarioContextual();return;}
const ordenados=aprendizajes.map((item,indice)=>({item,indice})).sort((a,b)=>b.item.fecha.localeCompare(a.item.fecha));ordenados.forEach(({item,indice})=>{const tarjeta=document.createElement("article");tarjeta.className="tarjeta-aprendizaje";const fecha=document.createElement("h3");const d=new Date(item.fecha+"T00:00:00");fecha.textContent=d.toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"});const texto=document.createElement("p");texto.textContent=item.texto;const acciones=document.createElement("div");acciones.className="acciones-tarjeta-aprendizaje";const editar=document.createElement("button");editar.type="button";editar.textContent="Editar";editar.onclick=function(){editarAprendizaje(indice);};const borrar=document.createElement("button");borrar.type="button";borrar.textContent="Eliminar";borrar.onclick=function(){eliminarAprendizaje(indice);};acciones.append(editar,borrar);tarjeta.append(fecha,texto,acciones);lista.appendChild(tarjeta);});if(typeof actualizarCalendarioContextual==="function")actualizarCalendarioContextual();}
function guardarAprendizaje(){const campoFecha=document.getElementById("fechaAprendizaje"),campoTexto=document.getElementById("textoAprendizaje"),fecha=campoFecha.value,texto=campoTexto.value.trim();if(!fecha){alert("Selecciona el día del aprendizaje.");return;}if(!texto){alert("Escribe qué aprendiste.");campoTexto.focus();return;}if(aprendizajeEditando===null)aprendizajes.push({fecha,texto});else{aprendizajes[aprendizajeEditando]={...aprendizajes[aprendizajeEditando],fecha,texto};aprendizajeEditando=null;}guardarAprendizajesEnDispositivo();campoFecha.value=fechaClaveCalendario(new Date());campoTexto.value="";document.getElementById("botonGuardarAprendizaje").textContent="Guardar aprendizaje";document.getElementById("botonCancelarAprendizaje").hidden=true;mostrarListaAprendizajes();}
function editarAprendizaje(indice){const item=aprendizajes[indice];if(!item)return;aprendizajeEditando=indice;document.getElementById("fechaAprendizaje").value=item.fecha;document.getElementById("textoAprendizaje").value=item.texto;document.getElementById("botonGuardarAprendizaje").textContent="Guardar cambios";document.getElementById("botonCancelarAprendizaje").hidden=false;document.getElementById("textoAprendizaje").focus();}
function cancelarEdicionAprendizaje(){aprendizajeEditando=null;document.getElementById("fechaAprendizaje").value=fechaClaveCalendario(new Date());document.getElementById("textoAprendizaje").value="";document.getElementById("botonGuardarAprendizaje").textContent="Guardar aprendizaje";document.getElementById("botonCancelarAprendizaje").hidden=true;}
function eliminarAprendizaje(indice){if(!aprendizajes[indice])return;if(!confirm("¿Quieres eliminar este aprendizaje?"))return;aprendizajes.splice(indice,1);guardarAprendizajesEnDispositivo();mostrarListaAprendizajes();}
if(document.getElementById("fechaAprendizaje"))document.getElementById("fechaAprendizaje").value=fechaClaveCalendario(new Date());mostrarListaAprendizajes();


function guardarObjetivosEnDispositivo() {
    localStorage.setItem("objetivos", JSON.stringify(objetivos));
}

function abrirNuevoObjetivo() {
    objetivoEditando = null;
    document.getElementById("tituloObjetivo").value = "";
    document.getElementById("descripcionObjetivo").value = "";
    document.getElementById("fechaMetaObjetivo").value = "";
    document.getElementById("progresoObjetivo").value = "0";
    document.getElementById("estadoObjetivo").value = "activo";
    document.getElementById("tituloModalObjetivo").textContent = "＋ Nuevo objetivo";
    document.getElementById("botonGuardarObjetivo").textContent = "Guardar objetivo";
    document.getElementById("modalObjetivo").style.display = "flex";
    document.getElementById("tituloObjetivo").focus();
}

function editarObjetivo(indice) {
    const objetivo = objetivos[indice];
    if (!objetivo) return;
    objetivoEditando = indice;
    document.getElementById("tituloObjetivo").value = objetivo.titulo || "";
    document.getElementById("descripcionObjetivo").value = objetivo.descripcion || "";
    document.getElementById("fechaMetaObjetivo").value = objetivo.fechaMeta || "";
    document.getElementById("progresoObjetivo").value = Number(objetivo.progreso) || 0;
    document.getElementById("estadoObjetivo").value = objetivo.estado || "activo";
    document.getElementById("tituloModalObjetivo").textContent = "✏️ Editar objetivo";
    document.getElementById("botonGuardarObjetivo").textContent = "Guardar cambios";
    document.getElementById("modalObjetivo").style.display = "flex";
    document.getElementById("tituloObjetivo").focus();
}

function cerrarModalObjetivo() {
    const modal = document.getElementById("modalObjetivo");
    if (modal) modal.style.display = "none";
    objetivoEditando = null;
}

function guardarObjetivo() {
    const tituloCampo = document.getElementById("tituloObjetivo");
    const titulo = tituloCampo.value.trim();
    const progresoCampo = document.getElementById("progresoObjetivo");
    const progreso = Number(progresoCampo.value);
    if (!titulo) { alert("Escribe el objetivo que quieres alcanzar."); tituloCampo.focus(); return; }
    if (!Number.isFinite(progreso) || progreso < 0 || progreso > 100) { alert("El progreso debe ser un número entre 0 y 100."); progresoCampo.focus(); return; }
    const anterior = objetivoEditando === null ? null : objetivos[objetivoEditando];
    const estadoSeleccionado = document.getElementById("estadoObjetivo").value;
    const objetivo = {
        id: anterior?.id || "objetivo-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        titulo,
        descripcion: document.getElementById("descripcionObjetivo").value.trim(),
        fechaMeta: document.getElementById("fechaMetaObjetivo").value,
        progreso: estadoSeleccionado === "completado" ? 100 : Math.round(progreso),
        progresoAntesDeCompletar: estadoSeleccionado === "completado"
            ? (anterior?.progresoAntesDeCompletar ?? (anterior?.estado === "completado" ? 0 : Math.round(progreso)))
            : undefined,
        estado: estadoSeleccionado
    };
    if (objetivoEditando === null) objetivos.push(objetivo);
    else objetivos[objetivoEditando] = objetivo;
    guardarObjetivosEnDispositivo();
    cerrarModalObjetivo();
    mostrarListaObjetivos();
}

function eliminarObjetivo(indice) {
    if (!objetivos[indice] || !confirm("¿Quieres eliminar este objetivo?")) return;
    objetivos.splice(indice, 1);
    guardarObjetivosEnDispositivo();
    mostrarListaObjetivos();
}

function cambiarEstadoObjetivo(indice, completado) {
    const objetivo = objetivos[indice];
    if (!objetivo) return;
    if (completado) {
        objetivo.progresoAntesDeCompletar = Math.max(0, Math.min(99, Math.round(Number(objetivo.progreso) || 0)));
        objetivo.progreso = 100;
        objetivo.estado = "completado";
    } else {
        objetivo.progreso = Math.max(0, Math.min(99, Math.round(Number(objetivo.progresoAntesDeCompletar) || 0)));
        objetivo.estado = "activo";
        delete objetivo.progresoAntesDeCompletar;
    }
    guardarObjetivosEnDispositivo();
    mostrarListaObjetivos();
}
function guardarRegistrosTiempoEnDispositivo() {
    localStorage.setItem("registrosTiempo", JSON.stringify(registrosTiempo));
}

function seleccionarFechaTiempo(fecha) {
    if (!fecha) return;
    const seleccionada = new Date(fecha + "T00:00:00");
    if (Number.isNaN(seleccionada.getTime())) return;
    diaSeleccionado = fecha;
    mesContextual = new Date(seleccionada.getFullYear(), seleccionada.getMonth(), 1);
    mostrarListaTiempo();
}

function mostrarListaTiempo() {
    const fechaCampo = document.getElementById("fechaTiempo");
    const textoCampo = document.getElementById("textoRegistroTiempo");
    const lista = document.getElementById("listaRegistrosTiempo");
    const resumen = document.getElementById("resumenDiaTiempo");
    if (!fechaCampo || !textoCampo || !lista || !resumen) return;
    fechaCampo.value = diaSeleccionado;
    const registrosDelDia = registrosTiempo.map((registro, indice) => ({ registro, indice }))
        .filter(({ registro }) => registro.fecha === diaSeleccionado)
        .sort((a, b) => (a.registro.creadoEn || "").localeCompare(b.registro.creadoEn || ""));
    resumen.textContent = registrosDelDia.length
        ? registrosDelDia.length + (registrosDelDia.length === 1 ? " actividad registrada para este día." : " actividades registradas para este día.")
        : "Aún no hay actividades registradas para este día.";
    lista.replaceChildren();
    if (!registrosDelDia.length) {
        const vacio = document.createElement("p");
        vacio.className = "estado-vacio-tiempo";
        vacio.textContent = "Registra una actividad en la que sientes que perdiste tiempo, por ejemplo, scrollear redes sociales.";
        lista.appendChild(vacio);
    } else {
        registrosDelDia.forEach(({ registro, indice }) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-registro-tiempo";
            const texto = document.createElement("p");
            texto.textContent = registro.texto;
            tarjeta.appendChild(texto);
            if (Number(registro.minutos) > 0) {
                const duracion = document.createElement("small");
                duracion.className = "duracion-registro-tiempo";
                duracion.textContent = "Tiempo aproximado: " + registro.minutos + " min";
                tarjeta.appendChild(duracion);
            }
            const acciones = document.createElement("div");
            acciones.className = "acciones-registro-tiempo";
            const editar = document.createElement("button");
            editar.type = "button";
            editar.textContent = "Editar";
            editar.onclick = function () { editarRegistroTiempo(indice); };
            const eliminar = document.createElement("button");
            eliminar.type = "button";
            eliminar.textContent = "Eliminar";
            eliminar.onclick = function () { eliminarRegistroTiempo(indice); };
            acciones.append(editar, eliminar);
            tarjeta.appendChild(acciones);
            lista.appendChild(tarjeta);
        });
    }
    actualizarCalendarioContextual();
}

function guardarRegistroTiempo() {
    const fecha = document.getElementById("fechaTiempo").value;
    const campoTexto = document.getElementById("textoRegistroTiempo");
    const texto = campoTexto.value.trim();
    if (!fecha) { alert("Selecciona el día que quieres registrar."); return; }
    if (!texto) { alert("Escribe la actividad en la que sientes que perdiste tiempo."); campoTexto.focus(); return; }
    const duracionCampo = document.getElementById("duracionRegistroTiempo");
    const minutos = duracionCampo.value.trim() === "" ? null : Number(duracionCampo.value);
    if (minutos !== null && (!Number.isInteger(minutos) || minutos < 1 || minutos > 1440)) {
        alert("El tiempo debe ser un número entero entre 1 y 1440 minutos, o puedes dejarlo vacío.");
        duracionCampo.focus();
        return;
    }
    const anterior = registroTiempoEditando === null ? null : registrosTiempo[registroTiempoEditando];
    const registro = {
        id: anterior?.id || "tiempo-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        fecha,
        texto,
        minutos,
        creadoEn: anterior?.creadoEn || new Date().toISOString()
    };
    if (registroTiempoEditando === null) registrosTiempo.push(registro);
    else registrosTiempo[registroTiempoEditando] = registro;
    diaSeleccionado = fecha;
    const seleccionada = new Date(fecha + "T00:00:00");
    mesContextual = new Date(seleccionada.getFullYear(), seleccionada.getMonth(), 1);
    registroTiempoEditando = null;
    campoTexto.value = "";
    document.getElementById("duracionRegistroTiempo").value = "";
    document.getElementById("botonGuardarRegistroTiempo").textContent = "Guardar actividad";
    document.getElementById("botonCancelarRegistroTiempo").hidden = true;
    guardarRegistrosTiempoEnDispositivo();
    mostrarListaTiempo();
}

function editarRegistroTiempo(indice) {
    const registro = registrosTiempo[indice];
    if (!registro) return;
    registroTiempoEditando = indice;
    diaSeleccionado = registro.fecha;
    const seleccionada = new Date(registro.fecha + "T00:00:00");
    mesContextual = new Date(seleccionada.getFullYear(), seleccionada.getMonth(), 1);
    document.getElementById("fechaTiempo").value = registro.fecha;
    document.getElementById("textoRegistroTiempo").value = registro.texto;
    document.getElementById("duracionRegistroTiempo").value = registro.minutos || "";
    document.getElementById("botonGuardarRegistroTiempo").textContent = "Guardar cambios";
    document.getElementById("botonCancelarRegistroTiempo").hidden = false;
    document.getElementById("textoRegistroTiempo").focus();
    actualizarCalendarioContextual();
}

function cancelarEdicionRegistroTiempo() {
    registroTiempoEditando = null;
    document.getElementById("fechaTiempo").value = diaSeleccionado;
    document.getElementById("textoRegistroTiempo").value = "";
    document.getElementById("duracionRegistroTiempo").value = "";
    document.getElementById("botonGuardarRegistroTiempo").textContent = "Guardar actividad";
    document.getElementById("botonCancelarRegistroTiempo").hidden = true;
}

function eliminarRegistroTiempo(indice) {
    if (!registrosTiempo[indice] || !confirm("¿Quieres eliminar esta actividad de tiempo?")) return;
    registrosTiempo.splice(indice, 1);
    guardarRegistrosTiempoEnDispositivo();
    mostrarListaTiempo();
}
function guardarProyectosEnDispositivo() {
    proyectosLocalesEnDispositivo=proyectos.filter(proyecto=>!proyecto.ownerUid);
    localStorage.setItem("proyectos", JSON.stringify(proyectosLocalesEnDispositivo));
    proyectos.filter(proyecto=>Boolean(proyecto.ownerUid)).forEach(proyecto=>sincronizarProyectoPendiente(proyecto.id));
}

function firmaProyecto(proyecto){if(!proyecto)return"";const data={...proyecto};delete data.id;delete data.ownerUid;delete data.sharedWithUids;delete data.pairId;return JSON.stringify({data,sharedWithUids:proyecto.sharedWithUids||[],pairId:proyecto.pairId||null});}
function sincronizarProyectoPendiente(id){if(!id||!proyectosUsuarioUid)return Promise.resolve();const previa=colasProyectosSincronizando.get(id)||Promise.resolve();const tarea=previa.catch(()=>{}).then(async()=>{const indice=proyectos.findIndex(item=>item.id===id),actual=proyectos[indice];if(indice<0||!actual?.ownerUid)return;const firmaActual=firmaProyecto(actual);if(firmasProyectosSincronizados.get(id)===firmaActual)return;const copia=JSON.parse(JSON.stringify(actual));if(!window.miappProyectosCloud)throw new Error("La sincronización de Proyectos todavía se está iniciando.");const guardado=await window.miappProyectosCloud.guardar(copia,Boolean(copia.sharedWithUids?.length));const posicion=proyectos.findIndex(item=>item.id===id);if(posicion<0)return;const estadoActual=proyectos[posicion];if(firmaProyecto(estadoActual)===firmaActual)proyectos[posicion]=guardado;else Object.assign(estadoActual,{ownerUid:guardado.ownerUid,sharedWithUids:guardado.sharedWithUids,pairId:guardado.pairId});const sincronizado=proyectos[posicion];proyectosNube=proyectosNube.filter(item=>item.id!==id).concat(JSON.parse(JSON.stringify(sincronizado)));firmasProyectosSincronizados.set(id,firmaProyecto(guardado));if(firmaProyecto(sincronizado)!==firmaProyecto(guardado))queueMicrotask(()=>sincronizarProyectoPendiente(id));if(document.getElementById("seccionProyectos")?.classList.contains("activa"))mostrarListaProyectos();});colasProyectosSincronizando.set(id,tarea);tarea.catch(error=>{console.error("No se pudo sincronizar el proyecto:",error);const estado=document.getElementById("estadoSincronizacionProyectos");if(estado){estado.textContent="No se pudo sincronizar un cambio de proyecto: "+(error.message||"revisa tu conexión.");estado.dataset.error="true";}}).finally(()=>{if(colasProyectosSincronizando.get(id)===tarea)colasProyectosSincronizando.delete(id);});return tarea;}

function asegurarRamasProyecto(proyecto) {
    const migrarComoCompletado = proyecto.estado === "completado" && proyecto.completada !== true;
    if (proyecto.estado === "completado") proyecto.completada = true;
    else if (typeof proyecto.completada !== "boolean") proyecto.completada = false;
    if (!Array.isArray(proyecto.ramas)) {
        proyecto.ramas = (Array.isArray(proyecto.subtareas) ? proyecto.subtareas : []).map(subtarea => ({
            id: subtarea.id || "rama-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
            titulo: subtarea.titulo || "Sin título",
            estado: ["pendiente", "en_curso", "completada"].includes(subtarea.estado) ? subtarea.estado : "pendiente",
            completada: subtarea.estado === "completada",
            ramas: []
        }));
    }
    asegurarPesosRamas(proyecto.ramas);
    if (migrarComoCompletado) actualizarMarcadoDescendientes(proyecto.ramas, true);
    return proyecto.ramas;
}

function asegurarPesosRamas(ramas) {
    if (!Array.isArray(ramas) || !ramas.length) return;
    const repartirIgual = function () {
        let asignado = 0;
        ramas.forEach((rama, indice) => {
            rama.porcentaje = indice === ramas.length - 1 ? Math.round((100 - asignado) * 10) / 10 : Math.round(100 / ramas.length * 10) / 10;
            asignado += rama.porcentaje;
        });
    };
    const tienenPesos = ramas.every(rama => Number.isFinite(Number(rama.porcentaje)) && rama.porcentaje !== null && rama.porcentaje !== "");
    if (!tienenPesos) repartirIgual();
    else {
        const total = ramas.reduce((suma, rama) => suma + Math.max(0, Number(rama.porcentaje)), 0);
        if (total <= 0) repartirIgual();
        else if (Math.abs(total - 100) > 0.01) {
            let asignado = 0;
            ramas.forEach((rama, indice) => {
                rama.porcentaje = indice === ramas.length - 1 ? Math.round((100 - asignado) * 10) / 10 : Math.round(Math.max(0, Number(rama.porcentaje)) / total * 100 * 10) / 10;
                asignado += rama.porcentaje;
            });
        }
    }
    ramas.forEach(rama => {
        rama.porcentaje = Number(rama.porcentaje);
        rama.completada = Boolean(rama.completada || rama.estado === "completada");
        if (!Array.isArray(rama.ramas)) rama.ramas = [];
        asegurarPesosRamas(rama.ramas);
    });
}

function redistribuirPorcentajesRamas(ramas, indiceFoco, porcentajeFoco) {
    if (!ramas.length) return;
    if (ramas.length === 1) { ramas[0].porcentaje = 100; return; }
    const valor = Number(porcentajeFoco);
    const foco = Number.isFinite(valor) ? Math.min(100, Math.max(0, Math.round(valor * 10) / 10)) : Number(ramas[indiceFoco].porcentaje || 0);
    ramas[indiceFoco].porcentaje = foco;
    const otros = ramas.map((rama, indice) => indice).filter(indice => indice !== indiceFoco);
    const totalPrevio = otros.reduce((suma, indice) => suma + Math.max(0, Number(ramas[indice].porcentaje) || 0), 0);
    const disponible = Math.round((100 - foco) * 10) / 10;
    let asignado = 0;
    otros.forEach((indice, posicion) => {
        const parte = posicion === otros.length - 1 ? Math.round((disponible - asignado) * 10) / 10 : Math.round((totalPrevio > 0 ? Number(ramas[indice].porcentaje) / totalPrevio : 1 / otros.length) * disponible * 10) / 10;
        ramas[indice].porcentaje = parte;
        asignado += parte;
    });
}

function actualizarMarcadoDescendientes(ramas, completada) {
    ramas.forEach(rama => {
        rama.completada = completada;
        rama.estado = completada ? "completada" : (rama.estado === "completada" ? "pendiente" : rama.estado);
        actualizarMarcadoDescendientes(Array.isArray(rama.ramas) ? rama.ramas : [], completada);
    });
}

function calcularAvanceRama(rama) {
    if (rama.completada || rama.estado === "completada") return 100;
    const ramas = Array.isArray(rama.ramas) ? rama.ramas : [];
    if (!ramas.length) return 0;
    asegurarPesosRamas(ramas);
    return ramas.reduce((avance, hija) => avance + Number(hija.porcentaje) / 100 * calcularAvanceRama(hija), 0);
}

function calcularAvanceProyecto(proyecto) {
    if (proyecto.completada) return 100;
    const ramas = asegurarRamasProyecto(proyecto);
    return ramas.reduce((avance, rama) => avance + Number(rama.porcentaje) / 100 * calcularAvanceRama(rama), 0);
}

function calcularAporteProyecto(proyecto, ruta) {
    let aporte = 100;
    let ramas = asegurarRamasProyecto(proyecto);
    ruta.split(".").map(Number).forEach(indice => {
        const rama = ramas[indice];
        if (!rama) return;
        aporte *= Number(rama.porcentaje) / 100;
        ramas = rama.ramas;
    });
    return aporte;
}

function obtenerRamaProyecto(proyecto, ruta) {
    const indices = ruta.split(".").map(Number);
    let ramas = asegurarRamasProyecto(proyecto);
    let rama = null;
    for (const indice of indices) {
        rama = ramas[indice];
        if (!rama) return null;
        if (!Array.isArray(rama.ramas)) rama.ramas = [];
        ramas = rama.ramas;
    }
    return rama;
}

function abrirNuevoProyecto() {
    proyectoEditando = null;
    document.getElementById("tituloProyecto").value = "";
    document.getElementById("descripcionProyecto").value = "";
    document.getElementById("estadoProyecto").value = "activo";
    document.getElementById("compartirProyecto").checked = false;
    actualizarControlCompartirProyecto();
    document.getElementById("tituloModalProyecto").textContent = "＋ Nuevo proyecto";
    document.getElementById("botonGuardarProyecto").textContent = "Guardar proyecto";
    document.getElementById("modalProyecto").style.display = "flex";
    document.getElementById("tituloProyecto").focus();
}

function editarProyecto(indice) {
    const proyecto = proyectos[indice];
    if (!proyecto) return;
    proyectoEditando = indice;
    document.getElementById("tituloProyecto").value = proyecto.titulo || "";
    document.getElementById("descripcionProyecto").value = proyecto.descripcion || "";
    document.getElementById("estadoProyecto").value = proyecto.estado || "activo";
    document.getElementById("compartirProyecto").checked = Boolean(proyecto.sharedWithUids?.length);
    actualizarControlCompartirProyecto();
    document.getElementById("tituloModalProyecto").textContent = "✏️ Editar proyecto";
    document.getElementById("botonGuardarProyecto").textContent = "Guardar cambios";
    document.getElementById("modalProyecto").style.display = "flex";
    document.getElementById("tituloProyecto").focus();
}

function cerrarModalProyecto() {
    const modal = document.getElementById("modalProyecto");
    if (modal) modal.style.display = "none";
    proyectoEditando = null;
}

async function guardarProyecto() {
    const tituloCampo = document.getElementById("tituloProyecto");
    const titulo = tituloCampo.value.trim();
    if (!titulo) { alert("Escribe el nombre del proyecto."); tituloCampo.focus(); return; }
    const anterior = proyectoEditando === null ? null : proyectos[proyectoEditando];
    const proyecto = {
        ...(anterior||{}),
        id: anterior?.id || "proyecto-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        titulo,
        descripcion: document.getElementById("descripcionProyecto").value.trim(),
        estado: document.getElementById("estadoProyecto").value,
        completada: document.getElementById("estadoProyecto").value === "completado",
        subtareas: Array.isArray(anterior?.subtareas) ? anterior.subtareas : [],
        ramas: anterior ? asegurarRamasProyecto(anterior) : [],
        creadoEn: anterior?.creadoEn || new Date().toISOString()
    };
    actualizarMarcadoDescendientes(asegurarRamasProyecto(proyecto), proyecto.completada);
    const compartir=document.getElementById("compartirProyecto").checked,boton=document.getElementById("botonGuardarProyecto");
    boton.disabled=true;
    try{
        if(anterior?.ownerUid||(proyectosUsuarioUid&&(proyectoEditando===null||compartir))){
            if(!window.miappProyectosCloud)throw new Error("La sincronización de Proyectos todavía se está iniciando. Inténtalo en unos segundos.");
            const guardado=await window.miappProyectosCloud.guardar(proyecto,compartir);
            if(!anterior?.ownerUid)proyectosLocalesEnDispositivo=proyectosLocalesEnDispositivo.filter(item=>item.id!==anterior?.id);
            proyectosNube=proyectosNube.filter(item=>item.id!==guardado.id).concat(JSON.parse(JSON.stringify(guardado)));
            if(proyectoEditando===null)proyectos.push(guardado);else proyectos[proyectoEditando]=guardado;
            firmasProyectosSincronizados.set(guardado.id,firmaProyecto(guardado));
        }else if(proyectoEditando===null)proyectos.push(proyecto);
        else proyectos[proyectoEditando]=proyecto;
        proyectoEditando=null;
        guardarProyectosEnDispositivo();
        cerrarModalProyecto();
        mostrarListaProyectos();
    }catch(error){alert("No se pudo guardar el proyecto: "+(error.message||"revisa tu conexión."));}
    finally{boton.disabled=false;}
}

function cambiarEstadoProyecto(indice, estado) {
    const proyecto = proyectos[indice];
    if (!proyecto) return;
    proyecto.estado = estado;
    proyecto.completada = estado === "completado";
    actualizarMarcadoDescendientes(asegurarRamasProyecto(proyecto), proyecto.completada);
    guardarProyectosEnDispositivo();
    mostrarListaProyectos();
}

async function eliminarProyecto(indice) {
    if (!proyectos[indice] || !confirm("¿Quieres eliminar este proyecto y sus subtareas?")) return;
    const proyecto=proyectos[indice];
    if(proyecto.ownerUid&&proyecto.ownerUid!==proyectosUsuarioUid){alert("Solo quien creó este proyecto puede eliminarlo.");return;}
    try{if(proyecto.ownerUid){if(!window.miappProyectosCloud)throw new Error("La sincronización todavía se está iniciando.");await window.miappProyectosCloud.eliminar(proyecto);proyectosNube=proyectosNube.filter(item=>item.id!==proyecto.id);firmasProyectosSincronizados.delete(proyecto.id);}proyectos.splice(indice,1);guardarProyectosEnDispositivo();mostrarListaProyectos();}
    catch(error){alert("No se pudo eliminar el proyecto: "+(error.message||"revisa tu conexión."));}
}

function agregarRamaProyecto(indice, ruta, titulo) {
    const proyecto = proyectos[indice];
    const texto = titulo.trim();
    if (!proyecto || !texto) return;
    const rama = ruta ? obtenerRamaProyecto(proyecto, ruta) : null;
    const destino = rama ? rama.ramas : asegurarRamasProyecto(proyecto);
    destino.push({ id: "rama-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7), titulo: texto, estado: "pendiente", completada: false, porcentaje: 0, ramas: [] });
    redistribuirPorcentajesRamas(destino, destino.length - 1, 100 / destino.length);
    guardarProyectosEnDispositivo();
    mostrarListaProyectos();
}

function cambiarEstadoRamaProyecto(indiceProyecto, ruta, estado) {
    const proyecto = proyectos[indiceProyecto];
    const rama = proyecto && obtenerRamaProyecto(proyecto, ruta);
    if (!rama) return;
    rama.estado = estado;
    rama.completada = estado === "completada";
    actualizarMarcadoDescendientes(rama.ramas, rama.completada);
    guardarProyectosEnDispositivo();
    mostrarListaProyectos();
}

function cambiarMarcadoProyecto(indiceProyecto, completada) {
    const proyecto = proyectos[indiceProyecto];
    if (!proyecto) return;
    proyecto.completada = completada;
    proyecto.estado = completada ? "completado" : (proyecto.estado === "completado" ? "activo" : proyecto.estado);
    actualizarMarcadoDescendientes(asegurarRamasProyecto(proyecto), completada);
    guardarProyectosEnDispositivo();
    mostrarListaProyectos();
}

function cambiarMarcadoRamaProyecto(indiceProyecto, ruta, completada) {
    const proyecto = proyectos[indiceProyecto];
    const rama = proyecto && obtenerRamaProyecto(proyecto, ruta);
    if (!rama) return;
    rama.completada = completada;
    rama.estado = completada ? "completada" : (rama.estado === "completada" ? "pendiente" : rama.estado);
    actualizarMarcadoDescendientes(rama.ramas, completada);
    guardarProyectosEnDispositivo();
    mostrarListaProyectos();
}

function cambiarPorcentajeRamaProyecto(indiceProyecto, ruta, porcentaje) {
    const proyecto = proyectos[indiceProyecto];
    if (!proyecto) return;
    const indices = ruta.split(".").map(Number);
    const indice = indices.pop();
    const hermanas = indices.length ? obtenerRamaProyecto(proyecto, indices.join("."))?.ramas : asegurarRamasProyecto(proyecto);
    if (!hermanas?.[indice]) return;
    redistribuirPorcentajesRamas(hermanas, indice, porcentaje);
    guardarProyectosEnDispositivo();
    mostrarListaProyectos();
}

function eliminarRamaProyecto(indiceProyecto, ruta) {
    const proyecto = proyectos[indiceProyecto];
    if (!proyecto || !confirm("¿Quieres quitar esta rama y todas las subramas que contiene?")) return;
    const indices = ruta.split(".").map(Number);
    const indice = indices.pop();
    const contenedor = indices.length ? obtenerRamaProyecto(proyecto, indices.join("."))?.ramas : asegurarRamasProyecto(proyecto);
    if (!contenedor?.[indice]) return;
    contenedor.splice(indice, 1);
    if (contenedor.length) {
        const total = contenedor.reduce((suma, rama) => suma + Number(rama.porcentaje || 0), 0);
        const pesoFinal = total > 0 ? Number(contenedor[contenedor.length - 1].porcentaje) * 100 / total : 100 / contenedor.length;
        redistribuirPorcentajesRamas(contenedor, contenedor.length - 1, pesoFinal);
    }
    guardarProyectosEnDispositivo();
    mostrarListaProyectos();
}

function crearTarjetaProyecto(proyecto, indice) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-proyecto estado-proyecto-" + (proyecto.estado || "activo");
    const encabezado = document.createElement("div");
    encabezado.className = "encabezado-proyecto";
    const titulo = document.createElement("h3");
    titulo.textContent = proyecto.titulo;
    const estado = document.createElement("select");
    estado.setAttribute("aria-label", "Estado del proyecto " + proyecto.titulo);
    [["activo", "En progreso"], ["planeado", "Por iniciar"], ["pausado", "En pausa"], ["completado", "Completado"]].forEach(([valor, texto]) => {
        const opcion = document.createElement("option");
        opcion.value = valor;
        opcion.textContent = texto;
        estado.appendChild(opcion);
    });
    estado.value = proyecto.estado || "activo";
    estado.onchange = function () { cambiarEstadoProyecto(indice, estado.value); };
    const controles = document.createElement("div");
    controles.className = "controles-avance-proyecto";
    const etiquetaCheck = document.createElement("label");
    etiquetaCheck.className = "check-proyecto";
    const checkProyecto = document.createElement("input");
    checkProyecto.type = "checkbox";
    checkProyecto.checked = Boolean(proyecto.completada || proyecto.estado === "completado");
    checkProyecto.setAttribute("aria-label", "Marcar proyecto como completado: " + proyecto.titulo);
    checkProyecto.onchange = function () { cambiarMarcadoProyecto(indice, checkProyecto.checked); };
    etiquetaCheck.append(checkProyecto, document.createTextNode(" Completado"));
    const indicador = document.createElement("div");
    indicador.className = "indicador-avance-proyecto";
    const avance = calcularAvanceProyecto(proyecto);
    const textoAvance = document.createElement("span");
    textoAvance.textContent = "Avance de ramas: " + Math.round(avance) + "%";
    const barraAvance = document.createElement("progress");
    barraAvance.max = 100;
    barraAvance.value = avance;
    barraAvance.setAttribute("aria-label", "Avance del proyecto " + proyecto.titulo);
    indicador.append(textoAvance, barraAvance);
    controles.append(etiquetaCheck, estado, indicador);
    encabezado.append(titulo, controles);
    tarjeta.appendChild(encabezado);
    const privacidad=document.createElement("small");privacidad.className="estado-privacidad-proyecto";privacidad.textContent=!proyecto.ownerUid?"Solo en este dispositivo":proyecto.sharedWithUids?.length?"Compartido con la cuenta vinculada":"Privado en tu cuenta";tarjeta.appendChild(privacidad);
    if (proyecto.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.className = "descripcion-proyecto";
        descripcion.textContent = proyecto.descripcion;
        tarjeta.appendChild(descripcion);
    }

    tarjeta.appendChild(crearRamasProyecto(proyecto, indice, ""));

    const acciones = document.createElement("div");
    acciones.className = "acciones-proyecto";
    const editar = document.createElement("button");
    editar.type = "button";
    editar.textContent = "Editar proyecto";
    editar.onclick = function () { editarProyecto(indice); };
    const eliminar = document.createElement("button");
    eliminar.type = "button";
    eliminar.textContent = "Eliminar proyecto";
    eliminar.disabled=Boolean(proyecto.ownerUid&&proyecto.ownerUid!==proyectosUsuarioUid);
    if(eliminar.disabled)eliminar.title="Solo quien creó este proyecto puede eliminarlo.";
    eliminar.onclick = function () { eliminarProyecto(indice); };
    acciones.append(editar, eliminar);
    tarjeta.appendChild(acciones);
    return tarjeta;
}

function crearRamasProyecto(proyecto, indiceProyecto, rutaPadre) {
    const ramas = rutaPadre ? (obtenerRamaProyecto(proyecto, rutaPadre)?.ramas || []) : asegurarRamasProyecto(proyecto);
    const contenedor = document.createElement("div");
    contenedor.className = "diagrama-ramas-proyecto";
    if (!rutaPadre && !ramas.length) {
        const vacio = document.createElement("p");
        vacio.className = "estado-vacio-subtareas";
        vacio.textContent = "Agrega la primera rama a la derecha del proyecto.";
        contenedor.appendChild(vacio);
    }
    const lista = document.createElement("div");
    lista.className = "lista-ramas-proyecto";
    ramas.forEach((rama, indiceRama) => {
        const ruta = rutaPadre ? rutaPadre + "." + indiceRama : String(indiceRama);
        lista.appendChild(crearNodoRamaProyecto(proyecto, indiceProyecto, rama, ruta));
    });
    contenedor.appendChild(lista);
    const formulario = document.createElement("form");
    formulario.className = "formulario-subtarea-proyecto";
    const entrada = document.createElement("input");
    entrada.type = "text";
    entrada.maxLength = 180;
    entrada.placeholder = rutaPadre ? "Nueva subrama" : "Nueva rama del proyecto";
    entrada.setAttribute("aria-label", entrada.placeholder + " " + proyecto.titulo);
    const agregar = document.createElement("button");
    agregar.type = "submit";
    agregar.textContent = "＋ Agregar rama";
    formulario.onsubmit = function (evento) {
        evento.preventDefault();
        if (!entrada.value.trim()) { entrada.focus(); return; }
        agregarRamaProyecto(indiceProyecto, rutaPadre, entrada.value);
    };
    formulario.append(entrada, agregar);
    contenedor.appendChild(formulario);
    return contenedor;
}

function crearNodoRamaProyecto(proyecto, indiceProyecto, rama, ruta) {
    const envoltura = document.createElement("div");
    envoltura.className = "nodo-rama-proyecto estado-rama-" + (rama.estado || "pendiente");
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-rama-proyecto";
    const checkLabel = document.createElement("label");
    checkLabel.className = "check-rama-proyecto";
    const checkRama = document.createElement("input");
    checkRama.type = "checkbox";
    checkRama.checked = Boolean(rama.completada || rama.estado === "completada");
    checkRama.setAttribute("aria-label", "Marcar como completada: " + rama.titulo);
    checkRama.onchange = function () { cambiarMarcadoRamaProyecto(indiceProyecto, ruta, checkRama.checked); };
    const titulo = document.createElement("h4");
    titulo.textContent = rama.titulo;
    checkLabel.append(checkRama, titulo);
    const estado = document.createElement("select");
    estado.setAttribute("aria-label", "Estado de " + rama.titulo);
    [["pendiente", "Pendiente"], ["en_curso", "En curso"], ["completada", "Completada"]].forEach(([valor, texto]) => {
        const opcion = document.createElement("option");
        opcion.value = valor;
        opcion.textContent = texto;
        estado.appendChild(opcion);
    });
    estado.value = rama.estado || "pendiente";
    estado.onchange = function () { cambiarEstadoRamaProyecto(indiceProyecto, ruta, estado.value); };
    const porcentajeLabel = document.createElement("label");
    porcentajeLabel.className = "porcentaje-rama-proyecto";
    porcentajeLabel.appendChild(document.createTextNode("Peso en su nivel "));
    const porcentaje = document.createElement("input");
    porcentaje.type = "number";
    porcentaje.min = "0";
    porcentaje.max = "100";
    porcentaje.step = "0.1";
    porcentaje.value = Number(rama.porcentaje || 0).toFixed(1);
    porcentaje.setAttribute("aria-label", "Porcentaje de aportación de " + rama.titulo);
    porcentaje.onchange = function () { cambiarPorcentajeRamaProyecto(indiceProyecto, ruta, porcentaje.value); };
    porcentajeLabel.appendChild(porcentaje);
    const aporte = document.createElement("small");
    aporte.className = "aporte-rama-proyecto";
    aporte.textContent = "Aporta al proyecto: " + (Math.round(calcularAporteProyecto(proyecto, ruta) * 10) / 10).toFixed(1) + "%";
    const indicadorAvanceRama = document.createElement("div");
    indicadorAvanceRama.className = "indicador-avance-rama";
    const avanceRama = calcularAvanceRama(rama);
    const textoAvanceRama = document.createElement("span");
    textoAvanceRama.textContent = "Avance de esta rama: " + Math.round(avanceRama) + "%";
    const barraAvanceRama = document.createElement("progress");
    barraAvanceRama.max = 100;
    barraAvanceRama.value = avanceRama;
    barraAvanceRama.setAttribute("aria-label", "Avance de la rama " + rama.titulo);
    indicadorAvanceRama.append(textoAvanceRama, barraAvanceRama);
    const eliminar = document.createElement("button");
    eliminar.type = "button";
    eliminar.className = "boton-eliminar-subtarea";
    eliminar.textContent = "Quitar";
    eliminar.setAttribute("aria-label", "Quitar " + rama.titulo + " y sus subramas");
    eliminar.onclick = function () { eliminarRamaProyecto(indiceProyecto, ruta); };
    tarjeta.append(checkLabel, estado, porcentajeLabel, aporte, indicadorAvanceRama, eliminar);
    envoltura.append(tarjeta, crearRamasProyecto(proyecto, indiceProyecto, ruta));
    return envoltura;
}

function mostrarListaProyectos() {
    const lista = document.getElementById("listaProyectos");
    if (!lista) return;
    lista.replaceChildren();
    if (!proyectos.length) {
        const vacio = document.createElement("p");
        vacio.className = "estado-vacio-proyectos";
        vacio.textContent = "Aún no tienes proyectos registrados. Agrega uno para crear ramas y subramas en un diagrama horizontal.";
        lista.appendChild(vacio);
        return;
    }
    proyectos.forEach(asegurarRamasProyecto);
    const pendientes = proyectos.map((proyecto, indice) => ({ proyecto, indice })).filter(({ proyecto }) => !proyecto.completada);
    const completados = proyectos.map((proyecto, indice) => ({ proyecto, indice })).filter(({ proyecto }) => proyecto.completada);
    if (pendientes.length) {
        pendientes.forEach(({ proyecto, indice }) => lista.appendChild(crearTarjetaProyecto(proyecto, indice)));
    } else {
        const vacio = document.createElement("p");
        vacio.className = "estado-vacio-proyectos";
        vacio.textContent = "No tienes proyectos pendientes. Los proyectos completados están en la lista de abajo.";
        lista.appendChild(vacio);
    }
    if (completados.length) {
        const realizados = document.createElement("details");
        realizados.className = "proyectos-realizados";
        const resumen = document.createElement("summary");
        resumen.textContent = "Proyectos realizados (" + completados.length + ")";
        const listaCompletados = document.createElement("div");
        listaCompletados.className = "lista-proyectos-completados";
        completados.forEach(({ proyecto, indice }) => listaCompletados.appendChild(crearTarjetaProyecto(proyecto, indice)));
        realizados.append(resumen, listaCompletados);
        lista.appendChild(realizados);
    }
}
function crearTarjetaObjetivo(objetivo, indice) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-objetivo" + (objetivo.estado === "completado" ? " objetivo-completado" : "");
    const encabezado = document.createElement("div");
    encabezado.className = "encabezado-objetivo";
    const titulo = document.createElement("h3");
    titulo.textContent = objetivo.titulo;
    if (objetivo.estado === "completado") {
        const flecha = document.createElement("span");
        flecha.className = "icono-objetivo-alcanzado";
        flecha.setAttribute("aria-label", "Objetivo alcanzado");
        flecha.textContent = "➜";
        titulo.append(" ", flecha);
    }
    const estado = document.createElement("span");
    const estados = { activo: "En progreso", pausado: "En pausa", completado: "Alcanzado" };
    estado.textContent = estados[objetivo.estado] || estados.activo;
    encabezado.append(titulo, estado);
    tarjeta.appendChild(encabezado);
    if (objetivo.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.className = "descripcion-objetivo";
        descripcion.textContent = objetivo.descripcion;
        tarjeta.appendChild(descripcion);
    }
    const progreso = objetivo.estado === "completado" ? 100 : Math.max(0, Math.min(100, Number(objetivo.progreso) || 0));
    const filaProgreso = document.createElement("div");
    filaProgreso.className = "fila-progreso-objetivo";
    const textoProgreso = document.createElement("span");
    textoProgreso.textContent = progreso + "% completado";
    const barraFondo = document.createElement("div");
    barraFondo.className = "barra-progreso-objetivo";
    barraFondo.setAttribute("role", "progressbar");
    barraFondo.setAttribute("aria-valuemin", "0");
    barraFondo.setAttribute("aria-valuemax", "100");
    barraFondo.setAttribute("aria-valuenow", String(progreso));
    const barra = document.createElement("span");
    barra.style.width = progreso + "%";
    barraFondo.appendChild(barra);
    filaProgreso.append(textoProgreso, barraFondo);
    tarjeta.appendChild(filaProgreso);
    if (objetivo.fechaMeta) {
        const fecha = document.createElement("p");
        fecha.className = "meta-objetivo";
        fecha.textContent = "🎯 Fecha meta: " + formatoFechaCorta(objetivo.fechaMeta);
        tarjeta.appendChild(fecha);
    }
    const acciones = document.createElement("div");
    acciones.className = "acciones-tarjeta-objetivo";
    const etiquetaCheck = document.createElement("label");
    etiquetaCheck.className = "check-objetivo";
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = objetivo.estado === "completado";
    check.setAttribute("aria-label", (check.checked ? "Reabrir objetivo " : "Marcar objetivo alcanzado: ") + objetivo.titulo);
    check.onchange = function () { cambiarEstadoObjetivo(indice, check.checked); };
    etiquetaCheck.append(check, document.createTextNode("Alcanzado"));
    acciones.appendChild(etiquetaCheck);
    const editar = document.createElement("button");
    editar.type = "button";
    editar.textContent = "Editar";
    editar.onclick = function () { editarObjetivo(indice); };
    const eliminar = document.createElement("button");
    eliminar.type = "button";
    eliminar.textContent = "Eliminar";
    eliminar.onclick = function () { eliminarObjetivo(indice); };
    acciones.append(editar, eliminar);
    tarjeta.appendChild(acciones);
    return tarjeta;
}

function mostrarListaObjetivos() {
    const lista = document.getElementById("listaObjetivos");
    if (!lista) return;
    lista.replaceChildren();
    const ordenados = objetivos.map((objetivo, indice) => ({ objetivo, indice }))
        .sort((a, b) => (a.objetivo.fechaMeta || "9999-12-31").localeCompare(b.objetivo.fechaMeta || "9999-12-31"));
    const pendientes = ordenados.filter(({ objetivo }) => objetivo.estado !== "completado");
    const completados = ordenados.filter(({ objetivo }) => objetivo.estado === "completado");

    const tituloPendientes = document.createElement("h3");
    tituloPendientes.className = "subtitulo-lista-objetivos";
    tituloPendientes.textContent = "Objetivos pendientes";
    lista.appendChild(tituloPendientes);
    if (!pendientes.length) {
        const vacio = document.createElement("p");
        vacio.className = "estado-vacio-objetivos";
        vacio.textContent = "No hay objetivos pendientes. Puedes agregar uno nuevo o revisar los objetivos alcanzados de abajo.";
        lista.appendChild(vacio);
    } else {
        pendientes.forEach(({ objetivo, indice }) => lista.appendChild(crearTarjetaObjetivo(objetivo, indice)));
    }

    if (completados.length) {
        const desplegable = document.createElement("details");
        desplegable.className = "desplegable-objetivos-completados";
        const resumen = document.createElement("summary");
        resumen.textContent = "Objetivos alcanzados (" + completados.length + ")";
        desplegable.appendChild(resumen);
        const listaCompletados = document.createElement("div");
        listaCompletados.className = "lista-objetivos-completados";
        completados.forEach(({ objetivo, indice }) => listaCompletados.appendChild(crearTarjetaObjetivo(objetivo, indice)));
        desplegable.appendChild(listaCompletados);
        lista.appendChild(desplegable);
    }
    actualizarCalendarioContextual();
}function guardarEntrenamientosEnDispositivo() {
    entrenamientosLocalesEnDispositivo=entrenamientos.filter(item=>!item.ownerUid);
    localStorage.setItem("entrenamientos", JSON.stringify(entrenamientosLocalesEnDispositivo));
    if (typeof actualizarAvisosDelDia === "function") actualizarAvisosDelDia();
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
    document.getElementById("compartirEntrenamiento").checked = false;
    actualizarControlCompartirEntrenamiento();
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
    document.getElementById("compartirEntrenamiento").checked = Boolean(item.sharedWithUids?.length);
    actualizarControlCompartirEntrenamiento();
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
    actualizarControlCompartirEntrenamiento();
}

async function guardarEntrenamiento() {
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
        ...(anterior||{}),
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
    const compartir=document.getElementById("compartirEntrenamiento").checked,boton=document.getElementById("botonGuardarEntrenamiento");boton.disabled=true;
    try{
        if(anterior?.ownerUid||(entrenamientoUsuarioUid&&(entrenamientoEditando===null||compartir))){
            if(!window.miappEntrenamientoCloud)throw new Error("La sincronización de Entrenamiento todavía se está iniciando. Inténtalo en unos segundos.");
            const guardado=await window.miappEntrenamientoCloud.guardar({...anterior,...registro},compartir);
            if(!anterior?.ownerUid)entrenamientosLocalesEnDispositivo=entrenamientosLocalesEnDispositivo.filter(item=>item.id!==anterior?.id);
            entrenamientosNube=entrenamientosNube.filter(item=>item.id!==guardado.id).concat(guardado);
            if(entrenamientoEditando===null)entrenamientos.push(guardado);else entrenamientos[entrenamientoEditando]=guardado;
        }else if(entrenamientoEditando===null)entrenamientos.push(registro);
        else entrenamientos[entrenamientoEditando]=registro;
        entrenamientoEditando=null;diaSeleccionado=fecha;const seleccionada=new Date(fecha+"T00:00:00");mesContextual=new Date(seleccionada.getFullYear(),seleccionada.getMonth(),1);
        guardarEntrenamientosEnDispositivo();cerrarModalEntrenamiento();mostrarListaEntrenamientos();mostrarResumenEntrenamiento();
    }catch(error){alert("No se pudo guardar la actividad: "+(error.message||"revisa tu conexión."));}
    finally{boton.disabled=false;}
}

async function cambiarEstadoEntrenamiento(indice, fechaClave, completada) {
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
    try{if(item.ownerUid){if(!window.miappEntrenamientoCloud)throw new Error("La sincronización todavía se está iniciando.");await window.miappEntrenamientoCloud.marcar(item,fechaClave,completada);entrenamientosNube=entrenamientosNube.map(registro=>registro.id===item.id?{...item}:registro);}guardarEntrenamientosEnDispositivo();mostrarListaEntrenamientos();mostrarResumenEntrenamiento();}
    catch(error){alert("No se pudo actualizar la actividad: "+(error.message||"revisa tu conexión."));}
}

async function eliminarEntrenamiento(indice) {
    if (!entrenamientos[indice] || !confirm("¿Quieres eliminar esta actividad de entrenamiento?")) return;
    const item=entrenamientos[indice];if(item.ownerUid&&item.ownerUid!==entrenamientoUsuarioUid){alert("Solo quien creó esta actividad puede eliminarla.");return;}
    try{if(item.ownerUid){if(!window.miappEntrenamientoCloud)throw new Error("La sincronización todavía se está iniciando.");await window.miappEntrenamientoCloud.eliminar(item);entrenamientosNube=entrenamientosNube.filter(registro=>registro.id!==item.id);}entrenamientos.splice(indice,1);guardarEntrenamientosEnDispositivo();mostrarListaEntrenamientos();mostrarResumenEntrenamiento();}
    catch(error){alert("No se pudo eliminar la actividad: "+(error.message||"revisa tu conexión."));}
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
        const privacidad=document.createElement("small");privacidad.className="detalle-entrenamiento";privacidad.textContent=!item.ownerUid?"Solo en este dispositivo":item.sharedWithUids?.length?"Compartida con la cuenta vinculada":"Privada en tu cuenta";tarjeta.appendChild(privacidad);
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
        borrar.disabled=Boolean(item.ownerUid&&item.ownerUid!==entrenamientoUsuarioUid);
        if(borrar.disabled)borrar.title="Solo quien creó esta actividad puede eliminarla.";
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

function mostrarResumenEntrenamiento() {
    const panel = document.getElementById("panelResumenEntrenamiento");
    const selectorPeriodo = document.getElementById("periodoResumenEntrenamiento");
    const selectorFecha = document.getElementById("fechaReferenciaEntrenamiento");
    if (!panel || !selectorPeriodo || !selectorFecha) return;
    if (!selectorFecha.value) selectorFecha.value = diaSeleccionado || fechaClaveCalendario(new Date());
    panel.replaceChildren();

    const periodo = selectorPeriodo.value;
    const rango = obtenerRangoResumenFinanzas(periodo, selectorFecha.value);
    const ocurrencias = [];
    entrenamientos.forEach(item => {
        for (let dia = 0; dia < rango.cantidadDias; dia++) {
            const fecha = claveDiaCalendario(new Date(rango.inicio.getFullYear(), rango.inicio.getMonth(), rango.inicio.getDate() + dia));
            if (entrenamientoOcurreEnFecha(item, fecha)) {
                ocurrencias.push({ item, fecha, completada: entrenamientoCompletadoEnFecha(item, fecha) });
            }
        }
    });
    const realizadas = ocurrencias.filter(item => item.completada).length;
    const minutosProgramados = ocurrencias.reduce((suma, item) => suma + (Number(item.item.duracion) || 0), 0);
    const minutosRealizados = ocurrencias.filter(item => item.completada).reduce((suma, item) => suma + (Number(item.item.duracion) || 0), 0);
    const porcentaje = ocurrencias.length ? Math.round(realizadas / ocurrencias.length * 100) : 0;
    const nombrePeriodo = { dia: "del día", semana: "de la semana", mes: "del mes", anio: "del año" }[periodo];

    const metricas = document.createElement("div");
    metricas.className = "tarjetas-resumen-finanzas";
    [
        [String(ocurrencias.length), "Actividades " + nombrePeriodo],
        [String(realizadas), "Actividades realizadas"],
        [minutosProgramados + " min", "Minutos programados"],
        [minutosRealizados + " min", "Minutos realizados"],
        [porcentaje + "%", "Cumplimiento"]
    ].forEach(([valor, etiqueta]) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-metrica-pago";
        const numero = document.createElement("strong");
        numero.textContent = valor;
        const texto = document.createElement("span");
        texto.textContent = etiqueta;
        tarjeta.append(numero, texto);
        metricas.appendChild(tarjeta);
    });
    panel.appendChild(metricas);

    const desglose = document.createElement("section");
    desglose.className = "desglose-entrenamiento";
    const tituloDesglose = document.createElement("h3");
    tituloDesglose.textContent = "Actividad física y mental";
    desglose.appendChild(tituloDesglose);
    [["fisico", "🏋️ Ejercicio físico"], ["mental", "🧠 Ejercicio mental"]].forEach(([tipo, etiqueta]) => {
        const grupo = ocurrencias.filter(ocurrencia => (ocurrencia.item.tipo === "mental" ? "mental" : "fisico") === tipo);
        const completadas = grupo.filter(ocurrencia => ocurrencia.completada).length;
        const minutos = grupo.reduce((suma, ocurrencia) => suma + (Number(ocurrencia.item.duracion) || 0), 0);
        const fila = document.createElement("article");
        fila.className = "fila-desglose-entrenamiento";
        const nombre = document.createElement("strong");
        nombre.textContent = etiqueta;
        const detalle = document.createElement("span");
        detalle.textContent = grupo.length + (grupo.length === 1 ? " actividad" : " actividades") + " · " + completadas + " realizadas · " + minutos + " min";
        fila.append(nombre, detalle);
        desglose.appendChild(fila);
    });
    panel.appendChild(desglose);

    const tendencia = document.createElement("section");
    tendencia.className = "grafica-tendencia-finanzas";
    const tituloGrafica = document.createElement("h3");
    tituloGrafica.textContent = periodo === "anio" ? "Actividades por mes" : periodo === "dia" ? "Actividades del día" : "Actividades por día";
    tendencia.appendChild(tituloGrafica);
    if (!ocurrencias.length) {
        const vacio = document.createElement("p");
        vacio.textContent = "Aún no hay actividades de entrenamiento en este periodo.";
        tendencia.appendChild(vacio);
    } else {
        const serie = [];
        if (periodo === "anio") {
            for (let mes = 0; mes < 12; mes++) {
                const inicioMes = claveDiaCalendario(new Date(rango.inicio.getFullYear(), mes, 1));
                const finMes = claveDiaCalendario(new Date(rango.inicio.getFullYear(), mes + 1, 0));
                const grupo = ocurrencias.filter(item => item.fecha >= inicioMes && item.fecha <= finMes);
                serie.push({ etiqueta: new Date(rango.inicio.getFullYear(), mes, 1).toLocaleDateString("es-MX", { month: "short" }), cantidad: grupo.length, realizadas: grupo.filter(item => item.completada).length });
            }
        } else if (periodo === "dia") {
            ocurrencias.forEach(ocurrencia => serie.push({ etiqueta: ocurrencia.item.actividad, cantidad: 1, realizadas: ocurrencia.completada ? 1 : 0 }));
        } else {
            for (let dia = 0; dia < rango.cantidadDias; dia++) {
                const fecha = claveDiaCalendario(new Date(rango.inicio.getFullYear(), rango.inicio.getMonth(), rango.inicio.getDate() + dia));
                const grupo = ocurrencias.filter(item => item.fecha === fecha);
                serie.push({ etiqueta: periodo === "semana" ? new Date(fecha + "T00:00:00").toLocaleDateString("es-MX", { weekday: "short" }) : String(Number(fecha.slice(-2))), cantidad: grupo.length, realizadas: grupo.filter(item => item.completada).length });
            }
        }
        const barras = document.createElement("div");
        barras.className = "grafica-barras-finanzas";
        const maximo = Math.max(...serie.map(item => item.cantidad), 1);
        serie.forEach(item => {
            const columna = document.createElement("div");
            columna.className = "columna-grafica-finanzas";
            columna.title = item.etiqueta + ": " + item.cantidad + " actividades, " + item.realizadas + " realizadas";
            const barra = document.createElement("span");
            barra.className = "barra-periodo-entrenamiento";
            barra.style.height = Math.max(3, item.cantidad / maximo * 100) + "%";
            const valor = document.createElement("small");
            valor.textContent = String(item.cantidad);
            const etiqueta = document.createElement("small");
            etiqueta.textContent = item.etiqueta;
            columna.append(barra, valor, etiqueta);
            barras.appendChild(columna);
        });
        tendencia.appendChild(barras);
    }
    panel.appendChild(tendencia);
}
function prepararInterfazResumenTareas() {
    const seccion = document.getElementById("resultadoTareas");
    if (!seccion || document.getElementById("panelResumenTareas")) return;
    seccion.replaceChildren();
    const titulo = document.createElement("h2");
    titulo.textContent = "✅ Resultado de tareas";
    const descripcion = document.createElement("p");
    descripcion.textContent = "Consulta las tareas programadas, completadas y pendientes por día, semana, mes o año. Las repeticiones se cuentan por cada fecha en que ocurren.";
    const controles = document.createElement("div");
    controles.className = "controles-resumen-finanzas";
    const campoPeriodo = document.createElement("div");
    const etiquetaPeriodo = document.createElement("label");
    etiquetaPeriodo.htmlFor = "periodoResumenTareas";
    etiquetaPeriodo.textContent = "Periodo";
    const selectorPeriodo = document.createElement("select");
    selectorPeriodo.id = "periodoResumenTareas";
    [["dia", "Día"], ["semana", "Semana"], ["mes", "Mes"], ["anio", "Año"]].forEach(([valor, texto]) => {
        const opcion = document.createElement("option");
        opcion.value = valor;
        opcion.textContent = texto;
        if (valor === "mes") opcion.selected = true;
        selectorPeriodo.appendChild(opcion);
    });
    selectorPeriodo.onchange = mostrarResumenTareas;
    campoPeriodo.append(etiquetaPeriodo, selectorPeriodo);
    const campoFecha = document.createElement("div");
    const etiquetaFecha = document.createElement("label");
    etiquetaFecha.htmlFor = "fechaReferenciaTareas";
    etiquetaFecha.textContent = "Fecha de referencia";
    const selectorFecha = document.createElement("input");
    selectorFecha.id = "fechaReferenciaTareas";
    selectorFecha.type = "date";
    selectorFecha.value = diaSeleccionado || fechaClaveCalendario(new Date());
    selectorFecha.onchange = mostrarResumenTareas;
    campoFecha.append(etiquetaFecha, selectorFecha);
    controles.append(campoPeriodo, campoFecha);
    const panel = document.createElement("div");
    panel.id = "panelResumenTareas";
    panel.className = "panel-resumen-tareas";
    panel.setAttribute("aria-live", "polite");
    seccion.append(titulo, descripcion, controles, panel);
}

function mostrarResumenTareas() {
    prepararInterfazResumenTareas();
    const panel = document.getElementById("panelResumenTareas");
    const selectorPeriodo = document.getElementById("periodoResumenTareas");
    const selectorFecha = document.getElementById("fechaReferenciaTareas");
    if (!panel || !selectorPeriodo || !selectorFecha) return;
    if (!selectorFecha.value) selectorFecha.value = diaSeleccionado || fechaClaveCalendario(new Date());
    panel.replaceChildren();

    const periodo = selectorPeriodo.value;
    const rango = obtenerRangoResumenFinanzas(periodo, selectorFecha.value);
    const ocurrencias = [];
    const gruposTarea = new Map();
    for (let desplazamiento = 0; desplazamiento < rango.cantidadDias; desplazamiento++) {
        const fecha = claveDiaCalendario(new Date(rango.inicio.getFullYear(), rango.inicio.getMonth(), rango.inicio.getDate() + desplazamiento));
        tareas.forEach((tarea, indice) => {
            if (!tarea.fecha || !tareaOcurreEnFecha(tarea, fecha)) return;
            const completada = tareaCompletadaEnFecha(tarea, fecha);
            const prioridad = ["alta", "media", "baja"].includes(tarea.prioridad) ? tarea.prioridad : "ninguna";
            const ocurrencia = { tarea, indice, fecha, completada, prioridad };
            ocurrencias.push(ocurrencia);
            if (!gruposTarea.has(indice)) gruposTarea.set(indice, { tarea, prioridad, total: 0, completadas: 0, fechas: [] });
            const grupo = gruposTarea.get(indice);
            grupo.total++;
            if (completada) grupo.completadas++;
            grupo.fechas.push({ fecha, completada });
        });
    }

    const completadas = ocurrencias.filter(item => item.completada).length;
    const pendientes = ocurrencias.length - completadas;
    const altaPendiente = ocurrencias.filter(item => item.prioridad === "alta" && !item.completada).length;
    const cumplimiento = ocurrencias.length ? Math.round(completadas / ocurrencias.length * 100) : 0;
    const nombrePeriodo = { dia: "del día", semana: "de la semana", mes: "del mes", anio: "del año" }[periodo];
    const tarjetas = document.createElement("div");
    tarjetas.className = "tarjetas-resumen-finanzas";
    [
        [String(ocurrencias.length), "Ocurrencias " + nombrePeriodo],
        [String(completadas), "Completadas"],
        [String(pendientes), "Pendientes"],
        [cumplimiento + "%", "Cumplimiento"],
        [String(altaPendiente), "Pendientes de prioridad alta"]
    ].forEach(([valor, etiqueta]) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-metrica-finanzas";
        const numero = document.createElement("strong");
        numero.textContent = valor;
        const texto = document.createElement("span");
        texto.textContent = etiqueta;
        tarjeta.append(numero, texto);
        tarjetas.appendChild(tarjeta);
    });
    panel.appendChild(tarjetas);

    const porPrioridad = document.createElement("section");
    porPrioridad.className = "resumen-prioridades-tareas";
    const tituloPrioridad = document.createElement("h3");
    tituloPrioridad.textContent = "Desglose por prioridad";
    porPrioridad.appendChild(tituloPrioridad);
    [["alta", "🔴 Alta"], ["media", "🟡 Media"], ["baja", "🟢 Baja"], ["ninguna", "⚪ Sin prioridad"]].forEach(([prioridad, nombre]) => {
        const grupo = ocurrencias.filter(item => item.prioridad === prioridad);
        const realizadas = grupo.filter(item => item.completada).length;
        const fila = document.createElement("p");
        fila.textContent = nombre + " · " + grupo.length + " programadas · " + realizadas + " completadas · " + (grupo.length - realizadas) + " pendientes";
        porPrioridad.appendChild(fila);
    });
    panel.appendChild(porPrioridad);

    const grafica = document.createElement("section");
    grafica.className = "grafica-tendencia-finanzas";
    const tituloGrafica = document.createElement("h3");
    tituloGrafica.textContent = periodo === "anio" ? "Tareas por mes" : periodo === "dia" ? "Tareas del día" : "Tareas por día";
    grafica.appendChild(tituloGrafica);
    if (!ocurrencias.length) {
        const vacio = document.createElement("p");
        vacio.textContent = "No hay tareas con fecha en este periodo.";
        grafica.appendChild(vacio);
    } else {
        const serie = [];
        if (periodo === "anio") {
            for (let mes = 0; mes < 12; mes++) {
                const desde = claveDiaCalendario(new Date(rango.inicio.getFullYear(), mes, 1));
                const hasta = claveDiaCalendario(new Date(rango.inicio.getFullYear(), mes + 1, 0));
                const items = ocurrencias.filter(item => item.fecha >= desde && item.fecha <= hasta);
                serie.push({ etiqueta: new Date(rango.inicio.getFullYear(), mes, 1).toLocaleDateString("es-MX", { month: "short" }), total: items.length, completadas: items.filter(item => item.completada).length });
            }
        } else {
            for (let dia = 0; dia < rango.cantidadDias; dia++) {
                const fecha = claveDiaCalendario(new Date(rango.inicio.getFullYear(), rango.inicio.getMonth(), rango.inicio.getDate() + dia));
                const items = ocurrencias.filter(item => item.fecha === fecha);
                serie.push({ etiqueta: periodo === "dia" ? "Hoy" : periodo === "semana" ? new Date(fecha + "T00:00:00").toLocaleDateString("es-MX", { weekday: "short" }) : String(Number(fecha.slice(-2))), total: items.length, completadas: items.filter(item => item.completada).length });
            }
        }
        const barras = document.createElement("div");
        barras.className = "grafica-barras-finanzas";
        const maximo = Math.max(...serie.map(item => item.total), 1);
        serie.forEach(item => {
            const columna = document.createElement("div");
            columna.className = "columna-grafica-finanzas";
            columna.title = item.etiqueta + ": " + item.total + " programadas, " + item.completadas + " completadas";
            const barra = document.createElement("span");
            barra.className = "barra-periodo-finanzas";
            barra.style.height = Math.max(3, item.total / maximo * 100) + "%";
            barra.setAttribute("aria-label", item.total + " tareas, " + item.completadas + " completadas");
            const valor = document.createElement("small");
            valor.className = "valor-periodo-finanzas";
            valor.textContent = String(item.total);
            const etiqueta = document.createElement("small");
            etiqueta.className = "etiqueta-periodo-finanzas";
            etiqueta.textContent = item.etiqueta;
            columna.append(barra, valor, etiqueta);
            barras.appendChild(columna);
        });
        grafica.appendChild(barras);
    }
    panel.appendChild(grafica);

    const lista = document.createElement("section");
    lista.className = "lista-resumen-tareas";
    const tituloLista = document.createElement("h3");
    tituloLista.textContent = "Tareas del periodo";
    lista.appendChild(tituloLista);
    if (!gruposTarea.size) {
        const vacio = document.createElement("p");
        vacio.className = "estado-vacio-modulo";
        vacio.textContent = "Aún no hay tareas con fecha para este periodo.";
        lista.appendChild(vacio);
    } else {
        gruposTarea.forEach(grupo => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-resumen-tarea";
            const nombre = document.createElement("h4");
            nombre.textContent = (grupo.tarea.prioridad === "alta" ? "🔴 " : grupo.tarea.prioridad === "media" ? "🟡 " : grupo.tarea.prioridad === "baja" ? "🟢 " : "⚪ ") + (grupo.tarea.texto || "Tarea sin título");
            const detalle = document.createElement("p");
            detalle.textContent = grupo.total + (grupo.total === 1 ? " ocurrencia" : " ocurrencias") + " · " + grupo.completadas + " completadas · " + (grupo.total - grupo.completadas) + " pendientes";
            tarjeta.append(nombre, detalle);
            if (grupo.fechas.length > 1) {
                const fechas = document.createElement("small");
                const muestra = grupo.fechas.slice(0, 6).map(item => formatoFechaCorta(item.fecha) + (item.completada ? " ✓" : " · pendiente"));
                if (grupo.fechas.length > muestra.length) muestra.push("y " + (grupo.fechas.length - muestra.length) + " más");
                fechas.textContent = "Ocurrencias: " + muestra.join(" · ");
                tarjeta.appendChild(fechas);
            }
            lista.appendChild(tarjeta);
        });
    }
    panel.appendChild(lista);
}

function mostrarResumenTiempo() {
    const panel = document.getElementById("panelResumenTiempo");
    const selectorPeriodo = document.getElementById("periodoResumenTiempo");
    const selectorFecha = document.getElementById("fechaReferenciaTiempo");
    if (!panel || !selectorPeriodo || !selectorFecha) return;
    if (!selectorFecha.value) selectorFecha.value = diaSeleccionado || fechaClaveCalendario(new Date());
    panel.replaceChildren();

    const periodo = selectorPeriodo.value;
    const rango = obtenerRangoResumenFinanzas(periodo, selectorFecha.value);
    const registros = registrosTiempo.filter(registro => registro.fecha >= rango.desde && registro.fecha <= rango.hasta);
    const minutosTotales = registros.reduce((suma, registro) => suma + (Number(registro.minutos) || 0), 0);
    const registrosConDuracion = registros.filter(registro => Number(registro.minutos) > 0).length;
    const grupos = new Map();
    registros.forEach(registro => {
        const actividad = (registro.texto || "Actividad sin nombre").trim() || "Actividad sin nombre";
        const clave = actividad.toLocaleLowerCase("es-MX");
        if (!grupos.has(clave)) grupos.set(clave, { nombre: actividad, cantidad: 0, minutos: 0 });
        const grupo = grupos.get(clave);
        grupo.cantidad++;
        grupo.minutos += Number(registro.minutos) || 0;
    });
    const actividades = [...grupos.values()].sort((a, b) => b.cantidad - a.cantidad || b.minutos - a.minutos);
    const nombrePeriodo = { dia: "del día", semana: "de la semana", mes: "del mes", anio: "del año" }[periodo];
    const masFrecuente = actividades[0];

    const tarjetas = document.createElement("div");
    tarjetas.className = "tarjetas-resumen-finanzas";
    [
        [String(registros.length), registros.length === 1 ? "Actividad registrada " + nombrePeriodo : "Actividades registradas " + nombrePeriodo],
        [minutosTotales + " min", "Tiempo aproximado anotado"],
        [String(registrosConDuracion), "Actividades con duración anotada"],
        [masFrecuente ? masFrecuente.nombre : "Sin datos", "Actividad más repetida"]
    ].forEach(([valor, etiqueta]) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-metrica-finanzas";
        const numero = document.createElement("strong");
        numero.textContent = valor;
        const texto = document.createElement("span");
        texto.textContent = etiqueta;
        tarjeta.append(numero, texto);
        tarjetas.appendChild(tarjeta);
    });
    panel.appendChild(tarjetas);

    const grafica = document.createElement("section");
    grafica.className = "grafica-actividades-tiempo";
    const titulo = document.createElement("h3");
    titulo.textContent = "Actividades que más se repiten";
    grafica.appendChild(titulo);
    if (!actividades.length) {
        const vacio = document.createElement("p");
        vacio.textContent = "Aún no hay actividades registradas en este periodo.";
        grafica.appendChild(vacio);
    } else {
        const maximo = Math.max(...actividades.map(item => item.cantidad), 1);
        actividades.slice(0, 10).forEach(actividad => {
            const fila = document.createElement("div");
            fila.className = "fila-actividad-tiempo";
            const nombre = document.createElement("strong");
            nombre.textContent = actividad.nombre;
            const fondo = document.createElement("div");
            fondo.className = "barra-fondo-actividad-tiempo";
            const barra = document.createElement("span");
            barra.style.width = (actividad.cantidad / maximo * 100) + "%";
            barra.setAttribute("aria-label", actividad.cantidad + (actividad.cantidad === 1 ? " registro" : " registros"));
            fondo.appendChild(barra);
            const detalle = document.createElement("span");
            detalle.className = "detalle-actividad-tiempo";
            detalle.textContent = actividad.cantidad + (actividad.cantidad === 1 ? " registro" : " registros") + (actividad.minutos > 0 ? " · " + actividad.minutos + " min aprox." : " · sin duración anotada");
            fila.append(nombre, fondo, detalle);
            grafica.appendChild(fila);
        });
        if (actividades.length > 10) {
            const nota = document.createElement("p");
            nota.className = "nota-grafica-tiempo";
            nota.textContent = "Se muestran las 10 actividades más repetidas de " + actividades.length + ".";
            grafica.appendChild(nota);
        }
    }
    panel.appendChild(grafica);
}
function mostrarResumenAprendizajes() {
    const panel = document.getElementById("panelResumenAprendizajes");
    const selectorPeriodo = document.getElementById("periodoResumenAprendizajes");
    const selectorFecha = document.getElementById("fechaReferenciaAprendizajes");
    if (!panel || !selectorPeriodo || !selectorFecha) return;
    if (!selectorFecha.value) selectorFecha.value = diaSeleccionado || fechaClaveCalendario(new Date());
    panel.replaceChildren();

    const periodo = selectorPeriodo.value;
    const rango = obtenerRangoResumenFinanzas(periodo, selectorFecha.value);
    const registros = aprendizajes
        .map((item, indice) => ({ item, indice }))
        .filter(({ item }) => item.fecha >= rango.desde && item.fecha <= rango.hasta)
        .sort((a, b) => b.item.fecha.localeCompare(a.item.fecha) || b.indice - a.indice);
    const diasConAprendizaje = new Set(registros.map(({ item }) => item.fecha)).size;
    const nombrePeriodo = { dia: "del día", semana: "de la semana", mes: "del mes", anio: "del año" }[periodo];

    const tarjetas = document.createElement("div");
    tarjetas.className = "tarjetas-resumen-finanzas";
    [
        [String(registros.length), registros.length === 1 ? "Aprendizaje registrado " + nombrePeriodo : "Aprendizajes registrados " + nombrePeriodo],
        [String(diasConAprendizaje), diasConAprendizaje === 1 ? "Día con aprendizaje" : "Días con aprendizajes"]
    ].forEach(([valor, etiqueta]) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-metrica-finanzas";
        const numero = document.createElement("strong");
        numero.textContent = valor;
        const texto = document.createElement("span");
        texto.textContent = etiqueta;
        tarjeta.append(numero, texto);
        tarjetas.appendChild(tarjeta);
    });
    panel.appendChild(tarjetas);

    const titulo = document.createElement("h3");
    titulo.className = "titulo-lista-aprendizajes-resumen";
    titulo.textContent = "Tus anotaciones del periodo";
    panel.appendChild(titulo);
    const lista = document.createElement("div");
    lista.className = "lista-aprendizajes-resumen";
    if (!registros.length) {
        const vacio = document.createElement("p");
        vacio.className = "estado-vacio-aprendizajes";
        vacio.textContent = "Aún no hay aprendizajes registrados en este periodo.";
        lista.appendChild(vacio);
    } else {
        registros.forEach(({ item }) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-aprendizaje";
            const fecha = document.createElement("h3");
            fecha.textContent = new Date(item.fecha + "T00:00:00").toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
            const texto = document.createElement("p");
            texto.textContent = item.texto;
            tarjeta.append(fecha, texto);
            lista.appendChild(tarjeta);
        });
    }
    panel.appendChild(lista);
}
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

function guardarPagosEnDispositivo(){localStorage.setItem("pagosPendientes",JSON.stringify(pagosLocalesEnDispositivo));if(typeof actualizarAvisosDelDia==="function")actualizarAvisosDelDia();}
function formatoMonedaPago(monto){return new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(Number(monto)||0);}
function pagoOcurreEnFecha(pago,fecha){return tareaOcurreEnFecha({fecha:pago?.fecha,repeticion:pago?.repeticion||"ninguna",repeticionHasta:pago?.repeticionHasta||""},fecha);}
function pagoPagadoEnFecha(pago,fecha){if(!pago)return false;if(!pago.repeticion||pago.repeticion==="ninguna")return Boolean(pago.pagado);return Array.isArray(pago.fechasPagadas)&&pago.fechasPagadas.includes(fecha)||fecha===pago.fecha&&Boolean(pago.pagado);}
function actualizarCampoFinRepeticionPago(){const repetir=document.getElementById("repeticionPago"),grupo=document.getElementById("grupoFinRepeticionPago"),hasta=document.getElementById("repeticionHastaPago"),fecha=document.getElementById("fechaPago");if(!repetir||!grupo||!hasta)return;const activa=repetir.value!=="ninguna";grupo.hidden=!activa;hasta.required=activa;if(fecha?.value)hasta.min=fecha.value;if(!activa)hasta.value="";}
function seleccionarFechaPago(fecha){if(!fecha)return;diaSeleccionado=fecha;mesContextual=new Date(fecha+"T00:00:00");mesContextual=new Date(mesContextual.getFullYear(),mesContextual.getMonth(),1);actualizarCampoFinRepeticionPago();mostrarListaPagos();}
function mostrarListaPagos(){const lista=document.getElementById("listaPagos");if(!lista)return;lista.replaceChildren();if(!pagosPendientes.length){const p=document.createElement("p");p.textContent="Aún no has registrado pagos.";lista.appendChild(p);actualizarCalendarioContextual();return;}pagosPendientes.map((pago,indice)=>({pago,indice})).sort((a,b)=>(a.pago.fecha||"").localeCompare(b.pago.fecha||"")).forEach(({pago,indice})=>{const tarjeta=document.createElement("article");tarjeta.className="tarjeta-pago";const titulo=document.createElement("h3");titulo.textContent=pago.nombre;const recurrente=Boolean(pago.repeticion&&pago.repeticion!=="ninguna");const ocurreHoy=pagoOcurreEnFecha(pago,diaSeleccionado);const pagado=pagoPagadoEnFecha(pago,recurrente?diaSeleccionado:pago.fecha);const detalle=document.createElement("p");detalle.textContent=(recurrente?(ocurreHoy?(pagado?"✅ Pagado":"⏳ Pendiente")+" el "+diaSeleccionado:"No vence el "+diaSeleccionado)+" · Inicio: "+(pago.fecha||"Sin fecha")+(pago.repeticionHasta?" · Se repetirá hasta "+formatearFechaPago(pago.repeticionHasta):""): (pagado?"✅ Pagado":"⏳ Pendiente")+" · Vence: "+(pago.fecha||"Sin fecha"))+" · "+formatoMonedaPago(pago.monto);const privacidad=document.createElement("small");privacidad.className="privacidad-pago";privacidad.textContent=!pago.ownerUid?"Solo en este dispositivo":pago.sharedWithUids?.length?"Compartido con la cuenta vinculada":"Privado en tu cuenta";const acciones=document.createElement("div");acciones.className="acciones-pago-tarjeta";const estado=document.createElement("button");estado.type="button";estado.textContent=pagado?"Marcar pendiente":"Marcar pagado";estado.disabled=recurrente&&!ocurreHoy;estado.title=estado.disabled?"Selecciona en el calendario una fecha en la que vence este pago.":"";estado.onclick=function(){cambiarEstadoPago(indice);};const editar=document.createElement("button");editar.type="button";editar.textContent="Editar";editar.onclick=function(){editarPago(indice);};const borrar=document.createElement("button");borrar.type="button";borrar.textContent="Eliminar";borrar.disabled=Boolean(pago.ownerUid&&pago.ownerUid!==pagosUsuarioUid);if(borrar.disabled)borrar.title="Solo quien creó el pago puede eliminarlo.";borrar.onclick=function(){eliminarPago(indice);};acciones.append(estado,editar,borrar);tarjeta.append(titulo,detalle);if(recurrente){const frecuencia=document.createElement("small");frecuencia.className="privacidad-pago";frecuencia.textContent="🔁 "+etiquetaRepeticionPago(pago.repeticion);tarjeta.appendChild(frecuencia);}tarjeta.append(privacidad,acciones);lista.appendChild(tarjeta);});actualizarCalendarioContextual();}
function etiquetaRepeticionPago(valor){return ({diaria:"Cada día",semanal:"Cada semana",quincenal:"Cada 2 semanas",mensual:"Cada mes",anual:"Cada año"})[valor]||"No repetir";}
function formatearFechaPago(fecha){const d=new Date(fecha+"T00:00:00");return Number.isNaN(d.getTime())?fecha:d.toLocaleDateString("es-MX",{day:"numeric",month:"short",year:"numeric"}).replace(" de ","-");}
async function guardarPago(){const nombre=document.getElementById("nombrePago"),fecha=document.getElementById("fechaPago"),monto=document.getElementById("montoPago"),pagado=document.getElementById("pagoRealizado"),repeticion=document.getElementById("repeticionPago"),hasta=document.getElementById("repeticionHastaPago"),concepto=nombre.value.trim(),importe=Number(monto.value),frecuencia=repeticion?.value||"ninguna";if(!concepto){alert("Escribe el concepto del pago.");nombre.focus();return;}if(!fecha.value){alert("Selecciona la fecha de vencimiento.");fecha.focus();return;}if(frecuencia!=="ninguna"&&(!hasta?.value||hasta.value<fecha.value)){alert("Selecciona una fecha final igual o posterior al primer vencimiento.");hasta?.focus();return;}if(!Number.isFinite(importe)||importe<=0){alert("Escribe un monto mayor que cero.");monto.focus();return;}const anterior=pagoEditando===null?null:pagosPendientes[pagoEditando];if(pagoEditando!==null&&!anterior)return;const pago={...(anterior||{}),id:anterior?.id||"pago-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),nombre:concepto,fecha:fecha.value,monto:importe,pagado:pagado.checked,repeticion:frecuencia,repeticionHasta:frecuencia==="ninguna"?"":hasta.value,fechasPagadas:anterior?.fechasPagadas||[]};const compartir=document.getElementById("compartirPago")?.checked||false;try{if(pagosUsuarioUid&&(anterior?.ownerUid||pagoEditando===null||(!anterior?.ownerUid&&compartir))){if(!window.miappPagosCloud)throw new Error("La sincronización todavía se está iniciando. Inténtalo de nuevo en unos segundos.");const guardado=await window.miappPagosCloud.guardar(pago,compartir);Object.assign(pago,guardado);pagosNube=pagosNube.filter(item=>item.id!==pago.id).concat(pago);if(!anterior?.ownerUid)pagosLocalesEnDispositivo=pagosLocalesEnDispositivo.filter(item=>item.id!==anterior?.id);}else if(anterior?.ownerUid){throw new Error("Inicia sesión otra vez para guardar este pago de la cuenta.");}else{pagosLocalesEnDispositivo=pagosLocalesEnDispositivo.filter(item=>item.id!==pago.id).concat(pago);}pagoEditando=null;guardarPagosEnDispositivo();cancelarEdicionPago();reconstruirPagos();}catch(error){alert("No se pudo guardar el pago: "+(error.message||"revisa tu conexión."));}}
function editarPago(indice){const pago=pagosPendientes[indice];if(!pago)return;pagoEditando=indice;document.getElementById("nombrePago").value=pago.nombre||"";document.getElementById("fechaPago").value=pago.fecha||"";document.getElementById("montoPago").value=Number(pago.monto)||"";document.getElementById("pagoRealizado").checked=Boolean(pago.pagado);document.getElementById("repeticionPago").value=pago.repeticion||"ninguna";document.getElementById("repeticionHastaPago").value=pago.repeticionHasta||"";actualizarCampoFinRepeticionPago();document.getElementById("botonGuardarPago").textContent="Guardar cambios";document.getElementById("botonCancelarPago").hidden=false;actualizarControlCompartirPago();document.getElementById("nombrePago").focus();}
function cancelarEdicionPago(){pagoEditando=null;const nombre=document.getElementById("nombrePago");if(!nombre)return;nombre.value="";document.getElementById("fechaPago").value=fechaClaveCalendario(new Date());document.getElementById("montoPago").value="";document.getElementById("pagoRealizado").checked=false;document.getElementById("repeticionPago").value="ninguna";document.getElementById("repeticionHastaPago").value="";actualizarCampoFinRepeticionPago();document.getElementById("botonGuardarPago").textContent="Agregar pago";document.getElementById("botonCancelarPago").hidden=true;actualizarControlCompartirPago();}
async function cambiarEstadoPago(indice){const anterior=pagosPendientes[indice];if(!anterior)return;const recurrente=Boolean(anterior.repeticion&&anterior.repeticion!=="ninguna"),fecha= recurrente?diaSeleccionado:anterior.fecha;if(!pagoOcurreEnFecha(anterior,fecha))return;const nuevoEstado=!pagoPagadoEnFecha(anterior,fecha);let actualizado;if(recurrente){const fechas=new Set(Array.isArray(anterior.fechasPagadas)?anterior.fechasPagadas:[]);if(fecha===anterior.fecha&&anterior.pagado!==nuevoEstado){actualizado={...anterior,pagado:nuevoEstado};}else{if(nuevoEstado)fechas.add(fecha);else fechas.delete(fecha);actualizado={...anterior,fechasPagadas:[...fechas]};}}else actualizado={...anterior,pagado:nuevoEstado};try{if(anterior.ownerUid){if(!window.miappPagosCloud)throw new Error("La sincronización todavía se está iniciando.");if(recurrente&&!(fecha===anterior.fecha&&anterior.pagado!==nuevoEstado)){await window.miappPagosCloud.marcar(anterior,fecha,nuevoEstado);actualizado={...actualizado};}else{const guardado=await window.miappPagosCloud.guardar(actualizado,Boolean(anterior.sharedWithUids?.length));Object.assign(actualizado,guardado);}pagosNube=pagosNube.map(item=>item.id===anterior.id?actualizado:item);}else pagosLocalesEnDispositivo=pagosLocalesEnDispositivo.map(item=>item.id===anterior.id?actualizado:item);guardarPagosEnDispositivo();reconstruirPagos();}catch(error){alert("No se pudo actualizar el pago: "+(error.message||"revisa tu conexión."));}}
async function eliminarPago(indice){const pago=pagosPendientes[indice];if(!pago)return;if(pago.ownerUid&&pago.ownerUid!==pagosUsuarioUid){alert("Solo quien creó este pago puede eliminarlo.");return;}if(!confirm("¿Quieres eliminar este pago?"))return;try{if(pago.ownerUid){if(!window.miappPagosCloud)throw new Error("La sincronización todavía se está iniciando.");await window.miappPagosCloud.eliminar(pago);pagosNube=pagosNube.filter(item=>item.id!==pago.id);}else pagosLocalesEnDispositivo=pagosLocalesEnDispositivo.filter(item=>item.id!==pago.id);guardarPagosEnDispositivo();reconstruirPagos();}catch(error){alert("No se pudo eliminar el pago: "+(error.message||"revisa tu conexión."));}}
function mostrarResumenPagos(){const area=document.getElementById("resumenPagos");if(!area)return;area.replaceChildren();const pendientes=pagosPendientes.filter(p=>!p.pagado),pagados=pagosPendientes.filter(p=>p.pagado),totalPendiente=pendientes.reduce((s,p)=>s+(Number(p.monto)||0),0),totalPagado=pagados.reduce((s,p)=>s+(Number(p.monto)||0),0),totalRegistrado=totalPendiente+totalPagado;const tarjetas=document.createElement("div");tarjetas.className="tarjetas-resumen-pagos";[[String(pendientes.length),"Pagos pendientes"],[formatoMonedaPago(totalPendiente),"Monto pendiente"],[String(pagados.length),"Pagos realizados"],[formatoMonedaPago(totalPagado),"Monto pagado"],[formatoMonedaPago(totalRegistrado),"Total registrado"]].forEach(([valor,etiqueta])=>{const tarjeta=document.createElement("article");tarjeta.className="tarjeta-metrica-pago";const fuerte=document.createElement("strong");fuerte.textContent=valor;const texto=document.createElement("span");texto.textContent=etiqueta;tarjeta.append(fuerte,texto);tarjetas.appendChild(tarjeta);});area.appendChild(tarjetas);[[pendientes,"Pendientes","No hay pagos pendientes."],[pagados,"Realizados","Aún no has marcado pagos como realizados."]].forEach(([items,titulo,vacio])=>{const grupo=document.createElement("section");grupo.className="grupo-resumen-pagos";const h=document.createElement("h3");h.textContent=titulo+" ("+items.length+")";grupo.appendChild(h);if(!items.length){const p=document.createElement("p");p.textContent=vacio;grupo.appendChild(p);}else{const lista=document.createElement("ul");items.slice().sort((a,b)=>(a.fecha||"").localeCompare(b.fecha||"")).forEach(pago=>{const li=document.createElement("li");li.textContent=(pago.nombre||"Pago")+" · "+(pago.fecha||"Sin fecha")+" · "+formatoMonedaPago(pago.monto);lista.appendChild(li);});grupo.appendChild(lista);}area.appendChild(grupo);});}
if(document.getElementById("fechaPago"))document.getElementById("fechaPago").value=fechaClaveCalendario(new Date());
mostrarListaPagos();mostrarResumenPagos();



// 12H.23.5.9.22 — Salud e Izel: registros locales con calendario y resúmenes.
function seleccionarFechaSalud(fecha) { if (!fecha) return; diaSeleccionado = fecha; mesContextual = new Date(fecha + "T00:00:00"); mesContextual = new Date(mesContextual.getFullYear(), mesContextual.getMonth(), 1); mostrarListaSalud(); }
function abrirNuevoRegistroSalud() {
    saludEditando = null;
    ["pesoSalud", "presionSistolicaSalud", "presionDiastolicaSalud", "glucosaSalud", "doctorSalud", "notaSalud", "proximaFechaSalud"].forEach(id => { document.getElementById(id).value = ""; });
    document.getElementById("fechaRegistroSalud").value = diaSeleccionado;
    document.getElementById("tituloModalSalud").textContent = "＋ Nuevo chequeo";
    document.getElementById("botonGuardarSalud").textContent = "Guardar chequeo";
    document.getElementById("modalSalud").style.display = "flex";
}
function editarRegistroSalud(indice) {
    const item = saludRegistros[indice]; if (!item) return; saludEditando = indice;
    document.getElementById("fechaRegistroSalud").value = item.fecha || "";
    document.getElementById("pesoSalud").value = item.peso ?? "";
    document.getElementById("presionSistolicaSalud").value = item.sistolica ?? "";
    document.getElementById("presionDiastolicaSalud").value = item.diastolica ?? "";
    document.getElementById("glucosaSalud").value = item.glucosa ?? "";
    document.getElementById("doctorSalud").value = item.doctor || "";
    document.getElementById("notaSalud").value = item.nota || "";
    document.getElementById("proximaFechaSalud").value = item.proximaFecha || "";
    document.getElementById("tituloModalSalud").textContent = "✏️ Editar chequeo";
    document.getElementById("botonGuardarSalud").textContent = "Guardar cambios";
    document.getElementById("modalSalud").style.display = "flex";
}
function cerrarModalSalud() { document.getElementById("modalSalud").style.display = "none"; saludEditando = null; }
function guardarRegistroSalud() {
    const fecha = document.getElementById("fechaRegistroSalud").value;
    const pesoRaw = document.getElementById("pesoSalud").value.trim();
    const sistRaw = document.getElementById("presionSistolicaSalud").value.trim();
    const diasRaw = document.getElementById("presionDiastolicaSalud").value.trim();
    const glucosaRaw = document.getElementById("glucosaSalud").value.trim();
    const doctor = document.getElementById("doctorSalud").value.trim();
    const nota = document.getElementById("notaSalud").value.trim();
    const proximaFecha = document.getElementById("proximaFechaSalud").value;
    if (!fecha) { alert("Selecciona la fecha del chequeo."); return; }
    if (Boolean(sistRaw) !== Boolean(diasRaw)) { alert("Para presión arterial, captura ambos valores: sistólica y diastólica."); return; }
    if (proximaFecha && proximaFecha < fecha) { alert("La próxima revisión debe ser en la fecha del chequeo o después."); return; }
    if (![pesoRaw, sistRaw, glucosaRaw, doctor, nota, proximaFecha].some(Boolean)) { alert("Agrega al menos una medición, una nota o la fecha de próxima revisión."); return; }
    const item = { id: saludEditando === null ? "salud-" + Date.now() : saludRegistros[saludEditando].id || "salud-" + Date.now(), fecha, peso: pesoRaw ? Number(pesoRaw) : null, sistolica: sistRaw ? Number(sistRaw) : null, diastolica: diasRaw ? Number(diasRaw) : null, glucosa: glucosaRaw ? Number(glucosaRaw) : null, doctor, nota, proximaFecha };
    if (saludEditando === null) saludRegistros.push(item); else saludRegistros[saludEditando] = item;
    localStorage.setItem("saludRegistros", JSON.stringify(saludRegistros)); diaSeleccionado = fecha; mesContextual = new Date(new Date(fecha + "T00:00:00").getFullYear(), new Date(fecha + "T00:00:00").getMonth(), 1);
    cerrarModalSalud(); mostrarListaSalud(); mostrarResumenSalud();
}
function eliminarRegistroSalud(indice) { if (!saludRegistros[indice] || !confirm("¿Quieres eliminar este registro de Salud?")) return; saludRegistros.splice(indice, 1); localStorage.setItem("saludRegistros", JSON.stringify(saludRegistros)); mostrarListaSalud(); mostrarResumenSalud(); }
function mostrarListaSalud() {
    const lista = document.getElementById("listaSalud"); if (!lista) return; const campoFecha = document.getElementById("fechaSalud"); if (campoFecha) campoFecha.value = diaSeleccionado; lista.replaceChildren();
    const registros = saludRegistros.map((item, indice) => ({ item, indice })).filter(({ item }) => item.fecha === diaSeleccionado);
    const revisiones = saludRegistros.map((item, indice) => ({ item, indice })).filter(({ item }) => item.proximaFecha === diaSeleccionado);
    if (!registros.length && !revisiones.length) { const p = document.createElement("p"); p.className = "estado-vacio-modulo"; p.textContent = "No hay chequeos ni revisiones programadas para este día."; lista.appendChild(p); }
    registros.forEach(({item, indice}) => {
        const card = document.createElement("article"); card.className = "tarjeta-registro-modulo"; const h = document.createElement("h3"); h.textContent = "🩺 Chequeo de salud"; card.appendChild(h); const valores = [];
        if (item.peso != null) valores.push("Peso: " + item.peso + " kg"); if (item.sistolica != null && item.diastolica != null) valores.push("Presión: " + item.sistolica + "/" + item.diastolica + " mmHg"); if (item.glucosa != null) valores.push("Glucosa: " + item.glucosa + " mg/dL");
        if (valores.length) { const p = document.createElement("p"); p.textContent = valores.join(" · "); card.appendChild(p); } if (item.doctor) { const p = document.createElement("p"); p.textContent = "Doctor o lugar: " + item.doctor; card.appendChild(p); } if (item.nota) { const p = document.createElement("p"); p.textContent = item.nota; card.appendChild(p); }
        if (item.proximaFecha) { const p = document.createElement("p"); p.className = "detalle-proxima-revision"; p.textContent = "Próxima revisión indicada: " + new Date(item.proximaFecha + "T00:00:00").toLocaleDateString("es-MX", {dateStyle:"long"}); card.appendChild(p); }
        const acciones = document.createElement("div"); acciones.className = "acciones-registro-modulo"; const ed = document.createElement("button"); ed.type = "button"; ed.textContent = "Editar"; ed.onclick = () => editarRegistroSalud(indice); const del = document.createElement("button"); del.type = "button"; del.textContent = "Eliminar"; del.onclick = () => eliminarRegistroSalud(indice); acciones.append(ed,del); card.appendChild(acciones); lista.appendChild(card);
    });
    revisiones.forEach(({indice}) => { const card=document.createElement("article"); card.className="tarjeta-registro-modulo"; const h=document.createElement("h3"); h.textContent="📅 Próxima revisión médica indicada"; card.appendChild(h); const p=document.createElement("p"); p.textContent="Agendada para hoy, de acuerdo con la fecha anotada."; card.appendChild(p); const actions=document.createElement("div"); actions.className="acciones-registro-modulo"; const edit=document.createElement("button"); edit.type="button"; edit.textContent="Editar chequeo"; edit.onclick=()=>editarRegistroSalud(indice); actions.appendChild(edit); card.appendChild(actions); lista.appendChild(card); });
    actualizarCalendarioContextual();
    if (typeof actualizarAvisosDelDia === "function") actualizarAvisosDelDia();
}function mostrarResumenSalud() {
    const panel = document.getElementById("panelResumenSalud"), periodoEl = document.getElementById("periodoResumenSalud"), fechaEl = document.getElementById("fechaReferenciaSalud"); if (!panel || !periodoEl || !fechaEl) return; if (!fechaEl.value) fechaEl.value = fechaClaveCalendario(new Date()); panel.replaceChildren();
    const rango = obtenerRangoResumenFinanzas(periodoEl.value, fechaEl.value); const items = saludRegistros.filter(x => x.fecha >= rango.desde && x.fecha <= rango.hasta).sort((a,b) => b.fecha.localeCompare(a.fecha));
    const ultima = key => items.find(x => x[key] != null); const peso = ultima("peso"), sist = items.find(x => x.sistolica != null && x.diastolica != null), glucosa = ultima("glucosa"); const cards = document.createElement("div"); cards.className = "tarjetas-resumen-finanzas";
    [[String(items.length),"Chequeos registrados"],[peso ? peso.peso + " kg" : "Sin dato","Último peso del periodo"],[sist ? sist.sistolica + "/" + sist.diastolica + " mmHg" : "Sin dato","Última presión del periodo"],[glucosa ? glucosa.glucosa + " mg/dL" : "Sin dato","Última glucosa del periodo"]].forEach(([v,l])=>{const c=document.createElement("article");c.className="tarjeta-metrica-finanzas";const strong=document.createElement("strong");strong.textContent=v;const span=document.createElement("span");span.textContent=l;c.append(strong,span);cards.appendChild(c);}); panel.appendChild(cards);
    const h=document.createElement("h3");h.className="titulo-lista-aprendizajes-resumen";h.textContent="Registros del periodo";panel.appendChild(h);const list=document.createElement("div");list.className="lista-registros-resumen";
    if(!items.length){const p=document.createElement("p");p.className="estado-vacio-modulo";p.textContent="Aún no hay registros de Salud en este periodo.";list.appendChild(p);} else items.forEach(item=>{const c=document.createElement("article");c.className="tarjeta-registro-modulo";const h=document.createElement("h4");h.textContent=new Date(item.fecha+"T00:00:00").toLocaleDateString("es-MX",{dateStyle:"long"});c.appendChild(h);const d=[];if(item.peso!=null)d.push("Peso: "+item.peso+" kg");if(item.sistolica!=null&&item.diastolica!=null)d.push("Presión: "+item.sistolica+"/"+item.diastolica+" mmHg");if(item.glucosa!=null)d.push("Glucosa: "+item.glucosa+" mg/dL");if(d.length){const p=document.createElement("p");p.textContent=d.join(" · ");c.appendChild(p);}if(item.nota){const p=document.createElement("p");p.textContent=item.nota;c.appendChild(p);}list.appendChild(c);});panel.appendChild(list);
}

function seleccionarFechaIzel(fecha) { if (!fecha) return; diaSeleccionado=fecha; const d=new Date(fecha+"T00:00:00"); mesContextual=new Date(d.getFullYear(),d.getMonth(),1); mostrarListaIzel(); }
function abrirNuevoRegistroIzel() { izelEditando=null; document.getElementById("tipoRegistroIzel").value="vacuna"; document.getElementById("tituloRegistroIzel").value=""; document.getElementById("fechaRegistroIzel").value=diaSeleccionado; document.getElementById("repeticionIzel").value="ninguna"; document.getElementById("repeticionHastaIzel").value=""; actualizarCampoFinRepeticionIzel(); document.getElementById("notaRegistroIzel").value=""; document.getElementById("compartirRegistroIzel").checked=false; actualizarControlesCompartirIzel(); document.getElementById("tituloModalIzel").textContent="＋ Nuevo registro de Izel"; document.getElementById("botonGuardarIzel").textContent="Guardar registro"; document.getElementById("modalIzel").style.display="flex"; }
function editarRegistroIzel(indice) { const item=izelRegistros[indice]; if(!item)return; izelEditando=indice; document.getElementById("tipoRegistroIzel").value=item.tipo; document.getElementById("tituloRegistroIzel").value=item.titulo||""; document.getElementById("fechaRegistroIzel").value=item.fecha||""; document.getElementById("repeticionIzel").value=item.repeticion||"ninguna"; document.getElementById("repeticionHastaIzel").value=item.repeticionHasta||""; actualizarCampoFinRepeticionIzel(); document.getElementById("notaRegistroIzel").value=item.nota||""; document.getElementById("compartirRegistroIzel").checked=Boolean(item.sharedWithUids?.length); actualizarControlesCompartirIzel(); document.getElementById("tituloModalIzel").textContent="✏️ Editar registro de Izel"; document.getElementById("botonGuardarIzel").textContent="Guardar cambios"; document.getElementById("modalIzel").style.display="flex"; }
function actualizarCampoFinRepeticionIzel() { const repeticion=document.getElementById("repeticionIzel").value, grupo=document.getElementById("grupoFinRepeticionIzel"), campo=document.getElementById("repeticionHastaIzel"), mostrar=repeticion!=="ninguna"; grupo.hidden=!mostrar; campo.required=mostrar; if(!mostrar)campo.value=""; }
function izelOcurreEnFecha(item, fecha) { return tareaOcurreEnFecha({fecha:item.fecha,repeticion:item.repeticion||"ninguna",repeticionHasta:item.repeticionHasta||""},fecha); }
function izelRegistroCompletadoEnFecha(item, fecha) { if(!item)return false; if(!item.repeticion||item.repeticion==="ninguna")return Boolean(item.completado); return Array.isArray(item.fechasCompletadas)&&item.fechasCompletadas.includes(fecha); }
function cerrarModalIzel() { document.getElementById("modalIzel").style.display="none"; izelEditando=null; }
async function guardarRegistroIzel() { const tipo=document.getElementById("tipoRegistroIzel").value, titulo=document.getElementById("tituloRegistroIzel").value.trim(), fecha=document.getElementById("fechaRegistroIzel").value, repeticion=document.getElementById("repeticionIzel").value, repeticionHasta=document.getElementById("repeticionHastaIzel").value, nota=document.getElementById("notaRegistroIzel").value.trim(); if(!titulo){alert("Escribe el nombre del registro.");document.getElementById("tituloRegistroIzel").focus();return;} if(!fecha){alert("Selecciona la fecha.");return;} if(repeticion!=="ninguna"&&!repeticionHasta){alert("Selecciona hasta qué fecha se repetirá el registro.");document.getElementById("repeticionHastaIzel").focus();return;} if(repeticion!=="ninguna"&&repeticionHasta<fecha){alert("La fecha final debe ser igual o posterior a la fecha inicial.");document.getElementById("repeticionHastaIzel").focus();return;} const anterior=izelEditando===null?null:izelRegistros[izelEditando], mismaSerie=anterior&&anterior.fecha===fecha&&(anterior.repeticion||"ninguna")===repeticion; const item={id:anterior?.id||"izel-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),tipo,titulo,fecha,nota,repeticion,repeticionHasta:repeticion==="ninguna"?"":repeticionHasta,fechasCompletadas:mismaSerie&&Array.isArray(anterior.fechasCompletadas)?anterior.fechasCompletadas:[],completado:repeticion==="ninguna"?Boolean(anterior?.completado&&mismaSerie):false}; const compartir=document.getElementById("compartirRegistroIzel").checked; const boton=document.getElementById("botonGuardarIzel"); boton.disabled=true; try { if(anterior?.ownerUid||(izelUsuarioUid&&(!anterior||compartir))){ if(!window.miappIzelCloud) throw new Error("La sincronización todavía se está iniciando. Inténtalo de nuevo en unos segundos."); const guardado=await window.miappIzelCloud.save({...anterior,...item},compartir); if(!guardado) throw new Error("Inicia sesión para guardar este registro en la cuenta."); if(!anterior?.ownerUid){izelRegistrosLocales=izelRegistrosLocales.filter(x=>x.id!==anterior?.id); izelRegistrosNube=izelRegistrosNube.filter(x=>x.id!==guardado.id); izelRegistrosNube.push(guardado);} else {izelRegistrosNube=izelRegistrosNube.map(x=>x.id===guardado.id?guardado:x);} } else { const posicion=izelRegistrosLocales.findIndex(x=>x.id===item.id); if(posicion<0)izelRegistrosLocales.push(item);else izelRegistrosLocales[posicion]=item; } persistirRegistrosLocalesIzel(); diaSeleccionado=fecha; const d=new Date(fecha+"T00:00:00"); mesContextual=new Date(d.getFullYear(),d.getMonth(),1); cerrarModalIzel(); mostrarListaIzel(); mostrarResumenIzel(); } catch(error) { alert(error.message||"No se pudo guardar el registro."); } finally { boton.disabled=false; } }
async function cambiarEstadoRegistroIzel(indice,completado,fechaClave) { const item=izelRegistros[indice];if(!item||item.tipo==="fecha")return;const fecha=fechaClave||diaSeleccionado;if(item.repeticion&&item.repeticion!=="ninguna"){if(!Array.isArray(item.fechasCompletadas))item.fechasCompletadas=[];const posicion=item.fechasCompletadas.indexOf(fecha);if(completado&&posicion<0)item.fechasCompletadas.push(fecha);if(!completado&&posicion>=0)item.fechasCompletadas.splice(posicion,1);}else item.completado=completado;try{if(item.ownerUid){const guardado=await window.miappIzelCloud.save(item,false);izelRegistrosNube=izelRegistrosNube.map(x=>x.id===guardado.id?guardado:x);}else{const local=izelRegistrosLocales.find(x=>x.id===item.id);if(local)Object.assign(local,item);}persistirRegistrosLocalesIzel();mostrarListaIzel();mostrarResumenIzel();}catch(error){alert(error.message||"No se pudo actualizar el registro.");}}
async function eliminarRegistroIzel(indice) { const item=izelRegistros[indice];if(!item||!confirm("¿Quieres eliminar este registro de Izel?"))return;try{if(item.ownerUid){await window.miappIzelCloud.remove(item);izelRegistrosNube=izelRegistrosNube.filter(x=>x.id!==item.id);}else izelRegistrosLocales=izelRegistrosLocales.filter(x=>x.id!==item.id);persistirRegistrosLocalesIzel();mostrarListaIzel();mostrarResumenIzel();}catch(error){alert(error.message||"No se pudo eliminar el registro.");}}
function mostrarListaIzel() { const lista=document.getElementById("listaIzel");if(!lista)return;const f=document.getElementById("fechaIzel");if(f)f.value=diaSeleccionado;lista.replaceChildren();const items=izelRegistros.map((item,indice)=>({item,indice})).filter(x=>izelOcurreEnFecha(x.item,diaSeleccionado)).sort((a,b)=>a.item.tipo.localeCompare(b.item.tipo));if(!items.length){const p=document.createElement("p");p.className="estado-vacio-modulo";p.textContent="No hay vacunas, pendientes ni fechas de Izel para este día.";lista.appendChild(p);}items.forEach(({item,indice})=>{const completado=izelRegistroCompletadoEnFecha(item,diaSeleccionado);const c=document.createElement("article");c.className="tarjeta-registro-modulo tarjeta-izel";if(completado)c.classList.add("registro-izel-completado");const icono=item.tipo==="vacuna"?(completado?"✅":"💉"):item.tipo==="pendiente"?(completado?"☑️":"✅"):"🌟";const h=document.createElement("h3");h.textContent=icono+" "+item.titulo;c.appendChild(h);const meta=document.createElement("p");meta.textContent=item.tipo==="vacuna"?(completado?"Vacuna aplicada":"Vacuna pendiente"):item.tipo==="pendiente"?(completado?"Pendiente completado":"Pendiente por hacer"):"Fecha especial";c.appendChild(meta);const vis=document.createElement("p");vis.className="detalle-repeticion-izel";vis.textContent=item.ownerUid?(item.sharedWithUids?.length?"Compartido con la cuenta vinculada":"Privado en tu cuenta"):"Solo en este dispositivo";c.appendChild(vis);if(item.repeticion&&item.repeticion!=="ninguna"){const nombres={diaria:"Cada día",semanal:"Cada semana",quincenal:"Cada 2 semanas",mensual:"Cada mes",anual:"Cada año"};const r=document.createElement("p");r.className="detalle-repeticion-izel";r.textContent="🔁 "+(nombres[item.repeticion]||"Recurrente")+" · Se repetirá hasta "+formatoFechaCorta(item.repeticionHasta);c.appendChild(r);}if(item.nota){const p=document.createElement("p");p.textContent=item.nota;c.appendChild(p);}const actions=document.createElement("div");actions.className="acciones-registro-modulo";if(item.tipo!=="fecha"){const check=document.createElement("label");check.className="check-registro-izel";const box=document.createElement("input");box.type="checkbox";box.checked=completado;box.onchange=()=>cambiarEstadoRegistroIzel(indice,box.checked,diaSeleccionado);check.append(box,document.createTextNode(item.tipo==="vacuna"?"Aplicada":"Realizada"));actions.appendChild(check);}const edit=document.createElement("button");edit.type="button";edit.textContent="Editar";edit.onclick=()=>editarRegistroIzel(indice);const del=document.createElement("button");del.type="button";del.textContent="Eliminar";del.disabled=Boolean(item.ownerUid&&item.ownerUid!==izelUsuarioUid);if(del.disabled)del.title="Solo quien creó el registro puede eliminarlo.";del.onclick=()=>eliminarRegistroIzel(indice);actions.append(edit,del);c.appendChild(actions);lista.appendChild(c);});actualizarCalendarioContextual(); }
function mostrarResumenIzel() { const panel=document.getElementById("panelResumenIzel"),pEl=document.getElementById("periodoResumenIzel"),fEl=document.getElementById("fechaReferenciaIzel");if(!panel||!pEl||!fEl)return;if(!fEl.value)fEl.value=fechaClaveCalendario(new Date());panel.replaceChildren();const rango=obtenerRangoResumenFinanzas(pEl.value,fEl.value),ocurrencias=[];for(const item of izelRegistros){const cursor=new Date(rango.inicio);for(let i=0;i<rango.cantidadDias;i++){const fecha=claveDiaCalendario(cursor);if(izelOcurreEnFecha(item,fecha))ocurrencias.push({...item,fechaOcurrencia:fecha,ocurrenciaCompletada:izelRegistroCompletadoEnFecha(item,fecha)});cursor.setDate(cursor.getDate()+1);}}ocurrencias.sort((a,b)=>b.fechaOcurrencia.localeCompare(a.fechaOcurrencia));const vacunas=ocurrencias.filter(x=>x.tipo==="vacuna"),pendientes=ocurrencias.filter(x=>x.tipo==="pendiente"&&!x.ocurrenciaCompletada),fechas=ocurrencias.filter(x=>x.tipo==="fecha");const cards=document.createElement("div");cards.className="tarjetas-resumen-finanzas";[[String(vacunas.length),"Ocurrencias de vacunas"],[String(vacunas.filter(x=>!x.ocurrenciaCompletada).length),"Vacunas pendientes"],[String(vacunas.filter(x=>x.ocurrenciaCompletada).length),"Vacunas aplicadas"],[String(pendientes.length),"Tareas pendientes"],[String(ocurrencias.filter(x=>x.tipo==="pendiente"&&x.ocurrenciaCompletada).length),"Tareas realizadas"],[String(fechas.length),"Fechas especiales"]].forEach(([v,l])=>{const c=document.createElement("article");c.className="tarjeta-metrica-finanzas";const s=document.createElement("strong");s.textContent=v;const t=document.createElement("span");t.textContent=l;c.append(s,t);cards.appendChild(c);});panel.appendChild(cards);const h=document.createElement("h3");h.className="titulo-lista-aprendizajes-resumen";h.textContent="Ocurrencias del periodo";panel.appendChild(h);const list=document.createElement("div");list.className="lista-registros-resumen";if(!ocurrencias.length){const p=document.createElement("p");p.className="estado-vacio-modulo";p.textContent="Aún no hay registros de Izel en este periodo.";list.appendChild(p);}else ocurrencias.forEach(item=>{const c=document.createElement("article");c.className="tarjeta-registro-modulo tarjeta-izel";const h=document.createElement("h4"),icono=item.tipo==="vacuna"?(item.ocurrenciaCompletada?"✅":"💉"):item.tipo==="pendiente"?(item.ocurrenciaCompletada?"☑️":"✅"):"🌟";h.textContent=icono+" "+item.titulo+" · "+new Date(item.fechaOcurrencia+"T00:00:00").toLocaleDateString("es-MX",{dateStyle:"long"});c.appendChild(h);if(item.repeticion&&item.repeticion!=="ninguna"){const r=document.createElement("p");r.textContent="🔁 Se repetirá hasta "+formatoFechaCorta(item.repeticionHasta);c.appendChild(r);}if(item.nota){const p=document.createElement("p");p.textContent=item.nota;c.appendChild(p);}list.appendChild(c);});panel.appendChild(list); }
