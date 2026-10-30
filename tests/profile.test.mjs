// The profile menu's two new switches and the founder's mentor:
// "Letters from your mentor: On/Off" (consent, synced to Mailchimp), "Delete
// my account" (the email typed to confirm; Mailchimp unsubscribed, never a
// hard delete), the mentor set in /mentor and given to a founder, and the
// founder's time zone kept from their browser.

import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as letters } from '../functions/api/letters.js';
import { onRequestPost as delAccount } from '../functions/api/account-delete.js';
import { onRequestGet as stateGet } from '../functions/api/state.js';
import { onRequestPost as mentorPost, onRequestGet as mentorGet } from '../functions/api/mentor.js';
import { mentorFor, okTz } from '../functions/_mentor.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('profile');
const DB = fakeD1();
const env = { DB, MAILCHIMP_MODE: 'test', MAILCHIMP_API_KEY: 'k-us1', MENTOR_KEY: 'mentor-key-123' };
fakeResend();
const K = { 'x-mentor-key': 'mentor-key-123', 'content-type': 'application/json' };
const mreq = (body) => new Request('https://linktolead.exploraself.com/api/mentor', { method: 'POST', headers: K, body: JSON.stringify(body) });

let r = await signup({ request: post('/api/signup', { first: 'Ana', last: 'Pop', email: 'ana@example.com', consent: true, type: 'full', company: 'Acme', interest: 'Higher income', industry: 'Other', password: 'a-long-password', confirm: 'a-long-password', tz: 'Europe/Rome' }), env });
const ana = (await r.json()).token;
const prof = () => DB.raw.prepare('SELECT * FROM student_profile WHERE student_id = ?').get(ana);
ok(prof().tz === 'Europe/Rome', 'the time zone from the browser is kept on sign-up');
ok(okTz('Europe/Rome') === 'Europe/Rome' && okTz('Mars/Olympus') === '' && okTz("x'; DROP") === '', 'only real time zones are kept');

let s = await (await stateGet({ request: get(`/api/state?t=${ana}&tz=America/New_York`), env })).json();
ok(s.me.letters === true && s.me.mentor.first === 'Alexandru', 'state: letters on, the mentor is Alexandru');
ok(prof().tz === 'America/New_York', 'the time zone follows the founder');

// Letters off, then on.
r = await letters({ request: post('/api/letters', { token: ana, on: false }), env });
ok(r.status === 200 && prof().unsubscribed === 1, 'letters off: unsubscribed');
ok(/"status":"unsubscribed"/.test(DB.raw.prepare("SELECT detail FROM mailchimp_log WHERE action = 'unsubscribe' ORDER BY id DESC").get().detail), 'letters off: Mailchimp unsubscribe (test mode)');
s = await (await stateGet({ request: get(`/api/state?t=${ana}`), env })).json();
ok(s.me.letters === false, 'state: letters off');
r = await letters({ request: post('/api/letters', { token: ana, on: true }), env });
ok(r.status === 200 && prof().unsubscribed === 0 && prof().consent === 1, 'letters on: consent, not unsubscribed');
ok(/"status":"pending"/.test(DB.raw.prepare("SELECT detail FROM mailchimp_log WHERE action = 'resubscribe' ORDER BY id DESC").get().detail), 'letters on again: Mailchimp asks them to confirm (pending)');
ok((await letters({ request: post('/api/letters', { token: ana, on: 'yes' }), env })).status === 400, 'on or off only');
ok((await letters({ request: post('/api/letters', { token: 'nobody-nobody-nobody-nobody', on: true }), env })).status === 404, 'unknown token');
ok(DB.raw.prepare("SELECT COUNT(*) n FROM event WHERE student_id = ? AND kind IN ('letters-on','letters-off')").get(ana).n === 2, 'both changes logged');

// The mentor: a second one, given to Ana.
r = await mentorPost({ request: mreq({ action: 'mentor-save', name: 'Maria Rossi', photo: '/mail/maria.jpg', signature: '/mail/maria-sig.png', email: 'maria@exploraself.com' }), env });
let j = await r.json();
ok(r.status === 200 && j.mentors.length === 2 && j.mentors[0].id === 'alexandru' && j.mentors[0].isDefault, 'mentor saved; Alexandru stays everyone’s mentor');
ok((await mentorPost({ request: mreq({ action: 'mentor-save', name: 'X', photo: 'javascript:alert(1)' }), env })).status === 400, 'a photo must be a site path or https');
r = await mentorPost({ request: mreq({ action: 'mentor-assign', student: ana, mentor: 'maria-rossi' }), env });
ok(r.status === 200 && (await mentorFor(DB, ana)).first === 'Maria', 'Ana’s letters now come from Maria');
ok((await mentorPost({ request: mreq({ action: 'mentor-assign', student: ana, mentor: 'nobody' }), env })).status === 400, 'unknown mentor refused');
j = await (await mentorGet({ request: new Request('https://linktolead.exploraself.com/api/mentor', { headers: K }), env })).json();
ok(Array.isArray(j.mentors) && j.mentors.some((m) => m.id === 'maria-rossi'), '/mentor lists the mentors');
await mentorPost({ request: mreq({ action: 'mentor-assign', student: ana, mentor: '' }), env });
ok((await mentorFor(DB, ana)).first === 'Alexandru', 'back to everyone’s mentor');

// Delete my account.
r = await delAccount({ request: post('/api/account-delete', { token: ana, confirm: 'wrong@example.com' }), env });
ok(r.status === 400 && DB.raw.prepare('SELECT COUNT(*) n FROM student WHERE id = ?').get(ana).n === 1, 'the wrong email deletes nothing');
r = await delAccount({ request: post('/api/account-delete', { token: ana, confirm: 'ANA@example.com' }), env });
ok(r.status === 200 && DB.raw.prepare('SELECT COUNT(*) n FROM student WHERE id = ?').get(ana).n === 0 && !prof(), 'deleted, with everything kept for them');
ok(DB.raw.prepare("SELECT COUNT(*) n FROM event WHERE kind = 'founder-deleted-self' AND detail NOT LIKE '%ana%'").get().n === 1, 'logged without their details');
ok((await stateGet({ request: get(`/api/state?t=${ana}`), env })).status === 404, 'the old token opens nothing');
done();
