// Programação do post https://www.instagram.com/p/Df2ux8vH8Mr/, com horários corrigidos pela
// planilha recebida em 27/11. O Frisson não está na planilha: segue o post, sem horário de fim.
// [início, fim, artista, horário do id]. O id não muda quando o show muda de horário, para a
// seleção salva continuar no mesmo artista.
const stage = (day, id, name, list) => ({
  id,
  name,
  shows: list.map(([time, endTime, artist, idTime = time]) =>
    ({ id: `${day}-${id}-${idTime.replace(':', '')}`, time, endTime, artist })),
});

export const DAYS = [
  {
    id: 'sex',
    label: 'Sexta 27',
    date: '2026-11-27',
    stages: [
      stage('sex', 'galpao', 'Palco Galpão 292', [
        ['19:00', '19:40', 'A Cor dos Olhos (CE)'],
        ['20:20', '21:00', 'Camarones Orquestra Guitarrística (RN)'],
        ['21:40', '22:20', 'Ego Kill Talent (SP)'],
        ['23:00', '23:40', 'Molho Negro (PA)'],
        ['00:20', '01:10', 'Zander (RJ)'],
      ]),
      stage('sex', 'anexo', 'Palco Anexo Galpão 292', [
        ['19:40', '20:20', 'Delirantes e Febris (RN)'],
        ['21:00', '21:40', 'Haru e a Corja (CE)'],
        ['22:20', '23:00', 'Demonia (RN)'],
        ['23:40', '00:20', 'Mc Taya (RJ)'],
      ]),
    ],
  },
  {
    id: 'sab',
    label: 'Sábado 28',
    date: '2026-11-28',
    stages: [
      stage('sab', 'cosern', 'Palco Neoenergia Cosern (Rua Chile)', [
        ['17:00', '17:50', 'Samba de Sereia: Dani Cruz convida Nega Buluka e Dalí Medeiros (RN)'],
        ['18:20', '19:10', 'Suraras do Tapajós (PA)'],
        ['19:30', '20:20', 'Khrystal (RN)'],
        ['20:50', '21:50', 'Siba (PE)'],
        ['22:20', '23:20', 'Maglore (BA)'],
        ['00:00', '01:00', 'Àttooxxá (BA)'],
        ['01:30', '02:30', 'Taj Ma House (RN)'],
      ]),
      stage('sab', 'sol', 'Palco Sol (Galpão 292)', [
        ['17:20', '17:50', 'Vagalumes do Mar (RN)'],
        ['18:20', '19:00', 'Bullet Bane (SP)'],
        ['19:30', '20:10', 'Deb and the Mentals (SP)'],
        ['20:50', '21:40', 'Mercenárias (SP)'],
        ['22:10', '23:00', 'The Dead Billies (BA)'],
        ['23:30', '00:10', 'Bayside Kings (SP)'],
        ['00:50', '01:40', 'Pense (MG)', '00:40'],
      ]),
      stage('sab', 'bnb', 'Palco BNB Cultural (Ribeira Music)', [
        ['17:30', '18:10', 'Mayara Iara Dimitria (PE)'],
        ['18:40', '19:30', 'Matheus Torres (MG)'],
        ['19:50', '20:50', 'Vanguart (MT)'],
        ['21:20', '22:10', 'Exclusive Os Cabides (SC)'],
        ['22:30', '23:20', 'Salma Jô (GO)'],
        ['23:40', '00:30', 'Maria Beraldo (SP)'],
        ['01:00', '01:50', 'O Cheiro do Queijo (CE)'],
      ]),
      stage('sab', 'anexo', 'Palco Anexo Galpão 292', [
        ['17:50', '18:20', 'Rusty (RN)'],
        ['19:00', '19:30', 'TVKills (RN)'],
        ['20:10', '20:50', 'Bruna Pena (PR)'],
        ['21:40', '22:20', 'Manger Cadavre? (SP)'],
        ['23:00', '23:35', 'Catiça (PR)', '01:20'],
        ['00:00', '00:40', 'Eskrota (SP)'],
        ['01:20', '02:00', 'Dirty Grills (SC)', '23:00'],
      ]),
      stage('sab', 'frisson', 'Palco Frisson', [
        ['20:00', undefined, 'Marti (RN)'],
        ['22:00', undefined, 'Lily (RN)'],
        ['00:00', undefined, 'Jennify C. (RN)'],
        ['02:00', undefined, 'Hunter (RN)'],
      ]),
    ],
  },
];
