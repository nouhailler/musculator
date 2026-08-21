---
titre: Compatibilité
description: Plateformes et navigateurs supportés, et ce qui y fonctionne différemment.
ordre: 4
---

# Compatibilité

> ⚠️ Ne sont déclarés compatibles que les environnements réellement pris en charge par le
> code. Les niveaux de version minimale précis ne sont pas fixés par le projet — voir
> [À vérifier](#a-verifier).

## Plateformes

| Plateforme | Navigateur | Installation | État |
|---|---|---|---|
| Android | Chrome, Edge | Menu ⋮ → *Installer l'application* | Complet |
| Android | Firefox | Non proposée par le navigateur | Fonctionne dans l'onglet |
| iOS / iPadOS | Safari | Partager → *Sur l'écran d'accueil* | Complet, avec des réserves |
| iOS / iPadOS | Chrome, Firefox | Non proposée | Fonctionne dans l'onglet |
| Bureau | Chrome, Edge | Icône dans la barre d'adresse | Complet |
| Bureau | Firefox | Non proposée | Fonctionne dans l'onglet |
| Bureau | Safari | Non vérifiée | À vérifier |

L'application est conçue **pour le mobile en orientation portrait** ; le manifeste le déclare.

## Fonctions par environnement

| Fonction | Android/Chrome | iOS/Safari | Firefox | Bureau |
|---|:---:|:---:|:---:|:---:|
| Séances, catalogue, journal, nutrition, marche manuelle | ✅ | ✅ | ✅ | ✅ |
| Installation en app | ✅ | ✅ | ❌ | ✅ (Chrome/Edge) |
| Fonctionnement hors ligne | ✅ | ✅ | ✅ | ✅ |
| Scanner — lecteur natif | ✅ | ❌ | ❌ | ✅ (Chrome/Edge) |
| Scanner — décodeur de secours | — | ✅ | ✅ | ✅ |
| Suivi GPS | ✅ | ✅ | ✅ | ⚠️ |
| Maintien de l'écran allumé | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Coach vocal | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Feuille de partage (export) | ✅ | ✅ | ❌ | ⚠️ |
| Téléchargement direct (export) | ✅ | ⚠️ | ✅ | ✅ |
| Plein écran (mode grands boutons) | ✅ | ⚠️ | ✅ | ✅ |

✅ pris en charge · ⚠️ dépend du navigateur ou du système · ❌ absent, avec un repli

## Prérequis communs

- ⚠️ **Connexion sécurisée (HTTPS)** — obligatoire pour la caméra et le GPS.
- **Stockage local disponible** — la navigation privée et les réglages qui bloquent les
  données de site empêchent toute conservation.
- **Un premier chargement en ligne** — l'application ne peut pas s'installer hors ligne.

## Réserves connues par plateforme

### iOS / iPadOS

- Le téléchargement d'un fichier depuis une app installée **échoue souvent en silence** :
  l'export de sauvegarde essaie donc la feuille de partage en premier.
- La synthèse vocale exige souvent **une première interaction** de l'utilisateur.
- Le stockage peut être **libéré par le système** quand la PWA n'est pas ouverte pendant
  plusieurs semaines.
- Pas de lecteur de code-barres natif : un décodeur est téléchargé à la première utilisation.
- iOS ne communique jamais le modèle de l'appareil : le diagnostic de support ne peut pas le
  nommer.

### Firefox

- Pas de lecteur de code-barres natif : décodeur téléchargé à la première utilisation.
- Pas de partage de fichier : l'export passe par le téléchargement.
- L'installation en app n'est pas proposée.

### Bureau

- Le suivi GPS n'a guère de sens sur un ordinateur fixe.
- Les voix de synthèse françaises ne sont pas toujours installées.
- L'application reste dessinée pour un écran de téléphone.

## À vérifier {#a-verifier}

Les points suivants ne sont **pas déterminables depuis le code** et demandent une décision ou
une vérification humaine :

- **Versions minimales** d'Android, d'iOS et des navigateurs. Aucune n'est déclarée dans le
  projet, et aucune matrice de tests n'existe.
- **Safari de bureau** : ni pris en charge explicitement, ni exclu.
- **Tablettes Android** : non vérifié.

Voir [Limites connues](limitations.md).
