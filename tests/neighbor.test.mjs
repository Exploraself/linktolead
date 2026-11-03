// "Take care of your neighbor" on /12-days/ (Alexandru, 3 Nov 2026): a
// signed-in founder sends one friend one invitation. The friend goes on no
// list and gets no tag; "sent" only when the email service took it; the
// limits; the footer link means no more invitations. Real routes on Node's
// own SQLite; Resend is faked.

import { readFileSync } from 'node:fs';
import { inviteLetter, INVITE_PER_DAY, INVITE_GAP_DAYS, INVITE_NOTE_MAX, INVITE_PATH, friendHash } from '../functions/_course.js';
import { onRequestPost as coursePost } from '../functions/api/course.js';
import { onRequestGet as unsubGet } from '../functions/api/unsubscribe.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { ENTRIES } from '../scripts/email-map.mjs';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('neighbor');
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const B = 'https://linktolead.exploraself.com';
const NY = 'America/New_York';
const DB = fakeD1();
const env = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome' };
const jsonOf = async (r) => [r.status, await r.json()];
const count = (sql, ...a) => DB.raw.prepare(sql).get(...a).n;

// ── The letter ───────────────────────────────────────────────────────────────
const L = inviteLetter(B, { first: 'ana', from: 'MARIA', fromEmail: 'maria@example.com', note: 'This made me think of you <b>!</b>', tz: NY });
ok(L.subject === 'Maria thought of you: 12 Days to Start Winning', 'subject: the friend’s name, as people write it');
ok(L.text.startsWith('Hi Ana,') && L.text.includes('Maria (maria@example.com) thought of you and asked me to send you this.'), 'opens with the friend’s name, and says who asked');
ok(L.text.includes('A note from Maria: “This made me think of you <b>!</b>”') && L.html.includes('&lt;b&gt;!&lt;/b&gt;') && !L.html.includes('<b>!</b>'), 'the note is quoted, and kept as words (no HTML gets through)');
ok(L.text.includes(`Start my 12 days: ${B}${INVITE_PATH}`) && INVITE_PATH.includes('utm_source=friend'), 'one button to /12-days/, marked as a friend’s invitation');
ok(/only letter you get from us/.test(L.text) && /no list/.test(L.why), 'says plainly: one letter, no list');
ok(!/Free assessments|P\.S\./.test(L.text), 'no assessments and no offer: it is a friend’s invitation, not a sale');
ok(L.fromName === 'Alexandru at ExploraSelf' && /Alexandru/.test(L.text), 'from Alexandru, signed by Alexandru');
ok(!inviteLetter(B, { first: 'Ana', from: 'Maria' }).text.includes('A note from'), 'no note: no note line');

// ── The route ────────────────────────────────────────────────────────────────
let sent = fakeResend();
const maria = { first: 'Maria', last: 'Rossi', email: 'maria@example.com', consent: true, source: 'home', type: 'full', company: 'Rossi Studio', interest: 'Steady clients',
  industry: 'Creative & design', password: 'longenough1', confirm: 'longenough1', tz: NY };
const [, m] = await jsonOf(await signup({ request: post('/api/signup', maria), env }));
const token = m.token;
ok(token, 'a founder with an account');
const ask = (body, ip) => coursePost({ request: post('/api/course', { token, action: 'invite', tz: NY, ...body }, ip), env });

sent = fakeResend();
let [st, j] = await jsonOf(await coursePost({ request: post('/api/course', { token: 'x'.repeat(48), action: 'invite', first: 'Ana', email: 'ana@example.com' }), env }));
ok(st === 401 && sent.length === 0, 'not signed in: nothing goes');
[st, j] = await jsonOf(await ask({ first: '', email: 'ana@example.com' }));
ok(st === 400 && /first name/.test(j.error), 'the friend’s first name is needed');
[st, j] = await jsonOf(await ask({ first: 'Ana', email: 'ana@example' }));
ok(st === 400 && /complete/.test(j.error), 'a whole email is needed');
[st, j] = await jsonOf(await ask({ first: 'Me', email: 'MARIA@example.com' }));
ok(st === 400 && /own address/.test(j.error), 'not to your own address');
[st, j] = await jsonOf(await ask({ first: 'Ana', email: 'ana@example.com', note: 'Look at https://evil.example' }));
ok(st === 400 && /links/.test(j.error) && sent.length === 0, 'no links in the note');
[st, j] = await jsonOf(await ask({ first: 'Ana', email: 'ana@example.com', note: 'x'.repeat(INVITE_NOTE_MAX + 1) }));
ok(st === 400 && sent.length === 0, `the note stays under ${INVITE_NOTE_MAX} characters`);

