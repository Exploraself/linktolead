/* The access step of every free tool (Alexandru, 2 Nov 2026): a tool needs a
 * full free account. Three cases, one rule (missingOf on the server, the same
 * as everywhere):
 *
 *   signed out          the full account form, one field at a time, drawn in
 *                       the page (/account-box.js, variant 'full', landing
 *                       'tools'). An email that already has an account, or
 *                       "Already have an account?", signs in right here.
 *   details missing     only what is missing, asked once, one field at a
 *                       time, then the tool opens (/api/complete).
 *   a full account      one button, "Open <tool>", nothing to type.
 *
 * Every password field has its show-password eye. The founder's answers in a
 * tool stay on the device first (run.js); this file only opens the door, and
 * records each use (/api/tools), with a small outbox so a result saved while
 * offline goes the next time. */
import * as A from '/account.js';
import { INTERESTS, INDUSTRIES } from '/forms.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const EYE = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const OK_EMAIL = /^[^@\s]+@[^@\s.]+\.[^@\s]+$/;

// The last full account seen on this device, so a tool still opens with no
// network (its answers are on the device anyway). Never the token: account.js
// keeps that, under its own key.
const ME = 'es-tools-me', OUTBOX = 'es-tools-outbox';
const recall = () => { try { const v = JSON.parse(localStorage.getItem(ME) || 'null'); return v && v.email ? v : null; } catch { return null; } };
const remember = (v) => { try { localStorage.setItem(ME, JSON.stringify(v)); } catch { /* private mode */ } };
const forget = () => { try { localStorage.removeItem(ME); } catch { /* private mode */ } };

/** A preview copy of the site (*.pages.dev, or this computer) has no
 *  accounts: the page says so and lets the tool open without one. */
export const isPreview = () => { try { return /\.pages\.dev$/.test(location.hostname) || /^(localhost|127\.0\.0\.1)$/.test(location.hostname); } catch { return false; } };

/** Where this browser stands. { kind: 'out' | 'missing' | 'full' | 'offline', me, first, missing } */
export async function where() {
  if (!A.joined()) return { kind: 'out' };
  const st = await A.pull();
  if (st && st.gone) { A.signOut(); forget(); return { kind: 'out' }; }
  if (st && st.ok && st.me) {
    const me = st.me, first = String(me.name || '').trim().split(/\s+/)[0] || '';
    if (Array.isArray(me.missing) && me.missing.length) { forget(); return { kind: 'missing', me, first, missing: me.missing }; }
    remember({ email: me.email, first });
    return { kind: 'full', me, first };
  }
  const r = recall();
  return r ? { kind: 'full', me: { email: r.email, name: r.first }, first: r.first, offline: true } : { kind: 'offline' };
}

// ── Recording a use ─────────────────────────────────────────────────────────
async function post(body) {
  const r = await fetch('/api/tools', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...body, token: A.token(), tz: A.tz() }) });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, ...data };
}
/** Send what waited (results saved while offline). Never throws. */
export async function flush() {
  if (!A.joined()) return;
  let box = [];
  try { box = JSON.parse(localStorage.getItem(OUTBOX) || '[]'); } catch { box = []; }
  if (!box.length) return;
  const left = [];
  for (const item of box.slice(-20)) {
    try { const r = await post(item); if (!(r.ok || (r.status >= 400 && r.status < 500 && r.status !== 403))) left.push(item); } catch { left.push(item); }
  }
  try { if (left.length) localStorage.setItem(OUTBOX, JSON.stringify(left)); else localStorage.removeItem(OUTBOX); } catch { /* private mode */ }
}
/** One use: 'open', 'result' (with the founder's result) or 'subscribe'.
 *  A result that cannot go now waits in the outbox. Resolves to the answer,
 *  or null. */
