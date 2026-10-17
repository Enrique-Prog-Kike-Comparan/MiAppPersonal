import { app } from "./firebase-config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { collection, deleteDoc, doc, getFirestore, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const auth = getAuth(app), db = getFirestore(app), records = collection(db, "records");
let user = null, pair = null, pairUid = null, stopOwn = null, stopShared = null;
const own = new Map(), shared = new Map();
function emit(name, detail) { window.dispatchEvent(new CustomEvent(name, { detail })); }
function status(message, error = false) { emit("miapp:proyectos-estado", { uid: user?.uid || null, message, error }); }
function convert(snapshot) {
  const record = snapshot.data();
  return { ...(record.data || {}), id: snapshot.id, ownerUid: record.ownerUid,
    sharedWithUids: Array.isArray(record.sharedWithUids) ? record.sharedWithUids : [], pairId: record.pairId || null };
}
function publish() { if (user) emit("miapp:proyectos-datos", { uid: user.uid, projects: [...own.values(), ...shared.values()] }); }
function stopSharedQuery() { if (stopShared) { stopShared(); stopShared = null; } shared.clear(); }
function startOwnQuery() {
  if (stopOwn) { stopOwn(); stopOwn = null; } own.clear(); if (!user) return;
  const q = query(records, where("ownerUid", "==", user.uid), where("module", "==", "proyectos"));
  stopOwn = onSnapshot(q, snapshot => { own.clear(); snapshot.forEach(item => own.set(item.id, convert(item))); publish(); status("Proyectos sincronizados con tu cuenta."); }, error => {
    console.error("Sincronización de Proyectos:", error.code || error.message);
    status(error.code === "permission-denied" ? "Firebase bloqueó Proyectos. Revisa las reglas publicadas." : "No se pudieron actualizar los proyectos. Revisa tu conexión.", true);
  });
}
function startSharedQuery() {
  stopSharedQuery(); if (!user || !pair || pair.status !== "active") { publish(); emit("miapp:proyectos-vinculo", { uid: user?.uid || null, active: false }); return; }
  const partnerUid = pair.ownerUid === user.uid ? pair.inviteeUid : pair.ownerUid;
  const q = query(records, where("ownerUid", "==", partnerUid), where("sharedWithUids", "==", [user.uid]), where("pairId", "==", pair.id), where("module", "==", "proyectos"));
  emit("miapp:proyectos-vinculo", { uid: user.uid, active: true });
  stopShared = onSnapshot(q, snapshot => { shared.clear(); snapshot.forEach(item => shared.set(item.id, convert(item))); publish(); status("Proyectos propios y compartidos sincronizados."); }, error => {
    console.error("Proyectos compartidos:", error.code || error.message);
    status(error.code === "permission-denied" ? "Firebase bloqueó los proyectos compartidos. Revisa las reglas publicadas." : "No se pudieron actualizar los proyectos compartidos.", true);
  });
}
window.addEventListener("miapp:vinculo-actualizado", event => {
  const detail = event.detail || {}; pairUid = detail.uid || null; pair = detail.vinculo?.status === "active" ? detail.vinculo : null;
  if (user && pairUid === user.uid) startSharedQuery();
  emit("miapp:proyectos-vinculo", { uid: user?.uid || null, active: Boolean(pair) });
});
function projectData(project) {
  const data = { ...project }; delete data.id; delete data.ownerUid; delete data.sharedWithUids; delete data.pairId; return data;
}
async function save(project, shareRequested = false) {
  if (!user) throw new Error("Inicia sesión para guardar este proyecto en tu cuenta.");
  const data = projectData(project), isCloud = Boolean(project.ownerUid && project.id);
  if (isCloud && project.ownerUid !== user.uid) {
    if (!project.sharedWithUids?.includes(user.uid)) throw new Error("Esta cuenta no tiene permiso para editar este proyecto.");
    await updateDoc(doc(db, "records", project.id), { data, updatedAt: serverTimestamp() }); return { ...project, ...data };
  }
  if (shareRequested && (!pair || pair.status !== "active")) throw new Error("Primero vincula las dos cuentas para compartir este proyecto.");
  const partnerUid = pair?.ownerUid === user.uid ? pair.inviteeUid : pair?.ownerUid;
  const sharedWithUids = shareRequested && partnerUid ? [partnerUid] : [], pairId = sharedWithUids.length ? pair.id : null;
  const id = isCloud ? project.id : doc(records).id, ref = doc(db, "records", id);
  if (isCloud) await updateDoc(ref, { data, sharedWithUids, pairId, updatedAt: serverTimestamp() });
  else await setDoc(ref, { ownerUid: user.uid, sharedWithUids, pairId, module: "proyectos", data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return { ...data, id, ownerUid: user.uid, sharedWithUids, pairId };
}
async function remove(project) {
  if (!user || !project?.id || project.ownerUid !== user.uid) throw new Error("Solo quien creó este proyecto puede eliminarlo.");
  await deleteDoc(doc(db, "records", project.id));
}
window.miappProyectosCloud = { guardar: save, eliminar: remove };
onAuthStateChanged(auth, nextUser => {
  if (stopOwn) { stopOwn(); stopOwn = null; } stopSharedQuery(); own.clear(); shared.clear(); user = nextUser || null;
  if (!user) { pair = null; pairUid = null; emit("miapp:proyectos-usuario", { uid: null }); emit("miapp:proyectos-datos", { uid: null, projects: [] }); emit("miapp:proyectos-vinculo", { uid: null, active: false }); status("Proyectos se guarda en este dispositivo. Inicia sesión para sincronizarlos."); return; }
  emit("miapp:proyectos-usuario", { uid: user.uid }); startOwnQuery();
  if (pairUid === user.uid) startSharedQuery(); else emit("miapp:proyectos-vinculo", { uid: user.uid, active: false });
});
