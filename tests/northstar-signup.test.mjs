// The North Star's way in (Alexandru, 5 Nov 2026): first name and email (or
// Google) are enough; the full account opens only the what-if lab and More
// feedback, asking only what is missing (never the name or email again), with
// a password for everyone ("the general audience or the full account,
// period"). The Growth Plan and the free library books open with first name
// and email. Real routes on Node's own SQLite; the page's code read as text.

import { readFileSync } from 'node:fs';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as complete } from '../functions/api/complete.js';
import { onRequestGet as stateGet } from '../functions/api/state.js';
import { onRequestGet as libraryGet } from '../functions/api/library.js';
import { onRequestPost as growthPost } from '../functions/api/growth-plan.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('northstar-signup');
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
fakeResend();
const DB = fakeD1();
const WORKBOOKS = { get: async (k) => (k === 'a-new-way-of-winning.pdf' ? { body: 'pdf', arrayBuffer: async () => new ArrayBuffer(3) } : null) };
const env = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Rome', GPW_MODE: 'off', WORKBOOKS };
const j = async (r) => [r.status, await r.json().catch(() => ({}))];

// ── The page ───────────────────────────────────────────────────────────────
const ns = read('public/northstar/app.js'), box = read('public/account-box.js'), rb = read('public/reset-box.js');
ok(/variant: 'simple', nameOnly: true, landing: doorOf\(\), stay: true/.test(ns), 'the way in: the simple account, first name and email');
ok(/const isFull = \(\) => signedIn\(\) && /.test(ns) && /if \(!GP_ME\.hasPassword && !m\.includes\('password'\)\) m\.push\('password'\)/.test(ns), 'a full account: nothing missing and a password, for everyone');
ok(/case 'pmore': if \(!S\.pmore\[i\] && !isFull\(\)\) \{ needFull\('feedback'/.test(ns) && /case 'more': if \(!S\.more\[i\] && !isFull\(\)\) \{ needFull\('feedback'/.test(ns), 'More feedback asks for the full account');
ok(/const open = !!S\.pmore\[o\.n\] && isFull\(\)/.test(ns) && /const open = !!S\.more\[i\] && isFull\(\)/.test(ns), 'More feedback never shows open without the full account (even if opened before)');
ok(/if \(!isFull\(\)\) return \{ locked: true, account: true/.test(ns) && /case 'lab-full': needFull\('lab'/.test(ns) && /labNudge\(L\.account\)/.test(ns), 'the what-if lab: shown, its levers move, it answers only with the full account');
ok(/const gpWrite = \(\) => signedIn\(\);/.test(ns), 'the Growth Plan: any account writes');
ok(/m\.openComplete\(\{[^}]*lock, full: true/.test(ns), 'the locks ask through the complete box, with full: true');
ok(/lab: \['The what-if lab'/.test(rb) && /feedback: \['More feedback'/.test(rb) && /if \(full\) f\.full = true;/.test(rb) && /Your name and email are already in\./.test(rb), 'the complete box says which lock it opens, and never asks the name or email');
ok(/if \(!last && !ctx\.nameOnly\)/.test(box), 'the box asks no surname on the way in');
ok(!/north3\/#join/.test(read('public/app.js').slice(read('public/app.js').indexOf('const manuals'), read('public/app.js').indexOf('const manuals') + 6000)), 'the library buttons send no account to the short box, not the full form');

// ── The account: one, never asked twice ────────────────────────────────────
let [s, a] = await j(await signup({ request: post('/api/signup', { first: 'Nia', email: 'nia@example.com', consent: true, type: 'simple', source: 'compass', landing: 'compass' }), env }));
ok(s === 200 && a.token, 'first name and email make the account (no surname, no password)');
const nia = a.token;
let [, st] = await j(await stateGet({ request: get(`/api/state?t=${nia}`), env }));
ok(st.me && st.me.email === 'nia@example.com' && st.me.missing.includes('password') && st.me.hasPassword === false, 'the account knows her name and email, and what is missing');

// The Growth Plan and a free book open with this account.
let r = await growthPost({ request: post('/api/growth-plan', { token: nia, blank: 'mgp-1.1', text: 'Being on time' }), env });
ok(r.status === 200, 'the Growth Plan: she writes in it');
r = await libraryGet({ request: get(`/api/library?item=nww&t=${nia}`), env });
ok(r.status === 200 && /pdf/.test(r.headers.get('content-type') || ''), 'a free library book downloads with first name and email');
r = await libraryGet({ request: get('/api/library?item=nww'), env });
ok(r.status === 302 && /\/road3\/#join$/.test(r.headers.get('location') || ''), 'no account at all: the short box, not the full form');
r = await libraryGet({ request: get(`/api/library?item=btl&t=${nia}`), env });
ok(r.status === 302 && /exploraself\.com\/hub/.test(r.headers.get('location') || ''), 'HUB books stay with The HUB');

// Completing at a lock: only what is missing.
[s, a] = await j(await complete({ request: post('/api/complete', { token: nia, noCompany: true, interest: 'Higher income', industry: 'Other', password: 'a-long-password', full: true }), env }));
ok(s === 200 && a.complete, 'at a lock she adds company, want, industry and a password, nothing else');
[, st] = await j(await stateGet({ request: get(`/api/state?t=${nia}`), env }));
ok(st.me.missing.length === 0 && st.me.hasPassword === true && st.me.email === 'nia@example.com', 'now a full account, the same one: the Blueprint never asks again');

// Google sign-ups: the locks ask a password too; Base Camp does not.
[, a] = await j(await signup({ request: post('/api/signup', { first: 'Gus', email: 'gus@example.com', consent: true, type: 'simple' }), env }));
const gus = a.token;
DB.raw.prepare("UPDATE student_profile SET google_at = '2026-11-05T20:00:00Z' WHERE student_id = ?").run(gus);
[s, a] = await j(await complete({ request: post('/api/complete', { token: gus, noCompany: true, interest: 'Higher income', industry: 'Other', full: true }), env }));
ok(s === 400 && /password|10 characters/i.test(a.error || ''), 'Google sign-up at a lock: a password is asked too');
[s, a] = await j(await complete({ request: post('/api/complete', { token: gus, noCompany: true, interest: 'Higher income', industry: 'Other' }), env }));
ok(s === 200 && a.complete, 'Google sign-up at Base Camp: no password asked, as before');
[s, a] = await j(await complete({ request: post('/api/complete', { token: gus, password: 'another-long-one', full: true }), env }));
ok(s === 200 && DB.raw.prepare('SELECT pass_hash FROM account_auth WHERE student_id = ?').get(gus)?.pass_hash, 'then, at a lock, only the password: and it is saved');

done();
