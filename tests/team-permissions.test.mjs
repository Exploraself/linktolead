// What a team account may do in /mentor (Alexandru, 2 Nov 2026). A new
// member starts with the defaults (read everything, answer, write letters,
// send sign-in and reset links, pause or resume the letters, change a
// founder's step); then Alexandru, or a member with the 'team' right, ticks
// each member's own rights, up to Everything (like Alexandru). The mentor key
// can always do everything. Enforced on the server; the page hides the buttons.

import { readFileSync } from 'node:fs';
import { onRequestGet as mentorGet, onRequestPost as mentorPost, KEY_ONLY, TEAM_CAN } from '../functions/api/mentor.js';
import { TEAM_RIGHTS, ALL_RIGHTS, DEFAULT_RIGHTS, ACTION_RIGHT } from '../functions/_team.js';
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

// The defaults never overlap the rest, and every action needs a known right.
ok(TEAM_CAN.join() === DEFAULT_RIGHTS.join() && !KEY_ONLY.some((a) => DEFAULT_RIGHTS.includes(ACTION_RIGHT[a])), 'a new member has the defaults; the rest waits for a tick');
for (const a of ['pause', 'delete', 'team-add', 'team-remove', 'team-can', 'mentor-save', 'mentor-assign', 'mc-test', 'mc-backfill']) ok(KEY_ONLY.includes(a) && ALL_RIGHTS.includes(ACTION_RIGHT[a]), `${a}: not by default, and tickable`);
for (const a of ['reply', 'message', 'signin-link', 'reset-link', 'series-hold', 'tier']) ok(DEFAULT_RIGHTS.includes(ACTION_RIGHT[a]), `${a}: the team may, by default`);
ok(ALL_RIGHTS.length === 12 && TEAM_RIGHTS.every(([k, w]) => k && w && !/[{}]/.test(w)) && ALL_RIGHTS.includes('payments') && ALL_RIGHTS.includes('mailchimp') && ALL_RIGHTS.includes('team'), 'twelve rights, each in plain words, payments, Mailchimp and the team among them');

