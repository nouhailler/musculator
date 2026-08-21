---
titre: Scanner de code-barres
description: Lecture d'un code-barres alimentaire par la caméra, avec deux moteurs de décodage selon le navigateur.
ordre: 13
---

# Scanner de code-barres

## Description
La caméra arrière lit le code-barres d'un produit et l'aliment est cherché dans Open Food
Facts.

## Objectif
Consigner un produit emballé en un geste plutôt qu'en le cherchant par son nom.

## Prérequis
- **Permission caméra** — demandée à la première ouverture du scanner.
- **Connexion sécurisée (HTTPS)** — la caméra est refusée en `http://` simple.
- **Réseau** — pour interroger Open Food Facts avec le code lu.

Voir [Permissions](../permissions/).

## Comment l'utiliser
1. Nutrition → *Ajouter un aliment* → **Scanner**.
2. Autorisez la caméra.
3. Cadrez le code-barres. La détection est automatique.

## Options
**Le code-barres peut toujours être saisi à la main** — c'est le repli proposé chaque fois que
la caméra n'est pas disponible.

## Paramètres associés
Aucun. L'autorisation caméra se gère dans les réglages du navigateur ou du système.

## Données utilisées
**Aucune image n'est enregistrée ni envoyée.** Le flux vidéo est décodé sur l'appareil et la
caméra est relâchée à la fermeture. Seul **le code lu** part vers Open Food Facts.

## Résultat
Le produit trouvé est ajouté au repas et conservé dans `foodCache`, réutilisable hors ligne.

## Fonctionnement hors connexion
La caméra et le décodage fonctionnent, mais **le produit ne peut pas être identifié** sans
réseau, sauf s'il est déjà dans vos aliments.

## Fonctionnement en ligne
Complet.

## Limites
- **Deux moteurs de décodage.** L'API native `BarcodeDetector` (Chrome/Edge sur Android)
  quand elle existe ; sinon un décodeur téléchargé à la demande (iOS Safari, Firefox), de
  quelques centaines de kilo-octets, **récupéré à la première utilisation seulement**. Il
  n'est pas préchargé : les utilisateurs qui n'ouvrent jamais le scanner ne le téléchargent
  jamais.
- **Le décodeur de secours doit donc être téléchargé une première fois avec du réseau.**
  Ensuite il est mis en cache pour un an.
- Codes 1D alimentaires uniquement (EAN-13, EAN-8, UPC-A, UPC-E, Code 128). Ni QR, ni
  DataMatrix.
- Un code absent d'Open Food Facts ne donne rien : il faut saisir l'aliment à la main.

## Erreurs possibles

| Message | Cause |
|---|---|
| « Accès à la caméra refusé. Autorise-le dans les réglages du navigateur, ou saisis le code à la main. » | Permission refusée |
| « La caméra exige une connexion sécurisée (HTTPS). Saisis le code à la main. » | Contexte non sécurisé |
| « Caméra indisponible. Saisis le code à la main. » | Pas de caméra, ou occupée par une autre app |

## Dépannage
[Le scanner ne s'ouvre pas](../troubleshooting/scanner-ne-souvre-pas.md)

## FAQ
- [Le scanner de code-barres ne s'ouvre pas](../faq/#scanner-marche-pas)
