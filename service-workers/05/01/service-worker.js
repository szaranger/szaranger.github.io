var version = 1;
var cacheName = 'responses-offline' + version;

self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    if (self.clients && clients.claim) {
        clients.claim();
    }
});

self.addEventListener('fetch', function(evt) {
  evt.respondWith(openCache().then(function(cache) {
    var request = evt.request;

    return cache.match(request).then(function(res) {
      return res || fetch(request);
    });
  }));
});
