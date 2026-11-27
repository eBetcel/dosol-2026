import test from 'node:test';
import assert from 'node:assert/strict';
import { paginate, wrapText, shareOrDownload, shareHint } from '../js/export-image.js';

test('pagina em blocos de 14', () => {
  assert.deepEqual(paginate(Array(29).fill(0)).map(p => p.length), [14, 14, 1]);
  assert.deepEqual(paginate([]), []);
});
test('quebra nome longo sem perder palavras', () => {
  const name = 'Samba de Sereia: Dani Cruz convida Nega Buluka e Dalí Medeiros (RN)';
  const lines = wrapText(name, 20, s => s.length);
  assert.ok(lines.every(l => l.length <= 20));
  assert.equal(lines.join(' '), name);
});
const files = [{ name: 'a.png' }];
test('compartilha quando há suporte', async () => {
  const nav = { canShare: () => true, share: async () => {} };
  assert.equal(await shareOrDownload(files, nav, () => assert.fail()), 'shared');
});
test('cancelamento não baixa', async () => {
  const nav = { canShare: () => true, share: async () => { throw Object.assign(new Error(), { name: 'AbortError' }); } };
  assert.equal(await shareOrDownload(files, nav, () => assert.fail()), 'cancelled');
});
test('sem suporte ou com falha, baixa', async () => {
  for (const nav of [{}, { canShare: () => true, share: async () => { throw new Error('NotAllowedError'); } }]) {
    const got = [];
    assert.equal(await shareOrDownload(files, nav, f => got.push(f)), 'downloaded');
    assert.equal(got.length, 1);
  }
});
test('orienta postar pela galeria só quando a imagem foi baixada', () => {
  assert.match(shareHint('downloaded'), /Instagram.*galeria/);
  assert.match(shareHint('downloaded'), /segure na imagem/);
  assert.equal(shareHint('shared'), 'No Instagram, escolha Stories.');
  assert.equal(shareHint('cancelled'), '');
});
