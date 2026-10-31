/* The password reset, in its own box (31 Oct 2026). One module for Your Base
 * Camp, the North Star and the sign-up box, so it works the same everywhere.
 *
 *   openReset({ email, mode })  "Forgot your password?" (mode 'reset', the
 *       default) or "No password? Email me a sign-in link" (mode 'link'). One
 *       field, the email. Then a clear "Check your email" screen: the address,
 *       how long the link lasts, buttons to open Gmail or Outlook, a resend with
 *       a short wait, and "use a different email".
 *   openNewPassword({ save, done })  Arriving from the reset email: choose the
 *       new password. Two fields, each with show and copy; live ticks for
 *       "10 characters" and "both match"; then "Your new password is saved".
 *
 * The box closes with its ×, Escape, or a click that starts AND ends outside
 * it, never because a drag or a text selection ended outside. Nothing here
 * says whether an address has an account: the answer is the same either way. */

import { INTERESTS, INDUSTRIES } from '/forms.js';

const OK_EMAIL = /^[^@\s]+@[^@\s.]+\.[^@\s]+$/;
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const EYE = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const COPY = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
const MAIL = '<svg width="54" height="54" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="31" fill="#F3EBDA"/><rect x="14" y="20" width="36" height="25" rx="4" fill="none" stroke="#7A5E26" stroke-width="2.4"/><path d="M15 22l17 13 17-13" fill="none" stroke="#7A5E26" stroke-width="2.4" stroke-linejoin="round"/><circle cx="47" cy="44" r="9" fill="#4C7355"/><path d="M43 44l3 3 5-6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const TICK = '<svg width="54" height="54" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="31" fill="#E3ECE4"/><path d="M20 33l8 8 16-18" fill="none" stroke="#4C7355" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const STYLE = `.rbx-veil{position:fixed;inset:0;z-index:120;background:rgba(14,20,32,.62);display:flex;align-items:center;justify-content:center;padding:20px 16px;overflow-y:auto;font-family:Inter,Arial,sans-serif;animation:rbxIn .2s ease both}
.rbx{position:relative;width:100%;max-width:440px;margin:auto;background:#FFFDF8;color:#121C2D;border-radius:14px;padding:30px 28px 24px;box-shadow:0 30px 70px rgba(0,0,0,.4);display:flex;flex-direction:column;gap:14px;box-sizing:border-box;animation:rbxUp .25s ease both}
.rbx *{box-sizing:border-box}
.rbx-x{position:absolute;top:12px;right:12px;width:44px;height:44px;border-radius:50%;border:1px solid #D8CDBB;background:#fff;color:#121C2D;cursor:pointer;font-size:20px;line-height:1}
.rbx-k{font-size:12px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#7A5E26;padding-right:44px}
.rbx h2{margin:0;font:440 27px/1.2 Newsreader,Georgia,serif;padding-right:36px}
.rbx p{margin:0;font-size:14.5px;line-height:1.55;color:#3D4966}
.rbx label{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:600;color:#121C2D}
.rbx .inp{min-height:48px;border:1px solid #D8CDBB;border-radius:6px;padding:0 12px;font:16px Inter,Arial,sans-serif;color:#121C2D;background:#fff;width:100%}
.rbx .inp:focus-visible,.rbx button:focus-visible,.rbx a:focus-visible{outline:2px solid #B4975F;outline-offset:2px}
.rbx-pw{display:flex;gap:6px}.rbx-pw .inp{flex:1;min-width:0}
.rbx-ic{flex:none;width:46px;min-height:48px;border:1px solid #D8CDBB;border-radius:6px;background:#fff;color:#121C2D;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0;font-size:11px;font-weight:600}
.rbx-ic[aria-pressed="true"]{background:#F3EBDA}
.rbx-go{min-height:52px;border:0;border-radius:6px;background:#B4975F;color:#14100B;font:600 15px Inter,Arial,sans-serif;letter-spacing:.03em;cursor:pointer;width:100%}
.rbx-go:hover{background:#D6BF8F}.rbx-go:disabled{opacity:.55;cursor:not-allowed}
.rbx-ghost{min-height:46px;border:1px solid #D8CDBB;border-radius:6px;background:transparent;color:#121C2D;font:600 14px Inter,Arial,sans-serif;cursor:pointer;width:100%}
.rbx-link{border:0;background:none;padding:6px 0;color:#7A5E26;font:600 13.5px Inter,Arial,sans-serif;text-decoration:underline;text-underline-offset:4px;cursor:pointer;align-self:center}
.rbx-err{display:none;padding:10px 12px;border-radius:6px;background:#FBE9E2;color:#9A3B1C;font-size:14px;font-weight:600;line-height:1.45}
.rbx-err.on{display:block}
.rbx-icon{align-self:center}
.rbx-done{text-align:center;align-items:center}
.rbx-done h2{padding-right:0}
.rbx-addr{display:inline-block;margin-top:2px;padding:4px 10px;border-radius:999px;background:#F3EBDA;color:#121C2D;font-weight:600;font-size:14px;word-break:break-all}
.rbx-mail{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}
.rbx-mail a{min-height:46px;border:1px solid #D8CDBB;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;gap:8px;color:#121C2D;font-weight:600;font-size:14px;text-decoration:none;background:#fff}
.rbx-tip{font-size:13px !important;color:#5A6580 !important}
.rbx-checks{list-style:none;margin:-4px 0 0;padding:0;display:flex;flex-direction:column;gap:4px;font-size:13px;color:#5A6580}
.rbx-checks li::before{content:"○";display:inline-block;width:18px;color:#A9A08C}
.rbx-checks li.ok{color:#35593D;font-weight:600}.rbx-checks li.ok::before{content:"✓";color:#4C7355}
@keyframes rbxIn{from{opacity:0}}@keyframes rbxUp{from{opacity:0;transform:translateY(14px)}}
@media(prefers-reduced-motion:reduce){.rbx-veil,.rbx{animation:none}}
:root[data-theme="dark"] .rbx{background:#141E36;color:#E9ECF3;color-scheme:dark}
:root[data-theme="dark"] .rbx h2,:root[data-theme="dark"] .rbx label{color:#E9ECF3}
:root[data-theme="dark"] .rbx p,:root[data-theme="dark"] .rbx-checks{color:#B9C1D3}
:root[data-theme="dark"] .rbx-k,:root[data-theme="dark"] .rbx-link{color:#D6BF8F}
:root[data-theme="dark"] .rbx .inp,:root[data-theme="dark"] .rbx-ic,:root[data-theme="dark"] .rbx-x,:root[data-theme="dark"] .rbx-mail a{background:#0F1830;color:#E9ECF3;border-color:#3A4A6E}
:root[data-theme="dark"] .rbx-ghost{color:#E9ECF3;border-color:#3A4A6E}
:root[data-theme="dark"] .rbx-addr{background:#24304C;color:#E9ECF3}
:root[data-theme="dark"] .rbx-err{background:#3A2220;color:#F0A27E}
:root[data-theme="dark"] .rbx-checks li.ok{color:#9BC0A1}`;

