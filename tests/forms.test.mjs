// Three sales pages, one account, all ending at /start: A (/a, the 12 Scrolls
// page) with the SIMPLE form, B (/, the long page, with the What-if Lab;
// /b → /) and C (/c → the Compass sales page) with the FULL form. The forms (POST /api/signup): no
// password on simple, ever; a password required on full; the landing and the
// utm_* tags stored; the Mailchimp tags in TEST mode; /mentor's view; /b, /c,
// the 404 page; and on the Compass sales page the "Your plan, live" badge, the
// lever-1 figure and the live lab. No network: Mailchimp is in TEST mode and
// Resend is faked.

import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as password } from '../functions/api/password.js';
import { onRequestGet as stateGet } from '../functions/api/state.js';
import { onRequestPost as login } from '../functions/api/login.js';
import { onRequestGet as mGet } from '../functions/api/mentor.js';
import { onRequest as pagesB } from '../functions/b.js';
import { onRequest as pagesC } from '../functions/c.js';
import worker from '../worker.js';
import { INTERESTS, INDUSTRIES, details, utmFrom } from '../functions/_profile.js';
import * as F from '../public/forms.js';
import { summary, filter, byLanding } from '../public/mentor/dash.js';
import { levelsHTML, band } from '../public/a/page.js';
import { weekTitle } from '../public/content.js';
import { baseFrom } from '../public/compass/welcome/lab.js';
import { baseOf, EXAMPLE, num } from '../public/lab.js';
import { tagsFor, LANDING_TAGS } from '../functions/_mailchimp.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const require = createRequire(import.meta.url);
const E = require('../public/compass/engine.js');
const SalesMath = require('../public/compass/welcome/sales.js');
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const { ok, done } = tally('forms');

