// The mentor's own view: the dashboard, the account manager and each founder's
// work. Refuses to answer unless MENTOR_KEY is set AND the request carries it.
// No key set means no access, never open access.
//
// GET              every founder, with what the dashboard and the table need,
//                  and the notes waiting for a reply
// GET ?csv=1       the same list as a CSV file
// GET ?student=id  one founder's work
// POST { action }  reply · tier (change step, and its step tags in Mailchimp) ·
//                  pause · delete · signin-link · message · mc-test ·
//                  mc-backfill. Every action is logged as an event; every
//                  Mailchimp call also in mailchimp_log.

import { json, bad, db, now, mentorOk, clean, looksLikeEmail, accountTables, newToken, STUDENT_TABLES } from '../_shared.js';
import { DOMAIN_STEPS, WHATIF_STEPS, ALL_STEP_IDS } from '../_plans.js';
import { sendLink } from './signin.js';
import { send, esc, origin, mailState } from '../_mail.js';
import { profile, unsubLink } from '../_account.js';
import { mailchimpState, syncFounder, testJoin, backfillList, stepsBackfillList, canTag, stepName, TIER_ORDER } from '../_mailchimp.js';

/** Each plan step's domain and title, so ticks can be read by domain. */
const STEP = Object.fromEntries([...DOMAIN_STEPS, ...WHATIF_STEPS].map((s) => [s.id, s]));
export const STEPS = { free: 'Founder Launchpad', session: 'The Boardroom', lab: 'LAB', hub: 'HUB', premium: 'The Summit' };

/** A founder's climb, oldest first: the account itself (The Founder
 *  Launchpad, on the day they joined), then every step change the mentor
 *  made. Older 'mentor-step' events hold only the new step; newer ones hold
 *  { from, to }. A change to the step they were already on adds no line. */
export function climbOf(student, events) {
  const out = [{ tier: 'free', name: stepName('free'), at: student.joined_at }];
  for (const e of events || []) {
    let to = e.detail;
    try { const d = JSON.parse(e.detail); if (d && typeof d === 'object') to = d.to; } catch { /* a bare step key */ }
    if (!TIER_ORDER.includes(to) || to === out[out.length - 1].tier) continue;
    out.push({ tier: to, name: stepName(to), at: e.at });
  }
  return out;
}

async function roster(D) {
  const rows = await D.prepare(`
    SELECT s.id, s.name, s.email, s.phone, s.company, s.tier,
      COALESCE((SELECT c.stage FROM compass c WHERE c.student_id = s.id), s.stage) AS stage, s.thin_domain,
      s.joined_at, s.last_seen_at, s.mailchimp_sent,
      (SELECT COUNT(*) FROM answer a WHERE a.student_id = s.id AND a.body <> '') AS written,
      (SELECT COUNT(*) FROM note n WHERE n.student_id = s.id AND n.status = 'new') AS open_notes,
      (SELECT updated_at FROM compass c WHERE c.student_id = s.id) AS compass_at,
      (SELECT COUNT(*) FROM plan_tick t WHERE t.student_id = s.id) AS plan_ticks,
      p.industry, p.source, p.consent, p.unsubscribed, p.mailchimp_status, p.mailchimp_at,
      CASE WHEN au.pass_hash IS NULL THEN 0 ELSE 1 END AS has_password, COALESCE(au.paused, 0) AS paused
    FROM student s
      LEFT JOIN student_profile p ON p.student_id = s.id
      LEFT JOIN account_auth au ON au.student_id = s.id
    ORDER BY COALESCE(s.last_seen_at, s.joined_at) DESC LIMIT 2000`).all();
  return rows.results || [];
}

