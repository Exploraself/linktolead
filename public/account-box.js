/* The account box on the sales pages: makes the free account and opens the
 * founder's Ground Plan at /start, signed in at once.
 *
 *   'full'   (/road2/, the Compass sales page, landing "road2"; /road1/,
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
 * time a box opens (/road1/, /road2/, /road3/), then open() each time.
 *
 * On /compass (landing "compass", `stay`): a visitor from outside makes the
 * full account here, then stays on the Compass, signed in, with everything
 * open. An email that already has an account goes to `onExisting`. */
import { detailFields, readDetails, CONSENT, utm } from '/forms.js';

/** Inside this box only: the Compass page has its own #gate-form. */
const $ = (s) => (ctx.gate || document).querySelector(s);
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

// The words at the top of the box. The Compass sales page carries the
// visitor's answers into the account; the home page has none to carry.
const HEAD = {
  compass: ['YOUR FULL ROAD IS ONE STEP AWAY', 'Where should we send your Compass?', 'Your answers from this page come with you. Free.'],
  full: ['START FREE', 'Your free account', 'Free. You sign in with your email and a password.'],
  simple: ['START FREE', 'Your free account', 'One minute. Name and email. Free.'],
  stay: ['YOUR COMPASS, IN FULL', 'Your free account', 'Your answers come with you, and the whole Compass opens: your feedback, your plans and your library. Free.'],
};

const markup = (variant, head = HEAD[variant], stay = false) => `<div class="gpop abox" role="dialog" aria-modal="true" aria-labelledby="gate-h" style="position: relative; width: 100%; max-width: 480px; background: #FFFDF8; color: #15213B; border-radius: 10px; padding: 28px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 30px 70px rgba(0,0,0,.4); margin: auto; font-family: 'Libre Franklin', Arial, sans-serif; box-sizing: border-box">
    <style>${STYLE}</style>
    <button type="button" data-close aria-label="Close" style="position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; border-radius: 50%; border: 1px solid #D8CDBB; background: #FFFFFF; color: #15213B; cursor: pointer; display: inline-flex; align-items: center; justify-content: center"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    <form id="gate-form" novalidate style="display: flex; flex-direction: column; gap: 14px">
      <span style="font-size: 12px; font-weight: 700; letter-spacing: .16em; color: #7A5E26; padding-right: 44px">${head[0]}</span>
      <h2 id="gate-h" style="margin: 0; font: 600 26px/1.25 Fraunces, Georgia, serif; padding-right: 40px">${head[1]}</h2>
      <span style="font-size: 14px; color: #3D4966">${head[2]}</span>
      <div class="ab-two">
        <label style="${LAB}">First name<input class="inp" id="j-first" type="text" autocomplete="given-name" maxlength="60"></label>
        <label style="${LAB}">Surname<input class="inp" id="j-last" type="text" autocomplete="family-name" maxlength="60"></label>
      </div>
      <label style="${LAB}">Email<input class="inp" id="j-email" type="email" autocomplete="email" maxlength="120"></label>
      ${variant === 'full' ? detailFields('j', LAB) + `
      <label style="${LAB}">Password<input class="inp" id="j-pw" type="password" autocomplete="new-password" minlength="10" maxlength="200"></label>
      <label style="${LAB}">Confirm password<input class="inp" id="j-pw2" type="password" autocomplete="new-password" minlength="10" maxlength="200"></label>
      <span style="font-size: 12px; color: #5A6580; margin-top: -6px">At least 10 characters. You sign in with your email and this password.</span>` : ''}
      <label style="display: flex; gap: 10px; align-items: flex-start; font-size: 12.5px; color: #3D4966"><input type="checkbox" id="j-consent" style="width: 18px; height: 18px; margin-top: 1px; accent-color: #C9A24A; flex: none">${CONSENT}</label>
      <span id="gate-err" role="alert" style="font-size: 13px; color: #B5512E; font-weight: 700"></span>
      <button type="submit" class="ab-go">${stay ? 'OPEN MY COMPASS →' : 'OPEN MY GROUND PLAN →'}</button>
      ${stay ? '' : '<button type="button" data-close style="min-height: 44px; border-radius: 5px; border: 1px solid #D8CDBB; background: transparent; color: #15213B; font-weight: 700; cursor: pointer">Not now · keep reading</button>'}
      <a href="/start#signin" style="font-size: 13px; text-align: center; font-weight: 700; color: #7A5E26">Already have an account? Sign in</a>
    </form>
  </div>`;

let ctx = { opener: null, stage: null, variant: 'full', landing: 'road2', stay: false, onExisting: null };
function close() { if (ctx.gate) ctx.gate.hidden = true; if (ctx.opener && ctx.opener.focus) ctx.opener.focus(); }

function wire(gate, variant, landing) {
  gate.innerHTML = markup(variant, HEAD[ctx.stay ? 'stay' : variant === 'full' && landing === 'road2' ? 'compass' : variant], ctx.stay);
  gate.dataset.variant = variant + ' ' + landing;
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
    const pw = variant === 'full' ? $('#j-pw').value : '', pw2 = variant === 'full' ? $('#j-pw2').value : '';
    if (variant === 'full' && pw.length < 10) return err('A password of at least 10 characters, please.');
    if (variant === 'full' && pw !== pw2) return err('The two passwords are different.');
    const p = { first, last, email, consent, stage: ctx.stage ? ctx.stage.id : '', industry: d ? d.industry : '' };
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ }
    const go = form.querySelector('[type=submit]'); go.disabled = true; go.textContent = 'ONE MOMENT…';
    err('');
    try {
      const A = await import('/account.js');
      const source = ctx.landing === 'compass' ? 'compass' : ctx.landing === 'road2' ? 'sales-page' : 'home';
      const out = A.joined() ? { token: A.token() } : await A.signup({ first, last, email, consent, source, stage: p.stage, type: variant,
        landing: ctx.landing, utm: utm(),
        ...(d ? { company: d.company, noCompany: d.noCompany, interest: d.interest, industry: d.industry, password: pw, confirm: pw2 } : {}) });
      if (out.token) { if (ctx.stay) location.reload(); else location.href = '/start#home'; return; }
      if (ctx.onExisting) { close(); ctx.onExisting(email); return; }
      // An address that already has an account is never handed its key here.
      $('#gate-err').innerHTML = 'This email already has an account. Sign in to open your plans. <a href="/start#signin">Sign in →</a>';
    } catch (ex) {
      err(ex && ex.message && !/fetch|network|load failed|import/i.test(ex.message) ? ex.message : 'We could not reach the account service just now. Try again in a minute.');
    }
    go.disabled = false; go.textContent = ctx.stay ? 'OPEN MY COMPASS →' : 'OPEN MY GROUND PLAN →';
  });
}

/** Open the box. A founder already signed in on this device goes straight to
 *  their Ground Plan. */
export function open({ gate, opener, stage, variant = 'full', landing = variant === 'full' ? 'road2' : 'road3', stay = false, onExisting = null }) {
  ctx = { gate, opener, stage, variant, landing, stay, onExisting };
  if (hasAccount() && stay) return;
  if (hasAccount()) {
    if (stage) { const p = known() || {}; p.stage = stage.id; try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ } }
    location.href = '/start#home';
    return;
  }
  if (gate.dataset.variant !== variant + ' ' + landing) wire(gate, variant, landing);
  const p = known();
  if (p) { $('#j-first').value = p.first || ''; $('#j-last').value = p.last || ''; $('#j-email').value = p.email || ''; }
  gate.hidden = false;
  $('#j-first').focus();
}
