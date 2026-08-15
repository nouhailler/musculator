// Breakdowns behind the two Progress tiles. Both read the whole session log —
// the tiles show all-time totals, so the detail has to explain that same
// number rather than a window of it.
import { daysBetween } from './format.js';

const RECENT_DAYS = 30;

const isRecent = (s) => {
  const d = daysBetween(s.dateKey);
  return d >= 0 && d < RECENT_DAYS;
};

/** Time spent: how it splits per session, per program, and over the last month. */
export function timeBreakdown(sessionLog) {
  const log = sessionLog || [];
  const totalSec = log.reduce((a, s) => a + s.elapsedSec, 0);
  const recentSec = log.filter(isRecent).reduce((a, s) => a + s.elapsedSec, 0);
  const longest = log.reduce((best, s) => (!best || s.elapsedSec > best.elapsedSec ? s : best), null);

  // Per program, biggest first — what the time actually went into.
  const byProgram = new Map();
  for (const s of log) {
    const cur = byProgram.get(s.programNom) || { nom: s.programNom, sec: 0, seances: 0 };
    cur.sec += s.elapsedSec;
    cur.seances++;
    byProgram.set(s.programNom, cur);
  }
  const programmes = [...byProgram.values()].sort((a, b) => b.sec - a.sec).slice(0, 4);

  return {
    seances: log.length,
    totalSec,
    recentSec,
    recentDays: RECENT_DAYS,
    moyenneSec: log.length ? Math.round(totalSec / log.length) : 0,
    longest,
    programmes,
  };
}

/** Energy: per session, per day, and the best day — all from logged sessions. */
export function kcalBreakdown(sessionLog) {
  const log = sessionLog || [];
  const total = log.reduce((a, s) => a + s.kcal, 0);
  const recent = log.filter(isRecent);
  const totalSec = log.reduce((a, s) => a + s.elapsedSec, 0);

  const parJour = new Map();
  for (const s of log) parJour.set(s.dateKey, (parJour.get(s.dateKey) || 0) + s.kcal);
  const meilleurJour = [...parJour.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([dateKey, kcal]) => ({ dateKey, kcal }))[0] || null;

  return {
    total,
    seances: log.length,
    moyenne: log.length ? Math.round(total / log.length) : 0,
    recent: recent.reduce((a, s) => a + s.kcal, 0),
    recentDays: RECENT_DAYS,
    jours: parJour.size,
    parJour: parJour.size ? Math.round(total / parJour.size) : 0,
    meilleurJour,
    // The rate the app itself used to produce these figures, shown so the
    // number is understood as an estimate rather than a measurement.
    kcalParMin: totalSec ? Math.round((total / (totalSec / 60)) * 10) / 10 : 0,
  };
}
