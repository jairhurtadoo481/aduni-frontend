// Service worker de la intranet ADUNI+: notificaciones push y funcionamiento como app instalable.
const CACHE = "aduni-v1";
const BASICOS = ["/logo-aduni.png", "/icono-192.png", "/icono-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASICOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Red primero para páginas; si no hay conexión, muestra la última versión guardada.
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== self.location.origin) return;
  if (r.mode === "navigate") {
    e.respondWith(
      fetch(r).then((res) => {
        const copia = res.clone();
        caches.open(CACHE).then((c) => c.put(r, copia));
        return res;
      }).catch(() => caches.match(r).then((m) => m || caches.match("/intranet")))
    );
  }
});

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data.json(); } catch { d = { titulo: "ADUNI+", mensaje: e.data?.text() || "" }; }
  e.waitUntil(self.registration.showNotification(d.titulo || "Colegio ADUNI+", {
    body: d.mensaje || "",
    icon: "/icono-192.png",
    badge: "/icono-192.png",
    data: { enlace: d.enlace || "/intranet" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.enlace || "/intranet";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
    for (const v of ventanas) if ("focus" in v) { v.navigate(url); return v.focus(); }
    return self.clients.openWindow(url);
  }));
});
