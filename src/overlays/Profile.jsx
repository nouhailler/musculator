import { useApp } from '../state/store.jsx';
import { Field, TextInput, TextArea, RangeInput } from '../components/ui/Field.jsx';
import { PillGroup } from '../components/ui/Pill.jsx';
import { SecondaryButton, PrimaryButton } from '../components/ui/Button.jsx';

const SEXE_OPTS = ['Homme', 'Femme', 'Autre'];
const OBJ_OPTS = ['Prise de masse', 'Force', 'Tonus', 'Endurance'];
const ZONE_OPTS = ['Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras', 'Abdos'];
const EXP_OPTS = ['Débutant', 'Intermédiaire', 'Avancé'];

export default function Profile() {
  const { state, actions } = useApp();
  const p = state.profile;
  const set = (key) => (v) => actions.setProfileField(key, v);

  return (
    <div className="overlay mscroll">
      <div className="overlay-header">
        <SecondaryButton icon="arrow-left" onClick={actions.closeOverlay} style={{ gap: 6 }}>Retour</SecondaryButton>
      </div>
      <div style={{ padding: '14px 18px 0' }}>
        <h3 style={{ margin: '0 0 4px' }}>Mon profil & objectifs</h3>
        <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 18px' }}>Ces données permettent à l'analyse IA d'être précise sur tes séances.</p>

        <Field label="Prénom" style={{ marginBottom: 14 }}>
          <TextInput value={p.prenom} onChange={set('prenom')} placeholder="Ton prénom" />
        </Field>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <Field label="Âge" style={{ flex: 1 }}><TextInput type="number" value={p.age} onChange={set('age')} /></Field>
          <Field label="Sexe" style={{ flex: 2 }}>
            <PillGroup options={SEXE_OPTS} value={p.sexe} onChange={set('sexe')} />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <Field label="Poids (kg)" style={{ flex: 1 }}><TextInput type="number" value={p.poids} onChange={set('poids')} /></Field>
          <Field label="Taille (cm)" style={{ flex: 1 }}><TextInput type="number" value={p.taille} onChange={set('taille')} /></Field>
          <Field label="Poids cible" style={{ flex: 1 }}><TextInput type="number" value={p.poidsCible} onChange={set('poidsCible')} /></Field>
        </div>

        <Field label="Objectif principal" style={{ marginBottom: 6 }} />
        <PillGroup options={OBJ_OPTS} value={p.objectif} onChange={set('objectif')} style={{ marginBottom: 16 }} />

        <Field label="Zones musculaires prioritaires" style={{ marginBottom: 6 }} />
        <PillGroup options={ZONE_OPTS} value={p.zones} onChange={actions.toggleZone} multi style={{ marginBottom: 18 }} />

        <Field label="Niveau d'expérience" style={{ marginBottom: 6 }} />
        <PillGroup options={EXP_OPTS} value={p.experience} onChange={set('experience')} style={{ marginBottom: 16 }} />

        <Field label={`Fréquence visée : ${p.frequence} séances / semaine`} style={{ marginBottom: 16 }}>
          <RangeInput min={1} max={7} value={p.frequence} onChange={set('frequence')} />
        </Field>

        <Field label="Contraintes / blessures (optionnel)" style={{ marginBottom: 18 }}>
          <TextArea value={p.contraintes} onChange={set('contraintes')} placeholder="ex. genou sensible, éviter les sauts" />
        </Field>

        <PrimaryButton icon="check" onClick={actions.saveProfile}>Enregistrer</PrimaryButton>
      </div>
    </div>
  );
}
