import { useMemo } from 'react';
import { useApp } from '../state/context.js';
import { MEALS } from '../data/nutrition.js';
import { dailyTargets, totals } from '../lib/macros.js';
import { dailyScore } from '../lib/dailyScore.js';
import { scale } from '../lib/food.js';
import { dateKey } from '../lib/format.js';
import Icon from '../components/ui/Icon.jsx';
import { SecondaryButton } from '../components/ui/Button.jsx';

const shiftDate = (key, days) => {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return dateKey(dt);
};

const dayLabel = (key) => {
  const today = dateKey();
  if (key === today) return "Aujourd'hui";
  if (key === shiftDate(today, -1)) return 'Hier';
  const [y, m, d] = key.split('-').map(Number);
  try {
    return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
  } catch { return key; }
};

function Bar({ label, value, target, unit, color }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  const over = target > 0 && value > target * 1.1;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: 'var(--color-neutral-300)' }}>{label}</span>
        <span style={{ color: over ? '#f0a35e' : 'var(--color-neutral-400)', fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(value)} / {target} {unit}
        </span>
      </div>
      <div style={{ height: 7, background: 'var(--color-neutral-800)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: over ? '#f0a35e' : color, borderRadius: 4, transition: 'width .35s ease' }} />
      </div>
    </div>
  );
}

/** Score gauge — a ring, so it reads at a glance next to the training rings. */
function Gauge({ score, vide }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const pct = vide ? 0 : score / 100;
  const stroke = score >= 75 ? '#5fd08a' : score >= 45 ? 'var(--color-accent)' : '#f0a35e';
  return (
    <div style={{ position: 'relative', width: 132, height: 132, flex: 'none' }}>
      <svg width="132" height="132" viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={R} fill="none" stroke="var(--color-neutral-800)" strokeWidth="10" />
        <circle
          cx="66" cy="66" r={R} fill="none" stroke={stroke} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
          transform="rotate(-90 66 66)" style={{ transition: 'stroke-dashoffset .5s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 30, fontWeight: 600, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
            {vide ? '—' : score}
          </div>
          <div style={{ fontSize: 10, color: 'var(--color-neutral-500)', letterSpacing: '.08em' }}>/ 100</div>
        </div>
      </div>
    </div>
  );
}

export default function Nutrition() {
  const { state, actions } = useApp();
  const logged = state.nutriLog[state.nutriDate];
  const day = useMemo(() => logged || {}, [logged]);

  const entries = useMemo(() => MEALS.flatMap((m) => (day[m.key] || [])), [day]);
  const targets = useMemo(() => dailyTargets(state.profile), [state.profile]);
  const score = useMemo(() => dailyScore(entries, targets), [entries, targets]);
  const t = useMemo(() => totals(entries), [entries]);

  const yesterday = shiftDate(state.nutriDate, -1);

  return (
    <div className="screen mscroll">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Nutrition</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button type="button" onClick={() => actions.setNutriDate(shiftDate(state.nutriDate, -1))}
            style={{ background: 'none', border: 'none', color: 'var(--color-neutral-300)', cursor: 'pointer', padding: 6, display: 'grid', placeItems: 'center' }}>
            <Icon name="caret-left" size={18} />
          </button>
          <span style={{ fontSize: 12, color: 'var(--color-neutral-300)', textTransform: 'capitalize', minWidth: 90, textAlign: 'center' }}>
            {dayLabel(state.nutriDate)}
          </span>
          <button type="button" disabled={state.nutriDate >= dateKey()}
            onClick={() => actions.setNutriDate(shiftDate(state.nutriDate, 1))}
            style={{ background: 'none', border: 'none', color: state.nutriDate >= dateKey() ? 'var(--color-neutral-700)' : 'var(--color-neutral-300)', cursor: state.nutriDate >= dateKey() ? 'default' : 'pointer', padding: 6, display: 'grid', placeItems: 'center' }}>
            <Icon name="caret-right" size={18} />
          </button>
        </div>
      </div>

      {/* --- Score Musculation Quotidien --- */}
      <div style={{ background: 'linear-gradient(135deg,var(--color-accent-900),var(--color-surface))', border: '1px solid var(--color-accent-800)', borderRadius: 'var(--radius-lg)', padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-200)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="target" weight="fill" size={12} />Score musculation quotidien
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
          <Gauge score={score.score} vide={score.vide} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {score.vide
              ? <div style={{ fontSize: 12, color: 'var(--color-neutral-300)', lineHeight: 1.55 }}>Rien de consigné pour ce jour. Ajoute un aliment pour lancer le calcul.</div>
              : <div style={{ fontSize: 12, color: 'var(--color-neutral-100)', lineHeight: 1.55 }}>{score.resume}</div>}
            {score.sur < 100 && !score.vide && (
              <div style={{ fontSize: 10, color: 'var(--color-neutral-500)', marginTop: 6, lineHeight: 1.45 }}>
                Noté sur {score.sur} pts : les micronutriments ne sont pas assez renseignés pour être jugés.
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {score.composantes.map((c) => (
            <div key={c.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: c.evaluee ? 'var(--color-neutral-200)' : 'var(--color-neutral-500)' }}>{c.label}</span>
                <span style={{ color: 'var(--color-neutral-400)', fontVariantNumeric: 'tabular-nums' }}>
                  {c.evaluee ? `${c.points} / ${c.max} pts` : 'non évalué'} · {c.detail}
                </span>
              </div>
              <div style={{ height: 5, background: 'var(--color-neutral-800)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${c.evaluee ? Math.min(100, c.part * 100) : 0}%`, background: 'var(--color-accent)', borderRadius: 3, transition: 'width .35s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Macros vs objectif --- */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: 13, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Consommé vs objectif</span>
          <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{targets.goal.label}</span>
        </div>
        <Bar label="Calories" value={t.kcal} target={targets.kcal} unit="kcal" color="var(--color-accent)" />
        <Bar label="Protéines" value={t.proteines} target={targets.proteines} unit="g" color="#5fd08a" />
        <Bar label="Glucides" value={t.glucides} target={targets.glucides} unit="g" color="var(--color-accent-400)" />
        <Bar label="Lipides" value={t.lipides} target={targets.lipides} unit="g" color="#f0a35e" />
        {targets.estime && (
          <div style={{ fontSize: 10, color: '#f0a35e', marginTop: 8, lineHeight: 1.45 }}>
            Objectifs par défaut : complète poids, taille et âge dans ton profil pour un calcul personnalisé.
          </div>
        )}
      </div>

      {/* --- Repas --- */}
      {MEALS.map((m) => {
        const list = day[m.key] || [];
        const mt = totals(list);
        const canDuplicate = (state.nutriLog[yesterday]?.[m.key] || []).length > 0;
        return (
          <div key={m.key} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 7 }}>
              <h6 style={{ margin: 0, color: 'var(--color-accent-200)' }}>{m.label}</h6>
              <span style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>
                {list.length ? `${mt.kcal} kcal · P ${mt.proteines} g` : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {list.map((e) => {
                const v = scale(e.food, e.grammes);
                return (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: '9px 11px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{e.food.nom}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-neutral-500)' }}>
                        {e.grammes} g · {Math.round(v.kcal)} kcal · P {Math.round(v.proteines)} g
                      </div>
                    </div>
                    <input
                      className="input" type="number" inputMode="numeric" value={e.grammes}
                      onChange={(ev) => actions.updateFoodEntry(m.key, e.id, ev.target.value)}
                      style={{ width: 66, padding: '6px 8px', fontSize: 12, textAlign: 'center' }}
                      aria-label={`Quantité pour ${e.food.nom}`}
                    />
                    <button type="button" onClick={() => actions.removeFoodEntry(m.key, e.id)}
                      title="Supprimer"
                      style={{ background: 'none', border: 'none', color: 'var(--color-neutral-500)', cursor: 'pointer', padding: 4, display: 'grid', placeItems: 'center' }}>
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: 8 }}>
                <SecondaryButton icon="plus" onClick={() => actions.openFoodSearch(m.key)} style={{ flex: 1, padding: 9, justifyContent: 'center', fontSize: 12 }}>
                  Ajouter
                </SecondaryButton>
                {canDuplicate && (
                  <SecondaryButton icon="copy" onClick={() => actions.duplicateMeal(m.key, yesterday)} style={{ padding: '9px 12px', fontSize: 12 }}>
                    Copier d'hier
                  </SecondaryButton>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ height: 12 }} />
    </div>
  );
}