let veil = null, lastFocus = null;
function shell(html) {
  close();
  lastFocus = document.activeElement;
  if (!document.getElementById('rbx-style')) { const s = document.createElement('style'); s.id = 'rbx-style'; s.textContent = STYLE; document.head.appendChild(s); }
  veil = document.createElement('div');
  veil.className = 'rbx-veil';
  veil.innerHTML = `<div class="rbx" role="dialog" aria-modal="true" aria-labelledby="rbx-h"><button type="button" class="rbx-x" data-rbx="close" aria-label="Close">×</button><div class="rbx-in" style="display:flex;flex-direction:column;gap:14px">${html}</div></div>`;
  document.body.appendChild(veil);
  // Closes only when the press starts and ends outside the box.
  let downOut = false;
  veil.addEventListener('pointerdown', (e) => { downOut = e.target === veil; });
  veil.addEventListener('click', (e) => { if (e.target === veil && downOut) close(); downOut = false; });
  veil.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
  veil.addEventListener('click', (e) => {
    const b = e.target.closest('[data-rbx]'); if (!b) return;
    const k = b.dataset.rbx;
    if (k === 'close') close();
    else if (k === 'eye') { const f = veil.querySelector('#' + b.dataset.for), show = f.type === 'password'; f.type = show ? 'text' : 'password'; b.setAttribute('aria-pressed', String(show)); b.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); }
    else if (k === 'copy') copy(veil.querySelector('#' + b.dataset.for), b);
  });
  return veil.querySelector('.rbx-in');
}
export function close() { if (veil) { veil.remove(); veil = null; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); } }
const put = (inner, html) => { inner.innerHTML = html; const f = inner.querySelector('input, .rbx-go'); if (f) f.focus({ preventScroll: true }); };
const say = (inner, msg) => { const e = inner.querySelector('.rbx-err'); if (e) { e.textContent = msg || ''; e.classList.toggle('on', !!msg); } };
/** A message the founder can act on. Preview copies have no accounts. */
function plain(ex, fallback) {
  const m = ex && ex.message && !/fetch|network|load failed|import/i.test(ex.message) ? ex.message : fallback;
  if (/not available|not configured|not switched on/i.test(m) && /pages\.dev$/.test(location.hostname)) return 'This is a preview copy of the site, so accounts are switched off here. On linktolead.exploraself.com it works.';
  return m;
}
async function copy(field, btn) {
  if (!field || !field.value) return;
  let ok = false;
  try { await navigator.clipboard.writeText(field.value); ok = true; } catch {
    try { const t = field.type; field.type = 'text'; field.select(); ok = document.execCommand('copy'); field.type = t; field.setSelectionRange(field.value.length, field.value.length); } catch { ok = false; }
  }
  btn.textContent = ok ? 'Copied' : '—';
  setTimeout(() => { btn.innerHTML = COPY; }, 1400);
}
const pw = (id, label) => `<label>${label}<span class="rbx-pw"><input class="inp" id="${id}" type="password" autocomplete="new-password" minlength="10" maxlength="200"><button type="button" class="rbx-ic" data-rbx="eye" data-for="${id}" aria-pressed="false" aria-label="Show password">${EYE}</button><button type="button" class="rbx-ic" data-rbx="copy" data-for="${id}" aria-label="Copy the password">${COPY}</button></span></label>`;
/* Quick links to the two inboxes most founders use. */
const inboxes = (email) => {
  const d = String(email).split('@')[1] || '';
  const g = /gmail|googlemail/.test(d), o = /outlook|hotmail|live|msn/.test(d);
  const G = '<a href="https://mail.google.com/mail/u/0/#search/exploraself" target="_blank" rel="noopener">Open Gmail ↗</a>', O = '<a href="https://outlook.live.com/mail/" target="_blank" rel="noopener">Open Outlook ↗</a>';
  return `<div class="rbx-mail">${g ? G + O : o ? O + G : G + O}</div>`;
};

