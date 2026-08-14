# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server on http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build on :4173
npm run lint       # oxlint
npm run gen-icons  # regenerate public/icons/*.png
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

**Persistence covers 5 slices only** — `profile`, `customWorkouts`, `sessionLog`,
`disclaimerAcked`, `voiceOn`, under the key `musculator:v1`. Everything else (current tab,
filters, in-progress workout) is deliberately ephemeral. Adding a durable field means
touching both `loadPersisted()` and the persist effect in `store.jsx`.

### Navigation

No router. `state.tab` picks one of 5 tab screens, `state.view` pushes a full-screen overlay
on top. `App.jsx` maps both. Note that `workout` and `complete` are handled by their own
conditionals rather than through the `OVERLAYS` map, because they render outside the normal
overlay chrome.

### The guided session

`AppProvider` runs a single global 1s `setInterval` dispatching `TICK`; the reducer bails out
immediately unless a workout is active and unpaused. The workout state machine
(`phase: 'exercise' | 'rest'`, `restKind: 'series' | 'exercise'`) lives entirely in the
reducer — `FINISH_SET` is the interesting case: it either advances the set, advances the
exercise, or finishes the session and appends a `sessionLog` entry.

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

`exercises.js` carries two fields only the 35 lower-body entries use: `pattern` (one of the 7
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

### "Analyse IA"

`src/lib/analysis.js` is a local heuristic, not a model call — this build has no backend or
API key. It returns the exact shape a real LLM response was designed to fill
(`resume/energie/tonus/progression/aFaire/ameliorer`). Replacing the body of
`generateAnalysis()` with a backend request is the whole migration; no caller changes.

## Conventions

- **UI strings are French.** Data fields use French names too (`nom`, `niveau`, `mat`,
  `series`, `repos`, `erreurs`…). Code, comments and commit messages are English.
- **Styling** is dark-theme-only Nocturne tokens (`src/styles/tokens.css`) plus a small set
  of shared classes in `app.css` (`.screen`, `.overlay`, `.row-card`, `.section-label`,
  `.empty-state`…). Everything else is inline styles. Colors, radii and shadows always go
  through `var(--color-…)` tokens; spacing is written as plain numbers inline.
  `project/_ds/nocturne-…/_adherence.oxlintrc.json` is the design handoff's adherence config
  — it is *not* wired into `npm run lint`.
- `project/` and `chats/` are the original Claude Design handoff (exported prototype and the
  design conversation). Treat them as reference material, not as code to keep in sync.
  `project/support.js` is lint-ignored.
- Keep `CHANGELOG.md` updated when landing a user-visible change.
