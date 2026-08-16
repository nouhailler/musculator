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

// Silhouette proportions per `profile.sexe` — shoulder/waist/hip half-widths
// (torsoPath) and thigh/calf half-widths, the two places a body outline reads
// as male, female, or neither. 'Autre' (and anything unset) gets the midpoint
// of the two rather than defaulting to Homme, matching how macros.js already
// treats a third BMR term for 'Autre' instead of folding it into Homme.
const BODY_SHAPE = {
  Homme: { sw: 42, ww: 27, hw: 29, thigh: 14, calf: 10 },
  Femme: { sw: 32, ww: 20, hw: 38, thigh: 15, calf: 9 },
  Autre: { sw: 37, ww: 23.5, hw: 33.5, thigh: 14.5, calf: 9.5 },
};

// One closed path from shoulder to shoulder via the waist and hips — the
// taper (shoulder vs. waist vs. hip half-width) is what makes the silhouette
// read as a body rather than a block, and its direction (shoulders wider than
// hips, or the reverse) is the primary male/female cue.
function torsoPath({ sw, ww, hw }) {
  const [lsx, rsx] = [100 - sw, 100 + sw];
  const [lwx, rwx] = [100 - ww, 100 + ww];
  const [lhx, rhx] = [100 - hw, 100 + hw];
  return `M${lsx} 55 Q100 50 ${rsx} 55 Q${rsx + 3} 76 ${rwx} 96 Q${rwx + 6} 118 ${rhx} 138 `
    + `Q${rhx - 5} 150 100 150 Q${lhx + 5} 150 ${lhx} 138 Q${lwx - 6} 118 ${lwx} 96 Q${lsx - 3} 76 ${lsx} 55 Z`;
}

// A palm plus three short fingers, instead of a bare circle. Kept to short,
// parallel, unrotated stubs on purpose — fingers individually angled looked
// like the hand was melting at this render size (18px on screen).
function Hand({ cx }) {
  return (
    <g>
      <ellipse cx={cx} cy="147" rx="6.5" ry="7" />
      <rect x={cx - 6.3} y="152" width="3" height="6.5" rx="1.5" />
      <rect x={cx - 1.5} y="153.2" width="3" height="7.5" rx="1.5" />
      <rect x={cx + 3.3} y="152" width="3" height="6.5" rx="1.5" />
    </g>
  );
}

// Shoulder-length hair: a cap over the top of the head plus two strands
// framing the face down to shoulder level, all drawn behind the head circle
// so only what extends past its edge actually shows — no path needs to cross
// under the chin, which is what made an earlier one-piece version self-
// intersect. The right strand is authored once; the left is the same path
// mirrored, so the two can't drift out of symmetry. The one gender-specific
// silhouette cue besides body proportions, since a head-only outline reads
// as male by default at this size (checked against the reference).
const HAIR_STRAND_R = 'M112 20 C123 23 125 38 121 50 C119 58 114 62 109 60 C112 51 110 38 107 26 Z';
function Hair() {
  return (
    <g fill="var(--color-neutral-800)">
      <ellipse cx="100" cy="17" rx="19" ry="13" />
      <path d={HAIR_STRAND_R} />
      <g transform="matrix(-1 0 0 1 200 0)"><path d={HAIR_STRAND_R} /></g>
    </g>
  );
}

// An upper-arm/forearm/hand group, rotated a few degrees around the shoulder
// so the arm swings slightly away from the torso instead of hanging flush
// against it — the gap that reads as "a person standing" rather than "a
// mannequin with its arms glued to its sides".
function Arm({ side }) {
  const s = side === 'left' ? -1 : 1;
  const x = side === 'left' ? 44 : 138;
  const cx = side === 'left' ? 53 : 147;
  return (
    <g transform={`rotate(${s * 9} ${cx} 55)`}>
      <rect x={x} y="53" width="18" height="50" rx="9" />
      <rect x={x + 2} y="98" width="14" height="46" rx="7" />
      <Hand cx={cx} />
    </g>
  );
}

