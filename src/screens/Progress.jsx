import { useMemo, useRef, useState } from 'react';
import { useApp, useDerived } from '../state/context.js';
import { fmt, relativeDayLabel, shortMin } from '../lib/format.js';
import { kcalBreakdown, timeBreakdown } from '../lib/sessionStats.js';
import Icon from '../components/ui/Icon.jsx';
import { IconCircleButton, PrimaryButton } from '../components/ui/Button.jsx';
import SessionForm, { DeleteSessionButton } from '../components/SessionForm.jsx';

// Rolling 7-day windows, so the labels are derived from how many the chart
// actually got rather than from a list that has to be kept in step with it.
const weekLabel = (i, len) => (i === len - 1 ? 'Cette sem.' : `S-${len - 1 - i}`);

const TON_COLOR = { ok: 'var(--color-good)', attention: 'var(--color-warn)', info: 'var(--color-accent-200)' };
const TON_ICON = { ok: 'check-circle', attention: 'warning-circle', info: 'info' };

/** A tile that opens a detail panel or jumps somewhere — hence a real button. */
function StatTile({ icon, iconColor, label, value, sub, onClick, active, title }) {
  return (
    <button
      type="button" onClick={onClick} title={title}
      style={{
        flex: 1, minWidth: 0, textAlign: 'left', cursor: 'pointer', font: 'inherit',
        background: 'var(--color-surface)', padding: 13,
        border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-divider)'}`,
        borderRadius: 'var(--radius-md)', color: 'var(--color-text)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--color-neutral-400)' }}>
          <Icon name={icon} weight="fill" size={14} color={iconColor} />{label}
        </span>
        <Icon name={active ? 'caret-up' : 'caret-down'} size={12} color="var(--color-neutral-500)" />
      </div>
      <div style={{ fontSize: 19, fontWeight: 600, fontFamily: 'var(--font-heading)', marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--color-neutral-500)', marginTop: 2 }}>{sub}</div>}
    </button>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 12, padding: '5px 0' }}>
      <span style={{ color: 'var(--color-neutral-400)' }}>{label}</span>
      <span style={{ color: 'var(--color-neutral-100)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function Panel({ children }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 13, marginBottom: 20, animation: 'mFade .25s ease' }}>
      {children}
    </div>
  );
}

