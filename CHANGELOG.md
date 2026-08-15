# Changelog

All notable changes to Musculator are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project has no released versions yet (`package.json` is at `0.0.0`), so entries are
grouped by date and reference the commit they landed in.

## [Unreleased]

### Added

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
