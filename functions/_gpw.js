// Good People Win (Alexandru, 5 Nov 2026): the engine for the ten letters in
// functions/_gpw-letters.js.
//
// Who: everyone who leaves their name and email, "either exploraself, either
// linktolead, who either creates an account or puts email and name":
//   - a new account here with a yes to letters (functions/api/signup.js,
//     functions/api/google.js);
//   - a name + email form on exploraself.com, which posts to
//     /api/good-people (functions/api/good-people.js) with the person's yes.
// One row per address (gpw_sub): a person meets it once, whichever door they
// came through first; an account made later is linked to the row.
//
// When: letter 1 at once ("Immediately"), then one every 48 hours. The hourly
// cron (worker.js JOBS) sends a letter when 48 hours have passed (less the
// hour the cron may be late), between 8:00 and 21:00 in the person's time
// zone, so nothing lands at night; a letter that would land at night waits for
// 8:00. It runs alongside 12 Days and the letters that follow each pain
// ("No, they go alongside").
//
// Stops: the unsubscribe link in each letter (only these letters: ?g= on
// functions/api/unsubscribe.js), "unsubscribe from everything" on their
// account, or the last letter. Waits while the account is paused in /mentor.
//
// Opens (Alexandru: "in /mentor … which people do open those emails"): each
// letter carries a 1 × 1 picture whose address is that letter's own id
// (/api/good-people?o=…). Loading it marks the letter opened (gpw_mail). Mail
// apps that block pictures record nothing, and Apple Mail loads every picture
// on arrival, so opens are a sign, not a count.
//
// Everyone who already exists (Alexandru, 5 Nov 2026: "those who exist, yes,
// send them. I'm one of them, my partner is one of them."): /mentor → Good
// People Win → Count, then Send. Every account that has not unsubscribed (the
// ones that never ticked yes to letters only with the tick, on by default)
// and every subscribed member of the Mailchimp audience, one series per
// address. Letter 1 goes to the first NOW_MAX at once, the rest with the
// hourly run. Someone without an account who unsubscribed or was cleaned in
// Mailchimp gets no further letter (checked before each one).
//
// GPW_MODE in the Cloudflare settings: "off" stops joining and sending.
// Empty (the default) sends.

import { now, newToken, looksLikeEmail } from './_shared.js';
import { letter, link, button, heading, diagram, marked, nameCase } from './_letters.js';
import { GPW_LETTERS, GPW_NAME } from './_gpw-letters.js';
import { send, mailState, allowed, logged } from './_mail.js';
import { letterContext, okTz } from './_mentor.js';
import { localParts, SEND_HOUR, LATEST_HOUR, DEFAULT_TZ, SITE } from './_course.js';
import { syncFounder, readMembers, memberStatus } from './_mailchimp.js';

/** The Mailchimp tag for founders with an account who get these letters
 *  (approved by Alexandru, 5 Nov 2026: "give them a hashtag … good people win"). */
export const GPW_TAG = 'linktolead-letters-good-people-win';
export const LAST = GPW_LETTERS.length;
export const GAP_HOURS = 48;
const HOUR = 3600_000;
/** The hourly run comes at minute 7, so a letter is due up to an hour early. */
export const EARLY = 55 * 60_000;
/** At most this many letters per hourly run (each may also ask Mailchimp
 *  whether the person unsubscribed there: two calls out per letter at most,
 *  inside what one run may make). */
export const PER_RUN = 20;
/** At most this many letters 1 straight away when /mentor adds everyone who
 *  already exists; the rest go with the hourly run, PER_RUN an hour. */
export const NOW_MAX = 20;
/** Where letters come from: the door they used, in words, for /mentor. */
export const SOURCES = {
  'linktolead-account': 'An account on linktolead',
  'linktolead-google': 'An account on linktolead, with Google',
  'linktolead-pay': 'An account made when they paid',
  'existing-account': 'Had an account before Good People Win',
  'existing-mailchimp': 'On the Mailchimp list before Good People Win',
};
export const WHY = (source) => `You get these letters because you left your name and email ${/^exploraself/.test(source || '') ? 'at exploraself.com' : source === 'existing-mailchimp' ? 'with ExploraSelf' : 'at linktolead.exploraself.com'}. Ten letters, one every two days, then they stop.`;

