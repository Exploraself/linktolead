// The two booking pages (Alexandru, 2 Nov 2026): "like a Google Form but
// without Google", one question per screen.
//
//   /book/discovery/  a free 30-minute discovery call, for anyone
//   /book/boardroom/  the 60-minute 1:1, for founders who hold The Boardroom
//
// The questions and the times come from ./slots.js (the server checks the
// same rules again in functions/_booking.js). The answers stay on this device
// until Send (AGENTS.md rule 8); Send posts them once to /api/book, and the
// page says "sent" only when the server says so (rule 6).

import { FORMS, CHOICES, RULES, KINDS, NAME_MAX, slotsFor, byDay, oneTime, myZone, cityOf } from './slots.js';
import * as A from '/account.js';

const root = document.querySelector('[data-book]');
const KIND = root.dataset.book === 'boardroom' ? 'boardroom' : 'discovery';
const KEY = `ftb-book-${KIND}`;
const TZ = myZone();
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const words = (list, key) => (CHOICES[list].find(([k]) => k === key) || [])[1] || '';

// ── Icons (rule 13): drawn in the text colour, hidden from screen readers ──
const I = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  call: I('<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/>'),
  table: I('<rect x="6" y="9" width="12" height="7" rx="1"/><circle cx="3.5" cy="12.5" r="1.5"/><circle cx="20.5" cy="12.5" r="1.5"/>'),
  clock: I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  person: I('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5"/>'),
  mail: I('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>'),
  check: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  arrow: I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  lock: I('<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'),
  meet: I('<rect x="3" y="6.5" width="12" height="11" rx="2"/><path d="m15 10.5 6-3.5v10l-6-3.5"/>'),
  note: I('<path d="M6 3.5h9l3 3V20.5H6z"/><path d="M9 10h6M9 13.5h6M9 17h4"/>'),
};

// ── State, kept on this device ─────────────────────────────────────────────
let S = { answers: {}, name: '', email: '', times: [], step: 0 };
try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved && typeof saved === 'object') S = { ...S, ...saved, step: 0 }; } catch { /* private mode */ }
const keep = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* private mode */ } };
const forget = () => { try { localStorage.removeItem(KEY); } catch { /* private mode */ } };

let me = null; // the signed-in founder, if any
let STEPS = [];
let slots = [];
let busy = false;

/** The screens, in order: the form's questions, then (discovery) name and
 *  email, then three times, then check and send. */
function buildSteps() {
  STEPS = FORMS[KIND].map((f) => ({ id: f.k, kind: 'q', f }));
  if (KIND === 'discovery') STEPS.push({ id: 'name', kind: 'name' }, { id: 'email', kind: 'email' });
  STEPS.push({ id: 'times', kind: 'times' }, { id: 'check', kind: 'check' });
}

// ── Drawing ─────────────────────────────────────────────────────────────────
function top() {
  const n = STEPS.length, i = S.step;
  const label = STEPS[i].kind === 'check' ? 'Check and send' : `${i + 1} of ${n - 1}`;
  return `<div class="top"><div class="pbar" aria-hidden="true"><i style="width:${Math.round(((i + 1) / n) * 100)}%"></i></div>
    <div class="row"><button type="button" class="back" data-back ${i === 0 ? 'disabled' : ''}>← Back</button><span class="where">${label}</span><span></span></div></div>`;
}
const eyebrow = () => (KIND === 'boardroom'
  ? `<p class="eb">${ICON.table}Your 1:1 with Alexandru · 60 minutes</p>`
  : `<p class="eb">${ICON.call}A free call with Alexandru · 30 minutes</p>`);
const goBtn = (label = 'Next', dis = false) => `<div class="act"><button type="button" class="go" data-next ${dis ? 'disabled' : ''}>${esc(label)} ${ICON.arrow}</button><span class="key">or press Enter ↵</span></div>`;

function screen() {
  const st = STEPS[S.step];
  if (st.kind === 'q') return question(st.f);
  if (st.kind === 'name') return `<section class="q">${eyebrow()}<h1 tabindex="-1">${me ? 'Your name, as Alexandru should say it' : 'Your name'}</h1>
    <label class="vh" for="f-name">Your name</label><input id="f-name" class="field" data-field="name" autocomplete="name" maxlength="${NAME_MAX}" value="${esc(S.name)}">
    ${goBtn('Next', !S.name.trim())}</section>`;
  if (st.kind === 'email') return `<section class="q">${eyebrow()}<h1 tabindex="-1">Your email</h1>
    <p class="hint">Alexandru writes back here to confirm a time.</p>
    <label class="vh" for="f-email">Your email</label><input id="f-email" class="field" data-field="email" type="email" inputmode="email" autocomplete="email" maxlength="200" value="${esc(S.email)}">
    ${goBtn('Next', !looksLikeEmail(S.email))}</section>`;
  if (st.kind === 'times') return timesScreen();
  return checkScreen();
}
const looksLikeEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());

