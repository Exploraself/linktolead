// Payments with Stripe (functions/_stripe.js, Alexandru 2 Nov 2026): a
// founder pays for a step, the step opens the moment Stripe says "paid"
// (signed webhook, or the return from Stripe), once, and the "It's unlocked"
// letter goes once. Nothing is ever opened on a claim Stripe did not make.
// No network: Stripe and Resend are faked.

import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { STEPS, form, stripeMode, keyProblem, verifySignature, applyPaid, dollars } from '../functions/_stripe.js';
import { onRequestGet as payGet, onRequestPost as payPost } from '../functions/api/checkout.js';
import { onRequestPost as hook } from '../functions/api/stripe-webhook.js';
import { onRequestGet as mentorGet, onRequestPost as mentorPost } from '../functions/api/mentor.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { LADDER } from '../public/content.js';
import { unlockedLetter, UNLOCKED } from '../functions/_letters.js';
import { fakeD1, tally } from './_d1.mjs';

const { ok, done } = tally('stripe');
const B = 'https://linktolead.exploraself.com';

// Prices: one ladder everywhere.
for (const [k, S] of Object.entries(STEPS)) ok(LADDER.find((r) => r.key === k).price === dollars(S.amount), `${k}: ${dollars(S.amount)} = the ladder's price`);
ok(STEPS.session.amount === 2700 && STEPS.lab.amount === 9700 && STEPS.hub.amount === 75000 && STEPS.premium.amount === 198900, 'Boardroom $27 · LAB $97 · HUB $750 · Summit $1,989 (Alexandru, 2 Nov)');
for (const k of Object.keys(STEPS)) ok(UNLOCKED[k], `${k}: the unlocked letter knows it`);

// Small parts.
ok(form({ a: { b: 1 }, c: ['x', 'y'], d: undefined }).toString() === 'a%5Bb%5D=1&c%5B0%5D=x&c%5B1%5D=y', 'Stripe form encoding');
ok(stripeMode({ STRIPE_SECRET_KEY: 'rk_test_abc' }) === 'test' && stripeMode({ STRIPE_SECRET_KEY: 'rk_live_abc' }) === 'live' && stripeMode({}) === '' && stripeMode({ STRIPE_SECRET_KEY: 'pk_live_x' }) === '', 'test, live, or not connected (a publishable key is never enough)');
const sign = (payload, secret, t = Math.floor(Date.now() / 1000)) => `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex')}`;
ok(await verifySignature('{"a":1}', sign('{"a":1}', 'whsec_1'), 'whsec_1'), 'a correct signature is accepted');
ok(!(await verifySignature('{"a":1}', sign('{"a":1}', 'whsec_2'), 'whsec_1')), 'a wrong secret is refused');
ok(!(await verifySignature('{"a":2}', sign('{"a":1}', 'whsec_1'), 'whsec_1')), 'a changed payload is refused');
ok(!(await verifySignature('{"a":1}', sign('{"a":1}', 'whsec_1', Math.floor(Date.now() / 1000) - 3600), 'whsec_1')), 'an old signature is refused');

