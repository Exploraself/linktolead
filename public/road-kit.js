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
