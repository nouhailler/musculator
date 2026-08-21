---
titre: Stockage local
description: Ce que Musculator écrit dans le navigateur — stockage local, cache du service worker — et ce qui les efface.
ordre: 1
---

# Stockage local

## Ce que l'application utilise

| Mécanisme | Contenu | Effacé par |
|---|---|---|
| **Stockage local** (`localStorage`) | Toutes vos données, sous **une seule clé** | Effacement des données de site, désinstallation, navigation privée fermée |
| **Cache Storage** (service worker) | Les fichiers de l'application, pour l'usage hors ligne | *Forcer le rechargement complet*, effacement des données de site, désinstallation |

**IndexedDB, cookies et sessionStorage ne sont pas utilisés.**

## Les 14 tranches persistées

| Tranche | Contenu |
|---|---|
| `profile` | Le profil et tous ses objectifs |
| `customWorkouts` | Vos séances perso, y compris celles importées |
| `sessionLog` | Le journal de séances |
| `nutriLog` | Le journal alimentaire, par jour et par repas |
| `foodCache` | Tout aliment déjà utilisé — c'est « Mes aliments » |
| `activityLog` | Le journal de marche, par jour |
| `dayNotes` | Une note libre par jour |
| `analysisLog` | Les analyses du jour mises en cache |
| `theme` | Sombre / Clair / Système |
| `voiceOn` | Coach vocal |
| `tourDone` | L'invitation au tutoriel a été vue |
| `disclaimerAcked` | L'avertissement a été accepté |
| `legalVersion` | Quelle version de l'avertissement |
| `openrouter` | La clé (**en clair**) et le modèle |

**Toutes sont exportées** par la [sauvegarde](../features/sauvegarde.md), **sauf la clé
OpenRouter**.

## Ce qui n'est *pas* persisté, délibérément

- ⚠️ **La séance en cours.** Elle ne vit qu'en mémoire : fermer l'application ou recharger la
  page pendant une séance la perd. C'est aussi pourquoi une mise à jour est refusée pendant
  une séance.
- L'onglet courant, l'écran superposé ouvert, les filtres de la bibliothèque et des
  programmes, la recherche d'aliment en cours, l'analyse des progrès.

## Ce qui efface quoi

| Action | Vos données | Cache de l'app |
|---|---|---|
| **Forcer le rechargement complet** (profil) | ✅ intactes | ❌ vidé |
| Effacer les données de site (réglages du navigateur) | ❌ **effacées** | ❌ vidé |
| Désinstaller l'application | ❌ **effacées** | ❌ vidé |
| Fermer une fenêtre de navigation privée | ❌ **effacées** | ❌ vidé |
| Le navigateur libère de l'espace | ❌ **peut effacer** | ❌ vidé |
| Mise à jour de l'application | ✅ intactes | remplacé |

⚠️ **Un navigateur peut libérer du stockage de sa propre initiative**, en particulier sur iOS
quand une PWA n'est pas ouverte pendant plusieurs semaines. C'est la raison la plus fréquente
d'une disparition de données que personne n'a demandée — et la raison pour laquelle
[l'export](../features/sauvegarde.md) n'est pas facultatif.

## Volume

L'application elle-même occupe environ 1,7 Mo en cache. Vos données sont du texte : quelques
dizaines à quelques centaines de kilo-octets après des mois d'usage.

Le décodeur de code-barres de secours (quelques centaines de kilo-octets) n'est téléchargé
qu'à la première ouverture du scanner, et seulement sur les navigateurs qui en ont besoin.

## Pages liées

[Données](index.md) · [Sauvegarde](../features/sauvegarde.md) ·
[J'ai perdu mes données](../troubleshooting/donnees-disparues.md)
