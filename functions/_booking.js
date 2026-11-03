// Booking a call with Alexandru (Alexandru, 2 Nov 2026: "like a Google Form
// but without Google … one question per screen"). Two pages replace the
// Google Form:
//
//   /book/discovery/  a free 30-minute discovery call, for anyone, no account
//   /book/boardroom/  the 60-minute 1:1 for founders whose step holds
//                     'session' (The Boardroom or higher)
//
// The person answers a few taps, then suggests one time, or up to three
// (Alexandru, 3 Nov 2026: "1 is enough, 2 or 3 are options"); Alexandru
// confirms one within 24 hours, by email, from /mentor (Inbox → Bookings),
// and the confirmation carries the Google Meet link. Only Tuesday, Wednesday
// and Thursday, 15:00–20:00 Rome time, online, from tomorrow up to 14 days
// ahead. Discovery slots start every 30 minutes, the 1:1 every 60 (the last
// one ends by 20:00).
//
// The same rules and the same questions are in public/book/slots.js, which
// draws the page (tests/book.test.mjs holds both equal). This file checks
// everything the page sends: the page only proposes, the server decides
// (functions/api/book.js).

import { okTz } from './_mentor.js';

export const ZONE = 'Europe/Rome';
/** Tuesday, Wednesday, Thursday (Date#getUTCDay numbers), 15:00 to 20:00. */
export const RULES = { zone: ZONE, days: [2, 3, 4], from: 15, to: 20, ahead: 14, min: 1, pick: 3, confirmHours: 24, where: 'Google Meet' };
export const KINDS = {
  discovery: { minutes: 30, every: 30, name: 'a free discovery call', short: 'Discovery call', setting: 'Discovery call link' },
  boardroom: { minutes: 60, every: 60, name: 'their Boardroom 1:1', short: 'Boardroom 1:1', setting: 'Boardroom link' },
};
export const isKind = (k) => typeof k === 'string' && Object.hasOwn(KINDS, k);
/** The Mailchimp tags (AGENTS.md rule 17; on the tag list in
 *  functions/_tag-list.js), one per kind, names approved by Alexandru. */
export const BOOK_TAGS = { discovery: 'linktolead-book-discovery', boardroom: 'linktolead-book-boardroom' };
/** The most one address, or one connection, may ask in 24 hours. */
export const DAY_LIMIT = 3;
/** A page left open over midnight still counts its "tomorrow" for a while. */
export const GRACE_MS = 3 * 3600_000;

// ── The questions (the same words as public/book/slots.js) ────────────────────
/** Every answer a tap can give, by list: [key, words]. */
export const CHOICES = {
  stage: [['start', 'Before my first sale'], ['solo', 'Selling alone'], ['team', 'A team with payroll'], ['company', '16 people or more']],
  struggles: [['clients', 'Not enough clients'], ['price', 'Prices too low'], ['time', 'No time for myself'], ['direction', 'Unclear direction'],
    ['cash', 'Cash is tight'], ['team', 'My team isn’t stepping up'], ['switch', 'I can’t switch off'], ['alone', 'I carry every decision alone']],
  goals: [['clients', 'More clients'], ['price', 'Higher prices'], ['time', 'Time back for me'], ['direction', 'A clear direction'],
    ['cash', 'Steady cash'], ['team', 'A team I trust'], ['runs', 'A business that runs without me'], ['market', 'A new market']],
  moved: [['believe', 'What you believe'], ['read', 'How you read it'], ['feel', 'What you feel']],
  side: [['self', 'Lead yourself'], ['people', 'Lead your people'], ['work', 'Lead your business'], ['market', 'Lead the market']],
  tried: [['none', 'Nothing yet'], ['once', 'Tried once, it didn’t hold'], ['few', 'Tried a few times'], ['middle', 'I’m in the middle of it']],
  income: [['none', 'Nothing yet'], ['u1k', 'Under $1,000'], ['1to5k', '$1,000 to $5,000'], ['5to20k', '$5,000 to $20,000'], ['o20k', 'Over $20,000'], ['private', 'I’d rather not say']],
  asked: [['0', 'Nobody yet'], ['1to3', '1 to 3'], ['4to10', '4 to 10'], ['o10', 'More than 10']],
};
/** The questions of each form, in order. type: 'one' (tap one), 'two'
 *  (exactly two), 'text' (short text, `max` characters; `optional` may stay
 *  empty). `label` is the short name used in the check screen, the emails
 *  and /mentor. */
