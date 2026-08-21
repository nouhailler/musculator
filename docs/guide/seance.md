---
titre: Séance guidée
description: Le déroulé d'une séance — effort, repos, coach vocal, chronomètre, pause et arrêt en cours de route.
ordre: 6
couvre: workout, complete
---

# Séance guidée

**Objectif** — enchaîner effort et repos, compter les séries et annoncer le rythme, pour que
vous n'ayez qu'à exécuter.

**Accès** — *Démarrer* depuis le [détail d'un programme](detail-programme.md), *Commencer une
séance* depuis l'[Accueil](accueil.md), ou *Faire cet exercice maintenant* depuis une
[fiche exercice](detail-exercice.md).

⚠️ **La barre du haut disparaît pendant une séance** : cet écran occupe tout l'espace et une
touche involontaire coûterait une série. L'aide reste accessible depuis la feuille de pause.

## Éléments de l'interface

- **Phase en cours** — *exercice* ou *repos*, avec le décompte.
- **Exercice courant** — nom, démo animée, série en cours sur le total.
- **Répétitions et charge** — modifiables à la volée.
- **Série terminée** — valide la série et enchaîne sur le repos.
- **Repos** — *+15 s* rallonge, *Passer* repart tout de suite.
- **Chronomètre** — indépendant du déroulé, avec remise à zéro.
- **Mode plein écran** — grands boutons, pour un téléphone posé à un mètre ; n'affiche que
  l'essentiel de la phase en cours.
- **Haut-parleur** — coupe le coach vocal sans arrêter la séance.
- **Pause** — gèle le chrono, le coach et la démo, et donne accès à l'aide.
- **Croix** — propose d'enregistrer et quitter.

## Actions et résultats

| Action | Résultat |
|---|---|
| *Série terminée* | Compte la série et lance le repos. **C'est la seule chose qui compte ce qui sera enregistré.** |
| *+15 s* / *Passer* | Rallonge ou abrège le repos |
| Modifier répétitions / charge | Vaut pour cette séance ; le programme d'origine n'est pas modifié |
| *Pause* | Tout s'arrête, y compris les compteurs |
| Croix → *Enregistrer et quitter* | Les séries déjà faites sont écrites au journal, marquées **partielle** |
| Dernière série du dernier exercice | Termine la séance et ouvre le récapitulatif |

## Cas particuliers

- **Exercice seul** — lancé depuis une fiche, il n'a pas d'objectif de séries : chaque série
  validée enchaîne sur un repos, et seul *Terminer* met fin à la séance.
- **Séance partielle** — une séance arrêtée en route n'enregistre que le travail réellement
  fait, et n'attribue que les muscles des exercices atteints.
- **Mise à jour refusée** — une mise à jour recharge l'application et la séance ne vit qu'en
  mémoire : elle est refusée jusqu'à la fin de la séance.
- **Plein écran indisponible** — si le navigateur refuse le plein écran, le mode reste
  utilisable comme simple mise en page.
- **Écran qui s'éteint** — l'application ne maintient pas l'écran allumé pendant une séance.

## Erreurs possibles

| Situation | Message |
|---|---|
| Mise à jour tentée pendant la séance | « Séance en cours — termine-la avant de mettre à jour. » |

Le coach vocal muet n'est pas une erreur signalée : voir
[Le coach vocal ne parle pas](../troubleshooting/coach-vocal-muet.md).

## Où aller ensuite

[Journal](journal.md) · [Progrès](progres.md) · [Coach vocal](../features/coach-vocal.md)
