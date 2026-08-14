import { useEffect } from 'react';
import { useApp } from '../state/context.js';
import { helpFor } from '../data/help.js';
import Icon from './ui/Icon.jsx';
import { SecondaryButton } from './ui/Button.jsx';

/**
 * Contextual help, shown as a bottom sheet over whatever is on screen.
 *
 * The key is resolved at open time from the current overlay or tab, so the
 * sheet always describes what the user is actually looking at rather than a
 * generic tour of the app.
 */
export default function HelpSheet() {
  const { state, actions } = useApp();
  const { helpOpen } = state;
  const { closeHelp } = actions;

  useEffect(() => {
    if (!helpOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') closeHelp(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [helpOpen, closeHelp]);

  if (!helpOpen) return null;

  const help = helpFor(state.view || state.tab);
  if (!help) return null;

  return (
    <div className="sheet-backdrop" style={{ zIndex: 72 }} onClick={actions.closeHelp}>
      <div className="sheet mscroll" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80%', animation: 'mRise .22s ease' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, flex: 'none', borderRadius: 8, background: 'var(--color-accent-900)', display: 'grid', placeItems: 'center', color: 'var(--color-accent-200)' }}>
            <Icon name="question" size={17} weight="fill" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{help.titre}</div>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-300)', lineHeight: 1.55, marginTop: 3 }}>{help.intro}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 11, margin: '14px 0 16px' }}>
          {help.points.map(([titre, texte]) => (
            <div key={titre} style={{ display: 'flex', gap: 10 }}>
              <Icon name="caret-right" size={14} color="var(--color-accent-300)" style={{ flex: 'none', marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{titre}</div>
                <div style={{ fontSize: 12, color: 'var(--color-neutral-300)', lineHeight: 1.55 }}>{texte}</div>
              </div>
            </div>
          ))}
        </div>

        <SecondaryButton icon="check" onClick={actions.closeHelp} style={{ width: '100%', padding: 12, justifyContent: 'center' }}>
          Compris
        </SecondaryButton>
      </div>
    </div>
  );
}
