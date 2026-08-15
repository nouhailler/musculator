// Local "Analyse IA des progrès" engine.
//
// Where lib/analysis.js reads one day, this one reads the trend and answers a
// different question: is what you are actually doing taking you towards what
// you said you wanted? So it is the profile's *objectives* that frame it —
// objectif principal, zones prioritaires, objectif nutrition and the daily
// targets, plus any constraint or injury declared.
//
// Everything here is measured, never assumed: a component with no data says so
// and leaves the score rather than counting as a zero. The output shape is
// shared with the OpenRouter engine (lib/openrouter.js) so the screen cannot
// tell which one answered.
import { ZONES, sessionHitsZone } from '../data/muscles.js';
import { MEALS } from '../data/nutrition.js';
import { dateKey, daysBetween } from './format.js';
import { totals } from './macros.js';

export const WINDOW_DAYS = 28;

const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
const plural = (n, one, many = `${one}s`) => `${n} ${n > 1 ? many : one}`;

/**
 * The numbers the analysis is built on. Exported because the OpenRouter engine
 * sends exactly these to the model — one measurement, two writers.
 */
export function progressStats({ profile, sessionLog, nutriLog, targets }) {
  const p = profile || {};
  const log = sessionLog || [];
  const inWindow = (s, from, to) => {
    const d = daysBetween(s.dateKey);
    return d >= from && d < to;
  };
  const recent = log.filter((s) => inWindow(s, 0, WINDOW_DAYS));
  const previous = log.filter((s) => inWindow(s, WINDOW_DAYS, WINDOW_DAYS * 2));

  const sum = (list, key) => list.reduce((a, s) => a + (s[key] || 0), 0);
  const semaines = WINDOW_DAYS / 7;

  const seances = { recent: recent.length, previous: previous.length };
  const series = { recent: sum(recent, 'series'), previous: sum(previous, 'series') };
  const minutes = {
    recent: Math.round(sum(recent, 'elapsedSec') / 60),
    previous: Math.round(sum(previous, 'elapsedSec') / 60),
  };
  const parSemaine = Math.round((recent.length / semaines) * 10) / 10;
  const cibleSemaine = Math.max(1, Number(p.frequence) || 4);

  // Priority zones, against what the sessions actually worked.
  const zonesPrioritaires = (p.zones || []).map((label) => {
    const hits = recent.filter((s) => sessionHitsZone(s, label)).length;
    return { label, seances: hits, part: pct(hits, Math.max(1, recent.length)) };
  });
  // What was trained regardless of priorities, so a lopsided split shows up
  // even when no zone was declared.
  const parZone = ZONES.map((z) => ({
    label: z.label,
    seances: recent.filter((s) => sessionHitsZone(s, z.label)).length,
  })).filter((z) => z.seances > 0);
  const partiel = recent.filter((s) => s.partial).length;

  // Nutrition over the last two weeks: only days with something logged count,
  // since an unlogged day is unknown, not a fast.
  const joursRenseignes = [];
  for (let i = 0; i < 14; i++) {
    const key = dateKey(new Date(Date.now() - i * 86400000));
    const day = (nutriLog || {})[key];
    if (!day) continue;
    const entries = MEALS.flatMap((m) => day[m.key] || []);
    if (entries.length) joursRenseignes.push(totals(entries));
  }
  const moyenne = (key) => (joursRenseignes.length
    ? Math.round(joursRenseignes.reduce((a, t) => a + t[key], 0) / joursRenseignes.length)
    : null);
  const nutrition = {
    jours: joursRenseignes.length,
    kcal: moyenne('kcal'),
    proteines: moyenne('proteines'),
    cibleKcal: targets?.kcal ?? null,
    cibleProteines: targets?.proteines ?? null,
    objectif: targets?.goal?.label || null,
  };

  return {
    objectif: p.objectif || null,
    contraintes: (p.contraintes || '').trim() || null,
    fenetreJours: WINDOW_DAYS,
    seances, series, minutes, parSemaine, cibleSemaine,
    zonesPrioritaires, parZone, partiel, nutrition,
    total: log.length,
  };
}

// --- Wording ---------------------------------------------------------------

function tendance(now, before, unite) {
  if (!before) return now ? `${now} ${unite} sur la période, rien à comparer avant.` : null;
  const delta = pct(now - before, before);
  if (Math.abs(delta) < 8) return `${now} ${unite}, stable par rapport aux 4 semaines précédentes.`;
  return `${now} ${unite}, ${delta > 0 ? '+' : ''}${delta} % par rapport aux 4 semaines précédentes.`;
}

