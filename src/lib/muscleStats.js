import { daysBetween } from './format.js';

const DECAY_WINDOW_DAYS = 10;

function decay(daysAgo) {
  if (daysAgo <= 0) return 1;
  if (daysAgo >= DECAY_WINDOW_DAYS) return 0;
  return 1 - daysAgo / DECAY_WINDOW_DAYS;
}

// Derives each muscle's current sollicitation level, recovery state and
// last-worked info from the real session log — the prototype hard-coded
// these as static demo numbers (MUSCLES[].days/load); here they're computed
// from what the user actually did.
export function computeMuscleStats(muscleDef, sessionLog) {
  const matches = sessionLog
    .map((s) => ({ s, hitCount: s.exerciseIds.filter((id) => muscleDef.exos.includes(id)).length }))
    .filter((m) => m.hitCount > 0)
    .sort((a, b) => (a.s.dateKey < b.s.dateKey ? 1 : -1));

  if (matches.length === 0) {
    return { load: 0, days: null, lastSession: null };
  }

  const contribution = matches.reduce((acc, m) => acc + m.hitCount * decay(daysBetween(m.s.dateKey)), 0);
  const load = Math.max(0, Math.min(100, Math.round(contribution * 26)));
  const days = daysBetween(matches[0].s.dateKey);
  const lastSession = matches[0].s.programNom;
  return { load, days, lastSession };
}

export function recoveryInfo(days) {
  if (days === null) return { label: 'Jamais travaillé', color: 'var(--color-good)' };
  if (days === 0) return { label: "Travaillé aujourd'hui", color: 'var(--color-warn)' };
  if (days <= 1) return { label: 'En récupération', color: 'var(--color-warn)' };
  if (days <= 3) return { label: 'Bientôt prêt', color: 'var(--color-accent-200)' };
  return { label: 'Prêt à travailler', color: 'var(--color-good)' };
}

export function solicitationLabel(load) {
  if (load >= 70) return 'Élevée';
  if (load >= 40) return 'Modérée';
  return 'Faible';
}

export function solicitationColor(load) {
  if (load >= 70) return 'var(--color-accent-500)';
  if (load >= 40) return 'var(--color-accent-700)';
  if (load >= 1) return 'var(--color-accent-900)';
  return 'var(--color-neutral-800)';
}
