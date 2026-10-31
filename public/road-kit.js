// Shared by the three Blueprint sales pages (/road1/, /road3/, /road4/):
//   · remember(): what the founder found on the page (their stage, the part
//     of the business their answers point to), kept on THIS device only, so
//     Base Camp can say it back once, in their words (/arrival.js);
//   · stickyJoin(): on a phone, one quiet bar at the bottom with the page's one
//     offer, shown only after the first screen and hidden wherever the page
//     already shows its own button or the sign-up box is open;
//   · countUp(): a number that counts to its value the first time it is seen.
// Everything respects prefers-reduced-motion and the page's "still" choice.

const still = () => document.documentElement.classList.contains('still') || matchMedia('(prefers-reduced-motion: reduce)').matches;

/** What the founder found here, for Base Camp to say back once. Device only. */
export function remember(landing, found) {
  try { localStorage.setItem('ftb-arrival', JSON.stringify({ landing, ...found, at: Date.now() })); } catch { /* private mode */ }
}

const CSS = `.rk-bar{position:fixed;left:0;right:0;bottom:0;z-index:55;display:flex;align-items:center;justify-content:space-between;gap:12px;
padding:10px max(16px,env(safe-area-inset-right,0px)) calc(10px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));
background:rgba(20,16,11,.96);color:#F3EBDA;border-top:1px solid rgba(201,162,74,.55);box-shadow:0 -14px 30px -18px rgba(0,0,0,.6);
transform:translateY(115%);transition:transform .35s ease;font-family:Inter,system-ui,Arial,sans-serif}
.rk-bar.on{transform:none}
.rk-bar p{margin:0;font-size:12.5px;line-height:1.3;color:#CDBF9F;min-width:0}
.rk-bar p b{display:block;color:#F3EBDA;font-size:14px;font-weight:600}
.rk-bar button{flex:none;min-height:46px;padding:0 18px;border:0;border-radius:3px;background:#C9A24A;color:#14100B;font:700 14.5px/1 Inter,system-ui,Arial,sans-serif;cursor:pointer}
.rk-bar button:focus-visible{outline:2px solid #F3EBDA;outline-offset:2px}
html.rk-bar-on .es-ts.float{bottom:calc(84px + env(safe-area-inset-bottom,0px))}
@media(min-width:761px){.rk-bar{display:none}}
@media(prefers-reduced-motion:reduce){.rk-bar{transition:none}}
.rk-count{font-variant-numeric:tabular-nums}`;
let styled = false;
function style() { if (styled) return; styled = true; const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }

/**
 * The phone bar. `after`: the element the bar waits to scroll past (the hero).
 * `quiet`: elements that already carry the offer; while one is on screen the
 * bar steps aside. `onJoin`: what the button does (opens the page's form).
 */
export function stickyJoin({ title, line, label, after, quiet = [], onJoin }) {
  if (!after || !('IntersectionObserver' in window)) return;
  style();
  const bar = document.createElement('div');
  bar.className = 'rk-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Start free');
  bar.innerHTML = `<p><b>${title}</b>${line}</p><button type="button">${label}</button>`;
  document.body.appendChild(bar);
  bar.querySelector('button').addEventListener('click', onJoin);
  let past = false; const seen = new Set();
  const gate = document.getElementById('gate');
  const set = () => {
    const on = past && !seen.size && !(gate && !gate.hidden);
    bar.classList.toggle('on', on);
    document.documentElement.classList.toggle('rk-bar-on', on);
    bar.inert = !on;
  };
  new IntersectionObserver(([e]) => { past = !e.isIntersecting && e.boundingClientRect.top < 0; set(); }).observe(after);
  const io = new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target))); set(); });
  quiet.filter(Boolean).forEach((el) => io.observe(el));
  if (gate) new MutationObserver(set).observe(gate, { attributes: true, attributeFilter: ['hidden'] });
}

/**
 * Counts `el` up to its value the first time it is seen. `to` is the number,
 * or a function that reads it then (so a slider moved first is respected);
 * `fmt` writes it. The text is already the final value at rest. Returns
 * stop(), for when the founder takes over (a slider moved mid-count).
 */
