// "/road2/": The Founder's Blueprint as a thermal scan. Every call to action
// opens the FULL account form (with a password), landing "scan".
//
// Heat stands for load: what the founder carries. The page shows it in four
// heat fields (thermal.js):
//   · the hero: the business as a heat map, the founder white-hot in it;
//   · the scan: eight taps, two in each domain; every answer that puts load
//     on the founder flares its zone, and the reading names the hottest zone
//     and where week one would start (the real level-one steps and promise);
//   · the flow: now, every request runs to the founder; week twelve, it runs
//     through the business (an illustration of the work, not a result);
//   · the close.
// Then the twelve weeks from hot to cool, each with its real promise, and the
// ladder at its real prices. Nothing typed, nothing saved or sent.
import { Field, runner, heatColor } from '/road2/thermal.js';
import { DOMAINS, SEVEN, STAGES, LEVEL_NAMES, gateFor } from '/content.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const still = () => document.documentElement.classList.contains('still') || matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, still() ? Math.min(ms, 500) : ms));
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
  if (joined) { a.removeAttribute('data-join'); a.href = '/ground-plan/#home'; a.firstChild.textContent = a.closest('nav') ? 'My Blueprint' : 'Continue my Blueprint '; return; }
  a.addEventListener('click', join);
}
document.querySelectorAll('[data-join]').forEach(wireJoin);
if (location.hash === '#join' && !joined) join();

// ── The fields ──────────────────────────────────────────────────────────────
const run = runner(still);
/** Labels that sit on a field's nodes. */
function tagger(host, field, words) {
  host.innerHTML = field.nodes.map((n) => `<span class="tag${words[n.id].hot ? ' hot' : ''}${n.x > 0.66 ? ' left' : ''}" data-n="${n.id}">${words[n.id].t}<em>${words[n.id].e || ''}</em></span>`).join('');
  const place = () => field.nodes.forEach((n) => { const t = host.querySelector(`[data-n="${n.id}"]`); if (t) { t.style.left = `${n.x * 100}%`; t.style.top = `${n.y * 100}%`; } });
  place();
  return { place, set: (id, e) => { const t = host.querySelector(`[data-n="${id}"] em`); if (t) t.textContent = e; } };
}

// The hero: the founder, white-hot, with the work running in.
const heroC = $('#hero-field');
const hero = new Field(heroC, { gw: 160, gh: 100, decay: 0.958, gain: 0.85 });
const HERO = {
  wide: { you: [0.7, 0.52], people: [0.52, 0.24], work: [0.92, 0.3], market: [0.86, 0.84] },
  tall: { you: [0.5, 0.8], people: [0.2, 0.68], work: [0.8, 0.74], market: [0.42, 0.94] },
};
hero.node('you', 0.7, 0.52, { heat: 3.4, r: 11 });
hero.node('people', 0.52, 0.24, { heat: 0.9, r: 8 });
hero.node('work', 0.92, 0.3, { heat: 0.8, r: 8 });
hero.node('market', 0.86, 0.84, { heat: 0.7, r: 8 });
hero.spawn = {
  max: 46, rate: 0.5,
  make: () => {
    const from = hero.nodes[1 + ((Math.random() * 3) | 0)];
    return { x: from.x + (Math.random() - 0.5) * 0.06, y: from.y + (Math.random() - 0.5) * 0.06, vx: 0, vy: 0, to: 'you', speed: 0.006 + Math.random() * 0.004, curl: (Math.random() - 0.5) * 0.006, heat: 0.06 };
  },
};
const heroTags = tagger($('#hero-tags'), hero, {
  you: { t: 'YOU', e: ' · CRITICAL', hot: true }, people: { t: 'PEOPLE', e: ' · WAITING' },
  work: { t: 'DELIVERY', e: ' · IN YOUR HEAD' }, market: { t: 'MARKET', e: ' · GUESSED' },
});
function layoutHero() {
  const r = heroC.getBoundingClientRect(), L = r.width / r.height > 1.05 ? HERO.wide : HERO.tall;
  for (const n of hero.nodes) [n.x, n.y] = L[n.id];
  hero.resize(); heroTags.place();
}
layoutHero();
// The probe: point at the field and read it.
const probe = $('#probe'), heroEl = $('.hero');
const WORD = (v) => (v > 0.86 ? 'CRITICAL' : v > 0.66 ? 'HOT' : v > 0.4 ? 'WARM' : v > 0.18 ? 'COOL' : 'COLD');
heroEl.addEventListener('pointermove', (e) => {
  if (e.target.closest('a,button')) { probe.hidden = true; hero.probe = null; return; }
  const r = heroC.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  hero.probe = { x, y };
  probe.hidden = false; probe.style.left = `${x * 100}%`; probe.style.top = `${y * 100}%`;
  probe.querySelector('em').textContent = WORD(hero.read(x, y));
});
heroEl.addEventListener('pointerleave', () => { probe.hidden = true; hero.probe = null; });
run.watch(hero);
const t0 = Date.now();
setInterval(() => { const s = ((Date.now() - t0) / 1000) | 0; $('#tc').textContent = `T+${[s / 3600, (s / 60) % 60, s % 60].map((v) => String(v | 0).padStart(2, '0')).join(':')}`; }, 1000);

