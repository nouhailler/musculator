// Theme vocabulary and the one place the choice reaches the document.
//
// The palettes themselves live in styles/tokens.css: dark on bare `:root`,
// light under `:root[data-theme='light']`. All this module does is decide
// which of the two is in force and write it to `<html data-theme>`.
//
// Kept React-free so index.html's pre-paint script and the store's effect can
// agree on the rules without importing a component.

export const THEMES = [
  { key: 'dark', label: 'Sombre' },
  { key: 'light', label: 'Clair' },
  { key: 'system', label: 'Système' },
];

// Dark, because the app shipped dark-only: an existing install must not change
// appearance until its owner asks it to.
export const DEFAULT_THEME = 'dark';

export const isTheme = (key) => THEMES.some((t) => t.key === key);
export const themeLabel = (key) => THEMES.find((t) => t.key === key)?.label || THEMES[0].label;

const media = () => window.matchMedia('(prefers-color-scheme: light)');

/** The palette a mode actually resolves to — 'system' asks the OS. */
export function resolveTheme(mode) {
  if (mode === 'system') return media().matches ? 'light' : 'dark';
  return mode === 'light' ? 'light' : 'dark';
}

/**
 * Puts a mode in force and keeps the browser/OS chrome in step with it.
 * Returns a teardown: under 'system' the OS setting is watched live, so the
 * app follows a phone that flips to dark at sunset without a reload.
 */
export function applyTheme(mode) {
  const set = () => {
    document.documentElement.dataset.theme = resolveTheme(mode);
    // Read the value back rather than restating the hex here — the palette has
    // one home, and this must not drift from it.
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
    if (bg) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
  };
  set();
  if (mode !== 'system') return () => {};
  const m = media();
  m.addEventListener('change', set);
  return () => m.removeEventListener('change', set);
}
