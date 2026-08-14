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
};

export function demoFor(exId) {
  return DEMOS[exId] || null;
}
