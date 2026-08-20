// The legal notice, walked through end to end. Run with: npm run test:legal
//
// There is no unit test framework in this project, and the one thing that
// matters here cannot be unit-tested anyway: the notice has to appear on a
// device that has never seen the app, disappear for good once accepted, and
// stay reachable afterwards. That is a browser's answer to give.
//
// Needs a production build served on :4173 (`npm run build && npm run preview`).
// Unlike smoke.mjs this does not hard-code a Chromium path — Playwright's own
// resolution finds the browser wherever it was installed.
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:4173/';
const results = [];
const errors = [];

const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '  ✓' : '  ✗'} ${name}${detail && !ok ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch({ headless: true });

/** A fresh context is a device that has never run the app. */
async function device({ width = 390, height = 844, theme = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  if (theme) {
    // The app pre-applies the persisted theme in index.html, before first paint.
    await page.addInitScript((t) => {
      localStorage.setItem('musculator:v1', JSON.stringify({ theme: t }));
    }, theme);
  }
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  return { ctx, page };
}

const notice = (page) => page.locator('[role="dialog"][aria-modal="true"]');
const acked = (page) => page.evaluate(() => {
  const raw = localStorage.getItem('musculator:v1');
  return raw ? JSON.parse(raw) : null;
});

// 1 — first launch shows the notice.
{
  const { ctx, page } = await device();
  check('1. premier lancement : avertissement affiché', await notice(page).isVisible());
  check("   le titre « Information importante » est là",
    await page.getByRole('heading', { name: /Information importante/ }).isVisible());

  // 5 — « Voir les détails » reaches the full mentions, before accepting.
  await page.getByRole('button', { name: 'Voir les détails' }).click();
  await page.waitForTimeout(200);
  check('5. « Voir les détails » ouvre les mentions complètes',
    await page.getByText('Limitation de responsabilité').first().isVisible());

  // 10 — the app tracks a walk with the GPS, so the section must be there.
  const gps = await page.getByText('Précision de la localisation').count();
  check('10. section GPS présente (l\'app utilise la géolocalisation)', gps > 0);

  // Android back closes the details rather than leaving the app.
  await page.goBack();
  await page.waitForTimeout(200);
  check('   retour Android ferme les détails sans quitter',
    await page.getByRole('button', { name: 'Voir les détails' }).isVisible()
    && await notice(page).isVisible());

  // 9 — nothing overflows sideways at phone width.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check('9. aucun débordement horizontal (390 px)', overflow <= 0, `${overflow}px`);

  // 2 — « J'ai compris » dismisses it, and 3/4 — it stays dismissed.
  await page.getByRole('button', { name: "J'ai compris" }).click();
  await page.waitForTimeout(250);
  check('2. « J\'ai compris » referme l\'avertissement', !(await notice(page).isVisible()));

  const stored = await acked(page);
  check('   acceptation + version enregistrées localement',
    stored?.disclaimerAcked === true && typeof stored.legalVersion === 'string' && stored.legalVersion.length > 0,
    JSON.stringify({ ack: stored?.disclaimerAcked, v: stored?.legalVersion }));

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  check('3. après rechargement : pas de réapparition', !(await notice(page).isVisible()));

  // 6 — reachable for good, from the menu.
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  await page.waitForTimeout(200);
  await page.getByText('Mentions légales', { exact: true }).click();
  await page.waitForTimeout(250);
  check('6. accès permanent via le menu',
    await page.getByText('Limitation de responsabilité').first().isVisible());
  check('   limitation de responsabilité + éditeur affichés',
    (await page.getByText('Éditeur & contact').count()) > 0);
  await page.screenshot({ path: '/tmp/legal-01-mentions.png' });

  // 7 — clearing the storage brings the notice back.
  await page.evaluate(() => localStorage.removeItem('musculator:v1'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  check('7. storage effacé : l\'avertissement revient', await notice(page).isVisible());
  await page.screenshot({ path: '/tmp/legal-02-premier-lancement.png' });
  await ctx.close();
}

// 4 — a device that already accepted lands straight on the main screen.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('musculator:v1', JSON.stringify({ disclaimerAcked: true, legalVersion: '1.0' }));
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  check('4. nouvelle ouverture : arrivée directe sur l\'accueil',
    !(await notice(page).isVisible()) && (await page.getByText('Commencer une séance').count()) > 0);
  await ctx.close();
}

// 8 — both themes, since a hardcoded colour would only break in one of them.
for (const theme of ['dark', 'light']) {
  const { ctx, page } = await device({ theme });
  const ok = await page.evaluate(() => {
    const card = document.querySelector('.disclaimer-card');
    if (!card) return null;
    const parse = (c) => (c.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
    const lum = (rgb) => (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    const cs = getComputedStyle(card);
    return { texte: lum(parse(cs.color)), fond: lum(parse(cs.backgroundColor)) };
  });
  check(`8. thème ${theme} : texte lisible sur le fond`,
    !!ok && Math.abs(ok.texte - ok.fond) > 0.35, JSON.stringify(ok));
  await page.screenshot({ path: `/tmp/legal-03-theme-${theme}.png` });
  await ctx.close();
}

// 11 — the negative half of the GPS rule is a source invariant, not a browser
// one: check-catalogue fails if LEGAL_GPS is present without geolocation in
// src/. Asserted there rather than pretended here.
check('11. section GPS absente sans GPS — vérifié par check-catalogue', true);

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks OK`);
if (errors.length) {
  console.log(`${errors.length} erreur(s) console :`);
  errors.forEach((e) => console.log(' -', e));
}
process.exit(failed.length || errors.length ? 1 : 0);
