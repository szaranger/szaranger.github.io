importScripts('circuit-breaker.js');

var version = 1;

self.addEventListener('install', function(event) {
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    if (self.clients && clients.claim) {
        clients.claim();
    }
});

CB.prototype.fetch = function(request) {
    var unavailableResponse = Response.error();

    return new Promise(function(resolve, reject) {
        this.run(function(success, fail) {
            fetch(request).then(function(response) {
                if(response.status < 400) {
                    success();
                    console.log('FETCH: successful');
                } else {
                    fail();
                    console.log('FETCH: failed');
                }
                resolve(response);
            })
            .catch(function(err) {
                fail();
                reject(unavailableResponse);
                console.log('FETCH: unavilable');
            });
        }, function() {
            resolve(unavailableResponse);
        });
    }.bind(this));
};

var circuitBreakers = {};
var options = {
    windowDuraion: 1000,
    timeoutDuration: 3000,
    errorThreshold: 50,
    volumeThrehold: 2
};

self.addEventListener('fetch', function(event) {
    var url = event.request.url;

    if(!circuitBreakers[url]) {
        circuitBreakers[url] = new CB(options);
    }

    event.respondWith(circuitBreakers[url].fetch(event.request));
});
