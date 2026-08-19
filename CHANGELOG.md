# Changelog

All notable changes to Musculator are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project has no released versions yet (`package.json` is at `0.0.0`), so entries are
grouped by date and reference the commit they landed in.

## [Unreleased]

### Added

- **Six exercices « autonomie » et un programme « Sarcopénie & autonomie »** — la fonte
  musculaire liée à l'âge (~3 à 5 % de masse par décennie à partir de 30-40 ans, davantage
  passé 60 ans) se reprend par la résistance, encore faut-il une porte d'entrée.
  - Marche sur place genoux hauts, cercles de bras, lever de chaise (sit-to-stand), pompes
    contre un mur, équilibre sur une jambe et étirement des quadriceps debout. Le catalogue
    partait d'un corps déjà capable d'un squat complet et d'une pompe au sol : ces six-là sont
    le barreau du dessous des familles existantes, et leur version difficile est toujours un
    autre exercice du catalogue plutôt qu'une charge en plus.
  - **L'équilibre unipodal entre au catalogue au même titre que la force** : la prévention des
    chutes est la moitié du problème après 60 ans, et rien ne l'entraînait.
  - Le programme contient son échauffement et ses étirements — les deux étapes qu'on saute
    ailleurs et qu'ici on ne peut pas — et prescrit ses propres doses (2-3 séries de 8-12,
    plus courtes que les fiches) via `custom`. La marche quotidienne recommandée en complément
    reste dans l'onglet Activité : ce n'est pas une séance, et elle ne doit gonfler ni la série
    ni les badges.
  - **Une rotation complète ne peut pas boucler dans une démo** : les frames interpolent les
    angles linéairement, donc la somme des segments d'une boucle vaut zéro et un tour entier
    reviendrait en arrière à triple vitesse sur le dernier quart. Les cercles de bras montrent
    donc l'amplitude que le cercle balaye, pas le cercle — même limite assumée que la
    rétraction scapulaire.

- **Cinq exercices d'avant-bras et un programme « Syndrome de la souris »** — les TMS du
  membre supérieur côté bureau : contraction statique, micro-répétitions, poignet en extension.
  - Étirement des extenseurs, des fléchisseurs, du pouce (Finkelstein modifié), ouverture des
    doigts à l'élastique et auto-massage de l'avant-bras. Le catalogue avait du renforcement
    lourd d'avant-bras (wrist curls, grip, wrist roller) et rien pour un tendon déjà irrité :
    ces cinq-là relâchent et rééquilibrent au lieu de charger.
  - **Les drapeaux rouges sont dans les fiches, pas seulement dans la description** :
    fourmillements nocturnes, perte de force, poignet gonflé ou chaud renvoient à un examen
    dans le champ `surcharge` des étirements concernés — c'est là qu'on les lit au moment de
    faire le geste.
  - `Avant-bras` manquait dans le pont `ZONES` depuis le début : une séance de grip ne comptait
    pour aucune zone du profil. Elle compte maintenant pour « Bras », avec les trois noms que
    les nouveaux exercices ajoutent.
  - **`complement` devient une liste.** Les trois séances correctives — omoplates, bassin,
    souris — sont les bouts d'une même chaîne, pas une paire : « Omoplates & nuque » en affiche
    désormais deux. `check-catalogue` vérifie toujours la réciprocité, plus l'absence de
    doublon dans la liste.

- **Deux séances qui se renvoient l'une à l'autre** — « Bascule du bassin » et « Omoplates &
  nuque » traitent les deux bouts d'une même chaîne, et chacune l'annonce désormais dans
  l'app.
  - Un programme peut nommer sa `complement: { id, raison }`. La carte, sous la liste des
    exercices, ouvre l'autre séance et dit *pourquoi* elles vont ensemble — un « voir aussi »
    sans raison n'aurait rien apporté à quelqu'un qui s'apprête à s'entraîner.
  - **Le lien est symétrique et vérifié** : `check-catalogue` refuse une cible inexistante, un
    renvoi vers soi-même, une raison manquante et un lien à sens unique. Rien à l'exécution ne
    remarquerait une paire déclarée d'un seul côté.
  - Au passage, le bouton « Démarrer ce programme » était en `position: absolute; bottom: 0`
    dans l'overlay *scrollable* : il se plaçait à la fin du contenu, pas en bas de l'écran, et
    recouvrait donc le dernier élément dès qu'on en ajoutait un. Il est maintenant `sticky`
    dans une colonne flex — collé en bas d'un programme court, visible pendant qu'on fait
    défiler un programme long, et il ne passe plus devant rien.

- **Trois exercices de bassin et un programme « Bascule du bassin »** — le versant bas de la
  même posture : un bassin en antéversion creuse les lombaires, et le haut du dos s'arrondit
  pour compenser.
  - **Ce qui manquait** : la rétroversion du bassin — le mouvement de contrôle lui-même, qu'il
    faut réapprendre avant tout le reste — l'étirement du psoas en chevalier servant, et la
    posture de l'enfant. Le renforcement, lui, existait déjà : le programme réutilise
    `glute-bridge`, `dead-bug` et `gainage` plutôt que d'en refaire des variantes.
  - **Le psoas entre sur la carte musculaire** (20 muscles) : il commande la bascule du bassin
    et aucune zone ne le touchait. Au passage, `Lombaires` manquait dans le pont `ZONES` —
    une séance de lombaires ne comptait pour aucune zone du profil ; elle compte maintenant
    pour « Dos ».
  - **Un programme du catalogue peut désormais prescrire ses propres doses.** `customFor()`
    dans `lib/workout.js` exigeait `isCustom`, donc seules les séances créées par l'utilisateur
    pouvaient surcharger séries et répétitions : le pont fessier serait parti à 3 × 20 là où la
    séance en demande 12, et la planche à 45 s au lieu de 25. Le garde-fou est levé —
    `isCustom` continue de dire « faite par l'utilisateur », et un programme sans `custom`
    retombe sur la fiche comme avant.

