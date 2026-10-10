import { guidesFor } from './related.mjs';
import { slugify } from './expand.mjs';

function csvCell(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(groups) {
  const lines = ['seed,keyword,intent,engines'];
  for (const group of groups) {
    for (const row of group.keywords) {
      lines.push([group.seed, row.text, row.intent, row.engines.join('|')].map(csvCell).join(','));
    }
  }
  return `${lines.join('\n')}\n`;
}

function relatedBlock(seed) {
  const guides = guidesFor(seed);
  if (!guides.length) return '';
  const lines = guides.map((guide) => `- [${guide.label}](${guide.href})`);
  return `\n## Related\n\n${lines.join('\n')}\n`;
}

export function toMarkdown(group, generated) {
  const rows = group.keywords
    .map((row) => `| ${row.text.replace(/\|/g, '\\|')} | ${row.intent} | ${row.engines.join(', ')} |`)
    .join('\n');
  return `# ${group.seed}

Long-tail suggestions for **${group.seed}**. Collected ${generated} from public autocomplete (Google, Baidu, DuckDuckGo). These are suggested phrases, not search volumes.

| Keyword | Intent | Engines |
| --- | --- | --- |
${rows || '| — | — | — |'}
${relatedBlock(group.seed)}
`;
}

export function toJson(groups, generated) {
  return `${JSON.stringify({ generated, seeds: groups }, null, 2)}\n`;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function toHtml(groups, generated) {
  const sections = groups
    .map((group) => {
      const guides = guidesFor(group.seed)
        .map((guide) => `<a href="${escapeHtml(guide.href)}">${escapeHtml(guide.label)}</a>`)
        .join('');
      const items = group.keywords
        .map((row) => `<li data-intent="${row.intent}"><span>${escapeHtml(row.text)}</span><em>${row.intent}</em></li>`)
        .join('');
      return `<section data-seed="${escapeHtml(group.seed)}"><h2>${escapeHtml(group.seed)}</h2>${guides ? `<p class="related">${guides}</p>` : ''}<ol>${items}</ol></section>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Long-tail keywords — 长尾词挖掘</title>
  <meta name="description" content="Long-tail keywords collected from Google, Baidu, and DuckDuckGo suggestions. 用公开搜索联想挖长尾词。">
  <link rel="canonical" href="https://fujiezee.github.io/longtail-keywords/">
  <style>
    :root { color-scheme: light; --bg: #f4f1ea; --ink: #1c1915; --muted: #5c564c; --line: #ddd6c8; --card: #fffdf8; }
    * { box-sizing: border-box; }
    body { margin: 0; font: 16px/1.5 ui-sans-serif, "PingFang SC", "Segoe UI", sans-serif; background: var(--bg); color: var(--ink); }
    main { max-width: 760px; margin: 0 auto; padding: 32px 20px 64px; }
    h1 { font-size: 1.75rem; line-height: 1.2; margin: 0 0 8px; }
    h2 { font-size: 1.15rem; margin: 28px 0 8px; }
    .lede { color: var(--muted); margin: 0 0 20px; }
    input { width: 100%; font: inherit; padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--card); }
    section { display: block; }
    section.hidden, li.hidden { display: none; }
    ol { list-style: none; padding: 0; margin: 0; border: 1px solid var(--line); border-radius: 10px; background: var(--card); }
    li { display: flex; justify-content: space-between; gap: 12px; padding: 8px 12px; border-top: 1px solid var(--line); }
    li:first-child { border-top: 0; }
    em { color: var(--muted); font-style: normal; font-size: 0.8rem; }
    .related { margin: 0 0 8px; font-size: 0.92rem; }
    a { color: #0c5c4a; }
    footer { margin-top: 36px; color: var(--muted); font-size: 0.92rem; }
  </style>
</head>
<body>
  <main>
    <h1>Long-tail keywords</h1>
    <p class="lede">长尾词挖掘。Phrases below are public search suggestions for each seed, collected ${escapeHtml(generated)}. Filter the list. They are not search volumes.</p>
    <input id="q" type="search" placeholder="Filter / 筛选" autocomplete="off">
    ${sections}
    <footer>
      <p>Source code: <a href="https://github.com/fujiezee/longtail-keywords">longtail-keywords</a>.</p>
      <p>Made by <a href="https://www.duaer.com">Duaer</a>. Duaer makes AI understand your company and follow through on what is due. <a href="https://doc.duaer.com/guides/">Guides</a>.</p>
    </footer>
  </main>
  <script>
    const input = document.querySelector('#q');
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      for (const section of document.querySelectorAll('section')) {
        let shown = 0;
        for (const li of section.querySelectorAll('li')) {
          const hit = !q || li.textContent.toLowerCase().includes(q) || section.dataset.seed.toLowerCase().includes(q);
          li.classList.toggle('hidden', !hit);
          if (hit) shown += 1;
        }
        section.classList.toggle('hidden', shown === 0);
      }
    });
  </script>
</body>
</html>
`;
}

export function fileSlug(seed) {
  return slugify(seed);
}
