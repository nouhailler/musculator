// The privacy policy, shown by `overlays/Privacy.jsx`.
//
// It is a **separate document from the mentions légales** (`data/legal.js`),
// which answers a different question: the mentions say what the app promises,
// this says what happens to the data. Keeping them apart is deliberate — a
// liability disclaimer that doubles as a privacy policy is neither.
//
// The rule that governs every line here: **it describes what this build
// actually does, verified in the source.** Every claim below is checkable:
//
//  - the persisted slices are the ones in `loadPersisted()` (state/store.jsx);
//  - the outbound requests are exactly two hosts, `lib/off.js` and
//    `lib/openrouter.js` — nothing else in `src/` calls `fetch`;
//  - what a model receives is `buildPrompt` / `buildProgressPrompt`, listed
//    here field by field because "vos statistiques" would hide that the day's
//    analysis carries a first name, a weight and declared injuries;
//  - a walk never stores a position: `overlays/Activity.jsx` keeps fixes in
//    component state and `makeActivityEntry` writes km, minutes and a note;
//  - the support diagnostics are `lib/diagnostics.js`, counts and never
//    content.
//
// So: change the app, change this file. A policy that describes a previous
// version is worse than none, because it is believed.
//
// Two deliberate absences, recorded so they are not read later as oversights:
//
//  - **No minimum-age clause.** That is a publisher's decision, not a fact
//    readable in the code, and the publisher chose not to set one. Adding one
//    would be a policy change, not a correction.
//  - **The contact address is not spelled out here.** It lives in
//    `lib/diagnostics.js` as `SUPPORT_EMAIL`, and `overlays/Privacy.jsx` shows
//    it; a second copy in this file would be the one that goes stale.
//
// No imports, same reason as `data/legal.js`: `scripts/check-catalogue.mjs`
// loads this module in plain Node.

export const PRIVACY_VERSION = '1.0';
export const PRIVACY_DATE = '20/08/2026';

export const PRIVACY_INTRO = "Musculator fonctionne sans compte et sans serveur applicatif. Vos données d'entraînement, de nutrition et de marche sont enregistrées par votre navigateur, sur votre appareil, et n'en partent pas d'elles-mêmes. Cette politique décrit précisément ce qui est enregistré, ce qui sort de l'appareil, quand, et vers qui.";

