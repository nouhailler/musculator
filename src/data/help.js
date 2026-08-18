// Contextual help, keyed by whatever is on screen — a tab key when a tab is
// showing, a view key when an overlay is on top. Keep each entry about *this*
// screen: what it is for, what is not obvious, and the one or two things users
// get wrong. A generic tour belongs nowhere.
//
// The exercise count below is read from EXERCISES rather than hardcoded, so it
// can't go stale the next time the catalogue grows.
import { EXERCISES } from './exercises.js';

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
  importProgram: {
    titre: 'Importer un programme dicté',
    intro: "Demande un programme à Claude ou ChatGPT, colle ici le JSON : chaque séance du plan devient une séance perso.",
    points: [
      ['Le prompt', `Il contient les ${EXERCISES.length} exercices de l'app. L'assistant choisit dedans au lieu d'inventer — un exercice inventé n'aurait ni démo animée, ni coach vocal, ni place dans la cartographie musculaire.`],
      ['Trop long pour un Projet ?', "Un champ d'instructions de Projet ChatGPT ou Claude a une limite de taille ; le prompt grossit avec le catalogue et peut la dépasser. Colle-le en premier message d'une conversation normale à la place — ça marche aussi."],
      ['Substitutions', "Un mouvement absent du catalogue est remplacé par le plus proche travaillant le même muscle, et l'aperçu le dit : « presse à cuisses → remplacé par Squats »."],
      ['Réglages conservés', "Séries, répétitions, charge et repos dictés sont repris tels quels dans la séance guidée."],
      ['Plusieurs séances', "Un programme hebdomadaire arrive en plusieurs séances d'un coup ; elles s'ajoutent toutes à tes séances perso."],
    ],
  },

  programs: {
    titre: 'Programmes',
    intro: "Les séances toutes faites, filtrables, et le constructeur pour composer les tiennes.",
    points: [
      ['Programme dicté', "« Importer un programme dicté » fait composer un plan par une IA à partir du catalogue de l'app, et le transforme en séances perso."],
      ['Filtres', "Durée, niveau et matériel se combinent. Si plus rien n'apparaît, élargis un filtre."],
      ['Créer une séance', "Choisis tes exercices puis règle séries, répétitions, charge, repos et ordre. La séance est enregistrée sur l'appareil et réutilisable."],
      ['Pendant la séance', "Tu peux modifier répétitions et charge à la volée sans toucher au programme d'origine."],
    ],
  },
  library: {
    titre: 'Bibliothèque',
    intro: `Les ${EXERCISES.length} exercices avec leur fiche technique complète et une démonstration animée.`,
    points: [
      ['Regroupement', "Les exercices sont classés par schéma de mouvement (poussée, fente, hinge, abduction…)."],
      ['Optionnels', "Le bouton « Mollets & avancés » fait apparaître les exercices avancés ou demandant un matériel spécifique, dans tout le catalogue."],
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
      ['Objectifs', "Ils sont calculés depuis ton profil (poids, taille, âge, fréquence) et ton objectif nutrition. Complète-les pour un calcul personnalisé, ou fixe tes propres cibles dans le profil — elles s'affichent alors « cibles perso »."],
    ],
  },
  activity: {
    titre: 'Marche',
    intro: "Les kilomètres parcourus comptent dans ta dépense du jour, au même titre qu'une séance.",
    points: [
      ['Trois façons', "Saisir la distance à la main, suivre la marche au GPS, ou importer une trace GPX / un export CSV (Strava, Apple Santé, Google Fit)."],
      ['Distance déduite', "Entre seulement la durée : la distance se calcule depuis ta taille et le type de marche (longueur du pas × cadence). Le détail du calcul est affiché. Si tu connais la distance réelle, saisis-la — elle prend le dessus."],
      ['Type de marche', "Flânerie, normale, rapide ou course à pied. Il change la longueur du pas et la cadence, donc la distance — et pour la course, le coût par kilomètre, environ deux fois celui de la marche."],
      ['Suivi GPS', "Il ne tourne que l'app ouverte, écran allumé — aucun navigateur ne compte les pas en arrière-plan. Il exige une connexion sécurisée (HTTPS) et ton autorisation."],
      ['Calcul', "0,5 kcal par kilo et par kilomètre, net du métabolisme de repos. Sans distance, la durée est convertie à allure normale."],
      ['Pas dans la cible', "La marche s'ajoute à ta dépense, jamais à ta cible calorique : celle-ci contient déjà ton activité quotidienne, elle serait comptée deux fois."],
      ['Pas une séance', "Elle a ses propres badges et n'entre ni dans ta série de jours, ni dans « séances au total »."],
    ],
  },

  journal: {
    titre: 'Journal',
    intro: "Le récapitulatif de tes séances du jour, et l'analyse de ta journée d'entraînement.",
    points: [
      ['Séances partielles', "Une séance arrêtée en cours est marquée en orange : seul le travail réellement fait est compté."],
      ['Ajouter une séance', "Tu t'es entraîné hors appli ? « Ajouter une séance » l'ajoute au journal après coup, avec ou sans programme. La date et l'heure se règlent : une séance d'hier se consigne aujourd'hui."],
      ['Ajouter des exercices', "En haut de l'écran : choisis dans tout le catalogue les exercices faits aujourd'hui hors séance guidée, avec séries, répétitions et charge pour chacun. Toujours consigné pour aujourd'hui — pour une autre date, passe par « Ajouter une séance »."],
      ['Modifier une séance', "Le crayon corrige la date, l'heure et la durée — et le nom d'une séance libre. Ce qui a été fait (exercices, séries, muscles) n'est pas modifiable : c'est la trace de ta séance réelle."],
      ['Supprimer une séance', "La corbeille demande confirmation, puis retire définitivement la séance. Le Journal ne montre qu'aujourd'hui : pour une séance passée, passe par l'historique dans Progrès."],
      ['Marche du jour', "Distance, calories et durée du jour, avec « Ajouter une marche » pour la saisir, la suivre au GPS ou l'importer."],
      ['Alimentation du jour', "Reprend ce que tu as consigné côté Nutrition. Ce n'est pas un bilan calorique complet : la dépense de repos n'y entre pas."],
      ['Analyse IA', "Par défaut elle est calculée sur l'appareil, sans réseau. Tu peux brancher un modèle OpenRouter dans ton profil. Le résultat est gardé pour la journée, pas recalculé à chaque visite."],
      ['Portée', "L'analyse ne remplace pas l'avis d'un professionnel de santé."],
    ],
  },
  addExercises: {
    titre: 'Ajouter des exercices',
    intro: "Consigne dans le journal du jour ce que tu as fait hors séance guidée, exercice par exercice.",
    points: [
      ['Catalogue complet', "Le picker propose les mêmes exercices que la Bibliothèque, y compris les avancés — rien n'est filtré ici."],
      ['Séries et répétitions', "Pré-remplies avec les valeurs par défaut du catalogue ; corrige-les pour refléter ce que tu as vraiment fait."],
      ['Avec un poids', "Optionnel : active-le pour préciser la charge en texte libre (kg, élastique…). Laissé désactivé, l'exercice est consigné au poids du corps."],
      ["Toujours aujourd'hui", "Contrairement à « Ajouter une séance », il n'y a pas de date à choisir : ça s'ajoute au jour courant."],
    ],
  },
  progress: {
    titre: 'Progrès',
    intro: "Ton historique, tes badges et l'évolution de ton rythme sur les dernières semaines.",
    points: [
      ['Badges', "Ils se débloquent depuis ton usage réel : nombre de séances, série de jours, séance matinale, HIIT — et deux pour la marche, 100 km cumulés et 7 jours d'affilée."],
      ['Historique', "Les séances partielles y apparaissent avec une icône de pause et la mention « partielle », les séances ajoutées après coup avec un crayon."],
      ['Corriger le passé', "Chaque ligne de l'historique se modifie ou se supprime — c'est le seul endroit qui atteint les séances des jours précédents."],
      ['Tout est cliquable', "« Séances au total » déroule l'historique complet, une barre du graphe montre les séances de cette semaine-là, et « Temps total » comme « Calories » ouvrent leur détail (moyenne, 30 derniers jours, répartition par programme)."],
      ['Analyse IA des progrès', "Elle compare tes 4 dernières semaines à ce que tu as déclaré : objectif principal, zones prioritaires, objectif et cibles nutritionnels, contraintes. Un thème sans données est signalé comme non mesuré, jamais compté comme un échec."],
    ],
  },

  // --- Overlays -----------------------------------------------------------
  // The guided session hides the top bar, so this one is reached from the
  // pause sheet rather than from the « ? ».
  workout: {
    titre: 'Séance guidée',
    intro: "L'app enchaîne effort et repos, compte les séries et annonce le rythme — tu n'as qu'à exécuter.",
    points: [
      ['Série terminée', "Le bouton valide la série faite et lance le repos. C'est lui, et lui seul, qui compte ce qui sera enregistré : une séance arrêtée avant la fin ne consigne que le travail réel."],
      ['Répétitions & charge', "Modifiables à la volée pendant la séance. Le programme d'origine n'est pas touché — le changement vaut pour cette séance."],
      ['Repos', "Le décompte s'enchaîne tout seul. « +15 s » rallonge, « Passer » repart tout de suite."],
      ['Mode plein écran', "Les grands boutons, pour un téléphone posé à un mètre. Il n'affiche que l'essentiel de la phase en cours."],
      ['Coach vocal', "Il annonce le mouvement et rythme les répétitions. Le haut-parleur le coupe sans arrêter la séance."],
      ['Pause', "Elle gèle le chrono, le coach et la démo — et donne accès à cette aide. Rien ne tourne tant qu'elle dure."],
      ['Quitter', "La croix propose « Enregistrer et quitter » : les séries déjà faites partent au journal, marquées « partielle »."],
      ['Pas de mise à jour ici', "Une mise à jour recharge l'app, et la séance en cours ne vit qu'en mémoire : elle est refusée jusqu'à la fin."],
    ],
  },
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
      ['Marche (km/jour)', "Objectif de distance quotidienne. Rien ne le calcule : vide, il n'y a pas d'objectif et l'anneau de l'accueil affiche la suggestion."],
      ['Objectifs quotidiens', "Calories, protéines, glucides et lipides sont calculés depuis ton profil. Renseigne un champ pour imposer ta propre cible ; vide, il reste automatique. « Tout recalculer » revient au calcul."],
      ['Thème', "Sombre, clair, ou « Système » pour suivre le réglage de ton téléphone. Le choix s'applique tout de suite et reste sur cet appareil."],
      ['Sauvegarde', "Tes données ne sont que sur cet appareil. « Exporter » produit un fichier JSON à garder ailleurs ; « Restaurer » le relit, en fusionnant avec ce qui est là ou en remplaçant tout. La clé OpenRouter n'est pas exportée."],
      ['Version & mise à jour', "L'app installée garde sa version tant qu'elle n'est pas redémarrée. Le bouton cherche la dernière version publiée et l'applique tout de suite ; le numéro affiché te dit sur laquelle tu es. Impossible pendant une séance : la mise à jour recharge l'app."],
      ['Si rien ne bouge', "« Forcer le rechargement complet » vide le cache de l'app et retélécharge tout. Tes données restent intactes — ne vide jamais les données du site depuis les réglages du téléphone, ça effacerait ton journal."],
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
      ['Valeurs manquantes', "Si l'assistant nomme un aliment sans donner ses valeurs, Musculator cherche d'abord dans tes propres aliments — un produit que tu as scanné porte les vraies valeurs de sa marque — puis dans la table CIQUAL. L'aperçu affiche la source retenue sous chaque aliment : vérifie-la, « chocolat noir » peut tomber sur un chocolat fourré."],
      ['Avertissements', "Ils listent ce qui a été deviné : quantité pas exprimée en grammes (« 3 figues » devient 100 g), repas non reconnu, valeurs hors du bloc « pour100g »."],
      ['Estimations', "Les valeurs viennent d'un modèle de langage, pas d'une table officielle : elles sont approximatives et à vérifier si un aliment compte vraiment."],
    ],
  },
  help: {
    titre: "Centre d'aide",
    intro: "Tout ce qui explique l'app, au même endroit : recherche, questions fréquentes, tutoriels guidés et contact du support.",
    points: [
      ['Recherche', "Un seul champ cherche dans les trois : questions fréquentes, guides d'écran et tutoriels. Les accents ne comptent pas, et chaque mot tapé restreint la recherche."],
      ['Tutoriels interactifs', "Ce ne sont pas des vidéos : l'app se déplace d'écran en écran et met en évidence l'élément dont parle l'étape. On peut en sortir à tout moment et les relancer d'ici."],
      ['Guides des écrans', "Le même texte que le « ? » en haut à droite, mais consultable sans être sur l'écran concerné."],
      ['Contacter le support', "Le message part vers contact@swinux.ch depuis ton application mail. Version, appareil, système et navigateur sont joints automatiquement, et affichés avant l'envoi."],
      ['Rien de personnel dans le diagnostic', "Il porte le nombre de séances et de jours consignés, jamais leur contenu. La clé OpenRouter n'est jamais lue."],
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
