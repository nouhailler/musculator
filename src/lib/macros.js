// Daily targets and the day's running totals.
import {
  ACTIVITY_BY_FREQUENCY, CARB_SHARE, DEFAULT_GOAL, FALLBACK_TDEE,
  FALLBACK_WEIGHT, goalDef, MICROS,
} from '../data/nutrition.js';
import { scale } from './food.js';

const n = (v, fallback = null) => {
  const x = Number(v);
  return Number.isFinite(x) && x > 0 ? x : fallback;
};

/**
 * The targets a complete profile implies, before any manual override —
 * Mifflin-St Jeor for the basal rate, scaled by the weekly training frequency,
 * then shifted by the nutrition goal. Exported so the profile screen can show
 * what the calculation says next to the field that overrides it.
 */
export function autoTargets(profile) {
  const { auto } = resolveTargets(profile);
  return auto;
}

/**
 * Daily targets. Derived from the training profile the app already collects —
 * there is no second profile to fill in — unless the profile carries an
 * explicit target, which wins.
 *
 * `manuel` says which of the four were set by hand, so the UI can mark them.
 * `estime: true` means the profile was too incomplete to compute a real figure
 * *and* nothing manual replaced it, so the UI can say the numbers are a
 * placeholder rather than present a fallback as a measurement.
 */
export function dailyTargets(profile) {
  const { targets } = resolveTargets(profile);
  return targets;
}

function resolveTargets(profile) {
  const p = profile || {};
  const poids = n(p.poids, null);
  const taille = n(p.taille, null);
  const age = n(p.age, null);
  const goal = goalDef(p.objectifNutrition || DEFAULT_GOAL);

  let tdee = FALLBACK_TDEE;
  let estime = true;
  if (poids && taille && age) {
    // Mifflin-St Jeor: the sex term is +5 for men, −161 for women. "Autre" has
    // no established equation, so it takes the midpoint rather than silently
    // being treated as one or the other.
    const sexTerm = p.sexe === 'Femme' ? -161 : p.sexe === 'Homme' ? 5 : -78;
    const bmr = 10 * poids + 6.25 * taille - 5 * age + sexTerm;
    const freq = Math.max(0, Math.min(7, Math.round(n(p.frequence, 3))));
    tdee = bmr * ACTIVITY_BY_FREQUENCY[freq];
    estime = false;
  }

  // What the profile implies, before overrides.
  const kcalAuto = Math.round(tdee * (1 + goal.kcalDelta));
  const protAuto = Math.round((poids || FALLBACK_WEIGHT) * goal.proteinPerKg);
  const split = (kc, prot) => {
    // Protein first, then split what is left between carbs and fat.
    const reste = Math.max(0, kc - prot * 4);
    return {
      glucides: Math.round((reste * CARB_SHARE) / 4),
      lipides: Math.round((reste * (1 - CARB_SHARE)) / 9),
    };
  };
  const auto = { kcal: kcalAuto, proteines: protAuto, ...split(kcalAuto, protAuto), goal, estime };

  const manuel = {
    kcal: n(p.kcalCible) != null,
    proteines: n(p.protCible) != null,
    glucides: n(p.glucCible) != null,
    lipides: n(p.lipCible) != null,
  };
  // A manual calorie or protein target feeds the carb/fat split, so the two
  // halves of the plate stay consistent with what the user actually set.
  const kcal = n(p.kcalCible) ?? kcalAuto;
  const proteines = n(p.protCible) ?? protAuto;
  const reste = split(kcal, proteines);
  const targets = {
    kcal: Math.round(kcal),
    proteines: Math.round(proteines),
    glucides: Math.round(n(p.glucCible) ?? reste.glucides),
    lipides: Math.round(n(p.lipCible) ?? reste.lipides),
    goal,
    manuel,
    // Nothing is "estimated" once the two figures the score reads are set by
    // hand: an incomplete profile no longer has any say in them.
    estime: estime && !(manuel.kcal && manuel.proteines),
  };
  return { targets, auto };
}

/** Sums a day's entries. Micronutrients only accumulate where data exists. */
export function totals(entries) {
  const acc = { kcal: 0, proteines: 0, glucides: 0, lipides: 0, micros: {} };
  for (const e of entries) {
    const v = scale(e.food, e.grammes);
    acc.kcal += v.kcal;
    acc.proteines += v.proteines;
    acc.glucides += v.glucides;
    acc.lipides += v.lipides;
    for (const [k, x] of Object.entries(v.micros)) acc.micros[k] = (acc.micros[k] || 0) + x;
  }
  acc.kcal = Math.round(acc.kcal);
  for (const k of ['proteines', 'glucides', 'lipides']) acc[k] = Math.round(acc[k]);
  return acc;
}

/**
 * Per-micronutrient status for the day. `connu: false` means no logged food
 * carried a value — reported as unknown, never as zero.
 */
export function microStatus(entries, dayTotals) {
  // A micronutrient counts as known when at least one entry declared it.
  const declared = new Set();
  for (const e of entries) {
    for (const k of Object.keys(e.food?.per100?.micros || {})) declared.add(k);
  }
  return MICROS.map((m) => {
    const connu = declared.has(m.key);
    const valeur = dayTotals.micros[m.key] || 0;
    const cible = m.reference * m.part;
    return {
      ...m,
      connu,
      valeur: connu ? Math.round(valeur * 10) / 10 : null,
      cible: Math.round(cible * 10) / 10,
      atteint: connu && valeur >= cible,
      part: connu ? Math.min(1, valeur / cible) : 0,
    };
  });
}
