// The Markdown subset the documentation is written in, and its renderer.
//
// **One renderer, two consumers.** `scripts/gen-docs.mjs` builds the static
// doc site from it and `overlays/Documentation.jsx` renders the same pages
// inside the app. A second implementation would drift from this one the first
// time a page used something it did not support, and the two would disagree
// about the same source file — so this module lives in `src/` and the build
// script imports it, rather than the other way round.
//
// Kept React-free for exactly that reason: a Node script has to be able to
// import it.
//
// The subset is what `docs/` actually uses: headings (with `{#ancre}`),
// paragraphs, lists, tables, fenced code, blockquotes, rules, and inline
// emphasis / code / links / images. Anything else is passed through as text.

const CODE_MARK = '\u0001';

/** `---` front matter to `{ meta, body }`. Values are plain strings. */
export function parseFront(text) {
  const meta = {};
  let body = text;
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (m) {
    body = text.slice(m[0].length);
    for (const line of m[1].split(/\r?\n/)) {
      const kv = /^([A-Za-zÀ-ſ_-]+):\s*(.*)$/.exec(line);
      if (kv) meta[kv[1]] = kv[2].trim();
    }
  }
  return { meta, body };
}

/** Accent- and case-insensitive slug, matching the ids the renderer emits. */
export function slugify(s) {
  return s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Accent- and case-folded text, for search and for comparing prose. */
export const fold = (s) => String(s)
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const esc = (s) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export const isExternal = (href) => /^(https?:|mailto:|tel:)/.test(href);

// A URL scheme that executes rather than navigates. The documentation is
// written in this repository, so nothing hostile is expected here — but the
// renderer's output is injected as HTML, and "the input is trusted" is exactly
// the assumption that stops holding the day something else is rendered with
// it. Neutralised rather than relied upon.
//
// The in-app reader would already refuse such a link (it intercepts every
// click and only lets http/mailto/tel leave), but the static site has no such
// interception — so the guard belongs here, where both go through.
const UNSAFE_SCHEME = /^\s*(javascript|data|vbscript):/i;
const safeHref = (href) => (UNSAFE_SCHEME.test(href) ? '#' : href);

function inlineWith(hrefFn) {
  return function inline(s) {
    let out = esc(s);
    // Code first: nothing inside a span of code should be re-interpreted.
    const code = [];
    out = out.replace(/`([^`]+)`/g, (_, c) => `${CODE_MARK}${code.push(c) - 1}${CODE_MARK}`);
    out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,
      (_, alt, src) => `<img src="${safeHref(hrefFn(src))}" alt="${alt}" loading="lazy">`);
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, h) => {
      const url = safeHref(hrefFn(h));
      const ext = isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return `<a href="${url}"${ext}>${t}</a>`;
    });
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    const re = new RegExp(`${CODE_MARK}(\\d+)${CODE_MARK}`, 'g');
    return out.replace(re, (_, i) => `<code>${code[Number(i)]}</code>`);
  };
}

const cells = (row) => row.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

/**
 * Markdown to HTML, plus the headings it produced (for tables of contents and
 * for search).
 *
 * `opts.href` maps a link as written to the link the output should carry. The
 * site turns `x.md` into `x.html`; the app leaves it alone and intercepts the
 * click, because inside the app a doc link is a state change, not a
 * navigation.
 */
export function render(md, opts = {}) {
  const hrefFn = opts.href || ((h) => h);
  const inline = inlineWith(hrefFn);
  const lines = String(md).split(/\r?\n/);
  const html = [];
  const headings = [];
  const listStack = [];
  let i = 0;

  const closeList = () => { while (listStack.length) html.push(`</${listStack.pop()}>`); };

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      closeList();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      html.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }

    const h = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (h) {
      closeList();
      let text = h[2];
      let id = null;
      const anchor = /\s*\{#([A-Za-z0-9_-]+)\}\s*$/.exec(text);
      if (anchor) { id = anchor[1]; text = text.slice(0, anchor.index); }
      const level = h[1].length;
      id = id || slugify(text);
      headings.push({ level, text, id });
      const a = level > 1 && opts.anchors !== false
        ? `<a class="anchor" href="#${id}" aria-label="Lien vers cette section">#</a>` : '';
      html.push(`<h${level} id="${id}">${inline(text)}${a}</h${level}>`);
      i++;
      continue;
    }

    if (/^(\*\*\*|---|___)\s*$/.test(line)) { closeList(); html.push('<hr>'); i++; continue; }

    // Table: a header row followed by a separator row.
    if (/^\|/.test(line) && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1] || '')) {
      closeList();
      const head = cells(line);
      const align = cells(lines[i + 1]).map((c) => (
        c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : 'left'));
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(cells(lines[i++]));
      // `| | |` is how a two-column key/value table is written; drawing an
      // empty header strip for it just adds a band above the content.
      const thead = head.some((c) => c)
        ? '<thead><tr>'
          + head.map((c, n) => `<th style="text-align:${align[n] || 'left'}">${inline(c)}</th>`).join('')
          + '</tr></thead>'
        : '';
      html.push(`<div class="table-wrap"><table>${thead}<tbody>`
        + rows.map((r) => '<tr>' + r.map((c, n) => (
          `<td style="text-align:${align[n] || 'left'}">${inline(c)}</td>`)).join('') + '</tr>').join('')
        + '</tbody></table></div>');
      continue;
    }

    if (/^>\s?/.test(line)) {
      closeList();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      html.push(`<blockquote>${render(buf.join('\n'), opts).html}</blockquote>`);
      continue;
    }

    const li = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line);
    if (li) {
      const tag = /^\d/.test(li[2]) ? 'ol' : 'ul';
      if (!listStack.length || listStack[listStack.length - 1] !== tag) {
        closeList();
        listStack.push(tag);
        html.push(`<${tag}>`);
      }
      // A wrapped list item continues on indented lines that start no new item.
      const buf = [li[3]];
      i++;
      while (i < lines.length && /^\s+\S/.test(lines[i]) && !/^(\s*)([-*]|\d+\.)\s+/.test(lines[i])) {
        buf.push(lines[i++].trim());
      }
      html.push(`<li>${inline(buf.join(' '))}</li>`);
      continue;
    }

    if (!line.trim()) { closeList(); i++; continue; }

    // Paragraph: consume until a blank line or a block-level start.
    const buf = [];
    while (i < lines.length && lines[i].trim()
      && !/^(#{1,6}\s|```|>|\||\s*([-*]|\d+\.)\s)/.test(lines[i])
      && !/^(\*\*\*|---|___)\s*$/.test(lines[i])) buf.push(lines[i++].trim());
    if (buf.length) html.push(`<p>${inline(buf.join(' '))}</p>`);
    else i++;
  }
  closeList();
  return { html: html.join('\n'), headings };
}

/** Plain text of a page, for the search index. */
export function plainText(md) {
  return String(md)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\{#[A-Za-z0-9_-]+\}/g, ' ')
    .replace(/[|#>*_`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * `a/b/c.md` + `../d/e.md` to `a/d/e.md`. The docs link to each other with
 * relative paths, and both the site and the app have to resolve them the same
 * way — the app has no URL to lean on, so it does it here.
 */
export function resolveDocPath(fromRel, href) {
  const [path, hash] = href.split('#');
  if (!path) return { rel: fromRel, hash: hash || '' };
  const base = fromRel.split('/').slice(0, -1);
  const parts = path.split('/');
  for (const part of parts) {
    if (part === '.' || part === '') continue;
    if (part === '..') base.pop();
    else base.push(part);
  }
  let rel = base.join('/');
  if (rel.endsWith('/')) rel += 'index.md';
  else if (!rel.endsWith('.md')) rel += '/index.md';
  return { rel, hash: hash || '' };
}
