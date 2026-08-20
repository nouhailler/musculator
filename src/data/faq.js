// Frequently asked questions, the self-service half of the help centre.
//
// A FAQ entry answers a question the user arrives with ("pourquoi mon score
// est noté sur 80 ?"), where a `help.js` entry describes a screen they are
// already looking at. The two are searched together but written differently:
// keep a question here phrased the way it would be typed, and keep the answer
// factual — every one of these describes behaviour that actually exists.
//
// `mots` carries the words a user would search with that the question and the
// answer don't contain (synonyms, the other vocabulary: "calories" for kcal,
// "iPhone" for iOS). The search normalises accents, so don't duplicate a word
// just to spell it without them.
//
// `lien` sends the reader to the screen the answer is about — a `tab` key, a
// `view` key, or a `tour` id. `scripts/check-catalogue.mjs` verifies that the
// destination exists, so a renamed screen can't leave a dead link here.

export const FAQ_CATS = [
  { key: 'demarrage', label: 'Premiers pas', icon: 'flag' },
  { key: 'seances', label: 'Séances & programmes', icon: 'barbell' },
  { key: 'nutrition', label: 'Nutrition', icon: 'fork-knife' },
  { key: 'marche', label: 'Marche', icon: 'person-simple-walk' },
  { key: 'donnees', label: 'Données & sauvegarde', icon: 'floppy-disk' },
  { key: 'technique', label: 'Installation & mises à jour', icon: 'wrench' },
  { key: 'confidentialite', label: 'Confidentialité & IA', icon: 'shield-check' },
];

