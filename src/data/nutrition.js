// Every tunable number of the nutrition module lives here, so the score and the
// targets can be re-tuned without hunting through the UI or the maths.

export const MEALS = [
  { key: 'petit-dejeuner', label: 'Petit-déjeuner', icon: 'sun-horizon' },
  { key: 'dejeuner', label: 'Déjeuner', icon: 'sun' },
  { key: 'collation', label: 'Collation', icon: 'cookie' },
  { key: 'diner', label: 'Dîner', icon: 'moon-stars' },
];

export const mealLabel = (key) => MEALS.find((m) => m.key === key)?.label || key;

// ---------------------------------------------------------------------------
// Daily targets
// ---------------------------------------------------------------------------

// Nutrition goal, kept separate from the training `objectif` (Prise de masse /
// Force / Tonus / Endurance) because they answer different questions — you can
// train for force while cutting.
// `recomp` is losing fat and building muscle at once — two processes running
// together, not fat converting into muscle. It needs its own numbers because
// neither neighbour fits: `maintien` asks too little protein to build while
// losing, and `seche`'s deficit is too deep to build at all. A light deficit
// carries the fat side, and the protein does the muscle side — which is why
// this goal is the one where the protein target matters more than the calorie
// one. It works best for someone new, returning, or carrying more fat; for a
// lean advanced lifter it is slow, and the app says so in the profile.
export const GOALS = [
  {
    key: 'masse', label: 'Prise de masse', kcalDelta: +0.12, proteinPerKg: 1.8,
    aide: "Surplus de 12 % et 1,8 g de protéines par kilo : construire, en acceptant de prendre un peu de gras au passage.",
  },
  {
    key: 'recomp', label: 'Recomposition', kcalDelta: -0.05, proteinPerKg: 2.0,
    aide: "Déficit léger de 5 % et 2 g de protéines par kilo : perdre du gras et gagner du muscle en même temps. Le gras ne se transforme pas en muscle — ce sont deux processus menés de front, et ici c'est la protéine qui fait le travail, pas l'écart calorique. Efficace en reprise, en début de pratique ou avec du gras à perdre ; lent si tu es déjà sec et entraîné.",
  },
  {
    key: 'maintien', label: 'Maintien', kcalDelta: 0, proteinPerKg: 1.6,
    aide: "Ni surplus ni déficit, 1,6 g de protéines par kilo : tenir son poids et sa masse musculaire.",
  },
  {
    key: 'seche', label: 'Sèche', kcalDelta: -0.18, proteinPerKg: 2.0,
    aide: "Déficit franc de 18 % et 2 g de protéines par kilo : perdre du gras vite, en préservant le muscle. Trop creusé pour en gagner.",
  },
];

export const DEFAULT_GOAL = 'maintien';
// Resolved by key, never by position: GOALS is ordered for the picker, so a
// positional fallback silently changes meaning the day a goal is inserted.
export const goalDef = (key) => GOALS.find((g) => g.key === key)
  || GOALS.find((g) => g.key === DEFAULT_GOAL);

// Activity multiplier applied to BMR, picked from the profile's weekly training
// frequency — the app already asks for it, so there is nothing new to fill in.
export const ACTIVITY_BY_FREQUENCY = [1.2, 1.3, 1.375, 1.45, 1.55, 1.65, 1.725, 1.8];

// Fallbacks when the profile is incomplete, so the dashboard still shows
// something sensible rather than zeroes.
export const FALLBACK_TDEE = 2200;
export const FALLBACK_WEIGHT = 70;

// Carbs/fat split of the remaining calories once protein is set. Not scored —
// shown on the dashboard so the day has a full macro target.
export const CARB_SHARE = 0.55;

// ---------------------------------------------------------------------------
// Score Musculation Quotidien (/100)
// ---------------------------------------------------------------------------

export const SCORE_WEIGHTS = {
  proteines: 40,
  calories: 40,
  micros: 20,
};

// Calories score full marks inside this band around the target, then decay.
export const KCAL_TOLERANCE = 0.10;

// Daily reference intakes for the micronutrient component. Values are adult
// EU NRVs (Nutrient Reference Values, EU Regulation 1169/2011) except fibre,
// which uses the commonly cited 30 g/day; `part` is the share of the reference
// that counts as "reached" for a single day.
export const MICROS = [
  { key: 'fer', label: 'Fer', unit: 'mg', reference: 14, part: 0.7, off: 'iron_100g', offFactor: 1000, ciqual: 'fe' },
  { key: 'calcium', label: 'Calcium', unit: 'mg', reference: 800, part: 0.7, off: 'calcium_100g', offFactor: 1000, ciqual: 'ca' },
  { key: 'potassium', label: 'Potassium', unit: 'mg', reference: 2000, part: 0.7, off: 'potassium_100g', offFactor: 1000, ciqual: 'k' },
  { key: 'magnesium', label: 'Magnésium', unit: 'mg', reference: 375, part: 0.7, off: 'magnesium_100g', offFactor: 1000, ciqual: 'mg' },
  { key: 'fibres', label: 'Fibres', unit: 'g', reference: 30, part: 0.7, off: 'fiber_100g', offFactor: 1, ciqual: 'fiber' },
  { key: 'vitamineD', label: 'Vitamine D', unit: 'µg', reference: 5, part: 0.7, off: 'vitamin-d_100g', offFactor: 1e6, ciqual: 'vd' },
];

// A micronutrient nobody logged any data for is not a failure — it is unknown.
// Below this share of known micronutrients the component is reported as
// "données insuffisantes" and its weight is redistributed rather than counted
// as zero, which would punish the user for Open Food Facts' gaps.
export const MICRO_MIN_KNOWN = 0.5;
