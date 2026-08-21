---
titre: J'ai perdu mes données
description: Journal vide ou profil réinitialisé — causes, ce qui est récupérable et ce qui ne l'est pas.
ordre: 2
---

# J'ai perdu mes données

## Symptôme

Le journal est vide, le profil est revenu à zéro, les séances perso ont disparu, ou
l'avertissement du premier lancement se réaffiche.

## Causes possibles

- **Les données de site ont été effacées** (réglages du navigateur, application de nettoyage,
  « effacer les données de navigation »).
- **L'application a été désinstallée puis réinstallée.**
- **Le navigateur a libéré du stockage de sa propre initiative** — fréquent sur iOS quand une
  PWA n'est pas ouverte pendant plusieurs semaines.
- L'app a été ouverte en **navigation privée**, ou dans **un autre navigateur** que
  d'habitude.
- L'app a été ouverte depuis un **onglet** alors que les données sont dans l'app installée,
  ou l'inverse — ou depuis une **adresse différente**.

## Diagnostic

1. Ouvrez l'application **exactement** comme d'habitude : même icône, même navigateur, même
   adresse.
2. Regardez si l'avertissement de premier lancement se réaffiche : c'est le signe que le
   stockage a bien été vidé.
3. Cherchez un fichier de sauvegarde exporté (Fichiers, Téléchargements, mails envoyés à
   vous-même).

## Solution

- **Si vous avez une sauvegarde** : Profil → *Restaurer une sauvegarde* → choisissez le
  fichier → un résumé s'affiche → **Tout remplacer**.
- **Si c'était une question d'adresse ou de contexte** : rouvrez l'app par le bon chemin, les
  données sont toujours là.

## Si le problème persiste

⚠️ **Sans fichier de sauvegarde, les données ne sont pas récupérables.** L'application n'a ni
compte ni serveur : il n'existe aucune copie ailleurs, et l'éditeur ne peut rien restaurer.

**Pour que cela ne se reproduise pas** :

1. Profil → **Exporter mes données**, régulièrement.
2. Gardez le fichier **ailleurs que sur le téléphone** — dans un cloud, ou envoyé par mail.
3. N'utilisez pas d'application de nettoyage qui efface les données de site.
4. Pour vider le cache, utilisez **Forcer le rechargement complet** dans le profil, jamais
   les réglages du téléphone.

## Informations à fournir au support

Ce qui a précédé la disparition (nettoyage, mise à jour du système, réinstallation), la
plateforme, et si vous disposez d'une sauvegarde.

Voir [Sauvegarde](../features/sauvegarde.md) · [Stockage local](../data/stockage-local.md)
