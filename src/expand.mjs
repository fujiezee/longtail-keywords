const EN_MODIFIERS = [
  'how to',
  'what is',
  'examples',
  'vs',
  'alternative',
  'tool',
  'free',
  'template',
  'for beginners',
  'software',
];

const ZH_MODIFIERS = [
  '怎么做',
  '是什么',
  '教程',
  '工具',
  '免费',
  '模板',
  '区别',
  '替代',
  '哪个好',
  '多少钱',
];

const INTENT_RANK = {
  comparison: 0,
  question: 1,
  commercial: 2,
  template: 3,
  other: 4,
};

const STOP = new Set([
  'how', 'to', 'what', 'is', 'a', 'an', 'the', 'for', 'of', 'and', 'vs',
  'alternative', 'alternatives', 'tool', 'tools', 'free', 'template', 'templates',
  'software', 'examples', 'example', 'beginners', 'with', 'from', 'into', 'using',
]);

export function isCjk(text) {
  return /[\u3400-\u9fff]/.test(text);
}

export function queriesFor(seed, { max = 12 } = {}) {
  const base = seed.trim().replace(/\s+/g, ' ');
  if (!base) return [];
  const mods = isCjk(base) ? ZH_MODIFIERS : EN_MODIFIERS;
  const glue = isCjk(base) ? '' : ' ';
  const list = [base];
  for (const mod of mods) {
    list.push(`${base}${glue}${mod}`);
    if (!isCjk(base)) list.push(`${mod} ${base}`);
  }
  return [...new Set(list)].slice(0, max);
}

export function classify(text) {
  if (/(\bvs\b|versus|alternative|相比|区别|替代|对比|哪个好)/i.test(text)) return 'comparison';
  if (/(how to|what is|why\b|怎么|如何|为什么|是什么|吗|？|\?)/i.test(text)) return 'question';
  if (/(free|price|pricing|cost|多少钱|免费|软件|工具|\btool\b|software)/i.test(text)) return 'commercial';
  if (/(template|example|教程|模板|示例|举例)/i.test(text)) return 'template';
  return 'other';
}

export function slugify(seed) {
  const cleaned = seed
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u3400-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return (cleaned || 'seed').slice(0, 80);
}

export function anchorOf(seed) {
  const base = seed.trim();
  if (isCjk(base)) return base;
  const words = base.toLowerCase().split(/\s+/).filter((word) => word.length > 2 && !STOP.has(word));
  return words[0] || base.toLowerCase();
}

export function relevantToSeed(seed, text) {
  const anchor = anchorOf(seed);
  if (!anchor) return false;
  if (isCjk(seed)) return text.includes(anchor);
  const escaped = anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
}

export function sortKeywords(items) {
  return [...items].sort((a, b) => {
    const byIntent = INTENT_RANK[a.intent] - INTENT_RANK[b.intent];
    if (byIntent) return byIntent;
    return b.text.length - a.text.length || a.text.localeCompare(b.text, 'zh');
  });
}
