// Badge definitions — ported from the prototype (BADGES), with the unlock
// rule the prototype hard-coded made real (see lib/badges.js for the check).
export const BADGE_DEFS = [
  { id: 'first', icon: 'flag-checkered', nom: '1re séance', check: (s) => s.totalSessions >= 1 },
  { id: 'streak3', icon: 'fire', nom: '3 jours', check: (s) => s.streak >= 3 },
  { id: 'sessions10', icon: 'barbell', nom: '10 séances', check: (s) => s.totalSessions >= 10 },
  { id: 'early', icon: 'timer', nom: 'Matinal', check: (s) => s.hasEarlySession },
  { id: 'hiit', icon: 'mountains', nom: 'HIIT', check: (s) => s.hasHiit },
  { id: 'streak30', icon: 'crown-simple', nom: '30 jours', check: (s) => s.streak >= 30 },
  { id: 'sessions100', icon: 'lightning', nom: '100 séances', check: (s) => s.totalSessions >= 100 },
  // Walking earns its own badges rather than feeding the training ones: a walk
  // is not a session, so it must not unlock "10 séances" or the day streak.
  { id: 'walk7', icon: 'person-simple-walk', nom: '7 jours de marche', check: (s) => s.walkStreak >= 7 },
  { id: 'km100', icon: 'sneaker-move', nom: '100 km', check: (s) => s.kmTotal >= 100 },
  { id: 'elite', icon: 'medal', nom: 'Élite', check: (s) => s.totalSessions >= 200 && s.streak >= 30 },
];
