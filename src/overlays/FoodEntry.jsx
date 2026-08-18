import { useState } from 'react';
import { useApp } from '../state/context.js';
import { MICROS, mealLabel } from '../data/nutrition.js';
import { scale } from '../lib/food.js';
import Icon from '../components/ui/Icon.jsx';
import Tag from '../components/ui/Tag.jsx';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button.jsx';
import Tip from '../components/Tip.jsx';

const NUTRISCORE_COLOR = { a: '#2e854a', b: '#5fd08a', c: '#f0c65e', d: '#f0a35e', e: '#e8654f' };
const QUICK = [50, 100, 150, 200, 250];

/** Quantity picker for a food chosen in the search overlay. */
export default function FoodEntry() {
  const { state, actions } = useApp();
  const food = state.foodPending;
  const [grammes, setGrammes] = useState(food?.portion || 100);
  if (!food) return null;

  const v = scale(food, grammes);
  const micros = MICROS.filter((m) => food.per100.micros[m.key] != null);

  const add = () => {
    actions.addFoodEntry(state.nutriMeal, food, grammes);
    actions.patch({ view: null, foodPending: null });
  };

  return (
    <div className="overlay mscroll">
      <div className="overlay-header">
        <SecondaryButton icon="arrow-left" onClick={() => actions.patch({ view: 'foodSearch', foodPending: null })} style={{ gap: 6 }}>Retour</SecondaryButton>
      </div>
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          {food.image && <img src={food.image} alt="" style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)', objectFit: 'cover', flex: 'none' }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: '0 0 3px', fontSize: 18 }}>{food.nom}</h3>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>{food.marque || '—'}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap' }}>
              {food.nutriScore && (
                <span className="tag" style={{ background: NUTRISCORE_COLOR[food.nutriScore] || 'var(--color-neutral-800)', color: '#11131c', fontWeight: 700 }}>
                  Nutri-Score {food.nutriScore.toUpperCase()}
                </span>
              )}
              <Tag variant="neutral">{mealLabel(state.nutriMeal)}</Tag>
            </div>
          </div>
        </div>

        <div className="section-label">Quantité</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <input
            className="input" type="number" inputMode="numeric" value={grammes}
            onChange={(e) => setGrammes(e.target.value)}
            style={{ flex: 1, fontSize: 20, textAlign: 'center' }}
          />
          <span style={{ fontSize: 14, color: 'var(--color-neutral-400)' }}>g</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
          {(food.portion ? [food.portion, ...QUICK] : QUICK).map((g, i) => (
            <button key={`${g}-${i}`} type="button" onClick={() => setGrammes(g)}
              className={`pill${Number(grammes) === g ? ' pill-on' : ''}`}>
              {food.portion === g && i === 0 ? `1 portion (${g} g)` : `${g} g`}
            </button>
          ))}
        </div>

        <div className="section-label">Pour {grammes || 0} g</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div className="stat-box"><div className="stat-value">{Math.round(v.kcal)}</div><div className="stat-label">kcal</div></div>
          <div className="stat-box"><div className="stat-value">{Math.round(v.proteines)}</div><div className="stat-label">prot. (g)</div></div>
          <div className="stat-box"><div className="stat-value">{Math.round(v.glucides)}</div><div className="stat-label">gluc. (g)</div></div>
          <div className="stat-box"><div className="stat-value">{Math.round(v.lipides)}</div><div className="stat-label">lip. (g)</div></div>
        </div>

        {micros.length > 0 ? (
          <>
            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              Micronutriments apportés<Tip id="micros" size={12} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
              {micros.map((m) => (
                <div key={m.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-neutral-300)' }}>
                  <span>{m.label}</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {Math.round((v.micros[m.key] || 0) * 10) / 10} {m.unit}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 9, fontSize: 11, color: 'var(--color-neutral-400)', lineHeight: 1.5, marginBottom: 18 }}>
            <Icon name="info" size={14} style={{ flex: 'none', marginTop: 1 }} />
            <span>
              Aucun micronutriment renseigné pour cet aliment — fréquent sur les produits de marque.
              Il ne pénalisera pas ton score, il n'y contribuera simplement pas.
            </span>
          </div>
        )}

        <PrimaryButton icon="plus-circle" size="lg" onClick={add}>
          Ajouter au {mealLabel(state.nutriMeal).toLowerCase()}
        </PrimaryButton>
        <div style={{ height: 28 }} />
      </div>
    </div>
  );
}
