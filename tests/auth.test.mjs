// Optional passwords: hashing, signing in, the rate limit, paused accounts,
// setting and changing a password, and the confirmation field.

import { hashPassword, verifyPassword, sameHex, passwordProblem, newSalt, ITERATIONS } from '../functions/_auth.js';
import { onRequestPost as login, LIMIT } from '../functions/api/login.js';
import { onRequestPost as setPw } from '../functions/api/password.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as askLink, onRequestGet as useLink } from '../functions/api/signin.js';
import { onRequestPost as mentorPost } from '../functions/api/mentor.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('auth');
const DB = fakeD1();
const env = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MENTOR_KEY: 'mentor-key-123' };
let sent = fakeResend();
const J = async (r) => [r.status, await r.json()];

// ── Hash and verify ──────────────────────────────────────────────────────────
const salt = newSalt();
ok(/^[0-9a-f]{32}$/.test(salt) && newSalt() !== salt, 'a random 16-byte salt each time');
ok(ITERATIONS === 100000, '100,000 PBKDF2 iterations');
const h = await hashPassword('a long enough secret', salt);
ok(/^[0-9a-f]{64}$/.test(h), 'a 256-bit hash, as hex');
ok(h === await hashPassword('a long enough secret', salt) && h !== await hashPassword('a long enough secret', newSalt()), 'same salt same hash; new salt new hash');
ok(await verifyPassword('a long enough secret', { pass_hash: h, salt, iterations: ITERATIONS }), 'the right password verifies');
ok(!(await verifyPassword('a long enough secreT', { pass_hash: h, salt, iterations: ITERATIONS })), 'a wrong password does not');
ok(sameHex('abcd', 'abcd') && !sameHex('abcd', 'abce') && !sameHex('abcd', 'abc'), 'constant-time compare');

// ── Rules and confirmation ───────────────────────────────────────────────────
ok(passwordProblem('short') !== '' && passwordProblem('ten chars!') === '', 'minimum 10 characters, no other rules');
ok(passwordProblem('same secret here', 'same secret here') === '', 'matching confirmation passes');
ok(passwordProblem('same secret here', 'different words') === 'The two passwords are different.', 'non-matching confirmation is said plainly');

// ── Signup: the full form with its password, the simple form without ────────
const FULL = { type: 'full', company: 'Acme', interest: 'Higher income', industry: 'Other' };
let [st, j] = await J(await signup({ request: post('/api/signup', { first: 'Ana', email: 'ana@example.com', ...FULL, password: 'mismatch-one', confirm: 'mismatch-two' }), env }));
ok(st === 400 && j.error === 'The two passwords are different.' && !DB.raw.prepare("SELECT 1 FROM student WHERE email='ana@example.com'").get(), 'signup with different passwords makes nothing');
[st, j] = await J(await signup({ request: post('/api/signup', { first: 'Ana', email: 'ana@example.com', ...FULL, password: 'correct horse', confirm: 'correct horse' }), env }));
const ana = j.token;
const auth = DB.raw.prepare('SELECT * FROM account_auth WHERE student_id = ?').get(ana);
ok(st === 200 && auth && auth.pass_hash && auth.salt && auth.iterations === 100000, 'signup with a password stores only a hash');
ok(!JSON.stringify(DB.raw.prepare('SELECT * FROM account_auth').all()).includes('correct horse'), 'the password itself is never stored');
[st, j] = await J(await signup({ request: post('/api/signup', { first: 'Bo', email: 'bo@example.com' }), env }));
const bo = j.token;
ok(!DB.raw.prepare('SELECT 1 FROM account_auth WHERE student_id = ?').get(bo), 'simple form: no password stored, the email link works');

