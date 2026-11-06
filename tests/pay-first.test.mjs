// Pay first, then the account (Alexandru, 3 Nov 2026: "if they click Start the
// Lab, they're ready to pay … name or email, payment, boom, then account; use
// all the information they pre-fill"). A visitor who is not signed in gives a
// first name and an email, pays on Stripe, and the account is made from those
// only when Stripe says paid. The token comes back only to the payment that
// made the account, and only until a password is set. An email that already
// has an account is never signed in this way. No network: Stripe is faked.

import { readFileSync } from 'node:fs';
import { onRequestGet as payGet, onRequestPost as payPost } from '../functions/api/checkout.js';
import { onRequestPost as hook } from '../functions/api/stripe-webhook.js';
import { onRequestPost as password } from '../functions/api/password.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as complete } from '../functions/api/complete.js';
import { INTERESTS } from '../functions/_profile.js';
import { STEPS } from '../functions/_stripe.js';
import { fakeD1, tally } from './_d1.mjs';

const { ok, done } = tally('pay-first');
const B = 'https://linktolead.exploraself.com';
const calls = [], sessions = {};
let next = 1;
globalThis.fetch = async (url, opts = {}) => {
  url = String(url);
  if (url.includes('api.resend.com')) return { ok: true, json: async () => ({ id: 'e' }) };
  if (url.includes('api.stripe.com')) {
    const body = opts.body ? new URLSearchParams(opts.body) : null;
    calls.push({ url, method: opts.method, body });
    const path = url.replace('https://api.stripe.com/v1/', '').split('?')[0];
    const res = (data, status = 200) => ({ ok: status < 300, status, json: async () => data });
    if (path === 'webhook_endpoints' && opts.method === 'GET') return res({ data: [] });
    if (path === 'webhook_endpoints' && opts.method === 'POST') return res({ id: 'we_1', secret: 'whsec_1' });
    if (path === 'checkout/sessions' && opts.method === 'POST') {
      const id = `cs_test_${next++}`, md = {};
      for (const [k, v] of body) { const m = /^metadata\[(\w+)\]$/.exec(k); if (m) md[m[1]] = v; }
      sessions[id] = { id, object: 'checkout.session', payment_status: 'unpaid', amount_total: Number(body.get('line_items[0][price_data][unit_amount]')), currency: 'usd', livemode: false, client_reference_id: body.get('client_reference_id'), metadata: md };
      return res({ id, url: `https://checkout.stripe.com/c/pay/${id}` });
    }
    const m = /^checkout\/sessions\/(cs_\w+)$/.exec(path);
    if (m && sessions[m[1]]) return res(sessions[m[1]]);
    return res({ error: { message: 'No such checkout session.' } }, 404);
  }
  return { ok: false, status: 503, headers: new Headers(), text: async () => 'offline' };
};

