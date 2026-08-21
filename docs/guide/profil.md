---
titre: Profil & réglages
description: Profil, objectifs quotidiens, thème, aide, sauvegarde, version et analyse IA distante.
ordre: 10
couvre: profile
---

# Profil & réglages

**Objectif** — vos données personnelles, vos objectifs, et tous les réglages de
l'application.

**Accès** — menu ☰ → *Profil, objectifs & réglages*.

C'est le seul écran de réglages : il n'y a pas de panneau « Paramètres » séparé.
Référence exhaustive : [Paramètres](../settings/) et
[Référence des paramètres](../reference/settings.md).

## Sections de l'écran, dans l'ordre

1. **Profil** — prénom, âge, sexe, poids, taille, poids cible, objectif principal, zones
   prioritaires, niveau, fréquence visée, objectif nutrition, objectifs quotidiens,
   contraintes / blessures. Un bouton **Enregistrer** valide ce bloc.
2. **Apparence** — thème Sombre / Clair / Système. S'applique immédiatement, sans
   *Enregistrer*.
3. **Aide & support** — centre d'aide, relance du tutoriel, contact du support.
4. **Mentions légales** — mentions légales et politique de confidentialité.
5. **Sauvegarde de mes données** — export et restauration.
6. **Version & mise à jour** — version installée, recherche de mise à jour, rechargement
   forcé.
7. **Importer depuis Nutritor** — reprise d'un export CSV de journal.
8. **Analyse IA — OpenRouter** — clé, chargement des modèles gratuits, choix du modèle.

## Points d'attention

- **Enregistrer ne concerne que le bloc profil.** Le thème, la sauvegarde, la mise à jour,
  l'import et OpenRouter s'appliquent immédiatement.
- **Poids, taille, âge** — sans eux, les objectifs caloriques retombent sur une valeur par
  défaut.
- **Objectif nutrition ≠ objectif d'entraînement** — on peut viser la force tout en séchant.
- **Objectifs quotidiens** — un champ vide reste calculé automatiquement ; le calcul
  s'affiche en placeholder. *Tout recalculer* revient au calcul.
- **Marche (km/jour)** — rien ne le calcule : vide signifie « pas d'objectif ».
- **La clé OpenRouter est enregistrée en clair sur cet appareil** et envoyée directement à
  OpenRouter depuis le navigateur — l'application n'a pas de serveur. N'utilisez pas une clé
  partagée, et fixez-lui une limite de dépense.
- **La clé n'est jamais exportée** dans une sauvegarde ; le modèle choisi, si.
- **« Rejouer le premier lancement »** n'existe qu'en développement, jamais dans un build
  installé.

## Erreurs possibles

| Situation | Message |
|---|---|
| Clé OpenRouter refusée | « Clé refusée par OpenRouter. » |
| OpenRouter injoignable | « Échec de la connexion à OpenRouter. » |
| CSV Nutritor non reconnu | « Colonnes 'date' et 'aliment' introuvables — est-ce bien un export de journal Nutritor ? » |
| Sauvegarde illisible | « Fichier illisible : ce n'est pas du JSON valide. » |

Liste complète : [Codes et erreurs](../reference/errors.md).

## Où aller ensuite

[Paramètres](../settings/) · [Sauvegarde](../features/sauvegarde.md) ·
[Mise à jour](../features/mise-a-jour.md) · [Analyse IA](../features/analyse-ia.md)
