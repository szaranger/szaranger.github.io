var helloFetchHandler = function(event) {
  console.log('DEBUG: Inside the /hello handler.');
  if (event.request.url.indexOf('/hello') > 0) {
    event.respondWith(new Response('Fetch handler for /hello'));
  }
};

var helloWorldFetchHandler = function(event) {
  console.log('DEBUG: Inside the /hello/world handler.');
  if (event.request.url.endsWith('/hello/world')) {
    event.respondWith(new Response('Fetch handler for /hello/world'));
  }
};

var fetchHandlers = [helloWorldFetchHandler, helloFetchHandler];

fetchHandlers.forEach(function(fetchHandler) {
  self.addEventListener('fetch', fetchHandler);
});
