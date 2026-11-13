/* Órbita Kanban — funciona sem internet: tenta a rede e guarda cópia; sem rede, usa a cópia */
const C = "orbita-v28";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(["./", "./orbita-kanban.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"])).catch(() => {})); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k !== "orbita-fonts").map(k => caches.delete(k)))).then(() => clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const h = new URL(e.request.url).hostname;
  if (h === "fonts.googleapis.com" || h === "fonts.gstatic.com") { /* fontes: usa a cópia guardada e atualiza em segundo plano (funciona offline) */
    e.respondWith(caches.open("orbita-fonts").then(c => c.match(e.request).then(hit => { const net = fetch(e.request).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(e.request, r.clone()); return r; }).catch(() => hit); return hit || net; })));
    return;
  }
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then(r => { if (r.ok && new URL(e.request.url).origin === location.origin) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./orbita-kanban.html"))));
});
