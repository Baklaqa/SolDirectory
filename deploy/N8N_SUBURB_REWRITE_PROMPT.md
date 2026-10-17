# n8n automation: rewrite the suburb pages with unique, SEO-scored content

This is the brief for building the n8n workflow. It is written to be handed over as it is. Everything it needs from the site is behind
one key-protected API, and the site itself decides whether a rewrite is good enough to publish, so the workflow cannot publish
something bad even if the prompt drifts.

---

## 1. What you are building

A workflow that, on a schedule or on demand:

1. asks the site which pages still need unique copy,
2. fetches the **facts** for one page (the only things the copy may state),
3. has an LLM write the copy as JSON,
4. sends it to the site's **validate** endpoint, which returns a score out of 100 and a list of problems,
5. if the score is below the threshold, sends the problems back to the LLM and tries again (at most 3 attempts),
6. when it passes, saves it. The site then shows the copy on the page, adds the page to the sitemap, and mirrors it to WordPress.

The score is **deterministic and computed by the site** (no AI). The workflow cannot talk its way past it.

**Pages in scope.** About 29,700 pages: service x suburb pages (`/services/plan-management/vic/preston`) and NDIS or aged care
register pages for each state and suburb (`/ndis-providers/vic/preston`). Start with the busiest; the API lists them busiest first.

## 2. Access

| | |
|---|---|
| Base URL | `https://directory.solbusinessconsultant.com.au/api/automation` |
| Auth | header `X-Automation-Key: <key>` (or `Authorization: Bearer <key>`). The key is `AUTOMATION_API_KEY` in the API's `.env` on the server. Ask the site owner for it. Store it as an n8n credential (Header Auth), never in a node or a prompt. |
| Format | JSON in, JSON out. `Content-Type: application/json` |
| Concurrency | At most 2 requests at a time and about 1 request per second. The API has no queue. |
| If the key is not set on the server | every call returns `503`, by design. |

Page **keys** identify a page. They are lowercase and contain colons, so URL-encode them in paths if your HTTP node does not:

```
service:<service-slug>:<state>:<suburb-slug>      service:plan-management:vic:preston
register:<ndis|aged_care>:<state>:<suburb-slug>   register:ndis:vic:preston
register:<ndis|aged_care>:<state>                 register:aged_care:vic        (a state page)
```

## 3. Endpoints

| Method and path | What it does |
|---|---|
| `GET /health` | Confirms the key works. Returns `minScore`, `indexPhase`, `wordpressConfigured`, stored counts. Call it first in every run. |
| `GET /rules` | The limits, banned wording, JSON schema and score areas. **Build your prompt from this**, so the prompt and the checker never disagree. |
| `GET /stats` | `totalPages`, `approved`, `rejected`, `stale`, `unpublished`, `todo`, `todoInCurrentIndexPhase`. |
| `GET /pages` | The work list, busiest first. Query: `status` (`todo` default, `approved`, `rejected`, `stale`, `unpublished`, `all`), `kind` (`service` or `register`), `state` (`vic`), `service` (`plan-management`), `minListings`, `indexable=1` (only pages in the current indexing phase), `limit` (max 500), `offset`. |
| `GET /pages/:key` | `{ facts, stored, minScore }`. `facts` is everything the copy may use. `stored` is any earlier attempt. |
| `POST /pages/:key/validate` | Body `{ "content": {...} }`. Scores a draft **without saving**. Returns `score`, `passed`, `hardFail`, `breakdown`, `issues[]` (each has `code`, `severity`, `message`, `fix`), `stats`. |
| `PUT /pages/:key/content` | Body `{ "content": {...}, "runId": "...", "attempts": 2, "source": "n8n" }`. Scores and **saves**. Returns `status` `approved` or `rejected`. A rejected rewrite never replaces copy that is already approved (it returns `202`, `stored: false`). |
| `POST /pages/:key/unpublish` | Takes a page's copy down (it stops showing and leaves the sitemap). |
| `POST /stale-check` | Body `{ "limit": 500 }`. Re-checks approved copy against today's facts. If a number it states is no longer true (for example the register was re-imported and a count changed), the page goes to `stale` and the site stops showing it. Re-queue those. |
| `POST /sync` | Body `{ "keys": [...] }` or `{ "limit": 100, "includeBaseline": false }`. Mirrors pages to WordPress. With no keys it syncs approved, stale and unpublished pages that changed since their last sync. `includeBaseline: true` also creates a draft post (facts only) for pages with no copy yet. |

