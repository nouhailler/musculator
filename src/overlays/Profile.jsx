import { useApp } from '../state/context.js';
import { GOALS, DEFAULT_GOAL } from '../data/nutrition.js';
import { autoTargets, dailyTargets } from '../lib/macros.js';
import { DEFAULT_KM_TARGET } from '../data/activity.js';
import { DEFAULT_THEME, THEMES, themeLabel } from '../lib/theme.js';
import { Field, TextInput, TextArea, RangeInput } from '../components/ui/Field.jsx';
import { PillGroup } from '../components/ui/Pill.jsx';
import { SecondaryButton, PrimaryButton } from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';

const SEXE_OPTS = ['Homme', 'Femme', 'Autre'];
const OBJ_OPTS = ['Prise de masse', 'Force', 'Tonus', 'Endurance'];
const ZONE_OPTS = ['Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras', 'Abdos'];
const EXP_OPTS = ['Débutant', 'Intermédiaire', 'Avancé'];
const NUTRI_GOAL_OPTS = GOALS.map((g) => g.label);
const THEME_OPTS = THEMES.map((t) => t.label);

// The four daily targets: each field is empty while the number is derived from
// the profile above, and filled once the user sets their own. The computed
// value stays visible as the placeholder, so overriding is a deliberate act
// rather than a fork you can't find your way back from.
const TARGETS = [
  { key: 'kcalCible', label: 'Calories', unit: 'kcal', auto: 'kcal' },
  { key: 'protCible', label: 'Protéines', unit: 'g', auto: 'proteines' },
  { key: 'glucCible', label: 'Glucides', unit: 'g', auto: 'glucides' },
  { key: 'lipCible', label: 'Lipides', unit: 'g', auto: 'lipides' },
];

