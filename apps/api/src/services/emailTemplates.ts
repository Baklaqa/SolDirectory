// Shared branded layout — table-based HTML, since that's still what
// actually renders consistently across real email clients (Outlook
// in particular ignores modern CSS layout). Every specific email
// wraps its content through this function rather than building its
// own <html> document.

import { siteOrigin } from './emailTokens.js';
import { BUSINESS } from '../config/business.js';

const NAVY = '#0B2D5C';
const PRIMARY = '#1769E0';
const BG = '#F5F8FC';
const TEXT_MUTED = '#5A6B84';

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Every subject line goes through this before sending: control characters and line breaks are removed (text typed by a person must never
 * be able to add mail headers), runs of spaces are collapsed, and long subjects are cut at a word so an inbox shows the part that matters.
 */
export function cleanSubject(value: unknown, max = 110): string {
  const text = String(value ?? '').replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const atWord = cut.lastIndexOf(' ');
  return `${(atWord > max * 0.6 ? cut.slice(0, atWord) : cut).replace(/[\s,;:.\-]+$/, '')}…`;
}

/** The service a person asked for, or nothing when the form only recorded "Not sure yet". */
function realNeed(need?: string): string {
  const n = (need ?? '').trim();
  return n && !/^(not sure( yet)?|not specified)$/i.test(n) ? n : '';
}

/** "Plan management in Glenroy VIC", "support in Glenroy", or just "support": for subject lines about a request. */
export function requestSummary(need?: string, place?: string): string {
  const n = realNeed(need);
  const p = (place ?? '').trim();
  if (n && p) return `${n} in ${p}`;
  if (n) return n;
  return p ? `support in ${p}` : 'support';
}

/**
 * Mail apps turn anything that looks like a phone number or an address into a link: the last digits of the ABN ("022 522") become a phone
 * link and the street address becomes a map link. Putting each word in its own span leaves nothing for them to match, and the text reads
 * exactly the same. (The head also switches the automatic links off for Apple Mail and the Gmail apps; see renderEmailLayout.)
 */
export function noAutoLink(value: string): string {
  return escapeHtml(value).split(' ').map((word) => `<span>${word}</span>`).join(' ');
}

/** Colour is marked !important so the footer rule in the head (which stops mail apps restyling phone-like text) can never turn a real link black. */
const FOOTER_LINK = `color:${PRIMARY} !important; text-decoration:none !important;`;

/** A phone number in the form phones dial: 0460 003 494 becomes +61460003494. */
function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  return digits.startsWith('0') ? `+61${digits.slice(1)}` : digits;
}

/**
 * The footer line about who runs SolDirectory. The phone number, street address and email address are deliberate links (call, open in maps,
 * write), so they behave the same in every mail app. The business name and the ABN stay plain black text on purpose: the ABN is not a phone
 * number or a place, and mail apps used to make it one.
 */
