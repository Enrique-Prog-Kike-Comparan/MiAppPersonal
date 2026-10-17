import { app } from "./firebase-config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { collection, deleteDoc, doc, getFirestore, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

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
function status(message, error = false) { emit("miapp:izel-estado", { uid: user?.uid || null, message, error }); }
function convert(snapshot) {
  const record = snapshot.data();
  return { ...(record.data || {}), id: snapshot.id, ownerUid: record.ownerUid,
    sharedWithUids: Array.isArray(record.sharedWithUids) ? record.sharedWithUids : [],
    pairId: record.pairId || null };
}
function publish() {
  if (user) emit("miapp:izel-datos", { uid: user.uid, records: [...own.values(), ...shared.values()] });
}
function stopSharedQuery() {
  if (stopShared) { stopShared(); stopShared = null; }
  shared.clear();
}
function startOwnQuery() {
  if (stopOwn) { stopOwn(); stopOwn = null; }
  own.clear();
  if (!user) return;
  const q = query(records, where("ownerUid", "==", user.uid), where("module", "==", "izel"));
  stopOwn = onSnapshot(q, snapshot => {
    own.clear(); snapshot.forEach(item => own.set(item.id, convert(item)));
    publish();
  }, error => {
    console.error("Sincronización de Izel:", error.code || error.message);
    status(error.code === "permission-denied"
      ? "Firebase bloqueó los registros de Izel. Publica las reglas actualizadas y revisa el vínculo."
      : "No se pudieron actualizar los registros de Izel. Revisa tu conexión.", true);
  });
}
function startSharedQuery() {
  stopSharedQuery();
  if (!user || !pair || pair.status !== "active") { publish(); return; }
  const partnerUid = pair.ownerUid === user.uid ? pair.inviteeUid : pair.ownerUid;
  const q = query(records, where("ownerUid", "==", partnerUid), where("sharedWithUids", "==", [user.uid]), where("pairId", "==", pair.id), where("module", "==", "izel"));
  stopShared = onSnapshot(q, snapshot => {
    shared.clear(); snapshot.forEach(item => shared.set(item.id, convert(item)));
    publish(); status("Registros de Izel y compartidos sincronizados.");
  }, error => {
    console.error("Registros de Izel compartidos:", error.code || error.message);
    status(error.code === "permission-denied"
      ? "Firebase bloqueó los registros compartidos de Izel. Revisa las reglas publicadas."
      : "No se pudieron actualizar los registros compartidos de Izel.", true);
  });
}
window.addEventListener("miapp:vinculo-actualizado", event => {
  const detail = event.detail || {};
  pairUid = detail.uid || null;
  pair = detail.vinculo?.status === "active" ? detail.vinculo : null;
  if (user && user.uid === pairUid) startSharedQuery();
  emit("miapp:izel-vinculo", { uid: user?.uid || null, active: Boolean(pair) });
  status(!user ? "Los registros se guardan en este dispositivo. Inicia sesión para sincronizarlos."
    : pair ? "Cuenta vinculada: puedes elegir qué registros de Izel compartir." 
    : "Izel se sincroniza con tu cuenta; vincula a tu esposa para compartir registros.");
});
async function save(item, shareRequested = false) {
  if (!user) return null;
  const data = { ...item };
  delete data.ownerUid; delete data.sharedWithUids; delete data.pairId;
  const isCloud = Boolean(item.ownerUid && item.id);
  const isOwner = !isCloud || item.ownerUid === user.uid;
  if (isCloud && !isOwner) {
    if (!item.sharedWithUids?.includes(user.uid)) throw new Error("Esta cuenta no tiene permiso para editar este registro.");
    await updateDoc(doc(db, "records", item.id), { data, updatedAt: serverTimestamp() });
    return { ...item, ...data };
  }
  if (shareRequested && !pair) throw new Error("Primero vincula las dos cuentas para compartir este registro.");
  const otherUid = pair ? (pair.ownerUid === user.uid ? pair.inviteeUid : pair.ownerUid) : null;
  const sharedWithUids = shareRequested && otherUid ? [otherUid] : [];
  const pairId = sharedWithUids.length ? pair.id : null;
  const id = isCloud ? item.id : doc(records).id;
  const ref = doc(db, "records", id);
  if (isCloud) {
    await updateDoc(ref, { data, sharedWithUids, pairId, updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, { ownerUid: user.uid, sharedWithUids, pairId, module: "izel", data,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
  return { ...data, id, ownerUid: user.uid, sharedWithUids, pairId };
}
async function remove(item) {
  if (!user || !item?.id || item.ownerUid !== user.uid) throw new Error("Solo quien creó este registro puede eliminarlo.");
  await deleteDoc(doc(db, "records", item.id));
}
window.miappIzelCloud = { save, remove };
onAuthStateChanged(auth, nextUser => {
  if (stopOwn) { stopOwn(); stopOwn = null; }
  stopSharedQuery(); own.clear(); shared.clear(); user = nextUser || null;
  if (!user) {
    pair = null; pairUid = null;
    emit("miapp:izel-usuario", { uid: null });
    emit("miapp:izel-vinculo", { uid: null, active: false });
    emit("miapp:izel-datos", { uid: null, records: [] });
    status("Los registros se guardan en este dispositivo. Inicia sesión para sincronizarlos.");
    return;
  }
  emit("miapp:izel-usuario", { uid: user.uid });
  startOwnQuery();
  if (pairUid === user.uid) startSharedQuery();
  else emit("miapp:izel-vinculo", { uid: user.uid, active: false });
});