// ── 01 · The scan ───────────────────────────────────────────────────────────
// Each sensor: its domain, the question, which answer puts load on you, and
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
const ZONE = { self: 'YOU', people: 'PEOPLE', work: 'DELIVERY', market: 'MARKET' };
const MEANS = {
  self: 'You are the bottleneck and the power supply. The business draws everything from you.',
  people: 'Work waits on you. Heat builds wherever nobody else is allowed to decide.',
  work: 'Delivery lives in your head. Step away and it stops.',
  market: 'You’re selling blind: no named customer, no number for your hour.',
};
const scanC = $('#scan-field');
const scan = new Field(scanC, { gw: 120, gh: 100, decay: 0.95, gain: 0.95 });
scan.node('self', 0.5, 0.6, { heat: 0.35, r: 10 });
scan.node('people', 0.2, 0.38, { heat: 0.25, r: 8 });
scan.node('work', 0.8, 0.38, { heat: 0.25, r: 8 });
scan.node('market', 0.5, 0.16, { heat: 0.25, r: 8 });
scan.spawn = {
  max: 30, rate: 0.25,
  make: () => {
    const outer = scan.nodes.slice(1).sort((a, b) => b.target - a.target), from = outer[(Math.random() * Math.random() * 3) | 0];
    return { x: from.x, y: from.y, vx: 0, vy: 0, to: 'self', speed: 0.005 + Math.random() * 0.004, curl: (Math.random() - 0.5) * 0.008, heat: 0.03 + from.target * 0.03 };
  },
};
const scanTags = tagger($('#scan-tags'), scan, { self: { t: 'YOU', e: ' · 0/2' }, people: { t: 'PEOPLE', e: ' · 0/2' }, work: { t: 'DELIVERY', e: ' · 0/2' }, market: { t: 'MARKET', e: ' · 0/2' } });
run.watch(scan);

