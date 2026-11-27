# Roteiro DoSol 2026 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App web estático com timeline por palco de sexta e sábado, seleção de shows e exportação do roteiro como imagem.

**Architecture:** Dados estáticos e regras em funções puras; a interface lê dessas funções e guarda a seleção em `localStorage`. A imagem é desenhada em canvas; um service worker (rede primeiro) permite uso sem sinal.

**Tech Stack:** HTML, CSS e JavaScript (módulos ES). Testes com `node --test`. Sem build e sem dependências.

**Spec:** `docs/superpowers/specs/2026-11-27-roteiro-dosol-design.md`

## Global Constraints

- Programação, nomes de artistas e de palcos copiados exatamente da spec (slides do post).
- Textos da interface em português do Brasil.
- Sem dependências de execução, sem build, sem rastreamento, sem requisições a terceiros.
- Somente caminhos relativos (GitHub Pages em subdiretório).
- Duração estimada: 40 min; Palco Frisson: 120 min. Horários antes das 06:00 pertencem à noite anterior.
- Imagem 1080x1920, até 14 shows por imagem.
- Sem logo nem ilustrações originais. Rodapé: "App não oficial, feito por fã", link para https://www.instagram.com/p/Df2ux8vH8Mr/ e aviso de que horários podem mudar.
- `package.json` apenas com `"type": "module"` e o script `"test": "node --test"`.

## Review Focus

- Seleção salva corrompida (JSON inválido ou que não é lista): o app abre sem seleção (Task 2).
- `localStorage` que lança erro ao ser acessado (aba privada): o app funciona sem salvar (Task 2).
- Compartilhamento cancelado pela pessoa: sem erro e sem download forçado (Task 4).
- Nome muito longo (Samba de Sereia...): quebra em linhas, nunca é cortado (Task 4; na tela, Task 3).
- Resposta de erro da rede (404/500): não substitui a cópia boa em cache (Task 5).

---

### Task 1: Programação e regras

**Files:** Create `package.json`, `js/data.js`, `js/schedule.js`, `tests/schedule.test.js`

**Interfaces — Produces:**
- `data.js`: `DAYS: Array<{id:'sex'|'sab', label:string, date:string, stages:Array<{id:string, name:string, shows:Array<{id:string, time:'HH:MM', artist:string}>}>}>`
  - `date`: `'2026-11-27'`, `'2026-11-28'`; `label`: `'Sexta 27'`, `'Sábado 28'`.
  - ids de palco: sex `galpao`, `anexo`; sab `cosern`, `sol`, `bnb`, `anexo`, `frisson`.
  - id de show: `` `${dayId}-${stageId}-${HHMM}` `` (ex.: `sex-galpao-1900`).
  - `artist` inclui a UF: `'Ego Kill Talent (SP)'`.
- `schedule.js`:
  - `toMinutes(time: string): number`
  - `formatTime(time: string): string` (`'21:40'` → `'21h40'`, `'00:00'` → `'00h'`)
  - `showsOfDay(day): Show[]`, com `Show = {id, time, artist, stageId, stageName, start:number, end:number}`, ordenado por `start` e depois pela ordem dos palcos
  - `findConflicts(shows: Show[]): Set<string>` (ids; sobreposição estrita)
  - `defaultDayId(now: Date): 'sex'|'sab'` (horário local do aparelho)

- [ ] **Step 1: Escrever os testes**

```js
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
```

- [ ] **Step 2:** `npm test` — falha por módulo inexistente.
- [ ] **Step 3:** Implementar `data.js` e `schedule.js`.
- [ ] **Step 4:** `npm test` — tudo passa.
- [ ] **Step 5:** Conferir `data.js` linha a linha contra a spec e commitar (`feat: add schedule data and rules`).

### Task 2: Seleção salva

**Files:** Create `js/storage.js`, `tests/storage.test.js`

**Interfaces — Produces:** `createSelection(getStorage: () => Storage, validIds: Set<string>): {has(id): boolean, toggle(id): void, ids(): string[]}`. Chave: `'roteiro-dosol-2026'`, valor: lista JSON de ids. `app.js` passa `() => window.localStorage`.

