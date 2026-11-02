/* The way into a free tool (Alexandru, 2 Nov 2026): a full free account.
 *
 *   signed out           the full account form, one field at a time (type,
 *                        Enter, the next field opens): first name, surname,
 *                        email, company (or "No company yet"), what they want
 *                        most, industry, a password typed twice, consent.
 *                        Or "Continue with Google", or sign in.
 *   details missing      only what is missing, asked once (api/complete.js).
 *   full account         nothing: one "Open" tap on the cover and the tool starts.
 *
 * state() says which; open() runs the steps inside `host` and calls ready(me)
 * when the account is full. Sign-ups from here carry door 'tools', so their
 * welcome letter opens the toolkit (functions/_letters.js toolsWelcome). */
import * as A from '/account.js';
import { INTERESTS, INDUSTRIES, CONSENT, utm } from '/forms.js';
import { slot as googleSlot, mount as mountGoogle } from '/google.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
const EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const COPY = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
export const firstOf = (me) => String((me && me.name) || '').trim().split(/\s+/)[0] || '';

/** 'guest', 'missing' (with the list) or 'full', and the founder. */
export async function state() {
  if (!A.joined()) return { kind: 'guest', me: null };
  const r = await A.pull();
  if (!r) return { kind: 'offline', me: null };
  if (r.gone) { A.signOut(); return { kind: 'guest', me: null }; }
  const me = r.me || {};
  return me.missing && me.missing.length ? { kind: 'missing', me, missing: me.missing } : { kind: 'full', me };
}

const SIGNUP = ['first', 'last', 'email', 'company', 'interest', 'industry', 'password', 'confirm', 'consent'];
const SIGNIN = ['email', 'login'];

const Q = {
  first: { q: 'What’s your first name?', hint: 'One free account opens every tool, The Leader’s North Star and The Founder Launchpad. Your answers stay yours.', type: 'text', ac: 'given-name', max: 60 },
  last: { q: (v) => `Nice to meet you${v.first ? ', ' + v.first : ''}. Your surname?`, hint: 'As you would sign a letter.', type: 'text', ac: 'family-name', max: 60 },
  email: { q: 'Your email', hint: 'You sign in with it. Your reading and your step for the week stay in your account.', type: 'email', ac: 'email', max: 120 },
  company: { q: 'Your company’s name', hint: 'Just starting? Tap “No company yet”.', type: 'company', ac: 'organization', max: 120 },
  interest: { q: 'What do you want most from the business?', hint: 'The first one that is true.', type: 'pick', list: INTERESTS },
  industry: { q: 'Your industry', hint: 'The closest one. “Other” is fine.', type: 'pick', list: INDUSTRIES, two: true },
  password: { q: 'Choose a password', hint: 'At least 10 characters. You sign in with your email and this password.', type: 'password', ac: 'new-password' },
  confirm: { q: 'Type it once more', hint: 'So a typo never locks you out.', type: 'password', ac: 'new-password' },
  consent: { q: 'Last step', hint: 'Your account opens the moment you tap.', type: 'consent' },
  login: { q: 'Your password', hint: 'The one you chose when you made your account.', type: 'password', ac: 'current-password' },
};

/**
 * Run the way in, inside `host`. Options:
 *   name     the tool's name, for the last button ("Open Cash runway →")
 *   path     the tool's page ('/runway/'), for the welcome letter
 *   st       the result of state()
 *   ready    called with the founder when the account is full
 *   cancel   called by "← Back" on the first step
 */
