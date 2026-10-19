import { unzipSync } from 'fflate';

/**
 * Reads an incident and complaints policy and lists the points a policy of this kind is expected to cover, with what was found and
 * what was not. The points come from the NDIS Commission's own requirements:
 *  - the NDIS (Complaints Management and Resolution) Rules 2018, Part 2, and the Commission's Effective Complaints Handling Guidelines
 *    (an accessible process open to anyone including anonymously; acknowledged, assessed and resolved fairly and in a timely way; the
 *    person kept informed and involved; procedural fairness; records; periodic review; privacy; how to contact the Commission);
 *  - the NDIS (Incident Management and Reportable Incidents) Rules 2018 and the Commission's reportable incidents guidance
 *    (what a reportable incident is; notifying the Commission within 24 hours for a death, serious injury, abuse or neglect, unlawful
 *    sexual or physical contact or sexual misconduct, and within 5 business days for unauthorised use of a restrictive practice).
 *
 * It looks for the words a policy would use, so it is a guide to spot gaps, not a legal review: a point written in unusual wording can be
 * reported missing, and a point mentioned in passing can be reported found. It never approves or rejects a policy on its own.
 * It reads the file's text only; it cannot read text that is part of a picture (a scanned page).
 */
export interface PolicyPoint {
  key: string;
  group: 'Complaints' | 'Incidents' | 'The policy itself';
  /** Plain name of the point. */
  label: string;
  /** What to add if it is missing, in plain words. */
  advice: string;
  /** Required by the rules (true) or good practice the Commission recommends (false). */
  essential: boolean;
  /** Passes when this returns true for the policy's text. */
  test: (text: string) => boolean;
}

const has = (re: RegExp) => (t: string) => re.test(t);
const all = (...res: RegExp[]) => (t: string) => res.every((r) => r.test(t));