const DB = fakeD1();
const env = { DB, STRIPE_SECRET_KEY: 'rk_test_51abc', RESEND_API_KEY: 'r', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Rome' };
const req = (path, { method = 'GET', body, token } = {}) => new Request(B + path, { method,
  headers: { 'content-type': 'application/json', ...(token ? { 'x-account-token': token } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
const jsonOf = async (r) => [r.status, await r.json()];
const count = (email) => DB.raw.prepare('SELECT COUNT(*) AS n FROM student WHERE email = ?').get(email).n;

// 1. A guest pays for the LAB from exploraself.com.
let [st, j] = await jsonOf(await payPost({ request: req('/api/checkout', { method: 'POST', body: { step: 'lab', first: 'Ana', email: 'Ana@Example.com', consent: true, landing: 'exploraself' } }), env }));
ok(st === 200 && /checkout\.stripe\.com/.test(j.url), 'not signed in: a first name and an email are enough to reach Stripe');
const made = calls.filter((c) => c.url.endsWith('/checkout/sessions')).pop().body;
ok(made.get('customer_email') === 'ana@example.com' && made.get('metadata[guest]') === '1' && made.get('metadata[first]') === 'Ana' && made.get('metadata[landing]') === 'exploraself' && !made.get('client_reference_id'), 'Stripe gets their email (filled in on its page) and the guest details ride on the session');
ok(count('ana@example.com') === 0, 'no account before the payment');
[st, j] = await jsonOf(await payPost({ request: req('/api/checkout', { method: 'POST', body: { step: 'lab', first: '', email: 'x@y.com' } }), env }));
ok(st === 400, 'no first name: asked for it');
[st, j] = await jsonOf(await payPost({ request: req('/api/checkout', { method: 'POST', body: { step: 'lab', first: 'A', email: 'nope' } }), env }));
ok(st === 400, 'a broken email: asked again');

// 2. Not paid yet: nothing is made.
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout?cs=cs_test_1'), env }));
ok(j.paid === false && count('ana@example.com') === 0, 'back before Stripe says paid: nothing is made');

// 3. Paid: the account is made, the LAB opens, the token comes back once.
sessions.cs_test_1.payment_status = 'paid';
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout?cs=cs_test_1'), env }));
ok(st === 200 && j.paid && j.fresh && j.token && j.name === 'Ana' && j.email === 'ana@example.com' && j.step === 'lab', 'paid: the account is made from what they typed, and this browser is signed in');
const row = DB.raw.prepare('SELECT id, tier FROM student WHERE email = ?').get('ana@example.com');
ok(row.tier === 'lab' && row.id === j.token && count('ana@example.com') === 1, 'one account, on the LAB step');
const prof = DB.raw.prepare('SELECT landing, consent, signup_type FROM student_profile WHERE student_id = ?').get(row.id);
ok(prof.landing === 'exploraself' && prof.consent === 1 && prof.signup_type === 'full', 'its landing is exploraself (tag linktolead-exploraself), with their yes to letters, as a full account');
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout?cs=cs_test_1'), env }));
ok(j.fresh && count('ana@example.com') === 1, 'asked again: the same account, never two');
ok(['company', 'interest', 'industry', 'password'].every((k) => j.missing.includes(k)) && !j.access, 'the full account right after payment (Alexandru, 6 Nov 2026): the page asks for all of it');

// 4. The last step: their password; after it, the payment link signs no one in.
[st, j] = await jsonOf(await password({ request: req('/api/password', { method: 'POST', body: { token: row.id, password: 'a-long-pass-1', confirm: 'a-long-pass-1' } }), env }));
ok(st === 200 && j.ok, 'the password is set with the token they were handed');
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout?cs=cs_test_1'), env }));
ok(j.paid && !j.token && j.existing, 'once the password is set, the payment link hands out no token');

// 5. An email that already has an account: the step opens on it, no token.
await signup({ request: req('/api/signup', { method: 'POST', body: { first: 'Ben', last: 'T', email: 'ben@example.com', consent: false, source: 'home', type: 'full', company: 'X', interest: 'More free time', industry: 'Other', password: 'longenough1', confirm: 'longenough1' } }), env: { DB }, waitUntil: () => {} });
await payPost({ request: req('/api/checkout', { method: 'POST', body: { step: 'hub', first: 'Someone', email: 'ben@example.com' } }), env });
sessions.cs_test_2.payment_status = 'paid';
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout?cs=cs_test_2'), env }));
ok(j.paid && j.existing && !j.token && count('ben@example.com') === 1, 'an existing account: never signed in by paying with its email');
ok(DB.raw.prepare('SELECT tier FROM student WHERE email = ?').get('ben@example.com').tier === 'hub', 'the HUB opens on that account; they sign in as usual');

// 6. The webhook can be first: it makes the account, the return still signs in.
await payPost({ request: req('/api/checkout', { method: 'POST', body: { step: 'session', first: 'Cleo', email: 'cleo@example.com' } }), env });
sessions.cs_test_3.payment_status = 'paid';
const { applyPaid } = await import('../functions/_stripe.js');
await applyPaid(env, DB, B, sessions.cs_test_3);
ok(count('cleo@example.com') === 1 && DB.raw.prepare('SELECT tier FROM student WHERE email = ?').get('cleo@example.com').tier === 'session', 'the webhook first: the account is made and The Boardroom opens');
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout?cs=cs_test_3'), env }));
ok(j.fresh && j.token && count('cleo@example.com') === 1, 'then the return from Stripe signs them in, one account');
ok(!(await applyPaid(env, DB, B, { ...sessions.cs_test_3, id: 'cs_test_9', amount_total: 100 })).ok, 'a wrong amount: nothing opens');

// 7. Signed in: what is still missing is asked on /pay/ after paying. A reload of the page
//    after the account was made here (this browser now signed in) still finds the payment.
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout?cs=cs_test_1', { token: row.id }), env }));
ok(j.paid && JSON.stringify(j.missing) === JSON.stringify(['company', 'interest', 'industry']) && j.email === 'ana@example.com' && j.name === 'Ana', 'signed in, the payment that made the account: only what is still missing (Ana has a password)');
await payPost({ request: req('/api/checkout', { method: 'POST', token: row.id, body: { step: 'hub' } }), env });
const hsid = `cs_test_${next - 1}`;
sessions[hsid].payment_status = 'paid';
[st, j] = await jsonOf(await payGet({ request: req(`/api/checkout?cs=${hsid}`, { token: row.id }), env }));
ok(j.paid && j.missing.length === 3 && !j.access && DB.raw.prepare('SELECT tier FROM student WHERE id = ?').get(row.id).tier === 'hub', 'signed in, paying for the HUB: it opens, and the same three are asked');
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout?cs=cs_test_2', { token: row.id }), env }));
ok(st === 403, 'another person’s payment (Ben’s): never shown to Ana');

// 8. The Unshakeable Assessment from exploraself.com (Alexandru, 6 Nov 2026: "first name and
//    email or Google, then payment, then full account, then immediate access").
[st, j] = await jsonOf(await payPost({ request: req('/api/checkout', { method: 'POST', body: { step: 'unshakeable', first: 'Dana', email: 'dana@example.com', consent: true, landing: 'exploraself' } }), env }));
const un = calls.filter((c) => c.url.endsWith('/checkout/sessions')).pop().body;
const usid = `cs_test_${next - 1}`;
ok(st === 200 && un.get('success_url') === `${B}/pay/?step=unshakeable&cs={CHECKOUT_SESSION_ID}` && un.get('metadata[guest]') === '1', 'Unshakeable: Stripe brings the buyer back to /pay/, not straight to exploraself.com');
sessions[usid].payment_status = 'paid';
sessions[usid].amount_total = 999;
[st, j] = await jsonOf(await payGet({ request: req(`/api/checkout?cs=${usid}`), env }));
const dana = j.token;
ok(j.paid && j.fresh && dana && j.access === `https://exploraself.com/unshakeable?access=${usid}` && j.missing.length === 4, 'paid: the account is made, with the access link and the full account still to fill');
[st, j] = await jsonOf(await complete({ request: req('/api/complete', { method: 'POST', body: { token: dana, full: true, noCompany: true, interest: INTERESTS[0], industry: 'Other', password: 'short-1' } }), env, waitUntil: () => {} }));
ok(st === 400 && /10 characters/.test(j.error), 'a short password: asked again, nothing saved');
[st, j] = await jsonOf(await complete({ request: req('/api/complete', { method: 'POST', body: { token: dana, full: true, noCompany: true, interest: INTERESTS[0], industry: 'Other', password: 'a-long-pass-2', confirm: 'a-long-pass-2' } }), env, waitUntil: () => {} }));
ok(st === 200 && j.ok && j.complete, 'the full account is saved in one go');
const dp = DB.raw.prepare('SELECT company, interest, industry, signup_type FROM student_profile WHERE student_id = ?').get(dana);
ok(dp.company === '' && dp.interest === INTERESTS[0] && dp.industry === 'Other' && dp.signup_type === 'full' && DB.raw.prepare('SELECT tier FROM student WHERE id = ?').get(dana).tier === 'free', 'company ("No company yet"), interest and industry are kept; a product never changes the step');
[st, j] = await jsonOf(await payGet({ request: req(`/api/checkout?cs=${usid}`), env }));
ok(j.paid && j.existing && !j.token && j.access === `https://exploraself.com/unshakeable?access=${usid}`, 'after it, the payment link signs no one in, but still opens the audit');

// 9. An email that already had a short account (name and email only) pays while signed out
//    (main chat's review, 6 Nov 2026): no token, the answer says the account is not full;
//    signed in, the same payment link asks for what it lacks, then the audit opens.
const [, sia] = await jsonOf(await signup({ request: req('/api/signup', { method: 'POST', body: { first: 'Sia', email: 'sia@example.com', consent: true, source: 'home', type: 'simple', landing: 'road3' } }), env: { DB }, waitUntil: () => {} }));
await payPost({ request: req('/api/checkout', { method: 'POST', body: { step: 'unshakeable', first: 'Sia', email: 'sia@example.com', consent: true, landing: 'exploraself' } }), env });
const ssid = `cs_test_${next - 1}`;
Object.assign(sessions[ssid], { payment_status: 'paid', amount_total: 999 });
[st, j] = await jsonOf(await payGet({ request: req(`/api/checkout?cs=${ssid}`), env }));
ok(j.paid && j.existing && !j.token && j.full === false && j.access === `https://exploraself.com/unshakeable?access=${ssid}` && count('sia@example.com') === 1, 'a short account that paid while signed out: no token, "not full yet", and the audit link');
[st, j] = await jsonOf(await payGet({ request: req(`/api/checkout?cs=${ssid}`, { token: sia.token }), env }));
ok(j.paid && ['company', 'interest', 'industry', 'password'].every((k) => j.missing.includes(k)) && j.access, 'signed in, back on the same payment: what the account lacks, then the audit');
[st, j] = await jsonOf(await complete({ request: req('/api/complete', { method: 'POST', body: { token: sia.token, full: true, company: 'Sia Studio', interest: INTERESTS[1], industry: 'Other', password: 'a-long-pass-3', confirm: 'a-long-pass-3' } }), env, waitUntil: () => {} }));
[st, j] = await jsonOf(await payGet({ request: req(`/api/checkout?cs=${ssid}`), env }));
ok(j.existing && j.full === true, 'finished: the same link now says the account is full');
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout?cs=cs_test_2'), env }));
ok(j.existing && j.full === true, 'an email whose account was already full (Ben): no extra step');

// The page.
const pay = readFileSync(new URL('../public/pay/pay.js', import.meta.url), 'utf8');
ok(/const signinBack = `\/ground-plan\/\?next=\$\{encodeURIComponent\(back\)\}#signin`;/.test(pay) && (pay.match(/href="\$\{signinBack\}"/g) || []).length === 3 && !pay.includes("encodeURIComponent('/ground-plan/#programme-' + (d.first || 4))"), '/pay/: every sign-in after paying comes back to this payment, for the full account');
ok(pay.includes('Sign in to finish your account') && /if \(d\.full === false\)/.test(pay), '/pay/: a short account is sent to sign in and finish it');
const appJs = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const rbx = readFileSync(new URL('../public/reset-box.js', import.meta.url), 'utf8');
ok(/const paidShort = \(\) => lacksFull\(\) && \(owned\.length > 0 \|\| \(state\.tier \|\| 'free'\) !== 'free'\);/.test(appJs) && /else askPaid\(\);/.test(appJs) && /askAccount\(\(\) => render\(\), 'paid'\)/.test(appJs), 'Base Camp: a paid account that is still short is asked once on arrival (the emailed sign-in link lands here)');
ok(/paid: \['Your Base Camp', 'One step to finish your account'/.test(rbx) && !/paid: \[[^\]]*\bFree\b/.test(rbx) && /L\[4\] \|\| 'Free\. Your name and email are already in\.'/.test(rbx), 'the box for a paid account never says "Free"');
const n1 = readFileSync(new URL('../public/north1/north1.js', import.meta.url), 'utf8');
ok(/if \(signedIn && top\) top\.textContent = 'Back to my North Star →';/.test(n1), 'north1: a signed-in founder sees "Back to my North Star →" (same link)');
ok(/detailFields\('f', 'display:grid;gap:6px', need\)/.test(pay) && pay.includes("fetch('/api/complete'") && /token: d\.token \|\| token\(\), full: true/.test(pay), '/pay/ after paying: the full account form, saved through /api/complete');
ok(!pay.includes('Later: open Level') && !pay.includes("fetch('/api/password'"), '/pay/: no way past the full account, and no password-only step any more');
ok(/<label for="f-pw">Password<\/label>\$\{pwBox\('f-pw'\)\}/.test(pay) && /<label for="f-pw2">Confirm password<\/label>\$\{pwBox\('f-pw2'\)\}/.test(pay) && /data-eye="\$\{id\}"/.test(pay) && /data-copy="\$\{id\}"/.test(pay) && pay.includes('At least 10 characters. You sign in with your email and this password.') && !pay.includes('Copy it into the second box'),
  '/pay/: the password boxes look like every other full account form (Alexandru, 6 Nov 2026): Password and Confirm password, each with its eye and copy beside it');
const box = readFileSync(new URL('../public/account-box.js', import.meta.url), 'utf8');
const svgOf = (src, name) => (new RegExp(`const ${name} = '([^']+)'`).exec(src) || [])[1];
ok(svgOf(pay, 'PW_EYE') === svgOf(box, 'EYE') && svgOf(pay, 'PW_COPY') === svgOf(box, 'COPY'), '/pay/: the same eye and copy icons as the account box');
ok(pay.includes("unshakeable: 'Open my Unshakeable Audit'") && /href: d\.access/.test(pay), '/pay/: the button opens the audit for the Unshakeable Assessment');
ok(/if \(d && d\.paid\) return finishAccount\(d, steps\[d\.step\] \|\| \{\}\);/.test(pay) && /if \(!need\.length\) return paidDone\(d, S\);/.test(pay), '/pay/: a signed-in founder is asked only what is missing; nothing missing goes straight to the way in');
ok(/function fromWindow\(\)/.test(pay) && /location\.hash/.test(pay) && /history\.replaceState\(null, '', location\.pathname \+ location\.search\)/.test(pay) && /\$\('#go'\)\.click\(\)/.test(pay), '/pay/: exploraself.com\'s window fills the form through the #part, which is cleared, and goes on to Stripe');
ok(/q\.get\('open'\) && S\.product/.test(pay) && pay.includes('#signin`); return; }') && /location\.replace\(info\.owned\[step\]\)/.test(pay), '/pay/?open=1: sign in first, then what this account bought opens');
ok(pay.includes('guestForm(') && pay.includes('finishAccount(') && !/return makeAccount\(S\)/.test(pay), '/pay/: not signed in shows name and email, then Stripe; the password comes after');
ok(STEPS.lab.amount === 9700, 'the LAB is $97');
done();
