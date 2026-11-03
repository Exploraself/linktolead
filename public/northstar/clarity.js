// Simplicity and comfort in The Leader's North Star (Alexandru, 3 Nov 2026:
// "go for all of it"). Three small things, beside app.js:
//   1. On a phone, one Menu button holds what used to crowd the top: the
//      Founder's Blueprint, the Growth Toolkit, the 12 Days bonus, How to use
//      this, Download, Full screen, Light and dark.
//   2. Before you start: where you are, where you want to get, customers yet,
//      your four strengths, one at a time, "Before you start · 2 of 4", with
//      Back beside Next. A tap moves on by itself after a short pause.
//   3. 12 Days to Start Winning, as a bonus (the Decisions chat's spec): a
//      pop-up in place, POST /api/course start, and "Done. Wait for the
//      surprises: check your email." Already on: the day it is on.
// Icons are drawn in the text colour and hidden from screen readers; the
// words carry the meaning (AGENTS.md 13).

import { token, joined } from '/account.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const IC = {
  bp: svg('<path d="M12 2.5 21.5 12 12 21.5 2.5 12Z"/><path d="m12 7 1.6 3.4L17 12l-3.4 1.6L12 17l-1.6-3.4L7 12l3.4-1.6Z"/>'),
  tk: svg('<path d="M9 8V6.4c0-.8.6-1.4 1.4-1.4h3.2c.8 0 1.4.6 1.4 1.4V8"/><rect x="3" y="8" width="18" height="12" rx="2.2"/><path d="M12 17.2v-5.4M9.6 14.1 12 11.7l2.4 2.4"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>'),
  how: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.4 2.5c-.6.2-.9.7-.9 1.3v.7M12 17v.3"/>'),
  dl: svg('<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>'),
  fs: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  lt: svg('<circle cx="12" cy="12" r="8"/><path d="M12 4v16a8 8 0 0 0 0-16z" fill="currentColor"/>'),
};

/* ── 1. The phone's one menu ─────────────────────────────────────────── */
const ROWS = [
  ['a', '/ground-plan/#programme', IC.bp, 'The Founder’s Blueprint', 'Your programme'],
  ['a', '/tools/', IC.tk, 'Growth Toolkit', 'Cash, team, evenings, camera'],
  ['days', '', IC.sun, '12 Days to Start Winning', 'A bonus for you'],
  ['click', '#how-btn', IC.how, 'How to use this', ''],
  ['click', '[data-act="download"]', IC.dl, 'Download your progress', ''],
  ['click', '[data-fs]', IC.fs, 'Full screen', ''],
  ['click', '[data-theme-switch]', IC.lt, 'Light and dark', ''],
];
function menuHTML() {
  return `<div class="nsmenu-card" role="document"><div class="nsmenu-top"><b id="nsmenu-h">Menu</b><button type="button" class="nsmenu-x" data-nsmenu="close" aria-label="Close the menu">×</button></div>
    <ul>${ROWS.map(([k, v, ic, t, sub], i) => `<li>${k === 'a' ? `<a href="${v}">` : `<button type="button" data-nsrow="${i}">`}<span class="nsmenu-ic">${ic}</span><span><b>${esc(t)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span>${k === 'a' ? '</a>' : '</button>'}</li>`).join('')}</ul></div>`;
}
function menuOpen(on) {
  let m = $('#nsmenu');
  if (!m) { m = document.createElement('div'); m.id = 'nsmenu'; m.className = 'nsmenu'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'nsmenu-h'); m.hidden = true; document.body.appendChild(m); }
  const b = $('#nsmenu-btn');
  if (on) { m.innerHTML = menuHTML(); m.hidden = false; if (b) b.setAttribute('aria-expanded', 'true'); const f = m.querySelector('a,button'); if (f) f.focus(); }
  else { m.hidden = true; if (b) { b.setAttribute('aria-expanded', 'false'); b.focus({ preventScroll: true }); } }
}

