import { DAYS } from './data.js';
import { showsOfDay, defaultDayId, findConflicts } from './schedule.js';
import { createSelection } from './storage.js';
import { renderTimeline, renderPlan } from './ui.js';
import { paginate, drawPage, shareOrDownload } from './export-image.js';

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
    clearImages();
    renderSelectionState();
  });
  renderSelectionState();
}

let files = [];

function clearImages() {
  for (const img of $('#preview').querySelectorAll('img')) URL.revokeObjectURL(img.src);
  $('#preview').replaceChildren();
  $('#share').hidden = true;
  files = [];
}

async function createImages() {
  const result = [];
  for (const d of DAYS) {
    const shows = showsOfDay(d).filter(s => selection.has(s.id));
    const conflicts = findConflicts(shows);
    const pages = paginate(shows);
    for (const [i, page] of pages.entries()) {
      const canvas = await drawPage(d, page, i + 1, pages.length, conflicts);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('canvas sem imagem');
      result.push(new File([blob], `roteiro-dosol-${d.id}-${i + 1}.png`, { type: 'image/png' }));
    }
  }
  return result;
}

function download(file) {
  const url = URL.createObjectURL(file);
  Object.assign(document.createElement('a'), { href: url, download: file.name }).click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

$('#export').addEventListener('click', async () => {
  clearImages();
  $('#export').disabled = true;
  try {
    files = await createImages();
    $('#preview').append(
      Object.assign(document.createElement('p'), { textContent: 'Segure na imagem para salvar' }),
      ...files.map(file => Object.assign(document.createElement('img'), { src: URL.createObjectURL(file), alt: 'Imagem do seu roteiro' })));
    $('#share').hidden = false;
  } catch {
    $('#preview').textContent = 'Não foi possível gerar a imagem neste navegador.';
  }
  $('#export').disabled = selection.ids().length === 0;
});
$('#share').addEventListener('click', () => shareOrDownload(files, navigator, download));

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
