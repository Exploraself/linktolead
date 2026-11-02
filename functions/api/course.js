// "12 Days to Start Winning" (functions/_course.js), for a signed-in founder.
//
// GET  ?t=token                       { ok, sub: { day, stopped, started } | null, last }
// POST { token, action: 'start', tz } the welcome goes at once; Day 1 the next morning at 8:00 their time
// POST { token, action: 'stop' }      no more letters (starting again carries on where it stopped)
//
// Starting is the founder asking for these letters. If they had turned
// "Letters from your mentor" off, starting turns it back on (as the page says).

import { json, bad, db, now, clean, accountTables, studentBy } from '../_shared.js';
import { COURSE, LAST_DAY, localParts, sendOne } from '../_course.js';
import { opened } from '../_tools.js';
import { setLetters } from '../_account.js';
import { keepTz, okTz } from '../_mentor.js';
import { allowed, logged, mailState, origin } from '../_mail.js';

const status = (c) => (c ? { day: Math.max(0, c.day_sent), stopped: !!c.stopped_at, started: c.started_at } : null);

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  await accountTables(D);
  const me = await studentBy(D, new URL(request.url).searchParams.get('t'));
  if (!me) return bad('Sign in first.', 401);
  const c = await D.prepare('SELECT * FROM course_sub WHERE student_id = ? AND course = ?').bind(me.id, COURSE).first();
  return json({ ok: true, sub: status(c), last: LAST_DAY });
}

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  await accountTables(D);
  const me = await studentBy(D, clean(body.token, 80));
  if (!me) return bad('Sign in first.', 401);
  const at = now();
  let c = await D.prepare('SELECT * FROM course_sub WHERE student_id = ? AND course = ?').bind(me.id, COURSE).first();

  if (body.action === 'stop') {
    if (c && !c.stopped_at) {
      await D.prepare('UPDATE course_sub SET stopped_at = ? WHERE student_id = ? AND course = ?').bind(at, me.id, COURSE).run();
      await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, 'course-stop', at, COURSE).run();
    }
    c = await D.prepare('SELECT * FROM course_sub WHERE student_id = ? AND course = ?').bind(me.id, COURSE).first();
    return json({ ok: true, sub: status(c) });
  }
  if (body.action !== 'start') return bad('Say start or stop.');

  await keepTz(D, me.id, body.tz);
  const tz = okTz(body.tz) || null;
  const p = await D.prepare('SELECT unsubscribed FROM student_profile WHERE student_id = ?').bind(me.id).first();
  // They asked for letters: "Letters from your mentor" comes back on.
  if (p && p.unsubscribed) await setLetters(env, D, me.id, true);
  if (!c) {
    await D.prepare('INSERT INTO course_sub (student_id, course, started_at, tz, day_sent) VALUES (?,?,?,?,-1)').bind(me.id, COURSE, at, tz).run();
  } else if (c.stopped_at) {
    await D.prepare('UPDATE course_sub SET stopped_at = NULL, tz = COALESCE(?, tz) WHERE student_id = ? AND course = ?').bind(tz, me.id, COURSE).run();
  }
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, 'course-start', at, COURSE).run();
  await opened(env, D, me.id, '12-days', waitUntil);
  c = await D.prepare('SELECT * FROM course_sub WHERE student_id = ? AND course = ?').bind(me.id, COURSE).first();

  // The welcome, once, right away (after the reply). If it cannot go now,
  // the hourly run sends it.
  if (c.day_sent < 0 && mailState(env).ready) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const job = (async () => {
      if (!(await allowed(D, me.email, ip))) return;
      const row = await D.prepare(`SELECT cs.student_id, cs.day_sent, COALESCE(NULLIF(cs.tz, ''), p.tz) AS tz, s.email, s.name, p.unsub_id
          FROM course_sub cs JOIN student s ON s.id = cs.student_id LEFT JOIN student_profile p ON p.student_id = cs.student_id
          WHERE cs.student_id = ? AND cs.course = ?`).bind(me.id, COURSE).first();
      const r = await sendOne(env, D, origin(request), row, { day: 0, date: localParts(row.tz).date });
      if (r.ok) await logged(D, me.email, ip);
    })().catch(() => {});
    if (typeof waitUntil === 'function') waitUntil(job); else await job;
    c = await D.prepare('SELECT * FROM course_sub WHERE student_id = ? AND course = ?').bind(me.id, COURSE).first();
  }
  return json({ ok: true, sub: status(c), last: LAST_DAY });
}
