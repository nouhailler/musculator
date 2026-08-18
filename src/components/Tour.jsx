import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../state/context.js';
import { tourById } from '../data/tours.js';
import Icon from './ui/Icon.jsx';

// How long to keep looking for a step's anchor. The reducer has already put
// the app on the right screen, but that screen may still be mounting — the
// exercise library and the nutrition day both render a fair amount — so the
// element is polled for a moment rather than measured once and given up on.
const FIND_TRIES = 12;
const FIND_EVERY = 60;

function useAnchor(cible, stepKey) {
  const [box, setBox] = useState(null);

  const measure = useCallback(() => {
    if (!cible) { setBox(null); return true; }
    const el = document.querySelector(`[data-tour="${cible}"]`);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    // An element scrolled out of view is found but not visible; scrolling to it
    // is what makes the spotlight mean anything.
    if (r.height === 0 && r.width === 0) return false;
    setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
    return true;
  }, [cible]);

  useEffect(() => {
    setBox(null);
    let tries = 0;
    let timer = null;
    let settled = false;

    const scrollTo = () => {
      const el = cible && document.querySelector(`[data-tour="${cible}"]`);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      // Measured after the smooth scroll has had time to land — measuring
      // mid-scroll pins the ring where the element no longer is.
      timer = setTimeout(measure, 380);
    };

    const tick = () => {
      const found = measure();
      if (found && cible && !settled) { settled = true; scrollTo(); return; }
      if (found || tries++ > FIND_TRIES) return;
      timer = setTimeout(tick, FIND_EVERY);
    };
    tick();

    const onMove = () => measure();
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [cible, stepKey, measure]);

  return box;
}

/**
 * The interactive tutorial: a spotlight on the real interface plus a card that
 * explains what it is pointing at.
 *
 * Navigation belongs to the reducer (`applyTourStep`), not here — a step *is*
 * a place in the app, so the screen and the step index change in one dispatch
 * and can never drift apart. This component only measures the anchor and draws.
 *
 * A step whose anchor is missing degrades to a centred card: the explanation
 * still reads, which matters more than the ring. `npm run check-catalogue`
 * verifies every `cible` exists in the source, so that path is a safety net
 * rather than a way of writing steps.
 */
export default function Tour() {
  const { state, actions } = useApp();
  const tour = state.tour ? tourById(state.tour.id) : null;
  const i = state.tour?.step ?? 0;
  const step = tour?.steps[i] || null;
  const box = useAnchor(step?.cible, `${state.tour?.id}:${i}`);

  const { endTour, tourNext, tourPrev } = actions;
  useEffect(() => {
    if (!tour) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') endTour();
      if (e.key === 'ArrowRight') tourNext();
      if (e.key === 'ArrowLeft') tourPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tour, endTour, tourNext, tourPrev]);

  // A tour never runs over a workout: that screen owns the display, and a
  // tapped-through overlay there costs a set.
  if (!tour || !step || state.view === 'workout' || state.view === 'complete') return null;

  const last = i === tour.steps.length - 1;
  // Card below the highlight when there is room, above otherwise, centred when
  // the step points at nothing.
  const roomBelow = box ? window.innerHeight - (box.top + box.height) : 0;
  const place = !box ? 'center' : roomBelow > 240 ? 'below' : 'above';

  const cardStyle = {
    position: 'fixed', zIndex: 82, left: '50%', transform: 'translateX(-50%)',
    width: 'min(440px, calc(100% - 28px))',
    background: 'var(--color-surface)', border: '1px solid var(--color-accent-800)',
    borderRadius: 'var(--radius-lg)', padding: '15px 16px 14px', boxShadow: 'var(--shadow-lg)',
    animation: 'mFade .18s ease',
    ...(place === 'below' ? { top: Math.min(box.top + box.height + 14, window.innerHeight - 210) }
      : place === 'above' ? { bottom: Math.max(window.innerHeight - box.top + 14, 24) }
        : { top: '50%', marginTop: -90 }),
  };

  return (
    <>
      {/* One layer, two jobs: it dims everything and it swallows taps, so a
          step can point at a button without the user pressing it by accident. */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'fixed', inset: 0, zIndex: 80, background: box ? 'transparent' : 'color-mix(in srgb, var(--color-bg) 84%, transparent)' }}
      />
      {box && (
        <div
          style={{
            position: 'fixed', zIndex: 81, pointerEvents: 'none',
            top: box.top - 6, left: box.left - 6, width: box.width + 12, height: box.height + 12,
            border: '2px solid var(--color-accent)', borderRadius: 'var(--radius-md)',
            // The cut-out: one enormous shadow dims the rest of the screen and
            // leaves the anchor lit, with no mask element to keep in sync.
            boxShadow: '0 0 0 9999px color-mix(in srgb, var(--color-bg) 84%, transparent), 0 0 22px -2px var(--color-accent)',
            transition: 'top .2s ease, left .2s ease, width .2s ease, height .2s ease',
          }}
        />
      )}

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-200)' }}>
            {tour.titre} · {i + 1}/{tour.steps.length}
          </span>
          <button
            type="button" onClick={actions.endTour} aria-label="Quitter le tutoriel"
            style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--color-neutral-400)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-heading)', marginBottom: 5 }}>{step.titre}</div>
        <div style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--color-neutral-300)' }}>{step.texte}</div>

        {/* Progress as dots: a step count in words is already in the header,
            and the dots say how much is left at a glance. */}
        <div style={{ display: 'flex', gap: 4, margin: '13px 0 11px' }}>
          {tour.steps.map((s, n) => (
            <span key={s.titre} style={{ flex: 1, height: 3, borderRadius: 2, background: n <= i ? 'var(--color-accent)' : 'var(--color-neutral-800)' }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {i > 0 && (
            <button type="button" onClick={actions.tourPrev} className="btn btn-secondary" style={{ padding: '10px 14px' }}>
              <Icon name="arrow-left" size={15} />Retour
            </button>
          )}
          <button
            type="button" onClick={last ? actions.endTour : actions.tourNext}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 14px', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14,
              color: 'var(--color-accent-100)', background: 'var(--color-accent-800)',
              border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
            }}
          >
            {last ? <><Icon name="check" size={16} weight="bold" />Terminer</> : <>Suivant<Icon name="caret-right" size={16} /></>}
          </button>
        </div>
      </div>
    </>
  );
}
