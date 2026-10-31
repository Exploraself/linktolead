// "/road2/", the Blueprint page (31 Oct 2026): "You built the house. You
// forgot the door." The six taps and the two sliders are read on the page
// only, never saved or sent ("Nobody sees it but you"). Every "Start free
// tonight" opens the FULL account form, landing "road2", and the founder lands
// on Your Base Camp. /road2/#join opens it straight away.
import { rememberUtm } from '../forms.js';

/** The line under the six cards, from how many are tapped. */
export function mirrorLine(n) {
  if (n <= 1) return 'You’re closer than you think. Three weeks can open the door.';
  if (n <= 3) return `${n} of 6. The work is real. The door is missing.`;
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

const $ = (s) => document.querySelector(s);
const signedIn = () => { try { return !!localStorage.getItem('ftb-token'); } catch { return false; } };

if (typeof document !== 'undefined' && $('#mirror-read')) {
  rememberUtm();

  // The house: the door draws in on its own after a moment (the script in the
  // hero), or as soon as the founder reaches for the button.
  const house = $('#house'), heroGo = $('#hero-go');
  const open = () => { if (house) { house.classList.remove('wait'); house.classList.add('open'); } };
  if (heroGo) { heroGo.addEventListener('mouseenter', open); heroGo.addEventListener('focus', open); }

  // The mirror.
  const taps = [...document.querySelectorAll('.tap')];
  const read = $('#mirror-read');
  taps.forEach((t) => t.addEventListener('click', () => {
    t.setAttribute('aria-pressed', String(t.getAttribute('aria-pressed') !== 'true'));
    read.textContent = mirrorLine(taps.filter((x) => x.getAttribute('aria-pressed') === 'true').length);
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
