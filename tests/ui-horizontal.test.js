import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrientation, timelineRange } from '../js/ui-horizontal.js';

const fake = (initial = null) => {
  let value = initial;
  return { getItem: () => value, setItem: (_, v) => { value = String(v); } };
};
test('o padrão é vertical', () => {
  assert.equal(createOrientation(() => fake()).isHorizontal(), false);
  assert.equal(createOrientation(() => fake('qualquer')).isHorizontal(), false);
});
test('o botão inverte e a escolha fica salva', () => {
  const st = fake();
  const orientation = createOrientation(() => st);
  orientation.toggle();
  assert.equal(orientation.isHorizontal(), true);
  assert.equal(createOrientation(() => st).isHorizontal(), true);
  orientation.toggle();
  assert.equal(createOrientation(() => st).isHorizontal(), false);
});
test('sem armazenamento ainda inverte nesta visita', () => {
  const orientation = createOrientation(() => { throw new Error('SecurityError'); });
  orientation.toggle();
  assert.equal(orientation.isHorizontal(), true);
});
test('a régua vai de hora cheia a hora cheia', () => {
  assert.deepEqual(timelineRange([{ start: 1160, end: 1200 }, { start: 1460, end: 1500 }]), { first: 1140, last: 1500 });
});
