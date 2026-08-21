---
titre: Données et confidentialité
description: Ce que Musculator stocke, où, pour quoi faire, ce qui sort de l'appareil et comment tout supprimer.
ordre: 6
---

# Données et confidentialité

> Ce chapitre décrit le **fonctionnement technique** vérifié dans le code. Le document
> juridique de référence est la [politique de confidentialité](../legal/) affichée dans
> l'application.

## En une phrase

**Aucun compte, aucun serveur.** Tout ce que vous créez reste sur cet appareil. L'éditeur n'y
a pas accès et ne peut rien restaurer.

## Tableau récapitulatif

| Donnée | Origine | Stockage | Transmission | Finalité |
|---|---|---|---|---|
| Profil (prénom, âge, sexe, poids, taille, poids cible, objectifs, zones, niveau, fréquence, contraintes, cibles) | Vous | Stockage local | **Vers OpenRouter** si une analyse IA distante est configurée | Objectifs, analyses |
| Séances perso | Vous | Stockage local | Aucune | Vos programmes |
| Journal de séances | L'app + vous | Stockage local | **Vers OpenRouter** si analyse distante | Historique, badges, progrès |
| Journal alimentaire | Vous | Stockage local | Aucune | Score et objectifs du jour |
| Aliments utilisés (cache) | Open Food Facts, CIQUAL, vous | Stockage local | Aucune | Réutilisation hors ligne |
| Journal de marche | Vous / GPS | Stockage local | Aucune | Distance, calories, badges |
| Notes du jour | Vous | Stockage local | Aucune | Mémo |
| Analyses en cache | L'app | Stockage local | Aucune | Ne pas recalculer (ni refacturer) |
| Réglages (thème, coach vocal, tutoriel vu, acceptation légale) | Vous | Stockage local | Aucune | Comportement de l'app |
| Clé API OpenRouter | Vous | Stockage local, **en clair** | **Vers OpenRouter** à chaque analyse distante | Authentification |
| Recherche d'aliment / code-barres | Vous | Non stocké | **Vers Open Food Facts** | Trouver un produit |
| Diagnostic de support | L'app | Non stocké | **Vers votre app mail**, à votre initiative | Répondre à un problème |
| Points GPS | Capteur | ⚠️ **Jamais stockés** | Aucune | Calcul de distance, puis jetés |
| Images de la caméra | Capteur | ⚠️ **Jamais stockées** | Aucune | Décodage du code-barres sur l'appareil |

## Ce qui sort de l'appareil — trois cas, tous déclenchés par vous

L'application ne peut joindre que **deux hôtes**, et rien d'autre :

### 1. Open Food Facts — `world.openfoodfacts.org`

**Quand** : vous cherchez un aliment par son nom, ou vous scannez un code-barres.
**Ce qui part** : votre terme de recherche, ou le code-barres lu. Rien d'autre — ni identité,
ni profil, ni journal.
**Ce qui ne part pas** : aucune image de la caméra. Le décodage a lieu sur l'appareil.

### 2. OpenRouter — `openrouter.ai`

**Quand** : uniquement si vous avez saisi une clé **et** choisi un modèle, et uniquement au
moment où vous lancez une analyse.

⚠️ **C'est le seul endroit où des données de santé quittent l'appareil.** L'analyse du jour
envoie **prénom, poids, taille, âge, blessures et contraintes déclarées**, l'objectif, les
séances du jour et le nombre de séances de la semaine. L'analyse des progrès envoie les
statistiques agrégées de la fenêtre de 4 semaines.

**Sans clé configurée, rien de tout cela ne part** et les analyses sont calculées sur
l'appareil.

La clé vous appartient : elle est envoyée à OpenRouter, pas à l'éditeur. Les conditions et la
politique de confidentialité d'OpenRouter s'appliquent alors à ce qui lui est transmis.

### 3. Votre application mail

**Quand** : vous envoyez un message au support.
**Ce qui part** : votre message et un **diagnostic affiché avant l'envoi** — build, appareil,
système, navigateur, mode d'affichage, écran, langue, thème et **volume** de données
(des comptes, jamais leur contenu). ⚠️ **La clé OpenRouter n'est jamais lue**, seulement le
fait qu'un modèle soit configuré.

Le message ne part **que si vous l'envoyez depuis votre application mail**.

## Ce qui ne sort jamais

- Aucun cookie, aucune mesure d'audience, aucune publicité, **aucun script tiers**.
- Aucun identifiant publicitaire, aucune empreinte d'appareil.
- Aucun trajet GPS. Aucune image.
- Aucun envoi automatique : chacun des trois cas ci-dessus demande une action de votre part.

Les seules autres requêtes que fait l'application sont le chargement de ses propres fichiers
et de ses polices d'écriture.

## Durée de conservation

Il n'y a **aucune expiration automatique**. Les données restent tant que :

- vous ne les supprimez pas dans l'application,
- vous ne désinstallez pas l'application,
- vous n'effacez pas les données de site du navigateur.

Le navigateur peut aussi décider de libérer de l'espace : voir
[Stockage local](stockage-local.md).

## Suppression

| Portée | Comment |
|---|---|
| Une séance | [Journal](../guide/journal.md) ou historique des [Progrès](../guide/progres.md) → 🗑️ |
| Un aliment d'un repas | [Nutrition](../guide/nutrition.md) → supprimer l'entrée |
| Une marche | [Journal](../guide/journal.md) → supprimer l'entrée |
| La clé et le modèle OpenRouter | Profil → *Effacer* |
| **Tout** | Désinstaller l'app, ou effacer les données de site du navigateur |

⚠️ **La suppression totale est définitive et immédiate.** Il n'y a pas de corbeille, pas de
copie serveur, pas de récupération possible.

## Export

[Sauvegarde](../features/sauvegarde.md) — un fichier JSON contenant les 14 tranches
persistées, **sauf la clé OpenRouter**.

C'est aussi la seule façon de transférer vos données vers un autre appareil.

## Pages liées

- [Stockage local](stockage-local.md) — le détail technique
- [Permissions](../permissions/)
- [Informations légales](../legal/)
- [Sauvegarde](../features/sauvegarde.md)
