import { useApp } from '../state/context.js';
import { MUSCLES } from '../data/muscles.js';
import { exById } from '../data/exercises.js';
import { computeMuscleStats, recoveryInfo, solicitationLabel, solicitationColor } from '../lib/muscleStats.js';
import Icon from '../components/ui/Icon.jsx';
import { SecondaryButton } from '../components/ui/Button.jsx';

function Zone({ id, d, rect, statsById, selMuscleId, onClick }) {
  const stat = statsById[id];
  const fill = solicitationColor(stat.load);
  const stroke = selMuscleId === id ? 'var(--color-accent-100)' : 'transparent';
  const shared = { fill, stroke, strokeWidth: 2.5, style: { cursor: 'pointer' }, onClick: () => onClick(id) };
  return rect ? <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={rect.rx} {...shared} /> : <path d={d} {...shared} />;
}

function BodyOutline() {
  return (
    <g fill="var(--color-neutral-800)">
      <circle cx="100" cy="30" r="17" /><rect x="72" y="50" width="56" height="92" rx="16" /><rect x="74" y="138" width="52" height="26" rx="12" />
      <rect x="50" y="56" width="16" height="80" rx="8" /><rect x="134" y="56" width="16" height="80" rx="8" />
      <rect x="77" y="164" width="19" height="150" rx="9" /><rect x="104" y="164" width="19" height="150" rx="9" />
    </g>
  );
}

const FRONT_ZONES = [
  { id: 'epaules', rect: { x: 60, y: 52, w: 80, h: 15, rx: 7 } },
  { id: 'pecs', rect: { x: 74, y: 65, w: 52, h: 24, rx: 9 } },
  { id: 'biceps', rect: { x: 50, y: 70, w: 16, h: 30, rx: 8 } },
  { id: 'biceps', rect: { x: 134, y: 70, w: 16, h: 30, rx: 8 } },
  { id: 'abdos', rect: { x: 80, y: 93, w: 40, h: 44, rx: 9 } },
  { id: 'quads', rect: { x: 77, y: 168, w: 19, h: 72, rx: 9 } },
  { id: 'quads', rect: { x: 104, y: 168, w: 19, h: 72, rx: 9 } },
];

const BACK_ZONES = [
  { id: 'trapezes', rect: { x: 80, y: 52, w: 40, h: 18, rx: 8 } },
  { id: 'dos', rect: { x: 76, y: 72, w: 48, h: 42, rx: 9 } },
  { id: 'triceps', rect: { x: 50, y: 70, w: 16, h: 30, rx: 8 } },
  { id: 'triceps', rect: { x: 134, y: 70, w: 16, h: 30, rx: 8 } },
  { id: 'fessiers', rect: { x: 76, y: 140, w: 48, h: 24, rx: 10 } },
  { id: 'ischios', rect: { x: 77, y: 168, w: 19, h: 56, rx: 9 } },
  { id: 'ischios', rect: { x: 104, y: 168, w: 19, h: 56, rx: 9 } },
  { id: 'mollets', rect: { x: 77, y: 258, w: 19, h: 52, rx: 9 } },
  { id: 'mollets', rect: { x: 104, y: 258, w: 19, h: 52, rx: 9 } },
];

