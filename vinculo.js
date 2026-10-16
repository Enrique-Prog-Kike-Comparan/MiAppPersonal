import { app } from "./firebase-config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const panelVinculo = document.getElementById("panelVinculo");
const estadoVinculo = document.getElementById("estadoVinculo");
const formCrearVinculo = document.getElementById("formCrearVinculo");
const formAceptarVinculo = document.getElementById("formAceptarVinculo");
const invitacionPendiente = document.getElementById("invitacionPendiente");
const codigoInvitacion = document.getElementById("codigoInvitacion");
const vinculoActivo = document.getElementById("vinculoActivo");
const detalleVinculoActivo = document.getElementById("detalleVinculoActivo");
const codigoAInvitacion = document.getElementById("codigoAInvitacion");

let usuarioActual = null;
let vinculoActual = null;
let invitacionPropia = null;

function informarErrorVinculo(error) {
    console.error("Vínculo de cuentas:", error.code || error.message);

    if (error.code === "permission-denied") {
        return "Firebase mantiene el acceso bloqueado. El vínculo estará disponible después de publicar las reglas revisadas.";
    }

    if (error.code === "unavailable" || error.code === "network-request-failed") {
        return "No se pudo conectar con Firebase. Revisa tu conexión e inténtalo de nuevo.";
    }

    return "No se pudo completar el vínculo. Revisa el código y vuelve a intentarlo.";
}

function ocultarControlesVinculo() {
    formCrearVinculo.hidden = true;
    formAceptarVinculo.hidden = true;
    invitacionPendiente.hidden = true;
    vinculoActivo.hidden = true;
}

function crearCodigoAleatorio() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
        return globalThis.crypto.randomUUID().replaceAll("-", "").toLowerCase();
    }

    const bytes = new Uint8Array(24);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, function(byte) {
        return byte.toString(16).padStart(2, "0");
    }).join("");
}

async function obtenerVinculos(usuario) {
    const propios = await getDocs(query(
        collection(db, "accountPairs"),
        where("ownerUid", "==", usuario.uid)
    ));

    const recibidos = await getDocs(query(
        collection(db, "accountPairs"),
        where("inviteeUid", "==", usuario.uid)
    ));

    const documentos = new Map();

    propios.forEach(function(documento) {
        documentos.set(documento.id, { id: documento.id, ...documento.data() });
    });

    recibidos.forEach(function(documento) {
        documentos.set(documento.id, { id: documento.id, ...documento.data() });
    });

    return Array.from(documentos.values());
}

function mostrarVinculos(vinculos) {
    ocultarControlesVinculo();

    vinculoActual = vinculos.find(function(vinculo) {
        return vinculo.status === "active";
    }) || null;

    window.dispatchEvent(new CustomEvent("miapp:vinculo-actualizado", {
        detail: { uid: usuarioActual.uid, vinculo: vinculoActual }
    }));

    invitacionPropia = vinculos.find(function(vinculo) {
        return vinculo.status === "pending" && vinculo.ownerUid === usuarioActual.uid;
    }) || null;

    if (vinculoActual) {
        const correoOtraCuenta = vinculoActual.ownerUid === usuarioActual.uid
            ? vinculoActual.inviteeEmail
            : vinculoActual.ownerEmail;

        estadoVinculo.textContent = "Las cuentas están vinculadas.";
        detalleVinculoActivo.textContent = "Cuenta vinculada: " + (correoOtraCuenta || "correo no disponible") + ". Ambas cuentas pueden iniciar el uso compartido de sus propios elementos.";
        vinculoActivo.hidden = false;
        return;
    }

    if (invitacionPropia) {
        estadoVinculo.textContent = "Tienes una invitación pendiente.";
        codigoInvitacion.textContent = invitacionPropia.id;
        invitacionPendiente.hidden = false;
        return;
    }

    estadoVinculo.textContent = "Aún no hay un vínculo entre las cuentas.";
    formCrearVinculo.hidden = false;
    formAceptarVinculo.hidden = false;
}

async function cargarVinculos() {
    if (!usuarioActual) {
        return;
    }

    estadoVinculo.textContent = "Revisando el vínculo...";
    ocultarControlesVinculo();

    try {
        mostrarVinculos(await obtenerVinculos(usuarioActual));
    } catch (error) {
        estadoVinculo.textContent = informarErrorVinculo(error);
    }
}

