---
titre: Créer une séance
description: Composer une séance sur mesure à partir du catalogue, avec ses propres réglages et son ordre.
ordre: 3
---

# Créer une séance

## Description
Un constructeur qui pioche dans les 152 exercices du catalogue et produit une séance
réutilisable, identique en tout point à une séance du catalogue.

## Objectif
Adapter l'entraînement à un matériel, une durée ou une contrainte que le catalogue ne couvre
pas.

## Prérequis
Aucun.

## Comment l'utiliser
1. Menu ☰ → *Créer une séance* (ou depuis l'onglet Programmes).
2. Nommez la séance, indiquez sa durée et son objectif.
3. Ajoutez des exercices depuis le sélecteur.
4. Réglez séries, répétitions, charge et repos pour chacun.
5. Réordonnez avec les flèches — c'est l'ordre d'exécution.
6. *Enregistrer*.

## Options
Chaque exercice porte ses propres réglages, qui remplacent ceux du catalogue **pour cette
séance uniquement**.

## Paramètres associés
Aucun.

## Données utilisées
**Écriture** : une entrée dans `customWorkouts`, persistée sur l'appareil.

## Résultat
La séance apparaît dans l'onglet Programmes et se lance comme n'importe quelle autre.

## Fonctionnement hors connexion
Identique.

## Fonctionnement en ligne
Identique.

## Limites
- La séance vit **sur cet appareil uniquement**. Elle fait partie de la
  [sauvegarde](sauvegarde.md), qui est le seul moyen de la transférer.
- Pas de duplication d'une séance du catalogue en un geste : il faut la recomposer.

## Erreurs possibles
Aucune.

## Dépannage
[J'ai perdu mes données](../troubleshooting/donnees-disparues.md)

## FAQ
- [Puis-je créer mes propres séances ?](../faq/#creer-programme)
