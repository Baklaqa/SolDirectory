# Gap audit status: 16 October 2026

Source: "SolDirectory Compliance and Website Gap Audit" (Saf, Talha, Zain). Code changes are on main; the "You do" column is what only the server or the business can do.

| # | Item | Status | You do |
|---|---|---|---|
| A1 | Phase indexing | **Done. Now on phase 4 (19 October 2026, your decision): every eligible suburb page is indexed and in the sitemap, and so are the individual register profile pages.** Phase 4 is 22,093 suburb pages (5,927 register, 16,166 service x suburb) plus 26,397 register profile pages, plus state, hub and authored pages: about 48,800 URLs in the sitemap. The audit advised against indexing thin, templated pages and profile pages that copy the public register; if Search Console shows "crawled, not indexed" in bulk, set `INDEX_PHASE` back to 3 and `INDEX_REGISTER_PROFILES` to `false` in `packages/topic-content/indexingPolicy.js` and deploy. Service pages with fewer than 5 listings (about 7,600) stay noindex: they are below the page minimum. Earlier note: **Phase 3** (decided 16 October 2026, after local content and ABS Census facts went on every page). Phase 1 was the capital cities and regional centres (507 pages), phase 2 added suburbs with 25+ listings (3,337 pages), and **phase 3 adds every other eligible suburb that has ABS Census figures: 20,611 pages** (5,200 register suburb pages and 15,411 service x suburb pages), down from about 58,000. The 1,482 eligible pages whose suburb has no Census match stay `noindex, follow` and out of the sitemap. Individual register profile pages stay noindex. `npm run audit:indexing -w apps/api -- --sitemap <url>` prints the numbers and confirms the sitemap matches; checked on real data, with 250 sampled pages all carrying the right robots tag. | Deploy, then submit the sitemap when you are ready (you have not submitted yet, so nothing is indexed). To step back, set `INDEX_PHASE` to 2 or 1 in `packages/topic-content/indexingPolicy.js` and deploy. Consider submitting the sitemap parts one at a time (`sitemap-register-*.xml`, `sitemap-services-*.xml`) and watching Coverage between them. |
| A2 | Templated service x suburb pages | **Done: real local content on every page, service guidance kept (nothing trimmed).** Each service x suburb page now has: where the suburb ranks in its state; the six closest suburbs with listings (real distances); a "Who lists the service here" analysis (register split, how widely listings reach, what else they list, how many list only this service, the most local listings by name, websites); languages listings say they support; five questions with answers built from that suburb's data, marked up as FAQPage (an editor's own WordPress questions still win where they exist); and, for a suburb that is not indexed, a pointer to the nearest larger centre. Measured on 100 phase 2 pages: identical prose sentences fell from 98% to 82%, and words that appear on no other page rose from 11% to 32%. `npm run audit:service-pages -w apps/api` repeats the measurement. | The remaining repeated text is the service guidance you chose to keep. If Search Console later shows these pages as "crawled, not indexed", trimming it is the next lever. |
| A2b | Register state and suburb pages (more unique content) | **Done.** Register suburb and state pages (`/ndis-providers/vic/preston`, `/aged-care-providers/qld`) now have a "Who is listed in ..." analysis (rank, closest suburbs with distances, how widely listings reach, supports listed most often, how many record only one support, the most local listings by name, websites, languages) and up to five more questions built from the area's data, in the page, the crawler HTML and FAQPage markup. Service pages also gained where the service sits among the supports in the suburb and how the suburb compares with its closest neighbours. Measured on 80 register suburb pages: identical prose sentences 85% to 75%, words on no other page 26% to 37%. Run `npm run audit:service-pages -w apps/api -- --pages register`. | Nothing. |
| A2c | ABS Census facts on suburb pages | **Done.** Every service x suburb page and register suburb page whose suburb matches an ABS Census area (95% of our suburbs: 6,910 of 7,271) has a paragraph and a question with population, median age, share aged 65 or over, share who reported needing help with a core activity, and median household income, each compared with the state, plus the required ABS credit (CC BY 4.0). State pages show the state's figures against Australia. Suburbs under 300 residents show nothing (ABS noise). The figures are in `apps/api/data/census-2021-suburbs.json`, built once by `apps/api/src/scripts/buildCensusData.ts` from the ABS pack `2021_GCP_SAL_for_AUS_short-header.zip` (downloaded 16 October 2026, about 102 MB). Data-sources page section 12.7 carries the attribution. | The file only changes at the next Census. If new suburbs appear that do not match, rerun the script with `--match` and check the list. |
| A3 | Thin register profile pages | **Done in code.** All individual register profile pages are `noindex` and out of the sitemap (`INDEX_REGISTER_PROFILES = false`). Member profiles and service pages carry the SEO. | Nothing. |
| B1 | "Data as at" date | **Done.** Hubs, state and suburb pages and every provider page show "Register data last imported on …". The date now moves on every import (`lastSeenAt`); before, it was set only when a listing was first created. | Nothing. |
| B2 | Report or remove link | **Done.** Every register page (page and crawler HTML) has the link, a 5 business day reply time (same as data sources 12.5) and a line for individuals and sole traders. `npm run register:remove -w apps/api -- --slug x --reason request` removes a listing and keeps it off future imports. | Someone must watch the mailbox and run the command. |
| B3 | Refresh schedule and banned providers | **Done in code, needs your routine.** The pages and data-sources 12.3 say the register is re-imported monthly. `importRegisterListings.ts --prune` removes unclaimed listings that have left the register. `npm run register:actions -w apps/api -- file.csv [--apply]` removes providers named in the NDIS Commission compliance actions list (ABN match is certain, name-only matches are listed for review). A daily job emails the admin when an import is over 35 days old. | **Monthly:** download the register export and the Commission's compliance actions list, run the import with `--prune`, then run `register:actions`. Add the cron line below. |
| C1 | CSP and Permissions-Policy | **Done in code, needs nginx.** `apps/web/scripts/security-headers.mjs` writes `dist/security-headers.conf` on every build. The CSP starts as Report-Only. Tested enforcing on Home and About with no violations. | Edit the live nginx file (steps below), then check the console on the main pages and switch to enforcing. |
| C2 | Server header | **Done in repo file.** `server_tokens off;` | Add to the live nginx file. |
| C3 | HSTS 1 year | Server setting. | Change the existing HSTS `max-age` to `31536000` in the live nginx file. |
| D1 | "Step 1 of 11", 12 listed | **Fixed.** The counter now includes "Review and send", so it matches the list. | Nothing. |
| D2 | Consent wording | **Done.** The checkbox is unticked by default and required, and says up to 10 matched providers get a summary and up to 3 of them see contact details. Same numbers in the collection notice and listing and ranking policy. | Nothing. |
| D3 | Marketing opt-in | **Confirmed.** A separate, unticked, optional checkbox. | Nothing. |
| E1 | Plan name | **Done.** Listed, Connect, Connect Plus everywhere in code. | Rename any "Growth" product in the Stripe dashboard. |
| E2 | Free trial | **Done.** Removed from the provider agreement (Checkout creates no trial). | Tell us if you want a trial built instead. |
| E3 | Access and correction section | **Done.** Privacy policy 2.12. | Nothing. |
| E4 | Last updated dates | **Done.** Collection notice, statement of rights, About, Contact. | Nothing. |
| F1 | Heading order | **Done.** | Nothing. |
| F2 | 29 empty-alt images on Home | **Checked: all decorative.** 8 are photos inside support cards whose link text already names the support; 21 are state photos in the carousel, whose slide label and state tag carry the meaning. Empty alt is correct. | Nothing. |
| F3 | WCAG test evidence | **Done in part.** Automated scan, keyboard pass and reflow test, fixes, and a written report: `apps/web/ACCESSIBILITY_TEST_2026-10-16.md`. A screen reader pass (NVDA, VoiceOver) is **not** done. | Someone with a screen reader runs the script in the report. |
| G1 | robots.txt blocks /providers/ | **Confirmed fine.** Public member profiles are at `/directory/<slug>`. `/providers/<slug>` is the login-only profile view. `/providers` (no slash, the for-providers page) is not blocked. | Nothing. |
| H1 | Developer access | **Process, not code.** Checklist below. | Do it when the build ends. |
| I1 | n8n content automation (17 October 2026) | **Built and tested locally; needs deploy and a key.** A key-protected API (`/api/automation/*`) gives n8n the facts for any of the 29,694 pages (service x suburb, register state and suburb), scores a rewrite out of 100 with a deterministic checker (hard failures: invented numbers, banned claims, contact details, markup; default minimum 80), stores approved copy, and mirrors pages to WordPress. Approved copy shows on the page, in the crawler HTML and in FAQPage markup, and makes the page indexable and listed in the sitemap (still needing the minimum listings). The brief for your colleague is `deploy/N8N_SUBURB_REWRITE_PROMPT.md`. Tested on real local data with a mock WordPress; the PHP plugin addition and the live WordPress sync are **untested against real WordPress**. | Steps in "Content automation" below. |

