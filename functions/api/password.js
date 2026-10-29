// Set or change the optional password, once signed in. The token is the
// proof: a founder who forgot their password signs in by email link first.

import { json, bad, db, now, accountTables, studentBy } from '../_shared.js';
import { passwordProblem, setPassword } from '../_auth.js';

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  const me = await studentBy(D, body.token);
  if (!me) return bad('Sign in first.', 401);
  const problem = passwordProblem(body.password, body.confirm);
  if (problem) return bad(problem);
  await accountTables(D);
  const had = await D.prepare('SELECT 1 AS x FROM account_auth WHERE student_id = ? AND pass_hash IS NOT NULL').bind(me.id).first();
  await setPassword(D, me.id, body.password);
  await D.prepare('INSERT INTO event (student_id,kind,at) VALUES (?,?,?)').bind(me.id, had ? 'password-changed' : 'password-set', now()).run();
  return json({ ok: true, changed: !!had });
}
