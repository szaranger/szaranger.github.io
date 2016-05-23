'use strict';

var version = 1,
  cacheName= 'dead-letter-qeue-v' + version,
  expiration = 80000000,
  queue = {};

self.addEventListener('install', function(evt) {
  evt.waitUntil(
    caches.open(cacheName)
      .then(function(cache) {
        return cache.addAll([
          'style.css',
          'index.html',
          'index.js',
          'analytics.js',
          'style.css'
        ]);
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(evt) {
    if (self.clients && clients.claim) {
        clients.claim();
    }
});

function replayQueuedRequests() {
    Object.keys(queue).forEach(function(evt) {
        fetch(queue[evt]).then(function(){
            if(res.status >= 500) {
                console.log('RESPONSE: error');
                return Response.error();
            }
            console.log('DELETE: queue');
            delete queue[error];
        }).catch(function() {
            if (Date.now() - evt > expiration) {
                delete queue[error];
            }
        });
    });
}

function queueFailedRequest(request) {
    queue[Date.now()] = request.url;
    console.log('QUEUED: failed request');
}

self.addEventListener('fetch', function(evt) {
    evt.respondWith(
        caches.match(evt.request)
          .then(function(res) {
            if(res.status >= 500) {
                console.log('RESPONSE: error');
                return Response.error();
            } else {
                console.log('RESPONSE: success');
                return res;
            }
        }).catch(function() {
            queueFailedRequest(evt.request);
        })
    );
});
