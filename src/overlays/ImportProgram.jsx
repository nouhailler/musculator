import { useState } from 'react';
import { useApp } from '../state/context.js';
import { EXERCISES, exById } from '../data/exercises.js';
import { PROGRAM_IMPORT_PROMPT } from '../lib/programPrompt.js';
import { parseProgramImport } from '../lib/importProgram.js';
import Icon from '../components/ui/Icon.jsx';
import Tag from '../components/ui/Tag.jsx';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button.jsx';

const NOTE_STYLE = {
  substitution: { icon: 'arrows-down-up', color: 'var(--color-accent-200)' },
  nom: { icon: 'check', color: 'var(--color-neutral-500)' },
  absent: { icon: 'warning-circle', color: 'var(--color-warn)' },
};

const noteText = (n) => ({
  substitution: `${n.from} → remplacé par ${n.to} (${n.muscle})`,
  nom: `${n.from} → ${n.to}`,
  absent: `${n.from} : aucun équivalent au catalogue, écarté`,
}[n.kind]);

/**
 * Turns a dictated plan into custom workouts. Nothing is saved before the
 * preview: a plan arrives as several sessions at once, and what the assistant
 * asked for is not always what the catalogue can give — every substitution is
 * shown before it lands.
 */
export default function ImportProgram() {
  const { state, actions } = useApp();
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  const preview = () => {
    setError('');
    try {
      setParsed(parseProgramImport(text, { objectif: state.profile.objectif }));
    } catch (e) {
      setParsed(null);
      setError(e.message || 'JSON invalide.');
    }
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(PROGRAM_IMPORT_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // No clipboard here — the prompt is on screen and selectable.
    }
  };

  const total = parsed ? parsed.seances.reduce((a, s) => a + s.exos.length, 0) : 0;

  return (
    <div className="overlay mscroll">
      <div className="overlay-header">
        <SecondaryButton icon="arrow-left" onClick={actions.closeOverlay} style={{ gap: 6 }}>Retour</SecondaryButton>
      </div>
      <div style={{ padding: '14px 18px 0' }}>
        <h3 style={{ margin: '0 0 2px' }}>Importer un programme dicté</h3>
        <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 14px', lineHeight: 1.55 }}>
          Demande un programme à Claude ou ChatGPT, colle ici le JSON. Chaque séance du plan
          devient une séance perso, avec ses séries, répétitions et temps de repos.
        </p>

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
                Le prompt contient les {EXERCISES.length} exercices de l'app : l'assistant choisit dedans plutôt que
                d'en inventer, sinon la séance perdrait sa démo animée et son coach vocal. Colle-le
                dans un Projet Claude ou un GPT personnalisé, puis demande ton programme.
              </p>
              <SecondaryButton icon={copied ? 'check' : 'copy'} onClick={copyPrompt} style={{ marginBottom: 10 }}>
                {copied ? 'Prompt copié !' : 'Copier le prompt'}
              </SecondaryButton>
              <pre style={{ maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                margin: 0, padding: 10, background: 'var(--color-neutral-900)', borderRadius: 'var(--radius-md)',
                fontSize: 10.5, lineHeight: 1.5, color: 'var(--color-neutral-300)' }}
              >
                {PROGRAM_IMPORT_PROMPT}
              </pre>
            </div>
          )}
        </div>

        <textarea
          className="input" rows={6} value={text}
          onChange={(e) => { setText(e.target.value); setParsed(null); setError(''); }}
          placeholder={'Colle ici le JSON, ex. { "app": "musculator", "seances": [ … ] }'}
          style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, marginBottom: 12 }}
        />

        {error && <div style={{ fontSize: 12, color: 'var(--color-warn)', marginBottom: 12, lineHeight: 1.5 }}>{error}</div>}

        {!parsed ? (
          <SecondaryButton
            icon="magnifying-glass" onClick={preview}
            style={{ width: '100%', padding: 12, justifyContent: 'center', opacity: text.trim() ? 1 : 0.5 }}
          >
            Prévisualiser
          </SecondaryButton>
        ) : (
          <>
            <div className="section-label">
              {parsed.seances.length} séance{parsed.seances.length > 1 ? 's' : ''} · {total} exercices
            </div>
            {parsed.seances.map((s, i) => (
              <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', padding: 12, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{s.nom}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-neutral-500)', flex: 'none' }}>{s.duree} min</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-accent-200)', marginBottom: 8 }}>{s.objectif}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {s.exos.map((id) => {
                    const c = s.custom[id];
                    return (
                      <div key={id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 11.5 }}>
                        <span style={{ color: 'var(--color-neutral-200)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {exById(id).nom}
                        </span>
                        <span style={{ color: 'var(--color-neutral-500)', flex: 'none', fontVariantNumeric: 'tabular-nums' }}>
                          {c.series} × {c.reps}{c.charge ? ` · ${c.charge}` : ''} · {c.repos} s
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* What the catalogue could not give as asked. Substitutions are
                    the point of showing this: they change the session. */}
                {s.notes.length > 0 && (
                  <div style={{ marginTop: 9, paddingTop: 8, borderTop: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {s.notes.map((n, j) => (
                      <div key={j} style={{ display: 'flex', gap: 6, fontSize: 10.5, color: NOTE_STYLE[n.kind].color, lineHeight: 1.45 }}>
                        <Icon name={NOTE_STYLE[n.kind].icon} size={12} style={{ flex: 'none', marginTop: 1 }} />
                        <span>{noteText(n)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {parsed.warnings.length > 0 && (
              <div style={{ border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: 11, marginBottom: 12 }}>
                <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 11, color: 'var(--color-warn)', lineHeight: 1.5 }}>
                  {parsed.warnings.map((w) => <li key={w}>{w}</li>)}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <SecondaryButton icon="pencil-simple" onClick={() => setParsed(null)} style={{ padding: '0 14px' }}>Modifier</SecondaryButton>
              <PrimaryButton icon="check" onClick={() => actions.importPrograms(parsed.seances)} style={{ flex: 1 }}>
                Ajouter {parsed.seances.length > 1 ? `les ${parsed.seances.length} séances` : 'la séance'}
              </PrimaryButton>
            </div>
          </>
        )}

        <div style={{ height: 8 }} />
        <Tag variant="outline">Les exercices viennent du catalogue : démo animée et coach vocal inclus</Tag>
        <div style={{ height: 28 }} />
      </div>
    </div>
  );
}
