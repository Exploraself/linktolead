// What a team account may do in /mentor (Alexandru, 2 Nov 2026): read
// everything, answer, write letters, send sign-in links, pause or resume the
// letters, change a founder's step. Never: change the team or the mentor
// profiles, use the Mailchimp tools, pause or delete a founder. Enforced on
// the server (an allow-list: a new action is the key's only, by default);
// the page hides the buttons.

import { readFileSync } from 'node:fs';
import { onRequestGet as mentorGet, onRequestPost as mentorPost, KEY_ONLY, TEAM_CAN } from '../functions/api/mentor.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { fakeD1, fakeResend, tally } from './_d1.mjs';

const { ok, done } = tally('team-permissions');
fakeResend();
const DB = fakeD1();
const KEY = 'k'.repeat(24);
const env = { DB, MENTOR_KEY: KEY, RESEND_API_KEY: 'r', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Rome' };
const B = 'https://linktolead.exploraself.com';
const req = (path, { method = 'GET', body, key, token } = {}) => new Request(B + path, { method,
  headers: { 'content-type': 'application/json', ...(key ? { 'x-mentor-key': key } : {}), ...(token ? { 'x-account-token': token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
const jsonOf = async (r) => [r.status, await r.json()];
const make = async (first, email) => (await jsonOf(await signup({ request: req('/api/signup', { method: 'POST', body: { first, last: 'T', email, consent: true, source: 'compass', type: 'full', company: 'X', interest: 'More free time', industry: 'Other', password: 'longenough1', confirm: 'longenough1' } }), env, waitUntil: () => {} })))[1].token;

const founder = await make('Maya', 'maya@example.com');
const team = await make('Sheba', 'team.member@example.com');
await mentorPost({ request: req('/api/mentor', { method: 'POST', key: KEY, body: { action: 'team-add', email: 'team.member@example.com' } }), env });
const asTeam = (body) => mentorPost({ request: req('/api/mentor', { method: 'POST', token: team, body }), env }).then(jsonOf);
const asKey = (body) => mentorPost({ request: req('/api/mentor', { method: 'POST', key: KEY, body }), env }).then(jsonOf);

// The two lists never overlap, and cover what the page can ask.
ok(!KEY_ONLY.some((a) => TEAM_CAN.includes(a)), 'an action is either the team’s or Alexandru’s, never both');
for (const a of ['pause', 'delete', 'team-add', 'team-remove', 'mentor-save', 'mentor-assign', 'mc-test', 'mc-backfill']) ok(KEY_ONLY.includes(a), `${a}: Alexandru only`);
for (const a of ['reply', 'message', 'signin-link', 'reset-link', 'series-hold', 'tier']) ok(TEAM_CAN.includes(a), `${a}: the team may`);

// Reading: everything.
let [st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor', { token: team }), env }));
ok(st === 200 && j.you.team && j.you.can.join() === TEAM_CAN.join() && j.students.length >= 2, 'the team reads the roster, and is told what it can do');
[st] = await jsonOf(await mentorGet({ request: req(`/api/mentor?student=${founder}`, { token: team }), env }));
ok(st === 200, 'the team opens one founder’s work');
const csv = await mentorGet({ request: req('/api/mentor?csv=1', { token: team }), env });
ok(csv.status === 200, 'the team exports the CSV');
[st] = await jsonOf(await mentorGet({ request: req('/api/mentor?tags=1', { token: team }), env }));
ok(st === 403, 'the team cannot read the Mailchimp tags');

// Alexandru only: refused, and nothing changes.
for (const action of KEY_ONLY) {
  [st, j] = await asTeam({ action, student: founder, email: 'someone@example.com', paused: true, confirm: 'maya@example.com', name: 'X', mentor: '' });
  ok(st === 403 && /Only Alexandru/.test(j.error || ''), `${action}: refused for the team, in plain words`);
}
const still = DB.raw.prepare('SELECT s.id, au.paused FROM student s LEFT JOIN account_auth au ON au.student_id = s.id WHERE s.id = ?').get(founder);
ok(still && !still.paused, 'the founder is still there, and not paused');
ok(!DB.raw.prepare("SELECT 1 FROM team_member WHERE email = 'someone@example.com'").get(), 'the team did not change');
[st, j] = await asTeam({ action: 'something-new', student: founder });
ok(st === 403, 'a new action is Alexandru’s only until it is added to TEAM_CAN');

// What the team may do: it works.
[st, j] = await asTeam({ action: 'message', student: founder, subject: 'Hello', body: 'Hi Maya,\n\nA note.', channel: 'plan' });
ok(st === 200 && j.ok, 'the team writes a letter or a note');
[st, j] = await asTeam({ action: 'tier', student: founder, tier: 'session' });
ok(st === 200 && j.ok && DB.raw.prepare('SELECT tier FROM student WHERE id = ?').get(founder).tier === 'session', 'the team changes a founder’s step');
[st, j] = await asTeam({ action: 'series-hold', student: founder, hold: true });
ok(st === 200 && j.hold === true, 'the team pauses the letters');
[st, j] = await asTeam({ action: 'series-hold', student: founder, hold: false });
ok(st === 200 && j.hold === false, 'and resumes them');
DB.raw.exec(`INSERT INTO note (id, student_id, level, domain, body, status, created_at) VALUES ('n1', '${founder}', 1, 'self', 'How do I start?', 'new', '2026-11-02T10:00:00Z')`);
[st, j] = await asTeam({ action: 'reply', note: 'n1', reply: 'Start with Level 01.' });
ok(st === 200 && j.ok, 'the team answers a question');

// The key still does everything.
[st, j] = await asKey({ action: 'pause', student: founder, paused: true });
ok(st === 200 && j.paused === true, 'with the key: pause works');
[st, j] = await asKey({ action: 'pause', student: founder, paused: false });
ok(st === 200 && j.paused === false, 'and unpause');

// The page hides Alexandru's buttons for a team account.
const src = readFileSync(new URL('../public/mentor/mentor.js', import.meta.url), 'utf8');
ok(/const isTeam = \(\) => !!\(data && data\.you && data\.you\.team\)/.test(src), 'the page knows a team account');
ok(/if \(!M \|\| isTeam\(\)\) return ''/.test(src), 'no Mailchimp tools for the team');
ok(/function mentorsHTML\(\) \{\n  if \(isTeam\(\)\) return ''/.test(src), 'no mentor profiles for the team');
ok(/\$\{isTeam\(\) \? '' : `<button class="btn" data-pause=/.test(src), 'no Pause or Delete for the team');
ok(/Only Alexandru can unpause/.test(src), 'a paused founder says who can unpause');
ok(/isTeam\(\) \? esc\(\(\(d\.mentors/.test(src), 'the mentor of a founder is read-only for the team');
ok(/What you can do here/.test(src) && /Only Alexandru/.test(src), 'the team sees what it can and cannot do');

done();
