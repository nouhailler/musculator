// Every documentation page, as raw Markdown, read straight from `docs/`.
//
// **There is no second copy.** The app renders exactly the files that
// `scripts/gen-docs.mjs` builds the static site from and that
// `npm run docs:audit` checks against the source code — so a page cannot be
// up to date in one place and stale in the other. That is the whole reason
// this is a glob over `docs/` rather than a generated data file.
//
// The glob is **eager on purpose**: this module is only ever reached through
// `lib/docs.js`, which imports it dynamically. Eager inside a lazily imported
// module means the whole documentation lands in one chunk fetched on first
// use — the same shape as the CIQUAL table — instead of 69 separate requests.

import { parseFront } from '../lib/markdown.js';
import { sectionRank } from './docSections.js';

const FILES = import.meta.glob('../../docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const firstHeading = (body) => (/^#\s+(.+)$/m.exec(body) || [])[1];

export const DOC_PAGES = Object.entries(FILES)
  .map(([path, raw]) => {
    const rel = path.replace(/^.*\/docs\//, '');
    const { meta, body } = parseFront(raw);
    return {
      rel,
      section: rel.includes('/') ? rel.split('/')[0] : '',
      titre: meta.titre || firstHeading(body) || rel,
      description: meta.description || '',
      ordre: Number(meta.ordre ?? 99),
      body,
    };
  })
  // `docs/site/` is the generated site; it holds no Markdown today, but a
  // stray file there must never turn up in the reader.
  .filter((p) => !p.rel.startsWith('site/'))
  .sort((a, b) => sectionRank(a.section) - sectionRank(b.section)
    || a.ordre - b.ordre
    || a.rel.localeCompare(b.rel));

export const DOC_HOME = 'index.md';
