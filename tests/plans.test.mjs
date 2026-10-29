// The Account Plans: the data, the order each founder sees, and the ticks.

import { DOMAIN_STEPS, WHATIF_STEPS, ALL_STEP_IDS, planFor, leverMoved } from '../functions/_plans.js';
import { onRequestGet as plansGet } from '../functions/api/plans.js';
import { onRequestPost as tick } from '../functions/api/plans/tick.js';
import { onRequestPost as signup } from '../functions/api/signup.js';
import { onRequestPost as compassPost } from '../functions/api/compass.js';
import { fakeD1, fakeResend, post, get, tally } from './_d1.mjs';

const { ok, done } = tally('plans');

// ── The data ────────────────────────────────────────────────────────────────
const ids = [];
for (const d of ['self', 'people', 'work', 'market']) for (let i = 1; i <= 4; i++) ids.push(`${d}-${i}`);
for (const l of ['price', 'message', 'hours', 'handover']) for (let i = 1; i <= 4; i++) ids.push(`${l}-${i}`);
ok(ALL_STEP_IDS.length === 32 && new Set(ALL_STEP_IDS).size === 32, '32 distinct step ids (28 + the draft four for fewer hours)');
for (const id of ids) ok(ALL_STEP_IDS.includes(id), `step ${id} exists`);
ok(DOMAIN_STEPS.length === 16 && WHATIF_STEPS.length === 16, '16 domain steps and 16 What-if steps');
for (const s of DOMAIN_STEPS) {
  ok(['id', 'domain', 'title', 'why', 'what', 'about', 'done', 'ask'].every((k) => typeof s[k] === 'string' && s[k].length > 3), `${s.id}: all six parts`);
  ok(s.band && ['now', 'shape', 'strength'].every((k) => typeof s.band[k] === 'string' && s.band[k]), `${s.id}: three band notes`);
}
for (const s of WHATIF_STEPS) {
  ok(['what', 'about', 'done', 'title'].every((k) => typeof s[k] === 'string' && s[k]) && ['self', 'people', 'work', 'market'].includes(s.domain), `${s.id}: what, about, done and the domain it trains`);
  ok(s.why === null && s.ask === null && s.band === null, `${s.id}: nothing invented where the document gives nothing`);
}
ok(DOMAIN_STEPS.find((s) => s.id === 'people-3').variant.now === 'solo' && DOMAIN_STEPS.find((s) => s.id === 'market-1').variant.now === 'no customers yet', 'solo and no-customers variants kept');
ok(!JSON.stringify([...DOMAIN_STEPS, ...WHATIF_STEPS]).match(/\b(SELF|PEOPLE|WORK|MARKET)\b/), 'no short domain labels in the data');

// ── The order ───────────────────────────────────────────────────────────────
const all = [2, 2, 2, 2];
let p = planFor({ scores: [5, 4, 1, 3], answered: all });
ok(p.domains.map((d) => d.id).join() === 'work,self,people,market', 'lowest domain first, the rest in the fixed order');
ok(p.domains[0].first === true && p.domains.filter((d) => d.first).length === 1, 'only the lowest is marked first');
p = planFor({ scores: [4, 2, 6, 2], answered: all });
ok(p.domains.map((d) => d.id).join() === 'people,self,work,market', 'a tie for lowest goes to the earlier in the fixed order');
p = planFor({ scores: [3, 3, 3, 3], answered: all });
ok(p.domains.map((d) => d.id).join() === 'self,people,work,market', 'all equal: the fixed order');
p = planFor({});
ok(p.domains.map((d) => d.id).join() === 'self,people,work,market' && p.domains.every((d) => d.band === null && d.steps.every((s) => s.note === null)), 'nothing answered: fixed order, no band, no note');
p = planFor({ scores: [0, 4, 5, 6], answered: [0, 2, 2, 2] });
ok(p.domains[0].id === 'people' && p.domains.find((d) => d.id === 'self').band === null, 'an unanswered domain is not "lowest" and has no band');

// Band notes.
p = planFor({ scores: [1, 3, 5, 2], answered: all });
const by = Object.fromEntries(p.domains.map((d) => [d.id, d]));
ok(by.self.band === 'now' && by.self.bandName === 'Needs you now' && by.self.steps[0].note === 'Write them even if they feel obvious.', 'score 0–2: Needs you now note');
ok(by.people.band === 'shape' && by.people.steps[1].note === 'Make it a monthly hour.', 'score 3–4: Taking shape note');
ok(by.work.band === 'strength' && by.work.steps[0].note === 'Track it every month.', 'score 5–6: A strength note');
ok(by.market.steps[0].noteFor === 'no customers yet' && by.people.steps[2].noteFor === null, 'a variant is named only on the band it was written for');
ok(by.self.steps.length === 4 && by.self.steps.every((s) => s.domain === 'self'), 'four steps per domain, each in its domain');

