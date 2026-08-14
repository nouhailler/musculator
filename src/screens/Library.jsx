import { useApp } from '../state/context.js';
import { EXERCISES } from '../data/exercises.js';
import Icon from '../components/ui/Icon.jsx';
import { PillGroup } from '../components/ui/Pill.jsx';
import { SecondaryButton } from '../components/ui/Button.jsx';

const LEVEL_OPTS = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé'];
const MAT_OPTS = ['Tous', 'Sans matériel', 'Haltères', 'Élastique', 'Salle', 'Maison'];

export default function Library() {
  const { state, actions } = useApp();
  const q = state.libSearch.trim().toLowerCase();
  const list = EXERCISES.filter((e) => {
    const okQ = !q || e.nom.toLowerCase().includes(q) || e.muscle.toLowerCase().includes(q);
    const okL = state.libLevel === 'Tous' || e.niveau === state.libLevel;
    const okM = state.libMat === 'Tous' || e.mat.includes(state.libMat);
    return okQ && okL && okM;
  });

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
      <PillGroup options={MAT_OPTS} value={state.libMat} onChange={(v) => actions.setLibFilter('libMat', v)} style={{ marginBottom: 18 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((e) => (
          <button key={e.id} type="button" onClick={() => actions.selectExercise(e.id)} className="row-card" style={{ padding: 11 }}>
            <div style={{ width: 48, height: 48, flex: 'none', borderRadius: 'var(--radius-md)', background: 'radial-gradient(120% 120% at 30% 20%,var(--color-accent-800),var(--color-neutral-900))', display: 'grid', placeItems: 'center', color: 'var(--color-accent-100)' }}>
              <Icon name={e.icon} weight="fill" size={26} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{e.nom}</div>
              <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{e.muscle}</div>
              <div style={{ fontSize: 10, color: 'var(--color-neutral-500)', marginTop: 2 }}>{e.niveau} · {e.mat.join(' · ')}</div>
            </div>
            <Icon name="caret-right" size={16} color="var(--color-neutral-500)" />
          </button>
        ))}
        {list.length === 0 && (
          <div className="empty-state"><Icon name="magnifying-glass" size={26} style={{ display: 'block', margin: '0 auto 8px' }} />Aucun exercice trouvé.</div>
        )}
      </div>
    </div>
  );
}
