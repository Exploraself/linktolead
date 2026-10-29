// The mentor's own view: the dashboard, the account manager and each founder's
// work. Refuses to answer unless MENTOR_KEY is set AND the request carries it.
// No key set means no access, never open access.
//
// GET              every founder, with what the dashboard and the table need,
//                  and the notes waiting for a reply
// GET ?csv=1       the same list as a CSV file
// GET ?student=id  one founder's work
// POST { action }  reply · tier (change step) · pause · delete · signin-link ·
//                  message. Every action is logged as an event.

import { json, bad, db, now, mentorOk, clean, accountTables, newToken, STUDENT_TABLES } from '../_shared.js';
import { DOMAIN_STEPS, WHATIF_STEPS, ALL_STEP_IDS } from '../_plans.js';
import { sendLink } from './signin.js';
import { send, esc, origin, mailState } from '../_mail.js';
import { profile, unsubLink } from '../_account.js';

/** Each plan step's domain and title, so ticks can be read by domain. */
const STEP = Object.fromEntries([...DOMAIN_STEPS, ...WHATIF_STEPS].map((s) => [s.id, s]));
export const STEPS = { free: 'Founder Launchpad', session: 'The Boardroom', lab: 'LAB', hub: 'HUB', premium: 'The Summit' };

async function roster(D) {
  const rows = await D.prepare(`
    SELECT s.id, s.name, s.email, s.phone, s.company, s.tier,
      COALESCE((SELECT c.stage FROM compass c WHERE c.student_id = s.id), s.stage) AS stage, s.thin_domain,
      s.joined_at, s.last_seen_at, s.mailchimp_sent,
      (SELECT COUNT(*) FROM answer a WHERE a.student_id = s.id AND a.body <> '') AS written,
      (SELECT COUNT(*) FROM note n WHERE n.student_id = s.id AND n.status = 'new') AS open_notes,
      (SELECT updated_at FROM compass c WHERE c.student_id = s.id) AS compass_at,
      (SELECT COUNT(*) FROM plan_tick t WHERE t.student_id = s.id) AS plan_ticks,
      p.industry, p.source, p.consent, p.unsubscribed,
      CASE WHEN au.pass_hash IS NULL THEN 0 ELSE 1 END AS has_password, COALESCE(au.paused, 0) AS paused
    FROM student s
      LEFT JOIN student_profile p ON p.student_id = s.id
      LEFT JOIN account_auth au ON au.student_id = s.id
    ORDER BY COALESCE(s.last_seen_at, s.joined_at) DESC LIMIT 2000`).all();
  return rows.results || [];
}

const CSV_COLS = [['name', 'Name'], ['email', 'Email'], ['joined_at', 'Joined'], ['last_seen_at', 'Last seen'], ['stage', 'Stage'], ['step', 'Step'],
  ['compass', 'Compass done'], ['plan_ticks', 'Plan steps done'], ['has_password', 'Has password'], ['consent', 'Consent'], ['unsubscribed', 'Unsubscribed'], ['paused', 'Paused']];
