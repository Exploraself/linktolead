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
const near = (x, y) => x !== null && Math.abs(x - y) < 1e-6;
// "Give me more money": serve everyone who wants to buy.
const m0 = E.month(b, {}, 'money');
ok(near(m0.cash, 3500 - 800) && near(m0.mine, 180) && near(m0.vol, 1), 'today: sales − delivery − marketing − running, own hours');
const mp = E.month(b, { p: 20 }, 'money');
ok(near(mp.cash - m0.cash, 2000) && near(mp.mine, 180), 'money mode, +20% price: +2,000, same hours');
ok(near(mp.people, 2), 'the extra money, in people at the cost the founder set');
const mm = E.month(b, { m: 50 }, 'money');
ok(near(mm.cash - m0.cash, 3000) && near(mm.clients, 6) && near(mm.mine, 270), 'money mode, +50% message: more orders, more delivery, more hours');
const md = E.month(b, { d: 50 }, 'money');
ok(near(md.mine, 90) && near(md.helpCost, 90 * 20) && near(md.cash, 2700 - 1800), 'half handed over at the founder’s rate');
ok(E.month(Object.assign({}, b, { rate: null }), { d: 10 }).cash === null, 'no helper rate, no cash figure for handing over');
ok(E.month(Object.assign({}, b, { rate: null }), { d: 10 }).mine < 180, '…but the hours still move');
ok(E.month(Object.assign({}, b, { hire: null }), { p: 20 }, 'money').people === null, 'no cost of one more person, no people figure');

// "Give me back time" (the default): keep today's money with the least work.
const t0 = E.month(b, {});
ok(near(t0.cash, m0.cash) && near(t0.mine, m0.mine), 'time mode with no lever moved is today');
const tp = E.month(b, { p: 20 });
ok(near(tp.cash, t0.cash) && near(tp.mine, 135) && near(tp.vol, 0.75), 'time mode: a higher price keeps the money and lowers the hours');
ok(E.month(b, { p: 100 }).mine < tp.mine, 'time mode: the higher the price, the fewer the hours');
ok(near(tp.clients, 3) && near(tp.clientsWanted, 4), 'time mode: serve fewer, while the same number still want you');
ok(near(E.month(b, { m: 50 }).mine, 180), 'time mode: a clearer message alone needs no more hours');
const cap = E.month(b, { d: 50 });
ok(near(cap.vol, 1) && cap.cash < t0.cash, 'demand cap: never serves more than the demand there is, even to keep the money');
const capm = E.month(b, { d: 50, m: 50 });
ok(near(capm.cash, t0.cash) && capm.vol > 1 && capm.vol < 1.5, '…with more demand, it serves just enough to keep the money');
ok(near(E.month(b, { f: 50 }).mine, 90) && near(E.month(b, { f: 50 }).cash, t0.cash), 'fewer hours per sale: half the hours, same money');
ok(E.month(b, { f: 50 }, 'money').mine === E.month(b, { f: 50 }).mine, 'fewer hours per sale works the same in both modes');
const loss = E.month(Object.assign({}, b, { sales: 3000 }), { p: 20 });
ok(near(loss.vol, 1), 'a month where the work leaves nothing: time mode serves all the demand');

// The locked first visit: it says exactly which boxes are missing.
ok(JSON.stringify(E.labBase(blank()).need) === '["sales","deliv","run","hrs"]', 'locked: all four boxes listed when Step 03 is empty');
ok(JSON.stringify(E.labBase(blank({ nums: { 'yes.sales': own(5000), 'yes.hrs': own(100) } })).need) === '["deliv","run"]', 'locked: only the boxes actually missing');
ok(E.labBase(blank({ nums: { 'yes.sales': own(5000), 'yes.deliv': own(1000), 'yes.run': own(500), 'yes.hrs': own(100) } })).ready, 'helper rate and cost of one more person never block the lab');

// The lever moved most, as a share of its range, across four levers.
ok(E.LEVER_RANGE.p === 200 && E.LEVER_RANGE.m === 100 && E.LEVER_RANGE.f === 50 && E.LEVER_RANGE.d === 60, 'lever ranges');
ok(E.strongestLever(0, 0, 0, 0) === -1, 'no lever moved');
ok(E.strongestLever(50, 40, 0, 0) === 1 && E.strongestLever(100, 40, 10, 0) === 0, 'price measured against its 200% range');
ok(E.strongestLever(20, 30, 30, 10) === 2 && E.strongestLever(20, 30, 10, 45) === 3, 'fewer hours and handover');
ok(E.LEVERS.length === 4 && E.LEVERS.map((l) => l.id).join() === 'price,message,hours,handover', 'four levers in the lab’s order');

// Plan mode needs the customers a month they plan for.
const plan = blank({ mode: 'offer', nums: { 'offer.price': own(500), 'offer.cpc': own(100), 'offer.hpc': { pick: '1' } }, lab: {} });
ok(E.labBase(plan).ready === false && E.labBase(plan).planned, 'plan lab waits for planned customers');
plan.lab.plan = '6';
const pb = E.labBase(plan);
ok(pb.ready && pb.sales === 3000 && pb.hours === 21, 'plan lab from the offer');
ok(E.month(pb, { p: 50 }).mine < E.month(pb, {}).mine && E.month(pb, { f: 20 }).mine < 21, 'plan mode works with the same four levers');

console.log(`compass: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
