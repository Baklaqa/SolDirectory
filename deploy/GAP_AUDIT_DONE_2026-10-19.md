# SolDirectory gap audit: what is done (19 October 2026)

For the team. Source: the Compliance and Website Gap Audit (Saf, Talha, Zain). The full working notes are in `deploy/GAP_AUDIT_STATUS.md`. Everything marked "in code" is on the `main` branch.

**How to read the marks**
- **Live, checked**: it is on the live site and someone looked at the live result.
- **In code**: written, tested on a local copy, and on `main`. It reaches the live site with a deploy, and some items also need a server step.
- **Needs a person**: only a person at the business or on the server can do it.

---

## 1. Search and indexing

| # | What | Status |
|---|---|---|
| A1 | **Indexing plan.** Phased indexing built, then moved on 19 October 2026 to the widest setting (phase 4): every suburb page with enough listings is indexed and in the sitemap, and so are the individual register profile pages. About **48,800 URLs** in a sitemap of 7 files. Service pages with fewer than 5 listings stay out (about 7,600). | **Live, checked**: the live sitemap lists the 7 files. Not yet submitted to Google. |
| A2 | **Service x suburb pages are no longer templated.** Each has the suburb's rank, the six closest suburbs with real distances, a "who lists this here" analysis, languages, and five questions built from that suburb's data (marked up for search). Service guidance kept, nothing trimmed. Repeated sentences fell from 98% to 82%; words on no other page rose from 11% to 32% (100 pages measured). | In code |
| A2b | **Register state and suburb pages** got the same treatment (repeated sentences 85% to 75%; words on no other page 26% to 37%, 80 pages measured). | In code |
| A2c | **ABS 2021 Census facts** on 95% of suburb pages (population, age, share needing help, income, each compared with the state), with the required CC BY 4.0 credit and a data-sources section. | In code |
| A3 | Individual register profile pages: were noindex; now indexed under phase 4 (see A1). Switch back in `packages/topic-content/indexingPolicy.js` if Search Console shows bulk "crawled, not indexed". | In code |

**Risk to watch (A1):** the audit advised against indexing thin or templated pages. Phase 4 was chosen deliberately. Watch Search Console Coverage after submitting, and submit the sitemap files one at a time.

## 2. Register data and takedowns

| # | What | Status |
|---|---|---|
| B1 | "Register data last imported on ..." shown on hubs, state, suburb and provider pages; the date now moves on every import. | In code |
| B2 | Report-or-remove link on every register page, 5 business day reply time, and a line for individuals and sole traders. Command to remove a listing and keep it off future imports. | In code. **Needs a person** to watch the mailbox and run the command. |
| B3 | Monthly refresh tooling: import with `--prune`, a tool to remove providers named in Commission compliance actions, and a daily alert when an import is over 35 days old. | In code. **Needs a person** to do the monthly download and run it (the Commission publishes no download, so part of it is manual). |

## 3. Security and server

| # | What | Status |
|---|---|---|
| C1/C3 | **HSTS 1 year, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy** on the live site, set once each by nginx. | **Live, checked** (19 Oct 2026, `curl -I`). |
| C2 | Nginx version hidden (`server_tokens off`). | Reported done on the server; not re-checked. |
| C1 | **Content-Security-Policy** (starts as Report-Only). The generator is in code, but the headers now live do not include a CSP. | **Not live.** Include the generated `dist/security-headers.conf` in nginx to switch it on. |
| New | `SECURITY_HEADERS_BY_PROXY=true` setting: the app sends no headers when nginx does, so no hand edits to code on the server. | In code; set in the server `.env`. |

## 4. Forms, consent, plans and legal wording

| # | What | Status |
|---|---|---|
| D1 | "Step X of 12" counter now matches the list. | In code |
| D2 | Consent: unticked and required; says up to 10 matched providers get a summary and up to 3 see contact details; same numbers in the notices and policies. | In code |
| D3 | Marketing opt-in is separate, unticked and optional. | Confirmed |
| E1 | Plan names are Listed, Connect, Connect Plus everywhere. | In code. **Needs a person** to rename any "Growth" product in Stripe. |
| E2 | Free trial removed from the provider agreement (checkout creates no trial). | In code |
| E3 | Access and correction section (privacy policy 2.12). | In code |
| E4 | "Last updated" dates on the collection notice, statement of rights, About and Contact. | In code |
| - | **GST on Stripe checkout** (was charging $249 with no tax line while pages promise $249 + GST = $273.90). Fix and a setup script added. | In code. **Needs a person**: run the script with the Stripe key, set the rate id in the server `.env`, add the ABN in Stripe, test one checkout. |

