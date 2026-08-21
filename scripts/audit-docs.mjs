#!/usr/bin/env node
// Documentation coverage audit (DOCUMENTATION_SPEC.md §38) and link check (§47).
//
// The point of this script is that documentation rots silently. Nothing in a
// build fails when a new screen ships undocumented, a setting changes its
// default, or an error message is reworded — so this reads the *code* and
// asks the docs to account for it.
//
// It checks:
//   1. every screen of App.jsx is covered by a guide page (`couvre:` front matter)
//   2. every persisted setting appears in the settings reference
//   3. every browser capability the app uses is documented as a permission
//   4. every user-facing error message appears in the error reference
//   5. every https:// host reachable from src/ is named in the data chapter
//   6. the catalogue counts printed in the docs still match the catalogues
//   7. every internal link and anchor resolves
//   8. the in-app documentation reader is still wired to docs/
//   9. no secret-looking string made it into the docs (§50)
//
// Exit code 1 when anything is missing, so it can gate a build or a commit.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, normalize, sep } from 'node:path';
import { DOCS_DIR, listPages, parseFront, readPage, render } from './docs-lib.mjs';
import { resolveDocPath } from '../src/lib/markdown.js';

const problems = [];
const stats = [];
const fail = (cat, msg) => problems.push({ cat, msg });

const read = (p) => readFileSync(p, 'utf8');
const norm = (s) => s
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[’']/g, "'")
  .replace(/\s+/g, ' ')
  .toLowerCase()
  .trim();

function srcFiles(dir = 'src', out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) srcFiles(p, out);
    else if (/\.(js|jsx)$/.test(name)) out.push(p);
  }
  return out;
}

const SRC = srcFiles();
const ALL_SRC = SRC.map(read).join('\n');
const pages = listPages().map(readPage);
const pageByRel = new Map(pages.map((p) => [p.rel, p]));
const docText = (rel) => (pageByRel.has(rel) ? norm(pageByRel.get(rel).body) : '');

// --- 1. Screens ------------------------------------------------------------

const app = read(join('src', 'App.jsx'));
const keysOf = (re) => {
  const m = re.exec(app);
  if (!m) return [];
  return [...m[1].matchAll(/(\w+)\s*:/g)].map((x) => x[1]);
};
const screens = [
  ...keysOf(/const TAB_SCREENS = \{([\s\S]*?)\};/),
  ...keysOf(/const OVERLAYS = \{([\s\S]*?)\};/),
  // Rendered by their own conditionals rather than through OVERLAYS.
  ...[...app.matchAll(/state\.view === '(\w+)'/g)].map((m) => m[1]),
];
const uniqueScreens = [...new Set(screens)];

const covered = new Map();
for (const p of pages) {
  const { meta } = parseFront(read(p.file));
  if (!meta.couvre) continue;
  for (const key of meta.couvre.split(',').map((s) => s.trim()).filter(Boolean)) {
    covered.set(key, p.rel);
  }
}
const missingScreens = uniqueScreens.filter((k) => !covered.has(k));
for (const k of missingScreens) fail('Écrans', `écran « ${k} » non documenté (aucun \`couvre:\`)`);
for (const [k, rel] of covered) {
  if (!uniqueScreens.includes(k)) fail('Écrans', `${rel} déclare l'écran « ${k} », absent de App.jsx`);
}
stats.push(['Écrans', uniqueScreens.length - missingScreens.length, uniqueScreens.length]);

// --- 2. Settings -----------------------------------------------------------

