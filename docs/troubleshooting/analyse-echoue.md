---
titre: L'analyse IA échoue
description: « Analyse locale utilisée à la place », ou aucune analyse possible.
ordre: 10
---

# L'analyse IA échoue

## Symptôme

Un message d'erreur suivi de « Analyse locale utilisée à la place. », ou l'analyse refuse de
se lancer.

## Causes possibles

- **Aucune séance enregistrée aujourd'hui** — l'analyse du jour n'a rien à analyser.
- Vous êtes **hors ligne** et un modèle OpenRouter est configuré.
- La **clé** est invalide, expirée, ou dépourvue de crédit.
- Le **quota** du modèle gratuit est atteint.
- Le modèle a répondu **hors format**.
- Le modèle choisi n'est **plus disponible** — l'offre gratuite d'OpenRouter change
  constamment.

## Diagnostic

| Message | Cause |
|---|---|
| « Aucune séance à analyser aujourd'hui… » | Aucune séance ce jour |
| « Clé OpenRouter refusée. » / « Clé refusée par OpenRouter. » | HTTP 401 — clé invalide |
| « Quota du modèle gratuit atteint, réessaie plus tard. » | HTTP 429 |
| « OpenRouter a répondu HTTP *n*. » | Autre erreur du service |
| « Le modèle n'a pas renvoyé de JSON. » / « Réponse vide du modèle. » | Réponse hors format |
| « Le modèle n'a renvoyé aucun constat exploitable. » | Analyse des progrès sans contenu utile |
| « Échec de la connexion à OpenRouter. » | Réseau, ou service indisponible |

## Solution

1. **Aucune séance** — lancez ou consignez une séance, puis relancez l'analyse.
2. **Vérifier la clé** : Profil → *Analyse IA — OpenRouter* → **Charger les modèles gratuits**.
   Le message dira « Clé valide — *n* modèles gratuits disponibles » si tout va bien.
3. **Recharger la liste** et **choisir un autre modèle** : celui que vous utilisiez n'est
   peut-être plus proposé.
4. **Quota atteint** — attendez, ou changez de modèle.
5. **Réponse hors format** — certains modèles gratuits honorent mal la consigne « JSON
   seulement ». Essayez-en un autre.
6. **Se passer du modèle distant** — *Effacer* la clé et le modèle : l'analyse redevient
   locale, sans réseau et sans quota.

## Si le problème persiste

⚠️ **Vous n'êtes jamais laissé sans analyse.** Toute défaillance d'OpenRouter retombe sur le
moteur local, qui calcule sur l'appareil, et le message dit ce qui s'est passé.

L'analyse du jour est **mise en cache pour la journée** : la revoir ne relance pas d'appel,
donc ne refacture rien. L'analyse des progrès, elle, est **recalculée à chaque fois** — c'est
volontaire, elle lit une fenêtre qui se déplace chaque jour.

⚠️ **L'analyse ne remplace pas l'avis d'un professionnel de santé.**

## Informations à fournir au support

Le message exact, le modèle choisi, si le bouton « Charger les modèles gratuits » réussit, et
si vous étiez en ligne. ⚠️ **N'envoyez jamais votre clé API.**

Voir [Analyse IA du jour](../features/analyse-ia.md) ·
[Analyse des progrès](../features/analyse-progres.md)
