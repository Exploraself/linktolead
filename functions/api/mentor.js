// The mentor's own view: the dashboard, the account manager and each founder's
// work. Refuses to answer unless MENTOR_KEY is set AND the request carries it.
// No key set means no access, never open access.
//
// GET              every founder, with what the dashboard and the table need,
//                  and the notes waiting for a reply
// GET ?csv=1       the same list as a CSV file
// GET ?student=id  one founder's work, climb, stage changes, library
//                  downloads and their "Ask Alexandru" thread
// GET ?growth=id   one founder's Massive Growth Plan: ticks and what they
//                  wrote in its blanks, with the date of each change
// GET ?email=a@b   everything tied to one address: its accounts, ways in,
//                  calls, refunds, payments, letters and Mailchimp (functions/_trail.js)
// GET ?tags=1      every Mailchimp tag of the audience, sorted Keep / Old /
//                  Ask (functions/_tag-list.js). The key, or the 'mailchimp' right
// POST { action }  (a team account: only the rights ticked for it, functions/_team.js; the key: everything)
//                  reply (an answer in the thread, emailed as a letter) · tier (change step, and its step tags in Mailchimp) ·
//                  pause · series-hold (pause or resume the letters that
//                  follow each pain) · delete · signin-link · message · mc-test ·
//                  mc-backfill · book-confirm (one of the times of a
//                  request for a call: the person gets it with the Google
//                  Meet link) · book-links (the Meet link per kind of call).
//                  Every action is logged as an event; every
//                  Mailchimp call also in mailchimp_log.

import { teamList, teamAdd, teamRemove, teamDetails, isTeamMember, rightsOf, setRights, isOwner, TEAM_RIGHTS, ALL_RIGHTS, DEFAULT_RIGHTS, ACTION_RIGHT } from '../_team.js';
import { json, bad, db, now, mentorAccess, clean, looksLikeEmail, accountTables, newToken } from '../_shared.js';
import { DOMAIN_STEPS, WHATIF_STEPS, ALL_STEP_IDS } from '../_plans.js';
import { GROWTH_IDS, GROWTH_SQL, GROWTH_BLANK_IDS } from '../_growth.js';
import { sendLink, signinUrl } from './signin.js';
import { send, origin, mailState } from '../_mail.js';
import { mentorLetter, answerLetter, messageNotice, teamInvite, giftLetter, bookingConfirmedLetter } from '../_letters.js';
import { KINDS as BOOK_KINDS, BOOK_STATUS, BOOK_CLOSED, isOtherTime, bookingTables, bookingList, bookingRow, meetLink, meetLinks, setMeetLink } from '../_booking.js';
import { letterContext, mentors, saveMentor } from '../_mentor.js';
import { LIBRARY_ITEMS } from './library.js';
import { toolNames } from '../_tools.js';
import { thread } from './thread.js';
import { profile, unsubLink, deleteFounder } from '../_account.js';
import { mailchimpState, syncFounder, testJoin, backfillList, stepsBackfillList, canTag, stepName, TIER_ORDER, readTags, FORGOTTEN } from '../_mailchimp.js';
import { sortTags } from '../_tag-list.js';
import { webhookState, payments } from '../_stripe.js';
import { refundList, refundTable } from '../_refund.js';
import { holdLetters } from '../_series.js';
import { emailTrail } from '../_trail.js';

/** The actions a new team member cannot do until a right is ticked for them
 *  (Alexandru, 2 Nov 2026: first "only Alexandru", then "choose per team
 *  member what they can do … access like me on everything"). Checked here,
 *  on the server, against the member's own rights; the page only hides the
 *  buttons. The mentor key can always do everything. */
export const KEY_ONLY = ['team-add', 'team-remove', 'team-can', 'mentor-save', 'mentor-assign', 'mc-test', 'mc-backfill', 'pause', 'delete'];
/** What a new team member may do (Alexandru, 2 Nov 2026): since then each
 *  member's own rights decide (functions/_team.js TEAM_RIGHTS, ticked in
 *  /mentor → Settings → Team, up to Everything). These are the defaults. */
export const TEAM_CAN = DEFAULT_RIGHTS;
/** What this caller may do: every right with the key, else the member's own. */
const rightsFor = async (D, access) => (access.by === 'key' ? [...ALL_RIGHTS] : access.me ? await rightsOf(D, access.me.email) : []);
const NO_RIGHT = 'You don’t have this right yet. Alexandru can tick it for you in Settings → Team.';

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

const STAGE_NAMES = { build: 'Building', grow: 'Growing', scale: 'Scaling' };
/** The founder's own stage changes on /start, oldest first. */
export function stageChanges(events) {
  return (events || []).map((e) => { let d = {}; try { d = JSON.parse(e.detail) || {}; } catch { /* unreadable */ } return { from: STAGE_NAMES[d.from] || null, to: STAGE_NAMES[d.to] || null, at: e.at }; })
    .filter((x) => x.to);
}

/** Every founder, with what the cockpit needs. levels: how many of the
 *  twelve Blueprint levels hold at least one written answer, earlier or
 *  Version 4 (level_list: which ones). crossed: the doors they crossed ('blueprint', 'northstar';
 *  functions/api/cross.js). avatar: their profile photo, a small data: URL,
 *  or null. plan_ticks counts the Account Plans only; growth_ticks the
 *  Massive Growth Plan (growth_list: "id|done_at,…"). */
