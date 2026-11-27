# Meu roteiro · Festival DoSol 2026

**Acesse:** https://ebetcel.github.io/dosol-2026/

Timeline por palco da sexta (27/11) e do sábado (28/11) do Festival DoSol em Natal, com
seleção de shows e exportação do roteiro como imagem.

**App não oficial, feito por fã.** Não usa o logo nem as artes do festival; a autorização
ainda será pedida à organização.

## Rodar e testar

    python3 -m http.server 8000   # abra http://localhost:8000
    npm test                      # Node 20+, sem instalar nada

## Atualizar a programação

Edite `js/data.js`. A programação vem do [post oficial](https://www.instagram.com/p/Df2ux8vH8Mr/),
com os horários de início e fim corrigidos por uma planilha recebida em 27/11. Ao mudar o horário
de um show, mantenha o id antigo (4º item), para não trocar a seleção de quem já marcou.
Ao criar um arquivo novo, inclua-o na lista de `sw.js`.

Divergência conhecida no Palco Frisson: o slide lista Marti, Lily, Jennify C. e Hunter; a
legenda lista Marti, Dandarona (PE), Hunter B2B Lyli e Jennify C. O app segue o slide.

O Frisson não tem horário de fim: a duração é estimada em 120 min.

## Publicar no GitHub Pages

Envie a branch principal para um repositório e, em *Settings → Pages*, escolha
*Deploy from a branch*, a branch e a pasta `/ (root)`. Não há build.

## Créditos

Fontes Alfa Slab One e Archivo, licença OFL (textos em `assets/fonts/`).