export default function BodyMap() {
  const { state, actions } = useApp();
  const statsById = Object.fromEntries(MUSCLES.map((m) => [m.id, computeMuscleStats(m, state.sessionLog)]));
  const zones = state.bodySide === 'front' ? FRONT_ZONES : BACK_ZONES;
  const selMuscle = MUSCLES.find((m) => m.id === state.selMuscleId) || null;
  const selStat = selMuscle ? statsById[selMuscle.id] : null;
  const rec = selStat ? recoveryInfo(selStat.days) : null;

  return (
    <div className="overlay mscroll">
      <div className="overlay-header">
        <SecondaryButton icon="arrow-left" onClick={actions.closeOverlay} style={{ gap: 6 }}>Retour</SecondaryButton>
      </div>
      <div style={{ padding: '14px 18px 0' }}>
        <h3 style={{ margin: '0 0 4px' }}>Cartographie musculaire</h3>
        <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 14px' }}>Touche un muscle pour voir sa sollicitation, sa récupération et les exercices qui le ciblent.</p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ display: 'inline-flex', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', overflow: 'hidden', fontSize: 13 }}>
            <button type="button" onClick={() => actions.setBodySide('front')} style={{ padding: '7px 18px', border: 0, cursor: 'pointer', font: 'inherit', background: state.bodySide === 'front' ? 'var(--color-accent-800)' : 'transparent', color: state.bodySide === 'front' ? 'var(--color-accent-100)' : 'var(--color-neutral-300)' }}>Avant</button>
            <button type="button" onClick={() => actions.setBodySide('back')} style={{ padding: '7px 18px', border: 0, borderLeft: '1px solid var(--color-divider)', cursor: 'pointer', font: 'inherit', background: state.bodySide === 'back' ? 'var(--color-accent-800)' : 'transparent', color: state.bodySide === 'back' ? 'var(--color-accent-100)' : 'var(--color-neutral-300)' }}>Arrière</button>
          </div>
        </div>

        <div style={{ background: 'radial-gradient(120% 90% at 50% 10%,var(--color-surface),var(--color-bg))', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: '12px 0 6px', marginBottom: 12 }}>
          <svg viewBox="0 0 200 360" style={{ width: 180, display: 'block', margin: '0 auto' }}>
            <BodyOutline />
            <g strokeWidth="2.5">
              {zones.map((z, i) => (
                <Zone key={`${z.id}-${i}`} id={z.id} rect={z.rect} statsById={statsById} selMuscleId={state.selMuscleId} onClick={actions.selectMuscle} />
              ))}
            </g>
          </svg>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 10, color: 'var(--color-neutral-400)', padding: '4px 8px 2px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-accent-500)', display: 'inline-block' }} />Élevée</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-accent-700)', display: 'inline-block' }} />Modérée</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-accent-900)', display: 'inline-block' }} />Faible</span>
          </div>
        </div>

        {selMuscle && (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: 15, animation: 'mFade .25s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 17, fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{selMuscle.nom}</div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, border: `1px solid ${rec.color}`, color: rec.color }}>{rec.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>Niveau de sollicitation</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent-200)' }}>{solicitationLabel(selStat.load)}</span>
            </div>
            <div style={{ height: 8, background: 'var(--color-neutral-800)', borderRadius: 4, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ height: '100%', width: `${selStat.load}%`, background: 'var(--color-accent)', borderRadius: 4, transition: 'width .4s ease' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1, background: 'var(--color-bg)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}><Icon name="clock-counter-clockwise" size={12} />Dernière séance</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{selStat.lastSession || 'Aucune'}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--color-bg)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}><Icon name="calendar-blank" size={12} />Sollicité</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{selStat.days === null ? 'Jamais' : selStat.days === 0 ? "Aujourd'hui" : selStat.days === 1 ? 'Hier' : `Il y a ${selStat.days} jours`}</div>
              </div>
            </div>
            <h6 style={{ color: 'var(--color-neutral-400)', marginBottom: 10 }}>Exercices ciblant ce muscle</h6>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {selMuscle.exos.map((id) => {
                const e = exById(id);
                return (
                  <button key={id} type="button" onClick={() => actions.selectExercise(id)} className="row-card" style={{ padding: '10px 12px', background: 'var(--color-bg)' }}>
                    <div style={{ width: 34, height: 34, flex: 'none', borderRadius: 8, background: 'var(--color-accent-900)', display: 'grid', placeItems: 'center', color: 'var(--color-accent-200)' }}><Icon name={e.icon} weight="fill" size={18} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{e.nom}</div><div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{e.muscle}</div></div>
                    <Icon name="caret-right" size={16} color="var(--color-neutral-500)" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
