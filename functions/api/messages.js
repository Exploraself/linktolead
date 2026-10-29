// Notes from Alexandru and the team, shown at the top of the founder's Ground
// Plan. GET lists them (newest first); POST { token, id } marks one read when
// the founder taps "Got it". Replies go to /api/note, as every note does.

import { json, bad, db, now, clean, accountTables, studentBy } from '../_shared.js';

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  const me = await studentBy(D, new URL(request.url).searchParams.get('t'));
  if (!me) return bad('Not found.', 404);
  await accountTables(D);
  const rows = await D.prepare("SELECT id, subject, body, sent_at, read_at FROM message WHERE student_id = ? AND channel IN ('plan','both') ORDER BY sent_at DESC LIMIT 20").bind(me.id).all();
  const list = rows.results || [];
  return json({ ok: true, messages: list, unread: list.filter((m) => !m.read_at).length });
}

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  const me = await studentBy(D, body.token);
  if (!me) return bad('Not found.', 404);
  await accountTables(D);
  await D.prepare('UPDATE message SET read_at = COALESCE(read_at, ?) WHERE id = ? AND student_id = ?').bind(now(), clean(body.id, 80), me.id).run();
  return json({ ok: true });
}
