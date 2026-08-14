// Open Food Facts client. The retry/timeout policy, the relevance ranking and
// the cache-on-failure behaviour are ported from Nutritor's
// src/services/openFoodFacts.ts; the storage layer is rewritten for this app
// (localStorage, synchronous) and the mapper targets lib/food.js instead of
// Nutritor's richer Food type.
//
// Identification: Open Food Facts asks callers to identify themselves with a
// User-Agent. A browser cannot do that — `User-Agent` is a forbidden header
// name, and fetch() drops it silently (verified: a page setting it still sent
// the Chrome UA). Musculator is a web PWA, so it identifies itself with the
// `app_name` / `app_version` query parameters OFF provides for exactly this
// case. If this module is ever reused from React Native, send a real
// User-Agent header there — that runtime allows it.

const BASE = 'https://world.openfoodfacts.org';
const APP = { app_name: 'Musculator', app_version: '1.0' };

// Asking for named fields keeps the payload small on a phone connection. The
// micronutrients are requested explicitly: OFF omits absent ones, so a short
// list costs nothing and a missing key means "unknown", not "zero".
const FIELDS = [
  'code', 'product_name', 'product_name_fr', 'brands', 'image_front_small_url',
  'image_url', 'quantity', 'serving_size', 'nutriscore_grade', 'nutriments',
].join(',');

const TIMEOUT_MS = 12000;
const MAX_RETRIES = 3;

function url(path, params) {
  const q = new URLSearchParams({ ...APP, ...params });
  return `${BASE}${path}?${q}`;
}

// Retries transient failures with a growing back-off; a 503 from OFF is common
// under load and worth one more try rather than an error in the user's face.
async function fetchOFF(target) {
  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(target, { signal: controller.signal });
      clearTimeout(timer);
      if (res.status === 503 && attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      return res;
    } catch (e) {
      clearTimeout(timer);
      lastError = e;
      if (attempt < MAX_RETRIES - 1) await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  throw new Error(lastError?.name === 'AbortError'
    ? 'Open Food Facts ne répond pas (délai dépassé).'
    : 'Impossible de joindre Open Food Facts. Vérifie ta connexion.');
}

// --- Relevance ranking -----------------------------------------------------
// OFF returns results in its own order, which buries the obvious match. Ported
// from Nutritor: score each product against the query and drop the ones where
// the query appears nowhere meaningful.

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

function relevance(p, query) {
  const q = norm(query);
  const name = norm(p.product_name_fr || p.product_name);
  const brand = norm((p.brands || '').split(',')[0]);
  if (name === q) return 100;
  if (brand === q) return 90;
  if (name.startsWith(`${q} `) || name.startsWith(`${q},`) || name.startsWith(`${q}-`)) return 85;
  if (name.startsWith(q)) return 80;
  if (brand.startsWith(q)) return 70;
  if (name.includes(q)) return 60;
  if (brand.includes(q)) return 50;
  return 0;
}

// --- Public API ------------------------------------------------------------

/** Raw OFF product for a barcode, or null when unknown. */
export async function productByBarcode(barcode) {
  const res = await fetchOFF(url(`/api/v2/product/${encodeURIComponent(barcode)}.json`, { fields: FIELDS }));
  if (!res.ok) throw new Error(`Open Food Facts a répondu HTTP ${res.status}.`);
  const json = await res.json();
  // OFF answers 200 with status 0 for an unknown barcode.
  return json.status === 1 ? json.product : null;
}

/**
 * Text search, ranked. Uses /api/v2/search rather than the older
 * cgi/search.pl: it accepts a `fields` list, so the response stays small.
 */
export async function searchProducts(query, { pageSize = 20 } = {}) {
  const res = await fetchOFF(url('/api/v2/search', {
    search_terms: query, page_size: String(pageSize), fields: FIELDS, lc: 'fr', cc: 'fr',
  }));
  if (!res.ok) throw new Error(`Open Food Facts a répondu HTTP ${res.status}.`);
  const json = await res.json();
  return (json.products || [])
    .map((p) => ({ p, score: relevance(p, query) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}
