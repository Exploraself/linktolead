// Two sales pages, one account, the Ground Plan, then a password when the
// Launchpad starts: the FULL and SIMPLE forms (POST /api/signup), the password
// gate (POST /api/complete, simple → full), the Mailchimp tags in TEST mode,
// /mentor's view of it all, "/" and its redirect, and on the Compass sales
// page the "Your plan, live" badge, the lever-1 figure and the live lab.
// No network: Mailchimp is in TEST mode and Resend is faked.

import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as complete } from '../functions/api/complete.js';
import { onRequestGet as stateGet } from '../functions/api/state.js';
import { onRequestPost as login } from '../functions/api/login.js';
import { onRequestGet as mGet } from '../functions/api/mentor.js';
import { INTERESTS, INDUSTRIES, details, missing } from '../functions/_profile.js';
import * as F from '../public/forms.js';
import { summary, filter } from '../public/mentor/dash.js';
import { levelsHTML, band } from '../public/home-page.js';
import { weekTitle } from '../public/content.js';
import { baseFrom } from '../public/compass/welcome/lab.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const require = createRequire(import.meta.url);
const E = require('../public/compass/engine.js');
const SalesMath = require('../public/compass/welcome/sales.js');
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const { ok, done } = tally('forms');

// ── The lists ───────────────────────────────────────────────────────────────
ok(JSON.stringify(F.INTERESTS) === JSON.stringify(INTERESTS) && JSON.stringify(F.INDUSTRIES) === JSON.stringify(INDUSTRIES), 'the forms and the server offer the same lists');
ok(JSON.stringify(INTERESTS) === JSON.stringify(E.GOALS.map((g) => g[1])), 'interests are the Compass goals: More free time … A new market');
const compassList = /const INDUSTRIES = (\[[^\]]+\]);/.exec(read('public/compass/app.js'))[1];
ok(JSON.stringify(INDUSTRIES) === JSON.stringify(JSON.parse(compassList.replace(/'/g, '"'))), 'industries are the Compass box’s own list');
ok(details({}).problem === 'Your company’s name, or tick “No company yet”.' && details({ noCompany: true }).problem === 'Choose what you want most from the business.'
  && details({ company: 'Acme', interest: 'Higher income' }).problem === 'Choose your industry.' && details({ company: 'Acme', interest: 'Higher income', industry: 'Other' }).problem === '', 'full details: company or none, interest, industry, in that order');
ok(details({ noCompany: true, interest: 'Higher income', industry: 'Other' }).company === '' && details({}).company === null, '"No company yet" is kept as an empty company; never asked is null');
ok(JSON.stringify(missing({ company: '', interest: 'Higher income', industry: 'Other' })) === '[]' && JSON.stringify(missing({ company: null })) === '["company","interest","industry"]', 'what a profile still lacks');

// ── The forms ───────────────────────────────────────────────────────────────
const env = { DB: fakeD1(), RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MENTOR_KEY: 'mentor-key-123', MAILCHIMP_MODE: 'test', MAILCHIMP_API_KEY: 'k-us19' };
fakeResend();
const S = async (body) => { const r = await signup({ request: post('/api/signup', body), env }); return [r.status, await r.json()]; };
const prof = (id) => env.DB.raw.prepare('SELECT signup_type, company, interest, industry FROM student_profile WHERE student_id = ?').get(id);
const mcLog = (id) => env.DB.raw.prepare('SELECT detail FROM mailchimp_log WHERE student_id = ? ORDER BY id').all(id).map((r) => r.detail).join(' ');

let [st, out] = await S({ first: 'Fay', last: 'Full', email: 'fay@example.com', consent: true, source: 'sales-page', type: 'full', interest: 'Higher income', industry: 'Real estate' });
ok(st === 400 && /company/.test(out.error), 'full form: no company and no tick is refused');
[st, out] = await S({ first: 'Fay', last: 'Full', email: 'fay@example.com', consent: true, source: 'sales-page', type: 'full', company: 'Fay & Co', interest: 'Higher income', industry: 'Real estate' });
const fay = out.token;
ok(st === 200 && fay && JSON.stringify(prof(fay)) === JSON.stringify({ signup_type: 'full', company: 'Fay & Co', interest: 'Higher income', industry: 'Real estate' }), 'full form: one record, signed in, with company, interest and industry');
ok(/"Signup - Full".*"Interest - Higher income".*"Industry - Real estate"/.test(mcLog(fay)) && /"COMPANY":"Fay & Co"/.test(mcLog(fay)), 'Mailchimp (TEST): "Signup - Full", interest and industry tags, COMPANY merge field');
[st, out] = await S({ first: 'Sam', last: 'Simple', email: 'sam@example.com', consent: true, source: 'home', type: 'simple' });
const sam = out.token;
ok(st === 200 && sam && JSON.stringify(prof(sam)) === JSON.stringify({ signup_type: 'simple', company: null, interest: null, industry: null }), 'simple form: one record, signed in, signup_type simple');
ok(/"Signup - Simple"/.test(mcLog(sam)) && !/Signup - Full/.test(mcLog(sam)) && /"home"/.test(mcLog(sam)), 'Mailchimp (TEST): "Signup - Simple" and the "home" source');
[st, out] = await S({ first: 'Nia', last: 'None', email: 'nia@example.com', consent: false, type: 'simple' });
ok(st === 200 && out.token && mcLog(out.token) === '', 'no consent: the account is made, nothing goes to Mailchimp');

// ── The password gate ───────────────────────────────────────────────────────
let me = (await (await stateGet({ request: get('/api/state?t=' + sam), env })).json()).me;
ok(me.hasPassword === false && me.signupType === 'simple' && JSON.stringify(me.needs) === '["company","interest","industry"]', 'state: no password yet, and what the gate must also ask');
const G = async (token, body) => { const r = await complete({ request: post('/api/complete', { token, ...body }, '7.7.7.' + Math.floor(Math.random() * 200)), env }); return [r.status, await r.json()]; };
[st, out] = await G(sam, { password: 'a-long-password', confirm: 'a-long-password' });
ok(st === 400 && /company/.test(out.error), 'gate (simple): the details are required');
[st, out] = await G(sam, { company: 'Sam Ltd', interest: 'Steady clients', industry: 'Other', password: 'short', confirm: 'short' });
ok(st === 400 && /10 characters/.test(out.error), 'gate: the PR #34 password rules');
[st, out] = await G(sam, { company: 'Sam Ltd', interest: 'Steady clients', industry: 'Other', password: 'a-long-password', confirm: 'another-one-here' });
ok(st === 400, 'gate: the two passwords must match');
ok((await G('nobody-at-all-here-0000', { password: 'a-long-password', confirm: 'a-long-password' }))[0] === 401, 'gate: signed in only');
[st, out] = await G(sam, { company: 'Sam Ltd', interest: 'Steady clients', industry: 'Other', password: 'a-long-password', confirm: 'a-long-password' });
ok(st === 200 && out.signupType === 'full' && JSON.stringify(prof(sam)) === JSON.stringify({ signup_type: 'full', company: 'Sam Ltd', interest: 'Steady clients', industry: 'Other' }), 'gate: simple → full, with the details');
me = (await (await stateGet({ request: get('/api/state?t=' + sam), env })).json()).me;
ok(me.hasPassword === true && me.needs.length === 0, 'after the gate: a password, nothing missing');
ok(/"Signup - Full"/.test(mcLog(sam)) && /"Interest - Steady clients"/.test(mcLog(sam)) && /"COMPANY":"Sam Ltd"/.test(mcLog(sam)), 'Mailchimp (TEST): "Signup - Full" added when a simple founder completes');
ok(env.DB.raw.prepare("SELECT detail FROM event WHERE student_id = ? AND kind = 'signup-complete'").get(sam).detail === 'simple → full', 'the change is logged');
const r = await login({ request: post('/api/login', { email: 'sam@example.com', password: 'a-long-password' }), env });
ok(r.status === 200 && (await r.json()).token === sam, 'sign-in: email and password');
const bad = await login({ request: post('/api/login', { email: 'sam@example.com', password: 'wrong-password-x' }), env });
ok(/Forgot your password\? Email me a sign-in link/.test((await bad.json()).error), 'a wrong password points to "Forgot your password? Email me a sign-in link"');
[st, out] = await G(fay, { password: 'fay-long-password', confirm: 'fay-long-password' });
ok(st === 200 && prof(fay).signup_type === 'full', 'gate (full): only the password is needed');

// ── /mentor ─────────────────────────────────────────────────────────────────
const L = await (await mGet({ request: new Request('https://x/api/mentor', { headers: { 'x-mentor-key': 'mentor-key-123' } }), env })).json();
const row = (e) => L.students.find((s) => s.email === e);
ok(row('sam@example.com').signup_type === 'full' && row('sam@example.com').company === 'Sam Ltd' && row('fay@example.com').interest === 'Higher income' && row('nia@example.com').signup_type === 'simple', '/mentor: signup type, company, interest per founder');
const Sm = summary(L.students, []);
ok(Sm.full === 2 && Sm.simple === 1 && Sm.noPassword === 1 && filter(L.students, { tile: 'simple' }).length === 1 && filter(L.students, { tile: 'nopw' })[0].email === 'nia@example.com', '/mentor: Full / Simple filters, and who has no password yet');
const csv = await (await mGet({ request: new Request('https://x/api/mentor?csv=1', { headers: { 'x-mentor-key': 'mentor-key-123' } }), env })).text();
ok(/"Sign-up form","Company","Interest","Industry"/.test(csv) && csv.includes('"Sam Ltd"'), 'CSV: the new columns');

// ── "/" and its redirect ────────────────────────────────────────────────────
ok(/^\/compass\/welcome-a\s+\/\s+301$/m.test(read('public/_redirects')) && !existsSync(new URL('../public/compass/welcome-a/index.html', import.meta.url)), '/compass/welcome-a → / (301), and its old page is gone');
const H = read('public/index.html');
ok(H.includes('The Leadership Compass shows which one you are in.') && H.includes('<b>Your free account</b><span>One minute. Name and email.</span>') && H.includes('<b>Your Ground Plan</b><span>Your stage and your first three moves.</span>'), '"/": the Compass line and the three steps');
for (const [n, p] of [['The Founder Launchpad', 'No cost'], ['The Boardroom', 'One 1:1 session'], ['The LAB', '$97'], ['The HUB', '$397'], ['The Summit', '$1,989']]) ok(H.includes(`<b>${n}</b>`) && H.includes(`<span class="pr">${p}</span>`), `"/": ${n} · ${p}`);
ok(H.includes('All twelve + Alexandru every week') && H.includes('Start tonight, free. <em>By Tuesday, you’ll be ahead.</em>') && H.includes('>Start free →</button>') && H.includes('Levels 01–03 free · Instant access'), '"/": The Summit line and the close');
ok(!/PHOTO|\[ ?PHOTO/.test(H) && (H.match(/data-join/g) || []).length === 2 && read('public/home-page.js').includes("variant: 'simple'"), '"/": no photo placeholder; every Join opens the simple form');
ok(read('public/home-page.js').includes("$('#backbar').hidden = false") && H.includes('Go to your Ground Plan →'), '"/": signed in, a bar back to the Ground Plan');
ok(levelsHTML('build').includes(`<p>${weekTitle('build', 1)}</p>`) && (levelsHTML('grow').match(/<li/g) || []).length === 12, 'level names come from content.js');
ok([1, 3, 4, 5, 6, 11, 12].map(band).join() === 'free,free,with,with,,,last', 'the levels’ bands: open, with Alexandru, LAB and HUB, the last');

// ── /compass/welcome: Your plan, live ───────────────────────────────────────
const P = SalesMath.plan({ goal: 6000, price: 400, keep: 60, hps: 8, avail: 140 });
ok(P.badge === 'OVER YOUR HOURS' && P.over === 60, 'badge: over the hours you want is "OVER YOUR HOURS", 60 h over');
ok(P.paysAtHours === 4080, 'lever 1: 6,000 / 400 / 60% / 8 h / 140 h → 4,080');
ok(SalesMath.plan({ goal: 1000, price: 400, keep: 60, hps: 8, avail: 140 }).badge === 'IT FITS' && SalesMath.plan({ goal: 3900, price: 400, keep: 60, hps: 8, avail: 140 }).badge === 'TIGHT', 'badge: IT FITS and TIGHT unchanged');
ok(!read('public/compass/welcome/sales.js').includes('IN THE RED'), 'no "IN THE RED" left');
const W = read('public/compass/welcome/index.html');
ok(W.includes('1 · What do you want the business to pay you each month (before tax)?') && W.includes('Not counted: the hours you spend finding clients and running the business.') && W.includes('At your hours, this plan pays about <b data-out="paysAtHours"></b>.'), 'plan live: the new question, the note under the bar, the lever-1 line');
ok(W.includes('<h2 class="h2 win4-h">A win has four sides.</h2>') && (W.match(/<button type="button" data-dom=/g) || []).length === 4 && W.includes('A win is where all four meet.') && read('public/compass/welcome/sales.css').includes('prefers-reduced-motion:reduce){.win4-box'), 'four sides: overlapping circles, four buttons, the caption, reduced motion');
ok(W.includes('That was five sliders. Now pull the four levers.'), 'a look inside: the new heading');
const b = baseFrom({ goal: 6000, price: 400, keep: 60, hps: 8, avail: 140 });
const t = E.month(b, {}, 'time');
ok(b.clients === 25 && t.cash === 6000 && t.mine === 200 && b.limit === 140, 'the lab starts from the five numbers: 25 sales, 6,000 left, 200 hours, 140 wanted');
ok(E.month(b, { p: 50 }, 'time').mine < t.mine && E.month(b, { p: 50 }, 'money').cash > t.cash, 'the levers move it through the Compass engine');
ok(/E\.month\(/.test(read('public/compass/welcome/lab.js')) && !/function month\(/.test(read('public/compass/welcome/lab.js')), 'the lab reuses engine.js, it does not copy the logic');

done();
