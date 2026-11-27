import test from 'node:test';
import assert from 'node:assert/strict';
import { createSelection } from '../js/storage.js';

const fake = (initial = null) => {
  let value = initial;
  return { getItem: () => value, setItem: (_, v) => { value = String(v); } };
};
const valid = new Set(['a', 'b']);

test('persiste entre instâncias', () => {
  const st = fake();
  createSelection(() => st, valid).toggle('a');
  assert.deepEqual(createSelection(() => st, valid).ids(), ['a']);
});
test('toggle remove', () => {
  const st = fake();
  const sel = createSelection(() => st, valid);
  sel.toggle('a'); sel.toggle('a');
  assert.equal(sel.has('a'), false);
  assert.deepEqual(createSelection(() => st, valid).ids(), []);
});
test('ignora ids desconhecidos', () => {
  assert.deepEqual(createSelection(() => fake('["a","zzz"]'), valid).ids(), ['a']);
});
for (const bad of ['{', '{"a":1}', 'null', '"a"']) {
  test(`valor corrompido ${bad}`, () => {
    assert.deepEqual(createSelection(() => fake(bad), valid).ids(), []);
  });
}
test('armazenamento que lança erro', () => {
  const sel = createSelection(() => { throw new Error('SecurityError'); }, valid);
  sel.toggle('a');
  assert.equal(sel.has('a'), true);
});
