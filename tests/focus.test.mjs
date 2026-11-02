// Focus mode, the welcome before each part, and "Where are you now?"
// (Alexandru, 2 Nov 2026; issue #113, 13:41).

import fs from 'node:fs';
import * as V from '../public/levels-v4.js';
import { entry } from '../public/home.js';
import { tally } from './_d1.mjs';

const { ok, done } = tally('focus');
const app = fs.readFileSync('public/app.js', 'utf8'), css = fs.readFileSync('public/focus.css', 'utf8');
const page = fs.readFileSync('public/ground-plan/index.html', 'utf8'), rules = fs.readFileSync('AGENTS.md', 'utf8');

// The welcome pages.
ok(Object.keys(V.WELCOME_AT).join() === '1,4,6,10' && V.WELCOME4.length === 4, 'a welcome before Levels 01, 04, 06 and 10');
ok(V.WELCOME4.every((W) => W.beats.map((b) => b[0]).join(' / ') === 'We understand you / It is possible / The puzzle / Here you are'), 'four steps, in Alexandru’s order');
ok(V.WELCOME4.every((W) => /fully/.test(W.beats[3][1])), 'every welcome asks for full answers');
ok(V.WELCOME4.every((W) => W.h.includes('{, first}') && W.summit && W.summit.sub), 'personal (the first name), with a version for The Summit');
ok(V.WELCOME4[0].summit.h.includes('The Summit'), 'The Summit has its own Level 01 welcome');
ok(app.includes('LEVELS4[n - 1].promise') && app.includes('By the end, you will have:'), 'what they will have: each level’s own promise');
ok(app.includes('You told us: “') && app.includes('level > 1 && whereWords(w, \'stage\')'), 'from Level 04 on, the welcome uses their own answers');
ok(!/\b\d+ (founders|members|people) (joined|use)/i.test(JSON.stringify(V.WELCOME4)), 'no invented counts');

// Where are you now?
ok(V.WHERE4.map((q) => q.k).join() === 'stage,money,who,weight,win', 'five taps: the business today, money, who they serve, what weighs most, the twelve-week win');
const s1 = V.stepsOf(1), s4 = V.stepsOf(4), s6 = V.stepsOf(6), s10 = V.stepsOf(10);
ok(s1[0][1] === 'welcome' && s1.slice(1, 6).map((s) => s[2]).join() === 'stage,money,who,weight,win' && s1[6][1] === 'idea', 'Level 01: the welcome, the five taps, then the first idea');
ok([s4, s6, s10].every((S) => S[0][1] === 'welcome' && S[1][1] === 'still' && S[2][1] === 'got'), '04, 06 and 10: the welcome, “Still where you were?”, then last week');
ok(V.stepsOf(2)[0][1] === 'got' && V.stepsOf(5)[0][1] === 'got', 'other levels open as before');
const w = { 'w.v4.where.stage': '1', 'w.v4.where.money': 'Savings', 'w.v4.where.weight': '0', 'w.v4.where.win': '0' };
ok(V.whereOf(w).stage === 1 && V.whereWords(w, 'money') === 'Savings' && V.whereWords(w, 'win') === 'My first paying customers', 'the answers read back as words');
ok(V.WHERE4[1].q({ stage: 1 }) === 'What pays your bills right now?' && V.WHERE4[1].q({ stage: 3 }).startsWith('Last month’s sales'), 'the money question follows the first answer');
ok([0, 1, 2, 3, 4, 5].map((i) => V.sizeOf({ 'w.v4.where.stage': String(i) })).join() === 'start,start,solo,team,company,company' && V.sizeOf({}) === '', 'four sizes for the examples');
ok(V.stepDone({}, 1, [-1, 'welcome']) === false && V.stepDone({ 'w.v4.1.w.seen': '1' }, 1, [-1, 'welcome']) && V.stepDone(w, 1, [-1, 'where', 'stage']) && !V.stepDone({}, 4, [-1, 'still']), 'each screen counts as done once answered');
ok(V.stepDone({ [V.wkey(1, 0, 't')]: '1' }, 1, [-1, 'welcome']) && V.stepDone({ [V.wkey(1, 0, 't')]: '1' }, 1, [-1, 'where', 'win']), 'a founder already inside a level is not sent back to its welcome');
ok(['stage', 'money', 'who', 'weight', 'win'].every((k) => /^w\.[\w.:-]{1,80}$/.test(`w.v4.where.${k}`)) && /^w\.[\w.:-]{1,80}$/.test('w.v4.4.w.stage'), 'the account keeps them (the /api/state key rule)');
ok(app.includes("set(`w.v4.where.${k}`, v);") && app.includes("if (needsAccount()) { askAccount(() => keepWhere(k, v)); return; }"), 'saved like every answer: the device first, the account in its batch');
ok(app.includes('In Level 01 you said: “'), 'the twelve-week answer is the first draft of the business goal in My Blueprint');

// Focus mode.
ok(app.includes('function fmOpen(at)') && app.includes('function fmClose()') && app.includes('role="dialog" aria-modal="true"'), 'one full-screen layer');
ok(app.includes("inFm ? pageHTML(st, x) : goHTML(st, x)"), 'the only way to answer: the page shows the way in, the layer the questions');
ok(app.includes('class="fm-bar"') && app.includes('${esc(LEAD[DOMS[d]])} · ${mine.findIndex(([, i]) => i === qi) + 1} of ${mine.length}') && app.includes('class="fm-back" data-qmove="-1"'), 'the top line: progress bar, “Lead yourself · 3 of 5”, Back');
ok(app.includes('data-fmdone="${domainEnd ? \'next\' : \'end\'}">Done ✓</button>'), 'Done ✓ at the end of a domain and of the level');
ok(app.includes("if (fm) { e.preventDefault(); fmClose(); return; }"), 'Esc closes the layer');
ok(app.includes('#programme-${level}-q') && app.includes('history.pushState(null, \'\', url)') && app.includes('if (fm && !q) { fmShut();') && entry({ joined: true, old: false, hash: '#programme-3-q' }) === 'work', 'opening it is a history step; Back closes it');
ok(app.includes('function fmAuto()') && app.includes("if (!tapReply(level, d, +b.dataset.v4t)) fmAuto();") && app.includes('if (+b.dataset.got === 0) fmAuto();'), 'a tap moves on by itself, unless a reply is there to read');
ok(app.includes("['where', 'still', 'tap', 'got', 'day', 'carry', 'carryday', 'bday'].includes(stepAt(qi)[1])"), 'keys 1–9 choose on every tap screen');
ok(app.includes("const FM_BEHIND = ['body > .top'") && !app.includes("'#libban', 'footer'"), 'everything behind the layer is set aside, not the layer’s own Next');

// Light, white, one font; the page loads it.
ok(css.includes("--fm-font:'Atkinson Hyperlegible'") && css.includes('background:#FFFFFF') && css.includes('position:fixed;inset:0;z-index:120'), 'light and white, Atkinson Hyperlegible, the whole screen');
ok(css.includes('max-width:640px') && css.includes('body.fmopen .leaf-r .cw-foot{display:flex;justify-content:flex-start'), 'one centred column; Next right under the answer');
ok(css.includes('prefers-reduced-motion') && page.includes('<link rel="stylesheet" href="/focus.css">'), 'reduced motion; Base Camp loads it');
ok(rules.includes('## 16. A welcome before each part, "Where are you now?", and focus mode'), 'the rule is saved for every session');

done();
