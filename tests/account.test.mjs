// Free accounts from the Compass: signup, the welcome email, sign-in by a
// one-time link, and unsubscribe. Runs the real routes against Node's own
// SQLite with the live tables, and a stand-in for the email service.

import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as askLink, onRequestGet as useLink, TTL } from '../functions/api/signin.js';
import { onRequestGet as unsub, onRequestPost as unsubPost } from '../functions/api/unsubscribe.js';
import { sha256 } from '../functions/_shared.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('account');
const DB = fakeD1();
const env = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome' };
let sent = fakeResend();
const jsonOf = async (r) => [r.status, await r.json()];

// ── Signup: a new email ──────────────────────────────────────────────────────
const ana = { first: 'Ana', last: 'Pop', email: 'Ana@Example.com', industry: 'Coaching & consulting', consent: true, source: 'compass', stage: 'growing' };
let [st, j] = await jsonOf(await signup({ request: post('/api/signup', ana), env }));
ok(st === 200 && j.ok && /^[0-9a-f]{48}$/.test(j.token) && j.existing === false, 'new email: a record and a token');
const token = j.token;
const row = DB.raw.prepare('SELECT * FROM student WHERE id = ?').get(token);
ok(row && row.email === 'ana@example.com' && row.name === 'Ana Pop' && row.tier === 'free', 'student row: email, name, tier free');
ok(row.stage === 'grow', 'the Compass stage is stored in the programme\'s words');
const prof = DB.raw.prepare('SELECT * FROM student_profile WHERE student_id = ?').get(token);
ok(prof && prof.industry === 'Coaching & consulting' && prof.consent === 1 && prof.consent_at && prof.source === 'compass', 'profile: industry, consent, consent_at, source');
ok(prof.unsub_id && prof.unsub_id.length >= 40 && prof.unsubscribed === 0, 'profile: an unsubscribe id, subscribed');
ok(DB.raw.prepare("SELECT COUNT(*) n FROM event WHERE student_id = ? AND kind = 'signup'").get(token).n === 1, 'event: signup logged');
ok(sent.length === 1 && sent[0].body.to[0] === 'ana@example.com' && /saved/i.test(sent[0].body.subject), 'welcome email sent');
const w = sent[0].body;
ok(w.html.includes('https://linktolead.exploraself.com/start') && /sign-in link/i.test(w.text), 'welcome: Launchpad link and how to sign in again');
ok(w.html.includes('/api/unsubscribe?u=' + prof.unsub_id) && w.text.includes('Via Esempio 1') && w.headers['List-Unsubscribe'], 'welcome: footer and headers');
ok(DB.raw.prepare("SELECT COUNT(*) n FROM mailchimp_log WHERE student_id = ? AND action = 'join'").get(token).n === 1, 'the Mailchimp join is tried once, after the reply (tests/mailchimp.test.mjs covers it)');

// Escaped: a name with markup.
sent = fakeResend();
await signup({ request: post('/api/signup', { first: '<img src=x>', email: 'x@example.com', consent: true }), env });
ok(sent.length === 1 && !sent[0].body.html.includes('<img src=x>') && sent[0].body.html.includes('&lt;img'), 'welcome escapes the name');

// ── Signup: the same email ───────────────────────────────────────────────────
sent = fakeResend();
[st, j] = await jsonOf(await signup({ request: post('/api/signup', { ...ana, email: 'ana@EXAMPLE.com', first: 'Someone', industry: 'Other' }), env }));
ok(st === 200 && j.existing === true && !j.token, 'same email: no token handed to another browser');
ok(DB.raw.prepare("SELECT COUNT(*) n FROM student WHERE email = 'ana@example.com'").get().n === 1, 'same email: still one record');
ok(DB.raw.prepare('SELECT name FROM student WHERE id = ?').get(token).name === 'Ana Pop', 'same email: name not overwritten');
ok(DB.raw.prepare('SELECT industry FROM student_profile WHERE student_id = ?').get(token).industry === 'Coaching & consulting', 'same email: industry not overwritten');
ok(sent.length === 0, 'same email: no second welcome');
[st, j] = await jsonOf(await signup({ request: post('/api/signup', { ...ana, token }), env }));
ok(j.token === token, 'same email from the browser that holds the token: the token comes back');

// No consent: no welcome.
sent = fakeResend();
await signup({ request: post('/api/signup', { first: 'Bo', email: 'bo@example.com', consent: false }), env });
ok(sent.length === 0, 'no consent: no welcome');
await signup({ request: post('/api/signup', { first: 'Mallory', email: 'bo@example.com', consent: true }), env });
ok(DB.raw.prepare("SELECT p.consent FROM student_profile p JOIN student s ON s.id = p.student_id WHERE s.email = 'bo@example.com'").get().consent === 0, 'another browser cannot switch consent on for an existing address');
[st, j] = await jsonOf(await signup({ request: post('/api/signup', { first: 'Bo', email: 'nope' }), env }));
ok(st === 400, 'broken address refused');
[st] = await jsonOf(await signup({ request: post('/api/signup', { email: 'c@example.com' }), env }));
ok(st === 400, 'no first name refused');
[st] = await jsonOf(await signup({ request: post('/api/signup', ana), env: {} }));
ok(st === 503, 'no database: refuses politely');

