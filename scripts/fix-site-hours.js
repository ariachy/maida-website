/**
 * Corrects ALL site-wide opening-hours strings to the canonical schedule,
 * across every locale file (en, pt, de, it, es). This fixes the homepage
 * Visit section, the legacy `visit` block, the footer closed-line, and the
 * contact page hours — which were all showing old/incorrect times.
 *
 * Canonical schedule:
 *   Open daily except Tuesday, 17:00 – 23:00
 *   Fri & Sat till 01:00
 *   Tuesday: closed
 *   Kitchen closes 22:30 (weekdays) / 23:00 (weekends)
 *
 * Run from the project root:  node scripts/fix-site-hours.js
 *
 * Safe to run multiple times (idempotent — sets values to the target).
 */
const fs = require('fs');
const path = require('path');

// Per-language canonical strings.
const HOURS = {
  en: {
    open: 'Open daily except Tuesday',
    time: '17:00 – 23:00',
    weekend: 'Fri & Sat till 01:00',
    weekendTime: 'Fri – Sat: 17:00 – 01:00',
    midweek: 'Wed – Mon: 17:00 – 23:00',
    closed: 'Tuesday: Closed',
    closedShort: 'Closed',
    midweekKitchen: 'Kitchen closes 22:30',
    weekendKitchen: 'Kitchen closes 23:00',
  },
  pt: {
    open: 'Aberto todos os dias exceto terça',
    time: '17:00 – 23:00',
    weekend: 'Sex & Sáb até à 01:00',
    weekendTime: 'Sex – Sáb: 17:00 – 01:00',
    midweek: 'Qua – Seg: 17:00 – 23:00',
    closed: 'Terça: Fechado',
    closedShort: 'Fechado',
    midweekKitchen: 'Cozinha fecha às 22:30',
    weekendKitchen: 'Cozinha fecha às 23:00',
  },
  de: {
    open: 'Täglich außer Dienstag geöffnet',
    time: '17:00 – 23:00',
    weekend: 'Fr & Sa bis 01:00',
    weekendTime: 'Fr – Sa: 17:00 – 01:00',
    midweek: 'Mi – Mo: 17:00 – 23:00',
    closed: 'Dienstag: Geschlossen',
    closedShort: 'Geschlossen',
    midweekKitchen: 'Küche schließt 22:30',
    weekendKitchen: 'Küche schließt 23:00',
  },
  it: {
    open: 'Aperto tutti i giorni tranne martedì',
    time: '17:00 – 23:00',
    weekend: 'Ven & Sab fino all’01:00',
    weekendTime: 'Ven – Sab: 17:00 – 01:00',
    midweek: 'Mer – Lun: 17:00 – 23:00',
    closed: 'Martedì: Chiuso',
    closedShort: 'Chiuso',
    midweekKitchen: 'La cucina chiude alle 22:30',
    weekendKitchen: 'La cucina chiude alle 23:00',
  },
  es: {
    open: 'Abierto todos los días excepto el martes',
    time: '17:00 – 23:00',
    weekend: 'Vie & Sáb hasta la 01:00',
    weekendTime: 'Vie – Sáb: 17:00 – 01:00',
    midweek: 'Mié – Lun: 17:00 – 23:00',
    closed: 'Martes: Cerrado',
    closedShort: 'Cerrado',
    midweekKitchen: 'La cocina cierra a las 22:30',
    weekendKitchen: 'La cocina cierra a las 23:00',
  },
};

function setIfExists(obj, pathArr, value) {
  let o = obj;
  for (let i = 0; i < pathArr.length - 1; i++) {
    if (o == null || typeof o !== 'object' || !(pathArr[i] in o)) return false;
    o = o[pathArr[i]];
  }
  const last = pathArr[pathArr.length - 1];
  if (o && typeof o === 'object' && last in o) {
    o[last] = value;
    return true;
  }
  return false;
}

for (const lang of ['en', 'pt', 'de', 'it', 'es']) {
  const file = path.join(__dirname, '..', 'src', 'data', 'locales', `${lang}.json`);
  if (!fs.existsSync(file)) {
    console.log(`[${lang}] file not found, skipping`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const h = HOURS[lang];
  const changes = [];

  // homeVisit.hours.* (only present in en/pt, but try all)
  if (setIfExists(data, ['homeVisit', 'hours', 'monWedThuSun'], h.midweek)) changes.push('homeVisit.monWedThuSun');
  if (setIfExists(data, ['homeVisit', 'hours', 'friday'], h.weekendTime)) changes.push('homeVisit.friday');
  // Remove the redundant saturday line by folding into weekend; if present, set it too
  if (setIfExists(data, ['homeVisit', 'hours', 'saturday'], h.weekend)) changes.push('homeVisit.saturday');
  if (setIfExists(data, ['homeVisit', 'hours', 'closed'], h.closed)) changes.push('homeVisit.closed');

  // legacy visit.hours.value (all langs) — single summary line
  if (setIfExists(data, ['visit', 'hours', 'value'], `${h.midweek} · ${h.weekend}`)) changes.push('visit.value');

  // footer.closed (all langs)
  if (setIfExists(data, ['footer', 'closed'], h.closed)) changes.push('footer.closed');

  // contact.hours.* (all langs)
  if (setIfExists(data, ['contact', 'hours', 'closedText'], h.closedShort)) changes.push('contact.closedText');
  if (setIfExists(data, ['contact', 'hours', 'closed'], h.closed)) changes.push('contact.closed');
  if (setIfExists(data, ['contact', 'hours', 'midweek'], h.midweek)) changes.push('contact.midweek');
  if (setIfExists(data, ['contact', 'hours', 'weekend'], h.weekendTime)) changes.push('contact.weekend');
  if (setIfExists(data, ['contact', 'hours', 'midweekKitchen'], h.midweekKitchen)) changes.push('contact.midweekKitchen');
  if (setIfExists(data, ['contact', 'hours', 'weekendKitchen'], h.weekendKitchen)) changes.push('contact.weekendKitchen');

  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`[${lang}] updated ${changes.length} keys: ${changes.join(', ')}`);
}

console.log('Done. All site-wide hours set to the canonical schedule.');
