const ENGINES = {
  google(query) {
    const url = new URL('https://suggestqueries.google.com/complete/search');
    url.searchParams.set('client', 'firefox');
    url.searchParams.set('q', query);
    return url;
  },
  baidu(query) {
    const url = new URL('https://suggestion.baidu.com/su');
    url.searchParams.set('wd', query);
    url.searchParams.set('action', 'opensearch');
    url.searchParams.set('ie', 'utf-8');
    return url;
  },
  duckduckgo(query) {
    const url = new URL('https://duckduckgo.com/ac/');
    url.searchParams.set('q', query);
    return url;
  },
};

export function parseSuggestions(engine, body) {
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    return [];
  }
  if (engine === 'duckduckgo') {
    if (!Array.isArray(data)) return [];
    return data.map((row) => (typeof row?.phrase === 'string' ? row.phrase : '')).filter(Boolean);
  }
  if (!Array.isArray(data) || !Array.isArray(data[1])) return [];
  return data[1].filter((item) => typeof item === 'string' && item.trim());
}

export async function fetchSuggest(engine, query, { fetchImpl = globalThis.fetch, timeoutMs = 8000 } = {}) {
  const build = ENGINES[engine];
  if (!build) throw new Error(`unknown engine: ${engine}`);
  const response = await fetchImpl(build(query), {
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      'user-agent': 'longtail-keywords/0.1 (+https://github.com/fujiezee/longtail-keywords)',
      accept: 'application/json,text/javascript,*/*',
    },
  });
  if (!response.ok) return [];
  return parseSuggestions(engine, await response.text());
}

export const engineNames = Object.keys(ENGINES);
