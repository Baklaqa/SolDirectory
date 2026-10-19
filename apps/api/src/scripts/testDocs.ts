import { strToU8, zipSync } from 'fflate';

/** Documents built in code for the upload tests: real PDF and Word files, a complete policy, a policy with gaps, and files that must be refused. */

export const POLICY_GOOD = `Incident and Complaints Management Policy. Version 2.1. Approved by the Chief Executive Officer. Next review date: 1 July 2027.
Purpose. This policy explains how we handle complaints and incidents. We are a registered NDIS provider.
Complaints. Anyone can make a complaint, including anonymously, or through an advocate, a support person or a family member on their behalf. A complaint can be made by phone, email, in writing or in person, and we provide interpreters and easy read formats. Our Complaints Officer is responsible for receiving and handling complaints. We acknowledge every complaint within 2 business days and aim to resolve it within 21 days. We keep the person who complained informed about progress and tell them the outcome and the reasons for the decision in writing, and how to ask for a review. Complaints are handled fairly and impartially, using procedural fairness, including for any worker the complaint is about. Complaints are handled in a way that respects privacy and confidentiality. A person can also take a complaint to the NDIS Quality and Safeguards Commission at any time. We record every complaint, the action taken and the outcome in a complaints register. We review this complaints process every year and use lessons learnt to improve.
Incidents. A reportable incident is a serious incident such as the death of a person with disability, serious injury, abuse or neglect, unlawful sexual or physical contact or sexual misconduct, or unauthorised use of a restrictive practice. When an incident happens our first step is immediate action to make sure the person is safe and to get emergency or medical help. Our Incident Manager is responsible for managing incidents and workers report any incident to their supervisor straight away. We notify the NDIS Quality and Safeguards Commission of reportable incidents within 24 hours, and of an unauthorised restrictive practice within 5 business days. Every incident is recorded in the incident register. We investigate the root cause and take corrective action to prevent it happening again. We inform the person affected and their family or guardian and support them. All workers receive training on this policy at induction.`;

export const POLICY_GAPS = `Our service values. We are a friendly team who support people in their homes and in the community. We believe in kindness, respect and doing things the right way. Every worker wears a name badge and arrives on time. We keep a tidy workplace and we offer a range of supports including cleaning, shopping, meal preparation and getting to appointments. If you are unhappy about something, please tell your support worker or call the office and we will try to fix it as soon as we can. Our office is open on weekdays and we answer the telephone during those hours. We love hearing about the good things our team does, and our workers enjoy their jobs. We are proud of the long relationships we have built with the families we support, and we hope to keep growing over the coming years while staying true to who we are.`;

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

/** A small but valid PDF whose text can be read back. `extra` is added inside the page dictionary or catalog to build unsafe variants. */
export function makePdf(text: string, extra = ''): Buffer {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += 12) lines.push(words.slice(i, i + 12).join(' '));
  const perPage = 48;
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += perPage) pages.push(lines.slice(i, i + perPage));
  const objs: string[] = [];
  objs.push(`<< /Type /Catalog /Pages 2 0 R ${extra} >>`);
  objs.push(`<< /Type /Pages /Kids [${pages.map((_, i) => `${5 + i * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`);
  objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objs.push('<< >>');
  pages.forEach((p, i) => {
    const stream = `BT /F1 10 Tf 40 780 Td 12 TL ${p.map((l) => `(${esc(l)}) Tj T*`).join(' ')} ET`;
    objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${6 + i * 2} 0 R >>`);
    objs.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });
  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  objs.forEach((o, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

const CONTENT_TYPES = (main = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml') =>
  `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="${main}"/></Types>`;

/** A valid .docx. `parts` adds or overrides parts to build unsafe variants. */
export function makeDocx(text: string, parts: Record<string, string | Uint8Array> = {}, contentType?: string): Buffer {
  const paras = text.split(/\n+/).map((p) => `<w:p><w:r><w:t xml:space="preserve">${p.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</w:t></w:r></w:p>`).join('');
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(CONTENT_TYPES(contentType)),
    '_rels/.rels': strToU8('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'),
    'word/document.xml': strToU8(`<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paras}</w:body></w:document>`),
  };
  for (const [name, data] of Object.entries(parts)) files[name] = typeof data === 'string' ? strToU8(data) : data;
  return Buffer.from(zipSync(files));
}

export const EICAR_FILE = Buffer.from('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*');
