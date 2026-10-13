# SEO page list

Generated from the live sitemap and the server-rendered HTML each page sends to search engines, so it matches what is
actually published. Domain: https://directory.solbusinessconsultant.com.au

## Files

- `priority-pages.csv`: 406 pages to work through one by one (columns below).
- `bulk-templates.csv`: the template pages (about 59,000 URLs) described by pattern and sitemap file. Fix these at the
  template, not page by page.

### Columns in priority-pages.csv

| Column | Meaning |
| --- | --- |
| priority | 1 = money and entry pages, 2 = content that should rank, 3 = long-tail and template examples |
| type | kind of page |
| url, path | full address, and path only |
| title, title_chars | current page title and its length (aim 30-65) |
| meta_description, meta_chars | current description and its length (aim 70-160) |
| h1 | main heading in the HTML |
| words_in_html | words in the server-rendered body (what a crawler sees without JavaScript) |
| schema_types | structured data present (BreadcrumbList, FAQPage, Service, BlogPosting and so on) |
| note | for suburb pages, the number of register listings |

## Order of work

1. Priority 1 (9 pages): home and the eight main landing pages.
2. Priority 2 (~190 pages): hubs, guides, funding topics, state register pages, service pages and blog articles.
3. Priority 3 (~200 pages): conditions, languages and the busiest suburb and service-by-suburb pages. Use these as
   samples for fixing the templates.

## Per-page checklist

- One primary keyword, in the title (first 60 characters), the H1 and the first paragraph.
- Title 30-65 characters; description 70-160 characters and written to earn the click.
- At least 300 words of real copy (priority 1 pages: 700 or more).
- Three or more internal links in the body, including one to a guide and one to a hub.
- Structured data that fits the page (FAQPage only where the page shows those questions).
- Image `alt` text, and the page present in the sitemap with a sensible lastmod.
- After deploying: Inspect URL in Google Search Console and request indexing for priority 1 and 2.

## Where the copy lives (so a change is made once)

- Titles and descriptions for blog articles: `packages/topic-content/blogSeoTitles.js` and each article's `summary`.
- Hub and landing page reading copy and FAQs: `packages/topic-content/hubContent.js` and `pageContent.js`.
- Glossary: `packages/topic-content/glossary.js`. Editorial standards: `editorialContent.js`.
- Register and suburb templates: `apps/api/src/controllers/registerShell.controller.ts`.