Public (no key): `GET /api/page-content?path=/services/plan-management/vic/preston` returns the approved copy for a page, or 404.

### Status codes

| Code | Meaning | What to do |
|---|---|---|
| 200 | Done | Continue |
| 202 | Rewrite was below the threshold and the page already has approved copy, so it was not replaced | Log and move on |
| 400 | Bad key format | Fix the key |
| 401 | Missing or wrong key | Stop the run and alert |
| 404 | Page does not exist (not enough register listings) | Skip the page |
| 422 | The `content` is not in the right shape | Fix the parsing; `details[]` says which field |
| 503 | Automation API switched off, or WordPress not configured (for `/sync`) | Stop and alert |

## 4. The content the LLM must return

Plain text only, no HTML or markdown. Exactly this shape:

```json
{
  "seoTitle": "Plan management in Preston, VIC",
  "metaDescription": "See how plan management is listed in Preston, VIC: 20 register listings, nearby suburbs, and what to check before you choose a plan manager.",
  "intro": "…70 to 150 words…",
  "sections": [ { "heading": "…", "body": "…50 to 170 words…" } ],
  "faqs": [ { "question": "…?", "answer": "…20 to 90 words…" } ]
}
```

### The rules the site checks (all of them are in `GET /rules` too)

| Item | Rule |
|---|---|
| `seoTitle` | 25 to 46 characters. Names the service and the suburb. Do not add the brand: the site adds " \| SolDirectory". |
| `metaDescription` | 110 to 160 characters. Names the service and the suburb. Ends with a full stop, never an ellipsis. |
| `intro` | 70 to 150 words. The service and the suburb appear in the first 30 words. |
| `sections` | 3 to 5, each 50 to 170 words, heading up to 70 characters. At least two headings name the suburb or the service. |
| `faqs` | 4 to 6. Each question ends with `?`. Each answer is 20 to 90 words. |
| Total | 450 to 1,000 words. |
| Keywords | Use the exact phrase "<service> in <suburb>" at most 3 times. Mention the state once. |
| Numbers | **Only numbers that appear in `facts.numbers`.** Any other number of 10 or more is a hard failure. Write them as digits (`1,844`, `6.4 per cent`). |
| Uniqueness | No more than 25 per cent of the copy's 5-word phrases may also appear on a neighbouring page's copy. Use this suburb's own facts. |
| Facts used | At least 4 different numbers from `facts.numbers`, and name the nearby suburbs from `facts.nearby`. |
| Readability | Flesch reading ease of 45 or more. Sentences under 22 words. Everyday words. |
| Spelling | Australian English: centre, organisation, behaviour, colour, neighbour. |

**Hard failures** (the copy is never shown, whatever else it scores; the score is capped at 49):
`banned_phrase`, `markup`, `contact_details`, `unsupported_number`, `intro_missing_names`.

**Banned wording.** Superlatives and rankings (best, top-rated, leading, number one); price claims (affordable, cheap, low-cost,
discount); endorsements (trusted, reputable, award-winning, highly rated, recommended by); guarantees; invented reviews or
testimonials; pressure language (act now, limited time); medical claims (cure, miracle); and the words "unclaimed" or "not yet
claimed". The site does not endorse any provider and never says one is better than another.

**No web addresses, email addresses or phone numbers.** The site adds its own links.

## 5. Score and threshold

The score is out of 100:

| Area | Points |
|---|---|
| Structure (title, description, intro, sections, questions) | 20 |
| Keywords (placement, no stuffing, state named) | 15 |
| Length | 10 |
| Uniqueness against neighbouring pages | 20 |
| Grounded in the facts (numbers and suburb names used) | 20 |
| Readability | 10 |
| Compliance (no hard failure) | 5 |

- **The site approves a rewrite only if it has no hard failure and scores at least `minScore`** (80 by default, set by
  `AUTOMATION_MIN_SCORE` on the server). Read `minScore` from `/health`.
