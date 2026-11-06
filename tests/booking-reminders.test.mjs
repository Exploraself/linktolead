// A call: the preparation text and the reminders (Alexandru, 6 Nov 2026; AGENTS.md rule 23).
// The text per kind in Settings → Booking links, pre-filled and editable on each request,
// in the confirmation and both reminders; reminders 24 hours and 1 hour before a confirmed
// call, once each, never after Declined, Cancelled or Delete. No network: Resend is faked.

import { readFileSync } from 'node:fs';
import { bookingTables, reminderDue, REMIND, prepTexts, clockText } from '../functions/_booking.js';
import { bookingConfirmedLetter, bookingReminderDay, bookingReminderHour, RECEIPTS, linked } from '../functions/_letters.js';
import { bookingReminders } from '../functions/_booking-reminders.js';
import { onRequestPost as mentorPost } from '../functions/api/mentor.js';
import { JOBS } from '../worker.js';
import { fakeD1, tally } from './_d1.mjs';

const { ok, done } = tally('booking-reminders');
const B = 'https://linktolead.exploraself.com';
const read = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const H = 3600_000, M = 60_000;
const MEET = { discovery: 'https://meet.google.com/cfu-ioja-zwt', boardroom: 'https://meet.google.com/qox-mcfy-tdn' };

// ── The letters ──────────────────────────────────────────────────────────────
const call = '2026-11-10T15:00:00.000Z';
let L = bookingConfirmedLetter(B, { first: 'maya', kind: 'discovery', time: call, meet: MEET.discovery, prep: 'Bring your last three invoices.\n\nAnd one question you keep asking yourself.', tz: 'Europe/London', to: 'm@x.com' });
ok(/BEFORE WE SPEAK/.test(L.text) && L.text.includes('Bring your last three invoices.') && L.text.includes('And one question you keep asking yourself.') && !L.text.includes('write down the one decision'), 'confirmation: "Before we speak", then the text written for them');
L = bookingConfirmedLetter(B, { first: 'maya', kind: 'boardroom', time: call, meet: MEET.boardroom, tz: 'Europe/London', to: 'm@x.com' });
ok(/BEFORE YOUR 1:1/.test(L.text) && L.text.includes('the team and I read your first three levels'), 'confirmation, no text written: "Before your 1:1", then the usual line');
const D1 = bookingReminderDay(B, { first: 'maya', kind: 'discovery', time: call, meet: MEET.discovery, prep: 'Bring your invoices.', tz: 'Europe/London', at: '2026-11-09T15:30:00.000Z' });
ok(D1.subject === 'Tomorrow: our call at 15:00 London time' && /^Hi Maya,/.test(D1.text) && D1.text.includes('A short reminder: our call is tomorrow.') && D1.text.includes('Tuesday 10 November, 15:00 London time (16:00 in Rome) · 30 minutes, online, on Google Meet.'), '24 hours before: the subject and the time in their own zone, with Rome');
ok(D1.html.includes(MEET.discovery) && D1.text.includes('Bring your invoices.') && D1.text.includes('If the time no longer works, just reply to this email and we find another. The team and I are here for you.'), '24 hours before: the Meet button, the text, the way to change it');
const D2 = bookingReminderDay(B, { first: 'maya', kind: 'boardroom', time: call, meet: MEET.boardroom, tz: 'Europe/Rome', at: '2026-11-10T07:00:00.000Z' });
ok(D2.subject === 'Today: your 1:1 at 16:00' && D2.text.includes('your 1:1 is today'), 'the same day where they live: "today", never a false "tomorrow"');
const H1 = bookingReminderHour(B, { first: 'maya', kind: 'boardroom', time: call, meet: MEET.boardroom, tz: 'Europe/Rome' });
ok(H1.subject === 'In one hour: your 1:1' && H1.text.includes('We speak in one hour, at 16:00.') && H1.text.includes('At that time, tap the button and you’re in.') && /BEFORE YOUR 1:1/.test(H1.text) && H1.text.includes('See you soon.') && H1.html.includes(MEET.boardroom), '1 hour before: the subject, the time, the Meet button, the text, "See you soon"');
ok(RECEIPTS.includes('booking-reminder-day') && RECEIPTS.includes('booking-reminder-hour') && D1.receipt === true && H1.receipt === true, 'both reminders are receipts: no unsubscribe link, no offer');
ok(clockText(call, 'America/New_York') === '10:00 New York time' && clockText(call, '') === '16:00', 'their clock time: the city when it is not Rome');

