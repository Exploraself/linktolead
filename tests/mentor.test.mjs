// The mentor's account manager and dashboard: the key, changing step, pausing,
// deleting every row, the CSV, messages to email / Ground Plan / both, the
// unsubscribed rule, dismissing a note, and the dashboard counts.

import { onRequestGet as mGet, onRequestPost as mPost, toCSV } from '../functions/api/mentor.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as compassPost } from '../functions/api/compass.js';
import { onRequestPost as tick } from '../functions/api/plans/tick.js';
import { onRequestGet as msgGet, onRequestPost as msgRead } from '../functions/api/messages.js';
import { onRequestPost as notePost } from '../functions/api/note.js';
import { onRequestGet as unsub } from '../functions/api/unsubscribe.js';
import { summary, filter, needsYou } from '../public/mentor/dash.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('mentor');
const DB = fakeD1();
const env = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MENTOR_KEY: 'mentor-key-123' };
let sent = fakeResend();
const K = { 'x-mentor-key': 'mentor-key-123' };
const req = (method, q = '', body, key = K) => new Request('https://linktolead.exploraself.com/api/mentor' + q, { method, headers: { 'content-type': 'application/json', ...key }, body: body ? JSON.stringify(body) : undefined });
const M = async (body, key) => { const r = await mPost({ request: req('POST', '', body, key), env }); return [r.status, await r.json()]; };
const list = async () => (await (await mGet({ request: req('GET'), env })).json());

// Two founders, one with work everywhere.
let r = await signup({ request: post('/api/signup', { first: 'Ana', last: 'Pop', email: 'ana@example.com', consent: true }), env });
const ana = (await r.json()).token;
r = await signup({ request: post('/api/signup', { first: 'Bo', email: 'bo@example.com', consent: true }), env });
const bo = (await r.json()).token;
await compassPost({ request: post('/api/compass', { token: ana, stage: 'growing', answers: { v: 2 }, results: { scores: [1, 2, 3, 4], answered: [2, 2, 2, 2] }, flags: {} }), env });
await tick({ request: post('/api/plans/tick', { token: ana, step: 'self-1', done: true }), env });
await notePost({ request: post('/api/note', { token: ana, body: 'Where do I start?' }), env });
DB.raw.prepare("INSERT INTO answer VALUES (?,?,?,?,?,?,?)").run(ana, 'grow', 1, 'self', 0, 'An answer', 'now');

// ── The key ──────────────────────────────────────────────────────────────────
ok((await mGet({ request: req('GET', '', null, {}), env })).status === 401, 'no key: 401');
ok((await mGet({ request: req('GET', '', null, { 'x-mentor-key': 'wrong-key-123' }), env })).status === 401, 'wrong key: 401');
ok((await mPost({ request: req('POST', '', { action: 'pause', student: ana, paused: true }, {}), env })).status === 401, 'actions need the key too');
ok((await mGet({ request: req('GET'), env: { ...env, MENTOR_KEY: '' } })).status === 401, 'no key configured: no access');

// ── The roster ───────────────────────────────────────────────────────────────
let L = await list();
const A = L.students.find((s) => s.id === ana);
ok(L.students.length === 2 && A.compass_at && A.plan_ticks === 1 && A.has_password === 0 && A.consent === 1 && A.paused === 0 && L.waiting.length === 1, 'roster: compass, ticks, password, consent, paused, notes waiting');
ok(A.stage === 'growing', 'roster: the stage is the one chosen in the North Star');

// ── Change step ──────────────────────────────────────────────────────────────
let [st] = await M({ action: 'tier', student: ana, tier: 'lab' });
ok(st === 200 && DB.raw.prepare('SELECT tier FROM student WHERE id=?').get(ana).tier === 'lab', 'change step');
[st] = await M({ action: 'tier', student: ana, tier: 'gold' });
ok(st === 400, 'an unknown step is refused');
ok(DB.raw.prepare("SELECT COUNT(*) n FROM event WHERE student_id=? AND kind='mentor-step'").get(ana).n === 1, 'change step is logged');

// ── Pause ────────────────────────────────────────────────────────────────────
await M({ action: 'pause', student: bo, paused: true });
ok((await list()).students.find((s) => s.id === bo).paused === 1, 'pause shows in the roster');
await M({ action: 'pause', student: bo, paused: false });
ok((await list()).students.find((s) => s.id === bo).paused === 0, 'unpause');
ok(DB.raw.prepare("SELECT COUNT(*) n FROM event WHERE student_id=? AND kind IN ('mentor-pause','mentor-unpause')").get(bo).n === 2, 'pause and unpause are logged');

