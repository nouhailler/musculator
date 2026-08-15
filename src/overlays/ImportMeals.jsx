import { useState } from 'react';
import { useApp } from '../state/context.js';
import { mealLabel } from '../data/nutrition.js';
import { MEAL_IMPORT_PROMPT } from '../lib/mealPrompt.js';
import { countImport, parseMealsImport } from '../lib/importMeals.js';
import { scale } from '../lib/food.js';
import { poidsOf, walkKcal } from '../lib/activity.js';
import Icon from '../components/ui/Icon.jsx';
import Tag from '../components/ui/Tag.jsx';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button.jsx';

const MODES = [
  ['append', 'Ajouter aux repas'],
  ['replace', 'Remplacer les repas'],
];

/**
 * Pastes back the JSON a chat assistant produced from a dictated meal. Nothing
 * is written before the preview: an import can span several days, and the user
 * has to be able to see what it will do to a day already logged.
 */
export default function ImportMeals() {
  const { state, actions } = useApp();
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('append');
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Async: a food the assistant named without composing is resolved against
  // the CIQUAL table, which is a chunk loaded on demand.
  const preview = async () => {
    setError('');
    setLoading(true);
    try {
      setParsed(await parseMealsImport(text, { fallbackDate: state.nutriDate, fallbackMeal: state.nutriMeal, foodCache: state.foodCache }));
    } catch (e) {
      setParsed(null);
      setError(e.message || 'JSON invalide.');
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(MEAL_IMPORT_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // No clipboard permission (or no secure context) — the prompt is on
      // screen and selectable, so this is not worth an error message.
    }
  };

  const counts = parsed ? countImport(parsed.days) : null;

  return (
    <div className="overlay mscroll">
      <div className="overlay-header">
        <SecondaryButton icon="arrow-left" onClick={actions.closeOverlay} style={{ gap: 6 }}>Retour</SecondaryButton>
      </div>
      <div style={{ padding: '14px 18px 0' }}>
        <h3 style={{ margin: '0 0 2px' }}>Importer un repas dicté</h3>
        <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 14px', lineHeight: 1.55 }}>
          Dicte tes repas à Claude ou ChatGPT, puis colle ici le JSON généré. Les aliments sont
          ajoutés à la journée correspondante, avec leurs valeurs pour 100 g — la quantité reste
          modifiable ensuite. Un aliment dont l'assistant n'a pas donné les valeurs est cherché
          d'abord dans tes aliments, puis dans la table CIQUAL ; l'aperçu indique la source retenue.
        </p>

        {/* --- The prompt to paste into the assistant --- */}
        <div style={{ border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', marginBottom: 14, overflow: 'hidden' }}>
          <button
            type="button" onClick={() => setShowPrompt((v) => !v)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 8, padding: '11px 12px', background: 'var(--color-surface)', border: 'none',
              color: 'var(--color-neutral-100)', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <Icon name="sparkle" size={15} color="var(--color-accent-200)" />Comment générer ce JSON ?
            </span>
            <Icon name={showPrompt ? 'caret-up' : 'caret-down'} size={15} color="var(--color-neutral-400)" />
          </button>
          {showPrompt && (
            <div style={{ borderTop: '1px solid var(--color-divider)', padding: 12 }}>
              <p style={{ fontSize: 12, color: 'var(--color-neutral-300)', margin: '0 0 10px', lineHeight: 1.55 }}>
                Copie le prompt ci-dessous et colle-le dans une conversation Claude (claude.ai) ou
                ChatGPT — ou mieux, dans les instructions d'un Projet / GPT personnalisé, pour ne
                le coller qu'une fois. Décris ensuite tes repas à la voix, puis recopie ici la
                réponse JSON.
              </p>
              <SecondaryButton
                icon={copied ? 'check' : 'copy'} onClick={copyPrompt}
                style={{ marginBottom: 10 }}
              >
                {copied ? 'Prompt copié !' : 'Copier le prompt'}
              </SecondaryButton>
              <pre style={{ maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                margin: 0, padding: 10, background: 'var(--color-neutral-900)', borderRadius: 'var(--radius-md)',
                fontSize: 10.5, lineHeight: 1.5, color: 'var(--color-neutral-300)' }}
              >
                {MEAL_IMPORT_PROMPT}
              </pre>
            </div>
          )}
        </div>

        <textarea
          className="input" rows={6} value={text}
          onChange={(e) => { setText(e.target.value); setParsed(null); setError(''); }}
          placeholder={'Colle ici le JSON, ex. { "app": "musculator", "days": [ … ] }'}
          style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, marginBottom: 12 }}
        />

        {error && (
          <div style={{ fontSize: 12, color: 'var(--color-warn)', marginBottom: 12, lineHeight: 1.5 }}>{error}</div>
        )}

        {!parsed ? (
          <SecondaryButton
            icon={loading ? 'circle-notch' : 'magnifying-glass'} onClick={preview}
            style={{ width: '100%', padding: 12, justifyContent: 'center', opacity: text.trim() && !loading ? 1 : 0.5 }}
          >
            {loading ? 'Lecture…' : 'Prévisualiser'}
          </SecondaryButton>
        ) : (
          <>
            <div className="section-label">Journées à importer</div>
            {parsed.days.map((d) => (
              <div key={d.date} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)',
                borderRadius: 'var(--radius-lg)', padding: 12, marginBottom: 10 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{d.date}</span>
                  {d.date === state.nutriDate && <Tag variant="neutral">Jour affiché</Tag>}
                </div>
                {d.marche?.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--color-accent-200)', marginBottom: 4 }}>Marche</div>
                    {d.marche.map((w) => (
                      <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 11.5 }}>
                        <span style={{ color: 'var(--color-neutral-200)' }}>{w.km > 0 ? `${w.km} km` : `${w.minutes} min`}</span>
                        <span style={{ color: 'var(--color-neutral-500)', fontVariantNumeric: 'tabular-nums' }}>
                          {walkKcal({ km: w.km, minutes: w.minutes, poids: poidsOf(state.profile), type: w.type })} kcal
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {d.meals.map((m) => (
                  <div key={m.key} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--color-accent-200)', marginBottom: 4 }}>{mealLabel(m.key)}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {m.entries.map((e) => {
                        const v = scale(e.food, e.grammes);
                        return (
                          <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 11.5 }}>
                            <span style={{ color: 'var(--color-neutral-200)', minWidth: 0 }}>
                              {e.food.nom}
                              {/* Values the assistant did not give come from the
                                  table; naming the entry used is what lets a bad
                                  match be caught before it is imported. */}
                              {e.food.matchNom && (
                                <span style={{ display: 'block', color: 'var(--color-neutral-500)', fontSize: 10 }}>
                                  ↳ {e.food.matchSource === 'cache' ? 'Mes aliments' : 'CIQUAL'} : {e.food.matchNom}
                                </span>
                              )}
                            </span>
                            <span style={{ color: 'var(--color-neutral-500)', flex: 'none', fontVariantNumeric: 'tabular-nums' }}>
                              {e.grammes} g · {Math.round(v.kcal)} kcal · P {Math.round(v.proteines)} g
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div className="section-label">Sur une journée déjà remplie</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {MODES.map(([key, label]) => (
                <button key={key} type="button" onClick={() => setMode(key)}
                  className={`pill${mode === key ? ' pill-on' : ''}`} style={{ flex: 1 }}>
                  {label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--color-neutral-500)', margin: '0 0 14px', lineHeight: 1.5 }}>
              {mode === 'append'
                ? "Les aliments viennent s'ajouter à ceux déjà consignés pour ces repas."
                : 'Les repas concernés sont vidés puis remplis par cet import. Les autres repas de la journée ne bougent pas.'}
            </p>

            {counts && (
              <p style={{ fontSize: 11.5, color: 'var(--color-neutral-400)', margin: '0 0 12px' }}>
                {counts.aliments} aliment{counts.aliments > 1 ? 's' : ''} · {counts.meals} repas
                {counts.jours > 1 ? ` · ${counts.jours} jours` : ''} · {counts.kcal} kcal au total.
              </p>
            )}

            {parsed.warnings.length > 0 && (
              <div style={{ border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 11, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--color-warn)', marginBottom: 6 }}>
                  <Icon name="warning-circle" size={14} />
                  {parsed.warnings.length} avertissement{parsed.warnings.length > 1 ? 's' : ''}
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 11, color: 'var(--color-neutral-400)', lineHeight: 1.5 }}>
                  {parsed.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <SecondaryButton icon="pencil-simple" onClick={() => setParsed(null)} style={{ padding: '0 14px' }}>
                Modifier
              </SecondaryButton>
              <PrimaryButton icon="check" onClick={() => actions.importMealDays(parsed.days, mode)} style={{ flex: 1 }}>
                Importer
              </PrimaryButton>
            </div>
          </>
        )}

        <div style={{ height: 8 }} />
        <Tag variant="outline">Rien n'est envoyé : le JSON est lu sur l'appareil</Tag>
        <div style={{ height: 28 }} />
      </div>
    </div>
  );
}
