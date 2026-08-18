// What a support message needs to be answerable, collected on the device.
//
// Nine tenths of "ça ne marche pas" is unanswerable without knowing the build,
// the browser and whether the app is installed — and none of it is something a
// user can be asked to look up. So it is gathered here and shown, in full,
// before anything is sent: the user reads exactly what leaves the phone.
//
// **Nothing personal goes in.** No name, no weight, no food, no session — the
// counts below say "47 séances", never which. The OpenRouter *key* is never
// read at all; only whether a model is configured, because "l'analyse échoue"
// depends on it.
//
// User-Agent parsing is guesswork by nature: every branch degrades to the raw
// string rather than claiming a wrong device.

import { BUILD_ID, BUILD_TIME } from './pwa.js';

export const SUPPORT_EMAIL = 'contact@swinux.ch';

const ua = () => (typeof navigator === 'undefined' ? '' : navigator.userAgent || '');

/** iOS reports "iPhone OS 17_5_1"; Android carries its version plainly. */
function osOf(s) {
  let m = s.match(/(?:iPhone|CPU) OS (\d+[_.]\d+(?:[_.]\d+)?)/);
  if (m) return `iOS ${m[1].replace(/_/g, '.')}`;
  if (/iPad|iPhone|iPod/.test(s)) return 'iOS';
  m = s.match(/Android (\d+(?:\.\d+)*)/);
  if (m) return `Android ${m[1]}`;
  m = s.match(/Windows NT (\d+\.\d+)/);
  if (m) return `Windows NT ${m[1]}`;
  m = s.match(/Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/);
  if (m) return `macOS ${m[1].replace(/_/g, '.')}`;
  if (/CrOS/.test(s)) return 'ChromeOS';
  if (/Linux/.test(s)) return 'Linux';
  return 'inconnu';
}

/**
 * The device model, when the UA volunteers it.
 *
 * Android puts the real model in the UA ("SM-S911B"); Apple deliberately does
 * not — every iPhone says "iPhone" — so the honest answer there is the family,
 * not a guessed generation.
 */
function deviceOf(s) {
  const m = s.match(/Android [\d.]+;\s*([^;)]+?)(?:\s+Build\/|[;)])/);
  if (m && m[1] && m[1] !== 'K') return m[1].trim();
  if (/iPad/.test(s)) return 'iPad';
  if (/iPhone/.test(s)) return 'iPhone (modèle non communiqué par iOS)';
  if (/Android/.test(s)) return 'Android (modèle non communiqué)';
  if (/Macintosh/.test(s)) return 'Mac';
  if (/Windows/.test(s)) return 'PC Windows';
  if (/CrOS/.test(s)) return 'Chromebook';
  if (/Linux/.test(s)) return 'Ordinateur Linux';
  return 'inconnu';
}

/** Order matters: every Chromium browser also says "Safari", and Edge says "Chrome". */
function browserOf(s) {
  const pairs = [
    ['Edg', 'Edge'], ['OPR', 'Opera'], ['SamsungBrowser', 'Samsung Internet'],
    ['CriOS', 'Chrome iOS'], ['FxiOS', 'Firefox iOS'], ['Firefox', 'Firefox'],
    ['Chrome', 'Chrome'], ['Safari', 'Safari'],
  ];
  for (const [needle, label] of pairs) {
    const m = s.match(new RegExp(`${needle}\\/(\\d+(?:\\.\\d+)?)`));
    if (m) return `${label} ${m[1]}`;
  }
  return 'inconnu';
}

/** Installed to the home screen, or running in a browser tab — they behave differently. */
function displayMode() {
  try {
    if (window.matchMedia?.('(display-mode: standalone)').matches) return 'installée (plein écran)';
    if (window.navigator.standalone) return 'installée (iOS)';
  } catch {
    // matchMedia unavailable — fall through to the browser answer.
  }
  return 'onglet de navigateur';
}