// ── Sign-in by one-time link ────────────────────────────────────────────────
sent = fakeResend();
const ask = (email, ip) => askLink({ request: post('/api/signin', { email }, ip), env });
const [s1, known] = await jsonOf(await ask('ana@example.com', '9.9.9.1'));
const [s2, unknown] = await jsonOf(await ask('nobody@example.com', '9.9.9.2'));
ok(s1 === 200 && s2 === 200 && JSON.stringify(known) === JSON.stringify(unknown), 'same reply for a known and an unknown email');
ok(sent.length === 1 && sent[0].body.to[0] === 'ana@example.com', 'only the real account gets an email');
const link = /https:\/\/linktolead\.exploraself\.com\/compass\?signin=([0-9a-f]+)/.exec(sent[0].body.text);
ok(link, 'the email carries /compass?signin=<code>');
const code = link[1];
ok(sent[0].body.text.includes('Via Esempio 1') && sent[0].body.html.includes('/api/unsubscribe'), 'sign-in email has the footer');
const stored = DB.raw.prepare('SELECT * FROM signin_code').all();
ok(stored.length === 1 && stored[0].code_hash === await sha256(code) && !JSON.stringify(stored).includes(code), 'code stored hashed, never as sent');
ok(stored[0].expires_at - Date.now() > TTL - 5000 && stored[0].expires_at - Date.now() <= TTL && TTL === 30 * 60_000, 'valid for 30 minutes');

[st, j] = await jsonOf(await useLink({ request: get('/api/signin?code=' + code), env }));
ok(st === 200 && j.token === token && j.me.email === 'ana@example.com' && j.me.first === 'Ana', 'a live code returns the token');
[st, j] = await jsonOf(await useLink({ request: get('/api/signin?code=' + code), env }));
ok(st === 410 && !j.token, 'single use: the second try gets nothing');

// Expiry.
sent = fakeResend();
await ask('ana@example.com', '9.9.9.3');
const code2 = /signin=([0-9a-f]+)/.exec(sent[0].body.text)[1];
DB.raw.prepare('UPDATE signin_code SET expires_at = ? WHERE code_hash = ?').run(Date.now() - 1, await sha256(code2));
[st, j] = await jsonOf(await useLink({ request: get('/api/signin?code=' + code2), env }));
ok(st === 410 && !j.token, 'an expired code gets nothing');
[st, j] = await jsonOf(await useLink({ request: get('/api/signin?code=' + 'f'.repeat(64)), env }));
ok(st === 410 && !j.token, 'a made-up code gets nothing');

// Rate limit, counted the same for known and unknown addresses.
for (let i = 0; i < 2; i++) await ask('nobody@example.com', '9.9.9.' + (10 + i));
[st] = await jsonOf(await ask('nobody@example.com', '9.9.9.20'));
const [st2] = await jsonOf(await ask('ana@example.com', '9.9.9.21'));
ok(st === 429 && st2 === 429, 'a fourth request in an hour is refused, for known and unknown alike');
const offEnv = { DB, RESEND_API_KEY: 'k' };
[st] = await jsonOf(await askLink({ request: post('/api/signin', { email: 'z@example.com' }), env: offEnv }));
ok(st === 503, 'no postal address: no sign-in email');

// ── Unsubscribe ─────────────────────────────────────────────────────────────
const u = DB.raw.prepare('SELECT unsub_id FROM student_profile WHERE student_id = ?').get(token).unsub_id;
let r = await unsub({ request: get('/api/unsubscribe?u=' + u), env });
const page = await r.text();
ok(r.status === 200 && /text\/html/.test(r.headers.get('content-type')) && /unsubscribed/i.test(page), 'a plain confirmation page');
const after = DB.raw.prepare('SELECT unsubscribed, unsub_at FROM student_profile WHERE student_id = ?').get(token);
ok(after.unsubscribed === 1 && after.unsub_at, 'unsubscribed = 1, with the time');
r = await unsub({ request: get('/api/unsubscribe?u=nothing-like-this-at-all-xxxx'), env });
ok(r.status === 200 && (await r.text()) === page, 'an unknown link shows the same page');
const bo = DB.raw.prepare("SELECT p.unsub_id FROM student_profile p JOIN student s ON s.id = p.student_id WHERE s.email = 'bo@example.com'").get().unsub_id;
r = await unsubPost({ request: new Request('https://x/api/unsubscribe?u=' + bo, { method: 'POST', body: 'List-Unsubscribe=One-Click' }), env });
ok(r.status === 200 && DB.raw.prepare('SELECT unsubscribed FROM student_profile WHERE unsub_id = ?').get(bo).unsubscribed === 1, 'one-click POST unsubscribes');

// Unsubscribed people still get what they ask for in the moment.
DB.raw.exec('DELETE FROM mail_log');
sent = fakeResend();
await ask('ana@example.com', '7.7.7.7');
ok(sent.length === 1, 'an unsubscribed founder still gets the sign-in link they asked for');

// …but never the welcome: a re-signup that turns consent on does not send it,
// and a brand-new account that is unsubscribed is not possible.
sent = fakeResend();
await signup({ request: post('/api/signup', { ...ana, token }), env });
ok(sent.length === 0, 'no welcome to an unsubscribed founder');

done();
