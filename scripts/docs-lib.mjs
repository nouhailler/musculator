// File-system layer over the documentation, for the build scripts.
//
// **The Markdown renderer itself lives in `src/lib/markdown.js`** and is
// imported from there, not duplicated here: the app renders the same pages
// from the same source, and two renderers would sooner or later disagree
// about the same file. This module only adds what a script needs and a
// browser does not — walking `docs/`, reading files, and mapping a link to
// the URL the *static site* carries.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parseFront, render, plainText, slugify, fold } from '../src/lib/markdown.js';

export { parseFront, render, plainText, slugify, fold };

export const DOCS_DIR = 'docs';

/** Every documentation page, excluding generated and asset folders. */
export function listPages(dir = DOCS_DIR, out = []) {
  for (const name of readdirSync(dir).sort()) {
    if (name === 'screenshots' || name === 'assets' || name === 'site') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) listPages(p, out);
    else if (name.endsWith('.md')) out.push(p);
  }
  return out;
}

const firstHeading = (body) => (/^#\s+(.+)$/m.exec(body) || [])[1];

export function readPage(file) {
  const { meta, body } = parseFront(readFileSync(file, 'utf8'));
  const rel = relative(DOCS_DIR, file).split(sep).join('/');
  return {
    file,
    rel,
    section: rel.includes('/') ? rel.split('/')[0] : '',
    url: rel.replace(/\.md$/, '.html'),
    titre: meta.titre || firstHeading(body) || rel,
    description: meta.description || '',
    ordre: Number(meta.ordre ?? 99),
    body,
  };
}

/**
 * A link as written in Markdown, mapped to the URL the built site carries:
 * `x.md` becomes `x.html`, `dir/` becomes `dir/index.html`. Anchors and
 * external URLs pass through untouched.
 *
 * The app does *not* use this — inside the app a doc link is a state change,
 * so it keeps the `.md` reference and intercepts the click.
 */
export function resolveHref(href) {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  const [path, hash] = href.split('#');
  let p = path;
  if (p.endsWith('.md')) p = `${p.slice(0, -3)}.html`;
  else if (p.endsWith('/')) p = `${p}index.html`;
  return hash ? `${p}#${hash}` : p;
}
