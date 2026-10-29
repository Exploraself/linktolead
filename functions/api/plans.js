// The Account Plans for one founder, in their order. Only with a valid token:
// without one the answer is 401 and carries nothing.
//
// The order comes from what the Compass saved (functions/_plans.js, planFor).
// Ticks are the plans' own: "x of 28 steps done". They do not add to the
// Compass's 16-piece launchpad.

import { json, bad, db, accountTables, studentBy } from '../_shared.js';
import { planFor, ALL_STEP_IDS } from '../_plans.js';

const parse = (s) => { try { return s ? JSON.parse(s) : null; } catch { return null; } };

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  const me = await studentBy(D, new URL(request.url).searchParams.get('t'));
  if (!me) return bad('Sign in to open your plans.', 401);
  await accountTables(D);

  const row = await D.prepare('SELECT results_json, flags_json FROM compass WHERE student_id = ?').bind(me.id).first();
  const results = parse(row && row.results_json) || {}, flags = parse(row && row.flags_json) || {};
  const plan = planFor({ scores: results.scores, answered: results.answered, pains: flags.pains, want: flags.want, lab: flags.lab });

  const ticks = await D.prepare('SELECT step_id, done_at FROM plan_tick WHERE student_id = ?').bind(me.id).all();
  const done = {};
  for (const t of ticks.results || []) if (ALL_STEP_IDS.includes(t.step_id)) done[t.step_id] = t.done_at;
  return json({ ok: true, compass: !!row, ...plan, done, count: Object.keys(done).length, total: ALL_STEP_IDS.length });
}
