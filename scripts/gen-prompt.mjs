// Writes PROMPT-REPAS.md and PROMPT-PROGRAMME.md from the prompts the app
// itself ships, so the files at the root are mirrors and never a second source
// of truth. Run with:
//   node scripts/gen-prompt.mjs
//
// The prompt interpolates the meal keys and micronutrient list from
// src/data/nutrition.js, which is exactly why this is generated rather than
// copied by hand: adding a meal or a micronutrient would otherwise leave the
// markdown quietly describing a format the parser no longer reads.
import { writeFileSync } from 'node:fs';
import { MEAL_IMPORT_PROMPT } from '../src/lib/mealPrompt.js';
import { PROGRAM_IMPORT_PROMPT } from '../src/lib/programPrompt.js';

const OUT = new URL('../PROMPT-REPAS.md', import.meta.url);

// The prompt contains ```json blocks of its own, so the fence around it has to
// be longer than the ones it nests.
const doc = `# Prompt — repas dictés

Le prompt à donner à un assistant conversationnel (Claude, ChatGPT…) pour qu'il transforme
une description orale de repas en JSON importable dans Musculator.

> Fichier généré par \`npm run gen-prompt\` depuis \`src/lib/mealPrompt.js\`, la seule source.
> Ne pas l'éditer à la main : le prompt tire ses clés de repas et sa liste de micronutriments
> de \`src/data/nutrition.js\`, et cette copie doit les suivre.

## Utilisation

1. Copie le prompt ci-dessous — ou, dans l'app, ouvre **Nutrition → Importer un repas dicté →
   « Comment générer ce JSON ? » → Copier le prompt**.
2. Colle-le dans les instructions d'un **Projet Claude** ou d'un **GPT personnalisé** pour ne le
   coller qu'une fois. Un simple message en début de conversation marche aussi.
3. Décris tes repas à la voix. L'assistant répond par un bloc JSON.
4. Recopie ce bloc dans **Nutrition → Importer un repas dicté**, prévisualise, importe.

Le format tient en une règle : \`grammes\` décrit la portion, \`pour100g\` décrit l'aliment. C'est
la forme que stocke le journal, donc la quantité importée reste modifiable et tout se recalcule.
Le collage tolère les phrases et les balises de code autour du JSON.

## Le prompt

\`\`\`\`text
${MEAL_IMPORT_PROMPT}
\`\`\`\`
`;

writeFileSync(OUT, doc);
console.log(`PROMPT-REPAS.md écrit (${doc.length} caractères).`);

const PROG_OUT = new URL('../PROMPT-PROGRAMME.md', import.meta.url);

const progDoc = `# Prompt — programme dicté

Le prompt à donner à un assistant conversationnel pour qu'il compose un programme
d'entraînement importable dans Musculator.

> Fichier généré par \`npm run gen-prompt\` depuis \`src/lib/programPrompt.js\`, la seule source.
> Ne pas l'éditer à la main : le prompt embarque le catalogue des 45 exercices, dérivé de
> \`src/data/exercises.js\`, et cette copie doit le suivre.

## Utilisation

1. Copie le prompt ci-dessous — ou, dans l'app, ouvre **Programmes → Importer un programme
   dicté → « Comment générer ce JSON ? » → Copier le prompt**.
2. Colle-le dans les instructions d'un **Projet Claude** ou d'un **GPT personnalisé**.
3. Demande ton programme (« recomposition, 3 séances par semaine, à la maison avec haltères »).
4. Recopie le bloc JSON dans **Programmes → Importer un programme dicté**, prévisualise, importe.

Chaque séance du plan devient une séance perso, avec ses séries, répétitions, charges et temps
de repos. Le point non négociable : **l'assistant choisit dans le catalogue**, il n'invente pas
d'exercice — sinon la séance perdrait sa démonstration animée, son coach vocal et sa place dans
la cartographie musculaire. Un mouvement absent du catalogue est remplacé par le plus proche
travaillant le même muscle, et l'aperçu le dit avant l'import.

## Le prompt

\`\`\`\`text
${PROGRAM_IMPORT_PROMPT}
\`\`\`\`
`;

writeFileSync(PROG_OUT, progDoc);
console.log(`PROMPT-PROGRAMME.md écrit (${progDoc.length} caractères).`);
