// "/road2/": The Founder's Blueprint as a thermal scan. Every call to action
// opens the FULL account form (with a password), landing "scan".
//
// Heat stands for load: what the founder carries. Two calm heat maps
// (thermal.js) show it:
//   · the hero: the business, the founder white-hot in the middle of it;
//   · the scan: eight taps, two in each domain; every answer that puts load
//     on the founder warms its zone, and the reading names the hottest zone
//     and where week one would start (the real level-one steps and promise).
// Then the flow (a still diagram: now, and what the twelve weeks work
// toward), the twelve weeks from hot to cool with their real promises, and
// the ladder at its real prices. Nothing typed, nothing saved or sent.
import { Field, runner, heatColor } from '/road2/thermal.js';
import { DOMAINS, SEVEN, STAGES, LEVEL_NAMES, gateFor } from '/content.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const still = () => document.documentElement.classList.contains('still') || matchMedia('(prefers-reduced-motion: reduce)').matches;
const dname = (k) => DOMAINS.find((d) => d.k === k).n;
let stage = 'build';

const FILES = { build: ['/levels-build.js', 'BUILD'], grow: ['/levels-grow.js', 'GROW'], scale: ['/levels-scale.js', 'SCALE'] };
const loaded = {};
function loadStage(st) {
  if (!loaded[st]) loaded[st] = import(FILES[st][0]).then((m) => m[FILES[st][1]]).catch(() => { delete loaded[st]; return null; });
  return loaded[st];
}

// ── The account box ──────────────────────────────────────────────────────────
const gate = $('#gate');
let box = null;
const loadBox = () => box || (box = import('/account-box.js').catch(() => { box = null; }));
const joined = (() => { try { return !!localStorage.getItem('ftb-token'); } catch { return false; } })();
import('/forms.js').then((m) => m.rememberUtm()).catch(() => {});
function join(e) {
  if (e) e.preventDefault();
  const opener = e && e.currentTarget;
  gate.hidden = false;
  loadBox().then((m) => m && m.open({ gate, opener, stage: { id: stage }, variant: 'full', landing: 'scan' }));
}
function wireJoin(a) {
  if (joined) { a.removeAttribute('data-join'); a.href = '/ground-plan/#home'; a.textContent = a.closest('nav') ? 'My Blueprint' : 'Continue my Blueprint'; return; }
  a.addEventListener('click', join);
}
document.querySelectorAll('[data-join]').forEach(wireJoin);
if (location.hash === '#join' && !joined) join();

// ── The heat maps ───────────────────────────────────────────────────────────
const run = runner(still);
/** Small labels above a field's nodes. */
function tagger(host, field, words) {
  host.innerHTML = field.nodes.map((n) => `<span class="tag${words[n.id].hot ? ' hot' : ''}" data-n="${n.id}" style="left:${n.x * 100}%;top:${n.y * 100}%">${words[n.id].t}<em>${words[n.id].e || ''}</em></span>`).join('');
  return { set: (id, e) => { const t = host.querySelector(`[data-n="${id}"] em`); if (t) t.textContent = e; } };
}

// The hero: the founder, white-hot, a little work drifting in.
const hero = new Field($('#hero-field'), { gw: 110, decay: 0.955, gain: 0.85 });
hero.node('you', 0.5, 0.52, { heat: 2.6, r: 10 });
hero.node('people', 0.2, 0.3, { heat: 0.8, r: 7 });
hero.node('work', 0.8, 0.3, { heat: 0.7, r: 7 });
hero.node('market', 0.72, 0.82, { heat: 0.6, r: 7 });
hero.spawn = {
  max: 10, rate: 0.06,
  make: () => { const from = hero.nodes[1 + ((Math.random() * 3) | 0)]; return { x: from.x, y: from.y, vx: 0, vy: 0, to: 'you', speed: 0.003, curl: (Math.random() - 0.5) * 0.004, heat: 0.05 }; },
};
tagger($('#hero-tags'), hero, { you: { t: 'You', e: ' · white-hot', hot: true }, people: { t: 'People', e: ' · waiting' }, work: { t: 'Delivery', e: ' · in your head' }, market: { t: 'Market', e: ' · guessed' } });
run.watch(hero);

