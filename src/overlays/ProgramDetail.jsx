import { useApp, allPrograms } from '../state/context.js';
import { progById } from '../data/programs.js';
import { exById } from '../data/exercises.js';
import Icon from '../components/ui/Icon.jsx';
import Tag from '../components/ui/Tag.jsx';
import { SecondaryButton, PrimaryButton } from '../components/ui/Button.jsx';

export default function ProgramDetail() {
  const { state, actions } = useApp();
  const prog = progById(state.selProgId, allPrograms(state.customWorkouts));

  const list = prog.exos.map((eid, i) => {
    const e = exById(eid);
    const cp = (prog.isCustom && prog.custom && prog.custom[eid]) ? prog.custom[eid] : null;
    const se = cp ? cp.series : e.series;
    const rp = cp ? cp.reps : e.reps;
    const ro = cp ? cp.repos : e.repos;
    const ch = cp ? cp.charge : '';
    return { num: i + 1, id: eid, nom: e.nom, meta: `${se} × ${rp}${ch ? ' · ' + ch : ''} · repos ${ro}s` };
  });

  return (
    <div className="overlay mscroll" style={{ paddingBottom: 110 }}>
      <div className="overlay-header">
        <SecondaryButton icon="arrow-left" onClick={actions.closeOverlay} style={{ gap: 6 }}>Retour</SecondaryButton>
      </div>
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 52, height: 52, flex: 'none', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-800)', display: 'grid', placeItems: 'center', color: 'var(--color-accent-100)' }}>
            <Icon name={prog.icon} size={28} />
          </div>
          <div><h3 style={{ margin: 0 }}>{prog.nom}</h3><div style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>{prog.obj}</div></div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          <Tag variant="accent" icon="clock">{prog.duree} min</Tag>
          <Tag variant="neutral">{prog.niveau}</Tag>
          <Tag variant="outline">{prog.lieu}</Tag>
          <Tag variant="neutral" icon="flame">~{prog.kcal} kcal</Tag>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-neutral-200)', marginBottom: 18 }}>{prog.desc}</p>
        <h6 style={{ color: 'var(--color-neutral-400)', marginBottom: 10 }}>{prog.exos.length} exercices</h6>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {list.map((e) => (
            <button key={e.num} type="button" onClick={() => actions.selectExercise(e.id)} className="row-card">
              <div style={{ width: 34, height: 34, flex: 'none', borderRadius: 8, background: 'var(--color-accent-900)', display: 'grid', placeItems: 'center', color: 'var(--color-accent-200)', fontSize: 13, fontWeight: 600 }}>{e.num}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{e.nom}</div>
                <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{e.meta}</div>
              </div>
              <Icon name="caret-right" size={16} color="var(--color-neutral-500)" />
            </button>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 18px calc(30px + env(safe-area-inset-bottom))', background: 'linear-gradient(transparent,var(--color-bg) 30%)' }}>
        <PrimaryButton icon="play-circle" size="lg" onClick={() => actions.startWorkout(prog.id)}>Démarrer ce programme</PrimaryButton>
      </div>
    </div>
  );
}