// ── Sign-in and reset links ─────────────────────────────────────────────────
sent = fakeResend();
[st] = await M({ action: 'reset-link', student: bo });
ok(st === 200 && sent.length === 1 && sent[0].body.to[0] === 'bo@example.com' && /\/ground-plan\/\?signin=/.test(sent[0].body.text), 'a password reset link is the one-time sign-in link, to their Ground Plan');

// ── Messages ────────────────────────────────────────────────────────────────
sent = fakeResend();
[st, r] = await M({ action: 'message', student: ana, subject: 'Your <first> step', body: 'Book the Boardroom & bring level 03.', channel: 'email' });
ok(st === 200 && r.channel === 'email' && sent.length === 1, 'email only: sent by email');
ok(sent[0].body.subject === 'Your <first> step' && sent[0].body.html.includes('&amp; bring') && sent[0].body.text.includes('Via Esempio 1') && sent[0].body.html.includes('/api/unsubscribe?u='), 'a letter: his text escaped, with the footer and unsubscribe');
ok(sent[0].body.html.includes('/mail/signature.png') && sent[0].body.text.includes('Book the Boardroom & bring level 03.') && /\nP\.S\. /.test(sent[0].body.text), 'mentor letter: his own words, signed, with a P.S.');
let mine = await (await msgGet({ request: get('/api/messages?t=' + ana), env })).json();
ok(mine.messages.length === 0, 'email only: not in the Ground Plan');
sent = fakeResend();
[st, r] = await M({ action: 'message', student: ana, subject: 'In your plan', body: 'A note just for here.', channel: 'plan' });
ok(st === 200 && sent.length === 0, 'Ground Plan only: no email');
[st, r] = await M({ action: 'message', student: ana, subject: 'Both', body: 'Everywhere.', channel: 'both' });
ok(st === 200 && sent.length === 1 && r.emailed, 'both: emailed');
mine = await (await msgGet({ request: get('/api/messages?t=' + ana), env })).json();
ok(mine.messages.length === 2 && mine.unread === 2 && mine.messages.some((m) => m.subject === 'Both'), 'Ground Plan and both: in the Ground Plan, unread');
// Dismiss with "Got it".
await msgRead({ request: post('/api/messages', { token: ana, id: mine.messages[0].id }), env });
mine = await (await msgGet({ request: get('/api/messages?t=' + ana), env })).json();
ok(mine.unread === 1 && mine.messages.find((m) => m.read_at), 'Got it marks one read');
await msgRead({ request: post('/api/messages', { token: bo, id: mine.messages[1].id }), env });
ok((await (await msgGet({ request: get('/api/messages?t=' + ana), env })).json()).unread === 1, 'another founder cannot mark it read');
ok(DB.raw.prepare("SELECT COUNT(*) n FROM event WHERE student_id=? AND kind='mentor-message'").get(ana).n === 3, 'each send is logged');

// Unsubscribed: never an email, the Ground Plan instead.
const u = DB.raw.prepare('SELECT unsub_id FROM student_profile WHERE student_id=?').get(bo).unsub_id;
await unsub({ request: get('/api/unsubscribe?u=' + u), env });
sent = fakeResend();
[st, r] = await M({ action: 'message', student: bo, subject: 'Hello', body: 'Checking in.', channel: 'both' });
ok(st === 200 && sent.length === 0 && r.channel === 'plan' && r.unsubscribed, 'unsubscribed: no email, Ground Plan only');
[st, r] = await M({ action: 'message', student: bo, subject: 'Hello', body: 'Email only?', channel: 'email' });
ok(st === 200 && sent.length === 0 && r.channel === 'plan', 'unsubscribed, email only: still no email');
[st] = await M({ action: 'message', student: bo, subject: '', body: 'x', channel: 'plan' });
ok(st === 400, 'a message needs a subject');

