// The Leadership Compass engine: scoring, the twelve feedback versions, the
// launchpad, what the numbers tell you, and the What-if lab.
//
// The rule that matters most: every figure comes from what the founder
// entered. A blank stays blank, and nothing is said before it can be.

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const E = require('../public/compass/engine.js');
const M = require('../public/compass/model.js');

let passed = 0, failed = 0;
const ok = (cond, msg) => { if (cond) passed++; else { failed++; console.error('FAIL:', msg); } };
const money = (x) => '$' + Math.round(x).toLocaleString('en-US');
const blank = (over = {}) => Object.assign({ stage: 'building', mode: 'yes', ans: {}, str: {}, got: {}, nums: {}, lab: {} }, over);

// Eight questions per stage, two per domain, in domain order.
for (const st of E.STAGES) {
  const qs = E.questionsFor(M, st.id);
  ok(qs.length === 8, `${st.id}: eight questions`);
  ok(qs.map((q) => q.domain).join() === 'self,self,people,people,work,work,market,market', `${st.id}: two per domain, in order`);
}

// Bands: 0–2 Needs you now, 3–4 Taking shape, 5–6 A strength.
ok([0, 1, 2, 3, 4, 5, 6].map(E.band).join() === '0,0,0,1,1,2,2', 'band thresholds');
ok(E.FEEDBACK.length === 4 && E.FEEDBACK.every((d) => d.length === 3 && d.every((c) => c.big && c.why && c.feel.length === 3 && c.ask && c.deep && c.week)), 'twelve complete feedback versions');

// Scores follow the stage's own questions.
const qs = E.questionsFor(M, 'building');
const s1 = blank({ ans: { [qs[0].id]: 3, [qs[1].id]: 2, [qs[6].id]: 0 } });
const sc = E.scores(M, s1);
ok(sc[0].score === 5 && sc[0].answered === 2 && sc[0].band === 2, 'Lead yourself scored from its two answers');
ok(sc[3].score === 0 && sc[3].answered === 1, 'one answer counts as one answered');
ok(E.scores(M, blank({ stage: 'growing', ans: s1.ans }))[0].answered === 0, 'another stage does not borrow these answers');

// Reading: nothing until something is answered or rated; then strongest and lowest.
ok(E.reading(E.scores(M, blank()), {}).hi === null, 'no reading before any input');
const rd = E.reading(sc, { 3: 5 });
ok(rd.hi === 3 && rd.lo === 1, 'strongest and lowest from answers plus strengths');

// Launchpad: four pieces a domain, sixteen in all.
const pc = E.pieces(sc, { 0: 4 }, { 0: true });
ok(pc.per[0] === 4 && pc.total === 5, 'pieces = answers + strength + got it');

// Feedback personalised by pains and goal, on the right domain only.
const f2 = E.feedback(2, { answered: 2, score: 1, band: 0 }, ['cash', 'time'], 'income');
ok(f2.pains.join() === 'Cash is tight' && f2.goalLine.includes('higher income'), 'pain and goal land on Lead your business');
ok(E.feedback(0, { answered: 0, score: 0, band: 0 }, [], '').band === 'Not answered yet', 'no band before an answer');

// Numbers: a range is its middle and an estimate; typed is exact; unsure is unknown.
ok(E.valueOf({ pick: '0' }, E.GROUPS.yes[0].fields[0][2]).v === 500, 'Under 1,000 reads as about 500');
ok(E.valueOf({ pick: '0' }, E.GROUPS.yes[0].fields[0][2]).est === true, 'a range is an estimate');
ok(E.valueOf({ pick: 'own', own: '1,250' }, E.GROUPS.yes[0].fields[0][2]).v === 1250 && !E.valueOf({ pick: 'own', own: '1250' }, E.GROUPS.yes[0].fields[0][2]).est, 'typed amount is exact');
ok(E.valueOf({ pick: 'unsure' }, E.GROUPS.yes[0].fields[0][2]) === null && E.valueOf({ pick: '' }, E.GROUPS.yes[0].fields[0][2]) === null, 'not sure and blank are unknown');
ok(E.valueOf({ pick: '3' }, E.GROUPS.yes[2].fields[1][2]).est === false, 'months picked are exact');