// ── 01 · The scan ───────────────────────────────────────────────────────────
// Each question: its domain, the words, which answer puts load on you, and
// what the reading says back either way.
export const SENSORS = [
  { k: 'self', q: 'Do most decisions in the business still wait for you?', heat: 'yes',
    hot: 'The business draws every decision from one supply: you.', cool: 'Good. Decisions already move without you.' },
  { k: 'self', q: 'Did you work more than fifty hours last week?', heat: 'yes',
    hot: 'Your hours are the ceiling. The business can’t grow past the edge of your week.', cool: 'Your week has edges. The question is what fills it.' },
  { k: 'people', q: 'Is someone waiting on you right now to finish their work?', heat: 'yes',
    hot: 'Work is queuing at your desk. Heat builds wherever nobody else may decide.', cool: 'Nothing is queuing on you. That’s rare.' },
  { k: 'people', q: 'Is there a conversation you’ve put off for more than a month?', heat: 'yes',
    hot: 'It costs you something every week it waits. You already know who it’s with.', cool: 'Then you’re ahead on the hardest part of leading people.' },
  { k: 'work', q: 'If you stopped for two weeks, would delivery stop too?', heat: 'yes',
    hot: 'The business is stored in your head, the most fragile place it could be.', cool: 'It runs without you. Check when someone last proved it.' },
  { k: 'work', q: 'Is the way you deliver written down, so someone else could follow it?', heat: 'no',
    hot: 'Nothing written down means everything comes back to you.', cool: 'Written down. Next: has someone else actually run it?' },
  { k: 'market', q: 'Could you name the last ten people who paid you, and why they chose you?', heat: 'no',
    hot: 'You’re selling to a customer you imagined. The real ones would tell you what works.', cool: 'You hold the most underused evidence in a small business.' },
  { k: 'market', q: 'Do you know what one hour of your time earns the business?', heat: 'no',
    hot: 'Then you’re pricing from fear, and saying yes to work that makes you poorer.', cool: 'Then you can see which customers pay for your time, and which spend it.' },
];
const ZONE = { self: 'You', people: 'People', work: 'Delivery', market: 'Market' };
const MEANS = {
  self: 'You are the bottleneck and the power supply. The business draws everything from you.',
  people: 'Work waits on you. Heat builds wherever nobody else is allowed to decide.',
  work: 'Delivery lives in your head. Step away and it stops.',
  market: 'You’re selling blind: no named customer, no number for your hour.',
};
const scan = new Field($('#scan-field'), { gw: 100, decay: 0.95, gain: 0.95 });
scan.node('self', 0.5, 0.6, { heat: 0.35, r: 10 });
scan.node('people', 0.2, 0.38, { heat: 0.25, r: 8 });
scan.node('work', 0.8, 0.38, { heat: 0.25, r: 8 });
scan.node('market', 0.5, 0.17, { heat: 0.25, r: 8 });
const scanTags = tagger($('#scan-tags'), scan, { self: { t: 'You', e: ' · 0/2' }, people: { t: 'People', e: ' · 0/2' }, work: { t: 'Delivery', e: ' · 0/2' }, market: { t: 'Market', e: ' · 0/2' } });
run.watch(scan);

