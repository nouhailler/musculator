import { useMemo, useState } from 'react';
import { useApp, useDerived } from '../state/context.js';
import { exById } from '../data/exercises.js';
import { MEALS } from '../data/nutrition.js';
import { totals } from '../lib/macros.js';
import { dayActivity } from '../lib/activity.js';
import { fmt, todayLabel } from '../lib/format.js';
import Icon from '../components/ui/Icon.jsx';
import Tag from '../components/ui/Tag.jsx';
import { PrimaryButton, IconCircleButton } from '../components/ui/Button.jsx';
import { TextArea } from '../components/ui/Field.jsx';
import SessionForm, { DeleteSessionButton } from '../components/SessionForm.jsx';

export default function Journal() {
  const { state, actions } = useApp();
  const { journalToday, today } = useDerived();
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  const dayTime = journalToday.reduce((a, j) => a + j.elapsedSec, 0);
  const dayKcal = journalToday.reduce((a, j) => a + j.kcal, 0);
  const daySeries = journalToday.reduce((a, j) => a + j.series, 0);
  const an = state.analysis;

  const nutriEntries = useMemo(() => MEALS.flatMap((m) => state.nutriLog[today]?.[m.key] || []), [state.nutriLog, today]);
  const nutriTotals = useMemo(() => totals(nutriEntries), [nutriEntries]);
  const marche = useMemo(() => dayActivity(state.activityLog, today, state.profile), [state.activityLog, today, state.profile]);

  return (
    <div className="screen mscroll">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 2 }}>
        <h3 style={{ margin: 0 }}>Journal du jour</h3>
        <span style={{ fontSize: 11, color: 'var(--color-neutral-500)', textTransform: 'capitalize', textAlign: 'right', maxWidth: 120 }}>{todayLabel()}</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 14px' }}>Récap de tes séances, puis lance l'analyse IA.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div className="stat-box"><div className="stat-value">{fmt(dayTime)}</div><div className="stat-label">temps</div></div>
        <div className="stat-box"><div className="stat-value">{dayKcal}</div><div className="stat-label">kcal</div></div>
        <div className="stat-box"><div className="stat-value">{daySeries}</div><div className="stat-label">séries</div></div>
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 13, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: nutriEntries.length ? 10 : 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Alimentation du jour</span>
          <button type="button" onClick={() => actions.goTab('nutrition')}
            style={{ background: 'none', border: 'none', color: 'var(--color-accent-200)', fontSize: 11, cursor: 'pointer', padding: 0 }}>
            Voir le détail
          </button>
        </div>
        {nutriEntries.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>Rien noté aujourd'hui.</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div className="stat-box"><div className="stat-value">{nutriTotals.kcal}</div><div className="stat-label">kcal</div></div>
              <div className="stat-box"><div className="stat-value">{nutriTotals.proteines}</div><div className="stat-label">prot. (g)</div></div>
              <div className="stat-box"><div className="stat-value">{nutriTotals.glucides}</div><div className="stat-label">gluc. (g)</div></div>
              <div className="stat-box"><div className="stat-value">{nutriTotals.lipides}</div><div className="stat-label">lip. (g)</div></div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', lineHeight: 1.5 }}>
              {dayKcal > 0
                ? `${nutriTotals.kcal} kcal mangées pour ${dayKcal} kcal brûlées à l'entraînement — pas un bilan calorique complet, la dépense de repos n'y est pas.`
                : `${nutriTotals.kcal} kcal mangées aujourd'hui.`}
            </div>
          </>
        )}
      </div>

      {/* Walking sits next to food and training, and like them it is shown
          rather than netted off: the day's expenditure is not a balance. */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 13, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: marche.km || marche.minutes ? 10 : 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Marche du jour</span>
          <button type="button" onClick={actions.openActivity}
            style={{ background: 'none', border: 'none', color: 'var(--color-accent-200)', fontSize: 11, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="plus" size={13} />Ajouter une marche
          </button>
        </div>
        {!marche.km && !marche.minutes ? (
          <div style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>Rien parcouru aujourd'hui.</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div className="stat-box"><div className="stat-value">{marche.km.toLocaleString('fr-FR')}</div><div className="stat-label">km</div></div>
              <div className="stat-box"><div className="stat-value">{marche.kcal}</div><div className="stat-label">kcal</div></div>
              <div className="stat-box"><div className="stat-value">{marche.minutes}</div><div className="stat-label">minutes</div></div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', lineHeight: 1.5 }}>
              {marche.count} sortie{marche.count > 1 ? 's' : ''} · estimation nette à 0,5 kcal par kilo et par kilomètre.
              Elle s'ajoute à ta dépense, pas à ta cible calorique.
            </div>
          </>
        )}
      </div>

      <PrimaryButton
        icon={state.analysisLoading ? 'circle-notch' : 'sparkle'}
        iconWeight={state.analysisLoading ? 'regular' : 'fill'}
        onClick={actions.runAnalysis}
        disabled={state.analysisLoading}
        style={{ marginBottom: 8 }}
      >
        {state.analysisLoading ? 'Analyse en cours…' : 'Analyse IA de ma journée'}
      </PrimaryButton>
      {state.analysisError && <div style={{ fontSize: 12, color: 'var(--color-warn)', textAlign: 'center', marginBottom: 10 }}>{state.analysisError}</div>}

      {an && (
        <div style={{ margin: '6px 0 18px', animation: 'mFade .35s ease' }}>
          <div style={{ background: 'linear-gradient(135deg,var(--color-accent-900),var(--color-surface))', border: '1px solid var(--color-accent-800)', borderRadius: 'var(--radius-lg)', padding: 14, marginBottom: 11 }}>
            <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-200)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="sparkle" weight="fill" size={12} />Analyse IA</div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--color-neutral-100)' }}>{an.resume}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 11 }}>
            <div style={{ display: 'flex', gap: 11, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 12 }}>
              <Icon name="flame" weight="fill" size={22} color="var(--color-warn)" style={{ flex: 'none' }} />
              <div><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 1 }}>Énergie dépensée</div><div style={{ fontSize: 12, color: 'var(--color-neutral-300)', lineHeight: 1.5 }}>{an.energie}</div></div>
            </div>
            <div style={{ display: 'flex', gap: 11, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 12 }}>
              <Icon name="barbell" weight="fill" size={22} color="var(--color-accent-200)" style={{ flex: 'none' }} />
              <div><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 1 }}>Tonus musculaire</div><div style={{ fontSize: 12, color: 'var(--color-neutral-300)', lineHeight: 1.5 }}>{an.tonus}</div></div>
            </div>
          </div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 13, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Progression vers l'objectif</span>
              <span style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-heading)', color: 'var(--color-accent-200)' }}>{an.progression}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--color-neutral-800)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${an.progression}%`, background: 'var(--color-accent)', borderRadius: 4, transition: 'width .5s ease' }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', lineHeight: 1.5 }}>{an.progressionTexte}</div>
          </div>
          <h6 style={{ color: 'var(--color-neutral-400)', marginBottom: 8 }}>À faire pour ton objectif</h6>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
            {an.aFaire.map((a) => (
              <div key={a} style={{ display: 'flex', gap: 9, fontSize: 12, lineHeight: 1.5, color: 'var(--color-neutral-200)' }}>
                <Icon name="arrow-circle-right" weight="fill" size={15} color="var(--color-accent-200)" style={{ flex: 'none', marginTop: 1 }} /><span>{a}</span>
              </div>
            ))}
          </div>
          <h6 style={{ color: 'var(--color-neutral-400)', marginBottom: 8 }}>À améliorer</h6>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
            {an.ameliorer.map((a) => (
              <div key={a} style={{ display: 'flex', gap: 9, fontSize: 12, lineHeight: 1.5, color: 'var(--color-neutral-200)' }}>
                <Icon name="wrench" weight="fill" size={15} color="var(--color-warn)" style={{ flex: 'none', marginTop: 1 }} /><span>{a}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--color-neutral-500)', lineHeight: 1.5, fontStyle: 'italic' }}>
            Estimation générée à partir de tes données — indicative, ne remplace pas l'avis d'un professionnel de santé.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '4px 0 10px' }}>
        <h6 style={{ color: 'var(--color-neutral-400)', margin: 0 }}>Séances d'aujourd'hui · {journalToday.length}</h6>
        {!addOpen && (
          <button type="button" onClick={() => setAddOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--color-accent-200)', fontSize: 11, cursor: 'pointer', padding: 0 }}>
            <Icon name="plus" size={13} />Ajouter une séance
          </button>
        )}
      </div>
      {addOpen && <SessionForm onClose={() => setAddOpen(false)} />}
      {journalToday.length === 0 && (
        <div className="empty-state" style={{ padding: '24px 10px', background: 'var(--color-surface)', border: '1px dashed var(--color-divider)', borderRadius: 'var(--radius-md)' }}>
          <Icon name="moon" size={24} style={{ display: 'block', margin: '0 auto 8px' }} />Aucune séance encore aujourd'hui.<br />Lance-toi depuis l'accueil !
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {journalToday.map((j) => (editId === j.id
          ? <SessionForm key={j.id} session={j} onClose={() => setEditId(null)} />
          : (
          <div key={j.id} style={{
            background: 'var(--color-surface)',
            border: `1px solid ${j.partial ? 'color-mix(in srgb,var(--color-warn) 34%,transparent)' : 'var(--color-divider)'}`,
            borderLeft: j.partial ? '3px solid var(--color-warn)' : undefined,
            borderRadius: 'var(--radius-md)', padding: 13,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: j.partial || j.manual ? 5 : 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{j.programNom}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{j.heure}</span>
                <IconCircleButton icon="pencil-simple" size={26} title="Modifier cette séance"
                  onClick={() => setEditId(j.id)} style={{ color: 'var(--color-neutral-500)' }} />
                <DeleteSessionButton id={j.id} />
              </div>
            </div>
            {/* Older entries predate the flag, so they simply read as complete. */}
            {j.partial && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--color-warn)', marginBottom: 8 }}>
                <Icon name="warning-circle" weight="fill" size={13} style={{ flex: 'none' }} />
                Séance partielle{j.exosTotal ? ` — arrêtée après ${j.exerciseIds.length} exercice${j.exerciseIds.length > 1 ? 's' : ''} sur ${j.exosTotal}` : ' — arrêtée en cours'}
              </div>
            )}
            {j.manual && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--color-neutral-400)', marginBottom: 8 }}>
                <Icon name="note-pencil" size={13} style={{ flex: 'none' }} />
                Ajoutée manuellement
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 9 }}>
              <Tag variant="neutral" icon="clock">{fmt(j.elapsedSec)}</Tag>
              <Tag variant="neutral" icon="flame">{j.kcal} kcal</Tag>
              {j.series > 0 && <Tag variant="neutral">{j.series} série{j.series > 1 ? 's' : ''}</Tag>}
            </div>
            {j.exerciseIds.length > 0 && (
              <>
                <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', lineHeight: 1.5 }}>{j.exerciseIds.map((id) => exById(id).nom).join(' · ')}</div>
                <div style={{ fontSize: 11, color: 'var(--color-accent-300)', marginTop: 4 }}>Muscles : {j.muscles.join(' · ')}</div>
              </>
            )}
          </div>
          )))}
      </div>

      <h6 style={{ color: 'var(--color-neutral-400)', marginBottom: 8 }}>Notes du jour</h6>
      <TextArea
        value={state.dayNotes[today] || ''}
        onChange={actions.setDayNote}
        placeholder="Ressenti, courbatures, sommeil…"
        style={{ marginBottom: 20 }}
      />
    </div>
  );
}