export const FORMS = {
  discovery: [
    { k: 'stage', type: 'one', of: 'stage', q: 'Where are you now?', label: 'Where you are now' },
    { k: 'struggles', type: 'two', of: 'struggles', q: 'What do you struggle with most? Choose two.', label: 'What you struggle with most' },
    { k: 'goals', type: 'two', of: 'goals', q: 'What do you want to achieve in the next 90 days? Choose two.', label: 'In the next 90 days' },
    { k: 'note', type: 'text', max: 600, optional: true, q: 'Anything else Alexandru should know?', label: 'Anything else' },
  ],
  boardroom: [
    { k: 'moved', type: 'one', of: 'moved', part: 'Where you are', q: 'Which of your first three levels moved you most?', label: 'The level that moved you most' },
    { k: 'side', type: 'one', of: 'side', part: 'Where you are', q: 'Which side is costing you most right now?', label: 'The side costing you most' },
    { k: 'stage', type: 'one', of: 'stage', part: 'Where you are', q: 'Where is the business today?', label: 'The business today' },
    { k: 'line', type: 'text', max: 300, part: 'Lead yourself', q: 'The sentence you wrote in your first three levels that you still think about', label: 'The sentence you still think about' },
    { k: 'pressure', type: 'text', max: 300, part: 'Lead yourself', q: 'When the pressure hits, what do you do first?', label: 'Under pressure, first' },
    { k: 'enough', type: 'text', max: 160, part: 'Lead yourself', q: 'What is “enough” for you each month, as a number?', label: 'Enough, each month' },
    { k: 'avoid', type: 'text', max: 300, part: 'Lead yourself', q: 'What are you avoiding right now that you know you should face?', label: 'What you are avoiding' },
    { k: 'depends', type: 'text', max: 300, part: 'Lead your people', q: 'Who depends on you most, at work or at home?', label: 'Who depends on you' },
    { k: 'talk', type: 'text', max: 300, part: 'Lead your people', q: 'Which conversation have you been putting off, and with whom?', label: 'The conversation you put off' },
    { k: 'handed', type: 'text', max: 300, part: 'Lead your people', q: 'What did you hand over in the last month, and did it stay handed over?', label: 'What you handed over' },
    { k: 'income', type: 'one', of: 'income', part: 'Lead your business', q: 'Roughly, how much came in last month?', label: 'Last month, in' },
    { k: 'week', type: 'text', max: 300, part: 'Lead your business', q: 'Where does most of your week really go?', label: 'Where the week goes' },
    { k: 'number', type: 'text', max: 300, part: 'Lead your business', q: 'Which number do you avoid looking at?', label: 'The number you avoid' },
    { k: 'best', type: 'text', max: 300, part: 'Lead the market', q: 'Who is your best customer, in one sentence?', label: 'Your best customer' },
    { k: 'why', type: 'text', max: 300, part: 'Lead the market', q: 'Why do they choose you, in their own words?', label: 'Why they choose you' },
    { k: 'asked', type: 'one', of: 'asked', part: 'Lead the market', q: 'How many people did you ask to buy in the last 30 days?', label: 'Asked to buy, last 30 days' },
    { k: 'decision', type: 'text', max: 300, part: 'The hour', q: 'The one decision you want to bring to the table', label: 'The decision you bring' },
    { k: 'tried', type: 'one', of: 'tried', part: 'The hour', q: 'What have you tried so far?', label: 'What you tried so far' },
    { k: 'after', type: 'text', max: 300, part: 'The hour', q: 'If this hour works, what will you do differently next week?', label: 'Different next week' },
    { k: 'worth', type: 'text', max: 300, part: 'The hour', q: 'What would make this hour worth it for you?', label: 'What makes the hour worth it' },
  ],
};
export const NAME_MAX = 80;
export const EMAIL_MAX = 200;

const textOf = (v) => (typeof v === 'string' ? v.replace(/\u0000/g, '').replace(/\r\n?/g, '\n').trim() : '');
const keysOf = (list) => CHOICES[list].map(([k]) => k);

/** The answers of one form, checked: { ok: true, answers } with only known
 *  keys, or { ok: false, error } in plain words. Taps must be words the form
 *  offers; "Choose two" means exactly two different ones. */
export function readAnswers(kind, raw) {
  const form = FORMS[kind];
  if (!form) return { ok: false, error: 'Say which call: discovery or boardroom.' };
  const a = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const out = {};
  for (const f of form) {
    const v = a[f.k];
    if (f.type === 'one') {
      if (!keysOf(f.of).includes(v)) return { ok: false, error: `Choose one answer for “${f.q}”` };
      out[f.k] = v;
    } else if (f.type === 'two') {
      const list = Array.isArray(v) ? v : [];
      if (list.length !== 2 || list[0] === list[1] || !list.every((x) => keysOf(f.of).includes(x))) return { ok: false, error: `Choose exactly two for “${f.q.replace(/ Choose two\.$/, '')}”` };
      out[f.k] = [...list];
    } else {
      const t = textOf(v);
      if (!t && !f.optional) return { ok: false, error: `Write a few words for “${f.q}”` };
      if (t.length > f.max) return { ok: false, error: `Keep “${f.label}” to ${f.max} characters, please.` };
      if (t) out[f.k] = t;
    }
  }
  return { ok: true, answers: out };
}

