// The whole check (3 Nov 2026, evening): what it found, fixed and held.
// 1. A guest is never sent to pay again for a step their email already holds.
// 2. A first password gets "Your password is set", never "was changed".
// 3. A link-only account may choose a password ("Forgot your password?").
// 4. The Library's LAB workbook card downloads for LAB, HUB and Summit.
// 5. The workbook route finds the PDF in the bucket under any name.
// 6. The signed-out menu's Sign in / Create my free account work on the
//    toolkit pages (/tools/, /12-days/, every tool).
// No network: Stripe and Resend are faked.

import { readFileSync } from 'node:fs';
import { onRequestPost as payPost } from '../functions/api/checkout.js';
import { onRequestPost as password } from '../functions/api/password.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as login } from '../functions/api/login.js';
import { onRequestGet as workbookGet, workbookFile, WORKBOOK_KEY } from '../functions/api/workbook.js';
import { passwordSetLetter, passwordChangedLetter } from '../functions/_letters.js';
import { fakeD1, tally } from './_d1.mjs';

const { ok, done } = tally('check-fixes');
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const B = 'https://linktolead.exploraself.com';
let stripeCalls = 0, sent = [];
globalThis.fetch = async (url, opts = {}) => {
  url = String(url);
  if (url.includes('api.resend.com')) { sent.push(JSON.parse(opts.body)); return { ok: true, json: async () => ({ id: 'e' }) }; }
  if (url.includes('api.stripe.com')) {
    const path = url.replace('https://api.stripe.com/v1/', '').split('?')[0];
    const res = (data, status = 200) => ({ ok: status < 300, status, json: async () => data });
    if (path === 'webhook_endpoints' && opts.method === 'GET') return res({ data: [] });
    if (path === 'webhook_endpoints') return res({ id: 'we_1', secret: 'whsec_1' });
    if (path === 'checkout/sessions' && opts.method === 'POST') { stripeCalls++; return res({ id: `cs_test_${stripeCalls}`, url: `https://checkout.stripe.com/c/pay/cs_test_${stripeCalls}` }); }
    return res({ error: { message: 'No such session.' } }, 404);
  }
  return { ok: false, status: 503, headers: new Headers(), text: async () => 'offline' };
};
const DB = fakeD1();
// Good People Win (tests/good-people-win.test.mjs) is off here: these checks count the other letters.
const env = { DB, STRIPE_SECRET_KEY: 'rk_test_51abc', RESEND_API_KEY: 'r', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Rome', GPW_MODE: 'off' };
const req = (path, body, ip = '1.2.3.4') => new Request(B + path, { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip }, body: JSON.stringify(body) });
const jsonOf = async (r) => [r.status, await r.json()];
const person = (first, email, extra = {}) => ({ first, last: 'Lee', email, consent: true, source: 'home', type: 'full', company: 'Lee Co', interest: 'Steady clients',
  industry: 'Professional services', password: 'longenough1', confirm: 'longenough1', landing: 'north3', ...extra });

// ── 1. No second payment ─────────────────────────────────────────────────────
const [, a] = await jsonOf(await signup({ request: req('/api/signup', person('Ana', 'ana@example.com')), env }));
DB.raw.prepare("UPDATE student SET tier = 'lab' WHERE id = ?").run(a.token);
let [st, j] = await jsonOf(await payPost({ request: req('/api/checkout', { step: 'lab', first: 'Ana', email: 'ANA@example.com', consent: true }), env }));
ok(st === 409 && j.signin === true && /already yours on ana@example\.com/.test(j.error) && stripeCalls === 0, 'a guest whose email already has the LAB: no Stripe page, the sign-in instead');
[st, j] = await jsonOf(await payPost({ request: req('/api/checkout', { step: 'session', first: 'Ana', email: 'ana@example.com' }), env }));
ok(st === 409 && j.signin && stripeCalls === 0, 'a lower step than they hold: the same');
[st, j] = await jsonOf(await payPost({ request: req('/api/checkout', { step: 'hub', first: 'Ana', email: 'ana@example.com', consent: true }), env }));
ok(st === 200 && /checkout\.stripe\.com/.test(j.url) && stripeCalls === 1, 'a higher step (LAB → HUB): to Stripe as before');
[st, j] = await jsonOf(await payPost({ request: req('/api/checkout', { step: 'lab', first: 'New', email: 'new@example.com', consent: true }), env }));
ok(st === 200 && stripeCalls === 2, 'a new email: to Stripe as before');
const pay = read('public/pay/pay.js');
ok(/if \(d\.signin\)/.test(pay) && pay.includes('Sign in to my Base Camp →'), 'the pay page offers the sign-in instead of a second payment');

