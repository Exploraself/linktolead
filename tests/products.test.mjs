// One-off products from exploraself.com (Alexandru, 3 Nov 2026: "everything
// to Stripe from exploraself, unless they go to Amazon or Etsy"). Today: the
// Unshakeable Assessment, $9.99. It is paid on Stripe through /pay/, the buyer
// goes back to exploraself.com with ?access=<session>, exploraself.com asks
// /api/access, and the letter carries the same link. A product never changes a
// founder's step. No network: Stripe and Resend are faked.

import { readFileSync } from 'node:fs';
import { PRODUCTS, applyPaid, accessUrl } from '../functions/_stripe.js';
import { onRequestGet as payGet, onRequestPost as payPost } from '../functions/api/checkout.js';
import { onRequestGet as access } from '../functions/api/access.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { productLetter } from '../functions/_letters.js';
import { LANDING_TAGS } from '../functions/_mailchimp.js';
import { TAG_LIST } from '../functions/_tag-list.js';
import { ROUTES } from '../worker.js';
import { fakeD1, tally } from './_d1.mjs';

const { ok, done } = tally('products');
const B = 'https://linktolead.exploraself.com';
const read = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

ok(PRODUCTS.unshakeable.amount === 999 && PRODUCTS.unshakeable.back === 'https://exploraself.com/unshakeable', 'the Unshakeable Assessment: $9.99, sold from exploraself.com/unshakeable');
ok(accessUrl(PRODUCTS.unshakeable, 'cs_test_9') === 'https://exploraself.com/unshakeable?access=cs_test_9', 'the access link: the page, with the Stripe session');
ok(LANDING_TAGS.exploraself === 'linktolead-exploraself' && TAG_LIST.some((t) => t.name === 'linktolead-exploraself' && /exploraself\.com/.test(t.what)), 'the tag linktolead-exploraself, in the tag list (rule 17)');
ok(read('public/pay/pay.js').includes("exploraself: 'exploraself'") && read('public/pay/pay.js').includes('productCard('), '/pay/: from=exploraself keeps its landing, and a product gets its own card');
ok(ROUTES['/api/access'], 'the Worker routes /api/access');

const L = productLetter(B, { first: 'maya', product: 'unshakeable', url: 'https://exploraself.com/unshakeable?access=cs_test_9', to: 'm@x.com' });
ok(L.subject === 'It’s yours: The Unshakeable Assessment' && /^Hi Maya,/.test(L.text) && L.html.includes('https://exploraself.com/unshakeable?access=cs_test_9') && /any phone or computer/.test(L.text) && L.receipt === true, 'the letter: thanks, the access link as its button, a receipt');