export function open(host, { name = 'my toolkit', path = '/tools/', st = { kind: 'guest' }, ready, cancel } = {}) {
  const v = { first: '', last: '', email: '', company: '', noCompany: false, interest: '', industry: '', password: '', confirm: '', consent: false };
  let mode = st.kind === 'missing' ? 'missing' : 'signup';
  let steps = mode === 'missing' ? missingSteps(st.missing) : SIGNUP;
  let i = 0, note = '', busy = false;
  if (st.me) { const [f, ...l] = String(st.me.name || '').split(' '); v.first = f || ''; v.last = l.join(' '); v.email = st.me.email || ''; }

  function missingSteps(list) {
    const out = [];
    for (const k of ['company', 'interest', 'industry']) if (list.includes(k)) out.push(k);
    if (list.includes('password')) out.push('password', 'confirm');
    return out.length ? out : ['company'];
  }

  function draw(focus = true) {
    const k = steps[i], d = Q[k], q = typeof d.q === 'function' ? d.q(v) : d.q;
    const total = steps.length;
    const top = mode === 'missing' ? `One thing before the tool · ${i + 1} of ${total}` : mode === 'signin' ? 'Sign in' : `Your free account · ${i + 1} of ${total}`;
    let ctl = '';
    if (d.type === 'text' || d.type === 'email') {
      ctl = `<input class="txt" id="g-in" type="${d.type}" autocomplete="${d.ac}" maxlength="${d.max}" value="${esc(v[k])}" ${d.type === 'email' ? 'inputmode="email" autocapitalize="off" spellcheck="false"' : 'autocapitalize="words"'} aria-labelledby="g-q" aria-describedby="g-h">`;
    } else if (d.type === 'company') {
      ctl = `<input class="txt" id="g-in" type="text" autocomplete="organization" maxlength="120" value="${esc(v.company)}" aria-labelledby="g-q" aria-describedby="g-h">
        <div style="margin-top:10px"><button type="button" class="linkbtn" data-g="nocompany">No company yet →</button></div>`;
    } else if (d.type === 'pick') {
      ctl = `<div class="opts${d.two ? ' two' : ''}" role="group" aria-labelledby="g-q">${d.list.map((o, n) => `<button type="button" class="opt" data-g="pick" data-v="${esc(o)}" aria-pressed="${v[k] === o}">${n < 9 ? `<span class="key" aria-hidden="true">${n + 1}</span>` : ''}<span>${esc(o)}</span></button>`).join('')}</div>`;
    } else if (d.type === 'password') {
      const key = k === 'login' ? 'password' : k;
      ctl = `<div class="pw"><input class="txt" id="g-in" type="password" autocomplete="${d.ac}" minlength="${k === 'login' ? 1 : 10}" maxlength="200" value="${esc(v[key])}" aria-labelledby="g-q" aria-describedby="g-h">
        <button type="button" class="eye" data-g="eye" aria-pressed="false" aria-label="Show password">${EYE}</button><button type="button" class="eye" data-g="copy" aria-label="Copy password">${COPY}</button></div>
        ${k === 'login' ? '<div style="margin-top:10px"><button type="button" class="linkbtn" data-g="forgot">Forgot your password?</button></div>' : ''}`;
    } else if (d.type === 'consent') {
      ctl = `<label class="check"><input type="checkbox" id="g-consent" ${v.consent ? 'checked' : ''}><span>${esc(CONSENT)}</span></label>`;
    }
    const label = d.type === 'consent' ? `Open ${esc(name)} <span aria-hidden="true">→</span>`
      : k === 'login' ? 'Sign in <span aria-hidden="true">→</span>'
      : i === steps.length - 1 && mode === 'missing' ? `Open ${esc(name)} <span aria-hidden="true">→</span>`
      : 'OK <span aria-hidden="true">✓</span>';
    const okBtn = d.type === 'pick' ? '' : `<div class="okrow"><button type="button" class="btn${d.type === 'consent' || k === 'login' ? ' big' : ''}" data-g="ok" data-primary ${busy ? 'disabled' : ''}>${busy ? 'One moment…' : label}</button><span class="kbd">or press Enter ↵</span></div>`;
    const firstScreen = mode === 'signup' && i === 0;
    host.innerHTML = `<div class="scr${RM.matches ? '' : ' enter'}">
      <div class="qtop"><button type="button" class="back" data-g="back">← Back</button><span class="count">${top}</span></div>
      ${firstScreen ? `${googleSlot('g-gconsent')}<input type="checkbox" id="g-gconsent" hidden>` : ''}
      <h2 class="qh" id="g-q">${esc(q)}</h2>
      <p class="hint" id="g-h">${esc(d.hint)}</p>
      <div class="ctl">${ctl}${okBtn}<p class="nudge" role="status">${esc(note)}</p></div>
      ${firstScreen ? '<p class="alt"><button type="button" class="linkbtn" data-g="signin">Already have an account? Sign in</button></p>' : ''}
      ${mode === 'signin' ? '<p class="alt"><button type="button" class="linkbtn" data-g="signup">New here? Make a free account</button></p>' : ''}
    </div>`;
    if (firstScreen) {
      const gs = host.querySelector('.g-slot');
      mountGoogle(gs, { source: 'home', door: 'tools', path, onError: (m) => { note = m; paintNote(); }, onDone: (out) => after(out) });
    }
    note = '';
    if (focus) {
      const el = host.querySelector('#g-in') || host.querySelector('.opt[aria-pressed="true"]') || host.querySelector('.opt') || host.querySelector('#g-consent') || host.querySelector('[data-primary]');
      if (el) { try { el.focus({ preventScroll: true }); } catch { el.focus(); } }
    }
  }
  const paintNote = () => { const n = host.querySelector('.nudge'); if (n) n.textContent = note; };
  const say = (m) => { note = m; paintNote(); };

  async function after(out) {
    // A token is in this browser now: read the account back.
    const s = await state();
    if (s.kind === 'missing') { mode = 'missing'; steps = missingSteps(s.missing); i = 0; st = s; draw(); return; }
    if (s.kind === 'full') { ready(s.me); return; }
    if (out && out.existing && !out.token) { mode = 'signin'; steps = SIGNIN; i = 0; note = 'This email already has an account. Sign in with your password.'; draw(); return; }
    say('We could not open your account just now. Try again in a minute.');
  }

  async function next() {
    const k = steps[i], d = Q[k], inp = host.querySelector('#g-in');
    if (inp) {
      const val = d.type === 'password' ? inp.value : inp.value.trim();
      if (k === 'login') v.password = val; else v[k] = val;
    }
    if (k === 'first' && !v.first) return say('Your first name, please.');
    if (k === 'last' && !v.last) return say('Your surname, please.');
    if (k === 'email' && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(v.email)) return say(v.email ? 'That email does not look complete. Check the part after the @.' : 'Your email, please.');
    if (k === 'company') { if (!v.company && !v.noCompany) return say('Your company’s name, or tap “No company yet”.'); if (v.company) v.noCompany = false; }
    if ((k === 'interest' || k === 'industry') && !v[k]) return say('Tap the one that fits.');
    if (k === 'password' && v.password.length < 10) return say('At least 10 characters, please.');
    if (k === 'confirm' && v.confirm !== v.password) { v.confirm = ''; return say('The two passwords are different. Type it once more.'); }
    if (k === 'login' && !v.password) return say('Your password, please.');
    if (k === 'consent') v.consent = !!(host.querySelector('#g-consent') || {}).checked;
    if (i < steps.length - 1) { i++; draw(); return; }
    // The last step: make, complete or open the account.
    busy = true; draw(false);
    try {
      if (mode === 'signup') {
        const out = await A.signup({ first: v.first, last: v.last, email: v.email, consent: v.consent, source: 'home', type: 'full',
          company: v.noCompany ? '' : v.company, noCompany: v.noCompany, interest: v.interest, industry: v.industry,
          password: v.password, confirm: v.confirm, utm: utm(), door: 'tools', path });
        busy = false;
        if (out.token) return after(out);
        v.password = ''; v.confirm = '';
        mode = 'signin'; steps = SIGNIN; i = 1; note = 'This email already has an account. Sign in with your password.'; draw(); return;
      }
      if (mode === 'signin') {
        await A.login(v.email, v.password);
        busy = false; return after({});
      }
      // Missing details: only those, once.
      await A.complete({ company: v.noCompany ? '' : v.company, noCompany: v.noCompany, interest: v.interest, industry: v.industry, password: v.password, confirm: v.confirm });
      busy = false; return after({});
    } catch (ex) {
      busy = false; draw(false);
      say(ex && ex.message && !/fetch|network|load failed|import/i.test(ex.message) ? ex.message : 'We could not reach the account service just now. Try again in a minute.');
    }
  }

  host.onclick = (e) => {
    const b = e.target.closest('[data-g]'); if (!b || busy) return;
    const act = b.dataset.g;
    if (act === 'ok') return next();
    if (act === 'back') { if (i === 0) { if (mode === 'signin' && st.kind === 'guest') { mode = 'signup'; steps = SIGNUP; i = 0; return draw(); } return cancel && cancel(); } i--; return draw(); }
    if (act === 'pick') { const k = steps[i]; v[k] = b.dataset.v; host.querySelectorAll('.opt').forEach((o) => o.setAttribute('aria-pressed', String(o === b))); setTimeout(next, RM.matches ? 40 : 200); return; }
    if (act === 'nocompany') { v.noCompany = true; v.company = ''; const inp = host.querySelector('#g-in'); if (inp) inp.value = ''; return next(); }
    if (act === 'signin') { mode = 'signin'; steps = SIGNIN; i = 0; return draw(); }
    if (act === 'signup') { mode = 'signup'; steps = SIGNUP; i = 0; return draw(); }
    if (act === 'forgot') { import('/reset-box.js').then((m) => m.openReset({ email: v.email })).catch(() => say('Write to support@exploraself.com and we will help you in.')); return; }
    if (act === 'eye') { const f = host.querySelector('#g-in'), show = f.type === 'password'; f.type = show ? 'text' : 'password'; b.setAttribute('aria-pressed', String(show)); b.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); return; }
    if (act === 'copy') { const f = host.querySelector('#g-in'); if (!f || !f.value) return; navigator.clipboard.writeText(f.value).then(() => say('Copied.'), () => say('Copy did not work in this browser.')); }
  };
  host.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && !busy) {
      if (e.target.matches('button, a')) return;
      e.preventDefault(); next(); return;
    }
    if (!e.target.matches('input') && /^[1-9]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const o = host.querySelectorAll('.opt')[Number(e.key) - 1]; if (o) { e.preventDefault(); o.click(); }
    }
  };
  host.oninput = () => { if (note) say(''); };
  draw();
}
