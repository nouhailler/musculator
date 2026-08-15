import { useEffect, useRef, useState } from 'react';
import { useApp } from '../state/context.js';
import { SOURCES } from '../data/activity.js';
import { dayActivity, paceKmh, paceLabel, poidsOf, trackStep, walkKcal } from '../lib/activity.js';
import { parseActivityFile } from '../lib/importActivity.js';
import { dateKey, fmt, nowHM } from '../lib/format.js';
import Icon from '../components/ui/Icon.jsx';
import Tag from '../components/ui/Tag.jsx';
import { Field } from '../components/ui/Field.jsx';
import { PrimaryButton, SecondaryButton, IconCircleButton } from '../components/ui/Button.jsx';

const km1 = (n) => (Math.round(n * 100) / 100).toLocaleString('fr-FR', { maximumFractionDigits: 2 });

/**
 * Live GPS walk. The browser is the only pedometer a backend-less PWA can
 * reach, and only while it is open — which is why this is a deliberate
 * "suivre ma marche" mode rather than a background step count the app cannot
 * honestly promise.
 */
function Tracker({ poids, onSave, onCancel }) {
  const [metres, setMetres] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');
  const [fixes, setFixes] = useState(0);
  const anchor = useRef(null);
  const watchId = useRef(null);
  const wakeLock = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Ce navigateur n'expose pas la géolocalisation.");
      return undefined;
    }
    if (!window.isSecureContext) {
      setError('La géolocalisation exige une connexion sécurisée (HTTPS).');
      return undefined;
    }
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const fix = { lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy };
        // A fix arriving is the answer to whatever went wrong before: losing
        // the signal for a moment must not leave a warning on screen for the
        // rest of the walk.
        setError('');
        setFixes((n) => n + 1);
        const step = trackStep(anchor.current, fix);
        anchor.current = step.anchor;
        if (step.metres > 0) setMetres((m) => m + step.metres);
      },
      (e) => setError(e.code === 1
        ? "Accès à la position refusé — autorise-le pour suivre la marche, ou saisis la distance à la main."
        : "Position indisponible pour l'instant."),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    );
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    // Best effort: a walk with the screen going dark stops receiving fixes.
    navigator.wakeLock?.request('screen').then((l) => { wakeLock.current = l; }).catch(() => {});
    return () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current);
      clearInterval(id);
      wakeLock.current?.release?.().catch(() => {});
    };
  }, []);

  const km = metres / 1000;
  const minutes = seconds / 60;
  // Pace needs a while to mean anything: over the first seconds a single fix
  // reads as a sprint, and showing "720 km/h" would just look broken.
  const kmh = seconds >= 60 && metres >= 100 ? paceKmh({ km, minutes }) : null;
  const kcal = walkKcal({ km, poids });

  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ background: 'linear-gradient(135deg,var(--color-accent-900),var(--color-surface))', border: '1px solid var(--color-accent-800)', borderRadius: 'var(--radius-lg)', padding: 18, textAlign: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-200)', marginBottom: 8 }}>
          Marche en cours
        </div>
        <div style={{ fontSize: 46, fontWeight: 600, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
          {km1(km)}<span style={{ fontSize: 18, color: 'var(--color-neutral-400)' }}> km</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 12, fontSize: 12, color: 'var(--color-neutral-300)' }}>
          <span><Icon name="timer" size={13} /> {fmt(seconds)}</span>
          <span><Icon name="flame" size={13} /> {kcal} kcal</span>
          {kmh > 0 && <span><Icon name="person-simple-walk" size={13} /> {kmh.toFixed(1)} km/h</span>}
        </div>
      </div>

      {error
        ? <div style={{ fontSize: 12, color: 'var(--color-warn)', lineHeight: 1.5, marginBottom: 12 }}>{error}</div>
        : (
          <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', textAlign: 'center', marginBottom: 12, lineHeight: 1.5 }}>
            {fixes === 0
              ? 'Recherche du signal GPS…'
              : `${fixes} point${fixes > 1 ? 's' : ''} reçu${fixes > 1 ? 's' : ''}. Garde l'écran allumé : la position n'arrive pas en arrière-plan.`}
          </div>
        )}

      <div style={{ display: 'flex', gap: 8 }}>
        <SecondaryButton onClick={onCancel} style={{ flex: 1, justifyContent: 'center', padding: 12 }}>Abandonner</SecondaryButton>
        <PrimaryButton
          icon="check-circle" onClick={() => onSave({ km, minutes: Math.round(minutes) })}
          disabled={metres <= 0} style={{ flex: 1 }}
        >
          Terminer
        </PrimaryButton>
      </div>
    </div>
  );
}

