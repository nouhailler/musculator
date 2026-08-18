import { useMemo } from 'react';
import { useApp } from '../state/context.js';
import { HELP } from '../data/help.js';
import { FAQ, FAQ_CATS, faqById, faqByCat, catLabel } from '../data/faq.js';
import { TOURS, tourById } from '../data/tours.js';
import { searchHelp } from '../lib/helpSearch.js';
import { SUPPORT_EMAIL, diagnostics, diagnosticsText } from '../lib/diagnostics.js';
import { Field, TextInput, TextArea } from '../components/ui/Field.jsx';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button.jsx';
import Icon from '../components/ui/Icon.jsx';

/**
 * The help centre: search, FAQ, interactive tutorials, screen guides and the
 * support form, all inside the app.
 *
 * The point is that nobody has to leave to get unstuck — no support site, no
 * mail thread started from scratch, no "contactez-nous" that opens a browser.
 * The contextual `?` in the top bar still answers "what is this screen"; this
 * screen answers "how do I…" and "why does it do that".
 *
 * What is on show is one piece of state: `helpTopic`, `{ kind, id }`. A tip's
 * "En savoir plus", a FAQ cross-link and the search results all open the same
 * thing, so there is one place that renders an answer rather than three.
 */

const TAB_KEYS = new Set(['home', 'programs', 'library', 'nutrition', 'journal', 'progress']);

const KIND_LABEL = { faq: 'Question fréquente', ecran: "Guide de l'écran", tuto: 'Tutoriel interactif' };
const KIND_ICON = { faq: 'question', ecran: 'info', tuto: 'play-circle' };

function Card({ icon, titre, sous, onClick, right = 'caret-right', accent }) {
  return (
    <button type="button" onClick={onClick} className="row-card" style={{ alignItems: 'flex-start' }}>
      <div className="icon-tile" style={{ width: 34, height: 34, background: accent ? 'var(--color-accent-800)' : 'var(--color-accent-900)' }}>
        <Icon name={icon} size={18} weight={accent ? 'fill' : 'regular'} />
      </div>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{titre}</span>
        {sous && <span style={{ display: 'block', fontSize: 11, color: 'var(--color-neutral-400)', lineHeight: 1.5, marginTop: 2 }}>{sous}</span>}
      </span>
      <Icon name={right} size={15} color="var(--color-neutral-500)" style={{ flex: 'none', marginTop: 8 }} />
    </button>
  );
}

function Section({ titre, children, style }) {
  return (
    <div style={{ marginBottom: 20, ...style }}>
      <div className="section-label">{titre}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

/** Sends the reader where an answer says to go — a tab, an overlay, or a tutorial. */
function useGoto() {
  const { actions } = useApp();
  return (lien) => {
    if (!lien) return;
    if (lien.tour) actions.startTour(lien.tour);
    // A link back to the help centre means "up", not "reopen": the reader is
    // already here, so it lands on the index rather than re-mounting the view.
    else if (lien.view === 'help') actions.closeHelpTopic();
    else if (lien.view) actions.openView(lien.view);
    else if (lien.tab) actions.goTab(lien.tab);
  };
}

// --- Answers ---------------------------------------------------------------

function FaqAnswer({ id }) {
  const { actions } = useApp();
  const goto = useGoto();
  const f = faqById(id);
  if (!f) return <div className="empty-state">Cette réponse n'existe plus.</div>;

  const voisines = faqByCat(f.cat).filter((x) => x.id !== f.id).slice(0, 3);

  return (
    <>
      <div className="section-label">{catLabel(f.cat)}</div>
      <h4 style={{ margin: '0 0 12px', lineHeight: 1.35 }}>{f.q}</h4>
      {f.r.map((para) => (
        <p key={para.slice(0, 24)} style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--color-neutral-200)', margin: '0 0 11px' }}>{para}</p>
      ))}

      {f.lien && (
        <SecondaryButton icon="arrow-circle-right" onClick={() => goto(f.lien)} style={{ width: '100%', padding: 11, justifyContent: 'center', marginTop: 6 }}>
          {f.lien.label}
        </SecondaryButton>
      )}

      {voisines.length > 0 && (
        <Section titre="Dans la même rubrique" style={{ marginTop: 22 }}>
          {voisines.map((v) => (
            <Card key={v.id} icon="question" titre={v.q} onClick={() => actions.openHelpTopic('faq', v.id)} />
          ))}
        </Section>
      )}

      <SupportPrompt />
    </>
  );
}

function ScreenGuide({ id }) {
  const goto = useGoto();
  const h = HELP[id];
  if (!h) return <div className="empty-state">Ce guide n'existe plus.</div>;
  const lien = TAB_KEYS.has(id) ? { tab: id } : { view: id };

  return (
    <>
      <div className="section-label">Guide de l'écran</div>
      <h4 style={{ margin: '0 0 6px' }}>{h.titre}</h4>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-neutral-300)', margin: '0 0 16px' }}>{h.intro}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 18 }}>
        {h.points.map(([titre, texte]) => (
          <div key={titre} style={{ display: 'flex', gap: 10 }}>
            <Icon name="caret-right" size={14} color="var(--color-accent-300)" style={{ flex: 'none', marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 2 }}>{titre}</div>
              <div style={{ fontSize: 12.5, color: 'var(--color-neutral-300)', lineHeight: 1.6 }}>{texte}</div>
            </div>
          </div>
        ))}
      </div>

      {/* An overlay opened from here replaces the help centre, which is the
          point: the guide was read, now go and use the screen. */}
      <SecondaryButton icon="arrow-circle-right" onClick={() => goto(lien)} style={{ width: '100%', padding: 11, justifyContent: 'center' }}>
        Aller sur « {h.titre} »
      </SecondaryButton>

      <SupportPrompt />
    </>
  );
}