export const POLICY_POINTS: PolicyPoint[] = [
  { key: 'c_how', group: 'Complaints', essential: true, label: 'How to make a complaint',
    advice: 'Say how a person can make a complaint (for example by phone, email, in writing or in person), and that it is easy to do.',
    test: all(/complain/i, /(phone|telephone|email|e-mail|in person|in writing|verbal\w*|written|online|form)/i) },
  { key: 'c_who', group: 'Complaints', essential: true, label: 'Who handles complaints',
    advice: 'Name the role responsible for receiving and handling complaints (for example the manager or a complaints officer).',
    test: has(/(complaints?|feedback)\s+(officer|manager|coordinator|contact|person|team|handler|lead)|responsible for\s+(receiving\s+|handling\s+|managing\s+|investigating\s+)?(and\s+\w+\s+)?complaints?|(manager|director|ceo|coordinator|officer|supervisor)[^.\n]{0,80}complaints?/i) },
  { key: 'c_timely', group: 'Complaints', essential: true, label: 'How quickly complaints are acknowledged and resolved',
    advice: 'Give timeframes, for example that a complaint is acknowledged within a set number of days and how long resolution should take.',
    test: has(/acknowledg\w*[^.\n]{0,100}(within|in)\s+(\d+|one|two|three|four|five|seven|ten|twenty|24)|(within|in)\s+(\d+|one|two|three|four|five|seven|ten|twenty[- ]?four|twenty)\s*(\(\d+\)\s*)?(hours?|business days?|working days?|days?|weeks?)[^.\n]{0,160}(complaint|acknowledg|respon|resol)|(resolv\w*|respon\w*|resolution)[^.\n]{0,100}within/i) },
  { key: 'c_informed', group: 'Complaints', essential: true, label: 'Keeping the person informed',
    advice: 'Say the person who complained, and anyone affected, is kept informed and involved, told the outcome and the reasons, and told how to ask for a review.',
    test: has(/(keep|kept|keeping|inform\w*|update\w*|advis\w*|notif\w*|involv\w*)[^.\n]{0,100}(complainant|person (making|who made|raising)|progress|outcome|decision|affected person)|(outcome|decision|result)[^.\n]{0,80}(complainant|in writing|explain|reasons?)/i) },
  { key: 'c_external', group: 'Complaints', essential: true, label: 'How to contact the NDIS Commission',
    advice: 'Tell people they can take a complaint to the NDIS Quality and Safeguards Commission, and how to contact it.',
    test: all(/complain/i, /ndis (quality (and|&) safeguards )?commission|\bthe commission\b/i) },
  { key: 'c_records', group: 'Complaints', essential: true, label: 'Keeping records of complaints',
    advice: 'Say that every complaint, the action taken and the outcome are recorded (for example in a complaints register).',
    test: has(/(complaints?|incidents?)\s+(register|record|log|database|system)|(record\w*|document\w*|log\w*|register\w*)[^.\n]{0,80}(all\s+)?complaints?/i) },
  { key: 'c_access', group: 'Complaints', essential: false, label: 'Anonymous complaints and help to complain',
    advice: 'Say anyone can complain, including anonymously or through an advocate, support person or family member, and that help is available (interpreters, accessible formats).',
    test: has(/anonym|on behalf of|advocate|advocacy|support person|interpreter|accessible format|easy read/i) },
  { key: 'c_fair', group: 'Complaints', essential: false, label: 'A fair process',
    advice: 'Say complaints are handled fairly and without bias (procedural fairness), including for any worker the complaint is about.',
    test: has(/procedural fairness|natural justice|impartial|without bias|unbiased|right to respond|fair(ly)?\s+(and|,)\s+(impartial|objective|transparent)/i) },
  { key: 'c_privacy', group: 'Complaints', essential: false, label: 'Privacy and confidentiality',
    advice: 'Say complaints are handled in a way that respects privacy and confidentiality.',
    test: has(/privacy|confidential/i) },
  { key: 'c_review', group: 'Complaints', essential: false, label: 'Reviewing the complaints process',
    advice: 'Say the process is reviewed regularly (the Commission recommends at least once a year) and that complaints are used to improve the service.',
    test: has(/(review\w*|assess\w*)[^.\n]{0,80}(annual\w*|yearly|every (year|12 months)|regular\w*|periodic\w*)|(annual\w*|yearly|periodic\w*|regular\w*)\s+review|continuous improvement|lessons learn\w*|systemic/i) },

  { key: 'i_define', group: 'Incidents', essential: true, label: 'What an incident is',
    advice: 'Say what counts as an incident and as a reportable incident.',
    test: has(/reportable incidents?|serious incidents?|incident means|definition of (an )?incident|what is an incident|an incident is/i) },
  { key: 'i_notify', group: 'Incidents', essential: true, label: 'Reporting reportable incidents to the NDIS Commission',
    advice: 'Say reportable incidents are notified to the NDIS Quality and Safeguards Commission, and who does this.',
    test: has(/(notify|notif\w+|report\w*|lodg\w+)[^.\n]{0,140}(ndis (quality (and|&) safeguards )?commission|the commission)|(ndis (quality (and|&) safeguards )?commission|the commission)[^.\n]{0,140}(notify|notif\w+|report\w*|lodg\w+)/i) },
  { key: 'i_time', group: 'Incidents', essential: true, label: 'The reporting timeframes',
    advice: 'State the timeframes: a death, serious injury, abuse or neglect, unlawful sexual or physical contact, or sexual misconduct is reported to the Commission within 24 hours, and unauthorised use of a restrictive practice within 5 business days. Check the Commission’s current guidance.',
    test: all(/24\s*[- ]?hours?|twenty[- ]four\s*hours?/i, /\b(5|five)\s*(\(5\)\s*)?(business|working)\s*days?/i) },
  { key: 'i_immediate', group: 'Incidents', essential: true, label: 'Immediate action to keep people safe',
    advice: 'Say what staff do straight away: make sure the person is safe, get medical or emergency help, and stop the harm.',
    test: has(/immediate\w*|first aid|emergency|triple zero|\b000\b|ensur\w*[^.\n]{0,60}\bsafe\w*|safety of|medical (attention|help|assistance)/i) },
  { key: 'i_prevent', group: 'Incidents', essential: true, label: 'Investigating and preventing a repeat',
    advice: 'Say incidents are investigated, the causes are looked at, and action is taken to stop it happening again.',
    test: has(/investigat\w+|root cause|corrective action|preventive action|prevent\w*\s+(it\s+)?(from\s+)?(happening|recurr\w*|re-occurr\w*)|prevent\w*\s+(future|further|similar)|lessons learn\w*/i) },
  { key: 'i_roles', group: 'Incidents', essential: true, label: 'Who is responsible for incidents',
    advice: 'Name the role responsible for managing and reporting incidents, and who staff report an incident to.',
    test: has(/(incident|reportable incident)s?\s+(manager|officer|coordinator|lead|contact)|responsib\w+[^.\n]{0,100}incidents?|(manager|director|ceo|coordinator|supervisor|team leader)[^.\n]{0,100}incidents?|report\w*[^.\n]{0,60}(to your|to the|to a)\s+(manager|supervisor|team leader|coordinator)/i) },
  { key: 'i_record', group: 'Incidents', essential: false, label: 'Recording incidents',
    advice: 'Say every incident is recorded (for example in an incident register or on an incident form).',
    test: has(/incident\s+(register|record|report|form|log)|(record\w*|document\w*|log\w*)[^.\n]{0,80}incidents?/i) },
  { key: 'i_inform', group: 'Incidents', essential: false, label: 'Telling the person and their family',
    advice: 'Say the person affected, and their family, guardian or nominee where appropriate, are told about the incident and supported.',
    test: has(/(family|guardian|carer|nominee|representative|next of kin|support person)[^.\n]{0,120}(inform\w*|notif\w*|contact\w*|advis\w*)|(inform\w*|notif\w*|contact\w*|advis\w*)[^.\n]{0,120}(family|guardian|carer|nominee|representative|next of kin)/i) },

  { key: 'p_training', group: 'The policy itself', essential: false, label: 'Worker training and awareness',
    advice: 'Say workers are trained in, and aware of, how to handle complaints and report incidents.',
    test: has(/\btrain\w+|induction|orientation|made aware|awareness/i) },
  { key: 'p_control', group: 'The policy itself', essential: false, label: 'Version, approval and review date',
    advice: 'Add a version number, who approved the policy, and the date it was approved and is due for review.',
    test: has(/review date|next review|date of review|last reviewed|reviewed on|date (approved|reviewed)|approved by|effective date|policy owner|version\s*[:\d]|\bv\d+(\.\d+)?\b/i) },
];

