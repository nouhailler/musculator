---
titre: Ajouter un aliment
description: Les trois façons de trouver un aliment — scanner, rechercher, saisir — et le réglage de la quantité.
ordre: 13
couvre: foodSearch, foodEntry
---

# Ajouter un aliment

**Objectif** — trouver un aliment et le consigner dans un repas.

**Accès** — *Ajouter un aliment* sur un repas, depuis [Nutrition](nutrition.md).

## Éléments de l'interface

- **Scanner** — ouvre la caméra pour lire un code-barres.
- **Recherche** par nom.
- **Saisie manuelle** — pour un plat maison ou un aliment sans code-barres ; les valeurs se
  saisissent **pour 100 g**.
- **Mes aliments** — tout ce que vous avez déjà utilisé, listé par ordre alphabétique en bas
  d'écran. Une lettre qui porte plusieurs aliments se replie en accordéon.

## Ordre des résultats

1. **Vos aliments** (déjà utilisés) — ils remontent avant tout le reste.
2. **Open Food Facts** — produits de marque, quand le réseau est là.
3. **Table générique CIQUAL** — 3 167 aliments, embarquée et disponible hors ligne.

## Réglage de la quantité

Après le choix de l'aliment, un écran ajuste la quantité ; les valeurs affichées se
recalculent en direct. Quand Open Food Facts fournit une portion, elle apparaît comme premier
raccourci.

## Cas particuliers

- **Micronutriments** — les aliments génériques en portent presque toujours, les produits de
  marque rarement. C'est ce qui fait varier la part « micros » du score.
- **Un aliment sans micronutriment ne pénalise pas le score**, il n'y contribue simplement
  pas.
- **Scanner** — nécessite la caméra et une connexion sécurisée (HTTPS). Sur les navigateurs
  sans lecteur intégré (iOS Safari, Firefox), un décodeur est téléchargé à la première
  utilisation. Voir [Permissions](../permissions/).
- **Produits scannés** — conservés sur l'appareil, réutilisables hors ligne.
- **Le code-barres peut être saisi à la main** si la caméra n'est pas disponible.

## Erreurs possibles

| Situation | Message |
|---|---|
| Aliment saisi sans valeurs | « Renseigne au moins les calories ou les protéines. » |
| Caméra refusée | « Accès à la caméra refusé. Autorise-le dans les réglages du navigateur, ou saisis le code à la main. » |
| Pas de HTTPS | « La caméra exige une connexion sécurisée (HTTPS). Saisis le code à la main. » |
| Caméra absente / occupée | « Caméra indisponible. Saisis le code à la main. » |
| Open Food Facts trop lent | « Open Food Facts ne répond pas (délai dépassé). » |
| Réseau absent | « Impossible de joindre Open Food Facts. Vérifie ta connexion. » |

## Où aller ensuite

[Nutrition](nutrition.md) · [Scanner (fonctionnalité)](../features/scanner.md) ·
[Dépannage : le scanner ne s'ouvre pas](../troubleshooting/scanner-ne-souvre-pas.md)
