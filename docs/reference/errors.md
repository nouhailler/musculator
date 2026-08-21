---
titre: Codes et erreurs
description: Tous les messages d'erreur de Musculator, leur signification et la marche à suivre.
ordre: 2
---

# Codes et erreurs

⚠️ **Musculator n'utilise pas de codes d'erreur numérotés.** Les messages sont en français et
se suffisent à eux-mêmes. Le tableau ci-dessous les reprend tous, groupés par domaine.

Les codes HTTP cités (401, 429, 503) proviennent des services externes, pas de
l'application.

## Saisie

| Message | Signification | Solution |
|---|---|---|
| Renseigne au moins une distance ou une durée. | Une marche saisie à la main sans distance **ni** durée | Saisir l'une des deux ; la distance peut être déduite de la durée |
| Renseigne au moins les calories ou les protéines. | Un aliment saisi à la main sans valeur énergétique | Saisir au moins les calories ou les protéines pour 100 g |

## Caméra et scanner

| Message | Signification | Solution |
|---|---|---|
| Accès à la caméra refusé. Autorise-le dans les réglages du navigateur, ou saisis le code à la main. | Permission caméra refusée | [Réautoriser](../permissions/#camera), ou saisir le code |
| La caméra exige une connexion sécurisée (HTTPS). Saisis le code à la main. | Contexte non sécurisé | Ouvrir l'app en HTTPS |
| Caméra indisponible. Saisis le code à la main. | Pas de caméra, ou occupée | Fermer les autres apps ; saisir le code |

## Géolocalisation et marche

| Message | Signification | Solution |
|---|---|---|
| Accès à la position refusé — autorise-le pour suivre la marche, ou saisis la distance à la main. | Permission refusée | [Réautoriser](../permissions/#position), saisir, ou importer |
| Position indisponible pour l'instant. | Aucun point exploitable | Sortir à l'air libre ; l'avertissement disparaît dès qu'un point revient |
| La géolocalisation exige une connexion sécurisée (HTTPS). | Contexte non sécurisé | Ouvrir l'app en HTTPS |
| Ce navigateur n'expose pas la géolocalisation. | API absente | Saisir la distance, ou importer |
| Fichier GPX illisible. | XML invalide | Réexporter la trace |
| Aucune trace exploitable dans ce GPX (moins de 2 points). | Trace trop courte | Le fichier ne contient pas de trajet |
| La trace ne parcourt aucune distance. | Points identiques | Idem |
| Colonnes de date et de distance introuvables — vérifie que c'est bien un export d'activités. | CSV non reconnu | Vérifier le fichier |
| Fichier vide ou sans ligne de données. | Moins de 2 lignes | Réexporter |
| Aucune ligne exploitable (*n* ignorées). | Toutes rejetées | Vérifier le format |
| Fichier vide. | Fichier sans contenu | Choisir un autre fichier |

## Aliments et réseau

| Message | Signification | Solution |
|---|---|---|
| Open Food Facts ne répond pas (délai dépassé). | 12 s dépassées sur 3 tentatives | Réessayer plus tard ; sources locales disponibles |
| Impossible de joindre Open Food Facts. Vérifie ta connexion. | Réseau absent ou bloqué | Vérifier la connexion |
| Open Food Facts a répondu HTTP *n*. | Erreur du service (503 sous charge est fréquent, réessayé automatiquement) | Réessayer plus tard |

## OpenRouter et analyses

| Message | Signification | Solution |
|---|---|---|
| Aucune séance à analyser aujourd'hui. Lance une séance depuis l'accueil. | Rien à analyser ce jour | Consigner une séance |
| Clé refusée par OpenRouter. / Clé OpenRouter refusée. | HTTP 401 | Vérifier ou remplacer la clé |
| Quota du modèle gratuit atteint, réessaie plus tard. | HTTP 429 | Attendre, ou changer de modèle |
| OpenRouter a répondu HTTP *n*. | Autre erreur du service | Réessayer, ou changer de modèle |
| Vérification impossible (HTTP *n*). | Échec de validation de la clé | Idem |
| Liste des modèles indisponible (HTTP *n*). | Liste non récupérable | Réessayer plus tard |
| Erreur OpenRouter. | Erreur rapportée par le service | Réessayer |
| Le modèle n'a pas renvoyé de JSON. | Réponse hors format | Choisir un autre modèle |
| Réponse vide du modèle. | Réponse sans contenu | Idem |
| Le modèle n'a renvoyé aucun constat exploitable. | Analyse des progrès sans contenu utile | Idem |
| Échec de la connexion à OpenRouter. | Réseau ou service indisponible | Vérifier la connexion |

⚠️ **Toutes ces erreurs retombent sur le moteur local** et sont suivies de « Analyse locale
utilisée à la place. » : vous n'êtes jamais laissé sans analyse.

## Imports dictés

| Message | Signification | Solution |
|---|---|---|
| Colle d'abord le JSON généré. | Champ vide | Coller le texte |
| Aucun JSON trouvé — vérifie le copier-coller. | Aucun objet JSON | Recopier la réponse en entier |
| JSON invalide — vérifie que le bloc a été copié en entier. | Copie tronquée | Recopier |
| Ce JSON n'est pas au format Musculator. | Structure étrangère | Redonner le bon prompt à l'assistant |
| Aucune séance trouvée. Attendu : { "seances": [ { "exercices": [...] } ] }. | Format attendu absent | Idem |
| Aucune séance exploitable. | Rien n'a survécu à la résolution | Idem |
| Aucune date exploitable. | Repas sans date lisible | Demander une date à l'assistant |

## Import Nutritor

| Message | Signification | Solution |
|---|---|---|
| Fichier vide ou sans ligne de données. | Moins de 2 lignes | Réexporter |
| Colonnes 'date' et 'aliment' introuvables — est-ce bien un export de journal Nutritor ? | En-têtes non reconnus | Utiliser un export de **journal** |
| Aucune ligne exploitable (*n* ignorées). | Toutes rejetées | Vérifier le format |

## Sauvegarde

| Message | Signification | Solution |
|---|---|---|
| Fichier illisible : ce n'est pas du JSON valide. | Fichier corrompu | Utiliser un autre export |
| Fichier vide ou inattendu. | Contenu non exploitable | Idem |
| Ce fichier n'est pas une sauvegarde Musculator. | Autre format | Choisir le bon fichier |
| Sauvegarde vide : aucune donnée exploitable. | Aucune tranche reconnue | Idem |

## Mise à jour

| Message | Signification | Solution |
|---|---|---|
| Séance en cours — termine-la avant de mettre à jour. | Refus volontaire | Terminer la séance |
| La recherche n'a pas abouti — réseau lent ou indisponible… | ⚠️ **Pas** « vous êtes à jour » | Réessayer, puis forcer le rechargement |
| Mise à jour automatique indisponible ici (pas de service worker) — recharge la page. | Contexte sans service worker | Recharger la page |
| Tu es déjà sur la dernière version. | Aucune nouvelle version | Rien à faire |

## Support

| Message | Signification |
|---|---|
| Ton application mail s'ouvre avec le message et le diagnostic. Il ne part qu'une fois envoyé de là. | Succès — l'envoi reste à faire |
| Aucune application mail n'a répondu. Le message complet est dans le presse-papier… | Repli presse-papier |
| Impossible d'ouvrir le mail depuis ici. Écris à contact@swinux.ch en recopiant le diagnostic ci-dessous. | Ni mail ni presse-papier |

## Messages qui ne sont pas des erreurs

| Message | Signification |
|---|---|
| Sauvegarde partagée — enregistre-la dans Fichiers ou envoie-la-toi par mail. | Export par la feuille de partage |
| Sauvegarde téléchargée. | Export par téléchargement |
| Téléchargement impossible ici : la sauvegarde est dans le presse-papier… | Export par le presse-papier |
| Clé valide — *n* modèles gratuits disponibles. | Clé et liste validées |
| *n* aliments importés sur *n* jours. | Import Nutritor réussi |

Voir [Dépannage](../troubleshooting/) pour la marche à suivre détaillée.
