// "/road3/", Road 3 (the 12 Scrolls design): the twelve levels of Version 4
// (one four-letter word each, in three chapters, the same for every stage),
// "what another year like this costs" counted by the founder, the ladder's
// bars, the bar for founders who are already signed in, the phone bar, and
// every "Join" opening the simple account form (landing "road3").
import { LEVELS4, CHAPTERS4 } from '../levels-v4.js';
import { rememberUtm } from '../forms.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const signedIn = () => { try { return !!localStorage.getItem('ftb-token'); } catch { return false; } };
const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Which band a level sits in: open the day you join (01–03), with
 *  Alexandru (04–05), the LAB and HUB (06–11), and the closing level. */
export const band = (n) => (n <= 3 ? 'free' : n <= 5 ? 'with' : n === 12 ? 'last' : '');

/** The twelve levels, as list items, with a heading line before each chapter. */
export function levelsHTML() {
  return CHAPTERS4.map((c) => `<li class="ch">${esc(c.n)} · ${esc(c.name)}</li>` + c.lv.map((i) => {
    const L = LEVELS4[i], n = L.n;
    return `<li class="${band(n)}"><b>${String(n).padStart(2, '0')} · ${esc(L.word)}</b><p>${esc(L.title)}<small>${esc(L.promise)}</small></p></li>`;
  }).join('')).join('');
}

if (typeof document !== 'undefined' && $('#levels')) {
  rememberUtm();
  $('#levels').innerHTML = levelsHTML();

  // The ladder: twelve bars a row, the ones that step opens in gold.
  document.querySelectorAll('#ladder .bars').forEach((b) => {
    const on = Number(b.dataset.on) || 0;
    b.innerHTML = Array.from({ length: 12 }, (_, i) => `<i${i < on ? ' class="on"' : ''}></i>`).join('');
  });

  // Already signed in on this device: a slim bar back to the Base Camp.
  if (signedIn()) $('#backbar').hidden = false;

  // Every "Join" opens the simple form; /road3/#join opens it straight away.
  const gate = $('#gate');
  let box = null;
  const loadBox = () => box || (box = import('/account-box.js').catch(() => { box = null; }));
  const join = (e) => {
    const opener = e && e.currentTarget;
    gate.hidden = false;
    import('/road-kit.js').then((k) => { k.count('road3', 'form_open'); k.count('road3', 'cta'); }).catch(() => {});
    loadBox().then((m) => m && m.open({ gate, opener, stage: null, variant: 'simple', landing: 'road3' }));
  };
  document.querySelectorAll('[data-join]').forEach((b) => b.addEventListener('click', join));
  if (location.hash === '#join') join();

  // What another year like this costs: the founder's own two numbers.
  const now = $('#s-now'), want = $('#s-want');
  let touched = false;
  const hours = () => {
    const n = +now.value, w = +want.value, extra = Math.max(0, n - w) * 52, weeks = Math.min(52, Math.round(extra / w));
    $('#o-now').textContent = `${n} h`; $('#o-want').textContent = `${w} h`;
    $('#o-year').textContent = `${extra.toLocaleString('en-US')} h`;
    $('#o-eq').textContent = extra ? `That is ${weeks} of your chosen weeks, every year.` : 'You already work the week you want.';
    $('#r-ask').textContent = extra ? 'Who got those hours last year, and who went without them?' : 'Then the question is what each of those hours is buying you.';
    const back = Math.min(extra, 156);
    $('#o-after').textContent = !extra ? 'Then the work is keeping it that way.' : back < extra ? `One protected three-hour block a week takes back ${back.toLocaleString('en-US')} of them, every year.` : 'One protected block a week takes back all of them.';
    return extra;
  };
  const moved = () => {
    touched = true; stop();
    const extra = hours();
    import('/road-kit.js').then((k) => k.remember('road3', { hoursNow: +now.value, hoursWant: +want.value, extraYear: extra })).catch(() => {});
    const mine = $('#close-mine');
    mine.textContent = extra ? `You counted ${extra.toLocaleString('en-US')} hours a year beyond the week you want. Week one starts by counting where last week went.` : '';
    mine.hidden = !extra;
  };
  now.addEventListener('input', moved); want.addEventListener('input', moved);
  hours();
  let stop = () => {};

  // The phone bar, the year counted up once, and the scrolls arriving.
  import('/road-kit.js').then((k) => {
    k.stickyJoin({ title: 'The first three weeks are free', line: 'Name and email. No card.', label: signedIn() ? 'Continue' : 'Start free',
      after: document.querySelector('.sc'), quiet: [$('#close-cta'), $('#nt'), $('#nt-case'), $('#mm')], onJoin: (e) => (signedIn() ? (location.href = '/ground-plan/#home') : join(e)) });
    k.matchHeadline(document.querySelector('.h1'), 'road3', 'em');
    k.welcomeBack($('#back'), 'road3');
    k.miniMirror($('#mm'), { page: 'road3', onJoin: join });
    k.stories($('#story-list'));
    k.nowThen($('#nt'), $('#nt-case'), { page: 'road3', onJoin: join });
    k.fourLines($('#fl'));
    k.trackScroll('road3');
    now.addEventListener('change', () => k.count('road3', 'cost_moved'));
    want.addEventListener('change', () => k.count('road3', 'cost_moved'));
    if (!touched) stop = k.countUp($('#o-year'), () => Math.max(0, now.value - want.value) * 52, (n) => `${n.toLocaleString('en-US')} h`);
  }).catch(() => {});
  try {
    if (!still()) {
      const io = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.remove('wait'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
      document.querySelectorAll('.sc .in > :not(.jm)').forEach((el) => { el.classList.add('rv'); if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('wait'); io.observe(el); } });
    }
  } catch { /* old browser: everything is already visible */ }
}
