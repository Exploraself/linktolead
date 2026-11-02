// Focus mode, the welcome before each part, and "Where are you now?"
// (Alexandru, 2 Nov 2026; issue #113, 13:41).

import fs from 'node:fs';
import * as V from '../public/levels-v4.js';
import { entry } from '../public/home.js';
import { tally } from './_d1.mjs';

const { ok, done } = tally('focus');
const app = fs.readFileSync('public/app.js', 'utf8'), css = fs.readFileSync('public/focus.css', 'utf8');
const page = fs.readFileSync('public/ground-plan/index.html', 'utf8'), rules = fs.readFileSync('AGENTS.md', 'utf8');

// The elephant in the room (Alexandru, 2 Nov 2026, 20:29).
ok(Object.keys(V.WELCOME_AT).join() === '1,4,6,10' && V.WELCOME4.length === 4, 'a welcome before Levels 01, 04, 06 and 10');
ok(V.WELCOME4.map((W) => W.name).join(' / ') === 'Your hidden potential / The future you / The customer, not the ego / The money' && V.WELCOME4[0].summit.name === 'Greatness', 'five elephants: your hidden potential, the future you, the customer, the money, and Greatness for The Summit');
const ALL_BEATS = [...V.WELCOME4.map((W) => W.beats), V.WELCOME4[0].summit.beats];
ok(ALL_BEATS.every((B) => B.map((b) => b.t).join(' / ') === 'We understand you / It is possible / The puzzle / Here you are'), 'four steps, in Alexandru’s order, one per screen');
ok(ALL_BEATS.every((B) => /fully/.test(B[3].p) && B[0].h.includes('{, first}')), 'every welcome asks for full answers, by first name');
ok(V.WELCOME4.every((W) => W.asks.length === 3 && W.asks.every((q) => (Array.isArray(q.o) && q.o.length >= 3) || q.s)), 'three questions each, a tap or a slider: nothing to write');
ok(/what do you think stops you/i.test(V.WELCOME4[0].asks[0].q) && V.WELCOME4[1].asks[0].was.join() === '1,stops', 'Level 01 asks what stops them; Level 04 reads it back');
ok(V.WELCOME4[3].beats.some((b) => b.q && b.q.startsWith('A business is a system, a service or a product that solves people’s problem and that people are willing to pay for.')), 'The money: a business, in Alexandru’s own words');
ok(/45 minutes, every week, online on Google Meet/.test(V.WELCOME4[0].summit.beats[3].p) && V.beatsOf(1, true)[1].h === 'Only with great people do we pull out greatness.', 'Greatness: one session per level, 45 minutes weekly, on Google Meet');
ok([4, 6, 10].every((lv) => /The Summit|We meet at every level/.test(V.beatsOf(lv, true)[3].p) && !/The Summit|We meet at every level/.test(V.beatsOf(lv, false)[3].p)), 'a Summit founder reads their own last words at 04, 06 and 10');
const words = JSON.stringify(V.WELCOME4);
ok(!/\b(video|library)\b/i.test(words), 'no welcome promises a video or the library');
ok(!/\b\d+ (founders|members|people) (joined|use)/i.test(words) && !/most founders/i.test(words), 'no invented counts');
ok(app.includes('LEVELS4[n - 1].promise') && app.includes('By the end, you will have:'), 'what they will have: each level’s own promise');
ok(app.includes('function toldHTML()') && app.includes("askWords(w, 1, 'stops')") && app.includes('${B.told && level > 1 ? toldHTML() :'), 'from Level 04 on, the welcome uses their own answers');
ok(app.includes('href="/northstar/"') && app.includes('Take the North Star'), 'Level 01 sends them back to the North Star');

