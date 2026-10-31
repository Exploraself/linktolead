// The Massive Growth Plan (31 Oct 2026): 20 + 1 steps at the end of the North
// Star, every word from public/northstar/growth-plan.js. Founders tick a step
// when its "Done when" is true (/api/growth-plan, kept in plan_tick); the
// Account Plans' counts never include those ticks; /mentor shows them.

import vm from 'node:vm';
import fs from 'node:fs';
import { GROWTH_IDS, GROWTH_SQL } from '../functions/_growth.js';
import { ALL_STEP_IDS } from '../functions/_plans.js';
import * as growthApi from '../functions/api/growth-plan.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as planTick } from '../functions/api/plans/tick.js';
import { onRequestGet as plansGet } from '../functions/api/plans.js';
import { onRequestGet as mGet } from '../functions/api/mentor.js';
import worker, { ROUTES } from '../worker.js';
import { growthDone, growthGroups } from '../public/mentor/dash.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('growth');
const read = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');

// growth-plan.js and growth.js are plain browser scripts: run them as the page does.
const box = { window: {} };
vm.createContext(box);
vm.runInContext(read('public/northstar/growth-plan.js'), box);
vm.runInContext(read('public/northstar/growth.js'), box);
const GP = box.window.GrowthPlan, GV = box.window.GrowthView;

