// "/road1/": Road 1, the long Link to Lead page. Every
// call to action on it opens the FULL account form (with a password), so a
// founder who arrives here signs up here (landing "road1") and is never sent
// to /north3/. / and /b redirect here, query string kept (functions/_landing.js).
//
// The What-if Lab (lab.js) loads as the visitor scrolls near it. "What
// another year like this costs" is counted by the founder (two sliders), kept
// on this device only so Base Camp can say it back once (/road-kit.js).
import { rememberUtm } from '/forms.js';
import { remember, stickyJoin, countUp } from '/road-kit.js';

rememberUtm();
const gate = document.getElementById('gate');
let box = null;
const loadBox = () => box || (box = import('/account-box.js').catch(() => { box = null; }));
function join(e) {
  if (e) e.preventDefault();
  const opener = e && e.currentTarget;
  gate.hidden = false;
  loadBox().then((m) => m && m.open({ gate, opener, stage: null, variant: 'full', landing: 'road1' }));
}
document.querySelectorAll('[data-join]').forEach((a) => a.addEventListener('click', join));
if (location.hash === '#join') join();

const lab = document.getElementById('whatif-lab');
if (lab) {
  const engine = () => (window.CompassEngine ? Promise.resolve(window.CompassEngine) : new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = '/northstar/engine.js'; s.onload = () => ok(window.CompassEngine); s.onerror = no; document.head.appendChild(s);
  }));
  const fill = () => Promise.all([engine(), import('/road1/lab.js')]).then(([E, m]) => m.fill(lab, { E, openGate: join })).catch(() => {});
  try {
    const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); fill(); } }, { rootMargin: '900px 0px' });
    io.observe(lab);
  } catch { fill(); }
}

// ── What another year like this costs: the founder's own two numbers ───────
const $ = (q) => document.querySelector(q);
const now = $('#s-now'), want = $('#s-want');
const signedIn = (() => { try { return !!localStorage.getItem('ftb-token'); } catch { return false; } })();
let stopCount = () => {};
function hours() {
  const n = +now.value, w = +want.value, extra = Math.max(0, n - w) * 52, weeks = Math.min(52, Math.round(extra / w));
  $('#o-now').textContent = `${n} h`; $('#o-want').textContent = `${w} h`;
  $('#o-year').textContent = `${extra.toLocaleString('en-US')} h`;
  $('#o-eq').textContent = extra ? `That is ${weeks} of your chosen weeks, every year.` : 'You already work the week you want.';
  $('#r-ask').textContent = extra ? 'Who got those hours last year, and who went without them?' : 'Then the question is what each of those hours is buying you.';
  return extra;
}
if (now && want) {
  const moved = () => {
    stopCount();
    const extra = hours();
    remember('road1', { hoursNow: +now.value, hoursWant: +want.value, extraYear: extra });
    const mine = $('#close-mine');
    mine.textContent = extra ? `You counted ${extra.toLocaleString('en-US')} hours a year beyond the week you want. Week one starts by counting where last week went.` : '';
    mine.hidden = !extra;
  };
  now.addEventListener('input', moved); want.addEventListener('input', moved);
  hours();
  stopCount = countUp($('#o-year'), () => Math.max(0, now.value - want.value) * 52, (n) => `${n.toLocaleString('en-US')} h`);
}

// ── The phone bar, and the bands arriving as they are reached ──────────────
stickyJoin({ title: 'The first three weeks are free', line: 'No card. Your work is yours to keep.', label: signedIn ? 'Continue' : 'Start free',
  after: $('.hero'), quiet: [$('#close-cta'), $('#cost .ctarow')], onJoin: (e) => (signedIn ? (location.href = '/ground-plan/#home') : join(e)) });
try {
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.remove('wait'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.band .wrap > *, .bridge .wrap > *').forEach((el) => {
      if (el.closest('#whatif') || el.closest('.later')) return;
      el.classList.add('rv');
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('wait'); io.observe(el); }
    });
  }
} catch { /* old browser: everything is already visible */ }
