'use strict';

self.addEventListener('install', function(evt) {
  evt.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(evt) {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(evt) {
    evt.respondWith(
      fetch(evt.request).then(function(res) {
        if (!res.ok) {
          throw Error('response status ' + res.status);
        }

        return res;
      }).catch(function(err) {
        console.warn('RESPONSE: Error in constructing a fallback response - ', err);

        var fallbackRes = {
          brands: [
            {
              name: 'Fallback Brand 1'
            },
            {
              name: 'Fallback Brand 1'
            },
            {
              name: 'Fallback Brand 1'
            }
          ]
        };

        return new Response(JSON.stringify(fallbackRes), {
          headers: {'Content-Type': 'application/json'}
        });
      })
    );
});
