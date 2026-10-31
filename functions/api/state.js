// The founder's own record: read it on arrival, write it as they work.
// Writes are batched by the page every twenty seconds, so this stays well
// inside D1's free daily allowance even with a few hundred students.

import { json, bad, db, now, clean, accountTables } from '../_shared.js';
import { mentorFor, keepTz } from '../_mentor.js';
import { originOf } from '../_mailchimp.js';
import { missingOf } from '../_profile.js';

async function student(D, token) {
  if (!token || token.length < 20) return null;
  return D.prepare('SELECT id,email,name,stage,tier,thin_domain FROM student WHERE id = ?').bind(token).first();
}

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  const token = new URL(request.url).searchParams.get('t') || '';
  const me = await student(D, token);
  if (!me) return bad('Not found.', 404);

  await accountTables(D);
  const [answers, sheets, compass, auth, chose, prof] = await Promise.all([
    D.prepare('SELECT stage,level,domain,step,body FROM answer WHERE student_id = ?').bind(me.id).all(),
    D.prepare('SELECT key,value FROM sheet WHERE student_id = ?').bind(me.id).all(),
    D.prepare('SELECT stage,results_json,flags_json,updated_at,answers_json FROM compass WHERE student_id = ?').bind(me.id).first(),
    D.prepare('SELECT pass_hash FROM account_auth WHERE student_id = ?').bind(me.id).first(),
    D.prepare("SELECT 1 AS x FROM event WHERE student_id = ? AND kind = 'stage-change' LIMIT 1").bind(me.id).first(),
    D.prepare('SELECT signup_type, consent, unsubscribed, avatar, landing, source, industry, company, interest FROM student_profile WHERE student_id = ?').bind(me.id).first(),
  ]);
  const crossed = ((await D.prepare("SELECT detail FROM event WHERE student_id = ? AND kind = 'crossed'").bind(me.id).all()).results || []).map((r) => r.detail);
  await D.prepare('UPDATE student SET last_seen_at=? WHERE id=?').bind(now(), me.id).run();
  await keepTz(D, me.id, new URL(request.url).searchParams.get('tz'));
  const mentor = await mentorFor(D, me.id);

  // The dates the North Star was taken (round 6): the earlier ones kept in its
  // history, then the current one. The full answers stay out of this reply.
  if (compass) {
    let hist = [];
    try { const j = compass.answers_json ? JSON.parse(compass.answers_json) : null; hist = Array.isArray(j && j.history) ? j.history.map((h) => h && h.at).filter((x) => typeof x === 'string') : []; } catch { hist = []; }
    compass.taken = [...hist, compass.updated_at].filter(Boolean);
    delete compass.answers_json;
  }
  const a = {};
  for (const r of answers.results || []) a[`${r.stage}.${r.level}.${r.domain}.${r.step}`] = r.body;
  const w = {};
  for (const r of sheets.results || []) w[r.key] = r.value;

  // stageChosen: the founder picked this stage on /start ("Change where I
  // stand"), so it wins over the North Star's on every device. signupType:
  // 'simple' founders never have a password, so /start offers none.
  return json({ ok: true, me: { name: me.name, email: me.email, stage: me.stage, stageChosen: !!chose, tier: me.tier, thin: me.thin_domain, hasPassword: !!(auth && auth.pass_hash),
    signupType: (prof && prof.signup_type) || null,
    avatar: (prof && prof.avatar) || '',
    // The industry from sign-up, so the North Star workspace does not ask again.
    industry: (prof && prof.industry) || '',
    // What the account still lacks to be full (one rule for every sales page);
    // the Blueprint asks for it once, at the first answer (api/complete.js).
    missing: missingOf({ ...(prof || {}), hasPassword: !!(auth && auth.pass_hash) }),
    // Which door they came in through, and the doors they confirmed since (api/cross.js).
    origin: originOf(prof || {}), crossed,
    // "Letters from your mentor": on when they gave consent and did not unsubscribe.
    letters: !!(prof && prof.consent && !prof.unsubscribed),
    mentor: { name: mentor.name, first: mentor.first, photo: mentor.photo } },
    answers: a, work: w, compass: compass || null });
}

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }

  const me = await student(D, clean(body.token, 80));
  if (!me) return bad('Not found.', 404);

  const stmts = [];
  const stamp = now();

  // Written answers, keyed stage.level.domain.step
  for (const [k, v] of Object.entries(body.answers || {}).slice(0, 400)) {
    const m = /^(build|grow|scale)\.(\d{1,2})\.(self|people|work|market)\.(\d)$/.exec(k);
    if (!m) continue;
    stmts.push(D.prepare('INSERT INTO answer (student_id,stage,level,domain,step,body,updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(student_id,stage,level,domain,step) DO UPDATE SET body=excluded.body, updated_at=excluded.updated_at')
      .bind(me.id, m[1], +m[2], m[3], +m[4], clean(v, 4000), stamp));
  }
  // Worksheet cells, keyed however the worksheet keys them
  for (const [k, v] of Object.entries(body.work || {}).slice(0, 600)) {
    if (!/^w\.[\w.:-]{1,80}$/.test(k)) continue;
    stmts.push(D.prepare('INSERT INTO sheet (student_id,key,value,updated_at) VALUES (?,?,?,?) ON CONFLICT(student_id,key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at')
      .bind(me.id, k, clean(v, 500), stamp));
  }
  stmts.push(D.prepare('UPDATE student SET last_seen_at=? WHERE id=?').bind(stamp, me.id));
  if (stmts.length) await D.batch(stmts);
  return json({ ok: true, saved: stmts.length - 1 });
}
