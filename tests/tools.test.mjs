// The free tools (Alexandru, 2 Nov 2026): the toolkit by the four domains,
// the access rule (a full free account), the tag TOOLS, each use kept for
// /mentor, and 12 Days to Start Winning: its letters and its clock (8:00
// local, once a day, never twice, stops after Day 13, honours unsubscribe).

import fs from 'node:fs';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestGet as toolsGet, onRequestPost as toolsPost, TOOL_NAMES, RESULT_MAX } from '../functions/api/tools.js';
import { onRequestGet as mGet } from '../functions/api/mentor.js';
import { onRequestGet as unsub } from '../functions/api/unsubscribe.js';
import { onRequestPost as accountDelete } from '../functions/api/account-delete.js';
import { LETTERS, PRINCIPLES, twelveDayLetter, twelveDaysTick, localNow, due, NAME, WHY, LAST_DAY, teamLine } from '../functions/_twelve-days.js';
import { LANDINGS } from '../functions/_profile.js';
import { LANDING_TAGS, TOOLS_TAG } from '../functions/_mailchimp.js';
import { STUDENT_TABLES } from '../functions/_shared.js';
import { DOMAINS, CATALOG, TOOLS, byDomain } from '../public/tools/catalog.js';
import { BY_PAGE, NS_URL } from '../public/tools/engine.js';
import worker, { ROUTES } from '../worker.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('tools');
const read = (p) => fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8');

// ── The catalog: by the four domains, in their order ─────────────────────────
ok(DOMAINS.map((d) => d.name).join() === 'Lead yourself,Lead your people,Lead your business,Lead the market', 'the four domains, in order');
const G = byDomain();
ok(G.map((d) => d.tools.map((t) => t.name).join('+')).join(' | ') === 'The off-switch check+12 Days to Start Winning | The bottleneck test | Cash runway | Next here', 'the hub: each tool in its domain, in order');
const soon = G[3].tools[0];
ok(soon.soon && soon.line === 'Templates to find your clients. Being built.' && !soon.href, 'Lead the market: one honest tile, being built, no link');
ok(JSON.stringify(Object.keys(TOOLS).sort()) === JSON.stringify(Object.keys(TOOL_NAMES).sort()) && Object.keys(TOOLS).every((k) => TOOLS[k].name === TOOL_NAMES[k]), 'the catalog and the server name the same tools');
ok(byDomain([...CATALOG, { id: 'teleprompter', domain: 'market', name: 'Teleprompter', line: 'x', href: '/teleprompter/' }])[3].tools.length === 2, 'a new tool is one entry');
const COVERS = {
  runway: ['Your bank balance is <em>lying to you.</em>', 'Tax, a supplier, payroll: some of it already has a name on it. How many weeks are really yours?', 'Free · 60 seconds', 'Your weeks, in your numbers'],
  bottleneck: ['What stops <em>when you stop?</em>', 'Your team isn’t stuck. They’re waiting for you. Count the decisions on your desk.', 'Free · 2 minutes', 'One decision to hand over'],
  'off-switch': ['Your laptop is closed. <em>Is your head?</em>', 'See who really gets your evenings, and win one back this week.', 'Free · 90 seconds', 'One evening that is yours'],
  'twelve-days': ['Lead your day <em>before it leads you.</em>', '12 mornings. One principle and one ten-minute move in your inbox before the day starts.', 'Free · 12 mornings', 'One principle, one move'],
};
for (const [id, [h, sub, s0, s1]] of Object.entries(COVERS)) {
  const c = TOOLS[id].cover;
  ok(c.h === h && c.sub === sub && c.strip[0] === s0 && c.strip[1] === s1 && /^<svg viewBox="0 0 260 120" aria-hidden="true">/.test(c.svg), `${id}: the approved cover`);
}
for (const id of ['runway', 'bottleneck', 'off-switch']) {
  ok(BY_PAGE[id] && BY_PAGE[id].qs.length >= 9 && read(`public/${id}/index.html`).includes(`data-tool="${id}"`), `/${id}/: its page and its tool`);
  const r = BY_PAGE[id].result({}, { name: '' });
  ok(r && r.lines.length === 4 && r.quote && r.quote.t, `${id}: four lines and a book quote`);
}
ok(NS_URL === '/northstar/', 'the one button: The Leader’s North Star');
ok(BY_PAGE.runway.result({}, {}).quote.t === 'A cash balance carries promises within it.'
  && BY_PAGE.bottleneck.result({ waiting: 1 }, {}).quote.t === 'Often the constraint is the founder’s approval. Check your own desk first.'
  && BY_PAGE['off-switch'].result({ off: 1, extra: 1, checks: 1, where: 0, reply: 0, value: 0, time: 0, day: 0 }, {}).quote.t === 'Founders do not burn out because they work hard. They burn out because the push never ends. Choose your season. Then choose your restore.', 'the three book quotes, word for word');
