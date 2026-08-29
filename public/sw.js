// Service worker mínimo, solo para notificaciones push (Plan Profesional de
// Cotizaciones) -- no cachea nada, no intercepta fetch, no es un PWA
// offline-first. Un único trabajo: mostrar la notificación que llega.
//
// skipWaiting + clients.claim: sin esto, un teléfono con la app "agregada a
// pantalla de inicio" puede seguir corriendo una versión vieja de este
// archivo durante días -- los navegadores no reemplazan un service worker
// activo mientras haya alguna pestaña/instancia abierta, y una PWA
// instalada rara vez se cierra del todo. Esto no cambia qué contenido ve la
// persona (este worker nunca cacheó HTML, en ninguna versión), pero sí
// asegura que la versión más nueva de este archivo tome control cuanto antes.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "El Mexa Chamba", body: "Tenés una solicitud nueva", url: "/servicios/solicitudes" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // payload no era JSON válido -- se usa el mensaje genérico de arriba.
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
