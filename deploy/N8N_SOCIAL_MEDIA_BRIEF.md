# n8n automation: organic social media for SolDirectory (Instagram, Facebook, LinkedIn)

This is the brief for building the social media workflows in n8n. It is written to be handed over as it is.

The goal is **organic** reach: useful, accurate posts about the NDIS and aged care that send people to the right page on SolDirectory.
No paid ads, no buying followers, no automated following, messaging or commenting.

SolDirectory works in a sensitive area (disability and aged care, public funding rules, vulnerable people). A wrong or careless post
does more harm here than a missing one. So the design is: **the site's own content is the source, a person approves every post at
first, and the workflow cannot invent facts.**

---

## 1. What SolDirectory is (so the posts say it correctly)

- An independent Australian directory and enquiry service for NDIS and aged care providers and independent support workers.
  Website: `https://directory.solbusinessconsultant.com.au`
- It is **not** the NDIA, the NDIS Quality and Safeguards Commission, My Aged Care or any government body. It does not decide funding
  or eligibility. This is stated on the site's own About and Editorial Standards pages. Posts must never suggest otherwise.
- It lists providers who joined, and it also shows public register listings (NDIS Commission and My Aged Care registers) as
  information. A register listing shows what the public register records. It does **not** show who has capacity, who is better or
  who SolDirectory endorses.
- A person can send a request ("enquiry"), and providers who join can respond. At most 3 providers can unlock one request.
- Brand: name written as **SolDirectory** (one word, capital S and D). Primary colour `#1769E0`. Australian English.

## 2. Who each channel is for

| Channel | Audience | Tone | What works |
|---|---|---|---|
| Facebook (Page) | Participants, families, carers, older Australians, local community groups | Warm, plain, practical | Short explainers, checklists, "what changed" updates, links to guides |
| Instagram (Business account) | Participants, younger carers, support workers | Visual, plain, short | Carousels (checklists, "5 questions to ask"), simple quote-style cards, short Reels later |
| LinkedIn (Company Page) | Providers, support coordinators, plan managers, allied health, independent workers | Professional, practical | Provider guides (registration, audits, incidents, complaints), worker guides, policy changes, register facts |

Posts for participants and families go to Facebook and Instagram. Posts for providers and workers go to LinkedIn (and Facebook
where a group would find it useful). The same page can be used on all three, with the copy rewritten for each channel. Do not
paste identical text everywhere.

## 3. Hard rules (the workflow must enforce these in code, not only in the prompt)

These come from the audits already done on the site. They are non-negotiable.

**Facts**
1. Every number, date, price, rule and eligibility statement in a post must appear in the source page it links to, or in the
   `facts` object (section 6). If it is not in the source, leave it out. Never let the model add one.
2. No made-up statistics, testimonials, reviews, quotes, case studies or "success stories". No names of real participants,
   families, providers or workers.
3. Do not describe features that are not built. If unsure whether the site does something, check the page or ask the owner.
4. Anything time-sensitive (an NDIS rule change, a date, a price limit) must carry the date it was published and a link to the
   official source. Check it again on the day of posting; if the source page changed or was removed, do not post.

**Wording**
5. No superlatives or rankings: best, top, leading, number one, most trusted.
6. No price claims (cheap, affordable, discounted), guarantees, endorsements ("recommended by"), reviews or ratings.
7. Never say or imply that SolDirectory is an NDIS or government service, or that the NDIA endorses it.
8. Never use the words "unclaimed" or "not yet claimed" about any provider or listing.
9. Never promise a provider will have space or will respond. Say "send a request" and "providers who have joined can respond".
10. No medical, legal, financial or investment advice. Say where to get it (the participant's planner, the NDIA, a GP, Services
    Australia, a financial counsellor) and link to the official page.
11. Australian English (centre, organisation, behaviour). Plain words, short sentences. Aim for a reading level that most adults
    can follow. Write "people with disability", not "the disabled" or "sufferers".

**Images and people**
12. Use one of: (a) a text card made from the brand template (section 8), (b) a photo from the site's credited banner set (the
    credits are in `apps/web/public/images/banners/credits.json`; the photographer must be credited where the platform allows), or
    (c) a licensed asset the owner supplies. Never take photos from other websites, Google Images, the NDIS website or competitors.
13. **No identifiable person** on posts about a diagnosis or condition, mental health, dementia, a language or community, or
    veterans' funding. Use text cards or objects (hands, tools, homes, transport) for those.