- **Quatre exercices de posture, trois muscles, et un programme « Omoplates & nuque »** — le
  travail correctif de la ceinture scapulaire, monté sur ce que le catalogue avait déjà.
  - **Ce qui manquait vraiment** : chin tuck (placement du cou), rétraction scapulaire
    (serrage isométrique de 5 s), et les deux étirements sans lesquels renforcer le dos revient
    à tirer sur une corde des deux côtés — pectoral au cadre de porte, élévateur de la scapula.
    Le catalogue n'avait aucun étirement jusqu'ici. Les raises et le scapular push-up, eux,
    existaient déjà (`prone-t-raise`, `prone-w-raise`, `trap-3-raise`, `scapular-push-up`) : le
    programme les réutilise plutôt que d'en ajouter des doublons.
  - **Trois muscles n'avaient aucune zone** alors que les mouvements existaient — `dentele`
    était même le `primaire` du scapular push-up sans muscle correspondant. `rhomboides` (entre
    les omoplates), `dentele` (sous l'aisselle, sur les côtes) et `cou` (nuque) ont maintenant
    leur zone sur la carte, et leurs noms sont entrés dans le pont `ZONES` : sans ça, une séance
    de posture ne comptait pour aucune zone du profil et l'analyse des progrès la lisait comme
    non mesurée.
  - **Le programme est correctif, pas de développement** : charge nulle, volume faible, deux
    étirements en fin de séance, et il se refait tous les jours là où les autres demandent
    48 h. Sa description dit aussi ce que l'app ne fait pas : une douleur qui persiste, irradie
    ou réveille la nuit relève d'un examen, pas d'un programme — le même garde-fou est écrit
    dans le champ `surcharge` du chin tuck et de l'étirement du cou.

- **Un centre d'aide dans l'app** — aide, FAQ, tutoriels et support, sans jamais avoir à en
  sortir. Nouvel overlay `help`, joignable depuis le menu, depuis le profil (« Aide &
  support ») et depuis le pied de la feuille d'aide contextuelle.
  - **Une recherche, trois corpus** (`lib/helpSearch.js`) : la FAQ, les guides d'écran de
    `data/help.js` et les tutoriels sont indexés ensemble, parce que l'utilisateur ne sait pas
    dans lequel des trois se trouve sa réponse. Accents et casse sont retirés des deux côtés —
    « seance partielle » trouve « Séance partielle » — et chaque mot tapé restreint la
    recherche par préfixe, donc « micro » trouve encore « micronutriments » pendant la frappe.
    Un extrait est découpé autour de la première correspondance, pour que la liste dise
    *pourquoi* un résultat est là.
  - **31 questions fréquentes** en 7 catégories (`data/faq.js`), écrites comme elles seraient
    tapées et répondant sur le comportement réel : pourquoi le score est noté sur 80, pourquoi
    les exercices d'une séance passée ne se réécrivent pas, pourquoi aucune PWA ne compte les
    pas en arrière-plan. Chaque réponse peut porter un lien vers l'écran concerné, vérifié par
    `check-catalogue`.
  - **4 tutoriels interactifs** (`data/tours.js`, `components/Tour.jsx`) : pas un diaporama —
    chaque étape *est* un endroit de l'app. La navigation se fait dans le reducer
    (`applyTourStep`), donc l'écran affiché et l'index de l'étape ne peuvent pas diverger, et
    un projecteur (`data-tour`) éclaire l'élément dont parle l'étape. Une invitation apparaît
    une fois sur l'accueil (nouvelle tranche persistée `tourDone`, posée aussi bien par
    « Plus tard » que par le tutoriel lui-même) ; les tutoriels restent relançables pour
    toujours depuis le centre d'aide.
  - **Tooltips contextuels** (`data/tips.js`, `components/Tip.jsx`) : un `(i)` à côté du
    chiffre qui pose la question — score du jour, cibles perso, séance partielle, distance
    déduite, source de l'analyse, micronutriments manquants, sollicitation et surcharge d'un
    exercice. La bulle est positionnée depuis le rect du bouton, jamais dans le flux : chaque
    endroit où un tip est utile est une ligne serrée qu'une bulle en flux ferait sauter.
  - **Contact support** (`lib/diagnostics.js`) vers `contact@swinux.ch`, avec version, build,
    appareil, système, navigateur, mode d'affichage, écran, langue, réseau, thème et *volume*
    de données joints automatiquement — et affichés en entier avant l'envoi. Rien de personnel
    n'y figure (des compteurs, jamais du contenu) et la clé OpenRouter n'est jamais lue. Le
    `mailto:` échoue silencieusement sur un appareil sans compte mail, donc le message complet
    part aussi dans le presse-papier et l'écran le dit.
  - **L'aide de la séance guidée passe par la pause**, pas par un « ? » flottant : la barre du
    haut se cache pendant une séance par choix, et un bouton près de « Série terminée » se
    ferait toucher par erreur. La pause — où rien ne tourne déjà — ouvre un panneau
    « Reprendre / Aide sur la séance guidée / Quitter », et la feuille d'aide y perd son lien
    vers le centre d'aide : celui-ci est un overlay, il remplacerait la vue de la séance alors
    que celle-ci continuerait de tourner en mémoire, sans chemin de retour. `START_TOUR` est
    refusé pour la même raison pendant une séance.
  - `check-catalogue` couvre désormais ce contenu : ids de FAQ uniques, catégories et icônes
    connues, liens et étapes pointant vers un écran qui existe, ancre `data-tour` réellement
    présente dans le source, tip défini mais jamais rendu — et, enfin, **chaque écran a son
    entrée d'aide**, l'invariant que `CLAUDE.md` documentait sans que rien ne le vérifie.

- **Step count on "Marche du jour"** — the Journal's walking card now shows an estimated
  step count alongside km/kcal/minutes. Steps are derived, not stored: `dayActivity()` turns
  each entry's distance (or duration, when that's all it has) back into steps using the same
  height- and gait-based step length `estimateFromDuration` already uses, so a GPS-tracked or
  manually-entered walk reads a plausible step count without the app pretending to have a
  pedometer.

- **"Ajoutez des exercices" in the Journal** — a third way to log a session after the fact,
  alongside picking a whole program or a free-form entry: pick exercises one at a time from
  the full catalogue and state series, reps and (optionally) a charge for each yourself,
  since there is no per-set tracking outside a live workout to draw them from otherwise.
  Always logs to today — for a past day, "Ajouter une séance" still covers that. Stores a new
  `exercisesDetail` field on the sessionLog entry (tolerated as absent everywhere else, per
  the sessionLog convention) so the journal card shows what was actually done — exercise,
  series, reps, charge — rather than just the exercise names a program-based entry shows.
  Duration/kcal are estimated the same way a solo exercise session already is: series ×
  (rest + ~40s of work), summed across the picked exercises.

### Changed

- **Journal layout: "Ajoutez des exercices" at the top, "Analyse IA de ma journée" at the
  bottom** — the new button opens right under the intro line, and the AI-analysis trigger
  (plus its results once run) moved from mid-screen to the very end, after the notes field,
  so the whole day (food, walking, sessions, notes) is logged before analysing it rather than
  interrupting that flow partway through.

### Changed

- **Muscle-map silhouette: angled arms, fingered hands, hair on both genders** — a
  follow-up to the tapered-body-outline pass, refined against two reference images the user
  supplied (neither copied — the first carried a commercial watermark, the second's license
  couldn't be confirmed either, so both are matched by eye as original artwork rather than
  traced). Arms are now a shoulder-then-elbow chain, each a small independent rotation, so
  they curve gently away from the torso instead of hanging flush against it or swinging out
  as one rigid rotated bar; hands are a palm plus four short finger stubs instead of a bare
  circle (individually-rotated fingers were tried first and looked like the hand was melting
  at 18px on screen — short parallel stubs read cleanly instead). Both Homme and Femme now
  get a hair silhouette matched to the reference — shoulder-length strands for Femme, a
  short cropped cap for Homme — since a bare head reads as male by default at this size;
  Autre stays bare rather than asserting either. Every hair shape is authored once as its
  right half and mirrored via an SVG transform, so the two sides can't drift out of
  symmetry. `FRONT_ZONES`/`BACK_ZONES` click targets are untouched and verified still
  correct on every limb and both sides; the zone rectangles don't move with the arm bend or
  the slightly-narrowed leg stance, a minor cosmetic misalignment left as-is rather than
  restructuring how zones hit-test.

