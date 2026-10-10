import assert from 'node:assert/strict';
import test from 'node:test';
import { classify, queriesFor, relevantToSeed, slugify } from '../src/expand.mjs';
import { parseSuggestions } from '../src/suggest.mjs';
import { toCsv } from '../src/render.mjs';

test('Chinese seeds stay unspaced', () => {
  const queries = queriesFor('长尾词', { max: 5 });
  assert.equal(queries[0], '长尾词');
  assert.equal(queries[1], '长尾词怎么做');
  assert.equal(queries.includes('长尾词 怎么做'), false);
});

test('English seeds get a suffix and a prefix', () => {
  const queries = queriesFor('invoice excel', { max: 4 });
  assert.deepEqual(queries, ['invoice excel', 'invoice excel how to', 'how to invoice excel', 'invoice excel what is']);
});

test('classify puts alternatives ahead of generic tools', () => {
  assert.equal(classify('glean alternative for mid size'), 'comparison');
  assert.equal(classify('长尾词和关键词的区别'), 'comparison');
  assert.equal(classify('how to find long tail keywords'), 'question');
  assert.equal(classify('长尾词挖掘免费工具'), 'commercial');
  assert.equal(classify('meeting minutes template'), 'template');
});

test('drops suggestions that lost the seed', () => {
  assert.equal(relevantToSeed('glean alternative', 'how to clean alternative flooring'), false);
  assert.equal(relevantToSeed('glean alternative', 'glean alternatives reddit'), true);
  assert.equal(relevantToSeed('员工找不到公司资料', '员工找不到公司资料怎么办'), true);
  assert.equal(relevantToSeed('员工找不到公司资料', '找不到员工怎么办'), false);
  assert.equal(relevantToSeed('long tail keywords', 'vs system keywords'), false);
});

test('slug keeps CJK', () => {
  assert.equal(slugify('长尾词'), '长尾词');
  assert.equal(slugify('Long Tail Keywords!'), 'long-tail-keywords');
});

test('parsers read each engine shape', () => {
  assert.deepEqual(parseSuggestions('google', '["q",["a","b"],[],{}]'), ['a', 'b']);
  assert.deepEqual(parseSuggestions('baidu', '["长尾词",["长尾词是什么意思"]]'), ['长尾词是什么意思']);
  assert.deepEqual(parseSuggestions('duckduckgo', '[{"phrase":"long tail keywords tool"}]'), ['long tail keywords tool']);
  assert.deepEqual(parseSuggestions('google', 'not-json'), []);
});

test('csv quotes commas', () => {
  const csv = toCsv([{ seed: 'a, b', keywords: [{ text: 'x', intent: 'other', engines: ['google'] }] }]);
  assert.match(csv, /"a, b",x,other,google/);
});