- In the workflow, treat the threshold as a variable. You may set it **higher** than the server's (for example 85 to be stricter), never lower;
  the server will reject anything below its own.
- Only an `approved` page is shown on the site and listed in the sitemap, and it must also have the minimum number of register listings.
  Pages that are `rejected` are kept for review and are never shown.
- A page whose copy scores 90 or more is excellent. 80 to 89 is acceptable. Anything under 80 is rewritten.

## 6. The workflow

```
Trigger (Schedule, e.g. hourly, or Manual)
  -> HTTP GET /health            (stop if not ok)
  -> HTTP GET /rules             (keep limits and minScore in workflow data)
  -> HTTP GET /pages?status=todo&indexable=1&limit=20
  -> Split In Batches (1 page at a time, max 2 in parallel)
       -> HTTP GET /pages/{key}                         -> facts
       -> Code: build the prompt (section 7)
       -> LLM (JSON mode, temperature 0.5)              -> content
       -> Code: parse JSON (strip code fences)
       -> HTTP POST /pages/{key}/validate
       -> IF passed AND score >= threshold
            yes -> HTTP PUT /pages/{key}/content        (runId = execution id, attempts = n)
            no  -> IF attempts < 3
                     yes -> Code: add the issues to the prompt, attempts + 1 -> back to the LLM
                     no  -> HTTP PUT /pages/{key}/content   (saved as rejected, for review)
       -> Wait 1 second
  -> HTTP POST /sync  { "limit": 100 }                   (mirror to WordPress)
  -> Notify (Slack or email): pages approved, rejected, average score, rejected keys and their top issue
```

Also add two scheduled workflows:

- **Weekly: stale check.** `POST /stale-check { "limit": 500 }`, then the main workflow picks the stale pages up with `GET /pages?status=stale`.
- **After a register import:** run the stale check straight away, because counts change.

Order of work (so the best pages go first): `indexable=1` pages, busiest first, services before register suburbs. Pilot with 20 pages,
read ten of them yourself, then raise `limit` and let it run.

## 7. Prompts

### System prompt

```
You write copy for SolDirectory, an Australian directory that helps people find NDIS and aged care providers. You write one web page's
copy at a time, as JSON, using only the facts you are given.

Rules you must follow:
1. Use only the facts in the "facts" object. Do not add any number, name, date, price, statistic, law or claim that is not in it.
   Every number of 10 or more must appear in facts.numbers. If you cannot support a sentence from the facts, leave it out.
2. Do not recommend, rank or praise any provider or suburb. Never write best, top, leading, trusted, affordable, cheap, guaranteed,
   award-winning, highly rated, or anything like them. Never mention reviews, testimonials or ratings.
3. A register listing shows what the public register records. It does not show who has capacity, who is better, or who is endorsed.
   Say so where it helps the reader.
4. Do not include web addresses, email addresses, phone numbers, HTML or markdown.
5. Do not use the words "unclaimed" or "not yet claimed".
6. Write plain Australian English (centre, organisation, behaviour). Short sentences, under 22 words. Everyday words.
7. Make this page different from its neighbours: lean on this suburb's own numbers, nearby suburbs, reach, supports, and Census figures.
   Do not reuse phrases across sections. Do not start every section the same way.
8. Name the service and the suburb in the title, the description, the first sentence of the intro, and at least two headings. Say
   "<service> in <suburb>" no more than three times in all. Mention the state once.
9. If facts.census is present, one section may describe it. Say "at the 2021 Census". Do not call it current.
10. Return only a JSON object with the keys seoTitle, metaDescription, intro, sections, faqs. No commentary.

Limits: seoTitle 25 to 46 characters (no brand name). metaDescription 110 to 160 characters, ends with a full stop. intro 70 to 150
words. 3 to 5 sections of 50 to 170 words, each with a heading of up to 70 characters. 4 to 6 questions ending in "?", answers 20 to
90 words. 450 to 1,000 words in total.
```

### User prompt (build it in a Code node)

