/* /toolkit/: the page for ads and links (2 Nov 2026). One offer, one button,
 * no links out. The button makes the free account, one field at a time
 * (/account-box.js, landing 'tools', so the founder is tagged TOOLS), and
 * lands on /tools/. An email that already has an account signs in here. A
 * founder already signed in on this device goes straight to /tools/. */
import { TOOLS } from '/tools/catalog.js';
import { cover } from '/tools/cover.js';
import { access } from '/tools/access.js';
import { rememberUtm } from '/forms.js';
import * as A from '/account.js';

rememberUtm();
document.getElementById('four').innerHTML = ['runway', 'bottleneck', 'off-switch', 'twelve-days'].map((id) => cover(TOOLS[id], { small: true })).join('');

const gate = document.getElementById('gate');
const HUB = '/tools/';
/** The toolkit as a "tool" for the sign-in panel. */
const KIT = { id: 'toolkit', name: 'your toolkit', open: { btn: 'Open my free toolkit', p: 'Every tool, the North Star and the Launchpad, with one free account.', fine: '' } };
let box = null, veil = null;

function closeVeil() { if (veil) { veil.remove(); veil = null; } }
/** Sign in, over the page; then the toolkit opens. */
function signin(email, taken = false) {
  closeVeil();
  veil = document.createElement('div');
  veil.className = 'veil';
  veil.innerHTML = '<div role="dialog" aria-modal="true" aria-label="Sign in" style="position:relative;width:100%;max-width:460px;margin:auto"><button type="button" class="vx" aria-label="Close">×</button><div class="acc-holder"></div></div>';
  document.body.appendChild(veil);
  veil.querySelector('.vx').addEventListener('click', closeVeil);
  let downOut = false;
  veil.addEventListener('pointerdown', (e) => { downOut = e.target === veil; });
  veil.addEventListener('click', (e) => { if (e.target === veil && downOut) closeVeil(); downOut = false; });
  access(veil.querySelector('.acc-holder'), { tool: KIT, auto: true, signin: { email, taken }, onOpen: () => { location.href = HUB; } });
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeVeil(); });

document.getElementById('join').addEventListener('click', (e) => {
  if (A.joined()) { location.href = HUB; return; }
  const opener = e.currentTarget;
  gate.hidden = false;
  (box || (box = import('/account-box.js'))).then((m) => m.open({ gate, opener, stage: null, variant: 'full', landing: 'tools', steps: true,
    cta: 'OPEN MY FREE TOOLKIT →', next: HUB, onDone: () => { location.href = HUB; },
    onExisting: (email) => signin(email, true), onSignin: (email) => signin(email) }))
    .catch(() => { box = null; gate.hidden = true; });
});
