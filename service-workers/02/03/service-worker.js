var version = 1;
var cacheName = 'static-' + version;

self.addEventListener('install', installHandler);
self.addEventListener('fetch', fetchHandler);

function installHandler(event) {
    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll([
              'index.html',
              'style-2.css'
            ]);
        })
    );
}

function fetchHandler(event) {
  if (/index/.test(event.request.url) || /style-2/.test(event.request.url)) {
    event.respondWith(caches.match(event.request));
  }
}