export interface PolicyReview {
  status: 'ok' | 'gaps' | 'unreadable';
  readAt: Date;
  /** Words found in the file; 0 when it could not be read. */
  words: number;
  found: string[];
  missing: { key: string; label: string; advice: string; essential: boolean }[];
  /** Why the file could not be read, in words for the provider. */
  note?: string;
}

const MIN_WORDS = 120;

export function reviewPolicyText(text: string, now = new Date()): PolicyReview {
  const clean = text.replace(/\s+/g, ' ').trim();
  const words = clean ? clean.split(' ').length : 0;
  if (words < MIN_WORDS) {
    return {
      status: 'unreadable', readAt: now, words, found: [], missing: [],
      note: words === 0
        ? 'We could not read any text in this file. It may be a scan or a photo of a page. Please upload a PDF or Word file that was saved from a document, not scanned.'
        : 'We could only read a very short amount of text in this file, so we could not check it. If it is a scan, please upload a text-based PDF or Word file.',
    };
  }
  const found: string[] = [];
  const missing: PolicyReview['missing'] = [];
  for (const p of POLICY_POINTS) {
    if (p.test(clean)) found.push(p.key);
    else missing.push({ key: p.key, label: p.label, advice: p.advice, essential: p.essential });
  }
  return { status: missing.some((m) => m.essential) ? 'gaps' : 'ok', readAt: now, words, found, missing };
}

// ---------- Reading the text out of the file ----------

const MAX_PDF_PAGES = 60;
const MAX_TEXT_CHARS = 400_000;

async function pdfText(body: Buffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({
    data: new Uint8Array(body),
    isEvalSupported: false, // never run code from a font (the cause of CVE-2024-4367)
    disableFontFace: true,
    useSystemFonts: false,
    useWorkerFetch: false,
    verbosity: 0,
  }).promise;
  try {
    let out = '';
    for (let i = 1; i <= Math.min(doc.numPages, MAX_PDF_PAGES) && out.length < MAX_TEXT_CHARS; i += 1) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      out += `${content.items.map((it) => ('str' in it ? it.str : '')).join(' ')}\n`;
      page.cleanup();
    }
    return out;
  } finally {
    await doc.destroy();
  }
}

function docxText(body: Buffer): string {
  const files = unzipSync(new Uint8Array(body), { filter: (f) => f.name === 'word/document.xml' && f.originalSize < 30 * 1024 * 1024 });
  const xml = Buffer.from(files['word/document.xml'] ?? new Uint8Array()).toString('utf8');
  return xml
    .replace(/<w:tab\/>/g, ' ').replace(/<\/w:p>/g, '\n').replace(/<w:br\/>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .slice(0, MAX_TEXT_CHARS);
}

/** Reads and reviews a policy file. Never throws: a file that cannot be read comes back as "unreadable" with a note. Gives up after 20 seconds. */
export async function reviewPolicyFile(body: Buffer, type: string): Promise<PolicyReview> {
  const unreadable = (note: string): PolicyReview => ({ status: 'unreadable', readAt: new Date(), words: 0, found: [], missing: [], note });
  try {
    const text = await Promise.race([
      type === 'application/pdf' ? pdfText(body) : Promise.resolve(docxText(body)),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 20_000)),
    ]);
    return reviewPolicyText(text);
  } catch (err) {
    const msg = (err as Error).message ?? '';
    return unreadable(/password|encrypt/i.test(msg)
      ? 'This file is password protected, so we could not read it. Please upload a copy without a password.'
      : 'We could not read this file. Please try saving it again as a PDF or .docx and upload it again.');
  }
}

/** Text for the provider: the points not yet covered, essential ones first. */
export function summariseMissing(review: PolicyReview, max = 4): string {
  const essential = review.missing.filter((m) => m.essential);
  const shown = essential.slice(0, max).map((m) => m.label.toLowerCase());
  const more = essential.length - shown.length;
  return `${shown.join('; ')}${more > 0 ? `; and ${more} more` : ''}`;
}
