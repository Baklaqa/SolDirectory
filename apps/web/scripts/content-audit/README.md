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
| /funding | 32% (was 47%) | 47 (was 31) | 633 |
| /condition | 41% (was 69%) | 33 (was 29) | 611 |

The shared-copy figure only counts a block as shared when it sits on at least a quarter of a family's pages. The six NDIS
funding pages are the only group that reaches that threshold, so they read 50-60% shared while the other groups read
about 35%. The records, provider questions and pitfalls lists are still group-level for every group.

Aim for under about 50% shared copy in a family, with something real and specific to the page (register counts, per-topic
text) above the template. A page with nothing specific should be kept out of search results until it has something.

`corpus.json` and `quality_rows.json` are generated and are not committed.

## Getting the full text of the audit emails

`gmail-export.js` copies the complete text of the On-Page SEO Audit emails out of Gmail (it only reads what Gmail has already
loaded in your own browser). Open one email, or a search result list, press F12, paste the file into the Console, press Enter.
The text goes to your clipboard and to a `sol-audits-<date>.txt` download. See the header of the file for settings.
