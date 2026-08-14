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
 * Daily targets derived from the training profile the app already collects —
 * there is no second profile to fill in. Mifflin-St Jeor for the basal rate,
 * scaled by the weekly training frequency, then shifted by the nutrition goal.
 *
 * Returns `estime: true` when the profile was too incomplete to compute a real
 * figure, so the UI can say the numbers are a placeholder rather than present
 * a fallback as a measurement.
 */
export function dailyTargets(profile) {
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

  const kcal = Math.round(tdee * (1 + goal.kcalDelta));
  const proteines = Math.round((poids || FALLBACK_WEIGHT) * goal.proteinPerKg);
  // Protein first, then split what is left between carbs and fat.
  const kcalRestantes = Math.max(0, kcal - proteines * 4);
  const glucides = Math.round((kcalRestantes * CARB_SHARE) / 4);
  const lipides = Math.round((kcalRestantes * (1 - CARB_SHARE)) / 9);

  return { kcal, proteines, glucides, lipides, goal, estime };
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
