---
titre: L'app ne se met pas à jour
description: Le numéro de version ne change pas, ou la recherche de mise à jour n'aboutit pas.
ordre: 1
---

# L'app ne se met pas à jour

## Symptôme

Le numéro de « Version installée » ne change pas, une correction annoncée n'est pas là, ou
le bouton répond « La recherche n'a pas abouti ».

## Causes possibles

- Une **séance est en cours** : la mise à jour est refusée volontairement.
- **Réseau lent ou indisponible** : la vérification n'a pas abouti dans le délai imparti.
- La nouvelle version **est encore en train de se télécharger** (≈ 1,7 Mo).
- L'application n'a pas été **redémarrée** : une app installée est rouverte, pas rechargée.
- Un service worker ou une page d'accueil **servis depuis un cache périmé**.
- Contexte sans service worker (certains navigateurs, mode privé).

## Diagnostic

1. Profil → *Version & mise à jour* → notez la **version installée** et sa date.
2. Appuyez sur **Vérifier les mises à jour** et lisez le message :

| Message | Signification |
|---|---|
| « Tu es déjà sur la dernière version. » | Rien à faire — c'est bien la dernière |
| « Nouvelle version installée, redémarrage… » | C'est en cours |
| « La recherche n'a pas abouti… » | ⚠️ **Ce n'est pas « à jour »** — réseau lent, ou téléchargement encore en cours |
| « Mise à jour automatique indisponible ici… » | Pas de service worker : rechargez la page |
| « Séance en cours — termine-la avant de mettre à jour. » | Terminez la séance d'abord |

## Solution

1. Terminez toute séance en cours.
2. Sur une connexion correcte, appuyez sur **Vérifier les mises à jour**.
3. Si la recherche n'aboutit pas, **attendez quelques minutes** et réessayez : le
   téléchargement est peut-être encore en cours.
4. Sinon, **Rien ne bouge ? → Forcer le rechargement complet**. Il vide le cache de
   l'application et retélécharge tout. ⚠️ **Vos données ne sont pas touchées.**
5. Vérifiez ensuite que la version affichée a changé.

## Si le problème persiste

- Fermez complètement l'application (pas seulement en arrière-plan) et rouvrez-la.
- Ouvrez la même adresse dans un onglet de navigateur : si la version y est plus récente, le
  problème est côté application installée.
- En dernier recours, désinstallez et réinstallez — ⚠️ **exportez d'abord une
  [sauvegarde](../features/sauvegarde.md)**, la désinstallation efface vos données.

## Informations à fournir au support

Version installée et sa date, le message exact du bouton, votre plateforme, et si vous
utilisez l'app installée ou un onglet de navigateur.
