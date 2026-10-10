#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { collectSeed } from '../src/collect.mjs';
import { fileSlug, toCsv, toHtml, toJson, toMarkdown } from '../src/render.mjs';
import { engineNames } from '../src/suggest.mjs';

function help() {
  return `longtail — find long-tail keywords from public search suggestions
长尾词 — 用 Google、百度、DuckDuckGo 的公开联想，从一个种子词挖长尾词

Usage
  node bin/longtail.mjs "长尾词" "long tail keywords"
  node bin/longtail.mjs --seeds seeds.txt --out .

Options
  --seeds <file>     One seed per line
  --out <dir>        Write catalog/, keywords.csv, and docs/ (default: ./out)
  --engines <list>   Comma-separated: ${engineNames.join(', ')}
  --max <n>          Queries per seed (default 12)
  --concurrency <n>  Parallel requests (default 4)
`;
}

function parseArgs(argv) {
  const opts = {
    seeds: [],
    seedsFile: '',
    out: 'out',
    engines: ['google', 'baidu', 'duckduckgo'],
    max: 12,
    concurrency: 4,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg === '--seeds') opts.seedsFile = argv[++i];
    else if (arg === '--out') opts.out = argv[++i];
    else if (arg === '--engines') opts.engines = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (arg === '--max') opts.max = Number(argv[++i]);
    else if (arg === '--concurrency') opts.concurrency = Number(argv[++i]);
    else if (arg.startsWith('--')) throw new Error(`unknown option: ${arg}`);
    else opts.seeds.push(arg);
  }
  return opts;
}

async function loadSeeds(opts) {
  const fromFile = opts.seedsFile
    ? (await readFile(opts.seedsFile, 'utf8')).split('\n').map((line) => line.replace(/#.*/, '').trim()).filter(Boolean)
    : [];
  return [...new Set([...opts.seeds, ...fromFile])];
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    process.stdout.write(help());
    return;
  }
  const seeds = await loadSeeds(opts);
  if (!seeds.length) {
    process.stderr.write(help());
    process.exitCode = 1;
    return;
  }
  for (const engine of opts.engines) {
    if (!engineNames.includes(engine)) throw new Error(`unknown engine: ${engine}`);
  }
  const generated = new Date().toISOString().slice(0, 10);
  const groups = [];
  for (const seed of seeds) {
    process.stderr.write(`collect ${seed}\n`);
    groups.push(await collectSeed(seed, opts));
  }
  const root = path.resolve(opts.out);
  const catalogDir = path.join(root, 'catalog');
  const docsDir = path.join(root, 'docs');
  await mkdir(catalogDir, { recursive: true });
  await mkdir(docsDir, { recursive: true });
  await writeFile(path.join(root, 'keywords.csv'), toCsv(groups));
  await writeFile(path.join(docsDir, 'keywords.json'), toJson(groups, generated));
  await writeFile(path.join(docsDir, 'index.html'), toHtml(groups, generated));
  for (const group of groups) {
    await writeFile(path.join(catalogDir, `${fileSlug(group.seed)}.md`), toMarkdown(group, generated));
  }
  const count = groups.reduce((sum, group) => sum + group.keywords.length, 0);
  process.stderr.write(`${count} keywords → ${root}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
