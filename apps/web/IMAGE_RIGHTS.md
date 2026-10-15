# Images, logos and third-party content: where everything comes from

This is the record of the rights position for everything visual on SolDirectory, and the rules for adding to it.
`npm run images:audit-rights -w apps/web` enforces the image rules below and fails if an image has no recorded source.

## Photographs

| What | Source | Where it is recorded |
|---|---|---|
| Banner photos (`public/images/banners/*.jpg`, 94) | Unsplash, used under the [Unsplash licence](https://unsplash.com/license) | `public/images/banners/credits.json` (photographer, photo page, description). Shown on `/photo-credits`. |
| Blog covers and thumbnails (`public/images/blog`, `blog-thumbs`) | Cropped from a credited banner | `packages/topic-content/blogCovers.js` (`photo` per article). Built by `npm run images:blog-covers -w apps/web`. One photo per article. |
| Support cards (`public/images/supports/*.jpg`) | Crops of credited banners: personal-care, housing, transport, therapy-2, older-people-2, support-coordination, plan-management-2, housing-2 | `SUPPORT_SOURCES` in `scripts/audit-image-rights.mjs` |
| Default share image (`public/images/share-default.jpg`, 1200x630) | Crop of `banners/housing-2.jpg` | `SHARE_SOURCE` in `scripts/audit-image-rights.mjs` |
| SolDirectory logos | Own artwork | n/a |

There are no other photographs. Earlier versions of the site shipped seven stock photos with no recorded source
(a Freepik-style filename among them). They were removed on 15 October 2026 and every reference now points at a
credited banner.

### Rules for photos

1. **A photo needs a credit before it is used.** Add it to `credits.json` (provider, photoId, photographer, photographerUrl,
   pageUrl, alt). A photo with no entry fails the audit.
2. **No identifiable person next to a diagnosis, a language or a cultural group.** The Unsplash licence is not a model
   release: a photo of a real person on a page about Down syndrome, dementia, mental health, a language or a veterans'
   program suggests that person has it, is it, or speaks it. `PEOPLE_FREE` in `src/data/bannerImages.ts` gives those pages
   hands, objects and places instead.
3. **No visible third-party business name, uniform or mark; no foreign forms; no religious text.** The photos kept out of
   use are listed in `NOT_FOR_USE` in the audit script (café signage, a US IRS Form 1040, a Bible, a care organisation's cap).
4. **Alt text describes what is in the picture, or is empty.** A stock photo is never described as a real SolDirectory
   provider, worker or participant. Decorative heroes use an empty alt.

## Logos of other businesses

- Register listings link to a logo published on the business's **own website** (`services/logoDiscovery.ts`). The image
  is never downloaded, stored or re-hosted; the visitor's browser loads it from that site, without a referrer
  (`Avatar.tsx`, `referrerPolicy="no-referrer"`). If the business removes it, the page falls back to initials.
- A claimed provider's own uploaded logo always takes priority.
- A business can ask for its logo or listing to be corrected or removed at any time: the form on the listing, or
  "Report a concern" in the footer (`/terms#corrections-removals-and-copyright-concerns`).

## Text and data

- **Articles and guides are original writing** that cites official sources. They are not copied from the NDIA,
  My Aged Care or the NDIS Commission (the NDIA licenses its site CC BY-NC, which does not suit commercial reuse).
  A check of 54 articles against the pages they cite found only short shared factual strings (dates, official category names).
- **The official-source monitor keeps facts only** (title, date, headings, a fingerprint), never article text
  (`services/officialSources.ts`). It obeys robots.txt and identifies itself.
- **Register listings are facts** (name, ABN, areas, supports, website). No competitor prose, ratings, reviews, photos
  or logos are imported. Public copy never says a listing is "unclaimed".
- **Maps** use Mapbox with its attribution control on. **No third-party trackers or web fonts** are loaded.

## Still needs a person

- **Legal review.** Have a lawyer review the legal and policy pages (`packages/topic-content/legalPack.js`) and check
  the statements listed in `apps/web/LEGAL_CLAIMS.md` against how the service is run.
- **Contact and entity details.** Set `VITE_CONTACT_EMAIL`, `VITE_LEGAL_ENTITY` (and phone/address if wanted) in
  `apps/web/.env` before building. Until they are set the footer and legal pages show no contact route, so a rights
  holder has only the listing form.
- **Register data currency.** The listings were imported from a scrape; re-import from the official registers
  (`apps/api/REGISTER_IMPORT.md`) so the stated source and the data match.
