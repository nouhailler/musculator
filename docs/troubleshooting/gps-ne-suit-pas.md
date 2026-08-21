---
titre: Le GPS ne suit pas ma marche
description: Distance qui reste à zéro, ou message concernant la position.
ordre: 7
---

# Le GPS ne suit pas ma marche

## Symptôme

Le suivi affiche 0,0 km alors que vous marchez, ou un message concernant la position.

## Causes possibles

- La **permission de position a été refusée**.
- L'application est servie **sans HTTPS**.
- La **localisation du téléphone** est désactivée globalement.
- ⚠️ **L'écran s'est éteint, ou vous avez quitté l'application** : le suivi ne tourne que
  l'app ouverte, écran allumé.
- Le signal est mauvais (intérieur, tunnel, canyon urbain).
- Vous êtes **à l'arrêt ou très lent** : les points imprécis sont filtrés volontairement, pour
  qu'un téléphone immobile n'accumule pas de kilomètres.

## Diagnostic

| Message | Cause |
|---|---|
| « Accès à la position refusé… » | Permission refusée |
| « La géolocalisation exige une connexion sécurisée (HTTPS). » | Contexte non sécurisé |
| « Ce navigateur n'expose pas la géolocalisation. » | API absente |
| « Position indisponible pour l'instant. » | Aucun point exploitable — signal |

Un message de position qui disparaît tout seul est normal : une perte de signal passagère
efface son avertissement dès qu'un point revient.

## Solution

**Permission refusée** :

- *Android / Chrome* : cadenas → Localisation → Autoriser. Vérifiez aussi que la localisation
  du téléphone est active.
- *iOS / Safari* : Réglages → Confidentialité et sécurité → Service de localisation → activé,
  puis Safari → « Lorsque l'app est active ».
- *Bureau* : cadenas → Localisation.

**Signal faible** — sortez à l'air libre et attendez quelques dizaines de secondes.

**Écran qui s'éteint** — l'application demande au système de le garder allumé, mais ce n'est
pas garanti. Augmentez le délai de mise en veille, ou gardez l'écran allumé.

## Si le problème persiste

⚠️ **Aucune PWA ne peut compter les pas en arrière-plan.** L'application ne le simule pas.
Deux solutions de repli, aussi exactes :

1. **Saisir la distance** à la main — elle l'emporte toujours sur une estimation.
2. **Saisir seulement la durée** — la distance est déduite de votre taille et du type de
   marche, et le détail du calcul est affiché.
3. **Importer** un GPX ou un CSV depuis une application de sport qui, elle, tourne en
   arrière-plan.

## Informations à fournir au support

Le message exact, la plateforme, si la localisation fonctionne dans d'autres applications,
et si l'écran est resté allumé.

Voir [Marche](../features/marche.md) · [Permissions](../permissions/#position)
