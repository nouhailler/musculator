// Voice-coach cadence — ported from the prototype (CUES + ENCOUR).
// `beat` is the milliseconds between spoken cues while the set is running.
export const CUES = {
  pompes: { beat: 1500, seq: ['En bas', 'En haut'] },
  squats: { beat: 1500, seq: ['Descends', 'Remonte'] },
  gainage: { beat: 4000, seq: ['Gaine', 'Tiens bon', 'Respire', 'Reste solide'] },
  abdos: { beat: 1300, seq: ['Monte', 'Relâche'] },
  tractions: { beat: 2000, seq: ['Tire', 'Descends'] },
  fentes: { beat: 1600, seq: ['Descends', 'Pousse'] },
  dips: { beat: 1500, seq: ['En bas', 'En haut'] },
  developpe: { beat: 1500, seq: ['Pousse', 'Descends'] },
  rowing: { beat: 1500, seq: ['Tire', 'Relâche'] },
  mountain: { beat: 750, seq: ['Droite', 'Gauche'] },
};

export const ENCOURAGEMENTS = [
  'Allez, continue !', 'Tu gères !', 'Encore un effort !', 'Beau boulot !',
  'Ne lâche rien !', 'Respire bien !', 'Reste concentré !',
];