### Changed

- **Cartographie musculaire: a real body silhouette instead of blocks, and it now matches
  `profile.sexe`** — the outline used to be flat rectangles (one uniform bar per limb, a single
  torso block); it's now a tapered torso path (shoulders/waist/hips as a genuine curve) plus
  two-segment arms and legs (upper-arm/forearm, thigh/calf) with hands and feet, so it reads as
  a body rather than a mannequin. Shoulder/waist/hip proportions come from `profile.sexe` —
  Homme skews shoulders-wider-than-hips, Femme the reverse, and Autre (or anything unset) gets
  the midpoint of the two rather than silently defaulting to Homme, the same way `macros.js`
  already gives 'Autre' its own BMR term instead of folding it into one of the other two. The
  clickable muscle zones (`FRONT_ZONES`/`BACK_ZONES`) are untouched — only the silhouette drawn
  behind them changed, verified by clicking into a zone on every limb and both sides.

- **Dictated-program prompt shrunk by ~30%, and its length-limit workaround documented** — the
  embedded catalogue tripled in size over three PRs (45 → 104 → 132 exercises) without the
  prompt format changing, and it's now long enough to get rejected by a ChatGPT Project's
  instructions field. `niveau` and `mat` are closed vocabularies, so `programPrompt.js` now
  codes them down to one letter each (with the legend spelled out once above the table) and
  switches the field separator from ` · ` to `|` — `id` and `nom` stay in full, since one is
  the literal value the output JSON echoes back and the other is what a request's wording
  actually matches against. 14 760 → 10 418 characters. Independently of the size, the
  in-app help, the "Comment générer ce JSON ?" panel and `PROMPT-PROGRAMME.md` now all say
  what to do when a project's instructions field refuses the prompt anyway: paste it as a
  first message in a normal conversation instead, which the meal-import prompt's docs already
  said and the program one never did.

### Added

- **Reverse crunch (hip lift) and Up-down plank** — two more core exercises, added so a
  dictated program naming either of them (as opposed to a hip-flexion leg raise or a static
  plank) resolves to an exact catalogue match instead of a substitution. `reverse-crunch`
  curls the pelvis toward the ribs rather than the ribs toward the pelvis, the inverse of the
  standard crunch; `up-down-plank` alternates forearm/hand support without letting the hips
  roll, an anti-rotation demand the static plank doesn't have. Both carry a full sheet, an
  animated demo, voice cues and a body-map reference (abdos, and obliques for the plank).

### Fixed