const sensor = $('#sensor'), log = $('#log'), state = $('#scan-state');
let si = 0, answers = [], busy = false;
const load = () => { const by = { self: 0, people: 0, work: 0, market: 0 }; answers.forEach((a, i) => { if (a === SENSORS[i].heat) by[SENSORS[i].k]++; }); return by; };
function bars() { return `<div class="bars" aria-hidden="true">${SENSORS.map((s, i) => `<i class="${i < answers.length ? (answers[i] === s.heat ? 'on' : 'cool') : ''}"></i>`).join('')}</div>`; }
function ask() {
  const s = SENSORS[si];
  state.textContent = `SCANNING · ${ZONE[s.k]}`;
  sensor.innerHTML = `<div class="meta"><span>SENSOR <b>S-0${si + 1}</b> / 08</span><span>${ZONE[s.k]} · ${esc(dname(s.k))}</span></div>${bars()}
    <p class="q">${esc(s.q)}</p>
    <div class="yn"><button type="button" data-a="yes">YES</button><button type="button" data-a="no">NO</button></div>
    <p class="say" id="say" aria-live="polite"></p>`;
}
sensor.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-a]');
  if (!b || busy) return;
  busy = true;
  const s = SENSORS[si], a = b.dataset.a, hot = a === s.heat;
  answers.push(a);
  sensor.querySelectorAll('[data-a]').forEach((x) => { x.disabled = true; x.classList.toggle('picked', x === b); });
  const say = $('#say');
  say.className = `say${hot ? '' : ' cool'}`;
  say.textContent = hot ? s.hot : s.cool;
  const n = scan.get(s.k);
  if (hot) { n.target += 1.1; scan.flare(s.k, 5); }
  const by = load();
  scanTags.set(s.k, ` · ${by[s.k]}/2`);
  log.insertAdjacentHTML('beforeend', `<li><b>S-0${si + 1}</b><span>${ZONE[s.k]} ${'.'.repeat(24)}</span><em class="${hot ? 'h' : 'k'}">${hot ? 'HEAT +' : 'COOL'}</em></li>`);
  log.scrollTop = log.scrollHeight;
  run.kick(); if (still()) scan.settle(60);
  await wait(1700);
  si++; busy = false;
  if (si < SENSORS.length) { ask(); sensor.querySelector('[data-a]').focus({ preventScroll: true }); } else reading();
});
async function reading() {
  const by = load(), total = Object.values(by).reduce((a, b) => a + b, 0);
  const order = [...new Set([...STAGES[stage].emphasis.filter((k) => k in by), 'self', 'people', 'work', 'market'])];
  const top = total ? order.reduce((a, k) => (by[k] > by[a] ? k : a), order[0]) : 'self';
  state.textContent = total ? `SCAN COMPLETE · HOTTEST: ${ZONE[top]}` : 'SCAN COMPLETE · RUNNING COOL';
  state.classList.add('done');
  const lv = await loadStage(stage), one = lv && lv[1] ? lv[1][top] : null;
  sensor.innerHTML = `<div class="result">
    <p class="idx">SCAN COMPLETE · ${total} OF 8 READINGS PUT LOAD ON YOU</p>
    <p class="big">${total ? `Hottest zone: <em>${esc(dname(top))}</em>.` : 'Running cool on these eight.'}</p>
    <p class="say">${esc(total ? MEANS[top] : 'Then check it against your calendar, not your memory. Week one does exactly that.')}</p>
    <div class="zones">${['self', 'people', 'work', 'market'].map((k) => `<div class="z${k === top && total ? ' top' : ''}">${ZONE[k]} · ${by[k]}/2<i style="--w:${by[k] * 50}%"></i></div>`).join('')}</div>
    ${one ? `<div class="proto"><p class="idx">COOLING PROTOCOL · WEEK 01 · ${esc(STAGES[stage].n.toUpperCase())}</p><h4>${esc(one.title)}</h4>
      <ol>${one.steps.slice(0, 2).map((x, i) => `<li><b>${esc(SEVEN[i].n)}.</b> ${esc(x)}</li>`).join('')}</ol><p>${esc(lv[1].promise)}</p></div>` : ''}
    <div class="acts"><a class="btn" href="#join" data-join>Start the protocol, free <span aria-hidden="true">→</span></a><button type="button" class="again" data-again>Scan again</button></div>
  </div>`;
  sensor.querySelectorAll('[data-join]').forEach(wireJoin);
  sensor.querySelector('[data-again]').addEventListener('click', reset);
}
function reset() {
  si = 0; answers = []; log.innerHTML = '';
  for (const n of scan.nodes) n.target = n.id === 'self' ? 0.35 : 0.25;
  for (const k of Object.keys(ZONE)) scanTags.set(k, ' · 0/2');
  state.classList.remove('done');
  ask(); run.kick();
}
ask();

