// The Growth Toolkit (Alexandru, 2 Nov 2026): free tools in two lists,
// Personal leadership and Business. Each tool lives at its own address on
// linktolead.exploraself.com and is listed on the Tools page (/tools/).
//
// Who opens it: anyone with an account, at once. Anyone without one asks for
// a code, gets their own 6-digit code by email, types it in and gets a pass
// kept in their browser. Addresses on Alexandru's list skip the code:
// TOOLKIT_EMAILS (comma separated, in the Cloudflare settings) and the team.
//
// Keys are the page addresses. The same keys and names are in
// public/tools/tools-data.js (a test holds them equal).
//
// Mailchimp: the tag "TOOLS" (Alexandru's name, 2 Nov 2026), sent the first
// time a founder opens each tool or starts the 12 days. Tags only add up, so
// sending it again is harmless; API mode only, and only with consent
// (functions/_mailchimp.js syncFounder keeps those rules).

import { now, newToken, sha256 } from './_shared.js';
import { syncFounder } from './_mailchimp.js';
import { isTeam } from './_team.js';

export const TOOLS_TAG = 'TOOLS';

/** Every tool, in the order of the Tools page. */
export const TOOL_LIST = {
  'runway': { name: 'Cash runway', domain: 'Lead your business' },
  'bottleneck': { name: 'The bottleneck test', domain: 'Lead your people' },
  'off-switch': { name: 'The off-switch check', domain: 'Lead yourself' },
  '12-days': { name: '12 Days to Start Winning', domain: 'Lead yourself' },
  'teleprompter': { name: 'Teleprompter', domain: 'Lead the market' },
};
export const isTool = (k) => Object.hasOwn(TOOL_LIST, k);
export const toolNames = (csv) => String(csv || '').split(',').filter(isTool).map((k) => TOOL_LIST[k].name);

/** Log that a founder opened a tool; the first time for this tool, tag them
 *  TOOLS in Mailchimp (after the reply when the platform allows it). */
export async function opened(env, D, studentId, tool, waitUntil) {
  const before = await D.prepare("SELECT 1 AS x FROM event WHERE student_id = ? AND kind = 'tool-open' AND detail = ? LIMIT 1").bind(studentId, tool).first();
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(studentId, 'tool-open', now(), tool).run();
  if (before) return false;
  const job = syncFounder(env, D, studentId, 'tag', { tag: TOOLS_TAG }).catch(() => {});
  if (typeof waitUntil === 'function') waitUntil(job); else await job;
  return true;
}

// ── Access without an account ────────────────────────────────────────────────
export const TOOLKIT_NAME = 'Growth Toolkit';
/** A code works for 30 days, and only 5 wrong tries in a row. */
export const CODE_DAYS = 30;
export const CODE_TRIES = 5;
const norm = (e) => String(e || '').trim().toLowerCase();

/** On Alexandru's list: no code needed. */
export function skipsCode(email, env) {
  const e = norm(email);
  if (!e) return false;
  const list = String((env && env.TOOLKIT_EMAILS) || '').split(',').map(norm).filter(Boolean);
  return list.includes(e) || isTeam(e, env);
}

/** Six digits, never starting with 0, from crypto randomness. */
export function newCode() {
  const b = new Uint32Array(1);
  crypto.getRandomValues(b);
  return String(100000 + (b[0] % 900000));
}
export const codeHash = (email, code) => sha256(`toolkit|${norm(email)}|${String(code).trim()}`);
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
