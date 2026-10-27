// The Ground Plan must hold for every possible set of entrance answers:
// every line it shows traces to an answer the founder actually gave.

import { DIAGNOSTIC, DOMAINS, referee, groundPlan, COSTS } from '../public/content.js';

let passed = 0, failed = 0;
const ok = (cond, msg) => { if (cond) passed++; else { failed++; if (failed < 20) console.error('FAIL:', msg); } };

ok(COSTS.length === 8, 'one cost entry per evidence question');
COSTS.forEach((c, i) => ok(c[0] && c[1], `question ${i + 1} has a cost for both weak answers`));

const stages = ['build', 'grow', 'scale'];
for (let m = 0; m < 3 ** 8; m++) {
  const diag = {};
  let x = m;
  for (let i = 0; i < 8; i++) { diag[i] = x % 3; x = Math.floor(x / 3); }
  for (const said of stages) for (const want of stages) {
    diag[8] = said; diag[9] = want;
    const score = { self: 0, people: 0, work: 0, market: 0 };
    DIAGNOSTIC.forEach((q, i) => { if (score[q.d] !== undefined) score[q.d] += diag[i]; });
    const r = referee({ said, want, score });
    const gp = groundPlan(diag, r);
    const tag = `m=${m} ${said}->${want}`;

    ok(gp.answers.length === 4 && gp.answers.every((a) => a.said.length === 2 && a.said.every(Boolean)), `${tag}: two quoted answers per domain`);
    const weak = Object.entries(diag).filter(([i, v]) => +i < 8 && v < 2).length;
    ok(gp.costs.length === Math.min(3, weak), `${tag}: shows up to three weak answers`);
    ok(gp.costs.every((c) => c.said && c.cost && c.n), `${tag}: every cost quotes an answer`);
    for (let j = 1; j < gp.costs.length; j++) {
      const a = DIAGNOSTIC.findIndex((q, i) => i < 8 && q.d === gp.costs[j - 1].k);
      ok(a >= 0, `${tag}: cost domain is real`);
    }
    // The weakest answers come first: no shown cost is milder than one left out.
    const shownZero = gp.costs.filter((c) => COSTS.some((e) => e[0] === c.cost)).length;
    const zeros = Object.entries(diag).filter(([i, v]) => +i < 8 && v === 0).length;
    ok(shownZero === Math.min(3, zeros), `${tag}: the harshest answers are shown first`);
    ok(!!gp.wantWords, `${tag}: their own words for the goal`);
  }
}
ok(DOMAINS.length === 4, 'four domains');

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
