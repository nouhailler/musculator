// Every tunable number of the walking module, like data/nutrition.js does for
// food. Nothing here should be restated in the maths or the UI.

// Net energy cost of walking, above resting metabolism: the commonly used
// ~0.5 kcal per kilo per kilometre. *Net* matters — the daily calorie target
// already contains resting expenditure through the BMR, so counting it again
// here would inflate the day twice.
export const KCAL_PER_KG_KM = 0.5;

// Compendium MET values by pace. Used only when a duration was logged without
// a distance; one MET is subtracted at the point of use so this path stays net
// like the one above.
export const PACE_METS = [
  { maxKmh: 3.2, met: 2.0, label: 'lente' },
  { maxKmh: 4.5, met: 2.8, label: 'tranquille' },
  { maxKmh: 5.5, met: 3.5, label: 'normale' },
  { maxKmh: 6.5, met: 4.3, label: 'rapide' },
  { maxKmh: Infinity, met: 5.0, label: 'très rapide' },
];

// Assumed when only a duration is known.
export const DEFAULT_KMH = 4.8;

// Fallback weight when the profile has none, same value nutrition uses.
export const FALLBACK_WEIGHT = 70;

// Suggested daily distance — roughly the 10 000 steps everyone quotes, in the
// unit the app actually stores. Only a placeholder: the target is the user's.
export const DEFAULT_KM_TARGET = 8;

export const SOURCES = {
  manuel: 'Saisie manuelle',
  gps: 'Marche suivie',
  import: 'Import',
  dictee: 'Dicté',
};

// --- GPS tracking ----------------------------------------------------------

// A fix less precise than this is dropped: a 100 m accuracy circle would add
// phantom kilometres to a walk that never moved.
export const MAX_ACCURACY_M = 35;

// Below this, a move is GPS jitter rather than a step forward.
export const MIN_STEP_M = 6;

// Above this between two fixes, the phone jumped (tunnel, cell re-lock) and
// the segment is not real distance.
export const MAX_JUMP_M = 250;