function businessLineHtml(): string {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS.address)}`;
  return `SolDirectory is operated by ${noAutoLink(BUSINESS.operator)} (ABN ${noAutoLink(BUSINESS.abn)}), ` +
    `<a href="${escapeHtml(mapsUrl)}" style="${FOOTER_LINK}">${escapeHtml(BUSINESS.address)}</a>. ` +
    `Phone <a href="tel:${escapeHtml(telHref(BUSINESS.phone))}" style="${FOOTER_LINK}">${escapeHtml(BUSINESS.phone)}</a>. ` +
    `Email <a href="mailto:${escapeHtml(BUSINESS.email)}" style="${FOOTER_LINK}">${escapeHtml(BUSINESS.email)}</a>.`;
}

/**
 * The plain-text version sent alongside the HTML. Some people read email as plain text (screen readers, text-only apps, some watches), and
 * mail that has only an HTML part is more likely to be treated as spam. Links are written out as "label (address)".
 */
export function htmlToText(html: string): string {
  const entities: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'", '&nbsp;': ' ', '&middot;': '·' };
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, '')
    .replace(/<span class="preheader"[\s\S]*?<\/span>/i, '')
    .replace(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href: string, label: string) => {
      const text = label.replace(/<[^>]+>/g, '').trim();
      if (!text) return ''; // the logo, which is a picture inside a link
      // Email, phone and map links are already readable as text; other links are written out as "label (address)".
      return /^(mailto:|tel:|https:\/\/www\.google\.com\/maps\/)/.test(href) ? text : `${text} (${href})`;
    })
    .replace(/<img[^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/(p|div|h[1-6]|tr|li|table|ul)>/gi, '\n')
    .replace(/<\/td>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot|#039|nbsp|middot);/g, (m) => entities[m] ?? m)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function renderEmailLayout(opts: {
  preheader: string; // hidden preview text shown in inbox lists (plain text: it is escaped here)
  heading: string;
  bodyHtml: string; // pre-built inner HTML — paragraphs, etc.
  ctaLabel?: string;
  ctaUrl?: string;
  /** Extra footer lines, e.g. who sent this and how to stop receiving it — required on anything that is not a direct reply to the recipient's own action. */
  footerHtml?: string;
}): string {
  const { preheader, heading, bodyHtml, ctaLabel, ctaUrl, footerHtml } = opts;
  const site = siteOrigin();
  // Hosted on the site itself (apps/web/public/images). If a mail app blocks images, the alt text shows the name instead.
  const logo = `${site}/images/email-logo-white.png`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
  <title>${heading}</title>
  <style>
    /* Apple Mail and the Gmail apps still link phone-like numbers and addresses they find themselves; in the footer line that is switched off. The footer's own links carry !important colours inline, so they stay blue. */
    a[x-apple-data-detectors], u + #body .nolink a { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
  </style>
</head>
<body id="body" style="margin:0; padding:0; background:${BG}; font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
  <span class="preheader" style="display:none; font-size:1px; color:${BG}; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG}; padding: 28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #DDE6F2; box-shadow:0 6px 24px rgba(11,45,92,0.08);">
        <tr>
          <td style="background:${NAVY}; padding:26px 32px 24px;">
            <a href="${site}" style="text-decoration:none;"><img src="${logo}" width="190" alt="SolDirectory" style="display:block; width:190px; max-width:100%; height:auto; border:0; color:#ffffff; font-size:20px; font-weight:700;" /></a>
          </td>
        </tr>
        <tr><td style="background:${PRIMARY}; height:4px; line-height:4px; font-size:0;">&nbsp;</td></tr>
        <tr>
          <td style="padding:34px 32px 14px;">
            <h1 style="margin:0 0 18px; font-size:23px; line-height:1.3; font-weight:700; letter-spacing:-0.01em; color:${NAVY};">${heading}</h1>
            <div style="font-size:15.5px; line-height:1.65; color:#1B2B43;">${bodyHtml}</div>
          </td>
        </tr>
        ${ctaLabel && ctaUrl ? `
        <tr>
          <td style="padding: 8px 32px 34px;">
            <a href="${escapeHtml(ctaUrl)}" style="display:inline-block; background:${PRIMARY}; color:#ffffff; text-decoration:none; font-size:15px; font-weight:600; padding:14px 28px; border-radius:10px;">${escapeHtml(ctaLabel)}</a>
          </td>
        </tr>` : '<tr><td style="height:18px; line-height:18px; font-size:0;">&nbsp;</td></tr>'}
        <tr>
          <td style="padding:22px 32px 26px; background:#F8FAFD; border-top:1px solid #E8EEF7; font-size:12.5px; line-height:1.6; color:${TEXT_MUTED};">
            <a href="${site}" style="color:${NAVY}; text-decoration:none;"><strong style="color:${NAVY};">SolDirectory</strong></a> helps people find NDIS and aged care providers across Australia.<br />
            <span class="nolink">${businessLineHtml()}</span><br />
            <a href="${site}" style="color:${PRIMARY}; text-decoration:none;">Visit the website</a> &nbsp;·&nbsp; <a href="${site}/privacy" style="color:${PRIMARY}; text-decoration:none;">Privacy</a> &nbsp;·&nbsp; This is an automated message, so please don't reply to it.${footerHtml ? `<br /><br />${footerHtml}` : ''}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export interface LeadConfirmationDetails {
  service?: string;
  suburb?: string;
  state?: string;
  careFor?: string;
  timeframe?: string;
  funding?: string;
  /** The public-register provider the person asked for by name, if any. */
  provider?: string;
}

export function leadConfirmationTemplate(input: {
  requestNumber: string;
  need: string;
  trackingUrl?: string;
  details?: LeadConfirmationDetails;
  /** Where "browse providers" should go (the public provider search). Falls back to the tracking link. */
  browseUrl?: string;
}): { subject: string; html: string } {
  const d = input.details ?? {};
  // The form no longer asks for the service, so the stored need is usually "Not sure yet": show the service only when it is real.
  const service = [d.service, input.need].find((s) => s && !/^not sure yet$/i.test(s));
  const place = [d.suburb, d.state].filter(Boolean).join(', ');
  const rows: [string, string | undefined][] = [
    ['Reference', input.requestNumber],
    ['Requested provider', d.provider],
    ['Looking for', service],
    ['Where', place],
    ['Who it is for', d.careFor],
    ['When', d.timeframe],
    ['Funding', d.funding],
  ];
  const summary = rows
    .filter(([, value]) => !!value)
    .map(([label, value]) => `<tr><td style="padding:7px 0; width:128px; color:${TEXT_MUTED}; font-size:13.5px; vertical-align:top;">${label}</td><td style="padding:7px 0; font-size:14.5px; font-weight:600; color:${NAVY};">${escapeHtml(value)}</td></tr>`)
    .join('');
  const step = (n: number, title: string, text: string) =>
    `<tr><td style="vertical-align:top; padding:0 14px 14px 0; width:30px;"><div style="width:28px; height:28px; border-radius:14px; background:${PRIMARY}; color:#fff; text-align:center; line-height:28px; font-size:14px; font-weight:700;">${n}</div></td><td style="padding:0 0 14px; font-size:14.5px; line-height:1.55;"><strong style="color:${NAVY};">${title}</strong><br />${text}</td></tr>`;

  const html = renderEmailLayout({
    preheader: `We've received your request. Your reference is ${input.requestNumber}.`,
    heading: "We've received your request",
    bodyHtml: `
      <p style="margin:0 0 18px;">${d.provider
        ? `Thank you. Your request for <strong>${escapeHtml(d.provider)}</strong> is with SolDirectory, and we are passing it on to them.`
        : `Thank you${service ? ` for asking about <strong>${escapeHtml(service)}</strong>` : ''}. Your request is with SolDirectory, and providers that match it can now see it.`}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F8FD; border:1px solid #E1ECFB; border-radius:12px; margin:0 0 24px;"><tr><td style="padding:16px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${summary}</table>
      </td></tr></table>
      <p style="margin:0 0 12px; font-weight:700; color:${NAVY}; font-size:16px;">What happens next</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${d.provider
          ? `${step(1, 'We pass your request on', `Your request goes to ${escapeHtml(d.provider)} only. They do not see your contact details unless they take it up.`)}
        ${step(2, 'They get in touch if they can help', 'Response times vary by provider, service and area. We will email you when your request is looked at.')}
        ${step(3, 'You choose', 'You are never obliged to use anyone. You can compare other providers at any time, ask about prices and availability, and pick the one that suits you.')}`
          : `${step(1, 'Providers review your request', 'Providers that match and have confirmed they are taking new people see a summary, without your name or contact details. Up to 3 can choose to contact you.')}
        ${step(2, 'A provider gets in touch', 'Most people hear back within a few business days, though this varies by service and area. We will email you when a provider looks at your request.')}
        ${step(3, 'You choose', 'You are never obliged to use anyone. Compare providers, ask about prices and availability, and pick the one that suits you.')}`}
      </table>
      ${input.trackingUrl ? `<p style="margin:6px 0 12px;"><strong style="color:${NAVY};">Follow your request:</strong> <a href="${escapeHtml(input.trackingUrl)}" style="color:${PRIMARY}; font-weight:700;">see who has received and opened it</a>, any time.</p>` : ''}
      <p style="margin:6px 0 12px;">Being contacted does not mean you have agreed to anything. Ask each provider the same questions, compare them, and only sign a service agreement when you are ready.</p>
      <p style="margin:6px 0 0;">You do not have to wait: you can look at providers in your area now and contact them directly. Questions? Email ${escapeHtml(BUSINESS.email)} or call ${escapeHtml(BUSINESS.phone)}.</p>`,
    ctaLabel: 'Browse providers near you',
    ctaUrl: input.browseUrl ?? input.trackingUrl,
  });
  return { subject: cleanSubject(`We've received your SolDirectory request (${input.requestNumber})`), html };
}

