import test from 'node:test';
import assert from 'node:assert/strict';
import { APP_URL, copyLink, inviteFriend, inviteHint } from '../js/share-link.js';

const clipboard = (log = []) => ({ writeText: async value => { log.push(value); } });
const error = name => async () => { throw Object.assign(new Error(), { name }); };

test('copia o link do app', async () => {
  const log = [];
  assert.equal(await copyLink({ clipboard: clipboard(log) }), true);
  assert.deepEqual(log, [APP_URL]);
});
test('cópia indisponível ou negada não lança erro', async () => {
  assert.equal(await copyLink({}), false);
  assert.equal(await copyLink({ clipboard: { writeText: error('NotAllowedError') } }), false);
});
test('convite abre o menu com texto e link', async () => {
  let sent;
  assert.equal(await inviteFriend({ share: async data => { sent = data; } }), 'shared');
  assert.deepEqual(sent, { text: 'Monta teu roteiro do Festival DoSol:', url: APP_URL });
});
test('convite cancelado não copia nada', async () => {
  const log = [];
  assert.equal(await inviteFriend({ share: error('AbortError'), clipboard: clipboard(log) }), 'cancelled');
  assert.deepEqual(log, []);
});
test('sem menu de compartilhar, ou com falha, copia o convite', async () => {
  for (const share of [undefined, error('NotAllowedError')]) {
    const log = [];
    assert.equal(await inviteFriend({ share, clipboard: clipboard(log) }), 'copied');
    assert.deepEqual(log, [`Monta teu roteiro do Festival DoSol: ${APP_URL}`]);
  }
});
test('sem menu e sem cópia, mostra o link na tela', async () => {
  assert.equal(await inviteFriend({}), 'failed');
  assert.ok(inviteHint('failed').includes(APP_URL));
  assert.match(inviteHint('copied'), /copiado/);
  assert.equal(inviteHint('shared'), '');
  assert.equal(inviteHint('cancelled'), '');
});
