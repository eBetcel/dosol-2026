import { DAYS } from './data.js';
import { showsOfDay, defaultDayId } from './schedule.js';
import { createSelection } from './storage.js';
import { renderTimeline, renderPlan } from './ui.js';

const $ = selector => document.querySelector(selector);
const validIds = new Set(DAYS.flatMap(d => showsOfDay(d).map(s => s.id)));
const selection = createSelection(() => window.localStorage, validIds);

let dayId = defaultDayId(new Date());
let view = 'timeline';
const day = () => DAYS.find(d => d.id === dayId);

function renderSelectionState() {
  renderPlan($('#plan'), day(), selection);
  $('#export').disabled = selection.ids().length === 0;
}

function render() {
  for (const b of $('#days').children) b.setAttribute('aria-pressed', b.dataset.day === dayId);
  for (const b of document.querySelectorAll('[data-view]')) b.setAttribute('aria-pressed', b.dataset.view === view);
  $('#timeline').hidden = view !== 'timeline';
  $('#plan-view').hidden = view !== 'plan';
  renderTimeline($('#timeline'), day(), selection, id => {
    selection.toggle(id);
    renderSelectionState();
  });
  renderSelectionState();
}

for (const d of DAYS) {
  const button = Object.assign(document.createElement('button'), { type: 'button', textContent: d.label });
  button.dataset.day = d.id;
  button.addEventListener('click', () => { dayId = d.id; render(); });
  $('#days').append(button);
}
for (const button of document.querySelectorAll('[data-view]')) {
  button.addEventListener('click', () => { view = button.dataset.view; render(); });
}
render();
