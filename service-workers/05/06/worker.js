'use strict';

var worker = new ServiceWorkerWare(),
  root = (function() {
    var tokens = (self.location + '').split('/');
    tokens[tokens.length - 1] = '';
    return tokens.join('/');
  })();

worker.get(root + 'api/todos', function(req, res) {
  return new Response(JSON.stringify(todos.filter(function(item) {
    return item !== null;
  })));
});

worker.delete(root + 'api/todos/:id', function(req, res) {
  var id = parseInt(req.parameters.id, 10) - 1;
  if (!todos[id].isSticky) {
    todos[id] = null;
  }
  return new Response({ status: 204 });
});

worker.post(root + 'api/todos', function(req, res) {
  return req.json().then(function(quote) {
    quote.id = todos.length + 1;
    todos.push(quote);
    return new Response(JSON.stringify(quote), { status: 201 });
  });
});

worker.init();
