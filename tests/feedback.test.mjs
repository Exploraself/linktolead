// The reading must never say more than the founder's own entries support.
import { report, signals, RULES } from '../public/feedback.js';

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : (fail++, console.log('FAIL ' + m)); };
const D = ['self', 'people', 'work', 'market'];
const blank = () => ({ stage: 'build', answers: {}, work: {}, diag: {} });
const fill = (s, lv, text = 'An answer written with the file open in front of me') => {
  for (const d of D) for (let i = 0; i < 7; i++) s.answers[`build.${lv}.${d}.${i}`] = text;
  return s;
};

// ── Shape ───────────────────────────────────────────────────────────────────
ok(new Set(RULES.map((r) => r.k)).size === RULES.length, 'rule keys are unique');
for (const r of RULES) {
  ok(typeof r.when === 'function' && typeof r.say === 'function', `${r.k} is a real rule`);
  ok(r.sev >= 1 && r.sev <= 3, `${r.k} has a severity`);
  ok(!!r.step && !!r.title, `${r.k} names a finding and a step`);
  ok(r.lv >= 1 && r.lv <= 3, `${r.k} belongs to a level that gets a reading`);
}

// The reading exists for levels one to three and nowhere else.
ok(report(fill(blank(), 1), 'build', 1) !== null, 'level one gets a reading');
ok(report(blank(), 'build', 4) === null, 'level four does not');
ok(report(blank(), 'build', 0) === null, 'nothing before level one');

// ── It must not invent ──────────────────────────────────────────────────────
// A founder who entered nothing at all can still be told something true, but
// only about the blankness itself — never a figure.
const empty = report(fill(blank(), 1), 'build', 1);
ok(empty.findings.some((f) => /did not open the calendar/i.test(f.title)), 'an empty worksheet is itself the finding');
for (const f of empty.findings) ok(!/\d+%/.test(f.body), 'no percentage is quoted when none was entered');
ok(/most worksheets/i.test(empty.thin), 'the reading admits what it is missing');

// Every quoted figure must be one the founder typed.
const s = fill(blank(), 1);
Object.assign(s.work, { 'w.build.1.self.hrs:0': '9', 'w.build.1.market.match': '2', 'w.build.1.market.all': '10' });
const r = report(s, 'build', 1);
ok(r.findings.some((f) => f.body.includes('9 hours')), 'the hours figure is the one entered');
ok(r.findings.some((f) => f.body.includes('20%')), 'the share is computed from what was entered');

// ── It must not grade ───────────────────────────────────────────────────────
const everything = [];
for (const lv of [1, 2, 3]) {
  const st = blank();
  for (const l of [1, 2, 3]) fill(st, l);
  everything.push(report(st, 'build', lv));
}
for (const rep of everything) {
  const text = rep.stand + ' ' + rep.findings.map((f) => f.body + f.title + f.step).join(' ');
  ok(!/most founders|average|typical founder|better than|worse than|percentile|score of/i.test(text),
    'the reading never compares the founder with anybody else');
  ok(!/you are a |your personality|you tend to be/i.test(text), 'the reading never makes a claim about who they are');
}

// ── It must stay short ──────────────────────────────────────────────────────
for (const rep of everything) ok(rep.findings.length <= 3, 'at most three findings, so one thing can be done');

// ── Every finding opens a door ──────────────────────────────────────────────
const all = blank(); for (const l of [1, 2, 3]) fill(all, l);
Object.assign(all.work, { 'w.build.1.self.hrs:0': '4', 'w.build.1.market.match': '1', 'w.build.1.market.all': '10',
  'w.build.3.work.hrs': '6', 'w.build.3.work.each': '9' });
const deep = report(all, 'build', 3);
for (const f of deep.findings) {
  ok(f.where === null || (f.where.lv >= 1 && f.where.lv <= 12 && !!f.where.title), `${f.k} points at a real level`);
  ok(!!f.step, `${f.k} gives a step rather than a diagnosis`);
}

// ── A founder who did the work well is told so, without flattery ────────────
const good = blank();
for (const l of [1, 2, 3]) fill(good, l, 'A long answer, written with the actual file open and a figure copied out of it');
Object.assign(good.work, {
  'w.build.1.self.hrs:0': '22', 'w.build.1.self.hrs:1': '14',
  'w.build.1.market.match': '8', 'w.build.1.market.all': '10',
  'w.build.1.work.step:0': 'a', 'w.build.1.work.step:1': 'b', 'w.build.1.work.step:2': 'c', 'w.build.1.work.step:3': 'd',
  'w.build.1.people.clear:0': 'y', 'w.build.1.people.clear:1': 'y', 'w.build.1.people.clear:2': 'y',
  'w.build.2.self.who': 'solo architects', 'w.build.2.self.change': 'win work without tendering', 'w.build.2.self.holds': 'nine years of losing bids',
  'w.build.2.market.wk': '900',
  'w.build.2.people.know:0': 'she told me', 'w.build.2.people.know:1': 'he wrote it down', 'w.build.2.people.know:2': 'in writing',
  'w.build.2.work.output': 'one finished scheme pack', 'w.build.2.work.standard': 'ready to submit without rework',
  'w.build.3.self.cost:0': 'lost the retainer', 'w.build.3.self.cost:1': 'a month of revenue',
  'w.build.3.people.who': 'Marco', 'w.build.3.people.what': 'the report is late', 'w.build.3.people.ask': 'Thursday noon', 'w.build.3.people.then': 'I take it back',
  'w.build.3.work.hrs': '30', 'w.build.3.work.each': '4',
});
for (let i = 0; i < 10; i++) good.work[`w.build.3.market.who:${i}`] = 'A real company';
const clean = report(good, 'build', 3);
ok(clean.clear === true, 'a founder who did the work gets no invented warning');
ok(/uncommon enough to say plainly/.test(clean.stand), 'and is told so plainly, once');
ok(clean.thin === null, 'with no caveat about missing evidence, because there is none');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
