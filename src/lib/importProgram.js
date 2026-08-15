// Reads back a training plan dictated to a chat assistant.
//
// The contract is lib/programPrompt.js. The one thing that matters here is
// that every exercise ends up being an id the app already knows: an exercise
// is cross-referenced by its animated demo, its voice cues and the muscle map,
// so an invented one would be an entry with no demo, no coaching and no place
// on the body — five features degraded to gain a name.
//
// So a name is resolved in three steps, each reported: the id if it is one,
// then the catalogue by name, then the nearest exercise working the same
// muscle. What none of those can place is dropped and said out loud.
import { EXERCISES, exById } from '../data/exercises.js';
import { OBJECTIFS } from '../data/programs.js';
import { MUSCLES } from '../data/muscles.js';
import { extractJsonObject } from './json.js';

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/œ/g, 'oe').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

const STOP = new Set(['de', 'du', 'des', 'a', 'au', 'aux', 'en', 'la', 'le', 'les', 'et', 'ou', 'avec', 'sans', 'sur']);
const singular = (w) => (w.length > 3 && /s$/.test(w) ? w.slice(0, -1) : w);
const words = (s) => norm(s).split(' ').filter((w) => w && !STOP.has(w)).map(singular);

const num = (v, fallback = null) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : '');

const IDS = new Set(EXERCISES.map((e) => e.id));

// --- Resolving one exercise ------------------------------------------------

/** Shared words between two lists, as a share of the shorter one. */
function overlap(a, b) {
  if (!a.length || !b.length) return 0;
  const hits = a.filter((w) => b.some((x) => x === w || (w.length > 3 && x.startsWith(w)) || (x.length > 3 && w.startsWith(x)))).length;
  return hits / Math.min(a.length, b.length);
}

/** The catalogue exercise a free-text name refers to, or null. */
function byName(name) {
  const q = words(name);
  if (!q.length) return null;
  let best = null;
  let bestScore = 0.6; // below this it is a guess, not a match
  for (const e of EXERCISES) {
    const score = overlap(q, words(e.nom));
    if (score > bestScore) { bestScore = score; best = e; }
  }
  return best;
}

/**
 * The nearest exercise working the same thing, for a movement the catalogue
 * does not have. Uses the muscle the assistant named, falling back to the
 * words of the exercise's own name — "presse à cuisses" says nothing, but
 * "hip thrust fessiers" does.
 */
function substitute(name, muscle, taken) {
  // Without a muscle there is nothing to substitute *on*. A name we already
  // failed to match is not a signal — that is how "rameur ergomètre" ended up
  // proposed as mountain climbers. No hint, no substitution.
  const mq = words(muscle);
  if (!mq.length) return null;
  const nq = words(name);

  // The body map already holds the everyday vocabulary and what trains each
  // muscle — "abdominaux" is a zone there while the catalogue says "Sangle
  // abdominale". Using it beats inventing a synonym table, and its `exos` are
  // curated rather than scored.
  const zone = MUSCLES.find((m) => overlap(mq, words(m.nom)) >= 0.5);
  if (zone) {
    const pick = zone.exos.find((id) => IDS.has(id) && !taken.has(id));
    if (pick) return exById(pick);
  }
  let best = null;
  // Below this, only a secondary muscle matched — "deltoïdes" is a secondary
  // of the push-up and the primary of the overhead press, and proposing the
  // push-up for lateral raises would be plainly wrong. A secondary alone is
  // not enough; corroborated by the movement's name, it can be.
  let bestScore = 0.5;
  for (const e of EXERCISES) {
    if (taken.has(e.id)) continue; // a session listing the same exercise twice helps nobody
    const primaire = [...words(e.primaire), ...words(e.muscle), ...words(e.pattern || '')];
    const secondaire = (e.secondaires || []).flatMap(words);
    const muscleScore = Math.max(overlap(mq, primaire), overlap(mq, secondaire) * 0.35);
    if (!muscleScore) continue; // the muscle has to be one this exercise works
    const score = muscleScore + overlap(nq, [...primaire, ...secondaire, ...words(e.nom)]) * 0.4;
    if (score > bestScore) { bestScore = score; best = e; }
  }
  return best;
}