const sensor = $('#sensor'), state = $('#scan-state');
let si = 0, answers = [];
const load = () => { const by = { self: 0, people: 0, work: 0, market: 0 }; answers.forEach((a, i) => { if (a === SENSORS[i].heat) by[SENSORS[i].k]++; }); return by; };
function bars() { return `<div class="bars" aria-hidden="true">${SENSORS.map((s, i) => `<i class="${i < answers.length ? (answers[i] === s.heat ? 'on' : 'cool') : ''}"></i>`).join('')}</div>`; }
function ask() {
  const s = SENSORS[si];
  state.textContent = `Question ${si + 1} of 8 · ${ZONE[s.k]}`;
  sensor.innerHTML = `<div class="meta"><span>Question <b>${si + 1}</b> of 8</span><span>${esc(dname(s.k))}</span></div>${bars()}
    <p class="q">${esc(s.q)}</p>
    <div class="yn"><button type="button" data-a="yes">Yes</button><button type="button" data-a="no">No</button></div>
    <p class="say" id="say"></p>`;
}
sensor.addEventListener('click', (e) => {
  const b = e.target.closest('[data-a]'), nx = e.target.closest('[data-next]');
  if (b && answers.length === si) {
    const s = SENSORS[si], a = b.dataset.a, hot = a === s.heat;
    answers.push(a);
    sensor.querySelectorAll('[data-a]').forEach((x) => { x.disabled = true; x.classList.toggle('picked', x === b); });
    const say = $('#say');
    say.className = `say${hot ? '' : ' cool'}`;
    say.textContent = hot ? s.hot : s.cool;
    say.insertAdjacentHTML('afterend', `<button type="button" class="next" data-next>${si < SENSORS.length - 1 ? 'Next question' : 'See the reading'}</button>`);
    if (hot) { scan.get(s.k).target += 1.1; scan.flare(s.k, 2.5); }
    scanTags.set(s.k, ` · ${load()[s.k]}/2`);
    sensor.querySelector('.bars').outerHTML = bars();
    run.kick(); if (still()) scan.settle(60);
    sensor.querySelector('[data-next]').focus({ preventScroll: true });
  } else if (nx) {
    si++;
    if (si < SENSORS.length) { ask(); sensor.querySelector('[data-a]').focus({ preventScroll: true }); } else reading();
  }
});
async function reading() {
  const by = load(), total = Object.values(by).reduce((a, b) => a + b, 0);
  const order = [...new Set([...STAGES[stage].emphasis.filter((k) => k in by), 'self', 'people', 'work', 'market'])];
  const top = total ? order.reduce((a, k) => (by[k] > by[a] ? k : a), order[0]) : 'self';
  state.textContent = total ? `Hottest: ${ZONE[top]}` : 'Running cool';
  const lv = await loadStage(stage), one = lv && lv[1] ? lv[1][top] : null;
  sensor.innerHTML = `<div class="result">
    <p class="idx">${total} of 8 answers put load on you</p>
    <p class="big">${total ? `Hottest zone: <em>${esc(dname(top))}</em>.` : 'Running cool on these eight.'}</p>
    <p class="say">${esc(total ? MEANS[top] : 'Then check it against your calendar, not your memory. Week one does exactly that.')}</p>
    <div class="zones">${['self', 'people', 'work', 'market'].map((k) => `<div class="z${k === top && total ? ' top' : ''}">${ZONE[k]} · ${by[k]}/2<i style="--w:${by[k] * 50}%"></i></div>`).join('')}</div>
    ${one ? `<div class="proto"><p class="idx">Where your week one would start · ${esc(STAGES[stage].n)}</p><h4>${esc(one.title)}</h4>
      <ol>${one.steps.slice(0, 2).map((x, i) => `<li><b>${esc(SEVEN[i].n)}.</b> ${esc(x)}</li>`).join('')}</ol><p>${esc(lv[1].promise)}</p></div>` : ''}
    <div class="acts"><a class="btn" href="#join" data-join>Start free</a><button type="button" class="again" data-again>Scan again</button></div>
  </div>`;
  sensor.querySelectorAll('[data-join]').forEach(wireJoin);
  sensor.querySelector('[data-again]').addEventListener('click', reset);
}
function reset() {
  si = 0; answers = [];
  for (const n of scan.nodes) n.target = n.id === 'self' ? 0.35 : 0.25;
  for (const k of Object.keys(ZONE)) scanTags.set(k, ' · 0/2');
  ask(); run.kick();
}
ask();

