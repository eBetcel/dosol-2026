import test from 'node:test';
import assert from 'node:assert/strict';
import { createHelp, goLabel } from '../js/help.js';

const fake = () => {
  let value = null;
  return { getItem: () => value, setItem: (_, v) => { value = String(v); } };
};
test('o botão explica o que fazer quando nada foi marcado', () => {
  assert.equal(goLabel(0), 'Toque nos shows para escolher');
});
test('o botão mostra quantos shows foram marcados', () => {
  assert.equal(goLabel(1), 'Gerar roteiro (1)');
  assert.equal(goLabel(3), 'Gerar roteiro (3)');
});
test('as instruções abrem na primeira visita e não voltam depois de fechadas', () => {
  const st = fake();
  assert.equal(createHelp(() => st).shouldOpen(0), true);
  createHelp(() => st).markSeen();
  assert.equal(createHelp(() => st).shouldOpen(0), false);
});
test('quem já marcou shows não vê as instruções sozinhas', () => {
  assert.equal(createHelp(() => fake()).shouldOpen(2), false);
});
test('sem armazenamento as instruções ainda abrem e fechar não quebra', () => {
  const help = createHelp(() => { throw new Error('SecurityError'); });
  assert.equal(help.shouldOpen(0), true);
  help.markSeen();
  assert.equal(help.shouldOpen(0), false);
});
