// Inform → Reform → Transform (Alexandru, 2 Nov 2026), Level 01 first:
// the concept before the tap, a reply to every tap and slide, a check on
// every blank, the smaller step offered when the founder is under 60% sure.
// And the examples in dollars with US names (his yes, 2 Nov).

import fs from 'node:fs';
import * as V from '../public/levels-v4.js';
import { tally } from './_d1.mjs';

const { ok, done } = tally('inform-reform-transform');
const L1 = V.LEVELS4[0];

// ── Inform: the concept, one sentence, its own screen before the tap ────────
ok([0, 1, 2, 3].every((d) => { const p = V.planOf(1, d); return p.idea && p.idea.split(/\s+/).length <= 22 && p.idea.split(/\s+/).length < p.ins.split(/\s+/).length; }), 'Level 01: each domain has a concept, shorter than its full paragraph');
ok([0, 1, 2, 3].every((d) => { const S = V.stepsOf(1).filter((s) => s[0] === d); return S[0][1] === 'idea' && S[1][1] === 'tap'; }), 'the concept comes first in every Level 01 domain');
ok(V.stepsOf(2).every((s) => s[1] !== 'idea'), 'levels not yet reviewed keep their order');
const seen = { 'w.v4.1.w.seen': '1', 'w.v4.where.stage': '2', 'w.v4.where.money': 'Lower', 'w.v4.where.who': '1', 'w.v4.where.weight': '0', 'w.v4.where.win': '1' };
ok(V.firstOf({}, 1) === 0 && V.stepsOf(1)[V.firstOf({}, 1)][1] === 'welcome' && V.stepsOf(1)[V.firstOf(seen, 1)][1] === 'idea', 'a new founder opens Level 01 on its welcome, then, after “Where are you now?”, on its concept');
{ const w = { [V.wkey(1, 0, 't')]: '1' }; ok(V.stepDone(w, 1, [0, 'idea']) && !V.stepDone({}, 1, [0, 'idea']), 'the concept counts as seen once its tap is answered'); }

// ── Reform: every tap answer and every slider gets a reply ─────────────────
ok(L1.d.every((D) => D.t.why && D.t.why.length === D.t.o.length && D.t.why.every((x) => x.length > 20)), 'one reply for each of the 18 tap answers');
ok(L1.d.reduce((n, D) => n + D.t.why.length, 0) === 18, 'exactly 18 replies in Level 01');
ok(V.tapReply(1, 0, 1).startsWith('Someone will always work longer') && V.tapReply(1, 0, null) === '' && V.tapReply(2, 0, 0) === '', 'the reply follows the tap; nothing before a tap, nothing where none is written');
ok(V.slideReply(1, 0, 0).startsWith('Never') && V.slideReply(1, 0, 8) === 'The rule chose for you most days. Those are days you did not choose.', 'the slider reply reads the number in words');
ok(V.slideReply(1, 1, 60).startsWith('60% of last week') && V.slideReply(1, 2, 9).startsWith('You know your numbers') && V.slideReply(1, 3, 1).startsWith('1 ask in 30 days'), 'each Level 01 slider answers in its own terms');
const text = [...L1.d.flatMap((D) => D.t.why), ...[0, 1, 2, 3].map((d) => V.planOf(1, d).idea)].join(' ');
ok(!/most founders|percentile|average founder|constellation|horoscope/i.test(text), 'no “most founders”, no benchmarks, no star-sign talk');

// ── Transform: a check on each blank, then the smaller step ─────────────────
const w = {};
const set = (d, k, v) => { w[V.wkey(1, d, k)] = v; };
set(3, 'day', 'Friday'); set(3, 'names', 'Mia, Sam');
ok(V.blankCheck(w, 1, 3, 'names').good === false && V.blankCheck(w, 1, 3, 'names').text === 'That’s 2 of 3. Who else?', 'three names: two is not yet three');
set(3, 'names', 'Mia, Sam and the bakery on Main Street');
ok(V.blankCheck(w, 1, 3, 'names').good && V.blankCheck(w, 1, 3, 'names').text.includes('Friday'), 'three names, and the day said back');
set(2, 'enough', 'a good amount'); ok(!V.blankCheck(w, 1, 2, 'enough').good, 'enough must be a number');
set(2, 'enough', '$4,200'); ok(V.blankCheck(w, 1, 2, 'enough').good, 'an amount passes');
set(1, 'who', 'someone'); ok(!V.blankCheck(w, 1, 1, 'who').good, 'a hand-over needs a real name');
set(1, 'who', 'Jordan'); ok(V.blankCheck(w, 1, 1, 'who').good, 'a name passes');
set(0, 'act', 'rest'); ok(!V.blankCheck(w, 1, 0, 'act').good, 'an action you could see happen: a few more words');
ok(V.blankCheck({}, 1, 0, 'act') === null && V.blankCheck(w, 2, 0, 'who') === null, 'no check before a word is written, nor where none is set');
ok(V.blankNote(1, 2, 'enough').includes('spreadsheet'), 'rule 9: say plainly what a machine can do');
ok(V.SMALL_UNDER === 60 && V.smallOf({ [V.wkey(1, 0, 'small')]: '1' }, 1, 0) && !V.smallOf({}, 1, 0), 'the smaller step is a saved choice, offered under 60%');

// ── The programme draws them ────────────────────────────────────────────────
const app = fs.readFileSync('public/app.js', 'utf8');
ok(app.includes("kind === 'idea'") && app.includes('<details class="cw-why"><summary>Why it matters</summary>'), 'the concept screen, the full paragraph folded under it');
ok(app.includes("replyHTML('Why it doesn’t hold', why)") && app.includes("replyHTML('What it costs', slideReply(level, d, v))") && app.includes("replyHTML('What it costs', slideReply(level, d, n))"), 'tap and slider replies, drawn and updated as the slider moves');
ok(app.includes('id="cwchk" aria-live="polite"') && app.includes("chk.innerHTML = checkHTML(+d, k)"), 'the check updates as the founder types');
ok(app.includes("first && p && !p.idea ?"), 'the long paragraph no longer sits on the first blank where a concept screen shows it');
ok(app.includes('data-v4small') && app.includes("keep4(d, 'small'") && app.includes('smallOf(w, lv, k) ? notyetOf(w, lv, k)'), 'the smaller step can be taken, and then it is what the week shows');
const css = fs.readFileSync('public/crown.css', 'utf8');
ok(['.cw-idea{', '.cw-reply{', '.cw-chk{', '.cw-small{', '.cw-why summary:focus-visible'].every((c) => css.includes(c)), 'styled, with a visible focus');

// ── Examples in dollars, with US names ──────────────────────────────────────
const src = fs.readFileSync('public/levels-v4.js', 'utf8');
ok(!src.includes('€') && !/Marta|Luca|Via Roma|Studio Rossi|Giulia|Paolo/.test(src), 'no euro amounts or Italian example names left in the levels');
ok(src.includes("'$4,200'") && src.includes("'Jordan'") && src.includes('Main Street'), 'the examples read in dollars, with US names');

done();
