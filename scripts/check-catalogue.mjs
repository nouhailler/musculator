// Checks the catalogue's invariants. Run with: npm run check-catalogue
//
// CLAUDE.md documents a dozen rules that hold the content together — every id
// referenced somewhere must exist in exercises.js, every icon slug must be
// registered, every exercise needs a demo and voice cues, `mat` uses a closed
// vocabulary — and until now nothing enforced any of them. They held because
// the catalogue was written in one go; they will not hold while it grows.
//
// Reads the data modules directly and greps the two files that are code rather
// than data (the icon registry and the body map's zones), so a rule can only
// pass by actually being satisfied.
import { readdirSync, readFileSync } from 'node:fs';

const { EXERCISES, PATTERNS } = await import('../src/data/exercises.js');
const { PROGRAMS } = await import('../src/data/programs.js');
const { MUSCLES, ZONES } = await import('../src/data/muscles.js');
const { DEMOS } = await import('../src/data/demos.js');
const { CUES } = await import('../src/data/cues.js');
const { BADGE_DEFS } = await import('../src/data/badges.js');
const { solve } = await import('../src/lib/pose.js');

const { MEALS } = await import('../src/data/nutrition.js');

const problems = [];
const fail = (rule, detail) => problems.push(`${rule}: ${detail}`);

const ids = EXERCISES.map((e) => e.id);
const idSet = new Set(ids);

// --- Exercises -------------------------------------------------------------

const MAT = new Set(['Sans matériel', 'Haltères', 'Élastique', 'Salle', 'Maison']);
const NIVEAUX = new Set(['Débutant', 'Intermédiaire', 'Avancé']);
const REQUIRED = [
  'nom', 'muscle', 'primaire', 'niveau', 'mat', 'series', 'reps', 'repos', 'icon',
  'desc', 'conseils', 'depart', 'mouvement', 'respiration', 'erreurs',
  'sollicitation', 'surcharge',
];

const seen = new Set();
for (const e of EXERCISES) {
  const where = `exercise "${e.id}"`;
  if (seen.has(e.id)) fail('duplicate id', e.id);
  seen.add(e.id);

  for (const field of REQUIRED) {
    const v = e[field];
    const empty = v == null || v === '' || (Array.isArray(v) && !v.length);
    if (empty) fail('missing field', `${where} has no "${field}"`);
  }
  if (!NIVEAUX.has(e.niveau)) fail('niveau', `${where} has "${e.niveau}"`);
  for (const m of e.mat || []) if (!MAT.has(m)) fail('mat vocabulary', `${where} uses "${m}"`);
  if (e.pattern && !PATTERNS.includes(e.pattern)) fail('pattern', `${where} uses "${e.pattern}"`);
  for (const s of e.similaires || []) {
    if (!idSet.has(s)) fail('broken similaire', `${where} points at "${s}"`);
    if (s === e.id) fail('self similaire', where);
  }
  // Both are user-facing prose and answer different questions; a copy-paste
  // between them is the failure mode worth catching.
  if (e.sollicitation && e.sollicitation === e.surcharge) fail('duplicate prose', `${where} has the same sollicitation and surcharge`);
}

// --- Cross-references ------------------------------------------------------

for (const id of ids) {
  if (!DEMOS[id]) fail('missing demo', `"${id}" has no entry in demos.js`);
  if (!CUES[id]) fail('missing cues', `"${id}" has no entry in cues.js`);
}
for (const id of Object.keys(DEMOS)) if (!idSet.has(id)) fail('orphan demo', id);
for (const id of Object.keys(CUES)) if (!idSet.has(id)) fail('orphan cue', id);

for (const m of MUSCLES) {
  for (const id of m.exos) if (!idSet.has(id)) fail('broken muscle exo', `muscle "${m.id}" points at "${id}"`);
}
const inAMuscle = new Set(MUSCLES.flatMap((m) => m.exos));
for (const id of ids) {
  if (!inAMuscle.has(id)) fail('unreachable exercise', `"${id}" belongs to no muscle, so the body map cannot surface it`);
}
for (const p of PROGRAMS) {
  for (const id of p.exos) if (!idSet.has(id)) fail('broken program exo', `program "${p.id}" points at "${id}"`);
  if (!p.exos.length) fail('empty program', p.id);
}

// The zone bridge only works if every muscle name it lists is one an exercise
// actually records — otherwise a priority zone can never be hit.
const musclesLogged = new Set(EXERCISES.map((e) => e.muscle.split(' · ')[0]));
for (const z of ZONES) {
  const known = z.muscles.filter((m) => musclesLogged.has(m));
  if (!known.length) fail('unreachable zone', `"${z.label}" lists no muscle any exercise records`);
}

// --- Voice cues ------------------------------------------------------------

