---
titre: Journal
description: Les séances du jour, l'ajout après coup, la correction et la suppression d'une séance.
ordre: 7
---

# Journal

## Description
Le récapitulatif de la journée : séances, marche, alimentation, note libre et analyse.

## Objectif
Consigner ce qui a été fait, y compris ce qui a été fait sans l'application.

## Prérequis
Aucun.

## Comment l'utiliser
1. Onglet *Journal*.
2. Les séances du jour s'affichent seules.
3. Pour une séance faite ailleurs : *Ajouter une séance* (avec date et heure réglables) ou
   *Ajouter des exercices* (toujours pour aujourd'hui).

## Options
- **Ajouter une séance** — un programme du catalogue, ou une séance libre nommée à la main.
- **Ajouter des exercices** — choix dans tout le catalogue, avec séries, répétitions et une
  charge optionnelle en texte libre.
- **✏️ Modifier** — date, heure, durée ; le nom d'une séance libre.
- **🗑️ Supprimer** — après confirmation.
- **Note du jour** — texte libre, une par jour.

## Paramètres associés
Aucun.

## Données utilisées
**Écriture** : `sessionLog` (séances), `dayNotes` (notes). Une séance ajoutée après coup
porte un indicateur *manuelle*.

## Résultat
La séance rejoint l'historique, la série de jours, les badges et la cartographie musculaire.

## Fonctionnement hors connexion
Identique.

## Fonctionnement en ligne
Identique, sauf l'[analyse IA distante](analyse-ia.md) si elle est configurée.

## Limites

- **Le Journal ne montre qu'aujourd'hui.** Les jours précédents s'atteignent depuis
  l'historique des [Progrès](progres.md).
- **Ce qui a été fait n'est pas modifiable** : exercices, séries et muscles sont la trace de
  la séance réelle. Les rendre modifiables transformerait le journal en liste de souhaits, et
  tout ce qui en dépend (cartographie, badges, analyse) les lit comme des faits. Seuls
  *quand*, *combien de temps* et le nom d'une séance libre se corrigent. Les calories suivent
  la durée.
- **Une séance ajoutée après coup depuis un programme est supposée faite comme prescrit** :
  il n'existe aucun suivi série par série en dehors d'une séance en direct.
- **Une séance libre ne porte aucun exercice** et affiche `0` série — la carte masque alors
  l'étiquette plutôt que d'afficher un zéro fabriqué.
- **Ajouter des exercices** ne permet pas de choisir la date.
- L'alimentation affichée n'est pas un bilan calorique : la dépense de repos n'y entre pas.

## Erreurs possibles

| Situation | Message |
|---|---|
| Analyse lancée sans séance ce jour | « Aucune séance à analyser aujourd'hui. Lance une séance depuis l'accueil. » |

## Dépannage
[Ma séance n'apparaît pas](../troubleshooting/seance-absente.md)

## FAQ
- [Je me suis entraîné sans l'app, puis-je l'ajouter après coup ?](../faq/#seance-hors-app)
- [Pourquoi ne puis-je pas corriger les exercices d'une séance passée ?](../faq/#modifier-seance)
