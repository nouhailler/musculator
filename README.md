# Musculator

A mobile-first PWA for muscle-building strength training: personalized programs, guided
sessions with a rest timer and a French voice coach, a muscle map, an exercise library, and
a daily journal with an on-device "AI analysis" of your training.

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

## What's implemented

- **Accueil** — today's progress ring, week streak, one-tap "Commencer une séance", quick
  tips, recommended programs, medical disclaimer.
- **Séance guidée** — exercise/rest phases, per-set stopwatch, rest countdown (+15s/skip),
  editable reps/charge/notes per exercise, a fullscreen "big buttons" mode for a phone
  propped up next to you, and a French voice coach (Web Speech API) that calls out reps in
  rhythm and encouragement, per exercise.
- **Programmes** — filterable by duration/level/equipment, plus a workout builder to compose
  and save custom sessions (exercises, series, reps, charge, rest, order).
- **Bibliothèque** — searchable exercise catalogue with full technique sheets (setup,
  movement, breathing, common mistakes, safety tips, easier/harder variants).
- **Cartographie musculaire** — front/back muscle map; sollicitation level and recovery state
  are derived from your real session history, not fixed demo numbers.
- **Journal & Analyse IA** — today's sessions plus a structured training analysis (energy,
  muscle stimulus, progress toward your goal, what to do next). See below.
- **Progrès** — streak, sessions/week chart, badges (unlock from real usage), full history.

## About the "Analyse IA"

The original design called for a live LLM (OpenRouter). This build ships without a backend
or API key, so `src/lib/analysis.js` computes a structured, personalized-looking analysis
directly from your profile and session log instead of calling a model. The output shape
(`resume/energie/tonus/progression/aFaire/ameliorer`) is exactly what a real model call would
need to fill in — swapping `generateAnalysis()` for a backend request is the only change
required to wire up a real model later; no caller needs to change.

## Project layout

```
src/
  data/        exercise/program/badge/muscle/cue catalogues (static content)
  lib/         pure helpers: formatting, streak/muscle-stat derivation, voice, analysis
  state/       single Context + reducer store, localStorage-backed
  components/  shared chrome (tab bar, banners, modals) and ui/ primitives
  screens/     the 5 tab screens
  overlays/    full-screen views pushed on top of a tab (exercise sheet, workout, etc.)
```

## Origin

This app was implemented from a Claude Design prototype handoff (see `chats/` for the
original design conversation and `project/` for the exported HTML/CSS/JS prototype it was
built from).