export function providerMatchedTemplate(input: { need: string; trackingUrl?: string }): { subject: string; html: string } {
  const html = renderEmailLayout({
    preheader: 'A provider has been matched to your request',
    heading: 'A provider has been matched to your request',
    bodyHtml: `<p>Good news — a provider offering <strong>${escapeHtml(input.need)}</strong> has been matched to your request and may be in touch soon.</p>`,
    ctaLabel: input.trackingUrl ? 'View your request' : undefined,
    ctaUrl: input.trackingUrl,
  });
  return { subject: 'A provider has been matched to your request', html };
}

export function providerResponseTemplate(input: { providerName: string; trackingUrl?: string }): { subject: string; html: string } {
  const html = renderEmailLayout({
    preheader: `${input.providerName} has responded to your request`,
    heading: 'A provider has responded to your request',
    bodyHtml: `<p><strong>${escapeHtml(input.providerName)}</strong> has responded to your care request. Log in to see their response and next steps.</p>`,
    ctaLabel: input.trackingUrl ? 'View response' : undefined,
    ctaUrl: input.trackingUrl,
  });
  return { subject: 'A provider has responded to your request', html };
}

function searchDescription(input: { service?: string; suburb?: string; query?: string }): string {
  return [input.service, input.suburb, input.query ? `provider name “${input.query}”` : ''].filter(Boolean).map(escapeHtml).join(' · ');
}

