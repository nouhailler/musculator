// Contextual help, keyed by whatever is on screen — a tab key when a tab is
// showing, a view key when an overlay is on top. Keep each entry about *this*
// screen: what it is for, what is not obvious, and the one or two things users
// get wrong. A generic tour belongs nowhere.

export const HELP = {
  // --- Tabs ---------------------------------------------------------------
  home: {
    titre: 'Accueil',
    intro: "Le tableau de bord du jour : ta progression, ta série de jours consécutifs et un accès direct à une séance.",
    points: [
      ['Commencer une séance', "Lance le programme du jour en un geste. Tu peux aussi choisir un programme précis dans l'onglet Programmes."],
      ['Série de jours', "Elle compte les jours consécutifs où tu as enregistré au moins une séance. Une journée sans séance la remet à zéro."],
      ['Chiffres réels', "Tout ce qui s'affiche vient de tes séances enregistrées — rien n'est simulé."],
    ],
  },
  programs: {
    titre: 'Programmes',
    intro: "Les séances toutes faites, filtrables, et le constructeur pour composer les tiennes.",
    points: [
      ['Filtres', "Durée, niveau et matériel se combinent. Si plus rien n'apparaît, élargis un filtre."],
      ['Créer une séance', "Choisis tes exercices puis règle séries, répétitions, charge, repos et ordre. La séance est enregistrée sur l'appareil et réutilisable."],
      ['Pendant la séance', "Tu peux modifier répétitions et charge à la volée sans toucher au programme d'origine."],
    ],
  },
  library: {
    titre: 'Bibliothèque',
    intro: "Les 45 exercices avec leur fiche technique complète et une démonstration animée.",
    points: [
      ['Regroupement', "Les exercices sont classés par schéma de mouvement (poussée, fente, hinge, abduction…)."],
      ['Optionnels', "Le bouton « Mollets & avancés » fait apparaître les exercices hors focus cuisses/fessiers et ceux réservés à un public confirmé."],
      ['Muscle ciblé', "Chaque fiche explique comment le muscle travaille et ce qu'il faut surveiller pour ne pas le surcharger."],
      ['Exercice seul', "Le bouton « Faire cet exercice maintenant » lance une séance d'un seul exercice, sans monter un programme."],
    ],
  },
  nutrition: {
    titre: 'Nutrition',
    intro: "Ton journal alimentaire du jour et le Score Musculation Quotidien qui relie ce que tu manges à ton entraînement.",
    points: [
      ['Ajouter un aliment', "Scanne un code-barres, cherche par nom, ou saisis l'aliment à la main. Les produits scannés restent utilisables hors-ligne."],
      ['Repas dicté', "« Importer un repas dicté » reprend le JSON produit par Claude ou ChatGPT à partir d'une description orale de tes repas. Le prompt à leur donner est fourni dans l'écran."],
      ['Score /100', "Protéines 40 pts, calories 40 pts, micronutriments 20 pts. Les calories sont au maximum dans une bande de ±10 % autour de ta cible."],
      ['Données manquantes', "Un micronutriment non renseigné n'est jamais compté comme zéro : sa part sort du calcul et la journée est notée sur 80."],
      ['Objectifs', "Ils sont calculés depuis ton profil (poids, taille, âge, fréquence) et ton objectif nutrition. Complète-les pour un calcul personnalisé."],
    ],
  },
  journal: {
    titre: 'Journal',
    intro: "Le récapitulatif de tes séances du jour, et l'analyse de ta journée d'entraînement.",
    points: [
      ['Séances partielles', "Une séance arrêtée en cours est marquée en orange : seul le travail réellement fait est compté."],
      ['Analyse IA', "Par défaut elle est calculée sur l'appareil, sans réseau. Tu peux brancher un modèle OpenRouter dans ton profil."],
      ['Portée', "L'analyse ne remplace pas l'avis d'un professionnel de santé."],
    ],
  },
  progress: {
    titre: 'Progrès',
    intro: "Ton historique, tes badges et l'évolution de ton rythme sur les dernières semaines.",
    points: [
      ['Badges', "Ils se débloquent depuis ton usage réel : nombre de séances, série de jours, séance matinale, HIIT…"],
      ['Historique', "Les séances partielles y apparaissent avec une icône de pause et la mention « partielle »."],
    ],
  },

  // --- Overlays -----------------------------------------------------------
  exercise: {
    titre: 'Fiche exercice',
    intro: "Tout ce qu'il faut pour exécuter le mouvement correctement.",
    points: [
      ['Démo animée', "Elle tourne au rythme du coach vocal. Appuie sur le bandeau pour la mettre en pause."],
      ['Muscle ciblé', "Explique le régime de contraction et où la tension est maximale — pas seulement quel muscle travaille."],
      ['Éviter la surcharge', "Le bloc orange indique le mode de défaillance propre à ce mouvement et le garde-fou concret."],
    ],
  },
  program: {
    titre: 'Détail du programme',
    intro: "La composition de la séance avant de la lancer.",
    points: [
      ['Démarrer', "Lance la séance guidée : phases d'effort et de repos, chronomètre, coach vocal."],
      ['Personnalisation', "Sur une séance perso, séries, répétitions, charge et repos remplacent les valeurs du catalogue."],
    ],
  },
  bodymap: {
    titre: 'Cartographie musculaire',
    intro: "L'état de sollicitation de chaque groupe musculaire, calculé depuis tes séances réelles.",
    points: [
      ['Sollicitation', "Elle décroît avec les jours : un muscle travaillé il y a une semaine est presque revenu à zéro."],
      ['Récupération', "Sert à choisir quoi travailler aujourd'hui sans repasser sur un groupe encore chargé."],
      ['Face avant / arrière', "Bascule pour atteindre les groupes postérieurs (dos, ischios, fessiers, mollets)."],
    ],
  },
  profile: {
    titre: 'Profil & réglages',
    intro: "Tes données servent aux objectifs nutritionnels et à l'analyse de tes séances.",
    points: [
      ['Poids, taille, âge', "Sans eux, les objectifs caloriques retombent sur une valeur par défaut au lieu d'être calculés."],
      ['Objectif nutrition', "Distinct de l'objectif d'entraînement : on peut viser la force tout en séchant."],
      ['Thème', "Sombre, clair, ou « Système » pour suivre le réglage de ton téléphone. Le choix s'applique tout de suite et reste sur cet appareil."],
      ['OpenRouter', "Facultatif. La clé est enregistrée en clair sur cet appareil — n'utilise pas une clé partagée."],
      ['Import Nutritor', "Reprend un export CSV de journal. Les jours déjà renseignés sont complétés, jamais remplacés."],
    ],
  },
  builder: {
    titre: 'Créer une séance',
    intro: "Compose ta propre séance à partir du catalogue.",
    points: [
      ['Ordre', "Les flèches réordonnent les exercices ; l'ordre est celui de la séance guidée."],
      ['Réglages', "Séries, répétitions, charge et repos sont propres à cette séance et n'affectent pas le catalogue."],
    ],
  },
  foodSearch: {
    titre: 'Ajouter un aliment',
    intro: "Trois façons de trouver un aliment, du plus rapide au plus manuel.",
    points: [
      ['Scanner', "Utilise la caméra. Sur les navigateurs sans lecteur intégré, un décodeur est téléchargé à la première utilisation. La caméra exige une connexion sécurisée (HTTPS)."],
      ['Recherche', "La table générique répond hors-ligne ; les produits de marque viennent d'Open Food Facts quand le réseau est là."],
      ['Saisie manuelle', "Pour un plat maison ou un aliment sans code-barres. Les valeurs se saisissent pour 100 g."],
      ['Mes aliments', "Tout ce que tu as déjà ajouté reste listé en bas de l'écran, par ordre alphabétique. Une lettre qui porte plusieurs aliments se replie en accordéon."],
      ['Priorité à tes aliments', "Dans une recherche, tes aliments déjà utilisés remontent avant Open Food Facts et la table générique."],
      ['Micronutriments', "Les aliments génériques en portent presque toujours, les produits de marque rarement — c'est ce qui fait varier la part « micros » du score."],
    ],
  },
  importMeals: {
    titre: 'Importer un repas dicté',
    intro: "Décris tes repas à voix haute à Claude ou à ChatGPT, colle ici le JSON qu'ils renvoient.",
    points: [
      ['Le prompt', "« Comment générer ce JSON ? » contient le prompt à copier. Dans un Projet Claude ou un GPT personnalisé, colle-le une fois en instructions : ensuite tu n'as plus qu'à dicter."],
      ['Valeurs pour 100 g', "L'assistant fournit le poids de la portion et les valeurs pour 100 g. La quantité reste modifiable dans le journal, tout se recalcule."],
      ['Prévisualisation', "Rien n'est enregistré avant que tu aies vu le détail. « Remplacer » ne vide que les repas présents dans l'import."],
      ['Avertissements', "Ils listent ce qui a été deviné : quantité manquante, repas non reconnu, valeurs hors du bloc « pour100g »."],
      ['Estimations', "Les valeurs viennent d'un modèle de langage, pas d'une table officielle : elles sont approximatives et à vérifier si un aliment compte vraiment."],
    ],
  },
  foodEntry: {
    titre: 'Quantité',
    intro: "Ajuste la quantité : les valeurs affichées se recalculent en direct.",
    points: [
      ['Portion', "Quand Open Food Facts fournit une portion, elle apparaît comme premier raccourci."],
      ['Sans micronutriment', "Un aliment qui n'en déclare aucun ne pénalise pas ton score, il n'y contribue simplement pas."],
    ],
  },
};

export const helpFor = (key) => HELP[key] || null;
