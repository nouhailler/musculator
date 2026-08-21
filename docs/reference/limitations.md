---
titre: Limites connues
description: Ce que Musculator ne fait pas, ce qu'elle ne peut pas faire, et pourquoi.
ordre: 5
---

# Limites connues

Rien ici n'est masqué. Certaines limites sont des choix, d'autres des contraintes du
navigateur ; les deux sont dites.

## Données — les plus importantes

- ⚠️ **Aucune sauvegarde automatique, aucune synchronisation, aucun serveur.** Vos données
  n'existent qu'à un seul endroit. [L'export](../features/sauvegarde.md) est manuel, et
  **rien ne rappelle de le faire**.
- ⚠️ **Désinstaller l'application ou effacer les données de site supprime tout,
  définitivement.** L'éditeur ne peut rien restaurer.
- ⚠️ **Un navigateur peut libérer le stockage de sa propre initiative**, en particulier sur
  iOS quand une PWA n'est pas ouverte pendant plusieurs semaines.
- **Aucun partage entre appareils** autrement que par un fichier de sauvegarde.
- ⚠️ **La clé OpenRouter est stockée en clair** : l'application n'a pas de serveur pour la
  garder. Elle est lisible par ce qui a accès à l'appareil.

## Séance

- ⚠️ **Une séance en cours n'est pas enregistrée** : elle ne vit qu'en mémoire. Fermer l'app
  ou recharger la page la perd. C'est aussi pourquoi une mise à jour y est refusée.
- **Pas de suivi charge par charge** : ce qui est enregistré est un total de séries par
  exercice.
- **L'écran n'est pas maintenu allumé** pendant une séance.
- **Les calories d'une séance sont un forfait à la durée** (9 kcal/min), pas une mesure.

## Journal et historique

- **Le Journal ne montre qu'aujourd'hui** ; le passé s'atteint depuis les Progrès.
- ⚠️ **Exercices, séries et muscles d'une séance ne sont pas modifiables** — c'est délibéré :
  le journal est une trace, pas une liste de souhaits. Seuls *quand*, *combien de temps* et
  le nom d'une séance libre se corrigent.
- **Une séance ajoutée après coup depuis un programme est supposée faite comme prescrit.**
- **Ajouter des exercices** ne permet pas de choisir la date.

## Marche

- ⚠️ **Aucun comptage de pas en arrière-plan n'est possible pour une PWA.** Le suivi GPS ne
  tourne que l'application ouverte, écran allumé. Le nombre de pas affiché est une
  **estimation**.
- **La précision GPS dépend du matériel et de l'environnement** ; les points imprécis sont
  filtrés, ce qui peut sous-estimer une marche très lente.
- **Aucun trajet n'est enregistré** — c'est un choix de confidentialité, mais il signifie
  qu'on ne peut pas revoir un parcours.
- **La marche ne compte pas comme une séance** : ni série de jours, ni « séances au total ».

## Nutrition

- **Les micronutriments manquent souvent** sur les produits de marque — d'où les journées
  notées sur 80.
- **La table CIQUAL ne distingue pas toujours cru et cuit**, et n'a pas d'entrée pour tous les
  plats.
- **Open Food Facts est contributif** : ses valeurs peuvent être incomplètes ou fausses.
- **Les références de micronutriments ne sont pas personnalisées** (VNR adultes de l'UE).
- **Ce n'est pas un bilan énergétique** : ni la dépense de repos ni la marche n'entrent dans
  la cible calorique.
- ⚠️ **Les valeurs d'un repas dicté viennent d'un modèle de langage**, pas d'une table
  officielle. Une quantité qui n'est pas en grammes est ramenée à 100 g et signalée.

## Analyses IA

- ⚠️ **Elles ne remplacent pas l'avis d'un professionnel de santé.**
- **L'analyse distante envoie des données de santé** (prénom, poids, taille, âge, blessures)
  vers OpenRouter. Sans clé, rien ne part.
- **Les modèles gratuits sont soumis à des quotas** et peuvent disparaître de l'offre.
- **Certains modèles honorent mal la consigne « JSON seulement »** ; la sortie est validée, et
  toute défaillance retombe sur le moteur local.
- **L'analyse des progrès n'est jamais mise en cache** : elle est recalculée — et refacturée —
  à chaque fois.
- **La fenêtre est fixe** : 4 semaines contre les 4 précédentes, rien de plus long.

## Démos animées

- ⚠️ **Un mouvement dont le plan est perpendiculaire à l'écran ne peut pas être dessiné.** La
  rétraction des omoplates montre sa conséquence visible plutôt que le mouvement.
- **Un maintien n'a pas de tempo** : les étirements et gainages bougent de quelques degrés.
- **Une rotation continue ne peut pas boucler** : les cercles de bras montrent l'amplitude
  balayée, pas un tour complet.
- Les démos sont **schématiques**, en vue de profil : des repères, pas une démonstration
  filmée.

## Interface et navigation

- **Aucune adresse par écran** : rien n'est partageable par lien, et le bouton Retour
  d'Android quitte l'application (sauf dans la modale d'avertissement).
- **Les filtres ne sont pas mémorisés.**
- **Deux thèmes seulement**, pas de couleur d'accent ni de contraste renforcé.
- **Interface en français uniquement** — aucune autre langue n'est prévue.
- **Portrait mobile** : l'application n'est pas dessinée pour le paysage ni pour un grand
  écran.

## Application

- ⚠️ **Le premier chargement demande du réseau.**
- **Une mise à jour ne s'applique qu'au redémarrage** — c'est le comportement d'une app
  installée.
- **Le numéro de version est un identifiant de build**, pas un numéro sémantique.
- **Aucune notification** : l'application ne rappelle rien, jamais.
- **Aucune intégration** avec Apple Santé, Google Fit, Strava ou un objet connecté, sauf
  l'import manuel d'un fichier.
- **Aucun compte, donc aucun partage, aucun coach, aucun social.**

## Assurance qualité

- **Il n'existe aucune suite de tests unitaires** dans le projet. Les vérifications
  automatisées sont le linter, un contrôle d'intégrité du catalogue, un parcours de test des
  écrans légaux, et un parcours de fumée manuel.
- Ce que cela signifie pour la documentation : les comportements décrits ici sont lus dans le
  **code source**, pas confirmés par des tests.

Voir [Compatibilité](compatibility.md) · [Hors connexion](../offline/) · [Données](../data/)
