// Every Building worksheet must be structurally sound and must produce the
// answer it promises from entries typed the way a founder would type them.
import { FW_BUILD } from '../public/fw-build.js';
import { FW_GROW } from '../public/fw-grow.js';
import { FW_SCALE } from '../public/fw-scale.js';
import { result, num, OPS, TEXT_OPS } from '../public/frameworks.js';

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL ' + m)); };
const D = ['self', 'people', 'work', 'market'];
const STAGES = [['b', FW_BUILD], ['g', FW_GROW], ['s', FW_SCALE]];
const all = [];
for (const [pre, set] of STAGES) for (let l = 1; l <= 12; l++) for (const d of D) all.push([l, d, set[l][d], pre]);

// ── Structure ───────────────────────────────────────────────────────────────
ok(all.length === 48 * STAGES.length, 'forty-eight worksheets per written stage');
ok(new Set(all.map(([, , f]) => f.k)).size === all.length, 'keys are unique across stages');
for (const [l, d, f, pre] of all) {
  ok(f.k === `${pre}${l}-${d}`, `${f.k} key matches its stage, level and domain`);
  ok(f.after >= 1 && f.after <= 7, `${f.k} sits under a real clarity point`);
  ok(!!f.decides && /[a-z]/.test(f.decides), `${f.k} names the decision it forces`);
  ok(OPS[f.out.op] || TEXT_OPS[f.out.op], `${f.k} uses a declared operation`);
  ok(!!f.out.label, `${f.k} labels its result`);
}

// Rule 9: a numeric result must carry a reading, so a founder is never left
// holding a figure they cannot interpret.
for (const [, , f] of all) {
  if (OPS[f.out.op]) ok(Array.isArray(f.out.read) && f.out.read.length >= 1, `${f.k} tells the founder how to read the number`);
}

// No result may set an outside benchmark as the standard to hit. The reading
// bands are where a standard would be imposed, so that is where this is
// checked — teach copy is free to warn against benchmarks, and does.
for (const [, , f] of all) {
  const bands = JSON.stringify(f.out).toLowerCase();
  ok(!/industry average|industry standard|benchmark|top performers|best.in.class|you should be at/.test(bands),
    `${f.k} sets no outside benchmark in its reading`);
}

// And every reading must point at the founder's own situation rather than a
// league table: a band that states a figure to reach without a decision is
// the failure mode rule 9 exists to prevent.
for (const [, , f] of all) {
  if (!OPS[f.out.op]) continue;
  for (const [, text] of f.out.read) ok(text.length > 30, `${f.k} explains its band rather than grading it`);
}

// ── The numbers ─────────────────────────────────────────────────────────────
const r = (f, v) => result(f, v);

// Hours, typed with a stray unit
ok(r(FW_BUILD[1].self, { 'hrs:0': '12', 'hrs:1': '8h', 'hrs:2': '4.5' }).shown === '24.5', 'hours total ignores a stray unit');

// Share of the real customer
ok(r(FW_BUILD[1].market, { match: '3', all: '10' }).shown === '30', 'stated customer is 30% of the real one');
ok(r(FW_BUILD[1].market, { match: '3', all: '0' }) === null, 'no division by a missing denominator');

// Cost of the problem, annualised, typed with a currency symbol and commas
ok(r(FW_BUILD[2].market, { wk: '€1,200' }).shown === '62400', 'weekly cost annualises through commas and currency');

// The ceiling
const ceil = r(FW_BUILD[3].work, { hrs: '30', each: '4' });
ok(ceil.shown === '7.5' && /queue|ceiling|respect/i.test(ceil.read), 'ceiling computes and reads back');

// What an hour is worth
ok(r(FW_BUILD[4].self, { pay: '2,400', hrs: '40' }).shown === '60', 'effective hourly rate');

// Gross margin
const m = r(FW_BUILD[8].market, { price: '1000', cost: '640' });
ok(m.shown === '36' && m.unit === '%', 'gross margin is 36%');
ok(r(FW_BUILD[8].market, { price: '0', cost: '100' }) === null, 'no margin without a price');

// Pipeline arithmetic
ok(r(FW_BUILD[10].market, { want: '6', per: '12' }).shown === '72', 'seventy-two conversations');

// Annualised recurring hour
ok(r(FW_BUILD[7].work, { hrs: '3' }).shown === '156', 'three hours a week is 156 a year');

// Silence
ok(r(FW_BUILD[6].work, { times: '4', hrs: '2.5' }).shown === '10', 'the silence costs ten hours a month');

// ── The sentences ───────────────────────────────────────────────────────────
const offer = r(FW_BUILD[2].self, { who: 'solo architects', change: 'win work without tendering', holds: 'I have been the one tendering' });
ok(offer.text === true && offer.shown.startsWith('I run this so that solo architects'), 'the reason composes');
ok(r(FW_BUILD[2].self, { who: 'solo architects' }) === null, 'a half-filled sentence produces nothing, not a sentence with a hole in it');

