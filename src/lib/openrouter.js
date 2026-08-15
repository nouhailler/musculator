// OpenRouter client — the optional live-model backend for the "Analyse IA".
//
// The app has no server, so every call here goes straight from the browser to
// openrouter.ai with the user's own key. OpenRouter allows that (its API sends
// `access-control-allow-origin: *` and accepts `Authorization` cross-origin),
// but it also means the key lives in localStorage on this device and is
// readable by anything with access to it — the settings screen says so, and
// that trade-off is inherent to a backend-less app.
//
// Nothing here is required: with no key configured the app keeps using the
// local engine in lib/analysis.js.

import { extractJsonObject } from './json.js';

const BASE = 'https://openrouter.ai/api/v1';

// Sent so the app identifies itself in OpenRouter's dashboards. Both headers
// are optional and neither carries user data.
const ATTRIBUTION = {
  'HTTP-Referer': 'https://github.com/nouhailler/musculator',
  'X-Title': 'Musculator',
};

function authHeaders(key) {
  return { Authorization: `Bearer ${key}`, ...ATTRIBUTION };
}

async function readError(res, fallback) {
  try {
    const body = await res.json();
    return body?.error?.message || fallback;
  } catch {
    return fallback;
  }
}

/**
 * The free models, fetched live rather than hard-coded: OpenRouter's free
 * line-up changes constantly, so any list baked into this file would rot.
 * No key is needed — /models is public.
 *
 * "Free" is decided from the price, not from the `:free` id suffix, so a model
 * that becomes free without being renamed is still picked up. Models that emit
 * anything other than text are dropped: some zero-priced entries are
 * music/audio generators that cannot answer a chat completion at all.
 */
export async function fetchFreeModels() {
  const res = await fetch(`${BASE}/models`, { headers: ATTRIBUTION });
  if (!res.ok) throw new Error(await readError(res, `Liste des modèles indisponible (HTTP ${res.status}).`));
  const body = await res.json();
  return (body.data || [])
    .filter((m) => {
      const p = m.pricing || {};
      const free = Number(p.prompt) === 0 && Number(p.completion) === 0;
      const out = m.architecture?.output_modalities || [];
      return free && out.length === 1 && out[0] === 'text';
    })
    .map((m) => ({
      id: m.id,
      nom: (m.name || m.id).replace(/\s*\(free\)\s*$/i, ''),
      contexte: m.context_length || 0,
    }))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
}

/** Checks a key against /key, which 401s when it is wrong. */
export async function checkKey(key) {
  const res = await fetch(`${BASE}/key`, { headers: authHeaders(key) });
  if (res.status === 401) throw new Error('Clé refusée par OpenRouter.');
  if (!res.ok) throw new Error(await readError(res, `Vérification impossible (HTTP ${res.status}).`));
  const body = await res.json();
  return body.data || {};
}

// The model is asked for exactly the shape lib/analysis.js already produces, so
// the rest of the app cannot tell which engine answered.
const SHAPE = `{
  "resume": "une phrase de synthèse sur la journée",
  "energie": "une phrase sur l'énergie dépensée",
  "tonus": "une phrase sur les muscles sollicités et le stimulus",
  "progression": 0,
  "progressionTexte": "une phrase sur l'avancée vers l'objectif hebdomadaire",
  "aFaire": ["deux ou trois conseils concrets"],
  "ameliorer": ["deux ou trois points de technique à soigner"]
}`;

function buildPrompt(profile, entries, weekCount) {
  const p = profile || {};
  const seances = entries.map((e) => ({
    nom: e.programNom,
    minutes: Math.round(e.elapsedSec / 60),
    series: e.series,
    kcal: e.kcal,
    muscles: e.muscles,
    partielle: !!e.partial,
  }));
  return [
    'Profil : ' + JSON.stringify({
      prenom: p.prenom || null, sexe: p.sexe, age: p.age, poids: p.poids,
      taille: p.taille, poidsCible: p.poidsCible, experience: p.experience,
      objectif: p.objectif, frequenceVisee: p.frequence, contraintes: p.contraintes || null,
    }),
    `Séances du jour : ${JSON.stringify(seances)}`,
    `Séances déjà faites cette semaine : ${weekCount}`,
    '',
    `Réponds uniquement par un objet JSON de cette forme, en français, en tutoyant : ${SHAPE}`,
    '"progression" est un entier de 0 à 100 estimant l\'avancée vers l\'objectif hebdomadaire.',
  ].join('\n');
}

const SYSTEM = [
  "Tu es un coach de musculation qui analyse la journée d'entraînement de l'utilisateur.",
  'Tu réponds en français, en tutoyant, de façon concrète et chiffrée à partir des données fournies.',
  "Tu donnes des conseils d'entraînement, jamais un avis médical ou un diagnostic.",
  'Tu réponds uniquement par du JSON valide, sans texte autour et sans bloc de code.',
].join(' ');