// ── The ids ─────────────────────────────────────────────────────────────────
const fileIds = [...GP.domains.flatMap((d) => d.steps.map((s) => s.id)), GP.plus.id];
ok(JSON.stringify(fileIds) === JSON.stringify(GROWTH_IDS), 'the server’s 21 ids are exactly the ids in growth-plan.js, in order');
ok(GROWTH_IDS.length === 21 && new Set(GROWTH_IDS).size === 21 && GROWTH_IDS.every((id, i) => id === `mgp-${i + 1}`), 'mgp-1 to mgp-21, each once');
ok(GP.domains.length === 4 && GP.domains.every((d) => d.steps.length === 5 && /^#[0-9A-F]{6}$/i.test(d.col)), 'four domains of five steps, each with its colour');
ok(JSON.stringify(GV.ids(GP)) === JSON.stringify(GROWTH_IDS), 'the page draws the same ids');
ok(!GROWTH_IDS.some((id) => ALL_STEP_IDS.includes(id)) && GROWTH_SQL.split(',').length === 21, 'no Growth Plan id is an Account Plan id');

// ── The page ────────────────────────────────────────────────────────────────
const H = read('public/northstar/index.html');
const at = (s) => H.indexOf(s);
ok(at('<script src="growth-plan.js"></script>') > 0 && at('<script src="growth-plan.js"></script>') < at('<script src="growth.js"></script>') && at('<script src="growth.js"></script>') < at('<script src="app.js"></script>'), 'growth-plan.js, then growth.js, load before app.js');
ok(at('id="s-plan"') < at('id="s-growth"') && at('id="s-growth"') < at('id="s-next"'), 'the plan is the last of the results: right after the action plan, before the next step');
const J = read('public/northstar/app.js');
ok(J.includes("put('s-growth', pGrowth())") && J.includes("case 'gp-tick': growthTick(v); return;") && J.includes("addEventListener('ftb:signedin', loadGrowth)"), 'app.js draws it, ticks it, and loads the ticks once signed in');
ok(J.includes("put('s-plan', pPlan(c));") && J.includes("case 'plan-pdf': downloadPlan(t); return;"), 'the action plan and its PDF are still drawn as before');
const words = [GP.name, GP.subtitle, GP.lead, ...GP.moves, ...GP.domains.flatMap((d) => d.steps.flatMap((s) => [s.title, s.truth, s.done, ...s.lines])), GP.plus.title, GP.plus.truth, GP.plus.done, ...GP.plus.voices.map((v) => v.q), ...GP.plus.downloads.flatMap((d) => [d.title, d.text])];
// Comments may name the plan; what the code draws may not copy it.
const bare = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/<!--[\s\S]*?-->/g, '');
const code = ['public/northstar/app.js', 'public/northstar/growth.js', 'public/northstar/index.html', 'public/mentor/mentor.js', 'public/mentor/dash.js', 'public/mentor/index.html', 'functions/api/growth-plan.js', 'functions/_growth.js'].map((f) => bare(read(f))).join('\n');
ok(words.every((w) => !code.includes(w)), 'no word of the plan is copied into code or markup');

// ── Drawing it ──────────────────────────────────────────────────────────────
let h = GV.html(GP, { done: {} });
ok((h.match(/class="gp-step( on)?"/g) || []).length === 21 && (h.match(/data-act="gp-tick"/g) || []).length === 21, '21 steps, each with a tick');
ok(h.includes('id="gp-h"') && H.includes('aria-labelledby="gp-h"'), 'the section is named by its own heading');
ok(GROWTH_IDS.every((id) => h.includes(`data-v="${id}"`)), 'every tick carries its step id');
ok(h.includes('<b>0</b> of 21 done') && (h.match(/<b>Done when<\/b>/g) || []).length === 21, 'progress “0 of 21 done”, and “Done when …” on every step');
ok(h.includes(GP.tagline) && /<i>realistic<\/i>/.test(h), 'the tagline is drawn as HTML (its <i>)');
ok(h.includes(`>${GP.lead}<`) && GP.moves.every((m) => h.includes(`<li>${m}</li>`)), 'the lead line and the five moves');
ok(GP.domains.every((d) => h.includes(`--c:${d.col}`) && h.includes(d.name) && h.includes(d.sub)), 'each domain in its colour, with its name and sub');
ok(/class="gp-n">1</.test(h) && /class="gp-n">20</.test(h) && /class="gp-n">21</.test(h), 'steps numbered 1 to 21');
ok(GP.plus.voices.every((v) => h.includes(v.name) && h.includes(v.q)), 'step 21: the four voices, name and question');
const nDl = GP.plus.downloads.length, noFile = GP.plus.downloads.filter((d) => !d.file).length;
ok(nDl >= 1 && GP.plus.downloads.every((d) => h.includes(d.title) && h.includes(d.text)), `step 21: its download${nDl > 1 ? 's' : ''}, title and text`);
ok((h.match(/Coming soon to your Library/g) || []).length === noFile && (!noFile || h.includes(`href="${GP.plus.library}"`)), 'a download without a file: “Coming soon to your Library”, linked to the Library');
const withFile = JSON.parse(JSON.stringify(GP)); withFile.plus.downloads.forEach((d, i) => { d.file = i ? undefined : '/library/planner-2027.pdf'; });
withFile.plus.downloads.push({ title: 'A second', text: 'Without a file yet.' });
const hf = GV.html(withFile, { done: {} });
ok(hf.includes('href="/library/planner-2027.pdf"') && (hf.match(/Coming soon to your Library/g) || []).length === withFile.plus.downloads.length - 1, 'a download with a file links the file; the others still say coming soon');
const L = GV.line('The first time I keep it: ______________ (day). Next “________”.');
ok(!L.includes('___') && (L.match(/class="gp-blank"/g) || []).length === 2 && L.includes('<small class="gp-hint">(day)</small>'), 'a run of ___ is a line to write on; (day) and (date) are small');
ok(/<span class="gp-bw">“<span class="gp-blank"[^]*?<\/span><\/span>”\.<\/span>/.test(L), 'a quote round a blank stays on its line');
ok(GV.line('<b>x</b> ____').startsWith('&lt;b&gt;'), 'step lines are escaped');
h = GV.html(GP, { done: { 'mgp-1': '2026-11-02T09:00:00.000Z', 'mgp-21': '2026-11-08T18:00:00.000Z' } });
ok(h.includes('<b>2</b> of 21 done') && (h.match(/aria-pressed="true"/g) || []).length === 2 && h.includes('2 Nov') && h.includes('8 Nov'), 'ticked steps show pressed, with their date; progress counts them');
ok(!/\b(he|him|his)\b/i.test(h.replace(/<[^>]+>/g, ' ')), 'founder-facing words never say he or him');
const CSS = read('public/northstar/crown.css');
ok(CSS.includes('.nsgp{') && CSS.includes('.cf[data-theme="dark"] .gp-dom') && CSS.includes('@media (prefers-reduced-motion:reduce){.gp-step'), 'styled for light and dark, still under reduced motion');

// ── The route ───────────────────────────────────────────────────────────────
ok(ROUTES['/api/growth-plan'] === growthApi && typeof growthApi.onRequestGet === 'function' && typeof growthApi.onRequestPost === 'function', 'worker.js routes /api/growth-plan (GET and POST)');
const env = { DB: fakeD1(), RESEND_API_KEY: 'k', MAIL_POSTAL_ADDRESS: 'ExploraSelf, Via Esempio 1, Rome', MENTOR_KEY: 'mentor-key-123', MAILCHIMP_MODE: 'test' };
fakeResend();
let r = await worker.fetch(get('/api/growth-plan'), env, {});
ok(r.status === 401 && /Sign in/.test((await r.json()).error), 'through the Worker: signed out is 401, not 404');
r = await worker.fetch(new Request('https://x/api/growth-plan', { method: 'DELETE' }), env, {});
ok(r.status === 405, 'other methods: 405');
ok(!/mailchimp/i.test(read('functions/api/growth-plan.js') + read('functions/_growth.js')), 'no Mailchimp, no tags');

// ── Ticks, signed in only ───────────────────────────────────────────────────
const token = (await (await signup({ request: post('/api/signup', { first: 'Gia', last: 'Grow', email: 'gia@example.com', consent: true, type: 'simple' }), env })).json()).token;
const G = async () => (await growthApi.onRequestGet({ request: get(`/api/growth-plan?t=${token}`), env })).json();
const T = async (step, d = true, t = token) => growthApi.onRequestPost({ request: post('/api/growth-plan', { token: t, step, done: d }), env });
let g = await G();
ok(g.ok && g.count === 0 && g.total === 21 && JSON.stringify(g.done) === '{}', 'a new founder: 0 of 21');
r = await T('mgp-1'); g = await r.json();
ok(r.status === 200 && g.count === 1 && g.done['mgp-1'], 'tick: saved, with its date');
const first = g.done['mgp-1'];
await T('mgp-1'); await T('mgp-21');
g = await G();
ok(g.count === 2 && g.done['mgp-1'] === first, 'ticked again: the first date stands');
g = await (await T('mgp-21', false)).json();
ok(g.count === 1 && !g.done['mgp-21'], 'untick');
ok((await T('mgp-22')).status === 400 && (await T('self-1')).status === 400 && (await T('made-up')).status === 400, 'only the 21 ids: no Account Plan id, no unknown id');
ok((await T('mgp-2', true, 'x'.repeat(48))).status === 401 && (await growthApi.onRequestGet({ request: get('/api/growth-plan'), env })).status === 401, 'signed out: 401, nothing saved');

// ── The Account Plans keep their own counts ─────────────────────────────────
await T('mgp-5'); await T('mgp-12');  // three Growth Plan ticks now: mgp-1, mgp-5, mgp-12
r = await (await planTick({ request: post('/api/plans/tick', { token, step: 'work-1', done: true }), env })).json();
ok(r.count === 1 && r.total === ALL_STEP_IDS.length, '/api/plans/tick: its count is the plans’ own (1, not 4)');
const P = await (await plansGet({ request: get(`/api/plans?t=${token}`), env })).json();
ok(P.count === 1 && P.total === ALL_STEP_IDS.length && Object.keys(P.done).join() === 'work-1', `/api/plans: 1 of ${ALL_STEP_IDS.length}, no Growth Plan tick in it`);
g = await G();
ok(g.count === 3 && !('work-1' in g.done), '/api/growth-plan: 3 of 21, no Account Plan tick in it');

// ── /mentor ─────────────────────────────────────────────────────────────────
const K = { 'x-mentor-key': 'mentor-key-123' };
const M = await (await mGet({ request: new Request('https://x/api/mentor', { headers: K }), env })).json();
const me = M.students.find((s) => s.email === 'gia@example.com');
ok(me.plan_ticks === 1 && me.growth_ticks === 3 && M.totalGrowth === 21 && M.totalSteps === ALL_STEP_IDS.length, 'roster: “Plan steps done” 1, growth 3 of 21, apart');
const D = growthDone(me);
ok(Object.keys(D).sort().join() === 'mgp-1,mgp-12,mgp-5' && D['mgp-1'] === first, 'roster: each Growth Plan tick with its date');
const groups = growthGroups(GP, D);
ok(groups.length === 2 && groups[0].name === GP.domains[0].name && groups[0].steps.map((s) => s.n).join() === '1,5' && groups[1].name === GP.domains[2].name && groups[1].steps[0].n === 12 && groups[1].steps[0].title === GP.domains[2].steps[1].title,
  'drawer: ticked steps grouped by domain, numbered, titled from the file');
ok(growthGroups(GP, { 'mgp-21': first }).map((x) => x.name).join() === GP.plus.move && growthGroups(GP, {}).length === 0, 'drawer: step 21 under its own name; nothing ticked, nothing shown');
const csv = await (await mGet({ request: new Request('https://x/api/mentor?csv=1', { headers: K }), env })).text();
const head = csv.split('\r\n')[0], row = csv.split('\r\n').find((l) => l.includes('gia@example.com'));
ok(head.endsWith('"Growth plan","Group","Blueprint levels","Crossed"') && head.includes('"Plan steps done"'), 'CSV: “Growth plan” just before Group, Blueprint levels, Crossed (still last)');
const cols = head.split(','), cells = row.split(',');
ok(cells[cols.indexOf('"Growth plan"')] === '"3"' && cells[cols.indexOf('"Plan steps done"')] === '"1"', 'CSV: Growth plan 3, Plan steps done 1');
const one = await (await mGet({ request: new Request(`https://x/api/mentor?student=${token}`, { headers: K }), env })).json();
ok(one.ticks.length === 1 && one.ticks[0].step_id === 'work-1' && one.growth.length === 3 && one.totalGrowth === 21, 'one founder: Account plans and Growth Plan ticks apart');
const MJ = read('public/mentor/mentor.js'), MH = read('public/mentor/index.html');
ok(MJ.includes('<th>Growth plan</th>') && MJ.includes('class="c-gp num"') && MJ.includes('<dt>Growth plan</dt>') && MJ.includes('gpList(s)'), '/mentor: the roster column, and the drawer line and list');
ok(MH.indexOf('<script src="/northstar/growth-plan.js"></script>') > 0 && MH.indexOf('/northstar/growth-plan.js') < MH.indexOf('/mentor/mentor.js'), '/mentor loads the plan’s words before the cockpit');
done();
