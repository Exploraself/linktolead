// Three sales pages, the three roads, one account, all ending at /start:
// Road 1 (/road1/, the long page, with the What-if Lab) and Road 2 (/north3/,
// the North Star sales page) with the FULL form, Road 3 (/road3/, the 12 Scrolls
// page) with the SIMPLE form. The forms (POST /api/signup): no password on
// simple, ever; a password required on full; the landing and the utm_* tags
// stored; the Mailchimp tags in TEST mode; /mentor's view; the old addresses
// redirecting to their road; the 404 page; and on the North Star sales page the "Your plan, live" badge, the
// lever-1 figure and the live lab. No network: Mailchimp is in TEST mode and
// Resend is faked.

import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as password } from '../functions/api/password.js';
import { onRequestGet as stateGet } from '../functions/api/state.js';
import { onRequestPost as login } from '../functions/api/login.js';
import { onRequestGet as mGet } from '../functions/api/mentor.js';
import { onRequest as pagesRedirect } from '../functions/_middleware.js';
import { accountTables } from '../functions/_shared.js';
import worker from '../worker.js';
import { INTERESTS, INDUSTRIES, details, utmFrom } from '../functions/_profile.js';
import * as F from '../public/forms.js';
import { summary, filter, byLanding } from '../public/mentor/dash.js';
import { levelsHTML, band } from '../public/road3/page.js';
import { weekTitle } from '../public/content.js';
import { baseFrom } from '../public/north3/lab.js';
import { baseOf, EXAMPLE, num } from '../public/road1/lab.js';
import { tagsFor, LANDING_TAGS } from '../functions/_mailchimp.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const require = createRequire(import.meta.url);
const E = require('../public/northstar/engine.js');
const SalesMath = require('../public/north3/sales.js');
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const { ok, done } = tally('forms');