// Insights: nothing until there is enough; then the founder's own arithmetic.
const own = (v) => ({ pick: 'own', own: String(v) });
for (const g of [...E.GROUPS.yes, ...E.GROUPS.plan]) ok(E.insight(g.key, {}, 'offer', money) === null, `${g.key}: silent with no numbers`);
const st = blank({ nums: { 'yes.sales': own(10000), 'yes.deliv': own(4000), 'yes.run': own(2500), 'yes.hrs': own(180), 'yes.want': own(150), 'yes.save': own(6000), 'yes.out': own(4000), 'yes.months': { pick: '3' }, 'yes.newc': own(4), 'yes.acq': own(800) } });
const n = E.numbers(st);
ok(E.insight('money', n, 'yes', money).includes('$3,500 is left'), 'money left = sales − delivery − running');
ok(!E.insight('money', n, 'yes', money).includes('about'), 'exact entries are not said with about');
ok(E.insight('time', n, 'yes', money).includes('120%'), 'hours against the hours chosen');
ok(E.insight('bank', n, 'yes', money).includes('1.5 months') && E.insight('bank', n, 'yes', money).includes('You chose 3'), 'savings cover, against the months chosen');
ok(E.insight('cust', n, 'yes', money).includes('$200'), 'cost to win one customer');
const ranged = E.numbers(blank({ nums: { 'yes.sales': { pick: '4' }, 'yes.deliv': own(1000), 'yes.run': own(1000) } }));
ok(E.insight('money', ranged, 'yes', money).includes('about $15,500'), 'a range makes the answer "about"');
ok(E.insight('offer', {}, 'idea', money).startsWith('Pick one person'), 'an idea gets the offer question, not a number');
ok(E.numberLines(n, money)[2].includes('$3,500 left'), 'feedback number line for Lead your business');

// What-if lab: refuses to run without the founder's month.
ok(E.labBase(blank()).ready === false, 'lab waits for numbers');
const b = E.labBase(Object.assign(st, { lab: { rate: '20', hire: '1000' } }));
ok(b.ready && b.limit === 150 && b.clients === 4, 'lab base from Step 03');
const s0 = E.simulate(b, 0, 0, 0);
ok(Math.round(s0.left) === 3500 - 800, 'today: sales − delivery − marketing − running');
const sp = E.simulate(b, 20, 0, 0);
ok(Math.round(sp.left - s0.left) === 2000 && sp.mine === s0.mine, '+20% price: +2,000, same hours');
const sm = E.simulate(b, 0, 50, 0);
ok(Math.round(sm.left - s0.left) === 3000 && sm.clients === 6 && sm.mine === 270, '+50% message: more orders, more delivery, more hours');
const sd = E.simulate(b, 0, 0, 50);
ok(sd.mine === 90 && sd.helpCost === 90 * 20 && Math.round(sd.left) === 2700 - 1800, 'half handed over at the founder’s rate');
ok(E.simulate(Object.assign({}, b, { rate: null }), 0, 0, 10).left === null, 'no helper rate, no cash figure for handing over');
ok(E.strongestLever(0, 0, 0) === -1 && E.strongestLever(25, 40, 0) === 0 && E.strongestLever(10, 80, 30) === 1, 'strongest lever as a share of its range');

// Plan mode needs the customers a month they plan for.
const plan = blank({ mode: 'offer', nums: { 'offer.price': own(500), 'offer.cpc': own(100), 'offer.hpc': { pick: '1' } }, lab: {} });
ok(E.labBase(plan).ready === false && E.labBase(plan).planned, 'plan lab waits for planned customers');
plan.lab.plan = '6';
const pb = E.labBase(plan);
ok(pb.ready && pb.sales === 3000 && pb.hours === 21, 'plan lab from the offer');

console.log(`compass: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