export function countUp(el, to, fmt = (n) => n.toLocaleString('en-US')) {
  let stopped = false;
  const stop = () => { stopped = true; };
  if (!el || still() || !('IntersectionObserver' in window)) return stop;
  el.classList.add('rk-count');
  style();
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting || stopped) return;
    io.disconnect();
    const end = typeof to === 'function' ? to() : to, t0 = performance.now(), dur = 1100;
    const tick = (t) => { if (stopped) return; const k = Math.min(1, (t - t0) / dur), ease = 1 - (1 - k) ** 3; el.textContent = fmt(Math.round(end * ease)); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, { threshold: 0.6 });
  io.observe(el);
  return stop;
}

// ── 1 Nov, round 2 ─────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DOM = { self: 'Lead yourself', people: 'Lead your people', work: 'Lead your business', market: 'Lead the market' };

/**
 * The drop-off counter (functions/api/count.js): which moment on which page,
 * nothing about the person. Each moment counts once per visit.
 */
const sent = new Set();
export function count(page, moment) {
  const k = page + ':' + moment;
  if (sent.has(k)) return;
  sent.add(k);
  try {
    const body = JSON.stringify({ page, moment });
    if (!(navigator.sendBeacon && navigator.sendBeacon('/api/count', new Blob([body], { type: 'application/json' })))) {
      fetch('/api/count', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {});
    }
  } catch { /* counting never gets in the way */ }
}
/** How far down the page this visit got: a quarter, half, three quarters, the end. */
export function trackScroll(page) {
  count(page, 'view');
  const marks = [[25, 's25'], [50, 's50'], [75, 's75'], [98, 's100']];
  const on = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    const p = h > 0 ? (scrollY / h) * 100 : 100;
    marks.forEach(([m, k]) => { if (p >= m) count(page, k); });
  };
  addEventListener('scroll', on, { passive: true });
}

/**
 * Message match: an ad promises one pain; the page opens on that same line.
 * Only the hooks already approved in 01 START HERE §4. ?pain=alone, or
 * utm_content that contains "pain-alone". Unknown or none: the page as written.
 */
export const PAINS = {
  alone: { hook: 'Your business can’t grow <i>past you.</i>', pain: 'Doing everything myself' },
  time: { hook: 'Every decision still <i>waits for you?</i>', pain: 'No time for myself' },
  clients: { hook: 'Busy is not the same <i>as chosen.</i>', pain: 'Not enough clients' },
  price: { hook: 'Booked solid. <i>Still capped?</i>', pain: 'Prices feel too low' },
  direction: { hook: 'What is your business <i>for?</i>', pain: 'Unclear direction' },
};
export function painFromUrl(href = location.href) {
  try {
    const q = new URL(href).searchParams;
    const k = (q.get('pain') || (q.get('utm_content') || '').match(/pain-([a-z]+)/)?.[1] || '').toLowerCase();
    return PAINS[k] ? k : '';
  } catch { return ''; }
}
export function matchHeadline(h1, page, tag = 'i') {
  const k = painFromUrl();
  if (!k || !h1) return '';
  h1.innerHTML = tag === 'i' ? PAINS[k].hook : PAINS[k].hook.replace(/<(\/?)i>/g, `<$1${tag}>`);
  count(page, 'pain_match');
  return k;
}

/** A founder who came back (not signed up yet): what they found last time, said back. */
export function welcomeBack(host, page) {
  if (!host) return;
  let a = null;
  try { if (localStorage.getItem('ftb-token')) return; a = JSON.parse(localStorage.getItem('ftb-arrival') || 'null'); } catch { return; }
  if (!a || Date.now() - (a.at || 0) > 30 * 864e5) return;
  const line = a.worst && DOM[a.worst]
    ? `Welcome back. Your mirror said <b>${esc(DOM[a.worst])}</b>. Week one starts there.`
    : Number(a.extraYear) > 0 ? `Welcome back. You counted <b>${Number(a.extraYear).toLocaleString('en-US')} hours a year</b> beyond the week you want.` : '';
  if (!line) return;
  host.innerHTML = line;
  host.hidden = false;
  count(page, 'back');
}

/**
 * The quick mirror (road1, road3): three taps, before any form. Each answer
 * gets a straight line back; the end names where week one starts and what
 * the first Sunday holds (the real level-one promise). Device only.
 */
