---
titre: Cartographie musculaire
description: Sollicitation et récupération de 21 groupes musculaires, calculées depuis les séances réelles.
ordre: 9
---

# Cartographie musculaire

## Description
Une silhouette, face avant et face arrière, dont les zones se colorent selon la sollicitation
récente de chaque groupe musculaire.

## Objectif
Choisir quoi travailler aujourd'hui sans repasser sur un groupe encore chargé.

## Prérequis
Aucun. Sans séance enregistrée, la carte est entièrement au repos.

## Comment l'utiliser
1. Menu ☰ → *Cartographie musculaire*.
2. Basculez entre face avant et face arrière.
3. Touchez une zone pour voir le muscle et les exercices qui le travaillent.

## Options
La silhouette suit le sexe déclaré au profil.

## Données utilisées
**Lecture** : les muscles enregistrés sur chaque séance de `sessionLog`, et la date de la
séance. **Écriture** : aucune.

## Résultat
Une intensité par groupe, qui **décroît avec les jours** : un muscle travaillé il y a une
semaine est presque revenu à zéro.

## Fonctionnement hors connexion
Identique.

## Fonctionnement en ligne
Identique.

## Limites
- 21 groupes musculaires. Un muscle sans zone sur la silhouette ne serait pas sélectionnable.
- Une séance partielle n'attribue que les muscles des exercices réellement atteints.
- La décroissance est un modèle simple, pas une mesure de récupération réelle : elle ne tient
  compte ni de l'intensité, ni du sommeil, ni de l'alimentation.
- Les séances ajoutées après coup comme « séance libre » ne portent aucun exercice, donc
  aucun muscle : elles n'apparaissent pas sur la carte.

## Erreurs possibles
Aucune.

## Dépannage
[Ma séance n'apparaît pas](../troubleshooting/seance-absente.md)

## FAQ
- [Comment fonctionne la série de jours ?](../faq/#serie-jours)
