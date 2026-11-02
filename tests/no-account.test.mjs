// No account for this email (Alexandru, 2 Nov 2026): the sign-in screens say
// so at once, with "Make my free account"; a link asked for an address with no
// account still sends an email, with the same button; the pay page makes the
// account in place and comes back to pay. Run: node tests/no-account.test.mjs

import fs from 'node:fs';
import { onRequestPost as login } from '../functions/api/login.js';
import { onRequestPost as askLink } from '../functions/api/signin.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { safeNext, joinUrl } from '../functions/_shared.js';
import { noAccountLetter, OFFERS } from '../functions/_letters.js';
import * as client from '../public/account.js';
import { fakeD1, fakeResend, post, tally } from './_d1.mjs';

const { ok, done } = tally('no-account');
const DB = fakeD1();
const env = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome' };
let sent = fakeResend();
const J = async (r) => [r.status, await r.json()];

await signup({ request: post('/api/signup', { first: 'Ana', last: 'Pop', email: 'ana@example.com', consent: true, source: 'home', password: 'correct horse 1', confirm: 'correct horse 1' }), env });

// ── Password sign-in ────────────────────────────────────────────────────────
let [st, j] = await J(await login({ request: post('/api/login', { email: 'New@Example.com', password: 'anything at all' }, '2.2.2.2'), env }));
ok(st === 404 && j.noAccount === true && j.error === 'There’s no account for new@example.com yet.' && !j.token, 'login: no account is said plainly');
[st, j] = await J(await login({ request: post('/api/login', { email: 'ana@example.com', password: 'wrong password!' }, '2.2.2.3'), env }));
ok(st === 401 && !j.noAccount && /do not match/.test(j.error), 'login: a wrong password is still “do not match”');

// ── Asking for a link ───────────────────────────────────────────────────────
sent = fakeResend();
[st, j] = await J(await askLink({ request: post('/api/signin', { email: 'new@example.com', next: '/pay/?step=session' }, '3.3.3.1'), env }));
ok(st === 200 && j.noAccount === true && j.message === 'There’s no account for new@example.com yet. We’ve emailed you a link to make one.', 'link: the page is told there is no account');
ok(sent.length === 1 && sent[0].body.to[0] === 'new@example.com' && sent[0].body.subject === 'There’s no ExploraSelf account here yet', 'link: the address still gets an email');
const m = sent[0].body;
ok(m.text.includes('Make my free account →: https://linktolead.exploraself.com/road1/?email=new%40example.com&next=%2Fpay%2F%3Fstep%3Dsession#join'), 'the button opens the free account form with the email in it, and comes back to the pay page');
ok(/^Hi,/.test(m.text) && m.text.includes('Thank you for coming back') && m.text.includes('first three levels open straight away') && m.text.includes('The team and I are here for you'), 'the letter greets, thanks, encourages and says we are here');
ok(m.text.includes('If it was not you, ignore this email; nothing changes.'), 'the footer says what to do if it was not them');
const paid = Object.values(OFFERS).filter((o) => o.paid).map((o) => o.line('https://x').join('')).map((s) => s.slice(0, 40));
ok(!/P\.S\./.test(m.text) && !paid.some((p) => m.text.includes(p)) && !/\$\d/.test(m.text), 'a security letter: no P.S., no paid offer, no price');
sent = fakeResend();
await askLink({ request: post('/api/signin', { email: 'other@example.com', next: 'https://evil.example/' }, '3.3.3.2'), env });
ok(sent.length === 1 && !sent[0].body.text.includes('evil') && sent[0].body.text.includes('/road1/?email=other%40example.com#join'), 'a `next` on another site is dropped');
sent = fakeResend();
await askLink({ request: post('/api/signin', { email: 'new@example.com', reset: true }, '3.3.3.3'), env });
ok(sent[0].body.text.includes('asked for a password reset link'), '“Forgot your password?” letter says a reset link was asked for');
sent = fakeResend();
[st, j] = await J(await askLink({ request: post('/api/signin', { email: 'ana@example.com' }, '3.3.3.4'), env }));
ok(st === 200 && !j.noAccount && sent.length === 1 && /Your link to get back in/.test(sent[0].body.subject), 'a real account still gets its sign-in link');
for (let k = 0; k < 3; k++) await askLink({ request: post('/api/signin', { email: 'spam@example.com' }, '4.4.4.' + k), env });
[st] = await J(await askLink({ request: post('/api/signin', { email: 'spam@example.com' }, '4.4.4.9'), env }));
ok(st === 429, 'no-account letters share the email limit (3 an hour per address)');

