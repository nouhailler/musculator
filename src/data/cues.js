// Voice-coach cadence — the original ten ported from the prototype (CUES +
// ENCOUR), then extended to the whole catalogue.
//
// `beat` is the milliseconds between spoken cues while the set is running, and
// `seq` is cycled one entry per beat (see lib/voice.js). Two things constrain
// the numbers here:
//
//   - `beat` also drives the animated demo: <ExerciseDemo /> derives its loop
//     from CUES[id].beat × frames.length, so the stick figure moves in step
//     with the spoken cue. A rep exercise therefore wants a two-entry `seq`
//     matching its two keyframes — one cue per phase. Isometric holds set
//     `cycle` on the demo instead and can carry a longer `seq` of reminders.
//   - say() cancels whatever is still speaking, so a cue longer than one beat
//     gets cut off by the next. Keep them to three words at the tempos below.
export const CUES = {
  // --- Haut du corps & core ---
  pompes: { beat: 1500, seq: ['En bas', 'En haut'] },
  squats: { beat: 1500, seq: ['Descends', 'Remonte'] },
  gainage: { beat: 4000, seq: ['Gaine', 'Tiens bon', 'Respire', 'Reste solide'] },
  abdos: { beat: 1300, seq: ['Monte', 'Relâche'] },
  tractions: { beat: 2000, seq: ['Tire', 'Descends'] },
  fentes: { beat: 1600, seq: ['Descends', 'Pousse'] },
  dips: { beat: 1500, seq: ['En bas', 'En haut'] },
  developpe: { beat: 1500, seq: ['Pousse', 'Descends'] },
  rowing: { beat: 1500, seq: ['Tire', 'Relâche'] },
  mountain: { beat: 750, seq: ['Droite', 'Gauche'] },

  // --- Poussée (dominante genou) ---
  // Les mouvements à forte composante excentrique (sissy, pistol) sont
  // volontairement plus lents : c'est la descente qui fait le travail.
  'sissy-squat': { beat: 2000, seq: ['Genoux devant', 'Remonte'] },
  'squat-sumo': { beat: 1500, seq: ['Descends', 'Pousse'] },
  'wall-sit': { beat: 4000, seq: ['Tiens bon', 'Cuisses parallèles', 'Respire', 'Reste solide'] },
  'step-up': { beat: 1600, seq: ['Monte', 'Redescends'] },
  'leg-extension': { beat: 1400, seq: ['Tends', 'Contrôle'] },
  'front-squat': { beat: 1600, seq: ['Descends', 'Pousse'] },
  'squat-talons-sureleves': { beat: 1500, seq: ['Descends', 'Remonte'] },
  'pistol-squat': { beat: 2200, seq: ['Descends', 'Remonte'] },

  // --- Fentes ---
  'fente-arriere': { beat: 1800, seq: ['Pas en arrière', 'Reviens'] },
  'fente-croisee': { beat: 1800, seq: ['Croise derrière', 'Remonte'] },
  'fente-laterale': { beat: 1800, seq: ['Sur le côté', 'Pousse'] },
  'bulgarian-split-squat': { beat: 1700, seq: ['Descends', 'Pousse'] },

  // --- Hinge (dominante hanche) ---
  rdl: { beat: 1800, seq: ['Hanches en arrière', 'Remonte'] },
  'rdl-unilateral': { beat: 2000, seq: ['Penche', 'Serre les fessiers'] },
  'good-morning': { beat: 1700, seq: ['Penche', 'Remonte'] },
  'curl-nordique': { beat: 2400, seq: ['Retiens', 'Remonte'] },
  'leg-curl-allonge': { beat: 1500, seq: ['Ramène les talons', 'Tends'] },
  'kettlebell-swing': { beat: 900, seq: ['Balance', 'Explose'] },
  ghr: { beat: 2200, seq: ['Retiens', 'Remonte'] },
  'hyperextension-45': { beat: 1700, seq: ['Descends', 'Serre les fessiers'] },

  // --- Abduction ---
  'abduction-elastique': { beat: 1200, seq: ['Ouvre', 'Contrôle'] },
  clamshell: { beat: 1200, seq: ['Ouvre le genou', 'Referme'] },
  'monster-walk': { beat: 1200, seq: ['Pas de côté', 'Garde la tension'] },
  'fire-hydrant': { beat: 1200, seq: ['Lève', 'Redescends'] },

  // --- Extension de hanche ---
  'hip-thrust': { beat: 1600, seq: ['Pousse les hanches', 'Redescends'] },
  'hip-thrust-unilateral': { beat: 1700, seq: ['Pousse', 'Redescends'] },
  'glute-bridge': { beat: 1400, seq: ['Monte', 'Redescends'] },
  'glute-bridge-unilateral': { beat: 1500, seq: ['Monte', 'Redescends'] },
  'kickback-elastique': { beat: 1300, seq: ['Tends derrière', 'Reviens'] },
  'frog-pump': { beat: 1200, seq: ['Serre', 'Relâche'] },

  // --- Adducteurs ---
  'adduction-sol': { beat: 1300, seq: ['Monte', 'Redescends'] },
  copenhagen: { beat: 4000, seq: ['Gaine', 'Bassin haut', 'Respire', 'Tiens bon'] },
  'serrage-ballon': { beat: 3000, seq: ['Serre', 'Tiens', 'Respire', 'Serre encore'] },

  // --- Mollets ---
  'mollets-debout': { beat: 1300, seq: ['Monte', 'Descends lentement'] },
  'mollets-assis': { beat: 1300, seq: ['Monte', 'Redescends'] },

  // Isolations du haut du corps : la première consigne est celle du geste qui
  // commence à la première image, comme partout ailleurs ici.
  'curl-biceps': { beat: 1400, seq: ['Monte', 'Descends'] },
  'elevations-laterales': { beat: 1400, seq: ['Écarte', 'Redescends'] },
  'extension-triceps': { beat: 1500, seq: ['Fléchis', 'Tends'] },
  'releve-jambes': { beat: 1600, seq: ['Lève', 'Contrôle'] },


  // Pectoraux
  'pompes-inclinees': { beat: 1400, seq: ['En bas', 'En haut'] },
  'pompes-declinees': { beat: 1500, seq: ['En bas', 'En haut'] },
  'developpe-couche': { beat: 1500, seq: ['Pousse', 'Descends'] },
  'developpe-incline': { beat: 1500, seq: ['Pousse', 'Descends'] },
  'ecartes-halteres': { beat: 1600, seq: ['Ouvre', 'Referme'] },
  'pull-over': { beat: 1700, seq: ['Derrière', 'Ramène'] },

  // Dos
  'rowing-halteres-un-bras': { beat: 1500, seq: ['Tire', 'Descends'] },
  'rowing-halteres-buste-penche': { beat: 1500, seq: ['Tire', 'Descends'] },
  'rowing-inverse': { beat: 1500, seq: ['Tire', 'Descends'] },
  'tirage-vertical-elastique': { beat: 1500, seq: ['Tire', 'Remonte'] },
  'face-pull': { beat: 1600, seq: ['Ouvre', 'Reviens'] },

  // Deltoïdes
  'oiseau-halteres': { beat: 1500, seq: ['Écarte', 'Descends'] },
  'oiseau-elastique': { beat: 1400, seq: ['Ouvre', 'Reviens'] },
  'developpe-arnold': { beat: 1600, seq: ['Pousse', 'Descends'] },
  'elevation-frontale': { beat: 1400, seq: ['Monte', 'Descends'] },

  // Biceps
  'curl-marteau': { beat: 1400, seq: ['Monte', 'Descends'] },
  'curl-incline': { beat: 1500, seq: ['Monte', 'Descends'] },
  'curl-concentration': { beat: 1500, seq: ['Serre', 'Descends'] },
  'curl-elastique': { beat: 1300, seq: ['Monte', 'Résiste'] },
  'curl-inverse': { beat: 1500, seq: ['Monte', 'Descends'] },
  // Triceps
  'extension-triceps-unilaterale': { beat: 1500, seq: ['Fléchis', 'Tends'] },
  'extension-triceps-elastique': { beat: 1300, seq: ['Pousse', 'Remonte'] },
  'barre-au-front': { beat: 1500, seq: ['Descends', 'Tends'] },
  'pompes-diamant': { beat: 1600, seq: ['En bas', 'En haut'] },

  // Core
  'planche-laterale': { beat: 1800, seq: ['Bassin haut', 'Tiens', 'Respire'] },
  'russian-twist': { beat: 1200, seq: ['À gauche', 'À droite'] },
  'dead-bug': { beat: 1600, seq: ['Descends', 'Reviens'] },
  'bird-dog': { beat: 1600, seq: ['Tends', 'Reviens'] },
  'hollow-body': { beat: 1800, seq: ['Dos plaqué', 'Tiens', 'Respire'] },
  'pallof-press': { beat: 1500, seq: ['Tends', 'Reviens'] },
  'bicycle': { beat: 1100, seq: ['Coude genou', 'Alterne'] },
  'v-up': { beat: 1700, seq: ['Monte', 'Descends'] },

  // Bas du corps : compléments
  'cyclist-squat': { beat: 1700, seq: ['Descends', 'Remonte'] },
  'spanish-squat': { beat: 1600, seq: ['Descends', 'Remonte'] },
  'reverse-nordic': { beat: 2200, seq: ['Retiens', 'Reviens'] },
  'pull-through': { beat: 1500, seq: ['Pousse', 'Recule'] },
  'hip-thrust-pause': { beat: 2000, seq: ['Monte', 'Tiens'] },
  'sliding-leg-curl': { beat: 1800, seq: ['Tends', 'Ramène'] },
  'hamstring-walkout': { beat: 1600, seq: ['Avance', 'Reviens'] },
  'copenhagen-dynamique': { beat: 1800, seq: ['Monte', 'Descends'] },
  'copenhagen-genou-flechi': { beat: 1800, seq: ['Bassin haut', 'Tiens', 'Respire'] },
  'adduction-debout-elastique': { beat: 1400, seq: ['Ramène', 'Reviens'] },
  'mollets-unilateral': { beat: 1400, seq: ['Monte', 'Descends'] },
  'mollets-marche': { beat: 1500, seq: ['Monte', 'Étire'] },
  'tibialis-raise': { beat: 1300, seq: ['Orteils haut', 'Descends'] },

  // Avant-bras et grip
  'farmer-walk': { beat: 1200, seq: ['Avance', 'Épaules basses'] },
  'dead-hang': { beat: 1800, seq: ['Tiens', 'Respire', 'Épaules actives'] },
  'wrist-curl': { beat: 1200, seq: ['Ferme', 'Déroule'] },
  'reverse-wrist-curl': { beat: 1200, seq: ['Monte', 'Descends'] },
  'pinch-grip': { beat: 1800, seq: ['Serre', 'Tiens', 'Respire'] },
  // Trapèzes
  'shrugs': { beat: 1300, seq: ['Hausse', 'Relâche'] },
  'y-raise': { beat: 1500, seq: ['Monte', 'Descends'] },
  'rowing-coudes-ouverts': { beat: 1500, seq: ['Tire', 'Descends'] },
  // Lombaires
  'superman': { beat: 1600, seq: ['Décolle', 'Repose'] },
  'back-extension-sol': { beat: 1500, seq: ['Monte', 'Descends'] },
  'suitcase-carry': { beat: 1200, seq: ['Avance', 'Buste droit'] },
  'reverse-hyperextension': { beat: 1700, seq: ['Monte', 'Descends'] },

  // Grand dorsal : compléments
  'tirage-horizontal-elastique-assis': { beat: 1500, seq: ['Tire', 'Reviens'] },
  'traction-supination': { beat: 2000, seq: ['Tire', 'Descends'] },
  'traction-neutre': { beat: 2000, seq: ['Tire', 'Descends'] },
  'traction-negative': { beat: 2600, seq: ['En haut', 'Retiens la descente'] },
  'traction-assistee-elastique': { beat: 1900, seq: ['Tire', 'Descends'] },
  'straight-arm-pulldown-elastique': { beat: 1500, seq: ['Tire', 'Remonte'] },
  'pulldown-genoux-elastique': { beat: 1500, seq: ['Tire', 'Remonte'] },

  // Trapèzes : compléments
  'trap-3-raise': { beat: 1500, seq: ['Monte', 'Descends'] },
  'prone-t-raise': { beat: 1500, seq: ['Monte', 'Descends'] },
  'prone-w-raise': { beat: 1600, seq: ['Ouvre', 'Reviens'] },
  'scapular-push-up': { beat: 1600, seq: ['Enfonce', 'Repousse'] },
  'scapular-pull-up': { beat: 1500, seq: ['Tire les omoplates', 'Relâche'] },

  // Abdominaux suspendus
  'hanging-knee-raise': { beat: 1600, seq: ['Monte', 'Descends'] },
  'hanging-leg-raise': { beat: 1800, seq: ['Monte', 'Descends'] },
  'toes-to-bar': { beat: 1800, seq: ['Monte', 'Descends'] },
  'hanging-windshield-wipers': { beat: 1600, seq: ['À gauche', 'À droite'] },
  'ab-wheel-rollout': { beat: 1800, seq: ['Roule', 'Reviens'] },

  // Mollets : compléments
  'seated-tibialis-raise': { beat: 1300, seq: ['Orteils haut', 'Descends'] },
  'pogo-jumps': { beat: 500, seq: ['Rebondis', 'Léger'] },

  // Moyen fessier : compléments
  'step-down-lateral': { beat: 1800, seq: ['Descends', 'Remonte'] },

  // Pectoraux : compléments
  'pompes-elastique': { beat: 1500, seq: ['En bas', 'En haut'] },

  // Avant-bras : compléments
  'wrist-roller': { beat: 1400, seq: ['Enroule', 'Déroule'] },
  'pronation-supination-haltere': { beat: 1400, seq: ['Tourne', 'Reviens'] },
  'plate-wrist-curl': { beat: 1200, seq: ['Ferme', 'Déroule'] },
};

export const ENCOURAGEMENTS = [
  'Allez, continue !', 'Tu gères !', 'Encore un effort !', 'Beau boulot !',
  'Ne lâche rien !', 'Respire bien !', 'Reste concentré !',
];