// ── 02 · The flow ───────────────────────────────────────────────────────────
const flowC = $('#flow-field');
const flow = new Field(flowC, { gw: 160, gh: 100, decay: 0.952, gain: 0.9 });
flow.node('you', 0.5, 0.52, { heat: 3, r: 10 });
flow.node('team', 0.22, 0.26, { heat: 0.15, r: 8 });
flow.node('systems', 0.78, 0.26, { heat: 0.15, r: 8 });
flow.node('customers', 0.5, 0.88, { heat: 0.3, r: 8 });
let mode = 'now';
const TARGET = { now: { you: 3.2, team: 0.15, systems: 0.15, customers: 0.3 }, after: { you: 0.9, team: 1.3, systems: 1.3, customers: 1 } };
flow.spawn = {
  max: 60, rate: 0.6,
  make: () => {
    const left = Math.random() < 0.5, to = mode === 'now' ? 'you' : ['team', 'systems', 'team', 'systems', 'customers', 'you'][(Math.random() * 6) | 0];
    return { x: left ? 0.01 : 0.99, y: 0.15 + Math.random() * 0.7, vx: 0, vy: 0, to, speed: 0.006 + Math.random() * 0.004, curl: (Math.random() - 0.5) * 0.01, heat: 0.05 };
  },
};
const flowTags = tagger($('#flow-tags'), flow, { you: { t: 'YOU', e: ' · WHITE-HOT', hot: true }, team: { t: 'TEAM', e: ' · IDLE' }, systems: { t: 'SYSTEMS', e: ' · NONE' }, customers: { t: 'CUSTOMERS', e: ' · WAITING' } });
const CAP = {
  now: 'Every request lands on you. The core runs white-hot while the rest of the business stays cold.',
  after: 'Decisions given away, work written down and handed on. The heat spreads through the business, and you run warm.',
};
const WORDS = { now: { you: ' · WHITE-HOT', team: ' · IDLE', systems: ' · NONE', customers: ' · WAITING' }, after: { you: ' · WARM', team: ' · DECIDING', systems: ' · RUNNING', customers: ' · SERVED' } };
let flowTouched = false, flowTimer = null;
function setMode(m) {
  mode = m;
  for (const n of flow.nodes) n.target = TARGET[m][n.id];
  document.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  $('.flow').dataset.mode = m;
  $('#fcap').textContent = CAP[m];
  for (const [id, w] of Object.entries(WORDS[m])) flowTags.set(id, w);
  const you = $('#flow-tags [data-n="you"]'); if (you) you.classList.toggle('hot', m === 'now');
  run.kick(); if (still()) flow.settle(120);
}
$('.flow .seg').addEventListener('click', (e) => { const b = e.target.closest('[data-mode]'); if (b) { flowTouched = true; clearInterval(flowTimer); setMode(b.dataset.mode); } });
setMode('now');
run.watch(flow);
try {
  new IntersectionObserver((es) => {
    clearInterval(flowTimer);
    if (es[0].isIntersecting && !flowTouched && !still()) flowTimer = setInterval(() => setMode(mode === 'now' ? 'after' : 'now'), 5200);
  }, { threshold: 0.4 }).observe(flowC);
} catch { /* the switch still works */ }

