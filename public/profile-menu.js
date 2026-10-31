/* The profile circle and its menu: the founder's initials in gold, the same on
 * the North Star (/northstar) and in the incubator (/ground-plan/). Shown only when this
 * device holds an account. Name and step come from /api/state, kept on the
 * device so the circle draws at once on the next page.
 *
 * Menu: name and step, the Leader’s North Star in its own highlighted row,
 * Your Base Camp, Library, Ask
 * Alexandru, Password (full accounts only; simple accounts sign in by email
 * link), "Letters from your mentor: On/Off" (consent, synced to Mailchimp),
 * Sign out, and "Delete my account" (two steps: a plain warning, then the
 * founder types their email). Escape and a click outside close it. */
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
    ['/ground-plan/#home', 'See your progress', 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
    ['/ground-plan/#library', 'Library', 'M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2zm0 0a2 2 0 0 1 2-2h12'],
    ['/ground-plan/#ask', 'Ask Alexandru', 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z'],
  ];
  if (!(me && me.signupType === 'simple' && !me.hasPassword)) list.push(['/ground-plan/#account', me && me.hasPassword ? 'Change my password' : 'Set my password', 'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3']);
  return list;
}

const STYLE = `.pm{position:relative;font-family:'Inter',Arial,sans-serif}
.pm.fixed{position:fixed;top:14px;right:16px;z-index:55}
.pm-b{width:44px;height:44px;border-radius:50%;border:1px solid #B4975F;background:radial-gradient(circle at 35% 30%,#E6D6AE,#A88B55 55%,#6E5A32);color:#1C1309;font:440 15px/1 Newsreader,Georgia,serif;letter-spacing:.04em;cursor:pointer;box-shadow:0 0 0 3px rgba(180,151,95,.22),0 6px 16px -8px rgba(0,0,0,.6)}
.pm-b:focus-visible{outline:2px solid #B4975F;outline-offset:3px}
.pm-b.pic{background-size:cover;background-position:center;color:transparent}
.pm-who{display:flex;align-items:center;gap:12px}
.pm-av{flex:none;width:52px;height:52px;border-radius:50%;border:1px solid #B4975F;background:radial-gradient(circle at 35% 30%,#E6D6AE,#A88B55 55%,#6E5A32);background-size:cover;background-position:center;display:inline-flex;align-items:center;justify-content:center;font:440 17px Newsreader,Georgia,serif;color:#1C1309}
.pm-who-t{min-width:0}
.pm-pic{display:flex;gap:10px;flex-wrap:wrap;padding:0 12px 6px}
.pm-pic button{border:0;background:none;padding:2px 0;font:520 12.5px 'Inter',Arial,sans-serif;color:#6E5213;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
:root[data-theme="dark"] .pm-pic button{color:#D6BF8F}
.pm-m{position:absolute;right:0;top:54px;width:min(290px,calc(100vw - 24px));max-height:calc(100vh - 90px);overflow:auto;z-index:60;background:#FFFDF8;color:#14100B;border:1px solid #D6C9AC;border-radius:14px;box-shadow:0 24px 50px -20px rgba(20,16,11,.55);padding:8px;display:none}
.pm.open .pm-m{display:block}
.pm-who{padding:10px 12px;border-bottom:1px solid #D6C9AC;margin-bottom:6px}
.pm-who b{display:block;font:440 17px/1.3 Newsreader,Georgia,serif}
.pm-who span{font-size:12px;color:#6E5213;font-weight:520;letter-spacing:.04em}
.pm-m a,.pm-m button.pm-i{display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:0 12px;border:0;background:none;border-radius:10px;text-decoration:none;color:#14100B;font:440 14px 'Inter',Arial,sans-serif;cursor:pointer;text-align:left;box-sizing:border-box}
.pm-m a:hover,.pm-m button.pm-i:hover,.pm-m a:focus-visible,.pm-m button.pm-i:focus-visible{background:rgba(180,151,95,.16);outline:none}
.pm-m svg{width:18px;height:18px;flex:none;stroke:#6E5213;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.pm-sep{height:1px;background:#D6C9AC;margin:6px 4px}
.pm-m a.pm-compass{min-height:56px;margin:4px 0 8px;padding:8px 12px;border-radius:12px;background:linear-gradient(120deg,#1C1309,#2B1B12);color:#F7F2E7;border:1px solid rgba(180,151,95,.6)}
.pm-m a.pm-compass:hover,.pm-m a.pm-compass:focus-visible{background:linear-gradient(120deg,#2B1B12,#3A2618)}
.pm-m a.pm-compass svg{width:24px;height:24px;stroke:#D6BF8F;color:#D6BF8F}
.pm-compass b{display:block;font:440 15px/1.25 Newsreader,Georgia,serif}.pm-compass small{display:block;font-size:11.5px;color:#D3C4A5}
.pm-sw{margin-left:auto;display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:520;color:#6E5213}
.pm-sw i{position:relative;width:34px;height:20px;border-radius:999px;background:#D6C9AC;transition:background .2s}
.pm-sw i::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#FFFDF8;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform .2s}
[aria-checked="true"] .pm-sw i{background:#B4975F}[aria-checked="true"] .pm-sw i::after{transform:translateX(14px)}
.pm-m .pm-del{color:#8E2F1F}.pm-m .pm-del svg{stroke:#8E2F1F}
.pm-look{display:flex;align-items:center;gap:4px;padding:4px 8px 4px 12px;font-size:14px;font-weight:440}
.pm-look span{margin-right:auto}
.pm-look button{min-height:34px;padding:0 10px;border-radius:999px;border:1px solid #D6C9AC;background:transparent;color:inherit;font:520 12px 'Inter',Arial,sans-serif;cursor:pointer}
.pm-look button[aria-pressed="true"]{background:#B4975F;border-color:#B4975F;color:#14100B}
:root[data-theme="dark"] .pm-look button{border-color:#3A2E1F}
.pm-note{margin:2px 12px 6px;font-size:11.5px;line-height:1.45;color:#5F5648}
:root[data-theme="dark"] .pm-m{background:#1C150E;color:#F1E8D6;border-color:#3A2E1F}
:root[data-theme="dark"] .pm-m a,:root[data-theme="dark"] .pm-m button.pm-i{color:#F1E8D6}
:root[data-theme="dark"] .pm-who,:root[data-theme="dark"] .pm-sep{border-color:#3A2E1F;background-color:transparent}
:root[data-theme="dark"] .pm-sep{background:#3A2E1F}
:root[data-theme="dark"] .pm-who span,:root[data-theme="dark"] .pm-sw{color:#D6BF8F}
:root[data-theme="dark"] .pm-m svg{stroke:#D6BF8F}
:root[data-theme="dark"] .pm-note{color:#BDB094}
:root[data-theme="dark"] .pm-m .pm-del{color:#F0A08E}:root[data-theme="dark"] .pm-m .pm-del svg{stroke:#F0A08E}
.pm-dlg{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(12,9,6,.62)}
.pm-box{width:100%;max-width:440px;background:#FFFDF8;color:#14100B;border-radius:16px;border:1px solid #D6C9AC;padding:26px 24px;box-shadow:0 30px 70px -20px rgba(0,0,0,.7);font-family:'Inter',Arial,sans-serif}
.pm-box h2{margin:0 0 10px;font:440 24px/1.2 Newsreader,Georgia,serif}
.pm-box p{margin:0 0 12px;font-size:14.5px;line-height:1.6;color:#4A3F33}
.pm-box ul{margin:0 0 14px;padding-left:18px;font-size:14px;line-height:1.6;color:#4A3F33}
.pm-box label{display:grid;gap:6px;font-size:13px;font-weight:520;margin-bottom:14px}
.pm-box input{font:inherit;font-size:16px;min-height:46px;padding:0 12px;border:1px solid #D6C9AC;border-radius:8px;background:#fff;color:#14100B}
.pm-acts{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}
.pm-acts button{min-height:46px;padding:0 18px;border-radius:999px;font:520 14px 'Inter',Arial,sans-serif;cursor:pointer;border:1px solid #D6C9AC;background:transparent;color:#14100B}
.pm-acts .pm-danger{background:#8E2F1F;border-color:#8E2F1F;color:#FFF7EE}
.pm-acts .pm-danger:disabled{opacity:.5;cursor:not-allowed}
.pm-err{min-height:1.4em;font-size:13px;color:#8E2F1F}
:root[data-theme="dark"] .pm-box{background:#1C150E;color:#F1E8D6;border-color:#3A2E1F}
:root[data-theme="dark"] .pm-box p,:root[data-theme="dark"] .pm-box ul{color:#CFC3AA}
:root[data-theme="dark"] .pm-box input{background:#0E0A06;color:#F1E8D6;border-color:#3A2E1F}
:root[data-theme="dark"] .pm-acts button{color:#F1E8D6;border-color:#3A2E1F}
:root[data-theme="dark"] .pm-err{color:#F0A08E}`;

