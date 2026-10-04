
importScripts(
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "AIzaSyArWT1QVXjTpdjlAiku0N6dSuHw8UdkKY",
    authDomain: "miapppersonal-5068d.firebaseapp.com",
    projectId: "miapppersonal-5068d",
    storageBucket: "miapppersonal-5068d.firebasestorage.app",
    messagingSenderId: "757662369096",
    appId: "1:757662369096:web:fe82ef0584eba8ed029f7d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {

    console.log(
        "MiAppPersonal: mensaje recibido en segundo plano",
        payload
    );

});

self.addEventListener("install", function(event) {
    console.log("MiAppPersonal: Service Worker instalado");
    self.skipWaiting();
});

self.addEventListener("activate", function(event) {
    console.log("MiAppPersonal: Service Worker activado");
    event.waitUntil(self.clients.claim());
});

self.addEventListener("message", function(event) {

    if (event.data === "PRUEBA_NOTIFICACION") {

        self.registration.showNotification(
            "🔔 MiAppPersonal",
            {
                body: "¡Las notificaciones están funcionando!",
                icon: "Icono.png",
                badge: "Icono.png"
            }
        );

    }

});
