/* Entreno — service worker.
   Guarda la app en el móvil para que funcione sin cobertura.
   Si cambias los archivos, sube el número de CACHE. */
var CACHE = 'entreno-v4';
var CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];

/* cache:'reload' salta la caché HTTP del navegador: si no, al instalar una versión
   nueva se podía guardar el index viejo que el navegador aún tenía fresco. */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) {
        return Promise.all(CORE.map(function (u) {
          return fetch(new Request(u, { cache: 'reload' }))
            .then(function (res) { if (res && res.ok) return c.put(u, res); })
            .catch(function () {});
        }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function esDocumento(req) {
  if (req.mode === 'navigate') return true;
  if (req.destination === 'document') return true;
  var p = new URL(req.url).pathname;
  return p.charAt(p.length - 1) === '/' || /\/index\.html$/.test(p);
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).protocol.indexOf('http') !== 0) return;

  /* La página, primero de la red.
     Antes servía lo guardado y refrescaba por detrás, así que después de publicar
     un cambio la primera visita seguía viendo el entreno viejo y hacía falta abrir
     dos veces. Con red siempre ves lo último; sin red, lo guardado. */
  if (esDocumento(req)) {
    e.respondWith(
      fetch(new Request(req.url, { cache: 'no-store' }))
        .then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put('./index.html', copy); }).catch(function () {});
          }
          return res;
        })
        .catch(function () {
          return caches.match(req).then(function (hit) {
            return hit || caches.match('./index.html');
          });
        })
    );
    return;
  }

  /* El resto (iconos, manifiesto, fuentes) casi nunca cambia:
     se sirve al instante desde la caché y se refresca por detrás. */
  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