export function toCSV(list) {
  // Quoted, and a leading = + - @ is defused so a spreadsheet never runs it.
  const cell = (v) => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
  const yes = (v) => (v ? 'yes' : 'no');
  const row = (s) => ({ ...s, step: STEPS[s.tier || 'free'] || s.tier, compass: yes(s.compass_at), has_password: yes(s.has_password), consent: yes(s.consent), unsubscribed: yes(s.unsubscribed), paused: yes(s.paused) });
  return [CSV_COLS.map(([, h]) => cell(h)).join(','), ...list.map((s) => { const r = row(s); return CSV_COLS.map(([k]) => cell(r[k])).join(','); })].join('\r\n') + '\r\n';
}

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  if (!mentorOk(request, env)) return bad('Not authorised.', 401);
  await accountTables(D);
  const url = new URL(request.url);
  const one = url.searchParams.get('student');

  if (one) {
    const me = await D.prepare('SELECT * FROM student WHERE id = ?').bind(one).first();
    if (!me) return bad('Not found.', 404);
    const [answers, sheets, compass, notes, prof, ticks, auth, messages] = await Promise.all([
      D.prepare('SELECT stage,level,domain,step,body,updated_at FROM answer WHERE student_id=? ORDER BY level,domain,step').bind(one).all(),
      D.prepare('SELECT key,value FROM sheet WHERE student_id=?').bind(one).all(),
      D.prepare('SELECT * FROM compass WHERE student_id=?').bind(one).first(),
      D.prepare('SELECT id,level,domain,body,status,reply,created_at FROM note WHERE student_id=? ORDER BY created_at DESC').bind(one).all(),
      D.prepare('SELECT industry,consent,consent_at,source,unsubscribed,unsub_at FROM student_profile WHERE student_id=?').bind(one).first(),
      D.prepare('SELECT step_id,done_at FROM plan_tick WHERE student_id=? ORDER BY done_at').bind(one).all(),
      D.prepare('SELECT pass_hash IS NOT NULL AS has_password, paused, set_at FROM account_auth WHERE student_id=?').bind(one).first(),
      D.prepare('SELECT subject,body,channel,sent_at,read_at FROM message WHERE student_id=? ORDER BY sent_at DESC LIMIT 20').bind(one).all(),
    ]);
    delete me.diag_json;
    return json({ ok: true, student: me, answers: answers.results || [], work: sheets.results || [],
      compass: compass || null, notes: notes.results || [], profile: prof || null, auth: auth || null, messages: messages.results || [],
      ticks: (ticks.results || []).map((t) => ({ ...t, domain: STEP[t.step_id] ? STEP[t.step_id].domain : null, title: STEP[t.step_id] ? STEP[t.step_id].title : t.step_id })) });
  }

  const students = await roster(D);
  if (url.searchParams.get('csv')) {
    return new Response(toCSV(students), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="founders.csv"', 'cache-control': 'no-store' } });
  }
  const waiting = await D.prepare(`SELECT n.id, n.student_id, n.body, n.created_at, s.name, s.email FROM note n JOIN student s ON s.id = n.student_id
      WHERE n.status = 'new' ORDER BY n.created_at DESC LIMIT 100`).all();
  return json({ ok: true, students, waiting: waiting.results || [], steps: STEPS, totalSteps: ALL_STEP_IDS.length, mailReady: mailState(env).ready });
}

/** The email a mentor message becomes. Everything typed is escaped. */
export function messageEmail(subject, text) {
  const html = `<!doctype html><html><body style="margin:0;background:#F7F2E7"><div style="max-width:600px;margin:0 auto;padding:28px 22px;background:#FFFFFF">
    <p style="margin:0;font:700 11px Arial;letter-spacing:3px;color:#7A5C16">A NOTE FROM ALEXANDRU AND THE TEAM</p>
    <h1 style="margin:12px 0 10px;font:600 24px/1.25 Georgia,serif;color:#14100B">${esc(subject)}</h1>
    <div style="font:15px/1.65 Arial;color:#14100B;white-space:pre-wrap">${esc(text)}</div>
    <p style="margin:18px 0 0;font:14px/1.6 Arial;color:#5E5446">It is also in your Ground Plan: <a href="https://linktolead.exploraself.com/start" style="color:#7A5C16">linktolead.exploraself.com/start</a></p>
  </div></body></html>`;
  return { subject, html, text: `A note from Alexandru and the team\n\n${subject}\n\n${text}\n\nYour Ground Plan: https://linktolead.exploraself.com/start` };
}