export function searchAlertVerificationTemplate(input: { service?: string; suburb?: string; query?: string; verifyUrl: string; unsubscribeUrl: string }): { subject: string; html: string } {
  const description = searchDescription(input);
  const html = renderEmailLayout({
    preheader: 'Confirm your SolDirectory provider alert',
    heading: 'Confirm your provider alert',
    bodyHtml: `<p>You asked to receive email when new SolDirectory providers match:</p><p><strong>${description}</strong></p><p>This alert will not start until you confirm it. You can unsubscribe at any time.</p><p style="font-size:12px"><a href="${escapeHtml(input.unsubscribeUrl)}">Cancel this alert</a></p>`,
    ctaLabel: 'Confirm alert',
    ctaUrl: input.verifyUrl,
  });
  return { subject: 'Confirm your SolDirectory provider alert', html };
}

export function searchAlertDigestTemplate(input: {
  service?: string;
  suburb?: string;
  query?: string;
  providers: { name: string; url: string; supports: string[] }[];
  searchUrl: string;
  unsubscribeUrl: string;
}): { subject: string; html: string } {
  const description = searchDescription(input);
  const rows = input.providers.map((provider) => `<li style="margin-bottom:12px"><a href="${escapeHtml(provider.url)}"><strong>${escapeHtml(provider.name)}</strong></a>${provider.supports.length ? `<br />${provider.supports.map(escapeHtml).join(', ')}` : ''}</li>`).join('');
  const html = renderEmailLayout({
    preheader: `${input.providers.length} new or updated provider matches`,
    heading: 'New provider matches',
    bodyHtml: `<p>New or updated SolDirectory providers match <strong>${description}</strong>:</p><ul style="padding-left:20px">${rows}</ul><p>Confirm availability, suitability, registration, fees and service terms directly with each provider.</p><p style="font-size:12px"><a href="${escapeHtml(input.unsubscribeUrl)}">Unsubscribe from this alert</a></p>`,
    ctaLabel: 'Review your search',
    ctaUrl: input.searchUrl,
  });
  return { subject: `${input.providers.length} new provider match${input.providers.length === 1 ? '' : 'es'} on SolDirectory`, html };
}

export function capacityConfirmationTemplate(input: { providerName: string; confirmUrl: string }): { subject: string; html: string } {
  const html = renderEmailLayout({
    preheader: 'Confirm you can still take new referrals this week',
    heading: 'Weekly capacity check-in',
    bodyHtml: `<p>Hi ${escapeHtml(input.providerName)},</p><p>Please confirm you're still able to take new referrals this week. Only providers who answer receive new requests. If we don't hear from you within 7 days, your profile stays live but you won't be sent new requests, and it loses the “Taking new people” label, until you confirm again.</p>`,
    ctaLabel: 'Confirm capacity',
    ctaUrl: input.confirmUrl,
  });
  return { subject: 'Confirm your capacity on SolDirectory', html };
}

