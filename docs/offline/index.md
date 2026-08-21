---
titre: Fonctionnement hors connexion
description: Ce qui marche sans réseau, ce qui en a besoin, et ce qui se passe quand la connexion revient.
ordre: 7
---

# Fonctionnement hors connexion

**Musculator est conçue pour fonctionner hors ligne.** Une fois l'application chargée une
première fois, l'essentiel ne touche jamais au réseau : le catalogue de 152 exercices, les
12 programmes, les démos animées et la table alimentaire générique de 3 167 aliments font
partie de l'application.

Une bannière indique quand l'appareil est hors ligne.

## Tableau par fonction

| Fonction | Hors ligne | En ligne | Synchronisation |
|---|---:|---:|---:|
| Séance guidée | ✅ | ✅ | — |
| Coach vocal | ⚠️ | ✅ | — |
| Programmes et bibliothèque | ✅ | ✅ | — |
| Créer une séance | ✅ | ✅ | — |
| Importer un programme dicté | ✅ | ✅ | — |
| Journal, ajout et correction de séances | ✅ | ✅ | — |
| Progrès, badges, historique | ✅ | ✅ | — |
| Cartographie musculaire | ✅ | ✅ | — |
| Journal alimentaire et score | ✅ | ✅ | — |
| Recherche — Mes aliments | ✅ | ✅ | — |
| Recherche — table générique CIQUAL | ✅ | ✅ | — |
| Recherche — Open Food Facts | ❌ | ✅ | — |
| Scanner un code-barres | ⚠️ | ✅ | — |
| Importer un repas dicté | ✅ | ✅ | — |
| Import Nutritor (CSV) | ✅ | ✅ | — |
| Marche — saisie et import | ✅ | ✅ | — |
| Marche — suivi GPS | ✅ | ✅ | — |
| Analyse IA — moteur local | ✅ | ✅ | — |
| Analyse IA — moteur OpenRouter | ❌ | ✅ | — |
| Aide, FAQ, tutoriels | ✅ | ✅ | — |
| Documentation | ⚠️ | ✅ | — |
| Rédiger un message au support | ✅ | ✅ | — |
| Envoyer ce message | ❌ | ✅ | — |
| Sauvegarde et restauration | ✅ | ✅ | — |
| Thème | ✅ | ✅ | — |
| Chercher une mise à jour | ❌ | ✅ | — |

**Aucune synchronisation nulle part** : il n'y a ni compte, ni serveur, ni file d'attente
d'envoi. Rien n'est mis de côté pour être expédié plus tard.

## Les ⚠️ expliqués

**Coach vocal** — il utilise la synthèse vocale du téléphone. Certaines voix sont
téléchargées à la demande par le système : une voix française non installée peut rester
muette hors ligne. C'est un comportement du téléphone, pas de l'application.

**Scanner** — la caméra et le décodage fonctionnent, mais **le produit ne peut pas être
identifié** sans réseau, sauf s'il est déjà dans « Mes aliments ». Par ailleurs, sur les
navigateurs sans lecteur intégré (iOS Safari, Firefox), le décodeur de secours **doit être
téléchargé une première fois avec du réseau** — il n'est pas préchargé, pour ne pas imposer
plusieurs centaines de kilo-octets à tous les utilisateurs qui n'ouvrent jamais le scanner.
Une fois récupéré, il est mis en cache pour un an.

**Documentation** — elle est téléchargée à sa **première ouverture** (environ 236 Ko), puis
mise en cache : ensuite elle est entièrement lisible hors ligne. Ouverte pour la première
fois sans réseau, elle le dit et invite à réessayer une fois connecté.

**Suivi GPS** — la géolocalisation ne demande pas de réseau. Sans lui, le premier point peut
simplement être plus long à obtenir, l'assistance réseau n'étant pas disponible.

## Ce qui est mis en cache

| Contenu | Stratégie |
|---|---|
| L'application (code, styles, icônes, catalogues, table alimentaire) | Préchargé à l'installation, ≈ 1,7 Mo |
| Décodeur de code-barres de secours | **Non** préchargé — mis en cache à la première utilisation, pour un an |
| Documentation | Préchargée : le chapitre Dépannage est ce dont on a besoin quand quelque chose ne marche pas, souvent sans réseau |
| Polices d'écriture | Mises en cache à la première utilisation |
| Aliments déjà utilisés | Conservés dans vos données, indéfiniment |
| Résultats de recherche Open Food Facts | Non mis en cache en tant que tels — mais tout aliment **ajouté** rejoint « Mes aliments » |

## Perte de réseau en cours d'usage

- **Rien ne s'interrompt.** Aucune fonction locale ne dépend du réseau.
- Une recherche d'aliment en cours échoue avec un message explicite ; les sources locales
  continuent de répondre.
- Une analyse IA distante échoue et **retombe automatiquement sur le moteur local**, en
  disant pourquoi. Vous n'êtes jamais laissé sans analyse.
- Un suivi GPS en cours n'est pas affecté.
- Une perte de signal GPS passagère efface son propre avertissement dès qu'un point revient.

## Retour du réseau

Il n'y a **rien à rattraper** : aucune opération n'a été mise en attente. Les fonctions qui
demandent le réseau redeviennent simplement disponibles.

L'application revérifie l'existence d'une [mise à jour](../features/mise-a-jour.md) au retour
au premier plan.

## Premier lancement

⚠️ **Le tout premier chargement demande du réseau.** L'application ne peut pas s'installer
hors ligne. Ensuite, elle se lance sans connexion.

## Pages liées

[Données](../data/) · [Mise à jour](../features/mise-a-jour.md) ·
[Limites connues](../reference/limitations.md)
