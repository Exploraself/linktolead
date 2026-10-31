/* "Continue with Google" (31 Oct 2026): one button, shared by every sign-in
 * and sign-up box (the Blueprint sign-in, the North Star sign-in and gate, the
 * account box on the sales pages).
 *
 * slot() is the markup: the button, an optional consent line (synced with the
 * box's own consent tick, so ticking either counts), and "or with your email".
 * It starts hidden. mount() shows it only when /api/google says Google sign-in
 * is switched on, loads Google's script once, and on success keeps the token
 * (account.js) and calls onDone({ token, existing, me, missing }). */
import { utm } from '/forms.js';

let cfg = null, script = null, onCredential = null;
async function config() {
  if (cfg) return cfg;
  try { const r = await fetch('/api/google'); cfg = r.ok ? await r.json() : { ready: false }; } catch { cfg = { ready: false }; }
  return cfg;
}
function load() {
  if (!script) script = new Promise((res, rej) => {
    if (window.google && window.google.accounts && window.google.accounts.id) return res();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  return script;
}

/** The markup. `consentFor`: the id of the box's own consent tick, or ''. */
export const slot = (consentFor = '', dark = false) => `<div class="g-slot" hidden style="flex-direction:column;gap:10px;align-items:stretch">
  <div class="g-btn" style="display:flex;justify-content:center;min-height:44px"></div>
  ${consentFor ? `<label class="g-consent" style="display:flex;gap:8px;align-items:flex-start;font-size:12px;line-height:1.45;color:${dark ? '#C9C2B3' : '#5A6580'}"><input type="checkbox" data-sync="${consentFor}" style="width:16px;height:16px;margin-top:1px;accent-color:#B4975F;flex:none">Email me my results and occasional guidance. I can unsubscribe any time.</label>` : ''}
  <div class="g-or" role="separator" style="display:flex;align-items:center;gap:10px;font-size:12px;color:${dark ? '#9C9585' : '#7B8399'};letter-spacing:.04em"><span style="flex:1;height:1px;background:currentColor;opacity:.35"></span>or with your email<span style="flex:1;height:1px;background:currentColor;opacity:.35"></span></div>
</div>`;

/** Show the button in `el` (a .g-slot). Resolves true when it is on screen. */
export async function mount(el, { landing = '', source = 'compass', onDone = null, onError = null } = {}) {
  if (!el) return false;
  const c = await config();
  if (!c.ready || !c.clientId) { el.hidden = true; return false; }
  try { await load(); } catch { el.hidden = true; return false; }
  const root = el.closest('form') || el.parentNode || document;
  // The consent line and the box's own tick move together.
  const mine = el.querySelector('[data-sync]'), theirs = mine ? root.querySelector('#' + mine.dataset.sync) : null;
  if (mine && theirs) {
    mine.checked = theirs.checked;
    mine.addEventListener('change', () => { theirs.checked = mine.checked; });
    theirs.addEventListener('change', () => { mine.checked = theirs.checked; });
  }
  onCredential = async (resp) => {
    try {
      const A = await import('/account.js');
      const out = await A.google(resp.credential, { consent: !!(theirs ? theirs.checked : mine && mine.checked), landing, source, utm: utm() });
      if (onDone) onDone(out);
    } catch (ex) {
      if (onError) onError(ex && ex.message && !/fetch|network|load failed|import/i.test(ex.message) ? ex.message : 'We could not reach the account service just now. Try again in a minute.');
    }
  };
  const g = window.google.accounts.id;
  g.initialize({ client_id: c.clientId, callback: (r) => onCredential && onCredential(r), auto_select: false, ux_mode: 'popup', itp_support: true, context: 'signin' });
  const holder = el.querySelector('.g-btn');
  holder.innerHTML = '';
  el.hidden = false; el.style.display = 'flex';
  g.renderButton(holder, { type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', logo_alignment: 'center', width: Math.max(220, Math.min(400, holder.clientWidth || 320)) });
  return true;
}
