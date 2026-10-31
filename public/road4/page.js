// "/road4/": Road 4, the sales page for The Founder's Blueprint, led by what a
// founder feels. Every call to action on it opens the FULL account form (with
// a password), landing "road4", so a founder who arrives here signs up here.
//
// What it does, top to bottom:
//   · the stage (Building, Growing, Scaling): one choice, offered in two
//     places, used by everything below and carried into the sign-up;
//   · "Which of these did you feel this week?": eight symptoms in a founder's
//     own words, each opening what usually sits underneath, the call only the
//     founder can make, and where week one starts (the real first two steps,
//     Name it and Evidence, for that part of the business, from the level
//     files);
//   · two kinds of stuck: the Hoper and the Grinder on a triangle of reason,
//     strategy and effort;
//   · the four domains and the seven steps, as a path that walks itself;
//   · the twelve weeks of the founder's stage, each with its real promise;
//   · the sample: the real week-one steps. Notes save to this device first,
//     in 'ftb-sample', keyed like the programme's own answers; app.js moves
//     them into the account the first time the founder comes home signed in;
//   · "Count it yourself": two sliders, nothing saved or sent;
//   · today and week twelve, side by side.
import { rememberUtm } from '/forms.js';
import { DOMAINS, SEVEN, STAGES, LEVEL_NAMES, gateFor } from '/content.js';

rememberUtm();
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const still = () => document.documentElement.classList.contains('still') || matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLOR = { self: 'var(--self)', people: 'var(--people)', work: 'var(--work)', market: 'var(--market)' };
const dname = (k) => DOMAINS.find((d) => d.k === k).n;

// ── The account box ──────────────────────────────────────────────────────────
const gate = $('#gate');
let box = null, stage = 'build';
const loadBox = () => box || (box = import('/account-box.js').catch(() => { box = null; }));
const joined = (() => { try { return !!localStorage.getItem('ftb-token'); } catch { return false; } })();
function join(e) {
  if (e) e.preventDefault();
  const opener = e && e.currentTarget;
  gate.hidden = false;
  loadBox().then((m) => m && m.open({ gate, opener, stage: { id: stage }, variant: 'full', landing: 'road4' }));
}
// A founder who has already joined is not starting: the buttons say so.
document.querySelectorAll('[data-join]').forEach((a) => {
  if (joined) { a.removeAttribute('data-join'); a.href = '/ground-plan/#home'; a.firstChild.textContent = a.closest('.tnav') ? 'My Blueprint' : 'Continue my Blueprint '; return; }
  a.addEventListener('click', join);
});
if (location.hash === '#join' && !joined) join();

// ── The twelve levels, one stage at a time ──────────────────────────────────
const FILES = { build: ['/levels-build.js', 'BUILD'], grow: ['/levels-grow.js', 'GROW'], scale: ['/levels-scale.js', 'SCALE'] };
const loaded = {};
function loadStage(st) {
  if (!loaded[st]) loaded[st] = import(FILES[st][0]).then((m) => m[FILES[st][1]]).catch(() => { delete loaded[st]; return null; });
  return loaded[st];
}