export function providerLeadNotificationTemplate(input: { need: string; suburb: string; dashboardUrl?: string }): { subject: string; html: string } {
  const html = renderEmailLayout({
    preheader: 'A new care opportunity is available',
    heading: 'New care opportunity available',
    bodyHtml: `<p>A new request for <strong>${escapeHtml(input.need)}</strong> in <strong>${escapeHtml(input.suburb)}</strong> is available in your leads list.</p>`,
    ctaLabel: input.dashboardUrl ? 'View opportunity' : undefined,
    ctaUrl: input.dashboardUrl,
  });
  return { subject: cleanSubject(`New request: ${requestSummary(input.need, input.suburb)}`), html };
}

export function providerLeadTeaserTemplate(input: { need: string; suburb: string; dashboardUrl?: string; claimUrl?: string; unlocksLeft?: number }): { subject: string; html: string } {
  const spots = typeof input.unlocksLeft === 'number'
    ? `<p><strong>${input.unlocksLeft} of 3</strong> spots are left on this request.</p>`
    : '<p>Up to 3 providers can unlock each request.</p>';
  const html = renderEmailLayout({
    preheader: `New request: ${input.need} in ${input.suburb}`,
    heading: 'A new request matches your profile',
    bodyHtml: `<p>Support: <strong>${escapeHtml(input.need)}</strong><br />Suburb: <strong>${escapeHtml(input.suburb)}</strong></p>${spots}<p>The person’s name and contact details are shown when you unlock the request, which uses one of your monthly unlocks. Only unlock if you can realistically help, and please contact the person within one business day.</p>${input.claimUrl ? `<p><strong>Your organisation has a free SolDirectory listing.</strong> <a href="${escapeHtml(input.claimUrl)}">Manage your listing</a> to update your details and respond to requests.</p>` : ''}`,
    ctaLabel: input.dashboardUrl ? 'View request' : undefined,
    ctaUrl: input.dashboardUrl,
  });
  return { subject: cleanSubject(`New request: ${requestSummary(input.need, input.suburb)}`), html };
}

export function providerLeadFullTemplate(input: {
  need: string;
  suburb: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  careFor: string;
  timeframe: string;
  fundingType: string;
  planManagement?: string;
  additionalDetails?: string;
  dashboardUrl?: string;
}): { subject: string; html: string } {
  const html = renderEmailLayout({
    preheader: `New ${input.need} lead in ${input.suburb} with contact details`,
    heading: 'New matched lead',
    bodyHtml: `
      <p>A new request for <strong>${escapeHtml(input.need)}</strong> in <strong>${escapeHtml(input.suburb)}</strong> has been matched to your organisation.</p>
      <p><strong>Requester:</strong> ${escapeHtml(input.requesterName)}<br />
      <strong>Email:</strong> ${escapeHtml(input.requesterEmail)}<br />
      <strong>Phone:</strong> ${escapeHtml(input.requesterPhone || 'Not provided')}</p>
      <p><strong>Support for:</strong> ${escapeHtml(input.careFor)}<br />
      <strong>Timeframe:</strong> ${escapeHtml(input.timeframe)}<br />
      <strong>Funding:</strong> ${escapeHtml(input.fundingType)}${input.planManagement ? ` (${escapeHtml(input.planManagement)})` : ''}</p>
      ${input.additionalDetails ? `<p><strong>Additional details:</strong><br />${escapeHtml(input.additionalDetails)}</p>` : ''}
    `,
    ctaLabel: input.dashboardUrl ? 'Open lead in dashboard' : undefined,
    ctaUrl: input.dashboardUrl,
  });
  return { subject: cleanSubject(`New matched lead: ${requestSummary(input.need, input.suburb)}`), html };
}

export function adminNotificationTemplate(input: { title: string; message: string; dashboardUrl?: string }): { subject: string; html: string } {
  const html = renderEmailLayout({
    preheader: input.title,
    heading: escapeHtml(input.title),
    bodyHtml: input.message.startsWith('<table') ? input.message : `<p>${input.message}</p>`,
    ctaLabel: input.dashboardUrl ? 'Open admin dashboard' : undefined,
    ctaUrl: input.dashboardUrl,
  });
  return { subject: cleanSubject(`[SolDirectory Admin] ${input.title}`, 120), html };
}

