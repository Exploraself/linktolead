/* The account box on the sales pages: makes the free account and opens the
 * founder's Base Camp at /start, signed in at once.
 *
 *   'full'   (/north3/, the North Star sales page, landing "road2"; /road1/,
 *            landing "road1"): first name, surname, email, company (or "No
 *            company yet"), interest, industry, a password (required: at
 *            least 10 characters, typed twice), consent.
 *   'simple' (/road3/, the 12 Scrolls page, landing "road3"): first name,
 *            surname, email, consent. No
 *            password, ever: these founders sign in by email link.
 *
 * The consent box starts unticked; without it the account is still made, and
 * nothing is emailed but what the founder asks for. The landing page and the
 * utm_* tags the founder arrived with go with the sign-up. Loaded the first
 * time a box opens (/road1/, /north3/, /road3/), then open() each time.
 *
 * On /northstar (landing "compass", `stay`): a visitor from outside makes the
 * full account here, then stays on the North Star, signed in, with everything
 * open. An email that already has an account goes to `onExisting`. */
import { detailFields, readDetails, CONSENT, utm } from '/forms.js';

/** Inside this box only: the North Star page has its own #gate-form. */
const $ = (s) => (ctx.gate || document).querySelector(s);
const KEY = 'exploraself-profile';
const known = () => { try { const p = JSON.parse(localStorage.getItem(KEY) || 'null'); return p && p.email ? p : null; } catch { return null; } };
const hasAccount = () => { try { return !!localStorage.getItem('ftb-token'); } catch { return false; } };
const LAB = 'display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 600';

// The show-password eye (30 Oct): shows or hides what was typed, one per field.
const EYE = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const COPY = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
// Show and copy (31 Oct): a hidden password cannot be copied, so each has a copy button.
const pwInput = (id) => `<span class="ab-pw"><input class="inp" id="${id}" type="password" autocomplete="new-password" minlength="10" maxlength="200"><button type="button" class="ab-eye" data-eye="${id}" aria-pressed="false" aria-label="Show password">${EYE}</button><button type="button" class="ab-eye" data-copy="${id}" aria-label="Copy password">${COPY}</button></span>`;
const STYLE = `.ab-pw{display:flex;gap:6px}.ab-pw .inp{flex:1;min-width:0}
.ab-eye{flex:none;width:46px;min-height:46px;border:1px solid #D8CDBB;border-radius:5px;background:#FFFFFF;color:#121C2D;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0}
.ab-eye[aria-pressed="true"]{background:#F3EBDA}.ab-eye:focus-visible{outline:2px solid #B4975F;outline-offset:2px}
.abox .inp{min-height:46px;border:1px solid #D8CDBB;border-radius:5px;padding:0 12px;font:15px 'Inter',Arial,sans-serif;color:#121C2D;background:#FFFFFF;width:100%;box-sizing:border-box}
.abox select.inp{padding-right:8px}
.abox .inp:focus-visible{outline:2px solid #B4975F;outline-offset:1px}
.abox .ab-go{min-height:52px;border:0;border-radius:5px;background:#B4975F;color:#14100B;font:600 15px 'Inter',Arial,sans-serif;letter-spacing:.04em;cursor:pointer}
.abox .ab-go:hover{background:#D6BF8F}
.abox .ab-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:420px){.abox .ab-two{grid-template-columns:1fr}}
/* The site at night (theme.js): the box turns midnight with ivory text, the
   same on every page, whatever the page's own dark rules do (31 Oct). */
:root[data-theme="dark"] .abox{background:#141E36!important;color:#E9ECF3!important;color-scheme:dark;box-shadow:0 30px 70px rgba(0,0,0,.55)!important}
:root[data-theme="dark"] .abox h2,:root[data-theme="dark"] .abox label{color:#E9ECF3!important}
:root[data-theme="dark"] .abox .ab-k,:root[data-theme="dark"] .abox .ab-link{color:#D6BF8F!important}
:root[data-theme="dark"] .abox .ab-sub,:root[data-theme="dark"] .abox .ab-fine{color:#B9C1D3!important}
:root[data-theme="dark"] .abox .ab-err{color:#F0A27E!important}
:root[data-theme="dark"] .abox .inp,:root[data-theme="dark"] .abox .ab-eye{background:#0F1830!important;color:#E9ECF3!important;border-color:#3A4A6E!important}
:root[data-theme="dark"] .abox .inp::placeholder{color:#8F9AB3}
:root[data-theme="dark"] .abox .ab-eye[aria-pressed="true"]{background:#1E2A46!important}
:root[data-theme="dark"] .abox .ab-x,:root[data-theme="dark"] .abox .ab-no{background:transparent!important;color:#E9ECF3!important;border-color:#3A4A6E!important}`;

