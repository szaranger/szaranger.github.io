var proxy = 'https://crossorigin.me/';

var startTime = performance.now();
var interpolationTime = 0;
var fetchingModelTime = 0;

if (document.documentElement.dataset.cached) {
  logTime();
} else {
  var pokemonId = window.location.search.split('=')[1];
  
  getPokemon(pokemonId).then(fillCharSheet).then(logTime).then(cache);
}

function getPokemon(id) {
  var fetchingModelStart = getStartTime();

  return fetch(getURL(id)).then(function(response) {
    fetchingModelTime = getStartTime() - fetchingModelStart;
    return response.json();
  });
}

function getStartTime() {
  return performance.now();
}

function getURL(id) {
  return proxy + 'http://pokeapi.co/api/v1/pokemon/' + id + '/?_b=' + Date.now();
}

function fillCharSheet(pokemon) {
  var element = document.querySelector('body');
  element.innerHTML = interpolateTemplate(element.innerHTML, pokemon);

  document.querySelector('img').onload = function() {
    if (window.parent === window) {
      return;
    }
    window.parent.document.body.dispatchEvent(new CustomEvent('iframeresize'));
  };
}

function logTime() {
  var loadingTimeLabel = document.getElementById('loading-time-label');
  var interpolationTimeLabel =
    document.querySelector('#interpolation-time-label');
  var fetchingModelTimeLabel = document.querySelector('#fetching-time-label');
  loadingTimeLabel.textContent = (performance.now() - startTime) + ' ms';
  interpolationTimeLabel.textContent = interpolationTime + ' ms';
  fetchingModelTimeLabel.textContent = fetchingModelTime + ' ms';
}

function cache() {
  document.documentElement.dataset.cached = true;
  var data = document.documentElement.outerHTML;
  fetch('./render-store/', { method: 'PUT', body: data }).then(function() {
    console.log('Page cached');
  });
}

function interpolateTemplate(template, pokemon) {
  var interpolationStart = performance.now();
  var result = template.replace(/{{(\w+)}}/g, function(match, field) {
    return pokemon[field];
  });
  interpolationTime = performance.now() - interpolationStart;
  return result;
}