// ── 2 & 3. The first password ────────────────────────────────────────────────
const S = passwordSetLetter(B, { first: 'sam', to: 'sam@example.com' });
ok(S.subject === 'Your password is set' && S.text.startsWith('Hi Sam,') && !/was (just )?changed/.test(S.text), '"Your password is set": no "changed" in it');
ok(S.text.includes(`Open my Base Camp: ${B}/ground-plan/#home`) && /thank you/i.test(S.text) && /the team and I are here for you/.test(S.text), 'greets, thanks, encourages, says the team is there, and gives one place to go');
ok(!/Unshakeable|\$9\.99|P\.S\./.test(S.text) && S.receipt === true, 'a security receipt: nothing to buy, no P.S.');
ok(passwordChangedLetter(B, { first: 'Sam' }).subject === 'Your password was changed', 'a change keeps "Your password was changed"');

// A link-only account (simple form) chooses its first password.
const [, b] = await jsonOf(await signup({ request: req('/api/signup', { first: 'Bo', email: 'bo@example.com', consent: true, source: 'home', type: 'simple', landing: 'road3' }, '1.2.3.5'), env }));
ok(b.token && DB.raw.prepare('SELECT signup_type FROM student_profile WHERE student_id = ?').get(b.token).signup_type === 'simple', 'a link-only account');
sent = [];
[st, j] = await jsonOf(await password({ request: req('/api/password', { token: b.token, password: 'my-first-pass', confirm: 'my-first-pass' }, '1.2.3.6'), env }));
ok(st === 200 && j.changed === false, '"Forgot your password?" on a link-only account: the new password is kept');
ok(sent.length === 1 && sent[0].subject === 'Your password is set' && sent[0].to[0] === 'bo@example.com', '…and the letter says it is set');
[st, j] = await jsonOf(await login({ request: req('/api/login', { email: 'bo@example.com', password: 'my-first-pass' }, '1.2.3.7'), env }));
ok(st === 200 && j.token === b.token, '…and it signs in with it');
sent = [];
[st, j] = await jsonOf(await password({ request: req('/api/password', { token: b.token, password: 'my-second-pass', confirm: 'my-second-pass' }, '1.2.3.8'), env }));
ok(st === 200 && j.changed === true && sent[0].subject === 'Your password was changed', 'a second password: "was changed"');

// ── 4. The Library's workbook card ───────────────────────────────────────────
const app = read('public/app.js');
const libCard = /<div class="lib-lab">[\s\S]*?<\/div>`;/.exec(app);
ok(libCard && /hasLab[\s\S]*account\.workbookHref\(\)[\s\S]*Download your workbook[\s\S]*See the LAB ↗/.test(libCard[0]) && !libCard[0].includes('Open in the LAB'), 'Library: LAB owners download the workbook; everyone else sees the LAB');

// ── 5. The workbook in the bucket under any name ─────────────────────────────
const bucket = (keys) => ({ get: async (k) => (keys.includes(k) ? { key: k, body: 'PDF' } : null), list: async () => ({ objects: keys.map((key) => ({ key })) }) });
ok((await workbookFile(bucket([WORKBOOK_KEY])))?.key === WORKBOOK_KEY, 'the named file');
ok((await workbookFile(bucket(['Manual Personal-Leadership-LAB-Workbook.pdf'])))?.key === 'Manual Personal-Leadership-LAB-Workbook.pdf', 'the PDF as named in Drive');
ok((await workbookFile(bucket(['notes.txt']))) === null && (await workbookFile(undefined)) === null, 'no PDF, or no bucket: nothing (the "not ready yet" page)');
const r = await workbookGet({ request: new Request(`${B}/api/workbook?t=${a.token}`), env: { ...env, WORKBOOKS: bucket(['Manual Personal-Leadership-LAB-Workbook.pdf']) } });
ok(r.status === 200 && r.headers.get('content-type') === 'application/pdf' && /Personal-Leadership-LAB-Workbook\.pdf/.test(r.headers.get('content-disposition')), 'a LAB founder downloads it, under the workbook’s own name');

// ── 6. The menu on the toolkit pages ─────────────────────────────────────────
for (const p of ['public/tools/hub.js', 'public/12-days/days.js', 'public/tools/engine.js']) {
  const s = read(p);
  ok(s.includes("import { mountDoor } from '/tools/door.js';") && /\nmountDoor\(\);/.test(s), `${p}: the menu's buttons open the sign-in and the free account`);
}
const door = read('public/tools/door.js'), gate = read('public/tools/gate.js');
ok(/\[data-act="signin-menu"\]/.test(door) && /\[data-act="account"\]/.test(door) && read('public/profile-menu.js').includes('data-act="signin-menu"') && read('public/profile-menu.js').includes('data-act="account"'), 'door.js listens for the very buttons the menu draws');
ok(/needAccount: true, start/.test(door) && /start === 'signin' \? 'signin'/.test(gate), 'Sign in opens on the sign-in; Create opens the free account');
ok(door.includes('The Founder Launchpad in your Base Camp, the library and every free tool') && door.includes('/ground-plan/#home'), 'once in: what the free account opens, and the way to Base Camp');
ok(/ftb:signedin/.test(door) && /ftb:signedin/.test(read('public/12-days/days.js')), 'the menu and the 12 days page update without a reload');

done();
