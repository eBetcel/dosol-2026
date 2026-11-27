// Teste: timeline com os palcos em linhas. Ativa com ?linha=horizontal.
import { showsOfDay, formatTime } from './schedule.js';

const PX_PER_MIN = 4.4;

export function isHorizontal(search) {
  return new URLSearchParams(search).get('linha') === 'horizontal';
}

export function timelineRange(shows) {
  return {
    first: Math.floor(Math.min(...shows.map(s => s.start)) / 60) * 60,
    last: Math.ceil(Math.max(...shows.map(s => s.end)) / 60) * 60,
  };
}

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

export function renderHorizontalTimeline(container, day, selection, onToggle) {
  const shows = showsOfDay(day);
  const { first, last } = timelineRange(shows);
  const x = minutes => `${(minutes - first) * PX_PER_MIN}px`;

  const hours = el('div', { className: 'h-horas' });
  for (let m = first; m < last; m += 60) {
    const label = el('span', { textContent: `${String((m / 60) % 24).padStart(2, '0')}h` });
    label.style.left = x(m);
    hours.append(label);
  }

  const rows = day.stages.flatMap(stage => {
    const name = el('h2', { className: 'h-palco', textContent: stage.name });
    name.style.setProperty('--cor', `var(--palco-${stage.id})`);
    const track = el('div', { className: 'h-faixa' });
    track.setAttribute('role', 'group');
    track.setAttribute('aria-label', stage.name);
    for (const show of shows.filter(s => s.stageId === stage.id)) {
      const button = el('button', { type: 'button', className: 'show' },
        el('b', { textContent: formatTime(show.time) }),
        el('span', { textContent: show.artist }));
      button.style.setProperty('--cor', `var(--palco-${stage.id})`);
      button.style.left = x(show.start);
      button.style.width = `${(show.end - show.start) * PX_PER_MIN - 4}px`;
      button.setAttribute('aria-pressed', selection.has(show.id));
      button.addEventListener('click', () => {
        onToggle(show.id);
        button.setAttribute('aria-pressed', selection.has(show.id));
      });
      track.append(button);
    }
    return [name, track];
  });

  const grid = el('div', { className: 'h-grade' }, el('div', { className: 'h-canto' }), hours, ...rows);
  grid.style.setProperty('--largura', x(last));
  grid.style.setProperty('--hora', `${60 * PX_PER_MIN}px`);
  container.replaceChildren(el('div', { className: 'timeline' }, grid));
}
