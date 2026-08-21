---
titre: J'ai perdu ma séance en cours
description: L'application s'est fermée ou rechargée pendant une séance.
ordre: 4
---

# J'ai perdu ma séance en cours

## Symptôme

L'application a été fermée, rechargée ou basculée en arrière-plan pendant une séance, et à sa
réouverture la séance n'est plus là.

## Causes possibles

⚠️ **L'état d'une séance en cours n'est pas enregistré : il ne vit qu'en mémoire.** C'est un
choix, pas un bug — mais il a des conséquences :

- L'application a été **fermée** pendant la séance.
- La page a été **rechargée**.
- Le système a **libéré la mémoire** d'une application en arrière-plan (fréquent sur iOS
  quand on quitte longtemps).

## Diagnostic

Vérifiez le [Journal](../guide/journal.md) : si vous aviez appuyé sur *Enregistrer et
quitter* avant, la séance y est, marquée **partielle**.

## Solution

**Une séance perdue de cette façon n'est pas récupérable.** Consignez-la après coup :

- [Journal](../guide/journal.md) → **Ajouter des exercices** — pour reprendre exercice par
  exercice ce que vous avez fait aujourd'hui, avec séries, répétitions et charge.
- Ou **Ajouter une séance** — pour consigner un programme entier ou une séance libre, avec la
  date, l'heure et la durée.

## Si le problème persiste

**Pour l'éviter** :

- Ne quittez pas l'application pendant une séance ; l'écran de séance masque volontairement
  la barre du haut pour cette raison.
- La croix propose **Enregistrer et quitter** : les séries déjà faites partent au journal.
- Une [mise à jour](../features/mise-a-jour.md) ne peut pas s'appliquer pendant une séance,
  précisément pour ne pas la faire disparaître.
- L'application ne maintient pas l'écran allumé : réglez la mise en veille de votre téléphone
  si elle est très courte.

## Informations à fournir au support

Plateforme, ce qui a interrompu la séance (appel, notification, mise en veille, changement
d'application), et sa durée approximative.
