/**
 * Checks the shared email layout without sending anything:
 *   npx tsx src/scripts/testEmailTemplates.ts
 * The footer (ABN, street address, phone) must stay plain text so mail apps do not turn it into phone or map links; text that came from a
 * person or the database must never add HTML to an email; links are escaped; and the plain-text version reads properly.
 */
let failures = 0;
const check = (ok: boolean, label: string, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok || !detail ? '' : `: ${detail}`}`); if (!ok) failures += 1; };

async function main() {
  const t: any = await import('../services/emailTemplates.js');
  const f: any = await import('../services/followUpTemplates.js');
  const evil = '<img src=x onerror=alert(1)>Bob & "Co"';

  const welcome = t.welcomeTemplate({ name: evil }).html as string;
  const footerStart = welcome.indexOf('class="nolink"');
  const footer = welcome.slice(footerStart, welcome.indexOf('</span><br />', footerStart) + 20);

  check(footerStart > 0, 'the footer line about who runs SolDirectory is marked so mail apps leave it alone');
  check(!/<a [^>]*>[^<]*(022|522|John|Glenroy|3046)/.test(footer), 'the ABN, street address and postcode are not inside any link');
  check(/ABN <span>20<\/span> <span>662<\/span> <span>022<\/span> <span>522<\/span>/.test(footer), 'the ABN is written out in full as plain words');
  check(/<span>97<\/span> <span>John<\/span> <span>St,<\/span> <span>Glenroy<\/span> <span>VIC<\/span> <span>3046<\/span>/.test(footer), 'the street address is plain words too');
  check(/Phone <span>0460<\/span> <span>003<\/span> <span>494<\/span>/.test(footer), 'the phone number is plain text, not a link');
  check(/href="mailto:directory@solbusinessconsultant\.com\.au"/.test(footer), 'the email address is one deliberate link');
  check(/name="format-detection" content="telephone=no, date=no, address=no/.test(welcome), 'the head turns off automatic phone and address links');

  check(!welcome.includes('<img src=x'), 'a hostile name in the welcome heading is escaped', welcome.slice(welcome.indexOf('<h1'), welcome.indexOf('</h1>')));
  check(welcome.includes('Welcome, &lt;img src=x onerror=alert(1)&gt;Bob &amp; &quot;Co&quot;!'), 'it still reads as the person typed it');

  const matched = t.providerMatchedTemplate({ need: evil }).html as string;
  const response = t.providerResponseTemplate({ providerName: evil }).html as string;
  const capacity = t.capacityConfirmationTemplate({ providerName: evil, confirmUrl: 'https://x.test/a?b=1&c=2' }).html as string;
  const lead = t.providerLeadNotificationTemplate({ need: evil, suburb: evil }).html as string;
  const noMatch = t.noMatchTemplate({ name: 'Pat', suburb: evil, browseUrl: 'https://x.test/a?b=1&copy=2', nearbyTold: 0 }).html as string;
  const responded = f.requestRespondedTemplate({ providerName: evil, searchUrl: 'https://x.test/s', unsubscribeUrl: 'https://x.test/u' }).html as string;
  const rejected = t.verificationResultTemplate({ approved: false, reason: evil }).html as string;
  for (const [name, html] of Object.entries({ matched, response, capacity, lead, noMatch, responded, rejected })) {
    check(!(html as string).includes('<img src=x'), `${name}: hostile text from the database cannot add HTML (body, heading, preview text or button)`);
  }
  check(capacity.includes('href="https://x.test/a?b=1&amp;c=2"'), 'button links are escaped in the page (& becomes &amp;)');
  check(noMatch.includes('href="https://x.test/a?b=1&amp;copy=2"'), 'a link with "&copy=" is not misread as a copyright sign');

  const conf = t.leadConfirmationTemplate({ requestNumber: 'ABC123', need: 'Plan management', trackingUrl: 'https://x.test/track/1' }).html as string;
  check(!/Reply to this email/i.test(conf) && /Email directory@solbusinessconsultant\.com\.au or call/.test(conf), 'the thank-you email no longer says "reply" when replies are not read');

  const text = t.htmlToText(conf) as string;
  check(/We've received your request/.test(text) && !/<[a-z]/i.test(text), 'the plain-text version has the message and no HTML');
  check(/Follow your request:.*see who has received and opened it \(https:\/\/x\.test\/track\/1\)/.test(text), 'links are written out as "label (address)"');
  check(/ABN 20 662 022 522\), 97 John St, Glenroy VIC 3046\. Phone 0460 003 494\. Email directory@solbusinessconsultant\.com\.au\./.test(text), 'the footer reads normally in plain text');
  check(!/^http/.test(text), 'the plain text does not start with a stray logo link');
  check(!/display:none|Hello preview/.test(text) && !/We've received your request\. Your reference is ABC123\.\s*We've received/.test(text), 'the hidden inbox preview text is not repeated in the plain text');
  console.log('\n--- plain text of the thank-you email (first 900 chars) ---\n' + text.slice(0, 900));
  console.log(failures ? `\n${failures} FAILED` : '\nAll checks passed.');
  process.exit(failures ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
