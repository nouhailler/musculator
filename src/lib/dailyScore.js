// Score Musculation Quotidien (/100) — the nutrition ↔ training link.
//
// Three components, all weighted from SCORE_WEIGHTS in data/nutrition.js so the
// balance can be retuned in one place.
import { KCAL_TOLERANCE, MICRO_MIN_KNOWN, SCORE_WEIGHTS } from '../data/nutrition.js';
import { microStatus, totals } from './macros.js';

/**
 * @returns {{ score, sur, composantes, resume, vide }} — `sur` is the maximum
 * actually available today: when micronutrient data is too sparse to judge, its
 * weight is dropped from the denominator instead of being scored as zero, so a
 * user is never punished for Open Food Facts' missing fields.
 */
export function dailyScore(entries, targets) {
  const t = totals(entries);
  const micros = microStatus(entries, t);

  // --- Protéines : linear up to the target, capped there.
  const partProt = targets.proteines > 0 ? Math.min(t.proteines / targets.proteines, 1) : 0;
  const ptsProt = partProt * SCORE_WEIGHTS.proteines;

  // --- Calories : full marks inside the tolerance band, then decaying with the
  // relative distance to the target. Over- and under-shooting cost the same.
  const ecart = targets.kcal > 0 ? Math.abs(t.kcal - targets.kcal) / targets.kcal : 1;
  const partKcal = ecart <= KCAL_TOLERANCE ? 1 : Math.max(0, 1 - ecart);
  const ptsKcal = partKcal * SCORE_WEIGHTS.calories;

  // --- Micronutriments : share of the *known* ones that reached their
  // threshold. Judged only when enough of them carry data.
  const connus = micros.filter((m) => m.connu);
  const microsEvaluables = connus.length / micros.length >= MICRO_MIN_KNOWN;
  const partMicro = connus.length ? connus.filter((m) => m.atteint).length / connus.length : 0;
  const ptsMicro = partMicro * SCORE_WEIGHTS.micros;

  const sur = SCORE_WEIGHTS.proteines + SCORE_WEIGHTS.calories
    + (microsEvaluables ? SCORE_WEIGHTS.micros : 0);
  const brut = ptsProt + ptsKcal + (microsEvaluables ? ptsMicro : 0);

  const composantes = [
    {
      key: 'proteines',
      label: 'Protéines',
      points: Math.round(ptsProt),
      max: SCORE_WEIGHTS.proteines,
      detail: `${t.proteines} g sur ${targets.proteines} g`,
      part: partProt,
      evaluee: true,
    },
    {
      key: 'calories',
      label: 'Calories',
      points: Math.round(ptsKcal),
      max: SCORE_WEIGHTS.calories,
      detail: `${t.kcal} kcal sur ${targets.kcal} kcal`,
      part: partKcal,
      evaluee: true,
    },
    {
      key: 'micros',
      label: 'Micronutriments',
      points: microsEvaluables ? Math.round(ptsMicro) : 0,
      max: SCORE_WEIGHTS.micros,
      detail: microsEvaluables
        ? `${connus.filter((m) => m.atteint).length} sur ${connus.length} renseignés atteints`
        : 'Données insuffisantes',
      part: partMicro,
      evaluee: microsEvaluables,
    },
  ];

  return {
    score: sur > 0 ? Math.round((brut / sur) * 100) : 0,
    sur,
    composantes,
    micros,
    totals: t,
    vide: entries.length === 0,
    resume: buildResume(t, targets, micros, microsEvaluables, partKcal),
  };
}

// Short human read-out: "Protéines ✅ · Calories un peu basses · Fer manquant".
function buildResume(t, targets, micros, microsEvaluables, partKcal) {
  const bits = [];

  bits.push(t.proteines >= targets.proteines
    ? 'Protéines ✅'
    : `Protéines ${Math.round((t.proteines / Math.max(1, targets.proteines)) * 100)} %`);

  if (partKcal === 1) bits.push('Calories ✅');
  else if (t.kcal < targets.kcal) bits.push(t.kcal < targets.kcal * 0.75 ? 'Calories basses' : 'Calories un peu basses');
  else bits.push(t.kcal > targets.kcal * 1.25 ? 'Calories hautes' : 'Calories un peu hautes');

  if (!microsEvaluables) {
    bits.push('Micronutriments non renseignés');
  } else {
    const manquants = micros.filter((m) => m.connu && !m.atteint).map((m) => m.label.toLowerCase());
    bits.push(manquants.length ? `Il manque : ${manquants.slice(0, 3).join(', ')}` : 'Micronutriments ✅');
  }
  return bits.join(' · ');
}
