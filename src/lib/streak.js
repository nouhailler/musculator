import { dateKey, daysBetween } from './format.js';

// Consecutive-day streak, computed from actual session dates instead of an
// incremented counter — a session today and one yesterday keep the streak
// alive; a missed day resets it. Multiple sessions on the same day still
// count as one streak day.
export function computeStreak(sessionLog) {
  const days = new Set(sessionLog.map((s) => s.dateKey));
  const today = dateKey();
  let anchor = null;
  if (days.has(today)) anchor = today;
  else {
    const yesterday = dateKey(new Date(Date.now() - 86400000));
    if (days.has(yesterday)) anchor = yesterday;
  }
  if (!anchor) return 0;
  let streak = 0;
  let cursor = anchor;
  while (days.has(cursor)) {
    streak++;
    cursor = dateKey(new Date(new Date(cursor + 'T00:00:00').getTime() - 86400000));
  }
  return streak;
}

export function sessionsPerWeek(sessionLog, weeksBack = 6) {
  const today = dateKey();
  const buckets = new Array(weeksBack).fill(0);
  for (const s of sessionLog) {
    const diffDays = daysBetween(s.dateKey, today);
    if (diffDays < 0) continue;
    const week = Math.floor(diffDays / 7);
    if (week < weeksBack) buckets[weeksBack - 1 - week]++;
  }
  return buckets;
}