export async function onRequestPost({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  if (!mentorOk(request, env)) return bad('Not authorised.', 401);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  await accountTables(D);
  const log = (student, kind, detail = null) => D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(student, kind, now(), detail).run();

  if (body.action === 'reply' && body.note) {
    const n = await D.prepare('SELECT student_id FROM note WHERE id = ?').bind(clean(body.note, 80)).first();
    await D.prepare('UPDATE note SET reply=?, status=?, answered_at=? WHERE id=?')
      .bind(clean(body.reply, 3000), 'answered', now(), clean(body.note, 80)).run();
    if (n) await log(n.student_id, 'mentor-reply');
    return json({ ok: true });
  }

  const id = clean(body.student, 80);
  const me = id ? await D.prepare('SELECT id, email, name FROM student WHERE id = ?').bind(id).first() : null;
  if (!me) return bad('Unknown founder.', 404);

  if (body.action === 'tier') {
    const tier = ['free', 'session', 'lab', 'hub', 'premium'].includes(body.tier) ? body.tier : null;
    if (!tier) return bad('Unknown step.');
    await D.prepare('UPDATE student SET tier=? WHERE id=?').bind(tier, me.id).run();
    await log(me.id, 'mentor-step', tier);
    return json({ ok: true });
  }
  if (body.action === 'pause') {
    const paused = body.paused ? 1 : 0;
    await D.prepare(`INSERT INTO account_auth (student_id, paused) VALUES (?,?) ON CONFLICT(student_id) DO UPDATE SET paused=excluded.paused`).bind(me.id, paused).run();
    await log(me.id, paused ? 'mentor-pause' : 'mentor-unpause');
    return json({ ok: true, paused: !!paused });
  }
  if (body.action === 'delete') {
    // Typing the founder's email is the confirmation.
    if (clean(body.confirm, 200).toLowerCase() !== me.email) return bad('Type the founder’s email exactly to confirm.');
    await D.batch([
      ...STUDENT_TABLES.map((t) => D.prepare(`DELETE FROM ${t} WHERE student_id = ?`).bind(me.id)),
      D.prepare('DELETE FROM mail_log WHERE email = ?').bind(me.email),
      D.prepare('DELETE FROM auth_log WHERE email = ?').bind(me.email),
      D.prepare('DELETE FROM student WHERE id = ?').bind(me.id),
    ]);
    // Logged without the founder's details, which are gone.
    await log('mentor', 'mentor-delete', 'one founder deleted');
    return json({ ok: true });
  }
  if (body.action === 'signin-link' || body.action === 'reset-link') {
    if (!mailState(env).ready) return bad('Email is not switched on yet.', 503);
    const r = await sendLink(env, D, origin(request), me, 'start');
    await log(me.id, body.action === 'reset-link' ? 'mentor-reset-link' : 'mentor-signin-link', r.ok ? null : r.why);
    return r.ok ? json({ ok: true }) : bad('It did not send. Try again in a minute.', 502);
  }
  if (body.action === 'message') {
    const subject = clean(body.subject, 160), text = clean(body.body, 4000);
    if (!subject || !text) return bad('A subject and a message, please.');
    let channel = ['email', 'plan', 'both'].includes(body.channel) ? body.channel : 'plan';
    const p = await profile(D, me.id);
    // Unsubscribed founders get it in their Ground Plan only.
    const emailWanted = channel !== 'plan';
    const canEmail = !p.unsubscribed && mailState(env).ready;
    if (emailWanted && !canEmail) channel = 'plan';
    let emailed = false;
    if (emailWanted && canEmail) {
      const base = origin(request);
      const r = await send(env, { to: me.email, ...messageEmail(subject, text),
        why: 'Alexandru and the team wrote to you about your free ExploraSelf account.', unsubUrl: unsubLink(base, p) });
      if (!r.ok && channel === 'email') return bad('The email did not send. Nothing was saved; try again in a minute.', 502);
      emailed = r.ok;
      if (!r.ok) channel = 'plan';
    }
    await D.prepare('INSERT INTO message (id, student_id, subject, body, channel, sent_at) VALUES (?,?,?,?,?,?)')
      .bind(newToken(), me.id, subject, text, channel, now()).run();
    await log(me.id, 'mentor-message', channel);
    return json({ ok: true, channel, emailed, unsubscribed: !!p.unsubscribed });
  }
  return bad('Unknown action.');
}
