import { useState } from 'react';
import { useApp } from '../state/context.js';
import { exById, exercisesByPattern } from '../data/exercises.js';
import Icon from '../components/ui/Icon.jsx';
import { Field, TextInput } from '../components/ui/Field.jsx';
import { Pill } from '../components/ui/Pill.jsx';
import { SecondaryButton, PrimaryButton, IconCircleButton } from '../components/ui/Button.jsx';

/**
 * Logs exercises performed today outside a guided session — the à la carte
 * counterpart to "Ajouter une séance" (a whole program, assumed completed as
 * prescribed) and its free-form entry (no exercises at all). Here the caller
 * picks from the full catalogue and states series/reps/charge per exercise
 * themselves, which store.jsx keeps as `exercisesDetail` on the logged entry
 * so the journal card can show what was actually done.
 */
export default function AddExercises() {
  const { actions } = useApp();
  const [exos, setExos] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');

  const addExo = (id) => {
    if (!exos.some((e) => e.id === id)) {
      const ex = exById(id);
      setExos((list) => [...list, { id, series: ex.series, reps: ex.reps, withCharge: false, charge: '' }]);
    }
    setPickerOpen(false);
    setSearch('');
  };
  const updateExo = (i, field, value) => setExos((list) => list.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)));
  const removeExo = (i) => setExos((list) => list.filter((_, idx) => idx !== i));

  const submit = () => {
    actions.addExercisesSession(exos.map((e) => ({ id: e.id, series: e.series, reps: e.reps, charge: e.withCharge ? e.charge : '' })));
    actions.closeOverlay();
  };

  const q = search.trim().toLowerCase();
  const groups = exercisesByPattern()
    .map((g) => ({ ...g, exos: g.exos.filter((e) => !q || e.nom.toLowerCase().includes(q) || e.muscle.toLowerCase().includes(q)) }))
    .filter((g) => g.exos.length > 0);

  return (
    <div className="overlay">
      <div className="mscroll" style={{ position: 'absolute', inset: 0, paddingBottom: 100 }}>
        <div className="overlay-header">
          <SecondaryButton icon="arrow-left" onClick={actions.closeOverlay} style={{ gap: 6 }}>Retour</SecondaryButton>
        </div>
        <div style={{ padding: '14px 18px 0' }}>
          <h3 style={{ margin: '0 0 4px' }}>Ajouter des exercices</h3>
          <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 16px' }}>
            Choisis ce que tu as fait aujourd'hui, hors séance guidée : séries, répétitions et charge s'ajoutent au journal du jour.
          </p>

          {exos.length === 0 && (
            <div className="empty-state" style={{ padding: '22px 10px', background: 'var(--color-surface)', border: '1px dashed var(--color-divider)', borderRadius: 'var(--radius-md)', marginBottom: 12 }}>
              <Icon name="barbell" size={24} style={{ display: 'block', margin: '0 auto 8px' }} />Ajoute ton premier exercice.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
            {exos.map((e, i) => {
              const ex = exById(e.id);
              return (
                <div key={e.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, flex: 'none', borderRadius: 8, background: 'var(--color-accent-900)', display: 'grid', placeItems: 'center', color: 'var(--color-accent-200)' }}>
                      <Icon name={ex.icon} weight="fill" size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{ex.nom}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{ex.muscle}</div>
                    </div>
                    <IconCircleButton icon="trash" size={28} onClick={() => removeExo(i)} style={{ color: 'var(--color-warn)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <Field label="Séries" style={{ flex: 1 }}>
                      <TextInput type="number" value={e.series} onChange={(v) => updateExo(i, 'series', v)} textAlign="center" />
                    </Field>
                    <Field label="Répétitions" style={{ flex: 1.6 }}>
                      <TextInput value={e.reps} onChange={(v) => updateExo(i, 'reps', v)} textAlign="center" />
                    </Field>
                  </div>
                  <Pill label="Avec un poids" active={e.withCharge} onClick={() => updateExo(i, 'withCharge', !e.withCharge)} />
                  {e.withCharge && (
                    <TextInput
                      value={e.charge} onChange={(v) => updateExo(i, 'charge', v)}
                      placeholder="ex. 12 kg, élastique moyen" style={{ marginTop: 8 }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button" onClick={() => setPickerOpen(true)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14, color: 'var(--color-accent-100)', background: 'transparent', border: '1px dashed var(--color-accent)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
          >
            <Icon name="plus-circle" size={18} />Ajouter un exercice
          </button>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 18px calc(26px + env(safe-area-inset-bottom))', background: 'linear-gradient(transparent,var(--color-bg) 30%)' }}>
        <PrimaryButton icon="check-circle" disabled={exos.length === 0} onClick={submit}>Ajouter au journal du jour</PrimaryButton>
      </div>

      {pickerOpen && (
        <div className="overlay mscroll" style={{ zIndex: 60, overflowY: 'auto' }}>
          <div className="overlay-header">
            <SecondaryButton icon="x" onClick={() => setPickerOpen(false)} style={{ gap: 6 }}>Fermer</SecondaryButton>
          </div>
          <div style={{ padding: '14px 18px 0' }}>
            <h4 style={{ margin: '0 0 12px' }}>Choisir un exercice</h4>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Icon name="magnifying-glass" size={16} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} color="var(--color-neutral-500)" />
              <input
                className="input" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un exercice ou un muscle…" style={{ paddingLeft: 34 }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {groups.map((g) => (
                <div key={g.pattern}>
                  <h6 style={{ color: 'var(--color-accent-200)', marginBottom: 8 }}>{g.pattern}</h6>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {g.exos.map((e) => {
                      const already = exos.some((x) => x.id === e.id);
                      return (
                        <button
                          key={e.id} type="button" onClick={() => addExo(e.id)} className="row-card"
                          style={{ opacity: already ? 0.55 : 1 }}
                        >
                          <div style={{ width: 40, height: 40, flex: 'none', borderRadius: 8, background: 'var(--color-accent-900)', display: 'grid', placeItems: 'center', color: 'var(--color-accent-200)' }}>
                            <Icon name={e.icon} weight="fill" size={22} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{e.nom}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{e.muscle}</div>
                          </div>
                          <Icon name={already ? 'check' : 'plus'} size={16} color="var(--color-accent-200)" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {groups.length === 0 && (
                <div className="empty-state"><Icon name="magnifying-glass" size={26} style={{ display: 'block', margin: '0 auto 8px' }} />Aucun exercice trouvé.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
