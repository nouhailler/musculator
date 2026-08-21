---
titre: FAQ
description: Les 33 questions fréquentes de Musculator, dans les mêmes termes que dans l'application.
ordre: 9
---

# Questions fréquentes

Les mêmes 33 questions que dans le centre d'aide de l'application (menu ☰ →
*Aide, FAQ & support*), qui dispose d'une recherche.

**Catégories** : [Premiers pas](#premiers-pas) · [Séances & programmes](#seances-programmes) ·
[Nutrition](#nutrition) · [Marche](#marche) · [Données & sauvegarde](#donnees-sauvegarde) ·
[Installation & mises à jour](#installation-mises-a-jour) ·
[Confidentialité & IA](#confidentialite-ia)

---

## Premiers pas {#premiers-pas}

### Par où commencer ? {#par-ou-commencer}

Remplissez votre profil (poids, taille, âge, fréquence) — sans lui, les objectifs
nutritionnels sont forfaitaires — puis lancez une séance depuis l'Accueil ou choisissez un
programme. → [Bien démarrer](../getting-started/)

### Comment revoir le tutoriel ? {#refaire-tutoriel}

Profil → *Revoir le tutoriel*, ou centre d'aide → *Tutoriels*. Les 4 tutoriels sont
relançables indéfiniment. L'invitation de l'Accueil, elle, ne revient qu'une fois.
→ [Aide](../features/aide.md)

### Faut-il créer un compte ? {#compte-obligatoire}

Non. Il n'y a **ni compte ni serveur**. Tout reste sur votre appareil — ce qui veut aussi
dire que rien n'est récupérable si vous perdez l'appareil sans
[sauvegarde](../features/sauvegarde.md). → [Données](../data/)

### L'app fonctionne-t-elle sans réseau ? {#hors-ligne}

Oui, pour l'essentiel : séances, catalogue, journal, nutrition, marche, analyse locale, aide.
Seules la recherche de produits de marque, l'analyse IA distante et la recherche de mise à
jour demandent du réseau. ⚠️ Le **tout premier chargement** demande une connexion.
→ [Hors connexion](../offline/)

---

## Séances & programmes {#seances-programmes}

### J'ai arrêté ma séance en cours de route, est-elle perdue ? {#seance-partielle}

Non, si vous avez utilisé la croix → **Enregistrer et quitter** : les séries déjà faites vont
au journal, marquées « partielle ». ⚠️ En revanche, une application **fermée** pendant une
séance perd la séance : son état n'est pas enregistré.
→ [J'ai perdu ma séance](../troubleshooting/seance-perdue.md)

### Je me suis entraîné sans l'app, puis-je l'ajouter après coup ? {#seance-hors-app}

Oui. Journal → **Ajouter une séance** (avec date et heure réglables, même pour un jour
passé), ou **Ajouter des exercices** (aujourd'hui seulement, exercice par exercice).
→ [Journal](../features/journal.md)

### Pourquoi ne puis-je pas corriger les exercices d'une séance passée ? {#modifier-seance}

Parce que c'est la trace de ce que vous avez réellement fait. Les rendre modifiables
transformerait le journal en liste de souhaits, et tout ce qui en dépend — cartographie,
badges, analyses — les lit comme des faits. Seuls *quand*, *combien de temps* et le nom d'une
séance libre se corrigent. → [Journal](../features/journal.md)

### Puis-je créer mes propres séances ? {#creer-programme}

Oui : menu ☰ → *Créer une séance*. Choisissez vos exercices, réglez séries, répétitions,
charge, repos et ordre. → [Créer une séance](../features/creer-une-seance.md)

### Comment importer un programme fait par une IA ? {#programme-dicte}

Programmes → *Importer un programme dicté*. Copiez le prompt, donnez-le à Claude ou ChatGPT,
collez le JSON renvoyé. Le prompt embarque les 152 exercices de l'app pour que l'assistant
choisisse dedans plutôt que d'inventer.
→ [Programme dicté](../features/programme-dicte.md)

### Le coach vocal ne parle pas {#coach-vocal}

Vérifiez qu'il est activé (menu ☰), que le volume n'est pas coupé, et qu'une voix française
est installée sur le téléphone. Un navigateur sans synthèse vocale reste simplement
silencieux. → [Dépannage](../troubleshooting/coach-vocal-muet.md)

### Puis-je faire un seul exercice sans monter un programme ? {#exercice-seul}

Oui : ouvrez la fiche d'un exercice → **Faire cet exercice maintenant**. La séance n'a pas
d'objectif de séries ; seul *Terminer* la clôt et l'enregistre.
→ [Séance guidée](../features/seance-guidee.md)

### Comment fonctionne la série de jours ? {#serie-jours}

Elle compte les jours consécutifs avec **au moins une séance enregistrée**. Une journée sans
séance la remet à zéro. ⚠️ La marche n'y entre pas — ce n'est pas une séance.
→ [Progrès](../features/progres.md)

---

## Nutrition {#nutrition}

### Pourquoi mon score est-il noté sur 80 et non sur 100 ? {#score-sur-80}

Parce que trop peu de micronutriments étaient connus ce jour-là. Un micronutriment absent est
**inconnu, jamais zéro** : sa part sort du calcul plutôt que de vous pénaliser pour les
lacunes d'Open Food Facts. Les aliments génériques en portent presque toujours.
→ [Nutrition](../features/nutrition.md)

### Le scanner de code-barres ne s'ouvre pas {#scanner-marche-pas}

Il demande la permission caméra et une connexion sécurisée (HTTPS). Le message affiché
désigne la cause, et le code peut toujours être saisi à la main.
→ [Dépannage](../troubleshooting/scanner-ne-souvre-pas.md)

### D'où viennent mes objectifs de calories et de macros ? {#objectifs-calories}

Du métabolisme de base calculé depuis poids, taille, âge et sexe, multiplié par un
coefficient tiré de votre **fréquence d'entraînement déclarée**, puis ajusté par l'objectif
nutrition. Vous pouvez imposer vos propres cibles dans le profil ; un champ vide reste
calculé. → [Paramètres](../settings/#objectifs-quotidiens)

### Puis-je dicter mes repas au lieu de les saisir ? {#repas-dicte}

Oui : Nutrition → *Importer un repas dicté*. Décrivez vos repas à Claude ou ChatGPT avec le
prompt fourni, collez le JSON. ⚠️ Les valeurs viennent d'un modèle de langage : elles sont
approximatives. → [Repas dicté](../features/repas-dicte.md)

### Mon aliment est introuvable {#aliment-introuvable}

Scannez son code-barres, cherchez l'équivalent générique dans la table CIQUAL (disponible
hors ligne), ou saisissez-le à la main pour 100 g — il rejoindra « Mes aliments ».
→ [Dépannage](../troubleshooting/aliment-introuvable.md)

### Comment corriger une quantité déjà enregistrée ? {#corriger-quantite}

Touchez l'aliment dans le repas : la quantité se règle et toutes les valeurs se recalculent.
→ [Nutrition](../guide/nutrition.md)

---

## Marche {#marche}

### Pourquoi l'app ne compte-t-elle pas mes pas automatiquement ? {#pas-comptes}

⚠️ **Aucun comptage de pas en arrière-plan n'est possible pour une application web.** L'app ne
le simule pas : le suivi GPS est un acte explicite, application ouverte et écran allumé. Le
nombre de pas affiché est une **estimation** déduite de la distance.
→ [Marche](../features/marche.md)

### Comment la distance est-elle déduite de la durée ? {#distance-deduite}

Longueur du pas (votre taille × un coefficient de foulée, ajusté par le type de marche) ×
cadence de ce type de marche. Le détail du calcul est affiché. Une distance saisie l'emporte
toujours. → [Marche](../features/marche.md)

### Pourquoi les calories de la marche ne s'ajoutent-elles pas à ma cible ? {#marche-calories}

Parce que votre cible calorique contient **déjà** votre activité quotidienne, via le
multiplicateur tiré de votre fréquence. Les y ajouter compterait les mêmes kilomètres deux
fois. Elles sont affichées à côté. → [Marche](../features/marche.md)

---

## Données & sauvegarde {#donnees-sauvegarde}

### Comment sauvegarder mes données ? {#sauvegarde}

Profil → **Exporter mes données** : un fichier JSON. ⚠️ **Gardez-le ailleurs que sur le
téléphone.** C'est la seule copie qui puisse exister.
→ [Sauvegarde](../features/sauvegarde.md)

### Je change de téléphone, comment transférer mes données ? {#changer-telephone}

Exportez depuis l'ancien, installez l'app sur le nouveau, puis Profil → *Restaurer une
sauvegarde* → **Tout remplacer**. ⚠️ La clé OpenRouter n'est pas transportée (le modèle, si) :
ressaisissez-la. → [Sauvegarde](../features/sauvegarde.md)

### J'ai perdu mes données, sont-elles récupérables ? {#donnees-perdues}

⚠️ **Seulement si vous avez un fichier de sauvegarde.** Il n'y a ni compte ni serveur : aucune
copie n'existe ailleurs, et l'éditeur ne peut rien restaurer.
→ [Dépannage](../troubleshooting/donnees-disparues.md)

---

## Installation & mises à jour {#installation-mises-a-jour}

### Comment installer l'app sur mon téléphone ? {#installer}

Android : menu ⋮ du navigateur → *Installer l'application*. iOS : Safari → Partager → *Sur
l'écran d'accueil*. → [Installation](../getting-started/#installation-pwa)

### L'app ne se met pas à jour {#mise-a-jour}

Profil → *Vérifier les mises à jour*. Si la recherche n'aboutit pas, ce n'est **pas** « vous
êtes à jour » : réessayez, puis utilisez *Forcer le rechargement complet*, qui ne touche pas
à vos données. → [Dépannage](../troubleshooting/mise-a-jour-bloquee.md)

### Pourquoi la mise à jour est-elle refusée pendant une séance ? {#pendant-seance}

Parce qu'appliquer une mise à jour recharge l'application, et que la séance en cours ne vit
qu'en mémoire : elle serait perdue. La bannière se cache d'elle-même pendant une séance.
→ [Mise à jour](../features/mise-a-jour.md)

---

## Confidentialité & IA {#confidentialite-ia}

### Mes données sont-elles envoyées quelque part ? {#donnees-envoyees}

Par défaut, **non**. Trois cas seulement, tous déclenchés par vous : une recherche d'aliment
(Open Food Facts), une analyse IA **si** vous avez configuré une clé (OpenRouter), un message
au support (votre app mail). Aucun traceur, aucune publicité, aucun script tiers.
→ [Données](../data/)

### Que devient exactement ce que je saisis ? {#politique-confidentialite}

Tout est écrit dans le stockage local de votre navigateur, sous une clé unique, et n'en sort
pas. La politique de confidentialité de l'application décrit ce build champ par champ.
→ [Données](../data/) · [Informations légales](../legal/)

### Ma clé OpenRouter est-elle en sécurité ? {#cle-openrouter}

⚠️ **Elle est stockée en clair sur l'appareil** et envoyée directement à OpenRouter depuis le
navigateur : l'app n'a pas de serveur pour la garder. N'utilisez pas une clé partagée, et
fixez-lui une limite de dépense. Elle n'est **jamais exportée** dans une sauvegarde, ni lue
par le diagnostic de support. → [Paramètres](../settings/#cle-openrouter)

### À quel point l'analyse IA est-elle fiable ? {#analyse-fiable}

⚠️ **Elle ne remplace pas l'avis d'un professionnel de santé.** Le moteur local applique des
règles simples ; un modèle distant rédige à partir des mêmes faits, avec les approximations
d'un modèle de langage. Toute défaillance retombe sur le moteur local.
→ [Analyse IA](../features/analyse-ia.md)

### Comment contacter un humain ? {#contacter-support}

Centre d'aide → *Contacter le support*, ou Profil → *Contacter le support*. Le message part
vers **contact@swinux.ch** depuis votre app mail, avec un diagnostic **affiché avant
l'envoi**. → [Support](../support/)

### Où sont les mentions légales ? {#mentions-legales}

Menu ☰ → *Mentions légales*, ou Profil. La politique de confidentialité est un document
séparé, au même endroit. → [Informations légales](../legal/)
