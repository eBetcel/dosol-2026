import test from 'node:test';
import assert from 'node:assert/strict';
import { createLatest } from '../js/export-image.js';

test('só o pedido mais recente de imagem vale', () => {
  const latest = createLatest();
  const first = latest.start();
  assert.equal(first(), true);
  const second = latest.start();
  assert.equal(first(), false);
  assert.equal(second(), true);
});
test('mudar a seleção descarta a imagem que ainda está sendo gerada', () => {
  const latest = createLatest();
  const pending = latest.start();
  latest.cancel();
  assert.equal(pending(), false);
});
