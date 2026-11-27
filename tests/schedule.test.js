import test from 'node:test';
import assert from 'node:assert/strict';
import { DAYS } from '../js/data.js';
import { toMinutes, formatTime, showsOfDay, findConflicts, defaultDayId } from '../js/schedule.js';

test('quantidade de shows por palco', () => {
  assert.deepEqual(DAYS.map(d => d.stages.map(s => s.shows.length)), [[5, 4], [7, 7, 7, 7, 4]]);
});
test('ids únicos', () => {
  const ids = DAYS.flatMap(d => showsOfDay(d).map(s => s.id));
  assert.equal(new Set(ids).size, ids.length);
});
test('virada da meia-noite', () => {
  assert.equal(toMinutes('23:40'), 1420);
  assert.equal(toMinutes('00:20'), 1460);
  assert.equal(toMinutes('06:00'), 360);
  assert.equal(showsOfDay(DAYS[0]).at(-1).artist, 'Zander (RJ)');
});
test('duração estimada', () => {
  const sab = showsOfDay(DAYS[1]);
  const dur = id => { const s = sab.find(x => x.id === id); return s.end - s.start; };
  assert.equal(dur('sab-sol-1720'), 30);
  assert.equal(dur('sab-cosern-0000'), 60);
  assert.equal(dur('sab-frisson-2000'), 120);
});
test('choques', () => {
  const s = (id, start, end) => ({ id, start, end });
  assert.deepEqual([...findConflicts([s('a', 0, 40), s('b', 30, 70), s('c', 70, 110)])].sort(), ['a', 'b']);
  assert.equal(findConflicts([s('a', 0, 40), s('b', 40, 80)]).size, 0);
});
test('formato de hora', () => {
  assert.equal(formatTime('21:40'), '21h40');
  assert.equal(formatTime('00:00'), '00h');
});
test('dia inicial', () => {
  assert.equal(defaultDayId(new Date(2026, 10, 27, 23, 0)), 'sex');
  assert.equal(defaultDayId(new Date(2026, 10, 28, 5, 59)), 'sex');
  assert.equal(defaultDayId(new Date(2026, 10, 28, 6, 0)), 'sab');
});

const grade = (dayIndex, stageId) => showsOfDay(DAYS[dayIndex]).filter(s => s.stageId === stageId)
  .map(s => `${s.time}-${s.endTime} ${s.artist.replace(/ \([A-Z]{2}\)$/, '')}`);

test('horários de início e fim da planilha, sexta', () => {
  assert.deepEqual(grade(0, 'galpao'), ['19:00-19:40 A Cor dos Olhos', '20:20-21:00 Camarones Orquestra Guitarrística',
    '21:40-22:20 Ego Kill Talent', '23:00-23:40 Molho Negro', '00:20-01:10 Zander']);
  assert.deepEqual(grade(0, 'anexo'), ['19:40-20:20 Delirantes e Febris', '21:00-21:40 Haru e a Corja',
    '22:20-23:00 Demonia', '23:40-00:20 Mc Taya']);
});
test('horários de início e fim da planilha, sábado', () => {
  assert.deepEqual(grade(1, 'cosern').map(s => s.slice(0, 11)), ['17:00-17:50', '18:20-19:10', '19:30-20:20',
    '20:50-21:50', '22:20-23:20', '00:00-01:00', '01:30-02:30']);
  assert.deepEqual(grade(1, 'bnb').map(s => s.slice(0, 11)), ['17:30-18:10', '18:40-19:30', '19:50-20:50',
    '21:20-22:10', '22:30-23:20', '23:40-00:30', '01:00-01:50']);
  assert.deepEqual(grade(1, 'sol').map(s => s.slice(0, 11)), ['17:20-17:50', '18:20-19:00', '19:30-20:10',
    '20:50-21:40', '22:10-23:00', '23:30-00:10', '00:50-01:40']);
  assert.deepEqual(grade(1, 'anexo'), ['17:50-18:20 Rusty', '19:00-19:30 TVKills', '20:10-20:50 Bruna Pena',
    '21:40-22:20 Manger Cadavre?', '23:00-23:35 Catiça', '00:00-00:40 Eskrota', '01:20-02:00 Dirty Grills']);
});
test('quem já marcou continua com o mesmo artista depois da mudança de horário', () => {
  const artist = id => showsOfDay(DAYS[1]).find(s => s.id === id)?.artist;
  assert.equal(artist('sab-anexo-2300'), 'Dirty Grills (SC)');
  assert.equal(artist('sab-anexo-0120'), 'Catiça (PR)');
  assert.equal(artist('sab-sol-0040'), 'Pense (MG)');
});
