// Reads a walk out of a file exported by something else — a GPX track, or the
// CSV that Strava, Apple Santé and Google Fit exports all boil down to.
//
// Same contract as the other importers here: nothing is written, the caller
// previews first, and anything unusable is reported by name rather than
// silently dropped.
import { haversine, makeActivityEntry } from './activity.js';

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})/;

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const numeric = (v) => {
  const n = Number(String(v ?? '').replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

// Month names, French and English: Strava dates its rows in the account's
// locale ("15 août 2026, 09:12:00"), which Date.parse cannot read. Ordered so
// "juin" and "juillet" are told apart before their shared prefix.
const MONTHS = [
  ['janv', 'jan'], ['fevr', 'feb'], ['mars', 'mar'], ['avri', 'apr'], ['mai', 'may'],
  ['juin', 'jun'], ['juil', 'jul'], ['aout', 'aug'], ['sept', 'sep'], ['octo', 'oct'],
  ['nove', 'nov'], ['dece', 'dec'],
];

function monthFromName(word) {
  const w = norm(word);
  const i = MONTHS.findIndex(([fr, en]) => w.startsWith(fr) || w.startsWith(en));
  return i < 0 ? null : String(i + 1).padStart(2, '0');
}

/** ISO date out of whatever a file wrote in its date column. */
function toDateKey(raw) {
  const s = String(raw ?? '').trim();
  const iso = s.match(DATE_RE);
  if (iso) return iso[0];
  // "15/08/2026" and "15-08-2026", the other common export format.
  const fr = s.match(/^(\d{2})[/-](\d{2})[/-](\d{4})/);
  if (fr) return `${fr[3]}-${fr[2]}-${fr[1]}`;
  // "15 août 2026" / "15 Aug 2026" / "Aug 15, 2026".
  const named = s.match(/^(\d{1,2})\s+([^\s,]+)\s+(\d{4})/) || s.match(/^([^\s,]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (named) {
    const dayFirst = /^\d/.test(named[1]);
    const month = monthFromName(dayFirst ? named[2] : named[1]);
    const day = dayFirst ? named[1] : named[2];
    if (month) return `${named[3]}-${month}-${String(day).padStart(2, '0')}`;
  }
  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) {
    const d = new Date(parsed);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return null;
}

// --- GPX -------------------------------------------------------------------

/**
 * A GPX track's distance, summed between consecutive points. Parsed with
 * DOMParser rather than a regex — a track is XML, and the app runs in a
 * browser that already has a parser.
 */
function parseGPX(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('Fichier GPX illisible.');
  const points = [...doc.getElementsByTagName('trkpt'), ...doc.getElementsByTagName('rtept')];
  if (points.length < 2) throw new Error('Aucune trace exploitable dans ce GPX (moins de 2 points).');

  let metres = 0;
  let previous = null;
  let first = null;
  let last = null;
  for (const pt of points) {
    const lat = Number(pt.getAttribute('lat'));
    const lon = Number(pt.getAttribute('lon'));
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const fix = { lat, lon };
    if (previous) metres += haversine(previous, fix);
    previous = fix;
    const time = pt.getElementsByTagName('time')[0]?.textContent;
    if (time) {
      first = first || time;
      last = time;
    }
  }
  if (metres <= 0) throw new Error('La trace ne parcourt aucune distance.');

  // Duration from the track's own timestamps when it carries them; a GPX
  // without <time> gives distance only, and the entry says so by leaving
  // minutes at zero rather than inventing a pace.
  let minutes = 0;
  if (first && last) {
    const span = (Date.parse(last) - Date.parse(first)) / 60000;
    if (Number.isFinite(span) && span > 0) minutes = Math.round(span);
  }
  const dateKey = toDateKey(first) || toDateKey(new Date().toISOString());
  const heure = first ? new Date(first).toTimeString().slice(0, 5) : null;
  const nom = doc.getElementsByTagName('name')[0]?.textContent?.trim() || null;

  return {
    log: { [dateKey]: [makeActivityEntry({ km: metres / 1000, minutes, source: 'import', heure, note: nom })] },
    count: 1,
    days: 1,
    skipped: 0,
  };
}

// --- CSV -------------------------------------------------------------------

function splitRow(line, delim) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

// Header names seen across Strava, Apple Santé and Google Fit exports, plus
// the French ones. Matching is on a normalised *contains*, since every export
// decorates its columns differently ("Distance (km)", "distance_km"…).
const COLS = {
  date: ['date', 'start time', 'date de debut', 'startdate', 'jour', 'debut'],
  distance: ['distance'],
  duree: ['duree', 'duration', 'moving time', 'elapsed time', 'temps'],
  nom: ['nom', 'name', 'activity name', 'titre', 'type'],
};

const findCol = (header, names) => header.findIndex((h) => names.some((n) => h.includes(n)));

function parseCSV(text) {
  const clean = String(text || '').replace(/^﻿/, '');
  const lines = clean.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new Error('Fichier vide ou sans ligne de données.');

  const delim = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
  const header = splitRow(lines[0], delim).map(norm);
  const iDate = findCol(header, COLS.date);
  const iDist = findCol(header, COLS.distance);
  if (iDate < 0 || iDist < 0) {
    throw new Error("Colonnes de date et de distance introuvables — vérifie que c'est bien un export d'activités.");
  }
  const iDuree = findCol(header, COLS.duree);
  const iNom = findCol(header, COLS.nom);
  // "Distance (m)" is metres, everything else is assumed to be kilometres.
  const enMetres = /\(m\)|_m\b|metre/.test(header[iDist]);

  const log = {};
  let count = 0;
  let skipped = 0;
  for (let r = 1; r < lines.length; r++) {
    const cells = splitRow(lines[r], delim);
    const dateKey = toDateKey(cells[iDate]);
    const distance = numeric(cells[iDist]);
    if (!dateKey || distance <= 0) { skipped++; continue; }
    const km = enMetres ? distance / 1000 : distance;
    // Durations come as minutes, or as seconds when they are big enough that
    // minutes would mean a multi-day walk.
    let minutes = iDuree >= 0 ? numeric(cells[iDuree]) : 0;
    if (minutes > 600) minutes = Math.round(minutes / 60);
    const nom = iNom >= 0 ? (cells[iNom] || '').slice(0, 40) : null;
    log[dateKey] = log[dateKey] || [];
    log[dateKey].push(makeActivityEntry({ km, minutes, source: 'import', note: nom }));
    count++;
  }
  if (!count) throw new Error(`Aucune ligne exploitable (${skipped} ignorée${skipped > 1 ? 's' : ''}).`);
  return { log, count, days: Object.keys(log).length, skipped };
}

/**
 * @param {string} text file contents
 * @param {string} filename used only to pick the parser
 * @returns {{ log, count, days, skipped }} `log` is activityLog-shaped and
 *   ready to merge; nothing is written here so the caller can preview.
 */
export function parseActivityFile(text, filename = '') {
  const body = String(text || '').trim();
  if (!body) throw new Error('Fichier vide.');
  const isGpx = /\.gpx$/i.test(filename) || body.startsWith('<?xml') || body.includes('<gpx');
  return isGpx ? parseGPX(body) : parseCSV(body);
}
