// Sign in on another device, by a one-time link sent to the account's email.
//
// POST { email } answers the same way whether or not there is an account, so
// the form cannot be used to find out who has one. When there is, it emails
// /compass?signin=<code>. The code is 32 random bytes; only its SHA-256 is
// stored, it lasts 30 minutes and works once. Requests share the mail limits
// with every other email (3 per address, 10 per connection, per hour), and
// they count whether or not the address has an account.
//
// GET ?code= swaps a live code for the token, and spends it.
//
// A sign-in link is something the founder asked for in the moment, so it is
// sent even to an address that unsubscribed.

import { json, bad, db, now, clean, looksLikeEmail, accountTables, newToken, sha256 } from '../_shared.js';
import { profile, unsubLink } from '../_account.js';
import { allowed, logged, mailState, origin, send } from '../_mail.js';
import { signinLetter } from '../_letters.js';
import { PAUSED } from '../_auth.js';

export const TTL = 30 * 60_000;
const SAME = { ok: true, message: 'If there is an account for that address, a sign-in link is on its way. It works once, for 30 minutes.' };

/** Make a one-time code for this founder and email the link. The link opens
 *  where the founder asked from: the Compass or their Ground Plan. Also used
 *  by /mentor ("Send sign-in link", "Send a password reset link"). */
export async function sendLink(env, D, base, me, page = 'compass') {
  const code = newToken() + newToken().slice(0, 16);
  await D.prepare('DELETE FROM signin_code WHERE expires_at < ?').bind(Date.now()).run();
  await D.prepare('INSERT INTO signin_code (code_hash, student_id, expires_at) VALUES (?,?,?)')
    .bind(await sha256(code), me.id, Date.now() + TTL).run();
  const p = await profile(D, me.id);
  const who = me.name !== undefined ? me : await D.prepare('SELECT name FROM student WHERE id = ?').bind(me.id).first();
  const first = String((who && who.name) || '').split(' ')[0];
  return send(env, { to: me.email, ...signinLetter(base, `${base}/${page === 'start' ? 'start' : 'compass'}?signin=${code}`, { first, to: me.email }),
    why: 'Someone asked for a sign-in link to this ExploraSelf account. If it was not you, nothing changes.', unsubUrl: unsubLink(base, p) });
}

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Sign-in is not available right now.', 503);
  if (!mailState(env).ready) return bad('Sign-in by email is not switched on yet.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  const email = clean(body.email, 200).toLowerCase();
  if (!looksLikeEmail(email)) return bad('That email does not look complete.');

  await accountTables(D);
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!(await allowed(D, email, ip))) return bad('That is a few already. Try again in an hour.', 429);
  await logged(D, email, ip);

  const me = await D.prepare('SELECT id, email FROM student WHERE email = ?').bind(email).first();
  if (!me) return json(SAME);

  const r = await sendLink(env, D, origin(request), me, body.to === 'start' ? 'start' : 'compass');
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)')
    .bind(me.id, r.ok ? 'signin-link' : 'signin-link-failed', now(), r.why || null).run();
  return json(SAME);
}

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Sign-in is not available right now.', 503);
  const code = clean(new URL(request.url).searchParams.get('code'), 200);
  const gone = () => bad('That sign-in link has expired or was already used. Ask for a new one.', 410);
  if (code.length < 40) return gone();
  await accountTables(D);
  const h = await sha256(code), t = Date.now();
  const row = await D.prepare('SELECT student_id, expires_at, used_at FROM signin_code WHERE code_hash = ?').bind(h).first();
  if (!row || row.used_at || row.expires_at < t) return gone();
  // Spend it. If two requests race, only the one that changes the row wins.
  const r = await D.prepare('UPDATE signin_code SET used_at = ? WHERE code_hash = ? AND used_at IS NULL').bind(t, h).run();
  if (r && r.meta && r.meta.changes === 0) return gone();
  const me = await D.prepare('SELECT id, email, name FROM student WHERE id = ?').bind(row.student_id).first();
  if (!me) return gone();
  if (await D.prepare('SELECT 1 AS x FROM account_auth WHERE student_id = ? AND paused = 1').bind(me.id).first()) return bad(PAUSED, 403);
  const p = await D.prepare('SELECT industry FROM student_profile WHERE student_id = ?').bind(me.id).first();
  await D.prepare('INSERT INTO event (student_id,kind,at) VALUES (?,?,?)').bind(me.id, 'signin', now()).run();
  const [first, ...rest] = String(me.name || '').split(' ');
  return json({ ok: true, token: me.id, me: { first: first || '', last: rest.join(' '), email: me.email, industry: (p && p.industry) || '' } });
}
