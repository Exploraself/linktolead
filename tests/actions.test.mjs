// Twenty actions a level, at four sizes (Alexandru, 2 Nov 2026): five in
// each area (Look · Decide · Do · Involve · Keep), for Levels 01–05, in My
// Blueprint with the day each was done.

import fs from 'node:fs';
import * as A from '../public/actions-v4.js';
import * as V from '../public/levels-v4.js';
import { tally } from './_d1.mjs';

const { ok, done } = tally('actions');
const app = fs.readFileSync('public/app.js', 'utf8'), css = fs.readFileSync('public/my-blueprint.css', 'utf8');
const SZ = ['start', 'solo', 'team', 'company'];

ok(A.STEPS5.join() === 'Look,Decide,Do,Involve,Keep', 'five actions in one order: Look, Decide, Do, Involve, Keep');
ok(A.SIZES4.map((s) => s[0]).join() === SZ.join() && A.SIZES4.map((s) => s[1]).join(' / ') === 'Before the first sale / Selling alone / A team with payroll / 16 people or more', 'the four sizes, in plain words');
ok(A.ACTION_LEVELS.join() === '1,2,3,4,5', 'Levels 01–05 have their twenty');
let all = 0, empty = [];
for (const lv of [1, 2, 3, 4, 5]) for (let d = 0; d < 4; d++) for (const s of SZ) {
  const X = A.actionsAt(lv, d, s);
  if (X.length !== 5) empty.push(`${lv}.${d}`);
  X.forEach((x) => { all += 1; if (!x.t || x.t.length < 20) empty.push(`${lv}.${d}.${s}`); });
}
ok(all === 400 && !empty.length, 'every action is written for every size (5 levels × 4 areas × 5 × 4 sizes)');
const words = JSON.stringify(A.ACTIONS4);
ok(!/\b(reflect|think about|take a walk|breathe)\b/i.test(words), 'practical: nothing a founder could do without moving their business (rules 1 and 10)');
ok(!/240/.test(words) && !/\bSEED|VIEW|CALM|STEP|FACT\b/.test(words), 'no scary totals, no level words');
ok(A.actionsAt(1, 3, 'solo')[3].t.includes('what almost stopped them buying'), 'Alexandru’s own example is in Level 01');
ok(A.actionsAt(1, 2, 'start')[0].t.startsWith('Write the money you need each month to live'), 'before the first sale, money starts from what you need to live');
ok(A.actionsAt(1, 2, 'team')[0].t.includes('payroll') && A.actionsAt(1, 2, 'company')[0].t.includes('one page'), 'the pressure changes with the size: payroll, then one page for a company');
ok([1, 2].every((lv) => A.actionsAt(lv, 2, 'solo')[4].t.includes('machine')), 'the numbers serve the decision: a machine adds up, the founder decides (rule 9)');
ok(A.sizeFor('') === 'solo' && A.sizeFor('team') === 'team' && A.SIZE_STAGE.company === 4, 'until the founder says, the actions speak to a founder selling alone');
ok(V.sizeOf({ 'w.v4.where.stage': String(A.SIZE_STAGE.start) }) === 'start' && V.sizeOf({ 'w.v4.where.stage': String(A.SIZE_STAGE.team) }) === 'team', 'switching size sets the answer “Where are you now?” keeps');

// My Blueprint.
ok(app.includes('This week: 20 things to do') && app.includes('const DO_FIRST = [2, 0, 1, 3, 4];'), 'This week shows the level’s twenty, Do on top in each area');
ok(app.includes("keep4(d, `a${i}`, on ? '' : isoToday(), lv);") && app.includes("if (i === 2) keep4(d, 'got', on ? '' : 0, lv);"), 'each tick keeps its date; the Do tick is Sunday’s “Done”');
ok(/^w\.[\w.:-]{1,80}$/.test(V.wkey(5, 3, 'a4')), 'the account keeps the ticks (the /api/state key rule)');
ok(app.includes('data-mbsize=') && app.includes("keepWhere('stage', SIZE_STAGE[b.dataset.mbsize])"), 'the founder can switch size in My Blueprint');
ok(app.includes('Done, day by day') && app.includes("ticks.sort((a, b) => a[0].localeCompare(b[0]));"), 'My journey: every action done, in date order');
ok(app.includes('twenty actions a level, five in each area of your business, written for your size') && app.includes('class="mb-five"'), 'My playbook lists each level’s twenty');
ok(app.includes('data-go="blueprint" data-bpto="week">See them</button>'), 'each area of a level points to its five actions');
ok(css.includes('.mb-sizes button[aria-pressed="true"]') && css.includes('.mb-acts li.mb-dostep'), 'the size switch and the Do action are drawn');

done();