## 5. Accessibility

| # | What | Status |
|---|---|---|
| F1 | Heading order fixed. | In code |
| F2 | 29 empty-alt images on Home checked: all decorative, correct as they are. | Confirmed |
| F3 | WCAG 2.2 AA test with automated scan, keyboard pass and reflow test; admin and 404 fixes (unnamed charts, 37 unlabeled selects, contrast, headings). Report: `apps/web/ACCESSIBILITY_TEST_2026-10-16.md`. | In code. **Needs a person** with a screen reader (NVDA, VoiceOver) to run the script in the report. |
| G1 | `robots.txt` does not block public provider profiles. | Confirmed |

## 6. Checks that were missing from the audit

- **Lead unlock rules** have an automated test (`npm run test:lead-unlock -w apps/api`, now 25 checks, all passing): contact details hidden until unlock, only 3 providers can unlock, free-plan providers are told to choose a plan.
- **Guides and blog accuracy:** 124 outside links checked (0 broken), six time-sensitive claims checked against the official pages, one overstated sentence fixed (`deploy/GUIDE_FACT_CHECK_2026-10-16.md`). **Needs a person** who works in the sector to read the guides, and to check pricing.
- **Emails:** not tested (no mail server locally). Send one of each template from staging.

## 7. Added after the audit (17 to 19 October 2026)

| What | Status |
|---|---|
| **n8n suburb-page rewrite pipeline.** A key-protected API gives n8n the facts for each of 29,694 pages, scores a rewrite out of 100 with a fixed checker (invented numbers, banned claims, contact details and markup are hard failures; pass mark 80), stores approved copy, and publishes it to the page, the crawler HTML and the sitemap. Brief for the colleague: `deploy/N8N_SUBURB_REWRITE_PROMPT.md`. | In code. The live API answered "switched off" when last checked: **needs a person** to set `AUTOMATION_API_KEY` in the server `.env` and restart. |
| **WordPress mirror.** One command copies the site into WordPress: 192 authored pages and articles, 29,694 service and register pages (drafts until their copy is approved), 26,505 register listings, and member providers. A second command audits it post by post. Private data (participants, enquiries, workers' profiles, accounts, payments) is deliberately not copied. | In code. The first live run created the posts but WordPress dropped their data; **fixed in the plugin, which must be copied to the WordPress server, then `npm run sync:all-wp -w apps/api -- --resync` run** (it carries on after a dropped connection). |
| **Provider requests screen.** List with Matches, Unlocked, All nearby and Missed tabs; the selected request shows what was asked, the suburb on a map, places left (up to 3 providers), and a history. | In code |
| **Admin request view.** Every provider that touched an enquiry, by name: how it reached them, when they opened and unlocked it, any problem they reported, places taken, and the full history. New Filled filter. | In code |
| **Participant request view.** "2 of 3 providers have your contact details", and what happened, in order, with provider names. | In code |

## 8. Still open (needs a person)

1. Deploy `main` and set the new server settings: `AUTOMATION_API_KEY`, `SECURITY_HEADERS_BY_PROXY=true`, Stripe GST rate id.
2. Copy the updated WordPress plugin to the WordPress server and run the full resync until `audit:wp-sync` says "in step".
3. Turn on the Content-Security-Policy (Report-Only first) in nginx.
4. Submit the sitemap in Search Console, one file at a time.
5. Screen reader test; sector review of the guides; send-test of each email.
6. Monthly register routine and the removal mailbox.
7. Stripe: rename any "Growth" product; add the ABN for tax invoices.
8. **H1, at the end of the build:** remove every developer login (admin, server, Stripe, Mapbox, database, repository); rotate `JWT_SECRET`, database, Stripe, Mapbox, email, Twilio and WordPress credentials; delete local copies of production data; move ownership of the domain, hosting, Stripe, Mapbox, GitHub and Search Console to company accounts.