for (const [id, cue] of Object.entries(CUES)) {
  if (!Array.isArray(cue.seq) || !cue.seq.length) fail('empty cue', id);
  if (!(cue.beat > 0)) fail('cue beat', `"${id}" has no positive beat`);
  // `say()` cancels whatever is still speaking, so a cue longer than one beat
  // is cut off by the next one.
  for (const line of cue.seq || []) {
    if (String(line).split(/\s+/).length > 4) fail('long cue', `"${id}" says "${line}" — keep it to three words`);
  }
}

// --- Demos -----------------------------------------------------------------

const points = (frame) => {
  const j = solve(frame);
  return [...j.neck, ...j.torso, ...j.arm, ...j.armB, ...j.leg, ...j.legB];
};

for (const [id, demo] of Object.entries(DEMOS)) {
  if (!Array.isArray(demo.frames) || !demo.frames.length) fail('empty demo', id);
  // Two failure modes worth catching in a demo written in a batch: one where
  // nothing moves (copy-pasted keyframes), and one where the figure floats
  // above the floor it is supposed to be standing or lying on.
  // An isometric hold is motionless on purpose, and says so by setting its own
  // `cycle` — there is no rep tempo for it to borrow from the voice cadence.
  if ((demo.frames || []).length >= 2 && demo.cycle == null) {
    const [a, b] = [points(demo.frames[0]), points(demo.frames[1])];
    const travel = a.reduce((sum, [x, y], i) => sum + Math.hypot(x - b[i][0], y - b[i][1]), 0);
    if (travel < 8) fail('motionless demo', `"${id}" barely moves between its first two frames`);
  }
  // There is deliberately no "the figure must touch the floor" rule: contact
  // is not the lowest point once props exist — a glute-ham raise hangs below
  // the pad it kneels on — and the version that tried produced false alarms on
  // two sound demos out of forty-nine. A check that cries wolf gets ignored.
  for (const f of demo.frames || []) {
    // A pose is `hip: [x, y]` plus one angle per joint (see demos.js).
    if (!Array.isArray(f.hip) || f.hip.length !== 2 || f.hip.some((n) => typeof n !== 'number')) {
      fail('demo frame', `"${id}" has a frame whose hip is not [x, y]`);
    }
    if (typeof f.torso !== 'number') fail('demo frame', `"${id}" has a frame without a torso angle`);
  }
}

// --- Icons -----------------------------------------------------------------

const registry = readFileSync(new URL('../src/components/ui/Icon.jsx', import.meta.url), 'utf8');
// The registry packs several entries per line, so this matches pairs anywhere
// rather than at the start of a line.
const registered = new Set([...registry.matchAll(/(?:^|[{,]\s*)'?([a-z][a-z0-9-]*)'?\s*:\s*[A-Z]/g)].map((m) => m[1]));
const iconUsers = [
  ...EXERCISES.map((e) => [`exercise "${e.id}"`, e.icon]),
  ...PROGRAMS.map((p) => [`program "${p.id}"`, p.icon]),
  ...BADGE_DEFS.map((b) => [`badge "${b.id}"`, b.icon]),
  ...MEALS.map((m) => [`meal "${m.key}"`, m.icon]),
];
for (const [where, icon] of iconUsers) {
  if (icon && !registered.has(icon)) fail('unregistered icon', `${where} uses "${icon}" — add it to Icon.jsx`);
}

// --- Body map zones --------------------------------------------------------

const bodyMap = readFileSync(new URL('../src/overlays/BodyMap.jsx', import.meta.url), 'utf8');
for (const m of MUSCLES) {
  if (!new RegExp(`id: '${m.id}'`).test(bodyMap)) {
    fail('muscle without zone', `"${m.id}" has no zone in BodyMap.jsx, so it cannot be selected`);
  }
}

// --- Help, FAQ, tutorials, tooltips ----------------------------------------
//
// The help is content like the catalogue is content, and it rots the same way:
// a renamed screen leaves a FAQ answer pointing nowhere, a moved element leaves
// a tour step highlighting nothing, a deleted `<Tip>` leaves an orphan entry.
// None of that throws at runtime — it just quietly stops helping.

const { HELP } = await import('../src/data/help.js');
const { FAQ, FAQ_CATS } = await import('../src/data/faq.js');
const { TOURS } = await import('../src/data/tours.js');
const { TIPS } = await import('../src/data/tips.js');

// Every source file, read once: the anchors and the <Tip> call sites are code,
// not data, so they can only be verified by looking at the code.
function sourceFiles(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...sourceFiles(full));
    else if (/\.jsx?$/.test(e.name)) out.push(full);
  }
  return out;
}
const srcDir = new URL('../src', import.meta.url).pathname;
const sources = sourceFiles(srcDir).map((f) => readFileSync(f, 'utf8')).join('\n');

