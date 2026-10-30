/* The profile circle and its menu: the founder's initials in gold, the same on
 * the Compass (/compass) and in the incubator (/start). Shown only when this
 * device holds an account. Name and step come from /api/state, kept on the
 * device so the circle draws at once on the next page.
 *
 * Menu: name and step, Your Ground Plan, Leadership Compass, Library, Ask
 * Alexandru, Password (full accounts only; simple accounts sign in by email
 * link), Sign out. Escape and a click outside close it. */
import * as A from '/account.js';

const ME_KEY = 'ftb-me';
export const STEPS = { free: 'The Founder Launchpad', session: 'The Boardroom', lab: 'The LAB', hub: 'The HUB', premium: 'The Summit' };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cached = () => { try { return JSON.parse(localStorage.getItem(ME_KEY) || 'null'); } catch { return null; } };
const keep = (me) => { try { localStorage.setItem(ME_KEY, JSON.stringify(me)); } catch { /* private mode */ } };

/** Two letters from the name: first and last word. */
export function initials(name) {
  const w = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!w.length) return '·';
  return ((w[0][0] || '') + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase();
}

/** The menu's links, for this founder. */
export function items(me) {
  const list = [
    ['/start/#home', 'Your Ground Plan', 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
    ['/compass/', 'Leadership Compass', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm3.5 5.5-2 5-5 2 2-5z'],
    ['/start/#library', 'Library', 'M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2zm0 0a2 2 0 0 1 2-2h12'],
    ['/start/#ask', 'Ask Alexandru', 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z'],
  ];
  if (!(me && me.signupType === 'simple' && !me.hasPassword)) list.push(['/start/#account', me && me.hasPassword ? 'Change my password' : 'Set my password', 'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3']);
  return list;
}

const STYLE = `.pm{position:relative;font-family:'Libre Franklin',Arial,sans-serif}
.pm.fixed{position:fixed;top:14px;right:16px;z-index:55}
.pm-b{width:44px;height:44px;border-radius:50%;border:1px solid #C9A24A;background:radial-gradient(circle at 35% 30%,#EDD592,#C49A3E 55%,#7C5B1C);color:#1C1309;font:600 15px/1 Fraunces,Georgia,serif;letter-spacing:.04em;cursor:pointer;box-shadow:0 0 0 3px rgba(201,162,74,.22),0 6px 16px -8px rgba(0,0,0,.6)}
.pm-b:focus-visible{outline:2px solid #C9A24A;outline-offset:3px}
.pm-m{position:absolute;right:0;top:54px;width:270px;background:#FFFDF8;color:#14100B;border:1px solid #D6C9AC;border-radius:14px;box-shadow:0 24px 50px -20px rgba(20,16,11,.55);padding:8px;display:none}
.pm.open .pm-m{display:block}
.pm-who{padding:10px 12px;border-bottom:1px solid #D6C9AC;margin-bottom:6px}
.pm-who b{display:block;font:500 17px/1.3 Fraunces,Georgia,serif}
.pm-who span{font-size:12px;color:#6E5213;font-weight:600;letter-spacing:.04em}
.pm-m a,.pm-m button.pm-i{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 12px;border:0;background:none;border-radius:10px;text-decoration:none;color:#14100B;font:500 14px 'Libre Franklin',Arial,sans-serif;cursor:pointer;text-align:left;box-sizing:border-box}
.pm-m a:hover,.pm-m button.pm-i:hover,.pm-m a:focus-visible,.pm-m button.pm-i:focus-visible{background:rgba(201,162,74,.16);outline:none}
.pm-m svg{width:18px;height:18px;flex:none;stroke:#6E5213;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.pm-sep{height:1px;background:#D6C9AC;margin:6px 4px}`;

function draw(root, me) {
  const name = (me && me.name) || '';
  const step = STEPS[(me && me.tier) || 'free'] || STEPS.free;
  root.innerHTML = `<button type="button" class="pm-b" aria-haspopup="menu" aria-expanded="false" aria-label="Your profile menu${name ? ', ' + esc(name) : ''}">${esc(initials(name))}</button>
    <div class="pm-m" role="menu" aria-label="Your profile">
      <div class="pm-who"><b>${esc(name || 'Your account')}</b><span>${esc(step)}</span></div>
      ${items(me).map(([href, label, d]) => `<a role="menuitem" href="${href}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>${esc(label)}</a>`).join('')}
      <div class="pm-sep" role="separator"></div>
      <button type="button" role="menuitem" class="pm-i" data-pm="out"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/></svg>Sign out</button>
    </div>`;
}

/** Put the circle in `host` (or fixed top-right when `fixed`). Does nothing
 *  without an account on this device. */
export async function mount(host, { fixed = false } = {}) {
  if (!host || !A.joined()) return;
  if (!document.getElementById('pm-style')) { const st = document.createElement('style'); st.id = 'pm-style'; st.textContent = STYLE; document.head.appendChild(st); }
  const root = document.createElement('div');
  root.className = 'pm' + (fixed ? ' fixed' : '');
  host.appendChild(root);
  draw(root, cached());
  const set = (open) => { root.classList.toggle('open', open); const b = root.querySelector('.pm-b'); if (b) b.setAttribute('aria-expanded', String(open)); };
  root.addEventListener('click', (e) => {
    const t = e.target.closest('button, a');
    if (!t) return;
    if (t.classList.contains('pm-b')) { e.stopPropagation(); set(!root.classList.contains('open')); return; }
    if (t.dataset.pm === 'out') { A.signOut(); try { localStorage.removeItem(ME_KEY); } catch { /* private mode */ } location.href = '/start/#signin'; return; }
    // A link to this same page: the page reads its #place on load.
    const u = new URL(t.href, location.href);
    if (u.pathname === location.pathname && u.hash) { e.preventDefault(); location.hash = u.hash; location.reload(); }
  });
  document.addEventListener('click', (e) => { if (!root.contains(e.target)) set(false); });
  root.addEventListener('keydown', (e) => { if (e.key === 'Escape') { set(false); const b = root.querySelector('.pm-b'); if (b) b.focus(); } });
  const r = await A.pull();
  if (r && r.me) { const me = { name: r.me.name, tier: r.me.tier, signupType: r.me.signupType, hasPassword: r.me.hasPassword }; keep(me); draw(root, me); }
}