const tell = r(FW_BUILD[3].people, { who: 'Marco', what: 'the Friday report has been late six weeks running', ask: 'it lands by Thursday noon', then: 'I take it off you and we talk about the rest of the role' });
ok(/If nothing changes, I take it off you/.test(tell.shown), 'the consequence reaches the sentence');

// Ranked priorities
ok(r(FW_BUILD[12].market, { p1: 'Win three retained clients', p2: 'x', p3: 'y' }).shown === 'Win three retained clients', 'the first priority is what survives a bad week');

// Counts
ok(r(FW_BUILD[5].work, { give: 'a', assume: 'b', lost: 'c', add: 'd' }).shown === '4 of 4', 'a full grid counts four of four');
ok(r(FW_BUILD[5].work, { give: 'a' }).shown === '1 of 4', 'a part-filled grid says so');
ok(r(FW_BUILD[5].work, {}) === null, 'an empty grid returns nothing rather than zero');

// ── Growing: the arithmetic of a business that runs through one head ───────
// Repeat revenue as a share
ok(r(FW_GROW[1].market, { rep: '84,000', all: '140,000' }).shown === '60', 'repeat revenue is 60% of the total');

// What a hire has to earn
const hire = r(FW_GROW[2].market, { cost: '\u20ac48,000', cust: '6,000' });
ok(hire.shown === '8' && /commitment|decide/i.test(hire.read), 'a hire must add or keep eight customers');

// Rework, priced
ok(r(FW_GROW[4].market, { hrs: '22', rate: '65' }).shown === '1430', 'rework cost computes');

// Meetings, annualised in people-hours
ok(r(FW_GROW[8].people, { hrs: '14', rate: '45' }).shown === '728', 'fourteen people-hours a week is 728 a year');

// Demand turned away
ok(r(FW_GROW[9].market, { n: '9', worth: '4,500' }).shown === '40500', 'lost demand is counted, not estimated');

// Lead time gap, including the case where delivery beats its own intention
ok(r(FW_GROW[10].market, { should: '3', real: '11' }).shown === '8', 'the customer waits eight days beyond intention');
ok(r(FW_GROW[10].market, { should: '5', real: '4' }).shown === '-1', 'a negative gap is reported rather than hidden');

// Intention against calendar
ok(r(FW_GROW[8].self, { meant: '10', got: '2' }).shown === '8', 'eight hours lost between intention and week');

// Growing sentences
const claim = r(FW_GROW[12].market, { who: 'mid-sized practices', promise: 'a named lead on every job', time: 'ten working days', volume: 'twelve jobs' });
ok(/at twelve jobs a month\.$/.test(claim.shown), 'the claim carries its own ceiling');
ok(r(FW_GROW[12].market, { who: 'x', promise: 'y', time: 'z' }) === null, 'a claim without a volume does not compose');

// ── Scaling: the arithmetic of judgement, trust and attention ──────────────
// Decision-days queued
const q = r(FW_SCALE[1].work, { n: '11', days: '6' });
ok(q.shown === '66' && /constraint|standing still/i.test(q.read), 'sixty-six decision-days queued');

// Revenue that depends on the founder by name
ok(r(FW_SCALE[2].market, { mine: '210000', all: '300000' }).shown === '70', 'seventy per cent arrives through one person');

// Speed beyond your own standard
ok(r(FW_SCALE[1].market, { real: '30', ok: '6' }).shown === '24', 'a day beyond the founder\u2019s own standard');

// The workaround
ok(r(FW_SCALE[5].work, { n: '5', hrs: '9' }).shown === '45', 'forty-five hours a month spent working around a silence');

// Years of capability, and the segment rate
ok(r(FW_SCALE[10].people, { 'yrs:0': '6', 'yrs:1': '9', 'yrs:2': '4' }).shown === '19', 'nineteen years of capability in the building');
ok(r(FW_SCALE[9].market, { rev: '\u20ac60,000', hrs: '2,400' }).shown === '25', 'the segment pays twenty-five an hour');

// The only test that counts
const abs = r(FW_SCALE[12].work, { ran: '2', all: '7' });
ok(abs.shown === '28.6' && /still needs you/i.test(abs.read), 'the absence test reports honestly, to one decimal');

// Attention, which may exceed a hundred
ok(r(FW_SCALE[4].self, { 'pct:0': '40', 'pct:1': '35', 'pct:2': '50' }).shown === '125', 'attention over a hundred is reported rather than clamped');

// The bet must carry its own date
ok(r(FW_SCALE[7].market, { bet: 'mid-market will pay for speed', date: 'March', wrong: 'fewer than four say yes', then: 'return to the core offer' }).shown.includes('We will know by March'), 'the bet carries its date');

// Every stage must teach something, and the teaching must be substantial
for (const [, set] of STAGES) {
  const teach = Object.values(set).flatMap((l) => D.map((d) => l[d])).filter((f) => f.teach);
  ok(teach.length >= 10, 'the stage carries at least ten teach blocks');
  for (const f of teach) ok(f.teach.t.length > 120, `${f.k} teaches rather than asserts`);
}

// num()
ok(num('') === 0 && num('abc') === 0 && num('-4') === -4 && num('1,250.50') === 1250.5, 'num reads what a founder types');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
