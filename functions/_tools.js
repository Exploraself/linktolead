// The Growth Toolkit (Alexandru, 2 Nov 2026): free tools in two lists,
// Personal leadership and Business. Each tool lives at its own address on
// linktolead.exploraself.com and is listed on the Tools page (/tools/).
//
// Who opens it: anyone with an account, at once. Anyone without one asks for
// the code by email, types it in and gets a pass kept in their browser. The
// code is one 4-digit code for everybody (Alexandru, 2 Nov 2026: passing it
// on is fine), TOOLKIT_CODE in the Cloudflare settings, 5689 by default. Addresses on Alexandru's list skip the code:
// TOOLKIT_EMAILS (comma separated, in the Cloudflare settings) and the team.
//
// Keys are the page addresses. The same keys and names are in
// public/tools/tools-data.js (a test holds them equal).
//
// Mailchimp: the tag "Growth Toolkit" (Alexandru's name, 2 Nov 2026; it
// replaced "TOOLS"), sent the first time a founder opens each tool or starts
// the 12 days. Tags only add up, so sending it again is harmless; API mode
// only, and only with consent (functions/_mailchimp.js syncFounder keeps
// those rules).
//
// The welcome ("Welcome to the Growth Toolkit", functions/_letters.js
// toolsWelcome): once per address (Alexandru, 2 Nov 2026), and only with
// their yes to letters. An account made from a toolkit page gets it at
// sign-up; any other account taps "Yes, that's me" the first time it opens
// the toolkit (public/tools/gate.js), which also adds the "Growth Toolkit"
// tag; someone without an account gets it once their code lets them in.

import { now, newToken, sha256 } from './_shared.js';
import { syncFounder } from './_mailchimp.js';
import { isTeamMember } from './_team.js';
import { send, mailState } from './_mail.js';
import { toolsWelcome } from './_letters.js';
import { letterContext } from './_mentor.js';
import { unsubLink, claimWelcome } from './_account.js';

export const TOOLS_TAG = 'Growth Toolkit';

/** Every tool, in the order of the Tools page. */
export const TOOL_LIST = {
  'runway': { name: 'Cash runway', domain: 'Lead your business' },
  'bottleneck': { name: 'The bottleneck test', domain: 'Lead your people' },
  'off-switch': { name: 'The off-switch check', domain: 'Lead yourself' },
  '12-days': { name: '12 Days to Start Winning', domain: 'Lead yourself' },
  'teleprompter': { name: 'Teleprompter', domain: 'Lead the market' },
  'reel-structure': { name: 'Reel structure', domain: 'Lead the market' },
  'branding-structure': { name: 'Branding structure', domain: 'Lead the market' },
};
export const isTool = (k) => Object.hasOwn(TOOL_LIST, k);
export const toolNames = (csv) => String(csv || '').split(',').filter(isTool).map((k) => TOOL_LIST[k].name);

/** Log that a founder opened a tool; the first time for this tool, tag them
 *  "Growth Toolkit" in Mailchimp (after the reply when the platform allows it). */
export async function opened(env, D, studentId, tool, waitUntil) {
  const before = await D.prepare("SELECT 1 AS x FROM event WHERE student_id = ? AND kind = 'tool-open' AND detail = ? LIMIT 1").bind(studentId, tool).first();
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(studentId, 'tool-open', now(), tool).run();
  if (before) return false;
  const job = syncFounder(env, D, studentId, 'tag', { tag: TOOLS_TAG }).catch(() => {});
  if (typeof waitUntil === 'function') waitUntil(job); else await job;
  return true;
}

// ── The welcome, once per address ───────────────────────────────────────────
export { claimWelcome };
const WELCOME_WHY = 'You opened the Growth Toolkit at linktolead.exploraself.com with your free ExploraSelf account.';
const PASS_WHY = 'You opened the Growth Toolkit at linktolead.exploraself.com with your code.';

/** Has this address opened the toolkit before (confirmed, or welcomed)? */
export async function toolkitConfirmed(D, email) {
  await D.prepare('CREATE TABLE IF NOT EXISTS toolkit_welcome (email TEXT PRIMARY KEY, sent_at TEXT NOT NULL, how TEXT)').run();
  return !!(await D.prepare('SELECT 1 AS x FROM toolkit_welcome WHERE email = ?').bind(norm(email)).first());
}

/** An account confirmed "Yes, that's me" on the toolkit (Alexandru, 2 Nov
 *  2026): once per address, the "Growth Toolkit" tag in Mailchimp, and with
 *  their yes to letters, the welcome letter. `tool` is the tool they came
 *  for ('' for the Tools page). Sent after the reply when the platform
 *  allows it. Returns true when this call confirmed them. */
