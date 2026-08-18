// Contextual tooltips: one sentence, attached to the number or the label that
// raises the question, shown on demand behind a small (i).
//
// A tip is not a shorter help entry. The help sheet explains a screen when the
// user goes looking for it; a tip answers the question the interface itself
// provokes — "noté sur 80 ?", "cibles perso ?", "d'où sort cette distance ?" —
// at the exact spot where it is asked. Anything needing a paragraph belongs in
// `help.js` or the FAQ, and the tip should link there instead of growing.
//
// `faq` points at a FAQ entry the tip is the short form of; the bubble then
// offers "En savoir plus", which opens the help centre on that answer.
// `scripts/check-catalogue.mjs` verifies every id is used somewhere in src/,
// so a tip whose anchor was deleted shows up rather than lingering.

export const TIPS = {
  streak: {
    titre: 'Série de jours',
    texte: "Jours consécutifs avec au moins une séance enregistrée. Une journée sans séance la remet à zéro ; la marche n'y entre pas.",
    faq: 'serie-jours',
  },
  scoreJour: {
    titre: 'Score musculation quotidien',
    texte: "Protéines 40 pts, calories 40 pts, micronutriments 20 pts. Une part dont les données manquent sort du calcul au lieu d'être comptée zéro.",
    faq: 'score-sur-80',
  },
  ciblesMacros: {
    titre: "D'où viennent ces objectifs",
    texte: "Calculés depuis ton profil et ton objectif nutrition, sauf ceux que tu as fixés toi-même — ils sont alors signalés « cibles perso ».",
    faq: 'objectifs-calories',
  },
  ciblesPerso: {
    titre: 'Cible automatique ou perso',
    texte: "Un champ vide garde le calcul, et affiche sa valeur en filigrane. Un champ rempli l'impose — le vider suffit à revenir en arrière.",
    faq: 'objectifs-calories',
  },
  seancePartielle: {
    titre: 'Séance partielle',
    texte: "Séance arrêtée avant la fin : seules les séries réellement faites sont comptées, jamais celles prévues au programme.",
    faq: 'seance-partielle',
  },
  analyseSource: {
    titre: "Qui écrit l'analyse",
    texte: "Sur l'appareil par défaut, sans réseau. Avec une clé OpenRouter, le modèle choisi la rédige à partir des mêmes chiffres — et une erreur fait retomber sur le calcul local.",
    faq: 'analyse-fiable',
  },
  marcheKcal: {
    titre: 'Calories de marche',
    texte: "0,5 kcal par kilo et par kilomètre, net du métabolisme de repos. Elles s'affichent à côté de tes apports, jamais ajoutées à ta cible.",
    faq: 'marche-calories',
  },
  distanceEstimee: {
    titre: 'Distance déduite',
    texte: "Longueur de pas (depuis ta taille) × cadence du type de marche. Une distance saisie à la main prend toujours le dessus.",
    faq: 'distance-deduite',
  },
  micros: {
    titre: 'Micronutriments manquants',
    texte: "Un aliment qui n'en déclare aucun ne pénalise pas le score : il n'y contribue simplement pas. Les produits de marque en déclarent rarement.",
    faq: 'score-sur-80',
  },
  sollicitation: {
    titre: 'Sollicitation',
    texte: "Le mécanisme : régime de contraction et endroit de l'amplitude où la tension est maximale — pas seulement quel muscle travaille.",
  },
  surcharge: {
    titre: 'Surcharge',
    texte: "Le mode de défaillance propre à ce mouvement pour ce muscle ou son tendon, et le garde-fou concret qui l'évite.",
  },
  versionInstallee: {
    titre: 'Version installée',
    texte: "Le build qui tourne réellement, pas le dernier publié. C'est ce numéro à citer dans un message au support.",
    faq: 'mise-a-jour',
  },
};

export const tipById = (id) => TIPS[id] || null;
