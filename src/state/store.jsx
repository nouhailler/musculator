import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { PROGRAMS, progById } from '../data/programs.js';
import { exById } from '../data/exercises.js';
import { BADGE_DEFS } from '../data/badges.js';
import { dateKey, fmt, nowHM, startOfWeekKey } from '../lib/format.js';
import { computeStreak, sessionsPerWeek } from '../lib/streak.js';
import { effRepos, effSeries, baseReps, baseCharge } from '../lib/workout.js';
import { generateAnalysis } from '../lib/analysis.js';
import { startCadence, stopSpeaking, say } from '../lib/voice.js';

const STORAGE_KEY = 'musculator:v1';
const KCAL_PER_MIN = 9;

const defaultProfile = {
  prenom: '', sexe: 'Homme', age: '', poids: '', taille: '', poidsCible: '',
  experience: 'Débutant', objectif: 'Prise de masse', zones: [], frequence: 4, contraintes: '',
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
    };
  } catch {
    return null;
  }
}

function initialState() {
  const persisted = loadPersisted() || {
    profile: defaultProfile, customWorkouts: [], sessionLog: [], disclaimerAcked: false, voiceOn: true,
  };
  return {
    ...persisted,
    tab: 'home', view: null,
    selExId: 'pompes', selProgId: 'fullbody',
    bodySide: 'front', selMuscleId: 'pecs',
    libSearch: '', libLevel: 'Tous', libMat: 'Tous',
    fLevel: 'Tous', fEquip: 'Tous', fDur: 'Toutes',
    builder: { name: '', duree: 30, objectif: 'Prise de masse', exos: [], pickerOpen: false },
    workout: null,
    completeSummary: null,
    analysis: null, analysisLoading: false, analysisError: '',
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };
}

function newWorkoutState(progId) {
  return {
    progId, index: 0, set: 1, phase: 'exercise', rest: 0, restKind: 'exercise',
    elapsed: 0, stopwatch: 0, swRunning: true, paused: false, bigMode: false,
    doneIds: [], charge: {}, reps: {}, notes: {}, edit: null, editVal: '',
  };
}

function buildSessionEntry(state, doneIds) {
  const w = state.workout;
  const program = progById(w.progId, state.customWorkouts);
  const exObjs = program.exos.map(exById);
  const kcal = Math.round((w.elapsed / 60) * KCAL_PER_MIN);
  return {
    id: `s-${Date.now()}`,
    programId: program.id,
    programNom: program.nom,
    dateKey: dateKey(),
    heure: nowHM(),
    elapsedSec: w.elapsed,
    kcal,
    series: exObjs.reduce((a, e) => a + e.series, 0),
    exerciseIds: [...doneIds],
    muscles: [...new Set(exObjs.map((e) => e.muscle.split(' · ')[0]))],
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'PATCH':
      return { ...state, ...action.payload };

    case 'GO_TAB':
      return { ...state, tab: action.tab, view: null };
    case 'OPEN_VIEW':
      return { ...state, view: action.view };
    case 'CLOSE_OVERLAY':
      return { ...state, view: null };

    case 'ACCEPT_DISCLAIMER':
      return { ...state, disclaimerAcked: true };
    case 'SHOW_DISCLAIMER':
      return { ...state, disclaimerAcked: false };

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
      const program = progById(w.progId, state.customWorkouts);
      const curId = program.exos[w.index];
      const total = effSeries(program, curId);
      if (w.set < total) {
        return { ...state, workout: { ...w, phase: 'rest', rest: effRepos(program, curId), restKind: 'series', stopwatch: 0, swRunning: false } };
      }
      const doneIds = [...w.doneIds, curId];
      if (w.index >= program.exos.length - 1) {
        const entry = buildSessionEntry({ ...state, workout: w }, doneIds);
        return {
          ...state,
          view: 'complete',
          workout: null,
          completeSummary: { time: fmt(w.elapsed), exos: program.exos.length, kcal: entry.kcal },
          sessionLog: [entry, ...state.sessionLog],
          analysis: null, analysisError: '',
        };
      }
      return { ...state, workout: { ...w, doneIds, phase: 'rest', rest: effRepos(program, curId), restKind: 'exercise', stopwatch: 0, swRunning: false } };
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
      const program = progById(w.progId, state.customWorkouts);
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
      const program = progById(w.progId, state.customWorkouts);
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
      return { ...state, analysisLoading: false, analysis: action.analysis };

    default:
      return state;
  }
}

const AppContext = createContext(null);

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
      }));
    } catch {
      // storage unavailable (private mode / quota) — app still works, just without persistence
    }
  }, [state.profile, state.customWorkouts, state.sessionLog, state.disclaimerAcked, state.voiceOn]);

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
      const program = progById(w.progId, state.customWorkouts);
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
        if (willOpen) el.requestFullscreen && el.requestFullscreen().catch(() => {});
        else if (document.fullscreenElement) document.exitFullscreen && document.exitFullscreen();
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

    runAnalysis: () => {
      const today = dateKey();
      const entries = state.sessionLog.filter((s) => s.dateKey === today);
      if (entries.length === 0) {
        dispatch({ type: 'ANALYSIS_ERROR', message: "Aucune séance à analyser aujourd'hui. Lance une séance depuis l'accueil." });
        return;
      }
      dispatch({ type: 'ANALYSIS_START' });
      const weekStart = startOfWeekKey();
      const weekCount = state.sessionLog.filter((s) => s.dateKey >= weekStart).length;
      setTimeout(() => {
        const result = generateAnalysis(state.profile, entries, weekCount);
        dispatch({ type: 'ANALYSIS_DONE', analysis: result });
      }, 900);
    },
  }), [state.workout, state.sessionLog, state.profile]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ---- Derived selectors (kept outside the reducer; cheap to recompute) ----

export function useDerived() {
  const { state } = useApp();
  return useMemo(() => {
    const today = dateKey();
    const weekStart = startOfWeekKey();
    const journalToday = state.sessionLog.filter((s) => s.dateKey === today);
    const weekSessions = state.sessionLog.filter((s) => s.dateKey >= weekStart);
    const weekTimeSec = weekSessions.reduce((a, s) => a + s.elapsedSec, 0);
    const weekKcal = weekSessions.reduce((a, s) => a + s.kcal, 0);
    const streak = computeStreak(state.sessionLog);
    const totalSessions = state.sessionLog.length;
    const hasEarlySession = state.sessionLog.some((s) => s.heure < '08:00');
    const hasHiit = state.sessionLog.some((s) => s.programId === 'hiit');
    const badges = BADGE_DEFS.map((b) => ({
      ...b,
      unlocked: b.check({ totalSessions, streak, hasEarlySession, hasHiit }),
    }));
    const history = state.sessionLog.slice(0, 20);
    const weekly = sessionsPerWeek(state.sessionLog, 6);
    return {
      today, weekStart, journalToday, weekSessions, weekTimeSec, weekKcal,
      streak, totalSessions, badges, history, weekly,
    };
  }, [state.sessionLog]);
}

export function allPrograms(customWorkouts) {
  return PROGRAMS.concat(customWorkouts);
}