- **`optionnel` rescoped past the lower body, and every hardcoded exercise count updated** —
  `optionnel` used to mean "outside the thighs/glutes focus"; now that the catalogue spans the
  whole body, that framing no longer matched what it gated (calves and five advanced lower-body
  lifts, while dozens of new upper-body/core entries stayed unfiltered by default regardless of
  how niche or demanding). It now means "needs specialised kit or a skill/strength ceiling above
  the rest of its family", so it can mark an entry in any muscle group: `reverse-hyperextension`
  and `wrist-roller` need a bench/roller most people don't own, `toes-to-bar` and `hanging
  windshield wipers` assume real bar-hang strength past `hanging-leg-raise`, `ab-wheel-rollout`
  is flagged in its own `surcharge` as one of the most demanding core movements in the
  catalogue. The Bibliothèque's "Hors focus cuisses / fessiers" filter label — misleading once
  it was hiding movements that had nothing to do with legs — is now "Avancés & matériel
  spécifique". Also fixed: four places (`help.js` ×2, `ImportProgram.jsx`, `README.md`) still
  said "104 exercices" after the catalogue grew to 130; the two in-app ones now read
  `EXERCISES.length` instead of a hardcoded number so this can't happen again.

### Added

- **Catalogue étendu à 130 exercices** — 26 new entries filling gaps identified across the
  muscle map, each with a full sheet, an animated demo, voice cues and a body-map reference:
  grand dorsal (tirage horizontal élastique assis, traction supination/neutre/négative,
  traction assistée à l'élastique, straight-arm pulldown élastique, pulldown à genoux
  élastique), trapèzes (trap-3 raise, prone T-raise, prone W-raise, scapular push-up,
  scapular pull-up), lombaires (suitcase carry, reverse hyperextension), abdominaux suspendus
  (hanging knee/leg raise, toes-to-bar, hanging windshield wipers, ab wheel rollout), mollets
  (seated tibialis raise, pogo jumps), moyen fessier (step-down latéral), pectoraux (pompes
  avec élastique) and avant-bras (wrist roller, pronation/supination haltère, plate wrist
  curl).
- **Journal du jour, cinq additions** — the daily journal now does more than recap the
  sessions the workout flow itself logged.
  - **Alimentation du jour**: a card summing today's `nutriLog` (via the same `totals()`
    macro helper the Nutrition tab uses) next to the training stats — kcal, protein, carbs,
    fat, with a link into the Nutrition tab for the detail. It deliberately does not compute
    a "net" balance against training kcal burned: that would read as a full calorie balance
    when it is missing resting energy expenditure, so the two numbers are shown side by side
    with a line saying so instead.
  - **Delete a session**: a trash icon on each journal card removes that entry outright
    (`DELETE_SESSION`). The session log is no longer strictly append-only, though nothing
    else in the reducer mutates or reorders an existing entry.
  - **Log a session after the fact**: "Ajouter une séance" builds a `sessionLog` entry
    without going through the workout state machine — pick a program (assumed completed as
    prescribed) or leave it free-form. Free-form entries carry no exercises and `series: 0`;
    the journal card hides the séries tag rather than show a fabricated zero.
  - **Notes du jour**: a free-text field per day (`dayNotes`, a new persisted slice),
    independent of the session log — ressenti, courbatures, sommeil.
  - **AI analysis cached per day**: `analysisLog` (new persisted slice) keeps the last
    analysis for each day, so reopening the Journal doesn't force a recompute — free on the
    local engine, but a real saved request against a configured OpenRouter model. Logging a
    new session for that day (live or added after the fact) evicts the cached entry, since it
    would otherwise describe a day that has since changed.

- **A walk's distance can be deduced from its duration** — type the minutes and the distance
  fills itself in from height and gait.
  - Step length is height × coefficient (0.415 men, 0.413 women), but a step length alone
    cannot turn minutes into kilometres: it takes a cadence too. Each gait therefore carries
    both, calibrated so the resulting speed lands where that gait actually sits — flânerie
    ≈ 3.3 km/h, normale ≈ 4.7, rapide ≈ 5.7, course ≈ 10.3.
  - The sex coefficient is applied relative to the reference the gait numbers are expressed
    against, which keeps it the 0.5 % adjustment it really is rather than a second opinion
    on the whole estimate.
  - **A typed distance always wins** over a derived one, and the estimate shows its workings
    (step length, cadence, step count, resulting speed) so it never reads as a measurement.
    "Redéduire de la durée" comes back.
  - Running is stored as its own gait and costs ~0.9 kcal/kg/km instead of a walk's 0.5 —
    logging a run at the walking rate would have halved it.

- **"Recomposition corporelle"**, as a training objective and as its own nutrition goal.
  - Losing fat and building muscle at once is not either neighbour: `maintien` asks too
    little protein to build while losing, and `seche`'s deficit is too deep to build at all.
    The new goal is a light deficit (−5 %) with 2 g of protein per kilo — the protein does
    the muscle side, the deficit does the fat side. Targets land between the two: 2 470 kcal
    and 156 g of protein where Maintien gives 2 600 / 125 and Sèche 2 132 / 156.
  - Each nutrition goal now carries its own explanation, shown under the picker. The
    difference between four pills is not guessable from their labels, and this one is worth
    stating plainly: fat does not turn into muscle, the two run in parallel.
  - The progress analysis knows it: recomposition is the one goal broken by an excursion in
    *either* direction, and walking reads as the right tool for it.
  - The objective list was duplicated between the profile and the workout builder; it is now
    one `OBJECTIFS` in `data/programs.js`, so a saved workout cannot carry an objective the
    profile is unable to express.

- **The catalogue reaches 104 exercises**, from 49. Fifty-five additions, chosen from the gaps
  a reading of the catalogue by muscle made obvious rather than from a wish list.
  - **Chest** went from one exercise to seven (incline and decline push-ups, dumbbell bench
    and incline press, flyes, pull-over, diamond push-ups); **back** from two to seven
    (one-arm row, bent-over row, inverted row, band lat pulldown, face pull); **deltoids**
    gained the rear head it lacked entirely (rear-delt flyes with dumbbells and band, Arnold
    press, front raise); **biceps** and **triceps** four more each.
  - **Core gained rotation, anti-rotation and lateral flexion** — side plank, Russian twist,
    dead bug, bird dog, hollow body, Pallof press, bicycle, V-up — where it had only flexion
    and anterior stability.
  - **Three families the catalogue could not express at all** now exist, each with a new
    muscle and its zone on the body map: grip and forearms (farmer walk, dead hang, wrist
    curls, pinch grip), spinal erectors (superman, floor back extension), and the trapezius
    (shrugs, Y-raise, wide-elbow row). Obliques got their own zone too.
  - Lower body filled in around what was already dense: cyclist and Spanish squats, reverse
    Nordic, band pull-through, paused single-leg hip thrust, sliding leg curl, hamstring
    walkout, two Copenhagen progressions, standing band adduction, and three calf entries
    including the tibialis raise nothing covered.
  - `scripts/solve-pose.mjs` was written along the way: two-link inverse kinematics that
    turns "the hand is on the bench, the foot is on the floor" into the angles a frame
    stores. Guessing them does not converge, and the first two chest demos proved it — their
    hands hovered fifteen units above the block they were supposed to rest on.
  - The validator earned its place immediately: it caught four forward references to
    exercises in later batches, a demo whose two keyframes were nearly identical, and a
    linker that silently skipped every multi-line muscle entry.

- **Four exercises, and a validator to make adding them safe** — the catalogue grows from 45
  to 49.
  - `npm run check-catalogue` enforces the invariants CLAUDE.md documents and nothing
    checked: every id referenced in `muscles`/`programs`/`demos`/`cues`/`similaires` exists,
    every icon is registered in `Icon.jsx`, `mat` and `niveau` stay in their closed
    vocabularies, every exercise has a demo and cues, every muscle has a body-map zone, a cue
    stays under four words. Proven against deliberately broken data before being trusted —
    its own first two rules were wrong and reported 128 false problems on a healthy
    catalogue.
  - **Curl biceps, élévations latérales, extension triceps nuque, relevé de jambes.** The
    gaps were not guessed: they are what the dictated-programme import kept substituting for.
    The catalogue had *no* biceps exercise at all, and a single compound movement each for
    the deltoids and triceps. Each comes with its full sheet, an animated demo, voice cues
    and its place on the muscle map — the four files an exercise actually spans.
  - Authoring the poses turned up something worth writing down: seen from the side, a
    standing figure with arms along the body is a vertical line. The limbs are angled a few
    degrees off vertical and the two sides split so the body reads as a body.

- **"Importer un programme dicté"** on the Programmes screen — ask Claude or ChatGPT for a
  training plan, paste the JSON, and each session of the plan becomes a custom workout with
  the prescribed sets, reps, load and rest.
  - **The assistant picks from the catalogue, it never invents an exercise.** An exercise here
    is an id cross-referenced by its animated demo, its voice cues and the muscle map; an
    invented one would arrive with none of those and quietly degrade five features to gain a
    name. The prompt therefore embeds all 45 exercises (~4 KB, generated from the data so it
    cannot drift), and the parser resolves an id, then a name, then the nearest exercise
    working the same muscle.
  - **A substitution is always shown before it lands** — "presse à cuisses → remplacé par
    Squats (Quadriceps)". It changes the session, so it is not something to discover later.
    Substitution requires the muscle the assistant named: a name that failed to match is not
    a signal, which is what stopped a rowing machine being proposed as mountain climbers. A
    primary muscle outweighs a secondary one, so lateral raises land on the overhead press
    rather than the push-up, and the body map's own vocabulary bridges "abdominaux" to
    "Sangle abdominale".
  - A plan arrives as several sessions at once, since a Musculator session is one workout and
    a weekly programme is four. `PROMPT-PROGRAMME.md` mirrors the prompt at the root.

- **A dictated food is looked up in your own foods before CIQUAL.** A product you scanned
  carries its brand's real values and is one you actually eat; no generic can beat that. It
  also closes a gap the previous change left open — scanning the two foods CIQUAL did not
  know made them importable by name from then on, which is what the search screen has always
  done and the import did not. The preview names the source ("Mes aliments" or "CIQUAL"), and
  a cached food is reused exactly as it is, id included, so it stays one entry rather than
  spawning a copy. On the failing example: 11 foods of 11, against 9 before.

- **The dictated import reads three more shapes an assistant actually produces.** ChatGPT
  answered `"repas": { "petit_dejeuner": [...] }` — meals as a *map* keyed by meal rather
  than a list — which the parser rejected outright with "aucun repas exploitable".
  - A meal map is now folded back into blocks, its key being the meal.
  - A composed dish that nests its ingredients (`"frittata", composition: [...]`) has them
    flattened into the meal. Left nested, the dish was dropped for having no values of its
    own and its four ingredients went with it.
  - Any remaining `…kcal…100…` key is read as the per-100 g energy: the "100" anchors it, so
    it cannot pick up a portion total by mistake.
  - CIQUAL matching gained *soft* tokens — descriptive words and figures that qualify a food
    without identifying it ("fraîches", "bio", "nature", "82 %"). They are no longer required
    of a candidate, which was rejecting "figues fraîches" against "Figue, crue", but they
    still count in its favour when present, which is what makes "riz basmati cuit" pick the
    cooked entry over the raw one.
  - The prompt now says not to nest a dish's ingredients. Nine of the eleven foods in the
    failing example import; the two that do not are genuinely absent from CIQUAL and are
    named as such.

- **Export and restore, for data that exists in exactly one place** — no account, no server,
  so a cleaned browser or a replaced phone took the whole journal with it and there was
  nothing to say but "don't do that".
  - *Mon profil & objectifs → Sauvegarde de mes données* writes every persisted slice to a
    JSON file, and reads one back either by **merging** it into what is already here (logs
    unioned by id, so the same entry on two devices stays one entry, and the device keeps its
    own profile and settings) or by **replacing** everything. A summary of what the file
    holds is shown before either.
  - **The OpenRouter key is never exported.** A backup is a file people mail to themselves
    and drop in cloud storage; a secret does not belong in it. The chosen model is kept, so
    restoring only asks for the key again.
  - Delivery adapts to the device: the **share sheet first**, since in an installed iOS app a
    download link frequently does nothing while sharing opens Fichiers, Mail and AirDrop;
    then a download link; then the clipboard, so the data can always be got out somehow.
  - Reading is defensive — a slice with an unexpected shape is skipped and named, so a
    partial or hand-edited file still restores what it does carry.

- **An update button, and a visible version** — a new Netlify deploy could take many reloads
  to reach an installed phone, with no way to tell whether it had landed.
  - The service worker is now registered by the app (`src/lib/pwa.js`, `registerType:
    'prompt'`) instead of silently by the plugin. `autoUpdate` was the wrong fit: an
    installed PWA is reopened rather than reloaded, so a new worker installed in the
    background while the old JavaScript kept running.
  - *Mon profil & objectifs → Version & mise à jour* shows the running build (commit and
    build time, stamped in at build time from Netlify's `COMMIT_REF`) and a button that asks
    the server, installs what it finds and restarts onto it. Reading the version is what
    replaces reloading and hoping.
  - A banner offers the update as soon as one has installed, and the app re-checks whenever
    it comes back to the foreground — which is what a phone does instead of navigating.
  - **Never during a workout**: applying reloads the page, and a running session lives in
    memory only. The check refuses and the banner hides itself.
  - `netlify.toml` adds cache headers — `sw.js`, `index.html` and the manifest revalidate,
    hashed assets stay immutable. Headers only, no `[build]` block, so it cannot conflict
    with the deploy settings configured in Netlify.

- **Walking** — kilometres now count towards the day's expenditure alongside training.
  - **Three ways in**, chosen because no web API counts steps in the background and the app
    refuses to promise one: manual entry (distance and/or duration), a live GPS walk over
    `watchPosition` while the app is open, and a file import — a GPX trace, or the CSV that
    Strava, Apple Santé and Google Fit exports boil down to (`lib/importActivity.js`, which
    also reads locale-formatted dates like "15 août 2026"). A walk can also be dictated to
    the same assistant as the meals.
  - **Energy is net and weight-based**: `0.5 kcal × poids × km`, or METs minus one when only
    a duration is known. This is the first expenditure in the app that is actually
    personalised — sessions still use a flat 9 kcal/min.
  - **It never enters the calorie target.** That target already contains all-day activity
    through the BMR × frequency multiplier, so adding walking to it would count the same
    kilometres twice. It is displayed beside the intake, like training kcal, and nothing
    presents a net balance.
  - **`activityLog` is its own persisted slice**, not part of `sessionLog`: a walk is not a
    workout and must not inflate the streak, "séances au total" or the weekly chart. It gets
    its own two badges instead — 100 km cumulés and 7 jours de marche.
  - Surfaced as a ring on the home screen (against a `kmCible` objective settable in the
    profile), a card in the journal next to food and training, and a point in the progress
    analysis that reads the same distance differently depending on the objective — the
    cheapest deficit there is when cutting, a bite out of the surplus when bulking.
  - GPS fixes are filtered by accuracy, minimum step and jump distance: a phone standing
    still reports a wandering position that would otherwise accumulate kilometres.

- **"Analyse IA de mes progrès"** — a second analysis, on the Progress screen, reading the
  last four weeks against the four before them. Where the journal's answers "how was today",
  this one answers "is what I do taking me where I said I wanted to go", so it is framed by
  the profile's objectives: objectif principal, zones prioritaires, objectif nutrition and the
  daily targets, plus any declared constraint or injury.
  - Priority zones are checked against the muscles the sessions actually worked, through a
    new `ZONES` bridge in `data/muscles.js` — `profile.zones` holds coarse labels ("Jambes")
    and a session holds primary muscle names ("Quadriceps"), so the two vocabularies needed
    an explicit mapping rather than a string match.
  - Same two engines as the day's analysis: `lib/progressAnalysis.js` on-device, or a
    configured OpenRouter model fed **the same `progressStats()` object** the local engine
    works from, so both answer from identical facts. Failure falls back and says why.
  - A theme with no data (no nutrition logged, no priority zone declared) is reported as
    unmeasured and its weight leaves the score's denominator, rather than counting as a
    failure — the same rule as the nutrition score.
  - Never persisted, unlike the day's analysis: its window moves every day, so a cached copy
    would age into a wrong answer.

- **The Progress screen's figures are now ways in, not decorations** — "séances au total"
  opens the whole history (which was capped at the last 20 with no way to see further), a
  chart bar filters it to that rolling week, and "Temps total" and "Calories" expand into a
  breakdown: average per session, last 30 days, longest session, split per program, best day,
  and the kcal/min rate the estimate itself uses.
  - The week labels and the "6 dernières" count are derived from the chart's own buckets;
    they were a hand-written array that would have desynced if the window ever changed.

- **Daily nutrition targets are settable** — *Mon profil & objectifs → Objectifs quotidiens*
  now carries the four numbers the Nutrition screen scores against: calories, protein, carbs
  and fat.
  - They stay computed from the profile by default. A field left empty keeps the
    calculation; filled, it overrides it. The computed value remains the field's
    **placeholder**, and "Tout recalculer" clears all four — an override is never a one-way
    door, and nothing hides what the profile would have said.
  - A manual calorie or protein target feeds the carb/fat split, so setting 2 400 kcal moves
    the carb target with it rather than leaving the plate contradicting itself.
  - Set by hand, the macros can add up to something other than the calorie target. The
    profile says so (4/4/9, with the gap in percent) instead of letting the two bars on the
    Nutrition screen disagree silently, and that screen labels the targets "cibles perso".

- **Dictated import: foods are looked up in CIQUAL when the assistant gives no values** —
  ChatGPT answers a dictated meal by *naming* foods (`{"food": "kiwi", "quantity": 1}`) rather
  than composing them, which the import rejected outright with "aucun repas exploitable".
  - `lib/ciqualMatch.js` resolves a bare name against the bundled table. It is deliberately
    not `searchCiqual`: there a human picks from a ranked list, here nobody picks, so it
    answers confidently or not at all. Every query token must appear in the candidate, and
    the candidate's *first* word must be one the query named — which is what stops "Cookie
    aux pépites de chocolat" from answering "pépites de chocolat", "Riz blanc, avec poulet"
    from answering "blanc de poulet", and "Jus de fruit(s)" from answering "skyr". Plurals
    are folded ("figues" → "Figue, crue") and so are ligatures ("oeuf" → "Œuf").
  - An unresolved food is **dropped and named in a warning**, never imported empty. A
    resolved one keeps the dictated wording and shows the table entry used underneath it in
    the preview — CIQUAL has no plain "chocolat noir" and cannot tell cooked rice from raw,
    so the pick has to be visible before it lands.
  - ChatGPT's field names are accepted alongside the documented ones: `items`, `food`,
    `quantity_g`, `kcal_per_100g`, and meal keys with underscores (`petit_dejeuner`).
  - **A bare `quantity` is never read as grams**: it is how a model writes a count of pieces
    or prose, and reading `{"food": "oeuf", "quantity": 1}` as a weight logged one gram of
    egg. It falls back to 100 g with a warning saying so.
  - The prompt now insists on grams ("3 figues" → `"grammes": 150`) and documents the CIQUAL
    fallback as a safety net, not a substitute for giving values.

- **Editing a logged session, and reaching past ones** — the journal could log a session
  after the fact and delete one, but only for today and with no way to correct a mistake.
  - **`EDIT_SESSION`** (pencil on a session card) changes *when*, *how long*, and the label
    of a free-form entry. `exerciseIds`, `series`, `muscles` and `partial` stay out of reach:
    they are the record of what was actually performed, and the muscle map, the badges and
    the analysis all read them as fact. `kcal` follows the duration through the same
    `KCAL_PER_MIN` rule that produced it.
  - **The Progress history is now actionable** — edit and delete on every row. The Journal
    only ever shows today, so this is what reaches a session logged on a past day.
  - **"Ajouter une séance" takes a date and a time**, defaulting to now. A session you forgot
    to log yesterday no longer has to be filed as today's.
  - One shared `SessionForm` drives adding and editing, on both screens, so the two cannot
    drift apart.

- **README gallery** — the README opens on twelve screenshots (nine dark, three light behind a
  fold) instead of describing the app in prose alone, and gained section icons, badges and a
  table of the generator commands. The images are generated by `npm run shots`
  (`scripts/shots.mjs`), which seeds a fixed demo state so the gallery is reproducible and
  shows populated screens rather than empty ones, and writes webp — the same pictures as PNG
  weigh about four times as much for files that live in git forever.

- **Light theme** — *Mon profil & objectifs → Apparence* now offers Sombre, Clair or Système.
  Dark stays the default, so an existing install only changes when its owner asks it to;
  Système follows the OS setting live, including a phone that flips at sunset.
  - The light palette is a second token block in `src/styles/tokens.css` that **inverts each
    ramp rather than shifting it**. Steps 100–600 are text roles and 800–900 are fills — no
    token was used as both, checked before relying on it — so several hundred inline
    `var(--color-…)` usages theme themselves and not one component needed a light variant.
  - The orange and green that were written as `#f0a35e` / `#5fd08a` in 39 places now go
    through the `--color-warn` / `--color-good` tokens that already existed for them, and are
    darkened in the light theme, where the dark-theme values are unreadable on white.
    The Nutri-Score palette stays hardcoded on purpose: it is a standardised scale.
  - The muscle map's sollicitation ramp gained its own `--color-load-*` tokens. Mirrored, the
    accent ramp made a lightly-worked muscle come out *paler* than an untouched one — the
    scale read backwards at its low end. `BodyMap`'s legend swatches now read the same
    tokens as the body, so the two can no longer disagree.
  - `index.html` applies the stored choice before first paint, so a light-theme PWA cold
    start does not flash dark, and the `theme-color` meta follows the palette so the phone's
    status bar matches.