export default function Progress() {
  const { state, actions } = useApp();
  const { streak, totalSessions, badges, history, weekly, weeklySessions } = useDerived();
  // The Journal only reaches today; this list is where a past session is
  // corrected or removed.
  const [editId, setEditId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [week, setWeek] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const historyRef = useRef(null);

  const maxWeek = Math.max(1, ...weekly);
  const allTimeSec = state.sessionLog.reduce((a, s) => a + s.elapsedSec, 0);
  const allTimeKcal = state.sessionLog.reduce((a, s) => a + s.kcal, 0);
  const temps = useMemo(() => timeBreakdown(state.sessionLog), [state.sessionLog]);
  const calories = useMemo(() => kcalBreakdown(state.sessionLog), [state.sessionLog]);
  const an = state.progressAnalysis;

  // The history is what every other zone points at, so reaching it is one
  // function: pick what to show, then bring it into view.
  const showHistory = (weekIndex = null, all = false) => {
    setWeek(weekIndex);
    setShowAll(all);
    setEditId(null);
    requestAnimationFrame(() => historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const listed = week != null ? weeklySessions[week] : (showAll ? state.sessionLog : history);
  const reste = state.sessionLog.length - listed.length;

  return (
    <div className="screen mscroll">
      <h3 style={{ margin: '0 0 16px' }}>Progrès</h3>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 13 }}>
          <Icon name="fire" weight="fill" size={20} color="var(--color-warn)" />
          <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-heading)', marginTop: 4 }}>{streak}</div>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>jours consécutifs</div>
        </div>
        <button
          type="button" onClick={() => showHistory(null, true)}
          title="Voir toutes les séances"
          style={{ flex: 1, textAlign: 'left', font: 'inherit', cursor: 'pointer', color: 'var(--color-text)',
            background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 13 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Icon name="check-circle" weight="fill" size={20} color="var(--color-accent)" />
            <Icon name="arrow-circle-right" size={15} color="var(--color-neutral-500)" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-heading)', marginTop: 4 }}>{totalSessions}</div>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>séances au total</div>
        </button>
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Séances par semaine</span>
          <span style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{weekly.length} dernières</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: 96 }}>
          {weekly.map((count, i) => {
            const on = week === i;
            return (
              <button
                key={i} type="button"
                onClick={() => showHistory(on ? null : i, false)}
                title={`${count} séance${count > 1 ? 's' : ''} — ${weekLabel(i, weekly.length)}`}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%',
                  justifyContent: 'flex-end', background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }}
              >
                <span style={{ fontSize: 10, color: count ? 'var(--color-neutral-400)' : 'transparent' }}>{count}</span>
                <div style={{
                  width: '100%', height: `${Math.max(4, (count / maxWeek) * 100)}%`,
                  background: on ? 'var(--color-accent-300)' : i === weekly.length - 1 ? 'var(--color-accent)' : 'var(--color-accent-700)',
                  outline: on ? '2px solid var(--color-accent-200)' : 'none', outlineOffset: 1,
                  borderRadius: '5px 5px 0 0', transformOrigin: 'bottom', animation: `mRise .5s ease ${i * 0.05}s both`,
                }} />
                <span style={{ fontSize: 10, color: on || i === weekly.length - 1 ? 'var(--color-accent-200)' : 'var(--color-neutral-500)' }}>
                  {weekLabel(i, weekly.length)}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-neutral-500)', textAlign: 'center', marginTop: 8 }}>
          Touche une barre pour voir les séances de cette semaine.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: detail ? 10 : 20 }}>
        <StatTile
          icon="clock" label="Temps total" value={fmt(allTimeSec)}
          sub={temps.seances ? `${shortMin(Math.round(temps.moyenneSec / 60))} en moyenne` : null}
          active={detail === 'temps'} title="Voir le détail du temps"
          onClick={() => setDetail(detail === 'temps' ? null : 'temps')}
        />
        <StatTile
          icon="flame" label="Calories" value={`${allTimeKcal} kcal`}
          sub={calories.seances ? `${calories.moyenne} kcal par séance` : null}
          active={detail === 'calories'} title="Voir le détail des calories"
          onClick={() => setDetail(detail === 'calories' ? null : 'calories')}
        />
      </div>

      {detail === 'temps' && (
        <Panel>
          <DetailRow label="Séances enregistrées" value={temps.seances} />
          <DetailRow label="Durée moyenne" value={fmt(temps.moyenneSec)} />
          <DetailRow label={`Sur ${temps.recentDays} jours`} value={fmt(temps.recentSec)} />
          {temps.longest && (
            <DetailRow
              label="Plus longue séance"
              value={`${fmt(temps.longest.elapsedSec)} · ${temps.longest.programNom} (${relativeDayLabel(temps.longest.dateKey)})`}
            />
          )}
          {temps.programmes.length > 0 && (
            <>
              <div className="section-label" style={{ marginTop: 10 }}>Répartition par programme</div>
              {temps.programmes.map((p) => (
                <div key={p.nom} style={{ marginBottom: 7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: 'var(--color-neutral-200)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</span>
                    <span style={{ color: 'var(--color-neutral-500)', flex: 'none' }}>{fmt(p.sec)} · {p.seances} séance{p.seances > 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--color-neutral-800)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round((p.sec / Math.max(1, temps.totalSec)) * 100)}%`, background: 'var(--color-accent)', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </>
          )}
        </Panel>
      )}

      {detail === 'calories' && (
        <Panel>
          <DetailRow label="Par séance" value={`${calories.moyenne} kcal`} />
          <DetailRow label="Par jour d'entraînement" value={`${calories.parJour} kcal sur ${calories.jours} jour${calories.jours > 1 ? 's' : ''}`} />
          <DetailRow label={`Sur ${calories.recentDays} jours`} value={`${calories.recent} kcal`} />
          {calories.meilleurJour && (
            <DetailRow label="Meilleure journée" value={`${calories.meilleurJour.kcal} kcal · ${relativeDayLabel(calories.meilleurJour.dateKey)}`} />
          )}
          <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--color-neutral-500)', lineHeight: 1.5, marginTop: 8 }}>
            <Icon name="info" size={13} style={{ flex: 'none', marginTop: 1 }} />
            <span>
              Estimation à {calories.kcalParMin} kcal/min de séance, indépendante de ton poids et de l'intensité réelle.
            </span>
          </div>
        </Panel>
      )}

      {/* --- Analyse IA des progrès --- */}
      <h5 style={{ margin: '0 0 4px' }}>Analyse IA de mes progrès</h5>
      <p style={{ fontSize: 11, color: 'var(--color-neutral-400)', margin: '0 0 10px', lineHeight: 1.5 }}>
        Confronte tes 4 dernières semaines à ce que tu as déclaré vouloir : objectif principal,
        zones prioritaires, objectif et cibles nutritionnels, contraintes.
      </p>
      <PrimaryButton
        icon={state.progressLoading ? 'circle-notch' : 'chart-line-up'}
        iconWeight={state.progressLoading ? 'regular' : 'fill'}
        onClick={actions.runProgressAnalysis}
        disabled={state.progressLoading}
        style={{ marginBottom: 8 }}
      >
        {state.progressLoading ? 'Analyse en cours…' : an ? 'Relancer l\'analyse' : 'Analyser mes progrès'}
      </PrimaryButton>
      {state.progressError && (
        <div style={{ fontSize: 12, color: 'var(--color-warn)', textAlign: 'center', marginBottom: 10, lineHeight: 1.5 }}>{state.progressError}</div>
      )}

      {an && (
        <div style={{ margin: '6px 0 22px', animation: 'mFade .35s ease' }}>
          <div style={{ background: 'linear-gradient(135deg,var(--color-accent-900),var(--color-surface))', border: '1px solid var(--color-accent-800)', borderRadius: 'var(--radius-lg)', padding: 14, marginBottom: 11 }}>
            <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-200)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="chart-line-up" weight="fill" size={12} />
              Analyse des progrès
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--color-neutral-100)' }}>{an.resume}</div>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 13, marginBottom: 11 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Adéquation avec tes objectifs</span>
              <span style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-heading)', color: 'var(--color-accent-200)' }}>{an.progression}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--color-neutral-800)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${an.progression}%`, background: 'var(--color-accent)', borderRadius: 4, transition: 'width .5s ease' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 12 }}>
            {an.points.map((pt) => (
              <div key={pt.key} style={{ display: 'flex', gap: 10, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 12 }}>
                <Icon name={TON_ICON[pt.ton]} weight="fill" size={18} color={TON_COLOR[pt.ton]} style={{ flex: 'none', marginTop: 1 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{pt.titre}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-neutral-300)', lineHeight: 1.5 }}>{pt.texte}</div>
                </div>
              </div>
            ))}
          </div>

          {an.aFaire.length > 0 && (
            <>
              <h6 style={{ color: 'var(--color-neutral-400)', marginBottom: 8 }}>À faire</h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
                {an.aFaire.map((a) => (
                  <div key={a} style={{ display: 'flex', gap: 9, fontSize: 12, lineHeight: 1.5, color: 'var(--color-neutral-200)' }}>
                    <Icon name="arrow-circle-right" weight="fill" size={15} color="var(--color-accent-200)" style={{ flex: 'none', marginTop: 1 }} /><span>{a}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {an.ameliorer.length > 0 && (
            <>
              <h6 style={{ color: 'var(--color-neutral-400)', marginBottom: 8 }}>À améliorer</h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
                {an.ameliorer.map((a) => (
                  <div key={a} style={{ display: 'flex', gap: 9, fontSize: 12, lineHeight: 1.5, color: 'var(--color-neutral-200)' }}>
                    <Icon name="wrench" weight="fill" size={15} color="var(--color-warn)" style={{ flex: 'none', marginTop: 1 }} /><span>{a}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          <div style={{ fontSize: 10, color: 'var(--color-neutral-500)', lineHeight: 1.5, fontStyle: 'italic' }}>
            {state.progressSource === 'openrouter'
              ? `Rédigée par ${state.openrouter.model} à partir de tes données.`
              : 'Calculée sur cet appareil à partir de tes données, sans réseau.'}
            {' '}Indicative, elle ne remplace pas l'avis d'un professionnel de santé.
          </div>
        </div>
      )}

      <h5 style={{ margin: '0 0 10px' }}>Badges</h5>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 22 }}>
        {badges.map((b) => (
          <div key={b.id} style={{ textAlign: 'center', opacity: b.unlocked ? 1 : 0.4 }}>
            <div style={{
              width: 50, height: 50, margin: '0 auto 5px', borderRadius: 14, display: 'grid', placeItems: 'center',
              background: b.unlocked ? 'var(--color-accent-800)' : 'var(--color-neutral-900)',
              border: `1px solid ${b.unlocked ? 'var(--color-accent)' : 'var(--color-divider)'}`,
              color: b.unlocked ? 'var(--color-accent-100)' : 'var(--color-neutral-600)',
            }}>
              <Icon name={b.icon} weight="fill" size={24} />
            </div>
            <div style={{ fontSize: 10, lineHeight: 1.2, color: 'var(--color-neutral-300)' }}>{b.nom}</div>
          </div>
        ))}
      </div>

      <div ref={historyRef} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, margin: '0 0 10px', scrollMarginTop: 60 }}>
        <h5 style={{ margin: 0 }}>
          {week != null ? `Séances · ${weekLabel(week, weekly.length)}` : 'Historique des séances'}
        </h5>
        {(week != null || showAll) && (
          <button type="button" onClick={() => { setWeek(null); setShowAll(false); }}
            style={{ background: 'none', border: 'none', color: 'var(--color-accent-200)', fontSize: 11, cursor: 'pointer', padding: 0 }}>
            {week != null ? 'Tout l\'historique' : 'Réduire'}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {listed.map((h) => (editId === h.id
          ? <SessionForm key={h.id} session={h} onClose={() => setEditId(null)} />
          : (
          <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: '11px 13px' }}>
            <div className="icon-tile" style={{ width: 36, height: 36, color: h.partial ? 'var(--color-warn)' : undefined }}>
              <Icon name={h.partial ? 'pause' : h.manual ? 'note-pencil' : 'check-fat'} weight={h.partial ? 'fill' : 'regular'} size={17} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{h.programNom}</div>
              <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>
                {relativeDayLabel(h.dateKey)} ·{' '}
                {/* A session logged after the fact has no exercises by
                    construction, so counting them would only ever say "0". */}
                {h.manual
                  ? 'ajoutée manuellement'
                  : `${h.exerciseIds.length} exercice${h.exerciseIds.length > 1 ? 's' : ''}`}
                {h.partial && <span style={{ color: 'var(--color-warn)' }}> · partielle</span>}
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-300)', fontFamily: 'var(--font-heading)' }}>{fmt(h.elapsedSec)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 'none' }}>
              <IconCircleButton icon="pencil-simple" size={26} title="Modifier cette séance"
                onClick={() => setEditId(h.id)} style={{ color: 'var(--color-neutral-500)' }} />
              <DeleteSessionButton id={h.id} />
            </div>
          </div>
          )))}
        {listed.length === 0 && (
          <div className="empty-state">
            {week != null ? 'Aucune séance cette semaine-là.' : 'Aucune séance pour le moment.'}
          </div>
        )}
        {week == null && !showAll && reste > 0 && (
          <button type="button" onClick={() => setShowAll(true)}
            className="btn btn-secondary" style={{ width: '100%', padding: 10, marginTop: 2 }}>
            Voir les {reste} séance{reste > 1 ? 's' : ''} plus anciennes
          </button>
        )}
      </div>
    </div>
  );
}
