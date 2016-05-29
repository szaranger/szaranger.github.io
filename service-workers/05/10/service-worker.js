'use strict';

importScripts('./vendor/ServiceWorkerWare.js');
importScripts('./vendor/localforage.js');

var root = (function() {
  var tokens = (self.location + '').split('/');
  tokens[tokens.length - 1] = '';
  return tokens.join('/');
})();

var worker = new ServiceWorkerWare();

function tryOrFallback(fakeResponse) {

  return function(req, res) {
      if (!navigator.onLine) {
      console.log('No network availability, enqueuing');
      return enqueue(req).then(function() {
        return fakeResponse.clone();
      });
    }

    console.log('Network available! Flushing queue.');
    return flushQueue().then(function() {
      return fetch(req);
    });
  };
}

worker.get(root + 'api/todos?*', tryOrFallback(new Response(
  JSON.stringify([{
    text: 'You are offline and I know it well.',
    author: 'The Service Worker Cookbook',
    id: 1,
    isSticky: true
  }]),
  { headers: { 'Content-Type': 'application/json' } }
)));

worker.delete(root + 'api/todos/:id?*', tryOrFallback(new Response({
  status: 204
})));

worker.post(root + 'api/todos?*', tryOrFallback(new Response(null, {
  status: 202
})));

worker.init();

function enqueue(request) {
  return serialize(request).then(function(serialized) {
    localforage.getItem('queue').then(function(queue) {
      queue = queue || [];
      queue.push(serialized);
      return localforage.setItem('queue', queue).then(function() {
        console.log(serialized.method, serialized.url, 'enqueued!');
      });
    });
  });
}

function flushQueue() {

  return localforage.getItem('queue').then(function(queue) {
    queue = queue || [];

    if (!queue.length) {
      return Promise.resolve();
    }

    console.log('Sending ', queue.length, ' requests...');
    return sendInOrder(queue).then(function() {
      return localforage.setItem('queue', []);
    });
  });
}

function sendInOrder(requests) {
  var sending = requests.reduce(function(prevPromise, serialized) {
    console.log('Sending', serialized.method, serialized.url);
    return prevPromise.then(function() {
      return deserialize(serialized).then(function(request) {
        return fetch(request);
      });
    });
  }, Promise.resolve());
  return sending;
}

function serialize(request) {
  var headers = {};

  for (var entry of request.headers.entries()) {
    headers[entry[0]] = entry[1];
  }
  var serialized = {
    url: request.url,
    headers: headers,
    method: request.method,
    mode: request.mode,
    credentials: request.credentials,
    cache: request.cache,
    redirect: request.redirect,
    referrer: request.referrer
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return request.clone().text().then(function(body) {
      serialized.body = body;
      return Promise.resolve(serialized);
    });
  }
  return Promise.resolve(serialized);
}

function deserialize(data) {
  return Promise.resolve(new Request(data.url, data));
}
