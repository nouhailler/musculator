import { useApp } from '../state/context.js';
import { coreExercises, groupByPattern } from '../data/exercises.js';
import Icon from '../components/ui/Icon.jsx';
import { Pill, PillGroup } from '../components/ui/Pill.jsx';
import { SecondaryButton } from '../components/ui/Button.jsx';

const LEVEL_OPTS = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé'];
const MAT_OPTS = ['Tous', 'Sans matériel', 'Haltères', 'Élastique', 'Salle', 'Maison'];

function ExerciseRow({ ex, onClick }) {
  return (
    <button type="button" onClick={onClick} className="row-card" style={{ padding: 11 }}>
      <div style={{ width: 48, height: 48, flex: 'none', borderRadius: 'var(--radius-md)', background: 'radial-gradient(120% 120% at 30% 20%,var(--color-accent-800),var(--color-neutral-900))', display: 'grid', placeItems: 'center', color: 'var(--color-accent-100)' }}>
        <Icon name={ex.icon} weight="fill" size={26} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{ex.nom}</div>
        <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{ex.muscle}</div>
        <div style={{ fontSize: 10, color: 'var(--color-neutral-500)', marginTop: 2 }}>{ex.niveau} · {ex.mat.join(' · ')}</div>
      </div>
      <Icon name="caret-right" size={16} color="var(--color-neutral-500)" />
    </button>
  );
}

export default function Library() {
  const { state, actions } = useApp();
  const q = state.libSearch.trim().toLowerCase();
  const list = coreExercises({ optionnels: state.libOptionnels }).filter((e) => {
    const okQ = !q || e.nom.toLowerCase().includes(q) || e.muscle.toLowerCase().includes(q);
    const okL = state.libLevel === 'Tous' || e.niveau === state.libLevel;
    const okM = state.libMat === 'Tous' || e.mat.includes(state.libMat);
    return okQ && okL && okM;
  });
  // Grouped by movement pattern *after* filtering, so each header counts only
  // what the current filters actually kept.
  const groups = groupByPattern(list);

  return (
    <div className="screen mscroll">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h3 style={{ margin: 0 }}>Bibliothèque</h3>
        <SecondaryButton icon="person" onClick={actions.openBodyMap} style={{ fontSize: 12 }}>Vue corps</SecondaryButton>
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 14px' }}>{list.length} exercices détaillés — technique, erreurs, variantes.</p>

      <div style={{ position: 'relative', marginBottom: 14 }}>
        <Icon name="magnifying-glass" size={16} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} color="var(--color-neutral-500)" />
        <input
          className="input" value={state.libSearch}
          onChange={(e) => actions.setLibFilter('libSearch', e.target.value)}
          placeholder="Rechercher un exercice ou un muscle…"
          style={{ paddingLeft: 34 }}
        />
      </div>

      <div className="section-label">Niveau</div>
      <PillGroup options={LEVEL_OPTS} value={state.libLevel} onChange={(v) => actions.setLibFilter('libLevel', v)} style={{ marginBottom: 12 }} />
      <div className="section-label">Matériel</div>
      <PillGroup options={MAT_OPTS} value={state.libMat} onChange={(v) => actions.setLibFilter('libMat', v)} style={{ marginBottom: 12 }} />
      <div className="section-label">Hors focus cuisses / fessiers</div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 18 }}>
        <Pill
          label="Mollets & avancés"
          active={state.libOptionnels}
          onClick={() => actions.setLibFilter('libOptionnels', !state.libOptionnels)}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {groups.map((g) => (
          <div key={g.pattern}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <h6 style={{ color: 'var(--color-accent-200)', margin: 0 }}>{g.pattern}</h6>
              <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{g.exos.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {g.exos.map((e) => (
                <ExerciseRow key={e.id} ex={e} onClick={() => actions.selectExercise(e.id)} />
              ))}
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="empty-state"><Icon name="magnifying-glass" size={26} style={{ display: 'block', margin: '0 auto 8px' }} />Aucun exercice trouvé.</div>
        )}
      </div>
    </div>
  );
}
