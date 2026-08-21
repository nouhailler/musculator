---
titre: Programme dicté
description: Faire composer un plan d'entraînement par Claude ou ChatGPT à partir du catalogue de l'app, puis l'importer.
ordre: 4
---

# Programme dicté

## Description
Un prompt à donner à un assistant conversationnel, et un lecteur de la réponse. Chaque séance
du plan devient une séance perso ordinaire.

## Objectif
Obtenir un programme adapté à une demande précise (« 3 séances par semaine, haltères
uniquement, épaule droite fragile ») sans le composer exercice par exercice.

## Prérequis
- Un accès à Claude, ChatGPT ou un assistant équivalent, **en dehors de l'application**.
- Aucune clé API, aucun réglage : l'application ne parle à aucun assistant.

## Comment l'utiliser
1. Onglet *Programmes* → **Importer un programme dicté**.
2. Copiez le prompt fourni.
3. Collez-le à l'assistant, décrivez ce que vous voulez.
4. Copiez le JSON renvoyé, collez-le dans le champ.
5. Vérifiez l'aperçu, puis importez.

## Options
Le prompt peut être installé une fois pour toutes en instructions d'un Projet Claude ou d'un
GPT personnalisé. **S'il dépasse la limite de taille du champ d'instructions**, collez-le en
premier message d'une conversation normale — le résultat est le même.

`PROMPT-PROGRAMME.md`, à la racine du dépôt, est le même prompt sous forme de fichier.

## Paramètres associés
Aucun.

## Données utilisées
**Aucune donnée ne quitte l'appareil.** Vous copiez un texte, vous allez le coller ailleurs,
vous revenez avec la réponse. **Écriture** : une ou plusieurs entrées dans `customWorkouts`.

## Résultat
Des séances perso indiscernables de celles créées à la main.

## Fonctionnement hors connexion
L'écran et l'import fonctionnent hors ligne. Seul l'aller-retour avec l'assistant, qui a lieu
dans une autre application, demande du réseau.

## Fonctionnement en ligne
Identique.

## Limites
- **Le prompt embarque les 152 exercices de l'application** pour que l'assistant choisisse
  dedans plutôt que d'inventer : un exercice inventé n'aurait ni démo, ni coach vocal, ni
  place dans la cartographie musculaire.
- **Substitution** — un mouvement absent est remplacé par le plus proche travaillant le même
  muscle, à condition que l'assistant ait nommé ce muscle. L'aperçu affiche chaque
  substitution.
- Un exercice ni reconnu ni substituable est ignoré et signalé.
- L'assistant peut se tromper : l'aperçu est là pour être lu avant d'importer.

## Erreurs possibles

| Message | Cause |
|---|---|
| « Colle d'abord le JSON généré. » | Champ vide |
| « Aucun JSON trouvé — vérifie le copier-coller. » | Aucun objet JSON dans le texte |
| « JSON invalide — vérifie que le bloc a été copié en entier. » | Copie tronquée |
| « Ce JSON n'est pas au format Musculator. » | Structure étrangère |
| « Aucune séance trouvée. Attendu : { "seances": [ { "exercices": [...] } ] }. » | Format attendu absent |
| « Aucune séance exploitable. » | Rien n'a survécu à la résolution |

## Dépannage
[Mon import est refusé](../troubleshooting/import-refuse.md)

## FAQ
- [Comment importer un programme fait par une IA ?](../faq/#programme-dicte)
