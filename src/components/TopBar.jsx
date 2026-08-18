import { useApp } from '../state/context.js';
import { helpFor } from '../data/help.js';
import Icon from './ui/Icon.jsx';

/**
 * Slim global bar: menu on the left, contextual help on the right.
 *
 * It carries no title — every screen already renders its own heading, and
 * duplicating it here would just push the real content further down. `.screen`
 * gains matching top padding in app.css so nothing hides underneath.
 *
 * Hidden while a full-screen workout is running: that view owns the whole
 * screen, has its own controls, and a menu there would invite quitting a set
 * by accident.
 */
export default function TopBar() {
  const { state, actions } = useApp();
  if (state.view === 'workout' || state.view === 'complete') return null;

  // Help follows what is actually on screen: the overlay when one is open,
  // the tab underneath otherwise.
  const helpKey = state.view || state.tab;
  const hasHelp = !!helpFor(helpKey);

  return (
    <div
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'calc(6px + env(safe-area-inset-top)) 10px 6px',
        background: 'color-mix(in srgb, var(--color-bg) 88%, transparent)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--color-divider)',
      }}
    >
      <button
        type="button" onClick={actions.openMenu} title="Menu" aria-label="Ouvrir le menu"
        data-tour="topbar-menu" style={btn}
      >
        <Icon name="list" size={21} />
      </button>

      <span style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>
        Musculator
      </span>

      <button
        type="button" onClick={actions.openHelp} title="Aide" aria-label="Aide sur cet écran"
        disabled={!hasHelp} data-tour="topbar-help"
        style={{ ...btn, opacity: hasHelp ? 1 : 0.35, cursor: hasHelp ? 'pointer' : 'default' }}
      >
        <Icon name="question" size={20} />
      </button>
    </div>
  );
}

const btn = {
  width: 34, height: 34, borderRadius: '50%', border: 'none', background: 'transparent',
  color: 'var(--color-neutral-200)', cursor: 'pointer', display: 'grid', placeItems: 'center',
};
