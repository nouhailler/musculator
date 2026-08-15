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
  { id: 'epaules', nom: 'Épaules (deltoïdes)', region: 'front', exos: ['developpe', 'elevations-laterales', 'pompes'] },
  { id: 'pecs', nom: 'Pectoraux', region: 'front', exos: ['pompes', 'dips', 'developpe'] },
  { id: 'biceps', nom: 'Biceps', region: 'front', exos: ['curl-biceps', 'tractions', 'rowing'] },
  { id: 'abdos', nom: 'Abdominaux', region: 'front', exos: ['abdos', 'releve-jambes', 'gainage', 'mountain', 'copenhagen'] },
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
  { id: 'triceps', nom: 'Triceps', region: 'back', exos: ['dips', 'extension-triceps', 'pompes', 'developpe'] },
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

// ---------------------------------------------------------------------------
// Profile zones ↔ logged muscles
// ---------------------------------------------------------------------------
//
// Two vocabularies meet here. `profile.zones` holds the six coarse zones the
// profile offers as priorities, while a session entry's `muscles` holds the
// primary muscle of each exercise performed (the first segment of an
// exercise's `muscle` field). The progress analysis compares one against the
// other, so the bridge has to be explicit rather than guessed by string match:
// "Jambes" never appears in a session log, "Quadriceps" does.
export const ZONES = [
  { label: 'Pectoraux', muscles: ['Pectoraux'] },
  { label: 'Dos', muscles: ['Dos'] },
  { label: 'Jambes', muscles: ['Quadriceps', 'Ischios', 'Fessiers', 'Moyen fessier', 'Adducteurs', 'Mollets'] },
  { label: 'Épaules', muscles: ['Épaules'] },
  { label: 'Bras', muscles: ['Triceps', 'Biceps'] },
  { label: 'Abdos', muscles: ['Sangle abdominale', 'Grand droit'] },
];

export const ZONE_LABELS = ZONES.map((z) => z.label);

// A full-body session trains everything, so it counts for every zone rather
// than for none — it is what `muscles` carries for HIIT-style entries.
export const ZONE_WILDCARD = 'Full body';

/** True when a session's `muscles` list touches a zone. */
export function sessionHitsZone(session, zoneLabel) {
  const zone = ZONES.find((z) => z.label === zoneLabel);
  if (!zone) return false;
  return (session.muscles || []).some((m) => m === ZONE_WILDCARD || zone.muscles.includes(m));
}