/** "Forgot your password?" / "No password? Email me a sign-in link". */
export function openReset({ email = '', mode = 'reset' } = {}) {
  const reset = mode !== 'link';
  const inner = shell('');
  const ask = (value) => {
    put(inner, `<span class="rbx-k">${reset ? 'Forgot your password?' : 'No password?'}</span>
      <h2 id="rbx-h">${reset ? 'Reset it in a minute.' : 'Sign in with a link.'}</h2>
      <p>${reset ? 'Type the email you signed up with. We send you a link: it signs you in and opens a box to choose a new password.' : 'Type the email you signed up with. We send you a link that signs you in on this device.'} It works for 30 minutes.</p>
      <form class="rbx-form" novalidate style="display:flex;flex-direction:column;gap:12px">
        <label>Email<input class="inp" id="rbx-email" type="email" autocomplete="email" inputmode="email" maxlength="120" value="${esc(value)}"></label>
        <div class="rbx-err" role="alert"></div>
        <button type="submit" class="rbx-go">${reset ? 'Email me a reset link' : 'Email me a sign-in link'}</button>
      </form>
      <button type="button" class="rbx-link" data-rbx="close">Back to sign in</button>`);
    const f = inner.querySelector('#rbx-email'); if (f && value) f.select();
    inner.querySelector('.rbx-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const to = inner.querySelector('#rbx-email').value.trim();
      if (!OK_EMAIL.test(to)) return say(inner, 'That email does not look complete. Check it and try again.');
      const go = inner.querySelector('.rbx-go'); go.disabled = true; go.textContent = 'Sending…'; say(inner, '');
      try { const A = await import('/account.js'); await A.signinLink(to, 'start', reset); sent(to); }
      catch (ex) { say(inner, plain(ex, 'We could not send it just now. Try again in a minute.')); go.disabled = false; go.textContent = reset ? 'Email me a reset link' : 'Email me a sign-in link'; }
    });
  };
  const sent = (to) => {
    put(inner, `<div class="rbx-done" style="display:flex;flex-direction:column;gap:12px">
        <span class="rbx-icon">${MAIL}</span>
        <h2 id="rbx-h">Check your email</h2>
        <p>If there is an account for<br><span class="rbx-addr">${esc(to)}</span><br>a ${reset ? 'reset' : 'sign-in'} link is on its way. It works for the next 30 minutes.</p>
        ${inboxes(to)}
        <p class="rbx-tip">Not there in two minutes? Look in Spam or Promotions.</p>
        <div class="rbx-err" role="alert"></div>
        <button type="button" class="rbx-ghost" id="rbx-again" disabled>Send it again in 30 s</button>
        <button type="button" class="rbx-link" id="rbx-other">Use a different email</button>
        <button type="button" class="rbx-go" data-rbx="close">Done</button></div>`);
    const again = inner.querySelector('#rbx-again');
    let n = 30; const tick = setInterval(() => { n--; if (!veil || !again.isConnected) return clearInterval(tick); if (n <= 0) { clearInterval(tick); again.disabled = false; again.textContent = 'Send it again'; } else again.textContent = `Send it again in ${n} s`; }, 1000);
    again.addEventListener('click', async () => {
      again.disabled = true; again.textContent = 'Sending…';
      try { const A = await import('/account.js'); await A.signinLink(to, 'start', reset); sent(to); }
      catch (ex) { say(inner, plain(ex, 'We could not send it just now. Try again in a minute.')); again.disabled = false; again.textContent = 'Send it again'; }
    });
    inner.querySelector('#rbx-other').addEventListener('click', () => ask(''));
  };
  ask(email);
}

