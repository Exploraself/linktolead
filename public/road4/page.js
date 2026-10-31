// "/road4/": Road 4, the sales page for The Founder's Blueprint. Every call
// to action on it opens the account form, landing "road4", so a founder who
// arrives here signs up here. Which form is a test (01 START HERE §3b, 1 Nov):
// each new device gets the simple form (name + email) or the full one (with a
// password) at random, kept on that device, and the account records which
// (signup_type), so the two can be compared by sign-ups. FORM_TEST off = full.
//
// Everything on it is a tap or a drag; nothing is typed, saved or sent:
//   · the mirror: the stage, then eight questions answered yes or no, each
//     with its own drawing and a straight reflection, then a reading: where
//     the business leaks most, which kind of stuck it sounds like, and where
//     week one would start (the real level-one steps for that domain);
//   · two kinds of stuck: the Hoper and the Grinder on a triangle of reason,
//     strategy and effort;
//   · week one, drawn from the real Version 4 level one (SEED): the four
//     moves, one card per part of the business, the mirror's part marked;
//   · the twelve weeks as a climb from Base Camp to the summit, each camp
//     with its real Version 4 word and promise (the same for every stage);
//   · "Count it yourself" (two sliders) and today against week twelve.
//
// The two blocks marked "@site" are the only parts that need the site. The
// preview artifact replaces them with the same data inlined and a note.

// @site data
import { DOMAINS, STAGES, gateFor } from '/content.js';
import { LEVELS4 } from '/levels-v4.js';
import { remember, stickyJoin, countUp, count, trackScroll, matchHeadline, welcomeBack, stories, nowThen, whenLine } from '/road-kit.js';
// @end data

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const still = () => document.documentElement.classList.contains('still') || matchMedia('(prefers-reduced-motion: reduce)').matches;
const dname = (k) => DOMAINS.find((d) => d.k === k).n;
const replay = (el) => { if (!el || still()) return; el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); };
let stage = 'build';

// @site join
const gate = $('#gate');
let box = null;
const loadBox = () => box || (box = import('/account-box.js').catch(() => { box = null; }));
const joined = (() => { try { return !!localStorage.getItem('ftb-token'); } catch { return false; } })();
import('/forms.js').then((m) => m.rememberUtm()).catch(() => {});
const FORM_TEST = true;
const variant = (() => {
  if (!FORM_TEST) return 'full';
  try {
    let v = localStorage.getItem('ftb-r4-form');
    if (v !== 'simple' && v !== 'full') { v = Math.random() < 0.5 ? 'simple' : 'full'; localStorage.setItem('ftb-r4-form', v); }
    return v;
  } catch { return 'full'; }
})();
function join(e) {
  if (e) e.preventDefault();
  const opener = e && e.currentTarget;
  gate.hidden = false;
  count('road4', 'form_open'); count('road4', variant === 'simple' ? 'form_simple' : 'form_full');
  loadBox().then((m) => m && m.open({ gate, opener, stage: { id: stage }, variant, landing: 'road4' }));
}
// A founder who has already joined is not starting: the buttons say so.
function wireJoin(a) {
  if (joined) { a.removeAttribute('data-join'); a.href = '/ground-plan/#home'; a.firstChild.textContent = a.closest('.tnav') ? 'My Blueprint' : 'Continue my Blueprint '; return; }
  a.addEventListener('click', join);
}
if (location.hash === '#join' && !joined) join();
// @end join
document.querySelectorAll('[data-join]').forEach(wireJoin);