export async function welcomeOnce(env, D, base, me, { tool = '', tz = '', waitUntil } = {}) {
  if (!me || !me.email) return false;
  if (!(await claimWelcome(D, me.email, tool ? `tool:${tool}` : 'tools-page'))) return false;
  const p = await D.prepare('SELECT consent, unsubscribed, unsub_id, interest FROM student_profile WHERE student_id = ?').bind(me.id).first();
  const job = (async () => {
    await syncFounder(env, D, me.id, 'tag', { tag: TOOLS_TAG }).catch(() => {});
    if (!p || !p.consent || p.unsubscribed || !mailState(env).ready) {
      await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, 'toolkit-confirmed', now(), tool || 'tools').run();
      return;
    }
    const ctx = await letterContext(D, me.id, tz);
    const first = String(me.name || '').trim().split(/\s+/)[0] || '';
    const r = await send(env, { to: me.email, ...toolsWelcome(base, { first, to: me.email, tool, interest: p.interest || '', path: tool ? `/${tool}/` : '/tools/', ...ctx }),
      why: WELCOME_WHY, unsubUrl: unsubLink(base, p) });
    // A failed send gives the claim back, so the next visit tries again.
    if (!r.ok) await D.prepare('DELETE FROM toolkit_welcome WHERE email = ?').bind(norm(me.email)).run();
    await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, r.ok ? 'toolkit-welcome' : 'toolkit-welcome-failed', now(), tool || 'tools').run();
  })().catch(() => {});
  if (typeof waitUntil === 'function') waitUntil(job); else await job;
  return true;
}

/** Someone without an account got in with their code (or is on the list):
 *  the welcome, once per address, if they said yes to letters when they
 *  asked for the code. No account, so "Ask your mentor" means a reply. */
export async function passWelcome(env, D, base, email, { tz = '', tool = '', waitUntil } = {}) {
  const row = await D.prepare('SELECT first, consent FROM toolkit_access WHERE email = ?').bind(norm(email)).first();
  if (!row || !row.consent || !mailState(env).ready) return false;
  if (!(await claimWelcome(D, email, 'code'))) return false;
  const job = (async () => {
    const r = await send(env, { to: norm(email), ...toolsWelcome(base, { first: row.first || '', to: norm(email), tool: isTool(tool) ? tool : '', path: isTool(tool) ? `/${tool}/` : '/tools/', account: false, tz }),
      why: PASS_WHY });
    if (!r.ok) await D.prepare('DELETE FROM toolkit_welcome WHERE email = ?').bind(norm(email)).run();
  })().catch(() => {});
  if (typeof waitUntil === 'function') waitUntil(job); else await job;
  return true;
}

// ── Access without an account ────────────────────────────────────────────────
export const TOOLKIT_NAME = 'Growth Toolkit';
/** One code for everybody (Alexandru, 2 Nov 2026). Change it in Cloudflare
 *  (TOOLKIT_CODE) without touching the code. */
export const TOOLKIT_CODE = '5689';
export const toolkitCode = (env) => String((env && env.TOOLKIT_CODE) || TOOLKIT_CODE).trim();
const norm = (e) => String(e || '').trim().toLowerCase();

/** On Alexandru's list, or on the team: no code needed. */
export async function skipsCode(email, env, D) {
  const e = norm(email);
  if (!e) return false;
  const list = String((env && env.TOOLKIT_EMAILS) || '').split(',').map(norm).filter(Boolean);
  return list.includes(e) || (await isTeamMember(D, e, env));
}

export const passHash = (pass) => sha256(`toolkit-pass|${pass}`);

export async function accessTable(D) {
  await D.prepare(`CREATE TABLE IF NOT EXISTS toolkit_access (email TEXT PRIMARY KEY, first TEXT, consent INTEGER DEFAULT 0,
    code_hash TEXT, code_at INTEGER, tries INTEGER DEFAULT 0, pass_hash TEXT, created_at TEXT NOT NULL, opened_at TEXT)`).run();
}

/** A pass for this email: kept only as a hash; the browser keeps the pass. */
export async function issuePass(D, email) {
  const pass = newToken();
  await D.prepare('UPDATE toolkit_access SET pass_hash = ?, opened_at = ?, code_hash = NULL, tries = 0 WHERE email = ?').bind(await passHash(pass), now(), norm(email)).run();
  return pass;
}

export async function passOk(D, pass) {
  if (typeof pass !== 'string' || pass.length < 20) return false;
  return !!(await D.prepare('SELECT 1 AS x FROM toolkit_access WHERE pass_hash = ?').bind(await passHash(pass)).first());
}