// ── Same-site only ──────────────────────────────────────────────────────────
for (const [inp, out] of [['/pay/?step=session', '/pay/?step=session'], ['//evil.com', ''], ['/\\evil', ''], ['https://x.com', ''], ['/a b', ''], ['', '']]) {
  ok(safeNext(inp) === out && client.safeNext(inp) === out, `next ${JSON.stringify(inp)} → ${JSON.stringify(out)} (server and browser agree)`);
}
ok(joinUrl('https://l.x', 'a+b@x.com', '//evil') === 'https://l.x/road1/?email=a%2Bb%40x.com#join', 'joinUrl drops a next on another site');
ok(client.joinHref('a@x.com', '/pay/?step=lab') === '/road1/?email=a%40x.com&next=%2Fpay%2F%3Fstep%3Dlab#join', 'joinHref on the page matches the email');

// ── The pages ───────────────────────────────────────────────────────────────
const src = (f) => fs.readFileSync(f, 'utf8');
const pay = src('public/pay/pay.js');
ok(/function makeAccount\(S\)/.test(pay) && /import\('\/account-box\.js'\)\.then\(\(m\) => m\.open\(\{[^}]*landing, next: back/.test(pay), '/pay/: not signed in, the free account is made on the page (the /road1/ form), then back to pay');
ok(/const FROM = \{ summit: 'summit', road5: 'road5' \};\nconst landing = FROM\[q\.get\('from'\)\] \|\| 'road1';/.test(pay), '/pay/: landing road1, or summit / road5 when that page sent them (its Mailchimp tag)');
ok(pay.includes("label: 'CONTINUE TO PAYMENT →'") && pay.includes('Already have an account? Sign in') && pay.includes('/ground-plan/?next=${encodeURIComponent(back)}#signin'), '/pay/: “Continue to payment”, and sign-in comes back here too');
ok(!pay.includes('href="/road1/">No account yet'), '/pay/ no longer sends founders away to /road1/');
const road = src('public/road1/page.js');
ok(/email: arrive\.email, next: arrive\.next/.test(road) && /next: safeNext\(q\.get\('next'\)\)/.test(road), '/road1/?email=…&next=…#join fills in the email and goes back to next');
const box = src('public/account-box.js');
ok(/if \(email\) \$\('#j-email'\)\.value = email;/.test(box), 'the account box fills in the email it was given');
ok(box.includes('const signinHref = () => `/ground-plan/${ctx.next ?'), 'the box’s “Sign in” keeps the page to come back to');
const reset = src('public/reset-box.js');
ok(/if \(r && r\.noAccount\) none\(to, A\.joinHref\(to\)\)/.test(reset) && reset.includes('Make my free account →') && !reset.includes('If there is an account for'), 'the link box says “no account yet” with the button');
const app = src('public/app.js');
ok(/ex\.data && ex\.data\.noAccount\) return noAccountHere\(email, ex\.message\)/.test(app) && app.includes('Make my free account →'), 'Base Camp sign-in: no account, the button right there');
ok(/const nx = nextAfterSignin\(\);\s+if \(nx\) \{ location\.href = nx; return; \}/.test(app), 'Base Camp sign-in: ?next= goes back (the pay page)');
const ns = src('public/northstar/app.js');
ok(/e\.data && e\.data\.noAccount\) UI\.signinNew = email/.test(ns) && ns.includes("A.joinHref(UI.signinNew, '/northstar/')"), 'North Star sign-in: no account, the button right there');
ok(src('public/account.js').includes('e.data = data;'), 'the page can read noAccount from an error reply');

// ── The letter on its own ───────────────────────────────────────────────────
const L = noAccountLetter('https://l.x', 'https://l.x/road1/?email=a%40x.com#join', { to: 'a@x.com' });
ok(L.subject === 'There’s no ExploraSelf account here yet' && L.html.includes('Make my free account') && L.html.includes('/mail/alexandru.jpg') && !L.html.includes('/mail/signature.png') && L.receipt === true, 'the letter: subject, button, signed in words with the photo (a receipt)');

done();