// ── The lists ───────────────────────────────────────────────────────────────
ok(JSON.stringify(F.INTERESTS) === JSON.stringify(INTERESTS) && JSON.stringify(F.INDUSTRIES) === JSON.stringify(INDUSTRIES) && JSON.stringify(F.UTM_KEYS) === JSON.stringify(Object.keys(utmFrom({}))), 'the forms and the server offer the same lists');
ok(JSON.stringify(INTERESTS) === JSON.stringify(E.GOALS.map((g) => g[1])), 'interests are the North Star goals: More free time … A new market');
const compassList = /const INDUSTRIES = (\[[^\]]+\]);/.exec(read('public/northstar/app.js'))[1];
ok(JSON.stringify(INDUSTRIES) === JSON.stringify(JSON.parse(compassList.replace(/'/g, '"'))), 'industries are the North Star box’s own list');
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
const FULL = { first: 'Fay', last: 'Full', email: 'fay@example.com', consent: true, source: 'sales-page', type: 'full', landing: 'road2', company: 'Fay & Co', interest: 'Higher income', industry: 'Real estate', utm: { utm_source: 'meta', utm_content: 'home-c' } };

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
ok(JSON.stringify(prof(fay)) === JSON.stringify({ signup_type: 'full', company: 'Fay & Co', interest: 'Higher income', industry: 'Real estate', landing: 'road2', utm_source: 'meta', utm_content: 'home-c' }), 'full form: company, interest, industry, landing Road 2 and the utm tags stored');
ok(/"linktolead-road2"/.test(mcLog(fay)) && /"COMPANY":"Fay & Co"/.test(mcLog(fay)) && /"INDUSTRY":"Real estate"/.test(mcLog(fay)) && /"INTEREST":"Higher income"/.test(mcLog(fay)) && !/Industry - |Interest - |Signup - |salespageincubator/.test(mcLog(fay)), 'Mailchimp (TEST): tag linktolead-road2; company, industry and interest as contact fields, not tags');

[st, out] = await S({ first: 'Sam', last: 'Simple', email: 'sam@example.com', consent: true, source: 'home', type: 'simple', landing: 'road3', password: 'a-long-password', confirm: 'a-long-password', utm: { utm_source: 'exploraself', utm_medium: 'banner' } });
const sam = out.token;
ok(st === 200 && sam && !hasPw(sam), 'simple form: one record, signed in, and no password even if one is sent');
ok(JSON.stringify(prof(sam)) === JSON.stringify({ signup_type: 'simple', company: null, interest: null, industry: null, landing: 'road3', utm_source: 'exploraself', utm_content: null }), 'simple form: landing Road 3 and its utm tags');
ok(/"linktolead-road3"/.test(mcLog(sam)) && !/Signup - /.test(mcLog(sam)), 'Mailchimp (TEST): "linktolead-road3", no form tag');
[st, out] = await S({ ...FULL, first: 'Bea', last: 'Bee', email: 'bea@example.com', source: 'home', landing: 'road1', password: 'a-long-password', confirm: 'a-long-password', utm: {} });
const bea = out.token;
ok(st === 200 && hasPw(bea) && prof(bea).signup_type === 'full' && prof(bea).landing === 'road1' && /"linktolead-road1"/.test(mcLog(bea)), 'full form on Road 1: a password, landing road1, "linktolead-road1"');
[st, out] = await S({ first: 'Cora', last: 'Box', email: 'cora@example.com', consent: true, source: 'compass', type: 'simple', landing: 'compass' });
const cora = out.token;
ok(st === 200 && prof(cora).landing === 'compass' && /"linktolead-northstar"/.test(mcLog(cora)), 'the North Star box: landing "compass", tag "linktolead-northstar"');
[st, out] = await S({ first: 'Olly', last: 'Old', email: 'olly@example.com', consent: false, type: 'simple', landing: 'a' });
ok(st === 200 && prof(out.token).landing === 'road3', 'a page loaded before the rename sends "a": stored as road3');
// Landings stored before the roads move to the road their page became, once.
const D2 = fakeD1();
D2.raw.exec(`CREATE TABLE student_profile (student_id TEXT PRIMARY KEY, landing TEXT);
  INSERT INTO student_profile VALUES ('s1', 'a'), ('s2', 'b'), ('s3', 'c'), ('s4', 'compass'), ('s5', NULL);`);
await accountTables(D2);
ok(D2.raw.prepare('SELECT landing FROM student_profile ORDER BY student_id').all().map((x) => x.landing).join() === 'road3,road1,road2,compass,', 'stored landings a, b, c become road3, road1, road2; compass and none stay');
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
ok(/Forgot your password\?” to get a reset link/.test((await lr.json()).error), 'a wrong password points to "Forgot your password?"');
ok((await stateGet({ request: get('/api/state?t=nobody-at-all-here-0000'), env })).status === 404, 'an account that does not exist answers 404, so /start forgets it');

// ── /mentor ─────────────────────────────────────────────────────────────────
const L = await (await mGet({ request: new Request('https://x/api/mentor', { headers: { 'x-mentor-key': 'mentor-key-123' } }), env })).json();
const row = (e) => L.students.find((s) => s.email === e);
ok(row('fay@example.com').signup_type === 'full' && row('fay@example.com').landing === 'road2' && row('fay@example.com').company === 'Fay & Co' && row('fay@example.com').interest === 'Higher income' && row('sam@example.com').landing === 'road3', '/mentor: signup type, landing, company, interest per founder');
const BL = Object.fromEntries(byLanding(L.students).map((x) => [x.k, x]));
ok(BL.road3.total === 2 && BL.road1.total === 1 && BL.road1.full === 1 && BL.road2.total === 1 && BL.road2.full === 1 && BL.compass.total === 1 && BL.road3.week === 2, '/mentor: sign-ups per landing (Roads 1, 2, 3, the North Star box)');
const Sm = summary(L.students, []);
ok(Sm.full === 2 && Sm.simple === 4 && filter(L.students, { tile: 'full' }).length === 2, '/mentor: Full / Simple filters');
const csv = await (await mGet({ request: new Request('https://x/api/mentor?csv=1', { headers: { 'x-mentor-key': 'mentor-key-123' } }), env })).text();
ok(/"Sign-up form","Landing","utm_source"/.test(csv) && csv.includes('"Fay & Co"') && csv.includes('"meta"'), 'CSV: form, landing and utm columns');

// ── The three roads, the old addresses and the 404 ─────────────────────────
const assets = { ASSETS: { fetch: () => new Response('asset') } };
const OLD = [['/', '/road1/'], ['/b', '/road1/'], ['/b/', '/road1/'], ['/compass/welcome', '/north3/'], ['/compass/welcome/', '/north3/'], ['/compass/welcome-a', '/north3/'],
  ['/compass/welcome-a/', '/north3/'], ['/c', '/north3/'], ['/c/', '/north3/'], ['/a', '/road3/'], ['/a/', '/road3/']];
for (const [from, to] of OLD) {
  const q = '?utm_source=exploraself&utm_medium=banner&utm_content=home-3';
  const w = await worker.fetch(get(from + q), assets, {});
  const pg = await pagesRedirect({ request: get(from + q), next: () => new Response('asset') });
  ok(w.status === 302 && w.headers.get('location') === to + q && pg.status === 302 && pg.headers.get('location') === to + q, `${from} → ${to}, utm kept (Worker and Pages)`);
}
ok((await worker.fetch(get('/b'), assets, {})).headers.get('location') === '/road1/', 'no query string: none added');
for (const p of ['/road1/', '/north3/', '/road3/', '/northstar', '/northstar/summit', '/ground-plan/']) ok(await (await worker.fetch(get(p), assets, {})).text() === 'asset' && await (await pagesRedirect({ request: get(p), next: () => new Response('asset') })).text() === 'asset', `${p} is served, not redirected`);
{ const r = await pagesRedirect({ request: get('/start?signin=abc'), next: () => new Response('asset') }); ok(r.status === 302 && r.headers.get('location') === '/ground-plan/?signin=abc', '/start (old links, old emails) lands on /ground-plan/, sign-in code kept'); }
for (const d of ['index.html', 'page.js', 'lab.js', 'a', 'b', 'compass/welcome', 'compass/welcome-a']) ok(!existsSync(new URL('../public/' + d, import.meta.url)), `public/${d}: no copy left at the old address`);
const W = read('wrangler.toml');
const RULES = JSON.parse(W.match(/run_worker_first = (\[.*\])/)[1]);
const covered = (p) => RULES.some((r) => r === p || (r.endsWith('/*') && p.startsWith(r.slice(0, -1))));
ok(/not_found_handling = "404-page"/.test(W) && OLD.every(([from]) => covered(from)), 'Worker: unknown addresses get the 404 page; every old address reaches the Worker');
ok(!RULES.some((r) => RULES.some((o) => o !== r && o.endsWith('/*') && r.startsWith(o.slice(0, -1)))), 'Worker: no run_worker_first rule another one already covers (Workers Builds refuses them)');
const NF = read('public/404.html');
ok(existsSync(new URL('../public/404.html', import.meta.url)) && /noindex/.test(NF) && NF.includes('This page does not exist.') && !NF.includes('Link to Lead — The Founder'), 'a real 404 page (not the home page)');
const B = read('public/road1/index.html');
ok(!/ten questions|10 questions/i.test(B) && !B.includes('Mockup at real size') && B.includes('Start tonight, free. <em>By Tuesday, you’ll be ahead.</em>') && B.includes('<button type="button" class="cta" data-join>Create my free account →</button>') && B.includes('Levels 01–03 free · Instant access'), 'Road 1: no "ten questions", no mockup line; the close is "Start tonight, free…" with "Create my free account →"');
ok(!/href="\/(compass\/welcome|road2)/.test(B) && (B.match(/<a [^>]*class="cta"[^>]*>/g) || []).every((a) => a.includes('data-join')) && read('public/road1/page.js').includes("variant: 'full', landing: 'road1'") && B.includes('<script type="module" src="/road1/page.js"></script>'), 'Road 1: every call to action opens the FULL form (landing road1), none goes to Road 2');
ok(B.indexOf('<h2 class="sectitle">Move one lever. Watch the four answer.</h2>') > B.indexOf('id="library"') && B.indexOf('id="whatif-lab"') < B.indexOf('id="start"'), 'Road 1: the What-if Lab, after the library and before the close');
const A = read('public/road3/index.html');
ok(!A.includes('The Leader’s North Star shows which one you are in.') && A.includes('<b>Your free account</b><span>One minute. Name and email.</span>') && A.includes('<b>Your Base Camp</b><span>Your stage and your first three moves.</span>') && A.includes('Tap, slide, write one sentence, read four lines back.'), 'Road 3: the three steps, in the four moves of Version 4; no second product named');
ok(A.includes('id="s-now"') && A.includes('id="s-want"') && A.includes('What another year like this <em>costs you.</em>'), 'Road 3: what another year costs, counted by the founder');
ok(A.includes('/cabinet/alexandru.jpg') && A.includes('I built made-to-measure kitchens and wardrobes') && A.includes('The whole risk is three weeks of honest work.'), 'Road 3: Alexandru’s face and story, and the risk line');
for (const [n, p] of [['The Founder Launchpad', 'No cost'], ['The Boardroom', 'One 1:1 session']]) ok(A.includes(`<b>${n}</b>`) && A.includes(`<span class="pr">${p}</span>`), `Road 3: ${n} · ${p}`);
// Cold visitors see only the next step, never the whole ladder (30 Oct).
ok(!['$97', '$397', '$1,989'].some((p) => A.includes(`<span class="pr">${p}</span>`)) && A.includes('Start free. When you’re ready, one hour with Alexandru opens the next two weeks.'), 'Road 3: only the next step, no LAB, HUB or Summit prices');
ok(A.includes('Your business can’t grow <em>past you.</em>') && A.includes('The Founder’s Blueprint · Link to Lead') && !/incubator/i.test(A), 'Road 3: its own headline, and no "Incubator"');
ok(A.includes('Start tonight, free. <em>By Tuesday, you’ll be ahead.</em>') && A.includes('>Start my free three weeks →</button>') && !A.includes('>Join →<') && !/ten questions/i.test(A), 'Road 3: the close; every button says what it starts');
ok(!/PHOTO/.test(A) && read('public/road3/page.js').includes("variant: 'simple', landing: 'road3'") && A.includes('src="/road3/page.js"') && !A.includes('href="/north3/"'), 'Road 3: no photo placeholder; Join opens the simple form, landing road3; no link leads away to another offer');
{
  const { LEVELS4 } = await import('../public/levels-v4.js');
  const LH = levelsHTML();
  ok((LH.match(/<li class="(free|with|last|)">/g) || []).length === 12 && LEVELS4.every((L) => LH.includes(`${String(L.n).padStart(2, '0')} · ${L.word}</b>`)) && (LH.match(/class="ch"/g) || []).length === 3, 'Road 3: the twelve Version 4 words, in three chapters');
}
ok([1, 3, 4, 5, 6, 11, 12].map(band).join() === 'free,free,with,with,,,last', 'Road 3: the levels’ bands');
const WB = read('public/north3/index.html');
for (const W of [WB]) ok(W.includes('<button type="button" data-gate class="cta gold-btn" style="min-height: 56px; padding: 0 32px; font-size: 17px">Show me my road →</button>') && !W.includes('href="#dream"') && !/<a [^>]*href="\/(?!compass\/assets|assets)/.test(W), 'Road 2: "Show me my road" opens the full form; no link leaves the page');
ok(read('public/north3/sales.js').includes("variant: 'full', landing: 'road2'") && WB.includes('src="/north3/sales.js"') && WB.includes('content="https://linktolead.exploraself.com/north3/"') && read('public/northstar/app.js').includes("type: 'simple', landing: 'compass'"), 'Road 2 stays FULL, landing road2; the /northstar box stays SIMPLE');
const box = read('public/account-box.js');
ok(/pwInput\('j-pw'\)/.test(box) && /pwInput\('j-pw2'\)/.test(box) && /data-eye=/.test(box) && /variant === 'full' \? detailFields/.test(box) && /landing: ctx\.landing, utm: utm\(\)/.test(box), 'the account box: a password (with the show-password eye) on the full form only, landing and utm sent');

// ── Road 2: Your plan, live ────────────────────────────────────────────────
const P = SalesMath.plan({ goal: 6000, price: 400, keep: 60, hps: 8, avail: 140 });
ok(P.badge === 'OVER YOUR HOURS' && P.over === 60, 'badge: over the hours you want is "OVER YOUR HOURS", 60 h over');
ok(P.paysAtHours === 4080, 'lever 1: 6,000 / 400 / 60% / 8 h / 140 h → 4,080');
ok(SalesMath.plan({ goal: 1000, price: 400, keep: 60, hps: 8, avail: 140 }).badge === 'IT FITS' && SalesMath.plan({ goal: 3900, price: 400, keep: 60, hps: 8, avail: 140 }).badge === 'TIGHT', 'badge: IT FITS and TIGHT unchanged');
ok(!read('public/north3/sales.js').includes('IN THE RED'), 'no "IN THE RED" left');
ok(WB.includes('1 · What do you want the business to pay you each month (before tax)?') && WB.includes('Not counted: the hours you spend finding clients and running the business.') && WB.includes('At your hours, this plan pays about <b data-out="paysAtHours"></b>.'), 'plan live: the new question, the note under the bar, the lever-1 line');
ok(WB.includes('<h2 class="h2 win4-h">A win has four sides.</h2>') && (WB.match(/<button type="button" data-dom=/g) || []).length === 4 && WB.includes('A win is where all four meet.') && read('public/north3/sales.css').includes('prefers-reduced-motion:reduce){.win4-box'), 'four sides: overlapping circles, four buttons, the caption, reduced motion');
ok(WB.includes('That was five sliders. Now pull the four levers.'), 'a look inside: the new heading');
const b = baseFrom({ goal: 6000, price: 400, keep: 60, hps: 8, avail: 140 });
const t = E.month(b, {}, 'time');
ok(b.clients === 25 && t.cash === 6000 && t.mine === 200 && b.limit === 140, 'the lab starts from the five numbers: 25 sales, 6,000 left, 200 hours, 140 wanted');
ok(E.month(b, { p: 50 }, 'time').mine < t.mine && E.month(b, { p: 50 }, 'money').cash > t.cash, 'the levers move it through the North Star engine');
ok(/E\.month\(/.test(read('public/north3/lab.js')) && !/function month\(/.test(read('public/north3/lab.js')), 'the lab reuses engine.js, it does not copy the logic');

// ── The What-if Lab on Road 1 ────────────────────────────────────────────────
const LB = read('public/road1/lab.js');
ok(/E\.month\(/.test(LB) && !/function month\(/.test(LB), 'the home lab reuses engine.js, it does not copy the logic');
ok(LB.includes('An example founder') && LB.includes("box('price', 'Price per client ($)'") && LB.includes("box('clients', 'Clients a month'") && LB.includes("box('hours', 'Hours per client'") && LB.includes('>Create my free account →</button>') && LB.includes('openGate'), 'the home lab: "An example founder", three boxes to type into, "Create my free account →" opens the form');
ok(read('public/road1/page.js').includes("import('/road1/lab.js')") && LB.includes('limit ${n0(b.limit)} h a month') && LB.includes('hours beyond the limit of ${n0(b.limit)} a month.') && LB.includes('Within the limit of ${n0(b.limit)} hours a month.') && LB.includes('within the limit of ${n0(b.limit)} a month') && LB.includes('Still beyond the limit of ${n0(b.limit)} hours a month.') && !/limit of \$\{n0\(b\.limit\)\}[.`]/.test(LB), 'the home lab: the hours limit always reads "a month"');
const hb = baseOf(EXAMPLE), ht = E.month(hb, {}, 'time');
ok(hb.ready && hb.clients === 20 && ht.mine === 160 && ht.cash === 20 * 200 - 1500, 'the example founder: 20 clients, 160 hours, $2,500 left');
ok(Math.round(E.month(hb, { p: 60 }, 'time').mine) === 91 && E.month(hb, { p: 60 }, 'time').cash === ht.cash && E.month(hb, { p: 60 }, 'money').cash > ht.cash, 'the levers move it: +60% price keeps the money in about 91 hours instead of 160 (time), more cash (money)');
const own = baseOf({ ...EXAMPLE, price: 1200, clients: 4, hours: 25 });
ok(own.ready && own.sales === 4800 && own.hours === 100 && E.month(own, {}, 'time').mine === 100, 'a visitor’s own price, clients and hours run the lab');
ok(!baseOf({ ...EXAMPLE, clients: 0 }).ready && !baseOf({ ...EXAMPLE, price: null }).ready && !baseOf({ ...EXAMPLE, hours: num('abc') }).ready && num('') === null && num('1,500') === 1500, 'blank, zero or nonsense: the lab waits, no NaN');
const noRun = baseOf({ ...EXAMPLE, run: null, rate: null, hire: null }), nm = E.month(noRun, { d: 20 }, 'time');
ok(noRun.fixed === 0 && nm.cash === null && nm.people === null && Number.isFinite(nm.mine), 'empty Fine-tune boxes: no money figure invented, the hours still move');

// ── Mailchimp landing tags ──────────────────────────────────────────────────
ok(JSON.stringify(LANDING_TAGS) === JSON.stringify({ road1: 'linktolead-road1', road2: 'linktolead-road2', road21: 'linktolead-road2.1', road3: 'linktolead-road3', road4: 'linktolead-road4', compass: 'linktolead-northstar', summit: 'linktolead-summit' }), 'landing tags: the linktolead-… system');
// Road 2.1 (30 Oct): its own tag, no empty old tag, the FULL form, and road2 untouched beside it.
{
  const { tagsFor } = await import('../functions/_mailchimp.js');
  const t = tagsFor({ landing: 'road21', signupType: 'full' });
  ok(t.some((x) => x.name === 'linktolead-road2.1' && x.status === 'active') && t.every((x) => typeof x.name === 'string' && x.name), 'road2.1: tagged linktolead-road2.1, no empty tag');
  const R21 = read('public/north2/index.html'), J21 = read('public/north2/page.js');
  ok(J21.includes("variant: 'full', landing: 'road21'") && R21.includes('src="/north2/page.js"') && !/PHOTO OF/.test(R21) && R21.includes('/cabinet/alexandru.jpg'), 'road2.1: full form, landing road21, the real photo');
  const labels = new Set((R21.match(/<button type="button" data-gate[^>]*>([^<]+)/g) || []).map((m) => m.replace(/.*>/, '').trim()));
  ok(labels.size === 1 && labels.has('Start my North Star →'), 'road2.1: one button label, everywhere');
  const AB = read('public/account-box.js');
  ok(AB.includes("const NS_HOME = ['road21'];") && AB.includes("? '/northstar/' : '/ground-plan/#home'") && J21.includes("location.replace('/northstar/')") && read('functions/_landing.js').includes("'/road2.1': '/north2/'"), 'north2 (was road2.1): Start my North Star opens the North Star, and the old address still lands');
  ok(read('public/north3/sales.js').includes("landing: 'road2', next: opener ? '/northstar/' : ''") && AB.includes('const after = () => ctx.next ||') && read('functions/_landing.js').includes("'/road2': '/north3/'") && read('public/ground-plan/index.html').includes("/north3/#join"), 'north (was road2): its buttons open the North Star; sign-ups sent from the Blueprint still land on Base Camp; the old address still lands');
  ok(!/most founders|incubator/i.test(R21.replace(/<!--[\s\S]*?-->/g, '')), 'road2.1: no banned words on the page');
}
// Road 4 (31 Oct): the sales page for The Founder's Blueprint, taps only.
{
  const R4 = read('public/road4/index.html'), R4J = read('public/road4/page.js'), R4C = read('public/road4/road4.css');
  const R4T = R4.replace(/<!--[\s\S]*?-->/g, '');
  ok(tagsFor({ landing: 'road4', signupType: 'full' }).some((x) => x.name === 'linktolead-road4' && x.status === 'active'), 'road4: tagged linktolead-road4');
  ok(R4J.includes("{ gate, opener, stage: { id: stage }, variant, landing: 'road4' }") && R4J.includes("Math.random() < 0.5 ? 'simple' : 'full'") && R4J.includes("localStorage.setItem('ftb-r4-form', v)") && R4.includes('<script type="module" src="/road4/page.js"></script>') && (R4.match(/<a [^>]*class="cta"[^>]*>/g) || []).every((x) => x.includes('data-join') || x.includes('href="#mirror"')), 'road4: every call to action opens the form (or the mirror), landing road4; simple or full is a test, kept per device');
  ok(!['$97', '$397', '$1,989'].some((p) => { const i = R4.indexOf(`<span class="pr">${p}</span>`); return i < 0 || i < R4.indexOf('<details class="later'); }), 'road4: only the next step is open; the LAB, HUB and Summit wait behind one tap');
  for (const [n, p] of [['The Founder Launchpad', 'Free'], ['The Boardroom — an hour with Alexandru', 'No cost'], ['Personal Leadership LAB', '$97'], ['Business Growth HUB', '$397'], ['The Summit', '$1,989']]) ok(R4.includes(`<b>${n}</b><span class="pr">${p}</span>`), `road4: ${n} · ${p}`);
  ok(R4C.includes('prefers-reduced-motion') && R4C.includes('html.still') && R4.includes('id="still"'), 'road4: motion stops for reduced motion and for the Pause button');
  ok(!/\b(99|32) (tools|frameworks)\b|P\.A\.C\.E|most founders|incubator/i.test(R4T + R4J), 'road4: no tool or framework names, no banned words');
  ok(!/\/start[#/"']/.test(R4 + R4J), 'road4: links go to /ground-plan/, not the old /start');
  ok(!/<textarea|<input type="text"|localStorage\.setItem\((?!'ftb-still'|'ftb-r4-form')/.test(R4 + R4J), 'road4: nothing to type; kept on the device: the motion choice, the form test, and (through road-kit) what the mirror found');
  ok(R4J.includes("import { LEVELS4 } from '/levels-v4.js'") && R4J.includes('LEVELS4[wk - 1].promise') && R4J.includes('L1.d.map(') && !R4J.includes('levels-build.js') && !R4J.includes('SEVEN'), 'road4: week one, the climb and the reading come from the Version 4 levels');
  const QN = (R4J.match(/\{ k: '(self|people|work|market)', art: /g) || []);
  ok(QN.length === 8 && ['self', 'people', 'work', 'market'].every((k) => QN.filter((x) => x.includes(`'${k}'`)).length === 2), 'road4: the mirror asks eight questions, two in each domain');
  ok(/\/\/ @site data[\s\S]*\/\/ @end data/.test(R4J) && /\/\/ @site join[\s\S]*\/\/ @end join/.test(R4J), 'road4: the site-only blocks are marked for the preview build');
  ok(R4.includes('/cabinet/alexandru.jpg') && R4.includes('I was the business, too.') && !/PHOTO OF/.test(R4), 'road4: Alexandru, in his own story, with his photo');
}
// The three Blueprint pages (1 Nov): one phone bar, one hand-off to Base Camp, no banned words.
{
  const K = read('public/road-kit.js'), AR = read('public/arrival.js');
  for (const r of ['road1', 'road3', 'road4']) {
    const H = read(`public/${r}/index.html`).replace(/<!--[\s\S]*?-->/g, ''), J = read(`public/${r}/page.js`);
    ok(/stickyJoin\(/.test(J) && /remember\(|k\.remember\(/.test(J), `${r}: the phone bar, and what the founder found kept for Base Camp`);
    ok(!/most founders|incubator|twenty-eight answers|seven questions/i.test(H), `${r}: no banned or outdated words`);
  }
  ok(K.includes("localStorage.setItem('ftb-arrival'") && K.includes('prefers-reduced-motion') && K.includes('@media(min-width:761px){.rk-bar{display:none}}'), 'road-kit: device only, still for reduced motion, phone only');
  ok(read('public/ground-plan/index.html').includes('<script src="/arrival.js" type="module"></script>'), 'Base Camp loads the arrival note');
  const { noteFor } = await import('../public/arrival.js');
  ok(noteFor({ landing: 'road4', worst: 'people', leaking: 3, word: 'SEED', letter: 'E', part: 'Entrust' }).includes('Lead your people') && noteFor({ landing: 'road1', extraYear: 780 }).includes('780 hours a year') && noteFor({ landing: 'road3', extraYear: 0 }) === '' && noteFor(null) === '', 'arrival note: the founder’s own finding said back, nothing when there is nothing of theirs');
  const B1 = read('public/road1/index.html');
  // Round 2 (1 Nov): model stories always carry their tag; the counter counts only known moments; the Boardroom door says its link is coming.
  const KIT = await import('../public/road-kit.js');
  ok(KIT.STORIES.length === 3 && KIT.STORIES.every((x) => x.model === true && !('name' in x) && x.title) && ['road1', 'road3', 'road4'].every((r) => read(`public/${r}/index.html`).includes('Illustrations of what the work asks for, not reviews.') || read(`public/${r}/index.html`).includes('These are illustrations of what the work asks for, not reviews.')), 'model stories: no names, and each page says plainly they are illustrations, not reviews');
  ok(KIT.painFromUrl('https://x/road4/?pain=alone') === 'alone' && KIT.painFromUrl('https://x/?utm_content=ad3-pain-price') === 'price' && KIT.painFromUrl('https://x/?pain=nonsense') === '' && Object.values(KIT.PAINS).every((p) => p.hook && p.pain), 'message match: only the approved hooks, unknown pains leave the page as written');
  for (const r of ['road1', 'road3', 'road4']) ok(read(`public/${r}/index.html`).includes('Book the Boardroom · booking link coming up') && read(`public/${r}/index.html`).includes('id="story-list"'), `${r}: the Boardroom door says its link is coming up; the model stories have their place`);
  {
    const C = await import('../functions/api/count.js');
    const D = fakeD1(), env = { DB: D, MENTOR_KEY: 'k3y' };
    const hit = (b) => C.onRequestPost({ request: new Request('https://x/api/count', { method: 'POST', body: JSON.stringify(b) }), env });
    ok((await hit({ page: 'road4', moment: 'view' })).status === 200 && (await hit({ page: 'road4', moment: 'view' })).status === 200 && (await hit({ page: 'road9', moment: 'view' })).status === 400 && (await hit({ page: 'road4', moment: 'email' })).status === 400, 'counter: known pages and moments only');
    const r = await (await C.onRequestGet({ request: new Request('https://x/api/count?k=k3y'), env })).json();
    ok(r.pages.road4.view === 2 && r.pages.road1.view === 0 && (await C.onRequestGet({ request: new Request('https://x/api/count'), env })).status === 403, 'counter: read with the mentor key only, counts add up');
    ok(read('worker.js').includes("'/api/count': count"), 'counter: routed by the Worker');
  }
  // Round 3 (1 Nov): Today / Week twelve on all three pages, with the founder's own case; nothing typed.
  for (const r of ['road1', 'road3', 'road4']) ok(read(`public/${r}/index.html`).includes('<div id="nt"') && read(`public/${r}/index.html`).includes('id="nt-case"') && /nowThen\(/.test(read(`public/${r}/page.js`)), `${r}: today and week twelve, and the founder's own case`);
  ok(K.includes('Tap every line that is true this week') && K.includes('Why not lower?') && K.includes('.rk-nt .sw{order:9') && !/<textarea|type="text"/.test(K), 'own case: tap only; on a phone the switch sits at the bottom of the stack');
  {
    const C2 = await import('../functions/api/count.js');
    ok(['ba_flip', 'ba_mark', 'ready'].every((m) => C2.MOMENTS.includes(m)), 'counter: the frame and the ready scale are counted');
    const { noteFor: nf } = await import('../public/arrival.js');
    ok(nf({ landing: 'road4', ready: 7, why: ['I am tired of guessing'] }).includes('7 out of 10') && nf({ landing: 'road4', ready: 7, why: ['I am tired of guessing'] }).includes('“I am tired of guessing.”'), 'arrival note: their own number and their own reasons, said back');
  }
  ok(B1.includes('<details class="later" id="later">') && B1.indexOf('<details class="later"') < B1.indexOf('The Personal Leadership LAB') && B1.indexOf('</details>') > B1.indexOf('<p class="pprice">$1,989</p>') && B1.includes('Weeks <b>6–9</b>'), 'Road 1: the LAB, HUB and Summit behind one tap; the LAB opens weeks 6–9');
}
// The tag system (30 Oct): every tag is "linktolead" or "linktolead-<group>-<value>", lowercase, no spaces.
{
  const all = tagsFor({ landing: 'road21', tier: 'premium', stage: 'growing', weakest: 'lead-your-people', interest: 'Higher income', industry: 'Real estate', source: 'sales-page', signupType: 'full' });
  ok(all.every((x) => /^linktolead(-[a-z0-9.]+)*$/.test(x.name)), 'every tag follows linktolead-<group>-<value>');
  ok(!all.some((x) => /Industry|Interest|Signup|sales-page/.test(x.name)), 'industry, interest, form and source are not tags');
}
ok(!tagsFor({ landing: 'toString' }).some((x) => /road|north|summit/.test(x.name)), 'an unknown landing gets no landing tag');

// ── /start: the greeting ────────────────────────────────────────────────────
const APP = read('public/app.js');
ok(/const firstName = \(\) => \(pulled && state\.me/.test(APP) && /if \(r && r\.gone\) \{ account\.signOut\(\); state\.me = null/.test(APP), '/start greets with the first name of the account read on this visit, never a cached one');

done();
