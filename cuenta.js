import { app } from "./firebase-config.js";
import {
    createUserWithEmailAndPassword,
    getAuth,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const auth = getAuth(app);

const estadoCuenta = document.getElementById("estadoCuenta");
const correoSesion = document.getElementById("correoSesion");
const sesionActiva = document.getElementById("sesionActiva");
const formulariosCuenta = document.getElementById("formulariosCuenta");
const mensajeCuenta = document.getElementById("mensajeCuenta");
const formCrearCuenta = document.getElementById("formCrearCuenta");
const formIniciarSesion = document.getElementById("formIniciarSesion");

function mostrarErrorCuenta(error) {
    const mensajes = {
        "auth/email-already-in-use": "Ese correo ya tiene una cuenta. Prueba iniciar sesión.",
        "auth/invalid-email": "Revisa el formato del correo electrónico.",
        "auth/weak-password": "La contraseña es demasiado corta. Usa al menos 6 caracteres.",
        "auth/invalid-credential": "El correo o la contraseña no coinciden.",
        "auth/user-not-found": "No encontramos una cuenta con ese correo.",
        "auth/wrong-password": "La contraseña no coincide.",
        "auth/too-many-requests": "Hubo varios intentos. Espera un momento antes de volver a probar.",
        "auth/network-request-failed": "No se pudo conectar. Revisa tu conexión a internet.",
        "auth/operation-not-allowed": "Falta activar el acceso por correo y contraseña en Firebase Authentication."
    };

    console.error("Firebase Authentication:", error.code || error.message);
    return mensajes[error.code] || "No se pudo completar la operación. Inténtalo de nuevo más tarde.";
}

formCrearCuenta.addEventListener("submit", async function(event) {
    event.preventDefault();

    const correo = formCrearCuenta.elements.correo.value.trim();
    const contrasena = formCrearCuenta.elements.contrasena.value;
    const boton = formCrearCuenta.querySelector('button[type="submit"]');

    boton.disabled = true;
    mensajeCuenta.textContent = "Creando tu cuenta...";

    try {
        await createUserWithEmailAndPassword(auth, correo, contrasena);
        formCrearCuenta.reset();
        mensajeCuenta.textContent = "Cuenta creada. Todos los módulos se conectan con esta cuenta y sus registros privados solo son visibles para ti. Puedes compartir elementos individuales de Entrenamiento, Proyectos, Despensa, Tareas, Fechas especiales, Pagos e Izel.";
    } catch (error) {
        mensajeCuenta.textContent = mostrarErrorCuenta(error);
    } finally {
        boton.disabled = false;
    }
});

formIniciarSesion.addEventListener("submit", async function(event) {
    event.preventDefault();

    const correo = formIniciarSesion.elements.correo.value.trim();
    const contrasena = formIniciarSesion.elements.contrasena.value;
    const boton = formIniciarSesion.querySelector('button[type="submit"]');

    boton.disabled = true;
    mensajeCuenta.textContent = "Iniciando sesión...";

    try {
        await signInWithEmailAndPassword(auth, correo, contrasena);
        formIniciarSesion.reset();
        mensajeCuenta.textContent = "Sesión iniciada. Todos los módulos se están conectando con esta cuenta. Tus registros privados solo son visibles para ti; puedes compartir elementos individuales de Entrenamiento, Proyectos, Despensa, Tareas, Fechas especiales, Pagos e Izel.";
    } catch (error) {
        mensajeCuenta.textContent = mostrarErrorCuenta(error);
    } finally {
        boton.disabled = false;
    }
});

document.getElementById("recuperarContrasena").addEventListener("click", async function() {
    const correo = formIniciarSesion.elements.correo.value.trim();

    if (!correo) {
        mensajeCuenta.textContent = "Escribe tu correo en el campo de inicio de sesión y vuelve a elegir esta opción.";
        return;
    }

    try {
        await sendPasswordResetEmail(auth, correo);
        mensajeCuenta.textContent = "Si existe una cuenta con ese correo, Firebase enviará instrucciones para cambiar la contraseña.";
    } catch (error) {
        mensajeCuenta.textContent = mostrarErrorCuenta(error);
    }
});

document.getElementById("cerrarSesion").addEventListener("click", async function() {
    try {
        await signOut(auth);
        mensajeCuenta.textContent = "Sesión cerrada. Tus datos locales permanecen en este dispositivo.";
    } catch (error) {
        mensajeCuenta.textContent = mostrarErrorCuenta(error);
    }
});

onAuthStateChanged(auth, function(user) {
    window.miappSesionUid = user?.uid || null;
    window.dispatchEvent(new CustomEvent("miapp:sesion-actualizada", { detail: { authenticated: Boolean(user), uid: window.miappSesionUid } }));
    if (user) {
        estadoCuenta.textContent = "Sesión activa. Todos los módulos se conectan con esta cuenta; puedes compartir elementos individuales de Entrenamiento, Proyectos, Despensa, Tareas, Fechas especiales, Pagos e Izel.";
        correoSesion.textContent = "Sesión iniciada como: " + (user.email || "cuenta sin correo visible");
        sesionActiva.hidden = false;
        formulariosCuenta.hidden = true;
    } else {
        estadoCuenta.textContent = "No has iniciado sesión. Puedes seguir usando los módulos con los datos locales de este dispositivo.";
        correoSesion.textContent = "";
        sesionActiva.hidden = true;
        formulariosCuenta.hidden = false;
    }
});
