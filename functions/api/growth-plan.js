// The Massive Growth Plan, for the founder signed in: their ticks, and what
// they write in its blanks.
//
// GET  ?t=token                → { done: { step id: done_at }, count, total,
//                                  words: { blank id: text } }
// POST { token, step, done }   tick (done true) or untick (done false)
// POST { token, blank, text }  write one blank; an empty text deletes it.
//                              Full accounts only (missingOf, the rule from
//                              api/complete.js): the plan is theirs to keep.
//
// Ticks stay in plan_tick, counted apart from the Account Plans; words in
// growth_word. Writing every blank of a step never ticks it: the founder
// ticks when its "Done when" is true. Blank and step ids are checked against
// the server's own lists (functions/_growth.js).

import { json, bad, db, now, clean, accountTables, studentBy } from '../_shared.js';
import { GROWTH_IDS, GROWTH_SQL, GROWTH_BLANK_IDS, BLANK_MAX } from '../_growth.js';
import { missingOf } from '../_profile.js';

/** This founder's Growth Plan ticks, and how many of the steps are done. */
export async function growthTicks(D, studentId) {
  const rows = await D.prepare(`SELECT step_id, done_at FROM plan_tick WHERE student_id = ? AND step_id IN (${GROWTH_SQL}) ORDER BY done_at`).bind(studentId).all();
  const done = {};
  for (const r of rows.results || []) done[r.step_id] = r.done_at;
  return { done, count: Object.keys(done).length, total: GROWTH_IDS.length };
}

/** What this founder wrote: { blank id: text }, the plan's blanks only. */
export async function growthWords(D, studentId) {
  const rows = await D.prepare('SELECT blank_id, text FROM growth_word WHERE student_id = ?').bind(studentId).all();
  const words = {};
  for (const r of rows.results || []) if (GROWTH_BLANK_IDS.includes(r.blank_id)) words[r.blank_id] = r.text;
  return words;
}

/** What the account still lacks to be full ([] when it is full). */
async function missing(D, studentId) {
  const [prof, auth] = await Promise.all([
    D.prepare('SELECT company, interest, industry FROM student_profile WHERE student_id = ?').bind(studentId).first(),
    D.prepare('SELECT pass_hash FROM account_auth WHERE student_id = ?').bind(studentId).first(),
  ]);
  return missingOf({ ...(prof || {}), hasPassword: !!(auth && auth.pass_hash) });
}

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  const me = await studentBy(D, new URL(request.url).searchParams.get('t'));
  if (!me) return bad('Sign in to tick your Growth Plan.', 401);
  await accountTables(D);
  return json({ ok: true, ...await growthTicks(D, me.id), words: await growthWords(D, me.id) });
}

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  const me = await studentBy(D, body.token);

  // One blank written.
  if (body.blank !== undefined) {
    if (!me) return bad('Sign in to write in your Growth Plan.', 401);
    if (!GROWTH_BLANK_IDS.includes(body.blank)) return bad('Unknown blank.');
    await accountTables(D);
    if ((await missing(D, me.id)).length) return bad('Complete your account to write in your Growth Plan.', 403);
    const text = clean(body.text, BLANK_MAX), at = now();
    if (!text) await D.prepare('DELETE FROM growth_word WHERE student_id = ? AND blank_id = ?').bind(me.id, body.blank).run();
    else {
      await D.prepare(`INSERT INTO growth_word (student_id, blank_id, text, updated_at) VALUES (?,?,?,?)
        ON CONFLICT(student_id, blank_id) DO UPDATE SET text = excluded.text, updated_at = excluded.updated_at`).bind(me.id, body.blank, text, at).run();
    }
    return json({ ok: true, blank: body.blank, text, at: text ? at : null });
  }

  // One step ticked or unticked.
  if (!me) return bad('Sign in to tick your Growth Plan.', 401);
  if (!GROWTH_IDS.includes(body.step)) return bad('Unknown step.');
  await accountTables(D);
  if (body.done === false) {
    await D.prepare('DELETE FROM plan_tick WHERE student_id = ? AND step_id = ?').bind(me.id, body.step).run();
  } else {
    // Ticked again: the first date stands.
    await D.prepare('INSERT INTO plan_tick (student_id, step_id, done_at) VALUES (?,?,?) ON CONFLICT(student_id, step_id) DO NOTHING')
      .bind(me.id, body.step, now()).run();
  }
  return json({ ok: true, ...await growthTicks(D, me.id) });
}
