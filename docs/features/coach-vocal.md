---
titre: Coach vocal
description: Annonce du mouvement et cadence des répétitions par la synthèse vocale du téléphone.
ordre: 6
---

# Coach vocal

## Description
Pendant une séance, l'application annonce l'exercice et rythme les répétitions à voix haute,
via la **synthèse vocale du système** (aucun son n'est téléchargé).

## Objectif
Permettre de s'entraîner sans regarder l'écran.

## Prérequis
- Un navigateur exposant la synthèse vocale (`speechSynthesis`) et au moins une voix
  française installée.
- Le volume du téléphone non coupé.
- Aucune permission à accorder.

## Comment l'utiliser
Il est **actif par défaut**. Rien à faire.

## Options
- Bouton haut-parleur pendant la séance — coupe la voix sans arrêter la séance.
- Menu ☰ → *Coach vocal activé / coupé*.

## Paramètres associés
[Coach vocal](../settings/#coach-vocal) — booléen, persisté, valeur par défaut *activé*.

## Données utilisées
Le nom de l'exercice et ses indications de cadence, lus depuis le catalogue.
**Le coach ne prononce jamais votre prénom.** Rien n'est envoyé nulle part : la synthèse est
faite par le système.

## Résultat
Une annonce à chaque changement de phase, puis des repères de cadence pendant l'effort.

## Fonctionnement hors connexion
Dépend du système. Certaines voix sont téléchargées à la demande par le téléphone : une voix
non installée peut rester muette hors ligne.

## Fonctionnement en ligne
Identique.

## Limites
- **Une annonce plus longue qu'un temps de cadence est coupée par la suivante** : les
  indications sont volontairement courtes.
- Le choix de la voix, sa vitesse et son volume dépendent du téléphone ; l'application ne les
  règle pas.
- iOS exige souvent une première interaction de l'utilisateur avant d'autoriser la synthèse
  vocale.
- Certains navigateurs de bureau n'ont aucune voix française installée.

## Erreurs possibles
Aucune erreur n'est affichée : un navigateur sans synthèse vocale reste simplement
silencieux.

## Dépannage
[Le coach vocal ne parle pas](../troubleshooting/coach-vocal-muet.md)

## FAQ
- [Le coach vocal ne parle pas](../faq/#coach-vocal)