/** From the reset email: choose the new password. save(a, c) returns a
 *  promise; done() runs after the founder closes the success screen. */
export function openNewPassword({ save, done = null, email = '' } = {}) {
  const inner = shell('');
  put(inner, `<span class="rbx-k">Reset your password</span>
    <h2 id="rbx-h">Choose a new password.</h2>
    <p>${email ? `For <b>${esc(email)}</b>. ` : ''}You are already signed in on this device. Use the eye to see what you typed, and copy to keep it somewhere safe.</p>
    <form class="rbx-form" novalidate style="display:flex;flex-direction:column;gap:12px">
      ${pw('rbx-pw1', 'New password')}${pw('rbx-pw2', 'Type it again')}
      <ul class="rbx-checks" aria-live="polite"><li id="rbx-c1">At least 10 characters</li><li id="rbx-c2">Both passwords match</li></ul>
      <div class="rbx-err" role="alert"></div>
      <button type="submit" class="rbx-go" disabled>Save my new password</button>
    </form>`);
  const a = inner.querySelector('#rbx-pw1'), c = inner.querySelector('#rbx-pw2'), go = inner.querySelector('.rbx-go');
  const check = () => {
    const long = a.value.length >= 10, same = long && a.value === c.value;
    inner.querySelector('#rbx-c1').classList.toggle('ok', long); inner.querySelector('#rbx-c2').classList.toggle('ok', same);
    go.disabled = !same;
  };
  a.addEventListener('input', check); c.addEventListener('input', check);
  inner.querySelector('.rbx-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (a.value.length < 10) return say(inner, 'At least 10 characters, please.');
    if (a.value !== c.value) return say(inner, 'The two passwords are different.');
    go.disabled = true; go.textContent = 'Saving…'; say(inner, '');
    try {
      await save(a.value, c.value);
      put(inner, `<div class="rbx-done" style="display:flex;flex-direction:column;gap:12px">
        <span class="rbx-icon">${TICK}</span>
        <h2 id="rbx-h">Your new password is saved.</h2>
        <p>You are signed in on this device. Next time, sign in with your email and this password.</p>
        <button type="button" class="rbx-go" data-rbx="close">Continue</button></div>`);
      if (done) { const b = inner.querySelector('.rbx-go'); b.addEventListener('click', () => setTimeout(done, 0)); }
    } catch (ex) { say(inner, plain(ex, 'It did not save. Try again in a minute.')); go.disabled = false; go.textContent = 'Save my new password'; }
  });
}

/** The first time a founder opens the other door (31 Oct): "Is this you?",
 *  name and email to confirm, then everything is ready. to = 'blueprint' or
 *  'northstar'. Saving goes through /api/cross (an event and a Mailchimp tag);
 *  if it fails, the founder still goes on. */
