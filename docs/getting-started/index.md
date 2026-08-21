---
titre: Bien démarrer
description: Installer Musculator, comprendre le premier lancement, configurer son profil et mettre à jour ou désinstaller l'application.
ordre: 1
---

# Bien démarrer

## Présentation

Musculator est une **PWA** : une application web que l'on installe sur son téléphone depuis
le navigateur. Il n'y a rien à télécharger sur un magasin d'applications, aucun compte à
créer, et rien à connecter.

Une fois installée, elle fonctionne hors ligne. Voir [Hors connexion](../offline/).

## Compatibilité

| Plateforme | Navigateur | État |
|---|---|---|
| Android | Chrome, Edge | Supporté, installation depuis le menu du navigateur |
| iOS / iPadOS | Safari | Supporté, installation par « Sur l'écran d'accueil » |
| Bureau | Chrome, Edge | Supporté, installation depuis la barre d'adresse |
| Bureau | Firefox | Fonctionne dans l'onglet ; installation non proposée par le navigateur |

Détail des différences par plateforme : [Compatibilité](../reference/compatibility.md).

L'application **exige une connexion sécurisée (HTTPS)** pour la caméra et le GPS. En
`http://` simple, ces deux fonctions se signalent comme indisponibles et proposent la saisie
manuelle.

## Installation PWA

### Android (Chrome, Edge)

1. Ouvrez l'adresse de l'application dans le navigateur.
2. Menu ⋮ → **Installer l'application** (ou **Ajouter à l'écran d'accueil**).
3. Confirmez. Une icône apparaît sur l'écran d'accueil.
4. Lancez l'app depuis cette icône : elle s'ouvre en plein écran, sans barre d'adresse.

**Désinstaller** : appui long sur l'icône → *Désinstaller*.
⚠️ La désinstallation supprime les données de l'application. Voir [Données](../data/).

### iOS / iPadOS (Safari)

1. Ouvrez l'adresse dans **Safari** (les autres navigateurs iOS ne proposent pas
   l'installation).
2. Bouton **Partager** → **Sur l'écran d'accueil**.
3. Confirmez.

Particularités iOS documentées dans [Limites connues](../reference/limitations.md) : le
téléchargement d'un fichier depuis une app installée échoue souvent en silence — c'est
pourquoi [l'export de sauvegarde](../features/sauvegarde.md) essaie d'abord la feuille de
partage.

### Bureau (Chrome, Edge)

Icône d'installation dans la barre d'adresse → **Installer**. L'app s'ouvre dans sa propre
fenêtre.

## Premier lancement

```
Premier lancement
     ↓
Avertissement légal (modale, 2 pages)   ← obligatoire
     ↓
« J'ai compris »
     ↓
Accueil + invitation au tutoriel        ← ignorable
     ↓
Profil (recommandé, non bloquant)
     ↓
Utilisation normale
```

### Étape 1 — Avertissement légal

| | |
|---|---|
| **Ce qui s'affiche** | Une modale « ⚠️ Information importante » : l'application est fournie à titre informatif, peut contenir des erreurs, son usage est sous votre responsabilité. |
| **Ce que vous devez faire** | Lire, puis appuyer sur **J'ai compris**. |
| **Options** | **Voir les détails** ouvre une seconde page contenant les mentions légales complètes, dans la même modale. |
| **En cas de refus** | Il n'y a pas de bouton de refus : l'application n'est pas utilisable tant que la modale n'est pas acquittée. |
| **Peut-on l'ignorer ?** | Non. |
| **Y revenir plus tard** | Menu ☰ → **Avertissement médical**, ou **Mentions légales**. Voir [Informations légales](../legal/). |

L'acceptation est enregistrée sur l'appareil (`disclaimerAcked`), avec la version du texte
acceptée (`legalVersion`). Dans ce build, une mise à jour du texte **ne réaffiche pas** la
modale à ceux qui ont déjà accepté.

Sur Android, le bouton **Retour** referme les détails au lieu de quitter l'application.

### Étape 2 — Invitation au tutoriel

L'Accueil propose le tutoriel guidé « Découvrir Musculator ». Vous pouvez le suivre ou le
rejeter ; dans les deux cas l'invitation ne revient plus (`tourDone`). Les quatre tutoriels
restent relançables depuis le [Centre d'aide](../features/aide.md).

### Étape 3 — Permissions

**Aucune permission n'est demandée au premier lancement.** Chacune l'est au moment où la
fonction correspondante est utilisée, et chacune a une solution de repli si elle est
refusée. Voir [Permissions](../permissions/).

## Configuration initiale

Rien n'est obligatoire, mais deux réglages changent beaucoup de choses :

1. **Profil** (menu ☰ → *Profil, objectifs & réglages*) — poids, taille, âge, sexe,
   fréquence et objectif nutrition. Sans eux, les objectifs caloriques retombent sur une
   valeur par défaut (2 200 kcal) au lieu d'être calculés, et l'estimation de distance de
   marche utilise une taille médiane de 170 cm.
2. **Thème** — Sombre (défaut), Clair, ou Système.

L'[analyse IA distante](../features/analyse-ia.md) via OpenRouter est facultative et
désactivée tant qu'aucune clé n'est saisie.

## Mise à jour

L'application vérifie les mises à jour au retour au premier plan. Une nouvelle version
s'installe en arrière-plan mais ne s'applique qu'au redémarrage — le bouton
**Profil → Vérifier les mises à jour** la cherche et l'applique tout de suite.

Détail : [Mise à jour](../features/mise-a-jour.md) ·
Dépannage : [L'app ne se met pas à jour](../troubleshooting/mise-a-jour-bloquee.md).

## Désinstallation

Désinstaller l'application, ou effacer les données de site du navigateur, **supprime
définitivement** votre profil, vos séances perso, votre journal, votre nutrition et vos
marches. Il n'existe aucune copie ailleurs.

**Exportez une sauvegarde avant.** Voir [Sauvegarde](../features/sauvegarde.md).