export function passwordResetTemplate(input: { resetUrl: string }): { subject: string; html: string } {
  const html = renderEmailLayout({
    preheader: 'Reset your SolDirectory password',
    heading: 'Reset your password',
    bodyHtml: `
      <p>We received a request to reset your SolDirectory password. This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>
    `,
    ctaLabel: 'Reset password',
    ctaUrl: input.resetUrl,
  });
  return { subject: 'Reset your SolDirectory password', html };
}

export function passwordChangedTemplate(): { subject: string; html: string } {
  const html = renderEmailLayout({
    preheader: 'Your password was changed',
    heading: 'Your password was changed',
    bodyHtml: `<p>Your SolDirectory password was just changed. If this wasn't you, contact support immediately.</p>`,
  });
  return { subject: 'Your SolDirectory password was changed', html };
}

export function verificationResultTemplate(input: { approved: boolean; reason?: string }): { subject: string; html: string } {
  const html = renderEmailLayout({
    preheader: input.approved ? 'Your verification has been approved' : 'An update on your verification',
    heading: input.approved ? "You're verified!" : 'Verification update',
    bodyHtml: input.approved
      ? `<p>Good news — your worker verification has been approved and your profile is now published.</p>`
      : `<p>Your worker verification was not approved this time.${input.reason ? ` Reason: ${escapeHtml(input.reason)}` : ''}</p><p>You're welcome to update your documents and resubmit.</p>`,
  });
  return { subject: input.approved ? "You're verified on SolDirectory" : 'Your SolDirectory verification update', html };
}

// ---- Provider onboarding checks (services/providerChecks.ts) ----

export function providerChecksPassedTemplate(input: { name: string; registered: boolean; dashboardUrl: string }): { subject: string; html: string } {
  const html = renderEmailLayout({
    preheader: 'Your details are confirmed',
    heading: 'Your details are confirmed',
    bodyHtml: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>${input.registered
        ? 'We checked your details and your declaration against the NDIS Commission register. Everything lines up.'
        : 'We checked your details and your declaration. Everything is complete.'}</p>
      <p>There is nothing more you need to do. If your insurance or registration changes, update it under Onboarding so your details stay right.</p>
    `,
    ctaLabel: 'Go to your dashboard',
    ctaUrl: input.dashboardUrl,
  });
  return { subject: 'Your SolDirectory details are confirmed', html };
}

export function providerChecksAttentionTemplate(input: { name: string; items: { message: string; severity: 'warn' | 'fail'; fixUrl: string }[]; onlyConfirming: boolean }): { subject: string; html: string } {
  const list = input.items.map((i) => `<li style="margin:0 0 12px;">${escapeHtml(i.message)} <a href="${escapeHtml(i.fixUrl)}">${i.severity === 'fail' ? 'Fix this' : 'Check this'}</a></li>`).join('');
  const html = renderEmailLayout({
    preheader: input.onlyConfirming ? 'One thing to double-check' : 'A few things to fix on your profile',
    heading: input.onlyConfirming ? 'One thing to double-check' : 'A few things to fix',
    bodyHtml: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>${input.onlyConfirming
        ? 'Thanks for finishing your onboarding. Our team will take a look at the point below. If it is wrong, you can correct it now.'
        : 'Thanks for your onboarding. We checked your details and found something to fix before they can be confirmed.'}</p>
      <ul style="padding-left:20px; margin:0 0 16px;">${list}</ul>
      <p>Each link takes you straight to the right step. You will get another email once it is sorted.</p>
    `,
    ctaLabel: 'Open onboarding',
    ctaUrl: input.items[0]?.fixUrl,
  });
  return { subject: input.onlyConfirming ? 'One thing to double-check on your SolDirectory profile' : `Action needed: ${input.items.length} thing${input.items.length === 1 ? '' : 's'} to fix on your SolDirectory profile`, html };
}

