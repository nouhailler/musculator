---
titre: Glossaire
description: Le vocabulaire de Musculator, terme par terme.
ordre: 3
---

# Glossaire

## Application

### PWA (Progressive Web App)
*Définition* — une application web installable, qui fonctionne hors ligne.
*Dans Musculator* — c'est ce qu'est l'application : rien à télécharger sur un magasin, une
icône sur l'écran d'accueil, et un fonctionnement hors connexion.

### Service worker
*Définition* — un programme que le navigateur garde en réserve pour servir une application
sans réseau.
*Dans Musculator* — il met l'application en cache et gère les [mises à
jour](../features/mise-a-jour.md). C'est lui qu'on remplace quand on « force le rechargement
complet ».

### Build
*Définition* — une version compilée du programme, identifiée par un code.
*Dans Musculator* — c'est le numéro affiché sous « Version installée ». Le projet n'a pas
encore de numéro de version publié : le build **est** l'identité de la version.

### Stockage local
*Définition* — un espace où un site enregistre des données dans le navigateur.
*Dans Musculator* — l'unique endroit où vivent vos données. Voir
[Stockage local](../data/stockage-local.md).

### Contexte sécurisé (HTTPS)
*Définition* — une page servie par une connexion chiffrée.
*Dans Musculator* — exigé par la caméra et le GPS. En `http://` simple, les deux se
signalent comme indisponibles.

## Entraînement

### Séance guidée
La séance déroulée par l'application : phases d'effort et de repos enchaînées, séries
comptées. Voir [Séance guidée](../features/seance-guidee.md).

### Séance partielle
Une séance arrêtée avant la fin, enregistrée avec **seulement le travail réellement fait**.
Marquée en orange dans le journal et d'une icône de pause dans l'historique.

### Séance libre
Une séance ajoutée après coup sans programme : elle porte un nom, une date et une durée, mais
aucun exercice — donc aucune série, aucun muscle.

### Exercice seul (solo)
Une séance d'un seul exercice, lancée depuis une fiche. Elle n'a pas d'objectif de séries et
ne se termine que par *Terminer*.

### Série de jours (streak)
Le nombre de jours consécutifs comportant **au moins une séance enregistrée**. Une journée
sans séance la remet à zéro. ⚠️ La marche n'y entre pas.

### Schéma de mouvement
La famille gestuelle d'un exercice (poussée, fente, hinge, abduction…), qui sert à regrouper
la [bibliothèque](../features/bibliotheque.md).

### Sollicitation
L'intensité de travail récente d'un groupe musculaire, qui décroît avec les jours. Voir
[Cartographie](../features/cartographie.md).

### Séance complémentaire
Deux séances qui traitent les deux bouts d'une même chaîne (bassin et omoplates, par
exemple). Chacune renvoie vers l'autre en disant pourquoi.

### Optionnel
Un exercice de mollets, avancé, ou demandant un matériel spécifique. Masqué par défaut ;
le bouton *Mollets & avancés* le fait apparaître.

## Nutrition

### Score Musculation Quotidien
La note du jour sur 100 : protéines 40 pts, calories 40 pts, micronutriments 20 pts.

### Noté sur 80
Quand trop peu de micronutriments sont connus, leur part **sort du calcul** au lieu d'être
comptée à zéro. Un micronutriment absent est **inconnu, jamais zéro**.

### Macros (macronutriments)
Protéines, glucides et lipides. Leurs cibles sont calculées depuis le profil, ou imposées à
la main.

### Cible perso
Une cible quotidienne fixée à la main, qui remplace le calcul automatique. Un champ vide
reste calculé.

### CIQUAL
La table de composition nutritionnelle générique de référence en France (3 167 aliments),
**embarquée dans l'application** — c'est ce qui fait marcher la recherche hors ligne.

### Open Food Facts
Base de données alimentaire ouverte et **contributive** : elle couvre les produits de marque,
mais ses valeurs peuvent être incomplètes ou fausses.

### Mes aliments
Tous les aliments que vous avez déjà utilisés. Ils sont conservés sur l'appareil, proposés en
premier dans les recherches, et disponibles hors ligne.

### Pour 100 g
La forme sous laquelle les valeurs nutritionnelles sont stockées — jamais les totaux d'une
portion. C'est ce qui permet de modifier une quantité et de tout voir se recalculer.

### VNR
Valeurs Nutritionnelles de Référence pour adultes (règlement UE 1169/2011), utilisées comme
référence des micronutriments — sauf les fibres (30 g/jour).

### Métabolisme de base
Ce que le corps dépense au repos. Calculé depuis poids, taille, âge et sexe, puis multiplié
par un coefficient tiré de votre fréquence d'entraînement.

## Marche

### Net (calories)
Ce que la marche coûte **au-dessus** du métabolisme de repos. Compter le brut ferait compter
deux fois la dépense déjà contenue dans la cible calorique.

### MET
Unité de coût énergétique d'une activité. Utilisée quand une durée est enregistrée sans
distance ; une unité en est retranchée pour rester nette.

### Longueur du pas / cadence
Les deux quantités qui permettent de déduire une distance d'une durée. Elles dépendent de
votre taille et du type de marche.

## Analyse

### Moteur local
L'analyse calculée sur l'appareil, sans réseau. C'est le comportement par défaut, et le repli
de toute défaillance du moteur distant.

### OpenRouter
Passerelle vers de nombreux modèles de langage. Facultative ; elle exige **une clé et un
modèle**.

### Modèle gratuit
Un modèle à prix nul chez OpenRouter. La liste est **chargée en direct**, jamais figée : elle
change constamment.

### Non mesuré
Un thème de l'analyse des progrès sans données. Son poids **sort du score** plutôt que d'être
compté comme un échec.

## Aide

### Aide contextuelle
Le « ? » de la barre du haut : il répond « qu'est-ce que cet écran ? ».

### Tutoriel interactif
Un parcours où l'application **se déplace elle-même** d'écran en écran en mettant en évidence
l'élément dont parle l'étape. Ce n'est pas une vidéo.

### Bulle d'info
Une petite bulle près d'un chiffre à l'écran, qui répond à la question que ce chiffre pose sur
place.

### Diagnostic
Le récapitulatif technique joint à un message de support, **affiché avant l'envoi**. Il porte
des comptes, jamais leur contenu, et ne lit jamais la clé OpenRouter.
