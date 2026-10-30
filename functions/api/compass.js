// The North Star posts its finished report here, so it lands beside the founder's
// programme work and Alexandru can read it before the session.
//
// The North Star saves to the browser first, always. This adds a copy to the
// account, only when a token exists, and in batches (the North Star sends on a
// "Got it" tick, at the end of each section and when the page is hidden).
// GET hands the copy back, so a founder who signs in on another device finds
// their North Star there.

import { json, bad, db, now, clean, studentBy, accountTables } from '../_shared.js';
import { mailchimpState, syncFounder, weakestTag } from '../_mailchimp.js';

/** Kept whole or not at all: a JSON string cut short could never be read back. */
const cap = (o, n) => { if (!o || typeof o !== 'object') return null; const s = JSON.stringify(o); return s.length <= n ? s : null; };

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }

  const token = clean(body.token, 80);
  const me = await D.prepare('SELECT id FROM student WHERE id = ?').bind(token).first();
  if (!me) return bad('Not found.', 404);

  const stage = ['build', 'grow', 'scale', 'lead', 'building', 'growing', 'scaling', 'leading'].includes(body.stage) ? body.stage : null;
  const before = await D.prepare('SELECT stage, results_json FROM compass WHERE student_id = ?').bind(me.id).first();
  // An empty North Star (nothing answered) never replaces one with answers: a
  // fresh browser opened while signed in must not wipe the founder's work.
  const count = (j) => { try { const r = typeof j === 'string' ? JSON.parse(j) : j; return (r && Array.isArray(r.answered) ? r.answered : []).reduce((a, b) => a + (Number(b) || 0), 0); } catch { return 0; } };
  if (before && count(before.results_json) > 0 && count(body.results) === 0) return json({ ok: true, kept: true });
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

  // A finished North Star updates the founder's Mailchimp tags (stage and weakest
  // domain), in API mode only and only when one of them changed, after the reply.
  if (mailchimpState(env).mode === 'api') {
    const after = await D.prepare('SELECT stage, results_json FROM compass WHERE student_id = ?').bind(me.id).first();
    const was = before ? `${before.stage}|${weakestTag(before.results_json)}` : '';
    const weakest = after ? weakestTag(after.results_json) : null;
    if (weakest && `${after.stage}|${weakest}` !== was) {
      const go = (async () => { await accountTables(D); await syncFounder(env, D, me.id, 'tags'); })().catch(() => {});
      if (typeof waitUntil === 'function') waitUntil(go); else await go;
    }
  }
  return json({ ok: true });
}

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  const me = await studentBy(D, new URL(request.url).searchParams.get('t'));
  if (!me) return bad('Not found.', 404);
  await accountTables(D);
  const row = await D.prepare('SELECT answers_json, updated_at FROM compass WHERE student_id = ?').bind(me.id).first();
  const auth = await D.prepare('SELECT pass_hash FROM account_auth WHERE student_id = ?').bind(me.id).first();
  let answers = null;
  try { answers = row && row.answers_json ? JSON.parse(row.answers_json) : null; } catch { answers = null; }
  return json({ ok: true, answers, updated_at: row ? row.updated_at : null, hasPassword: !!(auth && auth.pass_hash) });
}