## Live nginx (C1 to C3)

The live file is `/etc/nginx/sites-available/soldirectory` and drifts from `deploy/nginx-soldirectory.conf`. Make the same changes by hand:

1. Inside the `server` blocks (the 443 block certbot made, and port 80 if it serves pages): add `server_tokens off;`.
2. Add `include /var/www/soldirectory/apps/web/dist/security-headers.conf;` in the server block, and again inside every `location` that has its own `add_header` (nginx does not inherit `add_header` into a location that sets one). In the repo file that is the private routes, `@private_spa`, `@spa`, `/assets/` and `/images/`.
3. Find the current HSTS line and change `max-age=15552000` to `max-age=31536000`: `grep -Rn "Strict-Transport-Security" /etc/nginx /etc/letsencrypt/options-ssl-nginx.conf`. Do not add `includeSubDomains` unless every subdomain of solbusinessconsultant.com.au is HTTPS.
4. `sudo nginx -t && sudo systemctl reload nginx`.
5. Check: `curl -sI https://directory.solbusinessconsultant.com.au/ | grep -i "server:\|strict-transport\|content-security\|permissions-policy"`.
6. Browse Home, a register page with a map, Get matched and the provider dashboard with the console open. If nothing reports a violation for a week, rebuild with `CSP_ENFORCE=true npm run build -w apps/web` to enforce.

