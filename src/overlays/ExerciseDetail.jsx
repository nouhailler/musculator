import { useState } from 'react';
import { useApp } from '../state/context.js';
import { exById } from '../data/exercises.js';
import { demoFor } from '../data/demos.js';
import ExerciseDemo from '../components/ExerciseDemo.jsx';
import Icon from '../components/ui/Icon.jsx';
import Tag from '../components/ui/Tag.jsx';
import { SecondaryButton } from '../components/ui/Button.jsx';

function InfoRow({ icon, title, body }) {
  return (
    <div style={{ display: 'flex', gap: 11 }}>
      <div style={{ width: 30, height: 30, flex: 'none', borderRadius: 8, background: 'var(--color-accent-900)', display: 'grid', placeItems: 'center', color: 'var(--color-accent-200)' }}>
        <Icon name={icon} size={16} />
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--color-neutral-300)', lineHeight: 1.5 }}>{body}</div>
      </div>
    </div>
  );
}

export default function ExerciseDetail({ exId, onBack }) {
  const { state, actions } = useApp();
  const ex = exById(exId || state.selExId);
  const back = onBack || actions.closeOverlay;
  const [demoPaused, setDemoPaused] = useState(false);
  const hasDemo = !!demoFor(ex.id);

  return (
    <div className="overlay mscroll">
      <div className="overlay-header">
        <SecondaryButton icon="arrow-left" onClick={back} style={{ gap: 6 }}>Retour</SecondaryButton>
      </div>
      <div style={{ position: 'relative', margin: '12px 16px 0', height: 200, borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'radial-gradient(120% 120% at 30% 20%,var(--color-accent-800),var(--color-neutral-900))', display: 'grid', placeItems: 'center' }}>
        {hasDemo ? (
          <div style={{ position: 'absolute', inset: 12 }}>
            <ExerciseDemo exId={ex.id} label={ex.nom} paused={demoPaused} />
          </div>
        ) : (
          <>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute' }}>
              <circle cx="60" cy="60" r="54" fill="none" stroke="color-mix(in srgb,var(--color-accent) 40%,transparent)" strokeWidth="2" strokeDasharray="339" style={{ animation: 'mRing 2.2s ease-out infinite' }} transform="rotate(-90 60 60)" />
            </svg>
            <Icon name={ex.icon} weight="fill" size={64} color="var(--color-accent-100)" style={{ animation: 'mPulse 2.4s ease-in-out infinite' }} />
          </>
        )}
        {/* Only exercises with a demo in src/data/demos.js get the badge — the
            rest fall back to the icon, and claiming an animation there would lie. */}
        {hasDemo && (
          <button type="button" onClick={() => setDemoPaused((p) => !p)}
            style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', border: 'none', color: 'var(--color-text)', padding: '5px 10px', borderRadius: 999, fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
            <Icon name={demoPaused ? 'play' : 'pause'} weight="fill" size={12} />
            {demoPaused ? 'Démo en pause' : 'Démo animée'}
          </button>
        )}
      </div>
      <div style={{ padding: '16px 18px 0' }}>
        <h3 style={{ margin: '0 0 4px' }}>{ex.nom}</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <Tag variant="accent" icon="target">{ex.primaire}</Tag>
          <Tag variant="neutral">{ex.niveau}</Tag>
          <Tag variant="outline" icon="barbell">{ex.mat.join(' · ')}</Tag>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div className="stat-box"><div className="stat-value">{ex.series}</div><div className="stat-label">séries</div></div>
          <div className="stat-box"><div className="stat-value">{ex.reps}</div><div className="stat-label">répétitions</div></div>
          <div className="stat-box"><div className="stat-value">{ex.repos} s</div><div className="stat-label">repos</div></div>
        </div>

        <h6 style={{ color: 'var(--color-neutral-400)', marginBottom: 6 }}>Description technique</h6>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-neutral-200)', marginBottom: 16 }}>{ex.desc}</p>

        <h6 style={{ color: 'var(--color-neutral-400)', marginBottom: 8 }}>Muscle ciblé</h6>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: 13, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
            <Icon name="target" weight="fill" size={16} color="var(--color-accent-200)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent-100)' }}>{ex.primaire}</span>
          </div>
          <p style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--color-neutral-200)', margin: '0 0 9px' }}>{ex.sollicitation}</p>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', marginBottom: 11 }}>
            Aussi sollicités : <span style={{ color: 'var(--color-neutral-200)' }}>{ex.secondaires.join(' · ')}</span>
          </div>
          <div style={{ display: 'flex', gap: 9, padding: '9px 10px', borderRadius: 'var(--radius-md)', background: 'var(--color-neutral-900)', border: '1px solid color-mix(in srgb,#f0a35e 30%,transparent)' }}>
            <Icon name="warning-circle" weight="fill" size={15} color="#f0a35e" style={{ flex: 'none', marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#f0a35e', marginBottom: 3 }}>Éviter la surcharge</div>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--color-neutral-200)' }}>{ex.surcharge}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
          <InfoRow icon="flag" title="Position de départ" body={ex.depart} />
          <InfoRow icon="arrows-down-up" title="Mouvement" body={ex.mouvement} />
          <InfoRow icon="wind" title="Respiration" body={ex.respiration} />
        </div>

        <h6 style={{ color: 'var(--color-neutral-400)', marginBottom: 8 }}>Erreurs fréquentes</h6>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {ex.erreurs.map((er) => (
            <div key={er} style={{ display: 'flex', gap: 9, fontSize: 12, lineHeight: 1.5, color: 'var(--color-neutral-200)' }}>
              <Icon name="x-circle" weight="fill" size={15} color="#f0a35e" style={{ flex: 'none', marginTop: 1 }} /><span>{er}</span>
            </div>
          ))}
        </div>

        <h6 style={{ color: 'var(--color-neutral-400)', marginBottom: 8 }}>Conseils de sécurité</h6>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {ex.conseils.map((c) => (
            <div key={c} style={{ display: 'flex', gap: 9, fontSize: 12, lineHeight: 1.5, color: 'var(--color-neutral-200)' }}>
              <Icon name="shield-check" weight="fill" size={15} color="var(--color-accent)" style={{ flex: 'none', marginTop: 1 }} /><span>{c}</span>
            </div>
          ))}
        </div>

        <h6 style={{ color: 'var(--color-neutral-400)', marginBottom: 8 }}>Variantes</h6>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 11 }}>
            <div style={{ fontSize: 11, color: '#5fd08a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}><Icon name="arrow-bend-down-left" weight="fill" size={13} />Plus facile</div>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-300)', lineHeight: 1.5 }}>{ex.variFacile}</div>
          </div>
          <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 11 }}>
            <div style={{ fontSize: 11, color: 'var(--color-accent-200)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}><Icon name="arrow-bend-up-right" weight="fill" size={13} />Plus difficile</div>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-300)', lineHeight: 1.5 }}>{ex.variDifficile}</div>
          </div>
        </div>

        <h6 style={{ color: 'var(--color-neutral-400)', marginBottom: 8 }}>Exercices similaires</h6>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {ex.similaires.map((id) => {
            const s = exById(id);
            return (
              <button key={id} type="button" onClick={() => actions.selectExercise(id)} className="row-card" style={{ padding: '10px 12px' }}>
                <div style={{ width: 34, height: 34, flex: 'none', borderRadius: 8, background: 'var(--color-accent-900)', display: 'grid', placeItems: 'center', color: 'var(--color-accent-200)' }}><Icon name={s.icon} weight="fill" size={18} /></div>
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{s.nom}</div><div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{s.muscle}</div></div>
                <Icon name="caret-right" size={16} color="var(--color-neutral-500)" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