// ── 02 · The flow: a still diagram, now and week twelve ─────────────────────
const CAP = {
  now: 'Every request lands on you. You run white-hot while the rest of the business stays cold.',
  after: 'Decisions given away, work written down and handed on. The heat spreads through the business, and you run warm.',
};
$('.flow .seg').addEventListener('click', (e) => {
  const b = e.target.closest('[data-mode]');
  if (!b) return;
  document.querySelectorAll('[data-mode]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  $('.flow').dataset.mode = b.dataset.mode;
  $('#fcap').textContent = CAP[b.dataset.mode];
});
$('.flow').dataset.mode = 'now';

// ── 03 · The twelve weeks, from hot to cool ─────────────────────────────────
const BAND = { free: 'Free', session: 'Opens with the Boardroom', lab: 'In the LAB', hub: 'In the HUB' };
let wk = 1;
async function drawStrip() {
  const L = await loadStage(stage);
  if (!L) return;
  const names = LEVEL_NAMES[stage];
  $('#strip').innerHTML = names.map((n, i) => {
    const t = 0.94 - i * 0.065;
    return `<li><button type="button" class="wk" data-wk="${i + 1}" aria-pressed="${i + 1 === wk}" style="--bg:${heatColor(t)};--fg:${t > 0.62 ? '#1A0B05' : '#F2ECF6'}"><small>Week ${i + 1}</small><span>${esc(n)}</span></button></li>`;
  }).join('');
  $('#wk-band').textContent = `Week ${wk} · ${BAND[gateFor(wk)]}`;
  $('#wk-name').textContent = names[wk - 1];
  $('#wk-promise').textContent = L[wk] ? L[wk].promise : '';
}
$('#strip').addEventListener('click', (e) => { const b = e.target.closest('[data-wk]'); if (b) { wk = +b.dataset.wk; drawStrip(); } });

// ── The stage, chosen in the scan or above the twelve weeks ─────────────────
document.querySelectorAll('.stages').forEach((g) => g.addEventListener('click', (e) => {
  const b = e.target.closest('[data-stage]');
  if (!b || b.dataset.stage === stage) return;
  stage = b.dataset.stage;
  document.querySelectorAll('[data-stage]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.stage === stage)));
  drawStrip();
  if (si >= SENSORS.length) reading();
}));
drawStrip();

// ── 05 · Alexandru, through the thermal filter, or as he is ─────────────────
$('#portrait').addEventListener('click', (e) => { const b = e.currentTarget, on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); b.querySelector('.vlabel').textContent = on ? 'Tap for the thermal view' : 'Tap to see the photo'; });

// ── Motion ──────────────────────────────────────────────────────────────────
if (still()) [hero, scan].forEach((f) => f.settle());
const btn = $('#still');
const label = () => { const s = document.documentElement.classList.contains('still'); btn.textContent = s ? 'Play motion' : 'Pause motion'; btn.setAttribute('aria-pressed', String(s)); };
btn.addEventListener('click', () => {
  const s = document.documentElement.classList.toggle('still');
  try { localStorage.setItem('ftb-still', s ? '1' : '0'); } catch { /* private mode */ }
  if (s) [hero, scan].forEach((f) => f.settle(60)); else run.kick();
  label();
});
label();

try {
  const fold = innerHeight;
  const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.remove('wait'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.sh, .console, .flow, .strip, .readout, .levels, .op > *, .end .wrap').forEach((el) => { el.classList.add('rv'); if (!still() && el.getBoundingClientRect().top > fold) { el.classList.add('wait'); io.observe(el); } });
} catch { /* everything is already visible */ }
