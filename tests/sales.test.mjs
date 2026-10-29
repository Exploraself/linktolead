// The Compass sales pages: stepped sliders and the sentences at the edges.
//
// Big ranges move in growing steps so a phone can still hit small numbers, a
// typed value above the top is kept, and no message ever shows NaN, Infinity
// or a division by zero, whatever the founder slides or types.

import { createRequire } from 'node:module';
const { ladder, posOf, dream, plan } = createRequire(import.meta.url)('../public/compass/welcome/sales.js');

let passed = 0, failed = 0;
const ok = (cond, msg) => { if (cond) passed++; else { failed++; console.error('FAIL:', msg); } };
const clean = (o) => !/NaN|Infinity|undefined|null/.test(JSON.stringify(o, (k, v) => (typeof v === 'number' && !Number.isFinite(v) ? 'Infinity' : v)));
const words = (o) => Object.entries(o).filter(([, v]) => typeof v === 'string').map(([, v]) => v).join(' ');

// ── The stepped ladder ───────────────────────────────────────────────────────
const C = ladder(0, 10000);
ok(C[0] === 0 && C[C.length - 1] === 10000, 'counts: 0 to 10,000');
ok(C.slice(0, 11).join() === '0,1,2,3,4,5,6,7,8,9,10', 'by 1 up to 10');
ok(C.includes(15) && C.includes(100) && !C.includes(11) && !C.includes(102), 'by 5 up to 100');
ok(C.includes(150) && C.includes(1000) && !C.includes(105), 'by 50 up to 1,000');
ok(C.includes(1500) && C.includes(9500) && !C.includes(1050), 'by 500 up to 10,000');
ok(C.length < 80, `a phone-sized number of positions (${C.length})`);
const M = ladder(1000, 1000000);
ok(M[0] === 1000 && M[M.length - 1] === 1000000 && M.includes(6000) && M.includes(15000) && M.includes(150000) && !M.includes(105000), 'money: 1,000 to 1,000,000 in bands');
const P = ladder(1, 100000);
ok(P[0] === 1 && P[P.length - 1] === 100000 && P.includes(400) && P.includes(7) && P.includes(55000) && !P.includes(52000), 'price: 1 to 100,000');
const H = ladder(1, 200);
ok(H[0] === 1 && H[H.length - 1] === 200 && H.includes(8), 'hours per sale: 1 to 200');
for (let i = 1; i < C.length; i++) if (!(C[i] > C[i - 1])) { ok(false, 'ladder strictly rises'); break; }

// Round trip: every position's value maps back to the same position.
for (const L of [C, M, P, H]) ok(L.every((v, i) => posOf(L, v) === i), `round trip position ↔ value (${L[0]}–${L[L.length - 1]})`);
// Starting values on the pages are on the ladder, so they are kept exactly.
ok(C[posOf(C, 6)] === 6 && C[posOf(C, 15)] === 15 && M[posOf(M, 6000)] === 6000 && P[posOf(P, 400)] === 400 && H[posOf(H, 8)] === 8, 'starting values kept');
// Edges and typed values.
ok(posOf(C, 0) === 0 && posOf(C, -5) === 0 && posOf(C, 10000) === C.length - 1, 'edges 0 and max');
ok(posOf(C, 25000) === C.length - 1 && posOf(M, 5e6) === M.length - 1, 'typed above the top: the slider waits at its top');
ok(C[posOf(C, 12)] === 10 || C[posOf(C, 12)] === 15, 'typed between steps: the nearest step');
ok(C[posOf(C, 237)] === 250, 'typed 237: nearest is 250');

// ── The dream sliders at the edges ───────────────────────────────────────────
const base = { hNow: 55, hWant: 40, cNow: 6, cWant: 15, rNow: 10, rWant: 50 };
const cases = [
  ['0 clients today', { cNow: 0 }, /first client/i],
  ['0 clients today and wanted', { cNow: 0, cWant: 0 }, /who the business is for/i],
  ['0 clients wanted', { cWant: 0 }, /clients you actually want|different shape/i],
  ['10,000 clients wanted', { cWant: 10000 }, /1,666\.7× the clients/],
  ['10,000 clients both', { cNow: 10000, cWant: 10000 }, /Same number of clients/],
  ['0 hours today', { hNow: 0 }, /hours you work/i],
  ['0 hours wanted', { hWant: 0 }, /less of your time per client/],
  ['0 hours both', { hNow: 0, hWant: 0 }, /Same hours/],
  ['100 hours a week', { hNow: 100, hWant: 100 }, /Same hours/],
  ['typed far above the top', { cNow: 3, cWant: 50000, hNow: 100 }, /× the clients/],
];
for (const [name, over, re] of cases) {
  const o = dream({ ...base, ...over });
  ok(clean(o), `${name}: no NaN, Infinity or blank`);
  ok(re.test(words(o)), `${name}: says ${re}`);
}
ok(dream({ ...base, cNow: 0 }).cutTxt === '—', 'no client today: time per client is not invented');

// ── The life-first calculator at the edges ──────────────────────────────────
const pb = { goal: 6000, price: 400, keep: 60, hps: 8, avail: 140 };
for (const [name, over] of [['start', {}], ['goal 1,000,000', { goal: 1000000 }], ['price 1', { price: 1 }], ['price 100,000', { price: 100000 }],
  ['hours per sale 200', { hps: 200 }], ['hours per sale typed 0', { hps: 0 }], ['0 hours wanted', { avail: 0 }], ['keep 0', { keep: 0 }], ['typed goal 5,000,000', { goal: 5000000 }]]) {
  const o = plan({ ...pb, ...over });
  const shown = [o.sales, o.need, o.perSale, o.priceFit, o.hpsFit];
  ok(shown.every((v) => v === null || Number.isFinite(v)), `${name}: every figure is a number or "—" (null), never NaN or Infinity`);
  ok(o.title && o.text && o.ask && !/NaN|Infinity/.test(o.text + o.title), `${name}: plain sentences`);
}
ok(plan({ ...pb, price: 100000 }).sales === 1, 'a huge price: one sale is enough');
ok(plan({ ...pb, goal: 1000000, price: 1 }).text.includes('hours a month'), 'a huge goal at a tiny price still says it plainly');
ok(plan({ ...pb, avail: 0 }).level === 'red', 'no hours wanted: the plan borrows all of them');

console.log(`sales: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