[st, j] = await jsonOf(await ask({ first: 'Ana', email: 'Ana@Example.com', note: 'You will love Day 3.' }));
ok(st === 200 && j.sent === true && j.left === INVITE_PER_DAY - 1, 'sent: the page hears it went, and how many are left today');
ok(sent.length === 1 && sent[0].body.to[0] === 'ana@example.com' && sent[0].body.subject === 'Maria thought of you: 12 Days to Start Winning', 'one letter, to the friend');
ok(sent[0].body.text.includes('A note from Maria: “You will love Day 3.”'), 'with Maria’s line');
const unsub = sent[0].body.headers['List-Unsubscribe'];
ok(/\/api\/unsubscribe\?i=[\w-]{20,}/.test(unsub) && sent[0].body.text.includes('You got this one letter because Maria (maria@example.com) asked us'), 'the footer: why it came, and a one-tap "no more invitations"');
ok(count("SELECT COUNT(*) n FROM student WHERE lower(email) = 'ana@example.com'") === 0, 'the friend gets no account');
ok(count('SELECT COUNT(*) n FROM course_invite WHERE friend = ?', await friendHash('ana@example.com')) === 1, 'the friend is kept only as a hash');
ok(!JSON.stringify(DB.raw.prepare('SELECT * FROM course_invite').all()).includes('ana@') && !JSON.stringify(DB.raw.prepare('SELECT * FROM course_invite').all()).includes(token), 'no address and no account key in the invitation rows');
ok(count("SELECT COUNT(*) n FROM event WHERE student_id = ? AND kind = 'course-invite' AND detail = 'Ana'", token) === 1, 'Maria’s trail in /mentor: "Invited a friend to 12 Days: Ana"');
ok(count("SELECT COUNT(*) n FROM mailchimp_log WHERE email = 'ana@example.com'") === 0, 'the friend is not sent to Mailchimp (no list, no tag)');

sent = fakeResend();
[st, j] = await jsonOf(await ask({ first: 'Ana', email: 'ana@example.com' }));
ok(st === 409 && /already invited/.test(j.error) && sent.length === 0, `one invitation to an address in ${INVITE_GAP_DAYS} days`);

// The email service says no: the page is told, nothing is counted.
sent = fakeResend(false);
[st, j] = await jsonOf(await ask({ first: 'Bo', email: 'bo@example.com' }));
ok(st === 502 && !j.sent && count('SELECT COUNT(*) n FROM course_invite WHERE friend = ?', await friendHash('bo@example.com')) === 0, 'not taken by the email service: "did not go out", and it can be tried again');

sent = fakeResend();
await ask({ first: 'Bo', email: 'bo@example.com' });
await ask({ first: 'Cy', email: 'cy@example.com' });
[st, j] = await jsonOf(await ask({ first: 'Di', email: 'di@example.com' }));
ok(sent.length === 2 && st === 429 && /3 invitations today/.test(j.error), `at most ${INVITE_PER_DAY} a day from one founder`);

// Older than a day and a month: room again (the limits look back in time).
DB.raw.prepare('UPDATE course_invite SET at = at - ?').run((INVITE_GAP_DAYS + 1) * 86400_000);

// No more invitations: the footer link.
const page = await unsubGet({ request: get(unsub.slice(unsub.indexOf('/api/'), -1)), env });
ok(/No more invitations/.test(await page.text()), 'the footer link: no more invitations');
sent = fakeResend();
[st, j] = await jsonOf(await ask({ first: 'Ana', email: 'ana@example.com' }));
ok(st === 409 && /can’t send/.test(j.error) && sent.length === 0, 'after that, nobody can invite that address');
[st, j] = await jsonOf(await ask({ first: 'Di', email: 'di@example.com' }));
ok(st === 200 && j.sent && sent.length === 1, 'a new day: Maria can invite again');

// Someone who said no to letters gets no invitation either.
const [, a] = await jsonOf(await signup({ request: post('/api/signup', { ...maria, first: 'Eve', email: 'eve@example.com' }), env }));
DB.raw.prepare('UPDATE student_profile SET unsubscribed = 1 WHERE student_id = ?').run(a.token);
sent = fakeResend();
[st, j] = await jsonOf(await ask({ first: 'Eve', email: 'eve@example.com' }));
ok(st === 409 && sent.length === 0, 'an address that unsubscribed: no invitation');

// No email key: a plain answer, nothing breaks.
[st, j] = await jsonOf(await coursePost({ request: post('/api/course', { token, action: 'invite', first: 'Fa', email: 'fa@example.com' }), env: { DB } }));
ok(st === 503 && !j.sent, 'no email key: "cannot send invitations right now"');

// ── The page ─────────────────────────────────────────────────────────────────
const html = read('public/12-days/index.html');
const js = read('public/12-days/neighbor.js');
ok(html.includes('Take care of your neighbor') && html.includes('Give them a hand and a ton of inspiration :)'), 'the page: Alexandru’s title and line');
ok(html.includes('src="/12-days/neighbor.js"') && html.includes('id="nbbody"'), 'the page loads the invitation steps');
ok(js.includes("action: 'invite'") && /if \(!r\.ok \|\| !d\.sent\)/.test(js) && js.includes('Sent. Your invitation is on its way'), '"Sent" shows only when the server says so');
ok(new RegExp(`NOTE_MAX = ${INVITE_NOTE_MAX}\\b`).test(js), 'the page and the server agree on the note length');
ok(/needAccount: true/.test(js), 'not signed in: the free account first');
ok(read('public/12-days/days.js').includes('href="#nb"'), 'after starting: a pointer to invite a friend');
ok(/'course-invite': \['mail', `Invited a friend to 12 Days/.test(read('public/mentor/mentor.js')), '/mentor reads the new event in plain words');
ok(ENTRIES.some((e) => e.fn === 'inviteLetter' && e.stage === 'find'), 'the email map has the invitation (AGENTS.md rule 14)');

done();
