---
titre: Sauvegarde et restauration
description: Exporter ses données dans un fichier et les restaurer — la seule copie possible, car il n'y a aucun serveur.
ordre: 18
---

# Sauvegarde et restauration

## Description
Un export de **toutes** les données persistées dans un fichier JSON, et sa relecture, en
fusion ou en remplacement.

## Objectif
⚠️ **C'est la seule copie de vos données qui puisse exister.** L'application n'a ni compte ni
serveur : un navigateur nettoyé, une application désinstallée ou un téléphone changé, et le
journal disparaît définitivement.

## Prérequis
Aucun.

## Comment l'utiliser

**Exporter** — Menu ☰ → *Profil* → *Sauvegarde de mes données* → **Exporter mes données**.
Gardez le fichier **ailleurs que sur le téléphone**.

**Restaurer** — *Restaurer une sauvegarde* → choisissez le fichier. Un résumé s'affiche
(séances, séances perso, jours de nutrition, jours de marche, notes, profil) **avant** toute
écriture. Puis :

| Mode | Effet |
|---|---|
| **Fusionner** | Ajoute ce qui manque sans rien perdre de ce qui est là, et **garde votre profil actuel** |
| **Tout remplacer** | Écrase les données de cet appareil par celles du fichier |

## Options
L'export essaie trois voies, dans cet ordre :

1. **La feuille de partage** — sur une app installée sur iOS, un lien de téléchargement ne
   fait souvent rien du tout ; le partage atteint Fichiers et Mail.
2. **Le téléchargement** classique.
3. **Le presse-papier**, en dernier recours, pour que les données puissent toujours sortir.

L'écran dit laquelle a été utilisée.

## Paramètres associés
Aucun.

## Données utilisées
Les 14 tranches persistées : profil, séances perso, journal de séances, acceptation légale et
sa version, coach vocal, tutoriel vu, réglages OpenRouter, journal nutrition, cache
d'aliments, thème, notes du jour, analyses en cache, journal de marche.

⚠️ **La clé OpenRouter est exclue de l'export** — une sauvegarde se promène, pas un secret. Le
**modèle** choisi est conservé, et une restauration garde la clé déjà présente sur l'appareil.

## Résultat
Un fichier JSON lisible, daté, portant l'identifiant du build qui l'a produit.

## Fonctionnement hors connexion
Identique — tout se passe sur l'appareil.

## Fonctionnement en ligne
Identique.

## Limites
- **Aucune sauvegarde automatique. Aucune synchronisation.** L'export est un geste manuel, à
  refaire de temps en temps.
- **Rien ne rappelle de le faire.**
- Une donnée de forme inattendue dans le fichier est **ignorée et nommée**, jamais chargée
  telle quelle.
- La fusion réunit les journaux par identifiant d'entrée et laisse les réglages tranquilles :
  un appareil garde son propre profil.
- « Tout remplacer » est irréversible.

## Erreurs possibles

| Message | Cause |
|---|---|
| « Fichier illisible : ce n'est pas du JSON valide. » | Fichier corrompu ou tronqué |
| « Fichier vide ou inattendu. » | Contenu non exploitable |
| « Ce fichier n'est pas une sauvegarde Musculator. » | Autre format |
| « Sauvegarde vide : aucune donnée exploitable. » | Aucune tranche reconnue |

## Dépannage
[J'ai perdu mes données](../troubleshooting/donnees-disparues.md)

## FAQ
- [Comment sauvegarder mes données ?](../faq/#sauvegarde)
- [Je change de téléphone, comment transférer mes données ?](../faq/#changer-telephone)
- [J'ai perdu mes données, sont-elles récupérables ?](../faq/#donnees-perdues)