- [ ] **Step 1: Escrever os testes** (`fake(initial)` é um objeto com `getItem`/`setItem` em memória)

```js
const valid = new Set(['a', 'b']);
test('persiste entre instâncias', () => {
  const st = fake();
  createSelection(() => st, valid).toggle('a');
  assert.deepEqual(createSelection(() => st, valid).ids(), ['a']);
});
test('toggle remove', () => {
  const sel = createSelection(() => fake(), valid);
  sel.toggle('a'); sel.toggle('a');
  assert.equal(sel.has('a'), false);
});
test('ignora ids desconhecidos', () => {
  assert.deepEqual(createSelection(() => fake('["a","zzz"]'), valid).ids(), ['a']);
});
for (const bad of ['{', '{"a":1}', 'null', '"a"']) {
  test(`valor corrompido ${bad}`, () => {
    assert.deepEqual(createSelection(() => fake(bad), valid).ids(), []);
  });
}
test('armazenamento que lança erro', () => {
  const sel = createSelection(() => { throw new Error('SecurityError'); }, valid);
  sel.toggle('a');
  assert.equal(sel.has('a'), true);
});
```

- [ ] **Step 2:** `npm test` — falha. **Step 3:** implementar. **Step 4:** `npm test` — passa.
- [ ] **Step 5:** Commit (`feat: persist selection`).

### Task 3: Página, tema, timeline e roteiro

**Files:** Create `index.html`, `css/theme.css`, `css/app.css`, `js/ui.js`, `js/app.js`, `assets/` (SVGs próprios: rosa, lua, cogumelo; borda de triângulos e pontos; fontes)

**Interfaces:**
- Consumes: `DAYS`, `showsOfDay`, `findConflicts`, `formatTime`, `toMinutes`, `defaultDayId`, `createSelection`.
- Produces: `renderTimeline(container: Element, day, selection, onToggle: (id) => void): void`, `renderPlan(container: Element, day, selection): void`. `index.html` tem o botão `#export` e a área `#preview`, usados na Task 4.

Decisões:
- Tema em variáveis CSS: `--creme:#e6d3c6`, `--vermelho:#e84a66`, `--turquesa:#16918c`, `--mostarda:#e8a020`, `--preto:#151012`. Cor do texto sobre cada cor com contraste mínimo 4.5:1.
- Fontes em `assets/fonts/` (woff2, subconjunto latin, com licença OFL): Alfa Slab One 400 (títulos), Archivo 500 e 800 (texto). **Baixar só com autorização da pessoa**; sem ela, usar fontes do sistema.
- Timeline: 2.4 px por minuto; colunas de no mínimo 150 px; coluna de horas e nomes dos palcos fixos na rolagem. Cada show é um `<button aria-pressed>`; marcado ganha `✓` e borda além da cor. O texto nunca é cortado.
- Abas "Sexta 27" / "Sábado 28" e "Programação" / "Meu roteiro".
- Roteiro: linha `21h40 → vá para o Palco Galpão 292` e o artista; selo "pode chocar (estimativa)" nos ids de `findConflicts`. Vazio: "Toque num show da programação para montar seu roteiro."
- Título: "Meu roteiro · Festival DoSol 2026"; subtítulo "Natal · Rua Chile".

- [ ] **Step 1:** Implementar os arquivos.
- [ ] **Step 2:** `python3 -m http.server 8000` e conferir no navegador, em largura de 390 px e 320 px: 2 e 5 colunas, nomes inteiros, marcar, trocar de aba e de dia, recarregar mantém a seleção, console sem erros.
- [ ] **Step 3:** `npm test` — passa. Commit (`feat: add timeline and itinerary UI`).

### Task 4: Imagem

**Files:** Create `js/theme.js`, `js/export-image.js`, `tests/export-image.test.js`; Modify `js/app.js`, `index.html`

