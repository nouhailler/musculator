// Exporting and restoring everything the app holds.
//
// There is no account and no server: a phone wiped, a browser cleaned or a
// device replaced takes the whole journal with it. This is the only copy the
// user can keep, so it covers every persisted slice — and reads back
// defensively, since the file may have been edited, truncated or come from an
// older version.
//
// The OpenRouter key is deliberately **not** exported. A backup is a file
// people mail to themselves and drop in cloud storage; a secret does not
// belong in it. The chosen model is kept, so restoring only asks for the key
// again.

export const BACKUP_VERSION = 1;

// Every persisted slice (see loadPersisted in state/store.jsx), with the shape
// each one has to have to be usable.
const SLICES = {
  profile: 'object',
  customWorkouts: 'array',
  sessionLog: 'array',
  disclaimerAcked: 'boolean',
  voiceOn: 'boolean',
  openrouter: 'object',
  nutriLog: 'object',
  foodCache: 'object',
  theme: 'string',
  dayNotes: 'object',
  analysisLog: 'object',
  activityLog: 'object',
};

const isShape = (v, kind) => {
  if (kind === 'array') return Array.isArray(v);
  if (kind === 'object') return !!v && typeof v === 'object' && !Array.isArray(v);
  return typeof v === kind; // eslint-disable-line valid-typeof
};

/** The object written to the file. */
export function buildBackup(state, buildId = null) {
  const data = {};
  for (const [key, kind] of Object.entries(SLICES)) {
    if (isShape(state[key], kind)) data[key] = state[key];
  }
  // The key never leaves the device, the model choice does.
  if (data.openrouter) data.openrouter = { key: '', model: state.openrouter?.model || '' };
  return {
    app: 'musculator',
    type: 'backup',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    build: buildId,
    data,
  };
}

export const backupFilename = () => `musculator-${new Date().toISOString().slice(0, 10)}.json`;

/**
 * Reads a backup file back.
 *
 * @returns {{ data, summary, warnings }} — `data` holds only the slices that
 * were present and well-shaped, so a partial or older file still restores what
 * it does carry.
 * @throws when the file is not a Musculator backup at all.
 */
export function parseBackup(text) {
  let obj;
  try {
    obj = JSON.parse(String(text || ''));
  } catch {
    throw new Error('Fichier illisible : ce n’est pas du JSON valide.');
  }
  if (!obj || typeof obj !== 'object') throw new Error('Fichier vide ou inattendu.');
  if (obj.app !== 'musculator' || obj.type !== 'backup') {
    throw new Error("Ce fichier n'est pas une sauvegarde Musculator.");
  }
  const src = obj.data && typeof obj.data === 'object' ? obj.data : {};

  const data = {};
  const warnings = [];
  for (const [key, kind] of Object.entries(SLICES)) {
    if (src[key] === undefined) continue;
    if (isShape(src[key], kind)) data[key] = src[key];
    else warnings.push(`« ${key} » ignoré : format inattendu.`);
  }
  if (!Object.keys(data).length) throw new Error('Sauvegarde vide : aucune donnée exploitable.');
  if (obj.version > BACKUP_VERSION) {
    warnings.push(`Sauvegarde écrite par une version plus récente de l'app (v${obj.version}) — ce qui n'est pas reconnu est ignoré.`);
  }
  return { data, warnings, exportedAt: obj.exportedAt || null, build: obj.build || null };
}

/** What a backup contains, in the user's terms. */
export function backupSummary(data) {
  const days = (log) => Object.keys(log || {}).length;
  return {
    seances: (data.sessionLog || []).length,
    programmes: (data.customWorkouts || []).length,
    joursNutrition: days(data.nutriLog),
    joursMarche: days(data.activityLog),
    notes: days(data.dayNotes),
    aliments: days(data.foodCache),
    profil: !!data.profile?.prenom || !!data.profile?.poids,
  };
}

// --- Merging ---------------------------------------------------------------