// ── Signing in ───────────────────────────────────────────────────────────────
const L = (email, password, ip = '1.1.1.1') => login({ request: post('/api/login', { email, password }, ip), env });
[st, j] = await J(await L('ANA@example.com', 'correct horse'));
ok(st === 200 && j.token === ana && j.me.first === 'Ana', 'the right password signs in');
const [s1, wrong] = await J(await L('ana@example.com', 'wrong password!', '2.2.2.1'));
const [s2, nobody] = await J(await L('nobody@example.com', 'wrong password!', '2.2.2.2'));
const [s3, nopass] = await J(await L('bo@example.com', 'any password!!', '2.2.2.3'));
ok(s1 === 401 && s2 === 401 && s3 === 401 && wrong.error === nobody.error && nobody.error === nopass.error, 'the same reply for a wrong password, an unknown email and an account without a password');
ok(!wrong.token && !nobody.token, 'no token on failure');

// Rate limit on failed tries, counted alike for known and unknown addresses.
for (let i = 0; i < LIMIT.email - 1; i++) await L('ana@example.com', 'wrong password!', '3.3.3.' + i);
[st] = await J(await L('ana@example.com', 'correct horse', '3.3.3.99'));
ok(st === 429, `after ${LIMIT.email} failed tries the address waits, even with the right password`);
for (let i = 0; i < LIMIT.email; i++) await L('ghost@example.com', 'wrong password!', '4.4.4.' + i);
[st] = await J(await L('ghost@example.com', 'wrong password!', '4.4.4.99'));
ok(st === 429, 'unknown addresses are limited the same way');
DB.raw.exec('DELETE FROM auth_log');

// ── Paused ───────────────────────────────────────────────────────────────────
const mentor = (body) => mentorPost({ request: new Request('https://x/api/mentor', { method: 'POST', headers: { 'content-type': 'application/json', 'x-mentor-key': 'mentor-key-123' }, body: JSON.stringify(body) }), env });
await mentor({ action: 'pause', student: ana, paused: true });
[st, j] = await J(await L('ana@example.com', 'correct horse'));
ok(st === 403 && j.error === 'This account is paused. Write to support@exploraself.com.' && !j.token, 'a paused account cannot sign in, and is told plainly');
[st, j] = await J(await L('ana@example.com', 'wrong password!'));
ok(st === 401 && !/paused/i.test(j.error), 'a wrong password does not reveal the pause');
sent = fakeResend();
await askLink({ request: post('/api/signin', { email: 'ana@example.com', to: 'start' }, '5.5.5.5'), env });
const code = /signin=([0-9a-f]+)/.exec(sent.at(-1).body.text)[1];
ok(/\/start\?signin=/.test(sent.at(-1).body.text), 'a link asked for from the Ground Plan opens the Ground Plan');
[st, j] = await J(await useLink({ request: get('/api/signin?code=' + code), env }));
ok(st === 403 && j.error.includes('paused') && !j.token, 'a paused account cannot sign in by link either');
await mentor({ action: 'pause', student: ana, paused: false });
[st, j] = await J(await L('ana@example.com', 'correct horse'));
ok(st === 200 && j.token === ana, 'unpaused: signs in again, password kept');

// ── Set and change ───────────────────────────────────────────────────────────
const P = (token, password, confirm) => setPw({ request: post('/api/password', { token, password, confirm }), env });
[st] = await J(await P('x'.repeat(48), 'whatever long one', 'whatever long one'));
ok(st === 401, 'setting a password needs to be signed in');
[st, j] = await J(await P(bo, 'first password', 'first password'));
ok(st === 403 && /link we email you/.test(j.error), 'simple form: no password, ever');
// An account from before the two forms (no signup_type) can still set one.
DB.raw.prepare('UPDATE student_profile SET signup_type = NULL WHERE student_id = ?').run(bo);
[st, j] = await J(await P(bo, 'first password', 'first passwrod'));
ok(st === 400 && j.error === 'The two passwords are different.', 'set: confirmation must match');
[st, j] = await J(await P(bo, 'short', 'short'));
ok(st === 400 && /10 characters/.test(j.error), 'set: at least 10 characters');
[st, j] = await J(await P(bo, 'first password', 'first password'));
ok(st === 200 && j.changed === false, 'set a first password');
[st, j] = await J(await L('bo@example.com', 'first password'));
ok(st === 200 && j.token === bo, '…and sign in with it');
const before = DB.raw.prepare('SELECT salt FROM account_auth WHERE student_id = ?').get(bo).salt;
[st, j] = await J(await P(bo, 'second password', 'second password'));
ok(st === 200 && j.changed === true && DB.raw.prepare('SELECT salt FROM account_auth WHERE student_id = ?').get(bo).salt !== before, 'change it: a new salt and hash');
ok((await L('bo@example.com', 'first password')).status === 401 && (await L('bo@example.com', 'second password')).status === 200, 'the old password stops working, the new one works');
ok(DB.raw.prepare("SELECT COUNT(*) n FROM event WHERE student_id = ? AND kind IN ('password-set','password-changed')").get(bo).n === 2, 'set and change are logged');