const store = read(join('src', 'state', 'store.jsx'));
const profileBlock = /const defaultProfile = \{([\s\S]*?)\n\};/.exec(store);
const profileKeys = profileBlock
  ? [...profileBlock[1].matchAll(/(?:^|[\s{,])(\w+)\s*:/gm)].map((m) => m[1])
  : [];
const appSettings = ['voiceOn', 'theme', 'openrouter.key', 'openrouter.model'];
const settingsDoc = docText(join('reference', 'settings.md').split(sep).join('/'));
const settingKeys = [...new Set([...profileKeys, ...appSettings])];
const missingSettings = settingKeys.filter((k) => !settingsDoc.includes(norm(k)));
for (const k of missingSettings) {
  fail('Paramètres', `\`${k}\` absent de docs/reference/settings.md`);
}
stats.push(['Paramètres', settingKeys.length - missingSettings.length, settingKeys.length]);

// --- 3. Permissions / capabilities -----------------------------------------

const CAPABILITIES = [
  ['caméra', /getUserMedia|BarcodeDetector/, 'camera'],
  ['géolocalisation', /navigator\.geolocation/, 'position'],
  ['presse-papier', /navigator\.clipboard/, 'presse-papier'],
  ['partage de fichier', /navigator\.share/, 'partage'],
  ['plein écran', /requestFullscreen/, 'plein-ecran'],
  ['maintien de l’écran', /navigator\.wakeLock/, 'ecran-allume'],
  ['synthèse vocale', /speechSynthesis/, 'synthese-vocale'],
  ['stockage local', /localStorage/, 'stockage-local'],
];
const permDoc = pageByRel.get('permissions/index.md');
const permBody = permDoc ? permDoc.body : '';
const used = CAPABILITIES.filter(([, re]) => re.test(ALL_SRC));
const missingPerms = used.filter(([, , anchor]) => !permBody.includes(`{#${anchor}}`));
for (const [label] of missingPerms) fail('Permissions', `${label} utilisée dans src/ mais non documentée`);
// The reverse: a permission documented that the app no longer uses.
for (const [label, re, anchor] of CAPABILITIES) {
  if (permBody.includes(`{#${anchor}}`) && !re.test(ALL_SRC)) {
    fail('Permissions', `${label} documentée mais introuvable dans src/ (obsolète ?)`);
  }
}
stats.push(['Permissions', used.length - missingPerms.length, used.length]);

// --- 4. Error messages -----------------------------------------------------

// A message as written in the code, reduced to something a doc table can be
// searched for: interpolations dropped, everything after them ignored.
function messageStem(raw) {
  const cut = raw.split(/\$\{/)[0];
  const words = norm(cut).split(' ').filter(Boolean);
  return words.slice(0, 6).join(' ');
}

// Programmer invariants that can never reach a user. Listed explicitly, with
// the reason, rather than filtered by a guess about what "looks French".
const NOT_USER_FACING = new Set([
  'useApp must be used within AppProvider', // a React wiring mistake, not a runtime state
]);

const messages = new Set();
for (const file of SRC) {
  const text = read(file);
  for (const m of text.matchAll(/throw new Error\(\s*([`'"])([\s\S]*?)\1/g)) messages.add(m[2]);
  for (const m of text.matchAll(/setError\(\s*([`'"])([\s\S]*?)\1/g)) messages.add(m[2]);
}
for (const m of NOT_USER_FACING) messages.delete(m);
const errorDoc = docText('reference/errors.md');
const stems = [...messages]
  .map(messageStem)
  .filter((s) => s.split(' ').length >= 3);
const uniqueStems = [...new Set(stems)];
const missingErrors = uniqueStems.filter((s) => !errorDoc.includes(s));
for (const s of missingErrors) fail('Erreurs', `message « ${s}… » absent de docs/reference/errors.md`);
stats.push(['Erreurs', uniqueStems.length - missingErrors.length, uniqueStems.length]);

// --- 5. External hosts -----------------------------------------------------

// Same idea as check-catalogue's privacy grep: reaching a host the data
// chapter never names is a documentation failure, because that chapter is the
// only place a user can find out where their data goes.
const IGNORED_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com', 'github.com']);
const hosts = [...new Set(
  [...ALL_SRC.matchAll(/https:\/\/([a-z0-9.-]+)/g)].map((m) => m[1]),
)].filter((h) => !IGNORED_HOSTS.has(h));
const dataDoc = docText('data/index.md');
const missingHosts = hosts.filter((h) => !dataDoc.includes(norm(h)));
for (const h of missingHosts) fail('Données', `hôte ${h} joignable depuis src/ mais absent de docs/data/`);
stats.push(['Hôtes externes', hosts.length - missingHosts.length, hosts.length]);

// --- 6. Catalogue counts ---------------------------------------------------

const counts = await (async () => {
  const [ex, pr, mu, faq, tours, badges, nutri] = await Promise.all([
    import('../src/data/exercises.js'),
    import('../src/data/programs.js'),
    import('../src/data/muscles.js'),
    import('../src/data/faq.js'),
    import('../src/data/tours.js'),
    import('../src/data/badges.js'),
    import('../src/data/nutrition.js'),
  ]);
  const badgeList = badges.BADGE_DEFS || badges.BADGES || badges.default || [];
  return {
    Exercices: ex.EXERCISES.length,
    'Programmes du catalogue': pr.PROGRAMS.length,
    'Groupes musculaires': mu.MUSCLES.length,
    'Questions fréquentes': faq.FAQ.length,
    'Tutoriels interactifs': tours.TOURS.length,
    Badges: badgeList.length,
    'Repas par jour': nutri.MEALS.length,
    'Micronutriments suivis': nutri.MICROS.length,
  };
})();

const refIndex = pageByRel.get('reference/index.md');
const refBody = refIndex ? refIndex.body : '';
let countsOk = 0;
for (const [label, value] of Object.entries(counts)) {
  const row = new RegExp(`^\\|\\s*${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^|]*\\|\\s*(\\d+)`, 'mi');
  const m = row.exec(refBody);
  if (!m) fail('Chiffres', `« ${label} » absent du tableau de docs/reference/index.md`);
  else if (Number(m[1]) !== value) {
    fail('Chiffres', `« ${label} » : la doc dit ${m[1]}, le code dit ${value}`);
  } else countsOk++;
}
// The exercise count is quoted in prose in several pages; catch drift there too.
const wrongCounts = pages.filter((p) => /\b(1[0-9]{2})\s+exercices/.test(p.body)
  && !new RegExp(`\\b${counts.Exercices}\\s+exercices`).test(p.body));
for (const p of wrongCounts) {
  fail('Chiffres', `${p.rel} cite un nombre d'exercices qui n'est plus ${counts.Exercices}`);
}
stats.push(['Chiffres du catalogue', countsOk, Object.keys(counts).length]);

// --- 7. Links and anchors --------------------------------------------------

const anchorsOf = (p) => {
  const set = new Set(render(p.body).headings.map((h) => h.id));
  for (const m of p.body.matchAll(/\{#([A-Za-z0-9_-]+)\}/g)) set.add(m[1]);
  for (const m of p.body.matchAll(/id="([A-Za-z0-9_-]+)"/g)) set.add(m[1]);
  return set;
};
const anchorCache = new Map(pages.map((p) => [p.rel, anchorsOf(p)]));

let linkCount = 0;
let linkBad = 0;
for (const p of pages) {
  for (const m of p.body.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)) {
    const href = m[1];
    if (/^(https?:|mailto:)/.test(href)) continue;
    linkCount++;
    // Resolved with the very function the in-app reader uses, so a link that
    // passes here cannot be a dead end inside the application.
    const { rel: targetRel, hash } = resolveDocPath(p.rel, href);
    if (!pageByRel.has(targetRel)) {
      // Might be an image or another asset rather than a page.
      if (existsSync(join(DOCS_DIR, targetRel))) continue;
      linkBad++;
      fail('Liens', `${p.rel} → ${href} (page inexistante)`);
      continue;
    }
    if (hash && !anchorCache.get(targetRel).has(hash)) {
      linkBad++;
      fail('Liens', `${p.rel} → ${href} (ancre inexistante)`);
    }
  }
  // Images must exist on disk.
  for (const m of p.body.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)) {
    if (/^https?:/.test(m[1])) continue;
    const img = normalize(join(DOCS_DIR, dirname(p.rel), m[1]));
    if (!existsSync(img)) fail('Images', `${p.rel} → ${m[1]} (fichier manquant)`);
  }
}
stats.push(['Liens internes', linkCount - linkBad, linkCount]);

// --- 8. The in-app documentation reader ------------------------------------

// The documentation is readable inside the app as well as on the site, from
// the same files. These are the joints that make that true, and none of them
// fails loudly on its own.
const APP_WIRING = [
  [
    "src/data/docs.js lit docs/ directement",
    () => read(join('src', 'data', 'docs.js')).includes("import.meta.glob('../../docs/**/*.md'"),
    "sans ce glob, l'app lirait une copie qui pourrait diverger de docs/",
  ],
  [
    'le lecteur est atteignable depuis le menu',
    () => /key: 'documentation'/.test(read(join('src', 'components', 'Drawer.jsx'))),
    'un écran que rien n\'ouvre n\'existe pas pour l\'utilisateur',
  ],
  [
    'la documentation reste un chunk paresseux',
    // Naming it in `manualChunks` turns it into a manual chunk, which Vite
    // then `modulepreload`s from index.html — 236 KB downloaded on every cold
    // start for a screen most sessions never open. Verified both ways.
    () => !/manualChunks[\s\S]*?return 'docs'/.test(read('vite.config.js')),
    "ne nomme pas 'docs' dans manualChunks : l'import dynamique suffit",
  ],
];
for (const [label, check, why] of APP_WIRING) {
  if (!check()) fail('Application', `${label} — ${why}`);
}
stats.push(['Câblage app', APP_WIRING.filter(([, c]) => c()).length, APP_WIRING.length]);

// --- 9. Secrets (§50) ------------------------------------------------------

const SECRET_PATTERNS = [
  [/sk-or-v1-[A-Za-z0-9]/i, 'clé OpenRouter réelle'],
  [/\bAPI_KEY\s*=\s*["'][^"']+/i, 'API_KEY renseignée'],
  [/\bPASSWORD\s*[:=]\s*["'][^"']+/i, 'mot de passe'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'clé privée'],
  [/\bBearer\s+[A-Za-z0-9._-]{16,}/, 'jeton Bearer'],
];
for (const p of pages) {
  for (const [re, label] of SECRET_PATTERNS) {
    if (re.test(p.body)) fail('Secrets', `${p.rel} contient un ${label}`);
  }
}

// --- 10. Structure (§3, §7) -------------------------------------------------

const REQUIRED = [
  'index.md', 'getting-started/index.md', 'guide/index.md', 'features/index.md',
  'settings/index.md', 'permissions/index.md', 'data/index.md', 'offline/index.md',
  'troubleshooting/index.md', 'faq/index.md', 'reference/index.md',
  'reference/settings.md', 'reference/errors.md', 'reference/glossary.md',
  'reference/compatibility.md', 'reference/limitations.md',
  'versions/index.md', 'legal/index.md', 'support/index.md',
];
const missingPages = REQUIRED.filter((r) => !pageByRel.has(r));
for (const r of missingPages) fail('Pages', `page obligatoire manquante : docs/${r}`);
stats.push(['Pages obligatoires', REQUIRED.length - missingPages.length, REQUIRED.length]);

// Front matter is what the generator and this audit both read.
for (const p of pages) {
  if (!p.description) fail('Métadonnées', `${p.rel} n'a pas de \`description:\``);
  const h1 = (p.body.match(/^#\s+/gm) || []).length;
  if (h1 !== 1) fail('Métadonnées', `${p.rel} a ${h1} titre(s) H1 (il en faut exactement 1)`);
}

// --- Report ----------------------------------------------------------------

const pad = (s, n) => String(s).padEnd(n);
console.log('\nDOCUMENTATION AUDIT\n');
console.log(`Pages           : ${pages.length}`);
for (const [label, ok, total] of stats) {
  const mark = ok === total ? '' : '  ⟵ incomplet';
  console.log(`${pad(label, 16)}: ${ok} / ${total}${mark}`);
}

if (!problems.length) {
  console.log('\nSTATUT : ✅ DOCUMENTATION COMPLÈTE\n');
  process.exit(0);
}

console.log(`\nSTATUT : ⚠️  DOCUMENTATION INCOMPLÈTE — ${problems.length} point(s)\n`);
const byCat = new Map();
for (const { cat, msg } of problems) {
  if (!byCat.has(cat)) byCat.set(cat, []);
  byCat.get(cat).push(msg);
}
for (const [cat, msgs] of byCat) {
  console.log(`${cat} (${msgs.length})`);
  for (const m of msgs) console.log(`  - ${m}`);
  console.log('');
}
process.exit(1);