// ── What you feel, and what is usually underneath ────────────────────────────
// Each: the founder's words, the pattern under them, and the question only
// they can answer. "Where week one starts" is the first two of the seven
// steps (Name it, then Evidence) of the same domain, at the founder's stage.
export const FEELS = [
  { k: 'self', feel: 'I work every hour and I’m still behind.',
    under: 'Your week is spent by whoever asks first. Not because you are disorganised — because nothing in it is protected, so everything else gets there before the work that grows the business.',
    call: 'Which block of time will you defend this week, even when someone you like asks for it?' },
  { k: 'self', feel: 'I’m tired in a way a weekend doesn’t fix.',
    under: 'Undecided things are heavy. Every choice you have not made yet is one you carry into every day, and they add up quietly.',
    call: 'Which decision have you been carrying the longest — and what would it take to make it this week?' },
  { k: 'people', feel: 'My team waits for me before they move.',
    under: 'Nobody has been told plainly what they may decide without you. So they wait, kindly and sensibly, and you become the queue.',
    call: 'What are they allowed to decide without asking you? Say the limit out loud.' },
  { k: 'people', feel: 'There’s a conversation I keep rehearsing and never have.',
    under: 'An expectation that was never said plainly. The longer it waits, the more it costs you both — in trust, and in work done twice.',
    call: 'Who needs to hear one clear sentence from you, and on which day will they hear it?' },
  { k: 'work', feel: 'Things break the week I step away.',
    under: 'The business runs on steps that only exist in your head. It is not that nobody else cares. Nobody else was ever shown.',
    call: 'Which one step is worth writing down first, so someone else can do it without you?' },
  { k: 'work', feel: 'We’re busy, but I couldn’t tell you what’s working.',
    under: 'Activity has taken the place of a standard. Nobody, you included, has written down what “done well” looks like here.',
    call: 'What does finished look like, in words somebody could check without you?' },
  { k: 'market', feel: 'Sales come in waves and I never know why.',
    under: 'You may be selling to a customer you imagine, not to the people who actually paid you. The waves follow whoever happens to find you.',
    call: 'Which one kind of customer will you aim at for the next twelve weeks — and who will you stop chasing?' },
  { k: 'market', feel: 'I’m busy with clients and it still doesn’t add up.',
    under: 'Some customers buy your time at a price that quietly removes your choices. An hour given to the wrong one is an hour taken from the right one.',
    call: 'Which customer is costing you more than they pay — and what will you say to them?' },
];

const feels = $('#feels'), dig = $('#dig');
let picked = -1;
feels.innerHTML = FEELS.map((f, i) => `<button type="button" class="feel rv${i % 4 ? ' d' + (i % 4) : ''}" data-feel="${i}" aria-pressed="false" aria-controls="dig" style="--c:${COLOR[f.k]}">
  ${esc(f.feel)}<small><i aria-hidden="true"></i>${esc(dname(f.k))}</small></button>`).join('');

const WAVE = '<svg class="line" viewBox="0 0 1000 34" preserveAspectRatio="none" aria-hidden="true"><path d="M0 17 q25 -12 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0 t50 0" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';

