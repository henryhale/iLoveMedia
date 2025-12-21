const CACHE_NAME = 'browserbox-v1';
const ASSETS = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@19.2.3',
  'https://esm.sh/react-dom@19.2.3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache dynamic modules from esm.sh for offline use
        if (event.request.url.includes('esm.sh')) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        }
        return fetchResponse;
      });
    })
  );
});