function TourIntro({ id }) {
  const { actions } = useApp();
  const t = tourById(id);
  if (!t) return <div className="empty-state">Ce tutoriel n'existe plus.</div>;

  return (
    <>
      <div className="section-label">Tutoriel interactif</div>
      <h4 style={{ margin: '0 0 6px' }}>{t.titre}</h4>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-neutral-300)', margin: '0 0 4px' }}>{t.resume}</p>
      <p style={{ fontSize: 11, color: 'var(--color-neutral-500)', margin: '0 0 16px' }}>
        {t.steps.length} étapes · environ {t.duree} · l'app se déplace avec toi, tu peux sortir à tout moment.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 18 }}>
        {t.steps.map((s, i) => (
          <div key={s.titre} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ width: 20, height: 20, flex: 'none', borderRadius: '50%', background: 'var(--color-accent-900)', color: 'var(--color-accent-200)', fontSize: 10, fontWeight: 600, display: 'grid', placeItems: 'center' }}>{i + 1}</span>
            <span style={{ fontSize: 12.5, color: 'var(--color-neutral-300)', lineHeight: 1.5, paddingTop: 2 }}>{s.titre}</span>
          </div>
        ))}
      </div>

      <PrimaryButton icon="play-circle" onClick={() => actions.startTour(t.id)}>Lancer le tutoriel</PrimaryButton>
    </>
  );
}

function CategoryList({ id }) {
  const { actions } = useApp();
  const list = faqByCat(id);
  return (
    <>
      <div className="section-label">Questions fréquentes</div>
      <h4 style={{ margin: '0 0 14px' }}>{catLabel(id)}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map((f) => (
          <Card key={f.id} icon="question" titre={f.q} onClick={() => actions.openHelpTopic('faq', f.id)} />
        ))}
      </div>
      <SupportPrompt />
    </>
  );
}

function ScreenList() {
  const { actions } = useApp();
  return (
    <>
      <div className="section-label">Guides des écrans</div>
      <h4 style={{ margin: '0 0 4px' }}>Chaque écran, expliqué</h4>
      <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 14px', lineHeight: 1.55 }}>
        Le même texte que le « ? » en haut à droite, consultable sans être sur l'écran concerné.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(HELP).map(([key, h]) => (
          <Card key={key} icon={TAB_KEYS.has(key) ? 'house-line' : 'info'} titre={h.titre} sous={h.intro}
            onClick={() => actions.openHelpTopic('ecran', key)} />
        ))}
      </div>
    </>
  );
}

// --- Support ---------------------------------------------------------------

