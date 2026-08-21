---
titre: Import Nutritor
description: Reprendre un historique de repas depuis un export CSV de journal Nutritor.
ordre: 15
---

# Import Nutritor

## Description
Lecture d'un fichier CSV exporté depuis l'application Nutritor, versé dans le journal
alimentaire.

## Objectif
Ne pas repartir de zéro quand on arrive d'une autre application.

## Prérequis
Un export CSV de **journal** Nutritor, sur l'appareil.

## Comment l'utiliser
1. Menu ☰ → *Profil* → **Importer depuis Nutritor**.
2. *Choisir un fichier CSV*.
3. Le résultat s'affiche : nombre d'aliments, de jours, et de lignes ignorées.

## Options
Aucune : l'import est toujours une **fusion**.

## Paramètres associés
Aucun.

## Données utilisées
**Écriture** : `nutriLog`. Le fichier est lu sur l'appareil, il n'est envoyé nulle part.

## Résultat
**Les jours déjà renseignés sont complétés, jamais remplacés** : un import ne peut pas effacer
ce que vous avez consigné ici.

## Fonctionnement hors connexion
Identique — la lecture est entièrement locale.

## Fonctionnement en ligne
Identique.

## Limites
- Format attendu : un export de **journal** Nutritor, avec au minimum des colonnes de date et
  d'aliment. Un autre CSV est refusé plutôt que mal interprété.
- Les lignes inexploitables sont ignorées et **comptées** dans le message de résultat.
- Il n'existe pas d'import de séances depuis une autre application ; seule la
  [sauvegarde Musculator](sauvegarde.md) les transporte.

## Erreurs possibles

| Message | Cause |
|---|---|
| « Fichier vide ou sans ligne de données. » | Moins de deux lignes |
| « Colonnes 'date' et 'aliment' introuvables — est-ce bien un export de journal Nutritor ? » | En-têtes non reconnus |
| « Aucune ligne exploitable (*n* ignorées). » | Toutes les lignes rejetées |

## Dépannage
[Mon import est refusé](../troubleshooting/import-refuse.md)

## FAQ
- [Comment sauvegarder mes données ?](../faq/#sauvegarde)