// ── CSV ──────────────────────────────────────────────────────────────────────
const csvRes = await mGet({ request: req('GET', '?csv=1'), env });
const csv = await csvRes.text();
ok(csvRes.headers.get('content-type').startsWith('text/csv') && csv.split('\r\n')[0].includes('"Email"') && csv.includes('"ana@example.com"') && csv.includes('"LAB"'), 'CSV of every founder, with their step');
ok(toCSV([{ name: '=HYPERLINK("x")', email: 'a@b.co' }]).includes('"\'=HYPERLINK(""x"")"'), 'CSV defuses formulas and escapes quotes');
ok((await mGet({ request: req('GET', '?csv=1', null, {}), env })).status === 401, 'CSV needs the key');

// ── Delete removes every row ────────────────────────────────────────────────
[st] = await M({ action: 'delete', student: ana, confirm: 'not-her@example.com' });
ok(st === 400 && DB.raw.prepare('SELECT 1 FROM student WHERE id=?').get(ana), 'delete needs the exact email typed');
[st] = await M({ action: 'delete', student: ana, confirm: 'ANA@example.com' });
ok(st === 200, 'delete with the email typed');
const left = ['student', 'answer', 'compass', 'note', 'event', 'student_profile', 'plan_tick', 'message', 'account_auth', 'signin_code', 'mailchimp_log']
  .map((t) => [t, DB.raw.prepare(`SELECT COUNT(*) n FROM ${t} WHERE ${t === 'student' ? 'id' : 'student_id'} = ?`).get(ana).n]).filter(([, n]) => n > 0);
ok(left.length === 0, 'every row for that founder is gone' + (left.length ? ' (left: ' + left.map((x) => x[0]).join(', ') + ')' : ''));
ok(DB.raw.prepare("SELECT COUNT(*) n FROM mail_log WHERE email='ana@example.com'").get().n === 0, 'their mail log too');
ok(DB.raw.prepare("SELECT COUNT(*) n FROM event WHERE kind='mentor-delete'").get().n === 1, 'the delete is logged, without their details');
ok(DB.raw.prepare('SELECT 1 FROM student WHERE id=?').get(bo), 'the other founder is untouched');

// ── Dashboard counts on a small fixture ──────────────────────────────────────
const now = Date.parse('2026-10-29T12:00:00Z'), day = 86400000, iso = (d) => new Date(now - d * day).toISOString();
const F = [
  { id: 'a', name: 'Ana', email: 'a@x.co', tier: 'free', joined_at: iso(2), last_seen_at: iso(1), compass_at: iso(1), open_notes: 1 },
  { id: 'b', name: 'Bo', email: 'b@x.co', tier: 'session', joined_at: iso(30), last_seen_at: iso(20) },
  { id: 'c', name: 'Cy', email: 'c@x.co', tier: 'premium', joined_at: iso(10), last_seen_at: iso(14), compass_at: iso(12) },
  { id: 'd', name: 'Di', email: 'd@x.co', tier: null, joined_at: iso(1), last_seen_at: null },
];
const W = [{ student_id: 'a', name: 'Ana', email: 'a@x.co', body: 'Help', created_at: iso(0.5) }];
const S = summary(F, W, now);
ok(S.total === 4 && S.newWeek === 2 && S.compass === 2 && S.notes === 1 && S.quiet === 2, 'tiles: total, new this week, North Star done, notes waiting, quiet 14+ days');
ok(S.steps.free === 2 && S.steps.session === 1 && S.steps.lab === 0 && S.steps.hub === 0 && S.steps.premium === 1, 'counts per step; an empty step is 0');
ok(JSON.stringify(summary([], [], now)) === JSON.stringify({ total: 0, newWeek: 0, compass: 0, steps: { free: 0, session: 0, lab: 0, hub: 0, premium: 0 }, notes: 0, quiet: 0, library: 0, full: 0, simple: 0 }), 'no founders: every tile 0');
ok(filter(F, { tile: 'quiet' }, now).map((s) => s.id).join() === 'b,c' && filter(F, { tile: 'premium' }, now).map((s) => s.id).join() === 'c', 'tiles filter the table');
ok(filter(F, { q: 'B@X' }, now).map((s) => s.id).join() === 'b' && filter(F, { tile: 'free', q: 'di' }, now).map((s) => s.id).join() === 'd', 'search, alone and with a tile');
const N = needsYou(F, W, now);
ok(N.length === 3 && N[0].kind === 'note' && N.slice(1).every((x) => x.kind === 'quiet') && N.find((x) => x.id === 'b').days === 20, 'needs you: unread notes, then quiet founders');

done();
