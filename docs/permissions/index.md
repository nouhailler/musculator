---
titre: Permissions
description: Les permissions et capacités système utilisées par Musculator, quand elles sont demandées et ce qui se passe en cas de refus.
ordre: 5
---

# Permissions

**Aucune permission n'est demandée au premier lancement.** Chacune l'est au moment où la
fonction correspondante est utilisée, et **chacune a une solution de repli**. Aucune n'est
obligatoire pour utiliser l'application.

| Permission | Pour quoi | Obligatoire ? | Repli si refus |
|---|---|---|---|
| [Caméra](#camera) | Scanner un code-barres | Non | Saisie du code à la main |
| [Position](#position) | Suivre une marche au GPS | Non | Saisie de la distance, ou import GPX/CSV |
| [Presse-papier](#presse-papier) | Copier un prompt, une sauvegarde, un diagnostic | Non | Le texte reste affiché et sélectionnable |
| [Partage / téléchargement](#partage) | Sortir un fichier de sauvegarde | Non | Téléchargement, puis presse-papier |
| [Plein écran](#plein-ecran) | Mode grands boutons pendant une séance | Non | Le mode reste une simple mise en page |
| [Écran allumé](#ecran-allume) | Garder l'écran allumé pendant un suivi GPS | Non | L'écran s'éteint ; le suivi s'interrompt |
| [Synthèse vocale](#synthese-vocale) | Coach vocal | Non | Silence, séance inchangée |
| [Stockage local](#stockage-local) | Tout enregistrer | **De fait oui** | Aucune donnée conservée |

**Non utilisées** : notifications, microphone, contacts, Bluetooth, capteurs de mouvement,
podomètre, système de fichiers, calendrier, santé. L'application ne les demande jamais.

---

## Caméra {#camera}

**Pourquoi** — lire le code-barres d'un produit alimentaire.

**Quand** — à la première ouverture du scanner, jamais avant.

**Obligatoire ?** Non.

**Si vous refusez** — le message « Accès à la caméra refusé. Autorise-le dans les réglages du
navigateur, ou saisis le code à la main. » s'affiche, et la saisie manuelle du code reste
disponible. Le reste de l'application est intact.

⚠️ **La caméra exige une connexion sécurisée (HTTPS).** En `http://` simple, elle est refusée
par le navigateur : « La caméra exige une connexion sécurisée (HTTPS). Saisis le code à la
main. »

**Ce qui est fait de l'image** — le flux est décodé sur l'appareil, image par image.
**Aucune image n'est enregistrée ni envoyée.** La caméra est relâchée à la fermeture du
scanner.

**Réactiver**

- *Android / Chrome* : Réglages du site (cadenas dans la barre d'adresse, ou Paramètres →
  Site → Caméra) → Autoriser. Depuis une app installée : appui long sur l'icône → Infos →
  Autorisations.
- *iOS / Safari* : Réglages → Safari → Caméra, ou Réglages → *nom du site*.
- *Bureau* : cadenas de la barre d'adresse → Caméra.

Voir [Scanner](../features/scanner.md) ·
[Dépannage](../troubleshooting/scanner-ne-souvre-pas.md)

---

## Position (géolocalisation) {#position}

**Pourquoi** — mesurer la distance parcourue pendant une marche.

**Quand** — au démarrage d'un suivi GPS, jamais avant.

**Obligatoire ?** Non. C'est un des trois modes de saisie d'une marche.

**Si vous refusez** — « Accès à la position refusé — autorise-le pour suivre la marche, ou
saisis la distance à la main. » La saisie manuelle et l'import GPX/CSV restent disponibles.

⚠️ **La géolocalisation exige une connexion sécurisée (HTTPS).**

**Ce qui est fait de la position** — ⚠️ **aucun trajet n'est enregistré.** Les points servent à
accumuler une distance au fil de l'eau, puis sont jetés. Seuls la distance, la durée et les
calories sont conservés. Rien n'est envoyé nulle part.

Les points sont filtrés (précision, pas minimum, saut) : un téléphone à l'arrêt rapporte une
position qui vagabonde et accumulerait des kilomètres.

**Limite structurelle** — ⚠️ **le suivi ne tourne que l'application ouverte, écran allumé.**
Aucun navigateur ne permet à une PWA de compter les pas en arrière-plan, et l'application ne
prétend pas le faire.

**Réactiver**

- *Android / Chrome* : Réglages du site → Localisation → Autoriser. Vérifier aussi que la
  localisation du téléphone est active.
- *iOS / Safari* : Réglages → Confidentialité et sécurité → Service de localisation → Safari.
- *Bureau* : cadenas de la barre d'adresse → Localisation.

Voir [Marche](../features/marche.md) · [Dépannage](../troubleshooting/gps-ne-suit-pas.md)

---

## Presse-papier {#presse-papier}

**Pourquoi** — copier le prompt d'un import dicté, une sauvegarde qui ne peut pas être
téléchargée, ou le texte d'un message au support.

**Quand** — au moment où vous appuyez sur *Copier*.

**Si l'accès est refusé** (ou hors contexte sécurisé) — le texte reste **affiché à l'écran et
sélectionnable** ; il n'y a rien à débloquer.

---

## Partage et téléchargement de fichier {#partage}

**Pourquoi** — sortir le fichier de [sauvegarde](../features/sauvegarde.md) de l'appareil.

**Quand** — à l'export.

**Comment** — trois voies essayées dans l'ordre : la **feuille de partage** du système
(sur une app installée sur iOS, un lien de téléchargement ne fait souvent rien du tout), puis
le **téléchargement**, puis le **presse-papier** en dernier recours, pour que les données
puissent toujours sortir. L'écran dit laquelle a servi.

Annuler la feuille de partage n'est pas une erreur : rien n'est affiché.

---

## Plein écran {#plein-ecran}

**Pourquoi** — le mode grands boutons pendant une séance.

**Quand** — à l'activation du mode.

**Si le navigateur refuse** — aucune erreur : le mode reste utilisable comme simple mise en
page.

---

## Maintien de l'écran allumé {#ecran-allume}

**Pourquoi** — un suivi GPS avec l'écran éteint cesse de recevoir des points.

**Quand** — au démarrage d'un suivi GPS.

**Si le système refuse** — le suivi continue tant que l'écran reste allumé. C'est une demande
au mieux, jamais une garantie ; tous les navigateurs ne l'exposent pas.

---

## Synthèse vocale {#synthese-vocale}

**Pourquoi** — le [coach vocal](../features/coach-vocal.md).

Ce n'est pas une permission au sens strict : aucune autorisation n'est demandée. Un
navigateur sans synthèse vocale, ou sans voix française installée, **reste simplement
silencieux** — la séance se déroule normalement.

iOS exige souvent une première interaction de l'utilisateur avant d'autoriser la synthèse.

---

## Stockage local {#stockage-local}

**Pourquoi** — c'est là que vit **tout** ce que vous créez : profil, séances perso, journal,
nutrition, marche, réglages.

**Quand** — en continu, sans demande.

⚠️ **Ce n'est pas une permission qu'on accorde, mais elle peut être retirée.** Un navigateur
en navigation privée, réglé pour bloquer les données de site, ou nettoyé, **efface
définitivement** toutes vos données. Il n'existe aucune copie ailleurs.

**Ne videz jamais les « données de site » depuis les réglages du téléphone.** Pour repartir
d'une version propre, utilisez *Forcer le rechargement complet* dans le profil : il vide le
cache de l'application **sans toucher à vos données**.

Voir [Données](../data/) · [Stockage local](../data/stockage-local.md) ·
[Sauvegarde](../features/sauvegarde.md)
