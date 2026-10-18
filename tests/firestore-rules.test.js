import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, before, beforeEach, test } from "node:test";
import {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment
} from "@firebase/rules-unit-testing";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from "firebase/firestore";

const projectId = "demo-miapppersonal-rules";
let testEnvironment;

before(async function() {
    const rules = await readFile(new URL("../firestore.rules", import.meta.url), "utf8");
    testEnvironment = await initializeTestEnvironment({
        projectId,
        firestore: {
            host: "127.0.0.1",
            port: 8080,
            rules
        }
    });
});

beforeEach(async function() {
    await testEnvironment.clearFirestore();
});

after(async function() {
    await testEnvironment?.cleanup();
});

function signedIn(uid, email = `${uid}@example.test`) {
    return testEnvironment.authenticatedContext(uid, { email }).firestore();
}

function recordData(ownerUid, sharing = {}) {
    return {
        ownerUid,
        sharedWithUids: [],
        pairId: null,
        module: "agenda",
        data: { title: "Evento de prueba" },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...sharing
    };
}

async function createActivePair(pairId = "pair-a-b") {
    await testEnvironment.withSecurityRulesDisabled(async function(context) {
        await setDoc(doc(context.firestore(), "accountPairs", pairId), {
            ownerUid: "user-a",
            ownerEmail: "user-a@example.test",
            inviteeUid: "user-b",
            inviteeEmail: "user-b@example.test",
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
            acceptedAt: new Date()
        });
    });
}

test("una cuenta sin sesión no puede leer elementos", async function() {
    const anonymousDb = testEnvironment.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anonymousDb, "records", "private-a")));
});

test("la segunda cuenta acepta la invitación de la primera", async function() {
    const ownerDb = signedIn("user-a");
    const inviteeDb = signedIn("user-b");
    const inviteRef = doc(ownerDb, "accountPairs", "invite-a-to-b");

    await assertSucceeds(setDoc(inviteRef, {
        ownerUid: "user-a",
        ownerEmail: "user-a@example.test",
        inviteeUid: null,
        inviteeEmail: null,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        acceptedAt: null
    }));

    const inviteeRef = doc(inviteeDb, "accountPairs", "invite-a-to-b");
    const inviteSnapshot = await assertSucceeds(getDoc(inviteeRef));
    assert.equal(inviteSnapshot.data().status, "pending");

    await assertSucceeds(updateDoc(inviteeRef, {
        inviteeUid: "user-b",
        inviteeEmail: "user-b@example.test",
        status: "active",
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    }));

    await assertSucceeds(getDocs(query(
        collection(ownerDb, "accountPairs"),
        where("ownerUid", "==", "user-a")
    )));
    await assertSucceeds(getDocs(query(
        collection(inviteeDb, "accountPairs"),
        where("inviteeUid", "==", "user-b")
    )));

    await assertFails(getDocs(query(
        collection(signedIn("user-c"), "accountPairs"),
        where("ownerUid", "==", "user-a")
    )));
});

test("la invitación también puede iniciarla la segunda cuenta", async function() {
    const wifeDb = signedIn("user-b", "wife@example.test");
    const husbandDb = signedIn("user-a", "husband@example.test");
    const inviteRef = doc(wifeDb, "accountPairs", "invite-b-to-a");

    await assertSucceeds(setDoc(inviteRef, {
        ownerUid: "user-b",
        ownerEmail: "wife@example.test",
        inviteeUid: null,
        inviteeEmail: null,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        acceptedAt: null
    }));

    await assertSucceeds(updateDoc(doc(husbandDb, "accountPairs", "invite-b-to-a"), {
        inviteeUid: "user-a",
        inviteeEmail: "husband@example.test",
        status: "active",
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    }));
});

