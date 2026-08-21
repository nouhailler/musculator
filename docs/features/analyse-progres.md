---
titre: Analyse IA des progrès
description: Les 4 dernières semaines comparées aux 4 précédentes, à la lumière des objectifs déclarés.
ordre: 17
---

# Analyse IA des progrès

## Description
Une seconde analyse, distincte de celle du jour, qui répond à une autre question : **ce que
vous faites vous emmène-t-il vers ce que vous avez dit vouloir ?**

## Objectif
Confronter la pratique réelle aux objectifs déclarés, sur une fenêtre assez longue pour que
ce soit une tendance et pas une humeur.

## Prérequis
Des séances sur la période. Un thème sans données est signalé comme **non mesuré**.

## Comment l'utiliser
Onglet *Progrès* → *Analyse IA des progrès*.

## Options
Les **mêmes deux moteurs** que l'analyse du jour : local par défaut, OpenRouter si une clé et
un modèle sont configurés. Les deux partent **du même jeu de statistiques**, pour qu'ils
répondent à partir de faits identiques.

## Paramètres associés
Tout le bloc objectifs du profil : [objectif principal](../settings/#objectif-principal),
[zones prioritaires](../settings/#zones-prioritaires),
[objectif nutrition](../settings/#objectif-nutrition),
[objectifs quotidiens](../settings/#objectifs-quotidiens) et
[contraintes](../settings/#contraintes).

## Données utilisées
**Lecture** : `sessionLog`, `nutriLog`, `activityLog`, le profil et les cibles quotidiennes,
sur **4 semaines comparées aux 4 précédentes**.
**Sortant** (moteur OpenRouter uniquement) : les statistiques agrégées de cette fenêtre.

## Résultat
Une note par thème et des constats. **Un thème sans données sort du dénominateur** plutôt
que d'être compté comme un échec — la même règle que le score nutrition, pour la même raison.

## Fonctionnement hors connexion
Moteur local uniquement, avec repli automatique et message explicatif.

## Fonctionnement en ligne
Les deux moteurs selon la configuration.

## Limites
- **Elle n'est jamais mise en cache**, contrairement à celle du jour : elle lit une fenêtre
  qui se déplace chaque jour, une copie stockée vieillirait en réponse fausse.
- Elle est donc **recalculée à chaque fois** — et, avec un modèle OpenRouter, refacturée.
- Elle ne compare que deux fenêtres de 4 semaines : elle ne dit rien d'une progression sur un
  an.
- ⚠️ Elle ne remplace pas l'avis d'un professionnel de santé.

## Erreurs possibles
Les mêmes que l'[analyse du jour](analyse-ia.md), plus :

| Message | Cause |
|---|---|
| « Le modèle n'a renvoyé aucun constat exploitable. » | Réponse vide de contenu utile |

## Dépannage
[L'analyse IA échoue](../troubleshooting/analyse-echoue.md)

## FAQ
- [Par où commencer ?](../faq/#par-ou-commencer)