// Every number a tool shows is the founder's own, or a plain sum of them.
const cash = BY_PAGE.runway.calc({ cash: 20000, costs: 10000, payin: 0, promised: 5000, owed: 0, late: 0 });
ok(cash.free === 15000 && Math.abs(cash.A - 15000 / (10000 * 12 / 52)) < 1e-9 && cash.B === null && cash.C === null, 'cash runway: (cash − promised) ÷ a week of costs');
ok(BY_PAGE.bottleneck.calc({ hours: 50, need: 20, wait: 1 }).habit === 30, 'bottleneck: hours − hours that needed you');
ok(BY_PAGE['off-switch'].calc({ off: 3, extra: 8, checks: 5 }).year === 416, 'off-switch: extra hours × 52');

// ── The pages ───────────────────────────────────────────────────────────────
const PAGES = ['public/tools/index.html', 'public/runway/index.html', 'public/bottleneck/index.html', 'public/off-switch/index.html', 'public/12-days/index.html', 'public/toolkit/index.html'];
for (const f of PAGES) {
  const h = read(f);
  ok(h.indexOf('<script src="/theme.js"></script>') > 0 && h.indexOf('<script src="/theme.js"></script>') < h.indexOf('stylesheet'), `${f}: light and dark`);
  ok(h.includes('href="/assets/fonts.css"') && !h.includes('googleapis') && h.includes('rel="preload" href="/assets/fonts/newsreader.woff2"'), `${f}: the site's own fonts`);
  ok(h.includes('width=device-width'), `${f}: a phone viewport`);
}
const css = read('public/tools/tools.css');
ok(css.includes('prefers-reduced-motion') && css.includes('max-width:640px') && css.includes('overflow-x:hidden'), 'tools.css: reduced motion, the phone layout, no sideways scroll');
// /toolkit/: one offer, one button, no links out.
const kit = read('public/toolkit/index.html');
ok(!/<a\s/i.test(kit.replace(/<!--[\s\S]*?-->/g, '')), '/toolkit/: no links out');
ok((kit.match(/<button/g) || []).length === 2 && kit.includes('id="join"') && kit.includes('data-theme-switch'), '/toolkit/: one button (and the light switch)');
ok(kit.includes('The founder’s toolkit. <em>For the cash, the team, the evenings and the mornings.</em>'), '/toolkit/: the headline');
for (const b of ['Bonus · The Leader’s Growth Planner 2027</b><span>Your agenda and weekly check-in in one book.', 'Bonus · Built to Lead</b><span>99 practical tools, the digital copy.',
  'Bonus · Worth Building</b><span>32 leadership frameworks, the digital copy.', 'Bonus · The Massive Growth Plan</b><span>20 + 1 steps, yours to keep.']) ok(kit.includes(b), `/toolkit/: ${b.split('<')[0]}`);
const tk = read('public/tools/toolkit.js');
ok(tk.includes("landing: 'tools'") && tk.includes("variant: 'full'") && tk.includes('steps: true') && tk.includes("const HUB = '/tools/'"), '/toolkit/: the button makes the full account (landing tools) and lands on /tools/');

