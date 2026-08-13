import { chromium } from 'playwright';

const errors = [];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

async function shot(name) {
  await page.screenshot({ path: `/tmp/shot-${name}.png` });
  console.log('shot:', name);
}

await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
await shot('01-disclaimer');

await page.getByText("J'ai compris").click();
await page.waitForTimeout(200);
await shot('02-home');

// Home -> body map
await page.getByText('Cartographie musculaire').click();
await page.waitForTimeout(200);
await shot('03-bodymap');
await page.getByText('Pectoraux', { exact: true }).click();
await page.waitForTimeout(200);
await shot('04-bodymap-muscle');
await page.getByText('Retour').click();

// Tabs
await page.getByRole('button', { name: 'Programmes' }).click();
await page.waitForTimeout(150);
await shot('05-programs');
await page.getByRole('button', { name: 'Exos' }).click();
await page.waitForTimeout(150);
await shot('06-library');
await page.getByText('Pompes', { exact: true }).first().click();
await page.waitForTimeout(150);
await shot('07-exercise-detail');
await page.getByText('Retour').click();

await page.getByRole('button', { name: 'Journal' }).click();
await page.waitForTimeout(150);
await shot('08-journal-empty');
await page.getByRole('button', { name: 'Progrès' }).click();
await page.waitForTimeout(150);
await shot('09-progress');

// Full workout flow
await page.getByRole('button', { name: 'Accueil' }).click();
await page.waitForTimeout(150);
await page.getByText('Commencer une séance').click();
await page.waitForTimeout(300);
await shot('10-workout-exercise');

for (let ex = 0; ex < 5; ex++) {
  for (let set = 0; set < 4; set++) {
    const btn = page.locator('button', { hasText: /Série terminée|Exercice terminé|Terminer la séance/ });
    if (await btn.count() === 0) break;
    await btn.first().click();
    await page.waitForTimeout(100);
    const skip = page.locator('button', { hasText: 'Passer' });
    if (await skip.count() > 0) { await skip.first().click(); await page.waitForTimeout(100); }
  }
}
await page.waitForTimeout(300);
await shot('11-workout-complete');
await page.getByText('Terminer').click();
await page.waitForTimeout(200);
await shot('12-home-after-session');

await page.getByRole('button', { name: 'Journal' }).click();
await page.waitForTimeout(150);
await shot('13-journal-with-session');
await page.getByText('Analyse IA de ma journée').click();
await page.waitForTimeout(1300);
await shot('14-journal-analysis');

await browser.close();

console.log('CONSOLE ERRORS:', errors.length);
errors.forEach((e) => console.log(' -', e));
process.exit(errors.length > 0 ? 1 : 0);