// The screens the app can actually be on, read from App.jsx so a renamed
// screen breaks here rather than in a dead link.
const appJsx = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const mapKeys = (name) => {
  const block = appJsx.match(new RegExp(`const ${name} = \\{([^}]*)\\}`, 's'));
  return new Set(block ? [...block[1].matchAll(/(\w+):/g)].map((m) => m[1]) : []);
};
const TABS = mapKeys('TAB_SCREENS');
const VIEWS = mapKeys('OVERLAYS');
const tourIds = new Set(TOURS.map((t) => t.id));

// `workout` and `complete` render outside the OVERLAYS map, through their own
// conditionals in App.jsx. They may carry help — the session's is reached from
// the pause sheet, since the top bar hides itself there — but nothing requires
// it, which is why they are listed rather than parsed.
const OUTSIDE = new Set(['workout', 'complete']);
for (const key of [...TABS, ...VIEWS]) {
  if (!HELP[key]) fail('screen without help', `"${key}" has no entry in help.js`);
}
for (const key of Object.keys(HELP)) {
  if (!TABS.has(key) && !VIEWS.has(key) && !OUTSIDE.has(key)) {
    fail('orphan help', `help.js has "${key}", which is neither a tab nor an overlay`);
  }
}

const catKeys = new Set(FAQ_CATS.map((c) => c.key));
for (const c of FAQ_CATS) {
  if (c.icon && !registered.has(c.icon)) fail('unregistered icon', `FAQ category "${c.key}" uses "${c.icon}" — add it to Icon.jsx`);
}

const faqIds = new Set();
for (const f of FAQ) {
  const where = `FAQ "${f.id}"`;
  if (faqIds.has(f.id)) fail('duplicate id', `FAQ "${f.id}"`);
  faqIds.add(f.id);
  if (!f.q || !Array.isArray(f.r) || !f.r.length) fail('empty FAQ', where);
  if (!catKeys.has(f.cat)) fail('unknown category', `${where} is in "${f.cat}"`);
  const l = f.lien;
  if (l) {
    if (!l.label) fail('link without label', where);
    if (l.tab && !TABS.has(l.tab)) fail('broken link', `${where} points at tab "${l.tab}"`);
    if (l.view && !VIEWS.has(l.view)) fail('broken link', `${where} points at view "${l.view}"`);
    if (l.tour && !tourIds.has(l.tour)) fail('broken link', `${where} points at tour "${l.tour}"`);
    if (!l.tab && !l.view && !l.tour) fail('empty link', where);
  }
}

// Anchors written literally, plus the tab bar's computed ones — the only place
// a `data-tour` is built rather than spelled out.
const anchors = new Set([...sources.matchAll(/data-tour="([\w-]+)"/g)].map((m) => m[1]));
if (/data-tour=\{`tab-\$\{/.test(sources)) for (const t of TABS) anchors.add(`tab-${t}`);

const tourSeen = new Set();
for (const t of TOURS) {
  const where = `tour "${t.id}"`;
  if (tourSeen.has(t.id)) fail('duplicate id', where);
  tourSeen.add(t.id);
  if (t.icon && !registered.has(t.icon)) fail('unregistered icon', `${where} uses "${t.icon}"`);
  if (!t.steps?.length) fail('empty tour', where);
  for (const [i, s] of (t.steps || []).entries()) {
    const at = `${where} step ${i + 1}`;
    if (!s.titre || !s.texte) fail('empty step', at);
    if (s.tab && !TABS.has(s.tab)) fail('broken step', `${at} goes to tab "${s.tab}"`);
    if (s.view && !VIEWS.has(s.view)) fail('broken step', `${at} goes to view "${s.view}"`);
    if (s.cible && !anchors.has(s.cible)) {
      fail('missing anchor', `${at} points at data-tour="${s.cible}", which no component carries`);
    }
  }
}

// A tip nobody renders is a tip nobody reads.
const tipUses = new Set([...sources.matchAll(/<Tip\s+id="(\w+)"/g)].map((m) => m[1]));
for (const [id, tip] of Object.entries(TIPS)) {
  if (!tipUses.has(id)) fail('unused tip', `"${id}" is defined in tips.js but rendered nowhere`);
  if (tip.faq && !faqIds.has(tip.faq)) fail('broken tip link', `"${id}" points at FAQ "${tip.faq}"`);
  if (!tip.titre || !tip.texte) fail('empty tip', `"${id}"`);
}
for (const id of tipUses) {
  if (!TIPS[id]) fail('unknown tip', `<Tip id="${id}"> has no entry in tips.js`);
}

// --- Report ----------------------------------------------------------------

console.log(`${EXERCISES.length} exercises · ${Object.keys(DEMOS).length} demos · ${Object.keys(CUES).length} cues · ${MUSCLES.length} muscles · ${PROGRAMS.length} programs`);
if (problems.length) {
  console.error(`\n${problems.length} problem${problems.length > 1 ? 's' : ''}:`);
  for (const p of problems) console.error('  ✗', p);
  process.exit(1);
}
console.log('✓ catalogue consistent');
