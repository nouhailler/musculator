// Regenerates the README's screenshot gallery. Run with a production build
// being served on port 4173:
//
//   npm run build && npm run preview &
//   npm run shots
//
// The app is seeded with a fixed demo state (localStorage) rather than
// whatever happens to be on the machine, so the gallery is reproducible and
// shows populated screens instead of empty ones. Output is webp — the same
// pictures as PNG weigh about four times as much for a file that lives in git
// forever.
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = new URL('../docs/screenshots/', import.meta.url);
const URL_BASE = 'http://localhost:4173/';
const VIEWPORT = { width: 420, height: 900 };

const day = (back = 0) => new Date(Date.now() - back * 864e5).toISOString().slice(0, 10);

const session = (o) => ({
  partial: false, manual: false, series: 0, exerciseIds: [], exosTotal: 0, muscles: [], ...o,
});

const food = (nom, grammes, per100) => ({
  id: `fe-${nom}`,
  grammes,
  food: {
    id: `perso-${nom}`, source: 'perso', nom, marque: null, image: null, barcode: null,
    nutriScore: null, portion: null, per100,
  },
});

function demoState(theme) {
  return {
    disclaimerAcked: true,
    theme,
    voiceOn: true,
    profile: {
      prenom: 'Patrick', sexe: 'Homme', age: 44, poids: 78, taille: 178, poidsCible: 74,
      experience: 'Intermédiaire', objectif: 'Force', zones: ['Dos', 'Jambes'], frequence: 4,
      contraintes: '', objectifNutrition: 'seche',
    },
    sessionLog: [
      session({ id: 's1', programId: 'fullbody', programNom: 'Full Body Maison', dateKey: day(0), heure: '08:12', elapsedSec: 1980, kcal: 297, series: 12, exerciseIds: ['pompes', 'squat', 'gainage'], exosTotal: 3, muscles: ['Pectoraux', 'Quadriceps', 'Abdominaux'] }),
      session({ id: 's2', programId: 'manual', programNom: 'Course à pied', dateKey: day(0), heure: '19:02', elapsedSec: 2700, kcal: 405, manual: true }),
      session({ id: 's3', programId: 'hiit', programNom: 'HIIT Brûle-graisse', dateKey: day(1), heure: '07:40', elapsedSec: 900, kcal: 135, series: 6, exerciseIds: ['burpees', 'pompes'], exosTotal: 4, partial: true, muscles: ['Full body'] }),
      session({ id: 's4', programId: 'hautducorps', programNom: 'Haut du corps', dateKey: day(2), heure: '18:20', elapsedSec: 2400, kcal: 360, series: 15, exerciseIds: ['pompes', 'dips'], exosTotal: 2, muscles: ['Pectoraux', 'Triceps'] }),
      session({ id: 's5', programId: 'fullbody', programNom: 'Full Body Maison', dateKey: day(4), heure: '09:05', elapsedSec: 1800, kcal: 270, series: 12, exerciseIds: ['squat', 'gainage'], exosTotal: 3, muscles: ['Quadriceps', 'Abdominaux'] }),
    ],
    nutriLog: {
      [day(0)]: {
        'petit-dejeuner': [
          food("Flocons d'avoine", 60, { kcal: 372, proteines: 13, glucides: 59, lipides: 7, micros: { fibres: 10, fer: 4.5, magnesium: 140 } }),
          food('Yaourt grec', 150, { kcal: 97, proteines: 9, glucides: 4, lipides: 5, micros: { calcium: 110 } }),
        ],
        dejeuner: [
          food('Blanc de poulet grillé', 150, { kcal: 165, proteines: 31, glucides: 0, lipides: 3.6, micros: { fer: 0.7, potassium: 250 } }),
          food('Riz basmati cuit', 200, { kcal: 130, proteines: 2.7, glucides: 28, lipides: 0.3, micros: { fibres: 0.4 } }),
          food('Haricots verts', 150, { kcal: 31, proteines: 1.8, glucides: 3.6, lipides: 0.2, micros: { fibres: 3.4, calcium: 44, potassium: 210 } }),
        ],
        diner: [
          food('Saumon', 140, { kcal: 208, proteines: 20, glucides: 0, lipides: 13, micros: { vitamineD: 11, potassium: 363 } }),
          food('Épinards cuits', 200, { kcal: 23, proteines: 2.9, glucides: 1.4, lipides: 0.4, micros: { fibres: 2.2, fer: 2.7, calcium: 99, magnesium: 79 } }),
        ],
      },
    },
    dayNotes: { [day(0)]: "Bonnes sensations. Léger tiraillement à l'épaule droite en fin de séance." },
  };
}