// Reading: everything.
let [st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor', { token: team }), env }));
ok(st === 200 && j.you.team && j.you.can.join() === TEAM_CAN.join() && j.students.length >= 2, 'the team reads the roster, and is told what it can do');
[st] = await jsonOf(await mentorGet({ request: req(`/api/mentor?student=${founder}`, { token: team }), env }));
ok(st === 200, 'the team opens one founder’s work');
const csv = await mentorGet({ request: req('/api/mentor?csv=1', { token: team }), env });
ok(csv.status === 200, 'the team exports the CSV');
[st] = await jsonOf(await mentorGet({ request: req('/api/mentor?tags=1', { token: team }), env }));
ok(st === 403, 'by default the team cannot read the Mailchimp tags');
[st] = await jsonOf(await mentorGet({ request: req('/api/mentor?stripe=1', { token: team }), env }));
ok(st === 403, 'nor see the payments');

// Not ticked: refused, in plain words, and nothing changes.
for (const action of KEY_ONLY) {
  [st, j] = await asTeam({ action, student: founder, email: 'someone@example.com', paused: true, confirm: 'maya@example.com', name: 'X', mentor: '', can: ALL_RIGHTS });
  ok(st === 403 && /don’t have this right yet/.test(j.error || '') && /Settings → Team/.test(j.error || ''), `${action}: refused until ticked, in plain words`);
}
const still = DB.raw.prepare('SELECT s.id, au.paused FROM student s LEFT JOIN account_auth au ON au.student_id = s.id WHERE s.id = ?').get(founder);
ok(still && !still.paused, 'the founder is still there, and not paused');
ok(!DB.raw.prepare("SELECT 1 FROM team_member WHERE email = 'someone@example.com'").get(), 'the team did not change');
[st, j] = await asTeam({ action: 'something-new', student: founder });
ok(st === 403 && /Unknown action/.test(j.error || ''), 'an action nobody named is refused');

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

// Alexandru ticks rights for one member: they work at once, and only those.
[st, j] = await asKey({ action: 'team-can', email: 'team.member@example.com', can: ['reply', 'message', 'pause', 'payments', 'not-a-right'] });
ok(st === 200 && j.can.join() === 'reply,message,pause,payments', 'the key ticks a member’s rights (unknown names are dropped)');
[st, j] = await asTeam({ action: 'tier', student: founder, tier: 'lab' });
ok(st === 403 && /don’t have this right yet/.test(j.error || ''), 'an unticked right is refused at once (changing a step)');
[st, j] = await asTeam({ action: 'pause', student: founder, paused: true });
ok(st === 200 && j.paused === true, 'a newly ticked right works (pause)');
await asTeam({ action: 'pause', student: founder, paused: false });
[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor?stripe=1', { token: team }), env }));
ok(st === 200, 'with the payments right: the payments open');
[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor', { token: team }), env }));
ok(j.you.can.join() === 'reply,message,pause,payments', 'the page is told exactly what this member can do');
[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor?team=1', { token: team }), env }));
ok(st === 200 && j.canEdit === false && j.rights.length === 12 && j.team.find((m) => m.email === 'team.member@example.com').can.join() === 'reply,message,pause,payments', 'the team list shows each member’s rights; no editing without the team right');
[st, j] = await asTeam({ action: 'team-can', email: 'team.member@example.com', can: ALL_RIGHTS });
ok(st === 403, 'a member cannot give themselves more');

// Everything (like Alexandru): every action, the team included, but never their own rights.
const second = await make('Leo', 'second.member@example.com');
await asKey({ action: 'team-add', email: 'second.member@example.com' });
[st, j] = await asKey({ action: 'team-can', email: 'team.member@example.com', can: ALL_RIGHTS });
ok(st === 200 && j.can.length === 12, 'Everything: all twelve rights');
[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor?tags=1', { token: team }), env }));
ok(st === 200, 'with Everything: the Mailchimp tag list opens');
[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor?team=1', { token: team }), env }));
ok(j.canEdit === true, 'with Everything: the team box can be edited');
[st, j] = await asTeam({ action: 'team-can', email: 'second.member@example.com', can: ['reply', 'tier'] });
ok(st === 200 && j.can.join() === 'reply,tier', 'with the team right, a member sets another member’s rights');
[st, j] = await asTeam({ action: 'team-can', email: 'team.member@example.com', can: ['reply'] });
ok(st === 403 && /own rights/.test(j.error || ''), 'nobody changes their own rights');
[st, j] = await asTeam({ action: 'team-remove', email: 'team.member@example.com' });
ok(st === 403 && /yourself/.test(j.error || ''), 'nobody removes themselves');
[st, j] = await asTeam({ action: 'team-can', email: 'alex@exploraself.com', can: [] });
ok(st >= 400 && /always has every right/.test(j.error || ''), 'Alexandru’s own address always has every right');
[st, j] = await asTeam({ action: 'team-can', email: 'stranger@example.com', can: ['reply'] });
ok(st >= 400 && /not on the team/.test(j.error || ''), 'rights only for someone on the team');
[st, j] = await asKey({ action: 'pause', student: founder, paused: true });
ok(st === 200 && j.paused === true, 'the key still does everything, whatever a member has');
await asKey({ action: 'pause', student: founder, paused: false });

// Alexandru's own address signed in with its account: every right.
const own = await make('Alexandru', 'alex@exploraself.com');
[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor', { token: own }), env }));
ok(st === 200 && j.you.can.length === 12, 'Alexandru’s own account: every right');

// Removed, then added again: back to the defaults.
await asKey({ action: 'team-remove', email: 'second.member@example.com' });
await asKey({ action: 'team-add', email: 'second.member@example.com' });
[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor', { token: second }), env }));
ok(j.you.can.join() === DEFAULT_RIGHTS.join(), 'removed and added again: the defaults, nothing left over');

// The page shows and hides each button by the member's own rights.
const src = readFileSync(new URL('../public/mentor/mentor.js', import.meta.url), 'utf8');
ok(/const isTeam = \(\) => !!\(data && data\.you && data\.you\.team\)/.test(src) && /const can = \(right\) =>/.test(src), 'the page knows a team account, and what it can do');
ok(/if \(!M \|\| !can\('mailchimp'\)\) return ''/.test(src), 'Mailchimp tools only with the Mailchimp right');
ok(/function mentorsHTML\(\) \{\n  if \(!can\('mentors'\)\) return ''/.test(src), 'mentor profiles only with that right');
ok(/can\('pause'\) \? `<button class="btn" data-pause=/.test(src) && /can\('delete'\) \? `<button class="btn danger" data-del=/.test(src), 'Pause and Delete only with those rights');
ok(/can\('payments'\) \? '<section class="panel" id="stripebox">/.test(src), 'the payments only with that right');
ok(/can\('tier'\) \? `<label/.test(src), 'the step only with that right');
ok(/!can\('mentors'\) \? esc\(\(\(d\.mentors/.test(src), 'the mentor of a founder is read-only without that right');
ok(/What you can do here/.test(src) && /Only Alexandru, for now/.test(src), 'the team sees what it can and cannot do');
ok(/Everything \(like Alexandru\)/.test(src) && /data-right="\$\{k\}"/.test(src) && /action: 'team-can'/.test(src), 'the Team box: a tick box per right, and Everything');
const words = new Function(`return ${src.match(/export const RIGHT_WORDS = (\[[\s\S]*?\n\]);/)[1]}`)();
ok(JSON.stringify(words) === JSON.stringify(TEAM_RIGHTS), 'the page says each right in the same words as the server');

done();
