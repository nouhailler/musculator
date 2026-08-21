---
titre: Informations légales
description: Où trouver les mentions légales et la politique de confidentialité, et ce qu'elles disent.
ordre: 12
---

# Informations légales

> ⚠️ **Contenu juridique — à valider par une personne compétente.**
> Cette page **résume** les textes affichés dans l'application ; elle ne les remplace pas et
> n'a aucune valeur juridique propre. Les textes qui font foi sont ceux de l'application.
> Ce résumé est produit à partir du code source et **doit être relu et validé par un humain**
> avant toute publication.

## Les documents

| Document | Où le lire dans l'app | Répond à |
|---|---|---|
| **Avertissement** | Affiché au premier lancement · Menu ☰ → *Avertissement médical* | Ce que l'app est, et n'est pas |
| **Mentions légales** | Menu ☰ → *Mentions légales* · Profil · une entrée de la FAQ | Éditeur, responsabilité, conditions |
| **Politique de confidentialité** | Menu ☰ → *Confidentialité* · Profil | Ce que deviennent les données |

Les mentions légales et la politique sont **deux documents distincts**, délibérément : les
confondre ne sert ni l'un ni l'autre.

## Avertissement (premier lancement)

Il doit être accepté pour utiliser l'application. Il indique que celle-ci est fournie **à
titre informatif et pratique**, qu'elle peut contenir des erreurs ou des limitations
techniques, que son usage se fait sous la responsabilité de l'utilisateur, et qu'il convient
de vérifier toute information importante auprès de sources fiables ou d'un professionnel
compétent.

⚠️ **Musculator n'est pas un dispositif médical.** Elle ne diagnostique pas, ne traite pas et
ne remplace pas un professionnel de santé.

L'acceptation est enregistrée sur l'appareil, avec la version du texte acceptée. Dans ce
build, une modification du texte **ne réaffiche pas** l'avertissement à ceux qui ont déjà
accepté — c'est un réglage du code, à rebasculer si un changement mérite d'être réaccepté.

## Mentions légales — points principaux

- **Limitation de responsabilité** — calculs, estimations et analyses sont indicatifs ; rien
  ne garantit qu'ils soient exacts, complets ou adaptés à un cas particulier.
- **Localisation** — les distances mesurées au GPS dépendent du réseau, du matériel et de
  l'environnement, et peuvent se tromper. L'application ne doit pas servir d'unique moyen
  d'orientation.
- **Données** — aucun compte, aucun serveur ; effacer les données du navigateur ou
  désinstaller supprime tout définitivement.
- **Éditeur** — Swinux, canton de Vaud (Suisse). Hébergement : Netlify pour l'application,
  Infomaniak pour le domaine et la messagerie. Contact : **contact@swinux.ch**.

⚠️ **Certaines informations d'éditeur sont encore marquées `[À COMPLÉTER]`** dans
l'application et s'affichent ainsi, plutôt que d'être devinées. Voir
[À vérifier](#a-verifier).

## Politique de confidentialité — points principaux

- **Rien par défaut** — séances, repas et marches restent sur l'appareil ; l'éditeur n'y a pas
  accès et ne peut rien restaurer.
- **Trois sorties possibles, toutes déclenchées par l'utilisateur** — une recherche d'aliment
  vers Open Food Facts, une analyse IA vers OpenRouter si une clé est configurée, un message
  au support par l'application mail.
- ⚠️ **L'analyse IA distante est le seul endroit où des données de santé quittent
  l'appareil** : prénom, poids, taille, âge et blessures déclarées. Sans clé configurée, rien
  ne part.
- **GPS** — la distance est calculée au fil de l'eau puis les points sont jetés : aucun trajet
  n'est enregistré.
- **Aucun traceur** — pas de cookie, pas de mesure d'audience, pas de publicité, aucun script
  tiers.

Détail technique vérifié dans le code : [Données et confidentialité](../data/).

## Conditions d'utilisation

Il n'existe **pas de document « Conditions générales d'utilisation » distinct** dans
l'application : les conditions d'usage figurent dans les mentions légales.

## Cookies

**Aucun cookie n'est utilisé**, donc aucune bannière n'est nécessaire. Les données sont
conservées dans le stockage local du navigateur, décrit dans la politique de confidentialité.

## Licences et crédits

Sources de données citées dans l'application :

- **Open Food Facts** — base alimentaire ouverte et contributive.
- **CIQUAL** — table de composition nutritionnelle générique, embarquée dans l'application.
- **OpenRouter** — passerelle vers des modèles de langage, utilisée seulement si l'utilisateur
  configure une clé.

⚠️ **Les mentions de licence exactes de ces sources et des bibliothèques logicielles ne sont
pas listées dans l'application.** Voir [À vérifier](#a-verifier).

## Gestion des consentements

Un seul consentement existe : l'acceptation de l'avertissement au premier lancement,
obligatoire, enregistrée avec sa version. Il n'y a **aucun consentement publicitaire ni
statistique**, puisqu'il n'y a ni publicité ni mesure d'audience.

L'usage de la caméra et de la position est régi par les
[permissions du navigateur](../permissions/), demandées au moment de l'usage et refusables
sans perdre l'accès à l'application.

## À vérifier {#a-verifier}

Points **non déterminables depuis le code**, qui exigent une décision ou une validation
humaine :

1. **Les champs d'éditeur marqués `[À COMPLÉTER]`** dans l'application doivent être remplis
   (identification complète de l'éditeur, et tout élément d'immatriculation requis).
2. **La politique de confidentialité laisse un emplacement `[À COMPLÉTER]`** signalé comme tel
   dans le code.
3. **Les licences des bibliothèques et des sources de données** ne sont pas listées ; une page
   de crédits reste à écrire.
4. **La conformité RGPD / LPD** (base légale, droits des personnes, durée de conservation,
   responsable du traitement) n'a pas été évaluée ici. L'absence de serveur simplifie
   beaucoup, mais **la transmission vers OpenRouter de données de santé mérite un examen
   spécifique**.
5. **L'existence de conditions générales distinctes** est une décision à prendre.
6. **La date de mise à jour des textes légaux est maintenue à la main** dans le code : elle
   doit être avancée à chaque modification du texte.

⚠️ **Aucun de ces points ne doit être comblé par une rédaction automatique.**
