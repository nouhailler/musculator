// The one food shape the rest of the module works with, so a scanned product,
// a CIQUAL generic and a hand-typed food are interchangeable downstream.
//
//   { id, source: 'off' | 'ciqual' | 'perso', nom, marque, image, barcode,
//     nutriScore, portion, per100: { kcal, proteines, glucides, lipides,
//     micros: { fer, calcium, ... } } }
//
// `micros` is deliberately sparse: a key that is absent means "unknown", which
// the score treats differently from zero. Never default a micronutrient to 0.
import { MICROS } from '../data/nutrition.js';

const round1 = (n) => Math.round(n * 10) / 10;
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

// --- Open Food Facts -------------------------------------------------------

/**
 * Maps a raw OFF product onto the shared shape. kcal falls back to the kJ
 * field (OFF stores energy in kJ for many EU products) — ported from Nutritor.
 */
export function fromOFF(p) {
  const n = p.nutriments || {};
  const kcal = num(n['energy-kcal_100g'])
    ?? (num(n.energy_100g) != null ? Math.round(n.energy_100g / 4.184) : null);

  const micros = {};
  for (const m of MICROS) {
    const raw = num(n[m.off]);
    // OFF reports these in grams; the score works in the label's unit.
    if (raw != null) micros[m.key] = round1(raw * m.offFactor);
  }

  return {
    id: `off-${p.code}`,
    source: 'off',
    nom: (p.product_name_fr || p.product_name || 'Produit sans nom').trim(),
    marque: (p.brands || '').split(',')[0].trim() || null,
    image: p.image_front_small_url || p.image_url || null,
    barcode: p.code || null,
    nutriScore: (p.nutriscore_grade || '').toLowerCase() || null,
    portion: parsePortion(p.serving_size),
    per100: {
      kcal: kcal ?? 0,
      proteines: round1(num(n.proteins_100g) ?? 0),
      glucides: round1(num(n.carbohydrates_100g) ?? 0),
      lipides: round1(num(n.fat_100g) ?? 0),
      micros,
    },
  };
}

// "30 g", "2 biscuits (25 g)" → 30 / 25. Null when OFF gives nothing usable,
// in which case the UI just offers grams.
function parsePortion(serving) {
  if (!serving) return null;
  const m = String(serving).match(/([\d.,]+)\s*g/i);
  if (!m) return null;
  const g = parseFloat(m[1].replace(',', '.'));
  return Number.isFinite(g) && g > 0 ? Math.round(g) : null;
}

// --- CIQUAL (offline generics) ---------------------------------------------

export function fromCiqual(c) {
  const micros = {};
  for (const m of MICROS) {
    const raw = num(c[m.ciqual]);
    if (raw != null) micros[m.key] = round1(raw);
  }
  // 968 of the 3 167 CIQUAL rows carry macros but no energy figure. Deriving it
  // with the Atwater factors (4/4/9) reproduces the declared value to within
  // 1.1 % median on the rows that do have one, which beats showing 0 kcal and
  // silently wrecking the calorie half of the score.
  const declare = num(c.kcal);
  const kcal = declare > 0
    ? Math.round(declare)
    : Math.round(4 * (num(c.protein) ?? 0) + 4 * (num(c.carbs) ?? 0) + 9 * (num(c.fat) ?? 0));
  return {
    id: `ciqual-${c.id}`,
    source: 'ciqual',
    nom: c.name,
    marque: c.group || 'Aliment générique',
    image: null,
    barcode: null,
    nutriScore: null,
    portion: null,
    per100: {
      kcal,
      proteines: round1(num(c.protein) ?? 0),
      glucides: round1(num(c.carbs) ?? 0),
      lipides: round1(num(c.fat) ?? 0),
      micros,
    },
  };
}

// The table is ~600 KB, which is most of the app's payload and is only needed
// once the user opens food search — so it is a separate chunk loaded on demand
// rather than part of the initial bundle. The chunk is still precached by the
// service worker, so offline search keeps working after the first visit.
let ciqualPromise = null;

/**
 * Starts loading the generic food table. Safe to call repeatedly — the promise
 * is memoised — so screens can warm it up before the user actually searches.
 */
export function loadCiqual() {
  if (!ciqualPromise) {
    ciqualPromise = import('../data/ciqual.js')
      .then((m) => m.CIQUAL)
      .catch((e) => {
        // Don't cache the failure: a first attempt made offline before the
        // service worker had the chunk must not poison every later search.
        ciqualPromise = null;
        throw e;
      });
  }
  return ciqualPromise;
}

/**
 * Offline generic search. Runs against the bundled table, so it answers with no
 * network at all — this is the fallback when Open Food Facts is unreachable and
 * the main source for foods that have no barcode (an apple, rice, chicken).
 *
 * Returns [] rather than throwing when the chunk cannot be loaded: search still
 * has Open Food Facts and manual entry, and a failed generic table should not
 * take the whole screen down with it.
 */
export async function searchCiqual(query, limit = 25) {
  const q = norm(query);
  if (q.length < 2) return [];
  let table;
  try {
    table = await loadCiqual();
  } catch {
    return [];
  }
  const scored = [];
  for (const c of table) {
    const name = norm(c.name);
    if (!name.includes(q)) continue;
    // Prefer a prefix match, then the shortest name — "riz" should surface
    // plain rice before "salade de riz au thon".
    scored.push({ c, score: (name.startsWith(q) ? 1000 : 0) - name.length });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => fromCiqual(x.c));
}

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

// --- Manual entry ----------------------------------------------------------

export function manualFood({ nom, kcal, proteines, glucides, lipides }) {
  return {
    id: `perso-${Date.now()}`,
    source: 'perso',
    nom: (nom || '').trim() || 'Aliment perso',
    marque: null,
    image: null,
    barcode: null,
    nutriScore: null,
    portion: null,
    per100: {
      kcal: Math.max(0, Math.round(Number(kcal) || 0)),
      proteines: Math.max(0, round1(Number(proteines) || 0)),
      glucides: Math.max(0, round1(Number(glucides) || 0)),
      lipides: Math.max(0, round1(Number(lipides) || 0)),
      micros: {},
    },
  };
}

// --- Portions --------------------------------------------------------------

/** Scales a food's per-100 g values to an actual quantity in grams. */
export function scale(food, grams) {
  const f = (Number(grams) || 0) / 100;
  const p = food.per100;
  const micros = {};
  for (const [k, v] of Object.entries(p.micros || {})) micros[k] = v * f;
  return {
    kcal: p.kcal * f,
    proteines: p.proteines * f,
    glucides: p.glucides * f,
    lipides: p.lipides * f,
    micros,
  };
}
