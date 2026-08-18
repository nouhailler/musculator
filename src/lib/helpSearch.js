// One search across the three kinds of help: the FAQ, the per-screen guides in
// `data/help.js`, and the interactive tutorials.
//
// The user does not know which of the three holds their answer — they type
// "score sur 80" or "sauvegarde iphone" — so a single field searches all of
// them and the result says where it came from. Splitting the field in three
// would make the user guess the app's internal filing.
//
// Two rules make the results usable on a phone:
//
// - **Accents and case are stripped, on both sides.** "seance partielle" must
//   find "Séance partielle"; French help typed on a phone keyboard rarely
//   carries its accents.
// - **Every token must match, by prefix.** Two words narrow, they don't widen:
//   "score micro" keeps only what mentions both, and "micro" still finds
//   "micronutriments" while someone is still typing.
//
// A hit in a title outranks one in the body, and the excerpt is cut around the
// first match so the result list shows *why* it matched.

import { HELP } from '../data/help.js';
import { FAQ, catLabel } from '../data/faq.js';
import { TOURS } from '../data/tours.js';

/** Lowercase, unaccented, punctuation-free — the form both sides are compared in. */
export function norm(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const tokenize = (q) => norm(q).split(' ').filter((t) => t.length > 1);

// The searchable corpus, built once. Each record keeps the original prose for
// display and its normalised form for matching, so nothing is re-normalised
// per keystroke.
let INDEX = null;

function buildIndex() {
  const out = [];

  for (const f of FAQ) {
    const corps = [...f.r, ...(f.mots || [])].join(' ');
    out.push({
      kind: 'faq',
      id: f.id,
      titre: f.q,
      sous: catLabel(f.cat),
      corps: f.r.join(' '),
      nTitre: norm(f.q),
      nCorps: norm(corps),
    });
  }

  for (const [key, h] of Object.entries(HELP)) {
    const corps = [h.intro, ...h.points.map(([t, x]) => `${t} ${x}`)].join(' ');
    out.push({
      kind: 'ecran',
      id: key,
      titre: h.titre,
      sous: "Guide de l'écran",
      corps: h.intro,
      nTitre: norm(h.titre),
      nCorps: norm(corps),
    });
  }

  for (const t of TOURS) {
    const corps = [t.resume, ...t.steps.map((s) => `${s.titre} ${s.texte}`)].join(' ');
    out.push({
      kind: 'tuto',
      id: t.id,
      titre: t.titre,
      sous: 'Tutoriel interactif',
      corps: t.resume,
      nTitre: norm(t.titre),
      nCorps: norm(corps),
    });
  }

  return out;
}

function index() {
  if (!INDEX) INDEX = buildIndex();
  return INDEX;
}

// A token scores where it lands: a title hit is worth five body hits, and a
// hit on a word boundary beats one in the middle of a longer word, so "repos"
// ranks the entry about rest above the one that merely says "reposer".
function scoreToken(rec, tok) {
  let s = 0;
  if (rec.nTitre.includes(tok)) s += new RegExp(`\\b${tok}`).test(rec.nTitre) ? 10 : 6;
  if (rec.nCorps.includes(tok)) s += new RegExp(`\\b${tok}`).test(rec.nCorps) ? 2 : 1;
  return s;
}

/** Cuts ~140 characters of the answer around the first match, so the list says why it matched. */
function excerpt(rec, toks) {
  const text = rec.corps;
  const n = norm(text);
  let at = -1;
  for (const t of toks) {
    const i = n.indexOf(t);
    if (i >= 0 && (at < 0 || i < at)) at = i;
  }
  if (text.length <= 150) return text;
  // norm() collapses runs of punctuation, so the index drifts on long texts;
  // it is close enough to pick a window, never to highlight a character range.
  const start = Math.max(0, Math.min(at < 0 ? 0 : at - 40, text.length - 150));
  const cut = text.slice(start, start + 150).trim();
  return `${start > 0 ? '…' : ''}${cut}…`;
}

/**
 * Searches every kind of help at once.
 * Returns `[{ kind: 'faq' | 'ecran' | 'tuto', id, titre, sous, extrait, score }]`,
 * best first. An empty or one-letter query returns nothing rather than everything.
 */
export function searchHelp(query, limit = 24) {
  const toks = tokenize(query);
  if (!toks.length) return [];

  const hits = [];
  for (const rec of index()) {
    let total = 0;
    let all = true;
    for (const t of toks) {
      const s = scoreToken(rec, t);
      if (!s) { all = false; break; }
      total += s;
    }
    if (!all) continue;
    hits.push({
      kind: rec.kind, id: rec.id, titre: rec.titre, sous: rec.sous,
      extrait: excerpt(rec, toks), score: total,
    });
  }

  // Ties broken by title length: the shortest entry matching the same words is
  // almost always the one that is *about* them.
  hits.sort((a, b) => b.score - a.score || a.titre.length - b.titre.length);
  return hits.slice(0, limit);
}

/** Searches only inside one kind — used by the FAQ list's own filter. */
export function searchKind(query, kind) {
  return searchHelp(query, 100).filter((h) => h.kind === kind);
}
