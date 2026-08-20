import { useEffect, useMemo, useReducer, useRef } from 'react';
import { progById, soloProgram } from '../data/programs.js';
import { exById } from '../data/exercises.js';
import { dateKey, fmt, nowHM, startOfWeekKey } from '../lib/format.js';
import { AppContext } from './context.js';
import { effRepos, effSeries, baseReps, baseCharge } from '../lib/workout.js';
import { generateAnalysis } from '../lib/analysis.js';
import { fetchFreeModels, checkKey, requestAnalysis, requestProgressAnalysis } from '../lib/openrouter.js';
import { generateProgressAnalysis, progressStats } from '../lib/progressAnalysis.js';
import { dailyTargets } from '../lib/macros.js';
import { makeActivityEntry } from '../lib/activity.js';
import { toCustomWorkouts } from '../lib/importProgram.js';
import {
  backupFilename, buildBackup, deliverBackup, mergeBackup, replaceFromBackup,
} from '../lib/backup.js';
import { startCadence, stopSpeaking, say } from '../lib/voice.js';
import { applyTheme, DEFAULT_THEME, isTheme } from '../lib/theme.js';
import { applyUpdate, BUILD_ID, checkForUpdate, hardReload, onUpdateStatus, updateAvailable } from '../lib/pwa.js';
import { MEALS } from '../data/nutrition.js';
import { mergeLog, parseNutritorCSV } from '../lib/importNutritor.js';
import { applyImport, importedFoods } from '../lib/importMeals.js';
import { tourById } from '../data/tours.js';
import { LEGAL_VERSION } from '../data/legal.js';
import { sendSupport as sendSupportMail } from '../lib/diagnostics.js';

const STORAGE_KEY = 'musculator:v1';
const KCAL_PER_MIN = 9;

const defaultProfile = {
  prenom: '', sexe: 'Homme', age: '', poids: '', taille: '', poidsCible: '',
  experience: 'Débutant', objectif: 'Prise de masse', zones: [], frequence: 4, contraintes: '',
  objectifNutrition: 'maintien',
  // Daily nutrition targets. Empty means "keep deriving it from the profile";
  // a value overrides the calculation in lib/macros.js.
  kcalCible: '', protCible: '', glucCible: '', lipCible: '',
  // Daily walking distance. Nothing derives it, so empty simply means "no
  // objective set" and the rings show the suggested value as a placeholder.
  kmCible: '',
};

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return {
      profile: { ...defaultProfile, ...(p.profile || {}) },
      customWorkouts: Array.isArray(p.customWorkouts) ? p.customWorkouts : [],
      sessionLog: Array.isArray(p.sessionLog) ? p.sessionLog : [],
      disclaimerAcked: !!p.disclaimerAcked,
      // The notice version that was accepted. Recorded so a future change can
      // be told from the first acceptance; nothing re-shows the notice on a
      // bump today (see needsLegalAck in data/legal.js).
      legalVersion: typeof p.legalVersion === 'string' ? p.legalVersion : '',
      voiceOn: p.voiceOn !== false,
      // Whether the guided tour has been offered. Persisted so the invitation
      // on the Accueil appears once; the tours themselves stay replayable from
      // the help centre for ever.
      tourDone: !!p.tourDone,
      openrouter: {
        key: typeof p.openrouter?.key === 'string' ? p.openrouter.key : '',
        model: typeof p.openrouter?.model === 'string' ? p.openrouter.model : '',
      },
      theme: isTheme(p.theme) ? p.theme : DEFAULT_THEME,
      // { [dateKey]: { [mealKey]: entry[] } }
      nutriLog: (p.nutriLog && typeof p.nutriLog === 'object') ? p.nutriLog : {},
      // Every food ever fetched, kept so it can be re-added with no network.
      foodCache: (p.foodCache && typeof p.foodCache === 'object') ? p.foodCache : {},
      // Free-text notes, one per day, kept independent of the session log.
      dayNotes: (p.dayNotes && typeof p.dayNotes === 'object') ? p.dayNotes : {},
      // Walking, kept out of sessionLog on purpose: a walk is not a workout,
      // and letting it count as one would inflate the streak, the badges and
      // the weekly chart. { [dateKey]: entry[] }, like nutriLog.
      activityLog: (p.activityLog && typeof p.activityLog === 'object') ? p.activityLog : {},
      // Cached AI analysis per day, so it survives a reload. Invalidated
      // whenever a new session is logged for that day (see finishWorkout).
      analysisLog: (p.analysisLog && typeof p.analysisLog === 'object') ? p.analysisLog : {},
    };
  } catch {
    return null;
  }
}

function initialState() {
  const persisted = loadPersisted() || {
    profile: defaultProfile, customWorkouts: [], sessionLog: [], disclaimerAcked: false, legalVersion: '', voiceOn: true,
    openrouter: { key: '', model: '' }, nutriLog: {}, foodCache: {}, theme: DEFAULT_THEME,
    dayNotes: {}, analysisLog: {}, activityLog: {}, tourDone: false,
  };
  // A cached analysis for today survives a reload — it is invalidated
  // (see finishWorkout) the moment a new session makes it stale.
  const cachedAnalysis = persisted.analysisLog[dateKey()] || null;
  return {
    ...persisted,
    tab: 'home', view: null,
    menuOpen: false, helpOpen: false,
    // Help centre: the search box, and the answer being read (`{ kind, id }`
    // where kind is 'faq' | 'ecran' | 'tuto'). Both ephemeral — reopening the
    // centre starts from the index, which is where someone lost arrives.
    helpQuery: '', helpTopic: null,
    // The running interactive tutorial, `{ id, step }`. Never persisted: a
    // half-finished tour is not something to resume three days later.
    tour: null,
    // The support form. `statut` is what the screen says after the mail app
    // was handed the message.
    support: { sujet: '', message: '', statut: '' },
    selExId: 'pompes', selProgId: 'fullbody',
    bodySide: 'front', selMuscleId: 'pecs',
    libSearch: '', libLevel: 'Tous', libMat: 'Tous', libOptionnels: false,
    fLevel: 'Tous', fEquip: 'Tous', fDur: 'Toutes',
    builder: { name: '', duree: 30, objectif: 'Prise de masse', exos: [], pickerOpen: false },
    workout: null,
    completeSummary: null,
    analysis: cachedAnalysis ? cachedAnalysis.analysis : null, analysisLoading: false, analysisError: '',
    analysisSource: cachedAnalysis ? cachedAnalysis.source : null,
    // Progress analysis — never persisted: it reads a window that moves daily,
    // so a stored copy would age into a wrong answer.
    progressAnalysis: null, progressLoading: false, progressError: '', progressSource: null,
    // Transient model-picker state: fetched live, never persisted.
    orModels: [], orLoading: false, orError: '', orStatus: '',
    // Nutrition: the day being viewed, plus transient search state.
    nutriDate: dateKey(), nutriMeal: MEALS[0].key,
    foodQuery: '', foodResults: [], foodLoading: false, foodError: '', foodPending: null,
    importStatus: '', importError: '',
    // Service-worker update state: whether a new build is waiting, and what the
    // settings button is currently saying.
    updateReady: updateAvailable(), updateChecking: false, updateStatus: '',
    backupStatus: '',
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };
}

