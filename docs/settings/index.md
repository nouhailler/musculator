---
titre: Paramètres
description: Tous les réglages exposés à l'utilisateur, leur valeur par défaut, leur effet et leur stockage.
ordre: 4
---

# Paramètres

Tous les réglages de Musculator sont réunis sur un seul écran : **menu ☰ → Profil, objectifs
& réglages**. Il n'existe pas de panneau « Paramètres » séparé.

Tableau récapitulatif : [Référence des paramètres](../reference/settings.md).

**Deux comportements de validation cohabitent sur cet écran :**

- Le **bloc profil** (du prénom aux contraintes) ne prend effet qu'après **Enregistrer**.
- Tout le reste — thème, sauvegarde, mise à jour, import, OpenRouter — s'applique
  immédiatement.

Tout est stocké dans le stockage local du navigateur, sous une clé unique, et inclus dans la
[sauvegarde](../features/sauvegarde.md) — **sauf la clé OpenRouter**, jamais exportée.

---

## Identité et morphologie

### Prénom {#prenom}

| | |
|---|---|
| **Type** | Texte |
| **Défaut** | vide |
| **Effet** | Salutation dans le menu. Envoyé au modèle lors d'une [analyse IA distante](../features/analyse-ia.md). |
| **Application** | Après *Enregistrer* |
| **Réinitialisation** | Vider le champ |

Le coach vocal ne le prononce jamais.

### Sexe {#sexe}

| | |
|---|---|
| **Type** | Sélection |
| **Valeurs** | Homme · Femme · Autre |
| **Défaut** | Homme |
| **Effet** | Silhouette de la [cartographie musculaire](../features/cartographie.md) ; coefficient de longueur du pas pour l'[estimation de distance](../features/marche.md) ; calcul du métabolisme de base. |
| **Application** | Après *Enregistrer* |

### Âge {#age}

| | |
|---|---|
| **Type** | Nombre (années) |
| **Défaut** | vide |
| **Effet** | Entre dans le métabolisme de base, donc dans les objectifs caloriques. Envoyé lors d'une analyse IA distante. |
| **Si vide** | Les objectifs caloriques retombent sur **2 200 kcal** |

### Poids {#poids}

| | |
|---|---|
| **Type** | Nombre (kg) |
| **Défaut** | vide |
| **Effet** | Métabolisme de base, cible protéique (g/kg), et **calories de marche**. |
| **Si vide** | Repli sur 70 kg pour les calculs |

**Corriger son poids corrige aussi les estimations de calories de marche passées** : elles
sont recalculées depuis le poids actuel, jamais figées.

### Taille {#taille}

| | |
|---|---|
| **Type** | Nombre (cm) |
| **Défaut** | vide |
| **Effet** | Métabolisme de base ; longueur du pas pour l'estimation de distance de marche. |
| **Si vide** | Repli sur 170 cm, signalé à l'écran |

### Poids cible {#poids-cible}

| | |
|---|---|
| **Type** | Nombre (kg) |
| **Défaut** | vide |
| **Effet** | Affiché comme repère. N'entre dans aucun calcul d'objectif. |

---

## Objectifs d'entraînement

### Objectif principal {#objectif-principal}

| | |
|---|---|
| **Type** | Sélection |
| **Valeurs** | Prise de masse · Recomposition corporelle · Force · Tonus · Endurance |
| **Défaut** | Prise de masse |
| **Effet** | Cadre l'[analyse des progrès](../features/analyse-progres.md) et l'analyse du jour. **Ne filtre pas** la liste des programmes. |

Distinct de l'objectif nutrition : on peut viser la force tout en séchant.

### Zones musculaires prioritaires {#zones-prioritaires}

| | |
|---|---|
| **Type** | Sélection multiple |
| **Valeurs** | Pectoraux · Dos · Jambes · Épaules · Bras · Abdos |
| **Défaut** | aucune |
| **Effet** | L'[analyse des progrès](../features/analyse-progres.md) vérifie si les séances les atteignent réellement. |

### Niveau d'expérience {#niveau}

| | |
|---|---|
| **Type** | Sélection |
| **Valeurs** | Débutant · Intermédiaire · Avancé |
| **Défaut** | Débutant |
| **Effet** | Contexte pour les analyses. **Ne filtre pas** la bibliothèque ni les programmes — leurs filtres sont indépendants et non mémorisés. |

### Fréquence visée {#frequence}

| | |
|---|---|
| **Type** | Curseur, 1 à 7 |
| **Défaut** | 4 séances / semaine |
| **Effet** | ⚠️ **Détermine le multiplicateur d'activité appliqué au métabolisme de base**, donc directement votre cible calorique. C'est le réglage le plus influent de l'écran. |

### Contraintes / blessures {#contraintes}

| | |
|---|---|
| **Type** | Texte libre |
| **Défaut** | vide |
| **Effet** | Repris dans les analyses. **Envoyé au modèle lors d'une analyse IA distante** — c'est une donnée de santé. |

---

## Nutrition