/** The answers in words, in the order of the form: [[label, words], …].
 *  Text answers are cut at `max` characters (with …) when `max` is given. */
export function answersText(kind, answers, { max = 0 } = {}) {
  const words = (list, k) => (CHOICES[list].find(([x]) => x === k) || [])[1] || '';
  const cut = (s) => (max && s.length > max ? s.slice(0, max).trimEnd() + '…' : s);
  const out = [];
  for (const f of FORMS[kind] || []) {
    const v = answers && answers[f.k];
    if (v == null || v === '') continue;
    if (f.type === 'one') out.push([f.label, words(f.of, v)]);
    else if (f.type === 'two') out.push([f.label, (Array.isArray(v) ? v : []).map((k) => words(f.of, k)).filter(Boolean).join(' · ')]);
    else out.push([f.label, cut(String(v))]);
  }
  return out.filter(([, w]) => w);
}

// ── The times ─────────────────────────────────────────────────────────────────
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FMT = new Map();
const fmt = (tz) => {
  if (!FMT.has(tz)) FMT.set(tz, new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short', hourCycle: 'h23' }));
  return FMT.get(tz);
};
/** The wall clock in a time zone: { y, m, d, h, mi, s, wd }. */
export function wall(date, tz = ZONE) {
  const o = {};
  for (const p of fmt(tz).formatToParts(date)) o[p.type] = p.value;
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour, mi: +o.minute, s: +o.second, wd: WD.indexOf(o.weekday) };
}
/** A wall-clock time in Rome as a moment (a Date). */
export function fromWall(y, m, d, h, mi, tz = ZONE) {
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const off = (t) => { const w = wall(new Date(t), tz); return Date.UTC(w.y, w.m - 1, w.d, w.h, w.mi) - t; };
  let t = guess - off(guess);
  const again = off(t);
  if (guess - again !== t) t = guess - again;
  return new Date(t);
}
/** Rome's calendar day of a moment, as a day number. */
const romeDay = (ms) => { const w = wall(new Date(ms)); return Date.UTC(w.y, w.m - 1, w.d) / 86400_000; };

/** Every time the page offers for this kind, as ISO strings, from tomorrow
 *  (Rome's date) up to 14 days ahead. */
export function slotsFor(kind, at = new Date()) {
  const K = KINDS[kind];
  if (!K) return [];
  const today = wall(at);
  const out = [];
  for (let i = 1; i <= RULES.ahead; i++) {
    const day = new Date(Date.UTC(today.y, today.m - 1, today.d + i));
    if (!RULES.days.includes(day.getUTCDay())) continue;
    for (let t = RULES.from * 60; t + K.minutes <= RULES.to * 60; t += K.every) {
      out.push(fromWall(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), Math.floor(t / 60), t % 60).toISOString());
    }
  }
  return out;
}

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;
/** Is this a real time for this kind: in the future; from tomorrow up to 14
 *  days ahead (Rome's dates; a page opened before midnight keeps its days for
 *  a few hours); a Tuesday, Wednesday or Thursday in Rome; starting on the
 *  half hour (the hour for the 1:1) and ending by 20:00? */
export function isSlot(kind, iso, at = Date.now()) {
  const K = KINDS[kind];
  if (!K || typeof iso !== 'string' || !ISO.test(iso)) return false;
  const t = Date.parse(iso);
  const nowMs = at instanceof Date ? at.getTime() : at;
  if (!Number.isFinite(t) || t <= nowMs || t % 60000) return false;
  const w = wall(new Date(t));
  if (!RULES.days.includes(w.wd)) return false;
  const mins = w.h * 60 + w.mi;
  if (!(mins >= RULES.from * 60 && mins + K.minutes <= RULES.to * 60 && (mins - RULES.from * 60) % K.every === 0)) return false;
  const day = Date.UTC(w.y, w.m - 1, w.d) / 86400_000;
  const within = (ms) => { const gap = day - romeDay(ms); return gap >= 1 && gap <= RULES.ahead; };
  return within(nowMs) || within(nowMs - GRACE_MS);
}

