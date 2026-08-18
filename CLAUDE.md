# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server on http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build on :4173
npm run lint       # oxlint
npm run gen-icons  # regenerate public/icons/*.png
npm run gen-prompt # regenerate PROMPT-REPAS.md from src/lib/mealPrompt.js
npm run shots      # regenerate docs/screenshots/*.webp (needs a build served on :4173)
npm run check-catalogue  # verify the content invariants below
```

**`npm run check-catalogue` enforces what this file documents.** Every rule below about ids
existing, icons being registered, `mat` being a closed vocabulary, every exercise having a
demo and cues, every muscle having a body-map zone — none of it was checked by anything until
the catalogue started growing. Run it after touching `src/data/`; it is the only thing
standing between a typo and a blank demo in the middle of a session. It now covers the help
content too (see *Aide, FAQ et support*), including the one rule this file used to say
nothing enforced: **every screen has a help entry, and every help entry names a real
screen** — both sides read from `App.jsx`'s two maps.

`docs/screenshots/` is the README's gallery and is **generated** (`scripts/shots.mjs` seeds a
fixed demo state, so the shots are reproducible and show populated screens). Re-run it when a
screen it captures changes shape; don't hand-edit the images.

There is **no unit test suite**. The only automated check beyond lint is
`scripts/smoke.mjs`, a Playwright walkthrough that clicks through the main flows and writes
screenshots to `/tmp/shot-*.png`. It has no npm script, needs a build served on port 4173,
and launches Chromium from a hard-coded `/opt/pw-browsers/chromium`:

```bash
npm run build && npm run preview &
node scripts/smoke.mjs
```

## Architecture

React 19 + Vite PWA, no backend, no router, no test framework. Everything the user creates
(profile, custom workouts, session history) lives in `localStorage`.

### State: one Context + one reducer

All app state is a single reducer in `src/state/store.jsx`. There is no local component
state for anything that matters — screens read `state` and call `actions` from `useApp()`.

The split between the two files in `src/state/` is load-bearing:

- **`store.jsx` exports only the `AppProvider` component.** The oxlint rule
  `react/only-export-components` enforces this for React Fast Refresh. Anything else —
  context object, hooks, selectors — belongs in `context.js`.
- **`context.js`** holds `AppContext`, `useApp()`, `useDerived()` and `allPrograms()`.

**Derived data is not in the reducer.** Streak, weekly stats, badge unlock state and history
are recomputed by `useDerived()` (memoized on `state.sessionLog`). Don't add computed fields
to reducer state; add them to `useDerived` or to a `lib/` helper.

**Persistence covers 13 slices only** — `profile`, `customWorkouts`, `sessionLog`,
`disclaimerAcked`, `voiceOn`, `tourDone`, `openrouter`, `nutriLog`, `foodCache`, `theme`,
`dayNotes`, `analysisLog`, `activityLog`, under the key `musculator:v1`. Everything else (current tab,
filters, in-progress workout) is deliberately ephemeral. Adding a durable field means
touching both `loadPersisted()` and the persist effect in `store.jsx`.

### Backups

`lib/backup.js` writes and reads every persisted slice, because that data exists in exactly
one place and nothing else can recover it.

- **The OpenRouter key is excluded from the export** — a backup travels, a secret should not.
  The model is kept, and `replaceFromBackup` keeps whatever key the device already had.
- **`deliverBackup` tries the share sheet before a download link.** In an installed iOS app
  `<a download>` frequently does nothing at all; sharing reaches Fichiers and Mail. The
  clipboard is the last resort so the data can always be extracted.
- Merge unions the logs by entry id and leaves settings alone (a device keeps its own
  profile); replace takes the file wholesale. Anything shaped unexpectedly is skipped and
  named rather than trusted.

### Updating an installed app

`registerType: 'prompt'` with `injectRegister: null` — the app registers the worker itself
(`lib/pwa.js`) rather than letting the plugin do it silently. `autoUpdate` was the wrong fit:
an installed PWA is *reopened*, not reloaded, so a new worker installs in the background while
the old JavaScript keeps running, and there is no moment the user can point at.

- `initPwa()` (called from `main.jsx`) keeps the `ServiceWorkerRegistration` in reach, which
  is the only object that can re-check the server, and re-checks on `visibilitychange` —
  coming back to the foreground is what a phone does instead of navigating.
- **`__BUILD_ID__` / `__BUILD_TIME__` are stamped in by `vite.config.js`** (Netlify's
  `COMMIT_REF`, else `git rev-parse`, else "dev") and shown in the profile. Being able to
  *read* the running version is what replaces refreshing and hoping.
- **`applyUpdate` must not rely on the plugin's reload.** vite-plugin-pwa reloads on
  `controlling` only when workbox judged the page already controlled at registration time,
  which is false on the load that installed the worker and after a reinstall — the worker
  activates and the page never moves. It watches `controllerchange` itself, reloads
  immediately when nothing controls the page, and unregisters + reloads on a 2.5 s timer as
  a last resort. `hardReload()` is the manual version of that last resort; it clears Cache
  Storage only, never `localStorage`, where every user's data lives.
- **An update is never applied during a workout.** Applying reloads the page and the running
  session lives in memory only, so `checkUpdate` refuses and `UpdateBanner` hides itself.
- `netlify.toml` carries headers only, no `[build]` block, so it cannot conflict with the
  deploy settings: `sw.js`, `index.html` and the manifest must revalidate, hashed assets are
  immutable.

### Navigation

No router. `state.tab` picks one of 6 tab screens, `state.view` pushes a full-screen overlay
on top. `App.jsx` maps both. Note that `workout` and `complete` are handled by their own
conditionals rather than through the `OVERLAYS` map, because they render outside the normal
overlay chrome.

`TopBar` floats above both with the menu and the contextual-help button. It is **not** part
of the flow: `.screen` and `.overlay` carry matching top padding in `app.css` to clear it, so
changing the bar's height means changing that padding too. It hides itself during a workout —
that view owns the screen, and a stray menu tap there would cost the user a set.

**Contextual help keys off `state.view || state.tab`**, so it follows the overlay when one is
open. Content lives in `src/data/help.js`; a screen with no entry gets a dimmed `?` rather
than an empty sheet. Adding a screen means adding its help entry — `check-catalogue` fails
otherwise. The sheet's footer leads into the help centre rather than restating it.

### The guided session

`AppProvider` runs a single global 1s `setInterval` dispatching `TICK`; the reducer bails out
immediately unless a workout is active and unpaused. The workout state machine
(`phase: 'exercise' | 'rest'`, `restKind: 'series' | 'exercise'`) lives entirely in the
reducer — `FINISH_SET` is the interesting case: it either advances the set, advances the
exercise, or finishes the session and appends a `sessionLog` entry.

**Never resolve the running workout's program with `progById`.** A solo exercise (the
"Faire cet exercice maintenant" button) runs on an ad-hoc program built by `soloProgram()`
that is deliberately never saved, so `progById` would silently fall back to `PROGRAMS[0]`
and the session would run as Full Body Maison. Use `workoutProgram(state)` in the store, or
`w.solo || progById(...)` in a component. A solo run also has no set target: `FINISH_SET`
always leads into a rest, and only `FINISH_SOLO` ends and logs it.

Session entries persist across upgrades, so **anything read from a `sessionLog` entry must
tolerate its absence** — `partial` and `exosTotal` postdate the first entries and are simply
falsy on older ones, which is why the journal treats a missing flag as a complete session
rather than as unknown. `manual` is the same kind of postdating field: only entries created
by `ADD_MANUAL_SESSION` carry it, so its absence must read as "not manual" rather than as
unknown. The log is no longer append-only: `DELETE_SESSION` removes an entry and
`EDIT_SESSION` rewrites one.

**What an edit may touch is deliberately narrow**: when, how long, and the label of a
free-form entry. `exerciseIds`, `series`, `muscles` and `partial` are the record of what was
actually performed and stay out of reach — rewriting them would turn the journal into a wish
list, and everything downstream (muscle map, badges, analysis) reads them as fact. `kcal`
does follow the duration, through the same `KCAL_PER_MIN` rule that produced it.

**The log is kept sorted, newest first, by day then time** (`sortLog`, applied on add and
edit). It used to be date-ordered for free because entries were only ever prepended as they
happened; a session can now be logged for — or moved to — a past day, and `history` still
reads the array in order.

Deleting, adding or moving a session **evicts the cached analysis of every day it touches**
(both ends of a date change) via `withStaleAnalysisFor`, which is variadic for exactly that.
It only clears the live `state.analysis` when today is among them, since that copy is only
ever today's.

**A session logged after the fact never touches the workout state machine.** The Journal's
"Ajouter une séance" form dispatches `ADD_MANUAL_SESSION`, built by `buildManualSessionEntry`
in `store.jsx`. There is no per-set tracking to draw a series count from outside a live
workout, so a picked program is assumed completed as prescribed (`series` sums `effSeries`
over every exercise) and a free-form entry carries no exercises and `series: 0` — the journal
card hides the séries tag rather than show a fabricated zero.

**`w.setsByEx` is the record of what was performed**, written in `FINISH_SET` — the single
place a set is ever counted. Everything downstream reads it rather than the program's
prescription, because a session can end early: `finishWorkout()` is the one exit that logs a
run and shows the summary, and it takes a `partial` flag for a run stopped by the ×. Don't
reintroduce a prescription-based count; for a completed program the two agree anyway.

Per-exercise series/reps/charge/rest resolve through `src/lib/workout.js`, which layers a
programme's `custom[exId]` overrides on top of the catalogue defaults. Always go through
`effSeries`/`effRepos`/`curReps`/`curCharge` rather than reading `exById(id).series` directly.

**An override belongs to the programme, not to who wrote it.** `customFor()` used to require
`isCustom`, which meant a catalogue programme could not prescribe anything — a corrective
session asking for 12 reps where the sheet says 20 had no way to say so. The gate is gone;
`isCustom` still means "made by the user", and a catalogue programme with no `custom` map
falls back to the sheet exactly as before. `Workout.jsx` and `ProgramDetail.jsx` read the map
inline and must stay in step with `customFor()`.

The voice coach effect compares a computed signature string (`view|phase|index|paused|voiceOn`)
against a ref before restarting cadence — without it, every tick would cancel and restart
speech.

### Dictated programmes

`lib/programPrompt.js` + `lib/importProgram.js`, same two-halves-of-one-format rule as the
meals import. The invariant that shapes everything: **an imported session refers to catalogue
ids, never to invented exercises.** An exercise is cross-referenced by `demos.js`, `cues.js`
and `muscles.js`; one conjured by a model would have no demo, no voice cues and no place on
the body map — five features degraded to gain a name.

- The prompt therefore **embeds the whole catalogue** (178 lines, ~13 KB, generated from
  `EXERCISES` so it cannot drift). The parser resolves in three steps, each reported: id,
  then name, then substitution.
- **Substitution requires the muscle the assistant named.** A name that already failed to
  match is not a signal — that is how "rameur ergomètre" was once proposed as mountain
  climbers. A primary muscle outweighs a secondary (`0.35`), or lateral raises land on the
  push-up instead of the overhead press. `MUSCLES` bridges the everyday vocabulary
  ("abdominaux") to the catalogue's ("Sangle abdominale") with a curated `exos` list.
- An imported session is an ordinary `customWorkouts` entry, in the exact shape
  `SAVE_WORKOUT` produces, so nothing downstream can tell the difference.

### Data catalogues (`src/data/`)

Static content, all cross-referenced by exercise id. Invariants that aren't enforced by any
tooling:

- Every id in `muscles.js`, `programs.js`, `demos.js`, `cues.js` and an exercise's
  `similaires` must exist in `exercises.js`.
- Every `icon` slug must be registered in `src/components/ui/Icon.jsx`. Icons are imported by
  name on purpose — a namespace import would pull in the whole Phosphor library.
- `mat` uses a closed vocabulary (`Sans matériel · Haltères · Élastique · Salle · Maison`);
  the library filter matches it literally.
- Every muscle id needs at least one zone in `overlays/BodyMap.jsx` or it can't be selected.
  A new muscle also needs its `primaire` name listed in `ZONES` (`data/muscles.js`), or a
  session training it counts for no profile zone at all and the progress analysis reads it as
  unmeasured.

`scripts/solve-pose.mjs` solves a pose from positions — "hand on the bench, foot on the
floor" — instead of angles guessed by hand, which is the only way a pose that touches
anything comes out right. Adding an exercise is four files at once: the sheet in `exercises.js`, a demo in `demos.js`,
voice cues in `cues.js`, and the id in the right muscle's `exos` in `muscles.js`. A pose that
stands still is worth drawing carefully — **seen from the side, a standing figure with arms
along the body collapses into a single vertical line**, so the limbs are angled a few degrees
off vertical and the two sides split (`armB` / `legB`) to give the body some thickness.

Every entry carries `sollicitation` and `surcharge`, which the sheet's "Muscle ciblé" block
renders. They answer different questions from the fields around them and should not drift
into each other: `sollicitation` is the *mechanism* (contraction regime, where in the range
tension peaks) while `depart`/`mouvement` are the how-to, and `surcharge` is the *overload*
failure mode for that muscle or its tendon while `conseils` are per-rep execution cues. Both
are user-facing prose and stay training advice — nothing there diagnoses or treats.

`exercises.js` also carries two fields only the 35 lower-body entries use: `pattern` (one of the 7
`PATTERNS`) and `optionnel` (calves / advanced-audience entries). Filter through
`coreExercises()` / `groupByPattern()` / `exercisesByPattern()` rather than by hand — the
untagged upper-body and core exercises must land in the trailing `UNTAGGED_GROUP` so a
filtered list never silently drops a match.

### Animated demos

`data/demos.js` holds keyframe poses (hip position + one angle per joint, in a 100×100
viewBox); `lib/pose.js` does forward kinematics, interpolation and per-exercise viewBox
framing and is kept React-free; `components/ExerciseDemo.jsx` mutates SVG nodes imperatively
via refs so a running animation never re-renders the tree above it.

All 112 exercises have a demo. `demoFor(id)` still returns `null` for an unknown id and both
call sites degrade to the icon, so that guard stays — but a new exercise without a `DEMOS`
entry is a gap, not a supported state.

Two things to know before adding or editing a pose:

- **Poses are stored as angles but should be authored as positions.** Hand-guessing joint
  angles does not converge; solve them with two-link inverse kinematics from "hip here, foot
  there" and bake the result in. The knee/elbow bend sign picks which side the joint bulges
  — for a leg, `bend: -1` puts the knee forward.
- **The floor is `GROUND = 90`, and a standing figure has its hip at y≈58** (thigh 16 +
  shin 16). A support foot whose ankle does not land at y≈90 will look like it is hovering.

- **A movement whose plane is perpendicular to the screen cannot be drawn at all.** Scapular
  retraction happens across the back: from the side there is nothing to animate. The demo shows
  what a side view *can* show — the elbow travelling backwards and the chest opening — because
  a pose that animates the wrong thing is worse than one that animates a consequence. The same
  limit is why the two stretches set `cycle` themselves and move by a couple of degrees: a hold
  has no rep tempo to borrow, and the honest picture is a body that barely moves.

Anything a demo is performed on is declared as data, not drawn ad hoc: `scene` for the floor
and fixed apparatus, `props` for a bench/box/step or wall, and `weights` / `band` /
`ankleBand` / `legBand` / `ball` / `hipLoad` for gear that tracks a joint each frame. Adding
a new kind of equipment means touching three places — the renderer, `viewBox()` in
`lib/pose.js` so the crop includes it, and the header comment in `demos.js`.

Omit `cycle` to inherit the voice cadence (`CUES[id].beat × frames.length`) and stay in step
with the spoken cues; isometric holds set it explicitly since they have no rep tempo.

This makes `data/cues.js` do double duty: `beat` is both the gap between spoken cues and the
demo's tempo. A rep exercise therefore wants a two-entry `seq` matching its two keyframes —
one cue per phase — while a hold can carry a longer `seq` of reminders because its demo sets
`cycle` itself. `say()` cancels whatever is still speaking, so a cue longer than one beat is
cut off by the next: keep them to three words.

### Aide, FAQ et support

Four kinds of help, one rule: **nothing sends the user out of the app.** The contextual `?`
(`help.js` + `HelpSheet`) answers *what is this screen*; the help centre (`overlays/Help.jsx`)
answers *how do I* and *why does it do that*; the tours show it; the support form reaches a
human. They share one entry point and one piece of state.

- **`state.helpTopic` (`{ kind, id }`) is what the centre is showing** — `faq`, `ecran`,
  `tuto`, `cat`, `ecrans` or `support`. A tooltip's "En savoir plus", a FAQ cross-link and a
  search result all open the same thing, so an answer is rendered in exactly one place. Back
  goes up a level (answer → index → out), never straight out.
- **One search over three corpora** (`lib/helpSearch.js`): the user does not know whether
  their answer is a FAQ entry, a screen guide or a tutorial, so splitting the field in three
  would make them guess the app's filing. Accents and case are stripped on both sides — help
  typed on a phone keyboard rarely carries its accents — and every token must match by
  prefix, so words narrow rather than widen. The index is built once, from the display prose,
  and nothing is re-normalised per keystroke.
- **A tour step *is* a location.** `applyTourStep` in the reducer applies the step's `tab` or
  `view` in the same dispatch as the step index, which is what makes it impossible for the
  spotlight and the screen to disagree; `components/Tour.jsx` only measures the `data-tour`
  anchor and draws. The anchor is polled for ~700 ms because the target screen may still be
  mounting, then scrolled into view and re-measured after the smooth scroll lands. A missing
  anchor degrades to a centred card — `check-catalogue` verifies every `cible` exists in the
  source, so that path is a safety net, not a way of writing steps.
- **`tourDone` is the only persisted part.** It is set both by taking the tour and by
  dismissing the invitation on the Accueil, because an invitation that comes back is an
  advert. The tours themselves stay replayable from the centre for ever; a half-finished tour
  is never resumed.
- **A tip is not a shorter help entry.** `data/tips.js` answers the question the interface
  itself provokes ("noté sur 80 ?", "cibles perso ?") at the spot where it is asked; anything
  needing a paragraph belongs in `help.js` or the FAQ, and the tip links there instead of
  growing. `Tip` positions its bubble from the button's rect rather than in flow: every place
  a tip earns its keep is a tight row an in-flow bubble would break.
- **Support diagnostics are shown before they are sent** (`lib/diagnostics.js`). They carry
  build, device, OS, browser, display mode, screen, locale, theme and the *volume* of data —
  counts, never content — because "ça ne marche pas" is unanswerable without them and no user
  can be asked to look them up. The OpenRouter key is never read, only whether a model is
  set. `mailto:` fails silently on a device with no mail account, so the full text goes to the
  clipboard too and the screen says which happened.
- **During a workout, help is reachable but the help *centre* is not.** The top bar hides
  itself there, so the session's `help.js` entry is opened from the pause sheet — where the
  timers are frozen already — and `HelpSheet` drops its "Centre d'aide" button. That button
  opens an overlay, which would replace the workout view while `state.workout` kept ticking
  in memory with no way back; `START_TOUR` refuses mid-session for the same reason. `workout`
  and `complete` render outside the `OVERLAYS` map, so `check-catalogue` allows them a help
  entry without requiring one.
- UA parsing is guesswork and says so: every branch degrades to a family or to the raw string
  rather than claiming a wrong device (iOS never volunteers a model at all).

### Nutrition

Three food sources normalise onto one shape in `lib/food.js` — `{ id, source, nom, per100:
{ kcal, proteines, glucides, lipides, micros } }` — so nothing downstream branches on where a
food came from. Two invariants matter:

- **A missing micronutrient is unknown, never zero.** `per100.micros` is sparse on purpose,
  and `dailyScore` drops the component's weight from the denominator when too few are known.
  Defaulting a micronutrient to 0 would silently punish users for Open Food Facts' gaps —
  spot-checking four popular products returned 0, 0, 1 and 3 of the six the score reads.
- **The scanner has two engines and neither is bundled eagerly.** Native `BarcodeDetector`
  first, `@zxing/browser` (dynamic import) where it is missing — that fallback is what makes
  iOS Safari and Firefox work. The zxing chunk is named via `manualChunks` in
  `vite.config.js` and deliberately **excluded from the precache** (`globIgnores`) with a
  runtime `CacheFirst` rule instead: precaching it would push ~466 KB onto every Android and
  desktop user for code they never run. Don't "fix" that by dropping the globIgnores.
- **`searchCiqual` is async, and deliberately so.** The table is ~530 KB — most of the app's
  payload — and is only needed once food search opens, so `data/ciqual.js` is a lazily
  imported chunk (`loadCiqual()`, memoised, failure not cached). It is still precached by the
  service worker, so offline search works after the first visit; verified. Don't turn the
  import back into a static one to make the function synchronous.
- **CIQUAL rows can carry macros with `kcal: 0`** (968 of 3 167). `fromCiqual` derives the
  energy with the Atwater factors in that case; treating 0 as a real value shows a 0 kcal
  lentil and wrecks the calorie half of the score.

**`foodCache` is user-visible now**, not just an offline safety net: the search screen lists
all of it under "Mes aliments" and ranks it above every other source. Two consequences —
a food's `id` is what deduplicates that list, so ids have to stay stable and deterministic
per food rather than carrying a timestamp, and anything written into the cache shows up in
the user's own list. `groupByInitial`/`searchCache` in `lib/food.js` own the ordering.

**Daily targets are computed, then overridable.** `dailyTargets()` derives kcal and the three
macros from the profile, and lets `profile.kcalCible / protCible / glucCible / lipCible`
replace any of them — empty means "keep computing it". A manual calorie or protein target
feeds the carb/fat split, so the plate stays coherent with what the user set. `autoTargets()`
returns the pure calculation, which the profile screen shows as the field's placeholder so an
override is always reversible. `targets.manuel` says which are set by hand.

`GOALS` is ordered for the picker, so **nothing may resolve a goal by position** — `goalDef()`
falls back by key. Each goal carries its own `aide`, shown under the picker: four pills whose
difference is a calorie delta and a protein ratio are not self-explanatory, and
`recomp` in particular has to say what body recomposition is (two processes at once, not fat
turning into muscle) and who it works for.

Every tunable number — score weights, micronutrient references, protein g/kg, calorie
tolerance, activity multipliers — lives in `data/nutrition.js`. Don't scatter them back into
the maths or the UI.

**A fourth way in: a meal dictated to a chat assistant.** `lib/mealPrompt.js` holds the
prompt the user pastes into Claude or ChatGPT and `lib/importMeals.js` reads the JSON back —
they are two halves of one format and must move together, which is why the prompt derives its
meal keys and micronutrient list from `data/nutrition.js` instead of restating them.

- **The format asks for `grammes` + `pour100g`, never the portion's totals.** That is the
  shape `nutriLog` stores, so an imported quantity stays editable and rescales like any other
  entry. A model that flattened the macros onto the food is still read, but the user is told
  in a warning how the values were interpreted — that is exactly where a portion total would
  land unnoticed.
- **The input is model output, so it is parsed defensively**: fences and prose around the
  object, English or French field names, a `days` array or a bare day or a bare meal, a meal
  routed by its hour when unnamed. A food that cannot be used is dropped with a warning
  rather than failing the import, and `parseMealsImport` throws only when nothing survives.
- **A micronutrient the model wrote as 0 is dropped**, because no real food is exactly at
  zero iron or calcium and a filled-in zero would be scored as a known value — the one thing
  the module's "unknown is never zero" rule exists to prevent. Fibre is the exception and
  keeps its zero: meat, eggs and dairy really are at 0 g.
- **A food the assistant named but did not compose is resolved against the user's own foods
  first, then CIQUAL** (`lib/ciqualMatch.js`), which is why `parseMealsImport` is async. A
  scanned product beats any generic — real brand values, and a food this person eats — and it
  is reused as-is, id included, so it stays one entry in `foodCache`. `matchCache` drops the
  head-word guard `matchCiqual` needs: that guard exists because CIQUAL names always lead
  with the base food ("Oeuf, blanc"), which a brand name has no reason to do. This is a different job
  from `searchCiqual`: there, a human picks from a ranked list; here nobody picks, so a wrong
  match is silently wrong data. `matchCiqual` therefore answers *confidently or not at all* —
  every query token must appear in the candidate, and the candidate's **first** word must be
  one the query named, which is what stops "Cookie aux pépites de chocolat" from answering
  "pépites de chocolat". An unresolved food is dropped and **named in a warning** rather than
  imported empty. A resolved one keeps the dictated wording as its label and carries
  `ciqualNom`, which the preview shows — the table has no plain "chocolat noir" and cannot
  tell cooked rice from raw, so the entry used has to be visible before the import lands.
- **Assistants keep inventing shapes, so the parser widens rather than the prompt.** Meals
  arrive as a list *or* as a map keyed by meal; a composed dish's nested `composition` is
  flattened into the meal, since the ingredients are the food and the wrapper has no values
  of its own. Three rounds of real ChatGPT output are in this file's history — assume a
  fourth.
- **`matchCiqual` splits query tokens into hard and soft.** A word or figure that qualifies
  a food without identifying it ("fraîches", "bio", "82 %") must not be required of a
  candidate — that rejected "figues fraîches" against "Figue, crue" — but it scores in
  favour when present, which is what makes "riz basmati cuit" choose the cooked entry.
- **A bare `quantity` is never read as grams.** Models write `quantity_g` when they mean a
  weight and `quantity` for a count of pieces ("quantity": 1 for one egg) or for prose
  ("petite quantité"); reading that as grams logged one gram of egg. It falls back to 100 g
  with a warning instead — wrong, but visibly wrong and one tap to fix.
- Parsing and applying are separate on purpose: the overlay previews the days before
  `IMPORT_MEAL_DAYS` touches the log, and 'replace' clears only the meals the import carries.
- **`PROMPT-REPAS.md` at the root is generated, not written** (`npm run gen-prompt`). It
  mirrors the same prompt for reading outside the app; editing it by hand forks the format.
  Change `mealPrompt.js`, then regenerate.

`lib/off.js` cannot send a `User-Agent`: it is a forbidden header name and browsers drop it
silently (verified). It identifies the app with OFF's `app_name`/`app_version` query
parameters instead. If this is ever reused from React Native, send a real header there.

### Walking (`activityLog`)

A separate persisted slice, `{ [dateKey]: entry[] }`, deliberately **not** part of `sessionLog`:
a walk is not a workout, and letting it in would inflate the streak, the badges and the weekly
chart. It has its own two badges instead. `lib/activity.js` owns the model, `data/activity.js`
every tunable number, and the day's `{ km, minutes, kcal }` is always derived (`dayActivity`),
never stored twice.

- **Energy is net, and never touches the calorie target.** `0.5 kcal × poids × km` above
  resting metabolism; a duration without a distance falls back to METs *minus one* so both
  paths measure the same thing. The daily target already contains all-day activity through
  the BMR × frequency multiplier, so adding walking to it would count the same kilometres
  twice — walking is shown *beside* the intake, the way training kcal already are, and
  nothing presents a net balance.
- `dayActivity` recomputes kcal from the **current** weight rather than summing what was
  stored, so correcting a weight fixes past estimates instead of leaving them frozen.
- **A duration can stand in for a distance.** `estimateFromDuration` multiplies step length
  (height × gait coefficient, nudged by sex) by the gait's cadence — a step length alone
  cannot answer "how far in 40 minutes", which is why `WALK_TYPES` carries both and the pair
  is calibrated against the speed that gait really implies. A typed distance always wins, and
  the UI shows the workings so an estimate never passes for a measurement.
- **No background step counting exists for a PWA**, so the app does not pretend to have it:
  the GPS mode is an explicit "suivre ma marche" that only runs with the app open. Fixes are
  filtered by `trackStep` (accuracy, minimum step, jump) — a phone standing still reports a
  wandering position that would otherwise accumulate kilometres.

### The Progress screen

Every figure on it is derived from `sessionLog` — nothing is seeded. The four zones are
reachable rather than decorative: the total tile expands the full history, a chart bar filters
it to that rolling week (`weeklySessions` in `useDerived`, from `sessionsByWeek`), and the two
totals open a breakdown from `lib/sessionStats.js`. Week labels are computed from how many
buckets the chart got, so changing `weeksBack` cannot desync them from a hand-written list.

### "Analyse IA des progrès"

A second, separate engine pair from the day's analysis, answering a different question: is
what you *do* taking you towards what you *said you wanted*? So it is framed by the profile's
objectives — `objectif`, `zones`, `objectifNutrition` and the daily targets, plus
`contraintes` — over a 4-week window compared against the 4 before it.

- `lib/progressAnalysis.js` computes it on-device; `requestProgressAnalysis` in
  `openrouter.js` asks a configured model instead, from **the same `progressStats()` object**
  the local engine works from, so the two answer from identical facts. Failure falls back to
  local and says why, exactly like the day's analysis.
- **It is never persisted.** The day's analysis is cached because a past day stops changing;
  this one reads a window that moves daily, so a stored copy would age into a wrong answer.
- A theme with no data is reported as unmeasured and **its weight leaves the score's
  denominator** — the same rule as the nutrition score, for the same reason.
- `data/muscles.js` carries the `ZONES` bridge: `profile.zones` holds coarse labels
  ("Jambes") while a session's `muscles` holds primary muscle names ("Quadriceps"). The two
  vocabularies never match by string, so the mapping is explicit and `sessionHitsZone()` is
  the only thing that should compare them.

### "Analyse IA"

Two engines behind one shape (`resume/energie/tonus/progression/aFaire/ameliorer`), chosen
in `runAnalysis`: `src/lib/analysis.js` computes it on-device, and `src/lib/openrouter.js`
asks a user-configured OpenRouter model instead when both a key and a model are set. Any
OpenRouter failure falls back to the local engine and surfaces the reason — **never leave
the user with no analysis**, and never let a model's output reach the UI unvalidated
(`parseAnalysis` extracts the outermost JSON object and coerces every field, because models
differ in how well they honour "JSON only").

**A result is cached per day in `analysisLog` and survives a reload** — `initialState()`
seeds `state.analysis`/`analysisSource` from `analysisLog[dateKey()]` at startup, so the
Journal doesn't need a fresh (and for OpenRouter, billed) call just to redisplay what it
already showed. `ANALYSIS_DONE` writes the cache; the only place it is evicted is
`withStaleAnalysisFor()`, called from both `finishWorkout()` and `ADD_MANUAL_SESSION` —
a session logged for that day makes the standing analysis stale, so it is dropped rather
than left to describe a day that has since changed.

Two things about the OpenRouter integration are deliberate:

- **The free model list is fetched, not hard-coded.** OpenRouter's free line-up changes
  constantly, so any baked-in list rots. `fetchFreeModels()` decides "free" from the price
  rather than the `:free` id suffix, and requires text-only output — several zero-priced
  entries are audio/music models that cannot answer a chat completion.
- **The key is stored in `localStorage` and sent from the browser.** There is no backend to
  hold it, so it is readable by anything with access to the device. The settings screen says
  so plainly; don't quietly drop that warning.

## Conventions

- **UI strings are French.** Data fields use French names too (`nom`, `niveau`, `mat`,
  `series`, `repos`, `erreurs`…). Code, comments and commit messages are English.
- **Styling** is Nocturne tokens (`src/styles/tokens.css`) plus a small set of shared classes
  in `app.css` (`.screen`, `.overlay`, `.row-card`, `.section-label`, `.empty-state`…).
  Everything else is inline styles. Colors, radii and shadows always go through
  `var(--color-…)` tokens; spacing is written as plain numbers inline.
- **Two themes, one rule: never write a colour outside the tokens.** Dark lives on bare
  `:root`, light under `:root[data-theme='light']`, and *the light theme inverts each ramp
  rather than shifting it* — steps 100–600 are text roles and 800–900 are fills (verified: no
  token is used as both), which is what lets several hundred inline `var(--color-…)` usages
  theme themselves with no component change. A hardcoded hex is now a bug in one of the two
  themes; `--color-warn` / `--color-good` exist for the orange and green that used to be
  written inline. The exceptions are deliberate and documented where they sit: the
  Nutri-Score palette (a standardised scale) and the camera viewfinder.
  `src/lib/theme.js` owns the vocabulary and is the only place that writes `data-theme`;
  `index.html` pre-applies it before first paint from the same persisted key.
  `project/_ds/nocturne-…/_adherence.oxlintrc.json` is the design handoff's adherence config
  — it is *not* wired into `npm run lint`.
- `project/` and `chats/` are the original Claude Design handoff (exported prototype and the
  design conversation). Treat them as reference material, not as code to keep in sync.
  `project/support.js` is lint-ignored.
- Keep `CHANGELOG.md` updated when landing a user-visible change.