export const gpwMode = (env) => (String((env && env.GPW_MODE) || '').trim().toLowerCase() === 'off' ? 'off' : 'on');

export async function gpwTables(D) {
  await D.batch([
    D.prepare(`CREATE TABLE IF NOT EXISTS gpw_sub (email TEXT PRIMARY KEY, first TEXT, source TEXT, student_id TEXT, started_at TEXT NOT NULL,
      tz TEXT, sent INTEGER NOT NULL DEFAULT 0, last_sent_at INTEGER, stopped_at TEXT, stop_why TEXT, unsub_id TEXT NOT NULL)`),
    D.prepare(`CREATE TABLE IF NOT EXISTS gpw_mail (id TEXT PRIMARY KEY, email TEXT NOT NULL, n INTEGER NOT NULL, sent_at INTEGER NOT NULL,
      opened_at INTEGER, opens INTEGER NOT NULL DEFAULT 0)`),
    D.prepare('CREATE INDEX IF NOT EXISTS gpw_mail_email ON gpw_mail (email)'),
  ]);
}

const P = (s) => marked(s);
/** Letter n (1–10), ready for send(). `pixel` is the open-tracking address. */
export function gpwLetter(base, n, { first = '', mentor, tz = '', at, pixel = '' } = {}) {
  const L = GPW_LETTERS[n - 1];
  if (!L) return null;
  const paras = [
    first ? `Hi ${nameCase(first)},` : 'Hi,',
    P(L.hello),
    heading('1 · Where it hurts'), P(L.hurt),
    heading(`2 · ${L.story.head}`), ...L.story.paras.map(P),
    heading('3 · Today’s tool'), diagram(L.tool), ...(L.after ? [P(L.after)] : []),
    heading('4 · Your 10 minutes'), [...marked(L.step.do), '\n', ...marked('**Done when:** '), L.step.done],
    heading('5 · The hard truth'), ...L.truth.map(P),
    ...(L.invite.lead ? [P(L.invite.lead)] : []),
    button(L.invite.url, L.invite.button),
    ...(L.invite.or ? [[L.invite.or.text, link(L.invite.or.url, L.invite.or.label)]] : []),
    ['Reply and tell me: ', ...marked(`**${L.reply}**`)],
  ];
  const ps = L.ps.url ? [L.ps.text, link(L.ps.url, L.ps.label)] : [L.ps.text];
  const subject = `${L.title} · ${GPW_NAME} ${n}/${LAST}`;
  const cover = { src: `/mail/gpw/${String(n).padStart(2, '0')}.jpg`, alt: `${GPW_NAME} · Letter ${n} of ${LAST}: ${L.title}` };
  return { subject, ...letter(base, paras, { line: () => ps }, { mentor, tz, at, ask: L.ask, seed: L.good, intro: n === 1, cover, pixel }) };
}

/**
 * Join: one address, once. `studentId` links an account (made now, or later
 * with the same address). Returns { status: 'ok' | 'already' | 'off' | 'skipped' }.
 * The caller has the person's yes to letters.
 */
export async function gpwJoin(env, D, { email, first = '', source = '', studentId = null, tz = '', at = new Date() } = {}) {
  if (gpwMode(env) === 'off') return { status: 'off' };
  const addr = String(email || '').trim().toLowerCase();
  if (!looksLikeEmail(addr)) return { status: 'skipped', detail: 'No email.' };
  await gpwTables(D);
  // Someone who said no to every letter on their account gets none of these.
  const acct = studentId
    ? await D.prepare('SELECT s.id, p.unsubscribed FROM student s LEFT JOIN student_profile p ON p.student_id = s.id WHERE s.id = ?').bind(studentId).first()
    : await D.prepare('SELECT s.id, p.unsubscribed FROM student s LEFT JOIN student_profile p ON p.student_id = s.id WHERE lower(s.email) = ?').bind(addr).first();
  if (acct && acct.unsubscribed) return { status: 'skipped', detail: 'Unsubscribed.' };
  const sid = studentId || (acct && acct.id) || null;
  const r = await D.prepare('INSERT OR IGNORE INTO gpw_sub (email, first, source, student_id, started_at, tz, unsub_id) VALUES (?,?,?,?,?,?,?)')
    .bind(addr, String(first || '').trim().slice(0, 60) || null, String(source || '').slice(0, 40) || null, sid, new Date(at).toISOString(), okTz(tz) || null, newToken()).run();
  if (!(r && r.meta && r.meta.changes)) {
    if (sid) await D.prepare('UPDATE gpw_sub SET student_id = ? WHERE email = ? AND student_id IS NULL').bind(sid, addr).run();
    return { status: 'already' };
  }
  if (sid) {
    await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)').bind(sid, 'gpw-start', now(), source || '').run();
    await syncFounder(env, D, sid, 'tag', { tag: GPW_TAG }).catch(() => null);
  }
  return { status: 'ok' };
}

