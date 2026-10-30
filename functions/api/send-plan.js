// "Email me my results" on the North Star: a short letter from Alexandru with the
// link to the results and the domain to start with (functions/_letters.js).
//
// Off until the mail is ready: the Resend key AND the postal address for the
// footer (see functions/_mail.js). GET says { ready, reason } and the North Star
// shows plainly when it cannot send.
//
// The results go to the account. A signed-in founder sends with their token
// and the email goes to the account address, without asking. Otherwise the
// address typed must belong to an account (the North Star creates the free
// account first), and it goes to that address. Results are something the
// founder asked for in the moment, so they arrive even after an unsubscribe.
// Everything visitor-written is escaped and capped, and each address and
// connection is rate-limited.

import { json, bad, db, clean, looksLikeEmail, accountTables, studentBy } from '../_shared.js';
import { mailState, allowed, logged, send, origin, LIMIT_MSG } from '../_mail.js';
import { profile, unsubLink } from '../_account.js';
import { resultsLetter } from '../_letters.js';
import { letterContext } from '../_mentor.js';
import { weakestTag } from '../_mailchimp.js';

export const onRequestGet = ({ env }) => json(mailState(env));

const list = (v, n, max) => (Array.isArray(v) ? v.slice(0, n).map((x) => clean(x, max)).filter(Boolean) : []);

/** Rebuild a small, known shape from whatever arrived. Unknown keys are dropped. */
function shape(p) {
  p = p && typeof p === 'object' ? p : {};
  const domains = (Array.isArray(p.domains) ? p.domains : []).slice(0, 4).map((d) => ({
    know: clean(d?.know, 40), lead: clean(d?.lead, 40), label: clean(d?.label, 40),
    strengthen: list(d?.strengthen, 2, 200), steps: list(d?.steps, 9, 240), level: clean(d?.level, 80),
  }));
  const numbers = (Array.isArray(p.numbers) ? p.numbers : []).slice(0, 6).map((r) => [clean(r?.[0], 60), clean(r?.[1], 30)]);
  const next = (Array.isArray(p.next) ? p.next : []).slice(0, 3).map((a) => ({ title: clean(a?.title, 120), text: clean(a?.text, 300) }));
  const strategy = (Array.isArray(p.strategy) ? p.strategy : []).slice(0, 4).map((s) => ({
    lead: clean(s?.lead, 40), goal: clean(s?.goal, 600), week: clean(s?.week, 600), check: clean(s?.check, 600),
  }));
  return { name: clean(p.name, 60), business: clean(p.business, 80), stage: clean(p.stage, 40), focus: clean(p.focus, 120), domains, numbers, next, strategy };
}

const DOMAIN_NAMES = { 'lead-yourself': 'Lead yourself', 'lead-your-people': 'Lead your people', 'lead-your-business': 'Lead your business', 'lead-the-market': 'Lead the market' };
const BANDS = ['Needs you now', 'Taking shape', 'A strength'];

/** The domain that needs the founder most, in full: from the North Star saved
 *  in the account (the lowest score, a tie to the first); else from the
 *  bands in the plan the page sent. Empty when neither says. */
export function weakestName(record, plan) {
  const tag = record ? weakestTag(record.results_json) : null;
  if (tag) return DOMAIN_NAMES[tag];
  let best = null;
  for (const d of plan.domains) {
    const rank = BANDS.indexOf(d.lead);
    if (rank >= 0 && Object.values(DOMAIN_NAMES).includes(d.know) && (!best || rank < best.rank)) best = { rank, name: d.know };
  }
  return best ? best.name : '';
}

export async function onRequestPost({ request, env }) {
  const st = mailState(env);
  if (!st.ready) return bad('Email is not switched on yet. Use Print or Save as PDF for now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }

  // The rate limit needs the database; unthrottled is not acceptable, so refuse.
  const D = db(env);
  if (!D) return bad('Email is not available right now.', 503);
  await accountTables(D);

  let me = body.token ? await studentBy(D, body.token) : null;
  if (!me) {
    const typed = clean(body.email, 200).toLowerCase();
    if (!looksLikeEmail(typed)) return bad('That address does not look complete.');
    me = await D.prepare('SELECT id,email,name,tier FROM student WHERE email = ?').bind(typed).first();
    if (!me) return bad('Create your free account first, then we can send your results.', 404);
  }
  const email = me.email;

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!(await allowed(D, email, ip))) return bad(LIMIT_MSG, 429);

  const plan = shape(body.plan);
  const p = await profile(D, me.id);
  const base = origin(request);
  const record = await D.prepare('SELECT results_json FROM compass WHERE student_id = ?').bind(me.id).first();
  const first = String(me.name || '').split(' ')[0] || plan.name;
  const ctx = await letterContext(D, me.id, body.tz);
  const r = await send(env, { to: email, ...resultsLetter(base, { first, weakest: weakestName(record, plan), to: email, tier: me.tier, ...ctx }),
    why: 'You asked for your results at linktolead.exploraself.com/compass. They were sent once, to this address.', unsubUrl: unsubLink(base, p) });
  if (!r.ok) return bad('It did not send. Try again in a minute.', 502);

  await logged(D, email, ip);
  return json({ ok: true, to: email });
}
