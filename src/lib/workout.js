import { exById } from '../data/exercises.js';

// Per-exercise overrides. Deliberately not gated on `isCustom`: a prescription
// belongs to the programme, not to who wrote it. A corrective session in the
// catalogue asks for twelve reps where the exercise sheet's default is twenty,
// and that has to reach the guided session the same way a user's own workout
// does. `isCustom` still means "made by the user"; catalogue programmes without
// a `custom` map keep falling back to the sheet.
function customFor(program, exId) {
  return program?.custom && program.custom[exId] ? program.custom[exId] : null;
}

export function effSeries(program, exId) {
  const cp = customFor(program, exId);
  return Number(cp ? cp.series : exById(exId).series) || 1;
}

export function effRepos(program, exId) {
  const cp = customFor(program, exId);
  return Number(cp ? cp.repos : exById(exId).repos) || 45;
}

export function baseReps(program, exId) {
  const cp = customFor(program, exId);
  return cp ? cp.reps : exById(exId).reps;
}

export function baseCharge(program, exId) {
  const cp = customFor(program, exId);
  return (cp && cp.charge) ? cp.charge : (exById(exId).charge || 'Poids du corps');
}

export function curCharge(program, workout, exId) {
  const o = workout?.charge || {};
  return (o[exId] != null && o[exId] !== '') ? o[exId] : baseCharge(program, exId);
}

export function curReps(program, workout, exId) {
  const o = workout?.reps || {};
  return (o[exId] != null && o[exId] !== '') ? o[exId] : baseReps(program, exId);
}