// ── 03 · The protocol: twelve weeks from hot to cool ────────────────────────
const BAND = { free: 'FREE', session: 'OPENS WITH THE BOARDROOM', lab: 'IN THE LAB', hub: 'IN THE HUB' };
let wk = 1;
async function drawStrip(swap) {
  const L = await loadStage(stage);
  if (!L) return;
  const names = LEVEL_NAMES[stage];
  $('#strip').innerHTML = names.map((n, i) => {
    const t = 0.97 - i * 0.07;
    return `<li><button type="button" class="wk" data-wk="${i + 1}" aria-pressed="${i + 1 === wk}" style="--bg:${heatColor(t)};--fg:${t > 0.62 ? '#05030A' : '#F4EEF8'};--glow:${heatColor(t)}"><small>W${String(i + 1).padStart(2, '0')}</small><span>${esc(n)}</span></button></li>`;
  }).join('');
  $('#wk-band').textContent = `WEEK ${String(wk).padStart(2, '0')} · ${BAND[gateFor(wk)]}`;
  $('#wk-name').textContent = names[wk - 1];
  $('#wk-promise').textContent = L[wk] ? L[wk].promise : '';
  if (swap && !still()) { const r = $('.readout'); r.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: 'ease-out' }); }
}
$('#strip').addEventListener('click', (e) => { const b = e.target.closest('[data-wk]'); if (b) { wk = +b.dataset.wk; drawStrip(true); } });

// ── The stage, chosen in the scan or above the protocol ─────────────────────
document.querySelectorAll('.stages').forEach((g) => g.addEventListener('click', (e) => {
  const b = e.target.closest('[data-stage]');
  if (!b || b.dataset.stage === stage) return;
  stage = b.dataset.stage;
  document.querySelectorAll('[data-stage]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.stage === stage)));
  drawStrip();
  if (si >= SENSORS.length) reading();
}));
drawStrip();

// ── 05 · The operator, through the scanner ──────────────────────────────────
$('#portrait').addEventListener('click', (e) => { const b = e.currentTarget, on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); b.querySelector('.vlabel').textContent = on ? 'OPERATOR · PHOTO' : 'OPERATOR · TAP TO SEE'; });

// ── 06 · The close: embers drifting up ──────────────────────────────────────
const end = new Field($('#end-field'), { gw: 160, gh: 70, decay: 0.95, gain: 0.8 });
[0.2, 0.5, 0.8].forEach((x, i) => end.node(`e${i}`, x, 0.95, { heat: 1.2, r: 10 }));
end.spawn = { max: 40, rate: 0.5, make: () => ({ x: Math.random(), y: 1, vx: 0, vy: 0, to: 'sky', speed: 0, curl: 0, heat: 0.04 }) };
end.node('sky', 0.5, -0.4, { heat: 0, r: 1 });
end.onFrame = () => { end.nodes.slice(0, 3).forEach((n, i) => { n.x = 0.5 + Math.sin(end.tick * 0.004 + i * 2.1) * 0.35; }); for (const p of end.parts) { p.vy = -0.004; p.vx = Math.sin(end.tick * 0.02 + p.x * 20) * 0.0015; } end.parts = end.parts.filter((p) => p.y > -0.05); };
run.watch(end);

// ── Size, motion and arrivals ───────────────────────────────────────────────
let rz = 0;
addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { layoutHero(); [scan, flow, end].forEach((f) => f.resize()); run.kick(); if (still()) [hero, scan, flow, end].forEach((f) => f.settle(1)); }, 120); });
if (still()) [hero, scan, flow, end].forEach((f) => f.settle());

const btn = $('#still');
const label = () => { const s = document.documentElement.classList.contains('still'); btn.textContent = s ? 'MOTION: OFF' : 'MOTION: ON'; btn.setAttribute('aria-pressed', String(s)); };
btn.addEventListener('click', () => {
  const s = document.documentElement.classList.toggle('still');
  try { localStorage.setItem('ftb-still', s ? '1' : '0'); } catch { /* private mode */ }
  if (s) { clearInterval(flowTimer); [hero, scan, flow, end].forEach((f) => f.settle(60)); } else run.kick();
  label();
});
label();

try {
  const fold = innerHeight;
  const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.remove('wait'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.sh, .console, .flow, .strip, .readout, .lvl, .op > *, .end .wrap').forEach((el) => { el.classList.add('rv'); if (!still() && el.getBoundingClientRect().top > fold) { el.classList.add('wait'); io.observe(el); } });
} catch { /* everything is already visible */ }
