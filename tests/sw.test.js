import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const source = () => readFileSync(new URL('sw.js', root), 'utf8');

function load(fetch, { failing = [] } = {}) {
  const listeners = {};
  const store = new Map();
  const added = [];
  let claimed = false;
  const cache = {
    match: async req => store.get(req.url)?.clone(),
    put: async (req, res) => { store.set(req.url, res); },
    add: async path => {
      if (failing.includes(path)) throw new TypeError('rede caiu');
      added.push(path);
    },
  };
  vm.runInNewContext(source(), {
    self: {
      addEventListener: (type, fn) => { listeners[type] = fn; },
      location: { origin: 'https://x.test' },
      clients: { claim: async () => { claimed = true; } },
    },
    caches: { open: async () => cache },
    setTimeout: fn => setTimeout(fn, 5), // encurta a espera do service worker
    fetch, URL, Response,
  });
  const request = { url: 'https://x.test/app/js/data.js', method: 'GET' };
  const pending = [];
  const get = () => new Promise(resolve => listeners.fetch({ request, respondWith: resolve, waitUntil: p => pending.push(p) }));
  const lifecycle = async type => {
    let done;
    listeners[type]({ waitUntil: p => { done = p; } });
    await done;
  };
  return { get, store, request, pending, added, lifecycle, claimed: () => claimed };
}
const within = (promise, ms = 200) => Promise.race([promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error('sem resposta')), ms))]);

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
test('rede que não responde usa o cache', async () => {
  const sw = load(() => new Promise(() => {}));
  sw.store.set(sw.request.url, new Response('bom'));
  assert.equal(await (await within(sw.get())).text(), 'bom');
});
test('resposta atrasada ainda atualiza o cache', async () => {
  const sw = load(() => new Promise(r => setTimeout(() => r(new Response('novo')), 30)));
  sw.store.set(sw.request.url, new Response('velho'));
  assert.equal(await (await within(sw.get())).text(), 'velho');
  await Promise.all(sw.pending);
  assert.equal(await sw.store.get(sw.request.url).text(), 'novo');
});
test('rede lenta sem cópia salva espera a rede', async () => {
  const sw = load(() => new Promise(r => setTimeout(() => r(new Response('novo')), 30)));
  assert.equal(await (await within(sw.get())).text(), 'novo');
});
test('um download com falha não impede salvar os demais', async () => {
  const sw = load(undefined, { failing: ['js/ui.js'] });
  await sw.lifecycle('install');
  assert.ok(sw.added.includes('js/data.js'));
  assert.ok(!sw.added.includes('js/ui.js'));
});
test('assume a página já na primeira visita', async () => {
  const sw = load();
  await sw.lifecycle('activate');
  assert.equal(sw.claimed(), true);
});
test('pré-carrega todos os arquivos do app', async () => {
  const sw = load();
  await sw.lifecycle('install');
  for (const path of sw.added) assert.ok(existsSync(new URL(path, root)), path);
  const needed = ['./', 'index.html',
    ...['js', 'css', 'assets', 'assets/fonts'].flatMap(dir => readdirSync(new URL(dir, root))
      .filter(f => /\.(js|css|svg|woff2)$/.test(f)).map(f => `${dir}/${f}`))];
  assert.deepEqual(needed.filter(p => !sw.added.includes(p)), []);
});
test('a página adianta o download de todos os módulos', () => {
  const html = readFileSync(new URL('index.html', root), 'utf8');
  const missing = readdirSync(new URL('js', root))
    .filter(f => f !== 'app.js' && !html.includes(`rel="modulepreload" href="js/${f}"`));
  assert.deepEqual(missing, []);
});
