// The founder's toolkit (Alexandru, 2 Nov 2026): free tools for a full
// account. Each tool lives at its own address on linktolead.exploraself.com
// and is listed on the Tools page (/tools/) by the four domains.
//
// Keys are the page addresses. The same keys and names are in
// public/tools/tools-data.js (a test holds them equal).
//
// Mailchimp: the tag "TOOLS" (Alexandru's name, 2 Nov 2026), sent the first
// time a founder opens each tool or starts the 12 days. Tags only add up, so
// sending it again is harmless; API mode only, and only with consent
// (functions/_mailchimp.js syncFounder keeps those rules).

import { now } from './_shared.js';
import { syncFounder } from './_mailchimp.js';

export const TOOLS_TAG = 'TOOLS';

/** Every tool, in the order of the Tools page. */
export const TOOL_LIST = {
  'runway': { name: 'Cash runway', domain: 'Lead your business' },
  'bottleneck': { name: 'The bottleneck test', domain: 'Lead your people' },
  'off-switch': { name: 'The off-switch check', domain: 'Lead yourself' },
  '12-days': { name: '12 Days to Start Winning', domain: 'Lead yourself' },
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