async function roster(D) {
  const rows = await D.prepare(`
    SELECT s.id, s.name, s.email, s.phone, s.company, s.tier,
      COALESCE((SELECT c.stage FROM compass c WHERE c.student_id = s.id), s.stage) AS stage, s.thin_domain,
      s.joined_at, s.last_seen_at, s.mailchimp_sent,
      (SELECT COUNT(*) FROM answer a WHERE a.student_id = s.id AND a.body <> '') AS written,
      (SELECT COUNT(*) FROM note n WHERE n.student_id = s.id AND n.status = 'new') AS open_notes,
      (SELECT updated_at FROM compass c WHERE c.student_id = s.id) AS compass_at,
      (SELECT c.flags_json FROM compass c WHERE c.student_id = s.id) AS ns_flags,
      (SELECT c.results_json FROM compass c WHERE c.student_id = s.id) AS ns_results,
      (SELECT COUNT(*) FROM plan_tick t WHERE t.student_id = s.id AND t.step_id NOT IN (${GROWTH_SQL})) AS plan_ticks,
      (SELECT COUNT(*) FROM plan_tick t WHERE t.student_id = s.id AND t.step_id IN (${GROWTH_SQL})) AS growth_ticks,
      (SELECT GROUP_CONCAT(t.step_id || '|' || t.done_at) FROM plan_tick t WHERE t.student_id = s.id AND t.step_id IN (${GROWTH_SQL})) AS growth_list,
      (SELECT COUNT(*) FROM growth_word g WHERE g.student_id = s.id) AS growth_words,
      (SELECT GROUP_CONCAT(DISTINCT e.detail) FROM event e WHERE e.student_id = s.id AND e.kind = 'library-download') AS library,
      (SELECT COUNT(DISTINCT a.level) FROM answer a WHERE a.student_id = s.id AND a.body <> '') AS levels,
      (SELECT GROUP_CONCAT(DISTINCT a.level) FROM answer a WHERE a.student_id = s.id AND a.body <> '') AS level_list,
      (SELECT GROUP_CONCAT(DISTINCT CAST(substr(w.key, 6, instr(substr(w.key, 6), '.') - 1) AS INTEGER)) FROM sheet w
        WHERE w.student_id = s.id AND w.key GLOB 'w.v4.[0-9]*.*' AND w.key NOT GLOB 'w.v4.[0-9]*.w.*' AND COALESCE(w.value, '') <> '') AS level_list_v4,
      (SELECT GROUP_CONCAT(DISTINCT e.detail) FROM event e WHERE e.student_id = s.id AND e.kind = 'crossed') AS crossed,
      (SELECT GROUP_CONCAT(DISTINCT e.detail) FROM event e WHERE e.student_id = s.id AND e.kind = 'tool-open') AS tools,
      (SELECT cs.day_sent || '|' || CASE WHEN cs.stopped_at IS NULL THEN '' ELSE 'stopped' END FROM course_sub cs WHERE cs.student_id = s.id AND cs.course = 'win12') AS course,
      (SELECT ss.series || '|' || ss.grp || '|' || ss.sent || '|' || ss.step || '|' || COALESCE(ss.stop_why, '') || '|' || ss.test
        FROM series_sub ss WHERE ss.student_id = s.id ORDER BY ss.started_at DESC LIMIT 1) AS series,
      p.series_hold,
      p.avatar,
      p.industry, p.source, p.consent, p.unsubscribed, p.mailchimp_status, p.mailchimp_at, p.signup_type, p.company, p.interest, p.landing, p.utm_source, p.utm_medium, p.utm_campaign, p.utm_content,
      CASE WHEN au.pass_hash IS NULL THEN 0 ELSE 1 END AS has_password, COALESCE(au.paused, 0) AS paused
    FROM student s
      LEFT JOIN student_profile p ON p.student_id = s.id
      LEFT JOIN account_auth au ON au.student_id = s.id
    ORDER BY COALESCE(s.last_seen_at, s.joined_at) DESC LIMIT 2000`).all();
  // A level counts as written with an earlier seven-step answer OR any
  // Version 4 answer (w.v4.<level>.…, never the welcome page's w.v4.<level>.w.…):
  // the same rule as levelsWritten in functions/_series.js, so "Launchpad
  // done" and "Ready for the Boardroom" match the letters (2 Nov 2026).
  return (rows.results || []).map(({ level_list_v4: v4, ...s }) => {
    const L = [...new Set([s.level_list, v4].flatMap((x) => String(x || '').split(',')).map((x) => parseInt(x, 10)).filter((n) => n >= 1 && n <= 12))].sort((a, b) => a - b);
    return { ...s, levels: L.length, level_list: L.join(',') };
  });
}

const LANDING_NAMES = { road1: 'Road 1', road2: 'Road 2', road3: 'Road 3', road4: 'Road 4', road5: 'Road 5 · The Boardroom', north1: 'North 1', north2: 'North 2', north3: 'North 3', compass: 'North Star box', summit: 'The Summit', exploraself: 'exploraself.com' };
const CSV_COLS = [['name', 'Name'], ['email', 'Email'], ['joined_at', 'Joined'], ['last_seen_at', 'Last seen'], ['stage', 'Stage'], ['step', 'Step'],
  ['signup', 'Sign-up form'], ['landing_name', 'Landing'], ['utm_source', 'utm_source'], ['utm_medium', 'utm_medium'], ['utm_campaign', 'utm_campaign'], ['utm_content', 'utm_content'], ['company_name', 'Company'], ['interest', 'Interest'], ['industry', 'Industry'],
  ['compass', 'North Star done'], ['plan_ticks', 'Plan steps done'], ['library_names', 'Library'], ['tool_names', 'Tools'], ['course_line', '12 Days to Start Winning'], ['has_password', 'Has password'], ['consent', 'Consent'], ['unsubscribed', 'Unsubscribed'], ['paused', 'Paused'], ['mailchimp_status', 'Mailchimp'],
  ['ns_wants', 'Wants (North Star)'], ['ns_pains', 'Hurts (North Star)'], ['ns_values', 'Cares about (North Star)'], ['ns_first', 'Needs them first'], ['ns_team', 'Works with'],
  ['growth_plan', 'Growth plan'],
  ['group', 'Group'], ['levels', 'Blueprint levels'], ['crossed_names', 'Crossed']];