// Addresses in the text are links (main chat, 6 Nov 2026: "make URLs in prep text clickable, escaped, https only").
const BR = 'Please give this 20 minutes before your 1:1:\n\n1. If one of your first three levels is still open, finish it in your Base Camp: linktolead.exploraself.com/ground-plan/\n   The team and I read them before we meet, so the hour is spent on you.';
L = bookingConfirmedLetter(B, { first: 'maya', kind: 'boardroom', time: call, meet: MEET.boardroom, prep: BR, tz: 'Europe/London', to: 'm@x.com' });
ok(L.html.includes('<a href="https://linktolead.exploraself.com/ground-plan/" style="color:') && L.html.includes('>linktolead.exploraself.com/ground-plan/</a>') && L.text.includes('Base Camp: https://linktolead.exploraself.com/ground-plan/'), 'a Base Camp address written without https becomes a link, with https');
ok(L.html.includes('\n   The team and I read them'), 'the lines and their indent stay as written');
const lk = (s) => (Array.isArray(linked(s)) ? linked(s) : [linked(s)]).filter((x) => typeof x !== 'string').map((x) => x.url);
ok(JSON.stringify(lk('See https://meet.google.com/abc-defg-hij.')) === '["https://meet.google.com/abc-defg-hij"]', 'an https address is a link, without the full stop after it');
ok(!lk('http://example.com and javascript:alert(1) and ftp://x.com').length && !lk('Write to alex@exploraself.com').length, 'nothing else becomes a link: no http://, no other scheme, not an email address');
ok(JSON.stringify(lk('exploraself.com/unshakeable, then www.exploraself.com')) === '["https://exploraself.com/unshakeable","https://www.exploraself.com"]', 'our own sites written without https get it');
L = bookingConfirmedLetter(B, { first: 'maya', kind: 'discovery', time: call, meet: MEET.discovery, prep: 'Bring <b>this</b> & https://x.example/"onmouseover=alert(1)', to: 'm@x.com' });
ok(L.html.includes('Bring &lt;b&gt;this&lt;/b&gt; &amp; ') && !L.html.includes('"onmouseover') && L.html.includes('href="https://x.example/"'), 'everything is escaped: no markup, and an address ends at a quote');
ok(typeof linked('No address here.') === 'string', 'a text without an address stays plain text');

// ── When a reminder is owed ──────────────────────────────────────────────────
const t0 = Date.parse(call);
const conf = (extra = {}) => ({ status: 'confirmed', confirmed_time: call, confirmed_at: new Date(t0 - 3 * 24 * H).toISOString(), ...extra });
ok(reminderDue(conf(), t0 - 23.9 * H) === 'day' && reminderDue(conf(), t0 - 24.5 * H) === '' && reminderDue(conf(), t0 - 2 * H) === '', '24 hours before: in its window only');
ok(reminderDue(conf(), t0 - 53 * M) === 'hour' && reminderDue(conf(), t0 - 83 * M) === 'hour' && reminderDue(conf(), t0 - 95 * M) === '' && reminderDue(conf(), t0 - 5 * M) === '', '1 hour before: from 90 to 10 minutes before (the :07 run lands 53 to 83 minutes before)');
ok(reminderDue(conf({ remind_day_at: 'x' }), t0 - 23 * H) === '' && reminderDue(conf({ remind_hour_at: 'x' }), t0 - 60 * M) === '', 'each reminder once');
ok(reminderDue(conf({ confirmed_at: new Date(t0 - 10 * H).toISOString() }), t0 - 9 * H) === '' && reminderDue(conf({ confirmed_at: new Date(t0 - 10 * H).toISOString() }), t0 - 60 * M) === 'hour', 'confirmed less than 24 hours ahead: only the 1-hour reminder');
ok(['asked', 'declined', 'cancelled', 'held', 'noshow', 'sending'].every((s) => reminderDue(conf({ status: s }), t0 - 60 * M) === ''), 'never for a request that is not confirmed (declined, cancelled, still to confirm…)');
ok(reminderDue(conf(), t0 + M) === '' && REMIND.hourFrom === 90 * M && REMIND.dayFrom === 24 * H, 'never after the call');

