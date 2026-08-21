---
titre: Référence
description: Paramètres, erreurs, glossaire, compatibilité, limites et chiffres du catalogue.
ordre: 10
---

# Référence

| Page | Contenu |
|---|---|
| [Paramètres](settings.md) | Tableau de tous les réglages : type, défaut, valeurs |
| [Codes et erreurs](errors.md) | Tous les messages d'erreur, leur cause et leur solution |
| [Glossaire](glossary.md) | Le vocabulaire de l'app expliqué |
| [Compatibilité](compatibility.md) | Plateformes, navigateurs, restrictions |
| [Limites connues](limitations.md) | Ce que l'app ne fait pas, et pourquoi |

## Chiffres du catalogue

Ces nombres sont vérifiés contre le code par `npm run docs:audit` : ils ne peuvent pas
vieillir en silence.

| Élément | Nombre |
|---|---|
| Exercices | 152 |
| Programmes du catalogue | 12 |
| Groupes musculaires | 21 |
| Aliments de la table générique (CIQUAL) | 3167 |
| Questions fréquentes | 33 |
| Tutoriels interactifs | 4 |
| Badges | 10 |
| Repas par jour | 4 |
| Micronutriments suivis | 6 |
| Tranches de données persistées | 14 |

## Formats de données

| Format | Où | Sens |
|---|---|---|
| **Sauvegarde Musculator** | Export / restauration | JSON, toutes les tranches sauf la clé OpenRouter |
| **JSON de programme dicté** | Import de programme | `{ "seances": [ { "exercices": [...] } ] }` |
| **JSON de repas dicté** | Import de repas | Poids de la portion **+ valeurs pour 100 g**, jamais les totaux |
| **CSV Nutritor** | Import Nutritor | Export de **journal**, colonnes date et aliment obligatoires |
| **GPX** | Import de marche | Trace standard, au moins 2 points |
| **CSV d'activités** | Import de marche | Export Strava, Apple Santé, Google Fit — colonnes date et distance |

## Vocabulaire des données

| Champ | Valeurs |
|---|---|
| Niveau d'exercice | Débutant · Intermédiaire · Avancé |
| Matériel | Sans matériel · Haltères · Élastique · Salle · Maison |
| Objectif d'entraînement | Prise de masse · Recomposition corporelle · Force · Tonus · Endurance |
| Objectif nutrition | Prise de masse · Recomposition · Maintien · Sèche |
| Repas | Petit-déjeuner · Déjeuner · Collation · Dîner |
| Type de marche | Flânerie · Normale · Rapide · Course à pied |
| Thème | Sombre · Clair · Système |
| Zones prioritaires | Pectoraux · Dos · Jambes · Épaules · Bras · Abdos |

## Constantes de calcul

| Constante | Valeur | Où |
|---|---|---|
| Calories d'une séance | 9 kcal / minute | Journal, Progrès |
| Calories de marche | 0,5 kcal / kg / km (net) | Marche |
| Calories de course | 0,9 kcal / kg / km (net) | Marche |
| Repli calorique sans profil | 2 200 kcal | Nutrition |
| Repli de poids | 70 kg | Nutrition, Marche |
| Repli de taille | 170 cm | Marche |
| Tolérance calorique du score | ±10 % | Score |
| Poids du score | protéines 40 · calories 40 · micros 20 | Score |
| Partage glucides / lipides | 55 % / 45 % du reste | Objectifs |
| Objectif de marche suggéré | affiché en placeholder | Accueil |

Références des micronutriments : VNR adultes de l'UE (règlement 1169/2011), sauf les fibres
(30 g/jour).
