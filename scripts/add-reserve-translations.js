/**
 * Writes the `reserve` translation block into src/data/locales/en.json and
 * pt.json. v2: OVERWRITES any existing `reserve` block (the copy changed),
 * touching nothing else. Safe to run multiple times.
 *
 * Run from the project root:  node scripts/add-reserve-translations.js
 */
const fs = require('fs');
const path = require('path');

const blocks = {
  en: {
    title: 'Reserve',
    cta: 'Reserve now',
    loading: 'Opening…',
    hoursOpen: 'Open daily except Tuesday',
    hoursTime: '17:00 – 23:00',
    hoursWeekend: 'Fri & Sat till 01:00',
    djPill: 'Maída DJ Sessions',
    phoneBoxLabel: 'Groups of 8+, private events or same-day requests',
    directions: 'Directions',
    unavailable:
      'The booking system is taking a moment. Try again, or give us a call.',
  },
  pt: {
    title: 'Reservar',
    cta: 'Reservar agora',
    loading: 'A abrir…',
    hoursOpen: 'Aberto todos os dias exceto terça',
    hoursTime: '17:00 – 23:00',
    hoursWeekend: 'Sex & Sáb até à 01:00',
    djPill: 'Maída DJ Sessions',
    phoneBoxLabel:
      'Grupos de 8+, eventos privados ou reservas para o próprio dia',
    directions: 'Como chegar',
    unavailable:
      'O sistema de reservas demorou a responder. Tente novamente ou ligue-nos.',
  },
};

for (const lang of ['en', 'pt']) {
  const file = path.join(__dirname, '..', 'src', 'data', 'locales', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const existed = !!data.reserve;
  data.reserve = blocks[lang];
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`[${lang}] reserve translations ${existed ? 'updated' : 'added'} in ${file}`);
}

console.log('Done. Rebuild and re-upload to pick up the changes.');
