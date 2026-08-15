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

// Assumed when only a duration is known and nothing better can be derived.
export const DEFAULT_KMH = 4.8;

// ---------------------------------------------------------------------------
// Deducing a distance from a duration
// ---------------------------------------------------------------------------
//
// Step length scales with height, and the usual coefficients are 0.415 for men
// and 0.413 for women — a 0.5 % difference, which is why the *gait* is what
// really drives the estimate here and the sex only nudges it.
//
// A step length alone cannot turn minutes into kilometres, though: it takes a
// cadence too. Each type therefore carries both, and the pair is calibrated so
// the resulting speed lands where that gait actually sits — a stroll near
// 3.3 km/h, a normal walk near 4.7, a brisk one near 5.7, a run near 10.3.
export const WALK_TYPES = [
  { key: 'flanerie', label: 'Flânerie', stepCoef: 0.35, cadence: 95, kcalPerKgKm: 0.5 },
  { key: 'normale', label: 'Normale', stepCoef: 0.414, cadence: 110, kcalPerKgKm: 0.5 },
  { key: 'rapide', label: 'Rapide', stepCoef: 0.45, cadence: 125, kcalPerKgKm: 0.5 },
  // Running costs roughly twice as much per kilometre as walking, and unlike
  // walking the cost barely moves with speed. Logging a run at the walking
  // rate would halve it.
  { key: 'course', label: 'Course à pied', stepCoef: 0.65, cadence: 155, kcalPerKgKm: 0.9 },
];

export const DEFAULT_WALK_TYPE = 'normale';
export const walkType = (key) => WALK_TYPES.find((t) => t.key === key)
  || WALK_TYPES.find((t) => t.key === DEFAULT_WALK_TYPE);

// Applied on top of the gait's coefficient, relative to the "normale"
// reference it is expressed against.
export const STEP_COEF_BY_SEX = { Homme: 0.415, Femme: 0.413, Autre: 0.414 };
export const STEP_COEF_REF = 0.414;

// Median adult height, used only to keep the estimate working before the
// profile is filled in — the UI says when it is falling back to it.
export const FALLBACK_TAILLE = 170;

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
