---
titre: Recherche d'aliments
description: Trois sources normalisées en une — vos aliments, Open Food Facts et la table CIQUAL.
ordre: 12
---

# Recherche d'aliments

## Description
Un champ de recherche qui interroge trois sources et les présente sous une forme unique.

## Objectif
Trouver un aliment vite, et le retrouver hors ligne la fois suivante.

## Prérequis
Aucun. Le réseau n'est nécessaire que pour les produits de marque.

## Comment l'utiliser
1. Nutrition → *Ajouter un aliment*.
2. Cherchez par nom, ou [scannez un code-barres](scanner.md), ou saisissez à la main.
3. Réglez la quantité.

## Options
- **Saisie manuelle** — pour un plat maison ; les valeurs se saisissent **pour 100 g**.
- **Mes aliments** — tout ce que vous avez déjà utilisé, listé alphabétiquement en bas
  d'écran, replié en accordéon par lettre.

## Paramètres associés
Aucun.

## Données utilisées
**Écriture** : `foodCache` — tout aliment utilisé y est conservé, et devient visible dans
« Mes aliments ».
**Sortant** : la recherche de produits de marque envoie **votre terme de recherche ou le
code-barres** à Open Food Facts (`world.openfoodfacts.org`). Rien d'autre : ni identité, ni
profil, ni journal.

## Résultat

Ordre des sources :

1. **Vos aliments** — un produit que vous avez déjà scanné porte les vraies valeurs de sa
   marque, et c'est un aliment que vous mangez.
2. **Open Food Facts** — produits de marque, si le réseau répond.
3. **CIQUAL** — 3 167 aliments génériques, embarqués.

## Fonctionnement hors connexion
« Mes aliments » et la table CIQUAL répondent normalement. Open Food Facts est simplement
absent des résultats.

## Fonctionnement en ligne
Les trois sources répondent. Open Food Facts est appelé avec un délai de 12 s et jusqu'à
3 tentatives, avec attente croissante — un 503 sous charge vaut un nouvel essai plutôt
qu'une erreur.

## Limites
- La table CIQUAL est chargée à la première ouverture de la recherche (≈ 530 Ko), pas au
  démarrage de l'application. Elle est ensuite mise en cache par le service worker.
- **CIQUAL ne distingue pas toujours cru et cuit**, et n'a pas d'entrée pour tous les plats.
- Certaines lignes CIQUAL déclarent 0 kcal avec des macros renseignées ; l'énergie est alors
  recalculée par les facteurs d'Atwater plutôt que d'afficher une lentille à 0 kcal.
- Open Food Facts est contributif : les valeurs peuvent être incomplètes ou fausses.
- L'application ne peut pas envoyer d'en-tête `User-Agent` (un navigateur l'interdit) ; elle
  s'identifie auprès d'Open Food Facts par des paramètres d'URL.

## Erreurs possibles

| Message | Cause |
|---|---|
| « Open Food Facts ne répond pas (délai dépassé). » | 12 s dépassées sur les 3 tentatives |
| « Impossible de joindre Open Food Facts. Vérifie ta connexion. » | Réseau absent ou bloqué |
| « Open Food Facts a répondu HTTP *n*. » | Réponse d'erreur du service |

## Dépannage
[Mon aliment est introuvable](../troubleshooting/aliment-introuvable.md)

## FAQ
- [Mon aliment est introuvable](../faq/#aliment-introuvable)
- [Comment corriger une quantité déjà enregistrée ?](../faq/#corriger-quantite)
