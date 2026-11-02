// The founder's toolkit (2 Nov 2026): the catalog, the three tools' sums, the
// routes (/api/tools, /api/course), "12 Days to Start Winning" (the welcome at
// once, one letter a morning from 8:00 the founder's time, nothing after day
// 13, unsubscribe stops it), the toolkit welcome, /mentor and the cron. Real
// routes on Node's own SQLite; Resend is faked.

import { readFileSync } from 'node:fs';
globalThis.window = globalThis.window || { matchMedia: () => ({ matches: false }) };
const { byKey: toolByKey, TOOLS, ORDER } = await import('../public/tools/tools-data.js');
import { CATALOG } from '../public/tools/catalog.js';
import { TOOL_LIST, TOOLS_TAG } from '../functions/_tools.js';
import { COURSE_LETTERS } from '../functions/_course-letters.js';
import { COURSE, LAST_DAY, due, localParts, courseLetter, sendDue } from '../functions/_course.js';
import { onRequestPost as toolsPost, onRequestGet as toolsGet } from '../functions/api/tools.js';
import { onRequestPost as coursePost, onRequestGet as courseGet } from '../functions/api/course.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestGet as mentorGet } from '../functions/api/mentor.js';
import { STUDENT_TABLES } from '../functions/_shared.js';
import { toolsWelcome } from '../functions/_letters.js';
import { ROUTES, JOBS } from '../worker.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('tools');
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const B = 'https://linktolead.exploraself.com';