const OBJECTIF_ATTENDU = {
  'Prise de masse': 'du volume et un apport calorique au-dessus de la dépense',
  Force: 'des séries lourdes et peu nombreuses, avec du repos entre elles',
  Tonus: 'de la régularité plus que des séances longues',
  Endurance: 'des séances fréquentes et une durée qui monte progressivement',
};

/**
 * @returns {{resume, progression, points, aFaire, ameliorer}} — `points` is
 * what the screen renders as cards, each with a `ton` driving its colour.
 */
export function generateProgressAnalysis({ profile, sessionLog, nutriLog, targets }) {
  const s = progressStats({ profile, sessionLog, nutriLog, targets });
  const prenom = profile?.prenom?.trim() || 'Toi';
  const points = [];
  const aFaire = [];
  const ameliorer = [];

  // --- Rythme ---
  const rythmeRatio = Math.min(1, s.parSemaine / s.cibleSemaine);
  points.push({
    key: 'rythme',
    titre: 'Rythme',
    ton: rythmeRatio >= 0.9 ? 'ok' : rythmeRatio >= 0.6 ? 'info' : 'attention',
    texte: s.seances.recent === 0
      ? `Aucune séance sur les ${s.fenetreJours} derniers jours. L'objectif est de ${s.cibleSemaine} par semaine.`
      : `${s.parSemaine} séance${s.parSemaine > 1 ? 's' : ''} par semaine en moyenne sur ${s.fenetreJours} jours, pour un objectif de ${s.cibleSemaine}. ${tendance(s.seances.recent, s.seances.previous, 'séances')}`,
  });
  if (rythmeRatio < 0.9 && s.cibleSemaine > s.parSemaine) {
    const manque = Math.max(1, Math.round(s.cibleSemaine - s.parSemaine));
    aFaire.push(`Ajouter ${plural(manque, 'séance')} par semaine pour tenir ton objectif de ${s.cibleSemaine}.`);
  }

  // --- Volume --- (nothing to say when neither window holds anything)
  const volumeTexte = [
    tendance(s.series.recent, s.series.previous, 'séries'),
    tendance(s.minutes.recent, s.minutes.previous, 'minutes'),
  ].filter(Boolean).join(' ');
  if (volumeTexte) {
    points.push({
      key: 'volume',
      titre: 'Volume de travail',
      ton: s.series.recent > 0 && s.series.recent >= s.series.previous ? 'ok' : 'info',
      texte: volumeTexte,
    });
  }

  // --- Objectif principal ---
  if (s.objectif) {
    points.push({
      key: 'objectif',
      titre: `Objectif : ${s.objectif.toLowerCase()}`,
      ton: 'info',
      texte: `Ce que ça demande : ${OBJECTIF_ATTENDU[s.objectif] || 'de la régularité'}. Sur la période tu as fait ${plural(s.seances.recent, 'séance')} pour ${plural(s.series.recent, 'série')} et ${s.minutes.recent} minutes de travail.`,
    });
  }

  // --- Zones prioritaires ---
  if (s.zonesPrioritaires.length) {
    const oubliees = s.zonesPrioritaires.filter((z) => z.seances === 0).map((z) => z.label);
    const servies = s.zonesPrioritaires.filter((z) => z.seances > 0);
    points.push({
      key: 'zones',
      titre: 'Zones prioritaires',
      ton: oubliees.length ? 'attention' : 'ok',
      texte: [
        servies.length ? `${servies.map((z) => `${z.label} : ${z.seances} séance${z.seances > 1 ? 's' : ''} (${z.part} %)`).join(', ')}.` : null,
        oubliees.length ? `Jamais travaillé sur la période : ${oubliees.join(', ')}.` : 'Toutes tes zones prioritaires ont été travaillées.',
      ].filter(Boolean).join(' '),
    });
    for (const zone of oubliees) ameliorer.push(`${zone} fait partie de tes priorités mais n'a pas été travaillé depuis ${s.fenetreJours} jours.`);
  } else {
    points.push({
      key: 'zones',
      titre: 'Zones prioritaires',
      ton: 'info',
      texte: s.parZone.length
        ? `Aucune zone prioritaire déclarée. Sur la période tu as travaillé : ${s.parZone.map((z) => `${z.label} (${z.seances})`).join(', ')}.`
        : "Aucune zone prioritaire déclarée, et aucune séance à analyser sur la période.",
    });
    ameliorer.push('Renseigner tes zones prioritaires dans le profil rendrait cette analyse plus précise.');
  }

  // --- Nutrition ---
  const n = s.nutrition;
  if (n.jours === 0) {
    points.push({
      key: 'nutrition',
      titre: 'Nutrition',
      ton: 'info',
      texte: "Aucun repas consigné sur les 14 derniers jours : impossible de dire si ton alimentation suit ton objectif.",
    });
    ameliorer.push('Consigner quelques journées de repas permettrait de relier ton alimentation à ton entraînement.');
  } else {
    const kcalPart = n.cibleKcal ? pct(n.kcal, n.cibleKcal) : null;
    const protPart = n.cibleProteines ? pct(n.proteines, n.cibleProteines) : null;
    const protOk = protPart != null && protPart >= 90;
    points.push({
      key: 'nutrition',
      titre: `Nutrition — ${n.objectif || 'objectif non défini'}`,
      ton: protOk ? 'ok' : 'attention',
      texte: `Sur ${plural(n.jours, 'journée')} renseignée${n.jours > 1 ? 's' : ''} : ${n.kcal} kcal/jour en moyenne${kcalPart != null ? ` (${kcalPart} % de ta cible de ${n.cibleKcal})` : ''}, ${n.proteines} g de protéines${protPart != null ? ` (${protPart} % de ta cible de ${n.cibleProteines} g)` : ''}.`,
    });
    if (protPart != null && protPart < 90) {
      aFaire.push(`Monter les protéines : ${n.proteines} g/jour en moyenne pour une cible de ${n.cibleProteines} g.`);
    }
    if (kcalPart != null && n.objectif === 'Prise de masse' && kcalPart < 95) {
      aFaire.push(`Prise de masse et ${kcalPart} % de ta cible calorique ne vont pas ensemble : il manque environ ${n.cibleKcal - n.kcal} kcal par jour.`);
    }
    if (kcalPart != null && n.objectif === 'Sèche' && kcalPart > 105) {
      aFaire.push(`Sèche et ${kcalPart} % de ta cible calorique ne vont pas ensemble : environ ${n.kcal - n.cibleKcal} kcal de trop par jour.`);
    }
  }

  // --- Contraintes ---
  if (s.contraintes) {
    points.push({
      key: 'contraintes',
      titre: 'Contraintes déclarées',
      ton: 'attention',
      texte: `Tu as noté : « ${s.contraintes} ». Adapte les mouvements concernés — amplitude réduite, charge allégée, ou une variante listée sur la fiche de l'exercice.`,
    });
  }

  // --- Séances partielles ---
  if (s.partiel >= 2) {
    ameliorer.push(`${plural(s.partiel, 'séance')} arrêtée${s.partiel > 1 ? 's' : ''} en cours sur la période — viser plus court mais terminé.`);
  }

  // Score: only what could be measured counts, and its weight leaves the
  // denominator otherwise — same rule as the nutrition score.
  const parts = [{ valeur: rythmeRatio, poids: 50 }];
  if (s.zonesPrioritaires.length) {
    parts.push({ valeur: s.zonesPrioritaires.filter((z) => z.seances > 0).length / s.zonesPrioritaires.length, poids: 25 });
  }
  if (n.jours > 0 && n.cibleProteines) {
    parts.push({ valeur: Math.min(1, n.proteines / n.cibleProteines), poids: 25 });
  }
  const poidsTotal = parts.reduce((a, x) => a + x.poids, 0);
  const progression = Math.round(parts.reduce((a, x) => a + x.valeur * x.poids, 0) / poidsTotal * 100);

  const resume = s.seances.recent === 0
    ? `${prenom}, rien n'a été enregistré sur les ${s.fenetreJours} derniers jours — l'analyse repartira dès ta prochaine séance.`
    : `${prenom}, ${plural(s.seances.recent, 'séance')} sur ${s.fenetreJours} jours, soit ${s.parSemaine}/semaine pour un objectif de ${s.cibleSemaine}. ${
      progression >= 75 ? 'Tu tiens ta trajectoire.' : progression >= 45 ? 'La trajectoire est bonne, il reste de la marge.' : 'Il y a un écart net entre tes objectifs et ce qui est enregistré.'}`;

  if (!aFaire.length) aFaire.push('Continuer sur ce rythme : ce que tu fais correspond à ce que tu as visé.');

  return { resume, progression, points, aFaire, ameliorer };
}
