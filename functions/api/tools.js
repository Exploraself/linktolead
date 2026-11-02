// The free tools (/tools/, Alexandru, 2 Nov 2026): Cash runway, The
// bottleneck test, The off-switch check, and 12 Days to Start Winning.
//
// A tool needs a full free account: the same universal rule as everywhere
// (missingOf in functions/_profile.js). The page asks for what is missing
// before a tool opens; this route refuses anything else, so the rule holds
// even for a page that skips it.
//
// GET  ?t=<token>  what this founder has used (tool, kind, when), and their
//                  12 Days (with the twelve principles, once subscribed)
// POST { token, tool, event, result? }
//   event 'open'       they opened a tool (passed the access step)
//   event 'result'     they reached its result; `result` is kept as JSON:
//                      their own answers and the sums made from them
//   event 'subscribe'  12 Days to Start Winning: subscribed once, and the
//                      welcome letter goes at once (functions/_twelve-days.js)
// The first time a founder opens each tool, or subscribes, Mailchimp gets the
// tag TOOLS (API mode, with consent; tags only accumulate). /mentor shows it all.

import { json, bad, db, now, clean, accountTables, studentBy } from '../_shared.js';
import { missingOf } from '../_profile.js';
import { syncFounder, TOOLS_TAG } from '../_mailchimp.js';
import { keepTz } from '../_mentor.js';
import { origin } from '../_mail.js';
import { subscribe, subscription, lettersOn, PRINCIPLES, LAST_DAY } from '../_twelve-days.js';

/** The tools, by the id each page sends: the same ids and names as
 *  public/tools/catalog.js (a test holds them equal). */
export const TOOL_NAMES = {
  'off-switch': 'The off-switch check',
  'twelve-days': '12 Days to Start Winning',
  bottleneck: 'The bottleneck test',
  runway: 'Cash runway',
};
export const EVENTS = ['open', 'result', 'subscribe'];
/** A kept result is the founder's answers and a few sums: small. */
export const RESULT_MAX = 4000;
/** More uses of one tool than this in an hour are not kept (a stuck page). */
const PER_HOUR = 40;

/** What this founder's account still lacks: [] for a full account. */
export async function missingFor(D, studentId) {
  const p = (await D.prepare('SELECT company, interest, industry, google_at FROM student_profile WHERE student_id = ?').bind(studentId).first()) || {};
  const auth = await D.prepare('SELECT pass_hash FROM account_auth WHERE student_id = ?').bind(studentId).first();
  return missingOf({ ...p, hasPassword: !!(auth && auth.pass_hash) });
}

/** The 12 Days as the page and /mentor read it. */
const twelve = (row) => (row ? { subscribedAt: row.subscribed_at, day: Number(row.last_day) || 0, of: 12, done: Number(row.last_day) >= LAST_DAY,
  welcome: !!row.welcome_sent, lastSentAt: row.last_sent_at || null } : null);

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  await accountTables(D);
  const me = await studentBy(D, new URL(request.url).searchParams.get('t'));
  if (!me) return bad('Sign in first.', 401);
  const uses = await D.prepare('SELECT tool, kind, at FROM tool_use WHERE student_id = ? ORDER BY id DESC LIMIT 200').bind(me.id).all();
  const row = await subscription(D, me.id);
  return json({ ok: true, uses: uses.results || [], twelve: twelve(row), lettersOff: row ? !(await lettersOn(D, me.id)) : false, principles: row ? PRINCIPLES : [] });
}

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  await accountTables(D);
  const me = await studentBy(D, clean(body.token, 80));
  if (!me) return bad('Sign in first.', 401);
  const tool = clean(body.tool, 40), kind = clean(body.event, 20);
  if (!Object.hasOwn(TOOL_NAMES, tool)) return bad('There is no such tool.', 404);
  if (!EVENTS.includes(kind) || (kind === 'subscribe') !== (tool === 'twelve-days')) return bad('Unknown event.');

  // The access rule: a full free account, nothing less.
  const missing = await missingFor(D, me.id);
  if (missing.length) return json({ ok: false, error: 'Complete your free account first. It takes a minute.', missing }, 403);
  await keepTz(D, me.id, body.tz);

  let result = null;
  if (kind === 'result') {
    if (!body.result || typeof body.result !== 'object' || Array.isArray(body.result)) return bad('No result to keep.');
    result = JSON.stringify(body.result);
    if (result.length > RESULT_MAX) return bad('That result is too long to keep.', 413);
  }

  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const recent = await D.prepare('SELECT COUNT(*) AS n FROM tool_use WHERE student_id = ? AND tool = ? AND at > ?').bind(me.id, tool, hourAgo).first();
  const before = await D.prepare('SELECT 1 AS x FROM tool_use WHERE student_id = ? AND tool = ? AND kind = ? LIMIT 1').bind(me.id, tool, kind).first();
  const kept = !recent || recent.n < PER_HOUR;
  if (kept) await D.prepare('INSERT INTO tool_use (student_id, tool, kind, result_json, at) VALUES (?,?,?,?,?)').bind(me.id, tool, kind, result, now()).run();

  // TOOLS in Mailchimp, the first time they open this tool or subscribe.
  if (!before && kind !== 'result') {
    const job = syncFounder(env, D, me.id, 'tag', { tag: TOOLS_TAG }).catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(job); else await job;
  }

  if (kind === 'subscribe') {
    const out = await subscribe(env, D, me, { base: origin(request), tz: body.tz, waitUntil });
    return json({ ok: true, subscribed: true, already: !out.fresh, lettersOff: out.lettersOff, welcome: out.welcome, twelve: twelve(out.row), principles: PRINCIPLES });
  }
  return json({ ok: true, kept });
}
