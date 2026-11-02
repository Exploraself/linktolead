// /mentor counts a level as written with an earlier seven-step answer OR any
// Version 4 answer (2 Nov 2026), the same rule as the letters engine
// (levelsWritten in functions/_series.js). Before, it read only the old
// answer table, so founders on the current levels never showed "Launchpad
// done" or "Ready for the Boardroom".

import { onRequestGet as mentorGet } from '../functions/api/mentor.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { levelsWritten } from '../functions/_series.js';
import { launchpadDone, readyForBoardroom, levelCount, nextAction, groupOf } from '../public/mentor/dash.js';
import { fakeD1, fakeResend, tally } from './_d1.mjs';

const { ok, done } = tally('mentor-levels');
fakeResend();
const DB = fakeD1();
const KEY = 'k'.repeat(24);
const env = { DB, MENTOR_KEY: KEY };
const B = 'https://linktolead.exploraself.com';
const req = (path, { method = 'GET', body, key } = {}) => new Request(B + path, { method,
  headers: { 'content-type': 'application/json', ...(key ? { 'x-mentor-key': key } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
const make = async (first, email) => (await (await signup({ request: req('/api/signup', { method: 'POST', body: { first, last: 'T', email, consent: false, source: 'home', type: 'full', company: 'X', interest: 'More free time', industry: 'Other', password: 'longenough1', confirm: 'longenough1' } }), env, waitUntil: () => {} })).json()).token;
const put = (id, key, value) => DB.raw.prepare('INSERT OR REPLACE INTO sheet (student_id, key, value, updated_at) VALUES (?,?,?,?)').run(id, key, value, '2026-11-02T10:00:00Z');

const v4 = await make('Vera', 'vera@example.com');         // Levels 01–03 in Version 4
const half = await make('Hal', 'hal@example.com');         // Levels 01–02 only
const welcome = await make('Wes', 'wes@example.com');      // only the welcome page and "Where are you now?"
const old = await make('Olga', 'olga@example.com');        // the earlier seven-step answers
const mixed = await make('Max', 'max@example.com');        // 01 old, 02–03 Version 4, and 12
const paid = await make('Pia', 'pia@example.com');         // Levels 01–03, already on The Boardroom

for (const lv of [1, 2, 3]) put(v4, `w.v4.${lv}.0.tap`, '2');
DB.raw.prepare("INSERT INTO compass (student_id, stage, results_json, updated_at) VALUES (?, 'build', '{}', '2026-11-01T10:00:00Z')").run(v4);
put(v4, 'w.v4.1.w.seen', '1');
for (const lv of [1, 2]) put(half, `w.v4.${lv}.1.who`, 'Chris');
put(welcome, 'w.v4.1.w.seen', '1'); put(welcome, 'w.v4.where.stage', 'idea'); put(welcome, 'w.v4.2.0.tap', '');
for (const lv of [1, 2, 3]) DB.raw.prepare("INSERT INTO answer (student_id, stage, level, domain, step, body, updated_at) VALUES (?, 'build', ?, 'self', 1, 'An old answer', '2026-10-20')").run(old, lv);
DB.raw.prepare("INSERT INTO answer (student_id, stage, level, domain, step, body, updated_at) VALUES (?, 'build', 1, 'self', 1, 'Old', '2026-10-20')").run(mixed);
put(mixed, 'w.v4.2.3.day', 'Tuesday'); put(mixed, 'w.v4.3.2.sure', '7'); put(mixed, 'w.v4.12.0.slide', '4');
for (const lv of [1, 2, 3]) put(paid, `w.v4.${lv}.0.tap`, '1');
DB.raw.prepare("UPDATE student SET tier = 'session' WHERE id = ?").run(paid);

const r = await mentorGet({ request: req('/api/mentor', { key: KEY }), env });
const j = await r.json();
const S = Object.fromEntries(j.students.map((s) => [s.email, s]));

ok(S['vera@example.com'].level_list === '1,2,3' && S['vera@example.com'].levels === 3, 'Version 4 answers count: 01, 02, 03');
ok(launchpadDone(S['vera@example.com']) && readyForBoardroom(S['vera@example.com']), 'Version 4 founder: Launchpad done, Ready for the Boardroom');
ok(nextAction(S['vera@example.com']).key === 'ready', '…so, with the North Star done too, "Offer the Boardroom" is their next action');
ok(groupOf(S['vera@example.com']) !== '' , '…and they count as started in the Blueprint');
ok(S['hal@example.com'].level_list === '1,2' && !launchpadDone(S['hal@example.com']), 'two levels: not done yet');
ok(S['wes@example.com'].level_list === '' && levelCount(S['wes@example.com']) === 0, 'the welcome page, "Where are you now?" and an empty value are not a level');
ok(S['olga@example.com'].level_list === '1,2,3' && launchpadDone(S['olga@example.com']), 'the earlier answers still count');
ok(S['max@example.com'].level_list === '1,2,3,12' && S['max@example.com'].levels === 4, 'old and new together, and two-digit levels');
ok(launchpadDone(S['pia@example.com']) && !readyForBoardroom(S['pia@example.com']), 'already on The Boardroom: Launchpad done, not offered it again');
ok(!('level_list_v4' in S['vera@example.com']), 'the roster sends one level list, not two');

// The same rule as the letters engine.
for (const [email, id] of [['vera@example.com', v4], ['hal@example.com', half], ['wes@example.com', welcome], ['olga@example.com', old]]) {
  const L = await levelsWritten(DB, id);
  ok([1, 2, 3].every((n) => L.has(n) === S[email].level_list.split(',').includes(String(n))), `${email}: /mentor and the letters agree on Levels 01–03`);
}

done();