export const FAQ = [
  // --- Premiers pas --------------------------------------------------------
  {
    id: 'par-ou-commencer',
    cat: 'demarrage',
    q: 'Par où commencer ?',
    r: [
      "Renseigne d'abord ton profil : poids, taille, âge et fréquence visée. Sans eux, les objectifs caloriques retombent sur des valeurs par défaut au lieu d'être calculés pour toi.",
      "Puis lance ta première séance depuis l'Accueil : le bouton « Commencer une séance » démarre le programme Full Body Maison, guidé au chronomètre et au coach vocal.",
    ],
    mots: ['débuter', 'installer', 'première fois', 'nouveau'],
    lien: { tour: 'decouverte', label: "Faire le tour de l'app" },
  },
  {
    id: 'refaire-tutoriel',
    cat: 'demarrage',
    q: 'Comment revoir le tutoriel ?',
    r: [
      "Les tutoriels sont toujours disponibles : centre d'aide → « Tutoriels interactifs ». Ils ne sont pas une vidéo mais une visite guidée : l'app se déplace d'écran en écran et met en évidence l'élément dont parle chaque étape.",
      "Tu peux en sortir à tout moment ; reprendre le tutoriel le relance depuis le début.",
    ],
    mots: ['visite guidée', 'onboarding', 'démonstration', 'guide'],
    lien: { tour: 'decouverte', label: 'Lancer la visite guidée' },
  },
  {
    id: 'compte-obligatoire',
    cat: 'demarrage',
    q: 'Faut-il créer un compte ?',
    r: [
      "Non. Musculator n'a ni compte, ni serveur, ni synchronisation : tout ce que tu crées reste dans le stockage de ce navigateur, sur cet appareil.",
      "C'est ce qui la rend utilisable hors-ligne — et ce qui rend la sauvegarde importante : rien ne récupérera tes données à ta place.",
    ],
    mots: ['inscription', 'connexion', 'login', 'mot de passe', 'cloud'],
    lien: { view: 'profile', label: 'Exporter une sauvegarde' },
  },
  {
    id: 'hors-ligne',
    cat: 'demarrage',
    q: "L'app fonctionne-t-elle sans réseau ?",
    r: [
      "Oui, entièrement, sauf trois choses qui interrogent Internet : la recherche de produits de marque (Open Food Facts), l'analyse rédigée par un modèle OpenRouter, et la recherche de mise à jour.",
      "La table d'aliments génériques CIQUAL, elle, est embarquée : la recherche par nom répond hors-ligne dès la deuxième visite, comme le catalogue d'exercices et les démos animées.",
    ],
    mots: ['avion', 'connexion', 'internet', 'offline', 'réseau'],
  },

  // --- Séances & programmes ------------------------------------------------
  {
    id: 'seance-partielle',
    cat: 'seances',
    q: "J'ai arrêté ma séance en cours de route, est-elle perdue ?",
    r: [
      "Non. En quittant, « Enregistrer et quitter » consigne exactement ce qui a été fait : seules les séries réellement effectuées sont comptées, jamais celles prescrites par le programme.",
      "La séance apparaît alors en orange, marquée « partielle », dans le Journal et dans l'historique.",
    ],
    mots: ['interrompue', 'abandonner', 'quitter', 'stopper'],
    lien: { tab: 'journal', label: 'Ouvrir le Journal' },
  },
  {
    id: 'seance-hors-app',
    cat: 'seances',
    q: "Je me suis entraîné sans l'app, puis-je l'ajouter après coup ?",
    r: [
      "Oui : Journal → « Ajouter une séance ». Tu choisis un programme (il est alors considéré comme réalisé tel que prescrit) ou tu laisses la séance libre avec un simple nom et une durée.",
      "La date et l'heure se règlent, donc une séance d'avant-hier se consigne aujourd'hui. Elle est repérée par un crayon dans l'historique.",
    ],
    mots: ['manuelle', 'rétroactif', 'oublié', 'rattraper'],
    lien: { tab: 'journal', label: 'Ouvrir le Journal' },
  },
  {
    id: 'modifier-seance',
    cat: 'seances',
    q: 'Pourquoi ne puis-je pas corriger les exercices d\'une séance passée ?',
    r: [
      "Une séance enregistrée est la trace de ce que tu as réellement fait. La date, l'heure, la durée et le nom d'une séance libre se corrigent ; les exercices, les séries et les muscles travaillés ne se réécrivent pas.",
      "Tout ce qui en découle — cartographie musculaire, badges, analyses — les lit comme des faits : les rendre modifiables transformerait le journal en liste de souhaits.",
    ],
    mots: ['éditer', 'corriger', 'erreur', 'supprimer'],
    lien: { tab: 'progress', label: "Ouvrir l'historique" },
  },
  {
    id: 'creer-programme',
    cat: 'seances',
    q: 'Puis-je créer mes propres séances ?',
    r: [
      "Oui, avec le constructeur : Programmes → « Créer une séance », ou le menu → « Créer une séance ». Tu choisis tes exercices dans le catalogue, puis tu règles séries, répétitions, charge, repos et ordre.",
      "Ces réglages sont propres à ta séance : ils n'affectent pas le catalogue, et pendant la séance guidée tu peux encore modifier répétitions et charge à la volée.",
    ],
    mots: ['builder', 'composer', 'personnalisé', 'custom'],
    lien: { view: 'builder', label: 'Ouvrir le constructeur' },
  },
  {
    id: 'programme-dicte',
    cat: 'seances',
    q: 'Comment importer un programme fait par une IA ?',
    r: [
      "Programmes → « Importer un programme dicté ». L'écran te donne un prompt à coller dans Claude ou ChatGPT ; tu colles ensuite le JSON obtenu, et chaque séance du plan devient une séance perso.",
      "Le prompt contient tout le catalogue de l'app, pour que l'assistant choisisse dedans au lieu d'inventer : un exercice inventé n'aurait ni démo animée, ni coach vocal, ni place sur la cartographie musculaire.",
      "Un mouvement absent du catalogue est remplacé par le plus proche travaillant le même muscle, et l'aperçu le dit avant que tu valides.",
    ],
    mots: ['chatgpt', 'claude', 'json', 'plan', 'coach'],
    lien: { view: 'importProgram', label: "Ouvrir l'import" },
  },
  {
    id: 'coach-vocal',
    cat: 'seances',
    q: 'Le coach vocal ne parle pas',
    r: [
      "Vérifie d'abord qu'il est activé : menu → « Coach vocal ». Il utilise la synthèse vocale du téléphone, donc il se tait aussi si le volume est coupé ou si le mode silencieux bloque la lecture.",
      "Sur iPhone, la première annonce ne part qu'après une interaction avec la page — lance la séance et appuie une fois sur l'écran.",
    ],
    mots: ['voix', 'son', 'audio', 'muet', 'parle pas'],
  },
  {
    id: 'exercice-seul',
    cat: 'seances',
    q: 'Puis-je faire un seul exercice sans monter un programme ?',
    r: [
      "Oui : ouvre la fiche de l'exercice depuis la Bibliothèque et utilise « Faire cet exercice maintenant ». La séance se lance avec cet exercice seul, sans nombre de séries imposé.",
      "Elle s'arrête quand tu le décides, et elle est enregistrée dans le journal comme n'importe quelle séance.",
    ],
    mots: ['solo', 'unique', 'rapide'],
    lien: { tab: 'library', label: 'Ouvrir la bibliothèque' },
  },
  {
    id: 'serie-jours',
    cat: 'seances',
    q: 'Comment fonctionne la série de jours ?',
    r: [
      "Elle compte les jours consécutifs où au moins une séance a été enregistrée. Une journée sans séance la remet à zéro.",
      "La marche n'y entre pas : elle a ses propres badges. Compter les kilomètres comme un entraînement gonflerait la série, les badges et le graphe hebdomadaire.",
    ],
    mots: ['streak', 'flamme', 'consécutifs', 'compteur'],
    lien: { tab: 'progress', label: 'Voir mes progrès' },
  },

  // --- Nutrition -----------------------------------------------------------
  {
    id: 'score-sur-80',
    cat: 'nutrition',
    q: 'Pourquoi mon score est-il noté sur 80 et non sur 100 ?',
    r: [
      "Le score vaut 40 points pour les protéines, 40 pour les calories et 20 pour les micronutriments. Quand trop peu de micronutriments sont connus pour la journée, leur part sort du calcul et la journée est notée sur 80.",
      "Un micronutriment absent n'est jamais compté comme zéro : les produits de marque en déclarent rarement, et te pénaliser pour une donnée manquante donnerait une note fausse.",
    ],
    mots: ['note', 'points', 'micronutriments', 'incomplet'],
    lien: { tab: 'nutrition', label: 'Ouvrir la Nutrition' },
  },
  {
    id: 'scanner-marche-pas',
    cat: 'nutrition',
    q: 'Le scanner de code-barres ne s\'ouvre pas',
    r: [
      "La caméra exige une connexion sécurisée (HTTPS) et ton autorisation explicite. Si tu as refusé l'accès une fois, il faut le réautoriser dans les réglages du navigateur pour ce site.",
      "Sur les navigateurs sans lecteur intégré (iOS Safari, Firefox), un décodeur est téléchargé à la première utilisation : la toute première ouverture demande donc du réseau.",
      "En dernier recours, la recherche par nom et la saisie manuelle ne dépendent ni de la caméra ni du réseau.",
    ],
    mots: ['caméra', 'code-barres', 'photo', 'autorisation', 'https'],
    lien: { view: 'foodSearch', label: 'Ajouter un aliment' },
  },
  {
    id: 'objectifs-calories',
    cat: 'nutrition',
    q: "D'où viennent mes objectifs de calories et de macros ?",
    r: [
      "Ils sont calculés depuis ton profil — poids, taille, âge, sexe, fréquence d'entraînement — et ton objectif nutrition (sèche, maintien, prise de masse, recomposition).",
      "Tu peux imposer ta propre cible dans le profil : un champ rempli remplace le calcul, un champ vide le laisse automatique. La valeur calculée reste affichée en filigrane, donc un objectif perso se défait toujours.",
    ],
    mots: ['cible', 'kcal', 'protéines', 'macros', 'calcul', 'personnalisé'],
    lien: { view: 'profile', label: 'Régler mes objectifs' },
  },
  {
    id: 'repas-dicte',
    cat: 'nutrition',
    q: 'Puis-je dicter mes repas au lieu de les saisir ?',
    r: [
      "Oui : Nutrition → « Importer un repas dicté ». Tu décris tes repas à voix haute à Claude ou ChatGPT avec le prompt fourni, puis tu colles ici le JSON renvoyé.",
      "Un aliment nommé sans valeurs est cherché d'abord dans tes propres aliments — un produit que tu as scanné porte les vraies valeurs de sa marque — puis dans la table CIQUAL. L'aperçu affiche la source retenue sous chaque aliment : vérifie-la avant de valider.",
      "Ces valeurs viennent d'un modèle de langage : elles sont approximatives et restent modifiables une fois importées.",
    ],
    mots: ['dictée', 'voix', 'chatgpt', 'claude', 'json', 'importer'],
    lien: { view: 'importMeals', label: "Ouvrir l'import" },
  },
  {
    id: 'aliment-introuvable',
    cat: 'nutrition',
    q: 'Mon aliment est introuvable',
    r: [
      "Trois sources répondent à une recherche : tes propres aliments déjà utilisés, la table générique CIQUAL, et Open Food Facts pour les produits de marque (réseau requis).",
      "Si rien ne correspond — plat maison, produit local —, la saisie manuelle crée l'aliment à partir des valeurs pour 100 g. Il rejoint alors « Mes aliments » et se réutilise en un geste.",
    ],
    mots: ['recherche', 'introuvable', 'produit', 'maison', 'manuel'],
    lien: { view: 'foodSearch', label: 'Ajouter un aliment' },
  },
  {
    id: 'corriger-quantite',
    cat: 'nutrition',
    q: 'Comment corriger une quantité déjà enregistrée ?',
    r: [
      "Appuie sur l'aliment dans le journal du jour : la quantité se modifie et toutes les valeurs se recalculent, y compris le score.",
      "C'est vrai aussi des aliments arrivés par import : ils sont stockés avec leur poids et leurs valeurs pour 100 g, exactement comme une saisie manuelle.",
    ],
    mots: ['modifier', 'grammes', 'portion', 'éditer'],
    lien: { tab: 'nutrition', label: 'Ouvrir la Nutrition' },
  },

  // --- Marche --------------------------------------------------------------
  {
    id: 'pas-comptes',
    cat: 'marche',
    q: "Pourquoi l'app ne compte-t-elle pas mes pas automatiquement ?",
    r: [
      "Parce qu'aucune application web ne peut compter les pas en arrière-plan : ce sont des capteurs réservés aux apps installées depuis un store. Musculator ne fait donc pas semblant de le faire.",
      "Le suivi GPS est explicite — « suivre ma marche » — et ne fonctionne que l'app ouverte, écran allumé. Sinon, saisis la distance, ou seulement la durée : la distance en est déduite.",
    ],
    mots: ['podomètre', 'pas', 'arrière-plan', 'automatique', 'santé'],
    lien: { view: 'activity', label: 'Ouvrir la marche' },
  },
  {
    id: 'distance-deduite',
    cat: 'marche',
    q: 'Comment la distance est-elle déduite de la durée ?',
    r: [
      "Par la longueur de ton pas (calculée depuis ta taille) multipliée par la cadence du type de marche choisi — flânerie, normale, rapide ou course.",
      "Le détail du calcul est affiché à l'écran pour qu'une estimation ne passe jamais pour une mesure. Si tu connais la distance réelle, saisis-la : elle prend toujours le dessus.",
    ],
    mots: ['estimation', 'durée', 'kilomètres', 'allure', 'cadence'],
    lien: { view: 'activity', label: 'Ouvrir la marche' },
  },
  {
    id: 'marche-calories',
    cat: 'marche',
    q: "Pourquoi les calories de la marche ne s'ajoutent-elles pas à ma cible ?",
    r: [
      "Ta cible calorique contient déjà ton activité quotidienne, via le multiplicateur de fréquence appliqué au métabolisme de base. Y ajouter la marche compterait les mêmes kilomètres deux fois.",
      "Elle est donc affichée à côté de tes apports, comme les calories d'entraînement, et l'app ne présente jamais de bilan net.",
    ],
    mots: ['dépense', 'kcal', 'bilan', 'déficit'],
    lien: { tab: 'journal', label: 'Ouvrir le Journal' },
  },

  // --- Données & sauvegarde ------------------------------------------------
  {
    id: 'sauvegarde',
    cat: 'donnees',
    q: 'Comment sauvegarder mes données ?',
    r: [
      "Profil → Sauvegarde → « Exporter ». Un fichier JSON est produit : le partage du téléphone s'ouvre s'il est disponible, sinon le fichier est téléchargé, sinon la sauvegarde part dans le presse-papier.",
      "Il contient profil, séances perso, historique, journal alimentaire, marche et notes. La clé OpenRouter en est volontairement exclue : une sauvegarde se promène, pas un secret.",
    ],
    mots: ['export', 'backup', 'fichier', 'json', 'copie'],
    lien: { view: 'profile', label: 'Ouvrir la sauvegarde' },
  },
  {
    id: 'changer-telephone',
    cat: 'donnees',
    q: 'Je change de téléphone, comment transférer mes données ?',
    r: [
      "Exporte la sauvegarde depuis l'ancien appareil, transfère le fichier (mail, Fichiers, cloud), puis sur le nouveau : Profil → Sauvegarde → « Restaurer ».",
      "Deux modes : « Fusionner » réunit les journaux entrée par entrée et laisse les réglages de l'appareil intacts ; « Tout remplacer » écrase les données locales par celles du fichier.",
    ],
    mots: ['transfert', 'migration', 'nouveau téléphone', 'restaurer', 'importer'],
    lien: { view: 'profile', label: 'Ouvrir la sauvegarde' },
  },
  {
    id: 'donnees-perdues',
    cat: 'donnees',
    q: "J'ai perdu mes données, sont-elles récupérables ?",
    r: [
      "Seulement depuis une sauvegarde que tu as exportée : il n'y a pas de serveur, donc pas de copie ailleurs.",
      "Trois gestes les effacent : vider les données du site dans les réglages du navigateur, désinstaller l'app, ou naviguer en mode privé. « Forcer le rechargement complet » dans le profil, lui, ne vide que le cache de l'app et ne touche jamais tes données.",
    ],
    mots: ['effacé', 'disparu', 'perdu', 'récupérer', 'vidé'],
    lien: { view: 'profile', label: 'Exporter maintenant' },
  },

  // --- Installation & mises à jour -----------------------------------------
  {
    id: 'installer',
    cat: 'technique',
    q: "Comment installer l'app sur mon téléphone ?",
    r: [
      "Sur Android (Chrome) : menu du navigateur → « Installer l'application ». Sur iPhone (Safari) : bouton Partager → « Sur l'écran d'accueil ».",
      "Une fois installée, elle s'ouvre en plein écran, sans barre d'adresse, et fonctionne hors-ligne. Les données déjà saisies dans le navigateur sont conservées.",
    ],
    mots: ['pwa', 'écran accueil', 'android', 'iphone', 'installation'],
  },
  {
    id: 'mise-a-jour',
    cat: 'technique',
    q: "L'app ne se met pas à jour",
    r: [
      "Une app installée est rouverte, jamais rechargée : une nouvelle version se télécharge en arrière-plan mais ne s'applique qu'au redémarrage. Profil → « Vérifier les mises à jour » la cherche et l'installe tout de suite.",
      "Si rien ne bouge, « Forcer le rechargement complet » vide le cache et retélécharge tout. Tes données ne sont pas touchées.",
      "Le numéro de version installée est affiché juste au-dessus du bouton : c'est lui qu'il faut citer dans un message au support.",
    ],
    mots: ['version', 'ancienne', 'cache', 'rafraîchir', 'update'],
    lien: { view: 'profile', label: 'Vérifier la version' },
  },
  {
    id: 'pendant-seance',
    cat: 'technique',
    q: 'Pourquoi la mise à jour est-elle refusée pendant une séance ?',
    r: [
      "Appliquer une mise à jour recharge la page, et la séance en cours vit uniquement en mémoire : le chronomètre, les séries faites, les charges saisies seraient perdus.",
      "L'app refuse donc la mise à jour tant que la séance tourne, et la bannière se cache d'elle-même.",
    ],
    mots: ['bannière', 'workout', 'interdit', 'bloqué'],
  },

  // --- Confidentialité & IA ------------------------------------------------
  {
    id: 'donnees-envoyees',
    cat: 'confidentialite',
    q: 'Mes données sont-elles envoyées quelque part ?',
    r: [
      "Par défaut, non : tout est calculé sur l'appareil, y compris l'analyse du journal et l'analyse des progrès.",
      "Trois exceptions, toutes déclenchées par toi : la recherche d'un produit de marque interroge Open Food Facts avec le code-barres ou le mot cherché ; une analyse IA envoie tes statistiques au modèle OpenRouter que tu as configuré ; un message au support part par ton application mail, avec ce que l'écran te montre avant l'envoi.",
    ],
    mots: ['vie privée', 'rgpd', 'serveur', 'tracking', 'envoi'],
    lien: { view: 'confidentialite', label: 'Lire la politique de confidentialité' },
  },
  {
    id: 'politique-confidentialite',
    cat: 'confidentialite',
    q: 'Que devient exactement ce que je saisis ?',
    r: [
      "Tout est écrit dans le stockage de ce navigateur, sur ce téléphone : profil, séances, repas, marches, notes. L'éditeur n'y a pas accès, n'en a aucune copie et ne peut rien restaurer — c'est la contrepartie de l'absence de compte. La seule copie possible est la sauvegarde que tu exportes toi-même.",
      "Trois choses seulement sortent de l'appareil, et chacune parce que tu l'as demandée : une recherche d'aliment part vers Open Food Facts (le code-barres ou les mots cherchés, rien d'autre) ; une analyse IA part vers OpenRouter si tu as configuré une clé — c'est le seul cas où poids, taille, âge et blessures déclarées quittent le téléphone ; un message au support part par ton application mail, avec un diagnostic technique affiché avant l'envoi.",
      "Le suivi de marche au GPS calcule une distance au fil de l'eau puis jette les points : aucun trajet n'est conservé. Aucun cookie, aucune mesure d'audience, aucune publicité.",
    ],
    mots: ['confidentialité', 'données', 'rgpd', 'lpd', 'vie privée', 'cookies', 'traceurs', 'gps'],
    lien: { view: 'confidentialite', label: 'Lire la politique de confidentialité' },
  },
  {
    id: 'cle-openrouter',
    cat: 'confidentialite',
    q: 'Ma clé OpenRouter est-elle en sécurité ?',
    r: [
      "Elle est enregistrée en clair dans le stockage de ce navigateur et envoyée directement à OpenRouter depuis ton téléphone : l'app n'a pas de serveur pour la garder à l'abri.",
      "N'utilise donc pas une clé partagée, et fixe-lui une limite de dépense sur openrouter.ai. Elle n'est jamais incluse dans une sauvegarde.",
    ],
    mots: ['api', 'clé', 'sécurité', 'secret', 'ia'],
    lien: { view: 'profile', label: 'Gérer la clé' },
  },
  {
    id: 'analyse-fiable',
    cat: 'confidentialite',
    q: 'À quel point l\'analyse IA est-elle fiable ?',
    r: [
      "Elle décrit ce que ton journal contient : séances, durées, muscles travaillés, apports consignés. Elle ne diagnostique rien et ne remplace pas l'avis d'un professionnel de santé.",
      "Sans clé OpenRouter, elle est calculée par des règles sur l'appareil. Avec une clé, c'est le modèle choisi qui la rédige — à partir exactement des mêmes chiffres. Toute erreur du modèle fait retomber l'app sur le calcul local, en disant pourquoi.",
    ],
    mots: ['ia', 'analyse', 'confiance', 'médical', 'openrouter'],
    lien: { tab: 'journal', label: "Voir l'analyse" },
  },
  {
    id: 'contacter-support',
    cat: 'confidentialite',
    q: 'Comment contacter un humain ?',
    r: [
      "Centre d'aide → « Contacter le support ». Le message part vers contact@swinux.ch depuis ton application mail, avec les informations de diagnostic — version installée, appareil, système, navigateur — jointes automatiquement.",
      "Elles sont affichées avant l'envoi : rien ne part sans que tu l'aies vu, et aucune donnée d'entraînement ou de nutrition n'y figure.",
    ],
    mots: ['support', 'mail', 'contact', 'bug', 'problème', 'aide'],
    // No `lien`: every answer already ends on "Écrire au support", and a link
    // from here to the screen the reader is already on would go nowhere.
  },
  {
    id: 'mentions-legales',
    cat: 'confidentialite',
    q: 'Où sont les mentions légales ?',
    r: [
      "Menu → « Mentions légales », ou depuis le profil. On y retrouve le texte affiché au premier lancement, la limitation de responsabilité, ce que l'app fait de tes données, et l'avertissement sur les distances mesurées au GPS.",
      "L'app est un outil d'information : ses calculs, estimations et analyses sont indicatifs et ne remplacent ni un professionnel de santé, ni une source officielle. Le fait d'avoir accepté l'avertissement est enregistré sur cet appareil uniquement, avec sa version.",
    ],
    mots: ['cgu', 'conditions', 'responsabilité', 'juridique', 'éditeur', 'avertissement', 'droit'],
    lien: { view: 'mentions', label: 'Ouvrir les mentions légales' },
  },
];

export const faqById = (id) => FAQ.find((f) => f.id === id) || null;
export const faqByCat = (cat) => FAQ.filter((f) => f.cat === cat);
export const catLabel = (key) => FAQ_CATS.find((c) => c.key === key)?.label || key;