const MQ = [
  { k: 'self', q: 'Do you know, to the hour, where last week went?', leak: 'no',
    no: 'Then your week was decided by whoever asked first.', yes: 'Then you already hold the evidence the work starts from.' },
  { k: 'work', q: 'If you took two weeks off next month, would the business keep its pace?', leak: 'no',
    no: 'Then the business is stored in your head, the most fragile place it could be.', yes: 'Good. Then spend that freedom on the work only you can do.' },
  { k: 'market', q: 'Could you name the last ten people who paid you, and say why they chose you?', leak: 'no',
    no: 'Then you are selling to a customer you imagined. The real ones would tell you.', yes: 'Then you hold the most underused evidence in a small business.' },
];
const MCSS = `.rk-mm{background:#1C1309;color:#F3EBDA;border:1px solid rgba(201,162,74,.45);padding:clamp(20px,4vw,32px);display:grid;gap:14px;max-width:680px;box-shadow:0 30px 60px -30px rgba(0,0,0,.7);font-family:Inter,system-ui,Arial,sans-serif}
.rk-mm .k{margin:0;font:700 11px/1.4 Inter,system-ui,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#D6BF8F}
.rk-mm .q{margin:0;font:500 clamp(21px,2.6vw,27px)/1.3 Newsreader,Georgia,serif;color:#F3EBDA;text-wrap:balance}
.rk-mm .yn{display:flex;gap:10px}
.rk-mm .yn button,.rk-mm .go{min-height:48px;min-width:96px;padding:0 20px;border:1px solid #B4975F;background:none;color:#F3EBDA;font:600 15px/1 Inter,system-ui,Arial,sans-serif;cursor:pointer;border-radius:3px}
.rk-mm .yn button:hover{background:rgba(180,151,95,.16)}
.rk-mm .yn .go{background:#C9A24A;color:#14100B;border-color:#C9A24A;font-weight:700}
.rk-mm .ref{margin:0;font:italic 400 18px/1.45 Newsreader,Georgia,serif;color:#E3C47E;border-left:3px solid #B4975F;padding-left:14px}
.rk-mm .dots{display:flex;gap:6px}.rk-mm .dots i{display:block;flex:none;width:28px;height:4px;background:#3A3022}.rk-mm .dots i.on{background:#C9A24A}.rk-mm .dots i.rk-leak{background:#E08A5F}
.rk-mm ul{margin:0;padding-left:18px;display:grid;gap:4px;color:#D8CDB6;font-size:15px}
.rk-mm .fine{margin:0;font-size:14px;color:#B3A78F}
.rk-mm button:focus-visible{outline:2px solid #F3EBDA;outline-offset:2px}
@media(prefers-reduced-motion:no-preference){.rk-mm .swap{animation:rkIn .45s ease}}
@keyframes rkIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`;
export function miniMirror(host, { page, first, onJoin }) {
  if (!host) return;
  const s = document.createElement('style'); s.textContent = MCSS; document.head.appendChild(s);
  host.classList.add('rk-mm');
  const ans = [];
  const dots = () => `<div class="dots" aria-hidden="true">${MQ.map((_, i) => `<i class="${i < ans.length ? (ans[i] === MQ[i].leak ? 'rk-leak' : 'on') : ''}"></i>`).join('')}</div>`;
  const ask = () => {
    const i = ans.length, q = MQ[i];
    host.innerHTML = `${dots()}<p class="k">Quick mirror · ${i + 1} of 3 · ${esc(DOM[q.k])}</p><div class="swap"><p class="q">${esc(q.q)}</p></div>
      <div class="yn"><button type="button" data-a="yes">Yes</button><button type="button" data-a="no">No</button></div>`;
  };
  const done = () => {
    const leaks = ans.map((a, i) => a === MQ[i].leak), n = leaks.filter(Boolean).length;
    const worst = n ? MQ[leaks.indexOf(true)].k : 'self';
    remember(page, { worst, leaking: n, word: 'SEED' });
    count(page, 'mini_done');
    host.innerHTML = `${dots()}<p class="k">Your quick mirror</p><div class="swap">
      <p class="q">${n ? `${n} of 3 point to work only you can see. Week one starts with <em style="color:#E3C47E">${esc(DOM[worst])}</em>.` : 'All three held. Week one checks them against your calendar, not your memory.'}</p></div>
      <p class="fine">By your first Sunday, on paper:</p>
      <ul><li>one old rule tested</li><li>one task handed over</li><li>your “enough” as a number</li><li>three people asked to buy</li></ul>
      <div class="yn"><button type="button" class="go" data-join-mm>${esc(first || 'Start my free three weeks →')}</button></div>
      <p class="fine">No card. Your work stays yours. Stop any week.</p>`;
    host.querySelector('[data-join-mm]').addEventListener('click', onJoin);
  };
  host.addEventListener('click', (e) => {
    const b = e.target.closest('[data-a]');
    if (!b) return;
    if (!ans.length) count(page, 'mirror_start');
    const q = MQ[ans.length];
    ans.push(b.dataset.a);
    host.querySelectorAll('[data-a]').forEach((x) => { x.disabled = true; });
    const r = document.createElement('p'); r.className = 'ref swap'; r.textContent = q[b.dataset.a];
    host.appendChild(r);
    setTimeout(() => (ans.length < MQ.length ? ask() : done()), still() ? 300 : 1300);
  });
  ask();
}

