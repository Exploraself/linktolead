/* The way into the Growth Toolkit (Alexandru, 2 Nov 2026).
 *
 *   an account           in at once: one "Open" tap on the cover.
 *   a pass               in at once (a code was typed before, on this browser).
 *   neither              their own code by email, one field at a time: first
 *                        name, email, consent, "Send my code"; then the six
 *                        digits. Or sign in, or make the free account, one
 *                        field at a time as on every ExploraSelf form.
 *   needAccount          (12 Days to Start Winning: letters need an account)
 *                        the account steps only.
 *
 * state() says which; open() runs the steps inside `host` and calls ready(me)
 * (me is null with a pass). Codes come from /api/toolkit; addresses on
 * Alexandru's list skip the code. Sign-ups from here carry door 'tools', so
 * their welcome letter opens the toolkit. */
import * as A from '/account.js';
import { INTERESTS, INDUSTRIES, CONSENT, utm } from '/forms.js';
import { slot as googleSlot, mount as mountGoogle } from '/google.js';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
const EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const COPY = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
const PASS = 'ftb-toolkit-pass';
export const firstOf = (me) => String((me && me.name) || '').trim().split(/\s+/)[0] || '';
export const pass = () => { try { return localStorage.getItem(PASS) || ''; } catch { return ''; } };
export const keepPass = (p) => { try { localStorage.setItem(PASS, p); } catch { /* private mode */ } };
export const dropPass = () => { try { localStorage.removeItem(PASS); } catch { /* private mode */ } };
/** Quick, with no network: may this browser open the toolkit? */
export const mayOpen = () => A.joined() || !!pass();

async function post(body) {
  const r = await fetch('/api/toolkit', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'That did not go through.');
  return d;
}
/** A code from the email's button (?email=…&code=…): checked, kept as a pass. */
export async function redeem(email, code) {
  const d = await post({ action: 'check', email, code });
  if (d.pass) keepPass(d.pass);
  return !!d.pass;
}

/** 'full' (an account), 'pass', 'guest' or 'offline', and the founder. */
export async function state() {
  if (A.joined()) {
    const r = await A.pull();
    if (!r) return { kind: 'offline', me: null };
    if (!r.gone) return { kind: 'full', me: r.me || {} };
    A.signOut();
  }
  return pass() ? { kind: 'pass', me: null } : { kind: 'guest', me: null };
}

const SIGNUP = ['first', 'last', 'email', 'company', 'interest', 'industry', 'password', 'confirm', 'consent'];
const SIGNIN = ['email', 'login'];
const CODE = ['first', 'email', 'askcode'];
const ENTER = ['code'];

const Q = {
  first: { q: 'What’s your first name?', hint: 'The Growth Toolkit is free. Your answers stay on your device.', type: 'text', ac: 'given-name', max: 60 },
  last: { q: (v) => `Nice to meet you${v.first ? ', ' + v.first : ''}. Your surname?`, hint: 'As you would sign a letter.', type: 'text', ac: 'family-name', max: 60 },
  email: { q: 'Your email', hint: (m) => (m === 'code' ? 'Your own code goes there, with a look inside the toolkit.' : 'You sign in with it.'), type: 'email', ac: 'email', max: 120 },
  company: { q: 'Your company’s name', hint: 'Just starting? Tap “No company yet”.', type: 'company', ac: 'organization', max: 120 },
  interest: { q: 'What do you want most from the business?', hint: 'The first one that is true.', type: 'pick', list: INTERESTS },
  industry: { q: 'Your industry', hint: 'The closest one. “Other” is fine.', type: 'pick', list: INDUSTRIES, two: true },
  password: { q: 'Choose a password', hint: 'At least 10 characters. You sign in with your email and this password.', type: 'password', ac: 'new-password' },
  confirm: { q: 'Type it once more', hint: 'So a typo never locks you out.', type: 'password', ac: 'new-password' },
  consent: { q: 'Last step', hint: 'Your account opens the moment you tap.', type: 'consent' },
  login: { q: 'Your password', hint: 'The one you chose when you made your account.', type: 'password', ac: 'current-password' },
  askcode: { q: 'Last step', hint: 'Your code arrives in a minute. Alexandru and the team are here if it doesn’t.', type: 'consent' },
  code: { q: (v) => `Your code${v.first ? ', ' + v.first : ''}`, hint: (m, v) => `The six digits we sent to ${v.email}. Nothing yet? Check your spam folder.`, type: 'code' },
};

