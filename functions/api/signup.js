// A free account from the Compass or its sales page: first name, surname,
// email, industry, consent, where they came from and their stage.
//
// One email is one record. A new email makes the record and returns its token,
// which the browser keeps (public/account.js, key 'ftb-token'). An email that
// already has a record returns no token: the token is the key to everything a
// founder wrote, and knowing someone's address must not hand it over. That
// browser is told to sign in by email link instead. The one exception is the
// browser that already holds this record's token.
//
// No Mailchimp here (that comes later). The welcome email is sent once, to new
// accounts that consented and have not unsubscribed, within the mail limits.

import { json, bad, db, now, newToken, clean, looksLikeEmail, accountTables } from '../_shared.js';
import { profile, sendWelcome } from '../_account.js';
import { allowed, logged, mailState, origin } from '../_mail.js';

/** The Compass's four stages, as the programme names its three. */
const STAGE = { building: 'build', growing: 'grow', scaling: 'scale', build: 'build', grow: 'grow', scale: 'scale' };

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('The account service is not configured yet.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }

  const email = clean(body.email, 200).toLowerCase();
  const first = clean(body.first, 60), last = clean(body.last, 60);
  if (!looksLikeEmail(email)) return bad('That email does not look complete.');
  if (!first) return bad('Your first name, so the Compass is yours.');
  const consent = body.consent === true;
  const source = ['compass', 'sales-page'].includes(body.source) ? body.source : 'compass';
  const stage = STAGE[body.stage] || null;

  await accountTables(D);
  const found = await D.prepare('SELECT id FROM student WHERE email = ?').bind(email).first();

  if (found) {
    // Same record. Profile details only fill gaps; nothing is overwritten.
    // Consent counts only from the browser that holds this record: someone
    // typing another person's address cannot agree on their behalf.
    const mine = clean(body.token, 80) === found.id;
    await profile(D, found.id, { industry: body.industry, consent: mine && consent, source });
    await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(found.id, 'signup', now(), 'existing').run();
    return json(mine ? { ok: true, token: found.id, existing: true } : { ok: true, existing: true });
  }

  const id = newToken();
  await D.prepare(`INSERT INTO student (id,email,name,phone,company,stage,tier,joined_at,last_seen_at)
      VALUES (?,?,?,?,?,?,?,?,?)`)
    .bind(id, email, `${first} ${last}`.trim(), '', '', stage, 'free', now(), now()).run();
  const p = await profile(D, id, { industry: body.industry, consent, source });
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(id, 'signup', now(), source).run();

  // The welcome goes after the reply, so a slow email service never makes
  // anyone wait for their account.
  if (consent && !p.unsubscribed && mailState(env).ready) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const go = (async () => {
      if (!(await allowed(D, email, ip))) return;
      const r = await sendWelcome(env, origin(request), { email, first, p });
      if (r.ok) await logged(D, email, ip);
      await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)')
        .bind(id, r.ok ? 'welcome' : 'welcome-failed', now(), r.why || null).run();
    })().catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(go); else await go;
  }

  return json({ ok: true, token: id, existing: false });
}