// ── One catalog, the same names everywhere ──────────────────────────────────
const live = CATALOG.filter((c) => !c.soon);
ok(JSON.stringify(live.map((c) => c.key).sort()) === JSON.stringify(Object.keys(TOOL_LIST).sort()), 'catalog keys = server TOOL_LIST keys');
for (const c of live) ok(TOOL_LIST[c.key].name === c.name, `${c.key}: same name on the page and the server`);
const mentorNames = /export const TOOL_NAMES = (\{[^}]+\})/.exec(read('public/mentor/mentor.js'));
ok(mentorNames && JSON.stringify(Object.entries(Function('return ' + mentorNames[1])()).sort()) === JSON.stringify(Object.entries(TOOL_LIST).map(([k, v]) => [k, v.name]).sort()), '/mentor names = TOOL_LIST');
for (const k of ['runway', 'bottleneck', 'off-switch']) {
  ok(toolByKey(k) && toolByKey(k).path === `/${k}/`, `${k}: a tool with its own address`);
  const html = read(`public/${k}/index.html`);
  ok(html.includes(`data-tool="${k}"`) && html.includes('/tools/engine.js') && html.includes('/theme.js') && html.includes('id="cardcv"'), `${k}: page loads the engine, theme and card canvas`);
}
ok(TOOLS_TAG === 'TOOLS', 'the Mailchimp tag is Alexandru’s own name: TOOLS');
ok(CATALOG.filter((c) => c.domain === 'yourself').map((c) => c.key).join() === 'off-switch,12-days', 'Lead yourself: the off-switch check and the 12 days');
ok(CATALOG.find((c) => c.domain === 'market').soon === true, 'Lead the market: an honest “being built” tile, no link');
const covers = read('public/tools/catalog.js');
for (const h of ['Your bank balance is <em>lying to you.</em>', 'What stops <em>when you stop?</em>', 'Your laptop is closed. <em>Is your head?</em>', 'Lead your day <em>before it leads you.</em>']) ok(covers.includes(h), `cover A: ${h.replace(/<\/?em>/g, '')}`);
const days = read('public/12-days/days.js');
const D12 = JSON.parse(/export const DAYS12 = (\[[\s\S]*?\]);/.exec(days)[1].replace(/'/g, '"'));
ok(JSON.stringify(D12) === JSON.stringify(COURSE_LETTERS.slice(1, 13).map((l) => l.subject.replace(/^Day \d+ · /, ''))), '/12-days/ lists the letters’ own subjects');
const toolkit = read('public/toolkit/index.html');
ok(!/<a\s[^>]*href=/.test(toolkit) && !toolkit.includes('pmhost'), '/toolkit/: one offer, no links out, no menu');
ok(toolkit.includes('The founder’s toolkit. <em>For the cash, the team, the evenings and the mornings.</em>'), '/toolkit/: the approved headline');
for (const f of ['public/tools/catalog.js', 'public/tools/tools-data.js', 'public/toolkit/index.html', 'public/12-days/index.html', 'functions/_course-letters.js', 'functions/_letters.js']) {
  const s = read(f);
  // 'compass' stays a landing key in code; it must never be a word a founder reads.
  ok(!/most founders|incubator|constellation|[^'"]\bcompass\b[^'"]/i.test(s.replace(/\/\/.*$/gm, '').replace(/'compass'/g, '')), `${f}: no banned words`);
  ok(!/12 Principles in 12 Days/.test(s), `${f}: the old course name is gone`);
}

// ── The sums: the founder's own numbers, nothing else ───────────────────────
const cash = toolByKey('runway');
let a = { look: 1, cash: 20000, costs: 10000, payin: 1, enough: 4000, promised: 5000, owed: 3000, late: 2000, day: 2, who: 'Miller & Co.' };
let c = cash.calc(a);
ok(c.free === 15000 && Math.abs(c.weekly - 10000 * 12 / 52) < 1e-9 && Math.abs(c.A - 15000 / (10000 * 12 / 52)) < 1e-9, 'runway: (cash − promised) ÷ a normal week');
ok(cash.insight(a).big === '7 weeks', 'runway: rounded, said in weeks');
ok(cash.result(a, { name: 'Maria' }).h === 'Maria, your runway is about 7 weeks.', 'runway: the reading speaks to the founder');
ok(cash.insight({ ...a, promised: 25000 }).big === '$5,000 short', 'runway: promises bigger than the cash say so plainly');
const bn = toolByKey('bottleneck');
a = { people: 1, stop: 60, waiting: 12, wait: 2, hours: 55, need: 20, back: 4, day: 0, decision: 'refunds up to $100', owner: 'Marta' };
ok(bn.calc(a).habit === 35 && bn.insight(a).big === '12 decisions', 'bottleneck: hours by habit = worked − needed');
ok(bn.result(a, { name: '' }).action.startsWith('Hand “refunds up to $100” to Marta.'), 'bottleneck: the handover names the decision and the person');
const off = toolByKey('off-switch');
a = { where: 0, off: 2, extra: 6, checks: 5, reply: 2, value: 0, day: 3, time: 1, urgent: '', phone: 'a kitchen drawer' };
ok(off.calc(a).year === 312 && off.insight(a).big === '5 of 7', 'off-switch: × 52 if last week was normal');
for (const id of ORDER) ok(/^Free with your ExploraSelf account\./.test(TOOLS[id].intro.fine), `${id}: the fine print says an account, not “no sign-up”`);

// ── The 12 days: words and timing ───────────────────────────────────────────
ok(COURSE_LETTERS.length === 14 && LAST_DAY === 13, '14 letters: the welcome, 12 days, what next');
const art = JSON.parse(read('tests/fixtures/12-days-letters.json'));
for (const L of COURSE_LETTERS.slice(1, 13)) {
  const book = L.paras.find((p) => typeof p === 'string' && p.includes('In the book'));
  const src = art.find((x) => x.id === L.id).text;
  ok(book && src.includes(book), `${L.id}: the principle and its line from the book, word for word as reviewed`);
}
let W = courseLetter(B, 0, { first: 'Sam', tz: 'America/New_York' });
ok(W.subject === 'Welcome. Your 12 days start tomorrow' && W.text.startsWith('Hi Sam,\n\nAlexandru from ExploraSelf here.') && W.text.includes('Thank you for joining 12 Days to Start Winning.'), 'welcome: the greeting, the personal line, the new name');
ok(W.text.includes('P.S. The whole book behind these letters') && W.text.includes(B + '/ground-plan/#library'), 'welcome: its own P.S. with the library link');
let D1 = courseLetter(B, 1, { first: 'Sam' });
ok(D1.html.includes('Open Level 01 · Enough →') && D1.html.includes(`href="${B}/ground-plan/#programme"`) && D1.text.includes('My Day 1 answer'), 'day 1: the button to the move and the one-tap reply');
ok(courseLetter(B, 12, {}).text.includes('Book a 1:1 with me in The Boardroom') && !courseLetter(B, 13, {}).text.includes('Unshakeable assessment. It shows'), 'day 12 carries the one paid mention; day 13 its own P.S.');
ok(courseLetter(B, 14) === null, 'nothing after day 13');

const at = (iso) => new Date(iso);
const NY = 'America/New_York';
ok(localParts(NY, at('2026-11-02T12:30:00Z')).date === '2026-11-02' && localParts(NY, at('2026-11-02T12:30:00Z')).hour === 7, 'local date and hour in the founder’s zone');
ok(localParts('Not/AZone', at('2026-11-02T12:30:00Z')).zone === NY, 'an unknown zone falls back to New York');
let sub = { day_sent: -1, tz: NY, last_local: null };
ok(due(sub, at('2026-11-02T03:00:00Z')).day === 0, 'the welcome is owed at once, any hour');
sub = { day_sent: 0, tz: NY, last_local: '2026-11-02' };
ok(due(sub, at('2026-11-02T22:00:00Z')) === null, 'day 1 never the same day as the welcome');
ok(due(sub, at('2026-11-03T12:30:00Z')) === null, 'day 1 not before 8:00 their time (7:30 in New York)');
ok(due(sub, at('2026-11-03T13:05:00Z')).day === 1, 'day 1 from 8:00 their time');
ok(due({ ...sub, tz: 'Europe/Rome' }, at('2026-11-03T07:05:00Z')).day === 1, 'Rome gets it at 8:05 Rome time');
ok(due(sub, at('2026-11-04T02:30:00Z')) === null, 'never after 21:00 their time');
ok(due({ day_sent: 13, tz: NY }, at('2026-11-20T14:00:00Z')) === null && due({ day_sent: 4, tz: NY, stopped_at: 'x' }, at('2026-11-20T14:00:00Z')) === null, 'nothing after day 13, nothing once stopped');

// ── The routes ──────────────────────────────────────────────────────────────
const DB = fakeD1();
const env = { DB, RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MENTOR_KEY: 'mk' };
let sent = fakeResend();
const jsonOf = async (r) => [r.status, await r.json()];

// A sign-up from a tool: the toolkit welcome, not the Launchpad one.
const maria = { first: 'Maria', last: 'Rossi', email: 'maria@example.com', consent: true, source: 'home', type: 'full', company: 'Rossi Studio', interest: 'Steady clients',
  industry: 'Creative & design', password: 'longenough1', confirm: 'longenough1', door: 'tools', path: '/runway/', tz: NY };
let [st, j] = await jsonOf(await signup({ request: post('/api/signup', maria), env }));
const token = j.token;
ok(st === 200 && token, 'a full account from a tool');
ok(sent.length === 1 && sent[0].body.subject === 'Your toolkit is open' && sent[0].body.html.includes(`${B}/runway/`), 'tool sign-up: the toolkit welcome, opening the tool they came from');
ok(toolsWelcome(B, { first: 'X', path: 'javascript:alert(1)' }).html.includes(`${B}/tools/`), 'toolkit welcome: a strange path falls back to the Tools page');

[st, j] = await jsonOf(await toolsPost({ request: post('/api/tools', { token, tool: 'runway', step: 'open' }), env }));
ok(st === 200 && DB.raw.prepare("SELECT COUNT(*) n FROM event WHERE student_id = ? AND kind = 'tool-open' AND detail = 'runway'").get(token).n === 1, '/api/tools open: logged');
[st] = await jsonOf(await toolsPost({ request: post('/api/tools', { token, tool: 'payroll', step: 'open' }), env }));
ok(st === 404, '/api/tools: an unknown tool is refused');
[st] = await jsonOf(await toolsPost({ request: post('/api/tools', { token: 'x'.repeat(48), tool: 'runway', step: 'open' }), env }));
ok(st === 401, '/api/tools: no account, no entry');
await toolsPost({ request: post('/api/tools', { token, tool: 'runway', step: 'done', answers: { cash: 20000 }, summary: '7 weeks' }), env });
[st, j] = await jsonOf(await toolsGet({ request: get(`/api/tools?t=${token}`), env }));
ok(j.ok && j.used.runway && j.used.runway.summary === '7 weeks' && j.course === null, '/api/tools GET: what was used, and the 12 days not started');

// Start the 12 days: the welcome goes at once.
sent = fakeResend();
[st, j] = await jsonOf(await coursePost({ request: post('/api/course', { token, action: 'start', tz: NY }), env }));
ok(st === 200 && j.sub && j.sub.day === 0 && !j.sub.stopped, 'start: subscribed, the welcome sent');
ok(sent.length === 1 && sent[0].body.subject === 'Welcome. Your 12 days start tomorrow' && sent[0].body.to[0] === 'maria@example.com', 'start: one welcome letter');
ok(sent[0].body.text.includes('started 12 Days to Start Winning at linktolead.exploraself.com') && sent[0].body.headers['List-Unsubscribe'], 'start: footer says why, and how to unsubscribe');
ok(DB.raw.prepare("SELECT COUNT(*) n FROM event WHERE student_id = ? AND kind = 'tool-open' AND detail = '12-days'").get(token).n === 1, 'start: counts as opening the 12 days (tag TOOLS)');
sent = fakeResend();
await coursePost({ request: post('/api/course', { token, action: 'start', tz: NY }), env });
ok(sent.length === 0, 'start twice: no second welcome');

// The hourly run.
const row = () => DB.raw.prepare('SELECT * FROM course_sub WHERE student_id = ? AND course = ?').get(token, COURSE);
DB.raw.prepare('UPDATE course_sub SET last_local = ? WHERE student_id = ?').run('2026-11-02', token);
let out = await sendDue(env, DB, B, at('2026-11-02T20:00:00Z'));
ok(out.sent === 0 && sent.length === 0, 'cron: nothing more the same day');
out = await sendDue(env, DB, B, at('2026-11-03T13:07:00Z'));
ok(out.sent === 1 && sent.length === 1 && sent[0].body.subject === 'Day 1 · What is the money for?' && row().day_sent === 1 && row().last_local === '2026-11-03', 'cron: Day 1 at 8:07 their time');
out = await sendDue(env, DB, B, at('2026-11-03T14:07:00Z'));
ok(out.sent === 0, 'cron: one letter a day');
[st, j] = await jsonOf(await courseGet({ request: get(`/api/course?t=${token}`), env }));
ok(j.sub.day === 1 && j.last === 13, '/api/course GET: the day they are on');
[st, j] = await jsonOf(await coursePost({ request: post('/api/course', { token, action: 'stop' }), env }));
ok(j.sub.stopped && (await sendDue(env, DB, B, at('2026-11-04T13:07:00Z'))).sent === 0, 'stop: no more letters');
await coursePost({ request: post('/api/course', { token, action: 'start', tz: NY }), env });
sent = fakeResend();
out = await sendDue(env, DB, B, at('2026-11-04T13:07:00Z'));
ok(out.sent === 1 && sent[0].body.subject.startsWith('Day 2 ·'), 'start again: carries on from where it stopped');
DB.raw.prepare('UPDATE student_profile SET unsubscribed = 1 WHERE student_id = ?').run(token);
out = await sendDue(env, DB, B, at('2026-11-05T13:07:00Z'));
ok(out.sent === 0 && row().stopped_at, 'unsubscribed: the letters stop');
DB.raw.prepare('UPDATE course_sub SET stopped_at = NULL, day_sent = 12, last_local = ? WHERE student_id = ?').run('2026-11-05', token);
DB.raw.prepare('UPDATE student_profile SET unsubscribed = 0 WHERE student_id = ?').run(token);
sent = fakeResend();
await sendDue(env, DB, B, at('2026-11-06T13:07:00Z'));
await sendDue(env, DB, B, at('2026-11-07T13:07:00Z'));
ok(sent.length === 1 && sent[0].body.subject === 'What next: see where you stand' && row().day_sent === 13, 'day 13 is the last letter');
ok((await sendDue({ DB }, DB, B, at('2026-11-08T13:07:00Z'))).sent === 0, 'no email key: nothing sent, nothing breaks');

// /mentor and the delete list.
const r = await mentorGet({ request: new Request(`${B}/api/mentor?csv=1`, { headers: { 'x-mentor-key': 'mk' } }), env });
const csv = await r.text();
ok(csv.split('\r\n')[0].includes('"Tools"') && csv.split('\r\n')[0].includes('"12 Days to Start Winning"'), '/mentor CSV: Tools and the 12 days');
ok(csv.includes('Cash runway; 12 Days to Start Winning') || csv.includes('12 Days to Start Winning; Cash runway'), '/mentor CSV: which tools this founder opened');
ok(csv.includes('day 13 of 13'), '/mentor CSV: where they are in the 12 days');
ok(STUDENT_TABLES.includes('tool_run') && STUDENT_TABLES.includes('course_sub'), 'a deleted account takes its tool answers and letters with it');

// The worker: the routes and the hourly job.
ok(ROUTES['/api/tools'] && ROUTES['/api/course'] && typeof JOBS['course-letters'] === 'function', 'worker: two routes and the 12-day job');
ok(/\[triggers\][\s\S]*crons = \["7 \* \* \* \*"\]/.test(read('wrangler.toml')), 'wrangler.toml: the hourly cron');
ok(read('public/profile-menu.js').includes("['/tools/', 'Your toolkit'"), 'profile menu: Your toolkit, on the North Star and in Base Camp');

done();