test("Agenda y Tareas pueden consultar solo sus registros propios o compartidos", async function() {
    await createActivePair();
    const ownerDb = signedIn("user-a");
    const partnerDb = signedIn("user-b");

    const fixtureRecords = [
        ["agenda-private-a", recordData("user-a", { module: "agenda" })],
        ["agenda-private-b", recordData("user-b", { module: "agenda" })],
        ["agenda-shared-a", recordData("user-a", {
            module: "agenda",
            sharedWithUids: ["user-b"],
            pairId: "pair-a-b"
        })],
        ["task-private-a", recordData("user-a", { module: "tareas" })],
        ["task-private-b", recordData("user-b", { module: "tareas" })],
        ["task-shared-a", recordData("user-a", {
            module: "tareas",
            sharedWithUids: ["user-b"],
            pairId: "pair-a-b"
        })]
    ];

    for (const [recordId, data] of fixtureRecords) {
        const recordOwnerDb = data.ownerUid === "user-a" ? ownerDb : partnerDb;
        await assertSucceeds(setDoc(doc(recordOwnerDb, "records", recordId), data));
    }

    for (const moduleName of ["agenda", "tareas"]) {
        const ownRecords = await assertSucceeds(getDocs(query(
            collection(ownerDb, "records"),
            where("ownerUid", "==", "user-a"),
            where("module", "==", moduleName)
        )));
        assert.equal(ownRecords.size, 2);

        const sharedRecords = await assertSucceeds(getDocs(query(
            collection(partnerDb, "records"),
            where("ownerUid", "==", "user-a"),
            where("sharedWithUids", "==", ["user-b"]),
            where("pairId", "==", "pair-a-b"),
            where("module", "==", moduleName)
        )));
        assert.equal(sharedRecords.size, 1);
    }

    await assertFails(getDocs(query(
        collection(partnerDb, "records"),
        where("module", "==", "agenda")
    )));
});
test("el elemento privado solo lo puede leer su propietario", async function() {
    const ownerDb = signedIn("user-a");
    const partnerDb = signedIn("user-b");
    const recordRef = doc(ownerDb, "records", "private-a");

    await assertSucceeds(setDoc(recordRef, recordData("user-a")));
    await assertSucceeds(getDoc(recordRef));
    await assertFails(getDoc(doc(partnerDb, "records", "private-a")));
});

test("la pareja activa puede leer y editar el elemento compartido", async function() {
    await createActivePair();
    const ownerDb = signedIn("user-a");
    const partnerDb = signedIn("user-b");
    const ownerRecord = doc(ownerDb, "records", "shared-a");
    const partnerRecord = doc(partnerDb, "records", "shared-a");

    await assertSucceeds(setDoc(ownerRecord, recordData("user-a", {
        sharedWithUids: ["user-b"],
        pairId: "pair-a-b"
    })));
    await assertSucceeds(getDoc(partnerRecord));
    await assertSucceeds(updateDoc(partnerRecord, {
        data: { title: "Editado por la otra cuenta" },
        updatedAt: serverTimestamp()
    }));

    await assertFails(updateDoc(partnerRecord, {
        sharedWithUids: [],
        pairId: null,
        updatedAt: serverTimestamp()
    }));
});

test("al revocar el vínculo, la pareja pierde acceso al elemento", async function() {
    await createActivePair();
    const ownerDb = signedIn("user-a");
    const partnerDb = signedIn("user-b");
    const recordRef = doc(ownerDb, "records", "shared-a");

    await assertSucceeds(setDoc(recordRef, recordData("user-a", {
        sharedWithUids: ["user-b"],
        pairId: "pair-a-b"
    })));
    await assertSucceeds(getDoc(doc(partnerDb, "records", "shared-a")));

    await assertSucceeds(updateDoc(doc(partnerDb, "accountPairs", "pair-a-b"), {
        status: "revoked",
        updatedAt: serverTimestamp()
    }));

    await assertFails(getDoc(doc(partnerDb, "records", "shared-a")));
});

test("los siete módulos acordados admiten registros privados y compartidos con edición por la pareja", async function() {
    await createActivePair();
    const ownerDb = signedIn("user-a");
    const partnerDb = signedIn("user-b");
    const modules = ["entrenamiento", "proyectos", "despensa", "tareas", "agenda", "pagos", "izel"];

    for (const moduleName of modules) {
        const privateId = `${moduleName}-private`;
        const privateRecord = recordData("user-a", { module: moduleName });
        await assertSucceeds(setDoc(doc(ownerDb, "records", privateId), privateRecord));
        await assertSucceeds(getDoc(doc(ownerDb, "records", privateId)));
        await assertFails(getDoc(doc(partnerDb, "records", privateId)));

        const sharedId = `${moduleName}-shared`;
        const sharedRecord = recordData("user-a", {
            module: moduleName,
            sharedWithUids: ["user-b"],
            pairId: "pair-a-b"
        });
        await assertSucceeds(setDoc(doc(ownerDb, "records", sharedId), sharedRecord));
        await assertSucceeds(getDoc(doc(partnerDb, "records", sharedId)));
        await assertSucceeds(updateDoc(doc(partnerDb, "records", sharedId), {
            data: { title: `Editado en ${moduleName}` },
            updatedAt: serverTimestamp()
        }));
        await assertFails(deleteDoc(doc(partnerDb, "records", sharedId)));
        await assertSucceeds(deleteDoc(doc(ownerDb, "records", sharedId)));
    }
});