// The door: which of the four versions (only taps and sliders).
ok(V.WHERE4.map((q) => q.k).join() === 'cust,sales,team,offer,reach,yes,back,margin,win', 'the door: customers, sales, people paid, the offer, reach, yes, coming back, what a sale leaves, the twelve-week win');
ok(V.WHERE4.every((Q) => Array.isArray(Q.o) || Q.s), 'only taps and sliders: nothing to write');
ok(['yes', 'back', 'margin'].every((k) => V.WHERE4.find((Q) => Q.k === k).x.length) && V.WHERE4[0].o[0] === 'None yet', 'every number has its “not yet” or “I don’t know”');
const s1 = V.stepsOf(1), s4 = V.stepsOf(4), s6 = V.stepsOf(6), s10 = V.stepsOf(10);
ok(s1.slice(0, 4).every((s, i) => s[1] === 'welcome' && s[2] === i) && s1.slice(4, 7).every((s) => s[1] === 'wask') && s1.slice(7, 16).map((s) => s[2]).join() === 'cust,sales,team,offer,reach,yes,back,margin,win' && s1[16][1] === 'you' && s1[17][1] === 'idea', 'Level 01: four screens, three taps, the door, your version, then the first idea');
ok([s4, s6, s10].every((S) => S.slice(0, 4).every((s) => s[1] === 'welcome') && S.slice(4, 7).every((s) => s[1] === 'wask') && S[7][1] === 'still' && S[8][1] === 'got'), '04, 06 and 10: four screens, three taps, “Still …?”, then last week');
ok(V.stepsOf(2)[0][1] === 'got' && V.stepsOf(5)[0][1] === 'got', 'other levels open as before');
const at = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [`w.v4.where.${k}`, String(v)]));
ok(V.typeOf(at({ cust: 0, team: 3 })) === 'start' && V.typeOf(at({ cust: 2, team: 0 })) === 'solo' && V.typeOf(at({ cust: 2, team: 2 })) === 'team' && V.typeOf(at({ cust: 4, team: 3 })) === 'company' && V.typeOf({}) === '', 'no customer yet: before the first sale; nobody paid: selling alone; 1 to 14: a team; 15 or more: 16 people or more');
ok(V.skipsStep(at({ cust: 0 }), [-1, 'where', 'margin']) && !V.skipsStep(at({ cust: 1 }), [-1, 'where', 'margin']) && !V.skipsStep(at({ cust: 0 }), [-1, 'where', 'yes']), 'before a first sale, the selling questions are passed over');
ok(V.sizeOf(at({ cust: 1 })) === 'solo' && V.sizeOf(at({ cust: 1, stage: 3 })) === 'team', 'the version they said “That’s me” to wins over the numbers');
ok([0, 1, 2, 3, 4, 5].map((i) => V.sizeOf({ 'w.v4.where.stage': String(i) })).join() === 'start,start,solo,team,company,company' && V.sizeOf({}) === '', 'the first six answers still read as the four sizes');
ok(V.whereWords(at({ stage: 2 }), 'stage') === 'Selling alone' && V.whereWords(at({ margin: 'x0' }), 'margin') === 'I don’t know' && V.whereWords(at({ margin: 25 }), 'margin') === '$25' && V.whereWords(at({ win: 0 }), 'win') === 'My first paying customers', 'the answers read back as words');
const rb = V.readBack(at({ cust: 2, margin: 15, yes: 2, offer: 4, back: 3 }));
ok(rb.length === 3 && rb.every((l) => /Level \d\d/.test(l)) && !/average|benchmark|industry/i.test(rb.join()), 'their numbers, read back: three at most, each pointing at a level and a decision, never a benchmark');
ok(app.includes('Your version: ${esc(T.n)}.') && app.includes("keepWhere('stage', SIZE_STAGE[typeOf(state.work) || 'solo'])"), 'your version, and “That’s me”');
// The switch: their own answers say they moved up.
ok(V.switchOf({ 'w.v4.where.stage': '1', [V.wkey(2, 3, 's')]: '2' }).to === 'solo' && V.switchOf({ 'w.v4.where.stage': '2', [V.wkey(7, 1, 't')]: '2' }).to === 'team' && V.switchOf({ 'w.v4.where.stage': '2', [V.wkey(7, 1, 't')]: '2', 'w.v4.where.keep': 'team' }) === null && V.switchOf({ 'w.v4.where.stage': '2' }) === null, 'the switch: told when their answers say they moved up; “Keep mine” is remembered');
ok(app.includes('${weekList(level, sh)}\n      ${switchHTML()}') && app.includes('${switchHTML()}${sizesHTML()}') && app.includes("replyHTML('You have moved up'"), 'the switch shows on the week, in My Blueprint and on “Still …?”');
ok(V.stepDone({}, 1, [-1, 'welcome', 0]) === false && V.stepDone({ 'w.v4.1.w.seen': '1' }, 1, [-1, 'welcome', 2]) && V.stepDone({ 'w.v4.1.w.stops': '0' }, 1, [-1, 'wask', 'stops']) && V.stepDone(at({ cust: 0 }), 1, [-1, 'where', 'cust']) && !V.stepDone({}, 4, [-1, 'still']) && !V.stepDone({}, 1, [-1, 'you']) && V.stepDone(at({ stage: 2 }), 1, [-1, 'you']), 'each screen counts as done once answered');
ok(V.stepDone(at({ stage: 2 }), 1, [-1, 'where', 'cust']), 'a founder who gave their size before the door is not asked again');
ok(V.stepDone({ [V.wkey(1, 0, 't')]: '1' }, 1, [-1, 'welcome', 0]) && V.stepDone({ [V.wkey(1, 0, 't')]: '1' }, 1, [-1, 'where', 'win']), 'a founder already inside a level is not sent back to its welcome');
ok(V.WHERE4.map((Q) => Q.k).concat(['stage', 'keep']).every((k) => /^w\.[\w.:-]{1,80}$/.test(`w.v4.where.${k}`)) && /^w\.[\w.:-]{1,80}$/.test('w.v4.4.w.stops'), 'the account keeps them (the /api/state key rule)');
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
ok(app.includes("['wask', 'where', 'you', 'still', 'tap', 'got', 'day', 'carry', 'carryday', 'bday'].includes(stepAt(qi)[1]) && !slideAt(level, stepAt(qi))"), 'keys 1–9 choose on every tap screen');
ok(app.includes("const FM_BEHIND = ['body > .top'") && !app.includes("'#libban', 'footer'"), 'everything behind the layer is set aside, not the layer’s own Next');

// Light, white, one font; the page loads it.
ok(css.includes("--fm-font:'Atkinson Hyperlegible'") && css.includes('background:#FFFFFF') && css.includes('position:fixed;inset:0;z-index:120'), 'light and white, Atkinson Hyperlegible, the whole screen');
ok(css.includes('max-width:640px') && css.includes('body.fmopen .leaf-r .cw-foot{display:flex;justify-content:flex-start'), 'one centred column; Next right under the answer');
ok(css.includes('prefers-reduced-motion') && page.includes('<link rel="stylesheet" href="/focus.css">'), 'reduced motion; Base Camp loads it');
ok(rules.includes('## 16. The elephant in the room, the door, and focus mode'), 'the rule is saved for every session');

done();
