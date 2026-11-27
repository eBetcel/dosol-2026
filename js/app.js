import { DAYS } from './data.js';
import { showsOfDay, defaultDayId, findConflicts } from './schedule.js';
import { createSelection } from './storage.js';
import { renderTimeline, renderPlan } from './ui.js';
import { createOrientation, renderHorizontalTimeline } from './ui-horizontal.js';
import { paginate, drawPage, shareOrDownload, shareHint } from './export-image.js';
import { copyLink, inviteFriend, inviteHint } from './share-link.js';

const $ = selector => document.querySelector(selector);
const validIds = new Set(DAYS.flatMap(d => showsOfDay(d).map(s => s.id)));
const selection = createSelection(() => window.localStorage, validIds);

const orientation = createOrientation(() => window.localStorage);
let dayId = defaultDayId(new Date());
let view = 'timeline';
const day = () => DAYS.find(d => d.id === dayId);

function renderSelectionState() {
  renderPlan($('#plan'), day(), selection);
  $('#export').disabled = selection.ids().length === 0;
  if ($('#go')) $('#go').disabled = $('#export').disabled;
}

function render() {
  for (const b of $('#days').children) b.setAttribute('aria-pressed', b.dataset.day === dayId);
  for (const b of document.querySelectorAll('[data-view]')) b.setAttribute('aria-pressed', b.dataset.view === view);
  $('#timeline').hidden = view !== 'timeline';
  if ($('#go-bar')) $('#go-bar').hidden = view !== 'timeline';
  $('#plan-view').hidden = view !== 'plan';
  if ($('#rotate-bar')) $('#rotate-bar').hidden = view !== 'timeline';
  if ($('#rotate')) $('#rotate').textContent = orientation.isHorizontal() ? '⇅ Ver na vertical' : '⇆ Ver na horizontal';
  const drawTimeline = orientation.isHorizontal() ? renderHorizontalTimeline : renderTimeline;
  drawTimeline($('#timeline'), day(), selection, id => {
    selection.toggle(id);
    clearImages();
    renderSelectionState();
  });
  renderSelectionState();
}

function clearImages() {
  for (const img of $('#preview').querySelectorAll('img')) URL.revokeObjectURL(img.src);
  $('#preview').replaceChildren();
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

function imageCard(file) {
  const img = Object.assign(document.createElement('img'), { src: URL.createObjectURL(file), alt: 'Imagem do seu roteiro' });
  const button = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Compartilhar' });
  const linkHint = document.createElement('p');
  const hint = document.createElement('p');
  // share precisa ser chamado direto no toque (iOS); uma imagem por vez para os stories
  button.addEventListener('click', async () => {
    // copia antes de abrir o menu, sem esperar: o share precisa do mesmo toque
    copyLink(navigator).then(copied => {
      linkHint.textContent = copied ? 'Link copiado: no Stories, use o adesivo de link e cole.' : '';
    });
    hint.textContent = shareHint(await shareOrDownload([file], navigator, download));
  });
  const card = document.createElement('figure');
  card.append(img, button, linkHint, hint);
  return card;
}

async function generate() {
  clearImages();
  $('#export').disabled = true;
  try {
    const files = await createImages();
    $('#preview').append(
      Object.assign(document.createElement('p'), { textContent: 'No menu que abrir, escolha Instagram → Stories. Ou segure na imagem para salvar.' }),
      ...files.map(imageCard));
  } catch {
    $('#preview').textContent = 'Não foi possível gerar a imagem neste navegador.';
  }
  $('#export').disabled = selection.ids().length === 0;
}

$('#rotate')?.addEventListener('click', () => {
  orientation.toggle();
  render();
});
$('#export').addEventListener('click', generate);
$('#go')?.addEventListener('click', () => {
  view = 'plan';
  render();
  window.scrollTo(0, 0);
  generate();
});

$('#invite')?.addEventListener('click', async () => {
  $('#invite-hint').textContent = inviteHint(await inviteFriend(navigator));
});

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

navigator.serviceWorker?.register('./sw.js').catch(() => {});
