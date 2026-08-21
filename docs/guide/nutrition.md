---
titre: Nutrition
description: Le journal alimentaire du jour, les objectifs quotidiens et le Score Musculation Quotidien /100.
ordre: 7
couvre: nutrition
---

# Nutrition

**Objectif** — consigner ce que vous mangez et relier votre alimentation à votre
entraînement.

**Accès** — onglet *Nutrition*, ou menu ☰ → *Nutrition*.

## Éléments de l'interface

- **Sélecteur de jour** — l'écran affiche un jour à la fois ; on peut revenir en arrière.
- **Quatre repas** — Petit-déjeuner, Déjeuner, Collation, Dîner.
- **Consommé vs objectif** — calories et les trois macros (protéines, glucides, lipides).
- **Score Musculation Quotidien /100** — protéines 40 pts, calories 40 pts,
  micronutriments 20 pts.
- **Ajouter un aliment** (par repas) — ouvre [Ajouter un aliment](aliments.md).
- **Importer un repas dicté** — ouvre [l'import](imports.md).

## Actions et résultats

| Action | Résultat |
|---|---|
| *Ajouter un aliment* | Ouvre la recherche, puis la saisie de quantité |
| Toucher un aliment consigné | Rouvre la quantité ; tout se recalcule |
| Supprimer un aliment | Le retire du repas |
| Dupliquer un repas | Recopie un repas d'un autre jour |
| Changer de jour | Recharge le journal de ce jour |

## Cas particuliers

- **Score sur 80 et non sur 100** — quand trop peu de micronutriments sont connus, la part
  « micros » sort du calcul plutôt que d'être comptée à zéro. Un micronutriment absent est
  *inconnu*, jamais zéro.
- **Objectifs non calculés** — sans poids, taille et âge dans le profil, la cible calorique
  retombe sur 2 200 kcal.
- **Cibles perso** — un objectif saisi à la main dans le profil remplace le calcul et
  l'écran l'indique.
- **Macros incohérentes avec les calories** — si vos cibles saisies à la main ne s'additionnent
  pas à votre cible calorique, les deux jauges ne peuvent pas être pleines ensemble ; le
  profil affiche un avertissement chiffré.
- **La marche n'entre pas dans la cible calorique** — elle est affichée à côté. La cible
  contient déjà votre activité quotidienne via le multiplicateur de fréquence.

## Erreurs possibles

Voir [Codes et erreurs](../reference/errors.md) — section *Aliments et réseau*.

## Où aller ensuite

[Ajouter un aliment](aliments.md) · [Nutrition (fonctionnalité)](../features/nutrition.md) ·
[Score /100](../features/nutrition.md#le-score)
