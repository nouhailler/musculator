// Resolving a bare food *name* against the CIQUAL table.
//
// This is what makes a dictated meal work when the assistant gave no
// nutritional values: the model only has to name the food, the app supplies
// the composition. It is a different job from `searchCiqual`, which ranks
// results for a human who will pick one — here nobody picks, so a wrong match
// is silently wrong data. The bar is therefore "confident or nothing".
//
// CIQUAL names read "Base, qualificatif, qualificatif" — "Figue, crue",
// "Oeuf, blanc (blanc d'oeuf), cru", "Sarrasin entier, cru" — which is what
// the scoring below leans on.
import { fromCiqual, loadCiqual } from './food.js';

// Dropped from both sides before matching: they carry no discriminating power
// and their presence in a query would wrongly force a candidate to contain them.
const STOP = new Set(['de', 'du', 'des', 'd', 'a', 'au', 'aux', 'en', 'la', 'le', 'les', 'l', 'et', 'ou', 'avec', 'sans']);

const norm = (s) => String(s || '')
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/œ/g, 'oe').replace(/æ/g, 'ae');

// French plurals, crudely: enough to make "figues" meet "Figue" and "rôtis"
// meet "rôti" without a stemmer. Short words are left alone so "gras" or
// "riz" survive.
const singular = (w) => (w.length > 3 && /(s|x)$/.test(w) ? w.slice(0, -1) : w);

const tokens = (s) => norm(s)
  .split(/[^a-z0-9%]+/)
  .filter((w) => w && !STOP.has(w))
  .map(singular);

/** The part before the first comma — CIQUAL puts the food itself there. */
const headTokens = (name) => tokens(String(name).split(',')[0]);

// Prefix match in either direction, so "chocolat" meets "chocolats" and "roti"
// meets "rotie" — with a floor, because CIQUAL names contain one-letter tokens
// ("Jus de fruit(s)") that would otherwise match every query starting with s.
const MIN_PREFIX = 3;
const related = (a, b) => (
  a === b
  || (b.length >= MIN_PREFIX && a.startsWith(b))
  || (a.length >= MIN_PREFIX && b.startsWith(a))
);

function scoreCandidate(qt, name) {
  const nt = tokens(name);
  if (!qt.every((q) => nt.some((w) => related(w, q)))) return -1;

  const ht = headTokens(name);
  // Guard against a compound product that merely mentions the food: "Cookie
  // aux pépites de chocolat" for "pépites de chocolat", "Riz blanc, avec
  // poulet" for "blanc de poulet". Only the *first* word of the name is
  // examined — it is the food itself, everything after it is a qualifier.
  // Either the query names it ("blanc d'oeuf" → "Oeuf, blanc"), or it is what
  // the query leads with ("figues" → "Figue, crue").
  if (!qt.some((q) => related(ht[0], q))) return -1;

  let score = related(ht[0], qt[0]) ? 1000 : 400;
  // Every word beyond the query is a more specific product than what was
  // asked for: "Amande (avec peau)" over "Amande, grillée, salée".
  score -= Math.max(0, nt.length - qt.length) * 40;
  score -= name.length * 0.15;
  return score;
}

/**
 * The CIQUAL entry a food name refers to, or null when nothing matches
 * confidently. Null is a normal answer — the caller reports the name back to
 * the user instead of importing a guess.
 */
export async function matchCiqual(name) {
  const qt = tokens(name);
  if (!qt.length) return null;
  let table;
  try {
    table = await loadCiqual();
  } catch {
    return null;
  }
  let best = null;
  let bestScore = 0;
  for (const c of table) {
    const s = scoreCandidate(qt, c.name);
    if (s > bestScore) { bestScore = s; best = c; }
  }
  return best ? fromCiqual(best) : null;
}
