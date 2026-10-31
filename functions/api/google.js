// "Continue with Google": sign in, or make the free account, in one tap.
//
// GET  → { ready, clientId }   the button shows only when ready.
// POST { credential, consent, landing, utm, source, tz }
//      → { ok, token, existing, me: { first, last, email }, missing }
//
// Google has proved the address belongs to this person (functions/_google.js),
// so an existing account opens, like an email sign-in link would. A paused
// account is told so. A new address gets the same free account as the simple
// sign-up form (signup.js): name and email from Google, the consent the founder
// ticked, the landing page and utm tags, the welcome letter and Mailchimp only
// with consent. No password is made: `missing` lists what the account still
// lacks (company, interest, industry, password), and the Blueprint asks for it
// once, at the first answer (api/complete.js), as for every other account.

import { json, bad, db, now, newToken, accountTables } from '../_shared.js';
import { profile, sendWelcome, SOURCES } from '../_account.js';
import { keepTz } from '../_mentor.js';
import { allowed, logged, mailState, origin } from '../_mail.js';
import { syncFounder } from '../_mailchimp.js';
import { landingOf, utmFrom, missingOf } from '../_profile.js';
import { PAUSED } from '../_auth.js';
import { clientId, verifyGoogle } from '../_google.js';

export const onRequestGet = ({ env }) => {
  const id = clientId(env);
  return new Response(JSON.stringify({ ok: true, ready: !!id, clientId: id }), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' } });
};

/** What a full account still lacks, for the reply. */
async function missingFor(D, id) {
  const prof = await D.prepare('SELECT company, interest, industry FROM student_profile WHERE student_id = ?').bind(id).first();
  const auth = await D.prepare('SELECT pass_hash FROM account_auth WHERE student_id = ?').bind(id).first();
  return missingOf({ ...(prof || {}), hasPassword: !!(auth && auth.pass_hash) });
}

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('The account service is not configured yet.', 503);
  if (!clientId(env)) return bad('Google sign-in is not switched on yet.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  const who = await verifyGoogle(env, body.credential);
  if (!who) return bad('Google could not confirm this account. Try again, or use your email.', 401);

  await accountTables(D);
  const found = await D.prepare('SELECT s.id, s.name, s.email, a.paused FROM student s LEFT JOIN account_auth a ON a.student_id = s.id WHERE s.email = ?').bind(who.email).first();
  if (found) {
    if (found.paused) return bad(PAUSED, 403);
    await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(found.id, 'login', now(), 'google').run();
    const [first, ...rest] = String(found.name || '').split(' ');
    return json({ ok: true, token: found.id, existing: true, me: { first: first || who.first, last: rest.join(' ') || who.last, email: found.email }, missing: await missingFor(D, found.id) });
  }

  const consent = body.consent === true;
  const source = SOURCES.includes(body.source) ? body.source : 'compass';
  const landing = landingOf(body.landing), utm = utmFrom(body.utm);
  const id = newToken();
  const name = `${who.first} ${who.last}`.trim() || who.email.split('@')[0];
  await D.prepare(`INSERT INTO student (id,email,name,phone,company,stage,tier,joined_at,last_seen_at)
      VALUES (?,?,?,?,?,?,?,?,?)`).bind(id, who.email, name, '', '', null, 'free', now(), now()).run();
  const p = await profile(D, id, { industry: null, consent, source });
  await keepTz(D, id, body.tz);
  await D.prepare(`UPDATE student_profile SET signup_type = 'simple', landing = ?,
      utm_source = ?, utm_medium = ?, utm_campaign = ?, utm_content = ?, utm_term = ? WHERE student_id = ?`)
    .bind(landing, utm.utm_source, utm.utm_medium, utm.utm_campaign, utm.utm_content, utm.utm_term, id).run();
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(id, 'signup', now(), `${source} · google`).run();

  // After the reply, as in signup.js: the welcome letter, then Mailchimp.
  if (consent && !p.unsubscribed && mailState(env).ready) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const go = (async () => {
      if (!(await allowed(D, who.email, ip))) return;
      const r = await sendWelcome(env, origin(request), { email: who.email, first: who.first, p, D, tz: body.tz, landing });
      if (r.ok) await logged(D, who.email, ip);
      await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)')
        .bind(id, r.ok ? 'launchpad-welcome' : 'launchpad-welcome-failed', now(), r.why || null).run();
    })().catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(go); else await go;
  }
  if (consent && !p.unsubscribed) {
    const job = syncFounder(env, D, id, 'join').catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(job); else await job;
  }
  return json({ ok: true, token: id, existing: false, me: { first: who.first, last: who.last, email: who.email }, missing: await missingFor(D, id) });
}
