import { useApp, useDerived } from '../state/context.js';
import { fmt, relativeDayLabel } from '../lib/format.js';
import Icon from '../components/ui/Icon.jsx';

const WEEK_LABELS = ['S-5', 'S-4', 'S-3', 'S-2', 'S-1', 'Cette sem.'];

export default function Progress() {
  const { state } = useApp();
  const { streak, totalSessions, badges, history, weekly } = useDerived();
  const maxWeek = Math.max(1, ...weekly);
  const allTimeSec = state.sessionLog.reduce((a, s) => a + s.elapsedSec, 0);
  const allTimeKcal = state.sessionLog.reduce((a, s) => a + s.kcal, 0);

  return (
    <div className="screen mscroll">
      <h3 style={{ margin: '0 0 16px' }}>Progrès</h3>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 13 }}>
          <Icon name="fire" weight="fill" size={20} color="var(--color-warn)" />
          <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-heading)', marginTop: 4 }}>{streak}</div>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>jours consécutifs</div>
        </div>
        <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 13 }}>
          <Icon name="check-circle" weight="fill" size={20} color="var(--color-accent)" />
          <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-heading)', marginTop: 4 }}>{totalSessions}</div>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>séances au total</div>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Séances par semaine</span>
          <span style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>6 dernières</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: 96 }}>
          {weekly.map((count, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{
                width: '100%', height: `${Math.max(4, (count / maxWeek) * 100)}%`,
                background: i === weekly.length - 1 ? 'var(--color-accent)' : 'var(--color-accent-700)',
                borderRadius: '5px 5px 0 0', transformOrigin: 'bottom', animation: `mRise .5s ease ${i * 0.05}s both`,
              }} />
              <span style={{ fontSize: 10, color: i === weekly.length - 1 ? 'var(--color-accent-200)' : 'var(--color-neutral-500)' }}>{WEEK_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 13 }}>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={13} />Temps total</div>
          <div style={{ fontSize: 19, fontWeight: 600, fontFamily: 'var(--font-heading)', marginTop: 4 }}>{fmt(allTimeSec)}</div>
        </div>
        <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 13 }}>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="flame" size={13} />Calories</div>
          <div style={{ fontSize: 19, fontWeight: 600, fontFamily: 'var(--font-heading)', marginTop: 4 }}>{allTimeKcal} kcal</div>
        </div>
      </div>

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

      <h5 style={{ margin: '0 0 10px' }}>Historique des séances</h5>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {history.map((h) => (
          <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: '11px 13px' }}>
            <div className="icon-tile" style={{ width: 36, height: 36, color: h.partial ? 'var(--color-warn)' : undefined }}>
              <Icon name={h.partial ? 'pause' : 'check-fat'} weight={h.partial ? 'fill' : 'regular'} size={17} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{h.programNom}</div>
              <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>
                {relativeDayLabel(h.dateKey)} · {h.exerciseIds.length} exercice{h.exerciseIds.length > 1 ? 's' : ''}
                {h.partial && <span style={{ color: 'var(--color-warn)' }}> · partielle</span>}
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-300)', fontFamily: 'var(--font-heading)' }}>{fmt(h.elapsedSec)}</div>
          </div>
        ))}
        {history.length === 0 && (
          <div className="empty-state">Aucune séance pour le moment.</div>
        )}
      </div>
    </div>
  );
}
