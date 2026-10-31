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
