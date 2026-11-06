// "12 Days to Start Winning" (functions/_course.js), for a signed-in founder.
//
// GET  ?t=token                       { ok, sub: { day, stopped, started } | null, last }
// POST { token, action: 'start', tz } the welcome goes at once; Day 1 the next morning at 8:00 their time
// POST { token, action: 'stop' }      no more letters (starting again carries on where it stopped)
// POST { token, action: 'invite', first, email, note, tz }
//   "Take care of your neighbor" (Alexandru, 3 Nov 2026): one invitation to a
//   friend, sent now; { ok, sent: true } only when the email service took it.
//   The friend goes on no list and gets no tag (functions/_course.js).
//
// Starting is the founder asking for these letters. If they had turned
// "Letters from your mentor" off, starting turns it back on (as the page says).

import { json, bad, db, now, clean, accountTables, studentBy, looksLikeEmail, newToken } from '../_shared.js';
import { COURSE, COURSE_TAG, LAST_DAY, localParts, sendOne, inviteLetter, inviteTables, friendHash, senderHash,
  INVITE_PER_DAY, INVITE_GAP_DAYS, INVITE_NOTE_MAX } from '../_course.js';
import { opened } from '../_tools.js';
import { setLetters } from '../_account.js';
import { syncFounder } from '../_mailchimp.js';
import { keepTz, okTz } from '../_mentor.js';
import { allowed, logged, mailState, origin, send } from '../_mail.js';

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
  if (body.action === 'invite') return invite(request, env, D, me, body);
  if (body.action !== 'start') return bad('Say start, stop or invite.');

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
  // Its own Mailchimp tag (Alexandru, 5 Nov 2026), with their yes to letters.
  const tagged = syncFounder(env, D, me.id, 'tag', { tag: COURSE_TAG }).catch(() => {});
  if (typeof waitUntil === 'function') waitUntil(tagged); else await tagged;
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

const DAY = 86400_000;
/** "Take care of your neighbor": one letter to one friend, checked first. */
async function invite(request, env, D, me, body) {
  const first = clean(body.first, 60).replace(/[<>"]/g, '');
  const email = clean(body.email, 200).toLowerCase();
  const note = clean(body.note, INVITE_NOTE_MAX + 20).replace(/\s+/g, ' ').trim();
  if (!first) return bad('Your friend’s first name, please.');
  if (!looksLikeEmail(email)) return bad('That email does not look complete.');
  if (email === String(me.email || '').toLowerCase()) return bad('That is your own address. Who is the neighbor? :)');
  if (note.length > INVITE_NOTE_MAX) return bad(`Keep the note under ${INVITE_NOTE_MAX} characters, please.`);
  // A note from a founder goes out from our address: words only, no links.
  if (/https?:|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|me|ly|app|link|xyz)\b|@/i.test(note)) return bad('Leave links and addresses out of the note, please. The letter has the button.');
  if (!mailState(env).ready) return bad('We cannot send invitations right now. Try again later.', 503);
  await inviteTables(D);
  const friend = await friendHash(email);
  const t = Date.now();
  if (await D.prepare('SELECT 1 FROM invite_block WHERE friend = ?').bind(friend).first()) return bad('We can’t send an invitation to that address.', 409);
  // Someone who already said no to letters gets no invitation either.
  const known = await D.prepare('SELECT p.unsubscribed FROM student s JOIN student_profile p ON p.student_id = s.id WHERE lower(s.email) = ?').bind(email).first();
  if (known && known.unsubscribed) return bad('We can’t send an invitation to that address.', 409);
  const sender = await senderHash(me.id);
  const mine = await D.prepare('SELECT COUNT(*) AS n FROM course_invite WHERE sender = ? AND at > ?').bind(sender, t - DAY).first();
  if ((mine?.n || 0) >= INVITE_PER_DAY) return bad(`That is ${INVITE_PER_DAY} invitations today, the most for one day. More tomorrow.`, 429);
  if (await D.prepare('SELECT 1 FROM course_invite WHERE friend = ? AND at > ?').bind(friend, t - INVITE_GAP_DAYS * DAY).first()) {
    return bad('Someone already invited them this month. They are well looked after :)', 409);
  }
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!(await allowed(D, email, ip))) return bad('Too many emails from here in the last hour. Try again in an hour.', 429);
  const base = origin(request);
  const id = newToken();
  const [from] = String(me.name || '').trim().split(/\s+/);
  const tz = clean(body.tz, 60);
  const L = inviteLetter(base, { first, from, fromEmail: me.email, note, tz });
  const r = await send(env, { to: email, ...L, unsubUrl: `${base}/api/unsubscribe?i=${id}` });
  if (!r.ok) return bad('The invitation did not go out. Try again in a minute.', 502);
  await logged(D, email, ip);
  await D.prepare('INSERT INTO course_invite (id, sender, friend, at) VALUES (?,?,?,?)').bind(id, sender, friend, t).run();
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, 'course-invite', now(), first).run();
  return json({ ok: true, sent: true, left: INVITE_PER_DAY - (mine?.n || 0) - 1 });
}