export function openConfirm({ to = 'blueprint', first = '', last = '', email = '', done = null } = {}) {
  // One tap (Alexandru, 31 Oct): no name or email to type again. A plain
  // question; "Yes" records the crossing (tag linktolead-crossed-blueprint /
  // -northstar), "Not me" signs this browser out so the right person signs in.
  const bp = to === 'blueprint';
  const inner = shell('');
  put(inner, `<span class="rbx-k">${bp ? 'Welcome to Your Base Camp' : 'Welcome to The Leader’s North Star'}</span>
    <h2 id="rbx-h">${bp ? 'Open The Founder’s Blueprint with your account?' : 'Open your North Star with your account?'}</h2>
    <p>${email ? `You’re signed in as <b>${esc(email)}</b>. ` : ''}One account keeps your North Star and your Blueprint together. Nothing to fill in.</p>
    <div class="rbx-err" role="alert"></div>
    <button type="button" class="rbx-go" data-cross="yes">Yes, open it</button>
    <button type="button" class="rbx-link" data-cross="no">Not me · sign in with my own account</button>`);
  inner.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-cross]'); if (!b) return;
    if (b.dataset.cross === 'no') {
      try { const A = await import('/account.js'); A.signOut(); } catch { /* still go to sign in */ }
      try { localStorage.removeItem('ftb-me'); } catch { /* private mode */ }
      location.href = '/ground-plan/?out=1#signin';
      return;
    }
    b.disabled = true; b.textContent = 'One moment…';
    try { const A = await import('/account.js'); await A.cross(to); } catch { /* the founder still goes on */ }
    close(); if (done) done({ first, last });
  });
}

/** One step before the first answer (31 Oct 2026, Alexandru). Any account
 *  without its full details is asked once, at its first answer in the
 *  Blueprint, for only what it lacks (missing: 'company', 'interest',
 *  'industry', 'password', from /api/state). Name and email are known and only
 *  shown. done() runs after the save, and the page then applies the answer
 *  the founder was giving, so nothing they tapped is lost. */
export function openComplete({ name = '', email = '', missing = [], done = null } = {}) {
  const need = (k) => missing.includes(k);
  const inner = shell('');
  put(inner, `<span class="rbx-k">Your Base Camp</span>
    <h2 id="rbx-h">One step before your first answer</h2>
    <p>Your answers are the most valuable thing here. Complete your free account once, so they are safe and follow you to any device.</p>
    ${email ? `<p class="rbx-tip" style="margin:-4px 0 4px">${name ? esc(name) + ' · ' : ''}<b>${esc(email)}</b></p>` : ''}
    <form class="rbx-form" novalidate style="display:flex;flex-direction:column;gap:12px">
      ${need('company') ? `<label>Company<input class="inp" id="rbx-co" autocomplete="organization" maxlength="120" placeholder="Your business name"></label>
        <label style="display:flex;flex-direction:row;align-items:center;gap:8px;font-weight:400"><input type="checkbox" id="rbx-noco" style="width:auto;min-height:0;margin:0"> No company yet</label>` : ''}
      ${need('interest') ? `<label>What do you want most?<select class="inp" id="rbx-int"><option value="">Choose…</option>${INTERESTS.map((x) => `<option>${esc(x)}</option>`).join('')}</select></label>` : ''}
      ${need('industry') ? `<label>Industry<select class="inp" id="rbx-ind"><option value="">Choose…</option>${INDUSTRIES.map((x) => `<option>${esc(x)}</option>`).join('')}</select></label>` : ''}
      ${need('password') ? pw('rbx-pw1', 'Password · at least 10 characters') : ''}
      <div class="rbx-err" role="alert"></div>
      <button type="submit" class="rbx-go">Save and answer</button>
    </form>
    <p class="rbx-tip" style="text-align:center">Your answer is kept. Free, as before.</p>`);
  const nc = inner.querySelector('#rbx-noco'), co = inner.querySelector('#rbx-co');
  if (nc && co) nc.addEventListener('change', () => { co.disabled = nc.checked; if (nc.checked) co.value = ''; });
  inner.querySelector('.rbx-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const v = (id) => { const el = inner.querySelector('#' + id); return el ? el.value.trim() : ''; };
    const f = {};
    if (need('company')) { f.noCompany = !!(nc && nc.checked); f.company = v('rbx-co'); if (!f.noCompany && !f.company) return say(inner, 'Your company’s name, or tick “No company yet”.'); }
    if (need('interest')) { f.interest = v('rbx-int'); if (!f.interest) return say(inner, 'Choose what you want most from the business.'); }
    if (need('industry')) { f.industry = v('rbx-ind'); if (!f.industry) return say(inner, 'Choose your industry.'); }
    if (need('password')) { const p = inner.querySelector('#rbx-pw1').value; if (p.length < 10) return say(inner, 'At least 10 characters, please.'); f.password = p; f.confirm = p; }
    const go = inner.querySelector('.rbx-go'); go.disabled = true; go.textContent = 'Saving…'; say(inner, '');
    try {
      const A = await import('/account.js');
      await A.complete(f);
      close(); if (done) done();
    } catch (ex) { say(inner, (ex && ex.message) || 'It did not save. Try again in a minute.'); go.disabled = false; go.textContent = 'Save and answer'; }
  });
}