The generated file also sets `Permissions-Policy`. If the live file already sets one, remove the old line to avoid two.

## Cron (root crontab)

```
30 7 * * * cd /var/www/soldirectory/apps/api && npm run job:register-freshness >> /var/log/register-freshness.log 2>&1
```

## Monthly register routine

1. Download the NDIS Commission and My Aged Care exports and convert to the importer's JSONL.
2. `npx tsx src/scripts/importRegisterListings.ts providers.jsonl --dry-run`, check, then run again with `--prune`.
3. Save the Commission's compliance actions (banning orders, revoked or suspended registrations) as CSV with `abn` and `name` columns. `npm run register:actions -w apps/api -- actions.csv`, read the report, then add `--apply`.
   The Commission does not publish a download. Its compliance actions are a search (Part 2 of the NDIS Provider Register, hundreds of pages, updated often) at `ndiscommission.gov.au/about-us/compliance-and-enforcement/compliance-actions`, so this step is manual: filter to the current year and to type and status you care about, copy the providers' names and ABNs into the CSV, and run the tool. A provider whose registration is revoked leaves Part 1 of the register, so the monthly import with `--prune` removes it without this step; the compliance CSV matters for providers that stay registered but have an action against them. Banning orders are mostly against individual workers, not provider listings.
4. Claimed listings are never deleted by these scripts. Each one reported is checked by hand.

## H1: end of build checklist

- Remove every developer login from the admin, the VPS, Stripe, Mapbox, the database and the repository. Use company-owned accounts only.
- Rotate: `JWT_SECRET`, database credentials, Stripe keys and webhook secret, Mapbox token, email provider key, Twilio keys, `ADMIN_*` secrets, any WordPress application passwords.
- Delete local copies of production data on developer machines, and any exports or backups outside the company's storage.
- Move ownership of the domain, hosting, Stripe, Mapbox, GitHub organisation and Search Console to company email addresses.
- Use staging with dummy data only while the build continues.

## "What was not checked" in the audit: now checked (16 October 2026)

