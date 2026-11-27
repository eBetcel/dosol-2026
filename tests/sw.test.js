import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const source = () => readFileSync(new URL('sw.js', root), 'utf8');

function load(fetch) {
  const listeners = {};
  const store = new Map();
  const cache = {
    match: async req => store.get(req.url)?.clone(),
    put: async (req, res) => { store.set(req.url, res); },
    addAll: async list => { cache.added = list; },
  };
  vm.runInNewContext(source(), {
    self: { addEventListener: (type, fn) => { listeners[type] = fn; }, location: { origin: 'https://x.test' } },
    caches: { open: async () => cache },
    fetch, URL, Response,
  });
  const request = { url: 'https://x.test/app/js/data.js', method: 'GET' };
  const get = () => new Promise(resolve => listeners.fetch({ request, respondWith: resolve }));
  return { get, store, request, listeners, cache };
}

test('resposta ok é devolvida e gravada', async () => {
  const sw = load(async () => new Response('novo'));
  assert.equal(await (await sw.get()).text(), 'novo');
  assert.equal(await sw.store.get(sw.request.url).text(), 'novo');
});
test('resposta 500 não substitui a cópia boa', async () => {
  const sw = load(async () => new Response('erro', { status: 500 }));
  sw.store.set(sw.request.url, new Response('bom'));
  assert.equal(await (await sw.get()).text(), 'bom');
  assert.equal(await sw.store.get(sw.request.url).text(), 'bom');
});
test('sem rede usa o cache', async () => {
  const sw = load(async () => { throw new TypeError('offline'); });
  sw.store.set(sw.request.url, new Response('bom'));
  assert.equal(await (await sw.get()).text(), 'bom');
});
test('pré-carrega todos os arquivos do app', async () => {
  const sw = load();
  await new Promise(resolve => sw.listeners.install({ waitUntil: p => p.then(resolve) }));
  const added = [...sw.cache.added];
  for (const path of added) assert.ok(existsSync(new URL(path, root)), path);
  const needed = ['./', 'index.html',
    ...['js', 'css', 'assets', 'assets/fonts'].flatMap(dir => readdirSync(new URL(dir, root))
      .filter(f => /\.(js|css|svg|woff2)$/.test(f)).map(f => `${dir}/${f}`))];
  assert.deepEqual(needed.filter(p => !added.includes(p)), []);
});
