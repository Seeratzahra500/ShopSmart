/**
 * Run with: node scripts/check-seed-images.js
 * Verifies every image URL referenced in seed.js actually loads (GET, content-type image/*).
 * Exits non-zero if any URL fails.
 */

const { STORE_SEEDS } = require('./seed.js');

const TIMEOUT_MS = 10000;
const CONCURRENCY = 5;

function collectUrls() {
  const urls = new Set();
  for (const seed of STORE_SEEDS) {
    if (seed.store.logoUrl) urls.add(seed.store.logoUrl);
    if (seed.store.heroImage) urls.add(seed.store.heroImage);
    for (const product of seed.products) {
      for (const img of product.images || []) urls.add(img);
    }
  }
  return [...urls];
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const contentType = res.headers.get('content-type') || '';
    const ok = res.ok && contentType.startsWith('image/');
    return { url, ok, status: res.status, contentType };
  } catch (err) {
    return { url, ok: false, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let index = 0;
  async function next() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current]);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, next);
  await Promise.all(workers);
  return results;
}

async function main() {
  const urls = collectUrls();
  console.log(`Checking ${urls.length} unique image URL(s)...\n`);

  const results = await runWithConcurrency(urls, CONCURRENCY, checkUrl);

  let failCount = 0;
  for (const r of results) {
    if (r.ok) {
      console.log(`PASS  ${r.url}`);
    } else {
      failCount += 1;
      console.log(`FAIL  ${r.url}  (${r.error || `status=${r.status} content-type=${r.contentType}`})`);
    }
  }

  console.log(`\n${urls.length - failCount}/${urls.length} passed.`);
  if (failCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