export const PRIVACY_SECTIONS = [
  {
    id: 'responsable',
    titre: 'Responsable du traitement',
    paragraphes: [
      "L'application est éditée par Swinux, canton de Vaud, Suisse. Pour toute question relative à vos données, écrivez à l'adresse de contact indiquée dans les mentions légales.",
      "Le traitement relève de la loi fédérale suisse sur la protection des données (nLPD). Si vous résidez dans l'Union européenne, le Règlement général sur la protection des données (RGPD) s'applique également.",
    ],
  },
  {
    id: 'principe',
    titre: 'Aucun compte, aucun serveur',
    avert: true,
    paragraphes: [
      "Il n'y a ni inscription, ni identifiant, ni mot de passe, ni serveur qui conserverait vos données. Tout ce que vous saisissez est écrit dans le stockage local de votre navigateur, sur cet appareil.",
      "L'éditeur n'a donc aucun accès à ces données, aucune copie, et aucun moyen de les restaurer si elles sont perdues. C'est la contrepartie directe de l'absence de compte : personne d'autre que vous ne les détient, et personne d'autre que vous ne peut les récupérer.",
      "La seule copie possible est la sauvegarde que vous exportez vous-même depuis l'écran Profil.",
    ],
  },
  {
    id: 'stockees',
    titre: 'Ce qui est enregistré sur votre appareil',
    paragraphes: [
      "Sous une clé unique du stockage local de votre navigateur : votre profil (prénom, sexe, âge, poids, taille, poids cible, niveau d'expérience, objectif, zones prioritaires, fréquence visée, contraintes ou blessures déclarées, objectifs caloriques et de macronutriments) ; vos séances personnalisées ; votre journal de séances (date, durée, séries effectuées, muscles travaillés, calories estimées) ; votre journal alimentaire et les aliments que vous avez scannés ou saisis ; vos marches (distance, durée, calories estimées, note) ; vos notes de journée ; les analyses déjà calculées, mises en cache par jour.",
      "S'y ajoutent vos réglages : thème, coach vocal, tutoriel déjà vu, acceptation des mentions légales et sa version, et — si vous en avez configuré une — votre clé d'API OpenRouter ainsi que le modèle choisi.",
      "Tant que ces données restent sur l'appareil, elles ne font l'objet d'aucun traitement par l'éditeur : elles ne lui sont jamais transmises et il ne peut pas les consulter.",
    ],
  },
  {
    id: 'sante',
    titre: 'Données relatives à la santé',
    avert: true,
    paragraphes: [
      "Le poids, la taille, l'âge, les apports alimentaires et surtout le champ « contraintes ou blessures » sont des données sensibles au sens de la nLPD et du RGPD. Elles restent sur votre appareil dans le fonctionnement normal de l'application.",
      "Une exception, et une seule : si vous activez l'analyse par un modèle d'IA (voir plus bas), une partie de ces données est transmise au service que vous avez configuré. C'est un choix explicite de votre part, jamais un réglage par défaut.",
      "N'inscrivez dans le champ « contraintes » que ce que vous accepteriez de transmettre à un service tiers si vous activez un jour cette fonction.",
    ],
  },
  {
    id: 'hebergement',
    titre: "Chargement de l'application et hébergement",
    paragraphes: [
      "Comme tout site web, télécharger l'application suppose une connexion à un serveur, qui en enregistre la trace technique : adresse IP, date et heure, fichier demandé, type de navigateur. Ces journaux relèvent du fonctionnement d'Internet et non d'un suivi mis en place par l'application.",
      "Les fichiers de l'application sont servis par Netlify (Netlify, Inc., États-Unis). Le nom de domaine et la messagerie de contact sont gérés par Infomaniak (Infomaniak Network SA, Genève, Suisse). Le contenu de vos journaux d'entraînement, de nutrition ou de marche ne transite par aucun des deux : il ne quitte pas votre appareil.",
      "Une fois l'application installée ou simplement visitée une première fois, elle est mise en cache par son service worker et fonctionne hors connexion. Utilisée hors ligne, elle ne produit plus aucune requête.",
    ],
  },
  {
    id: 'aliments',
    titre: "Recherche d'aliments (Open Food Facts)",
    paragraphes: [
      "Lorsque vous scannez un code-barres ou cherchez un produit par son nom, cette requête — le code-barres ou les mots cherchés — est envoyée à Open Food Facts, base de données alimentaire ouverte portée par une association à but non lucratif française.",
      "Aucun identifiant, aucun élément de votre profil et aucune de vos données d'entraînement n'accompagne la requête. L'application s'identifie uniquement par son nom et sa version. Le serveur d'Open Food Facts voit néanmoins votre adresse IP, comme tout serveur que vous contactez.",
      "Le résultat est mémorisé sur votre appareil pour rester utilisable hors ligne, et pour éviter de refaire la même requête.",
    ],
  },
  {
    id: 'ia',
    titre: 'Analyse par un modèle d\'IA (facultative)',
    avert: true,
    paragraphes: [
      "Par défaut, les analyses du journal et des progrès sont calculées sur votre appareil et rien n'est transmis. Elles ne sortent de l'appareil que si vous avez vous-même renseigné une clé d'API OpenRouter et choisi un modèle, et seulement au moment où vous demandez une analyse.",
      "Dans ce cas, l'analyse de la journée transmet : prénom, sexe, âge, poids, taille, poids cible, niveau d'expérience, objectif, fréquence visée, contraintes ou blessures déclarées, ainsi que les séances du jour (nom, durée, nombre de séries, calories estimées, muscles travaillés, séance interrompue ou non) et le nombre de séances déjà faites dans la semaine.",
      "L'analyse des progrès transmet des données agrégées sur huit semaines : objectif, contraintes déclarées, nombre de séances, séries, minutes, zones travaillées, moyennes nutritionnelles et marche. Elle ne transmet ni prénom, ni poids, ni taille.",
      "Ces données sont envoyées directement de votre navigateur à OpenRouter (OpenRouter, Inc., États-Unis), qui les transmet au fournisseur du modèle que vous avez sélectionné. Ce transfert implique un traitement hors de Suisse et de l'Union européenne. Les conditions et les durées de conservation applicables sont celles d'OpenRouter et du fournisseur du modèle, pas celles de l'éditeur — plusieurs modèles gratuits autorisent notamment la réutilisation des requêtes pour l'entraînement. Consultez leurs conditions avant d'activer cette fonction.",
      "L'éditeur ne voit rien de ces échanges : l'application n'a pas de serveur par lequel ils transiteraient. Votre clé d'API est enregistrée en clair sur l'appareil, lisible par ce qui y a accès, et n'est jamais incluse dans une sauvegarde exportée. Effacer la clé dans l'écran Profil désactive immédiatement la fonction.",
    ],
  },
  {
    id: 'support',
    titre: 'Écrire au support',
    paragraphes: [
      "Le formulaire de support n'envoie rien par lui-même : il prépare un message dans votre propre application mail, que vous restez libre d'envoyer ou non.",
      "Y sont joints des éléments de diagnostic, affichés en entier avant l'envoi : version installée, appareil, système, navigateur, mode d'affichage, taille d'écran, langue, thème, et le *volume* de vos données — un nombre de séances, un nombre de jours renseignés. Jamais leur contenu, jamais votre profil, jamais vos repas. Votre clé d'API n'est pas lue.",
      "Une fois le message envoyé, il devient un courriel ordinaire dans la boîte de l'éditeur, conservé le temps de traiter votre demande.",
    ],
  },
  {
    id: 'sauvegardes',
    titre: 'Sauvegardes que vous exportez',
    paragraphes: [
      "La sauvegarde reprend l'intégralité de vos données locales dans un fichier. Ce fichier va là où vous l'envoyez — application de fichiers, messagerie, service de stockage — et l'éditeur n'y a aucun accès.",
      "La clé d'API OpenRouter en est volontairement exclue : une sauvegarde se transmet et se stocke ailleurs, pas un secret. Le modèle choisi, lui, est conservé.",
    ],
  },
  {
    id: 'permissions',
    titre: 'Caméra, position, microphone',
    paragraphes: [
      "La caméra n'est utilisée que pour lire un code-barres, à votre demande. L'image est analysée sur l'appareil, en direct : aucune photo n'est enregistrée et aucune image n'est transmise. Seul le code-barres obtenu part vers Open Food Facts.",
      "La position n'est utilisée que pendant un suivi de marche que vous démarrez explicitement, et uniquement tant que l'application est ouverte au premier plan — une application web ne peut pas compter vos pas en arrière-plan, et celle-ci ne prétend pas le faire. Les points GPS servent à calculer une distance au fil de la marche puis sont abandonnés : rien n'enregistre votre trajet. Seuls la distance, la durée et les calories estimées sont conservés, sur l'appareil.",
      "Le microphone n'est jamais utilisé.",
    ],
  },
  {
    id: 'vocal',
    titre: 'Coach vocal',
    paragraphes: [
      "Le coach vocal utilise le moteur de synthèse vocale de votre navigateur ou de votre système. Sur certaines plateformes, ce moteur est fourni par le système d'exploitation et peut traiter le texte à prononcer sur les serveurs de son éditeur : ce comportement dépend de votre appareil et échappe à l'application.",
      "Le texte prononcé est constitué de noms d'exercices et de consignes fixes du catalogue. Il ne contient aucune donnée personnelle — ni votre prénom, ni votre poids, ni le contenu de vos journaux.",
    ],
  },
  {
    id: 'traceurs',
    titre: 'Cookies, mesure d\'audience et publicité',
    paragraphes: [
      "L'application ne dépose aucun cookie, n'intègre aucun outil de mesure d'audience, aucun traceur publicitaire, aucun bouton de réseau social et aucun script tiers. Il n'y a pas de publicité.",
      "Le stockage local qu'elle utilise sert exclusivement à conserver vos données et vos réglages sur l'appareil ; il ne permet aucun suivi entre sites et n'est transmis à personne.",
    ],
  },
  {
    id: 'conservation',
    titre: 'Durée de conservation',
    paragraphes: [
      "Vos données restent sur votre appareil tant que vous ne les effacez pas : il n'y a pas d'expiration automatique, et rien ne les supprime à votre place.",
      "Elles disparaissent définitivement si vous désinstallez l'application, si vous effacez les données du site dans votre navigateur, ou si vous videz le stockage de l'application. Cette suppression est irréversible et l'éditeur ne peut rien restaurer.",
      "Côté éditeur, aucune donnée d'entraînement ou de nutrition n'est conservée, puisqu'aucune ne lui parvient. Seuls subsistent, le cas échéant, les courriels que vous lui avez envoyés et les journaux techniques des serveurs qui vous ont servi l'application.",
    ],
  },
  {
    id: 'droits',
    titre: 'Vos droits',
    paragraphes: [
      "La nLPD et, le cas échéant, le RGPD vous reconnaissent un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité.",
      "Pour les données stockées sur votre appareil, ces droits s'exercent directement, sans passer par personne : la consultation et la modification se font dans l'application, l'effacement en supprimant les données du site ou l'application, et la portabilité par l'export de sauvegarde, qui produit un fichier lisible et réutilisable.",
      "Pour ce qui aurait pu parvenir à l'éditeur — un message au support, par exemple — écrivez à l'adresse de contact des mentions légales. Vous pouvez également saisir l'autorité compétente : le Préposé fédéral à la protection des données et à la transparence en Suisse, ou l'autorité de contrôle de votre pays de résidence dans l'Union européenne.",
    ],
  },
  {
    id: 'securite',
    titre: 'Sécurité',
    paragraphes: [
      "L'application est servie exclusivement en HTTPS, et la géolocalisation comme la caméra exigent une connexion sécurisée pour fonctionner.",
      "Vos données étant stockées en clair dans le navigateur, leur sécurité dépend de celle de votre appareil : verrouillage d'écran, chiffrement, et prudence sur un appareil partagé. Cela vaut particulièrement pour la clé d'API OpenRouter, si vous en configurez une — utilisez une clé dédiée et fixez-lui un plafond de dépense.",
    ],
  },
  {
    id: 'modifications',
    titre: 'Modifications de cette politique',
    paragraphes: [
      "Cette politique peut évoluer avec l'application. Sa version et sa date de mise à jour figurent en tête de cet écran, qui reste consultable à tout moment depuis le menu et depuis l'écran Profil.",
      "Une évolution qui modifierait la nature des données transmises serait signalée dans l'application et non seulement ici.",
    ],
  },
];
