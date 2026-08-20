// The legal notice, in one place: the short warning shown at first launch, the
// full mentions read from « Mentions légales », and the identity fields.
//
// It is deliberately a flat config rather than JSX. Two screens render it —
// the first-launch modal's second page and the `mentions` overlay — and both go
// through `components/LegalText.jsx`, so the wording exists once. Transposing
// this to another PWA means copying this file and changing `EDITEUR`.
//
// Two rules hold this content together:
//
//  - **Nothing here is invented.** The publisher's details were given by the
//    publisher; the support address is the one the app already uses
//    (lib/diagnostics.js). Anything still unknown stays at `A_COMPLETER` and is
//    rendered as visibly unfilled — today that is the privacy policy, which
//    does not exist yet. A plausible-looking blank filled in would be worse
//    than a visible one.
//  - **The GPS section is present because the app really uses the GPS**
//    (`overlays/Activity.jsx` watches the device position to follow a walk).
//    `scripts/check-catalogue.mjs` verifies both directions by grepping the
//    source, so the section cannot outlive the feature — which is also why the
//    API name is not spelled out anywhere in this file.
//
// Bumping `LEGAL_VERSION` records a new version at the next acceptance. It does
// **not** re-show the notice to people who already accepted — see
// `needsLegalAck` below.
//
// No imports on purpose: `scripts/check-catalogue.mjs` loads this module in
// plain Node, where `lib/` would drag in `__BUILD_ID__` and throw. The support
// address stays in `lib/diagnostics.js` and is rendered by `LegalText`.

export const LEGAL_VERSION = '1.0';

/** Left visible on screen rather than guessed. */
export const A_COMPLETER = '[À COMPLÉTER]';

export const EDITEUR = {
  nom: 'Swinux',
  adresse: 'Canton de Vaud, Suisse',
  // Two distinct roles, and a privacy policy has to name the right one for the
  // right thing: Netlify serves the application, Infomaniak carries the domain
  // and the contact mailbox.
  hebergeur: 'Netlify (application) · Infomaniak (domaine, messagerie)',
  miseAJour: '20/08/2026',
};

export const LEGAL_TITRE = '⚠️ Information importante';

/** Shown at first launch, above the two buttons. */
export const AVERTISSEMENT_COURT = [
  "Cette application est fournie à titre informatif et pratique. Malgré les précautions prises lors de son développement, elle peut contenir des erreurs, des imprécisions ou présenter des limitations techniques.",
  "L'utilisation de cette application se fait sous votre responsabilité. Les informations, résultats, données ou recommandations fournis par l'application ne doivent pas être considérés comme infaillibles.",
  "Pour toute information importante ou décision susceptible d'avoir des conséquences, vérifiez les données auprès de sources fiables et officielles ou auprès d'un professionnel compétent.",
  "En utilisant cette application, vous reconnaissez avoir pris connaissance de cet avertissement.",
];

/**
 * The full mentions. `titre` + `paragraphes`, rendered in order; an `avert`
 * section is the one the screen highlights.
 */
