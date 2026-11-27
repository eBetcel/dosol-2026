// Rede primeiro, para a programação não ficar velha; cache só quando a rede falha.
const CACHE = 'roteiro-dosol-v1';
const FILES = [
  './', 'index.html',
  'css/theme.css', 'css/app.css',
  'js/app.js', 'js/data.js', 'js/schedule.js', 'js/storage.js', 'js/ui.js', 'js/export-image.js', 'js/theme.js',
  'assets/borda.svg', 'assets/rosa.svg', 'assets/lua.svg', 'assets/cogumelo.svg',
  'assets/fonts/alfa-slab-one-latin-400-normal.woff2',
  'assets/fonts/archivo-latin-500-normal.woff2',
  'assets/fonts/archivo-latin-800-normal.woff2',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  let response;
  try {
    response = await fetch(request, { cache: 'no-cache' });
    if (response.ok) {
      await cache.put(request, response.clone()).catch(() => {});
      return response;
    }
  } catch {
    // sem rede
  }
  return (await cache.match(request, { ignoreSearch: true })) ?? response ?? Response.error();
}
