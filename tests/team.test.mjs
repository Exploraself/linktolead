// The team (2 Nov 2026): Alexandru adds an exact address in /mentor (only
// with the mentor key); that account gets every level, the Growth Toolkit
// without a code, and /mentor with its own sign-in. Never matched on part of
// an address.

import { onRequestGet as mentorGet, onRequestPost as mentorPost } from '../functions/api/mentor.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestGet as stateGet } from '../functions/api/state.js';
import { onRequestPost as kitPost } from '../functions/api/toolkit.js';
import { readFileSync } from 'node:fs';
import { fakeD1, fakeResend, tally } from './_d1.mjs';

const { ok, done } = tally('team');
fakeResend();
const DB = fakeD1();
const env = { DB, MENTOR_KEY: 'k'.repeat(24) };
const B = 'https://linktolead.exploraself.com';
const req = (path, { method = 'GET', body, key, token } = {}) => new Request(B + path, { method,
  headers: { 'content-type': 'application/json', ...(key ? { 'x-mentor-key': key } : {}), ...(token ? { 'x-account-token': token } : {}) },
  ...(body ? { body: JSON.stringify(body) } : {}) });
const jsonOf = async (r) => [r.status, await r.json()];
const make = async (first, email) => (await jsonOf(await signup({ request: req('/api/signup', { method: 'POST', body: { first, last: 'T', email, consent: false, source: 'home', type: 'full', company: 'X', interest: 'More free time', industry: 'Other', password: 'longenough1', confirm: 'longenough1' } }), env })))[1].token;

const sheba = await make('Sheba', 'sheba.partner@example.com');
const stranger = await make('Sheba', 'sheba123@example.com');
ok(sheba && stranger, 'two accounts');

let [st] = await jsonOf(await mentorGet({ request: req('/api/mentor', { token: sheba }), env }));
ok(st === 401, 'not on the team yet: /mentor refuses her account');
[st] = await jsonOf(await mentorPost({ request: req('/api/mentor', { method: 'POST', token: sheba, body: { action: 'team-add', email: 'sheba.partner@example.com' } }), env }));
ok(st === 401, 'an account cannot add itself');

let [, j] = await jsonOf(await mentorPost({ request: req('/api/mentor', { method: 'POST', key: env.MENTOR_KEY, body: { action: 'team-add', email: 'Sheba.Partner@example.com' } }), env }));
ok(j.ok && j.team.some((m) => m.email === 'sheba.partner@example.com' && m.removable), 'with the key: her exact address is on the team');

[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor', { token: sheba }), env }));
ok(st === 200 && j.ok, 'on the team: /mentor opens with her own account');
[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor?team=1', { token: sheba }), env }));
ok(j.canEdit === false, 'a team account sees the team but cannot change it');
[st] = await jsonOf(await mentorPost({ request: req('/api/mentor', { method: 'POST', token: sheba, body: { action: 'team-add', email: 'someone@example.com' } }), env }));
ok(st === 403, 'only the key changes the team');
[st] = await jsonOf(await mentorGet({ request: req('/api/mentor', { token: stranger }), env }));
ok(st === 401, 'a stranger with "sheba" in the address gets nothing');

[, j] = await jsonOf(await stateGet({ request: req(`/api/state?t=${sheba}`, { token: sheba }), env }));
ok(j.me && j.me.openAll === true, 'every level open for her');
[, j] = await jsonOf(await stateGet({ request: req(`/api/state?t=${stranger}`, { token: stranger }), env }));
ok(j.me && j.me.openAll === false, 'not for the stranger');
ok(/if \(me && me\.openAll\) list\.push\(\['\/mentor', 'Mentor'/.test(readFileSync(new URL('../public/profile-menu.js', import.meta.url), 'utf8')), 'team profile menu: Mentor, only for the team');

[, j] = await jsonOf(await kitPost({ request: req('/api/toolkit', { method: 'POST', body: { action: 'request', first: 'Sheba', email: 'sheba.partner@example.com' } }), env }));
ok(j.pass, 'the Growth Toolkit without a code');

[, j] = await jsonOf(await mentorPost({ request: req('/api/mentor', { method: 'POST', key: env.MENTOR_KEY, body: { action: 'team-remove', email: 'sheba.partner@example.com' } }), env }));
ok(!j.team.some((m) => m.email === 'sheba.partner@example.com'), 'removed with the key');
[st] = await jsonOf(await mentorGet({ request: req('/api/mentor', { token: sheba }), env }));
ok(st === 401, 'and /mentor closes again');

done();