/** The way out when the written help didn't answer — offered at the end of every answer. */
function SupportPrompt() {
  const { actions } = useApp();
  return (
    <div style={{ marginTop: 22, paddingTop: 14, borderTop: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon name="waveform" size={16} color="var(--color-neutral-500)" style={{ flex: 'none' }} />
      <span style={{ flex: 1, fontSize: 11.5, color: 'var(--color-neutral-400)', lineHeight: 1.5 }}>Cette réponse ne règle pas ton cas ?</span>
      <button type="button" onClick={() => actions.openHelpTopic('support', '')}
        style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', fontSize: 12, color: 'var(--color-accent-200)', cursor: 'pointer', flex: 'none' }}>
        Écrire au support
      </button>
    </div>
  );
}

function SupportForm() {
  const { state, actions } = useApp();
  const infos = useMemo(() => diagnostics(state), [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(diagnosticsText(state));
      actions.setSupport({ statut: 'Diagnostic copié dans le presse-papier.' });
    } catch {
      actions.setSupport({ statut: "Copie impossible depuis ce navigateur — les informations restent lisibles ci-dessous." });
    }
  };

  return (
    <>
      <div className="section-label">Contact</div>
      <h4 style={{ margin: '0 0 6px' }}>Écrire au support</h4>
      <p style={{ fontSize: 12.5, color: 'var(--color-neutral-300)', margin: '0 0 16px', lineHeight: 1.6 }}>
        Le message part vers <strong style={{ color: 'var(--color-text)' }}>{SUPPORT_EMAIL}</strong> depuis ton
        application mail, avec les informations de diagnostic ci-dessous. Elles disent sur quelle version et
        quel appareil le problème arrive — c'est ce qui rend une réponse possible.
      </p>

      <Field label="Sujet" style={{ marginBottom: 12 }}>
        <TextInput
          value={state.support.sujet}
          onChange={(v) => actions.setSupport({ sujet: v, statut: '' })}
          placeholder="ex. le scanner ne s'ouvre pas"
        />
      </Field>
      <Field label="Ton message" style={{ marginBottom: 14 }}>
        <TextArea
          value={state.support.message}
          onChange={(v) => actions.setSupport({ message: v, statut: '' })}
          placeholder="Ce que tu faisais, ce que tu attendais, ce qui s'est passé."
          style={{ minHeight: 120 }}
        />
      </Field>

      <PrimaryButton icon="arrow-circle-right" onClick={actions.sendSupport}>Envoyer au support</PrimaryButton>
      {state.support.statut && (
        <div style={{ fontSize: 12, color: 'var(--color-good)', lineHeight: 1.55, margin: '10px 0 0' }}>{state.support.statut}</div>
      )}

      <div className="section-label" style={{ marginTop: 22 }}>Joint automatiquement</div>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginBottom: 10 }}>
        {infos.map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', gap: 10, padding: '4px 0', fontSize: 11.5, lineHeight: 1.5 }}>
            <span style={{ width: 104, flex: 'none', color: 'var(--color-neutral-500)' }}>{label}</span>
            <span style={{ flex: 1, minWidth: 0, color: 'var(--color-neutral-200)', wordBreak: 'break-word' }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 11, color: 'var(--color-neutral-400)', lineHeight: 1.5, marginBottom: 12 }}>
        <Icon name="shield-check" size={14} color="var(--color-accent-200)" style={{ flex: 'none', marginTop: 1 }} />
        <span>
          Aucune donnée personnelle n'y figure : ni ton profil, ni tes séances, ni tes repas — seulement leur
          nombre. Ta clé OpenRouter n'est jamais lue.
        </span>
      </div>
      <SecondaryButton icon="copy" onClick={copy} style={{ width: '100%', padding: 11, justifyContent: 'center' }}>
        Copier le diagnostic
      </SecondaryButton>
    </>
  );
}

// --- Index -----------------------------------------------------------------

function Results({ query }) {
  const { actions } = useApp();
  const hits = useMemo(() => searchHelp(query), [query]);

  if (!hits.length) {
    return (
      <div style={{ padding: '26px 0 6px', textAlign: 'center' }}>
        <Icon name="magnifying-glass" size={26} color="var(--color-neutral-600)" />
        <div style={{ fontSize: 13, color: 'var(--color-neutral-400)', margin: '10px 0 4px' }}>Aucune réponse pour « {query} »</div>
        <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)', lineHeight: 1.6, marginBottom: 14 }}>
          Essaie un seul mot — « score », « sauvegarde », « scanner » — ou pose directement ta question au support.
        </div>
        <SecondaryButton icon="waveform" onClick={() => actions.openHelpTopic('support', '')} style={{ padding: '10px 14px' }}>
          Écrire au support
        </SecondaryButton>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
      <div className="section-label">{hits.length} réponse{hits.length > 1 ? 's' : ''}</div>
      {hits.map((h) => (
        <button key={`${h.kind}:${h.id}`} type="button" onClick={() => actions.openHelpTopic(h.kind, h.id)}
          className="row-card" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent-200)' }}>
            <Icon name={KIND_ICON[h.kind]} size={12} />{KIND_LABEL[h.kind]}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{h.titre}</span>
          <span style={{ fontSize: 11.5, color: 'var(--color-neutral-400)', lineHeight: 1.55 }}>{h.extrait}</span>
        </button>
      ))}
    </div>
  );
}

