import { useApp } from '../state/context.js';
import { Field, TextInput, TextArea, RangeInput } from '../components/ui/Field.jsx';
import { PillGroup } from '../components/ui/Pill.jsx';
import { SecondaryButton, PrimaryButton } from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';

const SEXE_OPTS = ['Homme', 'Femme', 'Autre'];
const OBJ_OPTS = ['Prise de masse', 'Force', 'Tonus', 'Endurance'];
const ZONE_OPTS = ['Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras', 'Abdos'];
const EXP_OPTS = ['Débutant', 'Intermédiaire', 'Avancé'];

export default function Profile() {
  const { state, actions } = useApp();
  const p = state.profile;
  const or = state.openrouter;
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

        <div style={{ height: 1, background: 'var(--color-divider)', margin: '26px 0 20px' }} />

        <h5 style={{ margin: '0 0 4px' }}>Analyse IA — OpenRouter</h5>
        <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 14px', lineHeight: 1.55 }}>
          Facultatif. Sans clé, l'analyse du journal reste calculée sur ton téléphone. Avec une clé
          OpenRouter et un modèle gratuit, c'est ce modèle qui la rédige.
        </p>

        <Field label="Clé API OpenRouter" style={{ marginBottom: 6 }}>
          <TextInput
            type="password"
            value={or.key}
            onChange={(v) => actions.setOpenRouter({ key: v.trim() })}
            placeholder="sk-or-v1-…"
          />
        </Field>
        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 11, color: 'var(--color-neutral-400)', lineHeight: 1.5, marginBottom: 14 }}>
          <Icon name="warning-circle" weight="fill" size={14} color="#f0a35e" style={{ flex: 'none', marginTop: 1 }} />
          <span>
            La clé est enregistrée en clair sur cet appareil et envoyée directement à OpenRouter depuis
            ton navigateur — l'app n'a pas de serveur. N'utilise pas une clé partagée, et pense à lui
            fixer une limite de dépense sur openrouter.ai.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 9, marginBottom: 12 }}>
          <SecondaryButton
            icon={state.orLoading ? 'circle-notch' : 'arrow-counter-clockwise'}
            onClick={actions.loadOpenRouterModels}
            style={{ flex: 1, padding: 11, justifyContent: 'center' }}
          >
            {state.orLoading ? 'Connexion…' : 'Charger les modèles gratuits'}
          </SecondaryButton>
          {(or.key || or.model) && (
            <SecondaryButton
              icon="trash"
              onClick={() => actions.setOpenRouter({ key: '', model: '' })}
              style={{ padding: 11, justifyContent: 'center' }}
            >
              Effacer
            </SecondaryButton>
          )}
        </div>

        {state.orError && (
          <div style={{ fontSize: 12, color: '#f0a35e', marginBottom: 12, lineHeight: 1.5 }}>{state.orError}</div>
        )}
        {state.orStatus && (
          <div style={{ fontSize: 12, color: '#5fd08a', marginBottom: 12, lineHeight: 1.5 }}>{state.orStatus}</div>
        )}

        {/* Fetched live rather than hard-coded: OpenRouter's free line-up
            changes often, so a baked-in list would go stale. */}
        {state.orModels.length > 0 && (
          <>
            <Field label="Modèle gratuit" style={{ marginBottom: 8 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
              {state.orModels.map((m) => {
                const on = or.model === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => actions.setOpenRouter({ model: on ? '' : m.id })}
                    style={{
                      textAlign: 'left', cursor: 'pointer', padding: '10px 12px',
                      borderRadius: 'var(--radius-md)', background: on ? 'var(--color-accent-800)' : 'var(--color-surface)',
                      border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                      color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: 10,
                    }}
                  >
                    <Icon
                      name={on ? 'check-circle' : 'circle'}
                      weight={on ? 'fill' : 'regular'}
                      size={17}
                      color={on ? 'var(--color-accent-200)' : 'var(--color-neutral-500)'}
                      style={{ flex: 'none' }}
                    />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{m.nom}</span>
                      <span style={{ display: 'block', fontSize: 10, color: 'var(--color-neutral-500)' }}>
                        {m.id}{m.contexte ? ` · ${Math.round(m.contexte / 1000)}k contexte` : ''}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {or.key && or.model && (
          <div style={{ display: 'flex', gap: 9, alignItems: 'center', fontSize: 12, color: 'var(--color-neutral-300)', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginBottom: 10 }}>
            <Icon name="sparkle" weight="fill" size={15} color="var(--color-accent-200)" style={{ flex: 'none' }} />
            <span>L'analyse du journal utilisera <strong>{or.model}</strong>.</span>
          </div>
        )}
      </div>
    </div>
  );
}