// ── The mirror ──────────────────────────────────────────────────────────────
// Each question: its domain, the words, which answer means a leak, the two
// reflections, and its drawing. Read the way a calendar would answer.
const ART = {
  clock: '<circle class="ln" cx="80" cy="56" r="40"/><path class="wedge a" d="M80 56 L80 16 A40 40 0 0 1 118 46 Z"/><path class="wedge b" d="M80 56 L118 46 A40 40 0 0 1 100 91 Z"/><path class="ln hand" d="M80 56 L80 26"/><circle cx="80" cy="56" r="3" class="dot"/>',
  away: '<rect class="ln" x="22" y="18" width="116" height="78" rx="6"/><path class="ln" d="M22 36h116"/>' + Array.from({ length: 14 }, (_, i) => `<rect class="cell" style="--i:${i}" x="${30 + (i % 7) * 15.5}" y="${44 + Math.floor(i / 7) * 24}" width="11" height="16" rx="2"/>`).join(''),
  expect: '<circle class="ln" cx="46" cy="58" r="10"/><path class="ln" d="M30 96c2-14 8-20 16-20s14 6 16 20"/><circle class="ln" cx="116" cy="58" r="10"/><path class="ln" d="M100 96c2-14 8-20 16-20s14 6 16 20"/><path class="ln" d="M64 14h52a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8H92l-10 9v-9H64a8 8 0 0 1-8-8V22a8 8 0 0 1 8-8Z"/><text class="q" x="90" y="37" text-anchor="middle">?</text>',
  avoid: '<circle class="ln" cx="40" cy="44" r="10"/><path class="ln" d="M24 84c2-14 8-20 16-20s14 6 16 20"/><circle class="ln" cx="120" cy="44" r="10"/><path class="ln" d="M104 84c2-14 8-20 16-20s14 6 16 20"/><path class="gap" d="M58 60 H102"/><text class="days" x="80" y="104" text-anchor="middle">31 days</text>',
  chain: '<rect class="ln" x="8" y="40" width="28" height="28" rx="4"/><rect class="ln" x="48" y="40" width="28" height="28" rx="4"/><rect class="miss" x="88" y="40" width="28" height="28" rx="4"/><rect class="ln" x="128" y="40" width="24" height="28" rx="4"/><path class="ln" d="M36 54h12M76 54h12M116 54h12"/><text class="q" x="102" y="60" text-anchor="middle">?</text>',
  ten: Array.from({ length: 10 }, (_, i) => `<g class="p" style="--i:${i}"><circle cx="${18 + (i % 5) * 31}" cy="${30 + Math.floor(i / 5) * 42}" r="7"/><path d="M${8 + (i % 5) * 31} ${52 + Math.floor(i / 5) * 42}c1-8 5-12 10-12s9 4 10 12"/></g>`).join(''),
  reason: '<circle class="ln" cx="80" cy="56" r="40"/><path class="ln" d="M80 12v8M80 92v8M36 56h8M116 56h8"/><g class="needle"><path d="M80 56 L74 56 L80 24 L86 56 Z" class="nd"/><path d="M80 56 L74 56 L80 88 L86 56 Z" class="ln"/></g>',
  hour: '<path class="ln" d="M50 12h44M50 100h44M56 12c0 26 32 30 32 44S56 74 56 100M88 12c0 26-32 30-32 44s32 30 32 44"/><path class="sand" d="M62 92 Q72 80 82 92 Z"/><circle class="grain" cx="72" cy="60" r="2"/><circle class="coin" cx="128" cy="78" r="14"/><text class="cn" x="128" y="83" text-anchor="middle">?</text>',
};
export const QS = [
  { k: 'self', art: 'clock', q: 'Do you know, to the hour, where last week went?', leak: 'no',
    no: 'Then your week was decided by whoever asked first. That isn’t a time problem. It’s a decision you haven’t made.',
    yes: 'Then you already hold the evidence the work starts from. The question is whether you acted on it.' },
  { k: 'work', art: 'away', q: 'If you took two weeks off next month, would the business keep its pace?', leak: 'no',
    no: 'Then you don’t own a business yet. You own a job that can’t give you a holiday.',
    yes: 'Good. Then the question is whether you spend that freedom on the work only you can do.' },
  { k: 'people', art: 'expect', q: 'Does everyone who works with you know exactly what you expect, because you said it, not because they guessed?', leak: 'no',
    no: 'Then part of every mistake they make is yours. They are working to a standard you never said out loud.',
    yes: 'Then test it once this week: ask one of them to say it back to you.' },
  { k: 'market', art: 'ten', q: 'Could you name the last ten people who paid you, and say in their words why they chose you?', leak: 'no',
    no: 'Then you’re selling to a customer you imagined. The real ones would tell you what works, if you asked.',
    yes: 'Then you hold the most underused evidence in any small business. Week one puts it to work.' },
  { k: 'self', art: 'reason', q: 'Could you say in one sentence why this business exists, and would your team say the same sentence?', leak: 'no',
    no: 'Then everyone is working hard in slightly different directions. That’s where the energy leaks.',
    yes: 'Then you have the reason. The next question is whether your calendar agrees with it.' },
  { k: 'work', art: 'chain', q: 'If you vanished for a week, could someone deliver what you sell the way you would?', leak: 'no',
    no: 'Then the business is stored in your head, the most fragile place it could be.',
    yes: 'Then it’s written down somewhere. Check when someone other than you last followed it.' },
  { k: 'people', art: 'avoid', q: 'Is there a conversation you have been putting off for more than a month?', leak: 'yes',
    no: 'Good. Then you’re ahead of the hardest part of leading people.',
    yes: 'It costs you something every week it waits. You already know who it’s with.' },
  { k: 'market', art: 'hour', q: 'Do you know what one hour of your time is worth to the business, as a number?', leak: 'no',
    no: 'Then you’re pricing from fear, and saying yes to work that quietly makes you poorer.',
    yes: 'Then you can see which customers pay for your time and which ones spend it.' },
];
const card = $('#m-card'), result = $('#m-result'), stageBox = $('#m-stage');
let qi = 0, answers = [];
const leaks = () => answers.map((a, i) => a === QS[i].leak);

