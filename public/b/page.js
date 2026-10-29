// "/" and "/b": the long Link to Lead page (sales page B, "Home"). Every
// call to action on it opens the FULL account form (with a password), so a
// founder who arrives here signs up here (landing "b") and is never sent to
// /compass/welcome. /b/index.html is the same page as /index.html.
//
// The What-if Lab (lab.js) loads as the visitor scrolls near it.
import { rememberUtm } from '/forms.js';

rememberUtm();
const gate = document.getElementById('gate');
let box = null;
const loadBox = () => box || (box = import('/compass/welcome/account-box.js').catch(() => { box = null; }));
function join(e) {
  if (e) e.preventDefault();
  const opener = e && e.currentTarget;
  gate.hidden = false;
  loadBox().then((m) => m && m.open({ gate, opener, stage: null, variant: 'full', landing: 'b' }));
}
document.querySelectorAll('[data-join]').forEach((a) => a.addEventListener('click', join));
if (location.hash === '#join') join();

const lab = document.getElementById('whatif-lab');
if (lab) {
  const engine = () => (window.CompassEngine ? Promise.resolve(window.CompassEngine) : new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = '/compass/engine.js'; s.onload = () => ok(window.CompassEngine); s.onerror = no; document.head.appendChild(s);
  }));
  const fill = () => Promise.all([engine(), import('/b/lab.js')]).then(([E, m]) => m.fill(lab, { E, openGate: join })).catch(() => {});
  try {
    const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { io.disconnect(); fill(); } }, { rootMargin: '900px 0px' });
    io.observe(lab);
  } catch { fill(); }
}
