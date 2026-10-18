import { app } from "./firebase-config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getFirestore,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);
const recordsRef = collection(db, "records");
const privateModules = new Set(["finanzas", "salud", "objetivos", "aprendizajes", "tiempo"]);
const subscriptions = new Map();
const recordsByModule = new Map();
let currentUser = null;
let currentUid = null;

function emit(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
}

function reportStatus(module, message, error = false) {
    emit("miapp:privados-estado", { uid: currentUid, module, message, error });
}

function convertRecord(snapshot) {
    const record = snapshot.data();
    return {
        ...(record.data || {}),
        id: record.data?.id || snapshot.id,
        ownerUid: record.ownerUid,
        sharedWithUids: [],
        pairId: null
    };
}

function stopSubscriptions() {
    subscriptions.forEach(unsubscribe => unsubscribe());
    subscriptions.clear();
    recordsByModule.clear();
}

function subscribeModule(module, user) {
    const q = query(
        recordsRef,
        where("ownerUid", "==", user.uid),
        where("module", "==", module)
    );
    const unsubscribe = onSnapshot(q, snapshot => {
        const records = [];
        snapshot.forEach(docSnapshot => records.push(convertRecord(docSnapshot)));
        recordsByModule.set(module, records);
        emit("miapp:privados-datos", { uid: user.uid, module, records });
        reportStatus(module, "Sincronizado con tu cuenta.");
    }, error => {
        console.error("Sincronización privada (" + module + "):", error.code || error.message);
        reportStatus(module,
            error.code === "permission-denied"
                ? "Firebase no permitió cargar estos datos privados. Revisa las reglas publicadas."
                : "No se pudieron actualizar estos datos. Revisa tu conexión e inténtalo de nuevo.",
            true
        );
    });
    subscriptions.set(module, unsubscribe);
}

onAuthStateChanged(auth, user => {
    if (user?.uid === currentUid) return;
    stopSubscriptions();
    currentUser = user || null;
    currentUid = user?.uid || null;
    emit("miapp:privados-usuario", {
        uid: currentUid,
        email: user?.email || null
    });
    if (!user) return;
    privateModules.forEach(module => subscribeModule(module, user));
});

async function save(module, item) {
    if (!privateModules.has(module)) throw new Error("Este módulo no usa sincronización privada.");
    if (!currentUser) throw new Error("Inicia sesión para sincronizar este registro con tu cuenta.");
    if (item?.ownerUid && item.ownerUid !== currentUser.uid) {
        throw new Error("No puedes editar un registro privado de otra cuenta.");
    }
    const id = String(item.id || doc(recordsRef).id);
    if (!id || id.includes("/")) throw new Error("El registro tiene un identificador no válido.");
    const reference = doc(db, "records", id);
    let existing = null;
    if (item?.ownerUid) {
        const existingSnapshot = await getDoc(reference);
        existing = existingSnapshot.exists() ? existingSnapshot.data() : null;
        if (existing && (existing.ownerUid !== currentUser.uid || existing.module !== module)) {
            throw new Error("Este registro privado pertenece a otra cuenta o módulo.");
        }
        if (!existing) throw new Error("Este registro ya no está en Firebase. Actualiza la pantalla antes de volver a guardarlo.");
    }
    const data = JSON.parse(JSON.stringify({ ...item, id }));
    delete data.ownerUid;
    delete data.sharedWithUids;
    delete data.pairId;
    await setDoc(reference, {
        ownerUid: currentUser.uid,
        sharedWithUids: [],
        pairId: null,
        module,
        data,
        createdAt: existing?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
    });
    return { ...data, ownerUid: currentUser.uid, sharedWithUids: [], pairId: null };
}

async function remove(module, item) {
    if (!privateModules.has(module)) throw new Error("Este módulo no usa sincronización privada.");
    if (!currentUser || item?.ownerUid !== currentUser.uid) {
        throw new Error("Solo puedes eliminar registros privados de tu propia cuenta.");
    }
    const reference = doc(db, "records", item.id);
    const snapshot = await getDoc(reference);
    if (!snapshot.exists()) return;
    const record = snapshot.data();
    if (record.ownerUid !== currentUser.uid || record.module !== module) {
        throw new Error("No puedes eliminar un registro privado de otra cuenta.");
    }
    await deleteDoc(reference);
}

window.miappPrivadosCloud = { save, remove };