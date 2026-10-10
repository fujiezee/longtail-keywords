import { classify, queriesFor, relevantToSeed, sortKeywords } from './expand.mjs';
import { fetchSuggest } from './suggest.mjs';

async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      out[index] = await fn(items[index], index);
    }
  }
  const workers = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return out;
}

function norm(text) {
  return text.trim().replace(/\s+/g, ' ').toLowerCase();
}

export async function collectSeed(seed, { engines, maxQueries = 12, concurrency = 4, fetchImpl, pauseMs = 40 } = {}) {
  const queries = queriesFor(seed, { max: maxQueries });
  const jobs = [];
  for (const query of queries) {
    for (const engine of engines) jobs.push({ query, engine });
  }
  const found = new Map();
  await mapPool(jobs, concurrency, async (job) => {
    if (pauseMs) await new Promise((resolve) => setTimeout(resolve, pauseMs));
    let phrases = [];
    try {
      phrases = await fetchSuggest(job.engine, job.query, { fetchImpl });
    } catch {
      phrases = [];
    }
    for (const phrase of phrases) {
      const text = phrase.trim().replace(/\s+/g, ' ');
      if (!text || norm(text) === norm(seed) || !relevantToSeed(seed, text)) continue;
      const key = norm(text);
      const row = found.get(key) ?? { text, engines: [], intent: classify(text) };
      if (!row.engines.includes(job.engine)) row.engines.push(job.engine);
      found.set(key, row);
    }
  });
  return {
    seed: seed.trim(),
    queries,
    keywords: sortKeywords([...found.values()]),
  };
}
