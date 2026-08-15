// Writes PROMPT-REPAS.md from the prompt the app itself ships, so the file at
// the root is a mirror and never a second source of truth. Run with:
//   node scripts/gen-prompt.mjs
//
// The prompt interpolates the meal keys and micronutrient list from
// src/data/nutrition.js, which is exactly why this is generated rather than
// copied by hand: adding a meal or a micronutrient would otherwise leave the
// markdown quietly describing a format the parser no longer reads.
import { writeFileSync } from 'node:fs';
import { MEAL_IMPORT_PROMPT } from '../src/lib/mealPrompt.js';

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
