self.addEventListener("install", function(event) {
    console.log("MiAppPersonal: Service Worker instalado");
});

self.addEventListener("activate", function(event) {
    console.log("MiAppPersonal: Service Worker activado");
});