function storageKB() {
  try {
    const raw = localStorage.getItem('musculator:v1');
    if (!raw) return 'vide';
    // Rounded to kilobytes a brand-new install reads "0 Ko", which looks like
    // a failure rather than an empty journal.
    return raw.length < 1024 ? `${raw.length} o` : `${Math.round(raw.length / 1024)} Ko`;
  } catch {
    return 'inaccessible';
  }
}

// __BUILD_TIME__ is an ISO string; nobody reads a timestamp with milliseconds.
function buildLabel(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso)
    : d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

/** Environment only — the half that doesn't need app state. */
export function deviceInfo() {
  const s = ua();
  return {
    version: BUILD_ID,
    build: BUILD_TIME,
    appareil: deviceOf(s),
    os: osOf(s),
    navigateur: browserOf(s),
    mode: displayMode(),
    ecran: typeof window === 'undefined' ? '—'
      : `${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio || 1}x`,
    langue: typeof navigator === 'undefined' ? '—' : navigator.language || '—',
    fuseau: Intl.DateTimeFormat().resolvedOptions().timeZone || '—',
    ua: s || '—',
  };
}

/**
 * The full report, as ordered `{ label, value }` lines — the same list the
 * screen shows and the mail carries, so what is displayed *is* what is sent.
 */
export function diagnostics(state) {
  const d = deviceInfo();
  const sessions = state?.sessionLog?.length || 0;
  const jours = Object.keys(state?.nutriLog || {}).length;
  const perso = state?.customWorkouts?.length || 0;
  const aliments = Object.keys(state?.foodCache || {}).length;

  return [
    { label: 'Version', value: `${d.version} · ${buildLabel(d.build)}` },
    { label: 'Appareil', value: d.appareil },
    { label: 'Système', value: d.os },
    { label: 'Navigateur', value: d.navigateur },
    { label: 'Mode', value: d.mode },
    { label: 'Écran', value: d.ecran },
    { label: 'Langue / fuseau', value: `${d.langue} · ${d.fuseau}` },
    { label: 'Réseau', value: state?.online === false ? 'hors-ligne' : 'en ligne' },
    { label: 'Thème', value: state?.theme || '—' },
    { label: 'Coach vocal', value: state?.voiceOn ? 'activé' : 'coupé' },
    // Volume only. Support needs to know whether a bug happens on an empty app
    // or on three years of history; it never needs the history itself.
    { label: 'Contenu', value: `${sessions} séances · ${perso} séances perso · ${jours} jours de nutrition · ${aliments} aliments` },
    { label: 'Stockage local', value: storageKB() },
    // The key itself is never read here, only the fact that a model is set.
    { label: 'Analyse IA', value: state?.openrouter?.model ? `OpenRouter · ${state.openrouter.model}` : 'locale (aucun modèle configuré)' },
    { label: 'User-Agent', value: d.ua },
  ];
}

export const diagnosticsText = (state) =>
  diagnostics(state).map(({ label, value }) => `${label}: ${value}`).join('\n');

/** Subject and body of the support mail, assembled from the message and the report. */
export function supportMail(state, { sujet, message }) {
  const objet = `Musculator — ${sujet || 'demande de support'}`;
  const corps = [
    message?.trim() || '',
    '',
    '— — —',
    'Informations de diagnostic (envoyées automatiquement) :',
    diagnosticsText(state),
  ].join('\n');
  return { to: SUPPORT_EMAIL, objet, corps };
}

/**
 * Hands the message to the device's mail app.
 *
 * `mailto:` is the only way to reach a mail client without a backend, and it
 * fails silently on a device with no mail account configured — so the text is
 * also copied to the clipboard, and the caller says so. Returns 'mail' or
 * 'clipboard'.
 */
export async function sendSupport(state, { sujet, message }) {
  const { to, objet, corps } = supportMail(state, { sujet, message });
  const full = `À : ${to}\nObjet : ${objet}\n\n${corps}`;
  let copied = false;
  try {
    await navigator.clipboard?.writeText(full);
    copied = true;
  } catch {
    // Clipboard refused (no permission, insecure context) — the mail app is
    // still the main path.
  }
  try {
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`;
    return 'mail';
  } catch {
    return copied ? 'clipboard' : 'echec';
  }
}
