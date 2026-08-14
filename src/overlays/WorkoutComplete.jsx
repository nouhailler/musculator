import { useApp, useDerived } from '../state/context.js';
import Icon from '../components/ui/Icon.jsx';
import { PrimaryButton } from '../components/ui/Button.jsx';

export default function WorkoutComplete() {
  const { state, actions } = useApp();
  const { streak } = useDerived();
  const c = state.completeSummary;
  if (!c) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 59, background: 'radial-gradient(120% 90% at 50% 0%,var(--color-accent-900),var(--color-bg) 60%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--color-accent-800)', border: '1px solid var(--color-accent)', display: 'grid', placeItems: 'center', marginBottom: 20, animation: 'mPulse 2s ease-in-out infinite', boxShadow: '0 0 40px -6px var(--color-accent)' }}>
        <Icon name="trophy" weight="fill" size={48} color="var(--color-accent-100)" />
      </div>
      <h2 style={{ margin: '0 0 4px', textAlign: 'center' }}>{c.soloNom ? 'Exercice terminé !' : 'Séance terminée !'}</h2>
      <div style={{ fontSize: 13, color: 'var(--color-neutral-300)', textAlign: 'center', marginBottom: 24 }}>
        {c.soloNom ? `${c.soloNom} — enregistré dans ton journal` : 'Bravo — tu construis du muscle 💪'}
      </div>
      <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 320, marginBottom: 14 }}>
        <div className="stat-box" style={{ padding: '13px 4px' }}><div className="stat-value" style={{ fontSize: 20 }}>{c.time}</div><div className="stat-label">durée</div></div>
        <div className="stat-box" style={{ padding: '13px 4px' }}>
          <div className="stat-value" style={{ fontSize: 20 }}>{c.soloNom ? c.sets : c.exos}</div>
          <div className="stat-label">{c.soloNom ? (c.sets > 1 ? 'séries' : 'série') : 'exercices'}</div>
        </div>
        <div className="stat-box" style={{ padding: '13px 4px' }}><div className="stat-value" style={{ fontSize: 20 }}>{c.kcal}</div><div className="stat-label">kcal</div></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'color-mix(in srgb,#f0a35e 12%,transparent)', border: '1px solid color-mix(in srgb,#f0a35e 32%,transparent)', borderRadius: 999, padding: '8px 14px', marginBottom: 30, fontSize: 12 }}>
        <Icon name="fire" weight="fill" size={16} color="#f0a35e" />Série de {streak} jours — continue !
      </div>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <PrimaryButton onClick={actions.finishHome}>Terminer</PrimaryButton>
      </div>
    </div>
  );
}
