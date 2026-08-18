import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useApp } from '../state/context.js';
import { tipById } from '../data/tips.js';
import Icon from './ui/Icon.jsx';

/**
 * A contextual tooltip: `<Tip id="scoreJour" />` next to the label it explains.
 *
 * The bubble is positioned from the button's own rect rather than laid out in
 * flow, because every place a tip is useful is a tight row — a score header, a
 * table cell, a form label — where an in-flow bubble would either be clipped
 * by an `overflow` ancestor or shove the layout sideways when it opens.
 *
 * It closes on the next tap anywhere, on Escape and on any scroll: an anchored
 * bubble whose anchor has moved is worse than no bubble.
 */
export default function Tip({ id, size = 15, style }) {
  const { actions } = useApp();
  const tip = tipById(id);
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // Clamped to the app column, which is at most 480px wide and centred, so
    // the bubble never hangs off the phone or over the shell's background.
    const shell = el.closest('.app')?.getBoundingClientRect() || { left: 0, right: window.innerWidth };
    const width = Math.min(290, shell.right - shell.left - 24);
    const left = Math.max(shell.left + 12, Math.min(r.left + r.width / 2 - width / 2, shell.right - width - 12));
    // Below the anchor when there is room for it, above otherwise.
    const below = r.bottom + 190 < window.innerHeight;
    setPos({ left, width, top: below ? r.bottom + 8 : undefined, bottom: below ? undefined : window.innerHeight - r.top + 8 });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    // `capture` so a scroll inside any pane counts, not just the window's.
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!tip) return null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-label={`Aide : ${tip.titre}`}
        title={tip.titre}
        style={{
          width: size + 7, height: size + 7, flex: 'none', padding: 0, borderRadius: '50%',
          border: 'none', background: 'transparent', cursor: 'pointer', display: 'inline-grid',
          placeItems: 'center', color: open ? 'var(--color-accent-200)' : 'var(--color-neutral-500)',
          verticalAlign: 'middle', ...style,
        }}
      >
        <Icon name="info" size={size} weight={open ? 'fill' : 'regular'} />
      </button>

      {open && pos && (
        <>
          {/* Swallows the tap that dismisses, so it doesn't also press what is
              underneath — a tip often sits on top of a button. */}
          <div
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            style={{ position: 'fixed', inset: 0, zIndex: 75 }}
          />
          <div
            role="tooltip"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed', zIndex: 76, left: pos.left, top: pos.top, bottom: pos.bottom, width: pos.width,
              background: 'var(--color-surface)', border: '1px solid var(--color-accent-800)',
              borderRadius: 'var(--radius-md)', padding: '11px 12px', boxShadow: 'var(--shadow-lg)',
              animation: 'mFade .14s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <Icon name="info" weight="fill" size={14} color="var(--color-accent-200)" style={{ flex: 'none' }} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>{tip.titre}</span>
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--color-neutral-300)' }}>{tip.texte}</div>
            {tip.faq && (
              <button
                type="button"
                onClick={() => { setOpen(false); actions.openHelpCenter({ kind: 'faq', id: tip.faq }); }}
                style={{
                  marginTop: 9, background: 'none', border: 'none', padding: 0, font: 'inherit',
                  fontSize: 11, color: 'var(--color-accent-200)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                En savoir plus<Icon name="arrow-circle-right" size={13} />
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}
