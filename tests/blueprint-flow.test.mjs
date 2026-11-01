// The Founder's Blueprint, one field on screen (the skeleton, Phase 3):
// every domain an action with a day, a "Done when", how sure, and what the
// founder keeps; every level opens with last week; the readings count what
// was done; the founder's Blueprint is built from their answers only.
import fs from 'node:fs';
import { tally as T } from './_d1.mjs';
const { ok, done } = T('blueprint-flow');
const V = await import('../public/levels-v4.js');
const { LEVELS4: L, PLAN4: P, BLUEPRINT4: B } = V;

// ── The content: 48 domains, each an action plan ──────────────────────────
const keys = L.flatMap((x) => x.d.map((_, d) => `${x.n}.${d}`));
ok(Object.keys(P).length === 48 && keys.every((k) => P[k]), 'an action plan for each of the 48 domains');
ok(Object.values(P).every((p) => p.topic && p.ins && p.done && p.notyet && Array.isArray(p.take) && p.take.length >= 3),
  'each: a topic, an insight, a "Done when", what the founder keeps, a smaller step');
ok(Object.values(P).every((p) => p.notyet.startsWith('Make it smaller')), 'the step after "Not yet" is always smaller, never a scolding');
ok(Object.values(P).every((p) => p.ins.split(/(?<=[.!?])\s/).length <= 4 && p.ins.length <= 330), 'insights are short: the principle, not a lecture');

// Every action has a day: the added screen (`on`), or a field of the sentence.
let days = true;
for (const x of L) x.d.forEach((D, d) => {
  const k = V.dayKeyOf(x.n, d), fields = V.fieldsOf(D).map((f) => f[0]);
  if (!(k === 'on' ? P[`${x.n}.${d}`].on : fields.includes(k))) days = false;
  if (k !== 'on' && P[`${x.n}.${d}`].on) days = false;
});
ok(days, 'every action has a day, asked once');
ok(Object.values(P).filter((p) => p.on).length === 29, '29 domains get a day screen');

// Filled with the example founder, nothing is left as a token or a gap.
const w = {};
for (const x of L) x.d.forEach((D, d) => {
  w[V.wkey(x.n, d, 't')] = String(D.x[0]); w[V.wkey(x.n, d, 's')] = String(D.x[1]);
  V.fieldsOf(D).forEach((f) => { w[V.wkey(x.n, d, f[0])] = f[2]; });
  w[V.wkey(x.n, d, 'on')] = 'Friday';
});
let clean = true;
for (const x of L) for (let d = 0; d < 4; d++) {
  const t = V.takeOf(w, x.n, d);
  const h = [V.doneOf(w, x.n, d), t.title, ...t.lines, V.notyetOf(w, x.n, d), P[`${x.n}.${d}`].on ? V.plainOf(P[`${x.n}.${d}`].on, w, x.n, d) : ''].join(' ');
  if (/[{}]|class="blank"/.test(h)) { clean = false; console.error('gap in', x.n, d, h.slice(0, 160)); }
}
ok(clean, 'every "Done when", template and day question fills from the founder’s own answers');
ok(V.takeOf(w, 6, 2).lines[0].includes('Studio Rossi') && V.takeOf(w, 6, 2).lines.join('').includes('class="ln"'), 'what the founder keeps carries their words, and lines to fill in on paper');
ok(!V.doneOf({ [V.wkey(1, 0, 'act')]: '<b>x</b>' }, 1, 0).includes('<b>'), 'founder text is escaped');

// Rule 4: no tool names on the surface, not even as a topic or a title.
const norm = (s) => String(s).toLowerCase().replace(/^(the|my|your|a|one)\s+/, '').replace(/[^a-z0-9 ]/g, '').trim();
const tools = new Set(L.flatMap((x) => x.d.map((D) => norm(D.tool))));
ok(Object.values(P).every((p) => !tools.has(norm(p.topic)) && !tools.has(norm(p.take[0]))), 'no topic or title is a tool name (AGENTS.md rule 4)');
// Rule 6: no invented numbers. Percentages only ever come from the founder.
ok(Object.values(P).every((p) => !/\d+\s?%|percent|studies|research shows|on average/i.test(p.ins + p.notyet)), 'no invented statistics in the insights');

// ── The founder's Blueprint: eight parts, every domain in exactly one ─────
ok(B.length === 8 && B.map((s) => s.k).join() === 'self,people,offer,marketing,sales,money,systems,grow', 'eight parts: leader, people, offer, marketing, sales, money, systems, next ninety days');
ok(Object.values(P).every((p) => B.some((s) => s.k === p.bp)), 'every domain writes one part of the Blueprint');
const bp = V.blueprint(w);
ok(bp.reduce((n, s) => n + s.items.length, 0) === 48 && bp.every((s) => s.items.length >= 3), 'all 48 domains appear once; no part is thinner than three');
const empty = V.blueprint({});
ok(empty.every((s) => s.items.every((i) => !i.started)) && bp.every((s) => s.items.every((i) => i.started && !/[{}]/.test(i.sentence))), 'built only from answers: empty stays empty, nothing is filled in for them');

