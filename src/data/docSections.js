// The chapters of the documentation, in reading order.
//
// **Shared by the static site and the app**, so the two cannot disagree about
// what the chapters are or how they are ordered. `scripts/gen-docs.mjs`
// imports this file too — hence plain data and no Vite-specific syntax here.
//
// `emoji` is what the static site prints; `icon` is a slug registered in
// `components/ui/Icon.jsx`, which is what the app draws. A chapter with no
// entry below still builds — it simply lands at the end, under its folder
// name.

export const DOC_SECTIONS = [
  { key: '', label: 'Accueil', emoji: '📚', icon: 'house-line' },
  { key: 'getting-started', label: 'Bien démarrer', emoji: '🚀', icon: 'flag' },
  { key: 'guide', label: 'Guide utilisateur', emoji: '📖', icon: 'books' },
  { key: 'features', label: 'Fonctionnalités', emoji: '🧩', icon: 'sparkle' },
  { key: 'settings', label: 'Paramètres', emoji: '⚙️', icon: 'gear-six' },
  { key: 'permissions', label: 'Permissions', emoji: '🔐', icon: 'lock-key' },
  { key: 'data', label: 'Données', emoji: '🗄️', icon: 'floppy-disk' },
  { key: 'offline', label: 'Hors connexion', emoji: '📴', icon: 'cloud-slash' },
  { key: 'troubleshooting', label: 'Dépannage', emoji: '🛠️', icon: 'wrench' },
  { key: 'faq', label: 'FAQ', emoji: '❓', icon: 'question' },
  { key: 'reference', label: 'Référence', emoji: '📘', icon: 'notebook' },
  { key: 'versions', label: 'Versions', emoji: '🔄', icon: 'arrow-counter-clockwise' },
  { key: 'legal', label: 'Légal', emoji: '⚖️', icon: 'scales' },
  { key: 'support', label: 'Support', emoji: '📩', icon: 'waveform' },
];

const byKey = (key) => DOC_SECTIONS.find((s) => s.key === key);

/** Reading order; an unlisted chapter sorts after every listed one. */
export function sectionRank(key) {
  const i = DOC_SECTIONS.findIndex((s) => s.key === key);
  return i === -1 ? DOC_SECTIONS.length : i;
}

export const sectionLabel = (key) => byKey(key)?.label || key;
export const sectionEmoji = (key) => byKey(key)?.emoji || '📄';
export const sectionIcon = (key) => byKey(key)?.icon || 'notebook';
