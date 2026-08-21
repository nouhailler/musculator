---
titre: Mise à jour
description: Comment une nouvelle version arrive sur une app installée, comment la forcer, et pourquoi elle est refusée pendant une séance.
ordre: 21
---

# Mise à jour

## Description
L'application se met à jour elle-même, mais **jamais sans le dire** : une nouvelle version
s'installe en arrière-plan et attend un geste pour s'appliquer.

## Objectif
Une app installée est **rouverte**, pas rechargée : sans bouton explicite, une nouvelle
version pourrait attendre des jours, et l'utilisateur n'aurait aucun moyen de savoir sur
laquelle il se trouve.

## Prérequis
Du réseau au moment de la recherche.

## Comment l'utiliser
1. Menu ☰ → *Profil* → **Version & mise à jour**.
2. La ligne « Version installée » indique le build en cours et sa date.
3. **Vérifier les mises à jour** cherche et applique.

Une bannière propose aussi la mise à jour quand une version est déjà prête.

## Options
**Forcer le rechargement complet** — dernier recours : vide le cache de l'application et
retélécharge tout depuis le serveur.

⚠️ Il **ne touche pas** à vos données. En revanche, effacer les *données de site* depuis les
réglages du téléphone effacerait votre journal — ne le faites pas.

## Paramètres associés
Aucun réglage : ce sont des actions.

## Données utilisées
Aucune donnée personnelle. La vérification interroge le serveur qui héberge l'application.

## Résultat

Quatre réponses possibles, distinctes :

| Réponse | Message |
|---|---|
| Nouvelle version trouvée | « Nouvelle version installée, redémarrage… » puis rechargement |
| Déjà à jour | « Tu es déjà sur la dernière version. » |
| **Recherche non aboutie** | « La recherche n'a pas abouti — réseau lent ou indisponible. Réessaie dans un moment, ou force le rechargement complet ci-dessous. » |
| Pas de service worker | « Mise à jour automatique indisponible ici (pas de service worker) — recharge la page. » |

**Le délai dépassé n'est pas « vous êtes à jour ».** La recherche peut rester en attente
pendant que le nouveau worker s'installe (~1,7 Mo) ; sur un réseau lent ou sur iOS Safari,
indéfiniment. Annoncer « dernière version » à quelqu'un dont le téléchargement est encore en
cours est la seule réponse fausse qui vaille la peine d'être évitée.

## Fonctionnement hors connexion
La recherche ne peut pas aboutir et le dit. L'application continue de fonctionner sur sa
version installée.

## Fonctionnement en ligne
L'application revérifie **au retour au premier plan** — ce qu'un téléphone fait, au lieu de
naviguer.

## Limites
- ⚠️ **Une mise à jour est refusée pendant une séance** : l'appliquer recharge la page, et la
  séance en cours ne vit qu'en mémoire. La bannière se cache elle-même pendant une séance.
- L'application ne se met pas à jour toute seule sans rechargement.
- Le numéro de version est un **identifiant de build**, pas un numéro sémantique — le projet
  n'a pas encore de versions publiées.

## Erreurs possibles

| Message | Cause |
|---|---|
| « Séance en cours — termine-la avant de mettre à jour. » | Séance active |
| « La recherche n'a pas abouti… » | Réseau lent, indisponible, ou vérification restée en attente |
| « Mise à jour automatique indisponible ici (pas de service worker) — recharge la page. » | Contexte sans service worker |

## Dépannage
[L'app ne se met pas à jour](../troubleshooting/mise-a-jour-bloquee.md)

## FAQ
- [L'app ne se met pas à jour](../faq/#mise-a-jour)