/** Which letter a row is owed now (1–10), or 0. */
export function due(row, at = new Date()) {
  if (!row || row.stopped_at || row.sent >= LAST) return 0;
  if (!row.sent) return 1; // letter 1 is owed at once, at any hour
  const t = new Date(at).getTime();
  if (!row.last_sent_at || t - Number(row.last_sent_at) < GAP_HOURS * HOUR - EARLY) return 0;
  const { hour } = localParts(row.tz || DEFAULT_TZ, at);
  if (hour < SEND_HOUR || hour >= LATEST_HOUR) return 0;
  return row.sent + 1;
}

/** Send one person the letter they are owed, and record it. */
export async function sendOne(env, D, base, row, n, at = new Date()) {
  // No account here: their "no" lives in Mailchimp. Unsubscribed or cleaned there, no more letters.
  if (!row.student_id && env && env.MAILCHIMP_API_KEY) {
    const st = await memberStatus(env, row.email);
    if (st === 'unsubscribed' || st === 'cleaned') {
      await D.prepare('UPDATE gpw_sub SET stopped_at = ?, stop_why = ? WHERE email = ?').bind(new Date(at).toISOString(), `${st} in Mailchimp`, row.email).run();
      return { ok: false, stopped: true };
    }
  }
  const id = newToken();
  const ctx = await letterContext(D, row.student_id || null, row.tz);
  const L = gpwLetter(base, n, { first: row.first, ...ctx, at, pixel: `${base}/api/good-people?o=${id}` });
  const r = await send(env, { to: row.email, ...L, why: WHY(row.source), unsubUrl: `${base}/api/unsubscribe?g=${row.unsub_id}` });
  const t = new Date(at).getTime();
  if (r.ok) {
    await D.prepare('UPDATE gpw_sub SET sent = ?, last_sent_at = ? WHERE email = ?').bind(n, t, row.email).run();
    await D.prepare('INSERT INTO gpw_mail (id, email, n, sent_at) VALUES (?,?,?,?)').bind(id, row.email, n, t).run();
    if (n >= LAST) await D.prepare('UPDATE gpw_sub SET stopped_at = ?, stop_why = ? WHERE email = ?').bind(new Date(at).toISOString(), 'all ten sent', row.email).run();
  }
  if (row.student_id) {
    await D.prepare('INSERT INTO event (student_id,kind,at,detail) VALUES (?,?,?,?)')
      .bind(row.student_id, r.ok ? 'gpw-letter' : 'gpw-letter-failed', now(), r.ok ? `letter ${n}` : `letter ${n} · ${r.why || ''}`).run();
  }
  return r;
}

/** Letter 1 now, after a join (the request's waitUntil), inside the mail limits.
 *  If it cannot go now, the hourly run sends it. */
export async function sendFirst(env, D, base, email, ip = 'unknown') {
  if (gpwMode(env) === 'off' || !mailState(env).ready) return { ok: false };
  const row = await D.prepare('SELECT * FROM gpw_sub WHERE email = ?').bind(String(email).toLowerCase()).first();
  if (!row || row.sent || row.stopped_at) return { ok: false };
  if (!(await allowed(D, row.email, ip))) return { ok: false, why: 'mail limit' };
  const r = await sendOne(env, D, base, row, 1);
  if (r.ok) await logged(D, row.email, ip);
  return r;
}

