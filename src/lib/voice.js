import { CUES, ENCOURAGEMENTS } from '../data/cues.js';

function pickVoice() {
  try {
    const vs = window.speechSynthesis.getVoices() || [];
    return vs.find((v) => /^fr/i.test(v.lang)) || null;
  } catch {
    return null;
  }
}

export function say(text, rate = 1.05) {
  if (!window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    u.rate = rate;
    const v = pickVoice();
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {
    // speech synthesis unsupported or blocked — coaching stays silent
  }
}

export function sayQueue(text, rate = 1.05) {
  if (!window.speechSynthesis) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    u.rate = rate;
    const v = pickVoice();
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {
    // ignore
  }
}

export function stopSpeaking() {
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}

// Runs the per-exercise spoken cadence ("En bas — En haut", encouragements
// every 9 beats…) until stopped. Returns a stop() function.
export function startCadence(exerciseId, exerciseNom) {
  const c = CUES[exerciseId] || { beat: 1500, seq: ['Allez', 'Continue'] };
  stopSpeaking();
  sayQueue(`${exerciseNom}, c'est parti !`);
  let i = -1;
  const timer = setInterval(() => {
    i++;
    if (i > 0 && i % 9 === 0) say(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
    else say(c.seq[i % c.seq.length]);
  }, c.beat);
  return () => clearInterval(timer);
}