// Fake Stripe and Resend.
const calls = [], sent = [], sessions = {};
globalThis.fetch = async (url, opts = {}) => {
  url = String(url);
  if (url.includes('api.resend.com')) { sent.push(JSON.parse(opts.body)); return { ok: true, json: async () => ({ id: 'e' }) }; }
  if (url.includes('api.stripe.com')) {
    calls.push({ url, method: opts.method, body: opts.body ? new URLSearchParams(opts.body) : null });
    const path = url.replace('https://api.stripe.com/v1/', '').split('?')[0];
    const res = (data, status = 200) => ({ ok: status < 300, status, json: async () => data });
    if (path === 'webhook_endpoints' && opts.method === 'GET') return res({ data: [] });
    if (path === 'webhook_endpoints' && opts.method === 'POST') return res({ id: 'we_1', secret: 'whsec_1' });
    if (path === 'checkout/sessions' && opts.method === 'POST') return res({ id: 'cs_test_1', url: 'https://checkout.stripe.com/c/pay/cs_test_1' });
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
const [, made] = await jsonOf(await signup({ request: req('/api/signup', { method: 'POST', body: { first: 'Maya', last: 'T', email: 'maya@example.com', consent: false, source: 'home', type: 'full', company: 'X', interest: 'More free time', industry: 'Other', password: 'longenough1', confirm: 'longenough1', landing: 'exploraself' } }), env: { DB }, waitUntil: () => {} }));
const maya = made.token;
const id = DB.raw.prepare("SELECT id FROM student WHERE email = 'maya@example.com'").get().id;
ok(DB.raw.prepare('SELECT landing FROM student_profile WHERE student_id = ?').get(id).landing === 'exploraself', 'an account made from an exploraself.com button keeps the landing exploraself');
const tierOf = () => DB.raw.prepare('SELECT tier FROM student WHERE id = ?').get(id).tier || 'free';

let [st, j] = await jsonOf(await payGet({ request: req('/api/checkout', { token: maya }), env }));
ok(j.steps.unshakeable && j.steps.unshakeable.product === true && j.steps.unshakeable.price === '$9.99', '/pay/ knows the product and its price');
[st, j] = await jsonOf(await payPost({ request: req('/api/checkout', { method: 'POST', token: maya, body: { step: 'unshakeable' } }), env }));
const body = calls.find((c) => c.url.endsWith('/checkout/sessions') && c.method === 'POST').body;
ok(st === 200 && j.url && body.get('line_items[0][price_data][unit_amount]') === '999' && body.get('metadata[step]') === 'unshakeable' && body.get('success_url') === `${B}/pay/?step=unshakeable&cs={CHECKOUT_SESSION_ID}`, 'a Stripe page for $9.99, back to /pay/ for the full account (Alexandru, 6 Nov 2026), then the audit');
ok(body.get('invoice_creation[enabled]') === 'true', 'an invoice, as for every payment');

const paid = (sid, extra = {}) => ({ id: sid, object: 'checkout.session', payment_status: 'paid', amount_total: 999, currency: 'usd', livemode: false, client_reference_id: id, metadata: { student: id, step: 'unshakeable' }, ...extra });
sessions.cs_test_1 = paid('cs_test_1', { payment_status: 'unpaid' });
[st, j] = await jsonOf(await access({ request: req('/api/access?session=cs_test_1'), env }));
ok(st === 200 && j.paid === false && !sent.length, 'not paid yet: no access, no letter');
sessions.cs_test_1 = paid('cs_test_1');
[st, j] = await jsonOf(await access({ request: req('/api/access?session=cs_test_1'), env }));
ok(st === 200 && j.paid === true && j.product === 'unshakeable' && !('email' in j), 'paid: access, and nothing personal in the answer');
ok(tierOf() === 'free', 'the founder’s step does not change');
const letters = () => sent.filter((m) => /It’s yours/.test(m.subject));
ok(letters().length === 1 && letters()[0].html.includes('access=cs_test_1'), 'the letter goes once, with the access link');
await access({ request: req('/api/access?session=cs_test_1'), env });
ok(letters().length === 1 && DB.raw.prepare("SELECT COUNT(*) AS n FROM payment WHERE step = 'unshakeable'").get().n === 1, 'asked again: recorded once, one letter');
// Back on /pay/ from Stripe, signed in with a full account: nothing to ask, the audit opens.
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout?cs=cs_test_1', { token: maya }), env }));
ok(st === 200 && j.paid && j.access === 'https://exploraself.com/unshakeable?access=cs_test_1' && Array.isArray(j.missing) && !j.missing.length, '/pay/ back from Stripe: the access link, and a full account has nothing missing');
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout', { token: maya }), env }));
ok(j.owned && j.owned.unshakeable === 'https://exploraself.com/unshakeable?access=cs_test_1', '"Already bought? Sign in": signed in, /pay/ knows the link to open');
[st, j] = await jsonOf(await payGet({ request: req('/api/checkout'), env }));
ok(j.owned && !Object.keys(j.owned).length && !j.email, 'not signed in: nothing owned, nothing personal');
const { onRequestGet: stateGet } = await import('../functions/api/state.js');
[st, j] = await jsonOf(await stateGet({ request: req(`/api/state?t=${maya}`), env }));
ok(st === 200 && j.me.products.length === 1 && j.me.products[0].step === 'unshakeable' && j.me.products[0].access === 'https://exploraself.com/unshakeable?access=cs_test_1', 'Base Camp knows what they bought, with the link that opens it');
// Never bought twice (main chat's review, 6 Nov 2026).
const stripeCalls = () => calls.filter((c) => c.url.endsWith('/checkout/sessions') && c.method === 'POST').length;
let before = stripeCalls();
[st, j] = await jsonOf(await payPost({ request: req('/api/checkout', { method: 'POST', token: maya, body: { step: 'unshakeable' } }), env }));
ok(st === 409 && j.owned === 'https://exploraself.com/unshakeable?access=cs_test_1' && stripeCalls() === before, 'signed in and already bought: no second Stripe page, the link to open it instead');
[st, j] = await jsonOf(await payPost({ request: req('/api/checkout', { method: 'POST', body: { step: 'unshakeable', first: 'Maya', email: 'Maya@Example.com' } }), env }));
ok(st === 409 && j.signin === true && /already yours on maya@example\.com/.test(j.error) && stripeCalls() === before, 'signed out, with an email that already bought it: sign in and open it, no second payment');
const payJs = read('public/pay/pay.js');
ok(/if \(!guest && S\.product && info\.owned && info\.owned\[step\]\)/.test(payJs) && payJs.includes('Nothing to pay. You bought it with this account'), '/pay/: signed in and already bought, "Already yours" with its link instead of the Stripe button');
ok(/const nx = S\.product \? `\/pay\/\?step=\$\{step\}&open=1`/.test(payJs) && /if \(d\.owned\) \{ location\.href = d\.owned; return; \}/.test(payJs), '/pay/: the sign-in for an email that already bought it comes back to open it');
const app = read('public/app.js');
ok(/function productsHTML\(\)/.test(app) && app.includes("title: 'Unshakeable · open'") && app.includes("go: 'Open my Unshakeable Audit'") && /\$\{productsHTML\(\)\}/.test(app), 'Base Camp: the tile “Unshakeable · open”, for the buyer to get back in');
ok(app.includes("sell: { title: 'Unshakeable · $9.99'") && app.includes("go: 'Get my Unshakeable Audit', href: 'https://exploraself.com/unshakeable'") && /const sell = pulled \? /.test(app) && /!mine\.some\(\(p\) => p\.step === k\)/.test(app), 'Base Camp: not bought yet, the tile offers it ($9.99, to exploraself.com/unshakeable), only once the account has loaded');
ok(!/sell: \{[^}]*\bfree\b/i.test(app), 'the Unshakeable tile never says free');
ok(/owned = Array\.isArray\(r\.me\.products\) \? r\.me\.products : \[\];/.test(app) && /const mine = owned\.filter\(/.test(app), 'Base Camp keeps the links in memory only, never in the browser’s storage');
ok(/\^https:\\\/\\\/exploraself\\\.com\\\//.test(app), 'the tile only ever links to exploraself.com');

sessions.cs_test_2 = { ...paid('cs_test_2'), metadata: { student: id, step: 'hub' }, amount_total: 75000 };
[st] = await jsonOf(await access({ request: req('/api/access?session=cs_test_2'), env }));
ok(st === 404 && tierOf() === 'free', 'a ladder payment is never answered here');
[st] = await jsonOf(await access({ request: req('/api/access?session=nonsense'), env }));
ok(st === 400, 'a broken link: refused');
[st] = await jsonOf(await access({ request: req('/api/access?session=cs_test_none'), env }));
ok(st === 404, 'an unknown session: no such payment');
ok(!(await applyPaid(env, DB, B, paid('cs_test_3', { amount_total: 100 }))).ok, 'a wrong amount: no access');

done();
