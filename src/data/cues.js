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

};

export const ENCOURAGEMENTS = [
  'Allez, continue !', 'Tu gères !', 'Encore un effort !', 'Beau boulot !',
  'Ne lâche rien !', 'Respire bien !', 'Reste concentré !',
];
