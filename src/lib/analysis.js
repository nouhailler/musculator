// Local "Analyse IA" engine. There's no LLM wired up in this build (no API
// key configured) — this computes a structured, personalized-looking
// analysis directly from the profile + today's session log, using the same
// shape the design intended for a real model response (resume/energie/
// tonus/progression/progressionTexte/aFaire/ameliorer). Swap the body of
// `generateAnalysis` for a real backend call later; callers don't change.

function intensityLabel(kcalPerMin) {
  if (kcalPerMin >= 10) return 'intensité élevée';
  if (kcalPerMin >= 6) return 'intensité modérée';
  return 'intensité légère';
}

export function generateAnalysis(profile, todayEntries, weekSessionsCount) {
  const totalTimeSec = todayEntries.reduce((a, j) => a + j.elapsedSec, 0);
  const totalMin = totalTimeSec / 60;
  const totalKcal = todayEntries.reduce((a, j) => a + j.kcal, 0);
  const totalSeries = todayEntries.reduce((a, j) => a + j.series, 0);
  const muscles = [...new Set(todayEntries.flatMap((j) => j.muscles))];
  const kcalPerMin = totalMin > 0 ? totalKcal / totalMin : 0;

  const freqTarget = profile?.frequence || 4;
  const freqRatio = Math.max(0, Math.min(1, weekSessionsCount / freqTarget));
  const volumeScore = Math.max(0, Math.min(1, totalSeries / 15));
  const progression = Math.round(100 * (0.6 * freqRatio + 0.4 * volumeScore));

  const prenom = profile?.prenom || 'Toi';
  const objectif = profile?.objectif || 'prise de masse';
  const poids = profile?.poids;
  const poidsCible = profile?.poidsCible;

  const resume = `${prenom}, belle journée : ${todayEntries.length} séance${todayEntries.length > 1 ? 's' : ''} pour ${Math.round(totalMin)} min d'effort au total, en cohérence avec ton objectif ${objectif.toLowerCase()}.`;

  const energie = `Environ ${totalKcal} kcal dépensées sur ${Math.round(totalMin)} min d'effort — ${intensityLabel(kcalPerMin)} (~${kcalPerMin.toFixed(1)} kcal/min).`;

  const tonus = muscles.length
    ? `Muscles sollicités : ${muscles.join(', ')}. ${totalSeries} séries au total — un bon stimulus pour l'hypertrophie sur ${muscles.length} groupe${muscles.length > 1 ? 's' : ''} musculaire${muscles.length > 1 ? 's' : ''}.`
    : "Aucun groupe musculaire identifié pour aujourd'hui.";

  const progressionTexte = progression >= 80
    ? 'Excellent rythme, tu es en avance sur ton objectif de la semaine.'
    : progression >= 45
      ? 'Tu es sur la bonne voie, continue sur ce rythme.'
      : 'Encore un peu de marge pour atteindre ton objectif de la semaine.';

  const aFaire = [];
  if (weekSessionsCount < freqTarget) {
    const remaining = freqTarget - weekSessionsCount;
    aFaire.push(`Vise encore ${remaining} séance${remaining > 1 ? 's' : ''} cette semaine pour atteindre ton objectif de ${freqTarget}/semaine.`);
  } else {
    aFaire.push(`Objectif de fréquence atteint (${freqTarget}/semaine) — maintiens ce rythme la semaine prochaine.`);
  }
  if (poids && poidsCible && poids !== poidsCible) {
    const gain = poidsCible > poids;
    aFaire.push(gain
      ? `Il te reste ${Math.abs(poidsCible - poids).toFixed(1)} kg à prendre : garde un léger surplus calorique et des apports en protéines suffisants.`
      : `Il te reste ${Math.abs(poidsCible - poids).toFixed(1)} kg à perdre : associe ce travail musculaire à un léger déficit calorique.`);
  }
  aFaire.push('Augmente progressivement séries ou répétitions sur tes exercices prioritaires.');

  const ameliorer = ['Soigne l\'exécution (amplitude complète) plutôt que la vitesse.', 'Respecte un repos suffisant entre les séries pour bien récupérer.'];
  if (totalMin > 0 && totalMin < 10) {
    ameliorer.push('Séance courte aujourd\'hui — pense à un vrai échauffement même sur une session express.');
  }

  return {
    resume, energie, tonus, progression,
    progressionTexte, aFaire, ameliorer: ameliorer.slice(0, 3),
  };
}