// The words at the top of the box. The North Star sales page carries the
// visitor's answers into the account; the home page has none to carry.
const HEAD = {
  compass: ['YOUR FULL ROAD IS ONE STEP AWAY', 'Where should we send your North Star?', 'Your answers from this page come with you. Free.'],
  full: ['START FREE', 'Your free account', 'Free. You sign in with your email and a password.'],
  simple: ['START FREE', 'Your free account', 'One minute. Name and email. Free.'],
  summit: ['YOUR PLACE AT THE SUMMIT', 'Your account', 'Start now. You sign in with your email and a password.'],
  stay: ['YOUR NORTH STAR, IN FULL', 'Your free account', 'Your answers come with you, and the whole North Star opens: your feedback, your plans and your library. Free.'],
};

const markup = (variant, head = HEAD[variant], stay = false) => `<div class="gpop abox" role="dialog" aria-modal="true" aria-labelledby="gate-h" style="position: relative; width: 100%; max-width: 480px; background: #FFFDF8; color: #121C2D; border-radius: 10px; padding: 28px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 30px 70px rgba(0,0,0,.4); margin: auto; font-family: 'Inter', Arial, sans-serif; box-sizing: border-box">
    <style>${STYLE}</style>
    <button type="button" class="ab-x" data-close aria-label="Close" style="position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; border-radius: 50%; border: 1px solid #D8CDBB; background: #FFFFFF; color: #121C2D; cursor: pointer; display: inline-flex; align-items: center; justify-content: center"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    <form id="gate-form" novalidate style="display: flex; flex-direction: column; gap: 14px">
      <span class="ab-k" style="font-size: 12px; font-weight: 600; letter-spacing: .16em; color: #7A5E26; padding-right: 44px">${head[0]}</span>
      <h2 id="gate-h" style="margin: 0; font:440 26px/1.25 Newsreader, Georgia, serif; padding-right: 40px">${head[1]}</h2>
      <span class="ab-sub" style="font-size: 14px; color: #3D4966">${head[2]}</span>
      <div class="ab-two">
        <label style="${LAB}">First name<input class="inp" id="j-first" type="text" autocomplete="given-name" maxlength="60"></label>
        <label style="${LAB}">Surname<input class="inp" id="j-last" type="text" autocomplete="family-name" maxlength="60"></label>
      </div>
      <label style="${LAB}">Email<input class="inp" id="j-email" type="email" autocomplete="email" maxlength="120"></label>
      ${variant === 'full' ? detailFields('j', LAB) + `
      <label style="${LAB}">Password${pwInput('j-pw')}</label>
      <label style="${LAB}">Confirm password${pwInput('j-pw2')}</label>
      <span class="ab-fine" style="font-size: 12px; color: #5A6580; margin-top: -6px">At least 10 characters. You sign in with your email and this password.</span>` : ''}
      <label class="ab-fine" style="display: flex; gap: 10px; align-items: flex-start; font-size: 12.5px; color: #3D4966"><input type="checkbox" id="j-consent" style="width: 18px; height: 18px; margin-top: 1px; accent-color: #B4975F; flex: none">${CONSENT}</label>
      <span id="gate-err" class="ab-err" role="alert" style="font-size: 13px; color: #B5512E; font-weight: 600"></span>
      <button type="submit" class="ab-go">${stay ? 'OPEN MY NORTH STAR →' : 'OPEN MY BASE CAMP →'}</button>
      ${stay ? '' : '<button type="button" class="ab-no" data-close style="min-height: 44px; border-radius: 5px; border: 1px solid #D8CDBB; background: transparent; color: #121C2D; font-weight: 600; cursor: pointer">Not now · keep reading</button>'}
      <span style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap"><a class="ab-link" href="/ground-plan/#signin" style="font-size: 13px; font-weight: 600; color: #7A5E26">Already have an account? Sign in</a><button type="button" class="ab-link" data-reset style="border: 0; background: none; padding: 0; font: 600 13px Inter, Arial, sans-serif; color: #7A5E26; text-decoration: underline; text-underline-offset: 3px; cursor: pointer">Forgot your password?</button></span>
    </form>
  </div>`;

/** Where the founder lands after the box. A North Star sales page (/north2/)
 *  opens the North Star itself; every other page opens Your Base Camp. */
const NS_HOME = ['road21'];
const after = () => ctx.next || (NS_HOME.includes(ctx.landing) ? '/northstar/' : '/ground-plan/#home');
let ctx = { opener: null, stage: null, variant: 'full', landing: 'road2', stay: false, onExisting: null };
function close() { if (ctx.gate) ctx.gate.hidden = true; if (ctx.opener && ctx.opener.focus) ctx.opener.focus(); }