function TargetFields() {
  const { state, actions } = useApp();
  const p = state.profile;
  const auto = autoTargets(p);
  const t = dailyTargets(p);
  const custom = TARGETS.some((f) => Number(p[f.key]) > 0);
  // 4/4/9: what the macro targets actually add up to. Set by hand they can
  // drift from the calorie target, which is worth saying — the two bars on the
  // Nutrition screen would otherwise disagree with no explanation.
  const kcalMacros = t.proteines * 4 + t.glucides * 4 + t.lipides * 9;
  const ecart = t.kcal > 0 ? Math.round(((kcalMacros - t.kcal) / t.kcal) * 100) : 0;

  return (
    <>
      <Field label="Objectifs quotidiens" style={{ marginBottom: 4 }} />
      <p style={{ fontSize: 11, color: 'var(--color-neutral-400)', margin: '0 0 10px', lineHeight: 1.5 }}>
        Calculés depuis ton profil et ton objectif nutrition. Renseigne un champ pour imposer
        ta propre cible ; laisse-le vide pour garder le calcul automatique.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        {TARGETS.map((f) => (
          <Field key={f.key} label={`${f.label} (${f.unit})`} style={{ flex: 1 }}>
            <input
              className="input" type="number" inputMode="numeric"
              value={p[f.key] || ''}
              // What an empty field will actually be worth — which is not the
              // pure calculation once another field overrides it: setting
              // 2 400 kcal moves the carb target with it. The untouched
              // calculation stays on the line underneath.
              placeholder={String(t[f.auto])}
              onChange={(e) => actions.setProfileField(f.key, e.target.value === '' ? '' : Number(e.target.value))}
              style={{ textAlign: 'center', padding: '8px 4px' }}
            />
          </Field>
        ))}
      </div>
      {/* Walking has no calculation to fall back on — nothing in the profile
          implies a distance — so the suggestion is a placeholder, not a
          derived value, and an empty field simply means "no objective". */}
      <Field label="Marche (km / jour)" style={{ marginBottom: 8, maxWidth: 160 }}>
        <input
          className="input" type="number" inputMode="decimal" step="0.5"
          value={p.kmCible || ''}
          placeholder={String(DEFAULT_KM_TARGET)}
          onChange={(e) => actions.setProfileField('kmCible', e.target.value === '' ? '' : Number(e.target.value))}
          style={{ textAlign: 'center' }}
        />
      </Field>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: 'var(--color-neutral-500)', lineHeight: 1.5, flex: '1 1 100%' }}>
          Calcul automatique : {auto.kcal} kcal · P {auto.proteines} g · G {auto.glucides} g · L {auto.lipides} g
          {auto.estime && ' (poids, taille et âge manquants)'}
        </span>
        {custom && (
          <button
            type="button"
            onClick={() => TARGETS.forEach((f) => actions.setProfileField(f.key, ''))}
            style={{ background: 'none', border: 'none', color: 'var(--color-accent-200)', fontSize: 11, cursor: 'pointer', padding: 0, flex: 'none', marginLeft: 'auto' }}
          >
            Tout recalculer
          </button>
        )}
      </div>
      {custom && Math.abs(ecart) > 5 && (
        <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--color-warn)', lineHeight: 1.5, marginBottom: 16 }}>
          <Icon name="warning-circle" weight="fill" size={14} style={{ flex: 'none', marginTop: 1 }} />
          <span>
            Tes macros pèsent {Math.round(kcalMacros)} kcal, soit {ecart > 0 ? '+' : ''}{ecart} % par rapport à
            ta cible calorique — les deux jauges de l'écran Nutrition ne pourront pas être pleines ensemble.
          </span>
        </div>
      )}
    </>
  );
}

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

        {/* Nutrition goal is separate from the training objective above: you can
            train for force while cutting. Both live on the same profile so the
            targets have a single source. */}
        <Field label="Objectif nutrition" style={{ marginBottom: 6 }} />
        <PillGroup
          options={NUTRI_GOAL_OPTS}
          value={(GOALS.find((g) => g.key === (p.objectifNutrition || DEFAULT_GOAL)) || GOALS[1]).label}
          onChange={(label) => actions.setProfileField('objectifNutrition', GOALS.find((g) => g.label === label)?.key || DEFAULT_GOAL)}
          style={{ marginBottom: 16 }}
        />

        <TargetFields />

        <Field label="Contraintes / blessures (optionnel)" style={{ marginBottom: 18 }}>
          <TextArea value={p.contraintes} onChange={set('contraintes')} placeholder="ex. genou sensible, éviter les sauts" />
        </Field>

        <PrimaryButton icon="check" onClick={actions.saveProfile}>Enregistrer</PrimaryButton>

        <div style={{ height: 1, background: 'var(--color-divider)', margin: '26px 0 20px' }} />

        {/* An app setting, not a profile field — hence below "Enregistrer",
            which saves the form above. It applies on tap. */}
        <h5 style={{ margin: '0 0 4px' }}>Apparence</h5>
        <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 12px', lineHeight: 1.55 }}>
          Le thème s'applique tout de suite et reste enregistré sur cet appareil.
          « Système » suit le réglage clair / sombre de ton téléphone.
        </p>
        <PillGroup
          options={THEME_OPTS}
          value={themeLabel(state.theme)}
          onChange={(label) => actions.setTheme(THEMES.find((t) => t.label === label)?.key || DEFAULT_THEME)}
          style={{ marginBottom: 6 }}
        />

        <div style={{ height: 1, background: 'var(--color-divider)', margin: '20px 0' }} />

        <h5 style={{ margin: '0 0 4px' }}>Importer depuis Nutritor</h5>
        <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 12px', lineHeight: 1.55 }}>
          Reprends ton historique de repas depuis un export CSV de journal Nutritor. Les jours déjà
          renseignés ici sont complétés, jamais remplacés.
        </p>
        <label
          htmlFor="nutritor-csv"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
            padding: 11, borderRadius: 'var(--radius-md)', background: 'var(--color-surface)',
            border: '1px solid var(--color-divider)', color: 'var(--color-text)', fontSize: 13, marginBottom: 10 }}
        >
          <Icon name="arrow-fat-lines-down" size={16} />Choisir un fichier CSV
        </label>
        <input
          id="nutritor-csv" type="file" accept=".csv,text/csv" style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            file.text().then(actions.importNutritorCSV);
            e.target.value = '';
          }}
        />
        {state.importError && <div style={{ fontSize: 12, color: 'var(--color-warn)', marginBottom: 12, lineHeight: 1.5 }}>{state.importError}</div>}
        {state.importStatus && <div style={{ fontSize: 12, color: 'var(--color-good)', marginBottom: 12, lineHeight: 1.5 }}>{state.importStatus}</div>}

        <div style={{ height: 1, background: 'var(--color-divider)', margin: '20px 0' }} />

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
          <Icon name="warning-circle" weight="fill" size={14} color="var(--color-warn)" style={{ flex: 'none', marginTop: 1 }} />
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
          <div style={{ fontSize: 12, color: 'var(--color-warn)', marginBottom: 12, lineHeight: 1.5 }}>{state.orError}</div>
        )}
        {state.orStatus && (
          <div style={{ fontSize: 12, color: 'var(--color-good)', marginBottom: 12, lineHeight: 1.5 }}>{state.orStatus}</div>
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
