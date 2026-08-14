# Musculator

A mobile-first PWA for muscle-building strength training: personalized programs, guided
sessions with a rest timer, animated exercise demos and a French voice coach, a muscle map,
an exercise library, and a daily journal with an on-device "AI analysis" of your training.

Built with React + Vite, installable and offline-capable (`vite-plugin-pwa`). All data —
profile, custom workouts, session history — is stored locally (`localStorage`); there's no
backend.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build locally
npm run lint       # oxlint
npm run gen-icons  # regenerate public/icons/*.png from scripts/gen-icons.mjs
```

There's also a Playwright smoke script that walks the main flows and drops screenshots in
`/tmp/shot-*.png`. It has no npm script and expects a build being served on port 4173:

```bash
npm run build && npm run preview &
node scripts/smoke.mjs
```

It launches Chromium from a hard-coded `/opt/pw-browsers/chromium`; adjust `executablePath`
in the script if your Playwright browsers live elsewhere.

## What's implemented

- **Accueil** — today's progress ring, week streak, one-tap "Commencer une séance", quick
  tips, recommended programs, medical disclaimer.
- **Exercice seul** — a big "Faire cet exercice maintenant" button on any exercise sheet
  starts a one-exercise session straight away: no program to build, as many sets as you
  want, logged in the journal like any other session. Meant for a quick set during a break
  rather than a full workout.
- **Séance guidée** — exercise/rest phases, per-set stopwatch, rest countdown (+15s/skip),
  editable reps/charge/notes per exercise, a fullscreen "big buttons" mode for a phone
  propped up next to you, an animated demo of the current exercise, and a French voice coach
  (Web Speech API) that calls out reps in rhythm and encouragement, per exercise.
- **Sortie de séance** — closing a session offers to save what you have already done rather
  than discarding it; a partial session is logged from the sets actually performed.
- **Programmes** — filterable by duration/level/equipment, plus a workout builder to compose
  and save custom sessions (exercises, series, reps, charge, rest, order).
- **Bibliothèque** — searchable exercise catalogue (45 exercises) grouped by movement
  pattern, with full technique sheets (setup, movement, breathing, common mistakes, safety
  tips, easier/harder variants), an animated demo of every movement, and a "Muscle ciblé"
  block explaining how the target muscle is actually loaded and what to watch so it isn't
  overworked.
- **Nutrition** — barcode scanning and food search (Open Food Facts + a bundled offline
  generic table), a day/meal food journal, a live macro dashboard against targets derived
  from your profile, and the **Score Musculation Quotidien** tying the two together. Can
  import a Nutritor journal CSV.
- **Cartographie musculaire** — front/back muscle map over 13 muscle zones; sollicitation
  level and recovery state are derived from your real session history, not fixed demo
  numbers.
- **Journal & Analyse IA** — today's sessions plus a structured training analysis (energy,
  muscle stimulus, progress toward your goal, what to do next). See below.
- **Progrès** — streak, sessions/week chart, badges (unlock from real usage), full history.

## Exercise catalogue

45 exercises. The 10 original upper-body/core movements came from the design prototype; the
35 lower-body ones (thighs / glutes) were added on top and carry two extra fields:

- `pattern` — one of the 7 `PATTERNS` in `src/data/exercises.js` (Poussée dominante genou,
  Fentes, Hinge, Abduction, Extension de hanche, Adducteurs, Mollets). The library groups by
  it; the untagged upper-body/core exercises fall into a trailing "Haut du corps & core"
  group rather than being dropped.
- `optionnel` — marks the 8 entries outside the thighs/glutes focus (calves) or reserved for
  an advanced audience (front squat, pistol squat, GHR…). The library hides them by default
  behind an "Optionnels" toggle.

Use the helpers rather than filtering `EXERCISES` by hand: `coreExercises({ optionnels })`,
`groupByPattern(list)`, `exercisesByPattern({ optionnels })`, `exById(id)`.

## Animated demos

Every one of the 45 exercises has an animated demonstration, shown in its library sheet and
during a guided session — so you can always see the movement rather than read it.

`src/data/demos.js` holds keyframe poses for a stick-figure skeleton rendered by
`src/components/ExerciseDemo.jsx`; `src/lib/pose.js` does the forward kinematics, pose
interpolation and per-exercise viewBox framing (React-free, so poses can be solved outside
the app). A pose carries a hip position plus one angle per joint in a 100×100 viewBox;
frames loop cyclically, so a normal exercise is just `[top, bottom]`.

A demo also declares the equipment it is performed on, and the renderer draws it: a floor,
mat, pull-up bar or dip bars (`scene`), a bench/box/step or a wall (`props`), and moving
gear that tracks the body — dumbbells, a loaded bar or a kettlebell in the hands
(`weights`), an elastic anchored to a hand or ankle (`band` / `ankleBand`), an elastic
stretched between the legs (`legBand`), a ball at the knees or heels (`ball`), and a bar
across the hips (`hipLoad`). The full field reference is in the header of `demos.js`.

Loop timing defaults to the voice cadence (`CUES[id].beat × frames.length`) so the figure
moves in step with the spoken cues; isometric holds (wall sit, Copenhagen, ball squeeze)
set `cycle` explicitly. Every exercise has its own cue pair and tempo in `src/data/cues.js`,
so explosive work moves fast and eccentric work moves slowly, in speech and animation
alike. Readers who prefer less motion get the starting position and nothing moves — the
component honours `prefers-reduced-motion`.

## Nutrition module

Three food sources behind one shape (`src/lib/food.js`), so a scanned product, a generic and
a hand-typed food are interchangeable:

- **Open Food Facts** — barcode lookup and text search. The retry/timeout policy and the
  relevance ranking are ported from Nutritor's `openFoodFacts.ts`. Every fetched product is
  cached in `foodCache` so it can be re-added with no network.
- **CIQUAL** (`src/data/ciqual.js`) — 3 167 generic French foods bundled with the app, so
  search works fully offline and covers foods that have no barcode. It also carries the
  micronutrients OFF usually lacks, which is what makes the score's third component work.
  It is loaded as a separate chunk the first time food search opens — it is bigger than the
  rest of the app — but is precached, so offline search still works.
- **Manual entry** — always available, for home-made food.

### Score Musculation Quotidien (/100)

`src/lib/dailyScore.js`, weighted from `src/data/nutrition.js`:

| Composante | Poids | Règle |
|---|---|---|
| Protéines | 40 | `min(consommé / cible, 1) × 40` |
| Calories | 40 | plein dans une bande de ±10 %, puis décroissant avec l'écart relatif |
| Micronutriments | 20 | part des micronutriments **renseignés** ayant atteint leur seuil |

A micronutrient nobody logged data for is *unknown*, not zero. Below half the list known, the
component is reported as "données insuffisantes" and **its weight leaves the denominator** —
the day is scored out of 80 rather than punished for Open Food Facts' gaps.

Targets come from the training profile the app already collects (Mifflin-St Jeor scaled by
the weekly training frequency), shifted by a nutrition goal that is deliberately separate
from the training objective — you can train for force while cutting.

## About the "Analyse IA"

Two engines, same output shape (`resume/energie/tonus/progression/aFaire/ameliorer`), so
nothing downstream can tell which one answered:

- **On-device (default).** `src/lib/analysis.js` computes a structured, personalized
  analysis from your profile and session log. No key, no network, works offline.
- **OpenRouter (optional).** Add your own key and pick a free model under *Mon profil &
  objectifs → Analyse IA*, and that model writes the analysis instead. The free line-up is
  fetched live from OpenRouter — free is decided from the price, not the `:free` id suffix —
  so the list never goes stale, and audio/music models are filtered out since they cannot
  answer a chat completion.

If an OpenRouter call fails for any reason — bad key, rate limit, malformed JSON — the app
falls back to the on-device engine and says so rather than leaving you with nothing.

**About the key:** there is no backend, so the key is stored in `localStorage` on the device
and sent straight from the browser to OpenRouter. Anyone with access to the device can read
it. Use a key you are willing to expose that way, and set a spend limit on it.

## Project layout

```
src/
  data/        exercise/program/badge/muscle/cue/demo catalogues (static content)
  lib/         pure helpers: formatting, streak/muscle-stat derivation, pose
               kinematics, voice, analysis
  state/       single Context + reducer store, localStorage-backed
  components/  shared chrome (tab bar, banners, modals), the demo renderer,
               and ui/ primitives
  screens/     the 5 tab screens
  overlays/    full-screen views pushed on top of a tab (exercise sheet, workout, etc.)
```

## Origin

This app was implemented from a Claude Design prototype handoff (see `chats/` for the
original design conversation and `project/` for the exported HTML/CSS/JS prototype it was
built from).