```
Write the copy for this page.

PAGE
Path: {{facts.path}}
Service: {{facts.names.service}}      (empty for a register page)
Suburb: {{facts.names.suburb}}        (empty for a state page, use the state name)
State: {{facts.names.stateName}} ({{facts.names.state}})
Register: {{facts.names.register}}
What the page says now (do not repeat it): {{facts.baseline.h1}}

FACTS (the only things you may state)
{{JSON.stringify(facts, null, 2)}}

SERVICE GUIDANCE (plain background you may paraphrase; do not copy it)
{{facts.serviceGuidance?.shortAnswer}}

Suggested sections (adapt them to what is most useful for this page):
1. Who lists {{service}} in {{suburb}} (counts, how many list a website, how many list only this support).
2. How far these providers travel (the reach bands).
3. Nearby suburbs to compare (names, distances, counts from facts.nearby and facts.nearestTown).
4. What the 2021 Census says about {{suburb}} (only if facts.census is not null).
5. What to check before you choose (registration, fees, capacity; no numbers needed).

Return the JSON object only.
```

### Retry prompt (attempts 2 and 3)

Add this to the user prompt, filled from the validate response:

```
Your previous attempt scored {{score}} out of {{minScore}} needed. Fix these problems and return the full JSON again:
{{issues.map(i => '- [' + i.severity + '] ' + i.message + ' Fix: ' + i.fix).join('\n')}}
Keep what already worked. Do not introduce new numbers.
```

## 8. Reading and syncing through WordPress

Each page is mirrored to WordPress so editors can read it and so the WordPress API lists every page.

- Service pages are `service_area_page` posts: `GET /wp-json/wp/v2/service-area-pages?slug=plan-management-vic-preston`
- Register pages are `register_area_page` posts: `GET /wp-json/wp/v2/register-area-pages?slug=ndis-vic-preston` (state pages: `ndis-vic`, `aged-care-vic`)
- Slugs are `<service>-<state>-<suburb>` and `<ndis|aged-care>-<state>[-<suburb>]`.
- Each post has `meta.sd_facts_json` (the facts), and, once approved, `meta.sd_seo_title`, `meta.sd_seo_description`, `meta.sd_intro`,
  `meta.sd_sections_json`, `meta.sd_faqs_json`, `meta.sd_score` and `meta.sd_status` (`baseline`, `approved`, `stale`, `unpublished`).
  Posts with no copy yet are drafts. Only approved pages are published.
- **Mongo is the source of truth.** Do not edit these posts in WordPress or write to them from n8n: the next `POST /sync` overwrites them.
  Write copy through `PUT /pages/:key/content`, then `POST /sync`.
- Ask the site owner to run `npm run sync:pages-wp -w apps/api -- --baseline` once, to create the draft post for every page.

## 9. Safety rules for the workflow

- Never send the LLM anything except the `facts` object, the service guidance in it, and the rules above. Do not paste in competitor
  pages or scraped text. Copy only the facts, never someone else's wording.
- Never publish by any route except `PUT /pages/:key/content`. Do not write to the database or to WordPress directly.
- Never lower the threshold below the server's `minScore`, and never retry a page more than 3 times in one run.
- Stop the whole run on a 401 or 503 and alert. Do not loop.
- Keep a log row per page: key, attempts, final score, status, run id, the top issue if it was rejected.
- Read a sample of approved pages yourself every week. The score checks the rules; it cannot tell you the copy is a good read.
- Anything about eligibility, prices, funding rules or law must come from the site's own guides, not from the model. If the model
  adds one, the number check will usually catch it, but treat it as a bug in the prompt.

## 10. Test it before you scale

1. `GET /health` returns `ok: true`.
2. Take `service:plan-management:vic:preston`. `GET /pages/{key}` returns facts.
3. Send this to `POST /pages/{key}/validate`: `{ "content": { "seoTitle": "x", "metaDescription": "x", "intro": "x", "sections": [], "faqs": [] } }`.
   Expect a low score with `fix` text for each problem.
4. Generate real copy, validate it, and read the `issues`. Iterate on the prompt until it passes first time most of the time.
5. `PUT` it, open `https://directory.solbusinessconsultant.com.au/services/plan-management/vic/preston`, and check the title, the new sections and the questions.
6. `view-source:` the same page, or `GET /seo-shell/services/plan-management/vic/preston`, and confirm the crawler HTML has the same copy.
7. Run 20 pages, read ten, then scale.