/**
 * Model stories (1 Nov): what a founder's first three Sundays can look like,
 * written as the model Alexandru will replace with real founders' words. They
 * are NOT real people, and every one carries the visible "Model story" tag
 * until a real one, with written permission, takes its place
 * (AGENTS.md §6, 01 START HERE §5). Swap `model: true` for a real story only.
 */
export const STORIES = [
  { model: true, name: 'Dana K.', who: 'Bookkeeping practice, two staff · Austin, Texas', stage: 'Growing', pain: 'Doing everything myself',
    quote: 'I counted my week for the first time: 61 hours, and 19 of them were work my assistant could do. By the third Sunday I had handed her the invoicing, and I said my new price out loud to two clients. Neither of them blinked.',
    proof: ['19 hours a week found', 'Invoicing handed over', 'New price said to 2 clients'] },
  { model: true, name: 'Luis M.', who: 'Landscaping company, crew of four · Phoenix, Arizona', stage: 'Growing', pain: 'Team not stepping up',
    quote: 'My crew waited for me on every job. In week one I wrote what I expect in ten lines and read it to them on the Monday. That Friday was the first Friday in two years my phone didn’t ring.',
    proof: ['Ten lines of what he expects', 'Read to the crew on Monday', 'A Friday without a call'] },
  { model: true, name: 'Priya S.', who: 'Brand designer, working alone · Denver, Colorado', stage: 'Building', pain: 'Not enough clients',
    quote: 'The mirror asked me to name the last ten people who paid me. I could name four. By week three I had asked three people to buy, out loud, with a price. Two said yes.',
    proof: ['Four names became ten', 'Three people asked to buy', 'Two said yes'] },
];
const SCSS = `.rk-st{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.rk-st article{position:relative;display:grid;gap:12px;align-content:start;background:#FFFCF4;color:#1C1309;border:1px solid #D6C9AC;border-top:4px solid #B4975F;padding:22px 20px 20px;font-family:Inter,system-ui,Arial,sans-serif}
.rk-st .tag{justify-self:start;line-height:1.3!important;font:700 10.5px/1 Inter,system-ui,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8A3B12;background:#F6E2D3;border:1px dashed #C2643A;padding:5px 8px}
.rk-st blockquote{margin:0;font:400 18.5px/1.5 Newsreader,Georgia,serif;color:#1C1309}
.rk-st blockquote::before{content:"“";display:block;font:500 48px/.6 Newsreader,Georgia,serif;color:#B4975F;margin-bottom:6px}
.rk-st ul{list-style:none;margin:0;padding:12px 0 0;border-top:1px dashed #D6C9AC;display:grid;gap:4px;font-size:14px;color:#4A4033}
.rk-st li::before{content:"✓ ";color:#4C7355;font-weight:700}
.rk-st .by b{display:block;font:600 15px/1.3 Inter,system-ui,Arial,sans-serif}
.rk-st .by span{font-size:13.5px;color:#6A6052}
.rk-st .pn{font:700 11px/1.3 Inter,system-ui,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#6E5213}`;
export function stories(host) {
  if (!host) return;
  const s = document.createElement('style'); s.textContent = SCSS; document.head.appendChild(s);
  host.classList.add('rk-st');
  host.innerHTML = STORIES.map((x) => `<article>${x.model ? '<span class="tag">Model story · not a real founder yet</span>' : ''}
    <p class="pn">${esc(x.stage)} · ${esc(x.pain)}</p><blockquote>${esc(x.quote)}</blockquote>
    <ul>${x.proof.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    <p class="by"><b>${esc(x.name)}</b><span>${esc(x.who)}</span></p></article>`).join('');
}

