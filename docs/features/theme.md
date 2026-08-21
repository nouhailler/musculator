---
titre: Thème
description: Sombre, clair, ou le réglage du téléphone — appliqué immédiatement et gardé sur l'appareil.
ordre: 20
---

# Thème

## Description
Deux palettes complètes, et un mode qui suit le réglage clair/sombre du téléphone.

## Objectif
Lire l'application confortablement dans les deux ambiances.

## Prérequis
Aucun.

## Comment l'utiliser
Menu ☰ → *Profil* → **Apparence** → Sombre / Clair / Système.

## Options

| Valeur | Effet |
|---|---|
| **Sombre** | Palette sombre, quel que soit le téléphone. Valeur par défaut. |
| **Clair** | Palette claire, quel que soit le téléphone. |
| **Système** | Suit le réglage du téléphone, **en direct** : un téléphone qui bascule au coucher du soleil fait basculer l'app sans rechargement. |

## Paramètres associés
[Thème](../settings/#theme).

## Données utilisées
**Écriture** : `theme`, persisté sur l'appareil et inclus dans la
[sauvegarde](sauvegarde.md).

## Résultat
Le changement s'applique **immédiatement**, sans *Enregistrer* et sans rechargement. La
couleur de la barre système du téléphone suit.

Le thème est appliqué **avant le premier affichage** : il n'y a pas de flash blanc au
démarrage.

## Fonctionnement hors connexion
Identique.

## Fonctionnement en ligne
Identique.

## Limites
- Deux thèmes seulement ; pas de choix de couleur d'accent, pas de contraste renforcé.
- Le défaut est **Sombre**, y compris sur un téléphone réglé en clair : une installation
  existante ne doit pas changer d'apparence sans qu'on le lui demande. Choisissez *Système*
  pour suivre le téléphone.
- Deux éléments ne suivent pas la palette, délibérément : l'échelle de couleurs Nutri-Score
  (c'est une échelle normalisée) et le viseur de la caméra.

## Erreurs possibles
Aucune.

## Dépannage
Aucun article dédié.

## FAQ
- [Par où commencer ?](../faq/#par-ou-commencer)
