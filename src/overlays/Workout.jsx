import { useApp, allPrograms } from '../state/store.jsx';
import { progById } from '../data/programs.js';
import { exById } from '../data/exercises.js';
import { CUES } from '../data/cues.js';
import { effSeries, curCharge as getCurCharge, curReps as getCurReps } from '../lib/workout.js';
import { fmt } from '../lib/format.js';
import Icon from '../components/ui/Icon.jsx';
import { IconCircleButton, SecondaryButton, GhostButton } from '../components/ui/Button.jsx';
import ExerciseDetail from './ExerciseDetail.jsx';

export default function Workout() {
  const { state, actions } = useApp();
  const w = state.workout;
  if (!w) return null;

  const program = progById(w.progId, allPrograms(state.customWorkouts));
  const curId = program.exos[Math.min(w.index, program.exos.length - 1)];
  const curBase = exById(curId);
  const cp = (program.isCustom && program.custom && program.custom[curId]) ? program.custom[curId] : null;
  const wCur = { ...curBase, series: cp ? cp.series : curBase.series, reps: cp ? cp.reps : curBase.reps };
  const cue = CUES[curBase.id];
  const cueHint = cue ? `« ${cue.seq.join(' — ')} »` : '';
  const nextId = program.exos[Math.min(w.index + 1, program.exos.length - 1)];
  const nextName = exById(nextId).nom;
  const stepLabel = `Exercice ${w.index + 1} / ${program.exos.length}`;
  const progressPct = Math.round((w.doneIds.length / program.exos.length) * 100);
  const isLast = w.index >= program.exos.length - 1;

  const seriesTotal = effSeries(program, curId);
  const setNum = Math.min(w.set, seriesTotal);
  const charge = getCurCharge(program, w, curId);
  const reps = getCurReps(program, w, curId);
  const note = w.notes[curId] || '';
  const finishSetLabel = setNum < seriesTotal ? 'Série terminée' : (isLast ? 'Terminer la séance' : 'Exercice terminé');
  const restKindLabel = w.restKind === 'series' ? 'Repos entre séries' : 'Repos — exercice suivant';
  const restNext = w.restKind === 'series' ? `Série ${w.set + 1} · ${wCur.nom}` : nextName;

  const editTitle = w.edit === 'charge' ? 'Modifier la charge' : (w.edit === 'reps' ? 'Modifier les répétitions' : 'Notes personnelles');

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 58, background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', paddingTop: 'calc(10px + env(safe-area-inset-top))' }}>
      <div style={{ padding: '6px 16px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconCircleButton icon="x" onClick={actions.quitWorkout} title="Quitter" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--color-neutral-400)' }}>{program.nom}</div>
          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{stepLabel}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconCircleButton icon="arrows-out" onClick={actions.toggleBig} title="Mode plein écran" />
          <IconCircleButton icon={state.voiceOn ? 'speaker-high' : 'speaker-simple-x'} onClick={actions.toggleVoice} title="Voix du coach" active={state.voiceOn} />
          <IconCircleButton icon={w.paused ? 'play' : 'pause'} onClick={actions.togglePause} title="Pause" />
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--color-neutral-800)', margin: '0 16px', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--color-accent)', borderRadius: 2, transition: 'width .4s ease' }} />
      </div>
      <div style={{ padding: '4px 16px 0', display: 'flex', justifyContent: 'flex-end', fontSize: 11, color: 'var(--color-neutral-500)' }}>Total : {fmt(w.elapsed)}</div>

      {w.phase === 'exercise' && !w.bigMode && (
        <div className="mscroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 20px 0' }}>
          <div style={{ position: 'relative', width: 148, height: 148, margin: '8px 0 12px', borderRadius: '50%', background: 'radial-gradient(120% 120% at 30% 20%,var(--color-accent-800),var(--color-neutral-900))', display: 'grid', placeItems: 'center' }}>
            <svg width="148" height="148" viewBox="0 0 120 120" style={{ position: 'absolute' }}>
              <circle cx="60" cy="60" r="54" fill="none" stroke="color-mix(in srgb,var(--color-accent) 45%,transparent)" strokeWidth="2.5" strokeDasharray="339" style={{ animation: 'mRing 2.4s ease-out infinite' }} transform="rotate(-90 60 60)" />
            </svg>
            <Icon name={wCur.icon} weight="fill" size={60} color="var(--color-accent-100)" style={{ animation: 'mPulse 2.4s ease-in-out infinite' }} />
          </div>
          <h2 style={{ margin: '0 0 4px', textAlign: 'center' }}>{wCur.nom}</h2>
          <div style={{ fontSize: 13, color: 'var(--color-accent-300)', marginBottom: 8 }}>{wCur.muscle}</div>
          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-heading)', color: 'var(--color-accent-100)', background: 'var(--color-accent-800)', border: '1px solid var(--color-accent)', borderRadius: 999, padding: '5px 16px', marginBottom: 14 }}>
            Série {setNum} / {seriesTotal}
          </div>

          <div style={{ width: '100%', maxWidth: 340, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>Chronomètre série</div>
              <div style={{ fontSize: 30, fontWeight: 600, fontFamily: 'var(--font-heading)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{fmt(w.stopwatch)}</div>
            </div>
            <button type="button" onClick={actions.toggleSw} style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--color-accent)', background: 'var(--color-accent-800)', color: 'var(--color-accent-100)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <Icon name={w.swRunning ? 'pause' : 'play'} weight="fill" size={18} />
            </button>
            <button type="button" onClick={actions.resetSw} title="Réinitialiser" style={{ width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--color-divider)', background: 'transparent', color: 'var(--color-neutral-300)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <Icon name="arrow-counter-clockwise" size={18} />
            </button>
          </div>

          <div style={{ width: '100%', maxWidth: 340, display: 'flex', gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: '11px 12px' }}>
              <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 2 }}>Répétitions</div>
              <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-heading)', lineHeight: 1.1, marginBottom: 8 }}>{reps}</div>
              <SecondaryButton icon="pencil-simple" onClick={() => actions.openEdit('reps')} style={{ width: '100%', padding: 7 }}>Modifier</SecondaryButton>
            </div>
            <div style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: '11px 12px' }}>
              <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 2 }}>Charge</div>
              <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-heading)', lineHeight: 1.2, marginBottom: 8, minHeight: 26 }}>{charge}</div>
              <SecondaryButton icon="pencil-simple" onClick={() => actions.openEdit('charge')} style={{ width: '100%', padding: 7 }}>Modifier</SecondaryButton>
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="waveform" size={15} color="var(--color-accent-300)" />Le coach rythme : {cueHint}
            </div>
            <button type="button" onClick={() => actions.openEdit('notes')} style={{ width: '100%', textAlign: 'left', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: '10px 12px', cursor: 'pointer', color: 'var(--color-neutral-200)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <Icon name="note-pencil" size={16} color="var(--color-accent-300)" style={{ flex: 'none', marginTop: 1 }} />
              <span style={{ flex: 1, fontSize: 12, lineHeight: 1.5 }}><span style={{ color: 'var(--color-neutral-500)' }}>Notes personnelles</span><br />{note || 'Ajouter une note…'}</span>
            </button>
            <div onClick={() => actions.patch({ exercisePeekId: curId })} style={{ fontSize: 12, color: 'var(--color-accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="info" size={14} />Voir la fiche & les conseils
            </div>
          </div>
        </div>
      )}

      {w.phase === 'exercise' && !w.bigMode && (
        <div style={{ padding: '10px 18px calc(22px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 9 }}>
          <SecondaryButton icon="arrows-out" onClick={actions.toggleBig} style={{ width: '100%', padding: 11 }}>Mode plein écran (gros boutons)</SecondaryButton>
          <button type="button" onClick={actions.finishSet} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16, color: 'var(--color-accent-100)', background: 'var(--color-accent-800)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }}>
            {finishSetLabel}<Icon name="check-circle" weight="fill" size={22} />
          </button>
        </div>
      )}

      {w.phase === 'exercise' && w.bigMode && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 16px 18px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 2 }}>
            <GhostButton icon="arrows-in" onClick={actions.toggleBig} style={{ padding: '8px 12px' }}>Quitter plein écran</GhostButton>
          </div>
          <div style={{ fontSize: 'clamp(26px,7vw,40px)', fontWeight: 600, fontFamily: 'var(--font-heading)', lineHeight: 1.05, marginBottom: 4 }}>{wCur.nom}</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-accent-200)', marginBottom: 14 }}>Série {setNum} / {seriesTotal}</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <button type="button" onClick={() => actions.openEdit('reps')} style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: '16px 8px', cursor: 'pointer', color: 'var(--color-text)' }}>
              <div style={{ fontSize: 46, fontWeight: 600, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{reps}</div>
              <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', marginTop: 4 }}>répétitions ✎</div>
            </button>
            <button type="button" onClick={() => actions.openEdit('charge')} style={{ flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: '16px 8px', cursor: 'pointer', color: 'var(--color-text)' }}>
              <div style={{ fontSize: 26, fontWeight: 600, fontFamily: 'var(--font-heading)', lineHeight: 1.15, minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{charge}</div>
              <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', marginTop: 4 }}>charge ✎</div>
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <div style={{ fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-accent-300)' }}>Chronomètre</div>
            <div style={{ fontSize: 'clamp(64px,22vw,120px)', fontWeight: 600, fontFamily: 'var(--font-heading)', lineHeight: .95, fontVariantNumeric: 'tabular-nums' }}>{fmt(w.stopwatch)}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="button" onClick={actions.toggleSw} style={{ width: 60, height: 60, borderRadius: '50%', border: '1px solid var(--color-accent)', background: 'var(--color-accent-800)', color: 'var(--color-accent-100)', cursor: 'pointer', fontSize: 26, display: 'grid', placeItems: 'center' }}>
                <Icon name={w.swRunning ? 'pause' : 'play'} weight="fill" size={26} />
              </button>
              <button type="button" onClick={actions.resetSw} style={{ width: 60, height: 60, borderRadius: '50%', border: '1px solid var(--color-divider)', background: 'transparent', color: 'var(--color-neutral-300)', cursor: 'pointer', fontSize: 24, display: 'grid', placeItems: 'center' }}>
                <Icon name="arrow-counter-clockwise" size={24} />
              </button>
            </div>
          </div>
          <button type="button" onClick={actions.finishSet} style={{ width: '100%', minHeight: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 14, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 24, color: 'var(--color-accent-100)', background: 'var(--color-accent-800)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', boxShadow: '0 0 40px -10px var(--color-accent)' }}>
            {finishSetLabel}<Icon name="check-circle" weight="fill" size={32} />
          </button>
        </div>
      )}

      {w.phase === 'rest' && !w.bigMode && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-accent-300)', marginBottom: 6 }}>{restKindLabel}</div>
          <div style={{ fontSize: 74, fontWeight: 600, fontFamily: 'var(--font-heading)', lineHeight: 1, marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>{fmt(w.rest)}</div>
          <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', marginBottom: 28, textAlign: 'center' }}>Récupère. Ensuite : <span style={{ color: 'var(--color-neutral-100)' }}>{restNext}</span></div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <SecondaryButton onClick={actions.addRest} style={{ padding: '12px 18px' }}>+15 s</SecondaryButton>
            <button type="button" onClick={actions.skipRest} style={{ padding: '12px 22px', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, color: 'var(--color-accent-100)', background: 'var(--color-accent-800)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              Passer<Icon name="skip-forward" weight="fill" size={16} />
            </button>
          </div>
          <GhostButton icon="arrows-out" onClick={actions.toggleBig} style={{ padding: 9 }}>Mode plein écran</GhostButton>
        </div>
      )}

      {w.phase === 'rest' && w.bigMode && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--color-accent-300)', marginBottom: 10 }}>{restKindLabel}</div>
          <div style={{ fontSize: 'clamp(88px,32vw,180px)', fontWeight: 600, fontFamily: 'var(--font-heading)', lineHeight: .9, marginBottom: 10, fontVariantNumeric: 'tabular-nums' }}>{fmt(w.rest)}</div>
          <div style={{ fontSize: 16, color: 'var(--color-neutral-300)', marginBottom: 30 }}>Ensuite : <span style={{ color: 'var(--color-neutral-100)' }}>{restNext}</span></div>
          <div style={{ display: 'flex', gap: 14, width: '100%', maxWidth: 360 }}>
            <button type="button" onClick={actions.addRest} style={{ flex: 1, minHeight: 76, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, color: 'var(--color-neutral-100)', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }}>+15 s</button>
            <button type="button" onClick={actions.skipRest} style={{ flex: 1, minHeight: 76, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20, color: 'var(--color-accent-100)', background: 'var(--color-accent-800)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              Passer<Icon name="skip-forward" weight="fill" size={26} />
            </button>
          </div>
          <GhostButton icon="arrows-in" onClick={actions.toggleBig} style={{ padding: 10, marginTop: 16 }}>Quitter plein écran</GhostButton>
        </div>
      )}

      {w.edit && (
        <div className="sheet-backdrop">
          <div className="sheet">
            <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-heading)', marginBottom: 14 }}>{editTitle}</div>
            {w.edit === 'notes' ? (
              <textarea className="input" value={w.editVal} onChange={(e) => actions.setEditVal(e.target.value)} placeholder="Ressenti, ajustements, douleurs…" style={{ width: '100%', minHeight: 120, fontSize: 16, resize: 'none' }} />
            ) : (
              <input className="input" value={w.editVal} onChange={(e) => actions.setEditVal(e.target.value)} style={{ width: '100%', fontSize: 20, textAlign: 'center', padding: 14 }} />
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <SecondaryButton onClick={actions.cancelEdit} style={{ flex: 1, padding: 14, fontSize: 15, justifyContent: 'center' }}>Annuler</SecondaryButton>
              <button type="button" onClick={actions.saveEdit} style={{ flex: 1, padding: 14, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, color: 'var(--color-accent-100)', background: 'var(--color-accent-800)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {state.exercisePeekId && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 66 }}>
          <ExerciseDetail exId={state.exercisePeekId} onBack={() => actions.patch({ exercisePeekId: null })} />
        </div>
      )}
    </div>
  );
}