// ── The lists ───────────────────────────────────────────────────────────────
ok(JSON.stringify(F.INTERESTS) === JSON.stringify(INTERESTS) && JSON.stringify(F.INDUSTRIES) === JSON.stringify(INDUSTRIES) && JSON.stringify(F.UTM_KEYS) === JSON.stringify(Object.keys(utmFrom({}))), 'the forms and the server offer the same lists');
ok(JSON.stringify(INTERESTS) === JSON.stringify(E.GOALS.map((g) => g[1])), 'interests are the Compass goals: More free time … A new market');
const compassList = /const INDUSTRIES = (\[[^\]]+\]);/.exec(read('public/compass/app.js'))[1];
ok(JSON.stringify(INDUSTRIES) === JSON.stringify(JSON.parse(compassList.replace(/'/g, '"'))), 'industries are the Compass box’s own list');
ok(details({}).problem === 'Your company’s name, or tick “No company yet”.' && details({ noCompany: true }).problem === 'Choose what you want most from the business.'
  && details({ company: 'Acme', interest: 'Higher income' }).problem === 'Choose your industry.' && details({ company: 'Acme', interest: 'Higher income', industry: 'Other' }).problem === '', 'full details: company or none, interest, industry, in that order');
ok(details({ noCompany: true, interest: 'Higher income', industry: 'Other' }).company === '' && details({}).company === null, '"No company yet" is kept as an empty company; never asked is null');
ok(JSON.stringify(utmFrom({ utm_source: 'meta', utm_content: 'ad-7', evil: 'x' })) === JSON.stringify({ utm_source: 'meta', utm_medium: null, utm_campaign: null, utm_content: 'ad-7', utm_term: null }), 'utm tags: the five known ones, nothing else');

// ── The forms ───────────────────────────────────────────────────────────────
const env = { DB: fakeD1(), RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MENTOR_KEY: 'mentor-key-123', MAILCHIMP_MODE: 'test', MAILCHIMP_API_KEY: 'k-us19' };
fakeResend();
const S = async (body) => { const r = await signup({ request: post('/api/signup', body), env }); return [r.status, await r.json()]; };
const prof = (id) => env.DB.raw.prepare('SELECT signup_type, company, interest, industry, landing, utm_source, utm_content FROM student_profile WHERE student_id = ?').get(id);
const hasPw = (id) => !!env.DB.raw.prepare('SELECT pass_hash FROM account_auth WHERE student_id = ? AND pass_hash IS NOT NULL').get(id);
const mcLog = (id) => env.DB.raw.prepare('SELECT detail FROM mailchimp_log WHERE student_id = ? ORDER BY id').all(id).map((r) => r.detail).join(' ');
const FULL = { first: 'Fay', last: 'Full', email: 'fay@example.com', consent: true, source: 'sales-page', type: 'full', landing: 'c', company: 'Fay & Co', interest: 'Higher income', industry: 'Real estate', utm: { utm_source: 'meta', utm_content: 'home-c' } };

let [st, out] = await S({ ...FULL, company: '', password: 'a-long-password', confirm: 'a-long-password' });
ok(st === 400 && /company/.test(out.error), 'full form: no company and no tick is refused');
[st, out] = await S(FULL);
ok(st === 400 && /10 characters/.test(out.error), 'full form: a password is required');
[st, out] = await S({ ...FULL, password: 'a-long-password', confirm: 'another-one-here' });
ok(st === 400 && /different/.test(out.error), 'full form: the two passwords must match');
ok(env.DB.raw.prepare("SELECT COUNT(*) n FROM student WHERE email = 'fay@example.com'").get().n === 0, 'a refused full form makes nothing');
[st, out] = await S({ ...FULL, password: 'a-long-password', confirm: 'a-long-password' });
const fay = out.token;
ok(st === 200 && fay && hasPw(fay), 'full form: one record, signed in, with its password');
ok(JSON.stringify(prof(fay)) === JSON.stringify({ signup_type: 'full', company: 'Fay & Co', interest: 'Higher income', industry: 'Real estate', landing: 'c', utm_source: 'meta', utm_content: 'home-c' }), 'full form: company, interest, industry, landing C and the utm tags stored');
ok(/"Signup - Full".*"Landing - Compass welcome".*"Interest - Higher income".*"Industry - Real estate"/.test(mcLog(fay)) && /"COMPANY":"Fay & Co"/.test(mcLog(fay)), 'Mailchimp (TEST): "Signup - Full", "Landing - Compass welcome", interest and industry tags, COMPANY');

[st, out] = await S({ first: 'Sam', last: 'Simple', email: 'sam@example.com', consent: true, source: 'home', type: 'simple', landing: 'a', password: 'a-long-password', confirm: 'a-long-password', utm: { utm_source: 'exploraself', utm_medium: 'banner' } });
const sam = out.token;
ok(st === 200 && sam && !hasPw(sam), 'simple form: one record, signed in, and no password even if one is sent');
ok(JSON.stringify(prof(sam)) === JSON.stringify({ signup_type: 'simple', company: null, interest: null, industry: null, landing: 'a', utm_source: 'exploraself', utm_content: null }), 'simple form: landing A and its utm tags');
ok(/"Signup - Simple".*"Landing - 12 Scrolls"/.test(mcLog(sam)) && !/Signup - Full/.test(mcLog(sam)), 'Mailchimp (TEST): "Signup - Simple" and "Landing - 12 Scrolls"');
[st, out] = await S({ ...FULL, first: 'Bea', last: 'Bee', email: 'bea@example.com', source: 'home', landing: 'b', password: 'a-long-password', confirm: 'a-long-password', utm: {} });
const bea = out.token;
ok(st === 200 && hasPw(bea) && prof(bea).signup_type === 'full' && prof(bea).landing === 'b' && /"Signup - Full".*"Landing - Home"/.test(mcLog(bea)), 'full form on B (Home): a password, landing B, "Landing - Home"');
[st, out] = await S({ first: 'Cora', last: 'Box', email: 'cora@example.com', consent: true, source: 'compass', type: 'simple', landing: 'compass' });
const cora = out.token;
ok(st === 200 && prof(cora).landing === 'compass' && !/Landing - /.test(mcLog(cora)), 'the Compass box: landing "compass", no landing tag');
[st, out] = await S({ first: 'Nia', last: 'None', email: 'nia@example.com', consent: false, type: 'simple', landing: 'nowhere' });
ok(st === 200 && out.token && mcLog(out.token) === '' && prof(out.token).landing === null, 'no consent: the account is made, nothing goes to Mailchimp; an unknown landing is not stored');

// Simple founders never have a password; full founders sign in with one.
const r1 = await password({ request: post('/api/password', { token: sam, password: 'a-long-password', confirm: 'a-long-password' }), env });
ok(r1.status === 403 && /link we email you/.test((await r1.json()).error) && !hasPw(sam), 'simple: no password can be set later either');
const me = (await (await stateGet({ request: get('/api/state?t=' + sam), env })).json()).me;
ok(me.signupType === 'simple' && me.hasPassword === false && !('needs' in me), 'state: the form type, so /start offers simple founders no password');
let lr = await login({ request: post('/api/login', { email: 'fay@example.com', password: 'a-long-password' }), env });
ok(lr.status === 200 && (await lr.json()).token === fay, 'full: sign-in with email and password');
lr = await login({ request: post('/api/login', { email: 'fay@example.com', password: 'wrong-password-x' }), env });
ok(/Forgot your password\? Email me a sign-in link/.test((await lr.json()).error), 'a wrong password points to "Forgot your password? Email me a sign-in link"');
ok((await stateGet({ request: get('/api/state?t=nobody-at-all-here-0000'), env })).status === 404, 'an account that does not exist answers 404, so /start forgets it');

// ── /mentor ─────────────────────────────────────────────────────────────────
const L = await (await mGet({ request: new Request('https://x/api/mentor', { headers: { 'x-mentor-key': 'mentor-key-123' } }), env })).json();
const row = (e) => L.students.find((s) => s.email === e);
ok(row('fay@example.com').signup_type === 'full' && row('fay@example.com').landing === 'c' && row('fay@example.com').company === 'Fay & Co' && row('fay@example.com').interest === 'Higher income' && row('sam@example.com').landing === 'a', '/mentor: signup type, landing, company, interest per founder');
const BL = Object.fromEntries(byLanding(L.students).map((x) => [x.k, x]));
ok(BL.a.total === 1 && BL.b.total === 1 && BL.b.full === 1 && BL.c.total === 1 && BL.c.full === 1 && BL.compass.total === 1 && BL.a.week === 1, '/mentor: sign-ups per landing (A, B, C, the Compass box)');
const Sm = summary(L.students, []);
ok(Sm.full === 2 && Sm.simple === 3 && filter(L.students, { tile: 'full' }).length === 2, '/mentor: Full / Simple filters');
const csv = await (await mGet({ request: new Request('https://x/api/mentor?csv=1', { headers: { 'x-mentor-key': 'mentor-key-123' } }), env })).text();
ok(/"Sign-up form","Landing","utm_source"/.test(csv) && csv.includes('"Fay & Co"') && csv.includes('"meta"'), 'CSV: form, landing and utm columns');

// ── The three sales pages, /b, /c and the 404 ───────────────────────────────
const assets = { ASSETS: { fetch: () => new Response('asset') } };
let c = pagesC({ request: get('/c?utm_source=exploraself&utm_content=home-c') });
ok(c.status === 302 && c.headers.get('location') === '/compass/welcome/?utm_source=exploraself&utm_content=home-c', '/c (Pages): 302 to /compass/welcome/, query string kept');
c = await worker.fetch(get('/c/?utm_medium=banner'), assets, {});
ok(c.status === 302 && c.headers.get('location') === '/compass/welcome/?utm_medium=banner', '/c (Worker): the same');
let r = pagesB({ request: get('/b?utm_source=exploraself&utm_content=home-b') });
ok(r.status === 302 && r.headers.get('location') === '/?utm_source=exploraself&utm_content=home-b', '/b (Pages): 302 to /, query string kept');
r = await worker.fetch(get('/b/'), assets, {});
ok(r.status === 302 && r.headers.get('location') === '/', '/b (Worker): the same');
ok(!existsSync(new URL('../public/b', import.meta.url)), '/b keeps no copy of the page');
const W = read('wrangler.toml');
ok(/not_found_handling = "404-page"/.test(W) && /run_worker_first = \["\/api\/\*", "\/b", "\/b\/", "\/c", "\/c\/"\]/.test(W), 'Worker: unknown addresses get the 404 page; /b and /c reach the Worker');
const NF = read('public/404.html');
ok(existsSync(new URL('../public/404.html', import.meta.url)) && /noindex/.test(NF) && NF.includes('This page does not exist.') && !NF.includes('Link to Lead — The Founder'), 'a real 404 page (not the home page)');
const B = read('public/index.html');
ok(!/ten questions|10 questions/i.test(B) && !B.includes('Mockup at real size') && B.includes('Start tonight, free. <em>By Tuesday, you’ll be ahead.</em>') && B.includes('<button type="button" class="cta" data-join>Create my free account →</button>') && B.includes('Levels 01–03 free · Instant access'), 'B: no "ten questions", no mockup line; the close is "Start tonight, free…" with "Create my free account →"');
ok(!B.includes('href="/compass/welcome') && (B.match(/<a [^>]*class="cta"[^>]*>/g) || []).every((a) => a.includes('data-join')) && read('public/page.js').includes("variant: 'full', landing: 'b'") && B.includes('<script type="module" src="/page.js"></script>'), 'B: every call to action opens the FULL form (landing B), none goes to /compass/welcome');
ok(B.indexOf('<h2 class="sectitle">Move one lever. Watch the four answer.</h2>') > B.indexOf('id="library"') && B.indexOf('id="whatif-lab"') < B.indexOf('id="start"'), 'B: the What-if Lab, after the library and before the close');
const A = read('public/a/index.html');
ok(A.includes('The Leadership Compass shows which one you are in.') && A.includes('<b>Your free account</b><span>One minute. Name and email.</span>') && A.includes('<b>Your Ground Plan</b><span>Your stage and your first three moves.</span>'), 'A: the Compass line and the three steps');
for (const [n, p] of [['The Founder Launchpad', 'No cost'], ['The Boardroom', 'One 1:1 session'], ['The LAB', '$97'], ['The HUB', '$397'], ['The Summit', '$1,989']]) ok(A.includes(`<b>${n}</b>`) && A.includes(`<span class="pr">${p}</span>`), `A: ${n} · ${p}`);
ok(A.includes('All twelve + Alexandru every week') && A.includes('Start tonight, free. <em>By Tuesday, you’ll be ahead.</em>') && A.includes('>Start free →</button>') && A.includes('Levels 01–03 free · Instant access') && !/ten questions/i.test(A), 'A: The Summit line and the close');
ok(!/PHOTO/.test(A) && read('public/a/page.js').includes("variant: 'simple', landing: 'a'"), 'A: no photo placeholder; Join opens the simple form, landing A');
ok(levelsHTML('build').includes(`<p>${weekTitle('build', 1)}</p>`) && (levelsHTML('grow').match(/<li/g) || []).length === 12, 'A: level names come from content.js');
ok([1, 3, 4, 5, 6, 11, 12].map(band).join() === 'free,free,with,with,,,last', 'A: the levels’ bands');
const WA = read('public/compass/welcome-a/index.html'), WB = read('public/compass/welcome/index.html');
ok(WA.includes('What is your business for?') && WA.slice(WA.indexOf('<!-- 1a · HANDSHAKE')) === WB.slice(WB.indexOf('<!-- 1a · HANDSHAKE')), '/compass/welcome-a stays, the same as /compass/welcome after its hero');
for (const W of [WA, WB]) ok(W.includes('<button type="button" data-gate class="cta gold-btn" style="min-height: 56px; padding: 0 32px; font-size: 17px">Show me my road →</button>') && !W.includes('href="#dream"') && !/<a [^>]*href="\/(?!compass\/assets|assets)/.test(W), '/compass/welcome: "Show me my road" opens the full form; no link leaves the page');
ok(!read('public/compass/welcome/sales.js').includes("variant: 'simple'") && read('public/compass/app.js').includes("type: 'simple', landing: 'compass'"), '/compass/welcome stays FULL; the /compass box stays SIMPLE');
const box = read('public/compass/welcome/account-box.js');
ok(/id="j-pw"/.test(box) && /variant === 'full' \? detailFields/.test(box) && /landing: ctx\.landing, utm: utm\(\)/.test(box), 'the account box: a password on the full form only, landing and utm sent');

// ── /compass/welcome: Your plan, live ───────────────────────────────────────
const P = SalesMath.plan({ goal: 6000, price: 400, keep: 60, hps: 8, avail: 140 });
ok(P.badge === 'OVER YOUR HOURS' && P.over === 60, 'badge: over the hours you want is "OVER YOUR HOURS", 60 h over');
ok(P.paysAtHours === 4080, 'lever 1: 6,000 / 400 / 60% / 8 h / 140 h → 4,080');
ok(SalesMath.plan({ goal: 1000, price: 400, keep: 60, hps: 8, avail: 140 }).badge === 'IT FITS' && SalesMath.plan({ goal: 3900, price: 400, keep: 60, hps: 8, avail: 140 }).badge === 'TIGHT', 'badge: IT FITS and TIGHT unchanged');
ok(!read('public/compass/welcome/sales.js').includes('IN THE RED'), 'no "IN THE RED" left');
ok(WB.includes('1 · What do you want the business to pay you each month (before tax)?') && WB.includes('Not counted: the hours you spend finding clients and running the business.') && WB.includes('At your hours, this plan pays about <b data-out="paysAtHours"></b>.'), 'plan live: the new question, the note under the bar, the lever-1 line');
ok(WB.includes('<h2 class="h2 win4-h">A win has four sides.</h2>') && (WB.match(/<button type="button" data-dom=/g) || []).length === 4 && WB.includes('A win is where all four meet.') && read('public/compass/welcome/sales.css').includes('prefers-reduced-motion:reduce){.win4-box'), 'four sides: overlapping circles, four buttons, the caption, reduced motion');
ok(WB.includes('That was five sliders. Now pull the four levers.'), 'a look inside: the new heading');
const b = baseFrom({ goal: 6000, price: 400, keep: 60, hps: 8, avail: 140 });
const t = E.month(b, {}, 'time');
ok(b.clients === 25 && t.cash === 6000 && t.mine === 200 && b.limit === 140, 'the lab starts from the five numbers: 25 sales, 6,000 left, 200 hours, 140 wanted');
ok(E.month(b, { p: 50 }, 'time').mine < t.mine && E.month(b, { p: 50 }, 'money').cash > t.cash, 'the levers move it through the Compass engine');
ok(/E\.month\(/.test(read('public/compass/welcome/lab.js')) && !/function month\(/.test(read('public/compass/welcome/lab.js')), 'the lab reuses engine.js, it does not copy the logic');

// ── The What-if Lab on / ───────────────────────────────────────────────────
const LB = read('public/lab.js');
ok(/E\.month\(/.test(LB) && !/function month\(/.test(LB), 'the home lab reuses engine.js, it does not copy the logic');
ok(LB.includes('An example founder') && LB.includes("box('price', 'Price per client ($)'") && LB.includes("box('clients', 'Clients a month'") && LB.includes("box('hours', 'Hours per client'") && LB.includes('>Create my free account →</button>') && LB.includes('openGate'), 'the home lab: "An example founder", three boxes to type into, "Create my free account →" opens the form');
ok(read('public/page.js').includes("import('/lab.js')") && LB.includes('limit ${n0(b.limit)} h a month') && LB.includes('hours beyond the limit of ${n0(b.limit)} a month.') && LB.includes('Within the limit of ${n0(b.limit)} hours a month.') && LB.includes('within the limit of ${n0(b.limit)} a month') && LB.includes('Still beyond the limit of ${n0(b.limit)} hours a month.') && !/limit of \$\{n0\(b\.limit\)\}[.`]/.test(LB), 'the home lab: the hours limit always reads "a month"');
const hb = baseOf(EXAMPLE), ht = E.month(hb, {}, 'time');
ok(hb.ready && hb.clients === 20 && ht.mine === 160 && ht.cash === 20 * 200 - 1500, 'the example founder: 20 clients, 160 hours, $2,500 left');
ok(Math.round(E.month(hb, { p: 60 }, 'time').mine) === 91 && E.month(hb, { p: 60 }, 'time').cash === ht.cash && E.month(hb, { p: 60 }, 'money').cash > ht.cash, 'the levers move it: +60% price keeps the money in about 91 hours instead of 160 (time), more cash (money)');
const own = baseOf({ ...EXAMPLE, price: 1200, clients: 4, hours: 25 });
ok(own.ready && own.sales === 4800 && own.hours === 100 && E.month(own, {}, 'time').mine === 100, 'a visitor’s own price, clients and hours run the lab');
ok(!baseOf({ ...EXAMPLE, clients: 0 }).ready && !baseOf({ ...EXAMPLE, price: null }).ready && !baseOf({ ...EXAMPLE, hours: num('abc') }).ready && num('') === null && num('1,500') === 1500, 'blank, zero or nonsense: the lab waits, no NaN');
const noRun = baseOf({ ...EXAMPLE, run: null, rate: null, hire: null }), nm = E.month(noRun, { d: 20 }, 'time');
ok(noRun.fixed === 0 && nm.cash === null && nm.people === null && Number.isFinite(nm.mine), 'empty Fine-tune boxes: no money figure invented, the hours still move');

// ── Mailchimp landing tags ──────────────────────────────────────────────────
ok(JSON.stringify(LANDING_TAGS) === JSON.stringify({ b: 'Landing - Home', c: 'Landing - Compass welcome', a: 'Landing - 12 Scrolls' }), 'landing tags: Home, Compass welcome, 12 Scrolls');
ok(!tagsFor({ landing: 'compass' }).some((x) => /^Landing - /.test(x.name)) && !tagsFor({ landing: 'toString' }).some((x) => /^Landing - /.test(x.name)), 'the Compass box and anything unknown get no landing tag');

// ── /start: the greeting ────────────────────────────────────────────────────
const APP = read('public/app.js');
ok(/const firstName = \(\) => \(pulled && state\.me/.test(APP) && /if \(r && r\.gone\) \{ account\.signOut\(\); state\.me = null/.test(APP), '/start greets with the first name of the account read on this visit, never a cached one');

done();