const NS = {
  pains: { clients: 'Not enough clients', cash: 'Cash is tight', time: 'No time for myself', alone: 'Doing everything myself', team: 'Team not stepping up', direction: 'Unclear direction', price: 'Prices feel too low', switch: 'I can’t switch off' },
  wants: { freedom: 'More free time', income: 'Higher income', steady: 'Steady clients', team: 'A team I trust', clarity: 'Clarity on direction', grow: 'A new market' },
  values: { family: 'Family', faith: 'Faith', freedom: 'Freedom', health: 'Health', integrity: 'Integrity', growth: 'Growth', service: 'Service', legacy: 'Legacy' },
  team: { solo: 'Just me', help: 'Me and some help', team: 'A team' },
  sides: ['Lead yourself', 'Lead your people', 'Lead your business', 'Lead the market'] };
/** What one founder told the North Star, as words for the CSV (same rule as
 *  told() in public/mentor/dash.js). */
export function nsWords(s) {
  let f = {}, r = {};
  try { f = JSON.parse(s.ns_flags || 'null') || {}; } catch { f = {}; }
  try { r = JSON.parse(s.ns_results || 'null') || {}; } catch { r = {}; }
  const names = (list, map) => (Array.isArray(list) ? list : []).filter((k, i, a) => map[k] && a.indexOf(k) === i).map((k) => map[k]).join('; ');
  const sc = Array.isArray(r.scores) ? r.scores : [], an = Array.isArray(r.answered) ? r.answered : [];
  let first = -1;
  sc.forEach((v, i) => { if (an[i] && Number.isFinite(Number(v)) && (first < 0 || v < sc[first])) first = i; });
  return { ns_wants: names([f.want, f.want2], NS.wants), ns_pains: names(f.pains, NS.pains), ns_values: names(f.values, NS.values),
    ns_first: first >= 0 ? NS.sides[first] : '', ns_team: NS.team[f.team] || '' };
}
/** The cockpit's groups, the same rule as groupOf in public/mentor/dash.js
 *  (a test holds them equal): North Star done = compass_at; Blueprint
 *  started = an answer written. */
export function groupName(s) {
  const n = !!s.compass_at, b = Number(s.written) > 0 || Number(s.levels) > 0;
  return n && b ? 'Both' : n ? 'North Star only' : b ? 'Blueprint only' : '';
}
const CROSSED = { blueprint: 'North Star → Blueprint', northstar: 'Blueprint → North Star' };
/** The 12 days as words: "day 5 of 13", "day 5 of 13 · stopped", "welcome pending". */
export function courseLine(v) {
  if (!v) return '';
  const [d, st] = String(v).split('|'), n = Number(d);
  return (n < 0 ? 'welcome pending' : n === 0 ? 'welcome sent' : `day ${n} of 13`) + (st ? ' · stopped' : '');
}
export function toCSV(list) {
  // Quoted, and a leading = + - @ is defused so a spreadsheet never runs it.
  const cell = (v) => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
  const yes = (v) => (v ? 'yes' : 'no');
  const books = (v) => String(v || '').split(',').filter((k) => LIBRARY_ITEMS[k]).map((k) => LIBRARY_ITEMS[k].name).join('; ');
  const row = (s) => ({ ...s, step: STEPS[s.tier || 'free'] || s.tier, library_names: books(s.library), signup: s.signup_type || '',
    company_name: s.company === '' ? 'No company yet' : s.company || '', landing_name: LANDING_NAMES[s.landing] || '', compass: yes(s.compass_at), has_password: yes(s.has_password), consent: yes(s.consent), unsubscribed: yes(s.unsubscribed), paused: yes(s.paused),
    ...nsWords(s), growth_plan: Number(s.growth_ticks) || 0, group: groupName(s), levels: s.levels || 0, crossed_names: String(s.crossed || '').split(',').filter((k) => CROSSED[k]).map((k) => CROSSED[k]).join('; '),
    tool_names: toolNames(s.tools).join('; '), course_line: courseLine(s.course) });
  return [CSV_COLS.map(([, h]) => cell(h)).join(','), ...list.map((s) => { const r = row(s); return CSV_COLS.map(([k]) => cell(r[k])).join(','); })].join('\r\n') + '\r\n';
}

