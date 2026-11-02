// The Team box in /mentor (Alexandru, 2 Nov 2026): each member by the name
// on their own free account (no mentor profile), whether the account exists
// yet, when they were last active, and what they did in /mentor. And every
// letter greets a name typed in capitals as people write it ("Hi Alexandru").

import { readFileSync } from 'node:fs';
import { onRequestGet as mentorGet, onRequestPost as mentorPost } from '../functions/api/mentor.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { DID_WORDS } from '../functions/_team.js';
import * as L from '../functions/_letters.js';
import { nameCase as dashNameCase } from '../public/mentor/dash.js';
import { courseLetter } from '../functions/_course.js';
import { fakeD1, fakeResend, tally } from './_d1.mjs';

const { ok, done } = tally('team-list');
fakeResend();
const DB = fakeD1();
const KEY = 'k'.repeat(24);
const env = { DB, MENTOR_KEY: KEY, RESEND_API_KEY: 'r', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Rome' };
const B = 'https://linktolead.exploraself.com';
const req = (path, { method = 'GET', body, key, token } = {}) => new Request(B + path, { method,
  headers: { 'content-type': 'application/json', ...(key ? { 'x-mentor-key': key } : {}), ...(token ? { 'x-account-token': token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
const jsonOf = async (r) => [r.status, await r.json()];
const make = async (first, last, email) => (await jsonOf(await signup({ request: req('/api/signup', { method: 'POST', body: { first, last, email, consent: true, source: 'compass', type: 'full', company: 'X', interest: 'More free time', industry: 'Other', password: 'longenough1', confirm: 'longenough1' } }), env, waitUntil: () => {} })))[1].token;

const founder = await make('Maya', 'Example', 'maya@example.com');
const sheba = await make('Sheba', 'Thomas', 'team.member@example.com');
for (const email of ['team.member@example.com', 'not.yet@example.com']) await mentorPost({ request: req('/api/mentor', { method: 'POST', key: KEY, body: { action: 'team-add', email } }), env });

const asTeam = (body) => mentorPost({ request: req('/api/mentor', { method: 'POST', token: sheba, body }), env }).then(jsonOf);
await asTeam({ action: 'message', student: founder, subject: 'Hi', body: 'Hi Maya,\n\nA note.', channel: 'plan' });
await asTeam({ action: 'message', student: founder, subject: 'Again', body: 'Hi Maya,\n\nAnother.', channel: 'plan' });
await asTeam({ action: 'tier', student: founder, tier: 'session' });
await asTeam({ action: 'delete', student: founder, confirm: 'maya@example.com' });   // refused: not counted
await asTeam({ action: 'message', student: founder, subject: '', body: '' });           // failed: not counted
await mentorPost({ request: req('/api/mentor', { method: 'POST', key: KEY, body: { action: 'message', student: founder, subject: 'From you', body: 'Hi Maya,\n\nMe.', channel: 'plan' } }), env });

const [st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor?team=1', { key: KEY }), env }));
const T = Object.fromEntries(j.team.map((m) => [m.email, m]));
const s = T['team.member@example.com'];
ok(st === 200 && s.name === 'Sheba Thomas' && s.account === true && s.lastSeen, 'a member shows by the name on their own account, with the account ready');
ok(s.did.message === 2 && s.did.tier === 1 && !s.did.delete && Object.keys(s.did).length === 2, 'what they did: 2 letters, 1 step change; a refused or failed action is not counted');
ok(T['not.yet@example.com'].account === false && T['not.yet@example.com'].name === '', 'invited without an account yet: says so');
ok(T['alex@exploraself.com'] && !Object.keys(T['alex@exploraself.com'].did).length, 'the key’s own letters are not counted as a team member’s');
ok(DB.raw.prepare("SELECT COUNT(*) AS n FROM event WHERE kind = 'team-did'").get().n === 3, 'one event per successful team action');

// The page and the server use the same words.
const src = readFileSync(new URL('../public/mentor/mentor.js', import.meta.url), 'utf8');
for (const [a, [one, many]] of Object.entries(DID_WORDS)) ok(src.includes(`'${a}': ['${one}', '${many}']`) || src.includes(`${a}: ['${one}', '${many}']`), `the Team box says "${one}" / "${many}" for ${a}`);
ok(/invited, no account yet/.test(src) && /account ready · last active/.test(src), 'the Team box shows the status in words');

// Names typed in capitals are greeted as people write them.
for (const [typed, want] of [['ALEXANDRU', 'Alexandru'], ['alexandru', 'Alexandru'], ['McKenzie', 'McKenzie'], ['DeShawn', 'DeShawn'], ['anne-marie', 'Anne-Marie'], ["O'NEIL", "O'Neil"], ['JOSÉ', 'José'], ['', '']]) {
  ok(L.nameCase(typed) === want && dashNameCase(typed) === want, `"${typed}" → "${want}" in letters and in /mentor drafts`);
}
ok(/^Hi Alexandru,/.test(L.signinLetter(B, `${B}/ground-plan/?signin=x&reset=1`, { first: 'ALEXANDRU', to: 'a@b.c', reset: true }).text), 'the reset letter: "Hi Alexandru"');
ok(/^Hi Alexandru,/.test(courseLetter(B, 1, { first: 'ALEXANDRU', to: 'a@b.c', tz: 'Europe/Rome', at: new Date('2026-11-02T09:00:00Z') }).text), '12 Days: "Hi Alexandru"');

done();