/** Manual entry, live tracking and file import for walking. */
export default function Activity() {
  const { state, actions } = useApp();
  const poids = poidsOf(state.profile);
  const [jour, setJour] = useState(dateKey());
  const [km, setKm] = useState('');
  const [minutes, setMinutes] = useState('');
  const [heure, setHeure] = useState(nowHM());
  const [mode, setMode] = useState('form');
  const [imported, setImported] = useState(null);
  const [error, setError] = useState('');

  const day = dayActivity(state.activityLog, jour, state.profile);
  const previewKcal = walkKcal({ km, minutes, poids });

  const addManual = () => {
    if (!(Number(km) > 0) && !(Number(minutes) > 0)) {
      setError('Renseigne au moins une distance ou une durée.');
      return;
    }
    setError('');
    actions.addActivity({ km, minutes, heure, source: 'manuel' }, jour);
    setKm(''); setMinutes('');
  };

  const saveTracked = ({ km: trackedKm, minutes: trackedMin }) => {
    actions.addActivity({ km: trackedKm, minutes: trackedMin, heure: nowHM(), source: 'gps' }, dateKey());
    setJour(dateKey());
    setMode('form');
  };

  const readFile = (file) => {
    setError(''); setImported(null);
    file.text().then((text) => {
      try {
        setImported(parseActivityFile(text, file.name));
      } catch (e) {
        setError(e.message || 'Fichier illisible.');
      }
    });
  };

  return (
    <div className="overlay mscroll">
      <div className="overlay-header">
        <SecondaryButton icon="arrow-left" onClick={actions.closeOverlay} style={{ gap: 6 }}>Retour</SecondaryButton>
      </div>
      <div style={{ padding: '14px 18px 0' }}>
        <h3 style={{ margin: '0 0 2px' }}>Marche</h3>
        <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 14px', lineHeight: 1.55 }}>
          Les kilomètres parcourus comptent dans ta dépense du jour, au même titre qu'une séance.
          L'estimation est nette et tient compte de ton poids ({poids} kg).
        </p>

        {mode === 'gps' ? (
          <Tracker poids={poids} onSave={saveTracked} onCancel={() => setMode('form')} />
        ) : (
          <>
            <PrimaryButton icon="person-simple-walk" onClick={() => setMode('gps')} style={{ marginBottom: 14 }}>
              Suivre ma marche (GPS)
            </PrimaryButton>

            <div className="section-label">Saisie manuelle</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <Field label="Distance (km)" style={{ flex: 1 }}>
                <input className="input" type="number" inputMode="decimal" step="0.1" value={km}
                  onChange={(e) => setKm(e.target.value)} placeholder="6" style={{ textAlign: 'center' }} />
              </Field>
              <Field label="Durée (min)" style={{ flex: 1 }}>
                <input className="input" type="number" inputMode="numeric" value={minutes}
                  onChange={(e) => setMinutes(e.target.value)} placeholder="70" style={{ textAlign: 'center' }} />
              </Field>
              <Field label="Heure" style={{ flex: 1 }}>
                <input className="input" type="time" value={heure} onChange={(e) => setHeure(e.target.value)} />
              </Field>
            </div>
            <Field label="Jour" style={{ marginBottom: 10 }}>
              <input className="input" type="date" value={jour} max={dateKey()} onChange={(e) => setJour(e.target.value)} />
            </Field>
            {(Number(km) > 0 || Number(minutes) > 0) && (
              <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', marginBottom: 10, lineHeight: 1.5 }}>
                ≈ {previewKcal} kcal
                {Number(km) > 0
                  ? ` (0,5 kcal × ${poids} kg × ${km1(Number(km))} km)`
                  : ' estimées depuis la durée, à allure normale'}
                {paceKmh({ km, minutes }) ? ` · allure ${paceKmh({ km, minutes }).toFixed(1)} km/h (${paceLabel(paceKmh({ km, minutes }))})` : ''}
              </div>
            )}
            {error && <div style={{ fontSize: 12, color: 'var(--color-warn)', marginBottom: 10 }}>{error}</div>}
            <PrimaryButton icon="plus-circle" onClick={addManual} style={{ marginBottom: 18 }}>Ajouter</PrimaryButton>

            <div className="section-label">Importer un fichier</div>
            <p style={{ fontSize: 11, color: 'var(--color-neutral-400)', margin: '0 0 8px', lineHeight: 1.5 }}>
              Une trace GPX, ou un export CSV d'activités (Strava, Apple Santé, Google Fit).
              Les jours déjà renseignés sont complétés, jamais remplacés.
            </p>
            <label htmlFor="activity-file"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer',
                padding: 11, borderRadius: 'var(--radius-md)', background: 'var(--color-surface)',
                border: '1px solid var(--color-divider)', color: 'var(--color-text)', fontSize: 13, marginBottom: 10 }}
            >
              <Icon name="arrow-fat-lines-down" size={16} />Choisir un fichier GPX ou CSV
            </label>
            <input id="activity-file" type="file" accept=".gpx,.csv,text/csv,application/gpx+xml,application/xml"
              style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = ''; }}
            />
            {imported && (
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 12, marginBottom: 8 }}>
                  {imported.count} activité{imported.count > 1 ? 's' : ''} sur {imported.days} jour{imported.days > 1 ? 's' : ''}
                  {imported.skipped ? ` · ${imported.skipped} ligne${imported.skipped > 1 ? 's' : ''} ignorée${imported.skipped > 1 ? 's' : ''}` : ''}.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 10 }}>
                  {Object.entries(imported.log).sort().slice(0, 6).map(([d, list]) => (
                    <div key={d} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-neutral-300)' }}>
                      <span>{d}</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {km1(list.reduce((a, e) => a + e.km, 0))} km · {list.reduce((a, e) => a + walkKcal({ km: e.km, minutes: e.minutes, poids }), 0)} kcal
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <SecondaryButton onClick={() => setImported(null)} style={{ flex: 1, justifyContent: 'center' }}>Annuler</SecondaryButton>
                  <PrimaryButton icon="check" onClick={() => { actions.importActivity(imported.log); setImported(null); }} style={{ flex: 1 }}>
                    Importer
                  </PrimaryButton>
                </div>
              </div>
            )}

            <div className="section-label">
              {jour === dateKey() ? "Aujourd'hui" : jour} · {km1(day.km)} km · {day.kcal} kcal
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 18 }}>
              {day.entries.map((e) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: '9px 11px' }}>
                  <div className="icon-tile" style={{ width: 32, height: 32 }}>
                    <Icon name="person-simple-walk" size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>
                      {e.km > 0 ? `${km1(e.km)} km` : `${e.minutes} min`}
                      {e.km > 0 && e.minutes > 0 && <span style={{ color: 'var(--color-neutral-400)', fontWeight: 400 }}> · {e.minutes} min</span>}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-neutral-500)' }}>
                      {SOURCES[e.source] || e.source}{e.heure ? ` · ${e.heure}` : ''}{e.note ? ` · ${e.note}` : ''}
                      {' · '}{walkKcal({ km: e.km, minutes: e.minutes, poids })} kcal
                    </div>
                  </div>
                  <IconCircleButton icon="trash" size={26} title="Supprimer"
                    onClick={() => actions.deleteActivity(e.id, jour)} style={{ color: 'var(--color-neutral-500)' }} />
                </div>
              ))}
              {day.entries.length === 0 && <div className="empty-state" style={{ padding: '16px 0' }}>Rien de consigné ce jour-là.</div>}
            </div>

            <Tag variant="outline">La marche n'entre pas dans ta cible calorique, elle s'affiche à côté</Tag>
            <div style={{ height: 28 }} />
          </>
        )}
      </div>
    </div>
  );
}