function wire(gate, variant, landing) {
  gate.innerHTML = markup(variant, HEAD[ctx.stay ? 'stay' : landing === 'summit' ? 'summit' : variant === 'full' && (landing === 'road2' || landing === 'road21') ? 'compass' : variant], ctx.stay);
  gate.dataset.variant = variant + ' ' + landing;
  gate.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
  gate.querySelectorAll('[data-eye]').forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault();
    const f = gate.querySelector('#' + b.dataset.eye), show = f.type === 'password';
    f.type = show ? 'text' : 'password';
    b.setAttribute('aria-pressed', String(show));
    b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  }));
  gate.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', async (e) => {
    e.preventDefault();
    const f = gate.querySelector('#' + b.dataset.copy); if (!f || !f.value) return;
    let ok = true; try { await navigator.clipboard.writeText(f.value); } catch { ok = false; }
    b.textContent = ok ? '✓' : '—'; setTimeout(() => { b.innerHTML = COPY; }, 1400);
  }));
  if (!gate.dataset.wired) {
    // Closes only when a press starts AND ends outside the box (31 Oct): a
    // drag or a text selection that ends outside never closes it.
    let downOut = false;
    gate.addEventListener('pointerdown', (e) => { downOut = e.target === gate; });
    gate.addEventListener('click', (e) => { if (e.target === gate && downOut) close(); downOut = false; });
    gate.addEventListener('click', (e) => { const b = e.target.closest('[data-reset]'); if (!b) return; e.preventDefault(); const em = gate.querySelector('#j-email'); import('/reset-box.js').then((m) => m.openReset({ email: em ? em.value.trim() : '' })); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !gate.hidden) close(); });
    gate.dataset.wired = '1';
  }
  const nc = $('#j-nocompany');
  if (nc) nc.addEventListener('change', () => { const c = $('#j-company'); c.disabled = nc.checked; if (nc.checked) c.value = ''; });
  const form = $('#gate-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const first = $('#j-first').value.trim(), last = $('#j-last').value.trim(), email = $('#j-email').value.trim(), consent = $('#j-consent').checked;
    const err = (m) => { $('#gate-err').textContent = m; };
    if (!first) return err('Your first name, so the Base Camp is yours.');
    if (!last) return err('Your surname, please.');
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) return err('That email does not look complete.');
    const d = variant === 'full' ? readDetails('j') : null;
    if (d && d.problem) return err(d.problem);
    const pw = variant === 'full' ? $('#j-pw').value : '', pw2 = variant === 'full' ? $('#j-pw2').value : '';
    if (variant === 'full' && pw.length < 10) return err('A password of at least 10 characters, please.');
    if (variant === 'full' && pw !== pw2) return err('The two passwords are different.');
    const p = { first, last, email, consent, stage: ctx.stage ? ctx.stage.id : '', industry: d ? d.industry : '' };
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ }
    const go = form.querySelector('[type=submit]'); go.disabled = true; go.textContent = 'ONE MOMENT…';
    err('');
    try {
      const A = await import('/account.js');
      const source = ctx.landing === 'compass' ? 'compass' : (ctx.landing === 'road2' || ctx.landing === 'road21') ? 'sales-page' : 'home';
      const out = A.joined() ? { token: A.token() } : await A.signup({ first, last, email, consent, source, stage: p.stage, type: variant,
        landing: ctx.landing, utm: utm(),
        ...(d ? { company: d.company, noCompany: d.noCompany, interest: d.interest, industry: d.industry, password: pw, confirm: pw2 } : {}) });
      if (out.token) { if (ctx.stay) location.reload(); else location.href = after(); return; }
      if (ctx.onExisting) { close(); ctx.onExisting(email); return; }
      // An address that already has an account is never handed its key here.
      $('#gate-err').innerHTML = 'This email already has an account. Sign in to open your plans. <a href="/ground-plan/#signin">Sign in →</a> or <button type="button" data-reset style="border: 0; background: none; padding: 0; font: inherit; color: inherit; text-decoration: underline; cursor: pointer">reset your password</button>.';
    } catch (ex) {
      err(ex && ex.message && !/fetch|network|load failed|import/i.test(ex.message) ? ex.message : 'We could not reach the account service just now. Try again in a minute.');
    }
    go.disabled = false; go.textContent = ctx.stay || NS_HOME.includes(ctx.landing) || ctx.next === '/northstar/' ? 'OPEN MY NORTH STAR →' : 'OPEN MY BASE CAMP →';
  });
}

/** Open the box. A founder already signed in on this device goes straight to
 *  their Base Camp. */
export function open({ gate, opener, stage, variant = 'full', landing = variant === 'full' ? 'road2' : 'road3', stay = false, onExisting = null, next = '' }) {
  ctx = { gate, opener, stage, variant, landing, stay, onExisting, next };
  if (hasAccount() && stay) return;
  if (hasAccount()) {
    if (stage) { const p = known() || {}; p.stage = stage.id; try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ } }
    location.href = after();
    return;
  }
  if (gate.dataset.variant !== variant + ' ' + landing) wire(gate, variant, landing);
  // The button says where it goes.
  { const g = gate.querySelector('.ab-go'); if (g && !ctx.stay) g.textContent = NS_HOME.includes(landing) || ctx.next === '/northstar/' ? 'OPEN MY NORTH STAR →' : 'OPEN MY BASE CAMP →'; }
  const p = known();
  if (p) { $('#j-first').value = p.first || ''; $('#j-last').value = p.last || ''; $('#j-email').value = p.email || ''; }
  gate.hidden = false;
  $('#j-first').focus();
}
