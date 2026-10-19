import 'dotenv/config';
import net from 'node:net';

/**
 * End-to-end check of the emails sent when a request is made and no member provider matches, against a RUNNING API on a throwaway
 * database that was started with SMTP_URL=smtp://127.0.0.1:2525 and REGISTER_LEAD_EMAILS=1 (the launcher .claude/tmp/with-notices.mjs
 * does that). This script is the mail server: it collects every message the API sends.
 *
 *   npx tsx src/scripts/testLeadNotices.ts --base http://localhost:4000
 *
 * It checks: the person gets the thank-you email and then the "still open" email, which says how many nearby businesses were really told;
 * businesses within the radius on the right register that have not joined are emailed and invited to join; businesses that are too far,
 * already members, opted out, not verified or on the other register are not; and nothing about the person is in what the businesses get.
 */
const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const base = (arg('base') ?? 'http://localhost:4000').replace(/\/$/, '');
let failures = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok || !detail ? '' : `: ${detail}`}`);
  if (!ok) failures += 1;
};

// ---- A small mail server that keeps what it is sent ----
interface Mail { to: string; subject: string; text: string; at: number }
const inbox: Mail[] = [];
function decodePart(raw: string): string {
  const [head, ...rest] = raw.split(/\r?\n\r?\n/);
  const body = rest.join('\n\n');
  if (/content-transfer-encoding:\s*base64/i.test(head)) return Buffer.from(body.replace(/\s+/g, ''), 'base64').toString('utf8');
  if (/content-transfer-encoding:\s*quoted-printable/i.test(head)) {
    const bytes = body.replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/gi, (_m, h) => String.fromCharCode(parseInt(h, 16)));
    return Buffer.from(bytes, 'latin1').toString('utf8');
  }
  return body;
}
function parseMail(data: string, to: string): Mail {
  const [headers, ...rest] = data.split(/\r?\n\r?\n/);
  const unfolded = headers.replace(/\r?\n[ \t]+/g, ' ');
  const subjectRaw = /^Subject:\s*(.*)$/im.exec(unfolded)?.[1] ?? '';
  const subject = subjectRaw.replace(/=\?utf-8\?([bq])\?([^?]*)\?=/gi, (_m, enc, s) =>
    enc.toLowerCase() === 'b' ? Buffer.from(s, 'base64').toString('utf8') : Buffer.from(s.replace(/_/g, ' ').replace(/=([0-9A-F]{2})/gi, (_x: string, h: string) => String.fromCharCode(parseInt(h, 16))), 'latin1').toString('utf8'));
  const body = rest.join('\n\n');
  const boundary = /boundary="?([^";\s]+)"?/i.exec(headers)?.[1];
  const text = boundary ? body.split(`--${boundary}`).map(decodePart).join('\n') : decodePart(`${headers}\n\n${body}`);
  return { to, subject, text, at: Date.now() };
}
function startSink(port: number): Promise<net.Server> {
  return new Promise((resolve) => {
    const server = net.createServer((sock) => {
      let inData = false; let buf = ''; let to = '';
      sock.write('220 sink ESMTP\r\n');
      sock.on('data', (d) => {
        buf += d.toString('latin1');
        if (inData) {
          if (!buf.endsWith('\r\n.\r\n')) return;
          inbox.push(parseMail(buf.slice(0, -5), to));
          inData = false; buf = ''; sock.write('250 OK\r\n'); return;
        }
        for (const line of buf.split('\r\n')) {
          if (!line) continue;
          if (/^EHLO|^HELO/i.test(line)) sock.write('250-sink\r\n250 8BITMIME\r\n');
          else if (/^MAIL FROM/i.test(line)) sock.write('250 OK\r\n');
          else if (/^RCPT TO/i.test(line)) { to = /<([^>]+)>/.exec(line)?.[1] ?? ''; sock.write('250 OK\r\n'); }
          else if (/^DATA/i.test(line)) { sock.write('354 go\r\n'); inData = true; buf = buf.slice(buf.indexOf(line) + line.length + 2); return; }
          else if (/^QUIT/i.test(line)) { sock.write('221 bye\r\n'); sock.end(); }
          else if (/^RSET|^NOOP/i.test(line)) sock.write('250 OK\r\n');
        }
        if (!inData) buf = '';
      });
      sock.on('error', () => {});
    }).listen(port, '127.0.0.1', () => resolve(server));
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const { noMatchTemplate } = await import('../services/emailTemplates.js');
  const { connectDB } = await import('../config/db.js');
  const { default: RegisterListing } = await import('../models/RegisterListing.js');
  const { default: SuburbGeo } = await import('../models/SuburbGeo.js');
  const { default: RegisterLeadNotice } = await import('../models/RegisterLeadNotice.js');
  await connectDB();

  // The wording when nobody nearby could be told: it promises only what is true.
  const quiet = noMatchTemplate({ name: 'Pat Smith', suburb: 'Testville', browseUrl: 'https://x.test/ndis-providers/vic', trackingUrl: 'https://x.test/track/1', nearbyTold: 0 }).html;
  check(/What happens next/.test(quiet) && !/What we have done/.test(quiet) && /Your request is still open/.test(quiet), 'with nobody nearby told, the email promises only that the request stays open');
  check(!/couldn.t find a match|confirmed capacity/i.test(quiet) && /Hi Pat,/.test(quiet), 'the old wording is gone and the person is greeted by first name');

  const sink = await startSink(2525);
  try {
    await RegisterListing.deleteMany({ slug: /^ntest-/ });
    await SuburbGeo.deleteMany({ suburbSlug: { $in: ['testville', 'nearton', 'farville'] } });
    for (const [suburb, lat, lng] of [['Testville', -37.8, 144.95], ['Nearton', -37.85, 144.95], ['Farville', -36.2, 143.0]] as const) {
      await SuburbGeo.create({ state: 'VIC', suburbSlug: suburb.toLowerCase(), suburb, location: { type: 'Point', coordinates: [lng, lat] } });
    }
    const listing = (slug: string, suburbSlug: string, suburb: string, extra: Record<string, unknown> = {}) => ({
      type: 'ndis', slug: `ntest-${slug}`, name: `Test Care ${slug}`, nameLower: `test care ${slug}`, states: ['VIC'], areaCount: 1,
      areas: [{ suburb, suburbSlug, state: 'VIC' }], supportCategories: ['Personal care'], services: ['Personal care'],
      email: `${slug}@biz.example.com`, contactVerified: true, claimStatus: 'unclaimed', ...extra,
    });
    await RegisterListing.insertMany([
      listing('near', 'nearton', 'Nearton'),
      listing('same', 'testville', 'Testville'),
      listing('far', 'farville', 'Farville'),
      listing('member', 'testville', 'Testville', { claimStatus: 'claimed' }),
      listing('optout', 'testville', 'Testville', { emailOptOut: true }),
      listing('unverified', 'testville', 'Testville', { contactVerified: false }),
      listing('aged', 'testville', 'Testville', { type: 'aged_care' }),
    ]);

    const form = {
      location: 'Testville, VIC', suburb: 'Testville', state: 'VIC', postcode: '3000', lat: '-37.8', lng: '144.95',
      careFor: 'Myself', timeframe: 'Immediately', funding: 'NDIS', planManagement: 'Plan managed',
      email: 'pat.smith@person.example.com', name: 'Pat Smith', consent: { collection: true },
    };
    const res = await fetch(`${base}/api/match-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const body: any = await res.json();
    check(res.status === 201 && body.matchedProviderCount === 0, 'a request in a suburb with no member provider is accepted and matched to nobody', `status ${res.status} ${JSON.stringify(body)}`);
    for (let i = 0; i < 40 && inbox.length < 4; i += 1) await sleep(250);
    await sleep(1500);

    const toPerson = inbox.filter((m) => m.to === form.email);
    const open = toPerson.find((m) => /still open|what happens next/i.test(m.subject));
    check(toPerson.length === 2 && !!open, 'the person gets the thank-you email and then the "still open" email', toPerson.map((m) => m.subject).join(' | '));
    check(!!open && toPerson.indexOf(open) === 1, 'the "still open" email comes after the thank-you');
    check(!!open && /let 2 registered providers near Testville know/.test(open.text), 'it says exactly how many nearby businesses were told (2)', open?.text.slice(0, 200));
    check(!!open && /\/ndis-providers\/vic\/testville/.test(open.text) && /Hi Pat,/.test(open.text) && /Email directory@/.test(open.text), 'it links to the register page for their suburb, greets them by name and gives a real contact');
    check(!!open && !/couldn.t find a match|confirmed capacity/i.test(open.text), 'it does not use the old wording');

    const told = inbox.filter((m) => /@biz\.example\.com$/.test(m.to)).map((m) => m.to.split('@')[0]).sort();
    check(JSON.stringify(told) === JSON.stringify(['near', 'same']), 'only the businesses near the request on the NDIS register that have not joined are emailed', told.join(', '));
    const notice = inbox.find((m) => m.to === 'near@biz.example.com');
    check(!!notice && /A request for disability or aged care support near Testville/.test(notice.subject), 'a business gets a clear subject even when the support is not known', notice?.subject);
    check(!!notice && /within about 20 km/.test(notice.text) && /signup\?role=provider/.test(notice.text) && /#claim-heading/.test(notice.text) && /up to 3 providers/.test(notice.text), 'it says how near, invites them to create a free provider account, offers claiming the listing, and says how many providers can respond');
    check(!inbox.filter((m) => /@biz\.example\.com$/.test(m.to)).some((m) => /Pat|pat\.smith|person\.example/.test(m.text)), 'nothing about the person is in what the businesses receive');
    check((await RegisterLeadNotice.countDocuments({ listingId: { $in: (await RegisterListing.find({ slug: /^ntest-/ }).select('_id').lean()).map((l) => l._id) } })) === 2, 'each notice is recorded once, so the caps can be enforced');
  } finally {
    sink.close();
    await RegisterListing.deleteMany({ slug: /^ntest-/ });
  }
  console.log(failures ? `\n${failures} check(s) FAILED.` : '\nAll checks passed.');
  process.exit(failures ? 1 : 0);
}

main().catch((err) => { console.error('[test-lead-notices] Fatal error:', err); process.exit(1); });
