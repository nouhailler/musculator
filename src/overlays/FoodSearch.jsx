import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/context.js';
import { MEALS, mealLabel } from '../data/nutrition.js';
import { fromOFF, groupByInitial, loadCiqual, manualFood, searchCache, searchCiqual } from '../lib/food.js';
import { productByBarcode, searchProducts } from '../lib/off.js';
import Icon from '../components/ui/Icon.jsx';
import Tag from '../components/ui/Tag.jsx';
import BarcodeScanner from '../components/BarcodeScanner.jsx';
import { Field, TextInput } from '../components/ui/Field.jsx';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button.jsx';

const SOURCE_LABEL = { off: 'Open Food Facts', ciqual: 'Table générique', perso: 'Perso' };

function FoodRow({ food, onPick, mine }) {
  const p = food.per100;
  return (
    <button type="button" onClick={() => onPick(food)} className="row-card" style={{ padding: 11 }}>
      {food.image
        ? <img src={food.image} alt="" style={{ width: 42, height: 42, flex: 'none', borderRadius: 8, objectFit: 'cover', background: 'var(--color-neutral-900)' }} />
        : (
          <div style={{ width: 42, height: 42, flex: 'none', borderRadius: 8, background: 'var(--color-accent-900)', display: 'grid', placeItems: 'center', color: 'var(--color-accent-200)' }}>
            <Icon name={food.source === 'ciqual' ? 'leaf' : 'barcode'} size={19} />
          </div>
        )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{food.nom}</div>
        <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>
          {food.marque || SOURCE_LABEL[food.source]}
          {/* Why this row is at the top of a search: it comes from the cache. */}
          {mine && <span style={{ color: 'var(--color-accent-300)' }}> · déjà utilisé</span>}
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-neutral-500)', marginTop: 2 }}>
          {p.kcal} kcal · P {p.proteines} · G {p.glucides} · L {p.lipides} /100 g
          {Object.keys(p.micros).length > 0 && ' · micros ✓'}
        </div>
      </div>
      <Icon name="caret-right" size={16} color="var(--color-neutral-500)" />
    </button>
  );
}