async function showDig(scroll) {
  if (picked < 0) return;
  const f = FEELS[picked], lv = await loadStage(stage);
  const first = lv ? lv[1][f.k].steps.slice(0, 2) : [];
  dig.innerHTML = `<div class="above"><p class="tagline">What you feel</p><q>${esc(f.feel)}</q></div>
    ${WAVE}
    <div class="below seq">
      <div class="under"><p class="tagline">What is usually underneath</p><p>${esc(f.under)}</p></div>
      <div class="call"><p class="tagline">The call only you can make</p><p>${esc(f.call)}</p></div>
      <div class="start">
        <div><p class="tagline">Where week one starts · ${esc(dname(f.k))} · ${esc(STAGES[stage].n)}</p>
          <ol>${first.map((s, i) => `<li><span>${i + 1}</span><p class="step">${esc(s)}<small class="ev">${esc(SEVEN[i].n)}. ${esc(SEVEN[i].why)}</small></p></li>`).join('')}</ol></div>
        <div class="acts"><a class="cta" href="#join" data-join-dig>Start here, free <span class="ar" aria-hidden="true">→</span></a>
          <a class="ghost" href="#try" data-try="${f.k}" style="color:#EDE6D6">Try it below</a></div>
      </div>
    </div>`;
  dig.hidden = false;
  dig.classList.remove('open');
  const go = dig.querySelector('[data-join-dig]');
  if (joined) { go.href = '/ground-plan/#home'; go.firstChild.textContent = 'Continue my Blueprint '; } else go.addEventListener('click', join);
  dig.querySelector('[data-try]').addEventListener('click', () => { dom = f.k; idx = 1; drawSample(); });
  requestAnimationFrame(() => requestAnimationFrame(() => dig.classList.add('open')));
  if (scroll) dig.scrollIntoView({ behavior: still() ? 'auto' : 'smooth', block: 'nearest' });
}
feels.addEventListener('click', (e) => {
  const b = e.target.closest('[data-feel]');
  if (!b) return;
  picked = +b.dataset.feel;
  feels.querySelectorAll('[data-feel]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  showDig(true);
});

// ── The stage: one choice, used everywhere below ─────────────────────────────
const HINT = { build: 'Shaping the offer and finding the first clients.', grow: 'Clients come back, and most decisions still come through you.', scale: 'There is a team, and your job has changed.' };
document.querySelectorAll('[data-stages]').forEach((g) => g.addEventListener('click', (e) => {
  const b = e.target.closest('[data-stage]');
  if (!b || b.dataset.stage === stage) return;
  stage = b.dataset.stage;
  document.querySelectorAll('[data-stage]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.stage === stage)));
  document.querySelectorAll('[data-stage-hint]').forEach((x) => { x.textContent = HINT[stage]; });
  document.querySelectorAll('[data-stage-eyebrow]').forEach((x) => { x.textContent = `Your ${STAGES[stage].n} road`; });
  showDig(false); drawWeeks(); drawSample();
}));

// ── The seven steps, walking ─────────────────────────────────────────────────
const path = $('#path');
path.innerHTML = SEVEN.map((s, i) => `<li class="rv${i % 4 ? ' d' + (i % 4) : ''}"><span class="n">${i + 1}</span><div><h3>${esc(s.n)}</h3><p>${esc(s.why)}</p></div></li>`).join('');
$('#fours').innerHTML = DOMAINS.map((d, i) => `<div class="four rv${i ? ' d' + i : ''}" style="--c:${COLOR[d.k]}"><b>${esc(d.n)}</b><span>${esc(d.line)}</span></div>`).join('');
let walk = null, at = 0;
function walking(on) {
  clearInterval(walk); walk = null;
  if (!on || still()) return;
  walk = setInterval(() => { const li = path.children; li[at].classList.remove('on'); at = (at + 1) % li.length; li[at].classList.add('on'); }, 1600);
}
path.children[0].classList.add('on');

// ── Two kinds of stuck ───────────────────────────────────────────────────────
// The corners a founder has are filled; the sides between two corners they
// have are solid, every other side is dashed.
const TYPES = {
  hoper: { has: ['r'], core: 'Hope, without a plan', name: 'The Hoper', line: 'Has the reason. Waits for the rest.',
    signs: ['“Once the right client finds me, it will take off.”', '“If I just post more, it should work.”', 'A plan you admire more than you run.'],
    under: 'A real belief in the idea — and an honest underestimate of the strategic work: who exactly it is for, what it is worth, and what has to happen every week for it to grow. Hope is not a plan, and a plan is not the work.',
    gives: 'Strategy you can check, and effort pointed somewhere: one customer named, one price written down, one thing done by Sunday.' },
  grinder: { has: ['e'], core: 'Motion, without meaning', name: 'The Grinder', line: 'Has the effort. Has lost the reason.',
    signs: ['Always busy, rarely sure it is the right busy.', 'Can’t say what you would stop.', '“I’ll think about direction when things calm down.” They don’t.'],
    under: 'Enormous effort, pointed by whatever is loudest. Without a reason you can say plainly there is nothing to say no with, so everything gets a yes and the week fills itself.',
    gives: 'A reason in one sentence, and a strategy that tells you what to stop: the week you chose, the customers you aim at, the work that is no longer yours.' },
  leader: { has: ['r', 's', 'e'], core: 'A business that grows', name: 'The founder who leads', line: 'Reason, strategy and effort, in the same week.',
    signs: ['Can say why in one sentence.', 'Knows which customers, which work and which number matter.', 'Does one real thing each week, and checks it on Sunday.'],
    under: 'Not a personality. A practice. Founders who lead are not more gifted; they look at the same evidence every week and decide on it.',
    gives: 'This is what the twelve weeks build, one Sunday at a time.' },
};
const tri = $('.tri');
function drawType(k, swap) {
  const t = TYPES[k], has = (c) => t.has.includes(c);
  for (const c of ['r', 's', 'e']) { const v = tri.querySelector(`.v-${c}`); v.classList.toggle('has', has(c)); v.classList.toggle('miss', !has(c)); }
  for (const [cls, x, y] of [['rs', 'r', 's'], ['re', 'r', 'e'], ['se', 's', 'e']]) tri.querySelector(`.s-${cls}`).classList.toggle('miss', !(has(x) && has(y)));
  $('#tri-core').textContent = t.core;
  const card = $('#tcard');
  card.innerHTML = `<h3>${esc(t.name)}</h3><p>${esc(t.line)}</p>
    <p class="lbl">You might hear yourself say</p><ul>${t.signs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <p class="lbl">What is really going on</p><p>${esc(t.under)}</p>
    <p class="lbl">What the Blueprint gives you</p><p class="gives">${esc(t.gives)}</p>`;
  if (swap && !still()) { card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap'); }
}
document.querySelector('.typebtns').addEventListener('click', (e) => {
  const b = e.target.closest('[data-type]');
  if (!b) return;
  document.querySelectorAll('[data-type]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  drawType(b.dataset.type, true);
});
drawType('hoper');

// ── The twelve weeks of the founder's stage ─────────────────────────────────
const BAND = { free: ['f', 'Free'], session: ['s', 'Opens with the Boardroom'], lab: ['l', 'In the LAB'], hub: ['h', 'In the HUB'] };
let week = 1;
async function drawWeeks(swap) {
  const L = await loadStage(stage);
  if (!L) return;
  const names = LEVEL_NAMES[stage];
  $('#weeklist').innerHTML = names.map((n, i) => `<li><button type="button" class="wk ${BAND[gateFor(i + 1)][0]}" data-wk="${i + 1}" aria-pressed="${i + 1 === week}">
    <small>Week ${String(i + 1).padStart(2, '0')}</small><span>${esc(n)}</span></button></li>`).join('');
  $('#wk-band').textContent = `Week ${week} · ${BAND[gateFor(week)][1]}`;
  $('#wk-name').textContent = names[week - 1];
  $('#wk-promise').textContent = L[week] ? L[week].promise : '';
  const card = $('.road12 .sunday');
  if (swap && !still()) { card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap'); }
}
$('#weeklist').addEventListener('click', (e) => { const b = e.target.closest('[data-wk]'); if (b) { week = +b.dataset.wk; drawWeeks(true); } });

// ── The sample: the real week-one steps ──────────────────────────────────────
const NOTES = 'ftb-sample';
const notes = (() => { try { const o = JSON.parse(localStorage.getItem(NOTES) || '{}'); return o && typeof o.answers === 'object' && o.answers ? o : { answers: {} }; } catch { return { answers: {} }; } })();
const aKey = (st, dk, i) => `${st}.1.${dk}.${i}`;
let dom = 'self', idx = 0, keep = null;
$('#dtabs').innerHTML = '<p class="eyebrow">All four. Every week.</p>' + DOMAINS.map((d, i) => `<button type="button" class="dtab" role="tab" data-dom="${d.k}" style="--c:${COLOR[d.k]}"><i>0${i + 1}</i>${esc(d.n)}</button>`).join('');
$('#dtabs').addEventListener('click', (e) => { const b = e.target.closest('[data-dom]'); if (b) { dom = b.dataset.dom; idx = 0; drawSample(true); } });
$('#chips').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) { idx = +b.dataset.i; drawSample(true); } });
$('#s-prev').addEventListener('click', () => { if (idx > 0) { idx--; drawSample(true); } });
$('#s-next').addEventListener('click', () => {
  if (idx < 6) { idx++; drawSample(true); return; }
  const i = DOMAINS.findIndex((d) => d.k === dom);
  if (i < 3) { dom = DOMAINS[i + 1].k; idx = 0; drawSample(true); } else join();
});
$('#s-a').addEventListener('input', (e) => {
  notes.answers[aKey(stage, dom, idx)] = e.target.value;
  clearTimeout(keep);
  keep = setTimeout(() => { try { localStorage.setItem(NOTES, JSON.stringify(notes)); } catch { /* private mode: the notes live as long as the page */ } }, 300);
  const c = $(`#chips [data-i="${idx}"]`);
  if (c) c.classList.toggle('done', !!e.target.value.trim());
});

async function drawSample(swap) {
  const lv = await loadStage(stage);
  if (!lv) return;
  const d = lv[1][dom];
  document.querySelectorAll('#dtabs [data-dom]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.dom === dom)));
  $('#s-meta').textContent = `${STAGES[stage].n} · Week 01 · ${dname(dom)}`;
  $('#s-title').textContent = d.title;
  $('#s-sub').textContent = d.sub;
  $('#chips').innerHTML = SEVEN.map((s, i) => `<button type="button" class="chip${(notes.answers[aKey(stage, dom, i)] || '').trim() ? ' done' : ''}" role="tab" data-i="${i}" aria-selected="${i === idx}">${esc(s.n)}</button>`).join('');
  const q = $('#s-q');
  q.textContent = d.steps[idx];
  $('#s-why').textContent = `${SEVEN[idx].n}: ${SEVEN[idx].why}`;
  if (swap && !still()) { q.classList.remove('swap'); void q.offsetWidth; q.classList.add('swap'); }
  $('#s-a').value = notes.answers[aKey(stage, dom, idx)] || '';
  $('#s-a').setAttribute('aria-describedby', 's-q');
  $('#s-prev').disabled = idx === 0;
  const last = DOMAINS.findIndex((x) => x.k === dom) === 3;
  $('#s-next').textContent = idx < 6 ? `Next: ${SEVEN[idx + 1].n} →` : last ? (joined ? 'Continue in my Blueprint →' : 'Keep these: start free →') : `Next: ${DOMAINS[DOMAINS.findIndex((x) => x.k === dom) + 1].n} →`;
  const sel = $('#chips [aria-selected="true"]');
  if (sel && swap) sel.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
if (joined) $('#s-saved').textContent = 'Your notes save on this device as you type, and move into your week one the next time you open your Blueprint.';

drawWeeks();
drawSample();

// ── Count it yourself: the hours beyond the week the founder wants ──────────
const now = $('#s-now'), want = $('#s-want');
function hours() {
  const n = +now.value, w = +want.value, extra = Math.max(0, n - w) * 52;
  $('#o-now').textContent = `${n} h`;
  $('#o-want').textContent = `${w} h`;
  $('#o-year').textContent = `${extra.toLocaleString('en-US')} h`;
  $('#o-eq').textContent = extra ? `That is about ${Math.round(extra / w)} weeks of the week you want.` : 'You already work the week you want.';
  $('#r-ask').textContent = extra ? 'Who got those hours last year — and who went without them?' : 'Then the question is what each of those hours is buying you.';
}
now.addEventListener('input', hours); want.addEventListener('input', hours); hours();

// ── Today and week twelve ───────────────────────────────────────────────────
const rows = $('.ba-rows');
let touched = false;
function ba(k) {
  rows.dataset.baState = k;
  document.querySelectorAll('[data-ba]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.ba === k)));
}
$('.ba-switch').addEventListener('click', (e) => { const b = e.target.closest('[data-ba]'); if (b) { touched = true; ba(b.dataset.ba); } });
// Once, when it comes into view, it turns to week twelve by itself.
try {
  const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); if (!still()) setTimeout(() => { if (!touched) ba('then'); }, 1800); } }, { threshold: .6 });
  io.observe(rows);
} catch { /* old browser: the switch still works */ }

// ── Motion: reveal on scroll, the walking path, and the pause button ─────────
const rvs = document.querySelectorAll('.rv, .draw, .venn');
try {
  const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
  rvs.forEach((el) => io.observe(el));
  new IntersectionObserver((es) => walking(es.some((x) => x.isIntersecting))).observe(path);
} catch { rvs.forEach((el) => el.classList.add('in')); }
document.addEventListener('visibilitychange', () => { if (document.hidden) walking(false); });

const btn = $('#still');
const label = () => { const s = document.documentElement.classList.contains('still'); btn.textContent = s ? 'Play motion' : 'Pause motion'; btn.setAttribute('aria-pressed', String(s)); };
btn.addEventListener('click', () => {
  const s = document.documentElement.classList.toggle('still');
  try { localStorage.setItem('ftb-still', s ? '1' : '0'); } catch { /* private mode */ }
  if (s) walking(false);
  label();
});
label();
