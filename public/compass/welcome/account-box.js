/* The account box on the sales page: makes the free account and opens the
 * founder's Ground Plan at /start. The password is optional; with one, both
 * boxes must match before anything is sent. sales.js loads this file the
 * first time the box opens, and calls open() each time. */
const $ = (s) => document.querySelector(s);
const KEY = 'exploraself-profile';
const known = () => { try { const p = JSON.parse(localStorage.getItem(KEY) || 'null'); return p && p.email ? p : null; } catch { return null; } };
const hasAccount = () => { try { return !!localStorage.getItem('ftb-token'); } catch { return false; } };

const MARKUP = `  <div class="gpop" role="dialog" aria-modal="true" aria-labelledby="gate-h" style="position: relative; width: 100%; max-width: 480px; background: #FFFDF8; color: #15213B; border-radius: 10px; padding: 28px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 30px 70px rgba(0,0,0,.4); margin: auto; font-family: 'Libre Franklin', Arial, sans-serif">
    <button type="button" data-close aria-label="Close" style="position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; border-radius: 50%; border: 1px solid #D8CDBB; background: #FFFFFF; color: #15213B; cursor: pointer; display: inline-flex; align-items: center; justify-content: center"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
    <form id="gate-form" novalidate style="display: flex; flex-direction: column; gap: 14px">
      <span style="font-size: 12px; font-weight: 700; letter-spacing: .16em; color: #7A5E26; padding-right: 44px">YOUR FULL ROAD IS ONE STEP AWAY</span>
      <h2 class="serif" id="gate-h" style="font-size: 26px; line-height: 1.25; padding-right: 40px">Where should we send your Compass?</h2>
      <span style="font-size: 14px; color: #3D4966">Your answers from this page come with you. Free.</span>
      <div class="two" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
        <label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 700">First name<input class="inp" id="j-first" type="text" autocomplete="given-name" maxlength="60"></label>
        <label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 700">Surname<input class="inp" id="j-last" type="text" autocomplete="family-name" maxlength="60"></label>
      </div>
      <label style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 700">Email<input class="inp" id="j-email" type="email" autocomplete="email" maxlength="120"></label>
      <details class="pwopt"><summary>Set a password (optional)</summary>
        <span class="pwhint">Without one, we email you a sign-in link whenever you need it. At least 10 characters.</span>
        <label class="pwl">Password<span class="pwrow"><input class="inp" id="j-pw" type="password" autocomplete="new-password" minlength="10" maxlength="200"><button type="button" class="pweye" data-eye="j-pw" aria-label="Show password" aria-pressed="false"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg></button></span></label>
        <label class="pwl">Confirm password<span class="pwrow"><input class="inp" id="j-pw2" type="password" autocomplete="new-password" minlength="10" maxlength="200"><button type="button" class="pweye" data-eye="j-pw2" aria-label="Show confirm password" aria-pressed="false"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg></button></span></label>
      </details>
      <span id="gate-err" role="alert" style="font-size: 13px; color: #B5512E; font-weight: 700"></span>
      <button type="submit" class="gold-btn" style="font-size: 15px; letter-spacing: .04em">OPEN MY GROUND PLAN →</button>
      <button type="button" data-close style="min-height: 44px; border-radius: 5px; border: 1px solid #D8CDBB; background: transparent; color: #15213B; font-weight: 700; cursor: pointer">Not now · keep reading</button>
      <span style="font-size: 12px; color: #5A6580; text-align: center">You can unsubscribe any time.</span>
      <a href="/start#signin" style="font-size: 13px; text-align: center; font-weight: 700">Already have an account? Sign in</a>
    </form>
    <div id="joined" hidden style="flex-direction: column; gap: 14px; align-items: flex-start">
      <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="#C9A24A" stroke-width="1.4"/><polygon points="12,4 14,12 12,13.5 10,12" fill="#C9A24A"/></svg>
      <span class="serif" style="font-size: 26px; line-height: 1.25" tabindex="-1" id="joined-h">You are in. Your Compass is ready.</span>
      <span style="font-size: 14px; color: #3D4966" id="joined-line">Start with your road, then the eight questions.</span>
      <a href="/start#home" class="gold-btn" id="joined-go" style="font-size: 15px; letter-spacing: .04em">OPEN MY GROUND PLAN →</a>
    </div>
  </div>
`;

let ctx = { opener: null, stage: null };
function close() { $('#gate').hidden = true; if (ctx.opener) ctx.opener.focus(); }
function showJoined(p) {
  $('#gate-form').hidden = true;
  const j = $('#joined'); j.hidden = false; j.style.display = 'flex';
  $('#joined-line').textContent = (ctx.stage ? `We carried your stage over: ${ctx.stage.name}. ` : '') + 'Your Ground Plan is waiting: start there, then the Compass.';
  $('#joined-h').focus();
}

function wire(gate) {
  gate.innerHTML = MARKUP;
  gate.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
  gate.addEventListener('click', (e) => { if (e.target === gate) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !gate.hidden) close(); });
  gate.querySelectorAll('[data-eye]').forEach((b) => b.addEventListener('click', () => {
    const inp = document.getElementById(b.dataset.eye), show = inp.type === 'password';
    inp.type = show ? 'text' : 'password'; b.setAttribute('aria-pressed', String(show));
    b.setAttribute('aria-label', (show ? 'Hide ' : 'Show ') + b.getAttribute('aria-label').replace(/^(Show|Hide) /, ''));
  }));
  const form = $('#gate-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const first = $('#j-first').value.trim(), last = $('#j-last').value.trim(), email = $('#j-email').value.trim();
    const pw = $('#j-pw').value, pw2 = $('#j-pw2').value;
    const err = (m) => { $('#gate-err').textContent = m; };
    if (!first) return err('Your first name, so the Compass is yours.');
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) return err('That email does not look complete.');
    if (pw || pw2) {
      if (pw.length < 10) return err('A password needs at least 10 characters. Or leave both boxes empty.');
      if (pw !== pw2) return err('The two passwords are different.');
    }
    const p = { first, last, email, consent: true, stage: ctx.stage ? ctx.stage.id : '' };
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ }
    const go = form.querySelector('[type=submit]'); go.disabled = true; go.textContent = 'ONE MOMENT…';
    err('');
    try {
      const A = await import('/account.js');
      const out = A.joined() ? { token: A.token() } : await A.signup({ first, last, email, consent: true, source: 'sales-page', stage: p.stage, password: pw || undefined, confirm: pw ? pw2 : undefined });
      if (out.token) { location.href = '/start#home'; return; }
      // An address that already has an account is never handed its key here.
      $('#gate-err').innerHTML = 'This email already has an account. <a href="/start#signin">Sign in →</a>';
    } catch (ex) {
      err(ex && ex.message && !/fetch|network|load failed|import/i.test(ex.message) ? ex.message : 'We could not reach the account service just now. Try again in a minute.');
    }
    go.disabled = false; go.textContent = 'OPEN MY GROUND PLAN →';
  });
}

export function open({ gate, opener, stage }) {
  ctx = { opener, stage };
  if (!gate.firstElementChild) wire(gate);
  const p = known();
  if (p && hasAccount()) {
    if (stage) { p.stage = stage.id; try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ } }
    showJoined(p);
  } else {
    if (p) { $('#j-first').value = p.first || ''; $('#j-last').value = p.last || ''; $('#j-email').value = p.email || ''; }
    $('#j-first').focus();
  }
}