### Objectif nutrition {#objectif-nutrition}

| | |
|---|---|
| **Type** | Sélection |
| **Valeurs** | Prise de masse · Recomposition · Maintien · Sèche |
| **Défaut** | Maintien |
| **Effet** | Fixe l'écart calorique et la cible protéique : +12 % / 1,8 g/kg · −5 % / 2,0 g/kg · 0 % / 1,6 g/kg · −18 % / 2,0 g/kg |

Une aide sous le sélecteur explique chaque objectif — quatre pastilles dont la différence
tient à un écart calorique et un ratio protéique ne sont pas explicites d'elles-mêmes.

### Objectifs quotidiens {#objectifs-quotidiens}

Quatre champs : **Calories (kcal)**, **Protéines (g)**, **Glucides (g)**, **Lipides (g)**.

| | |
|---|---|
| **Type** | Nombre, chacun indépendant |
| **Défaut** | vide = **calculé automatiquement** depuis le profil |
| **Effet** | Un champ rempli **impose** la cible et remplace le calcul |
| **Réinitialisation** | Vider le champ, ou **Tout recalculer** |

Le calcul en cours reste affiché **en placeholder** du champ : imposer une cible est un acte
délibéré, dont on peut toujours revenir.

Une cible calorique ou protéique fixée à la main **entraîne le partage glucides/lipides**,
pour que l'assiette reste cohérente.

⚠️ Si vos macros ne s'additionnent pas à votre cible calorique (écart > 5 %), l'écran
l'indique en chiffres : les deux jauges de l'écran Nutrition ne pourront pas être pleines
ensemble.

### Marche (km / jour) {#marche-km-jour}

| | |
|---|---|
| **Type** | Nombre (km), pas de 0,5 |
| **Défaut** | vide |
| **Effet** | Objectif de distance quotidienne |
| **Si vide** | **Il n'y a pas d'objectif.** Rien ne le calcule ; l'anneau de l'Accueil affiche la suggestion par défaut en placeholder. |

---

## Application

### Thème {#theme}

| | |
|---|---|
| **Type** | Sélection |
| **Valeurs** | Sombre · Clair · Système |
| **Défaut** | **Sombre** |
| **Effet** | Palette de l'app et couleur de la barre système |
| **Application** | **Immédiate**, sans *Enregistrer* ni rechargement |

*Système* suit le téléphone **en direct**, sans rechargement.

### Coach vocal {#coach-vocal}

| | |
|---|---|
| **Type** | Booléen |
| **Défaut** | **Activé** |
| **Effet** | Annonces et cadence pendant une [séance](../features/seance-guidee.md) |
| **Où** | Menu ☰ → *Coach vocal*, ou le haut-parleur pendant une séance |
| **Application** | Immédiate |

### Clé API OpenRouter {#cle-openrouter}

| | |
|---|---|
| **Type** | Texte (masqué) |
| **Défaut** | vide |
| **Effet** | Active l'[analyse IA distante](../features/analyse-ia.md). Vide, les analyses restent calculées sur l'appareil. |
| **Application** | Immédiate |
| **Réinitialisation** | Bouton **Effacer** (efface aussi le modèle) |

⚠️ **Elle est stockée en clair sur cet appareil** et envoyée directement à OpenRouter depuis
le navigateur — l'application n'a pas de serveur. N'utilisez pas une clé partagée, et
fixez-lui une limite de dépense.
⚠️ **Elle n'est jamais exportée** dans une sauvegarde.

### Modèle OpenRouter {#modele-openrouter}

| | |
|---|---|
| **Type** | Sélection dans une liste **chargée en direct** |
| **Défaut** | vide |
| **Effet** | Le modèle qui rédige les analyses. **Il faut une clé *et* un modèle** pour que le moteur distant serve. |
| **Application** | Immédiate |

La liste n'est jamais figée dans le code : l'offre gratuite d'OpenRouter change constamment.
Sont retenus les modèles à prix nul **produisant du texte**.

**Le modèle, lui, est conservé dans une sauvegarde.**

---

## Réglages non persistés

Ces filtres reviennent à leur valeur par défaut à chaque visite, délibérément :

| Filtre | Écran | Défaut |
|---|---|---|
| Recherche, Niveau, Matériel, *Mollets & avancés* | [Bibliothèque](../guide/bibliotheque.md) | Tous / masqués |
| Durée, Niveau, Matériel | [Programmes](../guide/programmes.md) | Toutes / Tous |
| Onglet courant, écran superposé, séance en cours | — | — |

⚠️ **Une séance en cours n'est pas persistée** : fermer l'application pendant une séance la
perd.

## État enregistré sans être un réglage

| Donnée | Rôle |
|---|---|
| Acceptation de l'avertissement, et sa version | Ne pas réafficher la modale de premier lancement |
| Tutoriel proposé | Ne pas reproposer l'invitation de l'Accueil |

Le bouton « Rejouer le premier lancement » n'existe qu'en développement. Pour tester à la
main, il faut effacer les données de site — ce qui efface aussi le journal.
