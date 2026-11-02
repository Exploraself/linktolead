// The free tools (functions/_tools.js), for a signed-in founder.
//
// POST { token, step: 'hello', tool? }                  "Yes, that's me": the first time an account opens the
//                                                       toolkit; the "Growth Toolkit" tag and the welcome, once
// POST { token, tool, step: 'open' }                    a tool was opened: logged, tag "Growth Toolkit" the
//                                                       first time
// POST { token, tool, step: 'done', answers, summary }  the founder reached their reading: the answers
//                                                       and a one-line result are kept (/mentor shows them)
// GET  ?t=token                                         which tools this founder has used, for the Tools page
//
// The answers stay on the founder's device first (public/tools/engine.js);
// this copy is what lets Alexandru and the team read them before a session.

import { json, bad, db, now, clean, accountTables, studentBy } from '../_shared.js';
import { isTool, opened, welcomeOnce, toolkitConfirmed } from '../_tools.js';
import { origin } from '../_mail.js';

export async function onRequestPost({ request, env, waitUntil }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  await accountTables(D);
  const me = await studentBy(D, clean(body.token, 80));
  if (!me) return bad('Sign in first.', 401);
  const tz = clean(body.tz, 60);
  if (body.step === 'hello') {
    const t = clean(body.tool, 30);
    await welcomeOnce(env, D, origin(request), me, { tool: isTool(t) ? t : '', tz, waitUntil });
    return json({ ok: true, confirmed: true });
  }
  const tool = clean(body.tool, 30);
  if (!isTool(tool) || tool === '12-days') return bad('There is no such tool.', 404);
  if (tool === 'teleprompter' && body.step !== 'open') return bad('The teleprompter keeps your scripts on your device.');
  if (body.step === 'open') {
    await opened(env, D, me.id, tool, waitUntil);
    return json({ ok: true });
  }
  if (body.step === 'done') {
    let answers = '';
    try { answers = JSON.stringify(body.answers && typeof body.answers === 'object' ? body.answers : {}); } catch { answers = '{}'; }
    if (answers.length > 4000) return bad('That is more than we can keep.');
    const at = now();
    await D.prepare(`INSERT INTO tool_run (student_id, tool, answers_json, summary, updated_at) VALUES (?,?,?,?,?)
        ON CONFLICT(student_id, tool) DO UPDATE SET answers_json = excluded.answers_json, summary = excluded.summary, updated_at = excluded.updated_at`)
      .bind(me.id, tool, answers, clean(body.summary, 200), at).run();
    await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(me.id, 'tool-done', at, tool).run();
    return json({ ok: true });
  }
  return bad('Say what happened: open or done.');
}

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not available right now.', 503);
  await accountTables(D);
  const me = await studentBy(D, new URL(request.url).searchParams.get('t'));
  if (!me) return bad('Sign in first.', 401);
  const runs = (await D.prepare('SELECT tool, summary, updated_at FROM tool_run WHERE student_id = ?').bind(me.id).all()).results || [];
  const used = {};
  for (const r of runs) used[r.tool] = { summary: r.summary || '', at: r.updated_at };
  const c = await D.prepare("SELECT day_sent, stopped_at FROM course_sub WHERE student_id = ? AND course = 'win12'").bind(me.id).first();
  return json({ ok: true, used, course: c ? { day: Math.max(0, c.day_sent), stopped: !!c.stopped_at } : null, confirmed: await toolkitConfirmed(D, me.email) });
}
