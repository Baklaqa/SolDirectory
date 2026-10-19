import { createHash } from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import { unzipSync, type UnzipFileInfo } from 'fflate';

/**
 * Checks an uploaded document before it is stored. A file that fails is never written to disk or to a bucket.
 *
 * Two layers:
 *  1. ClamAV, when it is running on the server (CLAMAV_SOCKET, or CLAMAV_HOST and CLAMAV_PORT; the Ubuntu default socket is tried
 *     automatically). It is a real antivirus with signatures that update, and the only layer that recognises known malware.
 *  2. Built-in checks that need nothing installed. A policy document has no need for active content, so a PDF with JavaScript, launch
 *     actions or embedded files, or a Word file with macros, embedded objects, external templates or anything that is not a document, is
 *     refused. This also stops zip bombs, files that are really programs, and the EICAR test file.
 *
 * The built-in layer is not an antivirus: it refuses the ways a document is normally used to attack someone, and nothing more.
 * Set CLAMAV_REQUIRED=true to refuse uploads when ClamAV is not reachable, instead of falling back to the built-in checks alone.
 */
export interface ScanResult {
  ok: boolean;
  engine: 'clamav+built-in' | 'built-in';
  sha256: string;
  /** Present when the file was refused. `message` is written for the provider. */
  blocked?: { kind: 'malware' | 'active_content' | 'unsafe' | 'unavailable'; message: string; detail: string };
}

const EICAR = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
const MAX_DOCX_ENTRIES = 3000;
const MAX_DOCX_TOTAL = 60 * 1024 * 1024;
const MAX_DOCX_ENTRY = 30 * 1024 * 1024;
const MAX_RATIO = 150;

const block = (kind: NonNullable<ScanResult['blocked']>['kind'], message: string, detail: string): NonNullable<ScanResult['blocked']> => ({ kind, message, detail });
const ACTIVE_HELP = 'Save your policy as a plain PDF or a .docx file without macros, then upload it again.';

// ---------- ClamAV (clamd) ----------

function clamTarget(): { path: string } | { host: string; port: number } | null {
  if (process.env.CLAMAV_SOCKET) return { path: process.env.CLAMAV_SOCKET };
  if (process.env.CLAMAV_HOST) return { host: process.env.CLAMAV_HOST, port: Number(process.env.CLAMAV_PORT) || 3310 };
  for (const p of ['/var/run/clamav/clamd.ctl', '/run/clamav/clamd.ctl', '/var/run/clamd.scan/clamd.sock']) if (fs.existsSync(p)) return { path: p };
  return null;
}

/** Sends the file to clamd with its INSTREAM command. Resolves 'unavailable' if clamd is not there or does not answer. */
export function scanWithClamd(body: Buffer, target = clamTarget(), timeoutMs = 25_000): Promise<{ status: 'clean' | 'infected' | 'unavailable'; signature?: string }> {
  return new Promise((resolve) => {
    if (!target) return resolve({ status: 'unavailable' });
    const socket = net.createConnection(target as net.NetConnectOpts);
    let reply = '';
    let settled = false;
    const done = (r: { status: 'clean' | 'infected' | 'unavailable'; signature?: string }) => { if (!settled) { settled = true; socket.destroy(); resolve(r); } };
    socket.setTimeout(timeoutMs, () => done({ status: 'unavailable' }));
    socket.on('error', () => done({ status: 'unavailable' }));
    socket.on('data', (d) => { reply += d.toString('utf8'); });
    socket.on('end', () => {
      const text = reply.replace(/\0/g, '').trim();
      if (/\bOK$/.test(text)) return done({ status: 'clean' });
      const found = /: (.+) FOUND$/.exec(text);
      if (found) return done({ status: 'infected', signature: found[1] });
      done({ status: 'unavailable' }); // an error reply (for example the file is over clamd's size limit)
    });
    socket.on('connect', () => {
      socket.write('zINSTREAM\0');
      for (let i = 0; i < body.length; i += 64 * 1024) {
        const chunk = body.subarray(i, i + 64 * 1024);
        const len = Buffer.alloc(4);
        len.writeUInt32BE(chunk.length);
        socket.write(len);
        socket.write(chunk);
      }
      socket.write(Buffer.alloc(4)); // a zero-length chunk ends the stream
    });
  });
}

/** Is ClamAV running and answering? (the PING command). Used by the admin Operations page. */
export function clamdReachable(target = clamTarget()): Promise<boolean> {
  return new Promise((resolve) => {
    if (!target) return resolve(false);
    const socket = net.createConnection(target as net.NetConnectOpts);
    let reply = '';
    const done = (ok: boolean) => { socket.destroy(); resolve(ok); };
    socket.setTimeout(3000, () => done(false));
    socket.on('error', () => done(false));
    socket.on('data', (d) => { reply += d.toString('utf8'); });
    socket.on('end', () => done(/PONG/.test(reply)));
    socket.on('connect', () => socket.write('zPING\0'));
  });
}

// ---------- Built-in checks ----------

const looksLikeProgram = (b: Buffer) =>
  (b[0] === 0x4d && b[1] === 0x5a) || // Windows executable (MZ)
  (b[0] === 0x7f && b[1] === 0x45 && b[2] === 0x4c && b[3] === 0x46) || // Linux executable (ELF)
  (b[0] === 0xcf && b[1] === 0xfa && b[2] === 0xed && b[3] === 0xfe) || // macOS executable
  (b[0] === 0x23 && b[1] === 0x21); // a script with a #! line

