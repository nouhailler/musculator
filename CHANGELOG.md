# Changelog

All notable changes to Musculator are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project has no released versions yet (`package.json` is at `0.0.0`), so entries are
grouped by date and reference the commit they landed in.

## [Unreleased]

### Added

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
