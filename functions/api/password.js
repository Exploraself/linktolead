// Set or change the optional password, once signed in. The token is the
// proof: a founder who forgot their password signs in by email link first
// (the mentor's "Send a password reset link" is that link), then sets a new
// one here.
//
// Every set, change or reset is followed by a "Your password was changed"
// letter to the account's address, after the reply. It is a security letter,
// so it goes even after an unsubscribe, within the mail limits.

import { json, bad, db, now, accountTables, studentBy } from '../_shared.js';
import { passwordProblem, setPassword } from '../_auth.js';
import { allowed, logged, mailState, origin, send } from '../_mail.js';
import { profile, unsubLink } from '../_account.js';
import { passwordChangedLetter } from '../_letters.js';

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  const me = await studentBy(D, body.token);
  if (!me) return bad('Sign in first.', 401);
  const problem = passwordProblem(body.password, body.confirm);
  if (problem) return bad(problem);
  await accountTables(D);
  const had = await D.prepare('SELECT 1 AS x FROM account_auth WHERE student_id = ? AND pass_hash IS NOT NULL').bind(me.id).first();
  await setPassword(D, me.id, body.password);
  await D.prepare('INSERT INTO event (student_id,kind,at) VALUES (?,?,?)').bind(me.id, had ? 'password-changed' : 'password-set', now()).run();

  if (mailState(env).ready) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown', base = origin(request);
    const go = (async () => {
      if (!(await allowed(D, me.email, ip))) return;
      const p = await profile(D, me.id);
      const r = await send(env, { to: me.email, ...passwordChangedLetter(base, { first: String(me.name || '').split(' ')[0], to: me.email }),
        why: 'The password on your ExploraSelf account was set or changed.', unsubUrl: unsubLink(base, p) });
      if (r.ok) await logged(D, me.email, ip);
      await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)')
        .bind(me.id, r.ok ? 'password-letter' : 'password-letter-failed', now(), r.why || null).run();
    })().catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(go); else await go;
  }
  return json({ ok: true, changed: !!had });
}