- **"Mes aliments" on the food search screen** — everything already logged (`foodCache`) is
  now listed below the meal picker, so a food used before never has to be scanned or searched
  for again.
  - Alphabetical and accent-insensitive: *Épinards* files under E, *Œufs* under O, digits
    under a single "#". A letter carrying one food shows it as a normal row; a letter
    carrying several folds into an accordion, one open at a time, since the cache only ever
    grows and the section sits at the bottom of an already long screen.
  - Search results are re-ranked: your own foods first (marked *déjà utilisé*), then Open
    Food Facts, then the generic table, deduplicated by id so a cached product is not
    repeated by the OFF answer that re-fetched it. They also answer with no network, so the
    offline fallback now has something to show for a food you have logged before.
  - `manualFood()` derives its id from the name instead of `Date.now()`. The cache is a list
    the user reads now, and a timestamped id put one row in it per time the same home-made
    dish was typed in.

- **Dictated meal import** — a new "Importer un repas dicté" screen on the Nutrition tab takes
  the JSON produced by a chat assistant (Claude or ChatGPT) from a spoken description of a
  meal, and files its foods into the right day and the right meal.
  - The prompt to give the assistant ships with the app (`src/lib/mealPrompt.js`, copyable
    from the screen) and is the other half of the format `src/lib/importMeals.js` reads. Its
    meal keys and micronutrient list are derived from `src/data/nutrition.js`, so the prompt
    follows when those change.
  - It asks for a portion weight plus per-100 g values rather than the portion's totals,
    which is the shape the log stores: an imported quantity stays editable afterwards and
    rescales everything, exactly like a scanned product.
  - Nothing is written before a preview: the parsed days, meals and foods are shown with
    their totals, along with the warnings for anything that had to be guessed (missing
    quantity, unrecognised meal, values found outside the `pour100g` block). The import then
    either adds to the day or replaces only the meals it carries.
  - Model output is treated as hostile: prose and code fences around the object are
    tolerated, English or French field names are both read, a meal can be routed by its hour
    when its name is missing, an unusable food is dropped with a warning rather than taking
    the whole import down, and a food with macros but no energy gets the Atwater estimate.
    A micronutrient the model set to zero is dropped rather than logged as a real zero —
    except fibre, which is genuinely zero in meat, eggs and dairy.
  - Imported foods land in `foodCache` under a deterministic id, so a food dictated twice
    reuses one cache entry and stays re-addable offline.
  - `PROMPT-REPAS.md` at the root carries the same prompt for reading outside the app,
    generated from `src/lib/mealPrompt.js` by `npm run gen-prompt` rather than copied, since
    the prompt interpolates data that would otherwise drift out of it.