export async function record(tool, event, result) {
  if (!A.joined()) return null;
  const item = { tool, event, ...(result ? { result } : {}) };
  try {
    const r = await post(item);
    if (r.ok) return r;
    if (event === 'result' && (r.status >= 500 || !r.status)) throw new Error('later');
    return r;
  } catch {
    if (event === 'result') {
      try { const box = JSON.parse(localStorage.getItem(OUTBOX) || '[]'); box.push(item); localStorage.setItem(OUTBOX, JSON.stringify(box.slice(-20))); } catch { /* private mode */ }
    }
    return null;
  }
}
/** What this founder has used, and their 12 Days. Null when signed out or offline. */
export async function uses() {
  if (!A.joined()) return null;
  try { const r = await fetch(`/api/tools?t=${encodeURIComponent(A.token())}`); return r.ok ? await r.json() : null; } catch { return null; }
}

// ── Drawing the step ────────────────────────────────────────────────────────
const pwField = (id, label, auto = 'new-password') => `<label class="f">${label}<span class="pw"><input class="inp" id="${id}" type="password" autocomplete="${auto}" minlength="10" maxlength="200"><button type="button" class="eye" data-eye="${id}" aria-pressed="false" aria-label="Show password">${EYE}</button></span></label>`;
function eyes(root) {
  root.querySelectorAll('[data-eye]').forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault();
    const f = root.querySelector('#' + b.dataset.eye), show = f.type === 'password';
    f.type = show ? 'text' : 'password';
    b.setAttribute('aria-pressed', String(show));
    b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  }));
}

/**
 * Draw the access step in `el` for `tool` (a catalog.js entry). `onOpen(who)`
 * runs once the founder may use it: who is { first, email, preview }.
 * `label` is the confirm button's words (default: the tool's own). A founder
 * who has just signed up or signed in here goes straight in; one who arrives
 * already signed in taps the one button. `auto`: always straight in (the
 * toolkit page). `signin`: { email, taken } opens on the sign-in.
 */
