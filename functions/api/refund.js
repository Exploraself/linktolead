// "Ask for a refund" from Base Camp (functions/_refund.js). POST { token?,
// step, name, email }. Kept for /mentor → Refunds; Alexandru answers himself.
// The founder is told only that the request reached him.

import { json, bad, db, now, newToken, clean, accountTables, studentBy } from '../_shared.js';
import { REFUND_STEPS, REFUND_PER_DAY, refundTable } from '../_refund.js';

const looksLikeEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not available right now. Try again in a minute.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  const step = String(body.step || '');
  if (!REFUND_STEPS.includes(step)) return bad('Choose the programme you paid for.');
  const name = clean(body.name, 120), email = clean(body.email, 200).toLowerCase();
  if (!name) return bad('Write your name.');
  if (!looksLikeEmail(email)) return bad('Write the email you paid with.');
  await accountTables(D);
  await refundTable(D);
  const ip = request.headers.get('cf-connecting-ip') || '';
  if (ip) {
    const since = new Date(Date.now() - 864e5).toISOString();
    const n = await D.prepare('SELECT COUNT(*) AS n FROM refund_ask WHERE ip = ? AND asked_at > ?').bind(ip, since).first();
    if (n && n.n >= REFUND_PER_DAY) return bad('We already have your request. Alexandru will get in touch with you.', 429);
  }
  const me = body.token ? await studentBy(D, clean(body.token, 80)) : null;
  const who = me || await D.prepare('SELECT id FROM student WHERE email = ?').bind(email).first();
  await D.prepare('INSERT INTO refund_ask (id, student_id, name, email, step, ip, asked_at) VALUES (?,?,?,?,?,?,?)')
    .bind(newToken(), who ? who.id : null, name, email, step, ip || null, now()).run();
  return json({ ok: true });
}