/** PDF names may hide letters as #xx (for example /J#61vaScript), so those are decoded before looking for the dangerous ones. */
function scanPdf(body: Buffer): NonNullable<ScanResult['blocked']> | null {
  const text = body.toString('latin1').replace(/#([0-9a-fA-F]{2})/g, (_m, h) => String.fromCharCode(parseInt(h, 16)));
  const bad = /\/(JavaScript|JS|Launch|EmbeddedFile|EmbeddedFiles|RichMedia|GoToE|GoToR|SubmitForm|ImportData|XFA)\b/.exec(text);
  if (bad) return block('active_content', `This PDF contains active content (${bad[1]}), which a policy document does not need, so it was not accepted. ${ACTIVE_HELP}`, `pdf token ${bad[1]}`);
  return null;
}

function scanDocx(body: Buffer): NonNullable<ScanResult['blocked']> | null {
  let total = 0;
  let count = 0;
  let refused: string | null = null;
  const small = new Set<string>();
  let files: Record<string, Uint8Array>;
  try {
    // The filter looks at each entry's declared sizes before anything is unpacked, so a zip bomb is refused without being expanded.
    files = unzipSync(new Uint8Array(body), {
      filter: (f: UnzipFileInfo) => {
        count += 1;
        total += f.originalSize;
        if (count > MAX_DOCX_ENTRIES) refused = 'too many parts';
        else if (total > MAX_DOCX_TOTAL || f.originalSize > MAX_DOCX_ENTRY) refused = 'unpacks to an unreasonable size';
        else if (f.size > 0 && f.originalSize / f.size > MAX_RATIO && f.originalSize > 1024 * 1024) refused = 'is compressed far more than a document normally is';
        else if (/(^|\/)\.\.(\/|$)|^\/|\\/.test(f.name)) refused = 'has an unsafe file path';
        if (refused) throw new Error(refused);
        // Only the parts that are read for text or inspected are unpacked.
        const keep = /^(\[Content_Types\]\.xml|word\/document\.xml|word\/_rels\/.+\.rels|_rels\/\.rels)$/.test(f.name);
        if (keep) small.add(f.name);
        return keep;
      },
    });
  } catch (err) {
    return block('unsafe', `This file could not be opened safely (${refused ?? 'it is not a valid Word document'}). Please upload the original .docx or a PDF.`, `docx: ${refused ?? (err as Error).message}`);
  }
  // Names of every part are checked from the central directory, which unzipSync does not return for filtered-out parts: list them separately.
  const names: string[] = [];
  try { unzipSync(new Uint8Array(body), { filter: (f) => { names.push(f.name); return false; } }); } catch { /* already reported above */ }
  const dangerous = names.find((n) => /vbaProject|activeX|\/embeddings\/|oleObject|\.(exe|dll|com|scr|bat|cmd|js|jse|vbs|vbe|wsf|ps1|hta|lnk|msi|jar)$/i.test(n));
  if (dangerous) return block('active_content', `This Word file contains ${/vba/i.test(dangerous) ? 'macros' : 'embedded objects or programs'}, which a policy document does not need, so it was not accepted. ${ACTIVE_HELP}`, `docx part ${dangerous}`);
  const types = Buffer.from(files['[Content_Types].xml'] ?? new Uint8Array()).toString('utf8');
  if (!types.includes('wordprocessingml.document.main+xml')) return block('unsafe', 'This does not look like a normal Word document. Please upload the original .docx or a PDF.', 'docx content type');
  if (/macroEnabled|vbaProject/i.test(types)) return block('active_content', `This Word file allows macros, so it was not accepted. ${ACTIVE_HELP}`, 'docx macro content type');
  for (const [name, data] of Object.entries(files)) {
    if (!name.endsWith('.rels')) continue;
    const rels = Buffer.from(data).toString('utf8');
    const external = /<Relationship\b[^>]*Type="[^"]*\/(attachedTemplate|oleObject|oleLink|frame|subDocument|externalLink|aFChunk|package)"[^>]*>/i.exec(rels);
    if (external && /TargetMode="External"/i.test(external[0])) return block('active_content', `This Word file loads content from outside the document, so it was not accepted. ${ACTIVE_HELP}`, `docx external relationship in ${name}`);
  }
  return null;
}

export async function scanDocument(body: Buffer, type: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'): Promise<ScanResult> {
  const sha256 = createHash('sha256').update(body).digest('hex');
  const fail = (blocked: NonNullable<ScanResult['blocked']>, engine: ScanResult['engine'] = 'built-in'): ScanResult => ({ ok: false, engine, sha256, blocked });

  if (looksLikeProgram(body)) return fail(block('unsafe', 'This file is a program, not a document, so it was not accepted.', 'executable header'));
  if (body.includes(Buffer.from(EICAR))) return fail(block('malware', 'This file was refused because it was flagged as harmful (it is the standard antivirus test file).', 'EICAR test file'));

  const clam = await scanWithClamd(body);
  if (clam.status === 'infected') return fail(block('malware', 'This file was refused because our virus scan flagged it as harmful. Please check the file on your own computer and upload a clean copy.', `ClamAV: ${clam.signature}`), 'clamav+built-in');
  if (clam.status === 'unavailable' && process.env.CLAMAV_REQUIRED === 'true') {
    return fail(block('unavailable', 'We cannot scan documents just now, so uploads are paused. Please try again later.', 'ClamAV required but not reachable'));
  }

  const structural = type === 'application/pdf' ? scanPdf(body) : scanDocx(body);
  if (structural) return fail(structural, clam.status === 'clean' ? 'clamav+built-in' : 'built-in');
  return { ok: true, engine: clam.status === 'clean' ? 'clamav+built-in' : 'built-in', sha256 };
}
