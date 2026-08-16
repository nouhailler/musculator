// Walking: the energy model, and reading the day out of `activityLog`.
//
// The slice is `{ [dateKey]: entry[] }` — a list per day rather than one
// aggregate, because a day can hold a tracked walk, a manual correction and an
// imported file at once, and each has to stay deletable on its own. The
// `{ km, minutes, kcal }` view of a day is derived (`dayActivity`), never
// stored twice.
//
// Energy is deliberately *net* — above resting metabolism. The daily calorie
// target already contains the resting side through the BMR, so a gross figure
// would count it twice. This is also why walking never touches the target
// itself: it is shown next to the intake, the way the journal shows training
// kcal, and nothing here presents a net balance.
import {
  DEFAULT_KMH, DEFAULT_WALK_TYPE, FALLBACK_TAILLE, FALLBACK_WEIGHT, KCAL_PER_KG_KM,
  MAX_ACCURACY_M, MAX_JUMP_M, MIN_STEP_M, PACE_METS, STEP_COEF_BY_SEX, STEP_COEF_REF,
  walkType,
} from '../data/activity.js';

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export const poidsOf = (profile) => num(profile?.poids) || FALLBACK_WEIGHT;
export const tailleOf = (profile) => num(profile?.taille) || FALLBACK_TAILLE;

// --- Turning a duration into a distance ------------------------------------

/**
 * Step length in metres, from height and gait.
 *
 * The gait coefficient does the work — a stroll and a run differ by a factor
 * of two — and the sex coefficient is applied relative to the reference the
 * gait numbers are expressed against, which makes it the 0.5 % adjustment it
 * really is rather than a second opinion on the whole estimate.
 */
export function stepLength({ taille, sexe, type }) {
  const t = num(taille) || FALLBACK_TAILLE;
  const gait = walkType(type);
  const sexCoef = STEP_COEF_BY_SEX[sexe] ?? STEP_COEF_REF;
  return (t / 100) * gait.stepCoef * (sexCoef / STEP_COEF_REF);
}

/**
 * Distance a duration covers at a given gait: step length × cadence × minutes.
 * A step length alone cannot answer this — how often the step is taken is half
 * the question, which is why each gait carries its own cadence.
 *
 * @returns {{ km, pas, kmh, pasM }} the estimate and what it was built from,
 * so the UI can show its workings instead of a number out of nowhere.
 */
export function estimateFromDuration({ minutes, taille, sexe, type }) {
  const m = num(minutes);
  const gait = walkType(type);
  const pasM = stepLength({ taille, sexe, type });
  const pas = Math.round(gait.cadence * m);
  const km = Math.round((pas * pasM) / 10) / 100;
  return { km, pas, pasM: Math.round(pasM * 100), kmh: m ? Math.round((km / m) * 60 * 10) / 10 : 0 };
}

/** Walking pace in km/h, or null when one of the two is missing. */
export function paceKmh({ km, minutes }) {
  const d = num(km);
  const t = num(minutes);
  return d && t ? (d / t) * 60 : null;
}

export const paceLabel = (kmh) => (kmh ? PACE_METS.find((p) => kmh < p.maxKmh)?.label || 'très rapide' : null);

/**
 * Net kcal for a walk.
 *
 * Distance wins whenever it is known: `0.5 × poids × km` needs no assumption
 * about pace. A duration alone falls back to METs at the pace it implies (or
 * a default one), minus the resting MET so both paths measure the same thing.
 */
export function walkKcal({ km, minutes, poids, type }) {
  const kg = num(poids) || FALLBACK_WEIGHT;
  const d = num(km);
  // Per-kilometre cost depends on the gait: running is about twice a walk's,
  // and entries logged before types existed simply read as a normal walk.
  const perKm = walkType(type).kcalPerKgKm ?? KCAL_PER_KG_KM;
  if (d) return Math.round(perKm * kg * d);

  const t = num(minutes);
  if (!t) return 0;
  const kmh = DEFAULT_KMH;
  const met = PACE_METS.find((p) => kmh < p.maxKmh)?.met || 3.5;
  return Math.round(((met - 1) * 3.5 * kg) / 200 * t);
}

