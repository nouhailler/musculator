---
titre: Repas dicté
description: Décrire ses repas à Claude ou ChatGPT et importer le JSON produit, avec résolution des valeurs manquantes.
ordre: 14
---

# Repas dicté

## Description
Un prompt à donner à un assistant, et un lecteur du JSON renvoyé. Les repas décrits à voix
haute deviennent des entrées ordinaires du journal alimentaire.

## Objectif
Consigner un repas composé sans chercher chaque ingrédient un par un.

## Prérequis
Un accès à un assistant conversationnel, **en dehors de l'application**. Aucune clé, aucun
réglage.

## Comment l'utiliser
1. Nutrition → *Importer un repas dicté*.
2. *Comment générer ce JSON ?* → copiez le prompt.
3. Donnez-le à l'assistant et décrivez vos repas.
4. Collez le JSON, **vérifiez l'aperçu**, importez.

## Options
- Le prompt peut être installé une fois en instructions d'un Projet Claude ou d'un GPT
  personnalisé ; ensuite il suffit de dicter.
- **Remplacer** ne vide que les repas présents dans l'import ; il ne remet pas la journée
  à zéro.
- `PROMPT-REPAS.md`, à la racine du dépôt, est le même prompt sous forme de fichier.

## Paramètres associés
Aucun.

## Données utilisées
**Aucune donnée ne quitte l'appareil** : l'échange avec l'assistant a lieu dans une autre
application. **Écriture** : `nutriLog`, et `foodCache` pour les aliments nouveaux.

## Résultat
Le format demande **le poids de la portion + les valeurs pour 100 g**, jamais les totaux de
la portion : c'est la forme que le journal stocke, donc la quantité reste modifiable et se
recalcule comme n'importe quelle autre entrée.

Un aliment nommé sans valeurs est résolu **d'abord dans vos propres aliments**, puis dans la
table CIQUAL. L'aperçu affiche la source retenue sous chaque aliment.

## Fonctionnement hors connexion
L'import fonctionne entièrement hors ligne (la résolution lit des données locales). Seul
l'aller-retour avec l'assistant demande du réseau, dans une autre application.

## Fonctionnement en ligne
Identique.

## Limites
- ⚠️ **Les valeurs viennent d'un modèle de langage, pas d'une table officielle.** Elles sont
  approximatives et à vérifier si un aliment compte vraiment.
- **Vérifiez la source affichée** : la table CIQUAL n'a pas de « chocolat noir » simple et ne
  distingue pas toujours cru et cuit.
- **Une quantité qui n'est pas en grammes est ramenée à 100 g** et signalée : « 3 figues »
  devient 100 g. C'est faux, mais visiblement faux et corrigeable en un geste.
- **Un micronutriment écrit à 0 par le modèle est ignoré** : aucun aliment réel n'est
  exactement à zéro fer ou calcium, et un zéro inventé serait compté comme une valeur connue.
  Les fibres font exception et gardent leur zéro — viande, œufs et laitages y sont vraiment.
- Un aliment ni composé ni résolu est **ignoré et nommé** dans un avertissement.
- Rien n'est enregistré avant que vous ayez vu l'aperçu.

## Erreurs possibles

| Message | Cause |
|---|---|
| « Colle d'abord le JSON généré. » | Champ vide |
| « Aucun JSON trouvé — vérifie le copier-coller. » | Aucun objet JSON |
| « JSON invalide — vérifie que le bloc a été copié en entier. » | Copie tronquée |
| « Ce JSON n'est pas au format Musculator. » | Structure étrangère |
| « Aucune date exploitable. » | Aucune date lisible |

## Dépannage
[Mon import est refusé](../troubleshooting/import-refuse.md)

## FAQ
- [Puis-je dicter mes repas au lieu de les saisir ?](../faq/#repas-dicte)
