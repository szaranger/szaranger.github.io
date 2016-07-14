'use strict';

var scope = {
  scope: './'
};

var proxy = 'https://crossorigin.me/';
var pokedex = proxy + 'http://pokeapi.co/api/v1/pokedex/1/';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(
    'service-worker.js',
    scope
  ).then( function(serviceWorker) {
    fetchPokemonList();
    printStatus('successful');
  }).catch(function(error) {
    printStatus(error);
  });
} else {
  printStatus('unavailable');
}

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


function fetchPokemonList() {
  fetch(pokedex)
    .then(function(response) {
      return response.json();
    })
    .then(function(info) {
      populatePokemonList(info.pokemon);

      if (window.parent !== window) {
        window.parent.document.body
          .dispatchEvent(new CustomEvent('iframeresize'));
      }
    });
}

function populatePokemonList(pokemonList) {
  var el = document.querySelector('#pokemon');
  var buffer = pokemonList.map(function(pokemon) {
    var tokens = pokemon.resource_uri.split('/');
    var id = tokens[tokens.length - 2];
    return '<li><a href="pokemon.html?id=' + id + '">' + pokemon.name +
           '</a></li>';
  });
  el.innerHTML = buffer.join('\n');
}
