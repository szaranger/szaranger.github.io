var REQUEST_TIMEOUT_STATUS = 408,
 DELAY = 3000;


function timeout(delay) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(new Response('', {
                status: REQUEST_TIMEOUT_STATUS,
                statusText: 'Request timed out.'
            }));
        }, delay);
    });
}

self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    if (self.clients && clients.claim) {
        clients.claim();
    }
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
      Promise.race(
        [
          timeout(DELAY),
          fetch(event.request)
        ]
      )
    );
});
