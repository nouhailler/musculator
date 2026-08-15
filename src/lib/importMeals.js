// Reads back the JSON a chat assistant produced from a dictated meal.
//
// The contract is written out in lib/mealPrompt.js — that prompt and this
// parser are the two halves of the same format and must move together. Nothing
// here writes to the store: the overlay previews the result first, so parsing
// and applying are separate steps.
//
// The input is a language model's output, so it is treated as hostile: every
// field is coerced, an unusable one is dropped with a warning rather than
// taking the whole import down, and the shape is accepted loosely (a bare day,
// a bare meal, English or French field names) because Claude and ChatGPT do not
// deviate in the same ways.
import { MEALS, MICROS } from '../data/nutrition.js';
import { extractJsonObject } from './json.js';
import { matchCiqual } from './ciqualMatch.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^(\d{1,2})\s*[:h]\s*(\d{2})?$/;

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const round1 = (n) => Math.round(n * 10) / 10;
const num = (v) => {
  const n = Number(typeof v === 'string' ? v.replace(',', '.') : v);
  return Number.isFinite(n) ? n : null;
};
const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : '');

// --- Meal resolution -------------------------------------------------------

const MEAL_KEYS = MEALS.map((m) => m.key);
const MEAL_SYNONYMS = {};
for (const m of MEALS) {
  MEAL_SYNONYMS[norm(m.key)] = m.key;
  MEAL_SYNONYMS[norm(m.key).replace(/-/g, ' ')] = m.key;
  MEAL_SYNONYMS[norm(m.label)] = m.key;
}
Object.assign(MEAL_SYNONYMS, {
  breakfast: 'petit-dejeuner', matin: 'petit-dejeuner', 'petit dej': 'petit-dejeuner',
  'petit-dej': 'petit-dejeuner', 'ptit dej': 'petit-dejeuner',
  lunch: 'dejeuner', midi: 'dejeuner', 'repas du midi': 'dejeuner', déjeuner: 'dejeuner',
  gouter: 'collation', snack: 'collation', encas: 'collation', 'en cas': 'collation',
  'encas matin': 'collation', 'encas apres midi': 'collation', 'apres midi': 'collation',
  dinner: 'diner', souper: 'diner', soir: 'diner', 'repas du soir': 'diner',
});

/** A meal key from whatever the model wrote, or null. */
export function resolveMeal(input) {
  // Separators are the model's choice, not part of the word: ChatGPT answers
  // "petit_dejeuner" where the prompt asked for "petit-dejeuner".
  const n = norm(input).replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  if (!n) return null;
  return MEAL_SYNONYMS[n] || MEAL_SYNONYMS[n.replace(/ /g, '-')] || null;
}

// Fallback when only an hour was given. The boundaries follow the meal a French
// day is usually cut into; a snack is anything mid-afternoon.
function mealFromTime(input) {
  const m = String(input ?? '').trim().match(TIME_RE);
  if (!m) return null;
  const h = Number(m[1]);
  if (!Number.isFinite(h) || h > 23) return null;
  if (h < 11) return 'petit-dejeuner';
  if (h < 15) return 'dejeuner';
  if (h < 18) return 'collation';
  return 'diner';
}

// --- Foods -----------------------------------------------------------------

// A micronutrient the model left out is unknown, and the score already handles
// that. A zero it wrote itself is the ambiguous case: for iron, calcium,
// potassium, magnesium or vitamin D no real food is exactly at zero, so a 0
// there is filler and is dropped — but fibre genuinely is 0 in meat, eggs and
// dairy, and dropping that would hide a real signal.
const MICRO_KEEPS_ZERO = new Set(['fibres']);

function parseMicros(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const m of MICROS) {
    const v = num(raw[m.key]);
    if (v == null || v < 0) continue;
    if (v === 0 && !MICRO_KEEPS_ZERO.has(m.key)) continue;
    out[m.key] = round1(v);
  }
  return out;
}

