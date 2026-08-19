// Interactive tutorials — a guided tour of the real app, not a slideshow.
//
// Each step moves the app to the screen it talks about (`tab` or `view`, both
// applied by the reducer so navigation and the step index can never disagree)
// and points at one element by its `cible`, which is a `data-tour` attribute
// written in the component. The tour therefore explains the interface the user
// is looking at; a screenshot would go stale the day the screen changes, and a
// wall of text would be read nowhere near the button it describes.
//
// `scripts/check-catalogue.mjs` checks both halves: the destination exists,
// and the `data-tour` anchor is present somewhere in src/. A step whose anchor
// was renamed degrades to a centred card rather than pointing at nothing — but
// it is a bug, not a supported state.
//
// Keep a step's text to two sentences. It is read standing up, one thumb on
// the screen, next to the thing it describes.

import { EXERCISES } from './exercises.js';

export const TOURS = [
  {
    id: 'decouverte',
    titre: 'Découvrir Musculator',
    resume: "Le tour du propriétaire : les six onglets et ce qu'on y fait.",
    icon: 'flag',
    duree: '1 min',
    steps: [
      {
        titre: 'Bienvenue',
        texte: "Musculator tient sur six onglets. Cette visite les parcourt un par un — tu peux en sortir à tout moment, elle se relance depuis le centre d'aide.",
        tab: 'home',
      },
      {
        titre: 'Ta progression du jour',
        texte: "Séances de la semaine, temps et calories : tout vient de tes séances enregistrées, rien n'est simulé. La flamme compte tes jours consécutifs.",
        tab: 'home',
        cible: 'home-week',
      },
      {
        titre: 'Lancer une séance',
        texte: "Ce bouton démarre la séance guidée : chronomètre, phases d'effort et de repos, démonstration animée et coach vocal.",
        tab: 'home',
        cible: 'home-start',
      },
      {
        titre: 'Les programmes',
        texte: "Des séances toutes faites, filtrables par durée, niveau et matériel — et le constructeur pour composer les tiennes.",
        tab: 'programs',
        cible: 'tab-programs',
      },
      {
        titre: 'La bibliothèque',
        // Le compte vient du catalogue : écrit à la main, il vieillit à chaque
        // exercice ajouté — il était resté à 112 pour 152 entrées.
        texte: `${EXERCISES.length} exercices avec fiche technique, muscle ciblé et démonstration animée. Chaque fiche peut se lancer seule, sans monter un programme.`,
        tab: 'library',
        cible: 'tab-library',
      },
      {
        titre: 'La nutrition',
        texte: "Journal alimentaire par repas et Score musculation quotidien. Un aliment s'ajoute au code-barres, par recherche, à la main ou en dictant le repas à une IA.",
        tab: 'nutrition',
        cible: 'nutrition-score',
      },
      {
        titre: 'Le journal',
        texte: "Le récapitulatif du jour : séances, marche, alimentation, notes — et l'analyse de ta journée, calculée sur l'appareil par défaut.",
        tab: 'journal',
        cible: 'tab-journal',
      },
      {
        titre: 'Les progrès',
        texte: "Historique complet, badges et rythme des dernières semaines. Tout y est cliquable : une barre du graphe ouvre les séances de cette semaine-là.",
        tab: 'progress',
        cible: 'tab-progress',
      },
      {
        titre: "L'aide, partout",
        texte: "Ce bouton explique l'écran affiché, quel qu'il soit. Le menu à gauche mène au centre d'aide, à la FAQ et au support.",
        tab: 'home',
        cible: 'topbar-help',
      },
    ],
  },

  {
    id: 'premiere-seance',
    titre: 'Réussir sa première séance',
    resume: "Choisir un programme, le dérouler, et retrouver ce qui a été fait.",
    icon: 'play-circle',
    duree: '1 min',
    steps: [
      {
        titre: 'Choisir un programme',
        texte: "Les filtres se combinent : durée, niveau, matériel. Si plus rien n'apparaît, élargis-en un.",
        tab: 'programs',
        cible: 'programs-filters',
      },
      {
        titre: 'Ou composer la tienne',
        texte: "« Créer une séance » ouvre le constructeur : tes exercices, tes séries, tes charges, ton ordre. La séance reste sur l'appareil et se réutilise.",
        tab: 'programs',
        cible: 'programs-create',
      },
      {
        titre: 'Pendant la séance',
        texte: "L'app enchaîne effort et repos toute seule. Répétitions et charge se modifient à la volée sans toucher au programme d'origine.",
        tab: 'home',
        cible: 'home-start',
      },
      {
        titre: 'Arrêter en cours de route',
        texte: "La croix propose d'enregistrer avant de quitter : seules les séries réellement faites sont comptées, et la séance est marquée « partielle ».",
        tab: 'home',
      },
      {
        titre: 'Retrouver la séance',
        texte: "Le journal du jour la reprend aussitôt. « Ajouter une séance » sert au cas inverse : un entraînement fait hors de l'app, consigné après coup.",
        tab: 'journal',
        cible: 'journal-add',
      },
      {
        titre: 'Voir ce que tu as travaillé',
        texte: "La cartographie musculaire lit tes séances réelles et montre ce qui récupère encore — de quoi choisir quoi faire aujourd'hui.",
        tab: 'home',
        cible: 'home-bodymap',
      },
    ],
  },

  {
    id: 'nutrition',
    titre: 'Suivre son alimentation',
    resume: "Ajouter un aliment, lire le score, régler ses objectifs.",
    icon: 'fork-knife',
    duree: '1 min',
    steps: [
      {
        titre: 'La journée alimentaire',
        texte: "Quatre repas, un journal par jour. Les flèches en haut à droite changent de journée — une soirée se consigne le lendemain matin.",
        tab: 'nutrition',
      },
      {
        titre: 'Dicter plutôt que saisir',
        texte: "Décris tes repas à Claude ou ChatGPT avec le prompt fourni, colle le JSON ici : les aliments arrivent avec leurs valeurs, vérifiables avant enregistrement.",
        tab: 'nutrition',
        cible: 'nutrition-import',
      },
      {
        titre: 'Le score du jour',
        texte: "40 points de protéines, 40 de calories, 20 de micronutriments. Un micronutriment inconnu n'est jamais compté comme zéro : sa part sort du calcul.",
        tab: 'nutrition',
        cible: 'nutrition-score',
      },
      {
        titre: 'Consommé vs objectif',
        texte: "Les quatre barres comparent la journée à tes cibles. Elles se calculent depuis ton profil et ton objectif nutrition.",
        tab: 'nutrition',
        cible: 'nutrition-macros',
      },
      {
        titre: 'Fixer tes propres cibles',
        texte: "Un champ rempli remplace le calcul, un champ vide le laisse automatique — la valeur calculée reste en filigrane, donc rien n'est irréversible.",
        view: 'profile',
        cible: 'profile-targets',
      },
    ],
  },

  {
    id: 'sauvegarde',
    titre: 'Mettre ses données à l\'abri',
    resume: "Il n'y a pas de serveur : la sauvegarde, c'est toi.",
    icon: 'floppy-disk',
    duree: '40 s',
    steps: [
      {
        titre: 'Tout est sur cet appareil',
        texte: "Profil, séances, journal alimentaire, marche : rien n'est envoyé ailleurs, donc rien ne les récupérera à ta place.",
        view: 'profile',
      },
      {
        titre: 'Exporter',
        texte: "Un fichier JSON, à envoyer dans Fichiers, par mail ou dans ton cloud. La clé OpenRouter en est exclue : une sauvegarde se promène, pas un secret.",
        view: 'profile',
        cible: 'profile-backup',
      },
      {
        titre: 'Restaurer',
        texte: "Au même endroit : « Fusionner » réunit les journaux entrée par entrée, « Tout remplacer » écrase l'appareil avec le fichier.",
        view: 'profile',
        cible: 'profile-backup',
      },
      {
        titre: 'Connaître sa version',
        texte: "Le numéro affiché ici est celui qui tourne vraiment — c'est lui à citer en cas de problème, et le bouton installe la dernière version publiée.",
        view: 'profile',
        cible: 'profile-version',
      },
    ],
  },
];

export const tourById = (id) => TOURS.find((t) => t.id === id) || null;
