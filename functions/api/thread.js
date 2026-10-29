// "Ask Alexandru": one question-and-answer thread per founder, on /start.
//
// A question is a note (POST /api/note, which also tells Alexandru); his
// answer is a message that points at it (message.note_id), written in
// /mentor. GET ?t= returns the thread oldest first, newest last, and how many
// answers are unread. POST { token } marks every answer read, when the
// founder opens the thread. Answers given before this thread existed (the
// note's own reply) still show, as read.

import { json, bad, db, now, studentBy, accountTables } from '../_shared.js';

export async function thread(D, studentId) {
  const [notes, answers] = await Promise.all([
    D.prepare('SELECT id, level, domain, body, reply, created_at, answered_at FROM note WHERE student_id = ? ORDER BY created_at').bind(studentId).all(),
    D.prepare('SELECT id, note_id, body, sent_at, read_at FROM message WHERE student_id = ? AND note_id IS NOT NULL ORDER BY sent_at').bind(studentId).all(),
  ]);
  const A = answers.results || [];
  const items = [];
  for (const n of notes.results || []) {
    items.push({ from: 'founder', id: n.id, level: n.level, domain: n.domain, body: n.body, at: n.created_at });
    if (n.reply && !A.some((a) => a.note_id === n.id)) items.push({ from: 'mentor', note: n.id, body: n.reply, at: n.answered_at || n.created_at, read: true });
  }
  for (const a of A) items.push({ from: 'mentor', id: a.id, note: a.note_id, body: a.body, at: a.sent_at, read: !!a.read_at });
  items.sort((x, y) => String(x.at).localeCompare(String(y.at)));
  return { items, unread: A.filter((a) => !a.read_at).length };
}

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  const me = await studentBy(D, new URL(request.url).searchParams.get('t'));
  if (!me) return bad('Not found.', 404);
  await accountTables(D);
  return json({ ok: true, ...(await thread(D, me.id)) });
}

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  const me = await studentBy(D, body.token);
  if (!me) return bad('Not found.', 404);
  await accountTables(D);
  await D.prepare('UPDATE message SET read_at = ? WHERE student_id = ? AND note_id IS NOT NULL AND read_at IS NULL').bind(now(), me.id).run();
  return json({ ok: true });
}
