// Service worker mínimo, solo para notificaciones push (Plan Profesional de
// Cotizaciones) -- no cachea nada, no intercepta fetch, no es un PWA
// offline-first. Un único trabajo: mostrar la notificación que llega.

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
