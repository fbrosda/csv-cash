const resources = [
    '/', 'index.php',
    'overview.php',
    'style.css',
    'main.js',
    'favicon.png',
    'manifest.json'
];

self.addEventListener("install", (event) => {
  event.waitUntil(addResourcesToCache(resources));
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetchWithCach(event.request));
});

async function addResourcesToCache(resources) {
  const cache = await caches.open("resources-v1");
  await cache.addAll(resources);
}

async function fetchWithCach(request) {
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }
    return fetch(request);
}