| Area | Result |
|---|---|
| Enquiry form beyond step 1 (D2, D3) | **Walked through on a local build to the consent step.** Both checkboxes are unticked; the first is required (the form refuses to continue, and the API returns 400 and stores nothing without it); the second is separate and optional. The counter reads "Step 7 of 12" and matches the 12-item list. The consent says up to 10 matched providers get a summary and up to 3 see contact details. Nothing was submitted. |
| Logged-in areas | **Scanned with axe-core on a throwaway local database** (demo accounts from `npm run db:seed:admin`, then dropped). Provider (dashboard, leads, listing, onboarding, plans, security), participant and worker dashboards: no violations. Admin: found and fixed unnamed charts (10), unlabeled selects (37), low-contrast links and status pills, and two skipped heading levels; the 404 page had no `<main>`. Admin pages re-scanned clean. |
| Lead unlock flow | **New automated test, `npm run test:lead-unlock -w apps/api`** (12 checks, all pass): contact details hidden until unlock; Idempotency-Key required; three providers can unlock; the fourth gets LEAD_FULL and uses no quota; repeat unlocks are free; a free-plan provider is told to choose a plan. |
| Stripe checkout and GST | **Found a gap and added a fix.** Checkout charged the plain plan price ($249) with no tax line, but the pages and the provider agreement say "$249 + GST = $273.90" and promise a tax invoice showing the GST. Checkout now adds a GST tax rate when `STRIPE_GST_TAX_RATE_ID` is set; `npm run stripe:gst-rate -w apps/api` creates the rate in Stripe; Admin > Operations shows "GST on invoices: Missing" until it is set. I did not call Stripe. **You do:** run the script with your Stripe key, put the id in the server `.env`, and add the ABN under Stripe's business settings so invoices are valid tax invoices. Test one checkout in Stripe test mode first. |
| Emails | Not tested (no mail server is configured locally). Send one of each template to yourself from a staging server. |
| Guides and blogs accuracy | See `deploy/GUIDE_FACT_CHECK_2026-10-16.md`: 124 outside links (0 broken), six time-sensitive claims checked against official pages, one overstated sentence fixed. |

## Content automation (I1): turn it on

1. Deploy as usual. In `apps/api/.env` on the server set `AUTOMATION_API_KEY` to a long random value (`openssl rand -hex 32`) and, if you want a different bar, `AUTOMATION_MIN_SCORE` (default 80). Restart the API. Until the key is set every automation call returns 503.
2. Copy the plugin folder `apps/cms/wp-content/plugins/soldirectory-content` to the WordPress server (it adds `includes/page-automation.php`: the `register_area_page` post type and REST-writable `sd_*` meta). Without it WordPress drops the meta silently.
3. Create the WordPress application password if you have not (Users > Profile > Application Passwords) and set `WORDPRESS_URL`, `WORDPRESS_APP_USER`, `WORDPRESS_APP_PASSWORD`.
4. Create a draft post for every page once: `npm run sync:pages-wp -w apps/api -- --dry-run`, then `npm run sync:pages-wp -w apps/api -- --baseline` (about 29,700 posts, in batches of 100; safe to stop and re-run; `--max 2000` stops early).
5. Give your colleague the base URL, the key (by a password manager, not chat) and `deploy/N8N_SUBURB_REWRITE_PROMPT.md`.
6. After each monthly register import run `POST /api/automation/stale-check`, so copy that quotes an old count stops showing.

Nothing on the site changes until a rewrite is approved, so deploying this is safe on its own.

## WordPress sync (19 October 2026)

`npm run sync:all-wp -w apps/api` brings WordPress level with the site in four steps (run it with `-- --dry-run` first; `-- --only articles|pages|listings|providers` for one step; `-- --max 2000` to do a batch and run again):

1. **articles**: the 192 authored pages and articles (guides, funding, condition and language topics, legal pages, glossary, blog, location pages) as `site_article` posts, with the same HTML the crawler sees. Re-running only rewrites a post whose page changed.
2. **pages**: a post for each of the 29,694 service x suburb and register state or suburb pages (`service_area_page`, `register_area_page`), a draft until its copy is approved.
3. **listings**: the 26,505 register listings as `register_listing` posts.
4. **providers**: the SolDirectory member `provider` posts.

`npm run audit:wp-sync -w apps/api` then compares each post type with the site and says what is missing. About 56,000 posts will take hours against a live WordPress: run it under `screen` or `nohup` on the server and re-run until the audit says "in step".

**Known fault, fixed 19 October 2026 (needs the plugin redeployed):** the plugin's post types do not declare `custom-fields` support, and without it WordPress silently drops the `meta` the API sends over REST. The first live run created the posts but not their keys, facts or scores (the post-by-post audit showed every post as keyless). This also affects the older register listing and provider mirrors. `includes/page-automation.php` now saves and returns the registered meta itself. After copying the plugin folder to the WordPress server, run `npm run sync:all-wp -w apps/api -- --resync` (push everything again; same hours as the first run), then `npm run audit:wp-sync -w apps/api`. The audit's top table compares counts only; the post-by-post part is the real check.

