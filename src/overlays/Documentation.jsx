import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../state/context.js';
import {
  docTree, loadDocs, neighbours, pageByRel, pageOutline, resolveDocLink, searchDocs,
} from '../lib/docs.js';
import { render } from '../lib/markdown.js';
import { SecondaryButton } from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';

/**
 * The documentation, read inside the app.
 *
 * It renders the very files in `docs/` that build the static site — no copy,
 * so a page cannot be current in one and stale in the other. The chapters are
 * collapsed by default: the point of having everything in one place is being
 * able to see the whole shape of it at a glance, which a flat list of 69
 * entries does not give you.
 *
 * The pages arrive as one lazily imported chunk, so nothing is downloaded
 * until this screen is opened for the first time.
 */

// The loaded pages are a module cache, not application state: they are the
// same for every user and never change at runtime, so they stay out of the
// reducer (which holds what the user did, not what the build shipped).
function useDocPages() {
  const [state, setState] = useState({ pages: null, error: '' });
  useEffect(() => {
    let alive = true;
    loadDocs()
      .then((pages) => { if (alive) setState({ pages, error: '' }); })
      .catch(() => {
        if (alive) {
          setState({
            pages: null,
            error: "Documentation indisponible hors connexion pour l'instant. "
              + 'Reconnecte-toi une fois : elle sera ensuite lisible sans réseau.',
          });
        }
      });
    return () => { alive = false; };
  }, []);
  return state;
}