/** 'true' or 'false' for the switch. Unknown (an old cached record) is on,
 *  because every account starts with letters. */
const themePick = () => { try { return window.ESTheme ? window.ESTheme.pick() : 'device'; } catch { return 'device'; } };
const letterState = (me) => String(!(me && me.letters === false));
let lettersNote = '';

/** "Delete my account": step one says plainly what goes, step two asks for
 *  the email. Nothing is deleted before the second button. */
function deleteDialog(me) {
  const d = document.createElement('div');
  d.className = 'pm-dlg';
  d.innerHTML = `<div class="pm-box" role="dialog" aria-modal="true" aria-labelledby="pm-dh">
    <h2 id="pm-dh">Delete your account?</h2>
    <p>This removes everything kept for you, for good:</p>
    <ul><li>your answers and worksheets in every level</li><li>your North Star, your plans and your questions to your mentor</li><li>your letters and your library</li></ul>
    <p>You will stop getting letters. Nothing you paid for is refunded by this. If you only want fewer emails, turn off <b>Letters from your mentor</b> instead.</p>
    <div class="pm-acts"><button type="button" data-d="keep">Keep my account</button><button type="button" class="pm-danger" data-d="next">Continue</button></div>
  </div>`;
  const close = () => { d.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  d.addEventListener('click', async (e) => {
    if (e.target === d) { close(); return; }
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.d === 'keep') { close(); return; }
    if (b.dataset.d === 'next') {
      d.querySelector('.pm-box').innerHTML = `<h2 id="pm-dh">One last step</h2>
        <p>Type the email you signed up with. Then the account and everything in it is deleted.</p>
        <label>Your email<input type="email" id="pm-dconfirm" autocomplete="off" inputmode="email"></label>
        <p class="pm-err" id="pm-derr" role="alert"></p>
        <div class="pm-acts"><button type="button" data-d="keep">Keep my account</button><button type="button" class="pm-danger" data-d="go" disabled>Delete my account for good</button></div>`;
      const inp = d.querySelector('#pm-dconfirm'), go = d.querySelector('[data-d="go"]');
      inp.addEventListener('input', () => { go.disabled = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value.trim()); });
      inp.focus();
      return;
    }
    if (b.dataset.d === 'go') {
      const err = d.querySelector('#pm-derr'), inp = d.querySelector('#pm-dconfirm');
      b.disabled = true; b.textContent = 'Deleting…';
      try {
        await A.deleteAccount(inp.value.trim());
        try { localStorage.removeItem(ME_KEY); } catch { /* private mode */ }
        d.querySelector('.pm-box').innerHTML = '<h2 id="pm-dh">Your account is deleted</h2><p>Everything we kept for you is gone. Thank you for the time you gave your business here. The door stays open whenever you want to come back.</p><div class="pm-acts"><button type="button" class="pm-danger" data-d="home">Close</button></div>';
      } catch (ex) { err.textContent = (ex && ex.message) || 'It did not go through. Try again in a minute.'; b.disabled = false; b.textContent = 'Delete my account for good'; }
      return;
    }
    if (b.dataset.d === 'home') { location.href = '/road1/'; }
  });
  document.body.appendChild(d);
  const first = d.querySelector('[data-d="keep"]'); if (first) first.focus();
}

