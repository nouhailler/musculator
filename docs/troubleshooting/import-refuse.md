---
titre: Mon import est refusé
description: Un message d'erreur au collage d'un JSON dicté, ou au choix d'un fichier.
ordre: 9
---

# Mon import est refusé

## Symptôme

Un message d'erreur apparaît au lieu de l'aperçu.

## Causes possibles et solutions

### JSON dicté (programme ou repas)

| Message | Cause | Solution |
|---|---|---|
| « Colle d'abord le JSON généré. » | Champ vide | Collez le texte |
| « Aucun JSON trouvé — vérifie le copier-coller. » | Aucun objet JSON dans le texte collé | Recopiez la réponse complète de l'assistant, accolades comprises |
| « JSON invalide — vérifie que le bloc a été copié en entier. » | Copie tronquée | Redemandez la réponse à l'assistant, ou copiez-la en entier |
| « Ce JSON n'est pas au format Musculator. » | Structure étrangère | L'assistant n'a pas reçu le bon prompt : recopiez-le depuis l'écran d'import |
| « Aucune séance trouvée. Attendu : { "seances": [ … ] }. » | Format attendu absent | Idem |
| « Aucune date exploitable. » (repas) | Aucune date lisible | Demandez à l'assistant de dater le repas |

### Fichier GPX ou CSV de marche

| Message | Cause | Solution |
|---|---|---|
| « Fichier GPX illisible. » | XML invalide | Réexportez la trace |
| « Aucune trace exploitable dans ce GPX (moins de 2 points). » | Trace trop courte | Le fichier ne contient pas de trajet |
| « La trace ne parcourt aucune distance. » | Points identiques | Idem |
| « Colonnes de date et de distance introuvables… » | CSV non reconnu | Vérifiez que c'est bien un export d'activités |

### CSV Nutritor

| Message | Cause | Solution |
|---|---|---|
| « Fichier vide ou sans ligne de données. » | Moins de deux lignes | Réexportez |
| « Colonnes 'date' et 'aliment' introuvables… » | En-têtes non reconnus | Il faut un export de **journal** Nutritor, pas un autre CSV |
| « Aucune ligne exploitable (*n* ignorées). » | Toutes les lignes rejetées | Vérifiez le format |

### Fichier de sauvegarde

| Message | Cause | Solution |
|---|---|---|
| « Fichier illisible : ce n'est pas du JSON valide. » | Fichier corrompu | Utilisez un autre export |
| « Fichier vide ou inattendu. » | Contenu non exploitable | Idem |
| « Ce fichier n'est pas une sauvegarde Musculator. » | Autre format | Choisissez le bon fichier |
| « Sauvegarde vide : aucune donnée exploitable. » | Aucune tranche reconnue | Le fichier ne contient rien d'utile |

## Diagnostic

Le message désigne toujours l'étape qui a échoué : texte absent, JSON introuvable, JSON
invalide, format étranger, contenu vide.

## Si le problème persiste

- **Un avertissement n'est pas une erreur.** Un import peut aboutir tout en signalant ce qui a
  été deviné : quantité ramenée à 100 g, repas non reconnu, exercice substitué. Lisez
  l'aperçu et corrigez ensuite.
- Un élément inexploitable est **ignoré et nommé**, jamais importé vide : l'import ne tombe
  que si rien ne survit.
- ⚠️ Sur les imports dictés, **rien n'est enregistré avant que vous ayez vu l'aperçu**.

## Informations à fournir au support

Le message exact, l'écran d'import, l'assistant utilisé, et les premières lignes du texte
collé — ⚠️ **sans donnée personnelle**.

Voir [Programme dicté](../features/programme-dicte.md) ·
[Repas dicté](../features/repas-dicte.md) · [Import Nutritor](../features/import-nutritor.md)
