'use strict';

var scope = {
  scope: './'
};

var endpoint;
var baseURL = 'https://localhost:3012/';

navigator.serviceWorker.register('service-worker.js')
.then(function(registration) {
  return registration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription;
    }

    return registration.pushManager.subscribe({ userVisibleOnly: true });
  });
}).then(function(subscription) {
  endpoint = subscription.endpoint;

  fetch(baseURL + 'register', {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
    }),
  });
});

function printStatus(status) {
  document.querySelector('#status').innerHTML = status;
}

document.querySelector('#resetButton').addEventListener('click',
  function() {
    navigator.serviceWorker.getRegistration().then(function(registration) {
      registration.unregister();
      window.location.reload();
    });
  }
);

document.querySelector('#send').onclick = function() {
  fetch(baseURL + 'sendNotification?endpoint=' + endpoint, {
      method: 'post',
  });
};

function subscribe() {
  navigator.serviceWorker.ready.then(function(registration) {
    return registration.pushManager.subscribe({ userVisibleOnly: true });
  }).then(function(subscription) {
    console.log('Subscribed', subscription.endpoint);
    return fetch('register', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint
      })
    });
  }).then(setUnsubscribeButton);
}

function unsubscribe() {
  getSubscription().then(function(subscription) {
    return subscription.unsubscribe()
      .then(function() {
        console.log('Unsubscribed', subscription.endpoint);
        return fetch('unregister', {
          method: 'post',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint
          })
        });
      });
  }).then(setSubscribeButton);
}

function setSubscribeButton() {
  subscription-button.onclick = subscribe;
  subscription-button.textContent = 'Subscribe!';
}

function setUnsubscribeButton() {
  subscription-button.onclick = unsubscribe;
  subscription-button.textContent = 'Unsubscribe!';
}
