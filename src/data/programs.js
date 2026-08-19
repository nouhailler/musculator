// Program catalogue — ported from the Claude Design prototype (PROG).
export const PROGRAMS = [
  { id: 'fullbody', nom: 'Full Body Maison', obj: 'Prise de masse', niveau: 'Tous niveaux', lieu: 'Maison', duree: 20, kcal: 210, mat: ['Sans matériel', 'Maison'], icon: 'house-line', exos: ['pompes', 'squats', 'fentes', 'gainage', 'abdos'], desc: "Un circuit complet du corps, sans aucun matériel — la base idéale pour construire du muscle à la maison." },
  { id: 'haut', nom: 'Haut du corps', obj: 'Prise de masse', niveau: 'Intermédiaire', lieu: 'Salle', duree: 25, kcal: 180, mat: ['Haltères', 'Salle'], icon: 'barbell', exos: ['pompes', 'dips', 'developpe', 'rowing', 'tractions'], desc: "Pectoraux, dos, épaules et bras : du volume ciblé sur tout le haut du corps." },
  { id: 'bas', nom: 'Bas du corps', obj: 'Prise de masse', niveau: 'Intermédiaire', lieu: 'Maison', duree: 20, kcal: 200, mat: ['Sans matériel', 'Maison'], icon: 'person-simple-walk', exos: ['squats', 'fentes', 'mountain'], desc: "Quadriceps et fessiers : puissance et volume des jambes, sans matériel." },
  { id: 'core', nom: 'Abdos / Core', obj: 'Gainage', niveau: 'Débutant', lieu: 'Maison', duree: 10, kcal: 90, mat: ['Sans matériel', 'Maison'], icon: 'shield-check', exos: ['gainage', 'abdos', 'mountain'], desc: "Renforce la sangle abdominale et stabilise ton tronc pour tous tes autres mouvements." },
  { id: 'hiit', nom: 'HIIT Brûle-graisse', obj: 'Cardio & sèche', niveau: 'Avancé', lieu: 'Maison', duree: 15, kcal: 240, mat: ['Sans matériel', 'Maison'], icon: 'lightning', exos: ['mountain', 'squats', 'pompes', 'fentes'], desc: "Intervalles intenses : du cardio pour sécher tout en préservant ta masse musculaire." },
  // Séance corrective plutôt que de développement : charge nulle, volume
  // faible, deux étirements à la fin. Elle vise la ceinture scapulaire d'un
  // poste de travail tête baissée — stabilisateurs de l'omoplate d'un côté,
  // pectoraux et élévateur de la scapula raccourcis de l'autre — et se refait
  // souvent, idéalement tous les jours, là où les autres programmes demandent
  // 48 h de récupération. Elle est montée sur les exercices du catalogue, pas
  // sur des doublons : le Y, le W et le scapular push-up existaient déjà.
  { id: 'omoplates', nom: 'Omoplates & nuque', obj: 'Tonus', niveau: 'Débutant', lieu: 'Maison', duree: 18, kcal: 70, mat: ['Sans matériel', 'Maison'], icon: 'person-simple-tai-chi', exos: ['chin-tuck', 'retraction-scapulaire', 'y-raise', 'prone-w-raise', 'scapular-push-up', 'etirement-pectoral-porte', 'etirement-elevateur-scapula'],
    // Les séances de posture se renvoient les unes aux autres : elles traitent
    // des bouts d'une même chaîne, et n'en faire qu'une plafonne vite.
    complement: [
      { id: 'bassin', raison: "Un bassin basculé en avant fait s'arrondir le haut du dos pour compenser : traiter les omoplates sans le bassin, c'est corriger le haut d'une chaîne qui tire par le bas." },
      { id: 'souris', raison: "Un avant-bras qui flotte sans appui fait travailler l'épaule et les stabilisateurs de l'omoplate en continu — la tension du clavier remonte jusqu'ici." },
    ],
    desc: "Posture du haut du dos : on réveille d'abord les stabilisateurs de l'omoplate (rhomboïdes, trapèzes moyen et inférieur, dentelé), puis on relâche ce qui tire l'épaule vers l'avant. Sans charge, à refaire souvent — et si une douleur persiste, irradie ou réveille la nuit, fais-toi examiner." },
  // Le pendant bas d'« Omoplates & nuque », et pas par hasard : un bassin en
  // antéversion creuse les lombaires, le haut du dos s'arrondit pour compenser
  // et la tête part en avant. Même logique de séance — relâcher ce qui tire,
  // réapprendre le mouvement, puis renforcer — et même absence de charge.
  { id: 'bassin', nom: 'Bascule du bassin', obj: 'Tonus', niveau: 'Débutant', lieu: 'Maison', duree: 14, kcal: 55, mat: ['Sans matériel', 'Maison'], icon: 'arrow-counter-clockwise', exos: ['etirement-psoas-chevalier', 'posture-enfant', 'retroversion-bassin', 'glute-bridge', 'dead-bug', 'gainage'],
    // Doses propres à la séance : le pont et la planche se font ici plus courts
    // que dans leur fiche, parce que c'est la tenue du bassin qui compte et
    // qu'elle lâche avant le muscle.
    custom: {
      'glute-bridge': { series: 3, reps: '12', charge: 'Poids du corps', repos: 45 },
      'dead-bug': { series: 3, reps: '10 par côté', charge: 'Poids du corps', repos: 45 },
      gainage: { series: 3, reps: '25 s', charge: 'Poids du corps', repos: 45 },
    },
    complement: [{ id: 'omoplates', raison: "Le bas de la chaîne remonte : la cambrure lombaire arrondit le haut du dos et pousse la tête en avant, d'où les tensions entre les omoplates." }],
    desc: "Antéversion du bassin : il bascule vers l'avant, le bas du dos se creuse et le ventre pousse. On relâche d'abord l'avant de la hanche, on réapprend la rétroversion, puis on renforce fessiers et abdos profonds. 3 à 4 fois par semaine — et lève-toi toutes les 30 minutes, c'est la position assise qui raccourcit le psoas. Une douleur qui persiste ou descend dans la jambe relève d'un examen." },
  // Troubles musculo-squelettiques du membre supérieur, version bureau : trois
  // facteurs se cumulent — contraction statique, micro-répétitions, poignet en
  // extension et en déviation. La séance relâche et rééquilibre, elle ne charge
  // pas : le catalogue a déjà du renforcement lourd d'avant-bras, et c'est la
  // dernière chose qu'un tendon irrité demande.
  { id: 'souris', nom: 'Syndrome de la souris', obj: 'Tonus', niveau: 'Débutant', lieu: 'Maison', duree: 10, kcal: 25, mat: ['Sans matériel', 'Élastique', 'Maison'], icon: 'arrows-down-up', exos: ['etirement-extenseurs-avant-bras', 'etirement-flechisseurs-avant-bras', 'etirement-pouce-finkelstein', 'ouverture-doigts-elastique', 'automassage-avant-bras'],
    complement: [{ id: 'omoplates', raison: "La tension part rarement du poignet seul : un bras non soutenu fait travailler l'épaule et les omoplates en permanence, et ça redescend jusqu'à la main." }],
    desc: "Avant-bras et poignet, côté clavier-souris : on étire ce qui reste contracté toute la journée, on rééquilibre en ouverture ce qui ne travaille qu'en fermeture, et on relance la circulation. Les étirements se refont 3 à 5 fois par jour, le reste 2 à 3 fois par semaine. Aucun exercice ne compense 8 h de mauvaise posture : souris verticale, avant-bras soutenu, poignet droit, micro-pause toutes les 30 minutes. Fourmillements la nuit, perte de force ou poignet gonflé : consulte." },
  // Sarcopénie : la fonte musculaire liée à l'âge — de l'ordre de 3 à 5 % de
  // masse par décennie à partir de 30-40 ans, davantage passé 60 ans — et la
  // seule séance du catalogue dont l'objectif est l'autonomie plutôt que la
  // performance : se lever d'une chaise, monter un escalier, porter des
  // courses, ne pas tomber. D'où trois choix qui la distinguent de « Full Body
  // Maison » :
  //   - elle contient son échauffement et ses étirements, parce que ce sont
  //     justement les deux étapes qu'on saute et qu'ici on ne peut pas ;
  //   - aucune charge, et une progression qui se fait en changeant d'exercice
  //     (mur → table → genoux au sol) plutôt qu'en ajoutant du poids ;
  //   - l'équilibre unipodal y a sa place au même titre que la force : la
  //     prévention des chutes est la moitié du problème.
  // Les doses sont plus courtes que les fiches (2-3 séries de 8-12) : la
  // régularité vaut mieux que l'intensité, et une séance qu'on ne finit pas
  // n'entraîne rien.
  { id: 'sarcopenie', nom: 'Sarcopénie & autonomie', obj: 'Tonus', niveau: 'Débutant', lieu: 'Maison', duree: 30, kcal: 120, mat: ['Sans matériel', 'Élastique', 'Maison'], icon: 'heartbeat',
    exos: ['marche-sur-place', 'cercles-epaules', 'sit-to-stand', 'tirage-horizontal-elastique-assis', 'glute-bridge', 'pompes-mur', 'gainage', 'mollets-debout', 'equilibre-unipodal', 'etirement-quadriceps-debout', 'etirement-pectoral-porte'],
    custom: {
      'marche-sur-place': { series: 1, reps: '60 s', charge: 'Poids du corps', repos: 20 },
      'cercles-epaules': { series: 1, reps: '30 s par sens', charge: 'Poids du corps', repos: 20 },
      'sit-to-stand': { series: 3, reps: '10', charge: 'Poids du corps', repos: 60 },
      'tirage-horizontal-elastique-assis': { series: 3, reps: '12', charge: 'Élastique léger', repos: 60 },
      'glute-bridge': { series: 3, reps: '12', charge: 'Poids du corps', repos: 60 },
      'pompes-mur': { series: 3, reps: '12', charge: 'Poids du corps', repos: 60 },
      gainage: { series: 2, reps: '25 s sur les genoux', charge: 'Poids du corps', repos: 45 },
      'mollets-debout': { series: 2, reps: '12', charge: 'Poids du corps', repos: 45 },
      'equilibre-unipodal': { series: 2, reps: '15 s par jambe', charge: 'Poids du corps', repos: 30 },
      'etirement-quadriceps-debout': { series: 2, reps: '30 s par jambe', charge: 'Poids du corps', repos: 15 },
      'etirement-pectoral-porte': { series: 2, reps: '30 s par côté', charge: 'Poids du corps', repos: 15 },
    },
    desc: "La masse musculaire fond avec l'âge, mais le processus se reprend — à 60 ans comme à 75. Séance complète du corps entier, échauffement et étirements inclus : deux à trois fois par semaine, avec au moins un jour de repos entre chaque. On y travaille ce dont dépend l'autonomie : se lever sans les mains, tirer et pousser, tenir son tronc, et l'équilibre sur une jambe, qui décide d'une chute ou d'un pas de rattrapage. Deux choses comptent autant que la séance : des protéines à chaque repas, parce que le muscle a besoin de briques pour se reconstruire, et 30 minutes de marche par jour. Bois avant, pendant et après. Une brûlure musculaire est normale ; une douleur vive dans une articulation est un signal d'arrêt, et ce qui persiste, irradie ou réveille la nuit relève d'un examen.",
    // La marche quotidienne se suit dans l'onglet Activité, pas ici : elle
    // n'est pas une séance et ne doit ni gonfler la série ni les badges.
  },
  { id: 'express', nom: 'Renforcement Express', obj: 'Prise de masse', niveau: 'Débutant', lieu: 'Maison', duree: 5, kcal: 55, mat: ['Sans matériel', 'Maison'], icon: 'timer', exos: ['pompes', 'squats', 'gainage'], desc: "5 minutes, 3 exercices : parfait quand le temps manque mais que tu veux rester régulier." },
];