// ── The access rule, on the page ─────────────────────────────────────────────
const ac = read('public/tools/access.js');
ok(ac.includes("variant: 'full', landing: 'tools', steps: true, inline: true") && ac.includes('onExisting: (email) => signin(email, true)'), 'signed out: the full form, one field at a time, in the page; an existing email signs in here');
ok(ac.includes("if (Array.isArray(me.missing) && me.missing.length)") && ac.includes('One thing before the tool') && ac.includes('A.complete(f)'), 'details missing: only those, once (/api/complete)');
ok(ac.includes('Same account. One tap, nothing to type.') && ac.includes('data-open'), 'a full account: one button, nothing to type');
// One password field template, with its eye; every password field is made from it.
ok((ac.match(/type="password"/g) || []).length === 1 && /const pwField = [^\n]*type="password"[^\n]*data-eye=/.test(ac) && (ac.match(/pwField\('/g) || []).length === 2, 'every password field has its show-password eye');
const AB = read('public/account-box.js');
ok(AB.includes('function stepper(gate, variant)') && AB.includes('if (ctx.steps) stepper(gate, variant);') && AB.includes("tools: ['YOUR FREE TOOLKIT', 'Open your free toolkit'"), 'the account box: one field at a time, opt-in');
ok(AB.includes('data-eye="${id}"') && AB.includes("{ els: [lab('j-pw'), fine]"), 'the account box keeps its eye in every step');

// ── Menu entries ────────────────────────────────────────────────────────────
const app = read('public/app.js');
const nav = app.slice(app.indexOf('function drawNav()'), app.indexOf('function render()'));
ok((app.match(/href="\/tools\/"/g) || []).length === 1 && nav.includes('href="/tools/"') && nav.includes('>Tools</a>') && nav.includes('[data-go="library"]'), 'Base Camp: one Tools entry in the dashboard menu, after the Library');
ok(/\['tools', '<svg[^\]]*'Tools', '\/tools\/'\]\]/.test(read('public/northstar/app.js')), 'The North Star: a Tools entry in its menu');

// ── The server ──────────────────────────────────────────────────────────────
ok(LANDINGS.includes('tools') && LANDING_TAGS.tools === 'TOOLS' && TOOLS_TAG === 'TOOLS', 'landing tools, tag TOOLS (exactly that name)');
ok(ROUTES['/api/tools'] && typeof worker.scheduled === 'function', 'worker: the route and the clock');
ok(/\[triggers\]\s*\ncrons = \["0 \* \* \* \*"\]/.test(read('wrangler.toml')), 'wrangler.toml: every hour on the hour');
ok(STUDENT_TABLES.includes('tool_use') && STUDENT_TABLES.includes('twelve_days'), 'a deleted account takes its tools and 12 Days with it');

const env = { DB: fakeD1(), RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MENTOR_KEY: 'mentor-key-123', MAILCHIMP_MODE: 'test', MAILCHIMP_API_KEY: 'k-us19' };
const raw = env.DB.raw;
let sent = fakeResend();
const J = async (r) => [r.status, await r.json()];
const full = (email, more = {}) => ({ first: 'Sam', last: 'Ray', email, consent: true, type: 'full', landing: 'tools', source: 'home', company: 'Acme', interest: 'Higher income', industry: 'Other', password: 'a-long-password', confirm: 'a-long-password', tz: 'Europe/Rome', ...more });
const make = async (body) => (await (await signup({ request: post('/api/signup', body), env })).json()).token;
const use = (token, tool, event, result) => toolsPost({ request: post('/api/tools', { token, tool, event, ...(result ? { result } : {}) }), env });
const mcLog = (id) => raw.prepare("SELECT action, detail FROM mailchimp_log WHERE student_id = ? ORDER BY id").all(id);

const sam = await make(full('sam@example.com'));
const pia = await make({ first: 'Pia', last: 'Lund', email: 'pia@example.com', consent: true, type: 'simple', landing: 'road3' });
ok(sam && pia, 'two accounts: a full one from the tools, a simple one');
ok(raw.prepare('SELECT landing FROM student_profile WHERE student_id = ?').get(sam).landing === 'tools', 'a sign-up from a tool is stored with landing tools');
ok(mcLog(sam).some((r) => r.action === 'join' && r.detail.includes('"name":"TOOLS"')), 'a sign-up from a tool joins Mailchimp with the tag TOOLS');

// The rule on the server: signed out, details missing, full.
let [s, b] = await J(await use('', 'runway', 'open'));
ok(s === 401, 'signed out: refused');
[s, b] = await J(await use(pia, 'runway', 'open'));
ok(s === 403 && JSON.stringify(b.missing) === JSON.stringify(['company', 'interest', 'industry', 'password']), 'details missing: refused, with what is missing');
ok(!raw.prepare('SELECT COUNT(*) AS n FROM tool_use WHERE student_id = ?').get(pia).n, 'nothing kept for an account that is not full');
[s, b] = await J(await use(sam, 'runway', 'open'));
ok(s === 200 && b.ok && b.kept, 'a full account: the tool opens and the use is kept');
[s] = await J(await use(sam, 'nope', 'open'));
ok(s === 404, 'an unknown tool: refused');
[s] = await J(await use(sam, 'runway', 'subscribe'));
ok(s === 400, 'only 12 Days takes a subscribe');

// Tag TOOLS, the first time each tool opens.
const tags = () => mcLog(sam).filter((r) => r.action === 'tag' && r.detail.includes('"name":"TOOLS"')).length;
ok(tags() === 1, 'the first open: tagged TOOLS');
await use(sam, 'runway', 'open');
ok(tags() === 1, 'the same tool again: no second tag');
await use(sam, 'bottleneck', 'open');
ok(tags() === 2, 'another tool: tagged again (tags only accumulate)');

// The result, kept as JSON.
const result = { summary: 'About 7 weeks of runway', answers: { cash: 20000, costs: 10000, promised: 5000 }, sums: { free: 15000, A: 6.5 }, day: '2026-11-03', step: 'Today: one page of cash.' };
[s, b] = await J(await use(sam, 'runway', 'result', result));
const row = raw.prepare("SELECT result_json, at FROM tool_use WHERE student_id = ? AND kind = 'result'").get(sam);
ok(s === 200 && row && JSON.parse(row.result_json).summary === 'About 7 weeks of runway' && JSON.parse(row.result_json).answers.cash === 20000 && row.at, 'tool use saved: tool, time and the result as JSON');
ok(tags() === 2, 'a result adds no tag');
[s] = await J(await use(sam, 'runway', 'result', { summary: 'x'.repeat(RESULT_MAX) }));
ok(s === 413, 'a result too long to keep is refused');
[s, b] = await J(await toolsGet({ request: get(`/api/tools?t=${sam}`), env }));
ok(s === 200 && b.uses.length === 4 && b.uses[0].tool === 'runway' && b.uses[0].kind === 'result' && b.twelve === null && b.principles.length === 0, 'GET: the uses, newest first; no 12 Days yet, and no titles');

// ── 12 Days to Start Winning ────────────────────────────────────────────────
sent.length = 0;
[s, b] = await J(await use(sam, 'twelve-days', 'subscribe'));
ok(s === 200 && b.subscribed && !b.already && b.welcome && !b.lettersOff && b.twelve.day === 0, 'subscribe: in, the welcome goes at once');
ok(JSON.stringify(b.principles) === JSON.stringify(PRINCIPLES) && PRINCIPLES.length === 12 && PRINCIPLES[0] === 'Decide what winning is for' && PRINCIPLES[11] === 'Review, repair and hand on', 'the twelve titles come only with the subscription');
ok(sent.length === 1 && sent[0].body.subject === 'Welcome. Your 12 days start tomorrow' && sent[0].body.text.includes('Thank you for joining 12 Days to Start Winning.') && sent[0].body.text.includes(WHY), 'the welcome letter, with the footer');
ok(tags() === 3, 'subscribing tags TOOLS too');
[s, b] = await J(await use(sam, 'twelve-days', 'subscribe'));
ok(b.already && sent.length === 1, 'a second subscribe changes nothing and sends nothing');

// The clock. Sam is in Rome (8:00 there is 07:00 UTC in November); Ola has no
// time zone, so New York (8:00 there is 13:00 UTC).
const ola = await make(full('ola@example.com', { first: 'Ola', tz: '' }));
raw.prepare('UPDATE student_profile SET tz = NULL WHERE student_id = ?').run(ola);
await use(ola, 'twelve-days', 'subscribe');
raw.prepare("UPDATE twelve_days SET last_local_date = '2026-11-02'").run(); // both joined on 2 Nov
const T = (iso) => new Date(iso);
const dayOf = (id) => raw.prepare('SELECT last_day FROM twelve_days WHERE student_id = ?').get(id).last_day;
ok(localNow('Europe/Rome', T('2026-11-03T07:00:00Z')).hour === 8 && localNow('', T('2026-11-03T13:00:00Z')).hour === 8 && localNow('Not/AZone', T('2026-11-03T13:00:00Z')).zone === 'America/New_York', '8:00 where they are; New York when the zone is unknown');
sent.length = 0;
let out = await twelveDaysTick(env, T('2026-11-02T07:00:00Z'));
ok(out.sent === 0 && dayOf(sam) === 0, 'never on the day they joined');
out = await twelveDaysTick(env, T('2026-11-03T06:00:00Z'));
ok(out.sent === 0, '7:00 in Rome: nothing yet');
out = await twelveDaysTick(env, T('2026-11-03T07:00:00Z'));
ok(out.sent === 1 && dayOf(sam) === 1 && dayOf(ola) === 0 && sent[0].body.subject === 'Day 1 · What is the money for?' && sent[0].body.to[0] === 'sam@example.com', '8:00 in Rome: Day 1 to Sam only');
out = await twelveDaysTick(env, T('2026-11-03T07:00:00Z'));
ok(out.sent === 0 && dayOf(sam) === 1, 'the same hour again: never twice');
out = await twelveDaysTick(env, T('2026-11-03T08:00:00Z'));
ok(out.sent === 0, '9:00 in Rome: nothing');
out = await twelveDaysTick(env, T('2026-11-03T13:00:00Z'));
ok(out.sent === 1 && dayOf(ola) === 1 && sent[1].body.to[0] === 'ola@example.com', '8:00 in New York: Day 1 to Ola');
// Two runs at once: one letter.
const both = await Promise.all([twelveDaysTick(env, T('2026-11-04T07:00:00Z')), twelveDaysTick(env, T('2026-11-04T07:00:00Z'))]);
ok(both[0].sent + both[1].sent === 1 && dayOf(sam) === 2, 'two runs at the same moment send one letter');
// A letter that does not send goes the next morning, not twice.
sent = fakeResend(false);
out = await twelveDaysTick(env, T('2026-11-05T07:00:00Z'));
ok(out.failed === 1 && dayOf(sam) === 2, 'a failed send is released');
sent = fakeResend();
out = await twelveDaysTick(env, T('2026-11-06T07:00:00Z'));
ok(out.sent === 1 && dayOf(sam) === 3 && sent[0].body.subject.startsWith('Day 3 ·'), '…and goes the next morning');
// Unsubscribe and pause stop it; letters back on, it goes on.
const unsubId = raw.prepare('SELECT unsub_id FROM student_profile WHERE student_id = ?').get(sam).unsub_id;
await unsub({ request: get(`/api/unsubscribe?u=${unsubId}`), env });
out = await twelveDaysTick(env, T('2026-11-07T07:00:00Z'));
ok(out.sent === 0 && dayOf(sam) === 3, 'unsubscribed: nothing');
raw.prepare('UPDATE student_profile SET unsubscribed = 0 WHERE student_id = ?').run(sam);
raw.prepare('INSERT INTO account_auth (student_id, paused) VALUES (?, 1) ON CONFLICT(student_id) DO UPDATE SET paused = 1').run(sam);
out = await twelveDaysTick(env, T('2026-11-08T07:00:00Z'));
ok(out.sent === 0 && dayOf(sam) === 3, 'paused: nothing');
raw.prepare('UPDATE account_auth SET paused = 0 WHERE student_id = ?').run(sam);
// Through to Day 13, one a day, then nothing more.
sent.length = 0;
for (let d = 9; d <= 30; d++) await twelveDaysTick(env, T(`2026-11-${String(d).padStart(2, '0')}T07:00:00Z`));
ok(dayOf(sam) === LAST_DAY && sent.length === LAST_DAY - 3, 'one a day, up to Day 13');
ok(sent[sent.length - 1].body.subject === 'What next: see where you stand' && sent.map((m) => m.body.subject).filter((x) => /^Day \d+ ·/.test(x)).length === 9, 'Day 13 is the last: what next');
out = await twelveDaysTick(env, T('2026-12-01T07:00:00Z'));
ok(out.sent === 0 && out.checked === 1, 'after Day 13: nothing more (only Ola is still on)');
ok(due({ last_day: 13, tz: 'Europe/Rome' }, T('2026-12-02T07:00:00Z')) === null && due({ last_day: 0, tz: 'Europe/Rome', last_local_date: '2026-12-01' }, T('2026-12-02T07:00:00Z')).day === 1, 'due(): the rule on its own');
ok((await twelveDaysTick({ DB: env.DB }, T('2026-12-02T13:00:00Z'))).sent === 0, 'no email set up: the clock sends nothing');

// ── The letters ─────────────────────────────────────────────────────────────
ok(LETTERS.length === 14 && LETTERS.map((L) => L.day).join() === '0,1,2,3,4,5,6,7,8,9,10,11,12,13', 'fourteen letters: the welcome, Days 1–12, what next');
const QUOTES = ['A worthwhile business begins with a definition of a worthwhile life.', 'The founder is a person before a role, and character is practised in ordinary commitments.',
  'Responsibility begins by separating what you know from what you hope.', 'The week is where your stated priorities become visible commitments.',
  'A standard is a value with a behaviour, a boundary and a response when it is missed.', 'Care takes another person seriously enough to be honest, specific and open to correction.',
  'Responsibility becomes workable when authority, capability and support accompany it.', 'Economic clarity protects the choices and obligations the business is meant to sustain.',
  'A useful system makes reliable work easier while preserving human judgment.', 'Growth earns its place through what it makes possible and the consequences it asks people to carry.',
  'Leadership creates conditions in which other people can develop and exercise judgment.', 'Integrity includes examining consequences and changing the arrangement when reality requires it.'];
for (let d = 0; d <= 13; d++) {
  const L = twelveDayLetter('https://linktolead.exploraself.com', d, { first: 'Sam', tz: 'Europe/Rome', at: T('2026-11-03T07:00:00Z') });
  const t = L.text;
  ok(t.startsWith('Hi Sam,') && t.includes(teamLine(d)) && t.includes('Just reply to this email') && t.includes('\nAlexandru\nAlexandru Cojocari · ExploraSelf') && t.includes('\nP.S. ') && L.html.includes('/mail/signature.png'),
    `letter ${d}: greeting, the team and I are here, reply, signature, P.S.`);
  if (d >= 1 && d <= 12) ok(t.includes(`Principle ${String(d).padStart(2, '0')}: `) && t.includes(`“${QUOTES[d - 1]}”`) && t.includes(`Day ${d} of 12`) && t.includes('Done when:'), `Day ${d}: its principle, the quote word for word, one step`);
}
ok(twelveDayLetter('https://x', 0, {}).text.includes('Alexandru from ExploraSelf here.') && twelveDayLetter('https://x', 13, {}).text.includes('Open my North Star →: https://x/northstar/'), 'the welcome opens with Alexandru’s line; Day 13 points to the North Star');
ok(twelveDayLetter('https://x', 14, {}) === null && NAME === '12 Days to Start Winning', 'no Day 14');

// ── /mentor: per founder, which tools and when, and their 12 Days ───────────
const K = { 'x-mentor-key': 'mentor-key-123' };
const [ms, md] = await J(await mGet({ request: new Request(`https://x/api/mentor?student=${sam}`, { headers: K }), env }));
ok(ms === 200 && md.tools.some((u) => u.tool === 'runway' && u.kind === 'result' && u.result.summary === 'About 7 weeks of runway' && u.at) && md.tools.some((u) => u.tool === 'bottleneck' && u.kind === 'open'), '/mentor: each use, with its date and result');
ok(md.twelve && md.twelve.last_day === 13 && md.twelve.words.startsWith('Finished'), '/mentor: where they are in 12 Days');
const [, roster] = await J(await mGet({ request: new Request('https://x/api/mentor', { headers: K }), env }));
const rs = roster.students.find((x) => x.id === sam);
ok(rs.tools.split(',').sort().join() === 'bottleneck,runway,twelve-days' && rs.twelve_day === 13 && rs.landing === 'tools', '/mentor roster: the tools used, 12 Days, landing tools');
const csv = await (await mGet({ request: new Request('https://x/api/mentor?csv=1', { headers: K }), env })).text();
const samRow = csv.split('\r\n').find((l) => l.includes('sam@example.com')) || '';
ok(csv.split('\r\n')[0].includes('"Tools","12 Days","Growth plan"') && samRow.includes('Cash runway') && samRow.includes('The bottleneck test') && samRow.includes('"Finished (all 12 and what next)"'), '/mentor CSV: Tools and 12 Days');
const mj = read('public/mentor/mentor.js');
ok(mj.includes('<dt>Tools</dt>') && mj.includes('<dt>12 Days</dt>') && mj.includes('<h2>Tools</h2>') && mj.includes("['tools', 'Used a tool']"), '/mentor page: tools and 12 Days in the drawer, a Tools panel, a filter');

// A deleted account takes its tools and 12 Days with it.
await accountDelete({ request: post('/api/account-delete', { token: ola, confirm: 'ola@example.com' }), env });
ok(!raw.prepare('SELECT COUNT(*) AS n FROM tool_use WHERE student_id = ?').get(ola).n && !raw.prepare('SELECT COUNT(*) AS n FROM twelve_days WHERE student_id = ?').get(ola).n, 'deleting an account deletes its tools and 12 Days');

// ── Words ───────────────────────────────────────────────────────────────────
const strip = (s) => s.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const COPY = [...PAGES, 'public/tools/catalog.js', 'public/tools/engine.js', 'public/tools/run.js', 'public/tools/access.js', 'public/tools/hub.js', 'public/tools/twelve.js', 'public/tools/toolkit.js', 'public/tools/cover.js', 'functions/_twelve-days.js'];
const letterText = LETTERS.map((L) => twelveDayLetter('https://x', L.day, {}).text).join('\n');
for (const f of COPY) {
  const s = strip(read(f)) + (f === 'functions/_twelve-days.js' ? letterText : '');
  ok(!/compass|incubator|most founders|constellation|zodiac|horoscope|astrolog|star sign/i.test(s), `${f}: no banned words`);
  ok(!/free[^.]{0,40}unshakeable|unshakeable[^.]{0,40}\bfree\b/i.test(s), `${f}: Unshakeable is never called free`);
  ok(!/12 Principles in 12 Days/.test(s), `${f}: the new name only`);
}
for (const f of [...PAGES, 'public/tools/access.js', 'public/tools/twelve.js', 'public/tools/hub.js', 'public/tools/catalog.js']) {
  ok(!/Alexandru[^.]{0,60}\b(he|him|his)\b/i.test(strip(read(f))), `${f}: no he/him for Alexandru`);
}
ok(!/\$\d/.test(strip(read('public/toolkit/index.html')) + strip(read('public/tools/index.html'))), 'no prices on the toolkit pages');

done();
