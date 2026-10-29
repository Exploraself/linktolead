// The Compass posts its finished report here, so it lands beside the founder's
// programme work and Alexandru can read it before the session.
//
// The Compass saves to the browser first, always. This adds a copy to the
// account, only when a token exists, and in batches (the Compass sends on a
// "Got it" tick, at the end of each section and when the page is hidden).
// GET hands the copy back, so a founder who signs in on another device finds
// their Compass there.

import { json, bad, db, now, clean, studentBy } from '../_shared.js';

/** Kept whole or not at all: a JSON string cut short could never be read back. */
const cap = (o, n) => { if (!o || typeof o !== 'object') return null; const s = JSON.stringify(o); return s.length <= n ? s : null; };

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }

  const token = clean(body.token, 80);
  const me = await D.prepare('SELECT id FROM student WHERE id = ?').bind(token).first();
  if (!me) return bad('Not found.', 404);

  const stage = ['build', 'grow', 'scale', 'lead', 'building', 'growing', 'scaling', 'leading'].includes(body.stage) ? body.stage : null;
  await D.prepare(`INSERT INTO compass (student_id,stage,answers_json,numbers_json,results_json,flags_json,updated_at)
      VALUES (?,?,?,?,?,?,?)
      ON CONFLICT(student_id) DO UPDATE SET stage=COALESCE(excluded.stage,compass.stage),
        answers_json=COALESCE(excluded.answers_json,compass.answers_json),
        numbers_json=COALESCE(excluded.numbers_json,compass.numbers_json),
        results_json=COALESCE(excluded.results_json,compass.results_json),
        flags_json=COALESCE(excluded.flags_json,compass.flags_json), updated_at=excluded.updated_at`)
    .bind(me.id, stage, cap(body.answers, 12000), cap(body.numbers, 6000),
          cap(body.results, 8000), cap(body.flags, 2000), now()).run();
  await D.prepare('INSERT INTO event (student_id,kind,at) VALUES (?,?,?)').bind(me.id, 'compass', now()).run();
  return json({ ok: true });
}

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  const me = await studentBy(D, new URL(request.url).searchParams.get('t'));
  if (!me) return bad('Not found.', 404);
  const row = await D.prepare('SELECT answers_json, updated_at FROM compass WHERE student_id = ?').bind(me.id).first();
  let answers = null;
  try { answers = row && row.answers_json ? JSON.parse(row.answers_json) : null; } catch { answers = null; }
  return json({ ok: true, answers, updated_at: row ? row.updated_at : null });
}