export const progById = (id, customWorkouts = []) =>
  PROGRAMS.concat(customWorkouts).find((p) => p.id === id) || PROGRAMS[0];

/**
 * An ad-hoc, unsaved program wrapping a single exercise, so a one-off set can
 * run through the exact same workout machinery as a full session — timer, rest,
 * voice coach, journal entry.
 *
 * It deliberately never enters PROGRAMS or customWorkouts: a quick set at the
 * office should not leave a saved program behind. That means progById() cannot
 * find it, so it travels on the workout state itself and callers must resolve
 * the running program through there rather than by id.
 *
 * `custom` reuses the custom-workout override shape, which is what lets
 * effSeries/effRepos/baseReps/baseCharge keep working untouched.
 */
export function soloProgram(ex) {
  return {
    id: `solo-${ex.id}`,
    nom: ex.nom,
    obj: 'Exercice seul',
    niveau: ex.niveau,
    lieu: ex.lieu,
    duree: Math.max(3, Math.round((ex.series * (ex.repos + 40)) / 60)),
    kcal: 0,
    mat: ex.mat,
    icon: ex.icon,
    exos: [ex.id],
    custom: { [ex.id]: { series: ex.series, reps: ex.reps, charge: ex.charge || 'Poids du corps', repos: ex.repos } },
    isCustom: true,
    isSolo: true,
  };
}

// The training objectives the profile and the workout builder both offer. One
// list, because a value that exists in one and not the other would let a saved
// workout carry an objective the profile cannot express.
//
// "Recomposition corporelle" is losing fat and building muscle at the same
// time — two distinct processes, not fat "turning into" muscle. It is its own
// objective because what it asks for is neither: enough volume to grow, and an
// energy balance that stays close to maintenance rather than swinging either
// way. See GOALS in data/nutrition.js for the nutrition side of it.
export const OBJECTIFS = ['Prise de masse', 'Recomposition corporelle', 'Force', 'Tonus', 'Endurance'];