const CSV_COLS = [['name', 'Name'], ['email', 'Email'], ['joined_at', 'Joined'], ['last_seen_at', 'Last seen'], ['stage', 'Stage'], ['step', 'Step'],
  ['compass', 'Compass done'], ['plan_ticks', 'Plan steps done'], ['has_password', 'Has password'], ['consent', 'Consent'], ['unsubscribed', 'Unsubscribed'], ['paused', 'Paused'], ['mailchimp_status', 'Mailchimp']];
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
    const [answers, sheets, compass, notes, prof, ticks, auth, messages, steps] = await Promise.all([
      D.prepare('SELECT stage,level,domain,step,body,updated_at FROM answer WHERE student_id=? ORDER BY level,domain,step').bind(one).all(),
      D.prepare('SELECT key,value FROM sheet WHERE student_id=?').bind(one).all(),
      D.prepare('SELECT * FROM compass WHERE student_id=?').bind(one).first(),
      D.prepare('SELECT id,level,domain,body,status,reply,created_at FROM note WHERE student_id=? ORDER BY created_at DESC').bind(one).all(),
      D.prepare('SELECT industry,consent,consent_at,source,unsubscribed,unsub_at FROM student_profile WHERE student_id=?').bind(one).first(),
      D.prepare('SELECT step_id,done_at FROM plan_tick WHERE student_id=? ORDER BY done_at').bind(one).all(),
      D.prepare('SELECT pass_hash IS NOT NULL AS has_password, paused, set_at FROM account_auth WHERE student_id=?').bind(one).first(),
      D.prepare('SELECT subject,body,channel,sent_at,read_at FROM message WHERE student_id=? ORDER BY sent_at DESC LIMIT 20').bind(one).all(),
      D.prepare("SELECT detail, at FROM event WHERE student_id=? AND kind='mentor-step' ORDER BY id").bind(one).all(),
    ]);
    delete me.diag_json;
    return json({ ok: true, student: me, answers: answers.results || [], work: sheets.results || [],
      compass: compass || null, notes: notes.results || [], profile: prof || null, auth: auth || null, messages: messages.results || [],
      climb: climbOf(me, steps.results || []),
      ticks: (ticks.results || []).map((t) => ({ ...t, domain: STEP[t.step_id] ? STEP[t.step_id].domain : null, title: STEP[t.step_id] ? STEP[t.step_id].title : t.step_id })) });
  }

  const students = await roster(D);
  if (url.searchParams.get('csv')) {
    return new Response(toCSV(students), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="founders.csv"', 'cache-control': 'no-store' } });
  }
  const waiting = await D.prepare(`SELECT n.id, n.student_id, n.body, n.created_at, s.name, s.email FROM note n JOIN student s ON s.id = n.student_id
      WHERE n.status = 'new' ORDER BY n.created_at DESC LIMIT 100`).all();
  const mc = mailchimpState(env);
  const mcLog = await D.prepare('SELECT student_id, email, action, mode, status, detail, at FROM mailchimp_log ORDER BY id DESC LIMIT 20').all();
  const waitingJoin = (await backfillList(D, 5000, mc.mode)).length;
  const waitingTags = canTag(env) ? (await stepsBackfillList(D, 5000, mc.mode)).length : 0;
  return json({ ok: true, students, waiting: waiting.results || [], steps: STEPS, totalSteps: ALL_STEP_IDS.length, mailReady: mailState(env).ready,
    mailchimp: { mode: mc.mode, ready: mc.ready, reason: mc.reason, log: mcLog.results || [], waiting: waitingJoin + waitingTags, waitingJoin, waitingTags } });
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

  if (body.action === 'mc-test') {
    // A test join for an address Alexandru types himself.
    const email = clean(body.email, 200).toLowerCase();
    if (!looksLikeEmail(email)) return bad('Type the email to send the test join for.');
    const out = await testJoin(env, D, { email, first: clean(body.first, 60) || 'Test', last: clean(body.last, 60) || 'Join' });
    await log('mentor', 'mentor-mc-test', out.status);
    return json({ ok: true, status: out.status, detail: out.detail });
  }
  if (body.action === 'mc-backfill') {
    // Everyone with consent, not unsubscribed and not yet in Mailchimp; then,
    // with what is left of the press, the step tags of founders already in it
    // (a join carries its own). Ten a second, up to fifty a press so one
    // request stays well inside its time.
    const mode = mailchimpState(env).mode, tagging = canTag(env);
    const ids = await backfillList(D, 50, mode);
    const tagIds = tagging && ids.length < 50 ? await stepsBackfillList(D, 50 - ids.length, mode) : [];
    const tally = { ok: 0, test: 0, failed: 0, skipped: 0 }, tags = { ok: 0, test: 0, failed: 0, skipped: 0 };
    let n = 0;
    for (const [list, action, t] of [[ids, 'join', tally], [tagIds, 'tags', tags]]) {
      for (const sid of list) {
        if (n++) await new Promise((r) => setTimeout(r, 100));
        const out = await syncFounder(env, D, sid, action);
        t[out.status] = (t[out.status] || 0) + 1;
      }
    }
    const left = (await backfillList(D, 5000, mode)).length + (tagging ? (await stepsBackfillList(D, 5000, mode)).length : 0);
    await log('mentor', 'mentor-mc-backfill', JSON.stringify({ ...tally, tags, left }));
    return json({ ok: true, done: ids.length, ...tally, tagged: tagIds.length, tags, left });
  }

  const id = clean(body.student, 80);
  const me = id ? await D.prepare('SELECT id, email, name, tier FROM student WHERE id = ?').bind(id).first() : null;
  if (!me) return bad('Unknown founder.', 404);

  if (body.action === 'tier') {
    const tier = ['free', 'session', 'lab', 'hub', 'premium'].includes(body.tier) ? body.tier : null;
    if (!tier) return bad('Unknown step.');
    await D.prepare('UPDATE student SET tier=? WHERE id=?').bind(tier, me.id).run();
    await log(me.id, 'mentor-step', JSON.stringify({ from: me.tier || 'free', to: tier }));
    // The step tags go at once (API mode; the public form cannot tag, so it is
    // skipped there). Tags only accumulate: a lower step removes none.
    const mcOut = await syncFounder(env, D, me.id, 'tags');
    return json({ ok: true, mailchimp: mcOut.status, mailchimpDetail: mcOut.detail });
  }
  if (body.action === 'pause') {
    const paused = body.paused ? 1 : 0;
    await D.prepare(`INSERT INTO account_auth (student_id, paused) VALUES (?,?) ON CONFLICT(student_id) DO UPDATE SET paused=excluded.paused`).bind(me.id, paused).run();
    await log(me.id, paused ? 'mentor-pause' : 'mentor-unpause');
    // A paused founder leaves the Mailchimp audience (unsubscribed, never deleted).
    const mcOut = paused ? await syncFounder(env, D, me.id, 'unsubscribe') : null;
    return json({ ok: true, paused: !!paused, mailchimp: mcOut ? mcOut.status : null, mailchimpDetail: mcOut ? mcOut.detail : null });
  }
  if (body.action === 'delete') {
    // Typing the founder's email is the confirmation.
    if (clean(body.confirm, 200).toLowerCase() !== me.email) return bad('Type the founder’s email exactly to confirm.');
    // Out of Mailchimp first: unsubscribed, never a hard delete. The log row
    // goes with everything else below, so the address is not kept here.
    const mcOut = await syncFounder(env, D, me.id, 'unsubscribe', { keepLog: false });
    await D.batch([
      ...STUDENT_TABLES.map((t) => D.prepare(`DELETE FROM ${t} WHERE student_id = ?`).bind(me.id)),
      D.prepare('DELETE FROM mail_log WHERE email = ?').bind(me.email),
      D.prepare('DELETE FROM auth_log WHERE email = ?').bind(me.email),
      D.prepare('DELETE FROM student WHERE id = ?').bind(me.id),
    ]);
    // Logged without the founder's details, which are gone.
    await log('mentor', 'mentor-delete', `one founder deleted · mailchimp ${mcOut.status}`);
    return json({ ok: true, mailchimp: mcOut.status, mailchimpDetail: mcOut.detail });
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