- **Animated demos for the whole catalogue** — the 35 lower-body exercises that previously
  fell back to a pulsing icon now have a real animated demonstration, so every one of the
  45 exercises shows its movement in the library sheet and during a guided session.
  - The demo renderer gained the equipment those movements need: `props` for a
    bench/box/step (`kind: 'block'`) or a wall (`kind: 'wall'`), `weights: 'disc' | 'kb'`
    alongside the existing dumbbells, `ankleBand` and `legBand` for elastics strapped to an
    ankle or stretched between the legs, `ball` for a ball at the knees or under the heels,
    and `hipLoad` for a bar across the hips.
  - `viewBox()` in `src/lib/pose.js` accounts for the new equipment so each demo still
    frames itself, and `scene: 'none'` is now supported for a demo with no floor.
  - Isometric holds (wall sit, Copenhagen, ball squeeze) set `cycle` explicitly; the rest
    inherit the voice cadence.

- **Voice-coach cues for the whole catalogue** — `src/data/cues.js` covers all 45 exercises
  instead of the original 10, so the lower-body movements are coached by name and rhythm
  rather than falling back to a generic "Allez / Continue" at a default 1500 ms beat.
  - Because `beat` also drives the animated demo's tempo, each exercise now moves at a
    speed matched to it: explosive work is fast (kettlebell swing, 900 ms), eccentric work
    is slow (nordic curl 2400 ms, GHR and pistol squat 2200 ms), and isometric holds get a
    four-phrase reminder loop (wall sit, Copenhagen, ball squeeze).

