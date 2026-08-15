// Service-worker updates, made visible and forceable.
//
// The app is installed from a home screen, and an installed PWA never really
// navigates: it is reopened, the cached page is served instantly, and the old
// JavaScript keeps running even after a new service worker has quietly
// installed itself. Reloading by hand does not reliably help, which is why
// this module exists — it lets the app *ask* whether a new version is out,
// *say* which one is running, and *apply* the new one on demand.
//
// Registration is explicit (`injectRegister: null` in vite.config.js) so the
// registration object is in reach: only it can be told to check the server
// again, and only it knows when a new worker is waiting.
import { registerSW } from 'virtual:pwa-register';

// Stamped at build time. Netlify exposes the commit as COMMIT_REF; locally it
// falls back to "dev". Displayed in the settings so a doubt can be settled by
// looking rather than by refreshing and hoping.
export const BUILD_ID = __BUILD_ID__;
export const BUILD_TIME = __BUILD_TIME__;

let registration = null;
let updateSW = null;
let ready = false;
const listeners = new Set();

const emit = () => { for (const fn of listeners) fn(ready); };

/** Called once at startup. Safe where service workers do not exist. */
export function initPwa() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() { ready = true; emit(); },
    onRegisteredSW(_url, r) { registration = r || null; },
  });
  // A phone reopens the app rather than loading it, so the moment it comes
  // back to the foreground is the natural time to look for a new deploy.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') registration?.update?.().catch(() => {});
  });
}

export const updateAvailable = () => ready;

export function onUpdateStatus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Resolves once a waiting worker appears, or false after `ms`. */
function waitForUpdate(ms = 12000) {
  if (ready) return Promise.resolve(true);
  return new Promise((resolve) => {
    const stop = onUpdateStatus(() => { clearTimeout(timer); stop(); resolve(true); });
    const timer = setTimeout(() => { stop(); resolve(false); }, ms);
  });
}

/**
 * Asks the server for a new version right now.
 *
 * @returns 'unsupported' | 'current' | 'update' — never returns on 'update'
 * once applied, since applying reloads the page.
 */
export async function checkForUpdate() {
  if (ready) return 'update';
  if (!registration) return 'unsupported';
  try {
    await registration.update();
  } catch {
    return 'unsupported';
  }
  // `update()` resolves when the check is done, but a worker it found still
  // has to install before it is usable — hence the wait rather than an
  // immediate verdict.
  if (registration.installing || registration.waiting) {
    return (await waitForUpdate()) ? 'update' : 'current';
  }
  return 'current';
}

let applying = false;

/**
 * Activates the waiting worker and reloads onto it.
 *
 * The plugin's own reload is **conditional**: workbox only reloads on
 * `controlling` when it decided at registration time that the page was already
 * controlled by a compatible worker. After the app has been reinstalled, or
 * after the data was cleared, or on the first load that installed a worker,
 * that is false — the new worker activates and the page stays on the old code
 * forever, which reads as a button that does nothing. So this never depends on
 * it: it asks, watches for the takeover itself, and escapes on a timer.
 */
export function applyUpdate() {
  if (applying) return;
  applying = true;
  const reload = () => window.location.reload();

  // Nothing controls this page, so a reload is already served by the network.
  if (!navigator.serviceWorker?.controller) {
    reload();
    return;
  }

  navigator.serviceWorker.addEventListener('controllerchange', reload, { once: true });
  try {
    updateSW?.(true);
  } catch {
    // The message never left; the timer below is the answer.
  }

  // Last resort, ~2.5 s in: drop the worker so the reload cannot be served
  // from its cache, then reload. Costs one round of network fetches and the
  // fresh page registers a worker again immediately — a fair price for never
  // leaving someone stuck on an old build.
  setTimeout(() => {
    const done = () => reload();
    navigator.serviceWorker.getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .then(done, done);
  }, 2500);
}

/**
 * The escape hatch: forget the worker and every cached asset, then reload from
 * the network. Stored data is untouched — this clears the Cache Storage the
 * service worker owns, never localStorage, where the journal lives.
 */
export async function hardReload() {
  try {
    const regs = await navigator.serviceWorker?.getRegistrations?.() || [];
    await Promise.all(regs.map((r) => r.unregister()));
    const keys = await caches?.keys?.() || [];
    await Promise.all(keys.map((k) => caches.delete(k)));
  } catch {
    // Whatever failed, reloading is still the right next move.
  }
  window.location.reload();
}