**Interrupted runs carry on.** Each post records when it was pushed, and a `--resync` run is remembered in the database until every step has finished. If the connection drops, run the same command again: it says "Continuing the full resync that began ..." and skips what is done. `--restart` is the only way to start over. For a long run use `nohup npm run sync:all-wp -w apps/api -- --resync > /var/log/wp-sync.log 2>&1 &` and watch `tail -f /var/log/wp-sync.log` (it prints rate and minutes left).

Deliberately **not** copied: participants and their enquiries, independent workers' profiles, accounts, payments and anything private. The site (code, and Mongo for listings and pages) stays the source of truth; WordPress is a read-only mirror, so edits made in wp-admin to these posts are overwritten.

## Provider documents: security and policy reading (19 October 2026)

**Upload.** The incident and complaints policy is uploaded through the API (`POST /api/onboarding/documents`), as a PDF or Word `.docx` up to 10 MB (old `.doc` files are not accepted). It is stored in `apps/api/uploads/` (or S3 if all four `S3_*` settings are given), never served as a web page, and opened only by an administrator. nginx must allow 12 MB on `/api/` (`client_max_body_size 12m;`). Back up `apps/api/uploads/` with the database.

**Security, before anything is stored** (`services/documentSecurity.ts`; a file that fails is never written anywhere):
- Built-in checks, always on: a PDF with JavaScript, launch actions, embedded files or forms scripts; a Word file with macros, embedded objects or programs, an external template, a macro content type, or a zip bomb; a program renamed as a document; the EICAR test file. These are refused with a plain message telling the provider to save a plain PDF or .docx.
- Antivirus, optional but recommended: **ClamAV**. The built-in checks are not an antivirus and cannot recognise known malware. Admin > Operations shows "Virus scanner for uploads: ClamAV connected" once it is running. Install on the server:

```bash
sudo apt update && sudo apt install -y clamav-daemon
sudo systemctl stop clamav-freshclam && sudo freshclam && sudo systemctl start clamav-freshclam
sudo systemctl enable --now clamav-daemon
ls -l /var/run/clamav/clamd.ctl        # the socket the API finds by itself
```

  ClamAV needs about 1 GB of free memory. To prove it works, upload the standard EICAR test file renamed `test.pdf`: it must be refused. Set `CLAMAV_REQUIRED=true` in `apps/api/.env` to refuse every upload while ClamAV is not answering (the default carries on with the built-in checks). Every record notes which engine scanned the file.

**Reading the policy** (`services/policyReview.ts`). The text is read out of the PDF or Word file and compared with the points the NDIS Commission expects, taken from the Complaints Management and Resolution Rules (Part 2), the Commission's Effective Complaints Handling Guidelines and its reportable incidents guidance (24 hours for a death, serious injury, abuse or neglect, unlawful sexual or physical contact or sexual misconduct; 5 business days for unauthorised use of a restrictive practice). 12 points are "needed", 8 are "good to add". The provider sees what is missing and what to add straight after the upload; the same result goes into the onboarding checks, so a registered provider with gaps is emailed the list with a link back to the policy step, and a corrected policy brings the "all confirmed" email. It is a guide, not a legal review: a point in unusual wording can be reported missing, so a policy with gaps is "in review" for your team (Approve button on the admin provider page), never a failure. A scanned (image-only) file is reported as unreadable with advice. Re-check the point list against the Commission's current guidance each year.

## When no member provider matches a request (19 October 2026)

The person gets the thank-you email, then a second email, "Your request is still open: what happens next", that explains in plain words what that means (nobody who has joined SolDirectory near them has said they have space; many providers are on the register but have not joined), what has really happened (it names how many nearby businesses were told, or says only that the request stays open when none were), and what to do now (a link to the register page for their suburb, how to close the request, a real contact address). It never says more than happened.

Businesses on the public register that have not joined are emailed when a request comes in near them: within `REGISTER_NOTICE_RADIUS_KM` (default 20 km) of the request, on the register that fits the funding type (NDIS, or aged care), with no personal details. The email says how near, invites them to **create a free provider account** (`/signup?role=provider`) or claim their listing, and says up to 3 providers can respond to a request. The form no longer asks for the support, so the service is often unknown; those notices now go out anyway (before, nothing was sent unless the visitor came from a service page). **This is off until `REGISTER_LEAD_EMAILS=1` is set in `apps/api/.env`.** Limits: 10 businesses per request, each at most once every 3 days and 4 times a month, only businesses whose published email was verified, never those who opted out. Test it with `npm run test:lead-notices -w apps/api` (needs a throwaway database and a mail sink; see the script header).
