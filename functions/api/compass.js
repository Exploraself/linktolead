// The Compass posts its finished report here, so it lands beside the founder's
// programme work and Alexandru can read it before the session.
//
// The Compass itself keeps storing to the browser as it always has. This only
// adds a copy to the account, and only when a token exists.

import { json, bad, db, now, clean } from '../_shared.js';

const cap = (o, n) => (o && typeof o === 'object' ? JSON.stringify(o).slice(0, n) : null);

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }

  const token = clean(body.token, 80);
  const me = await D.prepare('SELECT id FROM student WHERE id = ?').bind(token).first();
  if (!me) return bad('Not found.', 404);

  const stage = ['build', 'grow', 'scale', 'lead'].includes(body.stage) ? body.stage : null;
  await D.prepare(`INSERT INTO compass (student_id,stage,answers_json,numbers_json,results_json,flags_json,updated_at)
      VALUES (?,?,?,?,?,?,?)
      ON CONFLICT(student_id) DO UPDATE SET stage=excluded.stage, answers_json=excluded.answers_json,
        numbers_json=excluded.numbers_json, results_json=excluded.results_json,
        flags_json=excluded.flags_json, updated_at=excluded.updated_at`)
    .bind(me.id, stage, cap(body.answers, 12000), cap(body.numbers, 6000),
          cap(body.results, 8000), cap(body.flags, 2000), now()).run();
  await D.prepare('INSERT INTO event (student_id,kind,at) VALUES (?,?,?)').bind(me.id, 'compass', now()).run();
  return json({ ok: true });
}
