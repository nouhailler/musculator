// Reading the documentation inside the app.
//
// The pages themselves are a lazily imported chunk (see `data/docs.js`), so
// nothing is downloaded until someone opens the documentation — the same
// treatment the CIQUAL table gets, and for the same reason: it is reference
// material most sessions never touch.

import { DOC_SECTIONS, sectionIcon, sectionLabel } from '../data/docSections.js';
import { fold, plainText, render, resolveDocPath } from './markdown.js';

let docsPromise = null;

/** The documentation, fetched once. */
export function loadDocs() {
  if (!docsPromise) {
    docsPromise = import('../data/docs.js')
      .then((m) => m.DOC_PAGES)
      .catch((e) => {
        // Don't cache the failure: a first attempt made before the service
        // worker had the chunk must not poison every later visit.
        docsPromise = null;
        throw e;
      });
  }
  return docsPromise;
}

export const pageByRel = (pages, rel) => pages.find((p) => p.rel === rel) || null;

/** Chapters in reading order, each with its pages. Empty chapters are dropped. */
export function docTree(pages) {
  return DOC_SECTIONS
    .map(({ key }) => ({
      key,
      label: sectionLabel(key),
      icon: sectionIcon(key),
      pages: pages.filter((p) => p.section === key),
    }))
    .filter((s) => s.pages.length > 0);
}

/**
 * A link inside a page, resolved to what the app should do with it.
 * Returns `{ kind: 'externe' | 'ancre' | 'page' | 'inconnu' }`.
 */
export function resolveDocLink(pages, fromRel, href) {
  if (/^(https?:|mailto:|tel:)/.test(href)) return { kind: 'externe', href };
  if (href.startsWith('#')) return { kind: 'ancre', hash: href.slice(1) };
  const { rel, hash } = resolveDocPath(fromRel, href);
  return pageByRel(pages, rel) ? { kind: 'page', rel, hash } : { kind: 'inconnu', rel };
}

/** Previous / next in reading order, so a page is never a dead end. */
export function neighbours(pages, rel) {
  const i = pages.findIndex((p) => p.rel === rel);
  return { prev: i > 0 ? pages[i - 1] : null, next: i >= 0 ? pages[i + 1] || null : null };
}

/** The H2/H3 of a page, for its table of contents. */
export function pageOutline(page) {
  return render(page.body, { anchors: false }).headings
    .filter((h) => h.level === 2 || h.level === 3)
    .map((h) => ({ ...h, text: h.text.replace(/`([^`]+)`/g, '$1').replace(/\*\*?/g, '') }));
}

// --- Search ----------------------------------------------------------------
//
// Same rules as the help centre's search (`lib/helpSearch.js`): accents and
// case are stripped on both sides — documentation typed on a phone keyboard
// rarely carries its accents — and **every** token must match by prefix, so
// each word typed narrows the result rather than widening it.

let index = null;
let indexed = null;

function buildIndex(pages) {
  if (indexed === pages) return index;
  index = pages.map((p) => ({
    page: p,
    titre: fold(p.titre),
    description: fold(p.description),
    corps: fold(plainText(p.body)),
  }));
  indexed = pages;
  return index;
}

const hasPrefix = (haystack, token) => {
  let at = haystack.indexOf(token);
  while (at !== -1) {
    if (at === 0 || !/[a-z0-9]/.test(haystack[at - 1])) return true;
    at = haystack.indexOf(token, at + 1);
  }
  return false;
};

export function searchDocs(pages, query) {
  const tokens = fold(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const hits = [];
  for (const entry of buildIndex(pages)) {
    let score = 0;
    let all = true;
    for (const t of tokens) {
      if (hasPrefix(entry.titre, t)) score += 12;
      else if (hasPrefix(entry.description, t)) score += 6;
      else if (hasPrefix(entry.corps, t)) score += 1;
      else { all = false; break; }
    }
    if (all) hits.push({ page: entry.page, score });
  }
  return hits.sort((a, b) => b.score - a.score).map((h) => h.page);
}
