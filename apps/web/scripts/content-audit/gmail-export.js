/**
 * Copies the COMPLETE text of "On-Page SEO Audit" emails out of Gmail, so you can paste them somewhere (a chat, a file).
 * Nothing leaves your browser: it only reads what Gmail has already loaded and puts it on your clipboard and in a .txt download.
 *
 * How to use
 *   1. Open Gmail in Chrome and either
 *        a. open ONE email (the whole message on screen), or
 *        b. open a search result list, e.g.  from:sol963472@gmail.com  "On-Page SEO Audit"  (it walks the rows on the page).
 *   2. Press F12 (or Ctrl+Shift+J) to open the Console, paste this whole file, press Enter.
 *   3. Wait for "Done" in the console (about 1 second per email). The text is on your clipboard and also saved as a file
 *      called sol-audits-<date>.txt in your Downloads. Paste it into the chat.
 *
 * Settings
 *   LIMIT   how many emails to take from a list (Gmail shows 50 per page; use the "older" arrow for the next page).
 *   MARK    set to true to also mark each one as read as it is opened (opening an email already does that in Gmail).
 */
(async () => {
  const LIMIT = 50;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const tidy = (t) => t.replace(/ /g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  const shown = (el) => el.offsetParent !== null;

  const subject = () => (document.querySelector('h2.hP') || {}).innerText || document.title;
  /** Every expanded message body on screen (a thread can hold several), top to bottom. */
  const bodies = () => [...document.querySelectorAll('.a3s')].filter(shown).map((e) => tidy(e.innerText)).filter(Boolean);
  const listRows = () => [...document.querySelectorAll('tr.zA')].filter(shown);
  const isThreadOpen = () => bodies().length > 0;

  async function untilBody(timeout = 9000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      if (isThreadOpen()) { await wait(400); return true; } // let the rest of a long message finish rendering
      await wait(150);
    }
    return false;
  }
  async function untilList(timeout = 9000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      if (listRows().length && !isThreadOpen()) { await wait(250); return true; }
      await wait(150);
    }
    return false;
  }

  const out = [];
  const add = (subj, texts) => out.push(`===== ${subj} =====\n${texts.join('\n\n')}`);

  if (isThreadOpen()) {
    add(subject(), bodies());
  } else {
    const total = Math.min(LIMIT, listRows().length);
    if (!total) { console.warn('No open email and no list on screen. Open an email or a search result list first.'); return; }
    for (let i = 0; i < total; i += 1) {
      const row = listRows()[i];
      if (!row) break;
      const cell = row.querySelector('td.xY .bog') || row.querySelector('.bog') || row;
      cell.click();
      if (!(await untilBody())) { out.push(`===== (could not open row ${i + 1}) =====`); continue; }
      add(subject(), bodies());
      console.log(`${i + 1}/${total}`, subject());
      history.back();
      if (!(await untilList())) break;
    }
  }

  const text = out.join('\n\n\n');
  try { await navigator.clipboard.writeText(text); } catch {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  a.download = `sol-audits-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a); a.click(); a.remove();
  console.log(`Done: ${out.length} email(s), ${text.length} characters copied to the clipboard and saved as ${a.download}.`);
})();
