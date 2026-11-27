// Fonte da verdade: https://www.instagram.com/p/Df2ux8vH8Mr/ (horários dos slides).
const stage = (day, id, name, list) => ({
  id,
  name,
  shows: list.map(([time, artist]) => ({ id: `${day}-${id}-${time.replace(':', '')}`, time, artist })),
});

export const DAYS = [
  {
    id: 'sex',
    label: 'Sexta 27',
    date: '2026-11-27',
    stages: [
      stage('sex', 'galpao', 'Palco Galpão 292', [
        ['19:00', 'A Cor dos Olhos (CE)'],
        ['20:20', 'Camarones Orquestra Guitarrística (RN)'],
        ['21:40', 'Ego Kill Talent (SP)'],
        ['23:00', 'Molho Negro (PA)'],
        ['00:20', 'Zander (RJ)'],
      ]),
      stage('sex', 'anexo', 'Palco Anexo Galpão 292', [
        ['19:40', 'Delirantes e Febris (RN)'],
        ['21:00', 'Haru e a Corja (CE)'],
        ['22:20', 'Demonia (RN)'],
        ['23:40', 'Mc Taya (RJ)'],
      ]),
    ],
  },
  {
    id: 'sab',
    label: 'Sábado 28',
    date: '2026-11-28',
    stages: [
      stage('sab', 'cosern', 'Palco Neoenergia Cosern (Rua Chile)', [
        ['17:00', 'Samba de Sereia: Dani Cruz convida Nega Buluka e Dalí Medeiros (RN)'],
        ['18:20', 'Suraras do Tapajós (PA)'],
        ['19:30', 'Khrystal (RN)'],
        ['20:50', 'Siba (PE)'],
        ['22:20', 'Maglore (BA)'],
        ['00:00', 'Àttooxxá (BA)'],
        ['01:30', 'Taj Ma House (RN)'],
      ]),
      stage('sab', 'sol', 'Palco Sol (Galpão 292)', [
        ['17:20', 'Vagalumes do Mar (RN)'],
        ['18:20', 'Bullet Bane (SP)'],
        ['19:30', 'Deb and the Mentals (SP)'],
        ['20:50', 'Mercenárias (SP)'],
        ['22:10', 'The Dead Billies (BA)'],
        ['23:30', 'Bayside Kings (SP)'],
        ['00:40', 'Pense (MG)'],
      ]),
      stage('sab', 'bnb', 'Palco BNB Cultural (Ribeira Music)', [
        ['17:30', 'Mayara Iara Dimitria (PE)'],
        ['18:40', 'Matheus Torres (MG)'],
        ['19:50', 'Vanguart (MT)'],
        ['21:20', 'Exclusive Os Cabides (SC)'],
        ['22:30', 'Salma Jô (GO)'],
        ['23:40', 'Maria Beraldo (SP)'],
        ['01:00', 'O Cheiro do Queijo (CE)'],
      ]),
      stage('sab', 'anexo', 'Palco Anexo Galpão 292', [
        ['17:50', 'Rusty (RN)'],
        ['19:00', 'TVKills (RN)'],
        ['20:10', 'Bruna Pena (PR)'],
        ['21:40', 'Manger Cadavre? (SP)'],
        ['23:00', 'Dirty Grills (SC)'],
        ['00:00', 'Eskrota (SP)'],
        ['01:20', 'Catiça (PR)'],
      ]),
      stage('sab', 'frisson', 'Palco Frisson', [
        ['20:00', 'Marti (RN)'],
        ['22:00', 'Lily (RN)'],
        ['00:00', 'Jennify C. (RN)'],
        ['02:00', 'Hunter (RN)'],
      ]),
    ],
  },
];