/** A photo cut to a square and shrunk to 192 px, as a JPEG data: URL. */
async function squarePhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = url; });
    const side = Math.min(img.naturalWidth, img.naturalHeight), c = document.createElement('canvas');
    c.width = 192; c.height = 192;
    c.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, 192, 192);
    return c.toDataURL('image/jpeg', 0.85);
  } finally { URL.revokeObjectURL(url); }
}
const picStyle = (me) => (me && me.avatar && /^data:image\//.test(me.avatar) ? ` style="background-image:url('${me.avatar}')"` : '');
let picNote = '';

function draw(root, me) {
  const name = (me && me.name) || '';
  const step = STEPS[(me && me.tier) || 'free'] || STEPS.free;
  const pic = !!(me && me.avatar);
  root.innerHTML = `<button type="button" class="pm-b${pic ? ' pic' : ''}"${picStyle(me)} aria-haspopup="menu" aria-expanded="false" aria-label="Your profile menu${name ? ', ' + esc(name) : ''}">${esc(initials(name))}</button>
    <div class="pm-m" role="menu" aria-label="Your profile">
      <div class="pm-who"><span class="pm-av"${picStyle(me)}>${pic ? '' : esc(initials(name))}</span><span class="pm-who-t"><b>${esc(name || 'Your account')}</b><span>Your step: ${esc(step)}</span></span></div>
      <div class="pm-pic"><button type="button" data-pm="pic">${pic ? 'Change my photo' : 'Add a profile photo'}</button>${pic ? '<button type="button" data-pm="nopic">Remove</button>' : ''}<input type="file" accept="image/*" data-pm-file hidden></div>
      ${picNote ? `<p class="pm-note" role="status">${esc(picNote)}</p>` : ''}
      <a role="menuitem" class="pm-compass" href="/northstar/"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 5.5l2 6.5-2 1.2-2-1.2z" fill="currentColor" stroke="none"/><path d="M12 18.5l2-6.5-2-1.2-2 1.2z"/></svg><span><b>Leader’s North Star</b><small>Your direction in all four domains</small></span></a>
      ${items(me).map(([href, label, d]) => `<a role="menuitem" href="${href}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>${esc(label)}</a>`).join('')}
      <div class="pm-sep" role="separator"></div>
      <div class="pm-look" role="group" aria-label="Light and dark"><span>Light</span>${[['device', 'Device'], ['light', 'Light'], ['dark', 'Dark']].map(([k, n]) => `<button type="button" data-theme-set="${k}" aria-pressed="${themePick() === k}">${n}</button>`).join('')}</div>
      ${typeof document !== 'undefined' && document.querySelector('[data-act="ws"]') ? '<button type="button" role="menuitem" class="pm-i" data-pm="ws"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>Make it yours</button>' : ''}
      <button type="button" role="menuitemcheckbox" class="pm-i" data-pm="letters" aria-checked="${letterState(me)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3zM3 7l9 6 9-6"/></svg>Letters from your mentor<span class="pm-sw"><span>${letterState(me) === 'true' ? 'On' : 'Off'}</span><i></i></span></button>
      <p class="pm-note" id="pm-lnote" role="status">${esc(lettersNote)}</p>
      <div class="pm-sep" role="separator"></div>
      <button type="button" role="menuitem" class="pm-i" data-pm="out"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/></svg>Sign out</button>
      <button type="button" role="menuitem" class="pm-i pm-del" data-pm="delete"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>Delete my account</button>
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
  const set = (open) => {
    root.classList.toggle('open', open); const b = root.querySelector('.pm-b'); if (b) b.setAttribute('aria-expanded', String(open));
    // Always inside the screen (31 Oct): on a phone the menu is a sheet just
    // under the circle, the width of the screen; elsewhere it never runs off.
    const m = root.querySelector('.pm-m'), b2 = root.querySelector('.pm-b');
    if (open && m) {
      Object.assign(m.style, { position: '', left: '', right: '', top: '', width: '', maxHeight: '' });
      if (window.innerWidth < 600 && b2) {
        const top = Math.round(b2.getBoundingClientRect().bottom + 8);
        Object.assign(m.style, { position: 'fixed', left: '10px', right: '10px', top: top + 'px', width: 'auto', maxHeight: `calc(100vh - ${top + 96}px)` });
      } else {
        const r = m.getBoundingClientRect();
        if (r.left < 8) { m.style.right = 'auto'; m.style.left = '0'; }
        else if (r.right > window.innerWidth - 8) { m.style.right = '0'; m.style.left = 'auto'; }
      }
    }
  };
  root.addEventListener('click', (e) => {
    const t = e.target.closest('button, a');
    if (!t) return;
    if (t.classList.contains('pm-b')) { e.stopPropagation(); set(!root.classList.contains('open')); return; }
    if (t.dataset.pm === 'letters') {
      e.stopPropagation();
      const me = cached() || {}, on = letterState(me) !== 'true';
      const was = me.letters;
      me.letters = on; keep(me); lettersNote = on ? 'On. Letters come by email again.' : 'Off. You won’t get letters, only the emails you ask for (sign-in links).'; draw(root, me); root.classList.add('open');
      A.setLetters(on).catch(() => { me.letters = was; keep(me); lettersNote = 'That did not save. Try again in a minute.'; draw(root, me); root.classList.add('open'); });
      const again = root.querySelector('[data-pm="letters"]'); if (again) again.focus();
      return;
    }
    if (t.dataset.pm === 'pic') { e.stopPropagation(); const f = root.querySelector('[data-pm-file]'); if (f) f.click(); return; }
    if (t.dataset.pm === 'nopic') {
      e.stopPropagation();
      const me = cached() || {}, was = me.avatar; me.avatar = ''; keep(me); picNote = 'Photo removed.'; draw(root, me); set(true);
      A.setAvatar('').catch(() => { me.avatar = was; keep(me); picNote = 'That did not save. Try again in a minute.'; draw(root, me); set(true); });
      return;
    }
    if (t.hasAttribute('data-theme-set')) { e.stopPropagation(); if (window.ESTheme) window.ESTheme.set(t.getAttribute('data-theme-set')); return; }
    if (t.dataset.pm === 'ws') { root.classList.remove('open'); const w = document.querySelector('[data-act="ws"]'); if (w) w.click(); return; }
    if (t.dataset.pm === 'delete') { root.classList.remove('open'); deleteDialog(cached()); return; }
    if (t.dataset.pm === 'out') { A.signOut(); try { localStorage.removeItem(ME_KEY); } catch { /* private mode */ } location.href = '/ground-plan/?out=1#signin'; return; }
    // A link to this same page: the page reads its #place on load.
    const u = new URL(t.href, location.href);
    if (u.pathname === location.pathname && u.hash) { e.preventDefault(); location.hash = u.hash; location.reload(); }
  });
  document.addEventListener('click', (e) => { if (!root.contains(e.target)) set(false); });
  // A new photo: cut, shrunk, shown at once, then saved to the account.
  root.addEventListener('change', async (e) => {
    const f = e.target.closest && e.target.closest('[data-pm-file]'); if (!f || !f.files || !f.files[0]) return;
    const me = cached() || {}, was = me.avatar;
    try { me.avatar = await squarePhoto(f.files[0]); } catch { picNote = 'That file is not a photo we can read. Try a JPEG or PNG.'; draw(root, me); set(true); return; }
    keep(me); picNote = 'Saving your photo…'; draw(root, me); set(true);
    try { await A.setAvatar(me.avatar); picNote = 'Your photo is saved.'; } catch (ex) { me.avatar = was; keep(me); picNote = (ex && ex.message) || 'That did not save. Try again in a minute.'; }
    draw(root, me); set(true);
  });
  root.addEventListener('keydown', (e) => { if (e.key === 'Escape') { set(false); const b = root.querySelector('.pm-b'); if (b) b.focus(); } });
  const r = await A.pull();
  if (r && r.me) { const me = { name: r.me.name, tier: r.me.tier, signupType: r.me.signupType, hasPassword: r.me.hasPassword, letters: r.me.letters, avatar: r.me.avatar || '' }; keep(me); draw(root, me); }
}
