// "Email me my results", and the rules every email keeps.
//
// It must stay off until the email key AND the postal address exist, go only
// to an account's own address, escape what visitors type, carry the footer
// (why it came, unsubscribe, postal address) and the List-Unsubscribe headers,
// and refuse a fourth send to the same address in an hour.

import { onRequestGet, onRequestPost } from '../functions/api/send-plan.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { footer, send } from '../functions/_mail.js';
import { fakeD1, fakeResend, post, tally } from './_d1.mjs';

const { ok, done } = tally('sendplan');
const ADDR = 'ExploraSelf, Via Esempio 1, 00100 Rome, Italy';
const req = (body) => post('/api/send-plan', body);

// Off without the key.
let r = await onRequestGet({ env: {} });
let j = await r.json();
ok(j.ready === false && /RESEND_API_KEY/.test(j.reason), 'not ready without a key, and says why');
r = await onRequestPost({ request: req({ email: 'a@b.co' }), env: {} });
ok(r.status === 503, 'refuses to send without a key');

// Off without the postal address, even with the key.
r = await onRequestGet({ env: { RESEND_API_KEY: 'k' } });
j = await r.json();
ok(j.ready === false && /MAIL_POSTAL_ADDRESS/.test(j.reason), 'not ready without the postal address, and says why');
let sent = fakeResend();
r = await onRequestPost({ request: req({ email: 'a@b.co' }), env: { RESEND_API_KEY: 'k', DB: fakeD1() } });
ok(r.status === 503 && sent.length === 0, 'refuses to send without the postal address');
const direct = await send({ RESEND_API_KEY: 'k' }, { to: 'a@b.co', subject: 's', html: '<p>x</p>', text: 'x', why: 'w' });
ok(!direct.ok && sent.length === 0, 'the mail module itself refuses without the address');
r = await onRequestGet({ env: { RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: '   ' } });
ok((await r.json()).ready === false, 'a blank address counts as missing');

// On.
const env = { RESEND_API_KEY: 'test', MAIL_POSTAL_ADDRESS: ADDR, DB: fakeD1() };
r = await onRequestGet({ env });
ok((await r.json()).ready === true, 'ready once the key and the address exist');

// The footer on its own.
const f = footer(env, { why: 'You asked <for> it.', unsubUrl: 'https://x/api/unsubscribe?u=abc' });
ok(f.html.includes('Unsubscribe') && f.html.includes('https://x/api/unsubscribe?u=abc') && f.html.includes('Via Esempio 1'), 'footer html: unsubscribe + address');
ok(f.text.includes('Unsubscribe: https://x/api/unsubscribe?u=abc') && f.text.includes(ADDR), 'footer text: unsubscribe + address');
ok(f.html.includes('You asked &lt;for&gt; it.'), 'footer escapes');

// A founder with an account.
sent = fakeResend();
r = await signup({ request: post('/api/signup', { first: 'Ana', last: 'Pop', email: 'Ana@Example.com', consent: false, source: 'compass' }), env });
const token = (await r.json()).token;

r = await onRequestPost({ request: req({ email: 'not-an-email' }), env });
ok(r.status === 400, 'rejects a broken address');
r = await onRequestPost({ request: req({ email: 'stranger@example.com', plan: {} }), env });
ok(r.status === 404 && sent.length === 0, 'an address with no account gets nothing');

const plan = { name: '<b>Ana</b>', stage: 'Building', focus: 'x', domains: [{ know: 'Lead yourself', lead: 'Needs you now', label: 'Start here', strengthen: ['q'], steps: ['<script>alert(1)</script>'], level: '' }], evil: 'dropped' };
r = await onRequestPost({ request: req({ token, email: 'someone-else@example.com', plan }), env });
j = await r.json();
ok(r.status === 200 && j.to === 'ana@example.com', 'signed in: goes to the account email, whatever was typed');
const m = sent[0];
ok(m && m.url === 'https://api.resend.com/emails', 'uses the email service');
ok(m.body.to.length === 1 && m.body.to[0] === 'ana@example.com', 'sends only to the account');
ok(m.body.from === 'Alexandru at ExploraSelf <support@exploraself.com>', 'sends from the verified exploraself.com address');
ok(!m.body.html.includes('<script>') && !m.body.text.includes('<script>'), 'nothing the page sent is pasted into the letter');
ok(m.body.subject === 'Your Leadership Compass' && /^Hi Ana,/.test(m.body.text) && m.body.text.includes('For you that’s Lead yourself.'), 'results letter: first name from the account, the domain that needs them most');
ok(!m.body.html.includes('<b>Ana</b>'), 'escapes the name');
ok(!JSON.stringify(m.body).includes('dropped'), 'drops unknown fields');
ok(m.body.html.includes('https://linktolead.exploraself.com/compass') && m.body.text.includes('Here is your Leadership Compass: https://linktolead.exploraself.com/compass.'), 'links to the results');
ok(typeof m.body.text === 'string' && m.body.text.includes('Lead yourself'), 'has a plain-text version');
ok(m.body.html.includes('/api/unsubscribe?u=') && m.body.html.includes(ADDR), 'html footer: unsubscribe + address');
ok(m.body.text.includes('/api/unsubscribe?u=') && m.body.text.includes(ADDR), 'text footer: unsubscribe + address');
ok(/^<https:\/\/.+\/api\/unsubscribe\?u=\w+>$/.test(m.body.headers['List-Unsubscribe']), 'List-Unsubscribe header');
ok(m.body.headers['List-Unsubscribe-Post'] === 'List-Unsubscribe=One-Click', 'List-Unsubscribe-Post header');

// Typing the account's address also works (the Compass creates the account first).
r = await onRequestPost({ request: req({ email: 'ANA@example.com', plan }), env });
ok(r.status === 200, 'the account address, typed, also works');
r = await onRequestPost({ request: req({ token, plan }), env });
ok(r.status === 200, 'a third send in the hour goes');
r = await onRequestPost({ request: req({ token, plan }), env });
ok(r.status === 429, 'a fourth send to one address in an hour is refused');

// A service failure is said as a failure.
const env3 = { ...env, DB: fakeD1() };
fakeResend();
r = await signup({ request: post('/api/signup', { first: 'Bo', email: 'bo@example.com' }), env: env3 });
const t3 = (await r.json()).token;
fakeResend(false);
r = await onRequestPost({ request: req({ token: t3, plan }), env: env3 });
ok(r.status === 502 && (await r.json()).ok === false, 'a refused send says it did not send');

// The key as a Secrets Store binding (an object with get()), as deployed.
const env2 = { RESEND_API_KEY: { get: async () => 're_store' }, MAIL_POSTAL_ADDRESS: ADDR, DB: fakeD1() };
sent = fakeResend();
r = await signup({ request: post('/api/signup', { first: 'Cy', email: 'cy@example.com' }), env: env2 });
const t2 = (await r.json()).token;
r = await onRequestGet({ env: env2 });
ok((await r.json()).ready === true, 'ready with a Secrets Store binding');
r = await onRequestPost({ request: req({ token: t2, plan }), env: env2 });
ok(r.status === 200 && sent.at(-1).auth === 'Bearer re_store', 'reads the key from the Secrets Store binding');

done();