const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

function parseFood(raw, warnings, seq) {
  if (!raw || typeof raw !== 'object') {
    warnings.push('Aliment ignoré (format inattendu).');
    return null;
  }
  const nom = str(raw.nom) || str(raw.name) || str(raw.aliment) || str(raw.food) || str(raw.libelle);
  if (!nom) {
    warnings.push('Aliment sans nom ignoré.');
    return null;
  }

  // Grams first, since that is the one thing only the user knows — and *only*
  // from a field that says grams. A bare `quantity` is how a model writes a
  // count of pieces ("quantity": 1 for one egg) or prose ("petite quantité");
  // reading either as grams would silently log one gram of egg, which is far
  // worse than falling back to a round number and saying so.
  const g = num(raw.grammes) ?? num(raw.quantity_g) ?? num(raw.quantite_g) ?? num(raw.poids_g) ?? num(raw.grams) ?? num(raw.poids);
  let grammes = g == null ? null : Math.round(g);
  let pending = null;
  if (grammes == null || grammes <= 0) {
    const said = raw.quantity ?? raw.quantite;
    pending = said !== undefined
      ? `« ${nom} » : quantité « ${said} » non exprimée en grammes → 100 g, à ajuster.`
      : `« ${nom} » : quantité absente ou illisible → 100 g, à ajuster.`;
    grammes = 100;
  }
  grammes = Math.min(5000, grammes);

  // The per-100 g block is the documented shape; a model that flattened it onto
  // the food itself is still read, but the user is told how it was interpreted
  // since that is exactly where a portion total would silently land.
  const block = raw.pour100g || raw.per100 || raw.pour_100g || raw.per100g || raw.nutriments;
  const src = block && typeof block === 'object' ? block : raw;

  const proteines = Math.max(0, round1(num(src.proteines) ?? num(src.proteins) ?? 0));
  const glucides = Math.max(0, round1(num(src.glucides) ?? num(src.carbs) ?? 0));
  const lipides = Math.max(0, round1(num(src.lipides) ?? num(src.fat) ?? 0));
  const declared = num(src.kcal) ?? num(src.calories) ?? num(src.energie) ?? num(src.kcal_per_100g);
  // Same rule as the CIQUAL table: a food with macros but no energy gets the
  // Atwater estimate rather than a 0 kcal line that would wreck the day's score.
  const kcal = declared > 0
    ? Math.round(declared)
    : Math.round(4 * proteines + 4 * glucides + 9 * lipides);

  const entry = { id: `fe-dic-${Date.now()}-${seq}`, grammes };

  // Nothing usable: the name is all we have, so the food is looked up in the
  // CIQUAL table afterwards (resolveLookups). An assistant that names foods
  // without composing them is the common case, not an error. The quantity
  // warning rides along rather than being reported now — a food that turns out
  // to be unresolvable is dropped, and warning about the quantity of something
  // that never made it in is noise.
  if (!kcal && !proteines && !glucides && !lipides) return { ...entry, lookup: nom, pending };

  if (pending) warnings.push(pending);
  if (!block || typeof block !== 'object') {
    warnings.push(`« ${nom} » : pas de bloc « pour100g » — les valeurs lues sont prises pour 100 g.`);
  }
  return {
    ...entry,
    food: {
      // Deterministic id: dictating the same food twice reuses one cache entry
      // instead of growing `foodCache` on every import.
      id: `perso-dictee-${slug(nom) || seq}`,
      source: 'perso',
      nom,
      marque: 'Repas dicté',
      image: null,
      barcode: null,
      nutriScore: null,
      portion: null,
      per100: { kcal, proteines, glucides, lipides, micros: parseMicros(src.micros || raw.micros) },
    },
  };
}

// --- Meals and days --------------------------------------------------------

