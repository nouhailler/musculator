---
titre: Journal
description: Les séances du jour, la marche, l'alimentation et l'analyse IA de la journée.
ordre: 8
couvre: journal
---

# Journal

**Objectif** — le récapitulatif de la journée d'entraînement, et son analyse.

**Accès** — onglet *Journal*, ou menu ☰ → *Journal & analyse*.

⚠️ **Le Journal ne montre qu'aujourd'hui.** Pour une séance passée, passez par l'historique
dans [Progrès](progres.md).

## Éléments de l'interface

- **Ajouter des exercices** (en haut) — consigne des exercices faits hors séance guidée.
- **Séances du jour** — une carte par séance, avec durée, séries, calories estimées et
  muscles travaillés.
- **Marche du jour** — distance, durée, calories et nombre de pas estimé, avec *Ajouter une
  marche*.
- **Alimentation du jour** — reprend ce qui a été consigné côté Nutrition.
- **Note du jour** — texte libre, un par jour.
- **Analyse IA** (en bas) — analyse de la journée.

## Actions et résultats

| Action | Résultat |
|---|---|
| *Ajouter des exercices* | Ouvre le sélecteur ; toujours consigné **pour aujourd'hui** |
| *Ajouter une séance* | Formulaire complet, avec date et heure réglables — une séance d'hier se consigne aujourd'hui |
| ✏️ sur une séance | Corrige la date, l'heure, la durée, et le nom d'une séance libre |
| 🗑️ sur une séance | Demande confirmation, puis supprime définitivement |
| *Ajouter une marche* | Ouvre [Marche](marche.md) |
| *Lancer l'analyse* | Calcule l'analyse du jour |

## Cas particuliers

- **Séances partielles** — marquées en orange ; seul le travail réellement fait est compté.
- **Ce qui n'est pas modifiable** — exercices, séries et muscles d'une séance sont la trace de
  ce qui a été fait ; ils ne se corrigent pas. Seuls *quand*, *combien de temps* et le nom
  d'une séance libre sont modifiables. Les calories suivent la durée.
- **Séance libre sans exercices** — la carte masque l'étiquette « séries » plutôt que
  d'afficher un zéro fabriqué.
- **Analyse mise en cache** — le résultat est gardé pour la journée et n'est pas recalculé à
  chaque visite. Ajouter, modifier ou supprimer une séance du jour l'invalide.
- **Bilan calorique** — l'alimentation du jour n'est pas un bilan complet : la dépense de
  repos n'y entre pas.

## Erreurs possibles

| Situation | Message |
|---|---|
| Analyse lancée sans séance ce jour | « Aucune séance à analyser aujourd'hui. Lance une séance depuis l'accueil. » |
| Modèle OpenRouter injoignable | Message de l'erreur + « Analyse locale utilisée à la place. » |

Liste complète : [Codes et erreurs](../reference/errors.md).

## Où aller ensuite

[Analyse IA](../features/analyse-ia.md) · [Progrès](progres.md) · [Marche](marche.md)
