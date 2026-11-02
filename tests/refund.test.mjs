// Ask for a refund (Alexandru, 2 Nov 2026): in every Base Camp, the founder
// names the programme they paid for and confirms name and email; /mentor →
// Refunds lists it in red; Alexandru gets in touch himself. Nothing is
// refunded by the code, and the founder is never told a refund was made.

import { readFileSync } from 'node:fs';
import { onRequestPost as refund } from '../functions/api/refund.js';
import { onRequestGet as mentorGet, onRequestPost as mentorPost } from '../functions/api/mentor.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { ACTION_RIGHT } from '../functions/_team.js';
import { fakeD1, fakeResend, post, tally } from './_d1.mjs';

const { ok, done } = tally('refund');
fakeResend();
const DB = fakeD1();
const env = { DB, MENTOR_KEY: 'k'.repeat(24) };
const B = 'https://linktolead.exploraself.com';
const M = (method = 'GET', body) => new Request(B + '/api/mentor', { method, headers: { 'content-type': 'application/json', 'x-mentor-key': env.MENTOR_KEY }, ...(body ? { body: JSON.stringify(body) } : {}) });
const ask = async (body, ip) => { const r = await refund({ request: post('/api/refund', body, ip), env }); return { status: r.status, j: await r.json() }; };

const s = await (await signup({ request: post('/api/signup', { first: 'Rita', last: 'Example', email: 'rita@example.com', consent: false }), env })).json();
ok(!!s.token, 'a founder with an account');

let r = await ask({ step: 'lab', name: 'Rita Example', email: 'rita@example.com', token: s.token });
ok(r.status === 200 && r.j.ok, 'a request with the programme, name and email is kept');
r = await ask({ step: 'free', name: 'X', email: 'x@example.com' });
ok(r.status === 400 && /programme/.test(r.j.error || r.j.message || JSON.stringify(r.j)), 'the programme must be a paid one');
r = await ask({ step: 'hub', name: '', email: 'x@example.com' });
ok(r.status === 400, 'a name is needed');
r = await ask({ step: 'hub', name: 'Sam', email: 'not-an-email' });
ok(r.status === 400, 'an email is needed');
r = await ask({ step: 'hub', name: 'Sam Example', email: 'sam@example.com' }, '9.9.9.9');
ok(r.status === 200, 'without an account too (everybody has the option)');
for (let i = 0; i < 5; i++) r = await ask({ step: 'hub', name: 'Sam Example', email: 'sam@example.com' }, '9.9.9.9');
ok(r.status === 429, 'at most five a day from one address');

const g = await (await mentorGet({ request: M(), env })).json();
const mine = (g.refunds || []).find((x) => x.email === 'rita@example.com');
ok(Array.isArray(g.refunds) && mine && mine.step === 'lab' && mine.name === 'Rita Example' && mine.student_id === s.token && !mine.done_at, '/mentor gets every request, with the account it belongs to');
let p = await (await mentorPost({ request: M('POST', { action: 'refund-done', id: mine.id }), env })).json();
ok(p.ok && p.done === true, 'Mark done files it');
const g2 = await (await mentorGet({ request: M(), env })).json();
ok(g2.refunds.find((x) => x.id === mine.id).done_at && !g2.refunds[0].done_at, 'done ones go after the open ones');
p = await (await mentorPost({ request: M('POST', { action: 'refund-done', id: mine.id, done: false }), env })).json();
ok(p.ok && p.done === false, 'and can be opened again');
ok(ACTION_RIGHT['refund-done'] === 'payments', 'marking a request needs the payments right (rule 18)');

const app = readFileSync('public/app.js', 'utf8'), mentor = readFileSync('public/mentor/mentor.js', 'utf8'), css = readFileSync('public/mentor/index.html', 'utf8');
ok(app.includes('${refundHTML()}') && app.includes('Which programme did you pay for?') && app.includes('The email you paid with'), 'Base Camp: the option, the programme, the name and the email');
const said = app.slice(app.indexOf('function refundHTML'), app.indexOf('function refundHTML') + 2500);
ok(/gets in touch with you personally/.test(said) && !/refunded|refund (is|was) (made|done|sent)/i.test(said), 'it says Alexandru gets in touch, never that a refund was made (rule 6)');
ok(mentor.includes("['refunds', 'Refunds']") && mentor.includes('class="tab-red"') && css.includes('.tabs button.tab-red'), '/mentor: its own Refunds tab, in red');
done();
