import { useEffect, useMemo, useReducer, useRef } from 'react';
import { progById, soloProgram } from '../data/programs.js';
import { exById } from '../data/exercises.js';
import { dateKey, fmt, nowHM, startOfWeekKey } from '../lib/format.js';
import { AppContext } from './context.js';
import { effRepos, effSeries, baseReps, baseCharge } from '../lib/workout.js';
import { generateAnalysis } from '../lib/analysis.js';
import { fetchFreeModels, checkKey, requestAnalysis } from '../lib/openrouter.js';
import { startCadence, stopSpeaking, say } from '../lib/voice.js';
import { applyTheme, DEFAULT_THEME, isTheme } from '../lib/theme.js';
import { MEALS } from '../data/nutrition.js';
import { mergeLog, parseNutritorCSV } from '../lib/importNutritor.js';
import { applyImport, importedFoods } from '../lib/importMeals.js';

const STORAGE_KEY = 'musculator:v1';
const KCAL_PER_MIN = 9;

const defaultProfile = {
  prenom: '', sexe: 'Homme', age: '', poids: '', taille: '', poidsCible: '',
  experience: 'Débutant', objectif: 'Prise de masse', zones: [], frequence: 4, contraintes: '',
  objectifNutrition: 'maintien',
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
      voiceOn: p.voiceOn !== false,
      openrouter: {
        key: typeof p.openrouter?.key === 'string' ? p.openrouter.key : '',
        model: typeof p.openrouter?.model === 'string' ? p.openrouter.model : '',
      },
      theme: isTheme(p.theme) ? p.theme : DEFAULT_THEME,
      // { [dateKey]: { [mealKey]: entry[] } }
      nutriLog: (p.nutriLog && typeof p.nutriLog === 'object') ? p.nutriLog : {},
      // Every food ever fetched, kept so it can be re-added with no network.
      foodCache: (p.foodCache && typeof p.foodCache === 'object') ? p.foodCache : {},
    };
  } catch {
    return null;
  }
}

function initialState() {
  const persisted = loadPersisted() || {
    profile: defaultProfile, customWorkouts: [], sessionLog: [], disclaimerAcked: false, voiceOn: true,
    openrouter: { key: '', model: '' }, nutriLog: {}, foodCache: {}, theme: DEFAULT_THEME,
  };
  return {
    ...persisted,
    tab: 'home', view: null,
    menuOpen: false, helpOpen: false,
    selExId: 'pompes', selProgId: 'fullbody',
    bodySide: 'front', selMuscleId: 'pecs',
    libSearch: '', libLevel: 'Tous', libMat: 'Tous', libOptionnels: false,
    fLevel: 'Tous', fEquip: 'Tous', fDur: 'Toutes',
    builder: { name: '', duree: 30, objectif: 'Prise de masse', exos: [], pickerOpen: false },
    workout: null,
    completeSummary: null,
    analysis: null, analysisLoading: false, analysisError: '',
    analysisSource: null,
    // Transient model-picker state: fetched live, never persisted.
    orModels: [], orLoading: false, orError: '', orStatus: '',
    // Nutrition: the day being viewed, plus transient search state.
    nutriDate: dateKey(), nutriMeal: MEALS[0].key,
    foodQuery: '', foodResults: [], foodLoading: false, foodError: '', foodPending: null,
    importStatus: '', importError: '',
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
    analysis: null, analysisError: '',
  };
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
      return { ...state, disclaimerAcked: true };
    case 'SHOW_DISCLAIMER':
      return { ...state, disclaimerAcked: false };

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
      return {
        ...state,
        foodCache,
        nutriLog: applyImport(state.nutriLog, action.days, action.mode),
        nutriDate: action.days[0]?.date || state.nutriDate,
        view: null,
      };
    }

    case 'SET_MENU':
      return { ...state, menuOpen: action.open };
    case 'SET_HELP':
      return { ...state, helpOpen: action.open };

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
      return { ...state, analysisLoading: false, analysis: action.analysis, analysisSource: action.source };

    default:
      return state;
  }
}


export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const cadenceStopRef = useRef(null);
  const cadenceSigRef = useRef('');

  // Persist the durable slices only.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        profile: state.profile,
        customWorkouts: state.customWorkouts,
        sessionLog: state.sessionLog,
        disclaimerAcked: state.disclaimerAcked,
        voiceOn: state.voiceOn,
        openrouter: state.openrouter,
        nutriLog: state.nutriLog,
        foodCache: state.foodCache,
        theme: state.theme,
      }));
    } catch {
      // storage unavailable (private mode / quota) — app still works, just without persistence
    }
  }, [state.profile, state.customWorkouts, state.sessionLog, state.disclaimerAcked, state.voiceOn,
      state.openrouter, state.nutriLog, state.foodCache, state.theme]);

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
    acceptDisclaimer: () => dispatch({ type: 'ACCEPT_DISCLAIMER' }),
    showDisclaimer: () => dispatch({ type: 'SHOW_DISCLAIMER' }),
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

    setTheme: (theme) => dispatch({ type: 'SET_THEME', theme }),
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
  }), [state.workout, state.sessionLog, state.profile, state.openrouter, state.nutriDate]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