/**
 * Run the way in, inside `host`. Options:
 *   name         the tool's name, for the last button ("Open Cash runway →")
 *   path         the tool's page ('/runway/'), for the welcome letter
 *   st           the result of state()
 *   needAccount  only the account steps (12 Days to Start Winning)
 *   ready        called with the founder (or null, with a pass)
 *   cancel       called by "← Back" on the first step
 */
export function open(host, { name = 'Growth Toolkit', path = '/tools/', st = { kind: 'guest' }, needAccount = false, ready, cancel } = {}) {
  const v = { first: '', last: '', email: '', company: '', noCompany: false, interest: '', industry: '', password: '', confirm: '', consent: false, code: '' };
  let mode = needAccount ? 'signup' : 'code';
  let steps = needAccount ? SIGNUP : CODE;
  let i = 0, note = '', busy = false;
  const into = (m, list, at = 0, msg = '') => { mode = m; steps = list; i = at; note = msg; draw(); };

  function draw(focus = true) {
    const k = steps[i], d = Q[k], q = typeof d.q === 'function' ? d.q(v) : d.q, hint = typeof d.hint === 'function' ? d.hint(mode, v) : d.hint;
    const top = mode === 'signin' ? 'Sign in' : mode === 'code' || mode === 'enter' ? `Growth Toolkit · free${mode === 'code' ? ` · ${i + 1} of ${steps.length}` : ''}` : `Your free account · ${i + 1} of ${steps.length}`;
    let ctl = '';
    if (d.type === 'text' || d.type === 'email') {
      ctl = `<input class="txt" id="g-in" type="${d.type}" autocomplete="${d.ac}" maxlength="${d.max}" value="${esc(v[k])}" ${d.type === 'email' ? 'inputmode="email" autocapitalize="off" spellcheck="false"' : 'autocapitalize="words"'} aria-labelledby="g-q" aria-describedby="g-h">`;
    } else if (d.type === 'code') {
      ctl = `<input class="txt" id="g-in" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]*" value="${esc(v.code)}" style="letter-spacing:.3em;font-size:28px;max-width:240px" aria-labelledby="g-q" aria-describedby="g-h">
        <div style="margin-top:10px"><button type="button" class="linkbtn" data-g="again">Send me a new code</button></div>`;
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
    const label = k === 'askcode' ? 'Send my code <span aria-hidden="true">→</span>'
      : k === 'code' || d.type === 'consent' ? `Open ${esc(name)} <span aria-hidden="true">→</span>`
      : k === 'login' ? 'Sign in <span aria-hidden="true">→</span>'
      : 'OK <span aria-hidden="true">✓</span>';
    const big = d.type === 'consent' || k === 'login' || k === 'code';
    const okBtn = d.type === 'pick' ? '' : `<div class="okrow"><button type="button" class="btn${big ? ' big' : ''}" data-g="ok" data-primary ${busy ? 'disabled' : ''}>${busy ? 'One moment…' : label}</button><span class="kbd">or press Enter ↵</span></div>`;
    const firstScreen = i === 0 && (mode === 'code' || mode === 'signup');
    const others = [
      mode !== 'signin' ? '<button type="button" class="linkbtn" data-g="signin">Have an account? Sign in</button>' : '',
      mode === 'code' && i === 0 ? '<button type="button" class="linkbtn" data-g="signup">Make a free account instead</button>' : '',
      mode === 'signin' && !needAccount ? '<button type="button" class="linkbtn" data-g="code">No account? Get a free code</button>' : '',
      mode === 'signin' && needAccount ? '<button type="button" class="linkbtn" data-g="signup">New here? Make a free account</button>' : '',
      mode === 'signup' && i === 0 && !needAccount ? '<button type="button" class="linkbtn" data-g="code">Just the toolkit? Get a free code</button>' : '',
    ].filter(Boolean);
    host.innerHTML = `<div class="scr${RM.matches ? '' : ' enter'}">
      <div class="qtop"><button type="button" class="back" data-g="back">← Back</button><span class="count">${top}</span></div>
      ${firstScreen && mode === 'signup' ? `${googleSlot('g-gconsent')}<input type="checkbox" id="g-gconsent" hidden>` : ''}
      <h2 class="qh" id="g-q">${esc(q)}</h2>
      <p class="hint" id="g-h">${esc(hint)}</p>
      <div class="ctl">${ctl}${okBtn}<p class="nudge" role="status">${esc(note)}</p></div>
      ${others.length && (i === 0 || mode === 'signin') ? `<p class="alt">${others.join('')}</p>` : ''}
    </div>`;
    if (firstScreen && mode === 'signup') {
      mountGoogle(host.querySelector('.g-slot'), { source: 'home', door: 'tools', path, onError: (m) => say(m), onDone: () => afterAccount() });
    }
    note = '';
    if (focus) {
      const el = host.querySelector('#g-in') || host.querySelector('.opt[aria-pressed="true"]') || host.querySelector('.opt') || host.querySelector('#g-consent') || host.querySelector('[data-primary]');
      if (el) { try { el.focus({ preventScroll: true }); } catch { el.focus(); } }
    }
  }
  const say = (m) => { note = m; const n = host.querySelector('.nudge'); if (n) n.textContent = m; };

  async function afterAccount() {
    const s = await state();
    if (s.kind === 'full') return ready(s.me);
    say('We could not open your account just now. Try again in a minute.');
  }

  async function askCode() {
    const d = await post({ action: 'request', first: v.first, email: v.email, consent: v.consent, tz: A.tz() });
    if (d.pass) { keepPass(d.pass); return ready(null); }
    into('enter', ENTER, 0, `Sent. Check ${v.email} for your six digits.`);
  }

  async function next() {
    const k = steps[i], inp = host.querySelector('#g-in');
    if (inp) { const val = Q[k].type === 'password' ? inp.value : inp.value.trim(); if (k === 'login') v.password = val; else v[k] = val; }
    if (k === 'first' && !v.first) return say('Your first name, please.');
    if (k === 'last' && !v.last) return say('Your surname, please.');
    if (k === 'email' && !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(v.email)) return say(v.email ? 'That email does not look complete. Check the part after the @.' : 'Your email, please.');
    if (k === 'company') { if (!v.company && !v.noCompany) return say('Your company’s name, or tap “No company yet”.'); if (v.company) v.noCompany = false; }
    if ((k === 'interest' || k === 'industry') && !v[k]) return say('Tap the one that fits.');
    if (k === 'password' && v.password.length < 10) return say('At least 10 characters, please.');
    if (k === 'confirm' && v.confirm !== v.password) { v.confirm = ''; return say('The two passwords are different. Type it once more.'); }
    if (k === 'login' && !v.password) return say('Your password, please.');
    if (k === 'code' && !/^\d{6}$/.test(v.code)) return say('The six digits from the email, please.');
    if (Q[k].type === 'consent') v.consent = !!(host.querySelector('#g-consent') || {}).checked;
    if (i < steps.length - 1) { i++; draw(); return; }
    busy = true; draw(false);
    try {
      if (mode === 'code') { busy = false; return await askCode(); }
      if (mode === 'enter') { const okd = await redeem(v.email, v.code); busy = false; return okd ? ready(null) : draw(); }
      if (mode === 'signup') {
        const out = await A.signup({ first: v.first, last: v.last, email: v.email, consent: v.consent, source: 'home', type: 'full',
          company: v.noCompany ? '' : v.company, noCompany: v.noCompany, interest: v.interest, industry: v.industry,
          password: v.password, confirm: v.confirm, utm: utm(), door: 'tools', path });
        busy = false;
        if (out.token) return afterAccount();
        v.password = ''; v.confirm = '';
        return into('signin', SIGNIN, 1, 'This email already has an account. Sign in with your password.');
      }
      await A.login(v.email, v.password);
      busy = false; return afterAccount();
    } catch (ex) {
      busy = false; draw(false);
      say(ex && ex.message && !/fetch|network|load failed|import/i.test(ex.message) ? ex.message : 'We could not reach the toolkit just now. Try again in a minute.');
    }
  }

  host.onclick = (e) => {
    const b = e.target.closest('[data-g]'); if (!b || busy) return;
    const act = b.dataset.g;
    if (act === 'ok') return next();
    if (act === 'back') {
      if (i > 0) { i--; return draw(); }
      if (mode === 'enter') return into('code', CODE, 2);
      if (mode !== (needAccount ? 'signup' : 'code')) return into(needAccount ? 'signup' : 'code', needAccount ? SIGNUP : CODE);
      return cancel && cancel();
    }
    if (act === 'pick') { const k = steps[i]; v[k] = b.dataset.v; host.querySelectorAll('.opt').forEach((o) => o.setAttribute('aria-pressed', String(o === b))); setTimeout(next, RM.matches ? 40 : 200); return; }
    if (act === 'nocompany') { v.noCompany = true; v.company = ''; const inp = host.querySelector('#g-in'); if (inp) inp.value = ''; return next(); }
    if (act === 'signin') return into('signin', SIGNIN);
    if (act === 'signup') return into('signup', SIGNUP);
    if (act === 'code') return into('code', CODE);
    if (act === 'again') { busy = true; draw(false); askCode().catch((ex) => { draw(false); say(ex.message); }).finally(() => { busy = false; }); return; }
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