export function welcomeTemplate(input: { name: string }): { subject: string; html: string } {
  const html = renderEmailLayout({
    preheader: 'Welcome to SolDirectory',
    heading: `Welcome, ${escapeHtml(input.name)}!`,
    bodyHtml: `<p>Your SolDirectory account is ready. We're glad you're here.</p>`,
  });
  return { subject: 'Welcome to SolDirectory', html };
}

// ---- Billing emails (sent automatically from the Stripe webhook, services/stripe.service.ts) ----

export function subscriptionStartedTemplate(input: { name: string; planName: string; quotaText: string; leadsUrl?: string }): { subject: string; html: string } {
  const html = renderEmailLayout({
    preheader: `Your ${input.planName} plan is active`,
    heading: `Your ${escapeHtml(input.planName)} plan is active`,
    bodyHtml: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>Thanks for subscribing — your <strong>${escapeHtml(input.planName)}</strong> plan is now active. ${escapeHtml(input.quotaText)}</p>
      <p>Open your leads to see requests matched to your service areas and unlock the full brief and contact details.</p>
    `,
    ctaLabel: input.leadsUrl ? 'View your leads' : undefined,
    ctaUrl: input.leadsUrl,
  });
  return { subject: cleanSubject(`Your SolDirectory ${input.planName} plan is active`), html };
}

export function paymentReceivedTemplate(input: { name: string; planName: string; amount: string; nextBilling?: string; billingUrl?: string }): { subject: string; html: string } {
  const html = renderEmailLayout({
    preheader: `Payment received — ${input.amount}`,
    heading: 'Payment received',
    bodyHtml: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>We've received your payment of <strong>${escapeHtml(input.amount)}</strong> for the <strong>${escapeHtml(input.planName)}</strong> plan. Your lead unlocks for the new month are ready to use.</p>
      ${input.nextBilling ? `<p>Your next payment is due on <strong>${escapeHtml(input.nextBilling)}</strong>.</p>` : ''}
    `,
    ctaLabel: input.billingUrl ? 'View billing' : undefined,
    ctaUrl: input.billingUrl,
  });
  return { subject: cleanSubject(`Payment received for your SolDirectory ${input.planName} plan`), html };
}