/** A stored entry, from whatever the UI collected. */
export function makeActivityEntry({ km, minutes, source, heure, note, type }) {
  return {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    km: Math.round(num(km) * 100) / 100,
    minutes: Math.round(num(minutes)),
    type: type || DEFAULT_WALK_TYPE,
    source: source || 'manuel',
    heure: heure || null,
    note: note || null,
  };
}

/**
 * Steps for one entry — from its distance when known, from its duration
 * otherwise. Like the rest of this module, it's an estimate from the
 * profile's height and the entry's gait: no pedometer backs it.
 */
function estimatePas({ km, minutes, taille, sexe, type }) {
  const d = num(km);
  if (d) return Math.round((d * 1000) / stepLength({ taille, sexe, type }));
  const m = num(minutes);
  return m ? estimateFromDuration({ minutes: m, taille, sexe, type }).pas : 0;
}

/** The day's totals — the `{ km, minutes, kcal, pas }` shape everything reads. */
export function dayActivity(activityLog, dateKey, profile) {
  const list = (activityLog || {})[dateKey] || [];
  const km = list.reduce((a, e) => a + num(e.km), 0);
  const minutes = list.reduce((a, e) => a + num(e.minutes), 0);
  // Recomputed from the current weight rather than summed from what was stored:
  // a corrected weight should fix past estimates, not leave them frozen.
  const poids = poidsOf(profile);
  const taille = tailleOf(profile);
  const sexe = profile?.sexe;
  const kcal = list.reduce((a, e) => a + walkKcal({ km: e.km, minutes: e.minutes, poids, type: e.type }), 0);
  const pas = list.reduce((a, e) => a + estimatePas({ km: e.km, minutes: e.minutes, taille, sexe, type: e.type }), 0);
  return { km: Math.round(km * 100) / 100, minutes, kcal, pas, entries: list, count: list.length };
}

/** Totals over the last `days` days, for the progress analysis and badges. */
export function activityWindow(activityLog, days, profile, from = new Date()) {
  const poids = poidsOf(profile);
  let km = 0;
  let minutes = 0;
  let kcal = 0;
  let joursActifs = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getTime() - i * 86400000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const list = (activityLog || {})[key] || [];
    if (!list.length) continue;
    joursActifs++;
    for (const e of list) {
      km += num(e.km);
      minutes += num(e.minutes);
      kcal += walkKcal({ km: e.km, minutes: e.minutes, poids, type: e.type });
    }
  }
  return {
    jours: days,
    joursActifs,
    km: Math.round(km * 10) / 10,
    minutes,
    kcal,
    kmParJour: joursActifs ? Math.round((km / days) * 10) / 10 : 0,
  };
}

/** Every kilometre ever logged. */
export function totalKm(activityLog) {
  return Math.round(Object.values(activityLog || {})
    .flat()
    .reduce((a, e) => a + num(e.km), 0) * 10) / 10;
}

/** Consecutive days ending today (or yesterday) with something walked. */
export function walkStreak(activityLog, from = new Date()) {
  const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const has = (d) => ((activityLog || {})[key(d)] || []).length > 0;
  const today = new Date(from);
  let cursor = has(today) ? today : new Date(today.getTime() - 86400000);
  if (!has(cursor)) return 0;
  let streak = 0;
  while (has(cursor)) {
    streak++;
    cursor = new Date(cursor.getTime() - 86400000);
  }
  return streak;
}

// --- GPS ------------------------------------------------------------------

const R_EARTH_M = 6371000;

/** Great-circle distance in metres between two fixes. */
export function haversine(a, b) {
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_EARTH_M * Math.asin(Math.min(1, Math.sqrt(s)));
}

/**
 * Distance to add for a new fix, and whether to keep it as the new anchor.
 *
 * A phone standing still still reports a wandering position, so a fix only
 * counts once it is both precise enough and far enough from the last one —
 * otherwise a walk that never happened accumulates kilometres.
 */
export function trackStep(previous, fix) {
  if (fix.accuracy != null && fix.accuracy > MAX_ACCURACY_M) return { metres: 0, anchor: previous };
  if (!previous) return { metres: 0, anchor: fix };
  const d = haversine(previous, fix);
  if (d < MIN_STEP_M) return { metres: 0, anchor: previous };
  // A jump is a re-lock, not a sprint: move the anchor without crediting it.
  if (d > MAX_JUMP_M) return { metres: 0, anchor: fix };
  return { metres: d, anchor: fix };
}
