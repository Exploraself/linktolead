// One step before the first answer (31 Oct 2026, Alexandru): one universal
// rule, whatever sales page a founder came from. /api/state says what an
// account still lacks; /api/complete fills only that, once, and the account
// becomes full. The Blueprint asks at the first answer and keeps it.

import fs from 'node:fs';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestGet as stateGet } from '../functions/api/state.js';
import { onRequestPost as complete } from '../functions/api/complete.js';
import { onRequestPost as login } from '../functions/api/login.js';
import { missingOf } from '../functions/_profile.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('complete');
const DB = fakeD1();
const env = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome' };
fakeResend();
const J = async (r) => [r.status, await r.json()];
const state = async (t) => (await stateGet({ request: get(`/api/state?t=${t}`), env })).json();

// ── The rule ─────────────────────────────────────────────────────────────────
ok(missingOf({}).join() === 'company,interest,industry,password', 'nothing given: all four are missing');
ok(missingOf({ company: '', interest: 'Steady clients', industry: 'Other', hasPassword: true }).length === 0, '"No company yet" counts as an answer');
ok(missingOf({ company: 'Acme', interest: 'Nope', industry: 'Other', hasPassword: true }).join() === 'interest', 'only a real choice counts');

// ── A simple sign-up (road3, or any future name + email page) ───────────────
const [, s1] = await J(await signup({ request: post('/api/signup', { first: 'Sam', last: 'Ray', email: 'sam@example.com', type: 'simple', landing: 'road3', consent: true }), env }));
let st = await state(s1.token);
ok(st.me.missing.join() === 'company,interest,industry,password', 'state: a simple account lacks all four');
let [code, out] = await J(await complete({ request: post('/api/complete', { token: s1.token, company: 'Ray Studio', interest: 'Steady clients' }), env }));
ok(code === 400 && /industry/i.test(out.error || ''), 'complete: the first thing still missing, in plain words');
ok((await state(s1.token)).me.missing.length === 4, 'complete: nothing is written until everything is there');
[code] = await J(await complete({ request: post('/api/complete', { token: s1.token, company: 'Ray Studio', interest: 'Steady clients', industry: 'Creative & design', password: 'short' }), env }));
ok(code === 400, 'complete: the password rule still holds');
[code, out] = await J(await complete({ request: post('/api/complete', { token: s1.token, company: 'Ray Studio', interest: 'Steady clients', industry: 'Creative & design', password: 'a long enough secret' }), env }));
st = await state(s1.token);
ok(code === 200 && out.complete && st.me.missing.length === 0 && st.me.signupType === 'full' && st.me.hasPassword, 'complete: a full account, with a password');
[code] = await J(await login({ request: post('/api/login', { email: 'sam@example.com', password: 'a long enough secret' }), env }));
ok(code === 200, 'complete: the new password signs in');
[code, out] = await J(await complete({ request: post('/api/complete', { token: s1.token, company: 'Someone else' }), env }));
const prof = DB.raw.prepare('SELECT company FROM student_profile WHERE student_id = ?').get(s1.token);
ok(code === 200 && out.complete && prof.company === 'Ray Studio', 'complete again: nothing to ask, nothing overwritten');
ok(DB.raw.prepare("SELECT COUNT(*) AS n FROM event WHERE kind = 'completed'").get().n === 1, 'one "completed" event');

// ── "No company yet" ─────────────────────────────────────────────────────────
const [, s2] = await J(await signup({ request: post('/api/signup', { first: 'Ana', email: 'ana@example.com', type: 'simple', landing: 'compass' }), env }));
[code] = await J(await complete({ request: post('/api/complete', { token: s2.token, noCompany: true, interest: 'More free time', industry: 'Other', password: 'another long secret' }), env }));
ok(code === 200 && (await state(s2.token)).me.missing.length === 0, '"No company yet" completes it');

// ── A full sign-up is complete from the start ───────────────────────────────
const [, s3] = await J(await signup({ request: post('/api/signup', { first: 'Bo', last: 'Lee', email: 'bo@example.com', type: 'full', company: 'Lee & Co', interest: 'Higher income', industry: 'Other', password: 'a full form secret', confirm: 'a full form secret', landing: 'road1' }), env }));
ok((await state(s3.token)).me.missing.length === 0, 'a full sign-up is never asked');
[code] = await J(await complete({ request: post('/api/complete', { token: 'not-a-token-at-all-xxxxxxxx' }), env }));
ok(code === 401, 'complete: only for a signed-in founder');

// ── The Blueprint asks at the first answer, and keeps it ─────────────────────
const app = fs.readFileSync('public/app.js', 'utf8'), box = fs.readFileSync('public/reset-box.js', 'utf8');
ok(app.includes('const needsAccount = () => account.joined() && pulled && missing.length > 0') && app.includes("['v4t', 'got', 'v4day', 'carry'].find((k) => b.dataset[k] != null)") && app.includes('if (ans && needsAccount())') && app.includes("closest('input[data-v4s], input[data-v4f], input[data-v4u]')"), 'Base Camp: the first tap, slide, sentence, day or Sunday answer asks first');
ok(/function keep4\(d, k, v, lv = level\) \{\s*\/\/[^\n]*\n\s*if \(needsAccount\(\)\) \{ askAccount\(\(\) => keep4\(d, k, v, lv\)\); return; \}/.test(app), 'Base Camp: the answer is held and applied after the save');
ok(box.includes('export function openComplete(') && box.includes("need('password') ? pw(") && box.includes('One step before your first answer'), 'the box asks only for what is missing');
done();
