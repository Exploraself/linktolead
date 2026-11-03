// "12 Days to Start Winning" (Alexandru, 2 Nov 2026): a free tool, sent by the
// site through Resend (functions/_mail.js), never by a Mailchimp automation.
//
// The founder taps "Start my 12 days" on /12-days/ (functions/api/course.js).
// The welcome goes at once. Then one letter a day: Day 1 the next morning,
// from 8:00 in the founder's own time zone, through Day 12, and Day 13 (what
// next) last. Nothing more after Day 13.
//
// An hourly cron (worker.js `scheduled`, wrangler.toml [triggers]) calls
// sendDue(). Each founder gets at most one letter per day of their own
// calendar: a missed hour sends later that day, a missed day shifts the course
// by a day, and nobody ever gets two in one day: not even with the letters
// that follow each pain (functions/_series.js), which run first in the hour,
// so on a day one of those went, the next 12-day letter waits for tomorrow
// (the welcome, which the founder asked for, never waits). Unsubscribing (the footer
// link, the profile menu) or "Stop the letters" on /12-days/ ends it.
//
// The words live in functions/_course-letters.js, checked word for word
// against A New Way of Winning. The frame (greeting, good word, reply, the
// signature, the free assessments) is letter() in functions/_letters.js.

import { now } from './_shared.js';
import { letter, link, button, nameCase } from './_letters.js';
import { COURSE_LETTERS } from './_course-letters.js';
import { send, mailState } from './_mail.js';
import { unsubLink } from './_account.js';
import { letterContext, okTz } from './_mentor.js';

export const COURSE = 'win12';
export const COURSE_NAME = '12 Days to Start Winning';
/** The last letter's day: 13 ("What next"). Day 0 is the welcome. */
export const LAST_DAY = COURSE_LETTERS.length - 1;
/** From 8:00 in the founder's time zone; never after 21:00 there. */
export const SEND_HOUR = 8;
export const LATEST_HOUR = 21;
/** At most this many letters per hourly run, well inside the mail plan. */
export const PER_RUN = 40;
/** When a founder's browser never sent a time zone: the audience is in the US. */
export const DEFAULT_TZ = 'America/New_York';
export const WHY = `You get these letters because you started ${COURSE_NAME} at linktolead.exploraself.com.`;
/** Where links point when no request says which site: the live one. */
export const SITE = 'https://linktolead.exploraself.com';

/** The date (YYYY-MM-DD) and hour (0–23) in a time zone. */
export function localParts(tz, at = new Date()) {
  const zone = okTz(tz) || DEFAULT_TZ;
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', hourCycle: 'h23' });
  const p = Object.fromEntries(f.formatToParts(at).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) % 24, zone };
}

/** The letter for one day, ready for send(). */
export function courseLetter(base, day, { first = '', mentor, tz = '', at } = {}) {
  const L = COURSE_LETTERS[day];
  if (!L) return null;
  const paras = [first ? `Hi ${nameCase(first)},` : 'Hi,', ...L.paras.map((p) => (typeof p === 'string' ? p : button(`${base}${p.path}`, p.button)))];
  const ps = L.ps.path ? [L.ps.text, link(`${base}${L.ps.path}`)] : L.ps.url ? [L.ps.text, link(L.ps.url)] : [L.ps.text];
  return { subject: L.subject, ...letter(base, paras, { line: () => ps }, { mentor, tz, at, ask: L.ask, seed: L.good, intro: day === 0 }) };
}

/** Which letter a subscription is owed now, or null. `sub` is a course_sub
 *  row (day_sent -1 means the welcome has not gone yet). */
export function due(sub, at = new Date()) {
  if (!sub || sub.stopped_at || sub.day_sent >= LAST_DAY) return null;
  const { date, hour } = localParts(sub.tz, at);
  // The welcome is owed at once, at any hour (it normally leaves on the tap).
  if (sub.day_sent < 0) return { day: 0, date };
  if (sub.last_local && date <= sub.last_local) return null;
  if (hour < SEND_HOUR || hour >= LATEST_HOUR) return null;
  return { day: sub.day_sent + 1, date };
}

/** Send one founder the letter they are owed, and record it. */
export async function sendOne(env, D, base, row, d, at = new Date()) {
  const [first] = String(row.name || '').trim().split(/\s+/);
  const ctx = await letterContext(D, row.student_id, row.tz);
  const L = courseLetter(base, d.day, { first, ...ctx, at });
  const r = await send(env, { to: row.email, ...L, why: WHY, unsubUrl: unsubLink(base, row) });
  if (r.ok) {
    await D.prepare('UPDATE course_sub SET day_sent = ?, last_local = ?, last_sent_at = ? WHERE student_id = ? AND course = ?')
      .bind(d.day, d.date, now(), row.student_id, COURSE).run();
  }
  await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)')
    .bind(row.student_id, r.ok ? 'course-letter' : 'course-letter-failed', now(), r.ok ? `day ${d.day}` : `day ${d.day} · ${r.why || ''}`).run();
  return r;
}

