# Legal pack: what the code now does, and what still needs a decision

Source: "SolDirectory Legal and Policy Pages" (15 October 2026). Text lives in `packages/topic-content/legalPack.js`.
The pages stay DRAFT (noindex, banner) until a lawyer has reviewed them: `LEGAL_REVIEWED` in `apps/web/src/pages/public/legalContent.ts`.

## Done in code
- All 12 pages, routes, footer links, contact details (`siteConfig.ts`), reserved routes, repo nginx noindex list.
- Collection notice shown before the contact step of Get matched, with unticked consent boxes; consent stored on the lead (`Lead.consent`); the API refuses a request without it.
- Provider emails carry the brief only; contact details need an unlock; at most 3 providers can unlock a request (409 `LEAD_FULL`); a closed request can't be unlocked.
- Request tracker: close request, delete my details (clears name/email/phone/notes, keeps consent record and view log).
- Search order: members taking new people first, then alphabetical. Paid plans no longer change order or visibility. Profiles stay live when the weekly check is unanswered. "Taking new people" and "Related business" labels on cards (`Provider.relatedBusiness`, set by an administrator).

## Not true yet (the pack says it, the product does not) — decide: build it, or change the text
1. **Stored in Australia only / nothing sent overseas.** Address search uses Mapbox, SMS uses Twilio, payments use Stripe. Wording falls back to a cautious version until `LEGAL_PRACTICES.australiaOnly` is set true.
2. **Two-factor sign-in for administrators.** Not built (`LEGAL_PRACTICES.adminTwoFactor`).
3. **Plans.** Product has Starter / Growth ($249, 15 unlocks) / Pro ($649, unlimited). Pack has Listed / Connect, a founding price ($149 for first 100), a 7-day trial and a 14-day failed-payment rule. Needs Stripe prices and a migration. Pro still lists "Priority placement": remove it in the plan config and on the plans pages.
4. **Public copy still says paid members are shown first**: `registerShell.controller.ts` (~1139, ~1762), `ProviderListingPage.tsx` (~330), `ServiceLocationPage.tsx` (~389), `servicePageFixtures.ts` (~30). Replace with the ranking policy wording.
5. **Distance ordering** ("ordered by distance from your suburb") only where a page already filters by area.
6. **Labels "Business verified" and "Registered NDIS provider"**: no ABN-register check exists; nothing shows these labels.
7. **Worker "Checks sighted on"** badge and evidence workflow: not built.
8. **Editorial policy**: says every guide names an author and a reviewer with a biography. Not true; needs real people, or edit the policy.
9. **"Ask for a person" review**, "Report an error" link on listings, 72-hour breach notice tooling, and automatic 12-month de-identification of closed requests: not built.
10. **Marketing opt-in** is stored but nothing is sent on the strength of it.
11. Statements only the owner can confirm: encryption at rest, staff training, who has access.

## Deploy notes
- Add the new paths to the live nginx noindex `location` (`collection-notice|cookies|worker-terms|complaints|statement-of-rights|listing-and-ranking-policy|editorial-policy|accessibility|data-sources`).
- Old browser tabs with the previous form will be refused until reloaded (consent is required).