// Pain and goal.
p = planFor({ scores: all, answered: all, pains: ['cash', 'time', 'bogus'], want: 'freedom' });
const pb = Object.fromEntries(p.domains.map((d) => [d.id, d]));
ok(pb.work.said.join() === 'Cash is tight' && pb.self.said.join() === 'No time for myself' && !pb.people.said.length && !pb.market.said.length, '"You said" on the pain\'s domain only');
ok(pb.self.goal === 'Your goal, more free time, runs through here.' && !pb.work.goal && !pb.market.goal, 'the goal flag on the goal\'s domain only');
p = planFor({ scores: all, answered: all, pains: ['alone'], want: 'grow' });
ok(p.domains.find((d) => d.id === 'people').said[0] === 'Doing everything myself' && p.domains.find((d) => d.id === 'market').goal.includes('a new market'), 'other pain and goal mappings');

// The What-if plan: the lever moved most, as a share of its range.
ok(planFor({ lab: { p: 0, m: 0, d: 0 } }).whatif === null && planFor({}).whatif === null, 'no lever moved: no What-if plan');
ok(planFor({ lab: { p: 25, m: 40, d: 0 } }).whatif.id === 'message', '+25% of 200 loses to +40% of 100');
ok(planFor({ lab: { p: 100, m: 40, d: 0 } }).whatif.id === 'price', '+100% of 200 beats +40% of 100');
ok(planFor({ lab: { p: 20, m: 30, f: 30, d: 10 } }).whatif.id === 'hours', 'fewer hours: 30 of 50 beats the rest');
ok(planFor({ lab: { f: 10 } }).whatif.steps.map((s) => s.id).join() === 'hours-1,hours-2,hours-3,hours-4', 'the draft plan for fewer hours');
ok(planFor({ lab: { p: 10, m: 60, d: 30 } }).whatif.id === 'message', '60% of 100 beats 30% of 60 and 10% of 50');
ok(planFor({ lab: { p: 20, m: 30, d: 45 } }).whatif.id === 'handover', '45 of 60 beats the rest');
const wf = planFor({ lab: { d: 5 } }).whatif;
ok(wf.steps.length === 4 && wf.steps.map((s) => s.id).join() === 'handover-1,handover-2,handover-3,handover-4' && wf.steps[1].domainName === 'Lead your people', 'the What-if plan: four steps, each naming its domain in full');
ok(leverMoved({ p: -10 }) === null, 'a negative value is not a move');

// ── The routes ─────────────────────────────────────────────────────────────
fakeResend();
const env = { DB: fakeD1() };
let r = await plansGet({ request: get('/api/plans'), env });
let j = await r.json();
ok(r.status === 401 && !j.domains && !j.whatif, 'no token: 401 and nothing returned');
r = await plansGet({ request: get('/api/plans?t=' + 'a'.repeat(48)), env });
ok(r.status === 401 && !(await r.json()).domains, 'a wrong token: 401 and nothing returned');

r = await signup({ request: post('/api/signup', { first: 'Ana', email: 'ana@example.com' }), env });
const token = (await r.json()).token;
r = await plansGet({ request: get('/api/plans?t=' + token), env });
j = await r.json();
ok(r.status === 200 && j.compass === false && j.domains.length === 4 && j.whatif === null && j.count === 0 && j.total === 32, 'before the Compass: the fixed order, 0 of 32');

await compassPost({ request: post('/api/compass', { token, stage: 'building', answers: { v: 2 },
  results: { scores: [6, 6, 0, 3], answered: all }, flags: { pains: ['clients'], want: 'income', lab: { p: 0, m: 50, d: 0 } } }), env });
r = await plansGet({ request: get('/api/plans?t=' + token), env });
j = await r.json();
ok(j.domains[0].id === 'work' && j.domains[0].band === 'now' && j.domains[0].goal && j.domains.find((d) => d.id === 'market').said[0] === 'Not enough clients', 'after the Compass: its order, band, pain and goal');
ok(j.whatif && j.whatif.id === 'message', 'after the Compass: the What-if plan for the lever moved most');

// Ticks.
r = await tick({ request: post('/api/plans/tick', { token, step: 'work-1', done: true }), env });
j = await r.json();
ok(r.status === 200 && j.count === 1 && j.total === 32, 'a tick counts: 1 of 32');
await tick({ request: post('/api/plans/tick', { token, step: 'work-1', done: true }), env });
await tick({ request: post('/api/plans/tick', { token, step: 'message-2', done: true }), env });
r = await plansGet({ request: get('/api/plans?t=' + token), env });
j = await r.json();
ok(j.count === 2 && j.done['work-1'] && j.done['message-2'], 'ticking twice counts once; What-if steps count too');
r = await tick({ request: post('/api/plans/tick', { token, step: 'work-1', done: false }), env });
ok((await r.json()).count === 1, 'unticking takes it off');
r = await tick({ request: post('/api/plans/tick', { token, step: 'made-up', done: true }), env });
ok(r.status === 400, 'an unknown step is refused');
r = await tick({ request: post('/api/plans/tick', { token: 'x'.repeat(48), step: 'work-1', done: true }), env });
ok(r.status === 401, 'no valid token: no tick');
ok(!env.DB.raw.prepare("SELECT COUNT(*) n FROM compass WHERE flags_json LIKE '%got%'").get().n, 'ticks never touch the Compass record (or its launchpad)');

done();