/** A time zone's city, for people: "Europe/London" → "London". */
export const cityOf = (tz) => String(tz || ZONE).split('/').pop().replace(/_/g, ' ');
const dayText = (d, tz) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' }).format(d).replace(',', '');
const hm = (d, tz) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
/** One time in words, in the person's zone and in Rome:
 *  { mine: 'Tuesday 10 November, 10:00 New York time', rome: 'Tuesday 10 November, 16:00', same, … };
 *  the short forms leave out the day when it is the same in both places. */
export function whenText(iso, tz = '') {
  const d = new Date(iso);
  const zone = okTz(tz) || ZONE;
  const rome = `${dayText(d, ZONE)}, ${hm(d, ZONE)}`;
  const mineDay = dayText(d, zone), mineHm = hm(d, zone);
  const same = zone === ZONE || `${mineDay}, ${mineHm}` === rome;
  const sameDay = mineDay === dayText(d, ZONE);
  return { mine: `${mineDay}, ${mineHm} ${cityOf(zone)} time`, mineShort: sameDay ? `${mineHm} ${cityOf(zone)} time` : `${mineDay}, ${mineHm} ${cityOf(zone)} time`,
    rome, romeShort: sameDay ? hm(d, ZONE) : rome, romeDay: dayText(d, ZONE), same, zone };
}
/** One time as the person reads it: "Tuesday 10 November, 10:00 New York
 *  time (16:00 in Rome)", or "Tuesday 10 November, 16:00 Rome time". */
export const timeLine = (iso, tz) => { const w = whenText(iso, tz); return w.same ? `${w.rome} Rome time` : `${w.mine} (${w.romeShort} in Rome)`; };

// ── Where it is kept ──────────────────────────────────────────────────────────
/** The booking tables, made the first time a request needs them (the same
 *  way as stripe_setting in functions/_stripe.js). `booking` keeps each
 *  request: the answers as JSON, the times (one to three, ISO, sorted), the status
 *  ('asked', then 'confirmed' with the time Alexandru chose). `booking_log`
 *  counts requests per address and connection for a day, then forgets them
 *  (like mail_log). `booking_setting` holds the Google Meet link per kind,
 *  pasted once in /mentor → Settings. */
const READY = new WeakSet();
export async function bookingTables(D) {
  if (READY.has(D)) return;
  await D.batch([
    D.prepare(`CREATE TABLE IF NOT EXISTS booking (id TEXT PRIMARY KEY, kind TEXT NOT NULL, email TEXT NOT NULL, name TEXT NOT NULL,
      answers TEXT NOT NULL, times TEXT NOT NULL, created_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'asked', tz TEXT, student_id TEXT,
      confirmed_time TEXT, confirmed_at TEXT, confirmed_by TEXT, note TEXT, closed_at TEXT, closed_by TEXT)`),
    D.prepare('CREATE TABLE IF NOT EXISTS booking_log (email TEXT, ip TEXT, at INTEGER)'),
    D.prepare('CREATE TABLE IF NOT EXISTS booking_setting (k TEXT PRIMARY KEY, v TEXT NOT NULL, at TEXT NOT NULL)'),
  ]);
  // Their phone (3 Nov 2026), added to a table that may already hold requests.
  try { await D.prepare('ALTER TABLE booking ADD COLUMN phone TEXT').run(); } catch { /* already there */ }
  // What the WhatsApp to them did (3 Nov 2026): 'sent', or 'failed: why'.
  try { await D.prepare('ALTER TABLE booking ADD COLUMN wa TEXT').run(); } catch { /* already there */ }
  READY.add(D);
}

/** A phone number as the booking pages take it (Alexandru, 3 Nov 2026: "their
 *  phone number must be collected too, for both"): spaces, dots, dashes and
 *  brackets dropped, 00 read as +, then + and 7 to 15 digits (the
 *  international form WhatsApp uses). '' when it is not one. The same rule
 *  is in functions/_booking.js (tests/book.test.mjs holds both equal). */
