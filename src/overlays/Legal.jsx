import { useApp } from '../state/context.js';
import LegalText from '../components/LegalText.jsx';
import { SecondaryButton } from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';

/**
 * « Mentions légales », reachable at any time from the menu and from the
 * profile. Same text as the first-launch notice, through `LegalText` — this
 * screen adds only the way back to the notice itself, for someone who wants to
 * reread what they accepted.
 */
export default function Legal() {
  const { state, actions } = useApp();

  return (
    <div className="overlay mscroll">
      <div className="overlay-header">
        <SecondaryButton icon="arrow-left" onClick={actions.closeOverlay} style={{ gap: 6 }}>Retour</SecondaryButton>
      </div>

      <div className="overlay-body">
        <h3 style={{ margin: '0 0 4px' }}>Mentions légales</h3>
        <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 18px', lineHeight: 1.55 }}>
          Conditions d'utilisation et limitation de responsabilité de l'application.
          {state.legalVersion && ` Acceptées en version ${state.legalVersion}.`}
        </p>

        <LegalText />

        <div style={{ height: 1, background: 'var(--color-divider)', margin: '4px 0 16px' }} />

        <SecondaryButton icon="shield-check" onClick={() => actions.openView('confidentialite')}
          style={{ width: '100%', padding: 11, justifyContent: 'center', marginBottom: 8 }}>
          Politique de confidentialité
        </SecondaryButton>
        <SecondaryButton icon="warning-circle" onClick={actions.showDisclaimer}
          style={{ width: '100%', padding: 11, justifyContent: 'center', marginBottom: 10 }}>
          Revoir l'avertissement médical
        </SecondaryButton>
        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 11, color: 'var(--color-neutral-500)', lineHeight: 1.5 }}>
          <Icon name="shield-check" size={14} color="var(--color-accent-200)" style={{ flex: 'none', marginTop: 1 }} />
          <span>
            L'acceptation de cet avertissement est enregistrée sur cet appareil uniquement, avec le reste
            de tes données. Aucun compte, aucun serveur.
          </span>
        </div>
      </div>
    </div>
  );
}