function question(f) {
  const a = S.answers[f.k];
  if (f.type === 'one') {
    const opts = CHOICES[f.of].map(([k, w], i) => `<button type="button" class="slot opt" data-one="${k}" aria-pressed="${a === k}"><b>${esc(w)}</b><small>${i + 1}</small></button>`).join('');
    return `<section class="q">${eyebrow()}<h1 tabindex="-1">${esc(f.q)}</h1><div class="opts" role="group" aria-label="${esc(f.q)}">${opts}</div>
      <p class="under">${ICON.check}Tap one. It moves on by itself.</p></section>`;
  }
  if (f.type === 'two') {
    const picked = Array.isArray(a) ? a : [];
    const opts = CHOICES[f.of].map(([k, w]) => `<button type="button" class="slot opt" data-two="${k}" aria-pressed="${picked.includes(k)}" ${picked.length >= 2 && !picked.includes(k) ? 'aria-disabled="true"' : ''}><b>${esc(w)}</b></button>`).join('');
    return `<section class="q">${eyebrow()}<h1 tabindex="-1">${esc(f.q.replace(/ Choose two\.$/, ''))}</h1><p class="hint">Choose two. <b>${picked.length} of 2</b> chosen.</p>
      <div class="opts" role="group" aria-label="${esc(f.q)}">${opts}</div>${goBtn('Next', picked.length !== 2)}</section>`;
  }
  const v = typeof a === 'string' ? a : '';
  return `<section class="q">${eyebrow()}<h1 tabindex="-1">${esc(f.q)}</h1>${f.optional ? '<p class="hint">If you like. You can also leave it empty.</p>' : ''}
    <label class="vh" for="f-${f.k}">${esc(f.q)}</label><textarea id="f-${f.k}" class="field" data-text="${f.k}" maxlength="${f.max}" rows="4">${esc(v)}</textarea>
    <p class="count" data-count>${v.length} / ${f.max}</p>${goBtn(f.optional && !v.trim() ? 'Skip' : 'Next', !f.optional && !v.trim())}</section>`;
}

function timesScreen() {
  slots = slotsFor(KIND);
  S.times = S.times.filter((t) => slots.includes(t));
  const days = byDay(slots, TZ).map((d) => `<div class="day"><h2>${esc(d.day)}</h2><div class="slots">${d.slots.map((s) => {
    const on = S.times.includes(s.iso), full = S.times.length >= RULES.pick && !on;
    return `<button type="button" class="slot" data-slot="${s.iso}" aria-pressed="${on}" ${full ? 'aria-disabled="true"' : ''} aria-label="${esc(s.label)}"><b>${esc(s.time)}</b>${s.rome ? `<small>${esc(s.rome)} Rome</small>` : ''}</button>`;
  }).join('')}</div></div>`).join('');
  const n = S.times.length;
  const zone = TZ === RULES.zone ? 'Rome time.' : `Your time (${esc(cityOf(TZ))}), with Rome’s beside it.`;
  return `<section class="q">${eyebrow()}<h1 tabindex="-1">Pick three times that suit you</h1>
    <p class="hint">Tuesday, Wednesday or Thursday afternoon, online on ${RULES.where}. ${KINDS[KIND].minutes} minutes. ${zone} Alexandru confirms one within 24 hours.</p>
    <div class="days">${days}</div>
    <div class="dock"><p class="picked">${n} of 3 picked<span>${n < 3 ? `Pick ${3 - n} more.` : 'Ready.'}</span></p><button type="button" class="go" data-next ${n !== 3 ? 'disabled' : ''}>Next ${ICON.arrow}</button></div></section>`;
}

