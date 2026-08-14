// Muscle-map definitions — ported from the prototype (MUSCLES), minus the
// static demo `days`/`load`/`lastSession` fields: those are now derived at
// runtime from the real session log (see lib/muscleStats.js) instead of
// being hard-coded seed numbers.
//
// `exos` drives two things: the sollicitation computed for the zone, and the
// "exercices ciblant ce muscle" list in the body map. An exercise belongs to
// several muscles when it trains them all (a lunge is quads *and* glutes);
// lists stay ordered by how directly the exercise targets the muscle, and stop
// short of every distant secondary so the panel stays readable.
//
// Every id here must exist in data/exercises.js, and every muscle id must have
// at least one zone in overlays/BodyMap.jsx, otherwise it can't be selected.
export const MUSCLES = [
  { id: 'epaules', nom: 'Épaules (deltoïdes)', region: 'front', exos: ['developpe', 'pompes'] },
  { id: 'pecs', nom: 'Pectoraux', region: 'front', exos: ['pompes', 'dips', 'developpe'] },
  { id: 'biceps', nom: 'Biceps', region: 'front', exos: ['tractions', 'rowing'] },
  { id: 'abdos', nom: 'Abdominaux', region: 'front', exos: ['gainage', 'abdos', 'mountain', 'copenhagen'] },
  {
    id: 'quads',
    nom: 'Quadriceps',
    region: 'front',
    exos: [
      'squats', 'front-squat', 'squat-talons-sureleves', 'sissy-squat', 'squat-sumo',
      'wall-sit', 'leg-extension', 'fentes', 'fente-arriere', 'bulgarian-split-squat',
      'step-up', 'pistol-squat',
    ],
  },
  {
    id: 'adducteurs',
    nom: 'Adducteurs',
    region: 'front',
    exos: ['adduction-sol', 'copenhagen', 'serrage-ballon', 'squat-sumo', 'fente-laterale', 'frog-pump'],
  },
  { id: 'trapezes', nom: 'Trapèzes', region: 'back', exos: ['tractions', 'rowing', 'developpe'] },
  { id: 'dos', nom: 'Dos (grand dorsal)', region: 'back', exos: ['tractions', 'rowing'] },
  { id: 'triceps', nom: 'Triceps', region: 'back', exos: ['dips', 'pompes', 'developpe'] },
  {
    id: 'fessiers',
    nom: 'Fessiers (grand fessier)',
    region: 'back',
    exos: [
      'hip-thrust', 'hip-thrust-unilateral', 'glute-bridge', 'glute-bridge-unilateral',
      'frog-pump', 'kickback-elastique', 'squats', 'fentes', 'fente-arriere',
      'fente-croisee', 'bulgarian-split-squat', 'step-up', 'rdl', 'kettlebell-swing',
      'hyperextension-45',
    ],
  },
  {
    id: 'moyen-fessier',
    nom: 'Moyen fessier',
    region: 'back',
    exos: ['abduction-elastique', 'clamshell', 'monster-walk', 'fire-hydrant', 'fente-croisee', 'rdl-unilateral'],
  },
  {
    id: 'ischios',
    nom: 'Ischio-jambiers',
    region: 'back',
    exos: [
      'rdl', 'rdl-unilateral', 'good-morning', 'curl-nordique', 'leg-curl-allonge',
      'ghr', 'kettlebell-swing', 'hyperextension-45', 'fentes', 'squats',
    ],
  },
  { id: 'mollets', nom: 'Mollets', region: 'back', exos: ['mollets-debout', 'mollets-assis', 'fentes', 'step-up'] },
];