function BodyOutline({ sexe }) {
  const shape = BODY_SHAPE[sexe] || BODY_SHAPE.Autre;
  const { thigh, calf } = shape;
  return (
    <g fill="var(--color-neutral-800)">
      {/* Legs and arms sit behind the torso so their attachment seams at the
          hip and shoulder are covered rather than showing a straight edge. */}
      <rect x={86 - thigh} y="140" width={thigh * 2} height="75" rx="13" />
      <rect x={114 - thigh} y="140" width={thigh * 2} height="75" rx="13" />
      <rect x={86 - calf} y="208" width={calf * 2} height="92" rx="9" />
      <rect x={114 - calf} y="208" width={calf * 2} height="92" rx="9" />
      <rect x={86 - calf - 2} y="295" width={calf * 2 + 4} height="17" rx="7" />
      <rect x={114 - calf - 2} y="295" width={calf * 2 + 4} height="17" rx="7" />
      <Arm side="left" />
      <Arm side="right" />
      <path d={torsoPath(shape)} />
      {sexe === 'Femme' && <Hair />}
      <rect x="91" y="41" width="18" height="15" rx="5" />
      <circle cx="100" cy="28" r="16" />
    </g>
  );
}

// Zones are painted in order, so a zone listed later sits on top of the ones
// before it — that is how the adductor strips and the gluteus-medius corners
// carve their own clickable area out of the larger quads and glutes zones.
const FRONT_ZONES = [
  { id: 'epaules', rect: { x: 60, y: 52, w: 80, h: 15, rx: 7 } },
  { id: 'pecs', rect: { x: 74, y: 65, w: 52, h: 24, rx: 9 } },
  { id: 'biceps', rect: { x: 50, y: 70, w: 16, h: 30, rx: 8 } },
  { id: 'biceps', rect: { x: 134, y: 70, w: 16, h: 30, rx: 8 } },
  { id: 'abdos', rect: { x: 80, y: 93, w: 40, h: 44, rx: 9 } },
  // Les obliques bordent la sangle abdominale, les avant-bras prolongent les
  // biceps : deux bandes étroites, découpées à côté des zones existantes.
  { id: 'obliques', rect: { x: 70, y: 95, w: 9, h: 40, rx: 4 } },
  { id: 'obliques', rect: { x: 121, y: 95, w: 9, h: 40, rx: 4 } },
  { id: 'avant-bras', rect: { x: 46, y: 102, w: 15, h: 28, rx: 7 } },
  { id: 'avant-bras', rect: { x: 139, y: 102, w: 15, h: 28, rx: 7 } },
  { id: 'quads', rect: { x: 77, y: 168, w: 19, h: 72, rx: 9 } },
  { id: 'quads', rect: { x: 104, y: 168, w: 19, h: 72, rx: 9 } },
  { id: 'adducteurs', rect: { x: 88, y: 174, w: 8, h: 52, rx: 4 } },
  { id: 'adducteurs', rect: { x: 104, y: 174, w: 8, h: 52, rx: 4 } },
];

const BACK_ZONES = [
  { id: 'trapezes', rect: { x: 80, y: 52, w: 40, h: 18, rx: 8 } },
  { id: 'dos', rect: { x: 76, y: 72, w: 48, h: 42, rx: 9 } },
  { id: 'triceps', rect: { x: 50, y: 70, w: 16, h: 30, rx: 8 } },
  { id: 'triceps', rect: { x: 134, y: 70, w: 16, h: 30, rx: 8 } },
  { id: 'lombaires', rect: { x: 82, y: 116, w: 36, h: 22, rx: 8 } },
  { id: 'fessiers', rect: { x: 76, y: 140, w: 48, h: 24, rx: 10 } },
  { id: 'moyen-fessier', rect: { x: 76, y: 140, w: 13, h: 23, rx: 7 } },
  { id: 'moyen-fessier', rect: { x: 111, y: 140, w: 13, h: 23, rx: 7 } },
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
            <BodyOutline sexe={state.profile.sexe} />
            <g strokeWidth="2.5">
              {zones.map((z, i) => (
                <Zone key={`${z.id}-${i}`} id={z.id} rect={z.rect} statsById={statsById} selMuscleId={state.selMuscleId} onClick={actions.selectMuscle} />
              ))}
            </g>
          </svg>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 10, color: 'var(--color-neutral-400)', padding: '4px 8px 2px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-load-high)', display: 'inline-block' }} />Élevée</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-load-mid)', display: 'inline-block' }} />Modérée</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-load-low)', display: 'inline-block' }} />Faible</span>
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
