// The Account Plans for one founder, in their order. Only with a valid token:
// without one the answer is 401 and carries nothing. The one exception is
// ?total, the number of steps (the same for everyone), which the sales pages
// show so that number is never typed twice.
//
// The order comes from what the North Star saved (functions/_plans.js, planFor).
// Ticks are the plans' own: "x of 32 steps done". They do not add to the
// North Star's 16-piece launchpad.

import { json, bad, db, accountTables, studentBy } from '../_shared.js';
import { planFor, ALL_STEP_IDS } from '../_plans.js';

const parse = (s) => { try { return s ? JSON.parse(s) : null; } catch { return null; } };

export async function onRequestGet({ request, env }) {
  if (new URL(request.url).searchParams.has('total')) {
    return new Response(JSON.stringify({ ok: true, total: ALL_STEP_IDS.length }), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
  }
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