/** The hourly run: every letter owed now, at most PER_RUN. */
export async function sendDue(env, D, base = SITE, at = new Date()) {
  if (gpwMode(env) === 'off') return { sent: 0, failed: 0, why: 'GPW_MODE is off' };
  const st = mailState(env);
  if (!st.ready) return { sent: 0, failed: 0, why: st.reason };
  await gpwTables(D);
  const rows = (await D.prepare(`SELECT g.*, COALESCE(NULLIF(g.tz, ''), p.tz) AS tz, p.unsubscribed, COALESCE(au.paused, 0) AS paused
      FROM gpw_sub g LEFT JOIN student_profile p ON p.student_id = g.student_id LEFT JOIN account_auth au ON au.student_id = g.student_id
      WHERE g.stopped_at IS NULL AND g.sent < ? ORDER BY g.last_sent_at LIMIT 1000`).bind(LAST).all()).results || [];
  let sent = 0, failed = 0;
  for (const row of rows) {
    if (sent + failed >= PER_RUN) break;
    if (row.unsubscribed) {
      await D.prepare('UPDATE gpw_sub SET stopped_at = ?, stop_why = ? WHERE email = ?').bind(now(), 'unsubscribed from everything', row.email).run();
      continue;
    }
    if (row.paused) continue;
    const n = due(row, at);
    if (!n) continue;
    const r = await sendOne(env, D, base, row, n, at);
    if (r.ok) sent++; else if (!r.stopped) failed++;
  }
  return { sent, failed };
}

/**
 * Everyone who already exists and is not in the letters yet, for /mentor's
 * Count. Accounts: not unsubscribed; "yes" when they ticked yes to letters or
 * are subscribed in Mailchimp. Mailchimp: subscribed members with no account.
 * Each address once.
 */
export async function gpwPlan(env, D) {
  await gpwTables(D);
  const inLetters = new Set(((await D.prepare('SELECT email FROM gpw_sub').all()).results || []).map((r) => r.email));
  const accounts = (await D.prepare(`SELECT s.id, lower(trim(s.email)) AS email, s.name, COALESCE(p.consent, 0) AS consent, COALESCE(p.unsubscribed, 0) AS unsub, p.tz
      FROM student s LEFT JOIN student_profile p ON p.student_id = s.id ORDER BY s.joined_at`).all()).results || [];
  const accountEmails = new Set(accounts.map((a) => a.email));
  const unsubscribed = new Set(accounts.filter((a) => a.unsub).map((a) => a.email));
  const mc = await readMembers(env);
  const mcEmails = new Set(mc.ok ? mc.members.map((m) => m.email) : []);
  const seen = new Set();
  const once = (e) => (seen.has(e) || inLetters.has(e) || unsubscribed.has(e) ? false : (seen.add(e), true));
  const open = accounts.filter((a) => !a.unsub && looksLikeEmail(a.email) && once(a.email));
  const yes = open.filter((a) => a.consent || mcEmails.has(a.email));
  const without = open.filter((a) => !(a.consent || mcEmails.has(a.email)));
  const fromMc = mc.ok ? mc.members.filter((m) => !accountEmails.has(m.email) && looksLikeEmail(m.email) && once(m.email)) : [];
  return {
    yes, without, fromMc,
    mailchimp: mc.ok ? { ok: true, subscribed: mc.total } : { ok: false, why: mc.why },
    overlap: mc.ok ? accounts.filter((a) => mcEmails.has(a.email)).length : 0,
    already: inLetters.size,
    unsubscribed: unsubscribed.size,
  };
}

/** The numbers /mentor shows before anything is sent. */
export const planCounts = (P, { withoutYes = true } = {}) => ({
  accountsYes: P.yes.length, accountsWithout: P.without.length, mailchimp: P.fromMc.length,
  mailchimpRead: P.mailchimp, overlap: P.overlap, already: P.already, unsubscribed: P.unsubscribed,
  total: P.yes.length + (withoutYes ? P.without.length : 0) + P.fromMc.length,
  now: Math.min(NOW_MAX, P.yes.length + (withoutYes ? P.without.length : 0) + P.fromMc.length), nowMax: NOW_MAX, perHour: PER_RUN,
});

/**
 * Add everyone in the plan, then letter 1 to the first NOW_MAX at once; the
 * hourly run sends the rest (letter 1 is owed at any hour). Returns
 * { joined, sentNow, waiting }.
 */
