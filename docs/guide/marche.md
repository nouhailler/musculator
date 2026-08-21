---
titre: Marche
description: Saisir une marche, la suivre au GPS ou l'importer depuis un GPX ou un CSV.
ordre: 14
couvre: activity
---

# Marche

**Objectif** — consigner les kilomètres parcourus, qui comptent dans la dépense du jour.

**Accès** — *Ajouter une marche* depuis le [Journal](journal.md), ou menu ☰.

⚠️ **Une marche n'est pas une séance.** Elle a ses propres badges et n'entre ni dans la série
de jours, ni dans « séances au total ».

## Trois façons de saisir

| Méthode | Ce qu'elle demande | Réseau / permission |
|---|---|---|
| **Manuelle** | Une distance, ou seulement une durée | Aucun |
| **Suivi GPS** | Rien — l'app mesure pendant que vous marchez | Position + HTTPS |
| **Import** | Un fichier GPX, ou un CSV d'export (Strava, Apple Santé, Google Fit) | Aucun |

## Distance déduite d'une durée

Si vous n'entrez qu'une durée, la distance est calculée depuis votre taille et le type de
marche : **longueur du pas × cadence**. Le détail du calcul est affiché à l'écran. Une
distance saisie prend toujours le dessus sur l'estimation.

Sans taille au profil, le calcul retombe sur une taille médiane de 170 cm, et l'écran le dit.

## Type de marche

Flânerie, Normale, Rapide ou Course à pied. Il change la longueur du pas et la cadence —
donc la distance — et, pour la course, le coût par kilomètre : environ le double de celui de
la marche.

## Suivi GPS

- Il ne tourne **que l'application ouverte, écran allumé**. Aucun navigateur ne compte les
  pas en arrière-plan.
- Il demande une connexion sécurisée (HTTPS) et votre autorisation.
- L'application demande au système de garder l'écran allumé, sans garantie.
- Les points reçus sont filtrés (précision, pas minimum, saut) : un téléphone à l'arrêt
  rapporte une position qui vagabonde et accumulerait des kilomètres.
- L'allure ne s'affiche qu'après 60 s et 100 m — plus tôt, un seul point de mesure se lit
  comme un sprint.
- **Aucun trajet n'est enregistré** : la distance est calculée au fil de l'eau puis les points
  sont jetés.

## Calcul des calories

0,5 kcal par kilo et par kilomètre, **net** du métabolisme de repos. Sans distance, la durée
est convertie via une valeur MET diminuée de 1, pour rester nette elle aussi.

Les calories sont recalculées depuis votre **poids actuel** : corriger votre poids corrige
aussi les estimations passées.

⚠️ **La marche ne s'ajoute jamais à votre cible calorique** : celle-ci contient déjà votre
activité quotidienne, elle serait comptée deux fois. Elle est affichée à côté.

## Erreurs possibles

| Situation | Message |
|---|---|
| Marche saisie sans distance ni durée | « Renseigne au moins une distance ou une durée. » |
| Position refusée | « Accès à la position refusé — autorise-le pour suivre la marche, ou saisis la distance à la main. » |
| Position indisponible | « Position indisponible pour l'instant. » |
| Pas de HTTPS | « La géolocalisation exige une connexion sécurisée (HTTPS). » |
| Navigateur sans géolocalisation | « Ce navigateur n'expose pas la géolocalisation. » |
| GPX corrompu | « Fichier GPX illisible. » |
| GPX trop court | « Aucune trace exploitable dans ce GPX (moins de 2 points). » |
| CSV non reconnu | « Colonnes de date et de distance introuvables — vérifie que c'est bien un export d'activités. » |

Une perte de signal passagère efface son propre avertissement dès qu'un point revient.

## Où aller ensuite

[Marche (fonctionnalité)](../features/marche.md) · [Permissions](../permissions/) ·
[Dépannage : le GPS ne suit pas](../troubleshooting/gps-ne-suit-pas.md)
