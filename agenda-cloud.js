import { app } from "./firebase-config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
    collection,
    deleteDoc,
    doc,
    getFirestore,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);
const registros = collection(db, "records");

let usuarioActual = null;
let vinculoActual = null;
let uidDelVinculo = null;
let cancelarConsultaPropios = null;
let cancelarConsultaCompartidos = null;
const registrosPropios = new Map();
const registrosCompartidos = new Map();

function emitir(nombre, detalle) {
    window.dispatchEvent(new CustomEvent(nombre, { detail: detalle }));
}

function avisarEstado(mensaje, error) {
    emitir("miapp:agenda-estado", {
        uid: usuarioActual ? usuarioActual.uid : null,
        mensaje: mensaje,
        error: Boolean(error)
    });
}

function convertirRegistro(documento) {
    const registro = documento.data();
    return {
        ...(registro.data || {}),
        id: documento.id,
        ownerUid: registro.ownerUid,
        sharedWithUids: Array.isArray(registro.sharedWithUids)
            ? registro.sharedWithUids
            : [],
        pairId: registro.pairId || null
    };
}

function publicarRegistros() {
    if (!usuarioActual) {
        return;
    }

    emitir("miapp:agenda-datos", {
        uid: usuarioActual.uid,
        fechas: Array.from(registrosPropios.values())
            .concat(Array.from(registrosCompartidos.values()))
    });
}

function cerrarConsultasCompartidas() {
    if (cancelarConsultaCompartidos) {
        cancelarConsultaCompartidos();
        cancelarConsultaCompartidos = null;
    }
    registrosCompartidos.clear();
}

function escucharRegistrosPropios() {
    if (cancelarConsultaPropios) {
        cancelarConsultaPropios();
        cancelarConsultaPropios = null;
    }
    registrosPropios.clear();

    if (!usuarioActual) {
        return;
    }

    const consulta = query(
        registros,
        where("ownerUid", "==", usuarioActual.uid),
        where("module", "==", "agenda")
    );

    cancelarConsultaPropios = onSnapshot(consulta, function(snapshot) {
        registrosPropios.clear();
        snapshot.forEach(function(documento) {
            registrosPropios.set(documento.id, convertirRegistro(documento));
        });
        publicarRegistros();
        avisarEstado("Agenda sincronizada con tu cuenta.");
    }, function(error) {
        console.error("Sincronización de Agenda:", error.code || error.message);
        avisarEstado(
            error.code === "permission-denied"
                ? "Firebase no permitió cargar Agenda. Revisa la sesión y las reglas publicadas."
                : "No se pudo actualizar Agenda. Revisa tu conexión e inténtalo de nuevo.",
            true
        );
    });
}

function escucharRegistrosCompartidos() {
    cerrarConsultasCompartidas();

    const pareja = vinculoActual;
    if (!usuarioActual || !pareja || pareja.status !== "active") {
        publicarRegistros();
        emitir("miapp:agenda-vinculo", {
            uid: usuarioActual ? usuarioActual.uid : null,
            activo: false
        });
        return;
    }

    const consulta = query(
        registros,
        where("sharedWithUids", "==", [usuarioActual.uid]),
        where("pairId", "==", pareja.id),
        where("module", "==", "agenda")
    );

    emitir("miapp:agenda-vinculo", {
        uid: usuarioActual.uid,
        activo: true
    });

    cancelarConsultaCompartidos = onSnapshot(consulta, function(snapshot) {
        registrosCompartidos.clear();
        snapshot.forEach(function(documento) {
            registrosCompartidos.set(documento.id, convertirRegistro(documento));
        });
        publicarRegistros();
    }, function(error) {
        console.error("Fechas compartidas:", error.code || error.message);
        avisarEstado(
            error.code === "permission-denied"
                ? "Firebase no permitió cargar las fechas compartidas. Revisa el vínculo y las reglas."
                : "No se pudieron actualizar las fechas compartidas. Revisa tu conexión.",
            true
        );
    });
}

