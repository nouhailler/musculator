---
titre: Aide, tutoriels et support
description: Quatre formes d'aide dans l'application — contextuelle, centre d'aide, tutoriels interactifs et contact du support.
ordre: 19
---

# Aide, tutoriels et support

## Description
Quatre formes d'aide, une seule règle : **rien ne vous envoie hors de l'application.**

## Objectif
Répondre à la question là où elle se pose, sans qu'il faille chercher ailleurs.

## Prérequis
Aucun, sauf une application mail pour le formulaire de support.

## Comment l'utiliser

| Forme | Répond à | Où |
|---|---|---|
| **« ? » contextuel** | *Qu'est-ce que cet écran ?* | Barre du haut, à droite |
| **Centre d'aide** | *Comment faire ?* / *Pourquoi ça fait ça ?* | Menu ☰ → *Aide, FAQ & support* |
| **Tutoriels interactifs** | *Montre-moi* | Centre d'aide (4 parcours) |
| **Bulles d'info** | La question posée par un chiffre à l'écran | Près du chiffre |
| **Documentation** | *Tout, exhaustivement* | Menu ☰ → *Documentation* |
| **Support** | Tout le reste | Centre d'aide |

## Options
- **Une seule recherche pour trois corpus** — FAQ (33 entrées), guides d'écran et tutoriels :
  on ne sait pas d'avance sous quelle forme se trouve sa réponse. Accents et casse ignorés ;
  chaque mot tapé restreint la recherche.
- **4 tutoriels** : *Découvrir Musculator*, *Réussir sa première séance*, *Suivre son
  alimentation*, *Mettre ses données à l'abri*. Relançables indéfiniment.

## La documentation dans l'application

La documentation complète — celle que vous lisez — est embarquée dans l'application et
lisible **sans quitter l'app ni le réseau**.

- Elle est **exhaustive** là où le reste de l'aide est contextuel : chaque réglage, chaque
  message d'erreur, chaque permission, la matrice hors-ligne, les limites connues.
- **Aucune copie** : l'app rend les mêmes fichiers que le site de documentation, donc les
  deux ne peuvent pas diverger.
- **Chargement paresseux** — environ 236 Ko, téléchargés à la première ouverture seulement,
  puis mis en cache pour un usage hors ligne. Rien n'est téléchargé pour qui n'ouvre jamais
  cet écran.

## Paramètres associés
Aucun. L'invitation au tutoriel de l'Accueil disparaît définitivement une fois suivie ou
rejetée (`tourDone`).

## Données utilisées

Le formulaire de support joint un **diagnostic**, affiché avant l'envoi : build, appareil,
système, navigateur, mode d'affichage, écran, langue, thème, et le **volume** de données —
des comptes, jamais leur contenu.

⚠️ **La clé OpenRouter n'est jamais lue**, seulement le fait qu'un modèle soit configuré.

## Résultat
Le message part vers **contact@swinux.ch** depuis votre application mail. Le texte complet
est aussi copié dans le presse-papier, et l'écran dit ce qui s'est passé.

## Fonctionnement hors connexion
Aide, FAQ et tutoriels fonctionnent entièrement hors ligne. L'envoi d'un mail demande du
réseau, mais le message peut être rédigé et copié sans.

## Fonctionnement en ligne
Identique.

## Limites
- ⚠️ **Pendant une séance, le centre d'aide n'est pas atteignable** : il remplacerait l'écran
  de séance, qui ne vit qu'en mémoire. L'aide de la séance s'ouvre depuis la feuille de pause.
  Un tutoriel refuse de démarrer pour la même raison.
- Un écran sans entrée d'aide affiche un « ? » grisé plutôt qu'une feuille vide.
- Un tutoriel à demi terminé n'est jamais repris : il se relance depuis le début.
- **`mailto:` échoue silencieusement sur un appareil sans compte mail** — d'où la copie
  systématique dans le presse-papier.
- L'identification de l'appareil est de la déduction et le dit : chaque cas se rabat sur une
  famille ou sur la chaîne brute plutôt que d'annoncer un mauvais modèle. iOS ne donne jamais
  son modèle.

## Erreurs possibles

| Situation | Message |
|---|---|
| Application mail ouverte | « Ton application mail s'ouvre avec le message et le diagnostic. Il ne part qu'une fois envoyé de là. » |
| Aucune app mail | « Aucune application mail n'a répondu. Le message complet est dans le presse-papier… » |
| Ni mail ni presse-papier | « Impossible d'ouvrir le mail depuis ici. Écris à contact@swinux.ch en recopiant le diagnostic ci-dessous. » |

## Dépannage
[Toutes les procédures](../troubleshooting/)

## FAQ
- [Comment revoir le tutoriel ?](../faq/#refaire-tutoriel)