function resolveExercise(raw, taken, notes) {
  const id = str(raw.id) || str(raw.exercice) || str(raw.exercise);
  const nom = str(raw.nom) || str(raw.name) || str(raw.exercice) || id;

  if (id && IDS.has(id)) return exById(id);

  const named = byName(nom);
  if (named) {
    if (id) notes.push({ kind: 'nom', from: id || nom, to: named.nom });
    return named;
  }
  const sub = substitute(nom, str(raw.muscle) || str(raw.groupe), taken);
  if (sub) {
    notes.push({ kind: 'substitution', from: nom, to: sub.nom, muscle: sub.primaire });
    return sub;
  }
  notes.push({ kind: 'absent', from: nom });
  return null;
}

// --- Sessions --------------------------------------------------------------

// What the guided session reads: series and rest are numbers, reps and charge
// are the free text the catalogue itself uses.
function parseCustom(raw, ex) {
  return {
    series: Math.min(10, num(raw.series ?? raw.séries, ex.series) || ex.series),
    reps: str(raw.reps ?? raw.repetitions) || String(ex.reps),
    charge: str(raw.charge ?? raw.poids) || '',
    repos: Math.min(600, num(raw.repos ?? raw.rest, ex.repos) || ex.repos),
  };
}

// Series × (a working set plus its rest). Only used when the assistant gave no
// duration, and rounded to five minutes since it is an estimate either way.
function estimateDuree(exos, custom) {
  const sec = exos.reduce((a, id) => a + custom[id].series * (40 + custom[id].repos), 0);
  return Math.max(5, Math.round(sec / 60 / 5) * 5);
}

function parseSession(raw, index, warnings, fallbackObjectif) {
  if (!raw || typeof raw !== 'object') return null;
  const list = [raw.exercices, raw.exercises, raw.exos].find(Array.isArray) || [];
  const notes = [];
  const taken = new Set();
  const exos = [];
  const custom = {};

  for (const item of list) {
    const src = typeof item === 'string' ? { nom: item } : item;
    if (!src || typeof src !== 'object') continue;
    const ex = resolveExercise(src, taken, notes);
    if (!ex || taken.has(ex.id)) continue;
    taken.add(ex.id);
    exos.push(ex.id);
    custom[ex.id] = parseCustom(src, ex);
  }

  const nom = str(raw.nom) || str(raw.name) || `Séance ${index + 1}`;
  if (!exos.length) {
    warnings.push(`« ${nom} » ignorée : aucun exercice reconnu.`);
    return null;
  }
  const objectif = OBJECTIFS.includes(str(raw.objectif)) ? str(raw.objectif) : fallbackObjectif;
  return {
    nom: nom.slice(0, 60),
    objectif,
    duree: num(raw.duree ?? raw.duration) || estimateDuree(exos, custom),
    exos,
    custom,
    notes,
  };
}

/**
 * @param {string} text the pasted answer
 * @param {{ objectif: string }} ctx the profile's objective, used when a
 *   session does not name one
 * @returns {{ seances, warnings }} — nothing is saved here, the overlay
 *   previews first.
 */
export function parseProgramImport(text, { objectif } = {}) {
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

  const fallback = OBJECTIFS.includes(objectif) ? objectif : OBJECTIFS[0];
  const warnings = [];
  // A single session sent on its own is a programme of one.
  const list = [obj.seances, obj.sessions, obj.programmes].find(Array.isArray)
    || ([obj.exercices, obj.exercises, obj.exos].find(Array.isArray) ? [obj] : []);
  if (!list.length) {
    throw new Error('Aucune séance trouvée. Attendu : { "seances": [ { "exercices": [...] } ] }.');
  }

  const seances = list.slice(0, 8).map((s, i) => parseSession(s, i, warnings, fallback)).filter(Boolean);
  if (!seances.length) throw new Error(warnings[0] || 'Aucune séance exploitable.');
  return { seances, warnings };
}

/** The customWorkouts entries, in the exact shape SAVE_WORKOUT produces. */
export function toCustomWorkouts(seances) {
  return seances.map((s, i) => ({
    id: `custom-imp-${Date.now()}-${i}`,
    nom: s.nom,
    obj: s.objectif,
    niveau: 'Perso',
    lieu: 'Perso',
    duree: s.duree,
    kcal: Math.round(s.duree * 8),
    mat: ['Perso'],
    icon: 'user-gear',
    exos: s.exos,
    custom: s.custom,
    isCustom: true,
  }));
}