/* ── 2. Before you start, one at a time ──────────────────────────────── */
const BYS = [['r1', 'Where you are today'], ['r2', 'Where you want to get'], ['modes', 'Customers yet'], ['str', 'Your four strengths']];
let bys = 0;
function bysUnits() {
  // "Customers yet" only when it is there (app.js may pass it over).
  return BYS.filter(([k]) => k !== 'modes' || ($('#modes') && $('#modes').children.length));
}
function bysDraw(scroll) {
  const sc = $('#s-clear');
  if (!sc) return;
  const U = bysUnits();
  bys = Math.max(0, Math.min(bys, U.length - 1));
  sc.dataset.bys = U[bys][0];
  let nav = $('#bys-nav');
  if (!nav) { nav = document.createElement('div'); nav.id = 'bys-nav'; nav.className = 'bys-nav'; sc.appendChild(nav); }
  const last = bys === U.length - 1;
  nav.innerHTML = `<p class="bys-at">Before you start · ${bys + 1} of ${U.length} · ${esc(U[bys][1])}</p>
    <div class="bys-btns">${bys > 0 ? '<button type="button" class="bys-back" data-bys="-1">← Back</button>' : ''}
    <button type="button" class="bys-next" data-bys="1">${last ? 'Start Part 1 →' : 'Next →'}</button></div>`;
  if (scroll) sc.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
}
function bysMove(n) {
  const U = bysUnits();
  if (n > 0 && bys >= U.length - 1) {
    const p = $('#nsdiv-1') || $('#s-part1');
    if (p) p.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' });
    return;
  }
  bys += n; bysDraw(true);
}
let bysT = 0;
function bysTapped(e) {
  const sc = $('#s-clear');
  if (!sc || !sc.contains(e.target) || e.target.closest('#bys-nav')) return;
  const k = sc.dataset.bys;
  // A tap on a stage or on "customers yet" moves on by itself; the strengths have four rows, so they wait for Next.
  if (k === 'str' || !e.target.closest('button')) return;
  clearTimeout(bysT);
  const at = bys;
  bysT = setTimeout(() => { if (bys === at) bysMove(1); }, 650);
}

