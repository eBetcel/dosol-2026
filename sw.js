// Rede primeiro, para a programação não ficar velha; cache quando a rede falha ou demora.
const CACHE = 'roteiro-dosol-v1';
const TIMEOUT = 2500; // sinal fraco costuma travar em vez de falhar
const FILES = [
  './', 'index.html',
  'css/theme.css', 'css/app.css',
  'js/app.js', 'js/data.js', 'js/schedule.js', 'js/storage.js', 'js/ui.js', 'js/export-image.js', 'js/theme.js', 'js/share-link.js',
  'assets/borda.svg', 'assets/rosa.svg', 'assets/lua.svg', 'assets/cogumelo.svg',
  'assets/fonts/alfa-slab-one-latin-400-normal.woff2',
  'assets/fonts/archivo-latin-500-normal.woff2',
  'assets/fonts/archivo-latin-800-normal.woff2',
];

self.addEventListener('install', event => {
  // um por um: uma falha no sinal ruim não descarta os outros arquivos
  event.waitUntil(caches.open(CACHE).then(cache => Promise.allSettled(FILES.map(file => cache.add(file)))));
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  const network = fetchAndStore(request);
  event.waitUntil(network); // resposta atrasada ainda atualiza o cache
  event.respondWith(respond(request, network));
});

async function fetchAndStore(request) {
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    return null; // sem rede
  }
}

async function respond(request, network) {
  const first = await Promise.race([network, new Promise(resolve => setTimeout(resolve, TIMEOUT))]);
  if (first?.ok) return first;
  const cache = await caches.open(CACHE);
  return (await cache.match(request, { ignoreSearch: true })) ?? (await network) ?? Response.error();
}
