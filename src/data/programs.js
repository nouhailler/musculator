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
  // Ménopause et périménopause. La chute des œstrogènes accélère trois choses à
  // la fois — perte osseuse, perte musculaire, fragilisation du plancher
  // pelvien — et une seule séance ne peut pas les traiter toutes sans devenir
  // un fourre-tout. D'où une paire : celle-ci porte la contrainte mécanique
  // (l'os se densifie sous la charge, loi de Wolff) et le muscle, « Périnée &
  // tronc profond » porte ce que la charge, justement, met sous pression.
  //
  // Trois choix la distinguent de « Full Body Maison » :
  //   - tout est en appui au sol : c'est la mise en charge qui parle à l'os,
  //     là où la natation et le vélo laissent le squelette au repos ;
  //   - 8 à 12 répétitions difficiles plutôt que des séries longues, parce
  //     que c'est l'intensité de la contrainte qui stimule la densité osseuse ;
  //   - aucun saut, aucun crunch : les deux poussent sur un périnée que cette
  //     période fragilise, et la séance qui s'en occupe est en complément.
  // La marche rapide quotidienne, le deuxième pilier, se suit dans l'onglet
  // Activité — ce n'est pas une séance.
  { id: 'menopause', nom: 'Ménopause : os & muscles', obj: 'Force', niveau: 'Débutant', lieu: 'Maison', duree: 35, kcal: 190, mat: ['Sans matériel', 'Élastique', 'Haltères', 'Maison'], icon: 'sun-horizon',
    exos: ['marche-sur-place', 'cercles-epaules', 'squats', 'fente-arriere', 'step-up', 'rowing', 'pompes-inclinees', 'dead-bug', 'equilibre-unipodal', 'etirement-pectoral-porte', 'etirement-quadriceps-debout'],
    // Doses de la séance : 8 à 12 répétitions dont la dernière est difficile,
    // et des séries plus courtes que les fiches sur les mouvements unilatéraux,
    // qui coûtent le double en temps.
    custom: {
      'marche-sur-place': { series: 1, reps: '90 s', charge: 'Poids du corps', repos: 30 },
      'cercles-epaules': { series: 1, reps: '30 s par sens', charge: 'Poids du corps', repos: 30 },
      squats: { series: 3, reps: '10', charge: 'Poids du corps, puis haltères', repos: 75 },
      'fente-arriere': { series: 3, reps: '8 par jambe', charge: 'Poids du corps, puis haltères', repos: 75 },
      'step-up': { series: 2, reps: '10 par jambe', charge: 'Poids du corps', repos: 60 },
      rowing: { series: 3, reps: '12', charge: 'Élastique moyen', repos: 60 },
      'pompes-inclinees': { series: 3, reps: '10', charge: 'Poids du corps', repos: 60 },
      'dead-bug': { series: 2, reps: '8 par côté', charge: 'Poids du corps', repos: 45 },
      'equilibre-unipodal': { series: 2, reps: '20 s par jambe', charge: 'Poids du corps', repos: 30 },
      'etirement-pectoral-porte': { series: 2, reps: '30 s par côté', charge: 'Poids du corps', repos: 15 },
      'etirement-quadriceps-debout': { series: 2, reps: '30 s par jambe', charge: 'Poids du corps', repos: 15 },
    },
    complement: [{ id: 'perinee', raison: "Renforcer sans s'occuper du périnée revient à charger un plancher qu'on laisse se fragiliser : c'est la séance qui rend les squats, les fentes et le port de charges tenables dans la durée." }],
    desc: "La chute des œstrogènes accélère la perte osseuse et la perte musculaire en même temps ; l'entraînement en résistance est ce qui agit sur les deux. Tout se fait en appui au sol, parce que c'est le poids du corps passant dans le squelette qui déclenche la densification — le vélo et la natation, excellents par ailleurs, ne l'obtiennent pas. Vise 8 à 12 répétitions dont la dernière est difficile mais propre, et augmente la charge quand douze deviennent faciles : 2 à 3 fois par semaine, avec un jour de repos entre deux. Deux appuis indispensables autour : des protéines à chaque repas, du calcium et de la vitamine D, sans lesquels l'entraînement construit à vide. Une douleur articulaire vive n'est pas une fatigue musculaire : adapte l'exercice, et ce qui persiste ou réveille la nuit relève d'un examen.",
  },
  // Le pendant de la séance ci-dessus, et la raison pour laquelle elle ne
  // contient ni crunch ni saut : sous l'effort, la pression abdominale
  // redescend sur un plancher pelvien que la baisse d'œstrogènes fragilise.
  // Deux exercices y sont nouveaux (Kegel et hypopressive) parce que rien dans
  // le catalogue ne les remplaçait — un abdominal classique pousse là où ceux-ci
  // remontent. Séance courte et quotidienne, sans charge : le périnée ne se
  // renforce pas plus vite en serrant plus fort.
  { id: 'perinee', nom: 'Périnée & tronc profond', obj: 'Tonus', niveau: 'Débutant', lieu: 'Maison', duree: 20, kcal: 50, mat: ['Sans matériel', 'Maison'], icon: 'arrows-in',
    exos: ['contraction-perineale', 'respiration-hypopressive', 'retroversion-bassin', 'dead-bug', 'gainage', 'bird-dog'],
    custom: {
      'contraction-perineale': { series: 3, reps: '10 contractions', charge: 'Poids du corps', repos: 45 },
      'respiration-hypopressive': { series: 2, reps: '3 apnées', charge: 'Poids du corps', repos: 60 },
      'retroversion-bassin': { series: 2, reps: '10', charge: 'Poids du corps', repos: 30 },
      'dead-bug': { series: 3, reps: '8 par côté', charge: 'Poids du corps', repos: 45 },
      gainage: { series: 2, reps: '20 s sur les genoux', charge: 'Poids du corps', repos: 45 },
      'bird-dog': { series: 2, reps: '8 par côté', charge: 'Poids du corps', repos: 45 },
    },
    complement: [{ id: 'menopause', raison: "Le périnée se renforce pour soutenir un effort : c'est la séance de résistance qui lui donne sa raison d'être, et l'os et le muscle ne se maintiennent que là." }],
    desc: "Le plancher pelvien soutient les organes et se contracte avant chaque effort ; les œstrogènes en baisse en fragilisent les tissus, et une gêne à l'effort ou une fuite en est le signe le plus courant. Ici, rien ne pousse vers le bas : on contracte le périnée volontairement, on laisse la respiration hypopressive le remonter en réflexe, puis on gaine sans pression avec le dos soutenu. Les contractions se font tous les jours, le reste 2 à 3 fois par semaine ; comme pour tout muscle, le progrès demande des semaines, pas des séances. Tant que cette zone est faible, évite les sauts répétés et les crunchs, qui lui envoient exactement la pression dont elle se protège mal. Des fuites, une sensation de pesanteur ou une douleur se font examiner par un médecin, une sage-femme ou un kinésithérapeute : ce geste s'apprend mal sans retour extérieur, et très vite avec.",
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