14. Never describe a stock photo as a real participant or worker. Alt text describes the picture only.
15. Do not use the NDIS logo, the NDIA logo, the My Aged Care logo, the Australian Government crest or any provider's logo.
    SolDirectory is not them and the logos imply endorsement.

**Data protection**
16. Never post, store in a log or send to the model: anything from a participant's request (name, email, phone, address, needs),
    lead data, provider contact details, or provider account data. Social posts may use only public pages and public figures.
17. Do not name a specific provider in a post unless the owner asked for it in writing. A register or directory page may be linked,
    never singled out.

**Platform behaviour**
18. No automated likes, follows, comments, replies or direct messages. Replies to comments and messages are written by a person.
    Automate publishing only.
19. No engagement bait ("tag three friends"), no fake urgency, no hashtag stuffing (section 9).
20. Respect the platforms' limits and policies (section 11). If a platform rejects a post, do not retry in a loop.

## 4. Official resources the posts may be built from

Posts should point people to the official source and explain it in SolDirectory's own words. Link out; do not copy.

| Source | Use it for | Notes |
|---|---|---|
| NDIS (NDIA): `https://www.ndis.gov.au` | Plans, funding, pricing arrangements and price limits, participant and provider guidance, news and updates | Government copyright. Summarise in your own words, link to the exact page, never copy images or logos. Check the site's copyright notice before reusing any text or file. |
| NDIS Quality and Safeguards Commission: `https://www.ndiscommission.gov.au` | Provider registration, worker screening, the Code of Conduct, complaints, reportable incidents, the register of providers | Same approach |
| My Aged Care: `https://www.myagedcare.gov.au` | Aged care assessments, Support at Home, Commonwealth Home Support, finding services | Same approach |
| Aged Care Quality and Safety Commission: `https://www.agedcarequality.gov.au` | Aged care rights, complaints, quality standards | Same approach |
| Services Australia, Department of Veterans' Affairs, Medicare | Veterans' and Medicare-related funding pages already linked from the site's funding pages | Same approach |
| Australian Bureau of Statistics | Census figures, used on the suburb pages | The site credits it as: Source: Australian Bureau of Statistics, 2021 Census of Population and Housing, General Community Profile. Licensed under Creative Commons Attribution 4.0. Keep that credit if you quote a Census figure. |

**Important: do not try to get around blocking.** `ndis.gov.au` blocks automated requests. Do not scrape it or disguise the
workflow to get in. Use these instead:

1. **SolDirectory's own news posts and guides.** The site already summarises NDIS updates with links to the official page
   (for example the October 2026 budget changes, the 90-day claims change and the planned system updates). These are the
   preferred source because the site has already checked them.
2. **A human-curated queue.** Someone on the team pastes an official URL, with the date they read it, into a Google Sheet or a
   Slack message. The workflow reads that and drafts a post from the pasted summary. The person who pasted the URL is responsible
   for having read the page.
3. Where an official source offers an RSS feed or email newsletter, subscribing to it is fine.

Every post built from an official source must include the link to that source, and say "official source" or name the body.

## 5. Content the posts are built from

All of this is live on the site and can be linked to. Work out the full list from the sitemap (`/sitemap.xml`, which lists the
parts). The page types are:

| Page type | Path | Count and what is on it |
|---|---|---|
| Guides | `/guides/ndis-price-guide`, `/guides/choosing-a-provider`, `/guides/plan-management-basics`, `/guides/aged-care-support` | 4 long guides with official links and FAQs |
| Articles and news | `/blog/{slug}` | 54 articles: participant guides (choosing a provider, service agreements, plan reviews, rights, complaints, records, back-up plans), aged care guides (Support at Home, assessments, costs, respite, rights), provider guides (becoming registered, audits, Practice Standards, incidents, complaints, profiles, enquiries), independent worker guides (worker screening, Code of Conduct, ABN and insurance, rates, paperwork), and dated NDIS news updates |
| Funding topics | `/funding/{slug}` | 25 topics in 5 groups (NDIS plans, aged care, veterans, other funding, help with funding) |
| Condition topics | `/condition/{slug}` | 40 topics in 6 groups (developmental, mobility and physical, hearing and vision, psychosocial, chronic and complex medical, ABI and neuro) |
| Language topics | `/language/{slug}` | 40 topics in 6 groups (most requested languages, Middle East and Africa, First Nations, Europe, Asia Pacific, access and interpreting such as Auslan and Easy Read) |
| Services | `/services` and `/services/{service}/{state}/{suburb}` | 89 services in 15 categories; about 29,700 service-by-suburb and register pages |
| Registers | `/ndis-providers/{state}[/{suburb}]` and `/aged-care-providers/...` | Public register information by state and suburb |
| Glossary | `/glossary` | NDIS and aged care terms in plain English |
| For providers and workers | `/providers`, `/independent-workers`, `/support-coordinators` | The offers for businesses and workers |

