import { app } from "./firebase-config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  arrayRemove, arrayUnion, collection, deleteDoc, doc, getFirestore, onSnapshot, query, serverTimestamp,
  setDoc, updateDoc, where
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
function status(message, error = false) { emit("miapp:pagos-estado", { uid: user?.uid || null, message, error }); }
function convert(snapshot) {
  const record = snapshot.data();
  return { ...(record.data || {}), id: snapshot.id, ownerUid: record.ownerUid,
    sharedWithUids: Array.isArray(record.sharedWithUids) ? record.sharedWithUids : [],
    pairId: record.pairId || null };
}
function publish() {
  if (user) emit("miapp:pagos-datos", { uid: user.uid, payments: [...own.values(), ...shared.values()] });
}
function stopSharedQuery() {
  if (stopShared) { stopShared(); stopShared = null; }
  shared.clear();
}
function startOwnQuery() {
  if (stopOwn) { stopOwn(); stopOwn = null; }
  own.clear();
  if (!user) return;
  const q = query(records, where("ownerUid", "==", user.uid), where("module", "==", "pagos"));
  stopOwn = onSnapshot(q, snapshot => {
    own.clear(); snapshot.forEach(item => own.set(item.id, convert(item)));
    publish(); status("Pagos sincronizados con tu cuenta.");
  }, error => {
    console.error("Sincronización de Pagos:", error.code || error.message);
    status(error.code === "permission-denied"
      ? "Firebase bloqueó los pagos. Publica las reglas actualizadas."
      : "No se pudieron actualizar los pagos. Revisa tu conexión.", true);
  });
}
function startSharedQuery() {
  stopSharedQuery();
  if (!user || !pair || pair.status !== "active") {
    publish();
    emit("miapp:pagos-vinculo", { uid: user?.uid || null, active: false });
    return;
  }
  const partnerUid = pair.ownerUid === user.uid ? pair.inviteeUid : pair.ownerUid;
  const q = query(records, where("ownerUid", "==", partnerUid), where("sharedWithUids", "==", [user.uid]),
    where("pairId", "==", pair.id), where("module", "==", "pagos"));
  emit("miapp:pagos-vinculo", { uid: user.uid, active: true });
  stopShared = onSnapshot(q, snapshot => {
    shared.clear(); snapshot.forEach(item => shared.set(item.id, convert(item)));
    publish(); status("Pagos propios y compartidos sincronizados.");
  }, error => {
    console.error("Pagos compartidos:", error.code || error.message);
    status(error.code === "permission-denied"
      ? "Firebase bloqueó los pagos compartidos. Revisa las reglas publicadas."
      : "No se pudieron actualizar los pagos compartidos.", true);
  });
}
window.addEventListener("miapp:vinculo-actualizado", event => {
  const detail = event.detail || {};
  pairUid = detail.uid || null;
  pair = detail.vinculo?.status === "active" ? detail.vinculo : null;
  if (user && pairUid === user.uid) startSharedQuery();
  emit("miapp:pagos-vinculo", { uid: user?.uid || null, active: Boolean(pair) });
  status(!user ? "Los pagos se guardan en este dispositivo. Inicia sesión para sincronizarlos."
    : pair ? "Cuenta vinculada: puedes elegir qué pagos compartir."
    : "Pagos se sincroniza con tu cuenta; vincula a tu esposa para compartir pagos.");
});

async function save(payment, shareRequested = false) {
  if (!user) throw new Error("Inicia sesión para guardar este pago en tu cuenta.");
  const data = { nombre: String(payment.nombre || ""), fecha: String(payment.fecha || ""),
    monto: Number(payment.monto) || 0, pagado: Boolean(payment.pagado),
    repeticion: String(payment.repeticion || "ninguna"), repeticionHasta: String(payment.repeticionHasta || ""),
    fechasPagadas: Array.isArray(payment.fechasPagadas) ? payment.fechasPagadas : [] };
  const isCloud = Boolean(payment.ownerUid && payment.id);
  if (isCloud && payment.ownerUid !== user.uid) {
    if (!payment.sharedWithUids?.includes(user.uid)) throw new Error("Esta cuenta no tiene permiso para editar este pago.");
    await updateDoc(doc(db, "records", payment.id), { data, updatedAt: serverTimestamp() });
    return { ...payment, ...data };
  }
  if (shareRequested && (!pair || pair.status !== "active")) throw new Error("Primero vincula las dos cuentas para compartir este pago.");
  const partnerUid = pair?.ownerUid === user.uid ? pair.inviteeUid : pair?.ownerUid;
  const sharedWithUids = shareRequested && partnerUid ? [partnerUid] : [];
  const pairId = sharedWithUids.length ? pair.id : null;
  const id = isCloud ? payment.id : doc(records).id;
  const ref = doc(db, "records", id);
  if (isCloud) await updateDoc(ref, { data, sharedWithUids, pairId, updatedAt: serverTimestamp() });
  else await setDoc(ref, { ownerUid: user.uid, sharedWithUids, pairId, module: "pagos", data,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { ...data, id, ownerUid: user.uid, sharedWithUids, pairId };
}
async function mark(payment, date, paid) {
  if (!user || !payment?.id || !date) throw new Error("No se pudo identificar el pago y su fecha.");
  if (payment.ownerUid !== user.uid && !payment.sharedWithUids?.includes(user.uid)) throw new Error("Esta cuenta no tiene permiso para editar este pago.");
  await updateDoc(doc(db, "records", payment.id), {
    "data.fechasPagadas": paid ? arrayUnion(date) : arrayRemove(date),
    updatedAt: serverTimestamp()
  });
}
async function remove(payment) {
  if (!user || !payment?.id || payment.ownerUid !== user.uid) throw new Error("Solo quien creó este pago puede eliminarlo.");
  await deleteDoc(doc(db, "records", payment.id));
}
window.miappPagosCloud = { guardar: save, marcar: mark, eliminar: remove };

onAuthStateChanged(auth, nextUser => {
  if (stopOwn) { stopOwn(); stopOwn = null; }
  stopSharedQuery(); own.clear(); shared.clear(); user = nextUser || null;
  if (!user) {
    pair = null; pairUid = null;
    emit("miapp:pagos-usuario", { uid: null });
    emit("miapp:pagos-datos", { uid: null, payments: [] });
    emit("miapp:pagos-vinculo", { uid: null, active: false });
    status("Los pagos se guardan en este dispositivo. Inicia sesión para sincronizarlos.");
    return;
  }
  emit("miapp:pagos-usuario", { uid: user.uid });
  startOwnQuery();
  if (pairUid === user.uid) startSharedQuery();
  else emit("miapp:pagos-vinculo", { uid: user.uid, active: false });
});
