'use strict';

var URL = 'https://localhost:3011/api/todos';

if (navigator.serviceWorker.controller) {
  loadTodos();
} else {
  navigator.serviceWorker.oncontrollerchange = function() {
    this.controller.onstatechange = function() {
      if (this.state === 'activated') {
        loadTodos();
      }
    };
  };
  navigator.serviceWorker.register('service-worker.js');
}

window.addEventListener('online', function() {
  loadTodos();
});

document.querySelector('#add-form').onsubmit = function(event) {
  var newTodo,
    priority,
    todo,
    headers = { 'content-type': 'application/json' };

  event.preventDefault();

  newTodo = document.querySelector('#new-todo').value.trim();
  if (!newTodo) {
    return;
  }

  priority = document.querySelector('#priority').value.trim()
                    || 'Minor';
  todo = { todo: newTodo, priority: priority };

  fetch(addSession(URL), {
    method: 'POST',
    body: JSON.stringify(todo),
    headers: headers,
  }).then(function(response) {
      if (response.status === 202) {
        return todo;
      }
      return response.json();
    }).then(function(addedTodo) {
      document.querySelector('#todos').appendChild(getRowFor(addedTodo));
    });
};

function loadTodos() {
  fetch(addSession(URL)).then(function(res) {
      return res.json();
    }).then(showTodos);
}

function showTodos(items) {
  var table = document.querySelector('#todos');

  table.innerHTML = '';
  for (var i = 0, len = items.length, todo; i < len; i++) {
    todo = items[i];
    table.appendChild(getRowFor(todo));
  }

  if (window.parent !== window) {
    window.parent.document.body.dispatchEvent(new CustomEvent('iframeresize'));
  }
}

function getRowFor(todo) {
  var tr = document.createElement('TR'),
    id = todo.id;

  tr.id = id;

  tr.appendChild(getCell(todo.todo));
  tr.appendChild(getCell(todo.priority));
  tr.appendChild(todo.isSticky ? getCell('') : getDeleteButton(id));

  return tr;
}

function getCell(todo) {
  var td = document.createElement('TD');

  td.textContent = todo;
  return td;
}

function getDeleteButton(id) {
  var td = document.createElement('TD'),
    btn = document.createElement('BUTTON');

  btn.textContent = 'Delete';
  btn.onclick = function() {
    deleteTodo(id).then(function() {
      var tr = document.getElementById(id);
      tr.parentNode.removeChild(tr);
    });
  };

  td.appendChild(btn);
  return td;
}

function deleteTodo(id) {
  return fetch(addSession(URL + '/' + id), { method: 'DELETE' });
}

function addSession(url) {
  return url + '?session=' + getSession();
}

function getSession() {
  var session = localStorage.getItem('session');
  if (!session) {
    session = '' + Date.now() + '-' + Math.random();
    localStorage.setItem('session', session);
  }
  return session;
}
