# Content audit scripts

Measure how much of each page family's copy is repeated across its pages, and how readable it is.

```bash
python apps/web/scripts/content-audit/corpus.py     # fetch every page in sitemap-pages.xml -> corpus.json (BASE= to point at staging)
python apps/web/scripts/content-audit/quality.py    # per family: words, unique words, shared-copy share, reading ease, FAQ share
```

Reference results, 15 October 2026, before the language, condition and funding fixes:

| Family | Pages | Shared copy | Reading ease |
|---|---|---|---|
| /language | 41 | 72% | 25 |
| /condition | 41 | 69% | 29 |
| /funding | 26 | 47% | 31 |
| /services | 81 | 25% | 50 |
| /blog | 54 | 7% | 58 |

Aim for under about 50% shared copy in a family, with something real and specific to the page (register counts, per-topic
text) above the template. A page with nothing specific should be kept out of search results until it has something.

`corpus.json` and `quality_rows.json` are generated and are not committed.
