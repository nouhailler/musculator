---
titre: Journal alimentaire & score
description: Quatre repas par jour, objectifs caloriques et macros calculés, et le Score Musculation Quotidien /100.
ordre: 11
---

# Journal alimentaire & score

## Description
Un journal alimentaire en quatre repas (Petit-déjeuner, Déjeuner, Collation, Dîner), des
objectifs quotidiens calculés depuis le profil, et une note quotidienne sur 100.

## Objectif
Relier ce que vous mangez à ce que vous entraînez, sans en faire un compteur de calories de
plus.

## Prérequis
Aucun, mais **poids, taille et âge** sont nécessaires pour que les objectifs soient calculés
plutôt que forfaitaires.

## Comment l'utiliser
1. Onglet *Nutrition*.
2. *Ajouter un aliment* sur un repas → [recherche](recherche-aliments.md).
3. Réglez la quantité ; tout se recalcule.

## Options
- Changer de jour, et revenir sur un jour passé.
- Dupliquer un repas depuis un autre jour.
- [Dicter ses repas](repas-dicte.md) plutôt que les saisir.
- [Importer un historique Nutritor](import-nutritor.md).

## Paramètres associés
[Objectif nutrition](../settings/#objectif-nutrition), et les quatre
[objectifs quotidiens](../settings/#objectifs-quotidiens) (calories, protéines, glucides,
lipides), chacun calculé ou imposé à la main.

## Données utilisées
**Lecture** : poids, taille, âge, sexe, fréquence, objectif nutrition.
**Écriture** : `nutriLog` (indexé par jour puis par repas) et `foodCache` (tout aliment déjà
utilisé, conservé pour l'usage hors ligne).

## Résultat

### Les objectifs

Métabolisme de base × un multiplicateur d'activité tiré de la **fréquence d'entraînement
déclarée**, puis l'écart calorique de l'objectif nutrition choisi :

| Objectif | Écart calorique | Protéines |
|---|---|---|
| Prise de masse | +12 % | 1,8 g/kg |
| Recomposition | −5 % | 2,0 g/kg |
| Maintien | 0 % | 1,6 g/kg |
| Sèche | −18 % | 2,0 g/kg |

Les glucides et lipides se partagent le reste (55 % / 45 %). Sans poids, taille ni âge, la
cible retombe sur **2 200 kcal**.

### Le score

**Score Musculation Quotidien /100** :

| Composante | Poids | Règle |
|---|---|---|
| Protéines | 40 pts | Par rapport à la cible protéique |
| Calories | 40 pts | Note pleine dans une bande de ±10 % autour de la cible, puis décroissance |
| Micronutriments | 20 pts | Fer, calcium, potassium, magnésium, fibres, vitamine D |

## Fonctionnement hors connexion
Le journal, les objectifs et le score fonctionnent entièrement hors ligne. La table générique
CIQUAL (3 167 aliments) est embarquée, et tout aliment déjà utilisé reste disponible.
Seule la recherche de produits de marque demande le réseau.

## Fonctionnement en ligne
La recherche interroge Open Food Facts en plus des sources locales.

## Limites
- **Un micronutriment absent est *inconnu*, jamais zéro.** Quand moins de la moitié des six
  micronutriments sont connus, la composante sort du calcul et la journée est notée **sur
  80** — le défaut vient des lacunes d'Open Food Facts, pas de vous.
- Les produits de marque déclarent rarement des micronutriments ; les aliments génériques
  presque toujours.
- **Des cibles saisies à la main peuvent ne pas s'additionner à la cible calorique.** Le
  profil affiche l'écart en pourcentage, car les deux jauges ne pourront pas être pleines
  ensemble.
- Les valeurs de référence des micronutriments sont les VNR adultes de l'UE (règlement
  1169/2011), sauf les fibres (30 g/jour) : elles ne sont pas personnalisées.
- **Ce n'est pas un bilan énergétique.** Ni la dépense de repos ni la marche n'entrent dans
  la cible.

## Erreurs possibles
Voir [Recherche d'aliments](recherche-aliments.md) et [Scanner](scanner.md).

## Dépannage
[Mon aliment est introuvable](../troubleshooting/aliment-introuvable.md)

## FAQ
- [Pourquoi mon score est-il noté sur 80 et non sur 100 ?](../faq/#score-sur-80)
- [D'où viennent mes objectifs de calories et de macros ?](../faq/#objectifs-calories)
