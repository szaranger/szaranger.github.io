self.addEventListener('fetch', function(event) {
  console.log('Handling fetch event for', event.request.url);
  var requestUrl = new URL(event.request.url);

  if (requestUrl.pathname === '/urlshortener/v1/url' &&
      event.request.headers.has('X-Mock-Response')) {

    var responseBody = {
      kind: 'urlshortener#url',
      id: 'http://goo.gl/IKyjuU',
      longUrl: 'https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html'
    };

    var responseInit = {

      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        'X-Mock-Response': 'yes'
      }
    };

    var mockResponse = new Response(JSON.stringify(responseBody), responseInit);

    console.log('Responding with a mock response body:', responseBody);
    event.respondWith(mockResponse);
  }
});