export const LEGAL_SECTIONS = [
  {
    id: 'avertissement',
    titre: 'Avertissement',
    avert: true,
    paragraphes: AVERTISSEMENT_COURT,
  },
  {
    id: 'responsabilite',
    titre: 'Limitation de responsabilité',
    paragraphes: [
      "Cette application est proposée à titre informatif, documentaire, éducatif et/ou pratique selon sa finalité. Elle est destinée à fournir à l'utilisateur des informations, données, outils ou fonctionnalités destinés à faciliter son utilisation.",
      "L'éditeur s'efforce de fournir des informations aussi fiables, pertinentes et actualisées que possible. Toutefois, aucune garantie ne peut être donnée quant à l'exactitude, l'exhaustivité, l'actualité ou la pertinence des informations présentées.",
      "Dans les limites autorisées par la réglementation applicable, l'éditeur ne saurait être tenu responsable des dommages, pertes, préjudices ou conséquences résultant directement ou indirectement de l'utilisation, de l'impossibilité d'utiliser ou de l'interprétation des informations ou fonctionnalités proposées par l'application.",
      "Cette limitation concerne notamment, lorsque cela est applicable, les erreurs ou omissions dans les informations, les dysfonctionnements techniques, les interruptions de service, les pertes de données, les problèmes de connexion, les incompatibilités matérielles ou logicielles et les décisions prises par l'utilisateur sur la base des informations fournies.",
    ],
  },
  {
    id: 'utilisation',
    titre: "Utilisation de l'application",
    paragraphes: [
      "L'utilisateur reconnaît utiliser l'application sous sa propre responsabilité et demeure seul responsable de l'utilisation qu'il fait des informations et fonctionnalités proposées.",
      "L'application ne doit pas être considérée comme une source unique ou définitive d'information lorsqu'une décision importante, professionnelle, financière, médicale, juridique, scientifique, géographique ou liée à la sécurité est concernée.",
      "Lorsque cela est nécessaire, l'utilisateur doit vérifier les informations auprès de sources officielles, de documents de référence ou d'un professionnel qualifié.",
      "L'utilisation de l'application implique que l'utilisateur a pris connaissance du présent avertissement et accepte les conditions d'utilisation applicables à l'application.",
    ],
  },
  {
    id: 'exactitude',
    titre: 'Exactitude des informations',
    paragraphes: [
      "Certaines informations peuvent provenir de sources externes ou être générées, calculées ou interprétées automatiquement. Des erreurs, omissions, imprécisions ou incohérences peuvent donc subsister.",
    ],
  },
  {
    id: 'disponibilite',
    titre: 'Dysfonctionnements et disponibilité',
    paragraphes: [
      "Malgré les efforts déployés pour assurer le bon fonctionnement de l'application, l'éditeur ne garantit pas que celle-ci sera disponible en permanence, exempte d'erreurs ou compatible avec tous les appareils, systèmes d'exploitation, navigateurs, réseaux ou configurations.",
      "Des interruptions, ralentissements, pertes de connexion, erreurs techniques ou indisponibilités temporaires peuvent notamment survenir.",
    ],
  },
  {
    id: 'donnees',
    titre: 'Données et résultats',
    paragraphes: [
      "Les résultats, calculs, estimations, localisations, statistiques, recommandations ou autres données produits par l'application sont fournis à titre indicatif, sauf indication contraire explicite.",
      "L'utilisateur doit apprécier leur pertinence en fonction de son propre contexte et procéder aux vérifications nécessaires avant toute utilisation susceptible d'entraîner des conséquences importantes.",
    ],
  },
  {
    id: 'sources',
    titre: 'Sources externes',
    paragraphes: [
      "Lorsque l'application utilise ou référence des données provenant de sources externes, celles-ci peuvent évoluer, devenir indisponibles ou être modifiées indépendamment de l'éditeur. L'éditeur ne garantit donc pas la disponibilité permanente ni l'exactitude des contenus provenant de ces sources.",
    ],
  },
  {
    id: 'evolution',
    titre: "Évolution de l'application",
    paragraphes: [
      "Les fonctionnalités, contenus, données et services proposés par l'application peuvent être modifiés, mis à jour, suspendus ou supprimés à tout moment afin d'assurer son évolution et sa maintenance.",
    ],
  },
];

/**
 * Only because the app really tracks a walk with the GPS. An app that does not
 * must not carry this section — `check-catalogue` enforces both directions.
 */
export const LEGAL_GPS = {
  id: 'localisation',
  titre: 'Précision de la localisation',
  paragraphes: [
    "Les informations de localisation, distances, parcours, altitudes et autres données géographiques fournies par l'application dépendent notamment du GPS, du réseau, du matériel utilisé, des conditions météorologiques et environnementales ainsi que des performances du téléphone.",
    "Ces données peuvent être imprécises, incomplètes ou comporter des erreurs.",
    "L'application ne doit pas être utilisée comme unique moyen d'orientation ou de navigation dans une situation présentant un risque pour la sécurité des personnes.",
    "L'utilisateur reste responsable de son itinéraire, de ses déplacements et des décisions prises sur le terrain.",
  ],
};

/**
 * What the app does with data, in three paragraphs. It is a summary and
 * **not** the privacy policy: that one is `data/privacy.js`, a separate
 * document, and this section points at it rather than trying to stand in for
 * it. Conflating a liability disclaimer with a privacy policy serves neither.
 */
export const LEGAL_DONNEES = {
  id: 'confidentialite',
  titre: 'Données personnelles',
  paragraphes: [
    "L'application fonctionne sans compte et sans serveur : profil, séances, repas et marches sont enregistrés uniquement sur cet appareil. Rien n'en part de lui-même, et l'éditeur n'y a pas accès.",
    "Les seules requêtes sortantes sont celles que l'utilisateur déclenche : la recherche d'un produit alimentaire, et l'analyse par un modèle d'IA si une clé personnelle a été renseignée. Une désinstallation ou un effacement des données du navigateur supprime définitivement le contenu enregistré ; la sauvegarde manuelle est le seul moyen de le conserver.",
    "La politique de confidentialité détaillée — ce qui est enregistré, ce qui sort de l'appareil, vers qui et quand — est consultable dans l'application : menu → « Confidentialité ».",
  ],
};

/** Every section of the full mentions, in reading order. */
export const LEGAL_ALL = [...LEGAL_SECTIONS, LEGAL_GPS, LEGAL_DONNEES];

/**
 * Whether the notice has to be shown. Written for a future version bump — a
 * changed `LEGAL_VERSION` would make this true again — but the current build
 * calls it with `strict = false`, so bumping the version does **not** put the
 * modal back in front of people who already accepted. Flip the call site in
 * `DisclaimerModal` when a change is substantial enough to be worth it.
 */
export function needsLegalAck(state, strict = false) {
  if (!state.disclaimerAcked) return true;
  return strict && state.legalVersion !== LEGAL_VERSION;
}
