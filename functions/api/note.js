// A question to Alexandru ("Ask Alexandru" on /start), or a note left where
// the founder got stuck. It never blocks them: they carry on, and the answer
// appears in their thread when it comes (functions/api/thread.js).
//
// Each one also emails Alexandru a plain notice (no offer), after the reply:
// to MENTOR_EMAIL if set, else alex@exploraself.com. At most five notices per
// founder an hour, so a stuck key cannot flood his inbox; every question is
// still saved and shown in /mentor.

import { json, bad, db, now, newToken, clean } from '../_shared.js';
import { mailState, origin, send } from '../_mail.js';
import { questionNotice } from '../_letters.js';

export const MENTOR_EMAIL = 'alex@exploraself.com';
const DOMAIN_NAMES = { self: 'Lead yourself', people: 'Lead your people', work: 'Lead your business', market: 'Lead the market' };

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }

  const me = await D.prepare('SELECT id, name, email FROM student WHERE id = ?').bind(clean(body.token, 80)).first();
  if (!me) return bad('Not found.', 404);
  const text = clean(body.body, 3000);
  if (!text) return bad('Nothing to send.');

  const lvl = Number.isInteger(body.level) && body.level >= 1 && body.level <= 12 ? body.level : null;
  const dom = ['self', 'people', 'work', 'market'].includes(body.domain) ? body.domain : null;
  const stamp = now();
  await D.prepare('INSERT INTO note (id,student_id,level,domain,body,status,created_at) VALUES (?,?,?,?,?,?,?)')
    .bind(newToken(), me.id, lvl, dom, text, 'new', stamp).run();

  if (mailState(env).ready) {
    const job = (async () => {
      const hour = new Date(Date.now() - 3600_000).toISOString();
      const recent = await D.prepare('SELECT COUNT(*) AS n FROM note WHERE student_id = ? AND created_at > ?').bind(me.id, hour).first();
      if (recent && recent.n > 5) return;
      await send(env, { to: (typeof env.MENTOR_EMAIL === 'string' && env.MENTOR_EMAIL.trim()) || MENTOR_EMAIL,
        ...questionNotice(origin(request), { name: me.name, email: me.email, question: text, level: lvl, domain: dom ? DOMAIN_NAMES[dom] : '' }),
        why: 'A founder asked a question in Ask Alexandru on linktolead.exploraself.com.' });
    })().catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(job); else await job;
  }
  return json({ ok: true });
}

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  const token = new URL(request.url).searchParams.get('t') || '';
  const me = await D.prepare('SELECT id FROM student WHERE id = ?').bind(token).first();
  if (!me) return bad('Not found.', 404);
  const rows = await D.prepare('SELECT level,domain,body,status,reply,created_at,answered_at FROM note WHERE student_id=? ORDER BY created_at DESC LIMIT 50')
    .bind(me.id).all();
  return json({ ok: true, notes: rows.results || [] });
}
