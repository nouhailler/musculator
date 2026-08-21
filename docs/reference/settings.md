---
titre: Référence des paramètres
description: Tableau récapitulatif de tous les paramètres exposés à l'utilisateur.
ordre: 1
---

# Référence des paramètres

Tous les réglages sont sur un seul écran : **menu ☰ → Profil, objectifs & réglages**.
Explications détaillées : [Paramètres](../settings/).

## Profil

| Paramètre | Identifiant | Type | Défaut | Valeurs | Description |
|---|---|---|---|---|---|
| Prénom | `prenom` | Texte | vide | — | Salutation ; envoyé lors d'une analyse IA distante |
| Âge | `age` | Nombre | vide | années | Métabolisme de base |
| Sexe | `sexe` | Sélection | Homme | Homme · Femme · Autre | Silhouette, longueur du pas, métabolisme |
| Poids | `poids` | Nombre | vide | kg | Métabolisme, protéines/kg, calories de marche |
| Taille | `taille` | Nombre | vide | cm | Métabolisme, longueur du pas |
| Poids cible | `poidsCible` | Nombre | vide | kg | Repère seulement |
| Objectif principal | `objectif` | Sélection | Prise de masse | Prise de masse · Recomposition corporelle · Force · Tonus · Endurance | Cadre les analyses |
| Zones prioritaires | `zones` | Multi-sélection | aucune | Pectoraux · Dos · Jambes · Épaules · Bras · Abdos | Analyse des progrès |
| Niveau d'expérience | `experience` | Sélection | Débutant | Débutant · Intermédiaire · Avancé | Contexte des analyses |
| Fréquence visée | `frequence` | Curseur | 4 | 1 à 7 | **Multiplicateur d'activité** de la cible calorique |
| Contraintes / blessures | `contraintes` | Texte long | vide | — | Analyses ; envoyé lors d'une analyse distante |

**Application** : après *Enregistrer*. **Stockage** : tranche `profile`.

## Nutrition

| Paramètre | Identifiant | Type | Défaut | Valeurs | Description |
|---|---|---|---|---|---|
| Objectif nutrition | `objectifNutrition` | Sélection | Maintien | Prise de masse · Recomposition · Maintien · Sèche | Écart calorique et protéines/kg |
| Calories | `kcalCible` | Nombre | vide = calculé | kcal | Impose la cible calorique |
| Protéines | `protCible` | Nombre | vide = calculé | g | Impose la cible protéique |
| Glucides | `glucCible` | Nombre | vide = calculé | g | Impose la cible de glucides |
| Lipides | `lipCible` | Nombre | vide = calculé | g | Impose la cible de lipides |
| Marche | `kmCible` | Nombre | vide = pas d'objectif | km/jour, pas de 0,5 | Objectif de distance |

**Application** : après *Enregistrer*. **Réinitialisation** : vider le champ, ou
*Tout recalculer*. **Interaction** : une cible calorique ou protéique fixée à la main
entraîne le partage glucides/lipides.

## Application

| Paramètre | Identifiant | Type | Défaut | Valeurs | Description |
|---|---|---|---|---|---|
| Thème | `theme` | Sélection | **Sombre** | Sombre · Clair · Système | Palette ; *Système* suit le téléphone en direct |
| Coach vocal | `voiceOn` | Booléen | **Activé** | oui / non | Annonces pendant une séance |
| Clé API OpenRouter | `openrouter.key` | Texte masqué | vide | — | ⚠️ Stockée **en clair** ; **jamais exportée** |
| Modèle OpenRouter | `openrouter.model` | Sélection | vide | Liste chargée en direct | Modèle qui rédige les analyses ; **exporté** |

**Application** : immédiate, sans *Enregistrer*.

## Actions (ce ne sont pas des réglages)

| Action | Écran | Effet |
|---|---|---|
| Enregistrer | Profil | Valide le bloc profil |
| Tout recalculer | Profil | Vide les quatre cibles quotidiennes |
| Exporter mes données | Profil | Produit un fichier de sauvegarde |
| Restaurer une sauvegarde | Profil | Fusionner ou tout remplacer |
| Vérifier les mises à jour | Profil | Cherche et applique une nouvelle version |
| Forcer le rechargement complet | Profil | Vide le cache de l'app ; ⚠️ ne touche pas aux données |
| Charger les modèles gratuits | Profil | Récupère la liste et valide la clé |
| Effacer | Profil | Efface clé et modèle OpenRouter |
| Choisir un fichier CSV | Profil | Import Nutritor (toujours en fusion) |
| Revoir le tutoriel | Profil | Relance *Découvrir Musculator* |
| Rejouer le premier lancement | Profil | ⚠️ **Développement uniquement** |

## État persisté sans être un réglage

| Identifiant | Rôle |
|---|---|
| `disclaimerAcked` | L'avertissement a été accepté |
| `legalVersion` | Version de l'avertissement acceptée |
| `tourDone` | L'invitation au tutoriel a été vue |

## Non persisté

Filtres de la bibliothèque et des programmes, recherche d'aliment, onglet courant, écran
superposé ouvert, analyse des progrès, ⚠️ **et la séance en cours**.
