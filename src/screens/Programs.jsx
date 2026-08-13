import { useApp } from '../state/store.jsx';
import { PROGRAMS } from '../data/programs.js';
import Icon from '../components/ui/Icon.jsx';
import Tag from '../components/ui/Tag.jsx';
import { PillGroup } from '../components/ui/Pill.jsx';

const DUR_OPTS = ['Toutes', '5 min', '10 min', '20 min', '30+ min'];
const LEVEL_OPTS = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé'];
const EQUIP_OPTS = ['Tous', 'Sans matériel', 'Haltères', 'Élastique', 'Maison', 'Salle'];

function matchesFilters(p, { fLevel, fEquip, fDur }) {
  const okL = fLevel === 'Tous' || p.niveau === fLevel || p.niveau === 'Tous niveaux';
  const okE = fEquip === 'Tous' || p.mat.includes(fEquip);
  let okD = true;
  if (fDur === '5 min') okD = p.duree <= 5;
  else if (fDur === '10 min') okD = p.duree > 5 && p.duree <= 10;
  else if (fDur === '20 min') okD = p.duree > 10 && p.duree <= 20;
  else if (fDur === '30+ min') okD = p.duree > 20;
  return okL && okE && okD;
}

export default function Programs() {
  const { state, actions } = useApp();
  const filtered = PROGRAMS.filter((p) => matchesFilters(p, state));

  return (
    <div className="screen mscroll">
      <h3 style={{ margin: '0 0 4px' }}>Programmes</h3>
      <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 14px' }}>Choisis selon ton objectif, ton niveau et ton temps.</p>

      <button
        type="button" onClick={actions.openBuilder}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, marginBottom: 18, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14, color: 'var(--color-accent-100)', background: 'transparent', border: '1px dashed var(--color-accent)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
      >
        <Icon name="plus-circle" size={18} />Créer une séance
      </button>

      {state.customWorkouts.length > 0 && (
        <>
          <div className="section-label">Mes séances</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {state.customWorkouts.map((p) => (
              <button key={p.id} type="button" onClick={() => actions.selectProgram(p.id)} className="row-card" style={{ borderColor: 'var(--color-accent-800)' }}>
                <div className="icon-tile" style={{ background: 'var(--color-accent-800)', color: 'var(--color-accent-100)' }}><Icon name={p.icon} size={22} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{p.nom}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{p.exos.length} exercices · {p.duree} min</div>
                </div>
                <Tag variant="outline">Perso</Tag>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="section-label">Durée</div>
      <PillGroup options={DUR_OPTS} value={state.fDur} onChange={(v) => actions.setProgFilter('fDur', v)} style={{ marginBottom: 14 }} />
      <div className="section-label">Niveau</div>
      <PillGroup options={LEVEL_OPTS} value={state.fLevel} onChange={(v) => actions.setProgFilter('fLevel', v)} style={{ marginBottom: 14 }} />
      <div className="section-label">Matériel & lieu</div>
      <PillGroup options={EQUIP_OPTS} value={state.fEquip} onChange={(v) => actions.setProgFilter('fEquip', v)} style={{ marginBottom: 20 }} />

      <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', marginBottom: 10 }}>
        {filtered.length} programme{filtered.length > 1 ? 's' : ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((p) => (
          <div key={p.id} onClick={() => actions.selectProgram(p.id)} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: 14, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div className="icon-tile" style={{ width: 44, height: 44 }}><Icon name={p.icon} size={24} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{p.nom}</div>
                <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{p.exos.length} exercices · {p.obj}</div>
              </div>
              <Icon name="caret-right" size={16} color="var(--color-neutral-500)" />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Tag variant="accent" icon="clock">{p.duree} min</Tag>
              <Tag variant="neutral">{p.niveau}</Tag>
              <Tag variant="outline">{p.lieu}</Tag>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state"><Icon name="magnifying-glass" size={26} style={{ display: 'block', margin: '0 auto 8px' }} />Aucun programme avec ces filtres.</div>
        )}
      </div>
    </div>
  );
}