export const PHONE_MAX = 24;
export function phoneOf(v) {
  let s = String(v ?? '').trim().replace(/[\s().\-\u00a0]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  return /^\+[1-9]\d{6,14}$/.test(s) ? s : '';
}
/** The phone as WhatsApp's link wants it: digits only. */
export const waDigits = (p) => String(p || '').replace(/\D/g, '');

/** May this address and this connection ask again today? */
export async function bookingAllowed(D, email, ip) {
  const dayAgo = Date.now() - 86400_000;
  const seen = await D.prepare('SELECT SUM(email = ?) AS e, SUM(ip = ?) AS i FROM booking_log WHERE at > ?').bind(email, ip, dayAgo).first();
  return !((seen?.e || 0) >= DAY_LIMIT || (seen?.i || 0) >= DAY_LIMIT);
}
export async function bookingLogged(D, email, ip) {
  await D.prepare('INSERT INTO booking_log (email, ip, at) VALUES (?,?,?)').bind(email, ip, Date.now()).run();
  await D.prepare('DELETE FROM booking_log WHERE at < ?').bind(Date.now() - 86400_000).run();
}

/** A Google Meet link as Alexandru pastes it: https://meet.google.com/…,
 *  trimmed; '' for anything else (the letters say "Google Meet", so the link
 *  must be one). */
export function meetLink(v) {
  const s = String(v || '').trim();
  return s.length <= 200 && /^https:\/\/meet\.google\.com\/[A-Za-z0-9._~\-/?=&%]+$/.test(s) ? s : '';
}
/** The Google Meet link for each kind: { discovery, boardroom } ('' when not set). */
export async function meetLinks(D) {
  await bookingTables(D);
  const rows = (await D.prepare("SELECT k, v FROM booking_setting WHERE k IN ('meet.discovery', 'meet.boardroom')").all()).results || [];
  const out = { discovery: '', boardroom: '' };
  for (const r of rows) out[r.k.slice(5)] = meetLink(r.v);
  return out;
}
export async function setMeetLink(D, kind, link, at) {
  await bookingTables(D);
  if (!link) await D.prepare('DELETE FROM booking_setting WHERE k = ?').bind(`meet.${kind}`).run();
  else await D.prepare('INSERT OR REPLACE INTO booking_setting (k, v, at) VALUES (?,?,?)').bind(`meet.${kind}`, link, at).run();
}

/** The business WhatsApp number the booking pages' "Send it on WhatsApp"
 *  button opens (Alexandru, 3 Nov 2026: the free way, with the WhatsApp
 *  Business app's own greeting message). Pasted once in /mentor → Settings,
 *  never in this public repo. '' when not set. */
export async function waNumber(D) {
  await bookingTables(D);
  const r = await D.prepare("SELECT v FROM booking_setting WHERE k = 'wa.to'").first();
  return phoneOf(r && r.v);
}
export async function setWaNumber(D, phone, at) {
  await bookingTables(D);
  if (!phone) await D.prepare("DELETE FROM booking_setting WHERE k = 'wa.to'").run();
  else await D.prepare("INSERT OR REPLACE INTO booking_setting (k, v, at) VALUES ('wa.to',?,?)").bind(phone, at).run();
}

/** One stored request, read for /mentor: the answers in words, the times as
 *  ISO strings. */
export function bookingRow(r) {
  let answers = {}, times = [];
  try { answers = JSON.parse(r.answers) || {}; } catch { answers = {}; }
  try { times = JSON.parse(r.times) || []; } catch { times = []; }
  return { id: r.id, kind: r.kind, name: r.name, email: r.email, created_at: r.created_at, status: r.status, tz: r.tz || ZONE,
    student_id: r.student_id || null, phone: r.phone || '', wa: r.wa || '', times, answers: answersText(r.kind, answers), confirmed_time: r.confirmed_time || null, confirmed_at: r.confirmed_at || null,
    confirmed_by: r.confirmed_by || null, note: r.note || '', closed_at: r.closed_at || null, closed_by: r.closed_by || null };
}
/** What a request can be, in /mentor (Alexandru, 2 Nov 2026: "full control"):
 *  asked → confirmed (an email goes) → held, or no-show; or declined /
 *  cancelled at any point. Only "confirmed" sends an email; the others file
 *  the request. Reopen puts it back to asked (or confirmed, when it had a time). */
export const BOOK_STATUS = { asked: 'To confirm', confirmed: 'Confirmed', held: 'Held', noshow: 'No-show', declined: 'Declined', cancelled: 'Cancelled' };
export const BOOK_CLOSED = ['held', 'noshow', 'declined', 'cancelled'];
/** A time Alexandru picks himself, other than theirs: any start in the
 *  future, within 60 days, on the minute. */
export function isOtherTime(iso, at = Date.now()) {
  if (typeof iso !== 'string' || !ISO.test(iso)) return false;
  const t = Date.parse(iso);
  return Number.isFinite(t) && t > at && t <= at + 60 * 86400_000 && t % 60000 === 0;
}
/** The newest requests, for /mentor → Inbox → Bookings. */
export async function bookingList(D, limit = 100) {
  await bookingTables(D);
  const rows = (await D.prepare('SELECT * FROM booking ORDER BY created_at DESC LIMIT ?').bind(limit).all()).results || [];
  return rows.map(bookingRow);
}
