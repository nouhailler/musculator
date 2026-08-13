import { useApp } from '../state/store.jsx';
import { EXERCISES, exById } from '../data/exercises.js';
import Icon from '../components/ui/Icon.jsx';
import { PillGroup } from '../components/ui/Pill.jsx';
import { Field, TextInput } from '../components/ui/Field.jsx';
import { SecondaryButton, PrimaryButton, IconCircleButton } from '../components/ui/Button.jsx';

const OBJ_OPTS = ['Prise de masse', 'Force', 'Tonus', 'Endurance'];

export default function Builder() {
  const { state, actions } = useApp();
  const b = state.builder;

  return (
    <div className="overlay">
      <div className="mscroll" style={{ position: 'absolute', inset: 0, paddingBottom: 100 }}>
      <div className="overlay-header">
        <SecondaryButton icon="arrow-left" onClick={actions.closeOverlay} style={{ gap: 6 }}>Retour</SecondaryButton>
      </div>
      <div style={{ padding: '14px 18px 0' }}>
        <h3 style={{ margin: '0 0 4px' }}>Créer une séance</h3>
        <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 16px' }}>Compose ta séance : exercices, séries, répétitions, charge, repos et ordre.</p>

        <Field label="Nom de la séance" style={{ marginBottom: 14 }}>
          <TextInput value={b.name} onChange={(v) => actions.builderSetField('name', v)} placeholder="ex. Haut du corps" />
        </Field>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <Field label="Durée cible (min)" style={{ flex: 1 }}>
            <TextInput type="number" value={b.duree} onChange={(v) => actions.builderSetField('duree', v)} />
          </Field>
        </div>
        <Field label="Objectif" style={{ marginBottom: 6 }} />
        <PillGroup options={OBJ_OPTS} value={b.objectif} onChange={(v) => actions.builderSetField('objectif', v)} style={{ marginBottom: 20 }} />

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <h6 style={{ color: 'var(--color-neutral-400)', margin: 0 }}>Exercices</h6>
          <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{b.exos.length} exercice{b.exos.length > 1 ? 's' : ''}</span>
        </div>

        {b.exos.length === 0 && (
          <div className="empty-state" style={{ padding: '22px 10px', background: 'var(--color-surface)', border: '1px dashed var(--color-divider)', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
            <Icon name="barbell" size={24} style={{ display: 'block', margin: '0 auto 8px' }} />Ajoute ton premier exercice.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
          {b.exos.map((e, i) => {
            const ex = exById(e.id);
            return (
              <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 30, height: 30, flex: 'none', borderRadius: 8, background: 'var(--color-accent-900)', display: 'grid', placeItems: 'center', color: 'var(--color-accent-200)', fontSize: 13, fontWeight: 600 }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600 }}>{ex.nom}</div>
                  <IconCircleButton icon="caret-up" size={28} onClick={() => actions.builderMoveExo(i, -1)} />
                  <IconCircleButton icon="caret-down" size={28} onClick={() => actions.builderMoveExo(i, 1)} />
                  <IconCircleButton icon="trash" size={28} onClick={() => actions.builderRemoveExo(i)} style={{ color: '#f0a35e' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Field label="Séries" style={{ flex: 1 }}><TextInput type="number" value={e.series} onChange={(v) => actions.builderUpdateExo(i, 'series', v)} textAlign="center" /></Field>
                  <Field label="Reps" style={{ flex: 1 }}><TextInput value={e.reps} onChange={(v) => actions.builderUpdateExo(i, 'reps', v)} textAlign="center" /></Field>
                  <Field label="Repos (s)" style={{ flex: 1 }}><TextInput type="number" value={e.repos} onChange={(v) => actions.builderUpdateExo(i, 'repos', v)} textAlign="center" /></Field>
                </div>
                <Field label="Charge" style={{ marginTop: 8 }}>
                  <TextInput value={e.charge} onChange={(v) => actions.builderUpdateExo(i, 'charge', v)} placeholder="ex. 20 kg, poids du corps, élastique" />
                </Field>
              </div>
            );
          })}
        </div>

        <button
          type="button" onClick={() => actions.builderTogglePicker(true)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14, color: 'var(--color-accent-100)', background: 'transparent', border: '1px dashed var(--color-accent)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
        >
          <Icon name="plus-circle" size={18} />Ajouter un exercice
        </button>
      </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 18px calc(26px + env(safe-area-inset-bottom))', background: 'linear-gradient(transparent,var(--color-bg) 30%)' }}>
        <PrimaryButton icon="floppy-disk" disabled={b.exos.length === 0} onClick={actions.saveWorkout}>Enregistrer la séance</PrimaryButton>
      </div>

      {b.pickerOpen && (
        <div className="overlay mscroll" style={{ zIndex: 60, overflowY: 'auto' }}>
          <div className="overlay-header">
            <SecondaryButton icon="x" onClick={() => actions.builderTogglePicker(false)} style={{ gap: 6 }}>Fermer</SecondaryButton>
          </div>
          <div style={{ padding: '14px 18px 0' }}>
            <h4 style={{ margin: '0 0 12px' }}>Choisir un exercice</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {EXERCISES.map((e) => (
                <button key={e.id} type="button" onClick={() => actions.builderAddExo(e.id)} className="row-card">
                  <div style={{ width: 40, height: 40, flex: 'none', borderRadius: 8, background: 'var(--color-accent-900)', display: 'grid', placeItems: 'center', color: 'var(--color-accent-200)' }}><Icon name={e.icon} weight="fill" size={22} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{e.nom}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{e.muscle}</div>
                  </div>
                  <Icon name="plus" size={16} color="var(--color-accent-200)" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