function checkScreen() {
  const items = FORMS[KIND].map((f, i) => {
    const a = S.answers[f.k];
    const said = f.type === 'one' ? words(f.of, a) : f.type === 'two' ? (a || []).map((k) => words(f.of, k)).join(' · ') : (a || '—');
    return `<div class="it"><div class="ih">${ICON.note}<b>${esc(f.label)}</b><button type="button" class="chg" data-goto="${i}">Change</button></div><p class="said">${esc(said)}</p></div>`;
  });
  const who = me ? `${esc(me.name || '')} · ${esc(me.email || '')}` : `${esc(S.name)} · ${esc(S.email)}`;
  const whoStep = KIND === 'discovery' ? STEPS.findIndex((s) => s.kind === 'name') : -1;
  items.push(`<div class="it"><div class="ih">${ICON.person}<b>You</b>${whoStep >= 0 ? `<button type="button" class="chg" data-goto="${whoStep}">Change</button>` : ''}</div><p class="said">${who}</p></div>`);
  const tl = [...S.times].sort().map((t) => { const o = oneTime(t, TZ); return `<li><span>${esc(o.day)}, <b>${esc(o.time)}</b></span>${o.rome ? `<small>${esc(o.rome)}</small>` : ''}</li>`; }).join('');
  items.push(`<div class="it"><div class="ih">${ICON.clock}<b>Your three times</b><button type="button" class="chg" data-goto="${STEPS.findIndex((s) => s.kind === 'times')}">Change</button></div><ul class="tl">${tl}</ul></div>`);
  return `<section class="q">${eyebrow()}<h1 tabindex="-1">Check, then send</h1><div class="sum">${items.join('')}</div>
    <p class="note">${ICON.meet}<span>Online, on Google Meet. Alexandru writes back within 24 hours to confirm one of your times, with the link to the call.</span></p>
    <div class="hp" aria-hidden="true"><label for="f-hp">Leave this empty</label><input id="f-hp" data-hp tabindex="-1" autocomplete="off"></div>
    <div data-err></div>
    <div class="act"><button type="button" class="go" data-send>${KIND === 'boardroom' ? 'Send my request' : 'Send my request'} ${ICON.arrow}</button></div></section>`;
}

function doneScreen(email, copy) {
  return `<section class="q"><div class="tick">${ICON.check}</div><h1 tabindex="-1">Sent. Thank you.</h1>
    <p class="lede">Alexandru writes back within 24 hours to confirm one of your three times. Online, on Google Meet.</p>
    <div class="wait"><p><b>What happens now</b></p><p>${copy ? `A copy of your request is on its way to <b>${esc(email)}</b>.` : 'Keep an eye on your inbox.'} When Alexandru confirms, you get the time and the link to the call.</p></div>
    ${me ? '<a class="ghost" href="/ground-plan/#home">Back to my Base Camp</a>' : '<a class="ghost" href="https://exploraself.com/">Back to exploraself.com</a>'}</section>`;
}

/** The calm door for anyone who may not book the 1:1 yet. */
function door(signedIn) {
  root.innerHTML = `<section class="door"><div class="lock">${ICON.lock}</div><p class="eb">${ICON.table}Your 1:1 with Alexandru</p>
    <h1 tabindex="-1">Your 1:1 comes with The Boardroom</h1>
    <p class="lede">The Boardroom opens Levels 04 and 05 and one hour with Alexandru, after Alexandru and the team have read your first three levels.</p>
    <a class="go" href="/boardroom/">See what The Boardroom holds ${ICON.arrow}</a>
    ${signedIn ? '' : `<p class="muted">Already in The Boardroom? <a href="/ground-plan/?next=${encodeURIComponent('/book/boardroom/')}#signin">Sign in</a> and come back here.</p>`}
    <p class="muted">Want a first conversation instead? <a href="/book/discovery/">Book a free discovery call</a>.</p></section>`;
  root.querySelector('h1').focus();
}

function render(focus = true) {
  root.innerHTML = top() + screen();
  if (!focus) return;
  const f = root.querySelector('input.field, textarea.field');
  if (f && matchMedia('(hover:hover) and (pointer:fine)').matches) { f.focus(); try { f.setSelectionRange(f.value.length, f.value.length); } catch { /* email fields have no caret range */ } } else root.querySelector('h1')?.focus();
}
const go = (i) => { S.step = Math.max(0, Math.min(STEPS.length - 1, i)); keep(); render(); window.scrollTo(0, 0); };
const next = () => { if (canNext()) go(S.step + 1); };

function canNext() {
  const st = STEPS[S.step];
  if (st.kind === 'q') {
    const a = S.answers[st.f.k];
    if (st.f.type === 'one') return !!a;
    if (st.f.type === 'two') return Array.isArray(a) && a.length === 2;
    return st.f.optional || !!String(a || '').trim();
  }
  if (st.kind === 'name') return !!S.name.trim();
  if (st.kind === 'email') return looksLikeEmail(S.email);
  if (st.kind === 'times') return S.times.length === RULES.pick;
  return false;
}