- **Global top bar with a menu and contextual help** — every screen gains a slim bar
  carrying a hamburger menu on the left and a `?` on the right.
  - The drawer surfaces what was previously reachable from one button in one place only:
    profile & settings, muscle map, workout builder — plus the voice-coach toggle and the
    medical disclaimer. It mirrors the tab navigation with fuller labels.
  - Help is contextual: it keys off the open overlay, falling back to the current tab, so it
    always describes what is actually on screen. Content is in `src/data/help.js`, one entry
    per screen; the `?` is dimmed where no entry exists.
  - Both close on backdrop click and on Escape. The bar hides itself during a running
    workout, where the session owns the screen and a stray menu tap would cost a set.

- **Nutrition module** — a sixth tab bringing Nutritor's nutrition features into Musculator:
  barcode scanning, food search, a day/meal journal, a live macro dashboard, and a daily
  score linking nutrition to training. No training feature changed.
  - **Sources** — Open Food Facts (barcode + search, logic ported from Nutritor's
    `openFoodFacts.ts`: retry/back-off, relevance ranking, cache-on-failure) and a bundled
    CIQUAL table of 3 167 generic French foods for fully offline search. Manual entry is
    always available. Every fetched food is cached for offline re-use.
  - **Score Musculation Quotidien /100** — protéines 40 / calories 40 / micronutriments 20,
    all weights in `src/data/nutrition.js`. Unknown micronutrients drop their weight from the
    denominator rather than scoring zero.
  - **Targets** derive from the existing training profile, plus one new `objectifNutrition`
    field; there is no second profile to fill in.
  - `nutriLog` and `foodCache` join the persisted slices.
  - Optional: imports a Nutritor journal CSV, merging into existing days rather than
    replacing them.
  - Barcode scanning falls back to `@zxing/browser` where the native `BarcodeDetector` is
    missing, so it works on iOS Safari and Firefox. The decoder is loaded on demand and
    excluded from the precache — browsers with the native API never fetch it, and the ~466 KB
    chunk is runtime-cached on first use instead of shipped to everyone.
  - The CIQUAL table is a lazily loaded chunk rather than part of the initial bundle: the
    entry bundle stays at 654 KB instead of 1 179 KB, and the 531 KB table is fetched when
    food search opens. It remains precached, so offline search is unaffected.

- **Optional OpenRouter backend for the "Analyse IA"** — a new section in *Mon profil &
  objectifs* takes an OpenRouter API key and lets you pick a free model; that model then
  writes the journal's analysis instead of the on-device engine.
  - The free model list is **fetched live** from OpenRouter's public `/models` endpoint
    rather than hard-coded, because the free line-up changes constantly. Free is decided
    from the price (`prompt` and `completion` both zero), not the `:free` id suffix, and
    text-only output is required so zero-priced audio models are excluded.
  - The key is validated against `/key` when the list is loaded, so a bad key is reported in
    settings rather than at analysis time.
  - Any failure — bad key, rate limit, off-format JSON — falls back to the on-device engine
    and tells the user; leaving OpenRouter unconfigured keeps the previous behaviour exactly.
  - `openrouter: { key, model }` joins the persisted state slices.
  - Registers the `circle` icon slug, which was imported but never mapped.

- **Partial sessions are shown as such** — the journal marks a session that was stopped
  early with an amber accent and "Séance partielle — arrêtée après 1 exercice sur 3", and
  the progress history labels it too instead of showing the same completion tick as a
  session seen through. `partial` and `exosTotal` are stored on the entry rather than only
  on the ephemeral summary; entries written before the flag existed simply read as complete.

- **Closing a workout offers to save it** — the × used to discard everything silently.
  It now asks, showing what is at stake ("Tu as déjà fait 3 séries en 4:12"), with
  "Enregistrer et quitter", "Quitter sans enregistrer" and "Reprendre la séance". The clock
  and the rest countdown freeze while the choice is open, and resuming restores the paused
  state it found. With no set completed there is nothing to save, so it leaves at once
  without asking.
  - A partially completed session is logged from what was actually performed — its sets and
    only the exercises touched — and the summary reads "Séance enregistrée / Arrêtée en
    cours de route" rather than claiming it was finished.

- **Solo exercise runs** — a full-width "Faire cet exercice maintenant" button on every
  exercise sheet starts a session containing just that exercise, for when there is no time
  for a full workout.
  - Open-ended by design: there is no set target, the counter just climbs, and a "Terminer
    et enregistrer" action is offered mid-exercise, during the rest, and in big-button mode.
  - Runs through the existing workout machinery — timer, rest, voice coach — via
    `soloProgram()` in `src/data/programs.js`, an ad-hoc program carried on the workout
    state. It is deliberately never saved, so a quick set leaves no custom program behind;
    `workoutProgram()` in the store resolves the running program instead of `progById`.
  - Logged like any session, with the exercise in `exerciseIds` so it counts towards the
    muscle map and the badges. Leaving before completing a single set writes nothing.

- **"Muscle ciblé" block on every exercise sheet** — each of the 45 exercises gained two
  fields in `src/data/exercises.js`, rendered as a new section between the technical
  description and the setup steps:
  - `sollicitation` — how the primary muscle is actually loaded by *this* movement: the
    contraction regime (eccentric / concentric / isometric) and where in the range the
    tension peaks. Previously the sheet named the muscle but never explained the mechanism.
  - `surcharge` — the overload failure mode specific to the movement, plus a concrete
    guardrail, shown in a distinct warning block. Complements `conseils`, which are per-rep
    execution cues rather than dosage advice.
  - The standalone "Muscles secondaires" line is absorbed into the new block as "Aussi
    sollicités"; no information was dropped.

