import { useEffect } from 'react';
import { useApp } from '../state/context.js';
import Icon from './ui/Icon.jsx';

// Navigation duplicates the tab bar on purpose: the labels are fuller here
// ("Bibliothèque" rather than "Exos"), and it gives the drawer an anchor.
const NAV = [
  { key: 'home', label: 'Accueil', icon: 'house' },
  { key: 'programs', label: 'Programmes', icon: 'list-checks' },
  { key: 'library', label: 'Bibliothèque d\'exercices', icon: 'books' },
  { key: 'nutrition', label: 'Nutrition', icon: 'fork-knife' },
  { key: 'journal', label: 'Journal & analyse', icon: 'notebook' },
  { key: 'progress', label: 'Progrès & badges', icon: 'chart-line-up' },
];

// The screens that were previously reachable only from one specific button
// somewhere — this is the drawer's real job.
const ACTIONS = [
  { key: 'profile', label: 'Profil, objectifs & réglages', icon: 'gear-six', hint: 'OpenRouter, import Nutritor' },
  { key: 'bodymap', label: 'Cartographie musculaire', icon: 'person', hint: 'Sollicitation et récupération' },
  { key: 'builder', label: 'Créer une séance', icon: 'plus-circle', hint: 'Composer ton propre programme' },
  { key: 'help', label: 'Aide, FAQ & support', icon: 'question', hint: 'Tutoriels, questions fréquentes, contact' },
  { key: 'documentation', label: 'Documentation', icon: 'books', hint: "Tout l'app expliquée, chapitre par chapitre" },
];

function Row({ icon, label, hint, active, onClick }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
        padding: '11px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
        background: active ? 'var(--color-accent-900)' : 'transparent',
        border: `1px solid ${active ? 'var(--color-accent-800)' : 'transparent'}`,
        color: 'var(--color-text)',
      }}
    >
      <Icon name={icon} size={19} weight={active ? 'fill' : 'regular'}
        color={active ? 'var(--color-accent-200)' : 'var(--color-neutral-400)'} style={{ flex: 'none' }} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: active ? 600 : 500 }}>{label}</span>
        {hint && <span style={{ display: 'block', fontSize: 10, color: 'var(--color-neutral-500)' }}>{hint}</span>}
      </span>
    </button>
  );
}

/** Slide-in navigation drawer. */
export default function Drawer() {
  const { state, actions } = useApp();
  const { menuOpen } = state;
  const { closeMenu } = actions;

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') closeMenu(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, closeMenu]);

  if (!menuOpen) return null;

  return (
    <div
      onClick={actions.closeMenu}
      style={{
        position: 'absolute', inset: 0, zIndex: 70, display: 'flex',
        background: 'color-mix(in srgb, var(--color-bg) 72%, transparent)',
        backdropFilter: 'blur(3px)', animation: 'mFade .18s ease',
      }}
    >
      {/* Stop propagation so a tap inside the panel doesn't close it. */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="mscroll"
        style={{
          width: 'min(86%, 320px)', background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-divider)',
          padding: 'calc(16px + env(safe-area-inset-top)) 14px calc(20px + env(safe-area-inset-bottom))',
          display: 'flex', flexDirection: 'column', gap: 4,
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingLeft: 4 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, fontFamily: 'var(--font-heading)' }}>Musculator</div>
            <div style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
              {state.profile.prenom ? `Salut ${state.profile.prenom}` : 'Renforcement & nutrition'}
            </div>
          </div>
          <button type="button" onClick={actions.closeMenu} aria-label="Fermer le menu"
            style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--color-neutral-300)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="section-label" style={{ paddingLeft: 4 }}>Navigation</div>
        {NAV.map((n) => (
          <Row key={n.key} icon={n.icon} label={n.label}
            active={!state.view && state.tab === n.key}
            onClick={() => { actions.goTab(n.key); actions.closeMenu(); }} />
        ))}

        <div className="section-label" style={{ paddingLeft: 4, marginTop: 12 }}>Outils</div>
        {ACTIONS.map((a) => (
          <Row key={a.key} icon={a.icon} label={a.label} hint={a.hint}
            active={state.view === a.key}
            onClick={() => { actions.openView(a.key); actions.closeMenu(); }} />
        ))}

        <div className="section-label" style={{ paddingLeft: 4, marginTop: 12 }}>Réglages</div>
        <Row
          icon={state.voiceOn ? 'speaker-high' : 'speaker-simple-x'}
          label={state.voiceOn ? 'Coach vocal activé' : 'Coach vocal coupé'}
          hint="Annonce les répétitions pendant la séance"
          onClick={actions.toggleVoice}
        />
        <Row
          icon="warning-circle" label="Avertissement médical"
          hint="Relire les précautions"
          onClick={() => { actions.showDisclaimer(); actions.closeMenu(); }}
        />
        <Row
          icon="scales" label="Mentions légales"
          hint="Conditions d'utilisation et responsabilité"
          active={state.view === 'mentions'}
          onClick={() => { actions.openView('mentions'); actions.closeMenu(); }}
        />
        <Row
          icon="shield-check" label="Confidentialité"
          hint="Ce qui est enregistré, ce qui sort de l'appareil"
          active={state.view === 'confidentialite'}
          onClick={() => { actions.openView('confidentialite'); actions.closeMenu(); }}
        />

        <div style={{ flex: 1, minHeight: 12 }} />
        <div style={{ fontSize: 10, color: 'var(--color-neutral-600)', paddingLeft: 4, lineHeight: 1.5 }}>
          Toutes tes données restent sur cet appareil.
        </div>
      </div>
    </div>
  );
}