// Models vary in how well they honour "JSON only" — some wrap it in a fence or
// add a sentence around it, so pull the outermost object out rather than
// trusting the whole body to parse.
function parseAnalysis(text) {
  const raw = extractJsonObject(text);
  if (!raw) throw new Error("Le modèle n'a pas renvoyé de JSON.");
  const parsed = JSON.parse(raw);
  const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()) : []);
  const str = (v, fallback) => (typeof v === 'string' && v.trim() ? v.trim() : fallback);
  const pct = Number(parsed.progression);
  return {
    resume: str(parsed.resume, 'Analyse indisponible.'),
    energie: str(parsed.energie, '—'),
    tonus: str(parsed.tonus, '—'),
    progression: Number.isFinite(pct) ? Math.max(0, Math.min(100, Math.round(pct))) : 0,
    progressionTexte: str(parsed.progressionTexte, ''),
    aFaire: list(parsed.aFaire).slice(0, 4),
    ameliorer: list(parsed.ameliorer).slice(0, 4),
  };
}

/** One round-trip to a chat completion, with the failure modes named. */
async function complete({ key, model, system, user, maxTokens, signal }) {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { ...authHeaders(key), 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (res.status === 401) throw new Error('Clé OpenRouter refusée.');
  if (res.status === 429) throw new Error('Quota du modèle gratuit atteint, réessaie plus tard.');
  if (!res.ok) throw new Error(await readError(res, `OpenRouter a répondu HTTP ${res.status}.`));
  const body = await res.json();
  // A 200 can still carry an error object rather than a choice.
  if (body.error) throw new Error(body.error.message || 'Erreur OpenRouter.');
  const text = body.choices?.[0]?.message?.content;
  if (!text) throw new Error('Réponse vide du modèle.');
  return text;
}

/**
 * Asks the configured model for the day's analysis. Throws on any failure —
 * the caller falls back to the local engine rather than leaving the user with
 * nothing.
 */
export async function requestAnalysis({ key, model, profile, entries, weekCount, signal }) {
  return parseAnalysis(await complete({
    key, model, signal, maxTokens: 900, system: SYSTEM,
    user: buildPrompt(profile, entries, weekCount),
  }));
}

// --- Progress analysis -----------------------------------------------------

const PROGRESS_SHAPE = '{"resume":"","progression":0,"points":[{"titre":"","texte":"","ton":"ok|attention|info"}],"aFaire":[""],"ameliorer":[""]}';

const PROGRESS_SYSTEM = [
  "Tu es un coach de musculation qui analyse la progression d'un utilisateur sur plusieurs semaines.",
  'Tu réponds en français, en tutoyant, de façon concrète et chiffrée à partir des seules données fournies.',
  "Tu juges l'écart entre ce que la personne a déclaré vouloir (objectif principal, zones prioritaires, objectif et cibles nutritionnels) et ce que ses données montrent.",
  "Tu tiens compte des contraintes ou blessures déclarées dans tes conseils, sans jamais poser de diagnostic ni donner d'avis médical.",
  "N'invente aucun chiffre : ce qui n'est pas mesuré est signalé comme non renseigné.",
  'Tu réponds uniquement par du JSON valide, sans texte autour et sans bloc de code.',
].join(' ');

// The same measurements the local engine works from (lib/progressAnalysis.js),
// so the two answer the same question from the same facts.
function buildProgressPrompt(stats) {
  return [
    'Voici les données de progression :',
    JSON.stringify(stats),
    '',
    `Réponds uniquement par un objet JSON de cette forme : ${PROGRESS_SHAPE}`,
    '"points" contient 3 à 6 constats, un par thème (rythme, volume, objectif principal, zones prioritaires, nutrition, contraintes) ;',
    '"ton" vaut "ok" quand le thème est tenu, "attention" quand il y a un écart à corriger, "info" sinon.',
    '"progression" est un entier de 0 à 100 estimant l\'adéquation entre les objectifs déclarés et les données.',
  ].join('\n');
}

function parseProgressAnalysis(text) {
  const raw = extractJsonObject(text);
  if (!raw) throw new Error("Le modèle n'a pas renvoyé de JSON.");
  const parsed = JSON.parse(raw);
  const str = (v, fallback) => (typeof v === 'string' && v.trim() ? v.trim() : fallback);
  const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()) : []);
  const pct = Number(parsed.progression);
  const points = (Array.isArray(parsed.points) ? parsed.points : [])
    .map((p, i) => ({
      key: `or-${i}`,
      titre: str(p?.titre, 'Constat'),
      texte: str(p?.texte, ''),
      ton: ['ok', 'attention', 'info'].includes(p?.ton) ? p.ton : 'info',
    }))
    .filter((p) => p.texte)
    .slice(0, 6);
  return {
    resume: str(parsed.resume, 'Analyse indisponible.'),
    progression: Number.isFinite(pct) ? Math.max(0, Math.min(100, Math.round(pct))) : 0,
    points,
    aFaire: list(parsed.aFaire).slice(0, 4),
    ameliorer: list(parsed.ameliorer).slice(0, 4),
  };
}

/** Same contract as `requestAnalysis`: throws, and the caller falls back. */
export async function requestProgressAnalysis({ key, model, stats, signal }) {
  const parsed = parseProgressAnalysis(await complete({
    key, model, signal, maxTokens: 1100, system: PROGRESS_SYSTEM,
    user: buildProgressPrompt(stats),
  }));
  // A model that returned nothing usable must not look like a valid answer.
  if (!parsed.points.length) throw new Error("Le modèle n'a renvoyé aucun constat exploitable.");
  return parsed;
}
