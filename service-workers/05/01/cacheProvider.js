'use strict';

var CACHE_NAME = 'cache-from-zip',
  ROOT = 'index.html';

function cacheFileContents(reader) {
  return new Promise(function(fulfill, reject) {
    reader.getEntries(function(entries) {
      console.log('INSTALL: ', entries.length, 'files from ZIP');
      Promise.all(entries.map(cacheEntry)).then(fulfill, reject);
    });
  });
}

function cacheEntry(entry) {
  if (entry.directory) {
    return Promise.resolve();
  }

  return new Promise(function(fulfill, reject) {
    var blobWriter = new zip.BlobWriter();

    entry.getData(blobWriter, function(data) {
      return openCache().then(function(cache) {
        var location = getFileLocation(entry.filename);
        var response = new Response(data, { headers: {
          'Content-Type': getContentType(entry.filename)
        } });

        console.log('CACHE: Caching', location,
                    '(size:', entry.uncompressedSize, 'bytes)');

        if (entry.filename === ROOT) {
          cache.put(getFileLocation(), response.clone());
        }

        return cache.put(location, response);
      }).then(fulfill, reject);
    });
  });
}

function openCache() {
  if (!cachePromise) {
    cachePromise = caches.open(CACHE_NAME);
  }
  return cachePromise;
}
