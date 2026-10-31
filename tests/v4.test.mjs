// The Founder's Blueprint, Version 4 (31 Oct 2026): twelve levels, three
// chapters, each domain a tap, a slide and one sentence, then four lines back.
import fs from 'node:fs';
import { tally } from './_d1.mjs';
const { ok, done } = tally('v4');
const V = await import('../public/levels-v4.js');
const { LEVELS4: L, CHAPTERS4: C } = V;

ok(L.length === 12 && L.every((x, i) => x.n === i + 1), 'twelve levels, in order');
ok(L.map((x) => x.word).join(' ') === 'SEED VIEW CALM STEP FACT TALK HOUR GOLD FLOW NAME EDGE RISE', 'the twelve words, all singular, four letters');
ok(L.every((x) => x.word.length === 4 && x.d.length === 4 && x.d.every((D, d) => D.l === x.word[d])), 'each letter is one domain: yourself, people, business, market');
ok(C.map((c) => c.name).join(' / ') === 'The Inner Pyramid / The Engine Room / The Open Market' && C.flatMap((c) => c.lv).join() === '0,1,2,3,4,5,6,7,8,9,10,11', 'three chapters cover the twelve levels');
ok(V.STEPS4.length === 17 && V.UNITS === 12 && V.CLOSES[5] === 0 && V.CLOSES[9] === 1 && V.CLOSES[12] === 2, 'four moves per domain and a credo; chapter readings after 05, 09 and 12');
ok(L.every((x) => x.promise && x.old && x.neu && x.floor), 'every level has a promise for Sunday and the belief it changes');
ok(L.every((x) => x.d.every((D) => D.t.o.length >= 4 && D.s.max > D.s.min && V.fieldsOf(D).length >= 2 && D.fb.length === 4 && D.fb[2].length === 2)), 'every domain: a tap with choices, a slider, a sentence with blanks, four lines');

// Filled with the example founder, no line has a gap or a stray token.
const w = {};
L.forEach((x) => x.d.forEach((D, d) => { w[V.wkey(x.n, d, 't')] = String(D.x[0]); w[V.wkey(x.n, d, 's')] = String(D.x[1]); V.fieldsOf(D).forEach((p) => { w[V.wkey(x.n, d, p[0])] = p[2]; }); }));
let clean = true;
for (const x of L) for (let d = 0; d < 4; d++) { const h = V.lines4(w, x.n, d).map((l) => l[2]).join('') + V.sentence(w, x.n, d); if (/[{}]|blank/.test(h)) clean = false; }
ok(clean, 'every line and sentence fills from the founder’s own answers');
ok(L.every((x) => V.levelUnits(w, x.n) === 12 && V.firstStep(w, x.n) === 16), 'a level fully answered is 12 of 12 and opens on its credo');
ok(V.levelUnits({}, 1) === 0 && V.firstStep({}, 1) === 0 && V.domainUnits({ [V.wkey(1, 0, 't')]: '1' }, 1, 0) === 1, 'progress counts the tap, the slide and the whole sentence');
ok(V.lines4({ [V.wkey(1, 0, 't')]: '0' }, 1, 0)[0][2].includes('hit my numbers') && V.lines4({}, 1, 0)[3][2].includes('class="blank"'), 'a gap shows as a blank, never as a guess');
const r = V.reading(w, 0);
ok(r.scores.length === 4 && r.scores.every((s) => s >= 0 && s <= 1) && r.exact.length === 4 && r.next.name === 'The Engine Room', 'the chapter reading: four domains from the founder’s sliders, four exact moves, the next chapter');
ok(V.fill('{t}', { [V.wkey(1, 0, 't')]: '0' }, 1, 0).includes('<mark>') && !V.fill('{t}', { [V.wkey(1, 0, 't')]: '<b>' }, 1, 0).includes('<b>'), 'founder text is escaped');

const app = fs.readFileSync('public/app.js', 'utf8'), agents = fs.readFileSync('AGENTS.md', 'utf8');
ok(!/D\.tool|\.tool\b/.test(app), 'no tool names on the surface (AGENTS.md rule 4)');
ok(agents.includes('Tap · Slide · Write once · Four lines'), 'the new spine is written into the rules');
done();
