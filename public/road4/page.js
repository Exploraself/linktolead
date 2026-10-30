// "/road4/": Road 4, the page that starts from what a founder feels. Every
// call to action on it opens the FULL account form (with a password), landing
// "road4", so a founder who arrives here signs up here.
//
// What it does, top to bottom:
//   · the stage switch (Building, Growing, Scaling) — one choice, used by
//     everything below and carried into the sign-up;
//   · "Which of these did you feel this week?": eight symptoms in a founder's
//     own words, each opening what usually sits underneath, the call only the
//     founder can make, and where week one starts (the real first two steps,
//     Name it and Evidence, for that part of the business, from the level
//     files);
//   · the seven steps as a path that walks itself, and the four domains;
//   · "By Sunday": the stage's real week-one promise and its four titles;
//   · the sample: the real week-one steps. Notes save to this device first,
//     in 'ftb-sample', keyed like the programme's own answers; app.js moves
//     them into the account the first time the founder comes home signed in.
import { rememberUtm } from '/forms.js';
import { DOMAINS, SEVEN, STAGES } from '/content.js';

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
  if (joined) { a.removeAttribute('data-join'); a.href = '/start#home'; a.firstChild.textContent = a.closest('.tnav') ? 'My Blueprint' : 'Continue my Blueprint '; return; }
  a.addEventListener('click', join);
});
if (location.hash === '#join' && !joined) join();

// ── The week-one steps, one stage at a time ─────────────────────────────────
const FILES = { build: ['/levels-build.js', 'BUILD'], grow: ['/levels-grow.js', 'GROW'], scale: ['/levels-scale.js', 'SCALE'] };
const weekOne = {};
function loadStage(st) {
  if (!weekOne[st]) weekOne[st] = import(FILES[st][0]).then((m) => m[FILES[st][1]][1]).catch(() => { delete weekOne[st]; return null; });
  return weekOne[st];
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
  const first = lv ? lv[f.k].steps.slice(0, 2) : [];
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
  if (joined) { go.href = '/start#home'; go.firstChild.textContent = 'Continue my Blueprint '; } else go.addEventListener('click', join);
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
$('[data-stages]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-stage]');
  if (!b || b.dataset.stage === stage) return;
  stage = b.dataset.stage;
  document.querySelectorAll('[data-stage]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  $('#stage-hint').textContent = HINT[stage];
  showDig(false); drawSunday(); drawSample();
});

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

// ── By Sunday ────────────────────────────────────────────────────────────────
const ICON = {
  self: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  people: '<circle cx="9" cy="9" r="3"/><circle cx="16" cy="10" r="2.4"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M14.5 15c2.6-.4 4.8 1 5.4 4"/>',
  work: '<path d="M6 4h12v16H6z"/><path d="M9 9h6M9 12h6M9 15h4"/>',
  market: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>',
};
async function drawSunday() {
  const lv = await loadStage(stage);
  if (!lv) return;
  $('#sun-stage').textContent = `Your ${STAGES[stage].n} path · week one`;
  $('#promise').textContent = lv.promise;
  $('#things').innerHTML = DOMAINS.map((d) => `<li style="--c:${COLOR[d.k]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${ICON[d.k]}</svg>
    <div><b>${esc(lv[d.k].title)}</b><span>${esc(d.n)} · ${esc(lv[d.k].sub)}</span></div></li>`).join('');
}

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
  const d = lv[dom];
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

drawSunday();
drawSample();

// ── Motion: reveal on scroll, the walking path, and the pause button ─────────
const rvs = document.querySelectorAll('.rv, .draw');
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
