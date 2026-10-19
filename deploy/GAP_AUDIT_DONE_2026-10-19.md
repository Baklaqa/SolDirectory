# SolDirectory: what has been implemented (gap audit and follow-up work, to 19 October 2026)

For the team. Source: the Compliance and Website Gap Audit (Saf, Talha, Zain). Detailed working notes: `deploy/GAP_AUDIT_STATUS.md`.

## 1. Search and indexing

- **Indexing plan (A1).** Pages are indexed in phases, and the site is now on the widest setting: every suburb page with enough listings is in the sitemap, and so are the individual register profile pages. About **48,800 URLs** in a sitemap of 7 files, live at `/sitemap.xml`. A page with too few listings, or with no recognised service, is kept out. The setting can be tightened again in one file (`packages/topic-content/indexingPolicy.js`).
- **Service x suburb pages are no longer templated (A2).** Each page has the suburb's rank in its state, the six closest suburbs with real distances, a "who lists this service here" analysis, the languages listings support, and five questions built from that suburb's own data, marked up for search. Measured on 100 pages: repeated sentences fell from 98% to 82%, and words that appear on no other page rose from 11% to 32%.
- **Register state and suburb pages (A2b)** got the same treatment (repeated sentences 85% to 75%; words on no other page 26% to 37%, 80 pages measured).
- **ABS 2021 Census facts (A2c)** on 95% of suburb pages: population, median age, share aged 65 or over, share needing help with core activities, and household income, each compared with the state, with the required CC BY 4.0 credit and a data-sources section.
- **Audit tools:** `npm run audit:indexing` confirms the sitemap matches the plan; `npm run audit:service-pages` measures how unique the pages are.

## 2. Register data and takedowns

- **"Register data last imported on ..." (B1)** on hubs, state, suburb and provider pages; the date moves on every import.
- **Report-or-remove link (B2)** on every register page, with a 5 business day reply time and a line for individuals and sole traders, and a command that removes a listing and keeps it off future imports.
- **Monthly refresh tooling (B3):** import with `--prune`, a tool that removes providers named in Commission compliance actions, and a daily alert when an import is more than 35 days old.

## 3. Security headers

- **HSTS (1 year), nosniff, X-Frame-Options, Referrer-Policy and Permissions-Policy** are live, sent once each by nginx (checked with `curl -I` on 19 October 2026). The Nginx version is hidden.
- A server setting, `SECURITY_HEADERS_BY_PROXY=true`, makes the app send none of these when nginx does, so servers never need code edits.

## 4. Forms, consent, plans and legal wording

- Enquiry form step counter matches the list of steps (D1).
- Consent is unticked and required, and states that up to 10 matched providers get a summary and up to 3 see contact details; the same numbers are in the collection notice and the listing and ranking policy (D2). Marketing opt-in is separate, unticked and optional (D3).
- Plan names are Listed, Connect and Connect Plus everywhere (E1). The free trial is removed from the provider agreement (E2). The privacy policy has an access and correction section (E3). Collection notice, statement of rights, About and Contact carry "last updated" dates (E4).

## 5. Accessibility

- Heading order fixed (F1). The 29 empty-alt images on Home were checked and are all decorative (F2).
- WCAG 2.2 AA test run with an automated scanner, a keyboard pass and a reflow test across public, provider, participant, worker and admin pages (F3). Fixes: unnamed charts, 37 unlabeled selects, low-contrast links and status pills, skipped heading levels, and the 404 page. Report: `apps/web/ACCESSIBILITY_TEST_2026-10-16.md`.
- robots.txt checked: public provider profiles are not blocked (G1).

## 6. Testing and accuracy checks

- **Lead unlock rules have an automated test** (`npm run test:lead-unlock -w apps/api`, 25 checks, all passing): contact details hidden until unlock, only 3 providers can unlock a request, the fourth is refused and uses no quota, repeat unlocks are free, free-plan providers are told to choose a plan, the admin sees providers by name, and participants see no provider contact details.
- **Guides and blog:** 124 outside links checked (0 broken); six time-sensitive claims checked against the official pages; one overstated sentence corrected (`deploy/GUIDE_FACT_CHECK_2026-10-16.md`).

## 7. Request screens for providers, admins and participants

- **Providers:** a Requests screen with Matches, Unlocked, All nearby and Missed tabs. The selected request shows what was asked, the suburb on a map, how many of the 3 places are left, and a history (request came in, first provider responded, request filled, you opened it, you unlocked it).
- **Admins:** each enquiry shows every provider that touched it, by name: how it reached them, when they opened and unlocked it, any problem they reported, places taken, the suburb on a map, and the full history. A Filled filter was added, and "Taken up" now counts every unlock.
- **Participants:** "2 of 3 providers have your contact details", the providers that unlocked (including ones that found the request by browsing nearby), and a history of what happened, in order. No provider contact details are shown.

## 8. Automation and WordPress

- **n8n suburb-page rewrite pipeline.** A key-protected API (`/api/automation/*`) gives n8n the facts for each of the 29,694 service and register pages, scores a rewrite out of 100 with a fixed checker (invented numbers, banned claims, contact details and markup are hard failures; pass mark 80), saves approved copy, and shows it on the page, in the crawler HTML and in the sitemap. Hand-over brief with prompts, rules and the workflow: `deploy/N8N_SUBURB_REWRITE_PROMPT.md`.
- **WordPress mirror.** One command (`npm run sync:all-wp -w apps/api`) copies the site into WordPress: the 192 authored pages and articles, a post for each of the 29,694 service and register pages, the 26,505 register listings, and member providers. `npm run audit:wp-sync` checks WordPress against the site post by post, and `npm run sync:wp-status` says whether a full resync is finished. Runs carry on after an interrupted connection. Participants, enquiries, workers' profiles, accounts and payments are deliberately not copied.
