import { app } from "./firebase-config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  arrayRemove, arrayUnion, collection, deleteDoc, doc, getFirestore, onSnapshot, query,
  serverTimestamp, setDoc, updateDoc, where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);
const records = collection(db, "records");
let user = null, pair = null, pairUid = null, stopOwn = null, stopShared = null;
const own = new Map(), shared = new Map();
function emit(name, detail) { window.dispatchEvent(new CustomEvent(name, { detail })); }
function status(message, error = false) { emit("miapp:entrenamiento-estado", { uid: user?.uid || null, message, error }); }
function convert(snapshot) {
  const record = snapshot.data();
  return { ...(record.data || {}), id: snapshot.id, ownerUid: record.ownerUid,
    sharedWithUids: Array.isArray(record.sharedWithUids) ? record.sharedWithUids : [], pairId: record.pairId || null };
}
function publish() { if (user) emit("miapp:entrenamiento-datos", { uid: user.uid, items: [...own.values(), ...shared.values()] }); }
function stopSharedQuery() { if (stopShared) { stopShared(); stopShared = null; } shared.clear(); }
function startOwnQuery() {
  if (stopOwn) { stopOwn(); stopOwn = null; }
  own.clear();
  if (!user) return;
  const q = query(records, where("ownerUid", "==", user.uid), where("module", "==", "entrenamiento"));
  stopOwn = onSnapshot(q, snapshot => { own.clear(); snapshot.forEach(item => own.set(item.id, convert(item))); publish(); status("Entrenamiento sincronizado con tu cuenta."); }, error => {
    console.error("Sincronización de Entrenamiento:", error.code || error.message);
    status(error.code === "permission-denied" ? "Firebase bloqueó Entrenamiento. Revisa las reglas publicadas." : "No se pudo actualizar Entrenamiento. Revisa tu conexión.", true);
  });
}
function startSharedQuery() {
  stopSharedQuery();
  if (!user || !pair || pair.status !== "active") { publish(); emit("miapp:entrenamiento-vinculo", { uid: user?.uid || null, active: false }); return; }
  const partnerUid = pair.ownerUid === user.uid ? pair.inviteeUid : pair.ownerUid;
  const q = query(records, where("ownerUid", "==", partnerUid), where("sharedWithUids", "==", [user.uid]), where("pairId", "==", pair.id), where("module", "==", "entrenamiento"));
  emit("miapp:entrenamiento-vinculo", { uid: user.uid, active: true });
  stopShared = onSnapshot(q, snapshot => { shared.clear(); snapshot.forEach(item => shared.set(item.id, convert(item))); publish(); status("Entrenamientos propios y compartidos sincronizados."); }, error => {
    console.error("Entrenamientos compartidos:", error.code || error.message);
    status(error.code === "permission-denied" ? "Firebase bloqueó Entrenamiento compartido. Revisa las reglas publicadas." : "No se pudieron actualizar los entrenamientos compartidos.", true);
  });
}
window.addEventListener("miapp:vinculo-actualizado", event => {
  const detail = event.detail || {}; pairUid = detail.uid || null; pair = detail.vinculo?.status === "active" ? detail.vinculo : null;
  if (user && pairUid === user.uid) startSharedQuery();
  emit("miapp:entrenamiento-vinculo", { uid: user?.uid || null, active: Boolean(pair) });
});
async function save(item, shareRequested = false) {
  if (!user) throw new Error("Inicia sesión para guardar esta actividad en tu cuenta.");
  const data = {};
  for (const key of ["tipo", "actividad", "fecha", "duracion", "nota", "repeticion", "repeticionHasta", "fechasCompletadas", "completada"]) data[key] = item[key] ?? (key === "fechasCompletadas" ? [] : "");
  const isCloud = Boolean(item.ownerUid && item.id);
  if (isCloud && item.ownerUid !== user.uid) {
    if (!item.sharedWithUids?.includes(user.uid)) throw new Error("Esta cuenta no tiene permiso para editar esta actividad.");
    await updateDoc(doc(db, "records", item.id), { data, updatedAt: serverTimestamp() });
    return { ...item, ...data };
  }
  if (shareRequested && (!pair || pair.status !== "active")) throw new Error("Primero vincula las dos cuentas para compartir esta actividad.");
  const partnerUid = pair?.ownerUid === user.uid ? pair.inviteeUid : pair?.ownerUid;
  const sharedWithUids = shareRequested && partnerUid ? [partnerUid] : [];
  const pairId = sharedWithUids.length ? pair.id : null;
  const id = isCloud ? item.id : doc(records).id, ref = doc(db, "records", id);
  if (isCloud) await updateDoc(ref, { data, sharedWithUids, pairId, updatedAt: serverTimestamp() });
  else await setDoc(ref, { ownerUid: user.uid, sharedWithUids, pairId, module: "entrenamiento", data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { ...data, id, ownerUid: user.uid, sharedWithUids, pairId };
}
async function mark(item, date, checked) {
  if (!user || !item?.ownerUid || !item.id) throw new Error("La actividad no está sincronizada con una cuenta.");
  if (item.ownerUid !== user.uid && !item.sharedWithUids?.includes(user.uid)) throw new Error("Esta cuenta no tiene permiso para editar esta actividad.");
  const ref = doc(db, "records", item.id);
  if (item.repeticion && item.repeticion !== "ninguna") await updateDoc(ref, { "data.fechasCompletadas": checked ? arrayUnion(date) : arrayRemove(date), "data.completada": false, updatedAt: serverTimestamp() });
  else await updateDoc(ref, { "data.completada": checked, updatedAt: serverTimestamp() });
}
async function remove(item) {
  if (!user || !item?.id || item.ownerUid !== user.uid) throw new Error("Solo quien creó esta actividad puede eliminarla.");
  await deleteDoc(doc(db, "records", item.id));
}
window.miappEntrenamientoCloud = { guardar: save, marcar: mark, eliminar: remove };
onAuthStateChanged(auth, nextUser => {
  if (stopOwn) { stopOwn(); stopOwn = null; }
  stopSharedQuery(); own.clear(); shared.clear(); user = nextUser || null;
  if (!user) { pair = null; pairUid = null; emit("miapp:entrenamiento-usuario", { uid: null }); emit("miapp:entrenamiento-datos", { uid: null, items: [] }); emit("miapp:entrenamiento-vinculo", { uid: null, active: false }); status("Entrenamiento se guarda en este dispositivo. Inicia sesión para sincronizarlo."); return; }
  emit("miapp:entrenamiento-usuario", { uid: user.uid }); startOwnQuery();
  if (pairUid === user.uid) startSharedQuery(); else emit("miapp:entrenamiento-vinculo", { uid: user.uid, active: false });
});
