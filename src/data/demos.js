// Animated exercise demonstrations — keyframe poses for the stick-figure
// skeleton drawn by <ExerciseDemo />.
//
// Coordinate space: the 100×100 viewBox of the demo SVG. Angles are absolute,
// in degrees, in SVG orientation: 0 = right, 90 = down, -90 = up, 180 = left.
// Segment lengths live in SKELETON below; a pose only carries the hip position
// plus one angle per joint, and forward kinematics places the rest.
//
// A pose is:
//   hip   [x, y]      pelvis position
//   torso angle hip → shoulder (head and arms hang off the shoulder)
//   arm   [upper, fore]   near-side arm: shoulder → elbow → hand
//   armB  [upper, fore]   far-side arm (drawn behind, dimmed); defaults to arm
//   leg   [thigh, shin]   near-side leg: hip → knee → ankle
//   legB  [thigh, shin]   far-side leg; defaults to leg
//   foot / footB  ankle → toe
//
// Frames loop cyclically (last frame eases back into the first), so a two-frame
// exercise is simply [top, bottom]. `cycle` is the full loop in ms; when absent
// it is derived from the voice cadence (CUES[id].beat × frames.length) so the
// figure moves in step with the spoken "En bas — En haut".

export const SKELETON = {
  torso: 26, neck: 8.5, head: 6.5,
  upperArm: 13, foreArm: 13,
  thigh: 16, shin: 16, foot: 6,
};

export const GROUND = 90;

export const DEMOS = {
  pompes: {
    scene: 'ground',
    frames: [
      // haut : bras tendus, corps en planche
      { hip: [46.8, 75.8], torso: -27, arm: [90, 90], leg: [165, 165], foot: 60 },
      // bas : coudes fléchis vers l'arrière, poitrine près du sol
      { hip: [49, 81.8], torso: -15, arm: [52, 158], leg: [177, 177], foot: 72 },
    ],
  },

  squats: {
    scene: 'ground',
    frames: [
      // debout, bras le long du corps
      { hip: [50, 58], torso: -90, arm: [85, 85], leg: [90, 90], foot: 0 },
      // bas : hanches en arrière, buste penché, bras tendus devant
      { hip: [42, 72], torso: -62, arm: [-8, 0], leg: [14, 118], foot: 0 },
    ],
  },

  gainage: {
    scene: 'mat',
    cycle: 4000, // maintien statique : seule la respiration bouge
    frames: [
      { hip: [44.2, 80.2], torso: -7, arm: [90, 0], leg: [173, 173], foot: 60 },
      { hip: [44.2, 79.2], torso: -9, arm: [90, 0], leg: [175, 175], foot: 62 },
    ],
  },

  abdos: {
    scene: 'mat',
    frames: [
      // dos au sol, genoux fléchis, pieds à plat
      { hip: [56, 86], torso: 178, arm: [-35, -15], leg: [-45, 80], foot: 0 },
      // crunch : buste enroulé vers les genoux
      { hip: [56, 86], torso: 212, arm: [-25, -10], leg: [-45, 80], foot: 0 },
    ],
  },

  tractions: {
    scene: 'bar',
    frames: [
      // suspension bras tendus
      { hip: [50, 64], torso: -90, arm: [-90, -90], leg: [85, 140], foot: 120 },
      // traction : menton à la barre, coudes ouverts
      { hip: [50, 52], torso: -90, arm: [-32.6, -147.4], leg: [85, 140], foot: 120 },
    ],
  },

  fentes: {
    scene: 'ground',
    frames: [
      // position fendue haute
      { hip: [50, 64], torso: -90, arm: [95, 95], leg: [38.9, 84.5], legB: [95.5, 141], foot: 0, footB: 0 },
      // descente : genou arrière près du sol
      { hip: [50, 74], torso: -90, arm: [100, 100], leg: [0.6, 97], legB: [83, 179.4], foot: 0, footB: 0 },
    ],
  },

  dips: {
    scene: 'dipbars',
    frames: [
      // haut : bras tendus sur les barres, jambes fléchies sous le corps
      { hip: [50, 48], torso: -90, arm: [78, 78], leg: [70, 130], foot: -20 },
      // bas : coudes fléchis vers l'arrière
      { hip: [50, 62], torso: -90, arm: [125.6, 3.6], leg: [60, 140], foot: -20 },
    ],
  },

  developpe: {
    scene: 'ground',
    weights: true,
    frames: [
      // haltères au niveau des épaules, coudes ouverts
      { hip: [50, 58], torso: -90, arm: [130, -72], leg: [90, 90], foot: 0 },
      // poussée bras tendus au-dessus de la tête
      { hip: [50, 58], torso: -90, arm: [-82, -86], leg: [90, 90], foot: 0 },
    ],
  },

  rowing: {
    scene: 'ground',
    band: [98, 30], // point d'ancrage de l'élastique
    frames: [
      // bras tendus devant, élastique en tension
      { hip: [50, 58], torso: -83, arm: [8, 3], leg: [92, 88], foot: 0 },
      // tirage : coudes serrés vers l'arrière
      { hip: [50, 58], torso: -83, arm: [168, -8], leg: [92, 88], foot: 0 },
    ],
  },

  mountain: {
    scene: 'ground',
    frames: [
      // genou droit ramené sous la poitrine
      { hip: [46.8, 75.8], torso: -27, arm: [90, 90], leg: [20, 165], legB: [168, 168], foot: 60, footB: 60 },
      // alternance : jambes inversées
      { hip: [46.8, 75.8], torso: -27, arm: [90, 90], leg: [168, 168], legB: [20, 165], foot: 60, footB: 60 },
    ],
  },
};

export function demoFor(exId) {
  return DEMOS[exId] || null;
}
