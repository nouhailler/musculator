import { useApp, useDerived, allPrograms } from '../state/context.js';
import { progById } from '../data/programs.js';
import { dateKey, shortMin } from '../lib/format.js';
import { dayActivity } from '../lib/activity.js';
import { DEFAULT_KM_TARGET } from '../data/activity.js';
import Icon from '../components/ui/Icon.jsx';
import { PrimaryButton, IconCircleButton } from '../components/ui/Button.jsx';

const TIPS = [
  { icon: 'thermometer-hot', title: 'Échauffe-toi', body: '5 min avant chaque séance' },
  { icon: 'drop', title: 'Hydrate-toi', body: 'Bois avant, pendant, après' },
  { icon: 'moon-stars', title: 'Repose-toi', body: 'Le muscle pousse au repos' },
  { icon: 'trend-up', title: 'Progresse', body: 'Augmente peu à peu' },
];

const RECOMMENDED_IDS = ['fullbody', 'core', 'hiit'];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
}

export default function Home() {
  const { state, actions } = useApp();
  const { streak, weekSessions, weekTimeSec, weekKcal } = useDerived();
  const today = progById('fullbody');
  const freqTarget = Math.min(7, Math.max(1, Number(state.profile.frequence) || 4));
  const filled = Math.min(weekSessions.length, freqTarget);
  const marche = dayActivity(state.activityLog, dateKey(), state.profile);
  const kmCible = Number(state.profile.kmCible) > 0 ? Number(state.profile.kmCible) : DEFAULT_KM_TARGET;
  const marchePart = Math.min(1, marche.km / kmCible);

  return (
    <div className="screen mscroll">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>{greeting()}</div>
          <h3 style={{ margin: '2px 0 0' }}>Prêt à forger ? 💪</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--color-accent-900)', border: '1px solid var(--color-accent-800)', color: 'var(--color-accent-200)', padding: '6px 11px', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
            <Icon name="fire" weight="fill" size={16} color="var(--color-warn)" />{streak}
          </div>
          <IconCircleButton icon="gear-six" title="Profil & objectifs" onClick={actions.openProfile} size={36} />
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg,var(--color-accent-900),var(--color-surface))', border: '1px solid var(--color-accent-800)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-accent-200)' }}>Progression du jour</span>
          <span style={{ fontSize: 12, color: 'var(--color-neutral-300)' }}>{weekSessions.length} / {freqTarget} séances</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {Array.from({ length: freqTarget }).map((_, i) => (
            <span key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < filled ? 'var(--color-accent)' : 'var(--color-neutral-800)' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div><div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{shortMin(weekTimeSec / 60)}</div><div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>cette semaine</div></div>
          <div><div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{weekKcal}</div><div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>kcal estimées</div></div>
        </div>
      </div>

      {/* Walking, next to training rather than mixed into it: same day, other
          kind of effort. Tapping it opens where a walk is logged. */}
      <button
        type="button" onClick={actions.openActivity}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left', font: 'inherit',
          cursor: 'pointer', color: 'var(--color-text)', background: 'var(--color-surface)',
          border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: 13, marginBottom: 16 }}
      >
        <div style={{ position: 'relative', width: 54, height: 54, flex: 'none' }}>
          <svg width="54" height="54" viewBox="0 0 54 54">
            <circle cx="27" cy="27" r="23" fill="none" stroke="var(--color-neutral-800)" strokeWidth="6" />
            <circle
              cx="27" cy="27" r="23" fill="none" stroke="var(--color-accent)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 23} strokeDashoffset={2 * Math.PI * 23 * (1 - marchePart)}
              transform="rotate(-90 27 27)" style={{ transition: 'stroke-dashoffset .5s ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--color-accent-200)' }}>
            <Icon name="person-simple-walk" weight="fill" size={20} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {marche.km.toLocaleString('fr-FR')} km <span style={{ fontSize: 12, color: 'var(--color-neutral-400)', fontWeight: 400 }}>/ {kmCible} km</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>
            {marche.kcal > 0 ? `${marche.kcal} kcal dépensées en marchant` : "Marche du jour — rien de consigné"}
          </div>
        </div>
        <Icon name="caret-right" size={16} color="var(--color-neutral-500)" />
      </button>

      <PrimaryButton icon="play-circle" size="lg" onClick={() => actions.startWorkout('fullbody')} style={{ marginBottom: 8 }}>
        Commencer une séance
      </PrimaryButton>
      <div style={{ fontSize: 11, color: 'var(--color-neutral-500)', textAlign: 'center', marginBottom: 16 }}>
        {today.nom} · {today.duree} min · {today.exos.length} exercices
      </div>

      <button type="button" onClick={actions.openBodyMap} className="row-card" style={{ marginBottom: 20 }}>
        <div className="icon-tile"><Icon name="person" weight="fill" size={24} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Cartographie musculaire</div>
          <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>Vois quels muscles sont prêts à travailler</div>
        </div>
        <Icon name="caret-right" size={16} color="var(--color-neutral-500)" />
      </button>

      <div className="mscroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -18px 22px', padding: '0 18px' }}>
        {TIPS.map((t) => (
          <div key={t.title} style={{ flex: 'none', width: 132, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 12 }}>
            <Icon name={t.icon} size={20} color="var(--color-accent)" />
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{t.title}</div>
            <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{t.body}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <h5 style={{ margin: 0 }}>Programmes recommandés</h5>
        <span onClick={() => actions.goTab('programs')} style={{ fontSize: 12, color: 'var(--color-accent)', cursor: 'pointer' }}>Tout voir</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {RECOMMENDED_IDS.map((id) => {
          const p = progById(id, allPrograms(state.customWorkouts));
          return (
            <button key={id} type="button" onClick={() => actions.selectProgram(id)} className="row-card">
              <div className="icon-tile"><Icon name={p.icon} size={22} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{p.nom}</div>
                <div style={{ fontSize: 11, color: 'var(--color-neutral-400)' }}>{p.exos.length} exercices · {p.duree} min · {p.niveau}</div>
              </div>
              <Icon name="caret-right" size={16} color="var(--color-neutral-500)" />
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 20, background: 'color-mix(in srgb,var(--color-warn) 10%,transparent)', border: '1px solid color-mix(in srgb,var(--color-warn) 32%,transparent)', borderRadius: 'var(--radius-md)', padding: 12 }}>
        <Icon name="warning-circle" weight="fill" size={20} color="var(--color-warn)" style={{ flex: 'none' }} />
        <div style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--color-neutral-300)' }}>
          Avant tout programme, consulte un professionnel de santé — surtout en cas de problème de santé, blessure ou douleur.{' '}
          <span onClick={actions.showDisclaimer} style={{ color: 'var(--color-accent)', cursor: 'pointer' }}>En savoir plus</span>
        </div>
      </div>
    </div>
  );
}
