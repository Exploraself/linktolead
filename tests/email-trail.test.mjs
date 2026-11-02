// Everything for this email (Alexandru, 3 Nov 2026: "the email must become
// clickable and show the other connections the email has … with the
// linktolead entry points"). GET /api/mentor?email= reads one address's
// accounts, ways in and dated trail; every email in /mentor opens it.

import { readFileSync } from 'node:fs';
import { onRequestPost as refund } from '../functions/api/refund.js';
import { onRequestGet as mentorGet } from '../functions/api/mentor.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { levelsTouched, northStarDates } from '../functions/_trail.js';
import { fakeD1, fakeResend, post, tally } from './_d1.mjs';

const { ok, done } = tally('email-trail');
fakeResend();
const DB = fakeD1();
const env = { DB, MENTOR_KEY: 'k'.repeat(24) };
const B = 'https://linktolead.exploraself.com';
const M = (q, key = env.MENTOR_KEY) => new Request(B + '/api/mentor' + q, { headers: { 'x-mentor-key': key } });

const s = await (await signup({ request: post('/api/signup', { first: 'Rita', last: 'Example', email: 'Rita@Example.com', consent: false, landing: 'north3' }), env })).json();
ok(!!s.token, 'a founder with an account');
await refund({ request: post('/api/refund', { step: 'lab', name: 'Rita Example', email: 'rita@example.com', token: s.token }), env });
await refund({ request: post('/api/refund', { step: 'hub', name: 'Sam Example', email: 'sam@example.com' }, '9.9.9.9'), env });

let r = await mentorGet({ request: M('?email=' + encodeURIComponent('rita@example.com'), 'wrong'), env });
ok(r.status === 401, 'only for the mentor key or the team');

let j = await (await mentorGet({ request: M('?email=' + encodeURIComponent(' RITA@example.com ')), env })).json();
ok(j.ok && j.email === 'rita@example.com', 'the address is read without case or spaces');
ok(j.accounts.length === 1 && j.accounts[0].id === s.token && j.accounts[0].name, 'its account');
ok(j.accounts[0].profile && j.accounts[0].profile.landing === 'north3', 'with the page it came in on');
ok(j.accounts[0].events.some((e) => e.kind === 'signup'), 'and what it did, dated');
ok(j.refunds.length === 1 && j.refunds[0].step === 'lab', 'the refund it asked for');
ok(!('amount' in (j.accounts[0].payments[0] || {})), 'no payment amounts are sent when there is no payment (and only with the payments right)');

j = await (await mentorGet({ request: M('?email=sam@example.com'), env })).json();
ok(j.ok && j.accounts.length === 0 && j.refunds.length === 1, 'an address without an account still shows what it did');
j = await (await mentorGet({ request: M('?email=nope'), env })).json();
ok(j.ok && j.bad, 'not an email: nothing is read');

ok(JSON.stringify(levelsTouched([{ key: 'w.v4.4.0.t', value: '1', updated_at: '2026-11-02T10:00:00Z' }, { key: 'w.v4.4.1.s', value: '5', updated_at: '2026-11-01T10:00:00Z' }, { key: 'w.v4.2.w.note', value: 'x', updated_at: '2026-11-01T10:00:00Z' }, { key: 'w.v4.6.0.t', value: '', updated_at: '2026-11-01T10:00:00Z' }]))
  === JSON.stringify([{ level: 4, first: '2026-11-01T10:00:00Z', last: '2026-11-02T10:00:00Z' }]), 'levels touched: only real answers, with their first and last day');
ok(JSON.stringify(northStarDates({ updated_at: 'b', answers_json: JSON.stringify({ history: [{ at: 'a' }] }) })) === '["a","b"]', 'every North Star date, oldest first');

const mentor = readFileSync('public/mentor/mentor.js', 'utf8');
const plain = [...mentor.matchAll(/<span class="[^"]*">\$\{esc\((?:s|n|x|b)\.email\)\}/g)];
ok(plain.length === 0, `no email is shown as plain text (${plain.length} left)`);
ok(mentor.includes("if (d.email) return trail(d.email);") && mentor.includes("api('?email=' + encodeURIComponent(email))"), 'a tap on an email opens everything for it');
ok(/Ways in/.test(mentor) && /LANDING_PATH = \{[^}]*north3: '\/north3\/'/.test(mentor) && mentor.includes("const SITE = 'https://linktolead.exploraself.com'"), 'the ways in are full linktolead links');
ok(mentor.includes("n.level ? ' · Level '") && mentor.includes('data-at="ask"'), 'Inbox shows the level and domain of each question, and Read and answer opens the thread');
done();
