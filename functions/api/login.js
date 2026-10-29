// Sign in with email and password (set at the password gate, when a founder
// starts the Launchpad). "Forgot your password? Email me a sign-in link"
// (/api/signin) always works as well.
//
// The answer is the same whether the email has no account, has no password or
// the password is wrong, so the form cannot be used to find out who has an
// account. Failed tries are limited per address and per connection, counted
// alike for addresses that exist and addresses that do not. A paused account
// is told so plainly, but only after the right password.

import { json, bad, db, now, clean, looksLikeEmail, accountTables } from '../_shared.js';
import { verifyPassword, hashPassword, PAUSED } from '../_auth.js';

const NO = 'That email and password do not match. If you are not sure, use “Forgot your password? Email me a sign-in link”.';
export const LIMIT = { email: 5, ip: 20, windowMs: 3600_000 };

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Sign-in is not available right now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  const email = clean(body.email, 200).toLowerCase(), password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';
  if (!looksLikeEmail(email) || !password) return bad(NO, 401);
  await accountTables(D);

  const ip = request.headers.get('cf-connecting-ip') || 'unknown', since = Date.now() - LIMIT.windowMs;
  const seen = await D.prepare('SELECT SUM(email = ?) AS e, SUM(ip = ?) AS i FROM auth_log WHERE at > ?').bind(email, ip, since).first();
  if ((seen?.e || 0) >= LIMIT.email || (seen?.i || 0) >= LIMIT.ip) return bad('That is a few tries already. Wait an hour, or use “Email me a sign-in link”.', 429);

  const me = await D.prepare('SELECT s.id, s.email, s.name, a.pass_hash, a.salt, a.iterations, a.paused FROM student s LEFT JOIN account_auth a ON a.student_id = s.id WHERE s.email = ?').bind(email).first();
  // Without an account or a password, do the same work anyway, so the answer
  // takes as long either way.
  const good = me && me.pass_hash ? await verifyPassword(password, me) : (await hashPassword(password, '00'.repeat(16)), false);
  if (!good) {
    await D.prepare('INSERT INTO auth_log (email, ip, at) VALUES (?,?,?)').bind(email, ip, Date.now()).run();
    await D.prepare('DELETE FROM auth_log WHERE at < ?').bind(Date.now() - 86400_000).run();
    return bad(NO, 401);
  }
  if (me.paused) return bad(PAUSED, 403);
  await D.prepare('INSERT INTO event (student_id,kind,at) VALUES (?,?,?)').bind(me.id, 'login', now()).run();
  const [first, ...rest] = String(me.name || '').split(' ');
  return json({ ok: true, token: me.id, me: { first: first || '', last: rest.join(' '), email: me.email } });
}
