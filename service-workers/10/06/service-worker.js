'use strict';

var cacheName= 'dependencies-cache';

self.oninstall = function(event) {
  event.waitUntil(self.skipWaiting());
};

self.onactivate = function(event) {
  event.waitUntil(self.clients.claim());
};

self.onfetch = function(event) {
  if (event.request.method === 'GET') {
    event.respondWith(getResponse(event.request));
  } else {
    event.respondWith(cacheResponseInRenderStore(event.request).then(function() {
      return new Response({ status: 202 });
    }));
  }
};

function getResponse(request) {
  return self.caches.open('render-store').then(function(cache) {
    return cache.match(request).then(function(match) {
      return match || fetch(request);
    });
  });
}

function cacheResponseInRenderStore(request) {
  return request.text().then(function(contents) {
    var headers = { 'Content-Type': 'text/html' };
    var response = new Response(contents, { headers: headers });

    return self.caches.open('render-store').then(function(cache) {
      return cache.put(request.referrer, response);
    });
  });
}
