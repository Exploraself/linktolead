// The Massive Growth Plan's ticks, for the founder signed in. Each step is
// ticked when its "Done when" is true.
//
// GET  ?t=token                      → { done: { id: done_at }, count, total }
// POST { token, step, done }          tick (done true) or untick (done false),
//                                     then the same answer as GET
//
// Kept in plan_tick with the ids from public/northstar/growth-plan.js, and
// counted apart from the Account Plans (functions/_growth.js).

import { json, bad, db, now, accountTables, studentBy } from '../_shared.js';
import { GROWTH_IDS, GROWTH_SQL } from '../_growth.js';

/** This founder's Growth Plan ticks, and how many of the steps are done. */
export async function growthTicks(D, studentId) {
  const rows = await D.prepare(`SELECT step_id, done_at FROM plan_tick WHERE student_id = ? AND step_id IN (${GROWTH_SQL}) ORDER BY done_at`).bind(studentId).all();
  const done = {};
  for (const r of rows.results || []) done[r.step_id] = r.done_at;
  return { done, count: Object.keys(done).length, total: GROWTH_IDS.length };
}

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  const me = await studentBy(D, new URL(request.url).searchParams.get('t'));
  if (!me) return bad('Sign in to tick your Growth Plan.', 401);
  await accountTables(D);
  return json({ ok: true, ...await growthTicks(D, me.id) });
}

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  const me = await studentBy(D, body.token);
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
