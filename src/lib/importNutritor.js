// Imports a journal CSV exported by Nutritor.
//
// Nutritor's exportJournalCSV writes:
//   date;repas;aliment;quantite_g;kcal;proteines_g;glucides_g;lipides_g;fibres_g
// with a UTF-8 BOM, and the nutrient columns are the values *for that portion*,
// not per 100 g — so they are divided back out on the way in, since everything
// downstream stores per-100 g and scales at render time.
//
// Nutritor has five meals against Musculator's four; both of its snack slots
// fold into "collation", which is the only lossy part of the mapping.
import { MEALS } from '../data/nutrition.js';

const MEAL_MAP = {
  'petit-dejeuner': 'petit-dejeuner',
  'petit dejeuner': 'petit-dejeuner',
  'encas matin': 'collation',
  'encas apres-midi': 'collation',
  'encas apres midi': 'collation',
  collation: 'collation',
  dejeuner: 'dejeuner',
  diner: 'diner',
  souper: 'diner',
};

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const numeric = (v) => {
  const n = Number(String(v ?? '').replace(',', '.').trim());
  return Number.isFinite(n) ? n : 0;
};

// Minimal RFC-4180 split: handles quoted fields containing the delimiter.
function splitRow(line, delim) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/**
 * @returns {{ log, count, days, skipped, errors }} — `log` is a nutriLog-shaped
 * object ready to merge; nothing is written here so the caller can preview.
 */
export function parseNutritorCSV(text) {
  const clean = String(text || '').replace(/^﻿/, '');
  const lines = clean.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error('Fichier vide ou sans ligne de données.');

  // Nutritor writes semicolons (French Excel); accept commas too.
  const delim = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ';' : ',';
  const header = splitRow(lines[0], delim).map(norm);
  const col = (name) => header.indexOf(name);

  const iDate = col('date');
  const iMeal = col('repas');
  const iName = col('aliment');
  const iQty = col('quantite_g');
  if (iDate < 0 || iName < 0) {
    throw new Error("Colonnes 'date' et 'aliment' introuvables — est-ce bien un export de journal Nutritor ?");
  }
  const iKcal = col('kcal');
  const iProt = col('proteines_g');
  const iCarb = col('glucides_g');
  const iFat = col('lipides_g');
  const iFib = col('fibres_g');

  const log = {};
  const errors = [];
  let count = 0;
  let skipped = 0;

  for (let r = 1; r < lines.length; r++) {
    const cells = splitRow(lines[r], delim);
    const date = cells[iDate];
    const nom = cells[iName];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) { skipped++; continue; }
    if (!nom) { skipped++; continue; }

    const grammes = Math.max(1, Math.round(numeric(cells[iQty]) || 100));
    // Portion values → per 100 g.
    const f = 100 / grammes;
    const micros = {};
    if (iFib >= 0 && String(cells[iFib] ?? '').trim() !== '') {
      micros.fibres = Math.round(numeric(cells[iFib]) * f * 10) / 10;
    }

    const meal = MEAL_MAP[norm(cells[iMeal])] || MEALS[0].key;
    const entry = {
      id: `fe-imp-${r}-${Date.now()}`,
      grammes,
      food: {
        id: `perso-imp-${norm(nom).replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`,
        source: 'perso',
        nom,
        marque: 'Importé de Nutritor',
        image: null,
        barcode: null,
        nutriScore: null,
        portion: null,
        per100: {
          kcal: Math.round(numeric(cells[iKcal]) * f),
          proteines: Math.round(numeric(cells[iProt]) * f * 10) / 10,
          glucides: Math.round(numeric(cells[iCarb]) * f * 10) / 10,
          lipides: Math.round(numeric(cells[iFat]) * f * 10) / 10,
          micros,
        },
      },
    };

    log[date] = log[date] || {};
    log[date][meal] = log[date][meal] || [];
    log[date][meal].push(entry);
    count++;
  }

  if (!count) throw new Error(`Aucune ligne exploitable (${skipped} ignorée${skipped > 1 ? 's' : ''}).`);
  return { log, count, days: Object.keys(log).length, skipped, errors };
}

/** Merges an imported log into the existing one; existing days are appended to. */
export function mergeLog(current, incoming) {
  const out = { ...current };
  for (const [date, meals] of Object.entries(incoming)) {
    const day = { ...(out[date] || {}) };
    for (const [meal, items] of Object.entries(meals)) {
      day[meal] = [...(day[meal] || []), ...items];
    }
    out[date] = day;
  }
  return out;
}
