// Every Building worksheet must be structurally sound and must produce the
// answer it promises from entries typed the way a founder would type them.
import { FW_BUILD } from '../public/fw-build.js';
import { result, num, OPS, TEXT_OPS } from '../public/frameworks.js';

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL ' + m)); };
const D = ['self', 'people', 'work', 'market'];
const all = [];
for (let l = 1; l <= 12; l++) for (const d of D) all.push([l, d, FW_BUILD[l][d]]);

// ── Structure ───────────────────────────────────────────────────────────────
ok(all.length === 48, 'forty-eight worksheets');
ok(new Set(all.map(([, , f]) => f.k)).size === 48, 'keys are unique');
for (const [l, d, f] of all) {
  ok(f.k === `b${l}-${d}`, `${f.k} key matches its level and domain`);
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

// num()
ok(num('') === 0 && num('abc') === 0 && num('-4') === -4 && num('1,250.50') === 1250.5, 'num reads what a founder types');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
