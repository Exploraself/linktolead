// /mentor (Alexandru, 2 Nov 2026): "an option in Mentor … add somebody by
// email … decide ahead to what degree … at no cost", and at the top of Grow
// "those who haven't paid, those who paid, the percentage of them, and those
// who just paid".

import { readFileSync } from 'node:fs';
import { onRequestGet as mentorGet, onRequestPost as mentorPost } from '../functions/api/mentor.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { giftLetter } from '../functions/_letters.js';
import { pulse, payOf, liveIdsOf, filter, sinceOf } from '../public/mentor/dash.js';
import { fakeD1, fakeResend, tally } from './_d1.mjs';

const { ok, done } = tally('invite-grow');
const sent = fakeResend();
const DB = fakeD1();
const KEY = 'k'.repeat(24);
const env = { DB, MENTOR_KEY: KEY, RESEND_API_KEY: 'r', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Rome' };
const B = 'https://linktolead.exploraself.com';
const req = (path, { method = 'GET', body, key, token } = {}) => new Request(B + path, { method,
  headers: { 'content-type': 'application/json', ...(key ? { 'x-mentor-key': key } : {}), ...(token ? { 'x-account-token': token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
const jsonOf = async (r) => [r.status, await r.json()];
const asKey = (body) => mentorPost({ request: req('/api/mentor', { method: 'POST', key: KEY, body }), env }).then(jsonOf);
const make = async (first, email) => (await jsonOf(await signup({ request: req('/api/signup', { method: 'POST', body: { first, last: 'T', email, consent: true, source: 'compass', type: 'full', company: 'X', interest: 'More free time', industry: 'Other', password: 'longenough1', confirm: 'longenough1' } }), env, waitUntil: () => {} })))[1].token;

// ── The letter ─────────────────────────────────────────────────────────────
const lab = giftLetter(B, { first: 'maria', step: 'lab', url: `${B}/ground-plan/?signin=x&reset=1`, fresh: true, to: 'm@x.co' });
ok(lab.subject === 'A gift from Alexandru: The LAB' && /Hi Maria,/.test(lab.text) && /nothing to pay/.test(lab.text) && /Levels 01 to 09 are open/.test(lab.text), 'the gift letter: greeting, the gift, nothing to pay, what opened');
ok(/Set my password/.test(lab.text) && /7 days/.test(lab.text) && /Book your session/.test(lab.text) && /The team and I are here for you/.test(lab.text), 'one button to set the password, the booking link, and the team is there');
ok(!/library comes with/.test(lab.text), 'no promise of a library that is free for everyone anyway');
const free = giftLetter(B, { first: '', step: 'free', url: 'u', fresh: false });
ok(/Hi,/.test(free.text) && /Levels 01 to 03/.test(free.text) && /Open The Founder’s Blueprint/.test(free.text) && !/Book your session/.test(free.text), 'free: Levels 01 to 03, a sign-in button, no booking');

// ── The invitation ─────────────────────────────────────────────────────────
let [st, j] = await asKey({ action: 'invite', email: 'new.person@example.com', first: 'Nadia', step: 'lab' });
const nu = DB.raw.prepare("SELECT s.id, s.tier, s.name, p.consent, p.signup_type FROM student s JOIN student_profile p ON p.student_id = s.id WHERE s.email = 'new.person@example.com'").get();
ok(st === 200 && j.fresh && j.sent && nu && nu.tier === 'lab' && nu.name === 'Nadia', 'a new address: a free account, the LAB open at once, the letter sent');
ok(nu && !nu.consent && nu.signup_type === 'invited', 'no consent is invented for them: letters wait for their own yes');
const mail = sent[sent.length - 1];
ok(mail && mail.body.to[0] === 'new.person@example.com' && /A gift from Alexandru: The LAB/.test(mail.body.subject) && /reset=1/.test(mail.body.html), 'the letter goes to them, with the set-a-password link');
ok(DB.raw.prepare("SELECT COUNT(*) AS n FROM event WHERE student_id = ? AND kind = 'mentor-step'").get(nu.id).n === 1, 'the step change is on their climb');

const maya = await make('Maya', 'maya@example.com');
[st, j] = await asKey({ action: 'invite', email: 'maya@example.com', step: 'session' });
ok(st === 200 && !j.fresh && DB.raw.prepare('SELECT tier FROM student WHERE id = ?').get(maya).tier === 'session', 'an existing account moves up');
ok(!/reset=1/.test(sent[sent.length - 1].body.html), 'and, with a password already, gets a plain sign-in button');
const before = sent.length;
[st, j] = await asKey({ action: 'invite', email: 'maya@example.com', step: 'free' });
ok(st === 409 && /already has/.test(j.error) && sent.length === before && DB.raw.prepare('SELECT tier FROM student WHERE id = ?').get(maya).tier === 'session', 'never moves anyone down, and no letter goes');
[st, j] = await asKey({ action: 'invite', email: 'not-an-email', step: 'lab' });
ok(st === 400, 'a broken email is refused');
[st, j] = await asKey({ action: 'invite', email: 'x@example.com', step: 'gold' });
ok(st === 400, 'an unknown step is refused');

// A team member needs the right.
const sheba = await make('Sheba', 'sheba@example.com');
await asKey({ action: 'team-add', email: 'sheba@example.com' });
const asTeam = (body) => mentorPost({ request: req('/api/mentor', { method: 'POST', token: sheba, body }), env }).then(jsonOf);
[st] = await asTeam({ action: 'invite', email: 'other@example.com', step: 'hub' });
ok(st === 403 && !DB.raw.prepare("SELECT 1 FROM student WHERE email = 'other@example.com'").get(), 'a team member without “Invite a founder” cannot');
await asKey({ action: 'team-can', email: 'sheba@example.com', can: ['invite'] });
[st, j] = await asTeam({ action: 'invite', email: 'other@example.com', step: 'free' });
ok(st === 200 && j.fresh, 'with the tick, they can');

// ── Grow: joined and paid ──────────────────────────────────────────────────
const now = Date.parse('2026-11-02T18:00:00Z'), day = 864e5, iso = (d) => new Date(now - d * day).toISOString();
const S = [
  { id: 'a', tier: 'session', joined_at: iso(1) }, { id: 'b', tier: 'free', joined_at: iso(2) },
  { id: 'c', tier: 'lab', joined_at: iso(3) }, { id: 'd', tier: 'free', joined_at: iso(20) }, { id: 'e', tier: 'hub', joined_at: iso(40) },
];
const P = [
  { student_id: 'a', step: 'session', mode: 'live', amount: 2700, at: iso(0.5) },
  { student_id: 'b', step: 'session', mode: 'test', amount: 2700, at: iso(1) },
  { student_id: 'e', step: 'hub', mode: 'live', amount: 75000, at: iso(35) },
];
const live = liveIdsOf(P);
ok(payOf(S[0], live) === 'paid' && payOf(S[1], live) === 'free' && payOf(S[2], live) === 'given', 'paid = a real payment; a test payment is not paid; a step without a payment is “given free”');
const w7 = pulse(S, P, '7', now);
ok(w7.total === 3 && w7.paid === 1 && w7.given === 1 && w7.free === 1 && w7.notPaid === 2 && w7.pct === 33, '7 days: 3 joined, 1 paid (33%), 2 not paid yet (1 given free, 1 on the free levels)');
ok(w7.joined.map((s) => s.id).join() === 'a,b,c', 'newest first');
ok(w7.money === 2700 && w7.livePays.length === 1 && w7.test === 1 && w7.pays[0].student_id === 'a', 'money in counts real payments only; the test one is named, not counted');
const all = pulse(S, P, 'all', now);
ok(all.total === 5 && all.paid === 2 && all.pct === 40 && all.money === 77700, 'all time: 5 joined, 2 paid (40%), $777');
ok(pulse([], [], '30', now).pct === 0, 'nobody: 0%, never a division by zero');
ok(sinceOf('all', now) === 0 && sinceOf('30', now) === now - 30 * day, 'the windows');
ok(filter(S, { pay: 'notpaid', live }, now).map((s) => s.id).join() === 'b,c,d' && filter(S, { pay: 'paid', joined: '7', live }, now).map((s) => s.id).join() === 'a', 'Founders: filter by paid or not, and by when they joined');

// The roster carries the payments; the amounts only for those who may see them.
await mentorGet({ request: req('/api/mentor', { key: KEY }), env }); // makes the payment table
DB.raw.exec(`INSERT INTO payment (session, student_id, step, amount, currency, mode, from_tier, at) VALUES ('cs_live_1', '${maya}', 'session', 2700, 'usd', 'live', 'free', '${new Date().toISOString()}')`);
[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor', { key: KEY }), env }));
ok(st === 200 && j.paid.length === 1 && j.paid[0].amount === 2700 && j.paid[0].student_id === maya, 'the roster carries the payments, with the amount for the key');
[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor', { token: sheba }), env }));
ok(st === 200 && j.paid.length === 1 && !('amount' in j.paid[0]), 'without “See the payments”, who paid but not how much');

// The page.
const src = readFileSync(new URL('../public/mentor/mentor.js', import.meta.url), 'utf8');
ok(/function growHTML\(S\) \{\n  return `\$\{pulseHTML\(\)\}/.test(src), 'Grow opens with joined and paid');
ok(/data-gw=/.test(src) && /data-pf=/.test(src) && /\['Paid', 'pay'|row\('Paid', 'pay'/.test(src) && /row\('Joined', 'joined'/.test(src), 'the windows, each number opens Founders, and two new filters');
ok(/function inviteHTML\(\) \{\n  if \(!can\('invite'\)\) return '';/.test(src) && /Send the invitation/.test(src), 'Invite a founder, for those who may');

done();
