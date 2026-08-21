---
titre: Marche
description: Distance saisie, suivie au GPS ou importée, avec calcul net des calories.
ordre: 10
---

# Marche

## Description
Un suivi de marche autonome, tenu à l'écart du journal de séances : une marche n'est pas un
entraînement.

## Objectif
Compter les kilomètres du jour dans la dépense, sans fausser la série de jours ni les badges
de séance.

## Prérequis
- Saisie manuelle et import : aucun prérequis.
- **Suivi GPS** : permission de position + connexion sécurisée (HTTPS) + application ouverte,
  écran allumé.

## Comment l'utiliser
1. Journal → *Ajouter une marche*.
2. Choisissez : saisie, suivi GPS, ou import de fichier.
3. Pour une saisie, indiquez une distance — ou seulement une durée, et laissez l'app la
   déduire.

## Options
- **Type de marche** — Flânerie, Normale, Rapide, Course à pied. Il change la longueur du pas
  et la cadence, donc la distance estimée ; pour la course, il double aussi le coût par
  kilomètre.
- **Objectif quotidien** — `Marche (km / jour)` dans le profil. Rien ne le calcule : vide, il
  n'y a pas d'objectif.
- **Import** — GPX, ou CSV d'export (Strava, Apple Santé, Google Fit).

## Paramètres associés
[Marche (km/jour)](../settings/#marche-km-jour), et indirectement **poids**, **taille** et
**sexe**, qui entrent dans les calculs.

## Données utilisées
**Lecture** : poids, taille, sexe. **Écriture** : `activityLog`, indexé par jour —
`{ km, minutes, kcal }` et le type de marche.

⚠️ **Aucun trajet n'est enregistré.** Le suivi GPS calcule une distance au fil de l'eau puis
jette les points.

## Résultat
La marche du jour apparaît au Journal et à l'Accueil, et alimente ses deux badges.

## Fonctionnement hors connexion
Saisie, import et calculs fonctionnent hors ligne. **Le GPS aussi** : la géolocalisation ne
demande pas de réseau, même si un premier point peut être plus long à obtenir sans
assistance réseau.

## Fonctionnement en ligne
Identique.

## Limites
- **Aucun comptage de pas en arrière-plan n'est possible pour une PWA.** L'application ne le
  simule pas : le suivi est un acte explicite, écran allumé. Le nombre de pas affiché au
  Journal est une **estimation** déduite de la distance et de la longueur du pas.
- Le maintien de l'écran allumé est demandé au système, sans garantie.
- Une distance saisie l'emporte toujours sur une estimation.
- Les calories sont recalculées depuis le **poids actuel** : corriger son poids corrige les
  estimations passées.
- **La marche ne s'ajoute jamais à la cible calorique** — celle-ci contient déjà l'activité
  quotidienne via le multiplicateur de fréquence. Elle est affichée à côté ; aucun bilan net
  n'est présenté.
- Précision GPS dépendante du matériel et de l'environnement — voir les
  [mentions légales](../legal/).

## Erreurs possibles

| Message | Cause |
|---|---|
| « Accès à la position refusé — autorise-le pour suivre la marche, ou saisis la distance à la main. » | Permission refusée |
| « Position indisponible pour l'instant. » | Aucun point exploitable |
| « La géolocalisation exige une connexion sécurisée (HTTPS). » | Contexte non sécurisé |
| « Ce navigateur n'expose pas la géolocalisation. » | API absente |
| « Fichier GPX illisible. » | XML invalide |
| « Aucune trace exploitable dans ce GPX (moins de 2 points). » | Trace trop courte |
| « La trace ne parcourt aucune distance. » | Points identiques |
| « Colonnes de date et de distance introuvables — vérifie que c'est bien un export d'activités. » | CSV non reconnu |

## Dépannage
[Le GPS ne suit pas ma marche](../troubleshooting/gps-ne-suit-pas.md)

## FAQ
- [Pourquoi l'app ne compte-t-elle pas mes pas automatiquement ?](../faq/#pas-comptes)
- [Comment la distance est-elle déduite de la durée ?](../faq/#distance-deduite)
- [Pourquoi les calories de la marche ne s'ajoutent-elles pas à ma cible ?](../faq/#marche-calories)
