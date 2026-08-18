// Program catalogue — ported from the Claude Design prototype (PROG).
export const PROGRAMS = [
  { id: 'fullbody', nom: 'Full Body Maison', obj: 'Prise de masse', niveau: 'Tous niveaux', lieu: 'Maison', duree: 20, kcal: 210, mat: ['Sans matériel', 'Maison'], icon: 'house-line', exos: ['pompes', 'squats', 'fentes', 'gainage', 'abdos'], desc: "Un circuit complet du corps, sans aucun matériel — la base idéale pour construire du muscle à la maison." },
  { id: 'haut', nom: 'Haut du corps', obj: 'Prise de masse', niveau: 'Intermédiaire', lieu: 'Salle', duree: 25, kcal: 180, mat: ['Haltères', 'Salle'], icon: 'barbell', exos: ['pompes', 'dips', 'developpe', 'rowing', 'tractions'], desc: "Pectoraux, dos, épaules et bras : du volume ciblé sur tout le haut du corps." },
  { id: 'bas', nom: 'Bas du corps', obj: 'Prise de masse', niveau: 'Intermédiaire', lieu: 'Maison', duree: 20, kcal: 200, mat: ['Sans matériel', 'Maison'], icon: 'person-simple-walk', exos: ['squats', 'fentes', 'mountain'], desc: "Quadriceps et fessiers : puissance et volume des jambes, sans matériel." },
  { id: 'core', nom: 'Abdos / Core', obj: 'Gainage', niveau: 'Débutant', lieu: 'Maison', duree: 10, kcal: 90, mat: ['Sans matériel', 'Maison'], icon: 'shield-check', exos: ['gainage', 'abdos', 'mountain'], desc: "Renforce la sangle abdominale et stabilise ton tronc pour tous tes autres mouvements." },
  { id: 'hiit', nom: 'HIIT Brûle-graisse', obj: 'Cardio & sèche', niveau: 'Avancé', lieu: 'Maison', duree: 15, kcal: 240, mat: ['Sans matériel', 'Maison'], icon: 'lightning', exos: ['mountain', 'squats', 'pompes', 'fentes'], desc: "Intervalles intenses : du cardio pour sécher tout en préservant ta masse musculaire." },
  // Séance corrective plutôt que de développement : charge nulle, volume
  // faible, deux étirements à la fin. Elle vise la ceinture scapulaire d'un
  // poste de travail tête baissée — stabilisateurs de l'omoplate d'un côté,
  // pectoraux et élévateur de la scapula raccourcis de l'autre — et se refait
  // souvent, idéalement tous les jours, là où les autres programmes demandent
  // 48 h de récupération. Elle est montée sur les exercices du catalogue, pas
  // sur des doublons : le Y, le W et le scapular push-up existaient déjà.
  { id: 'omoplates', nom: 'Omoplates & nuque', obj: 'Tonus', niveau: 'Débutant', lieu: 'Maison', duree: 18, kcal: 70, mat: ['Sans matériel', 'Maison'], icon: 'person-simple-tai-chi', exos: ['chin-tuck', 'retraction-scapulaire', 'y-raise', 'prone-w-raise', 'scapular-push-up', 'etirement-pectoral-porte', 'etirement-elevateur-scapula'], desc: "Posture du haut du dos : on réveille d'abord les stabilisateurs de l'omoplate (rhomboïdes, trapèzes moyen et inférieur, dentelé), puis on relâche ce qui tire l'épaule vers l'avant. Sans charge, à refaire souvent — et si une douleur persiste, irradie ou réveille la nuit, fais-toi examiner." },
  { id: 'express', nom: 'Renforcement Express', obj: 'Prise de masse', niveau: 'Débutant', lieu: 'Maison', duree: 5, kcal: 55, mat: ['Sans matériel', 'Maison'], icon: 'timer', exos: ['pompes', 'squats', 'gainage'], desc: "5 minutes, 3 exercices : parfait quand le temps manque mais que tu veux rester régulier." },
];

export const progById = (id, customWorkouts = []) =>
  PROGRAMS.concat(customWorkouts).find((p) => p.id === id) || PROGRAMS[0];

/**
 * An ad-hoc, unsaved program wrapping a single exercise, so a one-off set can
 * run through the exact same workout machinery as a full session — timer, rest,
 * voice coach, journal entry.
 *
 * It deliberately never enters PROGRAMS or customWorkouts: a quick set at the
 * office should not leave a saved program behind. That means progById() cannot
 * find it, so it travels on the workout state itself and callers must resolve
 * the running program through there rather than by id.
 *
 * `custom` reuses the custom-workout override shape, which is what lets
 * effSeries/effRepos/baseReps/baseCharge keep working untouched.
 */
export function soloProgram(ex) {
  return {
    id: `solo-${ex.id}`,
    nom: ex.nom,
    obj: 'Exercice seul',
    niveau: ex.niveau,
    lieu: ex.lieu,
    duree: Math.max(3, Math.round((ex.series * (ex.repos + 40)) / 60)),
    kcal: 0,
    mat: ex.mat,
    icon: ex.icon,
    exos: [ex.id],
    custom: { [ex.id]: { series: ex.series, reps: ex.reps, charge: ex.charge || 'Poids du corps', repos: ex.repos } },
    isCustom: true,
    isSolo: true,
  };
}

// The training objectives the profile and the workout builder both offer. One
// list, because a value that exists in one and not the other would let a saved
// workout carry an objective the profile cannot express.
//
// "Recomposition corporelle" is losing fat and building muscle at the same
// time — two distinct processes, not fat "turning into" muscle. It is its own
// objective because what it asks for is neither: enough volume to grow, and an
// energy balance that stays close to maintenance rather than swinging either
// way. See GOALS in data/nutrition.js for the nutrition side of it.
export const OBJECTIFS = ['Prise de masse', 'Recomposition corporelle', 'Force', 'Tonus', 'Endurance'];