// Heading text goes into the outline as text, never as markup.
const escapeText = (t) => String(t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function ChapterRow({ chapter, openKeys, currentRel, onToggle, onGo }) {
  const open = openKeys.includes(chapter.key);
  return (
    <div style={{ marginBottom: 4 }}>
      <button
        type="button"
        onClick={() => onToggle(chapter.key)}
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
          padding: '11px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
          background: open ? 'var(--color-accent-900)' : 'var(--color-surface)',
          border: `1px solid ${open ? 'var(--color-accent-800)' : 'var(--color-divider)'}`,
          color: 'var(--color-text)',
        }}
      >
        <Icon
          name={chapter.icon} size={18} weight={open ? 'fill' : 'regular'}
          color={open ? 'var(--color-accent-200)' : 'var(--color-neutral-400)'}
          style={{ flex: 'none' }}
        />
        <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600 }}>{chapter.label}</span>
        <span style={{ fontSize: 11, color: 'var(--color-neutral-500)', flex: 'none' }}>
          {chapter.pages.length}
        </span>
        <Icon
          name={open ? 'caret-down' : 'caret-right'} size={14}
          color="var(--color-neutral-500)" style={{ flex: 'none' }}
        />
      </button>

      {open && (
        <div style={{
          margin: '3px 0 8px 19px', paddingLeft: 11,
          borderLeft: '1px solid var(--color-divider)',
        }}>
          {chapter.pages.map((p) => {
            const on = p.rel === currentRel;
            return (
              <button
                key={p.rel} type="button" onClick={() => onGo(p.rel)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
                  padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: 'none',
                  background: on ? 'var(--color-accent-900)' : 'transparent',
                  color: on ? 'var(--color-accent-200)' : 'var(--color-text)',
                  fontSize: 12.5, fontWeight: on ? 600 : 400, lineHeight: 1.45,
                }}
              >
                {p.titre}
                <span style={{
                  display: 'block', fontSize: 10.5, color: 'var(--color-neutral-500)',
                  fontWeight: 400, marginTop: 1,
                }}>
                  {p.description}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Documentation() {
  const { state, actions } = useApp();
  const { pages, error } = useDocPages();
  const doc = state.doc;
  const bodyRef = useRef(null);
  const scrollRef = useRef(null);

  const current = pages && doc.rel ? pageByRel(pages, doc.rel) : null;
  const results = useMemo(
    () => (pages && doc.query.trim().length >= 2 ? searchDocs(pages, doc.query) : []),
    [pages, doc.query],
  );
  const tree = useMemo(() => (pages ? docTree(pages) : []), [pages]);
  const outline = useMemo(() => (current ? pageOutline(current) : []), [current]);
  const { prev, next } = useMemo(
    () => (pages && doc.rel ? neighbours(pages, doc.rel) : { prev: null, next: null }),
    [pages, doc.rel],
  );

  // The Markdown is authored in this repository and bundled at build time —
  // it is never user input, and no remote content reaches it. Links keep their
  // `.md` form and are intercepted below, because inside the app following one
  // is a state change rather than a navigation.
  //
  // The outline is spliced in **under the H1** rather than rendered above the
  // body: a table of contents between the breadcrumb and the title reads as if
  // it belonged to the screen instead of to the page. Its `#id` links need no
  // React — the anchor branch of `onBodyClick` already handles them.
  const html = useMemo(() => {
    if (!current) return '';
    const body = render(current.body, { anchors: false }).html;
    if (outline.length < 3) return body;
    const nav = `<nav class="doc-toc" aria-label="Sur cette page">`
      + `<b>Sur cette page</b>`
      + outline.map((h) => (
        `<a class="l${h.level}" href="#${h.id}">${escapeText(h.text)}</a>`)).join('')
      + '</nav>';
    const end = body.indexOf('</h1>');
    return end === -1 ? nav + body : body.slice(0, end + 5) + nav + body.slice(end + 5);
  }, [current, outline]);

  // A page opens at its top, or at the heading a cross-reference asked for.
  useEffect(() => {
    if (!current) return;
    const scroller = scrollRef.current;
    if (doc.hash) {
      const el = bodyRef.current?.querySelector(`#${CSS.escape(doc.hash)}`);
      if (el) { el.scrollIntoView({ block: 'start' }); return; }
    }
    if (scroller) scroller.scrollTop = 0;
  }, [current, doc.hash, html]);

  const onBodyClick = useCallback((e) => {
    const a = e.target.closest('a');
    if (!a || !pages) return;
    const href = a.getAttribute('href') || '';
    const link = resolveDocLink(pages, doc.rel, href);
    if (link.kind === 'externe') return; // leaves the app deliberately, in a new tab
    e.preventDefault();
    if (link.kind === 'ancre') {
      bodyRef.current?.querySelector(`#${CSS.escape(link.hash)}`)
        ?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      return;
    }
    if (link.kind === 'page') actions.docGo(link.rel, link.hash);
    // 'inconnu' is left inert: docs:audit fails the build on a broken link, so
    // reaching this means a page was opened from a state the audit never saw.
  }, [pages, doc.rel, actions]);

  const searching = doc.query.trim().length >= 2;

  return (
    <div className="overlay" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="overlay-header" style={{ flex: 'none' }}>
        <SecondaryButton
          icon="arrow-left"
          onClick={doc.rel ? actions.docIndex : actions.closeOverlay}
          style={{ gap: 6 }}
        >
          {doc.rel ? 'Sommaire' : 'Retour'}
        </SecondaryButton>
      </div>

      <div style={{ padding: '10px 18px 0', flex: 'none' }}>
        <div style={{ position: 'relative' }}>
          <Icon
            name="magnifying-glass" size={15} color="var(--color-neutral-500)"
            style={{ position: 'absolute', left: 11, top: 11, pointerEvents: 'none' }}
          />
          <input
            className="input"
            type="search"
            value={doc.query}
            onChange={(e) => actions.docSearch(e.target.value)}
            placeholder="Rechercher dans la documentation"
            aria-label="Rechercher dans la documentation"
            style={{ paddingLeft: 33 }}
          />
        </div>
      </div>

      <div
        ref={scrollRef}
        className="mscroll"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 18px 28px' }}
      >
        {error && (
          <div className="empty-state">
            <Icon name="cloud-slash" size={28} color="var(--color-neutral-500)" />
            <p style={{ lineHeight: 1.55 }}>{error}</p>
          </div>
        )}

        {!pages && !error && (
          <div className="empty-state">
            <Icon name="circle-notch" size={24} color="var(--color-neutral-500)" />
            <p>Chargement de la documentation…</p>
          </div>
        )}

        {pages && searching && (
          <>
            <div className="section-label">
              {results.length} résultat{results.length > 1 ? 's' : ''}
            </div>
            {results.length === 0 && (
              <div className="empty-state">
                <p>Aucune page ne contient tous ces mots. Essaie un mot de moins.</p>
              </div>
            )}
            {results.map((p) => (
              <button
                key={p.rel} type="button" onClick={() => actions.docGo(p.rel, '')}
                className="row-card"
                style={{
                  display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
                  marginBottom: 7,
                }}
              >
                <span style={{
                  display: 'block', fontSize: 10, letterSpacing: '.08em',
                  textTransform: 'uppercase', color: 'var(--color-accent-200)',
                }}>
                  {tree.find((s) => s.key === p.section)?.label || 'Documentation'}
                </span>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 2 }}>
                  {p.titre}
                </span>
                <span style={{
                  display: 'block', fontSize: 11, color: 'var(--color-neutral-400)',
                  lineHeight: 1.5, marginTop: 2,
                }}>
                  {p.description}
                </span>
              </button>
            ))}
          </>
        )}

        {pages && !searching && !current && (
          <>
            <p style={{
              fontSize: 12, color: 'var(--color-neutral-400)', lineHeight: 1.55,
              margin: '0 0 14px',
            }}>
              Tout ce qui explique l'application, chapitre par chapitre — installation, chaque
              écran, chaque réglage, les données, le hors-ligne et le dépannage.
            </p>
            {tree.map((chapter) => (
              <ChapterRow
                key={chapter.key || 'accueil'}
                chapter={chapter}
                openKeys={doc.open}
                currentRel={doc.rel}
                onToggle={actions.docToggleChapter}
                onGo={(rel) => actions.docGo(rel, '')}
              />
            ))}
          </>
        )}

        {pages && !searching && current && (
          <>
            <div
              ref={bodyRef}
              className="doc-body"
              onClick={onBodyClick}
              /* eslint-disable-next-line react/no-danger */
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              {prev ? (
                <button
                  type="button" onClick={() => actions.docGo(prev.rel, '')} className="row-card"
                  style={{ flex: 1, textAlign: 'left', cursor: 'pointer' }}
                >
                  <span className="section-label">Précédent</span>
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>{prev.titre}</span>
                </button>
              ) : <span style={{ flex: 1 }} />}
              {next ? (
                <button
                  type="button" onClick={() => actions.docGo(next.rel, '')} className="row-card"
                  style={{ flex: 1, textAlign: 'right', cursor: 'pointer' }}
                >
                  <span className="section-label">Suivant</span>
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 600 }}>{next.titre}</span>
                </button>
              ) : <span style={{ flex: 1 }} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