function newWorkoutState(progId, solo = null) {
  return {
    progId, solo, setsByEx: {}, quitAsk: false, wasPaused: false,
    index: 0, set: 1, phase: 'exercise', rest: 0, restKind: 'exercise',
    elapsed: 0, stopwatch: 0, swRunning: true, paused: false, bigMode: false,
    doneIds: [], charge: {}, reps: {}, notes: {}, edit: null, editVal: '',
  };
}

// The program a running workout is following. A solo exercise carries its
// ad-hoc program on the workout itself precisely because that program is never
// saved, so it cannot be looked up by id.
function workoutProgram(state) {
  const w = state.workout;
  if (!w) return null;
  return w.solo || progById(w.progId, state.customWorkouts);
}

// Sets actually completed, per exercise. Every finished set passes through
// FINISH_SET exactly once, so this is the truth about what was performed — and
// a session stopped part-way has to be logged from it rather than from the
// program's prescription.
const totalSets = (w) => Object.values(w.setsByEx).reduce((a, n) => a + n, 0);

function buildSessionEntry(state, partial = false) {
  const w = state.workout;
  const program = workoutProgram(state);
  const doneIds = Object.keys(w.setsByEx);
  // Derived from what was performed, not from the program: a session stopped
  // after its first exercise must not claim the muscles of the ones it never
  // reached. For a completed program the two lists are the same.
  const exObjs = doneIds.map(exById);
  const kcal = Math.round((w.elapsed / 60) * KCAL_PER_MIN);
  return {
    id: `s-${Date.now()}`,
    programId: program.id,
    programNom: program.nom,
    dateKey: dateKey(),
    heure: nowHM(),
    elapsedSec: w.elapsed,
    kcal,
    // Always what was performed, never the prescription: for a completed
    // program the two agree, and for one stopped early only this is true.
    series: totalSets(w),
    exerciseIds: doneIds,
    // Kept on the entry, not just on the ephemeral summary: the journal has to
    // be able to tell a session stopped early from one seen through, and
    // `exosTotal` is what makes "2 exercices sur 3" possible later.
    partial,
    exosTotal: program.exos.length,
    muscles: [...new Set(exObjs.map((e) => e.muscle.split(' · ')[0]))],
  };
}

// Touching a day's sessions makes any cached analysis of that day stale —
// adding one, deleting one, or moving one to another date, which is why this
// takes several days: an edit that changes the date invalidates both ends.
// The live copy only ever shows today's analysis, so it is left alone when
// some other day changed.
function withStaleAnalysisFor(state, ...days) {
  const analysisLog = { ...state.analysisLog };
  for (const d of days) delete analysisLog[d];
  return days.includes(dateKey())
    ? { analysis: null, analysisError: '', analysisLog }
    : { analysisLog };
}

// Newest first, by day then by time. The log used to be strictly append-only
// with entries created in chronological order, so array order was date order
// for free; a session can now be logged for — or moved to — a past day, and
// `history` still reads the array in order.
const sortLog = (log) => [...log].sort((a, b) => (
  a.dateKey === b.dateKey
    ? String(b.heure || '').localeCompare(String(a.heure || ''))
    : String(b.dateKey).localeCompare(String(a.dateKey))
));

// Ends a workout, writes it to the journal and shows the summary. `partial` is
// a run stopped before its end — logged all the same, from what was done.
function finishWorkout(state, w, partial = false) {
  const scoped = { ...state, workout: w };
  const program = workoutProgram(scoped);
  const entry = buildSessionEntry(scoped, partial);
  return {
    ...state,
    view: 'complete',
    workout: null,
    completeSummary: {
      time: fmt(w.elapsed),
      exos: entry.exerciseIds.length || program.exos.length,
      kcal: entry.kcal,
      sets: totalSets(w),
      soloNom: w.solo ? w.solo.nom : null,
      partial,
    },
    sessionLog: [entry, ...state.sessionLog],
    ...withStaleAnalysisFor(state, entry.dateKey),
  };
}

// A date typed into a form reaches the reducer as whatever the input held, and
// a bad one would put an entry somewhere no screen can reach it again. Both
// return null rather than a fallback, so the caller decides the default.
const validDateKey = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) && !Number.isNaN(Date.parse(`${v}T00:00:00`)) ? v : null);
const validHeure = (v) => (/^([01]\d|2[0-3]):[0-5]\d$/.test(String(v || '')) ? v : null);

// A session logged after the fact — worked out outside the app, so it never
// touches the workout state machine. Three shapes: a picked program (assumed
// completed as prescribed), a free-form entry (no exercises at all, since
// there is no per-set tracking outside a live workout to draw a series count
// from), or a hand-picked list of exercises carrying their own series/reps/
// charge — the one case where the caller, not the catalogue or a saved
// program, supplies what was actually performed.
function buildManualSessionEntry(state, { progId, customName, minutes, dateKey: d, heure, exercises }) {
  // The session being logged is usually one that already happened, so the day
  // and time are the user's to set; now is only the default.
  const base = {
    id: `s-${Date.now()}`,
    dateKey: validDateKey(d) || dateKey(),
    heure: validHeure(heure) || nowHM(),
    partial: false, manual: true,
  };

  if (exercises && exercises.length) {
    const exObjs = exercises.map((e) => exById(e.id));
    // No rest time is asked of the user for this flow, so duration borrows the
    // same per-set estimate soloProgram() uses: series × (rest + ~40s of work).
    const elapsedSec = Math.max(60, exercises.reduce(
      (a, e, i) => a + (Number(e.series) || 0) * ((exObjs[i].repos || 45) + 40), 0,
    ));
    return {
      ...base,
      elapsedSec, kcal: Math.round((elapsedSec / 60) * KCAL_PER_MIN),
      programId: 'manual', programNom: 'Exercices ajoutés',
      series: exercises.reduce((a, e) => a + (Number(e.series) || 0), 0),
      exerciseIds: exercises.map((e) => e.id),
      exosTotal: exercises.length,
      muscles: [...new Set(exObjs.map((e) => e.muscle.split(' · ')[0]))],
      // Per-exercise detail so the journal card can show what was actually
      // done rather than just the exercise names — tolerated as absent by
      // every older/other entry shape, per the sessionLog convention.
      exercisesDetail: exercises.map((e) => ({ id: e.id, series: Number(e.series) || 0, reps: e.reps || '', charge: e.charge || '' })),
    };
  }

  const elapsedSec = Math.max(60, Math.round((Number(minutes) || 0) * 60));
  const kcal = Math.round((elapsedSec / 60) * KCAL_PER_MIN);
  if (!progId) {
    return { ...base, elapsedSec, kcal, programId: 'manual', programNom: (customName || '').trim() || 'Séance libre', series: 0, exerciseIds: [], exosTotal: 0, muscles: [] };
  }
  const program = progById(progId, state.customWorkouts);
  const exObjs = program.exos.map(exById);
  return {
    ...base, elapsedSec, kcal,
    programId: program.id,
    programNom: program.nom,
    series: program.exos.reduce((a, id) => a + effSeries(program, id), 0),
    exerciseIds: program.exos,
    exosTotal: program.exos.length,
    muscles: [...new Set(exObjs.map((e) => e.muscle.split(' · ')[0]))],
  };
}

