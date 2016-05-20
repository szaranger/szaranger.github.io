importScripts('circuit-breaker.js');

var version = 1,
  circuitBreakers = {},
  opt = {
      errorThreshold: 50,
      timeoutDuration: 2000,
      volumeThrehold: 2,
      windowDuraion: 1000
  };

self.addEventListener('install', function(evt) {
    self.skipWaiting();
});

self.addEventListener('activate', function(evt) {
    if (self.clients && clients.claim) {
        clients.claim();
    }
});

CB.prototype.fetch = function(request) {
    var unavailableRes = Response.error();

    return new Promise(function(resolve, reject) {
        this.run(function(success, fail) {
            fetch(request).then(function(res) {
                if(res.status < 400) {
                    success();
                    console.log('FETCH: successful');
                } else {
                    fail();
                    console.log('FETCH: failed');
                }
                resolve(res);
            }).catch(function(err) {
                fail();
                reject(unavailableRes);
                console.log('FETCH: unavilable');
            });
        }, function() {
            resolve(unavailableRes);
        });
    }.bind(this));
};

self.addEventListener('fetch', function(evt) {
    var url = evt.request.url;

    if(!circuitBreakers[url]) {
        circuitBreakers[url] = new CB(opt);
    }

    evt.respondWith(circuitBreakers[url].fetch(evt.request));
});
