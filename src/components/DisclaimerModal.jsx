import { useApp } from '../state/store.jsx';
import Icon from './ui/Icon.jsx';
import { PrimaryButton } from './ui/Button.jsx';

export default function DisclaimerModal() {
  const { state, actions } = useApp();
  if (state.disclaimerAcked) return null;
  return (
    <div className="disclaimer-backdrop">
      <div className="disclaimer-card">
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'color-mix(in srgb, var(--color-warn) 16%, transparent)', display: 'grid', placeItems: 'center', marginBottom: 14 }}>
          <Icon name="heartbeat" weight="fill" size={26} color="var(--color-warn)" />
        </div>
        <h4 style={{ margin: '0 0 8px' }}>Avertissement médical</h4>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-neutral-200)', marginBottom: 8 }}>
          Avant de commencer un programme de renforcement musculaire, il est recommandé de{' '}
          <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>consulter un professionnel de santé</strong>, surtout en cas de problèmes de santé, blessures ou douleurs.
        </p>
        <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--color-neutral-400)', marginBottom: 18 }}>
          Échauffe-toi, exécute les mouvements correctement, hydrate-toi, repose-toi suffisamment et progresse graduellement. Arrête en cas de douleur.
        </p>
        <PrimaryButton onClick={actions.acceptDisclaimer}>J'ai compris</PrimaryButton>
      </div>
    </div>
  );
}
