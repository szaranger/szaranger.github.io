'use strict';

var VERSION = 'v1';

self.addEventListener('install', function(evt) {
  console.log('SERVICE_WORKER: Installed version', VERSION);
  evt.waitUntil(
    fetch('./picture-cached.jpg').then(function(response) {
      return caches.open(VERSION).then(function(cache) {
        console.log('SERVICE_WORKER: Cached picture.jpg for', VERSION);
        return cache.put('picture.jpg', response);
      });
    }).then(function() {
      console.log('SERVICE_WORKER: Skip waiting on install');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('fetch', function(evt) {
  if (evt.request.url.includes('/picture.jpg')) {
    console.log('SERVICE_WORKER: Serving picture.jpg for', evt.request.url);
    evt.respondWith(
      caches.open(VERSION).then(function(cache) {
        return cache.match('picture.jpg').then(function(response) {
          if (!response) {
            console.error('SERVICE_WORKER: cache not found!');
          }
          return response;
        });
      })
    );
  }
  if (evt.request.url.includes('/version')) {
    evt.respondWith(new Response(VERSION, {
      headers: {
        'content-type': 'text/plain'
      }
    }));
  }
});
