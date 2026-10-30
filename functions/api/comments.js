// Comments under a level's video (public/video-talk.js).
//
// GET  ?stage=build&level=1&t=<token>  → the visible comments on that video,
//      first names only, newest last. Signed-in founders only.
// GET  ?all=1 with the mentor key       → the latest 200, every level, hidden
//      ones included, with the full name and email, for /mentor.
// POST { token, stage, level, body }   → a new comment (at most 10 an hour).
// POST { token, remove: id }           → a founder deletes their own.
// POST { hide: id, hidden: true|false } with the mentor key → hide or show.
//
// Each new comment sends Alexandru a plain notice after the reply, at most
// five per founder an hour; every comment is still saved.

import { json, bad, db, now, newToken, clean, accountTables, studentBy, mentorOk } from '../_shared.js';
import { mailState, origin, send } from '../_mail.js';
import { commentNotice } from '../_letters.js';
import { MENTOR_EMAIL } from './note.js';

const STAGES = ['build', 'grow', 'scale'];
const okLevel = (n) => Number.isInteger(n) && n >= 1 && n <= 12;

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  await accountTables(D);
  const q = new URL(request.url).searchParams;
  if (q.get('all') === '1') {
    if (!mentorOk(request, env)) return bad('Not allowed.', 403);
    const { results } = await D.prepare(`SELECT c.id, c.stage, c.level, c.body, c.created_at AS at, c.hidden, s.name, s.email
      FROM video_comment c LEFT JOIN student s ON s.id = c.student_id ORDER BY c.created_at DESC LIMIT 200`).all();
    return json({ ok: true, items: results || [] });
  }
  const me = await studentBy(D, q.get('t'));
  if (!me) return bad('Sign in first.', 401);
  const stage = q.get('stage'), level = Number(q.get('level'));
  if (!STAGES.includes(stage) || !okLevel(level)) return bad('Which video?');
  const { results } = await D.prepare(`SELECT c.id, c.student_id, c.body, c.created_at AS at, s.name
    FROM video_comment c LEFT JOIN student s ON s.id = c.student_id
    WHERE c.stage = ? AND c.level = ? AND c.hidden = 0 ORDER BY c.created_at ASC LIMIT 300`).bind(stage, level).all();
  const items = (results || []).map((r) => ({ id: r.id, body: r.body, at: r.at,
    first: String(r.name || '').split(' ')[0], mine: r.student_id === me.id }));
  return json({ ok: true, items });
}

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  await accountTables(D);

  if (body.hide !== undefined) {
    if (!mentorOk(request, env)) return bad('Not allowed.', 403);
    await D.prepare('UPDATE video_comment SET hidden = ? WHERE id = ?').bind(body.hidden === false ? 0 : 1, clean(body.hide, 80)).run();
    return json({ ok: true });
  }

  const me = await studentBy(D, body.token);
  if (!me) return bad('Sign in first.', 401);

  if (body.remove !== undefined) {
    await D.prepare('DELETE FROM video_comment WHERE id = ? AND student_id = ?').bind(clean(body.remove, 80), me.id).run();
    return json({ ok: true });
  }

  const stage = body.stage, level = body.level, text = clean(body.body, 1500);
  if (!STAGES.includes(stage) || !okLevel(level)) return bad('Which video?');
  if (!text) return bad('Write something first.');
  const hour = new Date(Date.now() - 3600_000).toISOString();
  const recent = await D.prepare('SELECT COUNT(*) AS n FROM video_comment WHERE student_id = ? AND created_at > ?').bind(me.id, hour).first();
  if (recent && recent.n >= 10) return bad('That is a lot of comments for one hour. Try again a little later.', 429);
  await D.prepare('INSERT INTO video_comment (id, student_id, stage, level, body, created_at) VALUES (?,?,?,?,?,?)')
    .bind(newToken(), me.id, stage, level, text, now()).run();

  if (mailState(env).ready && (!recent || recent.n < 5)) {
    const job = send(env, { to: (typeof env.MENTOR_EMAIL === 'string' && env.MENTOR_EMAIL.trim()) || MENTOR_EMAIL,
      ...commentNotice(origin(request), { name: me.name, email: me.email, comment: text, stage, level }),
      why: 'A founder commented on a level video.' }).catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(job); else await job;
  }
  return json({ ok: true });
}