// A tour step declares where it happens: `view` opens an overlay, `tab` goes
// to a tab and closes any overlay, neither leaves the app where it is. The
// drawer and the help sheet are closed either way — they would sit on top of
// whatever the step is pointing at.
function applyTourStep(state, tour, i) {
  const step = tour.steps[i] || {};
  const where = step.view
    ? { view: step.view }
    : step.tab
      ? { tab: step.tab, view: null }
      : {};
  return { ...state, ...where, menuOpen: false, helpOpen: false, helpTopic: null };
}

function reducer(state, action) {
  switch (action.type) {
    case 'PATCH':
      return { ...state, ...action.payload };

    case 'GO_TAB':
      return { ...state, tab: action.tab, view: null, helpOpen: false };
    case 'OPEN_VIEW':
      return { ...state, view: action.view, helpOpen: false };
    case 'CLOSE_OVERLAY':
      return { ...state, view: null, helpOpen: false };

    case 'ACCEPT_DISCLAIMER':
      return { ...state, disclaimerAcked: true, legalVersion: LEGAL_VERSION };
    case 'SHOW_DISCLAIMER':
      return { ...state, disclaimerAcked: false };
    // Development only (see the button in Profile.jsx): puts the device back in
    // the state of a first launch, version included.
    case 'RESET_LEGAL_ACK':
      return { ...state, disclaimerAcked: false, legalVersion: '', view: null, menuOpen: false };

    case 'SET_THEME':
      return { ...state, theme: isTheme(action.theme) ? action.theme : DEFAULT_THEME };

    case 'SET_OPENROUTER':
      return { ...state, openrouter: { ...state.openrouter, ...action.patch }, orStatus: '', orError: '' };

    // --- Nutrition ---------------------------------------------------------
    case 'IMPORT_NUTRI_LOG':
      return { ...state, nutriLog: mergeLog(state.nutriLog, action.log) };

    // Dictated meals, already parsed and previewed by the overlay. The view
    // jumps to the first imported day so the result is visible straight away —
    // an import for yesterday must not look like it did nothing.
    case 'IMPORT_MEAL_DAYS': {
      const foodCache = { ...state.foodCache };
      for (const f of importedFoods(action.days)) foodCache[f.id] = f;
      // A dictated day can carry a walk alongside its meals. Walking is always
      // appended, never replaced: 'replace' is about the meals the import
      // names, and it must not wipe a walk tracked by GPS the same day.
      const activityLog = { ...state.activityLog };
      for (const day of action.days) {
        if (day.marche?.length) activityLog[day.date] = [...(activityLog[day.date] || []), ...day.marche];
      }
      return {
        ...state,
        foodCache,
        activityLog,
        nutriLog: applyImport(state.nutriLog, action.days, action.mode),
        nutriDate: action.days[0]?.date || state.nutriDate,
        view: null,
      };
    }

    case 'SET_MENU':
      return { ...state, menuOpen: action.open };
    case 'SET_HELP':
      return { ...state, helpOpen: action.open };

    // --- Aide, FAQ, tutoriels ----------------------------------------------
    case 'OPEN_HELP_CENTER':
      return {
        ...state,
        view: 'help', menuOpen: false, helpOpen: false,
        helpTopic: action.topic || null,
        helpQuery: action.query != null ? action.query : '',
      };
    case 'SET_HELP_QUERY':
      // Typing is a new question: whatever answer was open stops applying.
      return { ...state, helpQuery: action.query, helpTopic: null };
    case 'OPEN_HELP_TOPIC':
      return { ...state, helpTopic: { kind: action.kind, id: action.id } };
    case 'CLOSE_HELP_TOPIC':
      return { ...state, helpTopic: null };

    // A tour step *is* a location: applying both here is what keeps the step
    // index and the screen on show from ever disagreeing.
    case 'START_TOUR': {
      const tour = tourById(action.id);
      if (!tour) return state;
      // A tour walks the app from screen to screen, which would leave a running
      // session behind with no way back to it. Same reason an update is refused
      // mid-workout: that state lives in memory only.
      if (state.workout) return state;
      return { ...applyTourStep(state, tour, 0), tour: { id: tour.id, step: 0 }, tourDone: true };
    }
    case 'TOUR_GO': {
      if (!state.tour) return state;
      const tour = tourById(state.tour.id);
      if (!tour) return { ...state, tour: null };
      const next = state.tour.step + action.delta;
      if (next < 0) return state;
      // Walking off the end finishes the tour rather than trapping the user on
      // a last step with a disabled button.
      if (next >= tour.steps.length) return { ...state, tour: null, tourDone: true };
      return { ...applyTourStep(state, tour, next), tour: { id: tour.id, step: next } };
    }
    case 'END_TOUR':
      return { ...state, tour: null, tourDone: true };
    // Dismissing the invitation counts as an answer: it is not offered again,
    // and the tours stay in the help centre.
    case 'DISMISS_TOUR_INVITE':
      return { ...state, tourDone: true };

    case 'SET_SUPPORT':
      return { ...state, support: { ...state.support, ...action.patch } };

    case 'SET_NUTRI_DATE':
      return { ...state, nutriDate: action.dateKey };

    case 'ADD_FOOD_ENTRY': {
      const { dateKey: d, meal, entry } = action;
      const day = state.nutriLog[d] || {};
      return {
        ...state,
        // Cached on the way in, so the same food can be re-added offline later.
        foodCache: { ...state.foodCache, [entry.food.id]: entry.food },
        nutriLog: { ...state.nutriLog, [d]: { ...day, [meal]: [...(day[meal] || []), entry] } },
      };
    }

    case 'UPDATE_FOOD_ENTRY': {
      const { dateKey: d, meal, id, grammes } = action;
      const day = state.nutriLog[d] || {};
      return {
        ...state,
        nutriLog: {
          ...state.nutriLog,
          [d]: { ...day, [meal]: (day[meal] || []).map((e) => (e.id === id ? { ...e, grammes } : e)) },
        },
      };
    }

    case 'REMOVE_FOOD_ENTRY': {
      const { dateKey: d, meal, id } = action;
      const day = state.nutriLog[d] || {};
      return {
        ...state,
        nutriLog: { ...state.nutriLog, [d]: { ...day, [meal]: (day[meal] || []).filter((e) => e.id !== id) } },
      };
    }

    case 'DUPLICATE_MEAL': {
      const { from, meal, to } = action;
      const source = state.nutriLog[from]?.[meal] || [];
      if (!source.length) return state;
      const day = state.nutriLog[to] || {};
      const copies = source.map((e, i) => ({ ...e, id: `fe-${Date.now()}-${i}` }));
      return {
        ...state,
        nutriLog: { ...state.nutriLog, [to]: { ...day, [meal]: [...(day[meal] || []), ...copies] } },
      };
    }

    case 'TOGGLE_VOICE':
      return { ...state, voiceOn: !state.voiceOn };
    case 'SET_ONLINE':
      return { ...state, online: action.online };

    case 'SELECT_EXERCISE':
      return { ...state, selExId: action.id, view: 'exercise' };
    case 'SELECT_PROGRAM':
      return { ...state, selProgId: action.id, view: 'program' };
    case 'OPEN_BODYMAP':
      return { ...state, view: 'bodymap' };
    case 'SET_BODY_SIDE':
      return { ...state, bodySide: action.side };
    case 'SELECT_MUSCLE':
      return { ...state, selMuscleId: action.id };

    case 'SET_LIB_FILTER':
      return { ...state, [action.key]: action.value };
    case 'SET_PROG_FILTER':
      return { ...state, [action.key]: action.value };

    case 'SET_PROFILE_FIELD':
      return { ...state, profile: { ...state.profile, [action.key]: action.value } };
    case 'TOGGLE_ZONE': {
      const has = state.profile.zones.includes(action.zone);
      const zones = has ? state.profile.zones.filter((z) => z !== action.zone) : [...state.profile.zones, action.zone];
      return { ...state, profile: { ...state.profile, zones } };
    }
    case 'SAVE_PROFILE':
      return { ...state, view: null, tab: 'journal' };

    // Dictated sessions land as ordinary custom workouts — same shape as the
    // builder's, so everything downstream treats them identically.
    case 'IMPORT_PROGRAMS': {
      const added = toCustomWorkouts(action.seances);
      return {
        ...state,
        customWorkouts: [...state.customWorkouts, ...added],
        view: null,
        tab: 'programs',
      };
    }

    case 'OPEN_BUILDER':
      return { ...state, view: 'builder', builder: { name: '', duree: 30, objectif: 'Prise de masse', exos: [], pickerOpen: false } };
    case 'BUILDER_SET_FIELD':
      return { ...state, builder: { ...state.builder, [action.key]: action.value } };
    case 'BUILDER_TOGGLE_PICKER':
      return { ...state, builder: { ...state.builder, pickerOpen: action.open } };
    case 'BUILDER_ADD_EXO':
      return {
        ...state,
        builder: {
          ...state.builder,
          pickerOpen: false,
          exos: [...state.builder.exos, { id: action.id, series: 3, reps: '12', charge: 'Poids du corps', repos: 60 }],
        },
      };
    case 'BUILDER_UPDATE_EXO': {
      const exos = state.builder.exos.slice();
      exos[action.index] = { ...exos[action.index], [action.key]: action.value };
      return { ...state, builder: { ...state.builder, exos } };
    }
    case 'BUILDER_REMOVE_EXO':
      return { ...state, builder: { ...state.builder, exos: state.builder.exos.filter((_, i) => i !== action.index) } };
    case 'BUILDER_MOVE_EXO': {
      const exos = state.builder.exos.slice();
      const j = action.index + action.dir;
      if (j < 0 || j >= exos.length) return state;
      [exos[action.index], exos[j]] = [exos[j], exos[action.index]];
      return { ...state, builder: { ...state.builder, exos } };
    }
    case 'SAVE_WORKOUT': {
      const b = state.builder;
      if (!b.exos.length) return state;
      const id = `custom-${Date.now()}`;
      const custom = {};
      b.exos.forEach((e) => {
        custom[e.id] = { series: Number(e.series) || 1, reps: e.reps || '', charge: e.charge || '', repos: Number(e.repos) || 30 };
      });
      const w = {
        id, nom: (b.name || '').trim() || 'Ma séance', obj: b.objectif, niveau: 'Perso', lieu: 'Perso',
        duree: Number(b.duree) || 20, kcal: Math.round((Number(b.duree) || 20) * 8), mat: ['Perso'],
        icon: 'user-gear', exos: b.exos.map((e) => e.id), custom, isCustom: true,
      };
      return { ...state, customWorkouts: [...state.customWorkouts, w], view: 'program', selProgId: id };
    }

    case 'START_WORKOUT':
      return { ...state, view: 'workout', workout: newWorkoutState(action.progId) };

    case 'START_SOLO': {
      const prog = soloProgram(exById(action.exId));
      return { ...state, view: 'workout', workout: newWorkoutState(prog.id, prog) };
    }

    case 'FINISH_SOLO': {
      const w = state.workout;
      if (!w || !w.solo) return state;
      // Not a single set done — leave without writing a session nobody performed.
      if (totalSets(w) === 0) return { ...state, view: null, tab: 'home', workout: null };
      return finishWorkout(state, w);
    }

    // Closing a workout asks rather than discards: stopping early is normal,
    // and the sets already done are worth keeping.
    case 'REQUEST_QUIT': {
      const w = state.workout; if (!w) return state;
      if (totalSets(w) === 0) return { ...state, view: null, tab: 'home', workout: null };
      // Freeze the clock and the rest countdown while the choice is open.
      return { ...state, workout: { ...w, quitAsk: true, wasPaused: w.paused, paused: true } };
    }
    case 'CANCEL_QUIT': {
      const w = state.workout; if (!w) return state;
      return { ...state, workout: { ...w, quitAsk: false, paused: w.wasPaused } };
    }
    case 'SAVE_AND_QUIT': {
      const w = state.workout; if (!w) return state;
      // A solo run ended this way is simply finished; a program is partial.
      return finishWorkout(state, { ...w, quitAsk: false }, !w.solo);
    }

    case 'TICK': {
      if (state.view !== 'workout' || !state.workout || state.workout.paused) return state;
      const w = state.workout;
      let { phase, rest, index, set, stopwatch, swRunning } = w;
      const elapsed = w.elapsed + 1;
      if (phase === 'rest') {
        rest -= 1;
        if (rest <= 0) {
          if (w.restKind === 'series') set += 1;
          else { index += 1; set = 1; }
          phase = 'exercise'; rest = 0; stopwatch = 0; swRunning = true;
        }
      } else if (phase === 'exercise' && swRunning) {
        stopwatch = (stopwatch || 0) + 1;
      }
      return { ...state, workout: { ...w, phase, rest, index, set, stopwatch, swRunning, elapsed } };
    }

    case 'FINISH_SET': {
      const w = state.workout; if (!w) return state;
      const program = workoutProgram(state);
      const curId = program.exos[w.index];
      const setsByEx = { ...w.setsByEx, [curId]: (w.setsByEx[curId] || 0) + 1 };
      const rest = effRepos(program, curId);
      // A solo exercise has no set target: it runs until the user stops it, so
      // every finished set simply leads into a rest.
      if (w.solo) {
        return { ...state, workout: { ...w, setsByEx, phase: 'rest', rest, restKind: 'series', stopwatch: 0, swRunning: false } };
      }
      const total = effSeries(program, curId);
      if (w.set < total) {
        return { ...state, workout: { ...w, setsByEx, phase: 'rest', rest, restKind: 'series', stopwatch: 0, swRunning: false } };
      }
      const doneIds = [...w.doneIds, curId];
      if (w.index >= program.exos.length - 1) {
        return finishWorkout(state, { ...w, setsByEx, doneIds });
      }
      return { ...state, workout: { ...w, setsByEx, doneIds, phase: 'rest', rest, restKind: 'exercise', stopwatch: 0, swRunning: false } };
    }
    case 'SKIP_REST': {
      const w = state.workout; if (!w) return state;
      if (w.restKind === 'series') return { ...state, workout: { ...w, phase: 'exercise', set: w.set + 1, rest: 0, stopwatch: 0, swRunning: true } };
      return { ...state, workout: { ...w, phase: 'exercise', index: w.index + 1, set: 1, rest: 0, stopwatch: 0, swRunning: true } };
    }
    case 'ADD_REST':
      return { ...state, workout: { ...state.workout, rest: state.workout.rest + 15 } };
    case 'TOGGLE_PAUSE':
      return { ...state, workout: { ...state.workout, paused: !state.workout.paused } };
    case 'TOGGLE_SW':
      return { ...state, workout: { ...state.workout, swRunning: !state.workout.swRunning } };
    case 'RESET_SW':
      return { ...state, workout: { ...state.workout, stopwatch: 0, swRunning: true } };
    case 'TOGGLE_BIG':
      return { ...state, workout: { ...state.workout, bigMode: !state.workout.bigMode } };

    case 'OPEN_EDIT': {
      const w = state.workout; if (!w) return state;
      const program = workoutProgram(state);
      const curId = program.exos[w.index];
      let val = '';
      if (action.kind === 'charge') val = (w.charge[curId] != null && w.charge[curId] !== '') ? w.charge[curId] : baseCharge(program, curId);
      else if (action.kind === 'reps') val = (w.reps[curId] != null && w.reps[curId] !== '') ? w.reps[curId] : baseReps(program, curId);
      else val = w.notes[curId] || '';
      return { ...state, workout: { ...w, edit: action.kind, editVal: val } };
    }
    case 'SET_EDIT_VAL':
      return { ...state, workout: { ...state.workout, editVal: action.value } };
    case 'SAVE_EDIT': {
      const w = state.workout; if (!w || !w.edit) return state;
      const program = workoutProgram(state);
      const curId = program.exos[w.index];
      if (w.edit === 'charge') return { ...state, workout: { ...w, charge: { ...w.charge, [curId]: w.editVal }, edit: null } };
      if (w.edit === 'reps') return { ...state, workout: { ...w, reps: { ...w.reps, [curId]: w.editVal }, edit: null } };
      return { ...state, workout: { ...w, notes: { ...w.notes, [curId]: w.editVal }, edit: null } };
    }
    case 'CANCEL_EDIT':
      return { ...state, workout: { ...state.workout, edit: null } };

    case 'QUIT_WORKOUT':
      return { ...state, view: null, tab: 'home', workout: null };
    case 'FINISH_HOME':
      return { ...state, view: null, tab: 'home', completeSummary: null };

    case 'ANALYSIS_START':
      return { ...state, analysisLoading: true, analysis: null, analysisError: '' };
    case 'ANALYSIS_ERROR':
      return { ...state, analysisLoading: false, analysisError: action.message };
    case 'ANALYSIS_DONE':
      return {
        ...state, analysisLoading: false, analysis: action.analysis, analysisSource: action.source,
        analysisLog: { ...state.analysisLog, [dateKey()]: { analysis: action.analysis, source: action.source } },
      };

    // Progress analysis: transient, unlike the day's. It reads a 4-week window
    // that moves on its own, so a cached copy would age into a wrong answer;
    // recomputing costs nothing locally and the OpenRouter path is behind an
    // explicit tap.
    case 'PROGRESS_START':
      return { ...state, progressLoading: true, progressAnalysis: null, progressError: '' };
    case 'PROGRESS_DONE':
      return { ...state, progressLoading: false, progressAnalysis: action.analysis, progressSource: action.source };

    // --- Journal ------------------------------------------------------------
    case 'DELETE_SESSION': {
      const gone = state.sessionLog.find((s) => s.id === action.id);
      if (!gone) return state;
      return {
        ...state,
        sessionLog: state.sessionLog.filter((s) => s.id !== action.id),
        ...withStaleAnalysisFor(state, gone.dateKey),
      };
    }
    case 'ADD_MANUAL_SESSION': {
      const entry = buildManualSessionEntry(state, action.patch);
      return {
        ...state,
        sessionLog: sortLog([entry, ...state.sessionLog]),
        ...withStaleAnalysisFor(state, entry.dateKey),
      };
    }

    // Metadata only — when, how long, and the label of a free-form entry. What
    // was performed (exerciseIds, series, muscles) is the record of a real
    // session and stays out of reach; kcal follows the duration through the
    // same rule that produced it in the first place.
    case 'EDIT_SESSION': {
      const before = state.sessionLog.find((s) => s.id === action.id);
      if (!before) return state;
      const { nom, minutes } = action.patch;
      const elapsedSec = Number(minutes) > 0 ? Math.max(60, Math.round(Number(minutes) * 60)) : before.elapsedSec;
      const after = {
        ...before,
        dateKey: validDateKey(action.patch.dateKey) || before.dateKey,
        heure: validHeure(action.patch.heure) || before.heure,
        elapsedSec,
        kcal: Math.round((elapsedSec / 60) * KCAL_PER_MIN),
        // Renaming a catalogue program would only make its own name lie; a
        // free-form entry's name is just a label the user typed.
        programNom: before.programId === 'manual' && String(nom || '').trim()
          ? String(nom).trim()
          : before.programNom,
      };
      return {
        ...state,
        sessionLog: sortLog(state.sessionLog.map((s) => (s.id === action.id ? after : s))),
        ...withStaleAnalysisFor(state, before.dateKey, after.dateKey),
      };
    }
    // A restore replaces or merges the persisted slices wholesale; the live
    // analysis is dropped because the day it described may no longer be the
    // one on file.
    case 'RESTORE_BACKUP':
      return {
        ...state,
        ...(action.mode === 'replace'
          ? replaceFromBackup(state, action.data)
          : mergeBackup(state, action.data)),
        analysis: null, analysisSource: null, progressAnalysis: null,
        view: null,
        backupStatus: action.message,
      };

    // --- Marche -------------------------------------------------------------
    case 'ADD_ACTIVITY': {
      const day = state.activityLog[action.dateKey] || [];
      return { ...state, activityLog: { ...state.activityLog, [action.dateKey]: [...day, action.entry] } };
    }
    case 'DELETE_ACTIVITY': {
      const day = (state.activityLog[action.dateKey] || []).filter((e) => e.id !== action.id);
      const activityLog = { ...state.activityLog };
      if (day.length) activityLog[action.dateKey] = day;
      else delete activityLog[action.dateKey];
      return { ...state, activityLog };
    }
    // Bulk, from a GPX/CSV file or a dictated import: days already logged are
    // added to, never replaced — an import must not wipe a tracked walk.
    case 'IMPORT_ACTIVITY': {
      const activityLog = { ...state.activityLog };
      for (const [d, entries] of Object.entries(action.log)) {
        activityLog[d] = [...(activityLog[d] || []), ...entries];
      }
      return { ...state, activityLog };
    }

    case 'SET_DAY_NOTE':
      return { ...state, dayNotes: { ...state.dayNotes, [action.dateKey]: action.text } };

    default:
      return state;
  }
}


