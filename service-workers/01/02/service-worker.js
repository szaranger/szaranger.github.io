self.addEventListener('install', function(e) {
  console.log('Install Event:', e);
});

self.addEventListener('wait', function(e) {
  console.log('Wait Event:', e);
});

self.addEventListener('activate', function(e) {
  console.log('Activate Event:', e);
});
