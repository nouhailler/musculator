import { useState } from 'react';
import { useApp, allPrograms } from '../state/context.js';
import { dateKey, nowHM } from '../lib/format.js';
import Icon from './ui/Icon.jsx';
import { Field, TextInput } from './ui/Field.jsx';
import { PillGroup } from './ui/Pill.jsx';
import { PrimaryButton, SecondaryButton, IconCircleButton } from './ui/Button.jsx';

const LIBRE = 'Libre';

/**
 * Logs a session after the fact, or edits one already logged. Shared by the
 * Journal and the Progress history so the two can't drift apart.
 *
 * Editing is deliberately limited to *when*, *how long* and — for a free-form
 * entry — its label. A real session's `exerciseIds` / `series` / `muscles` are
 * the record of what was actually performed and stay untouchable; rewriting
 * them would turn the journal into a wish list.
 */
export default function SessionForm({ session = null, onClose }) {
  const { state, actions } = useApp();
  const editing = !!session;
  const progs = allPrograms(state.customWorkouts);
  const freeForm = !editing || session.programId === 'manual';

  const [progNom, setProgNom] = useState(LIBRE);
  const [nom, setNom] = useState(editing ? session.programNom : '');
  const [minutes, setMinutes] = useState(editing ? Math.round(session.elapsedSec / 60) : 20);
  const [jour, setJour] = useState(editing ? session.dateKey : dateKey());
  const [heure, setHeure] = useState(editing ? session.heure : nowHM());

  const submit = () => {
    const patch = { nom, minutes, dateKey: jour, heure };
    if (editing) actions.editSession(session.id, patch);
    else {
      const prog = progs.find((p) => p.nom === progNom);
      actions.addManualSession({ ...patch, progId: prog ? prog.id : null, customName: nom });
    }
    onClose();
  };

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 13, marginBottom: 10 }}>
      {!editing && (
        <>
          <div className="section-label">Programme suivi</div>
          <PillGroup options={[LIBRE, ...progs.map((p) => p.nom)]} value={progNom} onChange={setProgNom} style={{ marginBottom: 12 }} />
        </>
      )}

      {/* A catalogue program names itself; only a free-form entry has a label
          worth typing — or correcting later. */}
      {freeForm && (progNom === LIBRE || editing) && (
        <Field label={editing ? 'Nom' : 'Description'} style={{ marginBottom: 10 }}>
          <TextInput value={nom} onChange={setNom} placeholder="ex. Course à pied, natation…" />
        </Field>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Field label="Date" style={{ flex: 1.4 }}>
          <input className="input" type="date" value={jour} max={dateKey()}
            onChange={(e) => setJour(e.target.value)} />
        </Field>
        <Field label="Heure" style={{ flex: 1 }}>
          <input className="input" type="time" value={heure} onChange={(e) => setHeure(e.target.value)} />
        </Field>
        <Field label="Durée (min)" style={{ flex: 1 }}>
          <TextInput type="number" value={minutes} onChange={setMinutes} textAlign="center" />
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <SecondaryButton onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Annuler</SecondaryButton>
        <PrimaryButton icon="check-circle" onClick={submit} disabled={!(Number(minutes) > 0)} style={{ flex: 1 }}>
          {editing ? 'Enregistrer' : 'Ajouter'}
        </PrimaryButton>
      </div>
    </div>
  );
}

/**
 * Delete, behind one confirmation. A logged session cannot be recovered and
 * the journal is the only copy, so a mistap must not be enough — but a modal
 * for it would be heavier than the action deserves, hence the inline swap.
 */
export function DeleteSessionButton({ id }) {
  const { actions } = useApp();
  const [asked, setAsked] = useState(false);

  if (!asked) {
    return (
      <IconCircleButton
        icon="trash" size={26} title="Supprimer cette séance"
        onClick={() => setAsked(true)} style={{ color: 'var(--color-neutral-500)' }}
      />
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <button type="button" onClick={() => setAsked(false)}
        style={{ background: 'none', border: 'none', color: 'var(--color-neutral-400)', fontSize: 11, cursor: 'pointer', padding: '2px 4px' }}>
        Annuler
      </button>
      <button type="button" onClick={() => actions.deleteSession(id)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, cursor: 'pointer',
          padding: '3px 9px', borderRadius: 999, color: 'var(--color-warn)',
          background: 'color-mix(in srgb,var(--color-warn) 12%,transparent)',
          border: '1px solid color-mix(in srgb,var(--color-warn) 45%,transparent)' }}>
        <Icon name="trash" size={12} />Supprimer
      </button>
    </div>
  );
}
