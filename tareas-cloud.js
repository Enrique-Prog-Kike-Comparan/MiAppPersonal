import { app } from "./firebase-config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  arrayRemove, arrayUnion, collection, deleteDoc, doc, getFirestore, onSnapshot,
  query, serverTimestamp, setDoc, updateDoc, where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);
const records = collection(db, "records");
let user = null;
let pair = null;
let pairUid = null;
let stopOwn = null;
let stopShared = null;
const own = new Map();
const shared = new Map();

function emit(name, detail) { window.dispatchEvent(new CustomEvent(name, { detail })); }
function status(message, error = false) { emit("miapp:tareas-estado", { uid: user?.uid || null, message, error }); }
function convert(snapshot) {
  const record = snapshot.data();
  return { ...(record.data || {}), id: snapshot.id, ownerUid: record.ownerUid,
    sharedWithUids: Array.isArray(record.sharedWithUids) ? record.sharedWithUids : [],
    pairId: record.pairId || null };
}
function publish() {
  if (user) emit("miapp:tareas-datos", { uid: user.uid, tasks: [...own.values(), ...shared.values()] });
}
function stopSharedQuery() {
  if (stopShared) { stopShared(); stopShared = null; }
  shared.clear();
}
function startOwnQuery() {
  if (stopOwn) { stopOwn(); stopOwn = null; }
  own.clear();
  if (!user) return;
  const q = query(records, where("ownerUid", "==", user.uid), where("module", "==", "tareas"));
  stopOwn = onSnapshot(q, snapshot => {
    own.clear(); snapshot.forEach(item => own.set(item.id, convert(item)));
    publish(); status("Tareas sincronizadas con tu cuenta.");
  }, error => {
    console.error("Sincronización de Tareas:", error.code || error.message);
    status(error.code === "permission-denied"
      ? "Firebase bloqueó las tareas. Revisa las reglas publicadas."
      : "No se pudieron actualizar las tareas. Revisa tu conexión.", true);
  });
}
function startSharedQuery() {
  stopSharedQuery();
  if (!user || !pair || pair.status !== "active") {
    publish();
    emit("miapp:tareas-vinculo", { uid: user?.uid || null, active: false });
    return;
  }
  const partnerUid = pair.ownerUid === user.uid ? pair.inviteeUid : pair.ownerUid;
  const q = query(records, where("ownerUid", "==", partnerUid), where("sharedWithUids", "==", [user.uid]),
    where("pairId", "==", pair.id), where("module", "==", "tareas"));
  emit("miapp:tareas-vinculo", { uid: user.uid, active: true });
  stopShared = onSnapshot(q, snapshot => {
    shared.clear(); snapshot.forEach(item => shared.set(item.id, convert(item)));
    publish(); status("Tareas propias y compartidas sincronizadas.");
  }, error => {
    console.error("Tareas compartidas:", error.code || error.message);
    status(error.code === "permission-denied"
      ? "Firebase bloqueó las tareas compartidas. Revisa las reglas publicadas."
      : "No se pudieron actualizar las tareas compartidas.", true);
  });
}
window.addEventListener("miapp:vinculo-actualizado", event => {
  const detail = event.detail || {};
  pairUid = detail.uid || null;
  pair = detail.vinculo?.status === "active" ? detail.vinculo : null;
  if (user && pairUid === user.uid) startSharedQuery();
});

async function save(task, shareRequested = false) {
  if (!user) throw new Error("Inicia sesión para guardar esta tarea en tu cuenta.");
  const data = {};
  for (const key of ["texto", "fecha", "hora", "prioridad", "categoria", "recordatorio", "repeticion", "repeticionHasta", "fechasCompletadas", "completada"]) {
    data[key] = task[key] ?? (key === "fechasCompletadas" ? [] : "");
  }
  const isCloud = Boolean(task.ownerUid);
  if (isCloud && task.ownerUid !== user.uid) {
    if (!task.sharedWithUids?.includes(user.uid)) throw new Error("Esta cuenta no tiene permiso para editar esta tarea.");
    await updateDoc(doc(db, "records", task.id), { data, updatedAt: serverTimestamp() });
    return { ...task, ...data };
  }
  if (shareRequested && (!pair || pair.status !== "active")) throw new Error("Primero vincula las dos cuentas para compartir esta tarea.");
  const partnerUid = pair?.ownerUid === user.uid ? pair.inviteeUid : pair?.ownerUid;
  const sharedWithUids = shareRequested && partnerUid ? [partnerUid] : [];
  const pairId = sharedWithUids.length ? pair.id : null;
  const id = isCloud ? task.id : doc(records).id;
  const ref = doc(db, "records", id);
  if (isCloud) await updateDoc(ref, { data, sharedWithUids, pairId, updatedAt: serverTimestamp() });
  else await setDoc(ref, { ownerUid: user.uid, sharedWithUids, pairId, module: "tareas", data,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { ...data, id, ownerUid: user.uid, sharedWithUids, pairId };
}
async function mark(task, date, checked) {
  if (!user || !task?.ownerUid || !task.id) throw new Error("La tarea no está sincronizada con una cuenta.");
  const canEdit = task.ownerUid === user.uid || task.sharedWithUids?.includes(user.uid);
  if (!canEdit) throw new Error("Esta cuenta no puede editar esta tarea.");
  const ref = doc(db, "records", task.id);
  if (task.repeticion && task.repeticion !== "ninguna") {
    await updateDoc(ref, { "data.fechasCompletadas": checked ? arrayUnion(date) : arrayRemove(date),
      "data.completada": false, updatedAt: serverTimestamp() });
  } else {
    await updateDoc(ref, { "data.completada": checked, updatedAt: serverTimestamp() });
  }
}
async function remove(task) {
  if (!user || !task?.id || task.ownerUid !== user.uid) throw new Error("Solo quien creó esta tarea puede eliminarla.");
  await deleteDoc(doc(db, "records", task.id));
}
window.miappTareasCloud = { guardar: save, marcar: mark, eliminar: remove };

onAuthStateChanged(auth, nextUser => {
  if (stopOwn) { stopOwn(); stopOwn = null; }
  stopSharedQuery(); own.clear(); shared.clear(); user = nextUser || null;
  if (!user) {
    pair = null; pairUid = null;
    emit("miapp:tareas-usuario", { uid: null });
    emit("miapp:tareas-vinculo", { uid: null, active: false });
    status("Las tareas se guardan en este dispositivo. Inicia sesión para sincronizarlas.");
    return;
  }
  emit("miapp:tareas-usuario", { uid: user.uid });
  startOwnQuery();
  if (pairUid === user.uid) startSharedQuery();
  else emit("miapp:tareas-vinculo", { uid: user.uid, active: false });
});