// The letter.
const U = unlockedLetter(B, { first: 'maya', step: 'session', to: 'm@x.com' });
ok(U.subject === 'It’s unlocked: The Boardroom' && /^Hi Maya,/.test(U.text) && /Thank you/.test(U.text) && /Levels 04 and 05 are open/.test(U.text) && /forms\.gle/.test(U.text) && U.html.includes('/ground-plan/#programme-4') && /The team and I are here for you/.test(U.text), 'It’s unlocked: thanks, what opened, the session, the booking link, the first level, the team');
ok(!/P\.S\./.test(U.text), 'no offer in the letter: they just bought');
// A higher step includes every step below it (Alexandru, 2 Nov 2026).
const opened = (step, from) => unlockedLetter(B, { first: 'Maya', step, from }).text;
ok(/Levels 04 to 09 are open/.test(opened('lab', 'free')) && /#programme-4|Open Level 04/.test(opened('lab', 'free')), 'the LAB bought straight away: The Boardroom’s levels are included (04 to 09)');
ok(/Levels 06 to 09 are open/.test(opened('lab', 'session')), 'the LAB after The Boardroom: 06 to 09');
ok(/Levels 04 to 12 are open[^]*Nothing is held back/.test(opened('hub', 'free')), 'the HUB: everything, 04 to 12');
ok(/Levels 04 to 12 are open[^]*Everything is yours/.test(opened('premium', 'free')), 'The Summit: everything, at once');
const { holds } = await import('../public/content.js');
ok(['session', 'lab', 'hub'].every((g) => holds('hub', g)) && ['session', 'lab', 'hub', 'premium'].every((g) => holds('premium', g)) && holds('lab', 'session'), 'the levels follow: the HUB and The Summit open every level, the LAB includes The Boardroom');

// A fake Stripe and a fake Resend.
const calls = [], sent = [];
let sessions = {};
globalThis.fetch = async (url, opts = {}) => {
  url = String(url);
  if (url.includes('api.resend.com')) { sent.push(JSON.parse(opts.body)); return { ok: true, json: async () => ({ id: 'e' }) }; }
  if (url.includes('api.stripe.com')) {
    calls.push({ url, method: opts.method, body: opts.body ? new URLSearchParams(opts.body) : null, auth: opts.headers.authorization });
    const path = url.replace('https://api.stripe.com/v1/', '').split('?')[0];
    const res = (data, status = 200) => ({ ok: status < 300, status, json: async () => data });
    if (path === 'webhook_endpoints' && opts.method === 'GET') return res({ data: [{ id: 'we_old', url: `${B}/api/stripe-webhook` }] });
    if (path === 'webhook_endpoints/we_old' && opts.method === 'DELETE') return res({ id: 'we_old', deleted: true });
    if (path === 'webhook_endpoints' && opts.method === 'POST') return res({ id: 'we_1', secret: 'whsec_test_1' });
    if (path === 'checkout/sessions' && opts.method === 'POST') return res({ id: 'cs_test_1', url: 'https://checkout.stripe.com/c/pay/cs_test_1' });
    const m = /^checkout\/sessions\/(cs_[\w]+)$/.exec(path);
    if (m && sessions[m[1]]) return res(sessions[m[1]]);
    return res({ error: { message: 'No such thing.' } }, 404);
  }
  return { ok: false, status: 503, headers: new Headers(), text: async () => 'offline' };
};

const DB = fakeD1();
const KEY = 'k'.repeat(24);
const env = { DB, MENTOR_KEY: KEY, STRIPE_SECRET_KEY: 'rk_test_51abc', RESEND_API_KEY: 'r', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Rome' };
const req = (path, { method = 'GET', body, token, key, headers = {} } = {}) => new Request(B + path, { method,
  headers: { 'content-type': 'application/json', ...(token ? { 'x-account-token': token } : {}), ...(key ? { 'x-mentor-key': key } : {}), ...headers }, ...(body !== undefined ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) });
const jsonOf = async (r) => [r.status, await r.json()];
const make = async (first, email) => (await jsonOf(await signup({ request: req('/api/signup', { method: 'POST', body: { first, last: 'T', email, consent: false, source: 'home', type: 'full', company: 'X', interest: 'More free time', industry: 'Other', password: 'longenough1', confirm: 'longenough1' } }), env: { DB, MENTOR_KEY: KEY }, waitUntil: () => {} })))[1].token;
const maya = await make('Maya', 'maya@example.com');
const tom = await make('Tom', 'tom@example.com');
const tierOf = (id) => DB.raw.prepare('SELECT tier FROM student WHERE id = ?').get(id).tier || 'free';

// What /pay/ reads.
let [st, j] = await jsonOf(await payGet({ request: req('/api/checkout', { token: maya }), env }));
ok(st === 200 && j.on && j.test && j.signedIn && j.tier === 'free' && j.steps.session.price === '$27', '/pay/ knows: Stripe on (test), signed in, free, The Boardroom $27');
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout'), env: { DB } }));
ok(j.on === false && j.signedIn === false, 'no key: payments off; no token: not signed in');

// Starting a payment.
[st, j] = await jsonOf(await payPost({ request: req('/api/checkout', { method: 'POST', token: maya, body: { step: 'session' } }), env }));
ok(st === 200 && j.url === 'https://checkout.stripe.com/c/pay/cs_test_1', 'a Stripe Checkout page for The Boardroom');
const made = calls.find((c) => c.url.endsWith('/checkout/sessions') && c.method === 'POST').body;
ok(made.get('line_items[0][price_data][unit_amount]') === '2700' && made.get('line_items[0][price_data][currency]') === 'usd' && made.get('client_reference_id') === maya && made.get('metadata[step]') === 'session' && made.get('customer_email') === 'maya@example.com', 'the right amount, currency, founder and step go to Stripe');
ok(/\/pay\/\?step=session&cs=\{CHECKOUT_SESSION_ID\}$/.test(made.get('success_url')) && /cancelled=1/.test(made.get('cancel_url')), 'back to /pay/ after paying or cancelling');
ok(calls.some((c) => c.url.includes('webhook_endpoints/we_old') && c.method === 'DELETE') && calls.some((c) => c.url.endsWith('/webhook_endpoints') && c.method === 'POST' && c.body.get('url') === `${B}/api/stripe-webhook` && c.body.get('enabled_events[0]') === 'checkout.session.completed'), 'the webhook connects itself, replacing an older one for the same address');
ok(calls.every((c) => c.auth === 'Bearer rk_test_51abc'), 'the key only ever goes to Stripe');
[st, j] = await jsonOf(await payPost({ request: req('/api/checkout', { method: 'POST', body: { step: 'session' } }), env }));
ok(st === 401, 'not signed in: no payment page');
[st, j] = await jsonOf(await payPost({ request: req('/api/checkout', { method: 'POST', token: maya, body: { step: 'nothing' } }), env }));
ok(st >= 400, 'an unknown step: refused');
[st, j] = await jsonOf(await payPost({ request: req('/api/checkout', { method: 'POST', token: maya, body: { step: 'session' } }), env: { DB } }));
ok(st === 503, 'no key: refused in plain words');

// Stripe says paid, through the webhook.
const paid = (id, student, step, amount = STEPS[step].amount, extra = {}) => ({ id, object: 'checkout.session', payment_status: 'paid', status: 'complete', amount_total: amount, currency: 'usd', livemode: false, client_reference_id: student, metadata: { student, step }, ...extra });
const event = (s) => JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed', data: { object: s } });
let payload = event(paid('cs_test_1', maya, 'session'));
st = (await hook({ request: req('/api/stripe-webhook', { method: 'POST', body: payload, headers: { 'stripe-signature': sign(payload, 'whsec_wrong') } }), env })).status;
ok(st === 400 && tierOf(maya) === 'free', 'a wrong signature: refused, nothing opens');
[st, j] = await jsonOf(await hook({ request: req('/api/stripe-webhook', { method: 'POST', body: payload, headers: { 'stripe-signature': sign(payload, 'whsec_test_1') } }), env }));
ok(st === 200 && j.opened === true && tierOf(maya) === 'session', 'Stripe says paid: The Boardroom opens at once');
ok(sent.filter((m) => [].concat(m.to).includes('maya@example.com') && /It’s unlocked/.test(m.subject)).length === 1, 'the “It’s unlocked” letter goes');
const ev = DB.raw.prepare("SELECT detail FROM event WHERE student_id = ? AND kind = 'mentor-step'").all(maya).map((r) => JSON.parse(r.detail));
ok(ev.length === 1 && ev[0].from === 'free' && ev[0].to === 'session' && ev[0].by === 'stripe', 'the climb in /mentor shows the step, opened by Stripe');
[st, j] = await jsonOf(await hook({ request: req('/api/stripe-webhook', { method: 'POST', body: payload, headers: { 'stripe-signature': sign(payload, 'whsec_test_1') } }), env }));
ok(j.already === true && sent.filter((m) => [].concat(m.to).includes('maya@example.com') && /It’s unlocked/.test(m.subject)).length === 1, 'Stripe calls again: recorded once, one letter only');

// Guards.
ok(!(await applyPaid(env, DB, B, { ...paid('cs_test_2', tom, 'lab'), payment_status: 'unpaid' })).ok && tierOf(tom) === 'free', 'not paid: nothing opens');
ok(!(await applyPaid(env, DB, B, paid('cs_test_3', tom, 'lab', 100))).ok && tierOf(tom) === 'free', 'a wrong amount: nothing opens');
ok((await applyPaid(env, DB, B, paid('cs_test_4', maya, 'session'))).opened === false && tierOf(maya) === 'session', 'paying again for a step already open: recorded, nothing lowered');

// Back from Stripe: the site asks Stripe about that exact session.
sessions.cs_test_5 = paid('cs_test_5', tom, 'lab');
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout?cs=cs_test_5', { token: maya }), env }));
ok(st === 403 && tierOf(tom) === 'free', 'someone else’s payment: refused');
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout?cs=cs_test_5', { token: tom }), env }));
ok(st === 200 && j.paid && j.step === 'lab' && tierOf(tom) === 'lab' && j.first === 4, 'back from Stripe: Stripe confirms, the LAB opens, from Level 04 (bought straight from free)');
sessions.cs_test_6 = { ...paid('cs_test_6', tom, 'hub'), payment_status: 'unpaid' };
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout?cs=cs_test_6', { token: tom }), env }));
ok(j.paid === false && tierOf(tom) === 'lab', 'back from Stripe before it is paid: waits, nothing opens');

// /mentor: the key sees the payments; the team does not.
[st, j] = await jsonOf(await mentorGet({ request: req('/api/mentor?stripe=1', { key: KEY }), env }));
ok(st === 200 && j.mode === 'test' && j.connected && j.payments.length === 3 && j.payments.some((p) => p.email === 'tom@example.com' && p.step === 'lab' && p.amount === 9700), '/mentor: test mode, webhook connected, the payments');
await mentorPost({ request: req('/api/mentor', { method: 'POST', key: KEY, body: { action: 'team-add', email: 'tom@example.com' } }), env });
[st] = await jsonOf(await mentorGet({ request: req('/api/mentor?stripe=1', { token: tom }), env }));
ok(st === 403, 'a team account cannot see the payments');

// The pages: pay first, then book.
const app = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
ok(/<a class="cta" href="\$\{esc\(payHref\(g\)\)\}">Unlock for \$\{esc\(rung\.price\)\} →<\/a>/.test(app), 'a locked level: Unlock for the price, to /pay/');
ok(/function boardroomCta\(cls\)/.test(app) && !/href="\$\{esc\(BOOKING\)\}" target="_blank" rel="noopener">Book my 1:1 with Alexandru ↗<\/a><\/li>/.test(app), 'The Boardroom: pay first while locked, book after');
const pay = readFileSync(new URL('../public/pay/pay.js', import.meta.url), 'utf8');
ok(/test \? '<p class="test"><b>Test mode\.<\/b>[^']*4242 4242 4242 4242/.test(pay), 'test mode shows the test card, and only in test mode');
ok(/if \(d && d\.paid\)/.test(pay) && !/It is open[^]*before/.test(pay), '/pay/ says “open” only when the site says Stripe confirmed it');

// What /mentor says when the key in Cloudflare is the wrong kind (never the key itself).
const K = (v) => ({ STRIPE_SECRET_KEY: v });
ok(stripeMode(K('"rk_test_abc123"')) === 'test' && stripeMode(K('Bearer rk_test_abc123')) === 'test', 'quote marks or “Bearer” around the key are forgiven');
ok(stripeMode(K('pk_test_abc123')) === '' && /publishable key/.test(keyProblem(K('pk_test_abc123'))), 'the publishable key is named as the problem');
ok(/webhook signing secret/.test(keyProblem(K('whsec_abc'))), 'a webhook secret is named as the problem');
ok(/not set/.test(keyProblem({})) && keyProblem(K('rk_test_abc')) === '', 'missing key: “not set”; a good key: no problem');
ok(!keyProblem(K('xx_secret_value_9')).includes('secret_value'), 'the message never repeats the value');

done();
