// A note to the mentor, left where the founder got stuck. It never blocks
// them — they carry on, and the reply appears here when it comes.

import { json, bad, db, now, newToken, clean } from '../_shared.js';

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }

  const me = await D.prepare('SELECT id FROM student WHERE id = ?').bind(clean(body.token, 80)).first();
  if (!me) return bad('Not found.', 404);
  const text = clean(body.body, 3000);
  if (!text) return bad('Nothing to send.');

  const lvl = Number.isInteger(body.level) && body.level >= 1 && body.level <= 12 ? body.level : null;
  const dom = ['self', 'people', 'work', 'market'].includes(body.domain) ? body.domain : null;
  await D.prepare('INSERT INTO note (id,student_id,level,domain,body,status,created_at) VALUES (?,?,?,?,?,?,?)')
    .bind(newToken(), me.id, lvl, dom, text, 'new', now()).run();
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