export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const cadenceStopRef = useRef(null);
  // Every persisted slice at once, for the backup — more than the action
  // memo's dependency list carries, and it has to be the current one.
  const stateRef = useRef(state);
  stateRef.current = state;
  const cadenceSigRef = useRef('');

  // Persist the durable slices only.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        profile: state.profile,
        customWorkouts: state.customWorkouts,
        sessionLog: state.sessionLog,
        disclaimerAcked: state.disclaimerAcked,
        legalVersion: state.legalVersion,
        voiceOn: state.voiceOn,
        tourDone: state.tourDone,
        openrouter: state.openrouter,
        nutriLog: state.nutriLog,
        foodCache: state.foodCache,
        theme: state.theme,
        dayNotes: state.dayNotes,
        activityLog: state.activityLog,
        analysisLog: state.analysisLog,
      }));
    } catch {
      // storage unavailable (private mode / quota) — app still works, just without persistence
    }
  }, [state.profile, state.customWorkouts, state.sessionLog, state.disclaimerAcked, state.legalVersion, state.voiceOn,
      state.openrouter, state.nutriLog, state.foodCache, state.theme, state.dayNotes, state.analysisLog,
      state.activityLog, state.tourDone]);

  // A new build finishing its install is the one thing that can change the
  // app under the user's feet, so it is surfaced rather than applied silently.
  useEffect(() => onUpdateStatus((ready) => dispatch({ type: 'PATCH', payload: { updateReady: ready } })), []);

  // Puts the chosen palette in force. Under 'système' the teardown unsubscribes
  // from the OS setting, so switching away stops following it.
  useEffect(() => applyTheme(state.theme), [state.theme]);

  // 1s workout ticker.
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, []);

  // Online/offline detection (real, not simulated).
  useEffect(() => {
    const on = () => dispatch({ type: 'SET_ONLINE', online: true });
    const off = () => dispatch({ type: 'SET_ONLINE', online: false });
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Voice coach cadence — mirrors the prototype's componentDidUpdate signature check.
  useEffect(() => {
    const w = state.workout;
    const sig = [state.view, w?.phase, w?.index, w?.paused, state.voiceOn].join('|');
    if (sig === cadenceSigRef.current) return;
    cadenceSigRef.current = sig;

    const active = state.view === 'workout' && w && w.phase === 'exercise' && !w.paused && state.voiceOn;
    if (cadenceStopRef.current) { cadenceStopRef.current(); cadenceStopRef.current = null; }
    if (active) {
      const program = workoutProgram(state);
      const curId = program.exos[w.index];
      const ex = exById(curId);
      cadenceStopRef.current = startCadence(curId, ex.nom);
    } else if (state.view === 'workout' && w && w.phase === 'rest' && state.voiceOn) {
      say('Repos. Récupère.');
    }
  }, [state.view, state.workout?.phase, state.workout?.index, state.workout?.paused, state.voiceOn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (cadenceStopRef.current) cadenceStopRef.current(); }, []);

  useEffect(() => {
    if (state.view === 'complete') say('Séance terminée. Bravo, tu as tout donné !');
  }, [state.view]);

  const actions = useMemo(() => ({
    patch: (payload) => dispatch({ type: 'PATCH', payload }),
    goTab: (tab) => dispatch({ type: 'GO_TAB', tab }),
    openView: (view) => dispatch({ type: 'OPEN_VIEW', view }),
    closeOverlay: () => dispatch({ type: 'CLOSE_OVERLAY' }),
    openMenu: () => dispatch({ type: 'SET_MENU', open: true }),
    closeMenu: () => dispatch({ type: 'SET_MENU', open: false }),
    openHelp: () => dispatch({ type: 'SET_HELP', open: true }),
    closeHelp: () => dispatch({ type: 'SET_HELP', open: false }),

    // --- Aide, FAQ, tutoriels, support -------------------------------------
    // `topic` is `{ kind, id }`, so a tooltip or a FAQ link can open the centre
    // directly on the answer instead of on its index.
    openHelpCenter: (topic = null, query = null) => dispatch({ type: 'OPEN_HELP_CENTER', topic, query }),
    setHelpQuery: (query) => dispatch({ type: 'SET_HELP_QUERY', query }),
    openHelpTopic: (kind, id) => dispatch({ type: 'OPEN_HELP_TOPIC', kind, id }),
    closeHelpTopic: () => dispatch({ type: 'CLOSE_HELP_TOPIC' }),
    startTour: (id) => dispatch({ type: 'START_TOUR', id }),
    tourNext: () => dispatch({ type: 'TOUR_GO', delta: 1 }),
    tourPrev: () => dispatch({ type: 'TOUR_GO', delta: -1 }),
    endTour: () => dispatch({ type: 'END_TOUR' }),
    dismissTourInvite: () => dispatch({ type: 'DISMISS_TOUR_INVITE' }),
    setSupport: (patch) => dispatch({ type: 'SET_SUPPORT', patch }),
    // The diagnostics are read from the live state at send time, so what the
    // form showed is what the mail carries.
    sendSupport: async () => {
      const st = stateRef.current;
      const how = await sendSupportMail(st, st.support);
      dispatch({ type: 'SET_SUPPORT', patch: { statut: {
        mail: "Ton application mail s'ouvre avec le message et le diagnostic. Il ne part qu'une fois envoyé de là.",
        clipboard: "Aucune application mail n'a répondu. Le message complet est dans le presse-papier : colle-le dans un mail à contact@swinux.ch.",
        echec: "Impossible d'ouvrir le mail depuis ici. Écris à contact@swinux.ch en recopiant le diagnostic ci-dessous.",
      }[how] } });
    },
    acceptDisclaimer: () => dispatch({ type: 'ACCEPT_DISCLAIMER' }),
    showDisclaimer: () => dispatch({ type: 'SHOW_DISCLAIMER' }),
    resetLegalAck: () => dispatch({ type: 'RESET_LEGAL_ACK' }),
    toggleVoice: () => dispatch({ type: 'TOGGLE_VOICE' }),

    selectExercise: (id) => dispatch({ type: 'SELECT_EXERCISE', id }),
    selectProgram: (id) => dispatch({ type: 'SELECT_PROGRAM', id }),
    openBodyMap: () => dispatch({ type: 'OPEN_BODYMAP' }),
    setBodySide: (side) => dispatch({ type: 'SET_BODY_SIDE', side }),
    selectMuscle: (id) => dispatch({ type: 'SELECT_MUSCLE', id }),

    setLibFilter: (key, value) => dispatch({ type: 'SET_LIB_FILTER', key, value }),
    setProgFilter: (key, value) => dispatch({ type: 'SET_PROG_FILTER', key, value }),

    setProfileField: (key, value) => dispatch({ type: 'SET_PROFILE_FIELD', key, value }),
    toggleZone: (zone) => dispatch({ type: 'TOGGLE_ZONE', zone }),
    saveProfile: () => dispatch({ type: 'SAVE_PROFILE' }),
    openProfile: () => dispatch({ type: 'OPEN_VIEW', view: 'profile' }),

    openBuilder: () => dispatch({ type: 'OPEN_BUILDER' }),
    openProgramImport: () => dispatch({ type: 'OPEN_VIEW', view: 'importProgram' }),
    importPrograms: (seances) => dispatch({ type: 'IMPORT_PROGRAMS', seances }),
    builderSetField: (key, value) => dispatch({ type: 'BUILDER_SET_FIELD', key, value }),
    builderTogglePicker: (open) => dispatch({ type: 'BUILDER_TOGGLE_PICKER', open }),
    builderAddExo: (id) => dispatch({ type: 'BUILDER_ADD_EXO', id }),
    builderUpdateExo: (index, key, value) => dispatch({ type: 'BUILDER_UPDATE_EXO', index, key, value }),
    builderRemoveExo: (index) => dispatch({ type: 'BUILDER_REMOVE_EXO', index }),
    builderMoveExo: (index, dir) => dispatch({ type: 'BUILDER_MOVE_EXO', index, dir }),
    saveWorkout: () => dispatch({ type: 'SAVE_WORKOUT' }),

    startWorkout: (progId) => dispatch({ type: 'START_WORKOUT', progId }),
    startSolo: (exId) => dispatch({ type: 'START_SOLO', exId }),
    finishSolo: () => dispatch({ type: 'FINISH_SOLO' }),
    requestQuit: () => dispatch({ type: 'REQUEST_QUIT' }),
    cancelQuit: () => dispatch({ type: 'CANCEL_QUIT' }),
    saveAndQuit: () => dispatch({ type: 'SAVE_AND_QUIT' }),
    finishSet: () => dispatch({ type: 'FINISH_SET' }),
    skipRest: () => dispatch({ type: 'SKIP_REST' }),
    addRest: () => dispatch({ type: 'ADD_REST' }),
    togglePause: () => dispatch({ type: 'TOGGLE_PAUSE' }),
    toggleSw: () => dispatch({ type: 'TOGGLE_SW' }),
    resetSw: () => dispatch({ type: 'RESET_SW' }),
    toggleBig: () => {
      const willOpen = !state.workout?.bigMode;
      dispatch({ type: 'TOGGLE_BIG' });
      try {
        const el = document.documentElement;
        if (willOpen) el.requestFullscreen?.().catch(() => {});
        else if (document.fullscreenElement) document.exitFullscreen?.();
      } catch {
        // fullscreen not available — big mode still works as a layout-only view
      }
    },
    openEdit: (kind) => dispatch({ type: 'OPEN_EDIT', kind }),
    setEditVal: (value) => dispatch({ type: 'SET_EDIT_VAL', value }),
    saveEdit: () => dispatch({ type: 'SAVE_EDIT' }),
    cancelEdit: () => dispatch({ type: 'CANCEL_EDIT' }),
    quitWorkout: () => { stopSpeaking(); dispatch({ type: 'QUIT_WORKOUT' }); },
    finishHome: () => dispatch({ type: 'FINISH_HOME' }),

    deleteSession: (id) => dispatch({ type: 'DELETE_SESSION', id }),
    // Both take the same `{ progId, customName, nom, minutes, dateKey, heure }`
    // shape, so one form component drives adding and editing alike.
    addManualSession: (patch) => dispatch({ type: 'ADD_MANUAL_SESSION', patch }),
    addExercisesSession: (exercises) => dispatch({ type: 'ADD_MANUAL_SESSION', patch: { exercises } }),
    editSession: (id, patch) => dispatch({ type: 'EDIT_SESSION', id, patch }),
    setDayNote: (text) => dispatch({ type: 'SET_DAY_NOTE', dateKey: dateKey(), text }),

    openActivity: () => dispatch({ type: 'OPEN_VIEW', view: 'activity' }),
    openAddExercises: () => dispatch({ type: 'OPEN_VIEW', view: 'addExercises' }),
    addActivity: (patch, d) => dispatch({
      type: 'ADD_ACTIVITY',
      dateKey: d || dateKey(),
      entry: makeActivityEntry(patch),
    }),
    deleteActivity: (id, d) => dispatch({ type: 'DELETE_ACTIVITY', id, dateKey: d || dateKey() }),
    importActivity: (log) => dispatch({ type: 'IMPORT_ACTIVITY', log }),

    // --- Sauvegarde ---------------------------------------------------------
    exportBackup: async () => {
      const text = JSON.stringify(buildBackup(stateRef.current, BUILD_ID), null, 2);
      const how = await deliverBackup(text, backupFilename());
      const said = {
        share: 'Sauvegarde partagée — enregistre-la dans Fichiers ou envoie-la-toi par mail.',
        download: 'Sauvegarde téléchargée.',
        clipboard: 'Téléchargement impossible ici : la sauvegarde est dans le presse-papier, colle-la dans une note.',
        cancelled: '',
      }[how];
      dispatch({ type: 'PATCH', payload: { backupStatus: said } });
    },
    restoreBackup: (data, mode, message) => dispatch({ type: 'RESTORE_BACKUP', data, mode, message }),
    setBackupStatus: (backupStatus) => dispatch({ type: 'PATCH', payload: { backupStatus } }),

    setTheme: (theme) => dispatch({ type: 'SET_THEME', theme }),

    // Asks the server for a new version now. Applying reloads the page, which
    // is why a running workout blocks it: that state is deliberately ephemeral
    // and a reload would throw the session away.
    checkUpdate: async () => {
      if (state.workout) {
        dispatch({ type: 'PATCH', payload: { updateStatus: 'Séance en cours — termine-la avant de mettre à jour.' } });
        return;
      }
      dispatch({ type: 'PATCH', payload: { updateChecking: true, updateStatus: 'Recherche…' } });
      const result = await checkForUpdate();
      if (result === 'update') {
        dispatch({ type: 'PATCH', payload: { updateChecking: false, updateStatus: 'Nouvelle version installée, redémarrage…' } });
        setTimeout(applyUpdate, 400);
        return;
      }
      dispatch({ type: 'PATCH', payload: {
        updateChecking: false,
        updateStatus: result === 'current'
          ? "Tu es déjà sur la dernière version."
          : "Mise à jour automatique indisponible ici (pas de service worker) — recharge la page.",
      } });
    },
    applyUpdate: () => applyUpdate(),
    // Manual escape when everything else has failed: drops the worker and its
    // caches, keeps the journal (that lives in localStorage).
    hardReload: () => hardReload(),
    setOpenRouter: (patch) => dispatch({ type: 'SET_OPENROUTER', patch }),

    setNutriDate: (d) => dispatch({ type: 'SET_NUTRI_DATE', dateKey: d }),
    // Nutritor journal CSV → nutriLog. Merged, never replacing: an import must
    // not silently wipe days already logged here.
    importNutritorCSV: (text) => {
      try {
        const { log, count, days, skipped } = parseNutritorCSV(text);
        dispatch({ type: 'IMPORT_NUTRI_LOG', log });
        const extra = skipped ? ` ${skipped} ligne${skipped > 1 ? 's' : ''} ignorée${skipped > 1 ? 's' : ''}.` : '';
        dispatch({ type: 'PATCH', payload: { importStatus: `${count} aliments importés sur ${days} jour${days > 1 ? 's' : ''}.${extra}`, importError: '' } });
      } catch (e) {
        dispatch({ type: 'PATCH', payload: { importError: e.message, importStatus: '' } });
      }
    },
    openFoodSearch: (meal) => dispatch({ type: 'PATCH', payload: { view: 'foodSearch', nutriMeal: meal, foodQuery: '', foodResults: [], foodError: '' } }),
    openMealImport: () => dispatch({ type: 'OPEN_VIEW', view: 'importMeals' }),
    // `days` comes from parseMealsImport and has already been shown to the user.
    importMealDays: (days, mode) => dispatch({ type: 'IMPORT_MEAL_DAYS', days, mode }),
    addFoodEntry: (meal, food, grammes) => dispatch({
      type: 'ADD_FOOD_ENTRY',
      dateKey: state.nutriDate,
      meal,
      entry: { id: `fe-${Date.now()}`, food, grammes: Math.max(1, Math.round(Number(grammes) || 0)) },
    }),
    updateFoodEntry: (meal, id, grammes) => dispatch({ type: 'UPDATE_FOOD_ENTRY', dateKey: state.nutriDate, meal, id, grammes: Math.max(1, Math.round(Number(grammes) || 0)) }),
    removeFoodEntry: (meal, id) => dispatch({ type: 'REMOVE_FOOD_ENTRY', dateKey: state.nutriDate, meal, id }),
    duplicateMeal: (meal, from) => dispatch({ type: 'DUPLICATE_MEAL', from, meal, to: state.nutriDate }),

    // Loads the free line-up live; also validates the key when one is set, so
    // the settings screen can report both in a single action.
    loadOpenRouterModels: async () => {
      dispatch({ type: 'PATCH', payload: { orLoading: true, orError: '', orStatus: '' } });
      try {
        const models = await fetchFreeModels();
        let status = `${models.length} modèles gratuits disponibles.`;
        if (state.openrouter.key) {
          await checkKey(state.openrouter.key);
          status = `Clé valide — ${models.length} modèles gratuits disponibles.`;
        }
        dispatch({ type: 'PATCH', payload: { orModels: models, orLoading: false, orStatus: status } });
      } catch (e) {
        dispatch({ type: 'PATCH', payload: { orLoading: false, orError: e.message || 'Échec de la connexion à OpenRouter.' } });
      }
    },

    runAnalysis: async () => {
      const today = dateKey();
      const entries = state.sessionLog.filter((s) => s.dateKey === today);
      if (entries.length === 0) {
        dispatch({ type: 'ANALYSIS_ERROR', message: "Aucune séance à analyser aujourd'hui. Lance une séance depuis l'accueil." });
        return;
      }
      dispatch({ type: 'ANALYSIS_START' });
      const weekStart = startOfWeekKey();
      const weekCount = state.sessionLog.filter((s) => s.dateKey >= weekStart).length;
      const local = () => generateAnalysis(state.profile, entries, weekCount);
      const { key, model } = state.openrouter;

      if (!key || !model) {
        // Unconfigured: the on-device engine, exactly as before.
        setTimeout(() => dispatch({ type: 'ANALYSIS_DONE', analysis: local(), source: 'local' }), 900);
        return;
      }
      try {
        const analysis = await requestAnalysis({ key, model, profile: state.profile, entries, weekCount });
        dispatch({ type: 'ANALYSIS_DONE', analysis, source: 'openrouter' });
      } catch (e) {
        // A model that is unreachable, rate-limited or off-format must not
        // leave the user with nothing — fall back and say what happened.
        dispatch({ type: 'ANALYSIS_DONE', analysis: local(), source: 'local' });
        dispatch({ type: 'PATCH', payload: { analysisError: `${e.message || 'Appel OpenRouter impossible.'} Analyse locale utilisée à la place.` } });
      }
    },

    // Same two engines as the day's analysis, over a 4-week window and framed
    // by the profile's objectives rather than by today's sessions.
    runProgressAnalysis: async () => {
      const input = {
        profile: state.profile,
        sessionLog: state.sessionLog,
        nutriLog: state.nutriLog,
        activityLog: state.activityLog,
        targets: dailyTargets(state.profile),
      };
      dispatch({ type: 'PROGRESS_START' });
      const local = () => generateProgressAnalysis(input);
      const { key, model } = state.openrouter;

      if (!key || !model) {
        setTimeout(() => dispatch({ type: 'PROGRESS_DONE', analysis: local(), source: 'local' }), 700);
        return;
      }
      try {
        const analysis = await requestProgressAnalysis({ key, model, stats: progressStats(input) });
        dispatch({ type: 'PROGRESS_DONE', analysis, source: 'openrouter' });
      } catch (e) {
        dispatch({ type: 'PROGRESS_DONE', analysis: local(), source: 'local' });
        dispatch({ type: 'PATCH', payload: { progressError: `${e.message || 'Appel OpenRouter impossible.'} Analyse locale utilisée à la place.` } });
      }
    },
  }), [state.workout, state.sessionLog, state.profile, state.openrouter, state.nutriDate, state.nutriLog, state.activityLog]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