function dots() {
  const L = leaks();
  return `<div class="mdots" aria-label="Question ${qi + 1} of ${QS.length}">${QS.map((_, i) => `<i class="${i < answers.length ? (L[i] ? 'leak' : 'ok') : i === qi ? 'now' : ''}"></i>`).join('')}</div>`;
}
function ask() {
  const q = QS[qi];
  card.innerHTML = `${dots()}<div class="mbody">
      <svg class="ill ill-${q.art}" viewBox="0 0 160 110" aria-hidden="true">${ART[q.art]}</svg>
      <div><p class="mtag">${esc(dname(q.k))} · ${qi + 1} of ${QS.length}</p><p class="mq">${esc(q.q)}</p>
      <div class="yn"><button type="button" data-a="yes">Yes</button><button type="button" data-a="no">No</button></div>
      <p class="mref" id="m-ref"></p></div></div>`;
  replay(card);
}
card.addEventListener('click', (e) => {
  const a = e.target.closest('[data-a]'), nx = e.target.closest('[data-next]');
  if (a && answers.length === qi) {
    answers.push(a.dataset.a);
    const q = QS[qi], leak = a.dataset.a === q.leak;
    card.querySelectorAll('[data-a]').forEach((b) => { b.disabled = true; b.classList.toggle('picked', b === a); });
    card.querySelector('.mdots').outerHTML = dots();
    const ref = $('#m-ref');
    ref.className = `mref ${leak ? 'leak' : 'ok'}`;
    ref.innerHTML = `<span>${esc(q[a.dataset.a])}</span><button type="button" class="mnext" data-next>${qi + 1 < QS.length ? 'Next question →' : 'See my mirror →'}</button>`;
    replay(ref);
    ref.querySelector('[data-next]').focus({ preventScroll: true });
  } else if (nx) {
    qi++;
    if (qi < QS.length) { ask(); card.querySelector('[data-a]').focus({ preventScroll: true }); } else reading();
  }
});
$('.tiles').addEventListener('click', (e) => {
  const t = e.target.closest('[data-pick]');
  if (!t) return;
  setStage(t.dataset.pick);
  count('road4', 'mirror_start');
  stageBox.hidden = true; card.hidden = false; qi = 0; answers = [];
  ask();
  card.querySelector('[data-a]').focus({ preventScroll: true });
});