export function access(el, { tool, onOpen, label = '', auto = false, signin: startSignin = null }) {
  const btn = label || tool.open.btn;
  let box = null;
  const draw = (html) => { el.innerHTML = html; };
  const previewNote = () => (isPreview() ? `<p class="pvnote">Preview copy of the site: accounts are switched off here, so you can look at the tool without one. On linktolead.exploraself.com it asks for the free account first. <button type="button" class="lk" data-preview>Open it without an account →</button></p>` : '');
  el.onclick = (e) => { if (e.target.closest('[data-preview]')) { e.preventDefault(); onOpen({ first: '', email: '', preview: true }); } };

  const go = async (now = false) => {
    draw('<div class="acc" aria-busy="true"><p class="lede" role="status">One moment…</p></div>');
    const w = await where();
    if (w.kind === 'full' && (now === true || auto)) return onOpen({ first: w.first, email: w.me.email || '' });
    if (w.kind === 'full') return full(w);
    if (w.kind === 'missing') return missing(w);
    if (w.kind === 'offline') return offline();
    return out();
  };

  // A full account: one tap.
  function full(w) {
    const first = w.first;
    draw(`<div class="acc">
      <p class="eb">Your free account</p>
      <h2>Welcome back${first ? ', ' + esc(first) : ''}.</h2>
      <p class="lede">Same account. One tap, nothing to type.</p>
      <p class="what">${esc(tool.open.p)}</p>
      <div class="arow"><button type="button" class="go" data-open>${esc(btn)} <span aria-hidden="true">→</span></button></div>
      <p class="fine">${esc(tool.open.fine)}</p>
      <p class="fine">Not ${first ? esc(first) : 'you'}? <button type="button" class="lk" data-other>Sign in as someone else</button></p>
    </div>`);
    el.querySelector('[data-open]').addEventListener('click', () => onOpen({ first, email: w.me.email || '' }));
    el.querySelector('[data-other]').addEventListener('click', () => { A.signOut(); forget(); try { localStorage.removeItem('ftb-me'); } catch { /* private mode */ } signin(''); });
  }

  // Signed in, details missing: only those, once, one at a time.
  function missing(w) {
    const need = ['company', 'interest', 'industry', 'password'].filter((k) => w.missing.includes(k));
    const opt = (list) => `<option value="">Choose one…</option>${list.map((x) => `<option>${esc(x)}</option>`).join('')}`;
    const FIELDS = {
      company: `<label class="f">Your company<input class="inp" id="tc-company" autocomplete="organization" maxlength="120" placeholder="Your business name"></label>
        <label style="display:flex;align-items:center;gap:10px;font-size:14px;min-height:32px"><input type="checkbox" id="tc-noco" style="width:18px;height:18px;accent-color:#B4975F"> No company yet</label>`,
      interest: `<label class="f">What do you want most from the business?<select class="inp" id="tc-interest">${opt(INTERESTS)}</select></label>`,
      industry: `<label class="f">Your industry<select class="inp" id="tc-industry">${opt(INDUSTRIES)}</select></label>`,
      password: `${pwField('tc-pw', 'A password · at least 10 characters')}<p class="fine" style="margin:0">You sign in with your email and this password.</p>`,
    };
    draw(`<div class="acc">
      <p class="eb">Your free account</p>
      <h2>One thing before the tool</h2>
      <p class="lede">Only what is missing, asked once. Then the tool opens.</p>
      ${w.me.email ? `<p class="fine" style="margin:0">${w.first ? esc(w.first) + ' · ' : ''}<b>${esc(w.me.email)}</b></p>` : ''}
      <form class="tc" novalidate style="display:flex;flex-direction:column;gap:12px">
        ${need.map((k, i) => `<div data-step="${i}" style="display:flex;flex-direction:column;gap:8px"${i ? ' hidden' : ''}>${FIELDS[k]}</div>`).join('')}
        <p class="err" role="alert"></p>
        <div class="arow"><button type="submit" class="go">${need.length > 1 ? 'Next' : esc(btn)} <span aria-hidden="true">→</span></button>${need.length > 1 ? '<span class="fine" data-count style="margin:0"></span>' : ''}</div>
      </form>
      <p class="fine">Free, as before. Your answers stay yours.</p>
    </div>`);
    eyes(el);
    const form = el.querySelector('form'), err = el.querySelector('.err'), sub = form.querySelector('[type=submit]');
    const nc = el.querySelector('#tc-noco'), co = el.querySelector('#tc-company');
    if (nc && co) nc.addEventListener('change', () => { co.disabled = nc.checked; if (nc.checked) co.value = ''; });
    const v = (id) => { const x = el.querySelector('#' + id); return x ? x.value.trim() : ''; };
    const CHECK = {
      company: () => (nc && nc.checked) || v('tc-company') ? '' : 'Your company’s name, or tick “No company yet”.',
      interest: () => (INTERESTS.includes(v('tc-interest')) ? '' : 'Choose what you want most from the business.'),
      industry: () => (INDUSTRIES.includes(v('tc-industry')) ? '' : 'Choose your industry.'),
      password: () => ((el.querySelector('#tc-pw') || { value: '' }).value.length >= 10 ? '' : 'At least 10 characters, please.'),
    };
    let i = 0;
    const show = (n) => {
      i = n;
      form.querySelectorAll('[data-step]').forEach((d) => { d.hidden = Number(d.dataset.step) !== i; });
      sub.innerHTML = `${i === need.length - 1 ? esc(btn) : 'Next'} <span aria-hidden="true">→</span>`;
      const c = form.querySelector('[data-count]'); if (c) c.textContent = `${i + 1} of ${need.length}`;
      const f = form.querySelector(`[data-step="${i}"] input, [data-step="${i}"] select`); if (f) f.focus();
    };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const p = CHECK[need[i]](); err.textContent = p;
      if (p) return;
      if (i < need.length - 1) return show(i + 1);
      const f = {};
      if (need.includes('company')) { f.noCompany = !!(nc && nc.checked); f.company = v('tc-company'); }
      if (need.includes('interest')) f.interest = v('tc-interest');
      if (need.includes('industry')) f.industry = v('tc-industry');
      if (need.includes('password')) { const pw = el.querySelector('#tc-pw').value; f.password = pw; f.confirm = pw; }
      sub.disabled = true; sub.textContent = 'Saving…';
      try { await A.complete(f); return go(true); } catch (ex) { err.textContent = (ex && ex.message) || 'It did not save. Try again in a minute.'; sub.disabled = false; show(i); }
    });
    if (need.length) show(0); else go();
  }

  // Signed out: the full account, one field at a time, in the page.
  function out() {
    draw(`<div class="gatebox" id="tool-gate"></div>${previewNote()}`);
    const gate = el.querySelector('#tool-gate');
    (box || (box = import('/account-box.js'))).then((m) => m.open({ gate, opener: null, stage: null, variant: 'full', landing: 'tools', steps: true, inline: true,
      cta: `${btn.toUpperCase()} →`,
      onDone: () => go(true),
      onExisting: (email) => signin(email, true),
      onSignin: (email) => signin(email) }))
      .catch(() => { box = null; draw(`<div class="acc"><p class="lede" role="alert">The account form did not load. Check your connection and reload the page.</p></div>${previewNote()}`); });
  }

  // An email that already has an account, or "Already have an account?".
  function signin(email = '', taken = false) {
    draw(`<div class="acc">
      <p class="eb">Welcome back</p>
      <h2>Sign in to open ${esc(tool.name)}</h2>
      <p class="lede">${taken ? 'This email already has a free account.' : 'Your free account opens every tool.'} Sign in with your email and password.</p>
      <div data-google></div>
      <form class="si" novalidate style="display:flex;flex-direction:column;gap:12px">
        <label class="f">Email<input class="inp" id="ts-email" type="email" autocomplete="email" inputmode="email" maxlength="120" value="${esc(email)}"></label>
        ${pwField('ts-pw', 'Password', 'current-password')}
        <p class="err" role="alert"></p>
        <div class="arow"><button type="submit" class="go">Sign in <span aria-hidden="true">→</span></button></div>
      </form>
      <p class="fine" style="display:flex;flex-wrap:wrap;gap:4px 18px"><button type="button" class="lk" data-reset>Forgot your password?</button><button type="button" class="lk" data-link>No password? Email me a sign-in link</button></p>
      <p class="fine">New here? <button type="button" class="lk" data-new>Create your free account</button></p>
    </div>${previewNote()}`);
    eyes(el);
    const err = el.querySelector('.err'), form = el.querySelector('form.si');
    const em = el.querySelector('#ts-email'), pw = el.querySelector('#ts-pw');
    (email ? pw : em).focus();
    // "Continue with Google", when it is switched on.
    import('/google.js').then((G) => {
      const slot = el.querySelector('[data-google]'); if (!slot) return;
      slot.innerHTML = G.slot('');
      G.mount(slot.querySelector('.g-slot'), { landing: 'tools', source: 'home', onDone: () => go(true), onError: (m) => { err.textContent = m; } });
    }).catch(() => {});
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const to = em.value.trim();
      if (!OK_EMAIL.test(to)) { err.textContent = 'That email does not look complete.'; return; }
      if (!pw.value) { err.textContent = 'Your password, please. No password? Email yourself a sign-in link below.'; return; }
      const b = form.querySelector('[type=submit]'); b.disabled = true; b.textContent = 'One moment…'; err.textContent = '';
      try { const out = await A.login(to, pw.value); if (out && out.token) return go(true); err.textContent = 'That did not work. Check the email and password.'; }
      catch (ex) { err.textContent = (ex && ex.message && !/fetch|network|load failed/i.test(ex.message)) ? ex.message : 'We could not reach the account service just now. Try again in a minute.'; }
      b.disabled = false; b.innerHTML = 'Sign in <span aria-hidden="true">→</span>';
    });
    el.querySelector('[data-reset]').addEventListener('click', () => import('/reset-box.js').then((m) => m.openReset({ email: em.value.trim() })));
    el.querySelector('[data-link]').addEventListener('click', () => import('/reset-box.js').then((m) => m.openReset({ email: em.value.trim(), mode: 'link' })));
    el.querySelector('[data-new]').addEventListener('click', () => out());
  }

  function offline() {
    draw(`<div class="acc">
      <p class="eb">Your free account</p>
      <h2>We could not reach your account just now.</h2>
      <p class="lede">Check your connection, then try again. Nothing you did is lost.</p>
      <div class="arow"><button type="button" class="go" data-again>Try again</button></div>
    </div>${previewNote()}`);
    el.querySelector('[data-again]').addEventListener('click', () => go());
  }

  if (startSignin) signin(startSignin.email || '', !!startSignin.taken); else go();
  return { refresh: () => go() };
}
