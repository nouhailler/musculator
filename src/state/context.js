// Context, hooks and derived selectors. Kept out of store.jsx so that file only
// exports the AppProvider component (React Fast Refresh requirement).
import { createContext, useContext, useMemo } from 'react';
import { PROGRAMS } from '../data/programs.js';
import { BADGE_DEFS } from '../data/badges.js';
import { dateKey, startOfWeekKey } from '../lib/format.js';
import { computeStreak, sessionsPerWeek } from '../lib/streak.js';

export const AppContext = createContext(null);

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
