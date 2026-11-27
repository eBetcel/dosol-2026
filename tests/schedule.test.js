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
  assert.equal(dur('sab-sol-1720'), 40);
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