window.addEventListener("miapp:vinculo-actualizado", function(event) {
    const detalle = event.detail || {};
    uidDelVinculo = detalle.uid || null;
    vinculoActual = detalle.vinculo && detalle.vinculo.status === "active"
        ? detalle.vinculo
        : null;

    if (usuarioActual && uidDelVinculo === usuarioActual.uid) {
        escucharRegistrosCompartidos();
    }
});

async function guardar(fecha, compartirSolicitado) {
    if (!usuarioActual) {
        throw new Error("Inicia sesión para guardar esta fecha en tu cuenta.");
    }

    const esRegistroPropio = !fecha.ownerUid || fecha.ownerUid === usuarioActual.uid;
    const id = fecha.id || doc(registros).id;
    const referencia = doc(db, "records", id);
    const datosFecha = {
        nombre: fecha.nombre,
        tipo: fecha.tipo,
        fecha: fecha.fecha,
        hora: fecha.hora || "",
        recordatorio: fecha.recordatorio || "ninguno",
        recordatorioProcesado: fecha.recordatorioProcesado || null
    };

    if (!esRegistroPropio) {
        if (!fecha.sharedWithUids || !fecha.sharedWithUids.includes(usuarioActual.uid)) {
            throw new Error("Esta cuenta no tiene permiso para editar esa fecha.");
        }
        await updateDoc(referencia, {
            data: datosFecha,
            updatedAt: serverTimestamp()
        });
        return { ...fecha, ...datosFecha };
    }

    if (compartirSolicitado && !vinculoActual) {
        throw new Error("Primero vincula las dos cuentas para compartir esta fecha.");
    }

    const parejaActiva = vinculoActual && vinculoActual.status === "active"
        ? vinculoActual
        : null;
    const compartir = Boolean(compartirSolicitado && parejaActiva);
    const uidPareja = parejaActiva
        ? (parejaActiva.ownerUid === usuarioActual.uid
            ? parejaActiva.inviteeUid
            : parejaActiva.ownerUid)
        : null;
    const sharedWithUids = compartir && uidPareja ? [uidPareja] : [];
    const pairId = compartir ? parejaActiva.id : null;

    if (fecha.ownerUid === usuarioActual.uid) {
        await updateDoc(referencia, {
            data: datosFecha,
            sharedWithUids: sharedWithUids,
            pairId: pairId,
            updatedAt: serverTimestamp()
        });
    } else {
        await setDoc(referencia, {
            ownerUid: usuarioActual.uid,
            sharedWithUids: sharedWithUids,
            pairId: pairId,
            module: "agenda",
            data: datosFecha,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    }

    return {
        ...fecha,
        ...datosFecha,
        id: id,
        ownerUid: usuarioActual.uid,
        sharedWithUids: sharedWithUids,
        pairId: pairId
    };
}

async function eliminar(fecha) {
    if (!usuarioActual || !fecha.id || fecha.ownerUid !== usuarioActual.uid) {
        throw new Error("Solo puedes eliminar las fechas que creaste.");
    }
    await deleteDoc(doc(db, "records", fecha.id));
}

window.miappAgendaCloud = {
    guardar: guardar,
    eliminar: eliminar
};

onAuthStateChanged(auth, function(usuario) {
    if (cancelarConsultaPropios) {
        cancelarConsultaPropios();
        cancelarConsultaPropios = null;
    }
    cerrarConsultasCompartidas();
    registrosPropios.clear();
    registrosCompartidos.clear();

    usuarioActual = usuario || null;
    if (!usuarioActual) {
        vinculoActual = null;
        uidDelVinculo = null;
        emitir("miapp:agenda-usuario", { uid: null });
        emitir("miapp:agenda-vinculo", { uid: null, activo: false });
        avisarEstado("Las fechas se guardan en este dispositivo. Inicia sesión para sincronizarlas.");
        return;
    }

    if (uidDelVinculo !== usuarioActual.uid) {
        vinculoActual = null;
    }

    emitir("miapp:agenda-usuario", { uid: usuarioActual.uid });
    avisarEstado("Conectando Agenda con tu cuenta...");
    escucharRegistrosPropios();

    if (uidDelVinculo === usuarioActual.uid) {
        escucharRegistrosCompartidos();
    } else {
        emitir("miapp:agenda-vinculo", {
            uid: usuarioActual.uid,
            activo: false
        });
    }
});
