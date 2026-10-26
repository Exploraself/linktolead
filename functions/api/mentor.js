// Alexandru's own view. Refuses to answer unless MENTOR_KEY is set on the
// Pages project AND the request carries it. No key set means no access.

import { json, bad, db, now, mentorOk, clean } from '../_shared.js';

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  if (!mentorOk(request, env)) return bad('Not authorised.', 401);

  const url = new URL(request.url);
  const one = url.searchParams.get('student');

  if (one) {
    const me = await D.prepare('SELECT * FROM student WHERE id = ?').bind(one).first();
    if (!me) return bad('Not found.', 404);
    const [answers, sheets, compass, notes] = await Promise.all([
      D.prepare('SELECT stage,level,domain,step,body,updated_at FROM answer WHERE student_id=? ORDER BY level,domain,step').bind(one).all(),
      D.prepare('SELECT key,value FROM sheet WHERE student_id=?').bind(one).all(),
      D.prepare('SELECT * FROM compass WHERE student_id=?').bind(one).first(),
      D.prepare('SELECT id,level,domain,body,status,reply,created_at FROM note WHERE student_id=? ORDER BY created_at DESC').bind(one).all(),
    ]);
    delete me.diag_json;
    return json({ ok: true, student: me, answers: answers.results || [], work: sheets.results || [],
      compass: compass || null, notes: notes.results || [] });
  }

  const students = await D.prepare(`
    SELECT s.id, s.name, s.email, s.phone, s.stage, s.tier, s.thin_domain, s.joined_at, s.last_seen_at,
      (SELECT COUNT(*) FROM answer a WHERE a.student_id = s.id AND a.body <> '') AS written,
      (SELECT COUNT(*) FROM note n WHERE n.student_id = s.id AND n.status = 'new') AS open_notes,
      (SELECT updated_at FROM compass c WHERE c.student_id = s.id) AS compass_at
    FROM student s ORDER BY COALESCE(s.last_seen_at, s.joined_at) DESC LIMIT 400`).all();
  return json({ ok: true, students: students.results || [] });
}

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  if (!mentorOk(request, env)) return bad('Not authorised.', 401);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }

  if (body.action === 'reply' && body.note) {
    await D.prepare('UPDATE note SET reply=?, status=?, answered_at=? WHERE id=?')
      .bind(clean(body.reply, 3000), 'answered', now(), clean(body.note, 80)).run();
    return json({ ok: true });
  }
  if (body.action === 'tier' && body.student) {
    const tier = ['free', 'session', 'lab', 'hub', 'premium'].includes(body.tier) ? body.tier : null;
    if (!tier) return bad('Unknown tier.');
    await D.prepare('UPDATE student SET tier=? WHERE id=?').bind(tier, clean(body.student, 80)).run();
    return json({ ok: true });
  }
  return bad('Unknown action.');
}