export default function FoodSearch() {
  const { state, actions } = useApp();
  const meal = state.nutriMeal;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [manual, setManual] = useState(null);

  useEffect(() => { loadCiqual().catch(() => {}); }, []);

  // Every food ever logged, whatever its source — what the app calls "les
  // aliments scannés". Shown in full at the bottom of the screen, and given
  // priority in search results.
  const cached = useMemo(() => Object.values(state.foodCache), [state.foodCache]);
  const groups = useMemo(() => groupByInitial(cached), [cached]);
  const [openLetter, setOpenLetter] = useState(null);

  // The user's own foods first, then the branded results, then the generics.
  // Deduplicated by id so a cached product is not repeated by the OFF answer
  // that re-fetched it.
  const ranked = (mine, rest) => {
    const seen = new Set();
    const out = [];
    for (const f of [...mine, ...rest]) {
      if (seen.has(f.id)) continue;
      seen.add(f.id);
      out.push(f);
    }
    return out;
  };

  // Offline-first: the cache and the bundled generic table answer instantly and
  // without a network, and Open Food Facts is layered on top when reachable.
  const runSearch = async (q) => {
    const term = (q ?? query).trim();
    if (term.length < 2) return;
    setError(''); setNotice(''); setManual(null);
    setLoading(true);
    const mine = searchCache(cached, term);
    const local = await searchCiqual(term);
    setResults(ranked(mine, local));
    try {
      const products = await searchProducts(term);
      const remote = products.map(fromOFF).filter((f) => f.per100.kcal > 0);
      // Branded results next — a search usually targets a specific product —
      // with the offline generics kept underneath rather than replaced.
      setResults(ranked(mine, [...remote, ...local]));
      if (!mine.length && !remote.length && !local.length) setNotice('Aucun résultat. Essaie un autre terme ou saisis l\'aliment à la main.');
    } catch (e) {
      setError(mine.length || local.length
        ? `${e.message} Résultats hors-ligne affichés.`
        : e.message);
    } finally {
      setLoading(false);
    }
  };

  const lookupBarcode = async (code) => {
    const c = (code || '').trim();
    if (!c) return;
    setScanning(false); setError(''); setNotice(''); setLoading(true); setManual(null);
    try {
      // Already scanned once → answer from cache, no network needed.
      const cached = Object.values(state.foodCache).find((f) => f.barcode === c);
      if (cached) {
        setResults([cached]); setNotice('Produit repris du cache hors-ligne.');
        return;
      }
      const product = await productByBarcode(c);
      if (!product) {
        setNotice(`Code ${c} inconnu d'Open Food Facts. Saisis l'aliment à la main.`);
        setResults([]);
        setManual({ nom: '', kcal: '', proteines: '', glucides: '', lipides: '' });
        return;
      }
      setResults([fromOFF(product)]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const pick = (food) => actions.patch({ view: 'foodEntry', foodPending: food });

  const saveManual = () => {
    const food = manualFood(manual);
    if (!food.per100.kcal && !food.per100.proteines) { setError('Renseigne au moins les calories ou les protéines.'); return; }
    pick(food);
  };

  return (
    <div className="overlay mscroll">
      <div className="overlay-header">
        <SecondaryButton icon="arrow-left" onClick={actions.closeOverlay} style={{ gap: 6 }}>Retour</SecondaryButton>
      </div>
      <div style={{ padding: '14px 18px 0' }}>
        <h3 style={{ margin: '0 0 2px' }}>Ajouter un aliment</h3>
        <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 14px' }}>
          {mealLabel(meal)} · {state.nutriDate}
        </p>

        {scanning && (
          <BarcodeScanner onDetected={lookupBarcode} onCancel={() => setScanning(false)} />
        )}

        <div style={{ display: 'flex', gap: 9, marginBottom: 12 }}>
          <SecondaryButton icon="barcode" onClick={() => setScanning((v) => !v)} style={{ flex: 1, padding: 11, justifyContent: 'center' }}>
            {scanning ? 'Arrêter le scan' : 'Scanner un code-barres'}
          </SecondaryButton>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            className="input" value={barcode} inputMode="numeric"
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookupBarcode(barcode)}
            placeholder="…ou saisis le code-barres"
            style={{ flex: 1 }}
          />
          <SecondaryButton icon="magnifying-glass" onClick={() => lookupBarcode(barcode)} style={{ padding: '0 14px' }}>OK</SecondaryButton>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input
            className="input" value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder="Rechercher un aliment…"
            style={{ flex: 1 }}
          />
          <SecondaryButton icon="magnifying-glass" onClick={() => runSearch()} style={{ padding: '0 14px' }}>OK</SecondaryButton>
        </div>

        {loading && <div style={{ fontSize: 12, color: 'var(--color-accent-300)', marginBottom: 10 }}>Recherche…</div>}
        {error && <div style={{ fontSize: 12, color: 'var(--color-warn)', marginBottom: 10, lineHeight: 1.5 }}>{error}</div>}
        {notice && <div style={{ fontSize: 12, color: 'var(--color-neutral-300)', marginBottom: 10, lineHeight: 1.5 }}>{notice}</div>}

        {results.length > 0 && (
          <>
            <div className="section-label">{results.length} résultat{results.length > 1 ? 's' : ''}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
              {results.map((f) => <FoodRow key={f.id} food={f} onPick={pick} mine={!!state.foodCache[f.id]} />)}
            </div>
          </>
        )}

        {/* Manual entry is always reachable, not only after a failed lookup:
            an unpackaged or home-made food has no barcode and no OFF entry. */}
        {!manual && (
          <SecondaryButton
            icon="note-pencil"
            onClick={() => setManual({ nom: '', kcal: '', proteines: '', glucides: '', lipides: '' })}
            style={{ width: '100%', padding: 11, justifyContent: 'center', marginBottom: 18 }}
          >
            Saisir un aliment à la main
          </SecondaryButton>
        )}

        {manual && (
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: 13, marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Aliment personnalisé (pour 100 g)</div>
            <Field label="Nom" style={{ marginBottom: 10 }}>
              <TextInput value={manual.nom} onChange={(v) => setManual({ ...manual, nom: v })} placeholder="ex. Gratin maison" />
            </Field>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {[['kcal', 'kcal'], ['proteines', 'Protéines'], ['glucides', 'Glucides'], ['lipides', 'Lipides']].map(([k, label]) => (
                <Field key={k} label={label} style={{ flex: 1 }}>
                  <TextInput type="number" value={manual[k]} onChange={(v) => setManual({ ...manual, [k]: v })} />
                </Field>
              ))}
            </div>
            <PrimaryButton icon="check" onClick={saveManual}>Continuer</PrimaryButton>
          </div>
        )}

        <div className="section-label">Repas</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {MEALS.map((m) => (
            <button key={m.key} type="button" onClick={() => actions.patch({ nutriMeal: m.key })}
              className={`pill${m.key === meal ? ' pill-on' : ''}`}>
              {m.label}
            </button>
          ))}
        </div>
        {/* Everything already logged, always reachable without searching for it
            again. A letter carrying a single food shows it directly; a crowded
            one folds into an accordion, since the cache only ever grows. */}
        {groups.length > 0 && (
          <>
            <div className="section-label">Mes aliments · {cached.length}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
              {groups.map((g) => (g.foods.length === 1
                ? <FoodRow key={g.letter} food={g.foods[0]} onPick={pick} mine />
                : (
                  <div key={g.letter}>
                    <button
                      type="button" onClick={() => setOpenLetter((l) => (l === g.letter ? null : g.letter))}
                      className="row-card" style={{ padding: 11 }}
                      aria-expanded={openLetter === g.letter}
                    >
                      <div className="icon-tile" style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 600 }}>
                        {g.letter}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{g.foods.length} aliments</div>
                        <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {g.foods.map((f) => f.nom).join(', ')}
                        </div>
                      </div>
                      <Icon name={openLetter === g.letter ? 'caret-up' : 'caret-down'} size={16} color="var(--color-neutral-500)" />
                    </button>
                    {openLetter === g.letter && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, margin: '7px 0 0 14px' }}>
                        {g.foods.map((f) => <FoodRow key={f.id} food={f} onPick={pick} mine />)}
                      </div>
                    )}
                  </div>
                )))}
            </div>
          </>
        )}

        <div style={{ height: 8 }} />
        <Tag variant="outline">Les aliments scannés restent utilisables hors-ligne</Tag>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
