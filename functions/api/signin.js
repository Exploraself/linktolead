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
import { allowed, logged, mailState, origin, send, esc } from '../_mail.js';

export const TTL = 30 * 60_000;
const SAME = { ok: true, message: 'If there is an account for that address, a sign-in link is on its way. It works once, for 30 minutes.' };

function linkEmail(link) {
  const html = `<!doctype html><html><body style="margin:0;background:#F7F2E7"><div style="max-width:600px;margin:0 auto;padding:28px 22px;background:#FFFFFF">
    <p style="margin:0;font:700 11px Arial;letter-spacing:3px;color:#7A5C16">EXPLORASELF · LEADERSHIP COMPASS</p>
    <h1 style="margin:12px 0 10px;font:600 26px/1.25 Georgia,serif;color:#14100B">Your sign-in link</h1>
    <p style="margin:0 0 16px;font:15px/1.6 Arial;color:#5E5446">Open it on the device you want to use. It works once, for 30 minutes. If you did not ask for it, ignore this email: nothing changes.</p>
    <a href="${esc(link)}" style="display:inline-block;background:#C9A24A;color:#14100B;font:700 15px Arial;padding:12px 20px;text-decoration:none">Sign me in →</a>
  </div></body></html>`;
  const text = `Your sign-in link for the Leadership Compass. Open it on the device you want to use. It works once, for 30 minutes. If you did not ask for it, ignore this email: nothing changes.\n\n${link}`;
  return { subject: 'Your Leadership Compass sign-in link', html, text };
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

  const me = await D.prepare('SELECT id FROM student WHERE email = ?').bind(email).first();
  if (!me) return json(SAME);

  const code = newToken() + newToken().slice(0, 16);
  await D.prepare('DELETE FROM signin_code WHERE expires_at < ?').bind(Date.now()).run();
  await D.prepare('INSERT INTO signin_code (code_hash, student_id, expires_at) VALUES (?,?,?)')
    .bind(await sha256(code), me.id, Date.now() + TTL).run();
  const p = await profile(D, me.id);
  const base = origin(request);
  const r = await send(env, { to: email, ...linkEmail(`${base}/compass?signin=${code}`),
    why: 'Someone asked for a sign-in link to this ExploraSelf account. If it was not you, nothing changes.', unsubUrl: unsubLink(base, p) });
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
  const p = await D.prepare('SELECT industry FROM student_profile WHERE student_id = ?').bind(me.id).first();
  await D.prepare('INSERT INTO event (student_id,kind,at) VALUES (?,?,?)').bind(me.id, 'signin', now()).run();
  const [first, ...rest] = String(me.name || '').split(' ');
  return json({ ok: true, token: me.id, me: { first: first || '', last: rest.join(' '), email: me.email, industry: (p && p.industry) || '' } });
}
