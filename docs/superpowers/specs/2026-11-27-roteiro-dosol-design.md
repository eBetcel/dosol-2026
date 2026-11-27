# Roteiro Festival DoSol 2026 (Natal): design

## Objetivo
App web para o público do festival ver a programação de sexta (27/11) e sábado (28/11)
em timeline por palco, marcar shows e exportar o roteiro como imagem.
Sucesso: no celular, a pessoa sabe em que palco estar em cada horário.

Projeto de fã, sem autorização por enquanto; a autorização será pedida à organização.

## Escopo
Fora: quinta, cidades do interior, mapa, notificações, perfis de artistas, login,
servidor e rastreamento.

## Fonte da verdade
O post https://www.instagram.com/p/Df2ux8vH8Mr/. Os horários só existem nos slides,
então os slides prevalecem sobre a legenda.

Divergência conhecida (Frisson): o slide lista Marti, Lily, Jennify C. e Hunter;
a legenda lista Marti, Dandarona (PE), Hunter B2B Lyli e Jennify C.
O app segue o slide. Conferir com a organização.

### Sexta, 27/11 (Rua Chile, a partir das 18h)
- **Palco Galpão 292:** 19:00 A Cor dos Olhos (CE); 20:20 Camarones Orquestra Guitarrística (RN);
  21:40 Ego Kill Talent (SP); 23:00 Molho Negro (PA); 00:20 Zander (RJ)
- **Palco Anexo Galpão 292:** 19:40 Delirantes e Febris (RN); 21:00 Haru e a Corja (CE);
  22:20 Demonia (RN); 23:40 Mc Taya (RJ)

### Sábado, 28/11 (Rua Chile, a partir das 16h)
- **Palco Neoenergia Cosern (Rua Chile):** 17:00 Samba de Sereia: Dani Cruz convida Nega Buluka
  e Dalí Medeiros (RN); 18:20 Suraras do Tapajós (PA); 19:30 Khrystal (RN); 20:50 Siba (PE);
  22:20 Maglore (BA); 00:00 Àttooxxá (BA); 01:30 Taj Ma House (RN)
- **Palco Sol (Galpão 292):** 17:20 Vagalumes do Mar (RN); 18:20 Bullet Bane (SP);
  19:30 Deb and the Mentals (SP); 20:50 Mercenárias (SP); 22:10 The Dead Billies (BA);
  23:30 Bayside Kings (SP); 00:40 Pense (MG)
- **Palco BNB Cultural (Ribeira Music):** 17:30 Mayara Iara Dimitria (PE); 18:40 Matheus Torres (MG);
  19:50 Vanguart (MT); 21:20 Exclusive Os Cabides (SC); 22:30 Salma Jô (GO);
  23:40 Maria Beraldo (SP); 01:00 O Cheiro do Queijo (CE)
- **Palco Anexo Galpão 292:** 17:50 Rusty (RN); 19:00 TVKills (RN); 20:10 Bruna Pena (PR);
  21:40 Manger Cadavre? (SP); 23:00 Dirty Grills (SC); 00:00 Eskrota (SP); 01:20 Catiça (PR)
- **Palco Frisson:** 20:00 Marti (RN); 22:00 Lily (RN); 00:00 Jennify C. (RN); 02:00 Hunter (RN)

## Telas (página única, mobile primeiro)
- **Seletor de dia:** abre no sábado a partir de 28/11 às 06:00; antes disso, na sexta.
- **Timeline:** horário na vertical (proporcional), um palco por coluna com cor própria,
  coluna de horas fixa, rolagem lateral. Tocar num show marca ou desmarca.
  Marcação visível sem depender só de cor.
- **Meu roteiro:** shows marcados do dia em ordem, com horário e palco, e aviso "pode chocar".
  Vazio: explica como marcar.
- **Gerar imagem:** uma imagem 1080x1920 por dia com shows marcados, até 14 shows por imagem
  (acima disso, continua em outra). Desabilitado sem seleção.
- **Rodapé:** "App não oficial, feito por fã" e link para o post. Aviso de que horários podem mudar.

## Regras
- A noite é contínua: horários antes das 06:00 vêm depois das 23:59 do mesmo dia de festival.
- O post só dá o início. Duração estimada: 40 min; no Frisson (sets), 120 min.
- Choque: dois shows marcados com intervalos estimados sobrepostos. Sempre apresentado como
  estimativa. Não considera tempo de caminhada.
- Seleção salva em `localStorage`, por identificador estável de show. Se o armazenamento
  falhar, o app funciona sem salvar. Identificadores desconhecidos são ignorados.

## Arquitetura
HTML, CSS e JavaScript puros (módulos ES), sem build e sem dependências de execução.
Caminhos relativos, para funcionar no GitHub Pages em subdiretório.

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura |
| `js/data.js` | Programação (dias, palcos, shows) |
| `js/schedule.js` | Ordem, virada da noite, duração, choques (funções puras) |
| `js/storage.js` | Salvar e ler a seleção |
| `js/ui.js` | Timeline e roteiro |
| `js/export-image.js` | Desenho em canvas e compartilhamento |
| `js/theme.js` | Cores e fontes usadas pelo canvas |
| `js/app.js` | Liga as partes |
| `css/theme.css`, `css/app.css` | Tema trocável e layout |
| `assets/` | Desenhos e fontes |
| `sw.js` | Uso sem sinal |

A imagem é desenhada direto no canvas (sem biblioteca), depois que as fontes carregam.
Cada imagem tem o botão "Compartilhar", que a envia sozinha ao menu do aparelho
pela Web Share API (um site não publica direto nos stories); sem suporte, baixa o arquivo e
orienta postar pela galeria. A imagem também aparece na tela
para salvar com toque longo (navegadores internos como o do Instagram).

O service worker busca primeiro na rede e usa o cache só sem conexão, para não prender
programação antiga.

## Identidade visual
Própria, inspirada na edição: creme, vermelho-rosado, turquesa, mostarda e preto; bordas de
triângulos e pontos; desenhos old school simples feitos para o app. Sem logo nem ilustrações
originais. Fontes com licença aberta (OFL) guardadas no repositório. Cores e desenhos
concentrados no tema, para troca se houver autorização.

## Testes
- `node --test`: dados válidos, ordem, virada da meia-noite, duração, choques, armazenamento
  com falha e paginação da imagem.
- No navegador: telas em largura de celular, seleção persistida, imagem gerada e uso offline.

## Publicação
GitHub Pages. Criar repositório público e publicar só com confirmação explícita.

## Prazo
A sexta é o próprio dia 27/11, com o primeiro show às 19h. Plano curto e entrega direta.