formCrearVinculo.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!usuarioActual || vinculoActual || invitacionPropia) {
        return;
    }

    const boton = formCrearVinculo.querySelector('button[type="submit"]');
    boton.disabled = true;
    estadoVinculo.textContent = "Generando una invitación segura...";

    try {
        const vinculos = await obtenerVinculos(usuarioActual);
        if (vinculos.some(function(vinculo) {
            return vinculo.status === "active"
                || (vinculo.status === "pending" && vinculo.ownerUid === usuarioActual.uid);
        })) {
            mostrarVinculos(vinculos);
            return;
        }

        const codigo = crearCodigoAleatorio();
        await setDoc(doc(db, "accountPairs", codigo), {
            ownerUid: usuarioActual.uid,
            ownerEmail: usuarioActual.email || "",
            inviteeUid: null,
            inviteeEmail: null,
            status: "pending",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            acceptedAt: null
        });

        await cargarVinculos();
        estadoVinculo.textContent = "Invitación creada. Compártela directamente con la otra persona.";
    } catch (error) {
        estadoVinculo.textContent = informarErrorVinculo(error);
    } finally {
        boton.disabled = false;
    }
});

formAceptarVinculo.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!usuarioActual || vinculoActual) {
        return;
    }

    const codigo = codigoAInvitacion.value.trim().toLowerCase();
    if (!/^[a-f0-9]{32,64}$/.test(codigo)) {
        estadoVinculo.textContent = "Revisa el código y vuelve a intentarlo.";
        return;
    }

    const boton = formAceptarVinculo.querySelector('button[type="submit"]');
    boton.disabled = true;
    estadoVinculo.textContent = "Revisando la invitación...";

    try {
        const referencia = doc(db, "accountPairs", codigo);
        const invitacion = await getDoc(referencia);

        if (!invitacion.exists()) {
            estadoVinculo.textContent = "No encontramos una invitación pendiente con ese código.";
            return;
        }

        const datos = invitacion.data();
        if (datos.status !== "pending") {
            estadoVinculo.textContent = "Este código ya fue usado o cancelado.";
            return;
        }

        if (datos.ownerUid === usuarioActual.uid) {
            estadoVinculo.textContent = "La cuenta que generó el código no puede aceptarlo.";
            return;
        }

        const acepta = globalThis.confirm(
            "La invitación fue generada por " + (datos.ownerEmail || "otra cuenta") + ". ¿Quieres vincular esta cuenta?"
        );

        if (!acepta) {
            estadoVinculo.textContent = "No se aceptó la invitación.";
            return;
        }

        await updateDoc(referencia, {
            inviteeUid: usuarioActual.uid,
            inviteeEmail: usuarioActual.email || "",
            status: "active",
            acceptedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        codigoAInvitacion.value = "";
        await cargarVinculos();
        estadoVinculo.textContent = "Invitación aceptada. Las cuentas quedaron vinculadas.";
    } catch (error) {
        estadoVinculo.textContent = informarErrorVinculo(error);
    } finally {
        boton.disabled = false;
    }
});

document.getElementById("copiarCodigoInvitacion").addEventListener("click", async function() {
    if (!invitacionPropia) {
        return;
    }

    try {
        await navigator.clipboard.writeText(invitacionPropia.id);
        estadoVinculo.textContent = "Código copiado. Compártelo únicamente con la otra persona.";
    } catch (error) {
        estadoVinculo.textContent = "Selecciona y copia el código que aparece en pantalla.";
    }
});

document.getElementById("cancelarInvitacion").addEventListener("click", async function() {
    if (!usuarioActual || !invitacionPropia) {
        return;
    }

    try {
        await updateDoc(doc(db, "accountPairs", invitacionPropia.id), {
            status: "revoked",
            updatedAt: serverTimestamp()
        });
        await cargarVinculos();
        estadoVinculo.textContent = "La invitación fue cancelada.";
    } catch (error) {
        estadoVinculo.textContent = informarErrorVinculo(error);
    }
});

document.getElementById("desvincularCuentas").addEventListener("click", async function() {
    if (!usuarioActual || !vinculoActual) {
        return;
    }

    const acepta = globalThis.confirm(
        "Al desvincular, la otra cuenta dejará de acceder a los registros que compartan. ¿Deseas continuar?"
    );

    if (!acepta) {
        return;
    }

    try {
        await updateDoc(doc(db, "accountPairs", vinculoActual.id), {
            status: "revoked",
            updatedAt: serverTimestamp()
        });
        await cargarVinculos();
        estadoVinculo.textContent = "Las cuentas quedaron desvinculadas.";
    } catch (error) {
        estadoVinculo.textContent = informarErrorVinculo(error);
    }
});

onAuthStateChanged(auth, function(user) {
    usuarioActual = user || null;
    panelVinculo.hidden = !user;

    if (user) {
        cargarVinculos();
    } else {
        vinculoActual = null;
        invitacionPropia = null;
        estadoVinculo.textContent = "Inicia sesión para vincular las dos cuentas.";
        ocultarControlesVinculo();
        window.dispatchEvent(new CustomEvent("miapp:vinculo-actualizado", {
            detail: { uid: null, vinculo: null }
        }));
    }
});
