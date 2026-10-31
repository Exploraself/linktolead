// "/road1/": Road 1, the long Link to Lead page. Every
// call to action on it opens the FULL account form (with a password), so a
// founder who arrives here signs up here (landing "road1") and is never sent
// to /north3/. / and /b redirect here, query string kept (functions/_landing.js).
//
// The What-if Lab (lab.js) loads as the visitor scrolls near it.
import { rememberUtm } from '/forms.js';

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