function Index() {
  const { state, actions } = useApp();

  return (
    <>
      <Section titre="Tutoriels interactifs">
        {TOURS.map((t) => (
          <Card key={t.id} icon={t.icon} titre={t.titre} sous={`${t.resume} · ${t.steps.length} étapes, ${t.duree}`}
            accent={t.id === 'decouverte' && !state.tourDone}
            onClick={() => actions.openHelpTopic('tuto', t.id)} />
        ))}
      </Section>

      <Section titre="Questions fréquentes">
        {FAQ_CATS.map((c) => {
          const n = faqByCat(c.key).length;
          return (
            <Card key={c.key} icon={c.icon} titre={c.label} sous={`${n} question${n > 1 ? 's' : ''}`}
              onClick={() => actions.openHelpTopic('cat', c.key)} />
          );
        })}
      </Section>

      <Section titre="Guides des écrans">
        <Card icon="books" titre="Tous les écrans, expliqués"
          sous={`${Object.keys(HELP).length} guides — le même texte que le « ? » en haut de chaque écran`}
          onClick={() => actions.openHelpTopic('ecrans', '')} />
      </Section>

      <Section titre="Toujours bloqué ?">
        <Card icon="waveform" titre="Contacter le support" accent
          sous={`Un mail à ${SUPPORT_EMAIL}, avec les infos de diagnostic jointes automatiquement`}
          onClick={() => actions.openHelpTopic('support', '')} />
      </Section>

      <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 11, color: 'var(--color-neutral-500)', lineHeight: 1.55 }}>
        <Icon name="info" size={14} style={{ flex: 'none', marginTop: 1 }} />
        <span>
          Le « ? » en haut de chaque écran explique l'écran affiché, et les petits (i) au fil de
          l'app détaillent un chiffre précis là où il apparaît.
        </span>
      </div>
    </>
  );
}

export default function Help() {
  const { state, actions } = useApp();
  const topic = state.helpTopic;
  const query = state.helpQuery;

  // Back goes up one level — from an answer to the index, from the index out of
  // the help centre — because a reader who opened three answers in a row does
  // not expect the first tap to throw the whole centre away.
  const back = () => (topic ? actions.closeHelpTopic() : actions.closeOverlay());

  return (
    <div className="overlay mscroll">
      <div className="overlay-header">
        <SecondaryButton icon="arrow-left" onClick={back} style={{ gap: 6 }}>
          {topic ? "Centre d'aide" : 'Retour'}
        </SecondaryButton>
      </div>

      <div className="overlay-body">
        {topic ? (
          <>
            {topic.kind === 'faq' && <FaqAnswer id={topic.id} />}
            {topic.kind === 'ecran' && <ScreenGuide id={topic.id} />}
            {topic.kind === 'tuto' && <TourIntro id={topic.id} />}
            {topic.kind === 'cat' && <CategoryList id={topic.id} />}
            {topic.kind === 'ecrans' && <ScreenList />}
            {topic.kind === 'support' && <SupportForm />}
          </>
        ) : (
          <>
            <h3 style={{ margin: '0 0 4px' }}>Centre d'aide</h3>
            <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', margin: '0 0 14px', lineHeight: 1.55 }}>
              {FAQ.length} questions fréquentes, {TOURS.length} tutoriels guidés et le contact du support —
              sans quitter l'application.
            </p>

            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Icon name="magnifying-glass" size={16} color="var(--color-neutral-500)"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                className="input"
                // Deliberately not type="search": Chromium draws its own clear
                // cross on top of the one below, and the two do not line up.
                type="text"
                value={query}
                onChange={(e) => actions.setHelpQuery(e.target.value)}
                placeholder="Chercher dans l'aide…"
                aria-label="Chercher dans l'aide"
                style={{ paddingLeft: 36, paddingRight: query ? 36 : 12 }}
              />
              {query && (
                <button type="button" onClick={() => actions.setHelpQuery('')} aria-label="Effacer la recherche"
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--color-neutral-400)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  <Icon name="x-circle" size={17} weight="fill" />
                </button>
              )}
            </div>

            {query.trim().length > 1 ? <Results query={query} /> : <Index />}
          </>
        )}
      </div>
    </div>
  );
}
