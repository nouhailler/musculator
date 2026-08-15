import { useApp } from '../state/context.js';
import Icon from './ui/Icon.jsx';

/**
 * Shown when a new build has installed and is waiting. One tap applies it,
 * because the alternative — reopening the app and hoping — is exactly the
 * problem this exists to solve.
 *
 * Hidden during a workout: applying reloads the page, and a running session
 * lives in memory only.
 */
export default function UpdateBanner() {
  const { state, actions } = useApp();
  if (!state.updateReady || state.workout || state.view === 'workout') return null;

  return (
    <div style={{
      position: 'absolute', left: 10, right: 10, zIndex: 70,
      bottom: `calc(70px + env(safe-area-inset-bottom))`,
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--color-accent-800)', border: '1px solid var(--color-accent)',
      borderRadius: 'var(--radius-lg)', padding: '10px 12px',
      boxShadow: 'var(--shadow-md)', animation: 'mFade .3s ease',
    }}>
      <Icon name="arrow-circle-right" weight="fill" size={20} color="var(--color-accent-100)" />
      <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: 'var(--color-accent-100)', lineHeight: 1.4 }}>
        Nouvelle version disponible
      </div>
      <button type="button" onClick={actions.applyUpdate}
        style={{ flex: 'none', font: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          padding: '6px 12px', borderRadius: 999, color: 'var(--color-accent-100)',
          background: 'transparent', border: '1px solid var(--color-accent-100)' }}>
        Mettre à jour
      </button>
    </div>
  );
}