// ── The hourly job ───────────────────────────────────────────────────────────
const sent = [];
globalThis.fetch = async (url, opts = {}) => {
  if (String(url).includes('api.resend.com')) { sent.push(JSON.parse(opts.body)); return { ok: true, json: async () => ({ id: 'e' }) }; }
  return { ok: false, status: 503, headers: new Headers(), text: async () => 'offline', json: async () => ({}) };
};
const DB = fakeD1();
const env = { DB, RESEND_API_KEY: 're_test', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Rome', MENTOR_KEY: 'k'.repeat(24) };
await bookingTables(DB);
const add = (id, kind, status, time, confirmedAt, extra = {}) => DB.raw.prepare(`INSERT INTO booking (id, kind, email, name, answers, times, created_at, status, tz, confirmed_time, confirmed_at, prep)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, kind, `${id}@example.com`, `${id} Test`, '{}', JSON.stringify([time]), confirmedAt, status, extra.tz || 'Europe/Rome', status === 'asked' ? null : time, confirmedAt, extra.prep || null);
const now0 = t0 - 23.5 * H;
add('ana', 'discovery', 'confirmed', call, new Date(t0 - 3 * 24 * H).toISOString(), { prep: 'Bring your invoices.' });
add('ben', 'boardroom', 'cancelled', call, new Date(t0 - 3 * 24 * H).toISOString());
add('cy', 'discovery', 'declined', call, new Date(t0 - 3 * 24 * H).toISOString());
add('dee', 'boardroom', 'confirmed', call, new Date(t0 - 5 * H).toISOString());
add('eve', 'discovery', 'asked', call, new Date(t0 - 3 * 24 * H).toISOString());
let r = await bookingReminders(env, DB, B, new Date(now0));
ok(r.noRoom === 1 && r.day === 0 && !sent.length, 'no Meet room pasted yet: nothing goes');
DB.raw.prepare("INSERT INTO booking_setting (k, v, at) VALUES ('meet.discovery', ?, 'x'), ('meet.boardroom', ?, 'x')").run(MEET.discovery, MEET.boardroom);
r = await bookingReminders(env, DB, B, new Date(now0));
ok(r.day === 1 && sent.length === 1 && sent[0].to[0] === 'ana@example.com' && /^Tomorrow: our call at 16:00/.test(sent[0].subject) && sent[0].text.includes('Bring your invoices.') && sent[0].html.includes(MEET.discovery), '24 hours before: only Ana (confirmed early), with her text and the room');
ok(!sent.some((m) => /ben@|cy@|eve@/.test(m.to[0])), 'never to a cancelled, declined or unconfirmed request');
r = await bookingReminders(env, DB, B, new Date(now0 + 10 * M));
ok(r.day === 0 && sent.length === 1, 'the next run sends nothing twice');
r = await bookingReminders(env, DB, B, new Date(t0 - 53 * M));
const hour = sent.slice(1);
ok(r.hour === 2 && hour.length === 2 && hour.every((m) => /^In one hour: /.test(m.subject)) && hour.some((m) => m.to[0] === 'dee@example.com'), '1 hour before: Ana and Dee (confirmed late, so this is her only reminder)');
r = await bookingReminders(env, DB, B, new Date(t0 - 30 * M));
ok(r.hour === 0 && sent.length === 3, 'and never twice');
ok(DB.raw.prepare("SELECT remind_day_at FROM booking WHERE id = 'dee'").get().remind_day_at === null, 'Dee never got a 24-hour reminder');
ok(typeof JOBS['booking-reminders'] === 'function' && /bookingReminders\(env, D\)/.test(read('worker.js')), 'the Worker\'s hourly run sends them');

// ── /mentor ──────────────────────────────────────────────────────────────────
const MP = async (body) => { const res = await mentorPost({ request: new Request(`${B}/api/mentor`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-mentor-key': env.MENTOR_KEY }, body: JSON.stringify(body) }), env }); return [res.status, await res.json()]; };
let [st, j] = await MP({ action: 'book-links', prep_discovery: '  Write down the one decision.  ', prep_boardroom: '' });
ok(st === 200 && j.prep.discovery === 'Write down the one decision.' && j.prep.boardroom === '' && (await prepTexts(DB)).discovery === 'Write down the one decision.', 'Settings → Booking links: the text per kind is saved (and an empty one stays empty)');
const future = new Date(Date.now() + 5 * 24 * H); future.setUTCMinutes(0, 0, 0);
add('fay', 'discovery', 'asked', future.toISOString(), new Date().toISOString());
[st, j] = await MP({ action: 'book-confirm', booking: 'fay', time: future.toISOString(), prep: 'Your own words, Fay.' });
const fayMail = sent[sent.length - 1];
ok(st === 200 && fayMail.to[0] === 'fay@example.com' && fayMail.text.includes('Your own words, Fay.') && DB.raw.prepare("SELECT prep FROM booking WHERE id = 'fay'").get().prep === 'Your own words, Fay.', 'Confirm: the text written for this person goes in the email and is kept for the reminders');
DB.raw.prepare("UPDATE booking SET remind_day_at = 'x' WHERE id = 'fay'").run();
const later = new Date(future.getTime() + 24 * H);
[st, j] = await MP({ action: 'book-confirm', booking: 'fay', time: later.toISOString(), again: true });
const fay = DB.raw.prepare("SELECT prep, remind_day_at FROM booking WHERE id = 'fay'").get();
ok(st === 200 && fay.remind_day_at === null && fay.prep === 'Your own words, Fay.' && sent[sent.length - 1].text.includes('Your own words, Fay.'), 'moved to another time: the reminders start afresh, the text stays');
add('gus', 'discovery', 'asked', future.toISOString(), new Date().toISOString());
[st, j] = await MP({ action: 'book-confirm', booking: 'gus', time: future.toISOString() });
ok(st === 200 && sent[sent.length - 1].text.includes('Write down the one decision.'), 'no text sent with Confirm: the default for its kind');

// ── The page and the rules ───────────────────────────────────────────────────
const mj = read('public/mentor/mentor.js');
ok(/id="bl-prep-\$\{k\}"/.test(mj) && /prep_discovery: \$\('#bl-prep-discovery'\)\.value, prep_boardroom: \$\('#bl-prep-boardroom'\)\.value/.test(mj), '/mentor Settings: one text box per kind, saved with the links');
ok(/id="prep-\$\{esc\(b\.id\)\}"/.test(mj) && /\$\{esc\(b\.prep \|\| \(data\.bookPrep \|\| \{\}\)\[kind\] \|\| ''\)\}/.test(mj) && /\.\.\.\(pf \? \{ prep: pf\.value \} : \{\}\)/.test(mj), '/mentor: each request shows the text pre-filled, and Confirm sends what is in the box');
ok(/Reminders: 24 hours before · /.test(mj), '/mentor: a confirmed call shows its reminders');
ok(!/placeholder="[^"]*(invoice|decision)/i.test(mj), 'the site never writes the preparation text itself (only a placeholder that says what goes there)');
ok(/## 23\. A call: the preparation text and the reminders/.test(read('AGENTS.md')), 'AGENTS.md rule 23');
done();
