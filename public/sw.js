// Service worker mínimo. La app es esencialmente dinámica (sesión, chat en
// vivo, formularios), así que no cachea nada propio -- deja pasar todas las
// peticiones a la red tal cual. Existe solo para cumplir el criterio de
// instalabilidad de Chrome/Android (necesario para que "Agregar a pantalla
// de inicio" instale la app en modo standalone en vez de abrir un simple
// acceso directo al navegador, y para empaquetarla como TWA en Play Store).
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
