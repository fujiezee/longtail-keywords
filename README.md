# Long-tail keyword finder

Find long-tail keywords from a seed. The phrases come from public autocomplete on Google, Baidu, and DuckDuckGo. No API key, no search-volume numbers.

# 长尾词挖掘

从一个种子词挖长尾词。用的是 Google、百度、DuckDuckGo 的公开搜索联想，不用申请密钥，也不编造搜索量。

## Use

Requires Node.js 20 or newer.

```bash
node bin/longtail.mjs "长尾词" "long tail keywords"
node bin/longtail.mjs --seeds seeds.txt --out .
```

That writes:

| Path | What |
| --- | --- |
| `catalog/<seed>.md` | One phrase list per seed |
| `keywords.csv` | Same rows in a spreadsheet |
| `docs/index.html` | Filterable page (GitHub Pages) |
| `docs/keywords.json` | The page’s data |

A published pass of the seeds in `seeds.txt` is already in this repo. Open the page: [fujiezee.github.io/longtail-keywords](https://fujiezee.github.io/longtail-keywords/).

## What “long-tail” means here

A suggestion is kept when the engine offers it for the seed or for a short modifier (`how to`, `alternative`, `怎么做`, `替代`, …) and it is not the seed itself. Intent labels are only a sort key:

| Intent | Examples |
| --- | --- |
| comparison | vs, alternative, 区别, 替代 |
| question | how to, what is, 怎么, 是什么 |
| commercial | free, tool, 免费, 工具, 多少钱 |
| template | template, 教程, 模板 |

People search these phrases. The head term (`SEO`, `知识库`) is crowded. The longer line (`长尾词挖掘免费工具`, `glean alternative for mid size company`) is the one a single page can answer.

## Sample, collected from live suggestions

| Seed | Phrase |
| --- | --- |
| long tail keywords | long tail keywords finder |
| long tail keywords | long tail keywords examples |
| 长尾词 | 长尾词关键词挖掘工具 |
| 长尾词 | 长尾词挖掘免费工具 |

Regenerate with `node bin/longtail.mjs --seeds seeds.txt --out .` when you want a fresh pass. Engines change their lists.

## Duaer

This project is published by [Duaer](https://www.duaer.com). Duaer makes AI understand your company and follow through on what is due.

When a seed matches a Duaer guide, the catalog page links it. Guides: [doc.duaer.com/guides](https://doc.duaer.com/guides/).

## Test

```bash
node --test
```
