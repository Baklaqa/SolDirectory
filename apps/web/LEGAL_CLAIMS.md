# Legal pack and build blueprint: what the code does, and what still needs a decision

Sources: "SolDirectory Legal and Policy Pages" and "SolDirectory Build Blueprint" (15 October 2026). The legal text lives in
`packages/topic-content/legalPack.js`. The "Draft - pending legal review" banner, the reviewer "written to meet" line and the
noindex on the legal pages have been removed; the pages are live and indexable.

## Done in code
- 12 legal pages, About and Contact pages, footer (operator statement, links), contact details (`siteConfig.ts`, `config/business.ts`).
- Get matched: collection notice before the contact step, three unticked consents (the "someone else" one only when it applies),
  consent record with wording version, time and IP; "support needed" and "preferences" steps; free-text hint; confirmation text.
- Briefs only to providers; contact details on unlock; max 3 unlocks per request (the request disappears for others when full);
  every unlock and view logged with IP; closed requests can't be unlocked; providers told when a request is withdrawn.
- Tracker: close, delete my details, one-tap outcome (started / still looking / not needed), ask for a person, complaint link.
- Emails and SMS: business details in every email footer; request received, no match, outcome check, new request (spots left of 3),
  capacity check, payment failed, worker check expiring; SMS sender ID via `SMS_SENDER_ID`.
- Search order: members taking new people first, then alphabetical; paid plans never change order. Profiles stay live when the
  capacity check is unanswered. Ranking disclosure on results and plans pages. "Taking new people" and "Related business" labels.
- Plans renamed Listed / Connect (Connect Plus kept for existing Pro accounts, hidden from purchase); prices shown with and without GST.
- Register pages: attribution line, import date, link to data sources, "Report an error or request removal".
- Workers: "Checks sighted on [date]" (never "verified"), expired checks drop off, expiry reminder emails, public directory
  hidden per state until `MIN_PUBLIC_WORKERS` (20) profiles exist.
- Admin: reports and messages page (unlock credit-back, contact messages). Two-factor sign-in (authenticator app) for any account at
  `/security`; required for administrators when `ADMIN_REQUIRE_2FA=true`.
- Jobs: `request-deidentify` (3am), `outcome-check` (10:30am), `check-expiry` (9:30am). Add to the VPS crontab:
  `0 3 * * * cd /var/www/soldirectory && npm run job:request-deidentify -w apps/api`
  `30 10 * * * cd /var/www/soldirectory && npm run job:outcome-check -w apps/api`
  `30 9 * * * cd /var/www/soldirectory && npm run job:check-expiry -w apps/api`
- Roles: nothing added. Account types are admin, independent worker, provider and participant. New "Allied Health" (coordinator)
  sign-ups are closed; existing accounts still sign in.

## Not true yet, or only the owner can confirm: decide whether to build it or change the text
1. **Stored in Australia only / nothing sent overseas.** Address search uses Mapbox, SMS uses Twilio, payments use Stripe.
   The text uses cautious wording until `LEGAL_PRACTICES.australiaOnly` is set true (`legalPack.js`).
2. **Administrator two-factor "required".** Set `ADMIN_REQUIRE_2FA=true` on the server once the admins have enrolled, then set
   `LEGAL_PRACTICES.adminTwoFactor` true.
3. **Founding-member price ($149 for the first 100), annual option, failed-payment downgrade after 14 days:**
   need Stripe prices, coupons and a billing change. Not built, and the provider agreement still states the founding price and the
   downgrade as facts: build them or ask for the text to change. (The 7-day free trial was removed from the agreement on 2026-10-16:
   Checkout creates no trial, so the pricing page and the agreement now agree.)
4. **Distance ordering** only where a page already filters by area.
5. **"Business verified" / "Registered NDIS provider" labels:** no ABN-register (ABR) check exists, so nothing shows them.
6. **Editorial policy:** says every guide names an author and reviewer with a biography. Needs real people.
7. **Matching "up to 10 chosen by distance and rotated fairly"; admin "why was each provider notified" explanation:** the
   existing score-based matching and 30-minute escalation are unchanged.
8. **Admin role tiers** (super admin / operations / support), Australian-only staff access, penetration test, insurance,
   trademark, social profiles, Stripe account ownership: organisational, not code.
9. **Statements only the owner can confirm:** encryption at rest, staff training, backups, who has access.

## Deploy notes
- The legal pages are no longer noindex. In the live nginx file, remove `privacy|terms|provider-agreement|lead-disclaimer` (and any
  other legal paths you added) from the `X-Robots-Tag noindex` location, or the pages stay noindex at the server. Add `security` to
  that list (it is a login-only page).
- Old browser tabs with the previous form are refused until reloaded (consent is required).
- New environment variables (all optional): `ADMIN_REQUIRE_2FA`, `MIN_PUBLIC_WORKERS`, `SMS_SENDER_ID`, `REQUEST_DEIDENTIFY_AFTER_MONTHS`,
  `OUTCOME_CHECK_AFTER_DAYS`, `BUSINESS_*`.
- Plan names are Listed, Connect and Connect Plus everywhere in the code. Stripe Checkout builds the product name from the plan
  name (`SolDirectory Connect plan`), so new invoices say Connect. A product or price created earlier in the Stripe dashboard under
  the old name "Growth" keeps that name on existing subscriptions until it is renamed there.
- The web build (`apps/web/scripts/prerender.mjs`) now writes static HTML for the 12 legal and policy pages, /about and /contact.
  Before this, the API answered most of them with a 404 "Page not found" to any visitor that did not run JavaScript. After deploy,
  fetch `/about`, `/contact`, `/collection-notice` and `/statement-of-rights` and confirm each returns 200.

