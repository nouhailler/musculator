import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../state/context.js';
import { AVERTISSEMENT_COURT, LEGAL_TITRE, needsLegalAck } from '../data/legal.js';
import Icon from './ui/Icon.jsx';
import LegalText from './LegalText.jsx';
import { PrimaryButton, SecondaryButton } from './ui/Button.jsx';

/**
 * The first-launch notice: the medical warning this app has always shown, plus
 * the general legal warning, and a way into the full mentions before accepting.
 *
 * **The details are a second page of this modal, not an overlay.** `.overlay`
 * sits at z-index 56 and this backdrop at 70 (app.css), so an overlay opened
 * from here would render *behind* the modal. Two pages in one component also
 * means the notice cannot be escaped by a stray tap on something underneath.
 *
 * `needsLegalAck(state)` is called without `strict`, so a bumped
 * `LEGAL_VERSION` records itself at the next acceptance without putting this
 * back in front of everyone — see the note in `data/legal.js`.
 */
export default function DisclaimerModal() {
  const { state, actions } = useApp();
  const [details, setDetails] = useState(false);
  const cardRef = useRef(null);
  // Set while a history entry of ours is on the stack, so an in-app "Retour"
  // can pop it instead of leaving it behind for the next real back gesture.
  const pushed = useRef(false);

  const show = needsLegalAck(state);

  const closeDetails = useCallback(() => {
    setDetails(false);
    if (pushed.current) { pushed.current = false; history.back(); }
  }, []);

  // Android's back button closes the details before it leaves the app. Nothing
  // else in this app touches the history — the scope stays this one page.
  useEffect(() => {
    if (!details) return undefined;
    history.pushState({ musculatorLegal: true }, '');
    pushed.current = true;
    const onPop = () => { pushed.current = false; setDetails(false); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [details]);

  // Escape closes the details; a focus trap keeps tabbing inside the dialog,
  // which is the whole screen as long as it is up.
  useEffect(() => {
    if (!show) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && details) { e.preventDefault(); closeDetails(); return; }
      if (e.key !== 'Tab') return;
      const items = cardRef.current?.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, details, closeDetails]);

  // Focus lands inside the dialog rather than on whatever was behind it.
  useEffect(() => {
    if (!show) return;
    cardRef.current?.querySelector('button')?.focus();
  }, [show, details]);

  if (!show) return null;

  return (
    <div className="disclaimer-backdrop" role="dialog" aria-modal="true" aria-labelledby="legal-titre">
      <div ref={cardRef} className="disclaimer-card">
        {details ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flex: 'none' }}>
              <SecondaryButton icon="arrow-left" onClick={closeDetails} style={{ gap: 6 }}>Retour</SecondaryButton>
              <h4 id="legal-titre" style={{ margin: 0, fontSize: 15 }}>Mentions légales</h4>
            </div>
            <div className="disclaimer-body mscroll" style={{ paddingRight: 2 }}>
              <LegalText compact />
            </div>
            <div className="disclaimer-foot">
              <PrimaryButton onClick={actions.acceptDisclaimer}>J'ai compris</PrimaryButton>
            </div>
          </>
        ) : (
          <>
            <div className="disclaimer-body mscroll">
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'color-mix(in srgb, var(--color-warn) 16%, transparent)', display: 'grid', placeItems: 'center', marginBottom: 14 }}>
                <Icon name="heartbeat" weight="fill" size={26} color="var(--color-warn)" />
              </div>
              <h4 style={{ margin: '0 0 8px' }}>Avertissement médical</h4>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-neutral-200)', marginBottom: 8 }}>
                Avant de commencer un programme de renforcement musculaire, il est recommandé de{' '}
                <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>consulter un professionnel de santé</strong>, surtout en cas de problèmes de santé, blessures ou douleurs.
              </p>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--color-neutral-400)', marginBottom: 16 }}>
                Échauffe-toi, exécute les mouvements correctement, hydrate-toi, repose-toi suffisamment et progresse graduellement. Arrête en cas de douleur.
              </p>

              <div style={{ height: 1, background: 'var(--color-divider)', margin: '0 0 14px' }} />

              <h4 id="legal-titre" style={{ margin: '0 0 8px' }}>{LEGAL_TITRE}</h4>
              {AVERTISSEMENT_COURT.map((p) => (
                <p key={p.slice(0, 32)} style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--color-neutral-400)', marginBottom: 8 }}>{p}</p>
              ))}
            </div>
            <div className="disclaimer-foot">
              <SecondaryButton
                icon="scales" onClick={() => setDetails(true)}
                style={{ width: '100%', padding: 11, justifyContent: 'center', marginBottom: 8 }}
              >
                Voir les détails
              </SecondaryButton>
              <PrimaryButton onClick={actions.acceptDisclaimer}>J'ai compris</PrimaryButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
