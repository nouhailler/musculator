import { useApp } from '../state/context.js';
import { PRIVACY_DATE, PRIVACY_INTRO, PRIVACY_SECTIONS, PRIVACY_VERSION } from '../data/privacy.js';
import { Sections } from '../components/LegalText.jsx';
import { SecondaryButton } from '../components/ui/Button.jsx';
import { SUPPORT_EMAIL } from '../lib/diagnostics.js';
import Icon from '../components/ui/Icon.jsx';

/**
 * The privacy policy — a document of its own, not a paragraph of the mentions
 * légales. The two answer different questions (what the app promises, versus
 * what happens to the data) and conflating them serves neither.
 *
 * It renders `data/privacy.js` through the same `Sections` component as the
 * legal notice, so the two read as one pair rather than two designs.
 */
export default function Privacy() {
  const { actions } = useApp();

  return (
    <div className="overlay mscroll">
      <div className="overlay-header">
        <SecondaryButton icon="arrow-left" onClick={actions.closeOverlay} style={{ gap: 6 }}>Retour</SecondaryButton>
      </div>

      <div className="overlay-body">
        <h3 style={{ margin: '0 0 4px' }}>Politique de confidentialité</h3>
        <p style={{ fontSize: 11, color: 'var(--color-neutral-500)', margin: '0 0 12px' }}>
          Version {PRIVACY_VERSION} · mise à jour le {PRIVACY_DATE}
        </p>
        <p style={{ fontSize: 12.5, color: 'var(--color-neutral-300)', margin: '0 0 18px', lineHeight: 1.65 }}>
          {PRIVACY_INTRO}
        </p>

        <Sections sections={PRIVACY_SECTIONS} />

        <div style={{ height: 1, background: 'var(--color-divider)', margin: '4px 0 16px' }} />

        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 11.5, color: 'var(--color-neutral-400)', lineHeight: 1.55, marginBottom: 14 }}>
          <Icon name="shield-check" size={15} color="var(--color-accent-200)" style={{ flex: 'none', marginTop: 1 }} />
          <span>
            Une question sur vos données ? Écrivez à <strong style={{ color: 'var(--color-neutral-200)' }}>{SUPPORT_EMAIL}</strong>.
          </span>
        </div>

        <SecondaryButton icon="scales" onClick={() => actions.openView('mentions')}
          style={{ width: '100%', padding: 11, justifyContent: 'center' }}>
          Voir les mentions légales
        </SecondaryButton>
      </div>
    </div>
  );
}
