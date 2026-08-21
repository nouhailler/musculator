---
titre: Le scanner ne s'ouvre pas
description: Écran noir ou message d'erreur à l'ouverture du scanner de code-barres.
ordre: 6
---

# Le scanner ne s'ouvre pas

## Symptôme

Le scanner affiche un message d'erreur, ou une image noire, au lieu du flux de la caméra.

## Causes possibles

- La **permission caméra a été refusée**.
- L'application est servie **sans HTTPS** — la caméra est alors refusée par le navigateur.
- La caméra est **occupée par une autre application**.
- Le navigateur **n'a pas de lecteur intégré** et le décodeur de secours n'a pas pu être
  téléchargé (hors ligne à la première utilisation).
- L'appareil n'a pas de caméra.

## Diagnostic

Le message affiché désigne la cause :

| Message | Cause |
|---|---|
| « Accès à la caméra refusé… » | Permission refusée |
| « La caméra exige une connexion sécurisée (HTTPS). » | Contexte non sécurisé |
| « Caméra indisponible. Saisis le code à la main. » | Pas de caméra, ou occupée |

## Solution

**Permission refusée** — réautorisez :

- *Android / Chrome* : cadenas de la barre d'adresse → Caméra → Autoriser. Depuis l'app
  installée : appui long sur l'icône → Infos → Autorisations → Caméra.
- *iOS / Safari* : Réglages → Safari → Caméra, ou Réglages → *nom du site*.
- *Bureau* : cadenas de la barre d'adresse → Caméra.

Puis rouvrez le scanner.

**Caméra occupée** — fermez les autres applications qui l'utilisent.

**Première utilisation sur iOS Safari ou Firefox** — connectez-vous une fois au réseau : un
décodeur est téléchargé à ce moment-là, puis mis en cache pour un an.

## Si le problème persiste

⚠️ **Le code-barres peut toujours être saisi à la main** — c'est le repli proposé dans chaque
message d'erreur. La recherche par nom et la saisie manuelle d'un aliment restent
disponibles.

## Informations à fournir au support

Le message exact, la plateforme, le navigateur, si l'app est installée ou dans un onglet, et
si la caméra fonctionne dans d'autres applications.

Voir [Scanner](../features/scanner.md) · [Permissions](../permissions/#camera)
