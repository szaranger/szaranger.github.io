'use strict';

var URL = 'https://localhost:3011/report/logs';

self.oninstall = function(evt) {
  evt.waitUntil(self.skipWaiting());
};

self.onactivate = function(evt) {
  evt.waitUntil(self.clients.claim());
};

self.onfetch = function(evt) {
  evt.respondWith(
    logRequest(evt.request).then(fetch)
  );
};

function logRequest(req) {
  var returnRequest = function() {
    return req;
  };

  var data = {
    method: req.method,
    url: req.url
  };

  return fetch(URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'content-type': 'application/json' }
  }).then(returnRequest, returnRequest);
}