const byId = (list) => new Map((list || []).map((x) => [x.id, x]));

const mergeById = (current, incoming) => {
  const out = byId(current);
  for (const item of incoming || []) if (!out.has(item.id)) out.set(item.id, item);
  return [...out.values()];
};

// Newest first, day then time — the order the journal and the history read.
const sortSessions = (list) => [...list].sort((a, b) => (
  a.dateKey === b.dateKey
    ? String(b.heure || '').localeCompare(String(a.heure || ''))
    : String(b.dateKey || '').localeCompare(String(a.dateKey || ''))
));

/** Per-day lists of entries carrying ids: activityLog. */
function mergeDayLists(current, incoming) {
  const out = { ...(current || {}) };
  for (const [day, list] of Object.entries(incoming || {})) {
    out[day] = mergeById(out[day] || [], list);
  }
  return out;
}

/** Per-day, per-meal lists: nutriLog. */
function mergeNutriLog(current, incoming) {
  const out = { ...(current || {}) };
  for (const [day, meals] of Object.entries(incoming || {})) {
    const cur = { ...(out[day] || {}) };
    for (const [meal, list] of Object.entries(meals || {})) {
      cur[meal] = mergeById(cur[meal] || [], list);
    }
    out[day] = cur;
  }
  return out;
}

/**
 * Adds a backup's contents to what is already here, without losing either.
 *
 * Logs are unioned by id — an entry present on both devices is the same entry,
 * not two. Settings (profile, theme, voice, the OpenRouter model) are *not*
 * merged: the device being restored onto keeps its own, since merging two
 * profiles has no sensible answer. Use "remplacer" to take the backup's.
 */
export function mergeBackup(state, data) {
  const out = {};
  if (data.sessionLog) out.sessionLog = sortSessions(mergeById(state.sessionLog, data.sessionLog));
  if (data.customWorkouts) out.customWorkouts = mergeById(state.customWorkouts, data.customWorkouts);
  if (data.nutriLog) out.nutriLog = mergeNutriLog(state.nutriLog, data.nutriLog);
  if (data.activityLog) out.activityLog = mergeDayLists(state.activityLog, data.activityLog);
  // A food already known here wins: it may have been corrected since.
  if (data.foodCache) out.foodCache = { ...data.foodCache, ...state.foodCache };
  if (data.dayNotes) {
    const notes = { ...data.dayNotes };
    for (const [day, text] of Object.entries(state.dayNotes || {})) if (text) notes[day] = text;
    out.dayNotes = notes;
  }
  if (data.analysisLog) out.analysisLog = { ...data.analysisLog, ...state.analysisLog };
  return out;
}

/** Takes the backup wholesale, keeping the key the device already has. */
export function replaceFromBackup(state, data) {
  const out = { ...data };
  if (out.openrouter) {
    out.openrouter = { key: state.openrouter?.key || '', model: out.openrouter.model || '' };
  }
  return out;
}

// --- Getting the file out of the app ---------------------------------------

/**
 * Hands the backup to the user by whatever route the device actually offers.
 *
 * The share sheet comes first on purpose: in an installed iOS app a download
 * link frequently does nothing at all, while sharing opens Fichiers, Mail and
 * AirDrop — the places a backup is worth keeping. The link is the desktop and
 * Android path, and the clipboard is the last resort so the data can always be
 * got out somehow.
 *
 * @returns 'share' | 'download' | 'clipboard' | 'cancelled'
 */
export async function deliverBackup(text, filename) {
  try {
    const file = new File([text], filename, { type: 'application/json' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename });
        return 'share';
      } catch (e) {
        // A dismissed share sheet is a decision, not a failure.
        if (e?.name === 'AbortError') return 'cancelled';
      }
    }
  } catch {
    // No File constructor or no share support — fall through.
  }
  try {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return 'download';
  } catch {
    // Downloads blocked; the clipboard still gets the data out.
  }
  await navigator.clipboard?.writeText(text);
  return 'clipboard';
}
