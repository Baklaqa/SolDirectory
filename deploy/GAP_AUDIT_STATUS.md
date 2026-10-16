# Gap audit status: 16 October 2026

Source: "SolDirectory Compliance and Website Gap Audit" (Saf, Talha, Zain). Code changes are on main; the "You do" column is what only the server or the business can do.

| # | Item | Status | You do |
|---|---|---|---|
| A1 | Phase indexing | **Done in code.** Suburb pages (register and service x suburb) are indexed only for the capital cities and regional centres in `STATE_CENTRES`; every other suburb page works but is `noindex` and out of the sitemap. Indexed footprint falls from about 58,000 pages to about 800. | After deploy, resubmit the sitemap in Search Console and watch Coverage. To widen: add suburbs to `EXTRA_INDEX_SUBURBS` in `packages/topic-content/indexingPolicy.js`. |
| A2 | Templated service x suburb pages | **Done in code.** Each page now has an "at a glance" paragraph with where the suburb ranks among the state's suburbs for that service, from real register counts. Tiny suburbs are noindex (A1). | Nothing. |
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
4. Claimed listings are never deleted by these scripts. Each one reported is checked by hand.

## H1: end of build checklist

- Remove every developer login from the admin, the VPS, Stripe, Mapbox, the database and the repository. Use company-owned accounts only.
- Rotate: `JWT_SECRET`, database credentials, Stripe keys and webhook secret, Mapbox token, email provider key, Twilio keys, `ADMIN_*` secrets, any WordPress application passwords.
- Delete local copies of production data on developer machines, and any exports or backups outside the company's storage.
- Move ownership of the domain, hosting, Stripe, Mapbox, GitHub organisation and Search Console to company email addresses.
- Use staging with dummy data only while the build continues.
