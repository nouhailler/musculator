---
titre: Séance guidée
description: Le moteur de séance — phases d'effort et de repos, comptage des séries, arrêt en cours de route et enregistrement.
ordre: 1
---

# Séance guidée

## Description

L'application déroule la séance à votre place : elle annonce l'exercice, décompte l'effort,
enchaîne le repos, compte les séries et enregistre le tout au journal quand c'est fini.

## Objectif

Ne pas avoir à tenir un compte pendant l'effort. La seule action requise est de valider une
série terminée.

## Prérequis

Aucun. Ni compte, ni réseau, ni permission.

## Comment l'utiliser

1. Choisissez un programme (onglet *Programmes*), ou *Commencer une séance* depuis l'Accueil.
2. *Démarrer*.
3. À chaque série terminée, appuyez sur **Série terminée**. Le repos démarre seul.
4. Continuez jusqu'au dernier exercice — le récapitulatif s'affiche.

## Options

- **Répétitions et charge** modifiables à la volée, sans toucher au programme d'origine.
- **Repos** : *+15 s* ou *Passer*.
- **Chronomètre** indépendant, avec remise à zéro.
- **Mode plein écran** : grands boutons pour un téléphone posé à un mètre.
- **Coach vocal** coupable d'un geste.
- **Pause** : gèle chrono, coach et démo.
- **Exercice seul** : lancé depuis une fiche exercice, sans objectif de séries — seul
  *Terminer* le clôt.

## Paramètres associés

[Coach vocal](../settings/#coach-vocal) (activé par défaut). Aucun autre réglage ne modifie
le déroulé.

## Données utilisées

**En lecture** : le programme et le catalogue d'exercices (embarqués), les réglages
prescrits par le programme.
**En écriture** : une entrée dans `sessionLog` à la fin de la séance —
date, heure, durée, calories estimées, séries réellement faites, exercices atteints, muscles
travaillés, indicateur *partielle*.

⚠️ **L'état d'une séance en cours ne vit qu'en mémoire.** Il n'est pas persisté : fermer
l'application ou recharger la page pendant une séance la perd.

## Résultat

Une entrée au [Journal](journal.md) et dans l'historique des [Progrès](progres.md), qui
alimente la série de jours, les badges, le graphe hebdomadaire et la
[cartographie musculaire](cartographie.md).

## Fonctionnement hors connexion

Identique. Rien dans une séance ne touche au réseau.

## Fonctionnement en ligne

Identique. Une [mise à jour](mise-a-jour.md) détectée est mise en attente, jamais appliquée
pendant la séance.

## Limites

- Pas de reprise après fermeture de l'application.
- Pas de suivi charge par charge sur les séries passées : ce qui est enregistré est un total
  de séries par exercice.
- L'application ne maintient pas l'écran allumé.
- Les calories sont une estimation forfaitaire à la durée (9 kcal/min), pas une mesure.

## Erreurs possibles

| Situation | Message |
|---|---|
| Mise à jour demandée pendant la séance | « Séance en cours — termine-la avant de mettre à jour. » |
| Tutoriel lancé pendant la séance | Refusé silencieusement |

## Dépannage

[Le coach vocal ne parle pas](../troubleshooting/coach-vocal-muet.md) ·
[J'ai perdu ma séance en cours](../troubleshooting/seance-perdue.md)

## FAQ

- [J'ai arrêté ma séance en cours de route, est-elle perdue ?](../faq/#seance-partielle)
- [Puis-je faire un seul exercice sans monter un programme ?](../faq/#exercice-seul)
