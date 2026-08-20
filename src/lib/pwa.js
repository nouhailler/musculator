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

// How long the whole check may take before it reports back anyway.
//
// **`registration.update()` is not guaranteed to settle.** It stays pending
// while the worker it found installs — this app precaches ~1.7 MB, which is a
// long time on a phone connection — and on a stalled network, behind a captive
// portal, or on iOS Safari it can stay pending indefinitely. A caller cannot
// recover from a promise that never settles, so the bound lives here rather
// than being left to whoever awaits it.
const CHECK_BUDGET_MS = 15000;

/** Races `promise` against the clock; resolves `fallback` if the clock wins. */
function atMost(promise, ms, fallback) {
  let timer;
  const capped = new Promise((resolve) => { timer = setTimeout(() => resolve(fallback), ms); });
  return Promise.race([promise, capped]).finally(() => clearTimeout(timer));
}

/**
 * Asks the server for a new version right now.
 *
 * @returns 'unsupported' | 'current' | 'update' | 'timeout' — never returns on
 * 'update' once applied, since applying reloads the page. 'timeout' means the
 * check did not conclude in time, which is **not** the same as 'current': it
 * has to be said differently, or someone on a slow connection is told they are
 * up to date while a new build is still downloading.
 */
export async function checkForUpdate() {
  if (ready) return 'update';
  if (!registration) return 'unsupported';

  const deadline = Date.now() + CHECK_BUDGET_MS;
  const left = () => Math.max(0, deadline - Date.now());

  // The rejection is handled on the original promise: attaching it only to the
  // race would leave an unhandled rejection behind when the clock wins first.
  // `update()` can also throw synchronously (InvalidStateError on a stale
  // registration), which is the same answer as a rejection, not a timeout.
  let updating;
  try {
    updating = registration.update().then(() => 'done', () => 'failed');
  } catch {
    return 'unsupported';
  }
  if (await atMost(updating, left(), 'timeout') === 'failed') return 'unsupported';

  if (ready) return 'update';
  // A worker the check found still has to install before it is usable — hence
  // the wait rather than an immediate verdict. What is left of the budget is
  // all it gets.
  if (registration.installing || registration.waiting) {
    if (await waitForUpdate(left())) return 'update';
  }
  if (ready) return 'update';
  if (left() === 0 || registration.installing) return 'timeout';
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
