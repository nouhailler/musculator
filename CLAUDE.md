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
```

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

**Persistence covers 9 slices only** — `profile`, `customWorkouts`, `sessionLog`,
`disclaimerAcked`, `voiceOn`, `openrouter`, `nutriLog`, `foodCache`, `theme`, under the key `musculator:v1`. Everything else (current tab,
filters, in-progress workout) is deliberately ephemeral. Adding a durable field means
touching both `loadPersisted()` and the persist effect in `store.jsx`.

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
than an empty sheet. Adding a screen means adding its help entry — nothing enforces it.

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

Session entries are append-only and persist across upgrades, so **anything read from a
`sessionLog` entry must tolerate its absence** — `partial` and `exosTotal` postdate the
first entries and are simply falsy on older ones, which is why the journal treats a missing
flag as a complete session rather than as unknown.

**`w.setsByEx` is the record of what was performed**, written in `FINISH_SET` — the single
place a set is ever counted. Everything downstream reads it rather than the program's
prescription, because a session can end early: `finishWorkout()` is the one exit that logs a
run and shows the summary, and it takes a `partial` flag for a run stopped by the ×. Don't
reintroduce a prescription-based count; for a completed program the two agree anyway.

Per-exercise series/reps/charge/rest resolve through `src/lib/workout.js`, which layers a
custom workout's `custom[exId]` overrides on top of the catalogue defaults. Always go through
`effSeries`/`effRepos`/`curReps`/`curCharge` rather than reading `exById(id).series` directly.

The voice coach effect compares a computed signature string (`view|phase|index|paused|voiceOn`)
against a ref before restarting cadence — without it, every tick would cancel and restart
speech.

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

All 45 exercises have a demo. `demoFor(id)` still returns `null` for an unknown id and both
call sites degrade to the icon, so that guard stays — but a new exercise without a `DEMOS`
entry is a gap, not a supported state.

Two things to know before adding or editing a pose:

- **Poses are stored as angles but should be authored as positions.** Hand-guessing joint
  angles does not converge; solve them with two-link inverse kinematics from "hip here, foot
  there" and bake the result in. The knee/elbow bend sign picks which side the joint bulges
  — for a leg, `bend: -1` puts the knee forward.
- **The floor is `GROUND = 90`, and a standing figure has its hip at y≈58** (thigh 16 +
  shin 16). A support foot whose ankle does not land at y≈90 will look like it is hovering.

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
- Parsing and applying are separate on purpose: the overlay previews the days before
  `IMPORT_MEAL_DAYS` touches the log, and 'replace' clears only the meals the import carries.
- **`PROMPT-REPAS.md` at the root is generated, not written** (`npm run gen-prompt`). It
  mirrors the same prompt for reading outside the app; editing it by hand forks the format.
  Change `mealPrompt.js`, then regenerate.

`lib/off.js` cannot send a `User-Agent`: it is a forbidden header name and browsers drop it
silently (verified). It identifies the app with OFF's `app_name`/`app_version` query
parameters instead. If this is ever reused from React Native, send a real header there.

### "Analyse IA"

Two engines behind one shape (`resume/energie/tonus/progression/aFaire/ameliorer`), chosen
in `runAnalysis`: `src/lib/analysis.js` computes it on-device, and `src/lib/openrouter.js`
asks a user-configured OpenRouter model instead when both a key and a model are set. Any
OpenRouter failure falls back to the local engine and surfaces the reason — **never leave
the user with no analysis**, and never let a model's output reach the UI unvalidated
(`parseAnalysis` extracts the outermost JSON object and coerces every field, because models
differ in how well they honour "JSON only").

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