/* ── 3. 12 Days to Start Winning ─────────────────────────────────────── */
let sub = null, step = 'ask';
async function daysLoad() {
  if (!joined()) return daysPaint();
  try {
    const r = await fetch(`/api/course?t=${encodeURIComponent(token())}`);
    const d = r.ok ? await r.json() : null;
    if (d && d.ok) sub = d.sub;
  } catch { /* offline: the card still opens the pop-up */ }
  daysPaint();
}
function daysLine() {
  if (sub && !sub.stopped) return sub.day >= 13 ? 'All 12 days are done' : sub.day >= 1 ? `Your 12 days are on · Day ${sub.day} of 12` : 'Your 12 days are on · Day 1 comes tomorrow';
  return sub && sub.stopped ? 'Start again →' : 'Start free →';
}
function daysPaint() {
  document.querySelectorAll('[data-days-line]').forEach((x) => { x.textContent = daysLine(); });
  // A second card at the end of the results, beside the next step.
  const next = $('#s-next');
  if (next && !$('#days-end')) {
    const c = document.createElement('div');
    c.id = 'days-end'; c.className = 'days-end no-print';
    c.innerHTML = `<button type="button" class="days-link days-wide" data-days="open">${IC.sun}<span><small>A bonus for you</small><b>12 Days to Start Winning</b><em data-days-line>${esc(daysLine())}</em></span></button>`;
    next.appendChild(c);
  }
}
function boxHTML() {
  const on = sub && !sub.stopped;
  let body;
  if (step === 'done' || on) {
    body = `<h2 id="dbh">${step === 'done' ? 'Done. Wait for the surprises: check your email.' : 'Your 12 days are on.'}</h2>
      <p>${step === 'done' ? 'The first letter is on its way now. Day 1 comes tomorrow from 8:00, your time. Nothing within the hour? Look in your spam folder.' : esc(daysLine()) + '. Each letter comes from 8:00, your time.'}</p>
      <button type="button" class="dyes" data-days="close">Back to my North Star</button>`;
  } else {
    body = `<p class="dk">A bonus for you</p><h2 id="dbh">12 Days to Start Winning</h2>
      <p>12 mornings. One principle and one ten-minute move in your inbox before the day starts. Free.</p>
      ${joined() ? `<button type="button" class="dyes" data-days="yes"${step === 'sending' ? ' disabled' : ''}>${step === 'sending' ? 'Sending…' : 'Yes, send them to me'}</button>`
    : '<a class="dyes" href="/12-days/">Yes, send them to me</a><p class="dsm">You need a free account for the letters: the next page makes one in a minute.</p>'}
      <button type="button" class="dnot" data-days="close">Not now</button>
      <p class="derr" id="dmsg" role="status"></p>`;
  }
  return `<div class="dcard">${IC.sun}${body}</div>`;
}
let opener = null;
function boxOpen() {
  opener = document.activeElement;
  step = 'ask';
  let b = $('#daysbox');
  if (!b) { b = document.createElement('div'); b.id = 'daysbox'; b.className = 'dbox'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-modal', 'true'); b.setAttribute('aria-labelledby', 'dbh'); document.body.appendChild(b); }
  b.innerHTML = boxHTML(); b.hidden = false;
  const f = b.querySelector('.dyes'); if (f) f.focus();
}
function boxShut() { const b = $('#daysbox'); if (b) b.hidden = true; if (opener && opener.focus) opener.focus({ preventScroll: true }); }
async function daysYes() {
  const b = $('#daysbox');
  step = 'sending'; b.innerHTML = boxHTML();
  try {
    const r = await fetch('/api/course', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: token(), action: 'start', tz: Intl.DateTimeFormat().resolvedOptions().timeZone || '' }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.ok) throw new Error(d.error || 'That did not go through. Try again in a minute.');
    sub = d.sub; step = 'done'; b.innerHTML = boxHTML(); daysPaint();
    const c = b.querySelector('.dyes'); if (c) c.focus();
  } catch (ex) {
    step = 'ask'; b.innerHTML = boxHTML();
    const m = $('#dmsg', b); if (m) m.textContent = ex.message || 'We could not reach the letters just now. Try again in a minute.';
  }
}

/* ── Wiring ───────────────────────────────────────────────────────────── */
document.addEventListener('click', (e) => {
  const t = e.target.closest('button, a');
  if (t) {
    if (t.id === 'nsmenu-btn') { menuOpen($('#nsmenu') ? $('#nsmenu').hidden : true); return; }
    if (t.dataset.nsmenu === 'close') { menuOpen(false); return; }
    if (t.dataset.nsrow != null) {
      const [k, v] = ROWS[+t.dataset.nsrow];
      menuOpen(false);
      if (k === 'days') boxOpen();
      else { const o = $(v); if (o) o.click(); }
      return;
    }
    if (t.dataset.days === 'open') { boxOpen(); return; }
    if (t.dataset.days === 'yes') { daysYes(); return; }
    if (t.dataset.days === 'close') { boxShut(); return; }
    if (t.dataset.bys) { bysMove(+t.dataset.bys); return; }
  }
  const m = $('#nsmenu');
  if (m && !m.hidden && e.target === m) menuOpen(false);
  const b = $('#daysbox');
  if (b && !b.hidden && e.target === b) boxShut();
  bysTapped(e);
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const b = $('#daysbox'), m = $('#nsmenu');
  if (b && !b.hidden) { e.stopImmediatePropagation(); boxShut(); }
  else if (m && !m.hidden) { e.stopImmediatePropagation(); menuOpen(false); }
}, true);
// app.js redraws its parts; the step stays, so draw the nav again when it does.
const keep = new MutationObserver(() => { const sc = $('#s-clear'); if (sc && !$('#bys-nav')) bysDraw(false); });
function start() {
  bysDraw(false);
  const sc = $('#s-clear'); if (sc) keep.observe(sc, { childList: true });
  daysLoad();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
