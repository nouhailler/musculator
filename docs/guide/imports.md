---
titre: Imports dictés
description: Faire composer un programme ou consigner un repas en le dictant à Claude ou ChatGPT, puis coller le JSON.
ordre: 15
couvre: importMeals, importProgram, addExercises
---

# Imports dictés

Deux écrans partagent le même principe : un **prompt** que vous donnez à un assistant
(Claude, ChatGPT), et un **JSON** que vous collez ici. Le prompt et le lecteur sont les deux
moitiés d'un même format.

⚠️ **Aucun de ces deux écrans n'envoie quoi que ce soit.** Vous copiez un texte, vous allez
le coller ailleurs, vous revenez avec la réponse. L'application ne parle à aucun assistant.

## Importer un programme dicté

**Accès** — onglet [Programmes](programmes.md) → *Importer un programme dicté*.

- Le prompt **contient les 152 exercices de l'application**. L'assistant choisit dedans au
  lieu d'inventer : un exercice inventé n'aurait ni démo animée, ni coach vocal, ni place
  dans la cartographie musculaire.
- **Substitutions** — un mouvement absent du catalogue est remplacé par le plus proche
  travaillant le même muscle, et l'aperçu le dit : « presse à cuisses → remplacé par
  Squats ».
- **Réglages conservés** — séries, répétitions, charge et repos dictés sont repris tels quels.
- **Plusieurs séances** — un programme hebdomadaire arrive d'un coup ; toutes rejoignent vos
  séances perso.
- **Prompt trop long pour un Projet ?** Le champ d'instructions d'un Projet ChatGPT ou Claude
  a une limite de taille que le prompt peut dépasser. Collez-le en premier message d'une
  conversation normale à la place.

## Importer un repas dicté

**Accès** — onglet [Nutrition](nutrition.md) → *Importer un repas dicté*.

- **Valeurs pour 100 g** — l'assistant fournit le poids de la portion *et* les valeurs pour
  100 g. La quantité reste modifiable ensuite, tout se recalcule.
- **Prévisualisation** — rien n'est enregistré avant que vous ayez vu le détail.
  *Remplacer* ne vide que les repas présents dans l'import.
- **Valeurs manquantes** — un aliment nommé sans valeurs est cherché d'abord dans **vos
  propres aliments** (un produit scanné porte les vraies valeurs de sa marque), puis dans la
  table CIQUAL. L'aperçu affiche la source retenue sous chaque aliment : vérifiez-la,
  « chocolat noir » peut tomber sur un chocolat fourré.
- **Avertissements** — ils listent ce qui a été deviné : quantité non exprimée en grammes
  (« 3 figues » devient 100 g), repas non reconnu, valeurs placées hors du bloc `pour100g`.
- **Un aliment introuvable est ignoré et nommé** dans un avertissement, jamais importé vide.

⚠️ **Les valeurs viennent d'un modèle de langage, pas d'une table officielle** : elles sont
approximatives et à vérifier si un aliment compte vraiment.

## Ajouter des exercices (Journal)

**Accès** — [Journal](journal.md) → *Ajouter des exercices*. Ce n'est pas un import dicté,
mais il répond au même besoin : consigner ce qui a été fait hors séance guidée.

- Le sélecteur propose **tout** le catalogue, y compris les exercices avancés.
- Séries et répétitions sont pré-remplies avec les valeurs par défaut ; corrigez-les.
- La charge est optionnelle et se saisit en texte libre (kg, élastique…). Laissée vide,
  l'exercice est consigné au poids du corps.
- **Toujours pour aujourd'hui** : pour une autre date, passez par *Ajouter une séance*.

## Erreurs possibles

| Situation | Message |
|---|---|
| Champ vide | « Colle d'abord le JSON généré. » |
| Aucun bloc JSON détecté | « Aucun JSON trouvé — vérifie le copier-coller. » |
| JSON tronqué | « JSON invalide — vérifie que le bloc a été copié en entier. » |
| Format étranger | « Ce JSON n'est pas au format Musculator. » |
| Aucune séance exploitable | « Aucune séance trouvée. Attendu : { "seances": [ { "exercices": [...] } ] }. » |

## Où aller ensuite

[Programme dicté](../features/programme-dicte.md) · [Repas dicté](../features/repas-dicte.md)
