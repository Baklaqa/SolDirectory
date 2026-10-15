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

After the funding and condition rewrite, measured on the crawler HTML from a local API with no register data (15 October 2026).
Re-run `corpus.py` then `quality.py` against production after deploy for the real figures:

| Family | Shared copy | Reading ease | Median words |
|---|---|---|---|
| /funding | 38% (was 47%) | 42 (was 31) | 745 |
| /condition | 41% (was 69%) | 30 (was 29) | 618 |

The shared-copy figure only counts a block as shared when it sits on at least a quarter of a family's pages, so the six NDIS
funding pages (one group of six) still read about 70% shared: the group-level steps, records and provider questions are
the same list on each of them by design.

Aim for under about 50% shared copy in a family, with something real and specific to the page (register counts, per-topic
text) above the template. A page with nothing specific should be kept out of search results until it has something.

`corpus.json` and `quality_rows.json` are generated and are not committed.