**Interfaces:**
- Consumes: `showsOfDay`, `findConflicts`, `formatTime`, `createSelection(...).ids()`.
- Produces:
  - `paginate(shows: Show[], size = 14): Show[][]`
  - `wrapText(text: string, maxWidth: number, measure: (s) => number): string[]`
  - `drawPage(day, shows, page: number, total: number, conflicts: Set<string>): Promise<HTMLCanvasElement>`
  - `shareOrDownload(files: File[], nav, download: (file) => void): Promise<'shared'|'cancelled'|'downloaded'>`
  - `theme.js`: `THEME = {colors, fonts}` com os mesmos valores do CSS.

- [ ] **Step 1: Escrever os testes**

```js
test('pagina em blocos de 14', () => {
  assert.deepEqual(paginate(Array(29).fill(0)).map(p => p.length), [14, 14, 1]);
  assert.deepEqual(paginate([]), []);
});
test('quebra nome longo sem perder palavras', () => {
  const name = 'Samba de Sereia: Dani Cruz convida Nega Buluka e Dalí Medeiros (RN)';
  const lines = wrapText(name, 20, s => s.length);
  assert.ok(lines.every(l => l.length <= 20));
  assert.equal(lines.join(' '), name);
});
const files = [{ name: 'a.png' }];
test('compartilha quando há suporte', async () => {
  const nav = { canShare: () => true, share: async () => {} };
  assert.equal(await shareOrDownload(files, nav, () => assert.fail()), 'shared');
});
test('cancelamento não baixa', async () => {
  const nav = { canShare: () => true, share: async () => { throw Object.assign(new Error(), { name: 'AbortError' }); } };
  assert.equal(await shareOrDownload(files, nav, () => assert.fail()), 'cancelled');
});
test('sem suporte ou com falha, baixa', async () => {
  for (const nav of [{}, { canShare: () => true, share: async () => { throw new Error('NotAllowedError'); } }]) {
    const got = [];
    assert.equal(await shareOrDownload(files, nav, f => got.push(f)), 'downloaded');
    assert.equal(got.length, 1);
  }
});
```

- [ ] **Step 2:** `npm test` — falha. **Step 3:** implementar.
  - `#export` ("Gerar imagem"), desabilitado sem seleção, gera as imagens de todos os dias com shows marcados e as mostra em `#preview` com o texto "Segure na imagem para salvar".
  - O compartilhamento fica num segundo botão ("Compartilhar"), para a chamada acontecer direto no toque (exigência do iOS).
  - A imagem espera `document.fonts.ready` e inclui título, dia, lista (hora, artista, palco, marca de choque), paginação "1/2" e "App não oficial, feito por fã".
  - 14 shows com nomes longos precisam caber: reduzir a fonte quando a soma das alturas passar da área útil.
- [ ] **Step 4:** `npm test` — passa.
- [ ] **Step 5:** No navegador, gerar com 1 show e com todos os 32 do sábado (3 imagens) e conferir visualmente. Commit (`feat: export itinerary as image`).

### Task 5: Uso sem sinal, README e verificação final

**Files:** Create `sw.js`, `tests/sw.test.js`, `README.md`; Modify `js/app.js`

**Interfaces — Produces:** `sw.js` é script clássico: pré-carrega todos os arquivos do app na instalação; no `fetch` de GET da mesma origem tenta a rede, grava no cache só se `response.ok`, e usa o cache se a rede falhar. `app.js` registra `./sw.js`.

- [ ] **Step 1: Teste** (carregar `sw.js` com `node:vm`, com `self`, `caches` e `fetch` falsos, e disparar o ouvinte `fetch`):
  - resposta `ok` é devolvida e gravada;
  - resposta 500 não é gravada, e a cópia em cache é devolvida;
  - `fetch` que rejeita devolve a cópia em cache.
  - Mais um teste: todo caminho pré-carregado existe no disco.
- [ ] **Step 2:** `npm test` — falha. **Step 3:** implementar. **Step 4:** passa.
- [ ] **Step 5:** README: o que é, aviso de não oficial, como rodar, testar, atualizar a programação (`js/data.js`), divergência do Frisson e como publicar no GitHub Pages.
- [ ] **Step 6:** No navegador: carregar, parar o servidor, recarregar — o app abre. Rodar `npm test`.
- [ ] **Step 7:** Commit (`feat: add offline support and README`). Publicar só com confirmação explícita.
