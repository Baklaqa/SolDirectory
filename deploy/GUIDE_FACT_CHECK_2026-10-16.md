# Guide fact check: 16 October 2026

The gap audit said the guides and blog posts were not reviewed and "a person should check them against current NDIS Pricing
Arrangements and Practice Standards". This is the part that could be checked by opening the official pages. It is not a
replacement for a person who works in the sector reading the guides.

## Outside links

`npm run check:links -w apps/web` opens every outside link in the shared content (guides, blog posts, funding pages, glossary, language
resources) and reports the ones that fail.

Result on 16 October 2026: 124 links. 83 open, **0 broken**, 41 return 403 to a script. All 41 are `ndis.gov.au` (and a few state or
university sites), which block automated requests. The ones I opened in a browser (below) were fine. Open the rest by hand if you want
certainty.

## Time-sensitive claims checked against the official page

| Claim in our content | Official source (opened in a browser, 16 October 2026) | Result |
|---|---|---|
| Plan budgets for two support categories change as plans are created or reassessed from 1 October 2026, or renewed from 1 February 2027 (Social, Economic and Community Participation, and Improved Daily Living Skills) | NDIS news, "Changes to support budgets from 1 October" (5 October 2026) | Matches |
| High support needs variation pathway: combined budget of at least $215,030 across Assistance with Daily Life, Home and Living, and Assistance with Social, Economic and Community Participation, plus 24-hour funded supports | NDIS, "What is an NDIS plan" and the same news item | Matches |
| From 15 October 2026 claims submitted more than 90 days after a support is delivered get extra checks, and may be held for up to 28 days | NDIS news, "Increasing integrity checks on older claims" (5 October 2026) | Matches |
| From 1 October 2026 approved personal care within a Support at Home budget needs no contribution | My Aged Care, "Support at Home funding changes from 1 October 2026" (updated 15 September 2026) | Matches |
| From 1 July 2026 registration is required to provide supported independent living or NDIS digital platform services | NDIS Commission, "Apply for registration" | Matches |
| From 12 October 2026 the Commission runs two provider portals; new applications start in the new portal, existing ones finish in the old one | NDIS Commission, "Apply for registration" and "Which portal do I use?" | Matches |
| "Draft applications left in the existing portal are removed on 12 October 2026" | "Which portal do I use?" says only that some drafts have been removed from the existing portal | **Overstated. Fixed:** the article now says the Commission reports that some drafts were removed and points to its guidance |

## Still needs a person

- **Pricing.** The guides do not quote price limits, only that the NDIS Pricing Arrangements are usually republished each 1 July. Anyone adding a price must check it against the current Pricing Arrangements and Price Guide.
- **Practice Standards and Code of Conduct summaries.** I did not compare them line by line with the current Standards.
- **Aged care.** The Support at Home and new Aged Care Act dates were checked only for the 1 October 2026 personal care change. The 1 November 2025 start dates and the Statement of Rights are as supplied in earlier reviews.
- **Independent contractor or employee article.** The "whole-of-relationship test since 26 August 2024" statement was not checked against Fair Work or the ATO. It should be read by someone who knows the area.
- **Anything dated after this check.** The news posts say "checked on" a date for a reason: the NDIA and the Commission change pages without notice. Re-run `npm run check:links` monthly and recheck dated posts when they are updated.
