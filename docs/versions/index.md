---
titre: Versions
description: Comment les versions de Musculator sont identifiées, et où trouver l'historique des changements.
ordre: 11
---

# Versions

## Comment une version est identifiée

⚠️ **Le projet n'a pas encore de numéro de version publié.** `package.json` est à `0.0.0`, et
il n'existe aucune étiquette de version dans le dépôt.

Ce qui identifie une version est donc son **build** :

| | |
|---|---|
| **Identifiant de build** | Le code affiché sous « Version installée », dans Profil → *Version & mise à jour* |
| **Date de build** | Affichée à côté — c'est la date de la version, pas celle du téléphone |
| **D'où il vient** | Le commit déployé, ou `dev` en développement |

C'est ce couple qu'il faut donner au support, et il est joint automatiquement au diagnostic.

## Historique des changements

L'historique complet vit dans **`CHANGELOG.md`**, à la racine du dépôt. Il suit le format
*Keep a Changelog* et, faute de versions publiées, groupe les entrées **par date** en citant
le commit correspondant.

Ne recopiez pas cet historique ici : il aurait deux sources et divergerait. Cette page dit
seulement où le trouver et comment le lire.

## Documentation

| | |
|---|---|
| **Version de la documentation** | 1.0.0 |
| **Dernière mise à jour** | 21 août 2026 |
| **Correspond au build** | Voir l'audit de couverture (`npm run docs:audit`) |

La documentation est versionnée avec le code, dans le même dépôt : une modification
fonctionnelle et sa documentation voyagent ensemble.

## Ce qu'une entrée de version doit contenir

Quand des versions numérotées seront publiées, chaque entrée devra documenter :

- **Nouveautés** — fonctionnalités ajoutées
- **Améliorations**
- **Corrections**
- **Changements** de comportement
- **Changements incompatibles**
- **Modifications de paramètres** — nouveau réglage, valeur par défaut changée, réglage retiré
- **Modifications de données** — nouvelle tranche persistée, format modifié, migration
- **Modifications de confidentialité** — nouvel hôte contacté, nouvelle donnée transmise
- **Documentation mise à jour** — quelles pages

Les quatre derniers points sont ceux qu'un changelog oublie le plus facilement, et ceux qui
comptent le plus pour un utilisateur.

## Politique de mise à jour

Une nouvelle version s'installe en arrière-plan et **ne s'applique qu'au redémarrage** :
une app installée est rouverte, pas rechargée. Le bouton du profil la cherche et l'applique
tout de suite.

⚠️ **Une mise à jour est refusée pendant une séance.**

Voir [Mise à jour](../features/mise-a-jour.md).

## Documentation historique

Aucune documentation historique n'est supprimée. Il n'existe pour l'instant qu'une seule
version de la documentation : le projet ne maintient pas plusieurs versions de l'application
en parallèle.

## À vérifier

- **Adopter un numéro de version sémantique** (`package.json` + étiquette Git) rendrait cette
  page et le changelog beaucoup plus utiles. C'est une décision de projet, pas une déduction
  possible depuis le code.