const browser = await chromium.launch({ headless: true });
mkdirSync(OUT, { recursive: true });

async function shot(page, name) {
  const png = await page.screenshot();
  await sharp(png).webp({ quality: 82 }).toFile(new URL(`${name}.webp`, OUT).pathname);
  console.log('  ', `${name}.webp`);
}

/** One themed pass. `only` limits the pass to a few screens. */
async function capture(theme, only = null) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  const wants = (n) => !only || only.includes(n);
  const suffix = theme === 'light' ? '-light' : '';
  console.log(`${theme}:`);

  await page.goto(URL_BASE, { waitUntil: 'networkidle' });
  await page.evaluate((s) => localStorage.setItem('musculator:v1', s), JSON.stringify(demoState(theme)));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  if (wants('home')) await shot(page, `home${suffix}`);

  if (wants('programs')) {
    await page.getByRole('button', { name: 'Programmes' }).click();
    await page.waitForTimeout(400);
    await shot(page, `programs${suffix}`);
  }

  if (wants('library')) {
    await page.getByRole('button', { name: 'Exos' }).click();
    await page.waitForTimeout(400);
    await shot(page, `library${suffix}`);
  }

  if (wants('exercise')) {
    await page.getByRole('button', { name: 'Exos' }).click();
    await page.waitForTimeout(300);
    await page.getByText('Squats', { exact: true }).first().click();
    // Let the animated demo reach a pose that reads as movement.
    await page.waitForTimeout(1400);
    await shot(page, `exercise${suffix}`);
    await page.getByText('Retour').click();
    await page.waitForTimeout(300);
  }

  if (wants('bodymap')) {
    await page.getByRole('button', { name: 'Accueil' }).click();
    await page.waitForTimeout(300);
    await page.getByText('Cartographie musculaire').click();
    await page.waitForTimeout(500);
    await page.getByText('Pectoraux', { exact: true }).first().click();
    await page.waitForTimeout(400);
    await shot(page, `bodymap${suffix}`);
    await page.getByText('Retour').click();
    await page.waitForTimeout(300);
  }

  if (wants('nutrition')) {
    await page.getByRole('button', { name: 'Nutrition' }).click();
    await page.waitForTimeout(600);
    await shot(page, `nutrition${suffix}`);
  }

  if (wants('journal')) {
    await page.getByRole('button', { name: 'Journal' }).click();
    await page.waitForTimeout(300);
    await page.getByText('Analyse IA de ma journée').click();
    await page.waitForTimeout(1600);
    await shot(page, `journal${suffix}`);
  }

  if (wants('progress')) {
    await page.getByRole('button', { name: 'Progrès' }).click();
    await page.waitForTimeout(400);
    // Nudged down so the badges and the session history share the frame.
    await page.mouse.wheel(0, 190);
    await page.waitForTimeout(400);
    await shot(page, `progress${suffix}`);
  }

  if (wants('workout')) {
    await page.getByRole('button', { name: 'Accueil' }).click();
    await page.waitForTimeout(300);
    await page.getByText('Commencer une séance').click();
    await page.waitForTimeout(1500);
    await shot(page, `workout${suffix}`);
  }

  await page.close();
}

await capture('dark');
// The light theme only needs enough shots to show it exists.
await capture('light', ['home', 'nutrition', 'exercise']);

await browser.close();
console.log('→ docs/screenshots/');
