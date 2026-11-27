import { formatTime } from './schedule.js';
import { THEME } from './theme.js';

const W = 1080;
const H = 1920;
const LIST_TOP = 330;
const LIST_BOTTOM = 1780;
const GAP = 14;
const TEXT_X = 300;
const TEXT_WIDTH = 700;

export function footerText(page, total) {
  return 'Monte o seu: ebetcel.github.io/dosol-2026' + (total > 1 ? ` · ${page}/${total}` : '');
}

export function paginate(shows, size = 14) {
  const pages = [];
  for (let i = 0; i < shows.length; i += size) pages.push(shows.slice(i, i + size));
  return pages;
}

export function wrapText(text, maxWidth, measure) {
  const lines = [];
  for (const word of text.split(' ')) {
    const joined = lines.length ? `${lines.at(-1)} ${word}` : word;
    if (lines.length && measure(joined) <= maxWidth) lines[lines.length - 1] = joined;
    else lines.push(word);
  }
  return lines;
}

export async function shareOrDownload(files, nav, download) {
  if (nav.canShare?.({ files })) {
    try {
      await nav.share({ files });
      return 'shared';
    } catch (error) {
      if (error.name === 'AbortError') return 'cancelled';
    }
  }
  files.forEach(download);
  return 'downloaded';
}

export function shareHint(outcome) {
  if (outcome === 'shared') return 'No Instagram, escolha Stories.';
  if (outcome === 'downloaded') return 'Imagem baixada: abra o Instagram e poste nos stories pela galeria. Se não baixou, segure na imagem para salvar.';
  return '';
}

const font = (weight, size, family) => `${weight} ${size}px ${family}`;

function layoutRows(ctx, shows, conflicts, scale) {
  const { texto } = THEME.fonts;
  const wrap = (text, f) => {
    ctx.font = f;
    return wrapText(text, TEXT_WIDTH, s => ctx.measureText(s).width);
  };
  const artistFont = font(800, 38 * scale, texto);
  const stageFont = font(500, 28 * scale, texto);
  return shows.map(show => {
    const artist = wrap(show.artist, artistFont);
    const stage = wrap(show.stageName + (conflicts.has(show.id) ? ' · pode chocar' : ''), stageFont);
    const height = (artist.length * 44 + stage.length * 34 + 30) * scale;
    return { show, artist, stage, artistFont, stageFont, height };
  });
}

function drawBorder(ctx, y, flip) {
  ctx.save();
  ctx.translate(0, y);
  ctx.scale(1, flip ? -1 : 1);
  ctx.fillStyle = THEME.colors.preto;
  ctx.fillRect(0, 0, W, 8);
  for (let x = 0; x < W; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 14);
    ctx.lineTo(x + 60, 14);
    ctx.lineTo(x + 30, 48);
    ctx.fill();
  }
  ctx.fillStyle = THEME.colors.vermelho;
  for (let x = 30; x < W; x += 60) {
    ctx.beginPath();
    ctx.arc(x, 68, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export async function drawPage(day, shows, page, total, conflicts) {
  const { colors, fonts } = THEME;
  await Promise.all([
    document.fonts.load(font(400, 40, fonts.titulo)),
    document.fonts.load(font(500, 40, fonts.texto)),
    document.fonts.load(font(800, 40, fonts.texto)),
  ]).catch(() => {}); // sem a fonte, desenha com a reserva

  const canvas = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const ctx = canvas.getContext('2d');
  const text = (value, x, y, f, color, align = 'left') => {
    ctx.font = f;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(value, x, y);
  };

  ctx.fillStyle = colors.creme;
  ctx.fillRect(0, 0, W, H);
  drawBorder(ctx, 0, false);
  drawBorder(ctx, H, true);
  text('FESTIVAL DOSOL 2026', W / 2, 180, font(400, 72, fonts.titulo), colors.vermelhoEscuro, 'center');
  text(`Meu roteiro · ${day.label} · Natal`, W / 2, 255, font(800, 40, fonts.texto), colors.turquesaEscuro, 'center');

  let scale = 1;
  let rows = layoutRows(ctx, shows, conflicts, scale);
  const needed = () => rows.reduce((sum, row) => sum + row.height + GAP, 0);
  while (needed() > LIST_BOTTOM - LIST_TOP && scale > 0.4) {
    scale -= 0.04;
    rows = layoutRows(ctx, shows, conflicts, scale);
  }

  let y = LIST_TOP;
  for (const row of rows) {
    ctx.fillStyle = colors.cremeClaro;
    ctx.fillRect(50, y, W - 100, row.height);
    ctx.fillStyle = colors.stages[row.show.stageId];
    ctx.fillRect(50, y, 220, row.height);
    ctx.strokeStyle = colors.preto;
    ctx.lineWidth = 4;
    ctx.strokeRect(50, y, W - 100, row.height);
    text(formatTime(row.show.time), 160, y + row.height / 2 + 15 * scale, font(800, 46 * scale, fonts.texto), colors.preto, 'center');

    let line = y + 48 * scale;
    for (const value of row.artist) {
      text(value, TEXT_X, line, row.artistFont, colors.preto);
      line += 44 * scale;
    }
    for (const value of row.stage) {
      text(value, TEXT_X, line - 4 * scale, row.stageFont, colors.vermelhoEscuro);
      line += 34 * scale;
    }
    y += row.height + GAP;
  }

  text(footerText(page, total), W / 2, 1830, font(800, 36, fonts.texto), colors.preto, 'center');
  return canvas;
}

// Marca cada geração: toques repetidos ou mudança na seleção descartam as anteriores.
export function createLatest() {
  let current = 0;
  return {
    start() {
      const mine = ++current;
      return () => mine === current;
    },
    cancel() { current++; },
  };
}
