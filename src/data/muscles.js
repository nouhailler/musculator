// Muscle-map definitions — ported from the prototype (MUSCLES), minus the
// static demo `days`/`load`/`lastSession` fields: those are now derived at
// runtime from the real session log (see lib/muscleStats.js) instead of
// being hard-coded seed numbers.
export const MUSCLES = [
  { id: 'epaules', nom: 'Épaules (deltoïdes)', region: 'front', exos: ['developpe', 'pompes'] },
  { id: 'pecs', nom: 'Pectoraux', region: 'front', exos: ['pompes', 'dips', 'developpe'] },
  { id: 'biceps', nom: 'Biceps', region: 'front', exos: ['tractions', 'rowing'] },
  { id: 'abdos', nom: 'Abdominaux', region: 'front', exos: ['gainage', 'abdos', 'mountain'] },
  { id: 'quads', nom: 'Quadriceps', region: 'front', exos: ['squats', 'fentes'] },
  { id: 'trapezes', nom: 'Trapèzes', region: 'back', exos: ['tractions', 'rowing', 'developpe'] },
  { id: 'dos', nom: 'Dos (grand dorsal)', region: 'back', exos: ['tractions', 'rowing'] },
  { id: 'triceps', nom: 'Triceps', region: 'back', exos: ['dips', 'pompes', 'developpe'] },
  { id: 'fessiers', nom: 'Fessiers', region: 'back', exos: ['squats', 'fentes'] },
  { id: 'ischios', nom: 'Ischio-jambiers', region: 'back', exos: ['fentes', 'squats'] },
  { id: 'mollets', nom: 'Mollets', region: 'back', exos: ['fentes'] },
];