export async function gpwEveryone(env, D, base = SITE, { withoutYes = true, at = new Date() } = {}) {
  if (gpwMode(env) === 'off') return { joined: 0, sentNow: 0, waiting: 0, why: 'GPW_MODE is off' };
  const P = await gpwPlan(env, D);
  const stamp = new Date(at).toISOString();
  const accounts = [...P.yes, ...(withoutYes ? P.without : [])];
  let joined = 0;
  for (const a of accounts) {
    const [first] = String(a.name || '').trim().split(/\s+/);
    const r = await gpwJoin(env, D, { email: a.email, first, source: 'existing-account', studentId: a.id, tz: a.tz || '', at });
    if (r.status === 'ok') joined++;
  }
  // Mailchimp people have no account here: written in batches.
  for (let i = 0; i < P.fromMc.length; i += 50) {
    const rows = P.fromMc.slice(i, i + 50).map((m) => D.prepare('INSERT OR IGNORE INTO gpw_sub (email, first, source, started_at, unsub_id) VALUES (?,?,?,?,?)')
      .bind(m.email, m.first.slice(0, 60) || null, 'existing-mailchimp', stamp, newToken()));
    const res = await D.batch(rows);
    joined += res.filter((x) => x && x.meta && x.meta.changes).length;
  }
  let sentNow = 0;
  if (mailState(env).ready) {
    const owed = (await D.prepare('SELECT g.*, COALESCE(NULLIF(g.tz, \'\'), p.tz) AS tz FROM gpw_sub g LEFT JOIN student_profile p ON p.student_id = g.student_id WHERE g.sent = 0 AND g.stopped_at IS NULL ORDER BY g.started_at LIMIT ?').bind(NOW_MAX).all()).results || [];
    for (const row of owed) { const r = await sendOne(env, D, base, row, 1, at); if (r.ok) sentNow++; }
  }
  const waiting = (await D.prepare('SELECT COUNT(*) AS n FROM gpw_sub WHERE sent = 0 AND stopped_at IS NULL').first())?.n || 0;
  return { joined, sentNow, waiting };
}

/** The 1 × 1 picture opened: mark that letter opened. Unknown ids do nothing. */
export async function markOpened(D, id, at = Date.now()) {
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(String(id || ''))) return false;
  await gpwTables(D);
  const r = await D.prepare('UPDATE gpw_mail SET opened_at = COALESCE(opened_at, ?), opens = opens + 1 WHERE id = ?').bind(at, id).run();
  return !!(r && r.meta && r.meta.changes);
}

/** Stop the letters for the address behind an unsubscribe id (?g=). */
export async function gpwStop(D, unsubId) {
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(String(unsubId || ''))) return false;
  await gpwTables(D);
  const r = await D.prepare('UPDATE gpw_sub SET stopped_at = ?, stop_why = ? WHERE unsub_id = ? AND stopped_at IS NULL').bind(now(), 'unsubscribed', unsubId).run();
  return !!(r && r.meta && r.meta.changes);
}

/** For /mentor: everyone in the letters, newest first, with what they opened,
 *  and each letter's sent and opened counts. */
export async function gpwReport(D, limit = 500) {
  await gpwTables(D);
  const people = (await D.prepare(`SELECT g.email, g.first, g.source, g.student_id, g.started_at, g.sent, g.last_sent_at, g.stopped_at, g.stop_why,
      (SELECT GROUP_CONCAT(m.n) FROM gpw_mail m WHERE m.email = g.email AND m.opened_at IS NOT NULL) AS opened
    FROM gpw_sub g ORDER BY g.started_at DESC LIMIT ?`).bind(limit).all()).results || [];
  const per = (await D.prepare('SELECT n, COUNT(*) AS sent, SUM(opened_at IS NOT NULL) AS opened FROM gpw_mail GROUP BY n').all()).results || [];
  const byN = Object.fromEntries(per.map((x) => [x.n, x]));
  return {
    letters: GPW_LETTERS.map((L) => ({ n: L.n, title: L.title, sent: byN[L.n]?.sent || 0, opened: byN[L.n]?.opened || 0 })),
    people: people.map((p) => ({ ...p, opened: p.opened ? String(p.opened).split(',').map(Number).sort((a, b) => a - b) : [] })),
    total: (await D.prepare('SELECT COUNT(*) AS n FROM gpw_sub').first())?.n || 0,
  };
}