export async function onRequestGet({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  const access = await mentorAccess(request, env, D);
  if (!access.ok) return bad('Not authorised.', 401);
  await accountTables(D);
  const url = new URL(request.url);
  // The team (functions/_team.js): who has every level, the toolkit without a
  // code, and /mentor with their own account. Only the key may change it.
  const rights = await rightsFor(D, access);
  if (url.searchParams.get('team')) return json({ ok: true, team: await teamDetails(D, await teamList(D, env)), canEdit: rights.includes('team'), rights: TEAM_RIGHTS, me: access.me ? access.me.email : null });
  // Every tag of the audience, sorted Keep / Old / Ask against the code's own
  // list (functions/_tag-list.js), so Alexandru deletes from a clear list.
  // A Mailchimp tool: the key only.
  if (url.searchParams.get('tags')) {
    if (!rights.includes('mailchimp')) return bad(NO_RIGHT, 403);
    const live = await readTags(env);
    if (!live.ok) return json({ ok: true, read: false, why: live.why });
    const kept = await D.prepare("SELECT DISTINCT landing_tag AS t FROM student_profile WHERE landing_tag IS NOT NULL AND landing_tag <> ''").all();
    const mc = mailchimpState(env);
    const waiting = canTag(env) ? (await stepsBackfillList(D, 5000, mc.mode)).length : 0;
    return json({ ok: true, read: true, total: live.total, waiting, ...sortTags(live.tags, { kept: (kept.results || []).map((r) => r.t) }) });
  }
  // Payments (functions/_stripe.js): the mode, the webhook, the latest
  // payments. The key only.
  if (url.searchParams.get('stripe')) {
    if (!rights.includes('payments')) return bad(NO_RIGHT, 403);
    const hook = await webhookState(D, env);
    return json({ ok: true, ...hook, payments: await payments(D, 30) });
  }
  const one = url.searchParams.get('student');

  // "Everything for this email" (Alexandru, 3 Nov 2026): read-only.
  if (url.searchParams.has('email')) return json({ ok: true, ...(await emailTrail(D, env, url.searchParams.get('email'), { money: rights.includes('payments') })) });

  // The drawer's Growth Plan: ticks and words, nothing else.
  const gp = url.searchParams.get('growth');
  if (gp) {
    const [ticks, words] = await Promise.all([
      D.prepare(`SELECT step_id, done_at FROM plan_tick WHERE student_id = ? AND step_id IN (${GROWTH_SQL}) ORDER BY done_at`).bind(gp).all(),
      D.prepare('SELECT blank_id, text, updated_at FROM growth_word WHERE student_id = ? ORDER BY updated_at').bind(gp).all(),
    ]);
    return json({ ok: true, ticks: ticks.results || [], words: (words.results || []).filter((w) => GROWTH_BLANK_IDS.includes(w.blank_id)) });
  }

  if (one) {
    const me = await D.prepare('SELECT * FROM student WHERE id = ?').bind(one).first();
    if (!me) return bad('Not found.', 404);
    const [answers, sheets, compass, notes, prof, ticks, growth, auth, messages, steps, stages, library, asked] = await Promise.all([
      D.prepare('SELECT stage,level,domain,step,body,updated_at FROM answer WHERE student_id=? ORDER BY level,domain,step').bind(one).all(),
      D.prepare('SELECT key,value FROM sheet WHERE student_id=?').bind(one).all(),
      D.prepare('SELECT * FROM compass WHERE student_id=?').bind(one).first(),
      D.prepare('SELECT id,level,domain,body,status,reply,created_at FROM note WHERE student_id=? ORDER BY created_at DESC').bind(one).all(),
      D.prepare('SELECT industry,consent,consent_at,source,unsubscribed,unsub_at,signup_type,company,interest,landing,utm_source,utm_medium,utm_campaign,utm_content,utm_term,mentor_id,tz FROM student_profile WHERE student_id=?').bind(one).first(),
      D.prepare(`SELECT step_id,done_at FROM plan_tick WHERE student_id=? AND step_id NOT IN (${GROWTH_SQL}) ORDER BY done_at`).bind(one).all(),
      D.prepare(`SELECT step_id,done_at FROM plan_tick WHERE student_id=? AND step_id IN (${GROWTH_SQL}) ORDER BY done_at`).bind(one).all(),
      D.prepare('SELECT pass_hash IS NOT NULL AS has_password, paused, set_at FROM account_auth WHERE student_id=?').bind(one).first(),
      D.prepare('SELECT subject,body,channel,sent_at,read_at FROM message WHERE student_id=? AND note_id IS NULL ORDER BY sent_at DESC LIMIT 20').bind(one).all(),
      D.prepare("SELECT detail, at FROM event WHERE student_id=? AND kind='mentor-step' ORDER BY id").bind(one).all(),
      D.prepare("SELECT detail, at FROM event WHERE student_id=? AND kind='stage-change' ORDER BY id").bind(one).all(),
      D.prepare("SELECT detail AS item, MIN(at) AS at FROM event WHERE student_id=? AND kind='library-download' GROUP BY detail ORDER BY MIN(at)").bind(one).all(),
      thread(D, one),
    ]);
    delete me.diag_json;
    return json({ ok: true, student: me, answers: answers.results || [], work: sheets.results || [],
      compass: compass || null, notes: notes.results || [], profile: prof || null, auth: auth || null, messages: messages.results || [],
      climb: climbOf(me, steps.results || []), stages: stageChanges(stages.results || []), thread: asked.items,
      library: (library.results || []).filter((r) => LIBRARY_ITEMS[r.item]).map((r) => ({ item: r.item, name: LIBRARY_ITEMS[r.item].name, at: r.at })),
      ticks: (ticks.results || []).map((t) => ({ ...t, domain: STEP[t.step_id] ? STEP[t.step_id].domain : null, title: STEP[t.step_id] ? STEP[t.step_id].title : t.step_id })),
      growth: growth.results || [], totalGrowth: GROWTH_IDS.length,
      mentors: await mentors(D) });
  }

  const students = await roster(D);
  if (url.searchParams.get('csv')) {
    return new Response(toCSV(students), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="founders.csv"', 'cache-control': 'no-store' } });
  }
  const waiting = await D.prepare(`SELECT n.id, n.student_id, n.body, n.level, n.domain, n.created_at, s.name, s.email FROM note n JOIN student s ON s.id = n.student_id
      WHERE n.status = 'new' ORDER BY n.created_at DESC LIMIT 100`).all();
  const mc = mailchimpState(env);
  const mcLog = await D.prepare('SELECT student_id, email, action, mode, status, detail, at FROM mailchimp_log ORDER BY id DESC LIMIT 20').all();
  const waitingJoin = (await backfillList(D, 5000, mc.mode)).length;
  const waitingTags = canTag(env) ? (await stepsBackfillList(D, 5000, mc.mode)).length : 0;
  // Addresses Mailchimp deleted for good: shown in plain words, never as a failure.
  const gone = await D.prepare("SELECT DISTINCT email FROM mailchimp_log WHERE status = 'forgotten' OR detail LIKE '%Forgotten Email%'").all();
  // Their own words: the newest Blueprint (Version 4) worksheet answers; the
  // page builds whole sentences from them (theirWords in dash.js).
  const words = await D.prepare(`SELECT w.student_id, w.key, w.value, w.updated_at, s.name, s.email FROM sheet w JOIN student s ON s.id = w.student_id
      WHERE w.key LIKE 'w.v4.%' AND w.value <> '' ORDER BY w.updated_at DESC LIMIT 600`).all();
  // Payments, for the numbers at the top of Grow (Alexandru, 2 Nov 2026):
  // who paid, which step, live or test, when. The amount only for those who
  // may see the payments.
  await payments(D, 1);
  const seeMoney = rights.includes('payments');
  const paid = ((await D.prepare('SELECT student_id, step, amount, mode, at FROM payment ORDER BY at DESC LIMIT 2000').all()).results || [])
    .map((x) => ({ student_id: x.student_id, step: x.step, mode: x.mode, at: x.at, ...(seeMoney ? { amount: x.amount } : {}) }));
  // Who is looking, for the greeting on Today: a team member by name; the key is the default mentor.
  const you = access.by === 'team' && access.me ? { name: access.me.name || '', team: true, can: rights } : { key: true, can: rights };
  // Refund requests from Base Camp (Alexandru, 2 Nov 2026): the Refunds tab, in red.
  const refunds = await refundList(D);
  // Requests for a call (functions/_booking.js), newest first, and the Google
  // Meet link per kind: Inbox → Bookings, and Settings → Booking links.
  const bookings = await bookingList(D, 100);
  const bookLinks = await meetLinks(D);
  return json({ ok: true, you, students, paid, refunds, words: words.results || [], waiting: waiting.results || [], bookings, bookLinks, steps: STEPS, totalSteps: ALL_STEP_IDS.length, totalGrowth: GROWTH_IDS.length, mailReady: mailState(env).ready, mentors: await mentors(D),
    mailchimp: { mode: mc.mode, ready: mc.ready, reason: mc.reason, log: mcLog.results || [], waiting: waitingJoin + waitingTags, waitingJoin, waitingTags,
      forgotten: (gone.results || []).map((r) => r.email).filter(Boolean), forgottenWhy: FORGOTTEN } });
}

/** Every action a team member made, once it succeeded, logged on their own
 *  account ('team-did'), so the Team box shows who did what. */
export async function onRequestPost(ctx) {
  const copy = ctx.request.clone();
  const res = await post(ctx);
  if (res.status !== 200) return res;
  try {
    const D = db(ctx.env), access = await mentorAccess(copy, ctx.env, D);
    if (access.ok && access.by === 'team' && access.me) {
      const b = await copy.json().catch(() => ({}));
      if (ACTION_RIGHT[b.action]) {
        await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(access.me.id, 'team-did', now(), JSON.stringify({ action: b.action, student: clean(b.student, 80) || null })).run();
      }
    }
  } catch { /* the action itself already succeeded */ }
  return res;
}

async function post({ request, env }) {
  const D = db(env);
  if (!D) return bad('Not configured.', 503);
  const access = await mentorAccess(request, env, D);
  if (!access.ok) return bad('Not authorised.', 401);
  let body;
  try { body = await request.json(); } catch { return bad('Could not read that.'); }
  await accountTables(D);
  const log = (student, kind, detail = null) => D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(student, kind, now(), detail).run();
  const rights = await rightsFor(D, access);
  if (access.by !== 'key' && !(ACTION_RIGHT[body.action] && rights.includes(ACTION_RIGHT[body.action]))) {
    return bad(ACTION_RIGHT[body.action] ? NO_RIGHT : 'Unknown action.', 403);
  }

  // What a team member may do (Alexandru, 2 Nov 2026): the key, or a member
  // with the 'team' right, ticks each member's rights. Alexandru's own
  // addresses always have every right; nobody changes their own.
  if (body.action === 'team-can') {
    const email = clean(body.email, 200).toLowerCase();
    if (!looksLikeEmail(email) || !(await isTeamMember(D, email, env))) return bad('That address is not on the team.');
    if (isOwner(email)) return bad('Alexandru’s own address always has every right.');
    if (access.by !== 'key' && access.me && String(access.me.email || '').toLowerCase() === email) return bad('Nobody changes their own rights. Ask Alexandru.', 403);
    if (!Array.isArray(body.can)) return bad('Choose the rights first.');
    return json({ ok: true, email, can: await setRights(D, email, body.can, now()) });
  }

  // A refund request handled (Alexandru gets in touch himself; this only
  // marks it done, or open again). The payments right.
  if (body.action === 'refund-done') {
    await refundTable(D);
    const id = clean(body.id, 80), done = body.done !== false;
    const by = access.by === 'team' && access.me ? (access.me.name || access.me.email || 'team') : 'Alexandru';
    const r = await D.prepare('UPDATE refund_ask SET done_at = ?, done_by = ? WHERE id = ?').bind(done ? now() : null, done ? by : null, id).run();
    if (!r.meta || !r.meta.changes) return bad('That request is not there any more.', 404);
    return json({ ok: true, id, done });
  }

  if (body.action === 'invite') {
    // Invite a founder by email, at the step Alexandru chooses, free
    // (Alexandru, 2 Nov 2026). A new address gets a free account (no password
    // yet, no consent to letters, so nothing goes to Mailchimp until they say
    // yes); an existing one is moved up, never down. The step opens now, and
    // the gift letter signs them in (and asks a new account for a password).
    const email = clean(body.email, 200).toLowerCase();
    if (!looksLikeEmail(email)) return bad('That email does not look complete.');
    const step = TIER_ORDER.includes(body.step) ? body.step : null;
    if (!step) return bad('Choose the step to open for them.');
    if (!mailState(env).ready) return bad('Email is not switched on yet, so the invitation cannot go.', 503);
    const first = clean(body.first, 60).split(/\s+/)[0] || '';
    let me = await D.prepare('SELECT id, email, name, tier FROM student WHERE email = ?').bind(email).first();
    const fresh = !me;
    if (fresh) {
      const id = newToken(), stamp = now();
      await D.prepare('INSERT INTO student (id,email,name,phone,company,stage,tier,joined_at,last_seen_at) VALUES (?,?,?,?,?,?,?,?,?)')
        .bind(id, email, first, '', '', null, 'free', stamp, stamp).run();
      await profile(D, id, { industry: null, consent: false, source: 'mentor-invite' });
      await D.prepare("UPDATE student_profile SET signup_type = 'invited' WHERE student_id = ?").bind(id).run();
      await log(id, 'signup', 'mentor-invite');
      me = { id, email, name: first, tier: 'free' };
    } else if (TIER_ORDER.indexOf(step) < TIER_ORDER.indexOf(me.tier || 'free') || (step === (me.tier || 'free') && step !== 'free')) {
      return bad(`${me.name || email} already has ${STEPS[me.tier || 'free']}. Nothing changed, and no letter went.`, 409);
    }
    if (step !== (me.tier || 'free')) {
      await D.prepare('UPDATE student SET tier=? WHERE id=?').bind(step, me.id).run();
      await log(me.id, 'mentor-step', JSON.stringify({ from: me.tier || 'free', to: step, gift: true }));
      await syncFounder(env, D, me.id, 'tags').catch(() => null);
    }
    const auth = await D.prepare('SELECT pass_hash FROM account_auth WHERE student_id = ?').bind(me.id).first();
    const needsPassword = !(auth && auth.pass_hash);
    const base = origin(request);
    const url = await signinUrl(D, base, me.id, { reset: needsPassword, ttl: 7 * 24 * 3600_000 });
    const p = await profile(D, me.id);
    const ctx = await letterContext(D, me.id);
    const r = await send(env, { to: email, ...giftLetter(base, { first: first || String(me.name || '').split(' ')[0], step, url, fresh: needsPassword, to: email, ...ctx }),
      why: 'Alexandru invited this address to The Founder’s Blueprint on ExploraSelf.', unsubUrl: unsubLink(base, p) });
    await log(me.id, r.ok ? 'mentor-invite' : 'mentor-invite-failed', JSON.stringify({ step, fresh, why: r.ok ? null : r.why || null }));
    return json({ ok: true, id: me.id, fresh, step, sent: r.ok, why: r.ok ? null : (r.why || 'The email did not send.') });
  }

  if (body.action === 'team-add' || body.action === 'team-remove') {
    const email = clean(body.email, 200).toLowerCase();
    if (!looksLikeEmail(email)) return bad('That email does not look complete.');
    if (body.action === 'team-remove') {
      if (access.by !== 'key' && access.me && String(access.me.email || '').toLowerCase() === email) return bad('You can’t remove yourself. Ask Alexandru.', 403);
      await teamRemove(D, email); return json({ ok: true, team: await teamList(D, env) });
    }
    await teamAdd(D, email, now());
    // The invitation (Alexandru, 2 Nov 2026): signed in at one tap when the
    // address has an account, else "make your free account" first.
    const base = origin(request);
    const acct = await D.prepare('SELECT id, name FROM student WHERE email = ?').bind(email).first();
    const url = acct ? await signinUrl(D, base, acct.id, { ttl: 7 * 24 * 3600_000 }) : '';
    const first = acct ? String(acct.name || '').trim().split(/\s+/)[0] : '';
    const r = await send(env, { to: email, ...teamInvite(base, { to: email, first, signinUrl: url }),
      why: 'Alexandru added this address to the ExploraSelf team in the mentor cockpit.' });
    if (acct) await log(acct.id, r.ok ? 'team-invite' : 'team-invite-failed', r.ok ? null : r.why || null);
    return json({ ok: true, team: await teamList(D, env), invited: r.ok, inviteWhy: r.ok ? null : (r.why || 'The email did not send.') });
  }

  if (body.action === 'reply' && body.note) {
    // An answer in "Ask Alexandru": kept on the question, added to the
    // founder's thread as a message, and emailed as a letter (Base Camp
    // only for a founder who unsubscribed, or when email is off).
    const n = await D.prepare('SELECT n.id, n.student_id, n.body, n.domain, s.email, s.name, s.tier FROM note n JOIN student s ON s.id = n.student_id WHERE n.id = ?').bind(clean(body.note, 80)).first();
    const answer = clean(body.reply, 3000);
    if (!n) return bad('Unknown question.', 404);
    if (!answer) return bad('Write the answer first.');
    const stamp = now();
    await D.prepare('UPDATE note SET reply=?, status=?, answered_at=? WHERE id=?').bind(answer, 'answered', stamp, n.id).run();
    const p = await profile(D, n.student_id);
    let emailed = false;
    // A refund conversation (Alexandru, 3 Nov 2026): the email is only a
    // notification from "your mentor at ExploraSelf", sent even after an
    // unsubscribe (it is about their own payment); the words stay in Base Camp.
    if (n.domain === 'refund' && mailState(env).ready) {
      const base = origin(request);
      const r = await send(env, { to: n.email, ...messageNotice(base, { first: String(n.name || '').split(' ')[0], url: `${base}/ground-plan/#ask` }),
        why: 'You asked for a refund on linktolead.exploraself.com, and there is an answer in your conversation.', unsubUrl: '' });
      emailed = r.ok;
    } else if (!p.unsubscribed && mailState(env).ready) {
      const base = origin(request);
      const ctx = await letterContext(D, n.student_id);
      const r = await send(env, { to: n.email, ...answerLetter(base, { first: String(n.name || '').split(' ')[0], question: n.body, answer, to: n.email, tier: n.tier, ...ctx }),
        why: `You asked ${ctx.mentor.first} a question in your free ExploraSelf account.`, unsubUrl: unsubLink(base, p) });
      emailed = r.ok;
    }
    await D.prepare('INSERT INTO message (id, student_id, subject, body, channel, sent_at, note_id) VALUES (?,?,?,?,?,?,?)')
      .bind(newToken(), n.student_id, 'An answer to your question', answer, emailed ? 'both' : 'plan', stamp, n.id).run();
    await log(n.student_id, 'mentor-reply', emailed ? 'both' : 'plan');
    return json({ ok: true, emailed, unsubscribed: !!p.unsubscribed });
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

  if (body.action === 'mentor-save') {
    // A mentor the letters can come from: name, title, photo, signature and
    // reply address. "Everyone's mentor" makes them the default.
    const out = await saveMentor(D, { id: body.id, name: body.name, title: body.title, photo: body.photo, signature: body.signature, email: body.email, isDefault: !!body.isDefault });
    if (out.error) return bad(out.error);
    await log('mentor', 'mentor-save', out.mentor.id);
    return json({ ok: true, mentor: out.mentor, mentors: await mentors(D) });
  }

  if (body.action === 'book-links') {
    // The Google Meet link for each kind of call, pasted once (Alexandru,
    // 2 Nov 2026). Every link is checked before any is saved; empty clears it.
    const want = {};
    for (const k of Object.keys(BOOK_KINDS)) {
      if (body[k] === undefined) continue;
      const raw = String(body[k] ?? '').trim(), link = meetLink(raw);
      if (raw && !link) return bad(`The ${BOOK_KINDS[k].setting} must be a Google Meet link: it starts with https://meet.google.com/`);
      want[k] = link;
    }
    for (const [k, link] of Object.entries(want)) await setMeetLink(D, k, link, now());
    await log('mentor', 'mentor-book-links', Object.keys(want).join(',') || null);
    return json({ ok: true, links: await meetLinks(D) });
  }

  if (body.action === 'book-confirm') {
    // One of the times a person suggested (functions/api/book.js). The
    // confirmation leaves first; only then is the request marked confirmed
    // (AGENTS.md rule 6). A request is confirmed once: a second tap sends nothing.
    await bookingTables(D);
    const b = await D.prepare('SELECT * FROM booking WHERE id = ?').bind(clean(body.booking, 80)).first();
    if (!b) return bad('Unknown request.', 404);
    const row = bookingRow(b);
    if (b.status === 'confirmed' && !body.again) return bad('This request is already confirmed. Nothing was sent again.', 409);
    if (BOOK_CLOSED.includes(b.status)) return bad('This request is closed. Reopen it first.', 409);
    // One of their times, or (Alexandru, 2 Nov 2026: "full control") a
    // time he picks himself, which the email then names.
    const own = !row.times.includes(body.time);
    const time = own ? (isOtherTime(body.time) ? new Date(body.time).toISOString() : '') : body.time;
    if (!time) return bad('Choose one of their times, or a time in the next 60 days.');
    if (Date.parse(time) <= Date.now()) return bad('That time has passed. Reply to them with a new one.');
    const meet = (await meetLinks(D))[b.kind];
    if (!meet) return bad(`Paste the ${BOOK_KINDS[b.kind].setting} first, in Settings → Booking links.`);
    if (!mailState(env).ready) return bad('Email is not switched on yet, so the confirmation cannot go.', 503);
    const claim = await D.prepare("UPDATE booking SET status = 'sending' WHERE id = ? AND status = ?").bind(b.id, b.status).run();
    if (!claim || !claim.meta || claim.meta.changes !== 1) return bad('This request is being confirmed already. Refresh in a moment.', 409);
    const base = origin(request);
    const r = await send(env, { to: b.email, ...bookingConfirmedLetter(base, { first: String(b.name || '').split(/\s+/)[0], kind: b.kind, time, meet, tz: b.tz, to: b.email }),
      why: b.kind === 'boardroom' ? 'You asked for your 1:1 with Alexandru at linktolead.exploraself.com.' : 'You asked for a free discovery call with Alexandru at linktolead.exploraself.com.' });
    if (!r.ok) {
      await D.prepare('UPDATE booking SET status = ? WHERE id = ?').bind(b.status, b.id).run();
      return bad('The confirmation did not send. Nothing changed; try again in a minute.', 502);
    }
    const by = access.by === 'key' ? 'key' : String((access.me && access.me.email) || 'team');
    await D.prepare("UPDATE booking SET status = 'confirmed', confirmed_time = ?, confirmed_at = ?, confirmed_by = ? WHERE id = ?").bind(time, now(), by, b.id).run();
    if (b.student_id) await log(b.student_id, 'booking-confirmed', JSON.stringify({ kind: b.kind, time })).catch(() => {});
    return json({ ok: true, time, email: b.email, own });
  }

  if (body.action === 'book-status' || body.action === 'book-note' || body.action === 'book-delete') {
    // Full control of a request (Alexandru, 2 Nov 2026): file it as held,
    // no-show, declined or cancelled (no email goes), reopen it, keep a private
    // note, or delete it. Each one is logged with who did it.
    await bookingTables(D);
    const b = await D.prepare('SELECT * FROM booking WHERE id = ?').bind(clean(body.booking, 80)).first();
    if (!b) return bad('Unknown request.', 404);
    const by = access.by === 'key' ? 'key' : String((access.me && access.me.email) || 'team');
    if (body.action === 'book-note') {
      const note = String(body.note ?? '').replace(/\u0000/g, '').slice(0, 2000);
      await D.prepare('UPDATE booking SET note = ? WHERE id = ?').bind(note, b.id).run();
      await log('mentor', 'mentor-book-note', b.id);
      return json({ ok: true });
    }
    if (body.action === 'book-delete') {
      await D.prepare('DELETE FROM booking WHERE id = ?').bind(b.id).run();
      await log('mentor', 'mentor-book-delete', b.kind);
      return json({ ok: true });
    }
    const to = String(body.status || '');
    if (to === 'open') {
      const back = b.confirmed_time ? 'confirmed' : 'asked';
      await D.prepare('UPDATE booking SET status = ?, closed_at = NULL, closed_by = NULL WHERE id = ?').bind(back, b.id).run();
      await log('mentor', 'mentor-book-open', b.id);
      return json({ ok: true, status: back });
    }
    if (!BOOK_CLOSED.includes(to)) return bad(`Say one of: ${BOOK_CLOSED.map((k) => BOOK_STATUS[k]).join(', ')}, or reopen.`);
    if ((to === 'held' || to === 'noshow') && b.status !== 'confirmed') return bad('Confirm a time first: a call is held or missed only once it has a time.');
    await D.prepare('UPDATE booking SET status = ?, closed_at = ?, closed_by = ? WHERE id = ?').bind(to, now(), by, b.id).run();
    if (b.student_id) await log(b.student_id, `booking-${to}`, b.kind).catch(() => {});
    return json({ ok: true, status: to });
  }

  const id = clean(body.student, 80);
  const me = id ? await D.prepare('SELECT id, email, name, tier FROM student WHERE id = ?').bind(id).first() : null;
  if (!me) return bad('Unknown founder.', 404);

  if (body.action === 'mentor-assign') {
    // This founder's letters come from this mentor; empty = everyone's mentor.
    const list = await mentors(D), want = clean(body.mentor, 40);
    if (want && !list.some((m) => m.id === want)) return bad('Unknown mentor.');
    await D.prepare('UPDATE student_profile SET mentor_id = ? WHERE student_id = ?').bind(want || null, me.id).run();
    await log(me.id, 'mentor-assign', want || 'default');
    return json({ ok: true, mentor: want || '' });
  }
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
  if (body.action === 'series-hold') {
    // The letters that follow each pain (functions/_series.js): pause them,
    // or resume them after a question in Ask Alexandru paused them.
    await holdLetters(D, me.id, !!body.hold, 'mentor');
    return json({ ok: true, hold: !!body.hold });
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
    const mcOut = await deleteFounder(env, D, me);
    // Logged without the founder's details, which are gone.
    await log('mentor', 'mentor-delete', `one founder deleted · mailchimp ${mcOut.status}`);
    return json({ ok: true, mailchimp: mcOut.status, mailchimpDetail: mcOut.detail });
  }
  if (body.action === 'signin-link' || body.action === 'reset-link') {
    if (!mailState(env).ready) return bad('Email is not switched on yet.', 503);
    const r = await sendLink(env, D, origin(request), me, 'start', { reset: body.action === 'reset-link' });
    await log(me.id, body.action === 'reset-link' ? 'mentor-reset-link' : 'mentor-signin-link', r.ok ? null : r.why);
    return r.ok ? json({ ok: true }) : bad('It did not send. Try again in a minute.', 502);
  }
  if (body.action === 'message') {
    const subject = clean(body.subject, 160), text = clean(body.body, 4000);
    if (!subject || !text) return bad('A subject and a message, please.');
    let channel = ['email', 'plan', 'both'].includes(body.channel) ? body.channel : 'plan';
    const p = await profile(D, me.id);
    // Unsubscribed founders get it at their Base Camp only.
    const emailWanted = channel !== 'plan';
    const canEmail = !p.unsubscribed && mailState(env).ready;
    if (emailWanted && !canEmail) channel = 'plan';
    let emailed = false;
    if (emailWanted && canEmail) {
      const base = origin(request);
      const ctx = await letterContext(D, me.id);
      const r = await send(env, { to: me.email, ...mentorLetter(base, { subject, body: text, to: me.email, tier: me.tier, ...ctx }),
        why: `${ctx.mentor.first} and the team wrote to you about your free ExploraSelf account.`, unsubUrl: unsubLink(base, p) });
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
