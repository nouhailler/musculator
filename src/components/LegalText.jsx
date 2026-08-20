import { A_COMPLETER, EDITEUR, LEGAL_ALL, LEGAL_VERSION } from '../data/legal.js';
import { SUPPORT_EMAIL } from '../lib/diagnostics.js';
import Icon from './ui/Icon.jsx';

/**
 * The full legal notice, rendered once and shown in two places: the second page
 * of the first-launch modal and the « Mentions légales » overlay.
 *
 * It reads `data/legal.js` and adds nothing of its own — a paragraph written
 * here would exist in one of the two screens only, which is exactly the drift
 * this component exists to prevent. The support address is the app's own
 * (`lib/diagnostics.js`) rather than a second copy in the data file.
 */

/**
 * A list of `{ id, titre, paragraphes, avert }` — the shape both `legal.js` and
 * `privacy.js` use. Shared so the two documents cannot drift apart visually,
 * and so a section marked `avert` is highlighted the same way in both.
 */
export function Sections({ sections, compact = false }) {
  const titreTaille = compact ? 12.5 : 13.5;
  const texteTaille = compact ? 12 : 12.5;
  return sections.map((s) => (
    <section key={s.id} style={{ marginBottom: 18 }}>
      <h5 style={{
        margin: '0 0 7px', fontSize: titreTaille, display: 'flex', alignItems: 'center', gap: 7,
        color: s.avert ? 'var(--color-warn)' : 'var(--color-text)',
      }}>
        {s.avert && <Icon name="warning-circle" weight="fill" size={15} color="var(--color-warn)" style={{ flex: 'none' }} />}
        {s.titre}
      </h5>
      {s.paragraphes.map((p) => (
        <p key={p.slice(0, 32)} style={{
          margin: '0 0 8px', fontSize: texteTaille, lineHeight: 1.65,
          color: 'var(--color-neutral-300)',
        }}>
          {p}
        </p>
      ))}
    </section>
  ));
}

/** A field nobody has filled in yet, marked as such rather than left to pass for a value. */
function Champ({ label, value }) {
  const vide = value === A_COMPLETER;
  return (
    <div style={{ display: 'flex', gap: 10, padding: '5px 0', fontSize: 12, lineHeight: 1.5 }}>
      <span style={{ width: 108, flex: 'none', color: 'var(--color-neutral-500)' }}>{label}</span>
      <span style={{
        flex: 1, minWidth: 0, wordBreak: 'break-word',
        color: vide ? 'var(--color-warn)' : 'var(--color-neutral-200)',
        fontStyle: vide ? 'italic' : 'normal',
      }}>
        {value}
      </span>
    </div>
  );
}

export default function LegalText({ compact = false }) {
  return (
    <>
      <Sections sections={LEGAL_ALL} compact={compact} />

      <section style={{ marginBottom: 14 }}>
        <h5 style={{ margin: '0 0 7px', fontSize: compact ? 12.5 : 13.5 }}>Éditeur & contact</h5>
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-divider)',
          borderRadius: 'var(--radius-md)', padding: '8px 12px',
        }}>
          <Champ label="Éditeur" value={EDITEUR.nom} />
          <Champ label="Adresse" value={EDITEUR.adresse} />
          <Champ label="Contact" value={SUPPORT_EMAIL} />
          <Champ label="Hébergeur" value={EDITEUR.hebergeur} />
          <Champ label="Mise à jour" value={EDITEUR.miseAJour} />
          <Champ label="Version" value={LEGAL_VERSION} />
        </div>
      </section>
    </>
  );
}