// ── The flow: one field on screen ─────────────────────────────────────────
const s1 = V.stepsOf(1), s2 = V.stepsOf(2), s5 = V.stepsOf(5);
ok(s1[0].join() === '0,tap' && s2.slice(0, 4).every((s, i) => s[0] === i && s[1] === 'got') && s2[4].join() === '0,tap', 'Level 01 opens on its first tap; every later level on last week’s four actions');
ok(s5.slice(-4).map((s) => s[1]).join() === 'week,reading,carry,carryday' && V.stepsOf(4).slice(-1)[0][1] === 'week', 'the week ends a level; after 05, 09 and 12, the reading and one action carried forward');
let once = true;
for (const x of L) x.d.forEach((D, d) => {
  const S = V.stepsOf(x.n).filter((s) => s[0] === d && !['got'].includes(s[1]));
  const fields = V.fieldsOf(D).map((f) => f[0]);
  if (S.filter((s) => s[1] === 'done').length !== 1 || S.filter((s) => s[1] === 'lines').length !== 1) once = false;
  for (const f of fields) if (S.filter((s) => s[2] === f).length !== 1) once = false;
  if (S[0][1] !== 'tap' || S[1][1] !== 'slide' || S[S.length - 1][1] !== 'lines') once = false;
});
ok(once, 'per domain: tap, slide, each blank once, the day, "Done when", four lines');
ok(V.stepsOf(1).filter((s) => s[1] === 'day').every((s) => ['day', 'when', 'on'].includes(s[2])), 'a day is a tap, never typed unless it is a date');

ok(V.firstOf({}, 1) === 0 && V.firstOf({}, 2) === 0, 'a new level opens on its first question');
const full = { ...w };
for (const x of L) for (let d = 0; d < 4; d++) { full[V.wkey(x.n, d, 'sure')] = '70'; full[V.wkey(x.n, d, 'got')] = '0'; }
for (const n of [5, 9, 12]) { full[V.wkey(n, 'r', 'carry')] = '1.0'; full[V.wkey(n, 'r', 'on')] = 'Monday'; }
ok(L.every((x) => V.stepsOf(x.n)[V.firstOf(full, x.n)][1] === 'week'), 'a level fully answered opens on its week');
ok(V.firstOf({ ...full, [V.wkey(3, 2, 'got')]: '' }, 4) === 2, 'a missing Sunday answer is asked first');
// Progress still counts only the Version 4 moves: nobody already ahead is held back.
ok(L.every((x) => V.levelUnits(w, x.n) === V.UNITS), 'the day and how sure never gate the next level');

// ── Sunday: done against promised, and the estimates ──────────────────────
const sun = (gots, sure) => { const o = {}; gots.forEach((g, d) => { o[V.wkey(1, d, 'got')] = String(g); o[V.wkey(1, d, 'sure')] = String(sure); }); return o; };
ok(V.tally(sun([0, 0, 2, 2], 90), [1]).est === 'too hopeful' && V.tally(sun([0, 0, 0, 1], 80), [1]).est === 'about right' && V.tally(sun([0, 0, 0, 0], 40), [1]).est === 'too careful',
  'estimates read as too hopeful, about right or too careful, the Planner’s three words');
const t0 = V.tally({}, [1, 2, 3]);
ok(t0.n === 0 && t0.est === null && t0.real === null, 'no Sunday answers: nothing is claimed');
ok(V.countedFor(0).join() === '1,2,3,4' && V.countedFor(1).join() === '5,6,7,8' && V.countedFor(2).join() === '9,10,11', 'each reading counts the actions checked since the one before');
ok(V.READ_QUOTES.length === 3 && V.READ_QUOTES.every((q) => q.q && /^Worth Building/.test(q.src)), 'one quote per reading, from his own book');
ok(V.carriedFrom({ [V.wkey(5, 'r', 'carry')]: '3.2' }, 5).join() === '3,2' && V.carriedFrom({ [V.wkey(5, 'r', 'carry')]: 'x' }, 5) === null, 'the action carried forward is read back exactly');

// ── The screen ────────────────────────────────────────────────────────────
const app = fs.readFileSync('public/app.js', 'utf8'), css = fs.readFileSync('public/crown.css', 'utf8');
ok(!/STEPS4|firstStep\(/.test(app) && /stepsOf\(level\)/.test(app), 'the programme walks the new steps');
ok(/data-got=/.test(app) && /data-v4day=/.test(app) && /data-v4u=/.test(app) && /data-carry=/.test(app) && /data-copytake=/.test(app), 'last week, the day taps, how sure, carry forward and copy are wired');
ok(/keep4\(d, 'got', \+b\.dataset\.got, level - 1\)/.test(app), 'Sunday’s answer is kept on the week it belongs to');
ok((app.match(/if \(qi === at\) moveQ\(1\)/g) || []).length === 2 && /classList\.contains\('cw-day'\)/.test(app), 'a day or a carried action, chosen by tap or by Enter, moves on exactly once');
ok(/view === 'blueprint' \? blueprintView\(\)/.test(app) && /data-go="blueprint"/.test(app) && /data-print/.test(app), 'the founder can open, and print, their Blueprint');
ok(/@media print/.test(css) && /prefers-reduced-motion:reduce\)\{\.cw-days/.test(css), 'print and reduced motion are handled');
ok(/'#blueprint'\) return 'blueprint'/.test(fs.readFileSync('public/home.js', 'utf8')), '#blueprint opens the Blueprint');
done();
