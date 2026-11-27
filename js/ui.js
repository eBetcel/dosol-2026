import { showsOfDay, findConflicts, formatTime } from './schedule.js';

const PX_PER_MIN = 2.4;

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

const color = (node, stageId) => {
  node.style.setProperty('--cor', `var(--palco-${stageId})`);
  return node;
};

export function renderTimeline(container, day, selection, onToggle) {
  const shows = showsOfDay(day);
  const first = Math.floor(shows[0].start / 60) * 60;
  const last = Math.ceil(Math.max(...shows.map(s => s.end)) / 60) * 60;
  const y = minutes => `${(minutes - first) * PX_PER_MIN}px`;

  const hours = el('div');
  for (let m = first; m < last; m += 60) {
    const label = el('span', { textContent: `${String((m / 60) % 24).padStart(2, '0')}h` });
    label.style.top = y(m);
    hours.append(label);
  }

  const columns = day.stages.map(stage => {
    const column = el('div', { className: 'coluna' });
    column.setAttribute('role', 'group');
    column.setAttribute('aria-label', stage.name);
    for (const show of shows.filter(s => s.stageId === stage.id)) {
      const button = color(el('button', { type: 'button', className: 'show' },
        el('b', { textContent: formatTime(show.time) }),
        el('span', { textContent: show.artist })), stage.id);
      button.style.top = y(show.start);
      button.style.minHeight = `${(show.end - show.start) * PX_PER_MIN - 4}px`;
      button.setAttribute('aria-pressed', selection.has(show.id));
      button.addEventListener('click', () => {
        onToggle(show.id);
        button.setAttribute('aria-pressed', selection.has(show.id));
      });
      column.append(button);
    }
    return column;
  });

  const grid = el('div', { className: 'grade' },
    el('div', { className: 'canto' }),
    ...day.stages.map(s => color(el('h2', { className: 'palco', textContent: s.name }), s.id)),
    el('div', { className: 'horas' }, hours),
    ...columns);
  grid.style.setProperty('--colunas', day.stages.length);
  grid.style.setProperty('--altura', y(last));
  grid.style.setProperty('--hora', `${60 * PX_PER_MIN}px`);

  container.replaceChildren(el('div', { className: 'timeline' }, grid));
}

export function renderPlan(container, day, selection) {
  const shows = showsOfDay(day).filter(s => selection.has(s.id));
  if (!shows.length) {
    container.replaceChildren(el('p', { className: 'vazio', textContent: 'Toque num show da programação para montar seu roteiro.' }));
    return;
  }
  const conflicts = findConflicts(shows);
  container.replaceChildren(el('ol', { className: 'roteiro' }, ...shows.map(show => {
    const item = color(el('li', {},
      el('b', { textContent: `${formatTime(show.time)} → vá para o ${show.stageName}` }),
      el('span', { className: 'artista', textContent: show.artist })), show.stageId);
    if (conflicts.has(show.id)) item.append(el('span', { className: 'selo', textContent: 'pode chocar (estimativa)' }));
    return item;
  })));
}