/** The hourly run: every letter owed now, at most PER_RUN. */
export async function sendDue(env, D, base = SITE, at = new Date()) {
  const st = mailState(env);
  if (!st.ready) return { sent: 0, failed: 0, why: st.reason };
  const rows = (await D.prepare(`SELECT cs.student_id, cs.day_sent, cs.last_local, cs.stopped_at, COALESCE(NULLIF(cs.tz, ''), p.tz) AS tz,
      s.email, s.name, p.unsubscribed, p.unsub_id, COALESCE(au.paused, 0) AS paused,
      (SELECT MAX(ss.last_sent_at) FROM series_sub ss WHERE ss.student_id = cs.student_id AND ss.test = 0) AS series_last
    FROM course_sub cs JOIN student s ON s.id = cs.student_id
      LEFT JOIN student_profile p ON p.student_id = cs.student_id
      LEFT JOIN account_auth au ON au.student_id = cs.student_id
    WHERE cs.course = ? AND cs.stopped_at IS NULL AND cs.day_sent < ? LIMIT 1000`).bind(COURSE, LAST_DAY).all()).results || [];
  let sent = 0, failed = 0;
  for (const row of rows) {
    if (sent + failed >= PER_RUN) break;
    if (row.unsubscribed) {
      await D.prepare('UPDATE course_sub SET stopped_at = ? WHERE student_id = ? AND course = ?').bind(now(), row.student_id, COURSE).run();
      continue;
    }
    if (row.paused) continue;
    const d = due(row, at);
    if (!d) continue;
    // One automatic letter a day: a series letter went today, so tomorrow.
    if (d.day >= 1 && row.series_last && localParts(row.tz, new Date(row.series_last)).date === d.date) continue;
    const r = await sendOne(env, D, base, row, d, at);
    if (r.ok) sent++; else failed++;
  }
  return { sent, failed };
}

// "Take care of your neighbor" (Alexandru, 3 Nov 2026): a signed-in founder
// sends one friend one invitation to the 12 days, from /12-days/
// (functions/api/course.js, action "invite"). The friend is put on no list,
// gets no tag and no letter after it: they start only if they tap Start
// themselves. Their address is kept only as a hash, for the limits below and
// for "no more invitations" (the footer link, functions/api/unsubscribe.js ?i=).
// The sender is kept as a hash too, so these rows hold nobody's details and
// outlive a deleted account (the limits still hold). The founder's own
// "Invited a friend" line is an event, deleted with their account.

/** At most this many invitations a day from one founder. */
export const INVITE_PER_DAY = 3;
/** One invitation to an address in this many days, from anybody. */
export const INVITE_GAP_DAYS = 30;
/** The longest note a founder can add, in characters. */
export const INVITE_NOTE_MAX = 200;
/** Where the button goes: the 12 Days page, marked as a friend's invitation. */
export const INVITE_PATH = '/12-days/?utm_source=friend&utm_medium=email&utm_campaign=12days-invite';
/** The footer line: why this one letter came. */
export const inviteWhy = (who) => `You got this one letter because ${who} asked us to send it to you from linktolead.exploraself.com. You are on no list, and nothing more comes unless you start.`;

/** The invitation itself, in Alexandru's words. `from` is the founder's
 *  first name, `fromEmail` their address (the friend sees who it is). */
export function inviteLetter(base, { first = '', from = '', fromEmail = '', note = '', tz = '', at } = {}) {
  const who = nameCase(from) || 'A friend';
  const by = fromEmail ? `${who} (${fromEmail})` : who;
  const paras = [
    first ? `Hi ${nameCase(first)},` : 'Hi,',
    `${by} thought of you and asked me to send you this.`,
    ...(note ? [`A note from ${who}: “${note}”`] : []),
    `It is ${COURSE_NAME}: twelve mornings, twelve principles from my book A New Way of Winning. Each day leaves you with one thing done, not one more thing to read. It is free.`,
    'Nothing starts unless you want it. If you do, tap the button and make your free account. Your welcome letter comes at once, and Day 1 the next morning.',
    button(`${base}${INVITE_PATH}`, 'Start my 12 days'),
    'Not for you? There is nothing to do. This is the only letter you get from us because of it.',
  ];
  return { subject: `${who} thought of you: ${COURSE_NAME}`, why: inviteWhy(by),
    ...letter(base, paras, null, { founder: false, tz, at, ask: ['What is in the 12 days?', 'Is it really free?'] }) };
}

/** The two small tables the invitations need. */
export async function inviteTables(D) {
  await D.batch([
    D.prepare('CREATE TABLE IF NOT EXISTS course_invite (id TEXT PRIMARY KEY, sender TEXT NOT NULL, friend TEXT NOT NULL, at INTEGER NOT NULL)'),
    D.prepare('CREATE TABLE IF NOT EXISTS invite_block (friend TEXT PRIMARY KEY, at TEXT NOT NULL)'),
  ]);
}

const sha = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map((x) => x.toString(16).padStart(2, '0')).join('');
/** An address as a hash: enough to count and to block, never to write to. */
export const friendHash = (email) => sha(`win12-invite|${String(email || '').trim().toLowerCase()}`);
/** The sender as a hash: enough to count their invitations today. */
export const senderHash = (id) => sha(`win12-sender|${id}`);
