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
// figure moves in step with the spoken "En bas — En haut". Isometric holds set
// `cycle` explicitly, since there is no rep tempo to borrow.
//
// Besides the frames, a demo declares the equipment it is performed on:
//   scene   'ground' | 'mat' | 'bar' | 'dipbars' | 'none' — the floor and any
//           fixed apparatus, drawn by <ExerciseDemo />'s Scene.
//   props   [{ kind: 'block', x, y, w }] a bench / box / step, solid down to the
//           floor, or [{ kind: 'wall', x, top }] a wall to lean against.
//   weights true (dumbbells) | 'disc' (a loaded bar, seen edge-on) | 'kb'
//           (kettlebell) — follows the hands.
//   band       [x, y] anchor for an elastic held in the hand.
//   ankleBand  [x, y] anchor for an elastic strapped to the near ankle.
//   legBand    'ankle' | 'knee' — elastic stretched between the two legs.
//   ball       'knees' | 'ankle' — a ball squeezed between the knees, or one
//              the heels rest on.
//   hipLoad    true — a bar resting across the hips (hip thrust).
//
// Poses are stored as angles but are far easier to reason about as "hip here,
// foot there"; the lower-body set was authored by solving that with inverse
// kinematics, which is why its numbers carry a decimal.

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

  'sissy-squat': {
    scene: 'ground',
    frames: [
      // debout sur la pointe des pieds, main en appui léger
      { hip: [50, 52], torso: -90, arm: [-10, 5], leg: [90.1, 89.9], foot: 56 },
      // genoux vers l'avant, buste basculé en arrière dans l'axe des cuisses
      { hip: [47, 66], torso: -125, arm: [-15, 10], leg: [28.1, 139.2], foot: 56 },
    ],
  },

  'squat-sumo': {
    scene: 'ground',
    frames: [
      // debout, pieds très écartés, pointes ouvertes
      { hip: [50, 58], torso: -90, arm: [15, 165], leg: [77.5, 77.8], legB: [102.5, 102.2] },
      // hanches descendues entre les talons, buste vertical
      { hip: [50, 74], torso: -92, arm: [15, 165], leg: [4.1, 111.9], legB: [175.9, 68.1] },
    ],
  },

  'wall-sit': {
    scene: 'ground',
    props: [{ kind: 'wall', x: 31, top: 26 }],
    cycle: 4000,
    frames: [
      // dos au mur, cuisses parallèles au sol
      { hip: [38, 74], torso: -90, arm: [90, 90], leg: [0, 90] },
      // maintien : seule la respiration bouge
      { hip: [38, 73.4], torso: -91, arm: [90, 90], leg: [1, 89] },
    ],
  },

  'step-up': {
    scene: 'ground',
    props: [{ kind: 'block', x: 64, y: 76, w: 22 }],
    frames: [
      // pied avant posé sur la marche, poids encore au sol
      { hip: [46, 58], torso: -90, arm: [95, 95], armB: [80, 80], leg: [7.2, 89.6], legB: [100.5, 100.8] },
      // montée complète, genou opposé ramené vers l'avant
      { hip: [62, 44], torso: -90, arm: [75, 75], armB: [105, 105], leg: [89.9, 90.1], legB: [0, 90] },
    ],
  },

  'leg-extension': {
    scene: 'ground',
    props: [{ kind: 'block', x: 40, y: 72, w: 26 }],
    ball: 'ankle',
    frames: [
      // assis, dos calé, genoux fléchis, rouleau aux chevilles
      { hip: [44, 70], torso: -90, arm: [90, 90], leg: [0, 90] },
      // jambes tendues à l'horizontale
      { hip: [44, 70], torso: -90, arm: [90, 90], leg: [0, 0] },
    ],
  },

  'front-squat': {
    scene: 'ground',
    weights: 'disc',
    frames: [
      // debout, barre sur le haut de la poitrine, coudes hauts
      { hip: [50, 58], torso: -90, arm: [35, -120], leg: [90.1, 89.9] },
      // descente buste vertical, coudes toujours hauts
      { hip: [46, 74], torso: -85, arm: [40, -115], leg: [17, 134.9] },
    ],
  },

  'squat-talons-sureleves': {
    scene: 'ground',
    props: [{ kind: 'block', x: 44, y: 84, w: 14 }],
    frames: [
      // debout, talons sur la cale
      { hip: [46, 54], torso: -90, arm: [80, 80], leg: [90.1, 89.9], foot: 27 },
      // squat profond, buste vertical, genoux libres d'avancer
      { hip: [44, 72], torso: -88, arm: [-5, 0], leg: [18.1, 145.6], foot: 27 },
    ],
  },

  'pistol-squat': {
    scene: 'ground',
    frames: [
      // debout sur une jambe, l'autre tendue devant
      { hip: [48, 58], torso: -90, arm: [-15, -10], leg: [90.1, 89.9], legB: [-8, -8] },
      // descente complète sur la jambe d'appui
      { hip: [46, 78], torso: -70, arm: [-25, -15], leg: [12.9, 148.2], legB: [-12, -12] },
    ],
  },

  'fente-arriere': {
    scene: 'ground',
    frames: [
      // debout, pieds joints
      { hip: [50, 58], torso: -90, arm: [95, 95], armB: [88, 88], leg: [90.1, 89.9], legB: [92, 88] },
      // grand pas en arrière, genou arrière près du sol
      { hip: [45, 72], torso: -90, arm: [100, 100], armB: [85, 85], leg: [8.1, 100.2], legB: [124.7, 176.4], foot: 0, footB: 72 },
    ],
  },

  'fente-croisee': {
    scene: 'ground',
    frames: [
      // debout, pieds largeur de bassin, mains devant la poitrine
      { hip: [50, 58], torso: -90, arm: [20, 160], leg: [90.1, 89.9], legB: [88, 92] },
      // jambe croisée en diagonale derrière, descente en révérence
      { hip: [48, 75], torso: -90, arm: [20, 160], leg: [0.6, 112], legB: [179.4, 68] },
    ],
  },

  'fente-laterale': {
    scene: 'ground',
    frames: [
      // debout, pieds joints
      { hip: [50, 58], torso: -90, arm: [20, 160], leg: [90.1, 89.9], legB: [92, 88] },
      // grand pas sur le côté : jambe d'appui fléchie, l'autre reste tendue
      { hip: [42, 74], torso: -70, arm: [30, 20], leg: [17, 134.9], legB: [29.6, 29.9] },
    ],
  },

  'bulgarian-split-squat': {
    scene: 'ground',
    props: [{ kind: 'block', x: 28, y: 76, w: 20 }],
    weights: true,
    frames: [
      // pied arrière posé sur le banc, jambe avant tendue
      { hip: [50, 60], torso: -90, arm: [90, 90], armB: [90, 90], leg: [63.5, 101.4], legB: [179.6, 97.2] },
      // descente verticale, cuisse avant parallèle au sol
      { hip: [50, 74], torso: -85, arm: [90, 90], armB: [90, 90], leg: [17, 134.9], legB: [229.2, 118.1] },
    ],
  },

  'rdl': {
    scene: 'ground',
    weights: 'disc',
    frames: [
      // debout, charge devant les cuisses, dos droit
      { hip: [50, 58], torso: -90, arm: [90, 90], leg: [90.1, 89.9] },
      // hanches en arrière, charge le long des tibias
      { hip: [40, 62], torso: -15, arm: [90, 90], leg: [48.6, 92] },
    ],
  },

  'rdl-unilateral': {
    scene: 'ground',
    frames: [
      // debout sur une jambe
      { hip: [50, 58], torso: -90, arm: [90, 90], armB: [88, 88], leg: [90.1, 89.9], legB: [100, 95] },
      // hanche en arrière, jambe libre tendue à l'horizontale
      { hip: [46, 62], torso: -10, arm: [90, 90], armB: [92, 92], leg: [54, 109.8], legB: [185, 185] },
    ],
  },

  'good-morning': {
    scene: 'ground',
    weights: 'disc',
    frames: [
      // debout, barre sur le haut du dos
      { hip: [50, 58], torso: -90, arm: [65, -150], leg: [90.1, 89.9] },
      // buste penché vers l'horizontale, fesses en arrière
      { hip: [42, 60], torso: -8, arm: [147, -68], leg: [61.1, 89.1] },
    ],
  },

  'curl-nordique': {
    scene: 'mat',
    frames: [
      // à genoux, corps aligné des genoux aux épaules
      { hip: [50, 74], torso: -90, arm: [30, 30], leg: [90, 180], foot: 180 },
      // descente lente du buste, retenue par les ischios
      { hip: [60.3, 77.7], torso: -50, arm: [90, 90], leg: [130, 180], foot: 180 },
    ],
  },

  'leg-curl-allonge': {
    scene: 'mat',
    ball: 'ankle',
    frames: [
      // bassin décollé, talons sur le ballon, jambes tendues
      { hip: [54, 74], torso: 152.7, arm: [10, 5], leg: [-2, 41.4] },
      // talons ramenés vers les fessiers, bassin maintenu en l'air
      { hip: [56, 68], torso: 149.7, arm: [10, 5], leg: [11.7, 127.2] },
    ],
  },

  'kettlebell-swing': {
    scene: 'ground',
    weights: 'kb',
    frames: [
      // hanches en arrière, kettlebell balancée entre les jambes
      { hip: [42, 64], torso: -35, arm: [120, 120], leg: [41.1, 104.7] },
      // extension explosive des hanches, kettlebell à hauteur de poitrine
      { hip: [50, 58], torso: -90, arm: [0, 0], leg: [90.1, 89.9] },
    ],
  },

  'ghr': {
    scene: 'ground',
    props: [{ kind: 'block', x: 38, y: 64, w: 28 }],
    frames: [
      // buste vertical, cuisses calées sur le coussin
      { hip: [42, 48], torso: -80, arm: [35, 175], leg: [90, 180], foot: 180 },
      // descente du buste vers l'horizontale, retenue par les ischios
      { hip: [58, 64], torso: 0, arm: [110, -110], leg: [180, 180], foot: 180 },
    ],
  },

  'hyperextension-45': {
    scene: 'ground',
    props: [{ kind: 'block', x: 44, y: 62, w: 18 }],
    frames: [
      // buste descendu, hanches fléchies
      { hip: [46, 60], torso: 50, arm: [160, -60], leg: [149.3, 98] },
      // remontée jusqu'à l'alignement du corps
      { hip: [46, 60], torso: -56.3, arm: [53.7, -166.3], leg: [149.3, 98] },
    ],
  },

  'abduction-elastique': {
    scene: 'ground',
    legBand: 'ankle',
    frames: [
      // debout, élastique aux chevilles, jambes proches
      { hip: [50, 58], torso: -90, arm: [95, 95], armB: [95, 95], leg: [79.5, 79.2], legB: [93.7, 93.4] },
      // jambe tendue ouverte sur le côté contre l'élastique
      { hip: [50, 58], torso: -90, arm: [95, 95], armB: [95, 95], leg: [58.5, 31.5], legB: [93.7, 93.4] },
    ],
  },

  'clamshell': {
    scene: 'mat',
    legBand: 'knee',
    frames: [
      // couché sur le côté, hanches et genoux à 90°, pieds joints
      { hip: [50, 86], torso: 180, arm: [175, 175], armB: [0, 0], leg: [-14, 146], legB: [-10, 150] },
      // genou du haut ouvert, pieds toujours collés
      { hip: [50, 86], torso: 180, arm: [175, 175], armB: [0, 0], leg: [-45, 118], legB: [-10, 150] },
    ],
  },

  'monster-walk': {
    scene: 'ground',
    legBand: 'ankle',
    frames: [
      // demi-squat maintenu, élastique en tension
      { hip: [50, 70], torso: -80, arm: [20, 10], leg: [17.8, 109.1], legB: [64.1, 159.5] },
      // pas latéral sans jamais relâcher la tension
      { hip: [50, 70], torso: -80, arm: [20, 10], leg: [15.2, 80.8], legB: [44.6, 146.8] },
    ],
  },

  'fire-hydrant': {
    scene: 'mat',
    frames: [
      // à quatre pattes, dos neutre
      { hip: [41, 73], torso: -21, arm: [90, 90], armB: [88, 88], leg: [90, 180], legB: [92, 178], foot: 180, footB: 180 },
      // genou plié levé jusqu'à hauteur de hanche
      { hip: [41, 73], torso: -21, arm: [90, 90], armB: [88, 88], leg: [-45, 120], legB: [92, 178], footB: 180 },
    ],
  },

  'hip-thrust': {
    scene: 'ground',
    props: [{ kind: 'block', x: 26, y: 74, w: 22 }],
    hipLoad: true,
    frames: [
      // assis au sol, haut du dos calé contre le banc
      { hip: [54, 84], torso: -153.4, arm: [26.8, 26.8], leg: [-35.2, 72.1] },
      // hanches poussées au plafond, alignement épaules-hanches-genoux
      { hip: [56, 72], torso: 180, arm: [0, 0], leg: [7.1, 90] },
    ],
  },

  'hip-thrust-unilateral': {
    scene: 'ground',
    props: [{ kind: 'block', x: 26, y: 74, w: 22 }],
    frames: [
      // haut du dos calé, une jambe tendue à l'horizontale
      { hip: [54, 84], torso: -153.4, arm: [26.8, 26.8], leg: [-35.2, 72.1], legB: [-25, -25] },
      // poussée des hanches sur une seule jambe
      { hip: [56, 72], torso: 180, arm: [0, 0], leg: [7.1, 90], legB: [-15, -15] },
    ],
  },

  'glute-bridge': {
    scene: 'mat',
    frames: [
      // allongé sur le dos, genoux fléchis, bassin au sol
      { hip: [56, 86], torso: 180, arm: [5, 5], leg: [-42.3, 67.3] },
      // bassin monté jusqu'à l'alignement épaules-hanches-genoux
      { hip: [54, 76], torso: 157.4, arm: [5, 5], leg: [-5.3, 75.3] },
    ],
  },

  'glute-bridge-unilateral': {
    scene: 'mat',
    frames: [
      // un pied au sol, l'autre jambe tendue vers le plafond
      { hip: [56, 86], torso: 180, arm: [5, 5], leg: [-42.3, 67.3], legB: [-60, -60] },
      // bassin monté sur la seule jambe d'appui
      { hip: [54, 76], torso: 157.4, arm: [5, 5], leg: [-5.3, 75.3], legB: [-60, -60] },
    ],
  },

  'kickback-elastique': {
    scene: 'ground',
    ankleBand: [86, 86],
    frames: [
      // debout, élastique fixé à la cheville, jambe ramenée
      { hip: [46, 58], torso: -90, arm: [80, 80], armB: [80, 80], leg: [70.3, 95], legB: [89.9, 90.1] },
      // extension de hanche : jambe tendue vers l'arrière
      { hip: [46, 58], torso: -78, arm: [80, 80], armB: [80, 80], leg: [127.6, 127.6], legB: [90.1, 89.9] },
    ],
  },

  'frog-pump': {
    scene: 'mat',
    frames: [
      // allongé sur le dos, plantes de pieds jointes, genoux ouverts
      { hip: [56, 86], torso: 180, arm: [5, 5], leg: [-61, 89.1], legB: [-54.3, 87.7] },
      // bassin monté, genoux maintenus ouverts
      { hip: [54, 76], torso: 157.4, arm: [5, 5], leg: [-10.6, 111], legB: [-9.1, 103.7] },
    ],
  },

  'adduction-sol': {
    scene: 'mat',
    frames: [
      // couché sur le côté, jambe du bas tendue au sol
      { hip: [56, 86], torso: 180, arm: [175, 175], armB: [0, 0], leg: [5, 5], legB: [-35, 100] },
      // jambe du bas remontée par l'intérieur de cuisse
      { hip: [56, 86], torso: 180, arm: [175, 175], armB: [0, 0], leg: [-30, -30], legB: [-35, 100] },
    ],
  },

  'copenhagen': {
    scene: 'ground',
    props: [{ kind: 'block', x: 72, y: 76, w: 22 }],
    cycle: 4000,
    frames: [
      // planche latérale, jambe du haut posée sur le banc, bassin bas
      { hip: [60, 82], torso: -162.9, arm: [90, 0], armB: [95, 5], leg: [26.2, -61.5], legB: [34, 34] },
      // bassin monté jusqu'à l'alignement du corps
      { hip: [60, 74], torso: 180, arm: [90, 0], armB: [95, 5], leg: [49.1, -43.9], legB: [30.3, 30.3] },
    ],
  },

  'serrage-ballon': {
    scene: 'mat',
    ball: 'knees',
    cycle: 3000,
    frames: [
      // allongé, genoux fléchis, ballon entre les genoux
      { hip: [56, 86], torso: 180, arm: [5, 5], leg: [-47, 78.9], legB: [-44.9, 73] },
      // serrage maintenu, bassin immobile
      { hip: [56, 85.4], torso: 179, arm: [5, 5], leg: [-44.4, 80.8], legB: [-43.6, 77.7] },
    ],
  },

  'mollets-debout': {
    scene: 'ground',
    props: [{ kind: 'block', x: 64, y: 80, w: 20 }],
    frames: [
      // avant-pied sur la marche, talon descendu en étirement
      { hip: [51, 51], torso: -90, arm: [80, 86], leg: [90.1, 89.9], foot: -31 },
      // montée maximale sur la pointe des pieds
      { hip: [52, 42], torso: -90, arm: [80, 86], leg: [90.1, 89.9], foot: 56 },
    ],
  },

  'mollets-assis': {
    scene: 'ground',
    props: [{ kind: 'block', x: 38, y: 72, w: 24 }, { kind: 'block', x: 66, y: 84, w: 14 }],
    frames: [
      // assis, genoux à 90°, pieds à plat
      { hip: [44, 70], torso: -90, arm: [90, 90], leg: [-3.5, 86.3], foot: 15 },
      // talons montés le plus haut possible
      { hip: [44, 70], torso: -90, arm: [90, 90], leg: [-33.8, 83.9], foot: 58 },
    ],
  },

  // --- Isolations du haut du corps, ajoutées après coup --------------------
  // Debout, hanche à y=58 : cuisse 16 + tibia 16 sous le sol à y=90.
  //
  // De profil, une silhouette debout bras le long du corps se réduit à un
  // trait vertical : bras, tronc et jambes se superposent. Les membres sont
  // donc légèrement écartés de la verticale et les deux côtés dissociés
  // (armB / legB), ce qui donne au corps une épaisseur sans lui faire prendre
  // une position qu'on ne tient pas vraiment.
  'curl-biceps': {
    scene: 'ground',
    weights: true,
    frames: [
      // bas : bras tendus le long du corps, mains à hauteur de hanche
      { hip: [50, 58], torso: -90, arm: [80, 78], armB: [95, 97], leg: [96, 84], legB: [84, 96], foot: 0 },
      // haut : coude fixe, avant-bras remonté à hauteur d'épaule
      { hip: [50, 58], torso: -90, arm: [85, -70], armB: [95, -60], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },
  // Vu de face plutôt que de profil : de profil, une élévation latérale se
  // confondrait avec une élévation frontale. Les deux bras s'écartent en T.
  'elevations-laterales': {
    scene: 'ground',
    weights: true,
    frames: [
      { hip: [50, 58], torso: -90, arm: [80, 82], armB: [100, 98], leg: [96, 84], legB: [84, 96], foot: 0 },
      { hip: [50, 58], torso: -90, arm: [5, 0], armB: [175, 180], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },
  // Coude vers l'avant plutôt qu'à la verticale : de profil, un bras tendu au
  // -dessus de la tête disparaît derrière elle et le geste ne se lit plus.
  'extension-triceps': {
    scene: 'ground',
    weights: true,
    frames: [
      // tendu : haltère au-dessus de la tête
      { hip: [50, 58], torso: -90, arm: [-60, -80], armB: [-75, -70], leg: [96, 84], legB: [84, 96], foot: 0 },
      // fléchi : coude haut et fixe, avant-bras derrière la nuque
      { hip: [50, 58], torso: -90, arm: [-60, 170], armB: [-75, 178], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },
  // Allongé : les épaules ne quittent pas le sol, seules les jambes montent —
  // c'est ce qui le distingue du crunch.
  'releve-jambes': {
    scene: 'mat',
    frames: [
      { hip: [56, 86], torso: 178, arm: [0, 0], leg: [-8, -8], foot: 0 },
      { hip: [56, 86], torso: 178, arm: [0, 0], leg: [-85, -85], foot: -85 },
    ],
  },


  // --- Pectoraux ------------------------------------------------------------
  // Les pompes inclinées/déclinées réutilisent la planche des pompes, posée
  // sur un bloc côté mains ou côté pieds.
  // Mains posées sur le bloc, pieds au sol : angles résolus en cinématique
  // inverse (scripts/solve-pose.mjs) depuis « main ici, pied là ».
  'pompes-inclinees': {
    scene: 'ground',
    props: [{ kind: 'block', x: 74, y: 72, w: 24 }],
    frames: [
      { hip: [44, 80], torso: -32, arm: [103.8, -31.8], leg: [182, 138.6], foot: 0 },
      { hip: [47, 85], torso: -24, arm: [44.3, -117.8], leg: [193.3, 147.1], foot: 0 },
    ],
  },
  // L'inverse : mains au sol, pieds sur le bloc.
  'pompes-declinees': {
    scene: 'ground',
    props: [{ kind: 'block', x: 22, y: 74, w: 24 }],
    frames: [
      { hip: [50, 80], torso: -34, arm: [96.2, 63.3], leg: [-141.4, 165.6], foot: 0 },
      { hip: [53, 86], torso: -20, arm: [156.4, 36.3], leg: [-146.3, -168.8], foot: 0 },
    ],
  },
  // Allongé sur un banc bas : les bras poussent vers le haut du cadre.
  'developpe-couche': {
    scene: 'ground',
    weights: true,
    props: [{ kind: 'block', x: 50, y: 74, w: 44 }],
    frames: [
      // bas : coudes fléchis, haltères au niveau de la poitrine
      { hip: [58, 74], torso: 178, arm: [-40, -140], armB: [-30, -150], leg: [28.3, 31.2], legB: [22, 38], foot: 0 },
      // haut : bras tendus au-dessus de la poitrine
      { hip: [58, 74], torso: 178, arm: [-88, -90], armB: [-80, -96], leg: [28.3, 31.2], legB: [22, 38], foot: 0 },
    ],
  },
  'developpe-incline': {
    scene: 'ground',
    weights: true,
    props: [{ kind: 'block', x: 52, y: 76, w: 40 }],
    frames: [
      { hip: [58, 76], torso: 200, arm: [-55, -145], armB: [-45, -155], leg: [30, 33], legB: [24, 40], foot: 0 },
      { hip: [58, 76], torso: 200, arm: [-95, -88], armB: [-85, -94], leg: [30, 33], legB: [24, 40], foot: 0 },
    ],
  },
  // Au sol : les bras s'ouvrent jusqu'au plancher puis se referment.
  'ecartes-halteres': {
    scene: 'mat',
    weights: true,
    frames: [
      // ouvert : coudes au sol de part et d'autre
      { hip: [56, 86], torso: 178, arm: [-10, 10], armB: [-170, -190], leg: [-40, 70], legB: [-48, 76], foot: 0 },
      // fermé : haltères réunis au-dessus de la poitrine
      { hip: [56, 86], torso: 178, arm: [-80, -85], armB: [-100, -95], leg: [-40, 70], legB: [-48, 76], foot: 0 },
    ],
  },
  'pull-over': {
    scene: 'mat',
    weights: true,
    frames: [
      // au-dessus de la poitrine
      { hip: [56, 86], torso: 178, arm: [-85, -88], armB: [-95, -92], leg: [-40, 70], legB: [-48, 76], foot: 0 },
      // derrière la tête, bras presque tendus
      { hip: [56, 86], torso: 178, arm: [-150, -160], armB: [-158, -168], leg: [-40, 70], legB: [-48, 76], foot: 0 },
    ],
  },

  // --- Dos ------------------------------------------------------------------
  // Buste penché : le tronc pointe vers l'avant-bas, les bras pendent sous
  // l'épaule et remontent vers la hanche.
  'rowing-halteres-un-bras': {
    scene: 'ground',
    weights: true,
    props: [{ kind: 'block', x: 30, y: 66, w: 24 }],
    frames: [
      // bas : bras tendu vers le sol
      { hip: [56, 66], torso: 200, arm: [88, 90], armB: [96, 92], leg: [92, 88], legB: [70, 110], foot: 0 },
      // haut : coude tiré vers l'arrière, main à la hanche
      { hip: [56, 66], torso: 200, arm: [30, 150], armB: [96, 92], leg: [92, 88], legB: [70, 110], foot: 0 },
    ],
  },
  'rowing-halteres-buste-penche': {
    scene: 'ground',
    weights: true,
    frames: [
      { hip: [52, 62], torso: 205, arm: [88, 90], armB: [95, 84], leg: [88, 92], legB: [80, 100], foot: 0 },
      { hip: [52, 62], torso: 205, arm: [25, 145], armB: [32, 138], leg: [88, 92], legB: [80, 100], foot: 0 },
    ],
  },
  // Suspendu sous une barre basse : le corps est une planche, les bras montent.
  'rowing-inverse': {
    scene: 'bar',
    frames: [
      { hip: [50, 74], torso: 168, arm: [-70, -70], armB: [-76, -64], leg: [8, 4], legB: [2, 10], foot: -80 },
      { hip: [50, 68], torso: 172, arm: [-120, -30], armB: [-126, -24], leg: [6, 2], legB: [0, 8], foot: -80 },
    ],
  },
  'tirage-vertical-elastique': {
    scene: 'ground',
    band: [50, 8],
    frames: [
      { hip: [50, 58], torso: -92, arm: [-78, -84], armB: [-96, -88], leg: [96, 84], legB: [84, 96], foot: 0 },
      { hip: [50, 58], torso: -92, arm: [-40, 150], armB: [-130, 30], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },
  'face-pull': {
    scene: 'ground',
    band: [90, 30],
    frames: [
      { hip: [50, 58], torso: -90, arm: [-8, -4], armB: [-14, 2], leg: [96, 84], legB: [84, 96], foot: 0 },
      { hip: [50, 58], torso: -90, arm: [-60, 20], armB: [-120, 160], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },

  // --- Deltoïdes ------------------------------------------------------------
  // Oiseau : buste penché à l'horizontale, bras qui s'écartent de part et
  // d'autre — vu de face pour que l'écartement se lise.
  'oiseau-halteres': {
    scene: 'ground',
    weights: true,
    frames: [
      { hip: [52, 62], torso: 200, arm: [88, 92], armB: [92, 88], leg: [88, 92], legB: [80, 100], foot: 0 },
      { hip: [52, 62], torso: 200, arm: [10, 2], armB: [170, 178], leg: [88, 92], legB: [80, 100], foot: 0 },
    ],
  },
  // Vu de face : bras rapprochés en V, puis grands ouverts en T. De profil,
  // l'écartement se confondrait avec le tronc.
  'oiseau-elastique': {
    scene: 'ground',
    frames: [
      { hip: [50, 58], torso: -90, arm: [58, 52], armB: [122, 128], leg: [96, 84], legB: [84, 96], foot: 0 },
      { hip: [50, 58], torso: -90, arm: [2, -2], armB: [178, 182], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },
  'developpe-arnold': {
    scene: 'ground',
    weights: true,
    frames: [
      // devant la poitrine, coudes bas
      { hip: [50, 58], torso: -90, arm: [140, 20], armB: [40, 160], leg: [96, 84], legB: [84, 96], foot: 0 },
      // au-dessus de la tête, bras tendus
      { hip: [50, 58], torso: -90, arm: [-70, -84], armB: [-110, -96], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },
  'elevation-frontale': {
    scene: 'ground',
    weights: true,
    frames: [
      { hip: [50, 58], torso: -90, arm: [84, 80], armB: [96, 100], leg: [96, 84], legB: [84, 96], foot: 0 },
      { hip: [50, 58], torso: -90, arm: [2, -4], armB: [10, 4], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },

  // --- Biceps ---------------------------------------------------------------
  'curl-marteau': {
    scene: 'ground', weights: true,
    frames: [
      { hip: [50, 58], torso: -90, arm: [80, 78], armB: [95, 97], leg: [96, 84], legB: [84, 96], foot: 0 },
      { hip: [50, 58], torso: -90, arm: [85, -70], armB: [95, -60], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },
  // Dossier incliné : le buste est couché en arrière et les bras pendent
  // derrière la ligne du corps.
  'curl-incline': {
    scene: 'ground', weights: true,
    props: [{ kind: 'block', x: 44, y: 60, w: 26 }],
    frames: [
      { hip: [54, 60], torso: -140, arm: [95, 92], armB: [88, 100], leg: [30, 34], legB: [24, 40], foot: 0 },
      { hip: [54, 60], torso: -140, arm: [95, -20], armB: [88, -30], leg: [30, 34], legB: [24, 40], foot: 0 },
    ],
  },
  // Assis, buste penché, coude calé contre la cuisse.
  'curl-concentration': {
    scene: 'ground', weights: true,
    props: [{ kind: 'block', x: 44, y: 70, w: 28 }],
    frames: [
      { hip: [48, 70], torso: -60, arm: [70, 88], armB: [140, 120], leg: [10, 80], legB: [4, 86], foot: 0 },
      { hip: [48, 70], torso: -60, arm: [70, -40], armB: [140, 120], leg: [10, 80], legB: [4, 86], foot: 0 },
    ],
  },
  'curl-elastique': {
    scene: 'ground', band: [50, 90],
    frames: [
      { hip: [50, 58], torso: -90, arm: [82, 80], armB: [96, 98], leg: [96, 84], legB: [84, 96], foot: 0 },
      { hip: [50, 58], torso: -90, arm: [86, -68], armB: [96, -58], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },
  'curl-inverse': {
    scene: 'ground', weights: true,
    frames: [
      { hip: [50, 58], torso: -90, arm: [78, 76], armB: [94, 96], leg: [96, 84], legB: [84, 96], foot: 0 },
      { hip: [50, 58], torso: -90, arm: [88, -66], armB: [96, -56], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },

  // --- Triceps --------------------------------------------------------------
  'extension-triceps-unilaterale': {
    scene: 'ground', weights: true,
    frames: [
      { hip: [50, 58], torso: -90, arm: [-60, -80], armB: [-20, 30], leg: [96, 84], legB: [84, 96], foot: 0 },
      { hip: [50, 58], torso: -90, arm: [-60, 170], armB: [-20, 30], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },
  'extension-triceps-elastique': {
    scene: 'ground', band: [50, 8],
    frames: [
      { hip: [50, 58], torso: -90, arm: [95, -30], armB: [88, -40], leg: [96, 84], legB: [84, 96], foot: 0 },
      { hip: [50, 58], torso: -90, arm: [92, 86], armB: [86, 80], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },
  'barre-au-front': {
    scene: 'mat', weights: true,
    frames: [
      // bras tendus à la verticale
      { hip: [56, 86], torso: 178, arm: [-88, -90], armB: [-96, -84], leg: [-40, 70], legB: [-48, 76], foot: 0 },
      // avant-bras repliés vers le front
      { hip: [56, 86], torso: 178, arm: [-88, 170], armB: [-96, 176], leg: [-40, 70], legB: [-48, 76], foot: 0 },
    ],
  },
  'pompes-diamant': {
    scene: 'ground',
    frames: [
      { hip: [46.8, 75.8], torso: -27, arm: [90, 90], leg: [165, 165], foot: 60 },
      { hip: [49, 82.5], torso: -14, arm: [64, 140], leg: [177, 177], foot: 72 },
    ],
  },

  // --- Core -----------------------------------------------------------------
  // Planche latérale : appui sur un avant-bras, corps en ligne oblique.
  'planche-laterale': {
    scene: 'mat', cycle: 4000,
    frames: [
      { hip: [50, 74], torso: -166, arm: [80, 168], armB: [-80, -100], leg: [16, 12], legB: [20, 8], foot: -70 },
      { hip: [50, 72], torso: -168, arm: [82, 170], armB: [-80, -100], leg: [14, 10], legB: [18, 6], foot: -70 },
    ],
  },
  'russian-twist': {
    scene: 'mat',
    frames: [
      // pivot d'un côté : les bras partent devant, buste incliné en arrière
      { hip: [52, 82], torso: 210, arm: [-20, 10], armB: [-14, 16], leg: [-52, 48], legB: [-58, 54], foot: 0 },
      // pivot de l'autre : les mains passent de l'autre côté du corps
      { hip: [52, 82], torso: 210, arm: [-90, -60], armB: [-84, -54], leg: [-52, 48], legB: [-58, 54], foot: 0 },
    ],
  },
  'dead-bug': {
    scene: 'mat',
    frames: [
      // bras et genoux au-dessus du corps
      { hip: [56, 86], torso: 178, arm: [-88, -90], armB: [-92, -86], leg: [-88, 0], legB: [-84, 4], foot: 0 },
      // bras et jambe opposés qui s'éloignent
      { hip: [56, 86], torso: 178, arm: [-160, -168], armB: [-92, -86], leg: [-88, 0], legB: [-20, -14], foot: 0 },
    ],
  },
  // Quatre pattes : appui mains et genoux, membres opposés tendus.
  'bird-dog': {
    scene: 'mat',
    frames: [
      { hip: [56, 70], torso: 186, arm: [80, 84], armB: [86, 90], leg: [92, 4], legB: [96, 8], foot: 0 },
      { hip: [56, 70], torso: 186, arm: [80, 84], armB: [172, 178], leg: [92, 4], legB: [8, 2], foot: 0 },
    ],
  },
  'hollow-body': {
    scene: 'mat', cycle: 3600,
    frames: [
      { hip: [56, 84], torso: 190, arm: [-170, -176], armB: [-166, -172], leg: [-16, -10], legB: [-20, -6], foot: 0 },
      { hip: [56, 85], torso: 188, arm: [-172, -178], armB: [-168, -174], leg: [-14, -8], legB: [-18, -4], foot: 0 },
    ],
  },
  'pallof-press': {
    scene: 'ground', band: [12, 40],
    frames: [
      // mains contre la poitrine
      { hip: [50, 58], torso: -90, arm: [150, 20], armB: [30, 160], leg: [96, 84], legB: [84, 96], foot: 0 },
      // bras tendus devant, buste immobile
      { hip: [50, 58], torso: -90, arm: [2, -2], armB: [6, 2], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },
  'bicycle': {
    scene: 'mat',
    frames: [
      { hip: [56, 86], torso: 190, arm: [-30, 40], armB: [-40, 30], leg: [-80, -30], legB: [-20, -6], foot: 0 },
      { hip: [56, 86], torso: 190, arm: [-40, 30], armB: [-30, 40], leg: [-20, -6], legB: [-80, -30], foot: 0 },
    ],
  },
  'v-up': {
    scene: 'mat',
    frames: [
      // à plat, bras derrière la tête
      { hip: [56, 86], torso: 178, arm: [-176, 178], armB: [-172, 174], leg: [-6, -2], legB: [-10, 2], foot: 0 },
      // en V : buste et jambes relevés, mains vers les pieds
      { hip: [56, 86], torso: 214, arm: [-16, -20], armB: [-20, -24], leg: [-58, -54], legB: [-62, -50], foot: 0 },
    ],
  },

  // --- Bas du corps : compléments -------------------------------------------
  'cyclist-squat': {
    scene: 'ground', props: [{ kind: 'block', x: 50, y: 86, w: 16 }],
    frames: [
      { hip: [50, 54], torso: -92, arm: [-4, 0], armB: [-10, 6], leg: [92, 88], legB: [86, 94], foot: 0 },
      { hip: [50, 72], torso: -95, arm: [-4, 0], armB: [-10, 6], leg: [40, 132], legB: [34, 138], foot: 0 },
    ],
  },
  'spanish-squat': {
    scene: 'ground', band: [86, 74],
    frames: [
      { hip: [50, 58], torso: -92, arm: [-6, 2], armB: [-12, 8], leg: [92, 88], legB: [86, 94], foot: 0 },
      { hip: [44, 72], torso: -80, arm: [-6, 2], armB: [-12, 8], leg: [30, 120], legB: [24, 126], foot: 0 },
    ],
  },
  'reverse-nordic': {
    scene: 'mat',
    frames: [
      // à genoux, corps vertical
      { hip: [50, 62], torso: -90, arm: [88, 92], armB: [94, 86], leg: [88, 4], legB: [92, 8], foot: 0 },
      // penché en arrière, genoux fléchis
      { hip: [54, 68], torso: -128, arm: [86, 90], armB: [92, 84], leg: [110, 8], legB: [114, 12], foot: 0 },
    ],
  },
  'pull-through': {
    scene: 'ground', band: [14, 84],
    frames: [
      // bassin reculé, buste penché
      { hip: [54, 62], torso: 208, arm: [130, 120], armB: [136, 126], leg: [78, 96], legB: [72, 102], foot: 0 },
      // hanches tendues
      { hip: [50, 58], torso: -92, arm: [100, 96], armB: [106, 102], leg: [92, 88], legB: [86, 94], foot: 0 },
    ],
  },
  'hip-thrust-pause': {
    scene: 'ground', props: [{ kind: 'block', x: 26, y: 72, w: 22 }],
    frames: [
      { hip: [52, 84], torso: 200, arm: [170, 176], armB: [176, 182], leg: [-30, 96], legB: [-60, -50], foot: 0 },
      { hip: [52, 70], torso: 196, arm: [166, 172], armB: [172, 178], leg: [-10, 84], legB: [-30, -20], foot: 0 },
    ],
  },
  'sliding-leg-curl': {
    scene: 'mat',
    frames: [
      // talons près des fessiers, bassin haut
      { hip: [50, 74], torso: 178, arm: [10, 6], armB: [16, 12], leg: [-4, 86], legB: [2, 92], foot: 0 },
      // jambes tendues, bassin toujours haut
      { hip: [50, 76], torso: 178, arm: [10, 6], armB: [16, 12], leg: [26, 30], legB: [32, 36], foot: 0 },
    ],
  },
  'hamstring-walkout': {
    scene: 'mat',
    frames: [
      { hip: [50, 74], torso: 178, arm: [8, 4], armB: [14, 10], leg: [4, 84], legB: [10, 90], foot: 0 },
      { hip: [50, 76], torso: 178, arm: [8, 4], armB: [14, 10], leg: [20, 44], legB: [26, 50], foot: 0 },
    ],
  },
  'copenhagen-dynamique': {
    scene: 'mat', props: [{ kind: 'block', x: 74, y: 74, w: 20 }],
    frames: [
      { hip: [50, 82], torso: -160, arm: [80, 166], armB: [-80, -100], leg: [-8, -14], legB: [30, 40], foot: -70 },
      { hip: [50, 72], torso: -170, arm: [84, 172], armB: [-80, -100], leg: [2, -2], legB: [40, 50], foot: -70 },
    ],
  },
  'copenhagen-genou-flechi': {
    scene: 'mat', cycle: 4000, props: [{ kind: 'block', x: 70, y: 78, w: 18 }],
    frames: [
      { hip: [50, 76], torso: -168, arm: [82, 170], armB: [-80, -100], leg: [-2, 60], legB: [30, 44], foot: -60 },
      { hip: [50, 74], torso: -170, arm: [84, 172], armB: [-80, -100], leg: [0, 58], legB: [32, 42], foot: -60 },
    ],
  },
  'adduction-debout-elastique': {
    scene: 'ground', ankleBand: [90, 88],
    frames: [
      { hip: [50, 58], torso: -90, arm: [88, 92], armB: [96, 100], leg: [70, 74], legB: [92, 88], foot: 0 },
      { hip: [50, 58], torso: -90, arm: [88, 92], armB: [96, 100], leg: [98, 100], legB: [92, 88], foot: 0 },
    ],
  },
  'mollets-unilateral': {
    scene: 'ground',
    frames: [
      { hip: [50, 58], torso: -90, arm: [80, 84], armB: [100, 96], leg: [90, 90], legB: [60, 130], foot: -10 },
      { hip: [50, 50], torso: -90, arm: [80, 84], armB: [100, 96], leg: [90, 90], legB: [60, 130], foot: 60 },
    ],
  },
  'mollets-marche': {
    scene: 'ground', props: [{ kind: 'block', x: 62, y: 78, w: 22 }],
    frames: [
      { hip: [52, 50], torso: -90, arm: [80, 86], armB: [96, 92], leg: [90.1, 89.9], legB: [88, 92], foot: -35 },
      { hip: [52, 40], torso: -90, arm: [80, 86], armB: [96, 92], leg: [90.1, 89.9], legB: [88, 92], foot: 55 },
    ],
  },
  'tibialis-raise': {
    scene: 'ground', props: [{ kind: 'wall', x: 26, top: 24 }],
    frames: [
      { hip: [40, 60], torso: -100, arm: [92, 96], armB: [98, 102], leg: [70, 78], legB: [66, 82], foot: 10 },
      { hip: [40, 60], torso: -100, arm: [92, 96], armB: [98, 102], leg: [70, 78], legB: [66, 82], foot: -70 },
    ],
  },

  // --- Avant-bras et grip ---------------------------------------------------
  'farmer-walk': {
    scene: 'ground', weights: true,
    frames: [
      { hip: [48, 58], torso: -90, arm: [78, 76], armB: [100, 102], leg: [70, 108], legB: [110, 72], foot: 0 },
      { hip: [52, 58], torso: -90, arm: [80, 78], armB: [98, 100], leg: [110, 72], legB: [70, 108], foot: 0 },
    ],
  },
  'dead-hang': {
    scene: 'bar', cycle: 3600,
    frames: [
      { hip: [50, 62], torso: -92, arm: [-86, -90], armB: [-94, -88], leg: [88, 92], legB: [92, 88], foot: 20 },
      { hip: [50, 64], torso: -90, arm: [-88, -92], armB: [-92, -86], leg: [90, 90], legB: [90, 90], foot: 20 },
    ],
  },
  // Assis, avant-bras posés sur les cuisses : seul le poignet bouge.
  'wrist-curl': {
    scene: 'ground', weights: true,
    props: [{ kind: 'block', x: 46, y: 72, w: 28 }],
    frames: [
      { hip: [44, 72], torso: -80, arm: [10, 60], armB: [16, 66], leg: [4, 86], legB: [-2, 92], foot: 0 },
      { hip: [44, 72], torso: -80, arm: [10, -30], armB: [16, -24], leg: [4, 86], legB: [-2, 92], foot: 0 },
    ],
  },
  'reverse-wrist-curl': {
    scene: 'ground', weights: true,
    props: [{ kind: 'block', x: 46, y: 72, w: 28 }],
    frames: [
      { hip: [44, 72], torso: -80, arm: [10, 40], armB: [16, 46], leg: [4, 86], legB: [-2, 92], foot: 0 },
      { hip: [44, 72], torso: -80, arm: [10, -20], armB: [16, -14], leg: [4, 86], legB: [-2, 92], foot: 0 },
    ],
  },
  'pinch-grip': {
    scene: 'ground', weights: true, cycle: 3600,
    frames: [
      { hip: [50, 58], torso: -90, arm: [76, 74], armB: [102, 104], leg: [96, 84], legB: [84, 96], foot: 0 },
      { hip: [50, 59], torso: -90, arm: [78, 76], armB: [100, 102], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },

  // --- Trapèzes -------------------------------------------------------------
  // Le buste monte de quatre unités : ce sont les épaules qui haussent.
  'shrugs': {
    scene: 'ground', weights: true,
    frames: [
      { hip: [50, 58], torso: -86, arm: [76, 74], armB: [102, 104], leg: [96, 84], legB: [84, 96], foot: 0 },
      { hip: [50, 58], torso: -94, arm: [72, 70], armB: [106, 108], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },
  // Allongé face au sol : les bras montent en Y devant la tête.
  'y-raise': {
    scene: 'mat',
    frames: [
      { hip: [58, 86], torso: 182, arm: [186, 190], armB: [178, 174], leg: [-2, 2], legB: [2, -2], foot: 0 },
      { hip: [58, 86], torso: 182, arm: [200, 206], armB: [164, 158], leg: [-2, 2], legB: [2, -2], foot: 0 },
    ],
  },
  'rowing-coudes-ouverts': {
    scene: 'ground', weights: true,
    frames: [
      { hip: [52, 62], torso: 205, arm: [88, 90], armB: [95, 84], leg: [88, 92], legB: [80, 100], foot: 0 },
      { hip: [52, 62], torso: 205, arm: [-10, 100], armB: [-4, 106], leg: [88, 92], legB: [80, 100], foot: 0 },
    ],
  },

  // --- Lombaires ------------------------------------------------------------
  // Sur le ventre : le tronc et les membres décollent de quelques centimètres.
  'superman': {
    scene: 'mat',
    frames: [
      { hip: [56, 86], torso: 182, arm: [186, 188], armB: [180, 178], leg: [-2, 2], legB: [2, -2], foot: 0 },
      { hip: [56, 86], torso: 192, arm: [196, 198], armB: [190, 188], leg: [-14, -10], legB: [-10, -14], foot: 0 },
    ],
  },
  'back-extension-sol': {
    scene: 'mat',
    frames: [
      { hip: [56, 86], torso: 182, arm: [150, 120], armB: [156, 126], leg: [-2, 2], legB: [2, -2], foot: 0 },
      { hip: [56, 86], torso: 196, arm: [164, 134], armB: [170, 140], leg: [-2, 2], legB: [2, -2], foot: 0 },
    ],
  },
  'suitcase-carry': {
    scene: 'ground', weights: true,
    frames: [
      { hip: [48, 58], torso: -90, arm: [82, 80], armB: [98, 100], leg: [70, 108], legB: [110, 72], foot: 0 },
      { hip: [52, 58], torso: -90, arm: [84, 82], armB: [96, 98], leg: [110, 72], legB: [70, 108], foot: 0 },
    ],
  },
  'reverse-hyperextension': {
    scene: 'ground',
    props: [{ kind: 'block', x: 40, y: 56, w: 24 }],
    frames: [
      { hip: [46, 58], torso: -168, arm: [140, 100], leg: [130, 172] },
      { hip: [46, 58], torso: -168, arm: [140, 100], leg: [80, 100] },
    ],
  },

  // --- Grand dorsal : compléments --------------------------------------------
  'tirage-horizontal-elastique-assis': {
    scene: 'mat',
    band: [80, 82],
    frames: [
      { hip: [44, 82], torso: -90, arm: [15, 20], leg: [0, 0], foot: 0 },
      { hip: [44, 82], torso: -90, arm: [165, -15], leg: [0, 0], foot: 0 },
    ],
  },
  'traction-supination': {
    scene: 'bar',
    frames: [
      { hip: [50, 64], torso: -90, arm: [-90, -90], leg: [85, 140], foot: 120 },
      { hip: [50, 50], torso: -90, arm: [-30, -150], leg: [85, 140], foot: 120 },
    ],
  },
  'traction-neutre': {
    scene: 'bar',
    frames: [
      { hip: [50, 64], torso: -90, arm: [-88, -92], leg: [86, 138], foot: 118 },
      { hip: [50, 51], torso: -90, arm: [-34, -146], leg: [86, 138], foot: 118 },
    ],
  },
  'traction-negative': {
    scene: 'bar',
    frames: [
      { hip: [50, 52], torso: -90, arm: [-32, -148], leg: [85, 140], foot: 120 },
      { hip: [50, 64], torso: -90, arm: [-90, -90], leg: [85, 140], foot: 120 },
    ],
  },
  'traction-assistee-elastique': {
    scene: 'bar',
    frames: [
      { hip: [50, 63], torso: -90, arm: [-87, -93], leg: [84, 136], foot: 116 },
      { hip: [50, 53], torso: -90, arm: [-35, -145], leg: [84, 136], foot: 116 },
    ],
  },
  'straight-arm-pulldown-elastique': {
    scene: 'ground',
    band: [50, 5],
    frames: [
      { hip: [50, 58], torso: -90, arm: [-75, -85], leg: [92, 88], foot: 0 },
      { hip: [50, 58], torso: -90, arm: [75, 65], leg: [92, 88], foot: 0 },
    ],
  },
  'pulldown-genoux-elastique': {
    scene: 'ground',
    band: [50, 5],
    frames: [
      { hip: [50, 72], torso: -90, arm: [-78, -84], leg: [100, 170], foot: 0 },
      { hip: [50, 72], torso: -90, arm: [-40, 150], leg: [100, 170], foot: 0 },
    ],
  },

  // --- Trapèzes : compléments -------------------------------------------------
  'trap-3-raise': {
    scene: 'mat',
    frames: [
      { hip: [58, 86], torso: 182, arm: [152, 156], armB: [148, 152], leg: [-2, 2], legB: [2, -2], foot: 0 },
      { hip: [58, 86], torso: 182, arm: [168, 172], armB: [164, 168], leg: [-2, 2], legB: [2, -2], foot: 0 },
    ],
  },
  'prone-t-raise': {
    scene: 'mat',
    frames: [
      { hip: [58, 86], torso: 182, arm: [100, 104], armB: [96, 100], leg: [-2, 2], legB: [2, -2], foot: 0 },
      { hip: [58, 86], torso: 182, arm: [116, 120], armB: [112, 116], leg: [-2, 2], legB: [2, -2], foot: 0 },
    ],
  },
  'prone-w-raise': {
    scene: 'mat',
    frames: [
      { hip: [58, 86], torso: 182, arm: [92, 150], armB: [88, 146], leg: [-2, 2], legB: [2, -2], foot: 0 },
      { hip: [58, 86], torso: 182, arm: [92, 180], armB: [88, 176], leg: [-2, 2], legB: [2, -2], foot: 0 },
    ],
  },
  'scapular-push-up': {
    scene: 'ground',
    frames: [
      { hip: [47, 76], torso: -22, arm: [90, 90], armB: [88, 88], leg: [168, 168], legB: [172, 172], foot: 60 },
      { hip: [47, 78], torso: -10, arm: [86, 86], armB: [84, 84], leg: [172, 172], legB: [176, 176], foot: 62 },
    ],
  },
  'scapular-pull-up': {
    scene: 'bar',
    frames: [
      { hip: [50, 66], torso: -90, arm: [-88, -90], armB: [-92, -88], leg: [88, 92], legB: [92, 88], foot: 20 },
      { hip: [50, 58], torso: -90, arm: [-87, -91], armB: [-91, -87], leg: [89, 91], legB: [91, 89], foot: 20 },
    ],
  },

  // --- Abdominaux suspendus ----------------------------------------------------
  'hanging-knee-raise': {
    scene: 'bar',
    frames: [
      { hip: [50, 64], torso: -90, arm: [-88, -92], leg: [85, 140], foot: 120 },
      { hip: [50, 64], torso: -90, arm: [-88, -92], leg: [-30, 80], foot: 40 },
    ],
  },
  'hanging-leg-raise': {
    scene: 'bar',
    frames: [
      { hip: [50, 64], torso: -90, arm: [-88, -92], leg: [85, 140], foot: 120 },
      { hip: [50, 64], torso: -90, arm: [-88, -92], leg: [-5, 10], foot: 0 },
    ],
  },
  'toes-to-bar': {
    scene: 'bar',
    frames: [
      { hip: [50, 64], torso: -90, arm: [-88, -92], leg: [85, 140], foot: 120 },
      { hip: [50, 64], torso: -90, arm: [-88, -92], leg: [-85, -80], foot: -80 },
    ],
  },
  'hanging-windshield-wipers': {
    scene: 'bar',
    frames: [
      { hip: [50, 64], torso: -84, arm: [-88, -92], leg: [-8, 15], legB: [-2, 20], foot: 0, footB: 0 },
      { hip: [50, 64], torso: -96, arm: [-88, -92], leg: [-2, 20], legB: [-8, 15], foot: 0, footB: 0 },
    ],
  },
  'ab-wheel-rollout': {
    scene: 'mat',
    frames: [
      { hip: [54, 74], torso: -75, arm: [15, 15], leg: [105, 165], foot: 0 },
      { hip: [46, 82], torso: -20, arm: [75, 15], leg: [105, 165], foot: 0 },
    ],
  },

  // --- Mollets : compléments ---------------------------------------------------
  'seated-tibialis-raise': {
    scene: 'ground',
    props: [{ kind: 'block', x: 38, y: 72, w: 24 }, { kind: 'block', x: 66, y: 84, w: 14 }],
    frames: [
      { hip: [44, 70], torso: -90, arm: [90, 90], leg: [-3.5, 86.3], foot: 10 },
      { hip: [44, 70], torso: -90, arm: [90, 90], leg: [-3.5, 86.3], foot: -65 },
    ],
  },
  'pogo-jumps': {
    scene: 'ground',
    frames: [
      { hip: [50, 58], torso: -90, arm: [80, 84], leg: [90, 90], foot: 0 },
      { hip: [50, 50], torso: -90, arm: [76, 80], leg: [92, 92], foot: 20 },
    ],
  },

  // --- Moyen fessier : compléments ----------------------------------------------
  'step-down-lateral': {
    scene: 'ground',
    props: [{ kind: 'block', x: 40, y: 74, w: 22 }],
    frames: [
      { hip: [40, 58], torso: -90, arm: [80, 84], armB: [100, 96], leg: [88, 88], legB: [40, 145], foot: 0, footB: -40 },
      { hip: [40, 70], torso: -90, arm: [80, 84], armB: [100, 96], leg: [55, 128], legB: [8, 175], foot: 0, footB: -60 },
    ],
  },

  // --- Pectoraux : compléments ---------------------------------------------------
  'pompes-elastique': {
    scene: 'ground',
    frames: [
      { hip: [46.8, 75.8], torso: -27, arm: [90, 90], leg: [165, 165], foot: 60 },
      { hip: [49, 81.8], torso: -15, arm: [52, 158], leg: [177, 177], foot: 72 },
    ],
  },

  // --- Avant-bras : compléments ---------------------------------------------------
  'wrist-roller': {
    scene: 'ground',
    weights: true,
    frames: [
      { hip: [50, 58], torso: -90, arm: [8, 4], armB: [8, -4], leg: [96, 84], legB: [84, 96], foot: 0 },
      { hip: [50, 58], torso: -90, arm: [8, -30], armB: [8, 30], leg: [96, 84], legB: [84, 96], foot: 0 },
    ],
  },
  'pronation-supination-haltere': {
    scene: 'ground', weights: true,
    props: [{ kind: 'block', x: 46, y: 72, w: 28 }],
    frames: [
      { hip: [44, 72], torso: -80, arm: [10, 20], armB: [16, 26], leg: [4, 86], legB: [-2, 92], foot: 0 },
      { hip: [44, 72], torso: -80, arm: [10, -50], armB: [16, -44], leg: [4, 86], legB: [-2, 92], foot: 0 },
    ],
  },
  'plate-wrist-curl': {
    scene: 'ground', weights: 'disc',
    props: [{ kind: 'block', x: 46, y: 72, w: 28 }],
    frames: [
      { hip: [44, 72], torso: -80, arm: [10, 60], armB: [16, 66], leg: [4, 86], legB: [-2, 92], foot: 0 },
      { hip: [44, 72], torso: -80, arm: [10, -30], armB: [16, -24], leg: [4, 86], legB: [-2, 92], foot: 0 },
    ],
  },
};

export function demoFor(exId) {
  return DEMOS[exId] || null;
}