// ── Forgot password: the reset letter, to the Ground Plan with the box open ──
{
  DB.raw.prepare('DELETE FROM mail_log').run();
  sent = fakeResend();
  await askLink({ request: post('/api/signin', { email: 'ana@example.com', reset: true }, '8.8.8.1'), env });
  const m = sent.at(-1).body;
  ok(m.subject === 'Choose a new password' && /Choose my new password →: \S+\/start\?signin=[0-9a-f]+&reset=1/.test(m.text), 'forgot password: a reset letter to /start?…&reset=1');
  const fs = await import('node:fs');
  const app = fs.readFileSync('public/app.js', 'utf8');
  ok(/get\('reset'\) === '1'/.test(app) && /function openReset\([\s\S]{0,300}box\.open = true/.test(app), 'the Ground Plan opens the password box after a reset link');
  ok(/signinLink\(email, 'start', where !== 'note'\)/.test(fs.readFileSync('public/compass/app.js', 'utf8')), 'Compass: "Forgot your password?" asks for a reset to the Ground Plan');
  DB.raw.prepare('DELETE FROM mail_log').run();
}
// ── The email limit never blocks password sign-in ───────────────────────────
{
  const { LIMIT_MSG } = await import('../functions/_mail.js');
  const fs = await import('node:fs');
  for (let k = 0; k < 3; k++) await askLink({ request: post('/api/signin', { email: 'ana@example.com' }, '7.7.7.' + k), env });
  const [s4, j4] = await J(await askLink({ request: post('/api/signin', { email: 'ana@example.com' }, '7.7.7.9'), env }));
  ok(s4 === 429 && j4.error === LIMIT_MSG, 'the 4th email in an hour is stopped with the plain message');
  ok(LIMIT_MSG === "We've sent 3 emails to this address in the last hour. To keep your account safe, wait an hour, or sign in with your password.", 'limit message wording');
  const [s5] = await J(await L('ana@example.com', 'correct horse', '7.7.7.10'));
  ok(s5 === 200, 'password sign-in still works after the email limit is hit');
  const src = ['functions/api/signin.js', 'functions/api/send-plan.js', 'public/account-box.js', 'public/compass/app.js', 'public/start/index.html'].map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  ok(!src.includes('That is a few already'), 'the old limit message is gone everywhere');
  ok(!fs.readFileSync('functions/api/login.js', 'utf8').includes('allowed('), 'login.js does not use the email limit');
  const app = fs.readFileSync('public/compass/app.js', 'utf8');
  ok(app.includes("'This email already has an account. Sign in to open your plans.'") && /UI\.signinFor === 'plans'[\s\S]{0,1200}pSignin\('gate'\)/.test(app), 'Compass: an existing email opens the sign-in box with password + email link');
  ok(/case 'account':[\s\S]{0,600}openSignin\(\)/.test(app) && !/case 'account':[\s\S]{0,600}askLink\(/.test(app), 'Compass: "Create my free account" no longer only emails a link');
  ok(fs.readFileSync('public/account-box.js', 'utf8').includes('Sign in to open your plans.'), 'road pages and /start: same line for an existing email');
}

done();