**Pages that must not be promoted:** anything under `/admin`, `/dashboard`, `/leads`, `/onboarding`, `/track`, `/my-requests`,
`/login`, `/signup`, and any URL with a token or query string. Also do not promote pages marked `noindex`. If a page is not in the
sitemap, it is not ready to promote.

### Content pillars (spread the calendar across these)

| # | Pillar | Share | Channels | Example angle |
|---|---|---|---|---|
| 1 | Explainers: how the NDIS works in plain English | 25% | FB, IG, LI | "Core, Capacity Building and Capital supports explained" |
| 2 | Checklists and questions to ask | 20% | IG carousel, FB | "12 questions to ask before you choose a provider" |
| 3 | Funding and plan management | 15% | FB, IG, LI | "Self-managed, plan-managed or NDIA-managed: how to think about it" |
| 4 | Aged care (Support at Home, assessments, costs, rights) | 15% | FB, IG | "Getting an aged care assessment: what to expect" |
| 5 | Dated NDIS updates (what changed, what to check) | 10% | FB, LI | Only from the site's news posts or the curated official queue, with the date |
| 6 | For providers and workers | 10% | LI, FB | "Reportable incidents: what NDIS providers need to know" |
| 7 | Language and accessibility | 5% | FB, IG | "NDIS and My Aged Care information in your language" (links to the official in-language pages the site lists) |

Condition-specific topics (autism, ADHD, cerebral palsy and so on) are allowed, **text cards only, no people images**, and only
link to the site's page. Do not describe symptoms, treatments or prognosis.

## 6. Keywords and phrases to build around

These are the phrases the site is organised around. They are **starting points, not measured search volumes.** Before the first
month is planned, check them in Google Search Console (which queries already show impressions) and add the real winners. Do not
invent search volume numbers in any document.

**Core**
ndis, ndis providers, ndis provider directory, find ndis providers, ndis support, ndis funding, ndis plan, ndis price guide,
ndis pricing arrangements, ndis plan review, ndis service agreement, ndis complaints, ndis rights, aged care providers, my aged care,
support at home, home care packages, commonwealth home support, aged care assessment, respite care

**Plan and funding**
plan management, plan manager, self-managed ndis, agency-managed ndis, plan-managed ndis, support coordination, core supports,
capacity building supports, capital supports, ndis budget, ndis claims, ndis funding eligibility, dva home care, veterans home care,
icare workers compensation, private health insurance and disability, medicare care plans

**Services** (use the 89 service names from `/services`; the most useful for search)
personal care, supported independent living (SIL), specialist disability accommodation (SDA), short term accommodation and respite,
community access, transport, occupational therapy, physiotherapy, speech pathology, psychology, behaviour support, support
coordination, assistive technology, home modifications, house cleaning and household tasks, meal preparation, gardening,
employment supports (SLES), plan management, community nursing

**Places**
"{service} in {suburb}" and "ndis providers in {suburb}", by state and suburb. Use these for local posts and for LinkedIn and
Facebook regional posts, not as hashtags on every post.

**Participants and workers**
independent support worker, ndis worker screening check, ndis code of conduct, abn for support workers, how to become an ndis
provider, ndis registration, ndis audit, practice standards, reportable incidents

**Conditions** (text cards only): autism, ADHD, intellectual disability, cerebral palsy, spinal cord injury, acquired brain injury,
stroke recovery, multiple sclerosis, epilepsy, psychosocial disability, hearing loss, vision loss, Auslan

**Languages**: Arabic, Mandarin, Cantonese, Vietnamese, Greek, Italian, Hindi, Punjabi and the others listed under `/language`.
Posts in another language are allowed only if a fluent person has checked the text; do not publish machine translation of
funding or rights information unchecked.

**How to use keywords:** write for people first. Put the main phrase naturally in the first line of the caption and in the page
title it links to. Do not repeat a keyword to rank. Social posts do not rank in Google the way pages do; their job here is to
send the right people to the right page and to build recognition.

## 7. Facts the workflow may read

