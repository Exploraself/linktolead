// "Change where I stand" on /start: the founder picks Building, Growing or
// Scaling. Their answers stay; each stage has its own levels.
//
// POST { token, stage, from } saves the stage on the account, logs a
// 'stage-change' event { from, to } (/mentor shows it in the founder's
// history) and, after the reply, resyncs the stage tag in Mailchimp. From
// then on the chosen stage wins over the North Star's, on every device.

import { json, bad, db, now, clean, studentBy, accountTables } from '../_shared.js';
import { syncFounder } from '../_mailchimp.js';

export const STAGES = ['build', 'grow', 'scale'];

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  const me = await studentBy(D, clean(body.token, 80));
  if (!me) return bad('Sign in first.', 401);
  const to = STAGES.includes(body.stage) ? body.stage : null;
  if (!to) return bad('Pick Building, Growing or Scaling.');
  const from = STAGES.includes(body.from) ? body.from : (STAGES.includes(me.stage) ? me.stage : null);
  await accountTables(D);
  await D.prepare('UPDATE student SET stage = ? WHERE id = ?').bind(to, me.id).run();
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, 'stage-change', now(), JSON.stringify({ from, to })).run();
  const job = syncFounder(env, D, me.id, 'tags').catch(() => {});
  if (typeof waitUntil === 'function') waitUntil(job); else await job;
  return json({ ok: true, stage: to });
}
