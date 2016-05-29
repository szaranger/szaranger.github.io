var path = require('path');
var bodyParser = require('body-parser');
var swig = require('swig');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var https = require('https');
var fs = require('fs');

var privateKey  = fs.readFileSync('/private/etc/apache2/localhost-key.pem', 'utf8');
var certificate = fs.readFileSync('/private/etc/apache2/localhost-cert.pem', 'utf8');
var credentials = { key: privateKey, cert: certificate };
var httpsServer = https.createServer(credentials, app);

var sessions = {};
var port = 3011;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json());

var requestsLog = [];

var todos = [
  {
    todo: 'Buy milk',
    priority: 'Minor'
  },
  {
    todo: 'Refill car',
    priority: 'Medium'
  },
  {
    todo: 'Learn server worker',
    priority: 'Major'
  }
].map(function(todo, index) {
  todo.id = index + 1;
  todo.isSticky = true;

  return todo;
});


var report = swig.compileFile(path.join(__dirname, './report.html'));

app.get('/', function (req, res) {
  res.send('Hello service worker!');
});

app.get('/report', function(req, res) {
  var stats = getLogSummary();
  var buffer = report({ stats: stats });
  res.send(buffer);
});

app.post('/report/logs', function(req, res) {
  var logEntry = logRequest(req.body);
  res.status(201).json(logEntry);
});

app.get('/api/todos', function(req, res) {
  res.json(todos.filter(function(item) {
    return item !== null;
  }));
});

app.delete('/api/todos/:id', function(req, res) {
  var id = parseInt(req.params.id, 10) - 1;
  if (!todos[id].isSticky) {
    todos[id] = null;
  }
  res.sendStatus(204);
});

app.post('/api/todos', function(req, res) {
  var todo = req.body;
  todo.id = todos.length + 1;
  todos.push(todo);
  res.status(201).json(todo);
});

httpsServer.listen(port, function () {
  console.log('App listening on port ' + port);
});

function logRequest(request) {
  request.id = requestsLog.length + 1;
  requestsLog.push(request);
  return request;
}

function getLogSummary() {
  var aggr = requestsLog.reduce(function(subSummary, entry) {
    if (!(entry.url in subSummary)) {
      subSummary[entry.url] = {
        url: entry.url,
        GET: 0,
        POST: 0,
        DELETE: 0,
      };
    }
    subSummary[entry.url][entry.method]++;
    return subSummary;
  }, {});

  return Object.keys(aggr).map(function(url) {
    return aggr[url];
  });
}