// ── Taps, typing and keys ───────────────────────────────────────────────────
root.addEventListener('click', (e) => {
  const t = e.target.closest('button, a');
  if (!t || busy) return;
  if (t.matches('[data-back]')) return go(S.step - 1);
  if (t.matches('[data-next]')) return next();
  if (t.matches('[data-goto]')) return go(Number(t.dataset.goto));
  if (t.matches('[data-send]')) return send();
  const st = STEPS[S.step];
  if (t.dataset.one) {
    S.answers[st.f.k] = t.dataset.one; keep();
    root.querySelectorAll('[data-one]').forEach((b) => b.setAttribute('aria-pressed', String(b === t)));
    setTimeout(() => { if (STEPS[S.step] === st) next(); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 280);
    return;
  }
  if (t.dataset.two) {
    const cur = Array.isArray(S.answers[st.f.k]) ? [...S.answers[st.f.k]] : [];
    const k = t.dataset.two;
    if (cur.includes(k)) cur.splice(cur.indexOf(k), 1); else if (cur.length < 2) cur.push(k); else return;
    S.answers[st.f.k] = cur; keep(); render(false);
    root.querySelector(`[data-two="${k}"]`)?.focus();
    return;
  }
  if (t.dataset.slot) {
    const iso = t.dataset.slot;
    if (S.times.includes(iso)) S.times = S.times.filter((x) => x !== iso);
    else if (S.times.length < RULES.pick) S.times = [...S.times, iso];
    else return;
    keep(); const y = window.scrollY; render(false); window.scrollTo(0, y);
    root.querySelector(`[data-slot="${iso}"]`)?.focus();
  }
});
root.addEventListener('input', (e) => {
  const el = e.target, st = STEPS[S.step];
  if (el.dataset.text) {
    S.answers[el.dataset.text] = el.value; keep();
    const c = root.querySelector('[data-count]'); if (c) c.textContent = `${el.value.length} / ${st.f.max}`;
  } else if (el.dataset.field === 'name') S.name = el.value.slice(0, NAME_MAX);
  else if (el.dataset.field === 'email') S.email = el.value.trim();
  else return;
  keep();
  const b = root.querySelector('[data-next]');
  if (b) {
    b.disabled = !canNext();
    if (st.kind === 'q' && st.f.optional) b.firstChild.textContent = String(el.value).trim() ? 'Next ' : 'Skip ';
  }
});
root.addEventListener('keydown', (e) => {
  const st = STEPS[S.step];
  if (!st) return;
  if (e.key === 'Enter' && !e.shiftKey && (e.target.matches('input.field') || (e.target.matches('textarea') && (e.metaKey || e.ctrlKey)))) { e.preventDefault(); next(); return; }
  if (st.kind === 'q' && st.f.type === 'one' && /^[1-9]$/.test(e.key) && !e.target.matches('input, textarea')) {
    root.querySelectorAll('[data-one]')[Number(e.key) - 1]?.click();
  }
});

// ── Send ────────────────────────────────────────────────────────────────────
async function send() {
  const err = root.querySelector('[data-err]');
  const btn = root.querySelector('[data-send]');
  busy = true; btn.disabled = true; btn.firstChild.textContent = 'Sending… ';
  err.innerHTML = '';
  const body = { kind: KIND, answers: S.answers, times: S.times, tz: TZ, hp: root.querySelector('[data-hp]')?.value || '', token: A.token() || undefined };
  if (KIND === 'discovery') { body.name = S.name.trim(); body.email = S.email.trim(); }
  let d = null;
  try {
    const r = await fetch('/api/book', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    d = await r.json().catch(() => null);
  } catch { d = null; }
  busy = false;
  if (d && d.ok) {
    forget();
    root.innerHTML = doneScreen(d.email || body.email || (me && me.email) || '', !!d.copy);
    root.querySelector('h1').focus(); window.scrollTo(0, 0);
    return;
  }
  btn.disabled = false; btn.firstChild.textContent = 'Send my request ';
  if (d && d.pay) return door(true);
  const msg = d && d.error ? d.error : 'That did not go through. Check your connection and try again, or write to support@exploraself.com.';
  err.innerHTML = `<p class="err" role="alert">${esc(msg)}${d && d.signin ? ` <a href="/ground-plan/?next=${encodeURIComponent(location.pathname)}#signin">Sign in</a>` : ''}</p>`;
}

// ── Start ───────────────────────────────────────────────────────────────────
(async () => {
  root.innerHTML = '<p class="muted loading">One moment…</p>';
  const st = A.joined() ? await A.pull() : null;
  me = st && st.ok && st.me ? st.me : null;
  if (KIND === 'boardroom') {
    const ORDER = ['free', 'session', 'lab', 'hub', 'premium'];
    const holds = me && (me.openAll || ORDER.indexOf(me.tier || 'free') >= 1);
    if (!holds) return door(!!me);
  }
  if (me && KIND === 'discovery') { if (!S.name) S.name = me.name || ''; if (!S.email) S.email = me.email || ''; }
  buildSteps();
  render();
})();
