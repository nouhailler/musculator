// Program catalogue — ported from the Claude Design prototype (PROG).
export const PROGRAMS = [
  { id: 'fullbody', nom: 'Full Body Maison', obj: 'Prise de masse', niveau: 'Tous niveaux', lieu: 'Maison', duree: 20, kcal: 210, mat: ['Sans matériel', 'Maison'], icon: 'house-line', exos: ['pompes', 'squats', 'fentes', 'gainage', 'abdos'], desc: "Un circuit complet du corps, sans aucun matériel — la base idéale pour construire du muscle à la maison." },
  { id: 'haut', nom: 'Haut du corps', obj: 'Prise de masse', niveau: 'Intermédiaire', lieu: 'Salle', duree: 25, kcal: 180, mat: ['Haltères', 'Salle'], icon: 'barbell', exos: ['pompes', 'dips', 'developpe', 'rowing', 'tractions'], desc: "Pectoraux, dos, épaules et bras : du volume ciblé sur tout le haut du corps." },
  { id: 'bas', nom: 'Bas du corps', obj: 'Prise de masse', niveau: 'Intermédiaire', lieu: 'Maison', duree: 20, kcal: 200, mat: ['Sans matériel', 'Maison'], icon: 'person-simple-walk', exos: ['squats', 'fentes', 'mountain'], desc: "Quadriceps et fessiers : puissance et volume des jambes, sans matériel." },
  { id: 'core', nom: 'Abdos / Core', obj: 'Gainage', niveau: 'Débutant', lieu: 'Maison', duree: 10, kcal: 90, mat: ['Sans matériel', 'Maison'], icon: 'shield-check', exos: ['gainage', 'abdos', 'mountain'], desc: "Renforce la sangle abdominale et stabilise ton tronc pour tous tes autres mouvements." },
  { id: 'hiit', nom: 'HIIT Brûle-graisse', obj: 'Cardio & sèche', niveau: 'Avancé', lieu: 'Maison', duree: 15, kcal: 240, mat: ['Sans matériel', 'Maison'], icon: 'lightning', exos: ['mountain', 'squats', 'pompes', 'fentes'], desc: "Intervalles intenses : du cardio pour sécher tout en préservant ta masse musculaire." },
  { id: 'express', nom: 'Renforcement Express', obj: 'Prise de masse', niveau: 'Débutant', lieu: 'Maison', duree: 5, kcal: 55, mat: ['Sans matériel', 'Maison'], icon: 'timer', exos: ['pompes', 'squats', 'gainage'], desc: "5 minutes, 3 exercices : parfait quand le temps manque mais que tu veux rester régulier." },
];

export const progById = (id, customWorkouts = []) =>
  PROGRAMS.concat(customWorkouts).find((p) => p.id === id) || PROGRAMS[0];
