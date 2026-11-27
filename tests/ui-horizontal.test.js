import test from 'node:test';
import assert from 'node:assert/strict';
import { isHorizontal, timelineRange } from '../js/ui-horizontal.js';

test('horizontal só quando pedida no endereço', () => {
  assert.equal(isHorizontal('?linha=horizontal'), true);
  assert.equal(isHorizontal('?fbclid=abc&linha=horizontal'), true);
  assert.equal(isHorizontal(''), false);
  assert.equal(isHorizontal('?linha=outra'), false);
});
test('a régua vai de hora cheia a hora cheia', () => {
  assert.deepEqual(timelineRange([{ start: 1160, end: 1200 }, { start: 1460, end: 1500 }]), { first: 1140, last: 1500 });
});
