---
titre: Analyse IA du jour
description: L'analyse de la journée d'entraînement, calculée sur l'appareil ou rédigée par un modèle OpenRouter.
ordre: 16
---

# Analyse IA du jour

## Description
Un commentaire structuré de la journée : résumé, énergie, tonus, progression, ce qu'il reste
à faire, ce qu'il faut améliorer.

## Objectif
Donner un retour sur la journée sans qu'il faille interpréter soi-même des chiffres.

## Prérequis
- Au moins **une séance enregistrée aujourd'hui**.
- Rien d'autre : le moteur local est le comportement par défaut.
- Pour le moteur distant : une **clé OpenRouter** *et* un **modèle** choisis dans le profil.

## Comment l'utiliser
Journal → *Analyse IA* → lancer l'analyse.

## Options
**Deux moteurs derrière une seule et même forme de résultat :**

| Moteur | Quand | Réseau |
|---|---|---|
| **Local** | Par défaut, et dès qu'il manque la clé ou le modèle | Aucun |
| **OpenRouter** | Quand clé **et** modèle sont configurés | Requis |

## Paramètres associés
[Clé API OpenRouter](../settings/#cle-openrouter) ·
[Modèle](../settings/#modele-openrouter)

## Données utilisées

**Moteur local** — rien ne sort de l'appareil.

**Moteur OpenRouter** — c'est **le seul endroit où des données de santé quittent
l'appareil**. Sont envoyés à `openrouter.ai` : **prénom, poids, taille, âge, blessures et
contraintes déclarées**, l'objectif, ainsi que les séances du jour et le nombre de séances de
la semaine.

Sans clé configurée, rien de tout cela ne part. Voir
[Données et confidentialité](../data/).

## Résultat
Le résultat est **mis en cache pour la journée** (`analysisLog`) et survit à un rechargement :
revoir le Journal ne relance pas d'appel — donc pas de nouvel appel facturé.

Il est **invalidé** dès qu'une séance de ce jour est ajoutée, modifiée ou supprimée.

## Fonctionnement hors connexion
Le moteur local fonctionne normalement. Le moteur OpenRouter échoue et **retombe
automatiquement sur le moteur local**, en disant pourquoi.

## Fonctionnement en ligne
Les deux moteurs sont disponibles selon la configuration.

## Limites
- ⚠️ **L'analyse ne remplace pas l'avis d'un professionnel de santé.**
- **La clé OpenRouter est stockée en clair dans le stockage local** et envoyée depuis le
  navigateur : l'application n'a pas de serveur pour la garder. N'utilisez pas une clé
  partagée, et fixez-lui une limite de dépense.
- **Aucune sortie de modèle n'atteint l'écran sans validation** : le JSON est extrait et
  chaque champ contraint, car les modèles honorent inégalement la consigne « JSON seulement ».
- **La liste des modèles gratuits est chargée en direct**, jamais figée dans le code : l'offre
  gratuite d'OpenRouter change constamment. Sont retenus ceux dont le prix est nul **et** qui
  produisent du texte — plusieurs modèles à prix nul sont audio ou musicaux et ne savent pas
  répondre.
- Les modèles gratuits sont soumis à des quotas.
- **Aucune erreur ne laisse l'utilisateur sans analyse** : le repli local est systématique.

## Erreurs possibles

| Message | Cause |
|---|---|
| « Aucune séance à analyser aujourd'hui. Lance une séance depuis l'accueil. » | Aucune séance ce jour |
| « Clé OpenRouter refusée. » | HTTP 401 |
| « Quota du modèle gratuit atteint, réessaie plus tard. » | HTTP 429 |
| « OpenRouter a répondu HTTP *n*. » | Autre erreur du service |
| « Le modèle n'a pas renvoyé de JSON. » | Réponse hors format |
| « Réponse vide du modèle. » | Réponse sans contenu |

Toutes sont suivies de « Analyse locale utilisée à la place. »

## Dépannage
[L'analyse IA échoue](../troubleshooting/analyse-echoue.md)

## FAQ
- [Où sont mes données ?](../faq/#compte-obligatoire)
