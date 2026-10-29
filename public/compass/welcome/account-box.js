/* The account box on the sales pages: makes the free account and opens the
 * founder's Ground Plan at /start, signed in at once.
 *
 *   'full'   (/compass/welcome): first name, surname, email, company (or "No
 *            company yet"), interest, industry, consent.
 *   'simple' ("/"): first name, surname, email, consent.
 *
 * No password here: the Launchpad asks for one the first time it opens. The
 * consent box starts unticked; without it the account is still made, and
 * nothing is emailed but what the founder asks for. Loaded the first time a
 * box opens (sales.js, or the "/" page), then open() each time. */
import { detailFields, readDetails, CONSENT } from '/forms.js';

const $ = (s) => document.querySelector(s);
const KEY = 'exploraself-profile';
const known = () => { try { const p = JSON.parse(localStorage.getItem(KEY) || 'null'); return p && p.email ? p : null; } catch { return null; } };
const hasAccount = () => { try { return !!localStorage.getItem('ftb-token'); } catch { return false; } };
const LAB = 'display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 700';

const STYLE = `.abox .inp{min-height:46px;border:1px solid #D8CDBB;border-radius:5px;padding:0 12px;font:15px 'Libre Franklin',Arial,sans-serif;color:#15213B;background:#FFFFFF;width:100%;box-sizing:border-box}
.abox select.inp{padding-right:8px}
.abox .inp:focus-visible{outline:2px solid #C9A24A;outline-offset:1px}
.abox .ab-go{min-height:52px;border:0;border-radius:5px;background:#C9A24A;color:#14100B;font:700 15px 'Libre Franklin',Arial,sans-serif;letter-spacing:.04em;cursor:pointer}
.abox .ab-go:hover{background:#E3C47E}
.abox .ab-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
@media(max-width:420px){.abox .ab-two{grid-template-columns:1fr}}`;

const markup = (variant) => `<div class="gpop abox" role="dialog" aria-modal="true" aria-labelledby="gate-h" style="position: relative; width: 100%; max-width: 480px; background: #FFFDF8; color: #15213B; border-radius: 10px; padding: 28px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 30px 70px rgba(0,0,0,.4); margin: auto; font-family: 'Libre Franklin', Arial, sans-serif; box-sizing: border-box">
    <style>${STYLE}</style>
    <button type="button" data-close aria-label="Close" style="position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; border-radius: 50%; border: 1px solid #D8CDBB; background: #FFFFFF; color: #15213B; cursor: pointer; display: inline-flex; align-items: center; justify-content: center"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    <form id="gate-form" novalidate style="display: flex; flex-direction: column; gap: 14px">
      <span style="font-size: 12px; font-weight: 700; letter-spacing: .16em; color: #7A5E26; padding-right: 44px">${variant === 'full' ? 'YOUR FULL ROAD IS ONE STEP AWAY' : 'START FREE'}</span>
      <h2 id="gate-h" style="margin: 0; font: 600 26px/1.25 Fraunces, Georgia, serif; padding-right: 40px">${variant === 'full' ? 'Where should we send your Compass?' : 'Your free account'}</h2>
      <span style="font-size: 14px; color: #3D4966">${variant === 'full' ? 'Your answers from this page come with you. Free.' : 'One minute. Name and email. Free.'}</span>
      <div class="ab-two">
        <label style="${LAB}">First name<input class="inp" id="j-first" type="text" autocomplete="given-name" maxlength="60"></label>
        <label style="${LAB}">Surname<input class="inp" id="j-last" type="text" autocomplete="family-name" maxlength="60"></label>
      </div>
      <label style="${LAB}">Email<input class="inp" id="j-email" type="email" autocomplete="email" maxlength="120"></label>
      ${variant === 'full' ? detailFields('j', LAB) : ''}
      <label style="display: flex; gap: 10px; align-items: flex-start; font-size: 12.5px; color: #3D4966"><input type="checkbox" id="j-consent" style="width: 18px; height: 18px; margin-top: 1px; accent-color: #C9A24A; flex: none">${CONSENT}</label>
      <span id="gate-err" role="alert" style="font-size: 13px; color: #B5512E; font-weight: 700"></span>
      <button type="submit" class="ab-go">OPEN MY GROUND PLAN →</button>
      <button type="button" data-close style="min-height: 44px; border-radius: 5px; border: 1px solid #D8CDBB; background: transparent; color: #15213B; font-weight: 700; cursor: pointer">Not now · keep reading</button>
      <a href="/start#signin" style="font-size: 13px; text-align: center; font-weight: 700; color: #7A5E26">Already have an account? Sign in</a>
    </form>
  </div>`;

let ctx = { opener: null, stage: null, variant: 'full' };
function close() { $('#gate').hidden = true; if (ctx.opener) ctx.opener.focus(); }

function wire(gate, variant) {
  gate.innerHTML = markup(variant);
  gate.dataset.variant = variant;
  gate.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
  if (!gate.dataset.wired) {
    gate.addEventListener('click', (e) => { if (e.target === gate) close(); });
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
    if (!first) return err('Your first name, so the Ground Plan is yours.');
    if (!last) return err('Your surname, please.');
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) return err('That email does not look complete.');
    const d = variant === 'full' ? readDetails('j') : null;
    if (d && d.problem) return err(d.problem);
    const p = { first, last, email, consent, stage: ctx.stage ? ctx.stage.id : '', industry: d ? d.industry : '' };
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ }
    const go = form.querySelector('[type=submit]'); go.disabled = true; go.textContent = 'ONE MOMENT…';
    err('');
    try {
      const A = await import('/account.js');
      const source = variant === 'full' ? 'sales-page' : 'home';
      const out = A.joined() ? { token: A.token() } : await A.signup({ first, last, email, consent, source, stage: p.stage, type: variant,
        ...(d ? { company: d.company, noCompany: d.noCompany, interest: d.interest, industry: d.industry } : {}) });
      if (out.token) { location.href = '/start#home'; return; }
      // An address that already has an account is never handed its key here.
      $('#gate-err').innerHTML = 'This email already has an account. <a href="/start#signin">Sign in →</a>';
    } catch (ex) {
      err(ex && ex.message && !/fetch|network|load failed|import/i.test(ex.message) ? ex.message : 'We could not reach the account service just now. Try again in a minute.');
    }
    go.disabled = false; go.textContent = 'OPEN MY GROUND PLAN →';
  });
}

/** Open the box. A founder already signed in on this device goes straight to
 *  their Ground Plan. */
export function open({ gate, opener, stage, variant = 'full' }) {
  ctx = { opener, stage, variant };
  if (hasAccount()) {
    if (stage) { const p = known() || {}; p.stage = stage.id; try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ } }
    location.href = '/start#home';
    return;
  }
  if (gate.dataset.variant !== variant) wire(gate, variant);
  const p = known();
  if (p) { $('#j-first').value = p.first || ''; $('#j-last').value = p.last || ''; $('#j-email').value = p.email || ''; }
  gate.hidden = false;
  $('#j-first').focus();
}
