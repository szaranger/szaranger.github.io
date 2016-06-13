'use strict';

var scope = {
  scope: './'
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js', scope
  ).then( function(serviceWorker) {
    printStatus('successful');
  }).catch(function(error) {
    printStatus(error);
  });
} else {
  printStatus('unavailable');
}

function printStatus(status) {
  document.getElementById('status').innerHTML = status;
}