// ── 1 Nov, round 3: today and week twelve, and the founder's own case ──────
/**
 * The frame Alexandru kept (road4's "Today / Week twelve"), now on all three
 * pages, and made theirs: in Today they tap what is true this week; in Week
 * twelve they tap the one thing they want most. Then they make their own case
 * (motivational interviewing): how ready, 1 to 10, and why not lower, by
 * tapping their reasons. The page only says back what they chose. On a phone
 * the whole frame fits one screen and the switch sits under the thumb, at the
 * bottom of the stack. Device only; nothing typed, nothing sent.
 */
const NT = [
  { k: 'week', n: 'Your week', now: 'Spent by whoever asks first.', then: 'A shape you chose, with one block defended every week.', i: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>' },
  { k: 'reason', n: 'Your reason', now: 'Hard to say out loud.', then: 'One sentence you would say to a customer.', i: '<path d="M12 3v18M5 8l7-5 7 5"/>' },
  { k: 'price', n: 'Your price', now: 'Quoted from fear.', then: 'The worth of your hour, written as a number and said out loud.', i: '<path d="M7 4h10l2 4H5Z"/><path d="M5 8v12h14V8M10 13h4"/>' },
  { k: 'people', n: 'Your people', now: 'Waiting, guessing what you expect.', then: 'Told plainly what you expect, and what they may decide without you.', i: '<circle cx="9" cy="9" r="3"/><circle cx="16" cy="10" r="2.4"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M14.5 15c2.6-.4 4.8 1 5.4 4"/>' },
  { k: 'work', n: 'The work', now: 'Lives in your head.', then: 'Written down, run by somebody else, and corrected where it was wrong.', i: '<path d="M6 4h12v16H6z"/><path d="M9 9h6M9 12h6M9 15h4"/>' },
  { k: 'customers', n: 'Your customers', now: 'Whoever happens to find you.', then: 'A hundred real names and an order to approach them in.', i: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/>' },
  { k: 'ninety', n: 'Your next ninety days', now: 'The next fire.', then: 'One page: one outcome, three priorities, one number you check weekly.', i: '<path d="M5 20 12 5l7 15"/><path d="M9 13h6"/>' },
];
const WHY = ['It is costing me my evenings', 'The people at home are paying for it', 'My team deserves to know what I expect', 'I am tired of guessing', 'I want my price to be fair', 'I want a week away that I don’t pay for later', 'I started this for a reason, and I’ve lost it'];
const NCSS = `.rk-nt{display:grid;gap:10px;font-family:Inter,system-ui,Arial,sans-serif;color:#1C1309}
.rk-nt .hint{margin:0;font-size:14.5px;color:inherit;opacity:.8}
.rk-nt .sw{display:inline-flex;justify-self:start;border:1px solid #D6C9AC;border-radius:999px;padding:3px;background:#FFFCF4}
.rk-nt .sw button{min-height:44px;padding:0 20px;border:0;border-radius:999px;background:none;color:#1C1309;font:600 15px/1 Inter,system-ui,Arial,sans-serif;cursor:pointer}
.rk-nt .sw button[aria-pressed="true"]{background:#C9A24A;color:#14100B}
.rk-nt ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.rk-nt li button{width:100%;text-align:left;display:grid;grid-template-columns:28px 170px 1fr auto;gap:4px 14px;align-items:center;background:#FFFCF4;border:1px solid #D6C9AC;border-radius:6px;padding:14px 18px;cursor:pointer;color:#1C1309;font:inherit;transition:border-color .4s,box-shadow .3s}
.rk-nt li button:hover{border-color:#B4975F}
.rk-nt svg{width:24px;height:24px;fill:none;stroke:#6E5213;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.rk-nt b{font:700 11px/1.4 Inter,system-ui,Arial,sans-serif;letter-spacing:1.8px;text-transform:uppercase;color:#6E5213}
.rk-nt .tx{display:grid}
.rk-nt .tx span{grid-area:1/1;font:400 clamp(16px,2vw,19px)/1.4 Newsreader,Georgia,serif;transition:opacity .45s ease,transform .45s ease}
.rk-nt .now{color:#4A4033}
.rk-nt .then{opacity:0;transform:translateY(8px)}
.rk-nt[data-st="then"] .now{opacity:0;transform:translateY(-8px)}
.rk-nt[data-st="then"] .then{opacity:1;transform:none}
.rk-nt[data-st="then"] li button{border-color:#C9A24A}
.rk-nt .pill{font:700 10.5px/1 Inter,system-ui,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:5px 8px;border-radius:3px;white-space:nowrap;visibility:hidden}
.rk-nt[data-st="now"] li[data-true] .pill.t{visibility:visible;background:#F6E2D3;color:#8A3B12}
.rk-nt[data-st="now"] li[data-true] button{box-shadow:inset 4px 0 0 #C2643A}
.rk-nt[data-st="then"] li[data-want] .pill.w{visibility:visible;background:#C9A24A;color:#14100B}
.rk-nt[data-st="then"] li[data-want] button{box-shadow:inset 4px 0 0 #C9A24A,0 10px 24px -14px rgba(110,82,19,.6)}
.rk-nt .pill.w{display:none}.rk-nt[data-st="then"] .pill.t{display:none}.rk-nt[data-st="then"] .pill.w{display:inline-block}
.rk-nt .tally{margin:0;font-size:14px;color:inherit;opacity:.85}
.rk-nt .pl{display:none}
.rk-nt li:nth-child(2) .tx span{transition-delay:.05s}.rk-nt li:nth-child(3) .tx span{transition-delay:.1s}.rk-nt li:nth-child(4) .tx span{transition-delay:.15s}.rk-nt li:nth-child(5) .tx span{transition-delay:.2s}.rk-nt li:nth-child(6) .tx span{transition-delay:.25s}.rk-nt li:nth-child(7) .tx span{transition-delay:.3s}
@media(max-width:620px){
  .rk-nt{gap:8px}
  .rk-nt .hint{font-size:14px;line-height:1.4}
  .rk-nt ul{gap:5px}
  .rk-nt li button{grid-template-columns:20px 1fr;gap:10px;padding:8px 12px}
  .rk-nt svg{width:20px;height:20px}
  .rk-nt b,.rk-nt .pill{display:none!important}
  .rk-nt .pl{display:inline;font:700 10.5px/1 Inter,system-ui,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#6E5213;font-style:normal}
  .rk-nt .tx span{font-size:14.5px;line-height:1.32}
  .rk-nt .sw{order:9;justify-self:stretch;display:grid;grid-template-columns:1fr 1fr}
  .rk-nt .sw button{min-height:48px}
  .rk-nt .tally{order:10;text-align:center}
}
.rk-case{display:grid;gap:14px;background:#1C1309;color:#F3EBDA;border:1px solid rgba(201,162,74,.45);padding:clamp(20px,4vw,30px);font-family:Inter,system-ui,Arial,sans-serif;box-shadow:0 30px 60px -30px rgba(0,0,0,.7)}
.rk-case[hidden]{display:none}
.rk-case .k{margin:0;font:700 11px/1.4 Inter,system-ui,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#D6BF8F}
.rk-case .q{margin:0;font:500 clamp(21px,2.6vw,27px)/1.3 Newsreader,Georgia,serif;text-wrap:balance}
.rk-case .scale{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:6px}
.rk-case .scale button{min-height:46px;border:1px solid #B4975F;background:none;color:#F3EBDA;font:600 16px/1 Inter,system-ui,Arial,sans-serif;cursor:pointer;border-radius:3px;font-variant-numeric:tabular-nums}
.rk-case .scale button[aria-pressed="true"]{background:#C9A24A;color:#14100B}
.rk-case .ends{display:flex;justify-content:space-between;font-size:13px;color:#B3A78F;margin-top:-6px}
.rk-case .chips{display:flex;flex-wrap:wrap;gap:8px}
.rk-case .chips button{min-height:42px;padding:8px 14px;border:1px solid #5A4A30;background:rgba(255,255,255,.04);color:#E8DFCB;font:500 14.5px/1.3 Inter,system-ui,Arial,sans-serif;cursor:pointer;border-radius:999px;text-align:left}
.rk-case .chips button[aria-pressed="true"]{border-color:#C9A24A;background:rgba(201,162,74,.18);color:#FFF6E2}
.rk-case .say{margin:0;font:italic 400 clamp(19px,2.3vw,23px)/1.45 Newsreader,Georgia,serif;color:#E3C47E;border-left:3px solid #B4975F;padding-left:16px}
.rk-case .go{justify-self:start;min-height:50px;padding:0 22px;border:0;background:#C9A24A;color:#14100B;font:700 15px/1 Inter,system-ui,Arial,sans-serif;cursor:pointer;border-radius:3px}
.rk-case .fine{margin:0;font-size:14px;color:#B3A78F}
.rk-case button:focus-visible,.rk-nt button:focus-visible{outline:2px solid #C9A24A;outline-offset:2px}
@media(max-width:520px){.rk-case .scale{grid-template-columns:repeat(5,minmax(0,1fr))}}
@media(prefers-reduced-motion:reduce){.rk-nt .tx span{transition:none}}`;
export function nowThen(host, caseHost, { page, onJoin, auto = true }) {
  if (!host) return;
  const s = document.createElement('style'); s.textContent = NCSS; document.head.appendChild(s);
  host.classList.add('rk-nt'); host.dataset.st = 'now';
  host.innerHTML = `<p class="hint" id="${page}-nt-hint">Tap every line that is true this week. Then switch to week twelve and tap the one you want most.</p>
    <div class="sw" role="group" aria-label="Today or week twelve"><button type="button" data-st="now" aria-pressed="true">Today</button><button type="button" data-st="then" aria-pressed="false">Week twelve</button></div>
    <ul>${NT.map((r) => `<li data-k="${r.k}"><button type="button" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true">${r.i}</svg><b>${esc(r.n)}</b>
      <span class="tx"><span class="now"><em class="pl">${esc(r.n)} · </em>${esc(r.now)}</span><span class="then"><em class="pl">${esc(r.n)} · </em>${esc(r.then)}</span></span><span class="pill t">True this week</span><span class="pill w">Most wanted</span></button></li>`).join('')}</ul>
    <p class="tally" aria-live="polite"></p>`;
  const mine = new Set(); let want = '', ready = 0; const why = new Set(); let touched = false; let open = () => {};
  const tally = host.querySelector('.tally');
  const st = (v) => {
    host.dataset.st = v;
    host.querySelectorAll('.sw button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.st === v)));
    host.querySelectorAll('li').forEach((li) => li.querySelector('button').setAttribute('aria-pressed', String(v === 'now' ? mine.has(li.dataset.k) : want === li.dataset.k)));
    say();
  };
  const say = () => {
    tally.textContent = host.dataset.st === 'now'
      ? (mine.size ? `${mine.size} of 7 are true this week.` : '')
      : (want ? `Most wanted by week twelve: ${NT.find((r) => r.k === want).n.toLowerCase()}.` : 'Tap the one you want most.');
  };
  host.querySelector('.sw').addEventListener('click', (e) => { const b = e.target.closest('[data-st]'); if (b) { touched = true; st(b.dataset.st); count(page, 'ba_flip'); } });
  host.querySelector('ul').addEventListener('click', (e) => {
    const li = e.target.closest('li'); if (!li) return;
    touched = true; const k = li.dataset.k;
    if (host.dataset.st === 'now') { mine.has(k) ? mine.delete(k) : mine.add(k); li.toggleAttribute('data-true', mine.has(k)); }
    else { host.querySelectorAll('li').forEach((x) => x.removeAttribute('data-want')); want = want === k ? '' : k; if (want) li.setAttribute('data-want', ''); }
    count(page, 'ba_mark'); st(host.dataset.st); open();
  });
  // As before on road4: once seen, untouched, it turns to week twelve by itself.
  if (auto && !still() && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); setTimeout(() => { if (!touched) st('then'); }, 2200); } }, { threshold: .6 });
    io.observe(host);
  }
  // The founder's own case
  if (!caseHost) return;
  caseHost.classList.add('rk-case'); caseHost.hidden = true;
  open = () => { if (caseHost.hidden && (mine.size || want)) { caseHost.hidden = false; draw(); } };
  const draw = () => {
    const w = want ? NT.find((r) => r.k === want) : null;
    caseHost.innerHTML = `<p class="k">Your own case · no one else’s</p>
      <p class="q">How ready are you to change this, from 1 to 10?</p>
      <div class="scale" role="group" aria-label="How ready, 1 to 10">${Array.from({ length: 10 }, (_, i) => `<button type="button" data-r="${i + 1}" aria-pressed="${ready === i + 1}">${i + 1}</button>`).join('')}</div>
      <div class="ends" aria-hidden="true"><span>Not now</span><span>Tonight</span></div>
      ${ready ? `<p class="q">You said ${ready}${ready > 1 ? `, not ${ready - 1}` : ''}. Why not lower? Tap what is true.</p>
      <div class="chips" role="group" aria-label="Your reasons">${WHY.map((x, i) => `<button type="button" data-w="${i}" aria-pressed="${why.has(i)}">${esc(x)}</button>`).join('')}</div>` : ''}
      ${ready && why.size ? `<p class="say">${mine.size ? `${mine.size} of 7 are true for you this week. ` : ''}${w ? `The one you want most by week twelve is ${esc(w.n.toLowerCase())}: ${esc(w.then.charAt(0).toLowerCase() + w.then.slice(1))} ` : ''}You are at ${ready} out of 10, and your reasons are your own: ${[...why].map((i) => `“${esc(WHY[i])}.”`).join(' ')}</p>
      <p class="fine">Those are your reasons, not ours. Week one starts on them.</p>
      <button type="button" class="go" data-go>Start my free three weeks →</button>
      <p class="fine">No card. Your work stays yours. Stop any week.</p>` : ''}`;
    caseHost.querySelector('[data-go]')?.addEventListener('click', onJoin);
  };
  caseHost.addEventListener('click', (e) => {
    const r = e.target.closest('[data-r]'), w = e.target.closest('[data-w]');
    if (r) { ready = +r.dataset.r; count(page, 'ready'); }
    else if (w) { const i = +w.dataset.w; why.has(i) ? why.delete(i) : why.add(i); }
    else return;
    draw();
    if (ready && why.size) { let a = {}; try { a = JSON.parse(localStorage.getItem('ftb-arrival') || '{}') || {}; } catch { /* private mode */ } remember(page, { ...a, landing: page, mine: [...mine], want, ready, why: [...why].map((i) => WHY[i]) }); }
    (r ? caseHost.querySelector(`[data-r="${ready}"]`) : caseHost.querySelector(`[data-w="${w.dataset.w}"]`))?.focus({ preventScroll: true });
  });
}

