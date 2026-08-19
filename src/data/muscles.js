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
  { id: 'epaules', nom: 'Épaules (deltoïdes)', region: 'front', exos: ['cercles-epaules', 'oiseau-halteres', 'oiseau-elastique', 'developpe-arnold', 'elevation-frontale', 'face-pull', 'developpe', 'elevations-laterales', 'pompes'] },
  { id: 'pecs', nom: 'Pectoraux', region: 'front', exos: ['pompes-mur', 'pompes-diamant', 'pompes-inclinees', 'pompes-declinees', 'developpe-couche', 'developpe-incline', 'ecartes-halteres', 'pull-over', 'etirement-pectoral-porte', 'pompes', 'pompes-elastique', 'dips', 'developpe'] },
  { id: 'biceps', nom: 'Biceps', region: 'front', exos: ['curl-marteau', 'curl-incline', 'curl-concentration', 'curl-elastique', 'curl-inverse', 'rowing-halteres-un-bras', 'rowing-inverse', 'curl-biceps', 'tractions', 'traction-supination', 'rowing'] },
  { id: 'abdos', nom: 'Abdominaux', region: 'front', exos: ['retroversion-bassin', 'dead-bug', 'hollow-body', 'bicycle', 'v-up', 'abdos', 'releve-jambes', 'reverse-crunch', 'hanging-knee-raise', 'hanging-leg-raise', 'toes-to-bar', 'ab-wheel-rollout', 'up-down-plank', 'gainage', 'mountain', 'copenhagen'] },
  // Ajoutés quand le catalogue a couvert la rotation, la préhension et les
  // érecteurs : trois familles qu'aucun exercice n'atteignait.
  { id: 'obliques', nom: 'Obliques', region: 'front', exos: ['planche-laterale', 'russian-twist', 'pallof-press', 'bicycle', 'copenhagen', 'hanging-windshield-wipers', 'suitcase-carry', 'up-down-plank'] },
  { id: 'avant-bras', nom: 'Avant-bras (grip)', region: 'front', exos: ['etirement-extenseurs-avant-bras', 'etirement-flechisseurs-avant-bras', 'etirement-pouce-finkelstein', 'ouverture-doigts-elastique', 'automassage-avant-bras', 'farmer-walk', 'dead-hang', 'wrist-curl', 'reverse-wrist-curl', 'pinch-grip', 'curl-inverse', 'curl-marteau', 'wrist-roller', 'pronation-supination-haltere', 'plate-wrist-curl'] },
  // Le psoas n'avait pas de zone alors qu'il commande la bascule du bassin :
  // il relie le fémur aux lombaires, et une journée assise le raccourcit. Sa
  // zone est le pli de l'aine, là où on le sent.
  { id: 'psoas', nom: 'Psoas-iliaque (fléchisseurs de hanche)', region: 'front', exos: ['etirement-psoas-chevalier', 'marche-sur-place', 'releve-jambes', 'hanging-knee-raise', 'reverse-nordic', 'mountain'] },
  {
    id: 'quads',
    nom: 'Quadriceps',
    region: 'front',
    exos: ['sit-to-stand', 'etirement-quadriceps-debout', 'cyclist-squat', 'spanish-squat', 'reverse-nordic', 'squats', 'front-squat', 'squat-talons-sureleves', 'sissy-squat', 'squat-sumo', 'wall-sit', 'leg-extension', 'fentes', 'fente-arriere', 'bulgarian-split-squat', 'step-up', 'pistol-squat'],
  },
  {
    id: 'adducteurs',
    nom: 'Adducteurs',
    region: 'front',
    exos: ['copenhagen-dynamique', 'copenhagen-genou-flechi', 'adduction-debout-elastique', 'adduction-sol', 'copenhagen', 'serrage-ballon', 'squat-sumo', 'fente-laterale', 'frog-pump'],
  },
  { id: 'trapezes', nom: 'Trapèzes', region: 'back', exos: ['shrugs', 'y-raise', 'retraction-scapulaire', 'rowing-coudes-ouverts', 'trap-3-raise', 'prone-t-raise', 'prone-w-raise', 'scapular-push-up', 'scapular-pull-up', 'farmer-walk', 'oiseau-halteres', 'oiseau-elastique', 'face-pull', 'rowing-halteres-buste-penche', 'rowing-inverse', 'tractions', 'rowing', 'developpe'] },
  // Les stabilisateurs de l'omoplate et la nuque : trois zones qu'aucun
  // exercice n'atteignait, alors que le catalogue avait déjà les mouvements —
  // « Dentelé antérieur » était même un `primaire` sans muscle correspondant.
  // Le dentelé est à l'avant (sous l'aisselle, sur les côtes) bien qu'il
  // déplace l'omoplate, qui est dans le dos : c'est là qu'on le touche.
  { id: 'rhomboides', nom: 'Rhomboïdes & trapèze moyen', region: 'back', exos: ['retraction-scapulaire', 'prone-w-raise', 'prone-t-raise', 'trap-3-raise', 'y-raise', 'face-pull', 'rowing-coudes-ouverts', 'rowing-inverse', 'oiseau-halteres'] },
  { id: 'cou', nom: 'Cou & nuque', region: 'back', exos: ['chin-tuck', 'etirement-elevateur-scapula'] },
  { id: 'dentele', nom: 'Dentelé antérieur', region: 'front', exos: ['scapular-push-up', 'scapular-pull-up', 'pompes', 'gainage', 'pull-over'] },
  { id: 'dos', nom: 'Dos (grand dorsal)', region: 'back', exos: ['dead-hang', 'oiseau-halteres', 'rowing-halteres-un-bras', 'rowing-halteres-buste-penche', 'rowing-inverse', 'tirage-vertical-elastique', 'tirage-horizontal-elastique-assis', 'traction-supination', 'traction-neutre', 'traction-negative', 'traction-assistee-elastique', 'straight-arm-pulldown-elastique', 'pulldown-genoux-elastique', 'pull-over', 'tractions', 'rowing'] },
  { id: 'triceps', nom: 'Triceps', region: 'back', exos: ['pompes-mur', 'extension-triceps-unilaterale', 'extension-triceps-elastique', 'barre-au-front', 'pompes-diamant', 'developpe-couche', 'pompes-inclinees', 'dips', 'extension-triceps', 'pompes', 'developpe'] },
  {
    id: 'fessiers',
    nom: 'Fessiers (grand fessier)',
    region: 'back',
    exos: ['sit-to-stand', 'pull-through', 'hip-thrust-pause', 'hip-thrust', 'hip-thrust-unilateral', 'glute-bridge', 'glute-bridge-unilateral', 'frog-pump', 'kickback-elastique', 'squats', 'fentes', 'fente-arriere', 'fente-croisee', 'bulgarian-split-squat', 'step-up', 'rdl', 'kettlebell-swing', 'hyperextension-45'],
  },
  {
    id: 'moyen-fessier',
    nom: 'Moyen fessier',
    region: 'back',
    exos: ['abduction-elastique', 'clamshell', 'monster-walk', 'fire-hydrant', 'step-down-lateral', 'fente-croisee', 'rdl-unilateral'],
  },
  {
    id: 'ischios',
    nom: 'Ischio-jambiers',
    region: 'back',
    exos: ['sliding-leg-curl', 'hamstring-walkout', 'pull-through', 'rdl', 'rdl-unilateral', 'good-morning', 'curl-nordique', 'leg-curl-allonge', 'ghr', 'kettlebell-swing', 'hyperextension-45', 'fentes', 'squats'],
  },
  { id: 'mollets', nom: 'Mollets', region: 'back', exos: ['equilibre-unipodal', 'mollets-unilateral', 'mollets-marche', 'tibialis-raise', 'seated-tibialis-raise', 'pogo-jumps', 'mollets-debout', 'mollets-assis', 'fentes', 'step-up'] },
  { id: 'lombaires', nom: 'Lombaires (érecteurs)', region: 'back', exos: ['posture-enfant', 'superman', 'back-extension-sol', 'y-raise', 'pull-through', 'bird-dog', 'good-morning', 'hyperextension-45', 'suitcase-carry', 'reverse-hyperextension'] },
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
  // 'Rhomboïdes' et 'Trapèzes moyens' arrivent des exercices de posture : sans
  // eux dans la liste, une séance d'omoplates ne compterait pour aucune zone.
  { label: 'Dos', muscles: ['Dos', 'Rhomboïdes', 'Trapèzes moyens', 'Lombaires'] },
  { label: 'Jambes', muscles: ['Quadriceps', 'Ischios', 'Fessiers', 'Moyen fessier', 'Adducteurs', 'Mollets', 'Psoas-iliaque'] },
  { label: 'Épaules', muscles: ['Épaules', 'Rotateurs externes', 'Dentelé antérieur'] },
  // 'Avant-bras' manquait depuis le début : une séance de grip ne comptait pour
  // aucune zone. Les trois noms qui suivent viennent des exercices de poignet.
  { label: 'Bras', muscles: ['Triceps', 'Biceps', 'Avant-bras', "Extenseurs de l'avant-bras", "Fléchisseurs de l'avant-bras", 'Long abducteur du pouce'] },
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
