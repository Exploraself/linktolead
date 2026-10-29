// One plan step ticked done, or unticked. { token, step, done }.

import { json, bad, db, now, accountTables, studentBy } from '../../_shared.js';
import { ALL_STEP_IDS } from '../../_plans.js';

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  const me = await studentBy(D, body.token);
  if (!me) return bad('Sign in to tick your plans.', 401);
  if (!ALL_STEP_IDS.includes(body.step)) return bad('Unknown step.');
  await accountTables(D);
  if (body.done === false) {
    await D.prepare('DELETE FROM plan_tick WHERE student_id = ? AND step_id = ?').bind(me.id, body.step).run();
  } else {
    await D.prepare('INSERT INTO plan_tick (student_id, step_id, done_at) VALUES (?,?,?) ON CONFLICT(student_id, step_id) DO NOTHING')
      .bind(me.id, body.step, now()).run();
  }
  const n = await D.prepare('SELECT COUNT(*) AS n FROM plan_tick WHERE student_id = ?').bind(me.id).first();
  return json({ ok: true, count: (n && n.n) || 0, total: ALL_STEP_IDS.length });
}