/** The example of the four lines a founder reads back (level 01, S), as on road4. */
const FCSS = `.rk-fl{display:grid;gap:12px;background:#FFFCF4;color:#1C1309;border:1px solid #D6C9AC;padding:clamp(18px,3vw,26px);font-family:Inter,system-ui,Arial,sans-serif;max-width:760px}
.rk-fl .k{margin:0;font:700 11px/1.4 Inter,system-ui,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#6E5213}
.rk-fl .ex{margin:0;font-size:14.5px;color:#4A4033}
.rk-fl ol{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.rk-fl li{display:grid;gap:2px;padding-left:14px;border-left:3px solid #C9A24A;font:400 18px/1.45 Newsreader,Georgia,serif}
.rk-fl li small{font:700 11px/1.4 Inter,system-ui,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#6E5213}`;
export function fourLines(host) {
  if (!host) return;
  const s = document.createElement('style'); s.textContent = FCSS; document.head.appendChild(s);
  host.classList.add('rk-fl');
  host.innerHTML = `<p class="k">Example · the four lines you read back</p>
    <p class="ex">A founder taps “If I hit my numbers, then I’m worth something”, slides to <b>8</b>, and fills one sentence. This is what comes back, built only from those answers:</p>
    <ol><li><small>Admit it</small>Last month the rule “If I hit my numbers, then I’m worth something” ran your day most days.</li>
    <li><small>Don’t fight it</small>It was learned, so it can be tested. Don’t argue with it. Test it once, on purpose.</li>
    <li><small>Don’t ignore it</small>You named your rule in one sentence. That is the first lever, and you pulled it.</li>
    <li><small>Exactly</small>On Thursday you will take the evening off, phone in a drawer, and write what really happened.</li></ol>`;
}