function parseMealBlock(raw, fallbackMeal, warnings, counter) {
  if (!raw || typeof raw !== 'object') {
    warnings.push('Repas ignoré (format inattendu).');
    return null;
  }
  const list = [raw.aliments, raw.foods, raw.items, raw.plats].find(Array.isArray) || [];
  const entries = list.map((f) => parseFood(f, warnings, counter.n++)).filter(Boolean);
  if (!entries.length) {
    warnings.push('Repas sans aliment exploitable ignoré.');
    return null;
  }

  const asked = raw.repas ?? raw.meal ?? raw.type ?? raw.nom;
  let key = resolveMeal(asked);
  if (!key) {
    key = mealFromTime(raw.heure ?? raw.time ?? raw.hour);
    if (!key) {
      key = fallbackMeal;
      warnings.push(
        asked != null
          ? `Repas « ${String(asked)} » inconnu → ${MEALS.find((m) => m.key === key)?.label}.`
          : `Repas non précisé → ${MEALS.find((m) => m.key === key)?.label}.`,
      );
    }
  }
  return { key, entries };
}

function parseDay(raw, fallbackDate, fallbackMeal, warnings, counter) {
  if (!raw || typeof raw !== 'object') return null;

  let date = fallbackDate;
  const rawDate = raw.date ?? raw.jour;
  if (typeof rawDate === 'string' && DATE_RE.test(rawDate.trim())) date = rawDate.trim();
  else if (rawDate !== undefined) warnings.push(`Date « ${String(rawDate)} » ignorée (format attendu AAAA-MM-JJ).`);

  const blocks = [raw.meals, raw.repas].find(Array.isArray)
    // A day that skipped the meals array and listed foods directly is one meal.
    || ([raw.aliments, raw.foods, raw.items].find(Array.isArray) ? [raw] : []);

  const parsed = blocks.map((m) => parseMealBlock(m, fallbackMeal, warnings, counter)).filter(Boolean);
  if (!parsed.length) return null;

  // Two blocks can land on the same meal (a model splitting a snack in two);
  // they are one meal in the log, so they are merged here rather than downstream.
  const byKey = new Map();
  for (const m of parsed) {
    if (byKey.has(m.key)) byKey.get(m.key).entries.push(...m.entries);
    else byKey.set(m.key, { key: m.key, entries: [...m.entries] });
  }
  // Kept in the app's meal order so the preview reads like the Nutrition screen.
  const meals = MEAL_KEYS.filter((k) => byKey.has(k)).map((k) => byKey.get(k));
  return { date, meals };
}

/**
 * Fills in the foods the model named but did not compose, from the bundled
 * CIQUAL table. Mutates the parsed days in place and drops what it cannot
 * resolve — a food with no composition would otherwise log as 0 kcal.
 *
 * Every lookup is reported: `food.ciqualNom` on what was resolved, so the
 * preview can show which table entry was used and the user can catch a bad
 * pick, and a warning for what was not.
 */
async function resolveLookups(days, warnings) {
  const wanted = [...new Set(days.flatMap((d) => d.meals.flatMap((m) => m.entries.filter((e) => e.lookup).map((e) => e.lookup))))];
  if (!wanted.length) return days;

  const found = new Map();
  await Promise.all(wanted.map(async (nom) => {
    const food = await matchCiqual(nom);
    if (food) found.set(nom, food);
  }));

  const missing = new Set();
  for (const day of days) {
    for (const meal of day.meals) {
      meal.entries = meal.entries.filter((e) => {
        if (!e.lookup) return true;
        const hit = found.get(e.lookup);
        if (!hit) { missing.add(e.lookup); return false; }
        // Keep the dictated wording as the label — "figues" reads better in
        // the journal than "Figue, crue" — but carry the table entry so the
        // preview can show where the numbers came from.
        e.food = { ...hit, id: `ciqual-dictee-${slug(e.lookup)}`, nom: e.lookup, marque: 'Table CIQUAL', ciqualNom: hit.nom };
        if (e.pending) warnings.push(e.pending);
        delete e.lookup;
        delete e.pending;
        return true;
      });
    }
    day.meals = day.meals.filter((m) => m.entries.length);
  }
  for (const nom of missing) {
    warnings.push(`« ${nom} » ignoré : aucune valeur fournie et introuvable dans la table CIQUAL — ajoute-le à la main.`);
  }
  return days.filter((d) => d.meals.length);
}

