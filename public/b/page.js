// "/" and "/b": the long Link to Lead page (sales page B). Every link on it
// that would start the Compass sales road, and every "Start free", opens the
// SIMPLE account form instead, so a founder who arrives here signs up here
// (landing "b"). /b/index.html is the same page as /index.html.
import { rememberUtm } from '/forms.js';

rememberUtm();
const gate = document.getElementById('gate');
let box = null;
const loadBox = () => box || (box = import('/compass/welcome/account-box.js').catch(() => { box = null; }));
function join(e) {
  if (e) e.preventDefault();
  const opener = e && e.currentTarget;
  gate.hidden = false;
  loadBox().then((m) => m && m.open({ gate, opener, stage: null, variant: 'simple', landing: 'b' }));
}
document.querySelectorAll('[data-join], a[href="/compass/welcome"], a[href="/compass/welcome#join"]').forEach((a) => a.addEventListener('click', join));
if (location.hash === '#join') join();