| Source | What it gives | Auth |
|---|---|---|
| `GET https://directory.solbusinessconsultant.com.au/sitemap.xml` | The list of public page parts and URLs | None |
| `GET /api/page-content?path=/services/plan-management/vic/preston` | The approved page copy (title, intro, sections, FAQs) for a service or register page, or 404 | None |
| `GET /api/stats/public` | Site-wide figures that are really backed by data. A figure that is absent must not be mentioned. | None |
| The live page itself | The title, description and text of any guide, article or topic page. `GET /seo-shell/<path>` returns the same HTML a crawler sees | None |
| `GET /api/automation/pages/{key}` | The `facts` for a suburb page (counts, nearby suburbs, Census figures) | `X-Automation-Key` (the same key as the page-rewrite workflow; see `deploy/N8N_SUBURB_REWRITE_PROMPT.md`) |

Local posts ("how many register listings in Preston") may use only numbers from `facts.numbers`. Say "the public register lists
{n}" and not "there are {n} providers available".

## 8. Images

Make the images in n8n, not by hand, so the output is consistent.

- **Brand text card** (the default). A fixed template: white or very light background, `#1769E0` accent, the headline in a
  large readable sans-serif font, a short line of context, "SolDirectory" in text at the bottom, and the page's short name. No
  logo is needed. Generate it from HTML with an HTML-to-image node or a self-hosted image service, and upload the result to
  storage with a public HTTPS URL (Instagram's API fetches the image from a URL).
- **Sizes.** Instagram feed 1080 x 1350 (4:5) or 1080 x 1080; carousel slides all the same size, up to 10 slides is plenty.
  Facebook 1200 x 630 for a link post, or 1080 x 1080 for an image post. LinkedIn 1200 x 627 for a link post, 1080 x 1080 for an image.
- **Contrast and size.** Body text at least 40 px on a 1080 px card, contrast ratio of at least 4.5 to 1. Many readers use screen
  readers or magnification, so also write real **alt text** for every image (describe the text on the card).
- **Photos.** Only from the credited banner set, and only on pages where the audit rules allow a person. When in doubt, use a
  text card.
- Keep the source files and the credit line in the log row for each post.

## 9. Writing the posts

### Format per channel

| | Facebook | Instagram | LinkedIn |
|---|---|---|---|
| Length | 40 to 120 words | 60 to 150 words (the first line shows before "more") | 80 to 200 words |
| Link | Yes, in the post | **Not clickable in captions.** Say "link in bio" and keep the bio link current; a link-in-bio page that lists the latest posts is the usual solution | Yes, in the post |
| Hashtags | 0 to 3 | 3 to 5, at the end | 0 to 3 |
| Emoji | Rare | A few, never in place of words | None or one |
| Image | Link preview or card | Required | Card or link preview |

### Hashtags (pick 3 to 5; do not use all)
`#NDIS` `#NDISAustralia` `#DisabilitySupport` `#PlanManagement` `#SupportCoordination` `#AgedCare` `#SupportAtHome`
`#IndependentLiving` `#DisabilityAustralia` `#CarersAustralia`. For providers: `#NDISProviders` `#DisabilityServices`.
Do not use hashtags that make a medical claim, and do not use a trending hashtag that has nothing to do with the post.

### Link tagging
Add UTM parameters to every link so the traffic is visible in the site's analytics:
`?utm_source=facebook|instagram|linkedin&utm_medium=social&utm_campaign=<pillar>&utm_content=<page-slug>`
Use lowercase, no spaces, and never put anything personal in a URL.

### System prompt for the writing step

```
You write short social media posts for SolDirectory, an independent Australian directory that helps people find NDIS and aged care
providers and independent support workers. SolDirectory is not the NDIA, the NDIS Quality and Safeguards Commission, My Aged Care or
any government body.

You are given the text of ONE page from the site (and sometimes a dated official source). Write one post for ONE channel, using only
what that text says.

Rules:
1. Use only facts in the source text. Do not add any number, date, price, rule, name or claim that is not in it. If the source does
   not say it, leave it out.
2. Do not recommend, rank or praise any provider. Never write best, top, leading, trusted, cheap, affordable, guaranteed, award-winning,
   or anything like them. No reviews, ratings or testimonials. No invented quotes or stories.
3. Do not give medical, legal or financial advice. Say where the person can get it, using only a source named in the text.
4. Do not say or suggest SolDirectory is a government or NDIS service, or that it is endorsed by one.
5. Never promise that a provider has space or will reply. Say "send a request" and "providers who have joined can respond".
6. Do not use the words "unclaimed" or "not yet claimed".
7. Plain Australian English (centre, organisation, behaviour). Short sentences. Say "people with disability".
8. If the source is a dated update, say the date and name the official body, and tell the reader to check the official page.
9. Start with the most useful sentence for the reader, not with "Did you know". No engagement bait, no pressure, no fake urgency.
10. Follow the channel length and hashtag limits you are given. Do not put the link inside the text for Instagram.
11. Return only JSON: {"caption": "...", "altText": "...", "cardHeadline": "...", "cardLine": "...", "hashtags": ["..."]}.
    cardHeadline is at most 60 characters. cardLine is at most 110 characters. altText describes the card in one sentence.
```

### User prompt (build it in a Code node)

```
Channel: {{channel}}   (facebook | instagram | linkedin)
Audience: {{audience}}
Pillar: {{pillar}}
Page title: {{title}}
Page URL (add it for facebook and linkedin; "link in bio" for instagram): {{urlWithUtm}}
Date of the source, if it is a dated update: {{sourceDate}}
Official source to name, if any: {{officialName}} {{officialUrl}}

SOURCE TEXT (the only things you may state)
{{pageText}}

Length: {{words}} words. Hashtags: {{hashtagMin}} to {{hashtagMax}}.
Return the JSON object only.
```

## 10. The checks that run before anything is posted (build these as a Code node)

A post is **rejected** (not posted, sent to Slack for a person) if any of these fail:

1. JSON is valid, and `caption` is within the channel length.
2. **Banned words** (case-insensitive): best, top-rated, leading, number one, #1, most trusted, trusted, reputable, award-winning,
   highly rated, recommended by, guaranteed, guarantee, cheap, affordable, low-cost, discount, free money, cure, miracle,
   act now, limited time, unclaimed, not yet claimed.
3. **Numbers:** every number of 10 or more in the caption and card must also appear in the source text. If not, reject.
4. **No contact details** in the caption: no phone numbers, email addresses or web addresses other than the one link added by the
   workflow.
5. **No personal data:** the source text never came from a lead, a request, a provider account or a worker account.
6. The link returns HTTP 200, has no `noindex`, and is in the sitemap.
7. Same page has not been posted on the same channel in the last 60 days (use the log, section 12).
8. For a dated update: the source is under 30 days old, or a person has re-approved it.
9. The image meets section 8 and a person-free card is used for condition, mental health, dementia, language and veterans topics.
10. Reading ease is reasonable: average sentence length under 22 words.

Send a rejected post to Slack with the reason and the fix, so the prompt can be improved. Do not retry the same prompt more
than twice.

## 11. The workflows

Build these as separate workflows so a failure in one does not stop the others. All of them write to the log (section 12) and
send errors to the Slack channel already set up.

### A. Plan the week (weekly, Sunday evening)
1. Read the sitemap and the log. Pick pages by pillar share (section 5) that have not been posted on that channel in 60 days.
2. For each chosen page, fetch the page text.
3. Create the posts (workflow B) for the channels that fit the audience.
4. Post the draft calendar to Slack as one message per day, with the image attached.

### B. Create one post
`Fetch page -> Code: build prompt -> LLM (JSON mode, temperature 0.4) -> Code: checks (section 10) -> make the image -> save as draft in the log`
With a retry that feeds the failed check back to the model, at most 2 times.

### C. Approve in Slack (the human gate)
Send the draft with the image and the link to the Slack channel with Approve and Reject buttons (or a reaction). **Nothing is posted
until a named person approves it.** After 4 weeks of clean runs, the owner may choose to auto-approve pillars 1 to 4 only, and
keep human approval for dated updates (pillar 5), anything about funding rules, and anything that mentions an official source.

### D. Publish (runs every 30 minutes, posts approved items whose time has come)
Best posting times for an Australian audience are a starting guess, not a fact. Start with weekdays at 7:30, 12:30 or 19:00
Australian Eastern time, and review the platforms' own insights after a month. Use the correct time zone and daylight saving.

| Channel | How |
|---|---|
| Facebook Page | Meta Graph API: `POST /{page-id}/photos` (image post) or `/{page-id}/feed` with `link` (link post). Needs a Page access token with page publishing permission |
| Instagram | Meta Graph API content publishing for an Instagram Business or Creator account connected to the Facebook Page: create a media container with a public `image_url` and `caption`, then publish it. Carousels: create each child container, then a carousel container. Check the publishing rate limit before each post |
| LinkedIn | Company Page post through LinkedIn's Posts API with the organisation permission, or n8n's LinkedIn node. Posting as the company (not a person) needs the right API product approved by LinkedIn |

Platform access rules change. **Before building, confirm with each platform's current developer documentation** what permissions,
app review and account type are needed, and tell the owner early if any approval is required, because approvals can take days or
weeks.

After publishing, save the post ID and URL in the log. On failure, stop, log it, alert Slack. Do not retry in a loop.

### E. Weekly report (Monday morning, to Slack)
Posts published, posts rejected and why, clicks by channel and page (from the site's analytics using the UTM tags), top three
pages by clicks, and anything that failed. Report only numbers that really came from the platforms or the analytics. Never
estimate.

### F. Error handler
One n8n error workflow connected to all of the above. Slack message with workflow name, node, error text (without any token or
header) and the log row ID. Critical failures (a revoked token, a 401 from a platform) also stop the schedule.

### G. Token and link health (daily)
Check that each platform token is still valid and expires in more than 7 days, that the link-in-bio page works, and that the
last 5 published links still return 200. Alert Slack if not.

## 12. The log

Keep a table (n8n Data Table, Google Sheet or Postgres) with one row per post:

`id, createdAt, channel, pillar, pageUrl, pageKey, sourceDate, officialSource, captionHash, caption, imageUrl, altText, checks (pass/fail list), status (draft | rejected | approved | published | failed), approvedBy, approvedAt, scheduledAt, publishedAt, platformPostId, platformUrl, error`

Use it to stop repeats, to build the weekly report and to show what was posted if a post is questioned.

## 13. Cadence to start with

| Weeks | Facebook | Instagram | LinkedIn |
|---|---|---|---|
| 1 to 2 (pilot, all approved by a person) | 3 per week | 3 per week | 2 per week |
| 3 to 8 | 4 per week | 4 per week | 3 per week |
| After review | Decide from the real insights | | |

Do not post more than once a day per channel. Quality and accuracy matter more than volume; one wrong funding statement costs more than
a month of missed posts.

## 14. Accounts and access (the owner provides these, never the workflow)

- A Facebook Page and an Instagram Business account linked to it, and a Meta app set up for publishing. Owner decides who is the admin.
- A LinkedIn Company Page with an admin who can approve API access.
- Social profile handles, bio text, profile image and the link-in-bio page. **Do not invent a handle, phone number or email in
  any post or bio.** Contact details come from the site's configured values only.
- Store every token and secret as an n8n credential. Never in a node, a prompt, a post or the log.
- Brand image files for the profile (supplied by the owner).

## 15. Do not do these

- Do not scrape or copy another website's posts, images, captions or hashtag sets. The owner has already decided not to use
  competitor wording or data.
- Do not post copy from `ndis.gov.au` or any other source word for word, and do not reuse its images or logo.
- Do not auto-reply, auto-follow, auto-like, auto-DM or comment on other pages.
- Do not buy followers, join engagement pods or use automation that breaks a platform's rules.
- Do not post anything about an individual provider, worker or participant without the owner's written approval.
- Do not run the workflow on its own for the first two weeks.

## 16. Test it before you scale

1. Build workflow B for one guide, `/guides/plan-management-basics`, and one news post. Read the output and the check results.
2. Feed it a page with a number the model might invent and confirm the number check rejects it.
3. Feed it the words "best provider" in the source and confirm the banned-word check rejects the caption.
4. Make one card for each channel and check the text size and contrast on a phone.
5. Post one item to a **private test Page and test Instagram account** first. Confirm the link, UTM tag and image.
6. Run the approval flow in Slack end to end, including a reject.
7. Run the pilot (week 1 to 2) with a person approving every post, and read every post once it is live.
8. Review the report with the owner, then decide whether to widen the cadence.

## 17. Decisions the owner needs to make (before the build starts)

1. Which Facebook Page, Instagram account and LinkedIn Page will be used, and who administers them.
2. Who approves posts in Slack, and who covers when they are away.
3. The link-in-bio destination for Instagram.
4. Whether posts in languages other than English are wanted, and who will check them.
5. Whether the privacy policy should be updated to mention social channels (the owner or counsel decides).
6. Which AI model the workflow uses, and a monthly spend limit.

---

**Questions about the site, the API key or any fact in this brief go to the site owner.** If a fact here and a fact on the live site
disagree, the live site wins; tell the owner so this brief can be corrected.