/**
 * Parses pasted text into days ready to preview.
 *
 * Async because a food the assistant named without composing is looked up in
 * the CIQUAL table, which is a lazily loaded chunk.
 *
 * @param {string} text raw paste — prose and code fences tolerated
 * @param {{ fallbackDate: string, fallbackMeal: string }} ctx defaults for what
 *   the model left out (the day being viewed, the meal last used)
 * @returns {Promise<{ days: Array<{date, meals: Array<{key, entries}>}>, warnings: string[] }>}
 * @throws when nothing usable can be read at all
 */
export async function parseMealsImport(text, { fallbackDate, fallbackMeal } = {}) {
  if (!String(text || '').trim()) throw new Error('Colle d’abord le JSON généré.');

  const raw = extractJsonObject(text);
  if (!raw) throw new Error('Aucun JSON trouvé — vérifie le copier-coller.');
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    throw new Error('JSON invalide — vérifie que le bloc a été copié en entier.');
  }
  if (obj.app !== undefined && norm(obj.app) !== 'musculator') {
    throw new Error("Ce JSON n'est pas au format Musculator.");
  }

  const meal = MEAL_KEYS.includes(fallbackMeal) ? fallbackMeal : MEALS[0].key;
  const date = DATE_RE.test(String(fallbackDate || '')) ? fallbackDate : null;
  const warnings = [];
  const counter = { n: 0 };

  const topDate = typeof obj.date === 'string' && DATE_RE.test(obj.date.trim()) ? obj.date.trim() : date;
  if (!topDate) throw new Error('Aucune date exploitable.');

  // Accepted from most to least structured: a `days` array, a single day, or a
  // single meal — ChatGPT in particular tends to answer with just the meal.
  const rawDays = Array.isArray(obj.days) ? obj.days : [obj];

  const parsed = rawDays.map((d) => parseDay(d, topDate, meal, warnings, counter)).filter(Boolean);
  const days = await resolveLookups(parsed, warnings);
  if (!days.length) {
    // Whatever was dropped on the way is the useful part of this failure — the
    // preview that would have carried the warnings is never shown.
    throw new Error(warnings.length
      ? `Aucun repas exploitable — ${warnings[0]}`
      : 'Aucun repas exploitable. Attendu : { "days": [ { "meals": [ { "aliments": [...] } ] } ] }.');
  }
  return { days, warnings };
}

// --- Applying --------------------------------------------------------------

/** 'append' adds to what is already logged; 'replace' overwrites the meals the import carries. */
export function applyImport(log, days, mode = 'append') {
  const out = { ...log };
  for (const day of days) {
    const existing = { ...(out[day.date] || {}) };
    for (const m of day.meals) {
      existing[m.key] = mode === 'replace' ? [...m.entries] : [...(existing[m.key] || []), ...m.entries];
    }
    out[day.date] = existing;
  }
  return out;
}

/** Every food the import carries, to be cached so it can be re-added offline. */
export function importedFoods(days) {
  return days.flatMap((d) => d.meals.flatMap((m) => m.entries.map((e) => e.food)));
}

export function countImport(days) {
  let meals = 0;
  let aliments = 0;
  let kcal = 0;
  for (const d of days) {
    for (const m of d.meals) {
      meals++;
      for (const e of m.entries) {
        aliments++;
        kcal += (e.food.per100.kcal * e.grammes) / 100;
      }
    }
  }
  return { jours: days.length, meals, aliments, kcal: Math.round(kcal) };
}