/** The reading: where it leaks, which kind of stuck, and where week one starts. */
async function reading() {
  const L = leaks(), by = {};
  for (const d of DOMAINS) by[d.k] = 0;
  L.forEach((l, i) => { if (l) by[QS[i].k]++; });
  const total = L.filter(Boolean).length;
  // Ties go to the domain the founder's stage leans on first.
  const order = [...new Set([...STAGES[stage].emphasis.filter((k) => k in by), ...DOMAINS.map((d) => d.k)])];
  const worst = total ? order.reduce((a, k) => (by[k] > by[a] ? k : a), order[0]) : 'self';
  const type = total <= 1 ? 'leader' : L[4] ? 'grinder' : 'hoper';
  const L1 = LEVELS4[0], di = DOMAINS.findIndex((d) => d.k === worst), one = L1.d[di];
  remember('road4', { stage, worst, leaking: total, word: L1.word, letter: one.l, part: one.name, result: RESULTS[di] });
  count('road4', 'mirror_done');
  // The diamond: one corner per domain, pulled in by every leak.
  const pts = { self: [0, -1], people: [1, 0], work: [0, 1], market: [-1, 0] };
  const at = (k, r) => [130 + pts[k][0] * r, 130 + pts[k][1] * r];
  const reach = (k) => 92 * (1 - by[k] * 0.33);
  const poly = DOMAINS.map((d) => at(d.k, reach(d.k)).join(',')).join(' ');
  const said = L.map((l, i) => (l ? QS[i][answers[i]] : null)).filter(Boolean).slice(0, 3);
  card.hidden = true; result.hidden = false;
  result.innerHTML = `<div class="rgrid">
    <svg class="diamond" viewBox="0 0 260 260" role="img" aria-label="Your four parts of the business. Each leak pulls its corner in. ${esc(DOMAINS.map((d) => `${d.n}: ${by[d.k]} of 2 leaking`).join('. '))}.">
      <path class="dgrid" d="M130 38 L222 130 L130 222 L38 130 Z"/><path class="dgrid" d="M130 84 L176 130 L130 176 L84 130 Z"/>
      <path class="dgrid" d="M130 38 V222 M38 130 H222"/>
      <polygon class="dshape" points="${poly}"/>
      ${DOMAINS.map((d) => { const [x, y] = at(d.k, reach(d.k)); return `<circle class="dpt${d.k === worst && total ? ' worst' : ''}" cx="${x}" cy="${y}" r="6"/>`; }).join('')}
    </svg>
    <div class="rtext">
      <p class="mtag">Your mirror · ${esc(STAGES[stage].n)}</p>
      <h3>${total ? `It leaks most through <em>${esc(dname(worst))}</em>.` : 'Nothing leaked on these eight.'}</h3>
      <ul class="dlegend">${DOMAINS.map((d) => `<li class="${d.k === worst && total ? 'worst' : ''}"><i style="--n:${by[d.k]}"></i>${esc(d.n)}<span>${by[d.k] ? `${by[d.k]} of 2 leaking` : 'holding'}</span></li>`).join('')}</ul>
      ${said.length ? `<p class="rsum">What your answers said back:</p><ul class="said">${said.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : '<p class="rsum">Then check it against your calendar, not your memory. Week one does exactly that.</p>'}
      <p class="rtype">This week you sound like <a href="#types" data-show-type="${type}">${esc(TYPES[type].name)}</a>.</p>
    </div>
  </div>
  <div class="rstart"><p class="mtag">Where your week one would start · ${esc(dname(worst))}</p>
    <h4>${esc(RESULTS[di])}</h4><ol><li><b>Tap.</b> ${plain(one.t.q)}</li><li><b>Slide.</b> ${esc(one.s.q)}</li></ol>
    <p class="rprom">By Sunday of week one: ${esc(L1.promise.charAt(0).toLowerCase() + L1.promise.slice(1))}</p>
    <div class="acts"><a class="cta" href="#join" data-join>Start week one on ${esc(dname(worst))}, free <span class="ar" aria-hidden="true">→</span></a><button type="button" class="ghost" data-again>Look again</button></div></div>`;
  result.querySelectorAll('[data-join]').forEach(wireJoin);
  result.querySelector('[data-again]')?.addEventListener('click', () => { result.hidden = true; stageBox.hidden = false; $('#mirror').scrollIntoView({ behavior: still() ? 'auto' : 'smooth' }); });
  result.querySelector('[data-show-type]').addEventListener('click', () => pickType(type));
  replay(result);
  result.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'start' });
  week.dom = worst; week.set = true; today = di; drawDays();
  const mine = $('#close-mine');
  mine.textContent = total ? `Your mirror said ${dname(worst)}. Week one starts there, on your own answers.` : 'Your mirror held on all eight. Week one checks it against your calendar.';
  mine.hidden = false;
}
/** A question from the levels file, as plain text (its emphasis kept as words). */
const plain = (h) => esc(String(h).replace(/<[^>]+>/g, ''));
/** Level one's promise, one result per part of the business, in order
 *  (yourself, people, business, market): what a card leads with, so the
 *  four-letter word stays a small label and never has to be decoded. */
const RESULTS = LEVELS4[0].promise.replace(/\.$/, '').split(/,\s*/).map((x) => x.charAt(0).toUpperCase() + x.slice(1));

// ── Two kinds of stuck ──────────────────────────────────────────────────────
const TYPES = {
  hoper: { has: ['r'], core: 'Hope, without a plan', name: 'the Hoper', title: 'The Hoper', line: 'Has the reason. Waits for the rest.',
    signs: ['“Once the right client finds me, it will take off.”', '“If I just post more, it should work.”', 'A plan you admire more than you run.'],
    under: 'A real belief in the idea, and an honest underestimate of the strategic work: who exactly it is for, what it is worth, and what has to happen every week for it to grow.',
    gives: 'One customer named, one price written down, one thing done by Sunday.' },
  grinder: { has: ['e'], core: 'Motion, without meaning', name: 'the Grinder', title: 'The Grinder', line: 'Has the effort. Has lost the reason.',
    signs: ['Always busy, rarely sure it is the right busy.', 'Can’t say what you would stop.', '“I’ll think about direction when things calm down.” They don’t.'],
    under: 'Enormous effort, pointed by whatever is loudest. Without a reason you can say plainly there is nothing to say no with, so everything gets a yes and the week fills itself.',
    gives: 'A reason in one sentence, and a list of what to stop: the week you chose, the customers you aim at, the work that is no longer yours.' },
  leader: { has: ['r', 's', 'e'], core: 'A business that grows', name: 'the founder who leads', title: 'The founder who leads', line: 'Reason, strategy and effort, in the same week.',
    signs: ['Can say why in one sentence.', 'Knows which customers, which work and which number matter.', 'Does one real thing each week, and checks it on Sunday.'],
    under: 'Not a personality. A practice. They look at the same evidence every week and decide on it.',
    gives: 'This is what the twelve weeks build, one Sunday at a time.' },
};
const tri = $('.tri');
function drawType(k, swap) {
  const t = TYPES[k], has = (c) => t.has.includes(c);
  for (const c of ['r', 's', 'e']) { const v = tri.querySelector(`.v-${c}`); v.classList.toggle('has', has(c)); v.classList.toggle('miss', !has(c)); }
  for (const [cls, x, y] of [['rs', 'r', 's'], ['re', 'r', 'e'], ['se', 's', 'e']]) tri.querySelector(`.s-${cls}`).classList.toggle('miss', !(has(x) && has(y)));
  $('#tri-core').textContent = t.core;
  const c = $('#tcard');
  c.innerHTML = `<h3>${esc(t.title)}</h3><p>${esc(t.line)}</p>
    <p class="lbl">You might hear yourself say</p><ul>${t.signs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <p class="lbl">What is really going on</p><p>${esc(t.under)}</p>
    <p class="lbl">What the twelve weeks give you</p><p class="gives">${esc(t.gives)}</p>`;
  if (swap) replay(c);
}
function pickType(k) {
  document.querySelectorAll('[data-type]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.type === k)));
  drawType(k, true);
}
$('.typebtns').addEventListener('click', (e) => { const b = e.target.closest('[data-type]'); if (b) pickType(b.dataset.type); });
drawType('hoper');

// ── Week one: the real level one, four parts, four moves each ──────────────
const week = { dom: 'self' };
let today = 0, dayTimer = null;
// The experiment (1 Nov): each card says its move in four or five words.
const GIST = ['Name the rule you live by.', 'Name what only you hold.', 'Turn “enough” into a number.', 'Ask three people to buy.'];
const DCOL = { self: 'var(--self)', people: 'var(--people)', work: 'var(--work)', market: 'var(--market)' };
function drawDays() {
  const L1 = LEVELS4[0];
  $('#week-eyebrow').textContent = `Week one · ${L1.word} · ${L1.title}`;
  $('#days').innerHTML = L1.d.map((x, i) => { const k = DOMAINS[i].k, mine = k === week.dom && week.set;
    return `<li class="day${i === today ? ' on' : ''}" style="--dc:${DCOL[k]}">
    <span class="dk">${esc(DOMAINS[i].n)}</span><span class="res">${esc(RESULTS[i])}</span><span class="lbl">${esc(L1.word)} · ${esc(x.l)} for ${esc(x.name)}</span>
    ${mine ? '<span class="yours">Where your mirror points</span>' : ''}
    <p class="tq">${esc(GIST[i])}</p></li>`; }).join('');
}
function dayWalk(on) {
  clearInterval(dayTimer); dayTimer = null;
  if (!on || still()) return;
  dayTimer = setInterval(() => {
    const li = $('#days').children;
    if (!li.length) return;
    li[today]?.classList.remove('on'); today = (today + 1) % li.length; li[today].classList.add('on');
  }, 1800);
}

// ── The twelve weeks, as a climb ────────────────────────────────────────────
const BAND = { free: ['f', 'Free'], session: ['s', 'Opens with the Boardroom'], lab: ['l', 'In the LAB'], hub: ['h', 'In the HUB'] };
const trail = $('#trail');
const len = trail.getTotalLength();
const camp = Array.from({ length: 12 }, (_, i) => trail.getPointAtLength(len * (0.03 + i * 0.94 / 11)));
$('#camps').innerHTML = camp.map((p, i) => `<g class="camp ${BAND[gateFor(i + 1)][0]}" data-wk="${i + 1}" tabindex="0" role="button" aria-label="Week ${i + 1}">
  <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="13"/><text x="${p.x.toFixed(1)}" y="${(p.y + 4).toFixed(1)}" text-anchor="middle">${i + 1}</text></g>`).join('');
let wk = 1;
function drawClimb(swap) {
  const name = (n) => `${LEVELS4[n - 1].word} · ${LEVELS4[n - 1].title}`;
  document.querySelectorAll('#camps .camp').forEach((g) => { const n = +g.dataset.wk; g.classList.toggle('on', n === wk); g.setAttribute('aria-label', `Week ${n}: ${name(n)}`); g.setAttribute('aria-pressed', String(n === wk)); });
  const p = camp[wk - 1];
  $('#climber').setAttribute('transform', `translate(${p.x.toFixed(1)} ${(p.y - 26).toFixed(1)})`);
  $('#wk-band').textContent = `Week ${wk} · ${BAND[gateFor(wk)][1]}`;
  $('#wk-name').textContent = name(wk);
  $('#wk-promise').textContent = `By Sunday: ${LEVELS4[wk - 1].promise.charAt(0).toLowerCase()}${LEVELS4[wk - 1].promise.slice(1)}`;
  if (swap) replay($('.climb .sunday'));
}
const goWeek = (n) => { wk = Math.min(12, Math.max(1, n)); drawClimb(true); };
$('#camps').addEventListener('click', (e) => { const g = e.target.closest('[data-wk]'); if (g) goWeek(+g.dataset.wk); });
$('#camps').addEventListener('keydown', (e) => { const g = e.target.closest('[data-wk]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); goWeek(+g.dataset.wk); } });
$('#wk-prev').addEventListener('click', () => goWeek(wk - 1));
$('#wk-next').addEventListener('click', () => goWeek(wk + 1));

// ── The stage, chosen in the mirror or above the climb ──────────────────────
// The levels are the same for every stage (Version 4); the stage goes with
// the sign-up, and breaks ties in the mirror.
function setStage(st) { stage = st; }

// ── Count it yourself ───────────────────────────────────────────────────────
const now = $('#s-now'), want = $('#s-want'), cal = $('#cal');
cal.innerHTML = Array.from({ length: 52 }, (_, i) => `<i style="--i:${i}"></i>`).join('');
function hours() {
  const n = +now.value, w = +want.value, extra = Math.max(0, n - w) * 52, weeks = Math.min(52, Math.round(extra / w));
  $('#o-now').textContent = `${n} h`;
  $('#o-want').textContent = `${w} h`;
  $('#o-year').textContent = `${extra.toLocaleString('en-US')} h`;
  [...cal.children].forEach((c, i) => c.classList.toggle('on', i < weeks));
  $('#o-eq').textContent = extra ? `That is ${weeks} of your chosen weeks, every year.` : 'You already work the week you want.';
  $('#r-ask').textContent = extra ? 'Who got those hours last year, and who went without them?' : 'Then the question is what each of those hours is buying you.';
  // The after, in their own number: one protected three-hour block a week.
  const back = Math.min(extra, 156);
  $('#o-after').textContent = !extra ? 'Then week seven, HOUR, makes sure those hours stay protected.'
    : back < extra ? `One protected three-hour block a week takes back ${back.toLocaleString('en-US')} of them, every year. Week seven, HOUR, builds that block.`
      : 'One protected block a week takes back all of them. Week seven, HOUR, builds that block.';
}
now.addEventListener('input', hours); want.addEventListener('input', hours); hours();

// ── Today and week twelve: the founder's own marks, and their own case (road-kit.js)
drawClimb(); drawDays();

// ── The phone bar, and the year counted up the first time it is seen ───────
stickyJoin({ title: 'The first three weeks are free', line: 'No card. Your work is yours to keep.', label: joined ? 'Continue' : 'Start free',
  after: $('.hero'), quiet: [$('#close-cta'), $('#mirror-box'), $('.year .acts'), $('#nt'), $('#nt-case')], onJoin: (e) => (joined ? (location.href = '/ground-plan/#home') : join(e)) });
const stopCount = countUp($('#o-year'), () => Math.max(0, now.value - want.value) * 52, (n) => `${n.toLocaleString('en-US')} h`);
now.addEventListener('input', stopCount); want.addEventListener('input', stopCount);
const movedOnce = () => count('road4', 'cost_moved');
now.addEventListener('change', movedOnce); want.addEventListener('change', movedOnce);

// ── Round 2: the ad's own line, a returning founder, the model stories, counting
matchHeadline($('.hero h1'), 'road4');
welcomeBack($('#back'), 'road4');
stories($('#story-list'));
nowThen($('#nt'), $('#nt-case'), { page: 'road4', onJoin: join });
whenLine(document.querySelector('[data-when]'), 'i');
trackScroll('road4');
document.addEventListener('click', (e) => { if (e.target.closest('[data-join], .rk-bar button')) count('road4', 'cta'); }, true);

// ── Motion: what arrives as you scroll, and the pause button ────────────────
// Everything is visible at rest; only what starts below the first screen
// waits to slide in.
try {
  const fold = innerHeight;
  const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.remove('wait'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach((el) => { if (!still() && el.getBoundingClientRect().top > fold) { el.classList.add('wait'); io.observe(el); } });
  new IntersectionObserver((es) => dayWalk(es.some((x) => x.isIntersecting))).observe($('#days'));
} catch { /* old browser: everything is already visible */ }
document.addEventListener('visibilitychange', () => { if (document.hidden) dayWalk(false); });

const btn = $('#still');
const label = () => { const s = document.documentElement.classList.contains('still'); btn.textContent = s ? 'Play motion' : 'Pause motion'; btn.setAttribute('aria-pressed', String(s)); };
btn.addEventListener('click', () => {
  const s = document.documentElement.classList.toggle('still');
  try { localStorage.setItem('ftb-still', s ? '1' : '0'); } catch { /* private mode */ }
  if (s) dayWalk(false);
  label();
});
label();
