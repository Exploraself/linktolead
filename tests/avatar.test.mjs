// The profile picture (31 Oct 2026): a small square data: URL kept on the
// founder's profile, returned by /api/state, removable, and refused when it
// is not a picture or too big.

import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as avatar, MAX } from '../functions/api/avatar.js';
import { onRequestGet as stateGet } from '../functions/api/state.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';
import fs from 'node:fs';

const { ok, done } = tally('avatar');
const DB = fakeD1();
const env = { DB, MAILCHIMP_MODE: 'test', MAILCHIMP_API_KEY: 'k-us1' };
fakeResend();
const r = await signup({ request: post('/api/signup', { first: 'Ana', last: 'Pop', email: 'ana.pic@example.com', consent: true, type: 'full', company: 'Acme', interest: 'Higher income', industry: 'Other', password: 'a-long-password', confirm: 'a-long-password' }), env });
const ana = (await r.json()).token;
const pic = 'data:image/jpeg;base64,' + 'A'.repeat(4000);
let a = await avatar({ request: post('/api/avatar', { token: ana, image: pic }), env });
ok(a.status === 200, 'a photo is saved');
let s = await (await stateGet({ request: get(`/api/state?t=${ana}`), env })).json();
ok(s.me.avatar === pic, '/api/state returns it');
ok((await avatar({ request: post('/api/avatar', { token: ana, image: 'javascript:alert(1)' }), env })).status === 400, 'not a picture: refused');
ok((await avatar({ request: post('/api/avatar', { token: ana, image: 'data:image/jpeg;base64,' + 'A'.repeat(MAX) }), env })).status === 400, 'too big: refused');
ok((await avatar({ request: post('/api/avatar', { token: 'nobody-nobody-nobody-x', image: pic }), env })).status === 404, 'no account: refused');
await avatar({ request: post('/api/avatar', { token: ana, image: '' }), env });
s = await (await stateGet({ request: get(`/api/state?t=${ana}`), env })).json();
ok(s.me.avatar === '', 'removed');
const pm = fs.readFileSync('public/profile-menu.js', 'utf8');
ok(pm.includes('squarePhoto') && pm.includes("position: 'fixed', left: '10px', right: '10px'"), 'profile menu: photo cut square; on a phone the menu stays inside the screen');
// Round 6: /api/state says when the North Star was taken (the dates only, not the answers).
import { onRequestPost as compassPost } from '../functions/api/compass.js';
await compassPost({ request: post('/api/compass', { token: ana, stage: 'build', answers: { ans: { 0: 3 }, history: [{ at: '2026-09-01T10:00:00.000Z', sc: [50, 40, 30, 20] }] }, results: { answered: [1, 0, 0, 0] } }), env, waitUntil: () => {} });
s = await (await stateGet({ request: get(`/api/state?t=${ana}`), env })).json();
ok(Array.isArray(s.compass.taken) && s.compass.taken.length === 2 && s.compass.taken[0] === '2026-09-01T10:00:00.000Z' && !('answers_json' in s.compass), '/api/state: the North Star taken twice, dates only');
done();
