# Accessibility test report: 16 October 2026

Target: WCAG 2.2 Level AA (the accessibility statement says "we aim to meet" it). This is what was run, what it found, what was
fixed, and what was **not** done.

## What was run

| Test | How | Done? |
|---|---|---|
| Automated scan (axe-core engine) | Lighthouse 12 accessibility category, headless Chrome, 16 public pages on the live site, then 6 pages on the fixed build | Yes |
| Keyboard-only pass | Real Tab, Shift+Tab, Enter and Escape in a browser: skip link, header, Get matched dialog (focus trap, Escape, focus return) | Yes, for the pages listed below |
| Reflow at 320 px wide | Checked for horizontal scroll on /, /privacy, /contact, /providers | Yes, no horizontal scroll |
| Screen reader pass (NVDA or VoiceOver) | **Not done.** It needs a person with a screen reader. Nothing in this report claims it. | No |
| Signed-in screens (provider, worker, admin dashboards) | Not scanned | No |

Automated tools find roughly a third of WCAG problems. A clean scan is not a claim of conformance.

## Scan results, before and after

Live site (before):

| Page | Score | Findings |
|---|---|---|
| Home | 97 | Skip link had no target; headings skipped a level; 8 state buttons whose accessible name did not contain their visible text |
| Find a provider | 94 | 81 low-contrast labels; skipped heading level; skip link target |
| NDIS / aged care area pages | 94 | 36 to 41 low-contrast labels; skipped heading level; skip link target |
| Service location page | 92 | 39 low-contrast labels; text link told apart by colour only; skip link target |
| Independent workers | 95 | Text link told apart by colour only; skip link target |
| Privacy policy | 95 | Breadcrumb link told apart by colour only; skip link target |
| Blog | 99 | Image link name did not contain its visible badge text; skip link target |
| Login | 100 | None |
| /about, /contact, /collection-notice, /statement-of-rights, /accessibility, /cookies and 5 more legal pages | not scannable | The server returned HTTP 404 "Page not found" to anything that did not run JavaScript (see below) |

Fixed build (after), 6 pages scanned: Home, For providers, About, Contact, Privacy policy all 100. Login scanned 100 earlier and
errored on the second run (a headless timing error, not a finding). Register area pages and the blog need live data, so the label
contrast fix on them is checked by calculation only: #5A6B84 on white is 5.4:1 (the old #697B91 was 4.3:1; 4.5:1 is the minimum).

## Fixed

1. Skip link now has a target on every page: the page's `<main>` gets `id="main-content"`.
2. Home, Service pages and the worker finder had no `<main>` landmark; they do now.
3. Heading order: Home step cards are h2; result lists on the directory, register, provider listing and worker pages have a hidden h2 before the h3 cards.
4. State buttons on the home page: accessible name is now "NSW, New South Wales" (contains the visible "NSW").
5. Text links inside paragraphs, the breadcrumb and the accordion answers are underlined (WCAG 1.4.1).
6. Card label contrast raised from 4.3:1 to 5.4:1.
7. Blog image link name includes its badge text.
8. Get matched dialog: Tab and Shift+Tab were escaping to the page behind it. Focus now stays inside (and inside the "leave?" prompt when that is showing), Escape closes it, and focus returns to the button that opened it. The provider detail dialog got the same trap and a name.
9. Pages that returned 404 to non-JavaScript visitors now ship real HTML (below).

## Found, and bigger than an accessibility fix

`/about`, `/contact`, `/collection-notice`, `/statement-of-rights`, `/accessibility`, `/cookies`, `/worker-terms`, `/complaints`,
`/listing-and-ranking-policy`, `/editorial-policy` and `/data-sources` answered HTTP 404 with a `noindex` page to search engines and any
visitor without JavaScript, although they are in the sitemap and show normally in a browser. `/privacy`, `/terms` and
`/provider-agreement` returned the empty app shell. The web build now writes static HTML for all of them (`prerender.mjs`).
This only takes effect after the web build is deployed. Confirm with `curl -I https://directory.solbusinessconsultant.com.au/about`.

## Still open

- Screen reader pass with NVDA (Windows) and VoiceOver (Mac and iOS): needs a person. Suggested script: skip link, header menu, Get matched
  form end to end (labels, error messages, the consent checkboxes), a register area page, the contact form, a legal page.
- Signed-in dashboards (provider, worker, participant, admin) were not scanned.
- Text over photographs (hero and banner images) was not measured for contrast; automated tools cannot do it reliably.
- 200% zoom and text-spacing overrides, and Windows High Contrast mode, were not tested.
- Prefers-reduced-motion is respected by the preloader; other animations (home page motion, carousel) were not checked.
- The accessibility statement still says "we aim to meet WCAG 2.2 AA", which is accurate. Do not change it to "meets" until the screen reader pass is done.

## Addendum: signed-in areas (16 October 2026, later)

Scanned with axe-core 4.10 (WCAG 2.0 to 2.2 A and AA plus best practice) in a real browser against a local build and a throwaway database
of demo accounts, which was dropped afterwards.

| Area | Pages | Before | After |
|---|---|---|---|
| Provider | dashboard, leads, my listing, onboarding, plans, security | none | none |
| Participant | dashboard | none | none |
| Worker | dashboard, my profile | none | none |
| Admin | dashboard, operations, reports, providers, users, plans, services, enquiries, content, diagnostics, claims, register | charts with no description (10), unlabeled selects (37), low-contrast links and status pills (4), skipped heading levels (3) | none |
| 404 page | any unknown address | no `<main>`, skip link with no target | fixed |

Admin charts now say what they show in text (for example "New registrations per day over 30 days: 118 in total"). Plan and status
selects in the member plans table are named after the member. The 404 page is a `<main>` with the target the skip link uses.

Still not done: a screen reader pass, other admin pages not listed above (workers, worker detail, conditions, worker reviews), and anything that appears only after
an action (modals other than Get matched, error states).