- Documentation: `CHANGELOG.md` (this file) and `CLAUDE.md`.

### Changed

- The voice coach announces an exercise without the clarifying alias some names carry in
  parentheses — "Coquillage, c'est parti !" rather than "Coquillage (clamshell), c'est
  parti !". Affects the 10 names that have one; the displayed name is unchanged.

### Fixed

- **The update button could say "redémarrage…" and never restart.** vite-plugin-pwa's reload
  is conditional: workbox only reloads on `controlling` when it decided *at registration
  time* that the page was already controlled by a compatible worker. After the app has been
  reinstalled, or on the load that first installed a worker, that is false — the new worker
  activated and the page stayed on the old code for good, with the banner and the green
  message stuck on screen. `applyUpdate` no longer depends on it: an uncontrolled page
  reloads immediately (its reload is served by the network anyway), a controlled one watches
  `controllerchange` itself, and a 2.5 s timer unregisters the worker and reloads if neither
  happened. Verified on both paths — 0.6 s and 0.8 s to reload.
- **An escape hatch** in the same settings block, for anything left: "Forcer le rechargement
  complet" drops the worker and every cached asset and refetches from the server. It clears
  Cache Storage only — the journal lives in `localStorage` and is untouched, which matters
  because the obvious manual workaround (clearing the site's data) would erase it.

- `goalDef()` and the profile fell back to `GOALS[1]` for an unknown nutrition goal — a
  positional index into a list that is ordered for the picker, so inserting Recomposition
  into it silently changed the fallback. Both resolve by key now.

- **Deleting a session left the day's cached AI analysis in place**, still describing a day
  that had since changed — adding one already evicted it. `withStaleAnalysisFor` is now
  variadic, so an edit that moves a session invalidates both ends of the date change, and it
  only clears the live copy when today is among the days touched.

- **Deleting a session took a single tap** with no confirmation and no way back, on the only
  copy of that data. It now asks first, inline.

- **`sessionLog` is kept sorted** (newest first, day then time). Array order used to be date
  order for free, since entries were only ever prepended as they happened; a session logged
  for — or moved to — a past day would otherwise have sat at the top of the Progress history.

- The Progress history read "0 exercice" for a session added manually from the journal, which
  has no exercises by construction. It now says "ajoutée manuellement" and takes the pencil
  icon the journal already uses for those.

- `.pill-on` had no style at all, so the selected quantity shortcut in the food-quantity
  sheet and the selected meal in food search looked exactly like the unselected ones. The
  class is now defined in `app.css` alongside `.pill`.

- A session's logged `series` count now honours a custom workout's per-exercise overrides
  instead of the catalogue defaults, which under-reported it.

- A session's logged `muscles` came from the whole program rather than the exercises
  actually performed, so a session stopped early claimed muscles it never worked.

- The journal's session card read "1 séries".


## 2026-08-14

### Added

- **Lower-body exercise catalogue** (`e2fba3f`) — 35 thigh/glute exercises on top of the
  original 10, bringing the catalogue to 45. Introduces two schema fields on
  `src/data/exercises.js`: `pattern` (one of 7 movement patterns) and `optionnel` (calves
  and advanced-audience entries, hidden by default).
  - New helpers: `coreExercises()`, `groupByPattern()`, `exercisesByPattern()`,
    plus the `PATTERNS` and `UNTAGGED_GROUP` exports.
  - **Bibliothèque** now groups results by movement pattern and gained an "Optionnels"
    toggle; untagged upper-body/core exercises land in a trailing "Haut du corps & core"
    group so no filtered result is ever silently dropped.
  - **Muscle map** extended from 9 to 13 zones: added `adducteurs`, `moyen-fessier`,
    `ischios`, `mollets`, and reworked `fessiers`/`quads` exercise lists.
  - The builder's exercise picker and the exercise sheet's "similaires" list pick up the
    new catalogue.
  - Default selected exercise for the library/detail view changed accordingly.

- **Animated exercise demos** (`d128aed`) — replaced the "Démo animée" placeholder with a
  real animated stick figure, shown in the exercise sheet and during a guided session.
  - `src/data/demos.js` — keyframe poses for 10 exercises plus the shared `SKELETON`
    proportions and scene props (ground, mat, bar, dip bars, resistance band, dumbbells).
  - `src/lib/pose.js` — React-free forward kinematics, pose interpolation, cubic easing,
    and per-exercise viewBox framing so each movement fills its frame.
  - `src/components/ExerciseDemo.jsx` — imperative SVG renderer; a running demo never
    re-renders the React tree above it. Loop timing defaults to the voice cadence
    (`CUES[id].beat × frames.length`) so the figure moves in step with the spoken cues.
  - Exercises without a demo entry render nothing and show no "démo" badge.

### Changed

- **Lint cleanup** (`f9559c9`) — optional chaining across all screens/overlays, and
  `src/state/store.jsx` split so it only exports the `AppProvider` component: the context,
  `useApp`, `useDerived` and `allPrograms` moved to `src/state/context.js` to satisfy React
  Fast Refresh. Enabled `react/only-export-components` in `.oxlintrc.json`.

## 2026-08-13

### Added

- **Initial implementation** (`7735fe5`) — the Musculator PWA, built from the Claude Design
  prototype handoff.
  - 5 tab screens (Accueil, Programmes, Bibliothèque, Journal, Progrès) and 7 full-screen
    overlays (exercise sheet, program detail, muscle map, profile, builder, workout,
    workout complete).
  - Guided session engine: exercise/rest phases, per-set stopwatch, rest countdown with
    +15s and skip, editable reps/charge/notes, fullscreen "big buttons" mode.
  - French voice coach over the Web Speech API, with per-exercise cadence cues and
    encouragement.
  - Workout builder for custom sessions, persisted alongside the profile and session log.
  - Muscle map whose sollicitation and recovery state are derived from the real session
    log (`src/lib/muscleStats.js`) rather than the prototype's hard-coded demo numbers.
  - Badges that unlock from real usage (`src/data/badges.js` + `useDerived`).
  - Local "Analyse IA" (`src/lib/analysis.js`) computing the shape a real LLM response
    would fill, with no backend or API key.
  - Single Context + reducer store persisted to `localStorage` under `musculator:v1`.
  - PWA setup: `vite-plugin-pwa` with autoUpdate, offline precaching, generated icons
    (`scripts/gen-icons.mjs`), real online/offline detection.
  - Nocturne design tokens ported from the handoff (`src/styles/tokens.css`).
  - Playwright smoke script (`scripts/smoke.mjs`).

- **Claude Design handoff** (`0ea3ab9`) — the exported prototype (`project/`) and the
  original design conversation (`chats/`) this app was built from.
