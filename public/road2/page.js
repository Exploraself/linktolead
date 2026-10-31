// "/road2/", the Blueprint page (31 Oct 2026): "You keep making it better.
// You keep putting off the selling." The six taps, the four questions and the
// two sliders are read on the page only, never saved or sent ("Nobody sees it
// but you"); each answer is answered back and gathered in "Your answers".
// Every "Start free tonight" opens the FULL account form, landing "road2",
// and the founder lands on Your Base Camp. /road2/#join opens it at once.
import { rememberUtm } from '../forms.js';

/** The line under the six cards, from how many are tapped. */
export function mirrorLine(n) {
  if (n <= 1) return 'You’re closer than you think. Three weeks can get you asking.';
  if (n <= 3) return `${n} of 6. The work is real. The asking is missing.`;
  return `${n} of 6. You are not lazy. You are building where it feels safe.`;
}

const hours = (n) => `${n} ${n === 1 ? 'hour' : 'hours'}`;

/** What the two sliders say: b hours building, s hours with people who could buy. */
export function costLines(b, s) {
  const week = `Your week: ${hours(b)} building, ${hours(s)} with buyers.`;
  const hit = s === 0 ? 'Not one hour with a buyer. What would one hour have changed?'
    : `For every hour with a buyer, ${hours(Math.round(b / s))} alone with the work.`;
  return { week, hit, ask: 'If next month looks the same, what will you have built, and who will have paid for it?' };
}

/** Which journey mark a question lights up. */
export const MARK = { believe: 'believe', steps: 'steps', before: 'feel', now: 'feel', wait: 'wait' };

const $ = (s) => document.querySelector(s);
const signedIn = () => { try { return !!localStorage.getItem('ftb-token'); } catch { return false; } };
let still = true;
try { still = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* old browser: keep it still */ }

/** One line of "Your answers". */
function sum(key, text) {
  const dd = document.querySelector(`[data-sum="${key}"]`);
  if (!dd || dd.textContent === text) return;
  dd.textContent = text; dd.classList.remove('none', 'got');
  if (!still) { void dd.offsetWidth; dd.classList.add('got'); }
}
const mark = (k) => document.querySelectorAll(`.jm li[data-k="${k}"]`).forEach((li) => li.classList.add('dn'));

if (typeof document !== 'undefined' && $('#mirror-read')) {
  rememberUtm();

  // Your week, in the hero: the bars change on their own after a moment
  // (the script in the hero), or as soon as the founder reaches for the button.
  const week = $('#week-vis'), heroGo = $('#hero-go');
  const open = () => { if (week && week.classList.contains('play')) { week.classList.remove('wait'); week.classList.add('run', 'open'); } };
  if (heroGo) { heroGo.addEventListener('mouseenter', open); heroGo.addEventListener('focus', open); }

  // The mirror.
  const taps = [...document.querySelectorAll('.tap')];
  const read = $('#mirror-read');
  taps.forEach((t) => t.addEventListener('click', () => {
    t.setAttribute('aria-pressed', String(t.getAttribute('aria-pressed') !== 'true'));
    const n = taps.filter((x) => x.getAttribute('aria-pressed') === 'true').length;
    read.textContent = mirrorLine(n);
    sum('mirror', `${n} of 6 tapped`);
  }));

  // The drawings: drawn when they come into view, still under reduced motion.
  const ills = [...document.querySelectorAll('.ill')];
  if (!still && 'IntersectionObserver' in window) {
    ills.forEach((el) => el.classList.add('anim'));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { threshold: 0.4 });
    ills.forEach((el) => io.observe(el));
  }
  const ill = (k) => document.querySelector(`[data-ill="${k}"]`);

  // The questions: one answer each, answered back, then on to the next.
  document.querySelectorAll('.opts[data-q]').forEach((group) => {
    const q = group.dataset.q, opts = [...group.querySelectorAll('.opt')];
    const reply = document.querySelector(`[data-reply="${q}"]`);
    opts.forEach((o) => o.addEventListener('click', () => {
      opts.forEach((x) => x.setAttribute('aria-pressed', String(x === o)));
      reply.textContent = o.dataset.say; reply.hidden = false;
      reply.classList.remove('show'); if (!still) { void reply.offsetWidth; reply.classList.add('show'); }
      sum(q, o.textContent.trim());
      mark(MARK[q]);
      const sec = group.closest('section');
      // The feeling question has two parts; "Next" waits for the second.
      const next = sec.querySelector('.next[data-next]');
      if (next && q !== 'before') next.hidden = false;
      // The drawings answer too.
      const d = ill(q === 'before' || q === 'now' ? 'feel' : q);
      if (d && q !== 'before') d.classList.add('ans');
      if (q === 'wait' && d) d.classList.toggle('stop', o.hasAttribute('data-stop'));
    }));
  });
  document.querySelectorAll('.next[data-next]').forEach((b) => b.addEventListener('click', () => {
    const to = $(b.dataset.next);
    if (to) to.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
  }));

  // The cost: the lines appear once a slider has been moved.
  const b = $('#h-build'), s = $('#h-sell');
  const show = () => {
    const bv = Number(b.value), sv = Number(s.value), L = costLines(bv, sv);
    for (const [el, out, v] of [[b, '#o-build', bv], [s, '#o-sell', sv]]) {
      $(out).innerHTML = `${v}<small>h</small>`;
      el.setAttribute('aria-valuetext', hours(v));
      el.style.setProperty('--p', `${(v / Number(el.max)) * 100}%`);
    }
    $('#cost-hint').hidden = true;
    $('#cost-week').textContent = L.week; $('#cost-week').hidden = false;
    $('#cost-hit').textContent = L.hit; $('#cost-hit').hidden = false;
    $('#cost-ask').hidden = false;
    sum('cost', `${hours(bv)} building, ${hours(sv)} with buyers`);
  };
  b.addEventListener('input', show); s.addEventListener('input', show);

  // Already signed in on this device: a slim bar back to the Base Camp.
  if (signedIn()) $('#backbar').hidden = false;

  // Every button opens the full form.
  const gate = $('#gate');
  let box = null;
  const loadBox = () => box || (box = import('/account-box.js').catch(() => { box = null; }));
  const join = (e) => {
    const opener = e && e.currentTarget;
    gate.hidden = false;
    loadBox().then((m) => m && m.open({ gate, opener, stage: null, variant: 'full', landing: 'road2' }));
  };
  document.querySelectorAll('[data-join]').forEach((x) => x.addEventListener('click', join));
  if (location.hash === '#join') join();
}
