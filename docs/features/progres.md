---
titre: Progrès & badges
description: Historique complet, graphe hebdomadaire, 10 badges et correction des séances passées.
ordre: 8
---

# Progrès & badges

## Description
Tout ce qui se calcule depuis l'historique : totaux, série de jours, rythme hebdomadaire,
badges, et le détail par programme.

## Objectif
Voir si le rythme tient, et corriger le passé quand c'est nécessaire.

## Prérequis
Au moins une séance enregistrée — sinon l'écran est vide plutôt que faux.

## Comment l'utiliser
Onglet *Progrès*. Tout y est cliquable : le total déroule l'historique, une barre du graphe
filtre sur cette semaine-là, temps total et calories ouvrent leur détail.

## Options
- Modification et suppression de n'importe quelle séance de l'historique.
- Détail par programme : moyenne, 30 derniers jours, répartition.

## Paramètres associés
Aucun. Aucun objectif du profil ne modifie ces chiffres.

## Données utilisées
**Lecture** : `sessionLog` et `activityLog`. **Écriture** : uniquement lors d'une modification
ou d'une suppression.

## Résultat

Les **10 badges** se débloquent depuis l'usage réel :

| Badge | Condition |
|---|---|
| 1re séance | 1 séance |
| 3 jours | Série de 3 jours |
| 10 séances | 10 séances |
| Matinal | Au moins une séance tôt le matin |
| HIIT | Au moins une séance HIIT |
| 30 jours | Série de 30 jours |
| 100 séances | 100 séances |
| 7 jours de marche | 7 jours de marche d'affilée |
| 100 km | 100 km de marche cumulés |
| Élite | 200 séances **et** une série de 30 jours |

## Fonctionnement hors connexion
Identique — tout est calculé sur l'appareil.

## Fonctionnement en ligne
Identique, sauf l'[analyse des progrès](analyse-progres.md) si un modèle est configuré.

## Limites
- **La marche ne compte pas comme une séance** : elle n'entre ni dans la série de jours ni
  dans les totaux de séances, et n'a que ses deux badges à elle.
- Les calories sont une estimation forfaitaire (9 kcal/min de séance), pas une mesure.
- Une modification de séance **invalide l'analyse mise en cache** des jours concernés — les
  deux dates si la séance change de jour.
- L'historique est trié par jour puis par heure, le plus récent en premier ; une séance
  consignée pour une date passée se range à sa place.

## Erreurs possibles
Aucune.

## Dépannage
[Ma séance n'apparaît pas](../troubleshooting/seance-absente.md)

## FAQ
- [Comment fonctionne la série de jours ?](../faq/#serie-jours)
