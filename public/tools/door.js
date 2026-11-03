/* The signed-out profile menu on the toolkit pages (/tools/, /12-days/, every
 * tool) (Alexandru, 3 Nov 2026: "Sign in" and "Create my free account" did
 * nothing there). They open the sign-in, or the free account, one field at a
 * time (public/tools/gate.js), over the page. Once in, the menu becomes
 * theirs, the page carries on where it was, and one line says what the free
 * account opens: The Founder Launchpad in Base Camp, the library and every
 * free tool. Paying later needs nothing typed again: /pay/ knows them. */
import * as G from '/tools/gate.js';

const RM = matchMedia('(prefers-reduced-motion: reduce)');
let box = null, lastFocus = null;

function close() {
  if (!box) return;
  box.remove(); box = null;
  document.documentElement.classList.remove('tk-door-on');
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

/** "You're in": what the free account opens, with the way to Base Camp. */
function welcome(me) {
  const first = G.firstOf(me);
  const n = document.createElement('div');
  n.className = 'tk-in';
  n.setAttribute('role', 'status');
  n.innerHTML = `<p><b>You’re in${first ? `, ${first.replace(/[<>&"]/g, '')}` : ''}.</b> Your free account opens The Founder Launchpad in your Base Camp, the library and every free tool.</p>
    <a class="btn" href="/ground-plan/#home">Open my Base Camp <span aria-hidden="true">→</span></a>
    <button type="button" class="tk-in-x" aria-label="Close">×</button>`;
  n.querySelector('.tk-in-x').onclick = () => n.remove();
  document.body.appendChild(n);
}

export async function openDoor(start = 'signup') {
  if (box) return;
  lastFocus = document.activeElement;
  box = document.createElement('div');
  box.className = `tk-door${RM.matches ? '' : ' enter'}`;
  box.innerHTML = `<div class="tk-door-in" role="dialog" aria-modal="true" aria-label="${start === 'signin' ? 'Sign in' : 'Your free account'}">
      <button type="button" class="tk-door-x" aria-label="Close">×</button>
      <div class="body" id="tk-door-body"></div>
    </div>`;
  document.body.appendChild(box);
  document.documentElement.classList.add('tk-door-on');
  box.addEventListener('click', (e) => { if (e.target === box || e.target.closest('.tk-door-x')) close(); });
  box.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  const st = await G.state();
  if (st.kind === 'full') { close(); window.dispatchEvent(new Event('ftb:signedin')); return; }
  G.open(box.querySelector('#tk-door-body'), { name: 'my free account', path: location.pathname, st, needAccount: true, start,
    ready: (me) => { close(); window.dispatchEvent(new Event('ftb:signedin')); welcome(me); },
    cancel: close });
}

/** The menu's two buttons carry data-act (public/profile-menu.js drawGuest). */
export function mountDoor() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('#pmhost [data-act="signin-menu"], #pmhost [data-act="account"]');
    if (b) openDoor(b.dataset.act === 'signin-menu' ? 'signin' : 'signup');
  });
}