export function paymentFailedTemplate(input: { name: string; planName: string; billingUrl?: string }): { subject: string; html: string } {
  const html = renderEmailLayout({
    preheader: 'We could not take your payment',
    heading: 'We couldn’t take your payment',
    bodyHtml: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>The latest payment for your <strong>${escapeHtml(input.planName)}</strong> plan didn't go through. This is usually an expired card or a bank decline.</p>
      <p>Please update your payment method so your plan and unlocks aren't interrupted. We'll try again in a few days. If the payment still doesn't go through, your profile stays live on the free Listed plan.</p>
    `,
    ctaLabel: input.billingUrl ? 'Update payment method' : undefined,
    ctaUrl: input.billingUrl,
  });
  return { subject: 'Action needed: your SolDirectory payment failed', html };
}

export function subscriptionCancelledTemplate(input: { name: string; planName: string; plansUrl?: string }): { subject: string; html: string } {
  const html = renderEmailLayout({
    preheader: `Your ${input.planName} plan has ended`,
    heading: `Your ${escapeHtml(input.planName)} plan has ended`,
    bodyHtml: `
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>Your <strong>${escapeHtml(input.planName)}</strong> subscription has ended and your account is back on the free Listed plan. Your listing stays public; lead details are hidden until you subscribe again.</p>
      <p>You can resubscribe at any time.</p>
    `,
    ctaLabel: input.plansUrl ? 'View plans' : undefined,
    ctaUrl: input.plansUrl,
  });
  return { subject: 'Your SolDirectory plan has ended', html };
}

export function checkExpiringTemplate(input: { firstName?: string; checkName: string; expiry: Date; link: string }): { subject: string; html: string } {
  const when = input.expiry.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Melbourne' });
  const html = renderEmailLayout({
    preheader: `Your ${input.checkName} expires on ${when}`,
    heading: `Your ${escapeHtml(input.checkName)} expires on ${when}`,
    bodyHtml: `<p>Hi ${escapeHtml(input.firstName || 'there')},</p><p>Your ${escapeHtml(input.checkName)} on SolDirectory expires on <strong>${when}</strong>. Upload your renewed check before then to keep your profile visible.</p>`,
    ctaLabel: 'Upload renewed check',
    ctaUrl: input.link,
  });
  return { subject: cleanSubject(`Your ${input.checkName} expires on ${when}`), html };
}

/**
 * Sent a moment after the "thanks, we have your request" email, when no member provider could be matched. It explains what that means
 * (not that there is no support near them), what SolDirectory is doing about it (only what really happened: `nearbyTold` is how many
 * register businesses nearby were actually emailed, 0 if none), and what they can do now.
 */
export function noMatchTemplate(input: { name?: string; need?: string; suburb?: string; browseUrl: string; trackingUrl?: string; nearbyTold?: number }): { subject: string; html: string } {
  const what = input.need && !/^not sure yet$/i.test(input.need) ? ` for ${escapeHtml(input.need)}` : '';
  const where = input.suburb ? ` in ${escapeHtml(input.suburb)}` : '';
  const area = input.suburb ? escapeHtml(input.suburb) : 'you';
  const first = (input.name ?? '').trim().split(/\s+/)[0];
  const told = Math.max(0, input.nearbyTold ?? 0);
  const link = (href: string, label: string) => `<a href="${escapeHtml(href)}" style="color:${PRIMARY}; font-weight:700;">${label}</a>`;
  const next = told > 0
    ? `<p><strong>What we have done:</strong> we have let ${told === 1 ? 'one registered provider' : `${told} registered providers`} near ${area} know that someone in their area is looking for support. We did not share your name or contact details. If one of them joins SolDirectory and takes up your request, we will email you straight away.</p>`
    : `<p><strong>What happens next:</strong> your request stays open. When a provider near ${area} joins SolDirectory, or tells us they have space, we will email you straight away.</p>`;
  const html = renderEmailLayout({
    preheader: 'Nobody has confirmed space yet. Here is what we are doing, and what you can do now.',
    heading: 'Your request is still open',
    bodyHtml: `
      <p>${first ? `Hi ${escapeHtml(first)},` : 'Hello,'}</p>
      <p>Thanks again for sending your request${what}${where}. We checked straight away, and none of the providers who have joined SolDirectory near ${area} has told us they have space for you yet.</p>
      <p>That does not mean there is no support near you. Many providers are listed on the public NDIS register but have not joined SolDirectory, so they cannot see your request unless we reach out to them.</p>
      ${next}
      <p><strong>What you can do now:</strong> you do not have to wait for us. You can look through the registered providers near you and contact them directly. When you get in touch, ask whether they have space for you and how soon they could start.</p>
      ${input.trackingUrl ? `<p>You can ${link(input.trackingUrl, 'see or close your request')} at any time. If you no longer need support, closing it means no more providers can open it.</p>` : ''}
      <p>Questions? Email ${escapeHtml(BUSINESS.email)} or call ${escapeHtml(BUSINESS.phone)}.</p>`,
    ctaLabel: input.suburb ? `See providers near ${input.suburb}` : 'See registered providers',
    ctaUrl: input.browseUrl,
  });
  return { subject: 'Your request is open: what happens next', html };
}

export function outcomeCheckTemplate(input: { need?: string; started: string; looking: string; notNeeded: string }): { subject: string; html: string } {
  const what = input.need && !/^not sure yet$/i.test(input.need) ? ` for ${escapeHtml(input.need)}` : '';
  const btn = (href: string, label: string, primary = false) =>
    `<a href="${escapeHtml(href)}" style="display:inline-block; margin:0 8px 10px 0; padding:12px 18px; border-radius:10px; text-decoration:none; font-weight:600; font-size:15px; ${primary ? `background:${PRIMARY}; color:#ffffff;` : `background:#EAF2FC; color:${NAVY};`}">${escapeHtml(label)}</a>`;
  const html = renderEmailLayout({
    preheader: 'One tap is enough: did you find the support you needed?',
    heading: 'Did you find the support you needed?',
    bodyHtml: `
      <p>A quick check on your request${what}. Did you find support?</p>
      <p>${btn(input.started, 'Yes, it’s started', true)}${btn(input.looking, 'Still looking')}${btn(input.notNeeded, 'I don’t need it any more')}</p>
      <p>Your answer helps us show families which providers really follow through.</p>`,
  });
  return { subject: 'Did you find the support you needed?', html };
}
