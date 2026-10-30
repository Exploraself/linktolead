// The Founder's Blueprint — the programme, and the founder's home base.
//
// /start is where a founder with an account comes home: their Ground Plan
// (built from their North Star), the map of twelve levels, and a level (four
// domains, seven steps each). A locked level opens its gate instead of
// nothing, and the gate says plainly what opens it. Without an account, /start
// sends the visitor to the North Star sales page to make one, or shows sign-in.
//
// Answers save to the device first, and to the account when the founder has
// one. Nothing is asserted about a payment or a subscription.

import { DOMAINS, SEVEN, STAGES, WEEKS, LADDER, LEVELS, SHEETS, SECTIONS, loadStage,
  gateFor, levelFor, isWritten, weekTitle, videoFor, nextGain, holds,
  LEAD, BOOKING, LIBRARY } from './content.js';
import { entry, programmeStage, groundPlan, stageNudge } from './home.js';
import { cabinetHTML, cabinetShown, cabinetHidden, cabinetClick, dashboardShown, levelDots, compassStripHTML } from './cabinet.js';
import { result as fwResult } from './frameworks.js';
import { report } from './feedback.js';
import * as account from './account.js';
import * as M from './music.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEY = 'ftb-v1';

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } };

let state = Object.assign({ stage: '', answers: {}, work: {}, tier: 'free', me: null }, load());
if (!state.work) state.work = {};
// A founder who joined through the old entrance (its ten questions, now gone)
// keeps their stage, answers and work, and opens on their programme.
const oldEntrance = !!(state.referee || (state.diag && Object.keys(state.diag).length)) && !!state.stage;
const hashNow = (() => { try { return location.hash; } catch { return ''; } })();
const linkCode = (() => { try { return new URLSearchParams(location.search).get('signin') || ''; } catch { return ''; } })();
/** Arrived from a password-reset email: open the password box once signed in. */
let resetAsk = (() => { try { return new URLSearchParams(location.search).get('reset') === '1'; } catch { return false; } })();
let view = linkCode ? 'loading' : entry({ joined: account.joined(), old: oldEntrance, hash: hashNow });
if (view === 'redirect') { try { location.replace('/road2/#join'); } catch { /* no location */ } }
let level = 1, dom = 'self';
/** The North Star record from the account, the notes, and whether a password is set. */
let compassRec = null, inbox = null, hasPassword = false, replyTo = null;
/** The "Ask Alexandru" thread (null until loaded), and the stage picker. */
let ask = null, changingStage = false;
/** The account has been read this visit (the greeting waits for it, so a
 *  name cached on this device is never shown for someone else), and which
 *  form the founder signed up with ('simple' founders have no password). */
let pulled = false, signupType = null;
/** The founder's mentor, from the account: the letters and notes come from them. */
let mentor = { name: 'Alexandru Cojocari', first: 'Alexandru' };

const compass = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2.5 21.5 12 12 21.5 2.5 12 12 2.5Z"/><path d="m12 5.7 2 4.3 4.3 2-4.3 2-2 4.3-2-4.3-4.3-2 4.3-2 2-4.3Z" fill="currentColor" stroke="none"/></svg>';

// ── Progress ─────────────────────────────────────────────────────────────────
const aKey = (st, lv, dk, i) => `${st}.${lv}.${dk}.${i}`;

// ── Worksheets ───────────────────────────────────────────────────────────────
// A worksheet belongs to one domain of one level and sits under the clarity
// point it serves. Entries are kept apart from the written answers, so a level
// still closes on the twenty-eight and never on arithmetic.
const wKey = (st, lv, dk, fk) => `w.${st}.${lv}.${dk}.${fk}`;
function fwFor(st, lv, dk) {
  const stage = SHEETS[st];
  return (stage && stage[lv] && stage[lv][dk]) || null;
}
/** The founder's entries for one worksheet, keyed the way the engine wants. */
function wValues(fw, st, lv, dk) {
  const out = {};
  for (const k of Object.keys(state.work)) {
    const p = `w.${st}.${lv}.${dk}.`;
    if (k.startsWith(p)) out[k.slice(p.length)] = state.work[k];
  }
  return out;
}
const wv = (st, lv, dk, fk) => state.work[wKey(st, lv, dk, fk)] || '';

function cell(st, lv, dk, fk, label, type) {
  const v = wv(st, lv, dk, fk);
  return `<input class="wcell${type === 'num' ? ' wnum' : ''}" type="text" inputmode="${type === 'num' ? 'decimal' : 'text'}"
    data-w="${wKey(st, lv, dk, fk)}" value="${esc(v)}" aria-label="${esc(label)}">`;
}

function worksheetBody(fw, st, lv, dk) {
  const c = (fk, label, type) => cell(st, lv, dk, fk, label, type);
  if (fw.shape === 'table') {
    return `<div class="wtable"><table><thead><tr>${fw.cols.map((col) => `<th>${esc(col.n)}</th>`).join('')}</tr></thead>
      <tbody>${Array.from({ length: fw.rows }, (_, r) => `<tr>${fw.cols
        .map((col) => `<td>${c(`${col.k}:${r}`, `${col.n}, row ${r + 1}`, col.t)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  if (fw.shape === 'calc') {
    return `<div class="wfields">${fw.fields.map((f) => `<label class="wfield"><span>${esc(f.n)}${f.hint ? ` <em>${esc(f.hint)}</em>` : ''}</span>${c(f.k, f.n, f.t || 'num')}</label>`).join('')}</div>`;
  }
  if (fw.shape === 'fill') {
    return `<div class="wfill">${fw.blanks.map((b) => `<label class="wfield"><span>${esc(b.n)}${b.hint ? ` <em>${esc(b.hint)}</em>` : ''}</span>${c(b.k, b.n, 'text')}</label>`).join('')}</div>`;
  }
  if (fw.shape === 'grid') {
    return `<div class="wgrid">${fw.boxes.map((b) => `<label class="wbox"><span>${esc(b.n)}</span>${c(b.k, b.n, 'text')}</label>`).join('')}</div>`;
  }
  if (fw.shape === 'rank') {
    return `<div class="wrank">${fw.slots.map((sl, i) => `<label class="wslot"><span class="wsn">${i + 1}</span><span class="wsl">${esc(sl.n)}</span>${c(sl.k, sl.n, 'text')}</label>`).join('')}</div>`;
  }
  return '';
}

/** The result window. Shows nothing rather than a misleading zero. */
function windowHTML(fw, st, lv, dk) {
  const r = fwResult(fw, wValues(fw, st, lv, dk));
  if (!r) return `<div class="rwin empty"><p class="rlabel">${esc(fw.out.label)}</p>
    <p class="rwait">Fill the blanks above and the answer appears here.</p></div>`;
  return `<div class="rwin"><p class="rlabel">${esc(fw.out.label)}</p>
    <p class="rval${r.text ? ' rtext' : ''}">${esc(r.shown)}${r.unit ? `<small>${esc(r.unit)}</small>` : ''}</p>
    ${r.read ? `<p class="rread">${esc(r.read)}</p>` : ''}</div>`;
}

function worksheetHTML(fw, st, lv, dk) {
  return `<div class="sheet" id="sheet-${fw.k}">
    <div class="shead"><p class="eyebrow">Worksheet</p><h4>${esc(fw.n)}</h4><p class="slead">${esc(fw.lead)}</p></div>
    ${worksheetBody(fw, st, lv, dk)}
    <div class="rhost" data-rhost="${fw.k}">${windowHTML(fw, st, lv, dk)}</div>
    ${fw.teach ? `<details class="teach"><summary>${esc(fw.teach.n)}</summary><p>${esc(fw.teach.t)}</p></details>` : ''}
    <p class="sdecide"><b>What this decides.</b> ${esc(fw.decides)}</p>
  </div>`;
}
function answered(st, lv, dk) {
  return SEVEN.filter((_, i) => (state.answers[aKey(st, lv, dk, i)] || '').trim()).length;
}
function levelDone(st, lv) {
  return DOMAINS.reduce((n, d) => n + answered(st, lv, d.k), 0);
}
// (level access now comes from levelState and the tier — see the workspace below)

// ── The Ground Plan home base ───────────────────────────────────────────────
// The front door is the North Star sales page; /start is where a founder with an
// account comes home. Before the North Star: how this works, in three steps.
// After it: their Ground Plan, from their own answers, then the programme.

const eye = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';
/** A password box with its show / hide button. */
const pwField = (id, label, auto) => `<label class="pwf"><span>${label}</span><span class="pwrow"><input id="${id}" type="password" autocomplete="${auto}" minlength="10"><button type="button" class="pweye" data-eye="${id}" aria-label="Show ${label.toLowerCase()}" aria-pressed="false">${eye}</button></span></label>`;

/** A promise's first sentence: what that level leaves you with by Sunday. */
const promiseOf = (st, n) => { const L = (LEVELS[st] || {})[n]; return L && L.promise ? L.promise.split(/(?<=\.)\s+(?=[A-Z])/)[0] : ''; };
/** The founder's first name, from their account as read on this visit. */
const firstName = () => (pulled && state.me && state.me.name ? state.me.name.split(' ')[0] : '');

/** The first level not yet finished and open to this founder. */
function nextLevel(st) {
  for (let n = 1; n <= 12; n++) if (levelDone(st, n) < 28) return reachable(st, n) ? n : Math.max(1, n - 1);
  return 12;
}

function notesHTML() {
  // The newest three unread; the rest show as these are dismissed.
  const list = (inbox && inbox.messages || []).filter((m) => !m.read_at).slice(0, 3);
  if (!list.length) return '';
  return list.map((m) => `<section class="gp-wrap"><div class="note-from" role="status">
      <p class="eyebrow">Letters from your mentor · ${esc(mentor.first)} · ${esc(new Date(m.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }))}</p>
      <h2>${esc(m.subject)}</h2>
      <p class="note-body">${esc(m.body)}</p>
      <div class="note-acts"><button type="button" class="cta" data-gotit="${esc(m.id)}">Got it</button><button type="button" class="ghost" data-replyto="${esc(m.id)}">Reply</button></div>
      ${replyTo === m.id ? `<form class="note-reply" data-reply="${esc(m.id)}"><label><span class="vh">Your reply</span><textarea rows="3" placeholder="Write your reply" required></textarea></label><button class="cta" type="submit">Send reply</button><p class="joinerr" role="status"></p></form>` : ''}
    </div></section>`).join('');
}

function howItWorks(st) {
  return `<section class="gp-wrap gp-moves">
    <p class="eyebrow">How this works</p>
    <ol class="gp-mlist">
      <li class="gp-move"><span class="gp-mn">01</span><b>Find where you stand</b><p>Eight plain questions, rough numbers, and feedback in all four domains. Free.</p><a class="cta" href="/compass">Open the North Star →</a></li>
      <li class="gp-move"><span class="gp-mn">02</span><b>Walk the Founder Launchpad</b><p>Levels 01–03, free. Know yourself before you build.</p><button class="cta" type="button" data-level="1">Start level 01 →</button></li>
      <li class="gp-move"><span class="gp-mn">03</span><b>Book The Boardroom</b><p>Sit at the table. Unlock the full North Star.</p><a class="cta" href="${esc(BOOKING)}" target="_blank" rel="noopener">Book my 1:1 with Alexandru ↗</a></li>
    </ol>
  </section>`;
}

function planHTML(gp, st) {
  const nx = nextLevel(st);
  const card = (k, body) => `<div class="gp-card"><p class="gp-k">${k}</p>${body}</div>`;
  return `<section class="gp-wrap gp-two gp-grid">
      ${standHTML(st)}
      ${gp.weakest ? card('Where the programme leans', `<h2 style="color:var(--${esc(gp.weakest.id)})">${esc(gp.weakest.name)} · ${esc(gp.weakest.band)}</h2><p>${esc(gp.weakest.big)} ${esc(gp.weakest.why)}</p><p><b>This week:</b> ${esc(gp.weakest.week)}</p>`) : ''}
      ${gp.goal || gp.pains.length ? card('What you told the North Star', `${gp.goal ? `<p class="gp-goalline">⚑ ${esc(gp.goal.line)}</p>` : ''}${gp.pains.map((p) => `<p class="gp-said">You said: ${esc(p.label)} · ${esc(p.domain)}</p>`).join('')}`) : ''}
    </section>
    <section class="gp-wrap gp-moves">
      <p class="eyebrow">Your first three moves · free</p>
      <ol class="gp-mlist">${gp.moves.map((m) => `<li class="gp-move"><span class="gp-mn">${String(m.n).padStart(2, '0')}</span><b>${esc(m.title)}</b><p>${esc(m.promise)}</p></li>`).join('')}
        <li class="gp-move gp-then"><span class="gp-mt">Then</span><b>The Boardroom: a session with Alexandru</b><p>Alexandru and the team read what you wrote before you speak. The session opens levels 04–05.</p></li></ol>
      <div class="gp-btns"><button class="cta" type="button" data-level="${nx}">Continue level ${String(nx).padStart(2, '0')} →</button>
        <a class="gp-line" href="${esc(BOOKING)}" target="_blank" rel="noopener">Book my 1:1 with Alexandru</a></div>
    </section>
    ${plansCard()}`;
}

// ── Where I stand ────────────────────────────────────────────────────────────
// The stage the founder walks, and "Change": Building, Growing or Scaling. The
// answers stay; each stage has its own levels. Saved on the device first, then
// on the account (a failed save is retried on the next visit).
const NUDGE_KEY = 'ftb-stage-nudge';
const nudgeSeen = () => { try { return localStorage.getItem(NUDGE_KEY) || ''; } catch { return ''; } };
const nudgeDone = (pair) => { try { localStorage.setItem(NUDGE_KEY, pair); } catch { /* private mode */ } };

function standHTML(st) {
  return `<div class="gp-card gp-stand"><p class="gp-k">Where you stand</p>
    <div class="stand-row"><h2>${esc(STAGES[st].n)}</h2><button type="button" class="ghost" data-stagechange aria-expanded="${changingStage}">Change</button></div>
    ${changingStage ? `<div class="stand-pick" role="group" aria-label="Pick your stage">${['build', 'grow', 'scale'].map((k) =>
      `<button type="button" class="${k === st ? 'cta' : 'ghost'}" data-setstage="${k}" aria-pressed="${k === st}">${esc(STAGES[k].n)}</button>`).join('')}</div>
      <p class="savenote">Your answers stay. Each stage has its own levels.</p>` : ''}
    <p class="gp-said">${esc(STAGES[st].lede)}</p></div>`;
}

/** Once, when the North Star placed the founder in another stage. */
function nudgeHTML(st) {
  const to = compassRec ? stageNudge({ compass: compassRec.stage, current: st, seen: nudgeSeen() }) : null;
  if (!to) return '';
  return `<section class="gp-wrap"><div class="note-from stand-nudge" role="status">
    <p>Your North Star placed you in ${esc(STAGES[to].n)}. Not sure? Starting one stage earlier settles what the later one assumes.</p>
    <div class="note-acts"><button type="button" class="cta" data-setstage="${to}" data-nudge="${to}|${st}">Switch to ${esc(STAGES[to].n)}</button><button type="button" class="ghost" data-keepstage="${to}|${st}">Keep ${esc(STAGES[st].n)}</button></div>
  </div></section>`;
}

function setStage(k) {
  const from = state.stage || 'build';
  changingStage = false;
  if (STAGES[k] && k !== from) {
    state.stage = k; state.stageSync = { stage: k, from }; save();
    account.setStage(k, from).then(() => { delete state.stageSync; save(); }).catch(() => { /* kept on the device; sent next visit */ });
  }
  render();
}

// ── Ask Alexandru ────────────────────────────────────────────────────────────
// One thread per founder: their questions and Alexandru's answers, newest
// last. A question is a note (it also tells Alexandru); answers come from
// /mentor, here and by email. Opening the thread marks the answers read.
const askUnread = () => (ask && ask.unread) || 0;

function askCard() {
  return `<section class="gp-wrap"><div class="note-from gp-askcard">
    <p class="eyebrow">Ask Alexandru</p>
    <p>A question about your business, your answers or a level? Ask it here.${askUnread() ? ' <b>You have a new answer.</b>' : ''}</p>
    <div class="note-acts"><button type="button" class="cta" data-go="ask">${askUnread() ? 'Read the answer →' : 'Ask Alexandru →'}</button></div>
  </div></section>`;
}

function askView() {
  const day = (s) => { const d = new Date(s); return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); };
  const items = (ask && ask.items) || [];
  const row = (x) => x.from === 'founder'
    ? `<li class="th-q"><p class="th-meta">You · ${esc(day(x.at))}${x.level ? ` · Level ${String(x.level).padStart(2, '0')}` : ''}${x.domain && LEAD[x.domain] ? ` · ${esc(LEAD[x.domain])}` : ''}</p><p class="th-body">${esc(x.body)}</p></li>`
    : `<li class="th-a${x.read ? '' : ' th-new'}"><p class="th-meta">${x.read ? '' : '<span class="tdot" aria-hidden="true"></span><span class="vh">New · </span>'}Alexandru · ${esc(day(x.at))}</p><p class="th-body">${esc(x.body)}</p></li>`;
  return `<section class="band qband ask"><div class="wrap narrow">
    <p class="eyebrow">${compass} Ask Alexandru</p>
    <h1 class="qh">Ask Alexandru</h1>
    <p class="sec-lede">A question about your business, your answers or a level. Your questions and Alexandru’s answers stay here, newest last. Answers also come by email, unless you unsubscribed.</p>
    ${!ask ? '<p class="savenote" role="status">Opening your questions…</p>'
      : ask.failed ? '<p class="joinerr" role="alert">We could not open your questions just now. Check your connection and reload.</p>'
      : items.length ? `<ol class="thread">${items.map(row).join('')}</ol>` : '<p class="savenote">No questions yet. Your first one starts the conversation.</p>'}
    <form id="askform" class="askform" novalidate>
      <label class="askq"><span>Your question</span><textarea rows="4" maxlength="3000" required></textarea></label>
      <div class="askrow">
        <label><span>Level <em>(optional)</em></span><select id="ask-level"><option value="">Any level</option>${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">Level ${String(i + 1).padStart(2, '0')}</option>`).join('')}</select></label>
        <label><span>Domain <em>(optional)</em></span><select id="ask-dom"><option value="">Any domain</option>${DOMAINS.map((d) => `<option value="${d.k}">${esc(d.n)}</option>`).join('')}</select></label>
      </div>
      <button class="cta" type="submit">Send my question</button><p class="joinerr" role="status"></p>
    </form>
  </div></section>`;
}

async function openAsk() {
  const t = await account.thread();
  if (t && t.ok) ask = t; else if (!ask) ask = { items: [], unread: 0, failed: true };
  if (view === 'ask') render();
  if (t && t.unread) account.threadRead().then(() => { if (ask) ask.unread = 0; drawNav(); }).catch(() => {});
}

function accountHTML() {
  const simple = signupType === 'simple' && !hasPassword;
  return `<section class="gp-wrap gp-account" aria-labelledby="acct-h">
    <p class="eyebrow" id="acct-h">Your account</p>
    <p class="gp-lede">${state.me && state.me.email ? `Signed in as <b>${esc(state.me.email)}</b>. ` : ''}Your work is saved to your account and follows you between devices.${simple ? ' On another device, sign in with a link we email you.' : ''}</p>
    ${simple ? '' : `<details class="pw-box"><summary>${hasPassword ? 'Change your password' : 'Set your password'}</summary>
      <form id="pwform" class="pwform" novalidate>
        <p class="savenote">At least 10 characters. “Forgot your password? Email me a sign-in link” always works too.</p>
        ${pwField('pw1', 'Password', 'new-password')}${pwField('pw2', 'Confirm password', 'new-password')}
        <button class="cta" type="submit">Save my password</button><p class="joinerr" id="pwmsg" role="status"></p>
      </form></details>`}
    <button type="button" class="ghost" data-signout>Sign out on this device</button>
  </section>`;
}

/** What the Cabinet shows: only what this founder has given. */
function cabinetData(st, gp, first) {
  let bands = [];
  try { const r = compassRec && (typeof compassRec.results_json === 'string' ? JSON.parse(compassRec.results_json) : compassRec.results); bands = (r && r.bands) || []; } catch { bands = []; }
  const P = acctPlans && acctPlans.ok ? acctPlans : null;
  let next = null;
  if (P) for (const d of P.domains) { const x = d.steps.find((y) => !P.done[y.id]); if (x) { next = { title: x.title, domain: d.name }; break; } }
  let lv = 1;
  while (lv < 12 && levelDone(st, lv) === 28) lv++;
  // The incubator band: FULL accounts only, once the account has been read.
  const full = pulled && signupType !== 'simple';
  const band = full ? { level: lv, title: weekTitle(st, lv), done: levelDone(st, lv),
    dots: levelDots(lv, (n) => levelDone(st, n), (n) => holds(state.tier || 'free', gateFor(n))) } : null;
  return {
    first, name: state.me && state.me.name, tier: state.tier || 'free',
    stageName: STAGES[st] && STAGES[st].n, aimName: null, startHere: gp && gp.weakest ? gp.weakest.name : null,
    bands, plans: P ? { count: P.count, total: P.total, next } : null,
    prog: { level: lv, title: weekTitle(st, lv), done: levelDone(st, lv) },
    askUnread: askUnread(), band,
  };
}

function homeView() {
  const st = state.stage || 'build';
  const gp = compassRec && window.CompassEngine ? groundPlan(compassRec, window.CompassEngine, { STAGES, weekTitle, promise: promiseOf }) : null;
  const first = firstName();
  return `<div class="gp">
    ${cabinetHTML(cabinetData(st, gp, first))}
    ${compassStripHTML(!!compassRec)}
    ${notesHTML()}
    ${nudgeHTML(st)}
    ${gp ? planHTML(gp, st) : `<section class="gp-wrap gp-two gp-grid">${standHTML(st)}</section>${howItWorks(st)}`}
    ${accountHTML()}
  </div>`;
}

/** Signing in on this device: email and password, or a one-time email link. */
function signinView() {
  return `<section class="band qband"><div class="wrap narrow">
    <p class="eyebrow">${compass} Your Ground Plan</p>
    <h1 class="qh">Sign in</h1>
    <p class="sec-lede">Your email and password. Signed up with your name and email only, or forgotten your password? We email you a link that signs you in on this device.</p>
    <form class="joinbox bare" id="signinform" novalidate>
      <div class="joinrow">
        <label><span>Email</span><input id="si-email" type="email" autocomplete="email" required></label>
        ${pwField('si-pw', 'Password', 'current-password')}
      </div>
      <button class="cta" type="submit">Sign in →</button>
      <button class="lib-link" type="button" data-link>Forgot your password? Email me a sign-in link</button>
      <p class="joinerr" id="si-msg" role="status"></p>
      <p class="savenote">New here? <a href="/road2/#join">Create your free account →</a></p>
    </form>
  </div></section>`;
}

// ── The workspace ────────────────────────────────────────────────────────────
// Once a founder is in, the shape of the programme never leaves the screen.
// The rail down the left holds all twelve levels, grouped the way the offer is
// grouped, so what is open and what is not is a fact rather than a surprise.
// Pick a level, and the four domains run across the top. Pick a domain, and
// that module opens underneath. Nothing else moves.

function levelState(st, n) {
  if (levelDone(st, n) === 28) return 'done';
  if (n === 1) return 'open';
  // A level opens when the one before it is finished. The gate is the work,
  // not the clock — and the tier gate sits on top of it, further down.
  return levelDone(st, n - 1) === 28 ? 'open' : 'waiting';
}
function reachable(st, n) {
  return holds(state.tier, gateFor(n)) && levelState(st, n) !== 'waiting';
}

/** The library at the top of the rail: four doors into the Library view. */
const LIB_ICONS = [
  ['3 manuals', 'The three manuals', '<path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z" fill="none" stroke="#C9A24A" stroke-width="1.6" stroke-linejoin="round"/>'],
  ['99 tools', 'Built to Lead, 99 tools', '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z" fill="none" stroke="#C9A24A" stroke-width="1.6" stroke-linejoin="round"/>'],
  ['32 frameworks', 'Worth Building, 32 frameworks', '<rect x="3" y="3" width="7" height="7" rx="1" fill="none" stroke="#C9A24A" stroke-width="1.6"/><rect x="14" y="3" width="7" height="7" rx="1" fill="none" stroke="#C9A24A" stroke-width="1.6"/><rect x="3" y="14" width="7" height="7" rx="1" fill="none" stroke="#C9A24A" stroke-width="1.6"/><rect x="14" y="14" width="7" height="7" rx="1" fill="none" stroke="#C9A24A" stroke-width="1.6"/>'],
  ['Soon', 'A New Way of Winning, coming soon', '<circle cx="12" cy="12" r="9" fill="none" stroke="#C9A24A" stroke-width="1.6"/><path d="M12 6l2 6-2 1.5-2-1.5z" fill="#C9A24A"/>'],
];
const libIcons = () => `<div class="rlib"><p class="eyebrow">Your library · now open</p><div class="rlibrow">${LIB_ICONS.map(([t, label, svg]) =>
  `<button type="button" class="libi${t === 'Soon' ? ' soon' : ''}" data-go="library" aria-label="${esc(label)}"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">${svg}</svg>${esc(t)}</button>`).join('')}</div></div>`;
const bookIcon = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

function railHTML(st) {
  const marks = { done: '✓', open: '', waiting: '·', locked: '🔒' };
  return `<nav class="rail" id="rail" aria-label="The twelve levels">
    <div class="railtop">
      <p class="eyebrow">${esc(STAGES[st].n)}</p>
      <h2>Your Blueprint</h2>
      <p class="railsub">${esc(STAGES[st].blurb)}</p>
    </div>
    ${libIcons()}
    ${SECTIONS.map((sec) => {
      const owned = holds(state.tier, sec.k);
      const rung = LADDER.find((r) => r.key === sec.k);
      const tag = sec.k === 'session' ? '1:1' : rung ? rung.price : '';
      return `<section class="rsec${owned ? '' : ' shut'}">
        <header class="rsh">
          <div><p class="rsn">${esc(sec.n)}</p><p class="rss">${esc(sec.sub)}</p></div>
          ${owned ? '<span class="rtag open">Open</span>' : `<span class="rtag">${esc(tag)}</span>`}
        </header>
        <ul class="rlist">${Array.from({ length: sec.to - sec.from + 1 }, (_, i) => {
          const n = sec.from + i;
          const ok = reachable(st, n);
          const stt = !owned ? 'locked' : levelState(st, n);
          const done = levelDone(st, n);
          return `<li><button type="button" class="rlev ${stt}${n === level && view === 'work' ? ' here' : ''}"
            data-level="${n}" aria-current="${n === level && view === 'work' ? 'true' : 'false'}">
            <span class="rnum">${String(n).padStart(2, '0')}</span>
            <span class="rtxt"><b>${esc(weekTitle(st, n))}</b>${done ? `<em>${done} of 28</em>` : ''}</span>
            <span class="rmark ${stt}" aria-hidden="true">${marks[stt] || ''}</span>
            <span class="vh">${stt === 'done' ? 'finished' : stt === 'locked' ? 'not yet open' : stt === 'waiting' ? 'opens when the level before is finished' : 'open'}</span>
          </button></li>`;
        }).join('')}</ul>
        <p class="rnote">${esc(sec.note)}</p>
        ${sec.k === 'session' && !owned ? `<a class="rbook" href="${esc(BOOKING)}" target="_blank" rel="noopener">${bookIcon}Book my 1:1 with Alexandru</a>` : ''}
      </section>`;
    }).join('')}
    <a class="rsummit" href="/compass/summit">
      <small>THE TOP</small>
      <b>The Summit</b>
      <span>Everything, and Alexandru every week · $1,989</span>
    </a>
  </nav>`;
}

// ── A module ─────────────────────────────────────────────────────────────────
function moduleHTML(st) {
  const L = levelFor(st, level);
  const title = weekTitle(st, level);
  const g = gateFor(level);
  const owned = holds(state.tier, g);
  const tabs = DOMAINS.map((d) => `<button type="button" class="mtab" data-dom="${d.k}" data-k="${d.k}"
      aria-pressed="${d.k === dom}"><b>${esc(LEAD[d.k])}</b><em>${answered(st, level, d.k)}/7</em></button>`).join('');

  if (!owned) {
    const rung = LADDER.find((r) => r.key === g);
    return `${levelHead(st, title)}
      <div class="gate">
        <p class="eyebrow">${compass} What opens this</p>
        <h3>${esc(rung.n)}</h3><p>${esc(rung.what)}</p>
        <span class="price">${esc(rung.price)}</span>
        ${rung.url ? `<a class="cta" href="${esc(rung.url)}" target="_blank" rel="noopener">See what it includes ↗</a>` : ''}
      </div>`;
  }
  if (levelState(st, level) === 'waiting') {
    const prev = levelDone(st, level - 1);
    return `${levelHead(st, title)}
      <div class="wait">
        <p class="eyebrow">Not yet</p>
        <h3>Finish level ${String(level - 1).padStart(2, '0')} first</h3>
        <p>${prev} of its 28 answers are written. This level opens when all twenty-eight are, because every question here assumes the ones before it have been answered honestly.</p>
        <button class="cta" type="button" data-level="${level - 1}">Back to level ${String(level - 1).padStart(2, '0')}</button>
      </div>`;
  }
  if (!L) {
    return `${levelHead(st, title)}<div class="wait"><p class="eyebrow">In preparation</p>
      <h3>This level is written and not yet published here</h3>
      <p>Nothing is shown before it is finished.</p></div>`;
  }

  const D = L[dom], fw = fwFor(st, level, dom), vid = videoFor(st, level, dom);
  const gain = nextGain(st, level);
  const full = answered(st, level, dom) === 7;

  return `${levelHead(st, title)}
    ${stageStrip(st)}
    <div class="mtabs" role="tablist">${tabs}</div>
    <article class="mod">
      <header class="modh">
        <span class="dkey" style="background:var(--${dom})"></span>
        <div><p class="eyebrow">${esc(LEAD[dom])} · ${esc(DOMAINS.find((d) => d.k === dom).full)}</p>
        ${D.title === weekTitle(st, level) ? '' : `<h3>${esc(D.title)}</h3>`}
        <p class="modsub">${esc(D.sub)}</p></div>
      </header>
      ${vid ? `<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/${esc(vid)}" title="${esc(D.title)}"
        loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>` : ''}
      <div class="steps">${D.steps.map((q, i) => {
        const v = state.answers[aKey(st, level, dom, i)] || '';
        return `<div class="step${v.trim() ? ' done' : ''}">
          <span class="snum">${i + 1}</span>
          <div>
            <p class="sname">${SEVEN[i].n}</p>
            <p class="swhy">${esc(SEVEN[i].why)}</p>
            <p class="sask">${esc(q)}</p>
            <textarea data-k="${aKey(st, level, dom, i)}" rows="2" placeholder="Write it here" aria-label="${SEVEN[i].n}">${esc(v)}</textarea>
            ${fw && fw.after === i + 1 ? worksheetHTML(fw, st, level, dom) : ''}
          </div></div>`;
      }).join('')}</div>
      ${domFoot(st, full, gain)}
    </article>`;
}

/** What comes after this domain: the next one, or — when all four are done —
 *  what the next level gives you, stated as the things that will exist. */
function domFoot(st, full, gain) {
  const i = DOMAINS.findIndex((d) => d.k === dom);
  const next = DOMAINS[i + 1];
  const whole = levelDone(st, level) === 28;

  if (whole && gain) {
    return `${reportHTML(st)}<div class="gain">
      <p class="eyebrow">${compass} Level ${String(level).padStart(2, '0')} is closed</p>
      <h4>What level ${String(gain.level).padStart(2, '0')} gives you</h4>
      <p class="gaint">${esc(gain.title)}</p>
      <p class="gainp">${esc(gain.promise)}</p>
      <button class="cta" type="button" data-level="${gain.level}">
        ${holds(state.tier, gain.gate) ? `Open level ${String(gain.level).padStart(2, '0')}` : 'See what opens it'}</button>
    </div>`;
  }
  if (whole) {
    return `${reportHTML(st)}<div class="gain"><p class="eyebrow">${compass} The twelfth is closed</p>
      <h4>You have finished ${esc(STAGES[st].n)}</h4>
      <p class="gainp">Twelve levels, four domains, three hundred and thirty-six answers in your own hand. Read level one again and see what you would now write differently.</p>
      <button class="cta" type="button" data-level="1">Back to level 01</button></div>`;
  }
  if (next) {
    return `<div class="donext">
      <p>${full ? `All seven written. ${DOMAINS.find((d) => d.k === dom).n} is done.` : `${answered(st, level, dom)} of 7 written in ${DOMAINS.find((d) => d.k === dom).n}.`}</p>
      <button class="ghost" type="button" data-dom="${next.k}">Next: ${next.n} →</button>
      ${level > 1 && !holds(state.tier, 'session') ? `<p class="hardline">Hard going? <a href="${esc(BOOKING)}" target="_blank" rel="noopener">A 1:1 session with ${esc(mentor.first)}</a> is always there.</p>` : ''}</div>`;
  }
  return `<div class="donext"><p>${28 - levelDone(st, level)} answers left in this level. It closes when all twenty-eight are written.</p>
    <button class="ghost" type="button" data-dom="self">Back to Lead yourself</button></div>`;
}

/** What the Blueprint says back. Levels one to three only — after that the
 *  founder has the figures and does not need a reading of them. */
function reportHTML(st) {
  const r = report(state, st, level);
  if (!r) return '';
  return `<section class="rep">
    <header class="reph">
      <p class="eyebrow">${compass} Your reading after level ${String(r.level).padStart(2, '0')}</p>
      <h4>${r.clear ? 'Nothing here is firing' : 'Where you are, from what you wrote'}</h4>
      <p class="repstand">${esc(r.stand)}</p>
      ${r.thin ? `<p class="repthin">${esc(r.thin)}</p>` : ''}
    </header>
    ${r.findings.length ? `<ol class="reps">${r.findings.map((f, i) => `<li class="rfind sev${f.sev}">
      <span class="rfn">${i + 1}</span>
      <div>
        ${f.domain ? `<p class="rfd"><span class="dkey sm" style="background:var(--${f.domain.k})"></span>${esc(f.domain.n)}</p>` : '<p class="rfd">Across all four</p>'}
        <h5>${esc(f.title)}</h5>
        <p class="rfb">${esc(f.body)}</p>
        <p class="rfs"><b>Your next step.</b> ${esc(f.step)}</p>
        ${f.where ? `<button class="rfw" type="button" data-level="${f.where.lv}">
          Where this is worked: level ${String(f.where.lv).padStart(2, '0')} · ${esc(f.where.title)} →</button>` : ''}
      </div></li>`).join('')}</ol>` : ''}
    <p class="repfine">Everything above is read from your own entries. Nothing is assumed about you, and no part of it is compared with anybody else.</p>
  </section>`;
}

function levelHead(st, title) {
  const done = levelDone(st, level);
  return `<header class="lvh">
    <button class="backrail" type="button" data-go="rail">☰ Levels</button>
    <p class="eyebrow">Level ${String(level).padStart(2, '0')} · ${esc(STAGES[st].n)} · leans on ${esc(emphasisName(st, level).toLowerCase())}</p>
    <h2>${esc(title)}</h2>
    <div class="lvtrack"><i style="width:${done / 28 * 100}%"></i></div>
    <p class="lvcount" id="lvcount">${done} of 28 answered</p>
  </header>`;
}

/** Where the founder is: the three stages as rising steps, theirs lit. */
function stageStrip(st) {
  const order = ['build', 'grow', 'scale'];
  return `<section class="stagestrip" aria-label="Your stage"><p class="eyebrow">Your stage</p><ol>${order.map((k, i) => {
    const now = k === st;
    return `<li class="ss-step ss-${i + 1}${now ? ' ss-now' : ''}"${now ? ' aria-current="step"' : ''}>
      <span class="ss-top"><i class="ss-num">${['I', 'II', 'III'][i]}</i>${now ? '<span class="ss-here">You are here</span>' : ''}</span>
      <span><b>${esc(STAGES[k].n)}</b><span class="ss-line">${esc(STAGES[k].blurb)}</span></span></li>`;
  }).join('')}</ol></section>`;
}

// ── The library ──────────────────────────────────────────────────────────────
// Everything that goes with the programme, in one place. Joined founders
// download; the LAB workbook opens on exploraself.com/lab for LAB members.
function libraryView() {
  const joined = account.joined() || !!state.me;
  const hasLab = holds(state.tier, 'lab');
  const dl = '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 20h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const manuals = LIBRARY.manuals.map((m) => `<li class="lib-man${m.k === state.stage ? ' lib-yours' : ''}">
      <span class="bk3 bk3-man bk3-${m.k}" aria-hidden="true"><span class="bk3-cover"><small>ExploraSelf</small><b>${esc(STAGES[m.k].n)}</b></span><i class="bk3-spine"></i></span>
      <span class="lib-mtext"><b>${esc(m.n)}</b><small>${esc(m.sub)} · ${m.pages} pages${m.k === state.stage ? ' · your stage' : ''}</small></span>
      ${joined ? `<a class="lib-btn" href="${esc(account.libraryHref(m.k))}" download>${dl}Download PDF</a>` : `<a class="lib-btn" href="/road2/#join">Create a free account to download</a>`}
    </li>`).join('');
  const books = LIBRARY.books.map((b) => b.soon
    ? `<li class="lib-book lib-soon">${b.cover ? `<span class="bk3"><img src="${esc(b.cover)}" alt="${esc(b.n)} cover" loading="lazy"><i class="bk3-spine"></i></span>` : '<span class="bk3" aria-hidden="true"><span class="bk3-cover bk3-blank">In preparation</span></span>'}
        <span class="lib-btext"><span class="lib-kick">${esc(b.kicker)}</span><b>${esc(b.n)}</b><small>${esc(b.sub)}</small><em>In preparation</em></span></li>`
    : `<li class="lib-book"><span class="bk3"><img src="${esc(b.cover)}" alt="${esc(b.n)} cover" loading="lazy"><i class="bk3-spine"></i></span>
        <span class="lib-btext"><span class="lib-kick">${esc(b.kicker)}</span><b>${esc(b.n)}</b><small>${esc(b.sub)}</small>
        <span class="lib-acts"><a href="${esc(b.preview)}" target="_blank" rel="noopener">Preview the first pages →</a>
        ${joined ? `<a href="${esc(account.libraryHref(b.k))}" download>${dl}Free digital copy</a>` : `<a class="lib-link" href="/road2/#join">Create a free account for the free digital copy</a>`}
        <span class="lib-print">${b.print ? `<a href="${esc(b.print)}" target="_blank" rel="noopener">Print edition ↗</a>` : 'Print edition coming'}</span></span></span></li>`).join('');
  const L = LIBRARY.lab;
  return `<section class="band qband lib"><div class="wrap">
    <p class="eyebrow">${compass} Library &amp; working materials</p>
    <h1 class="qh">Everything that goes with the work</h1>
    <p class="sec-lede">The three manuals are the programme on paper, to print and fill by hand. The books sit alongside it — the thinking the levels are built from.${joined ? '' : ' A free account opens every download.'}</p>
    <h2 class="lib-h">The Founder’s Blueprint · the manuals</h2>
    <ul class="lib-mans">${manuals}</ul>
    <h2 class="lib-h">The books</h2>
    <ul class="lib-books">${books}</ul>
    <div class="lib-lab"><div><span class="lib-kick">With the LAB</span><b>${esc(L.n)}</b><small>${esc(L.sub)} · ${L.pages} pages</small></div>
      <a class="lib-btn" href="${esc(L.url)}" target="_blank" rel="noopener">${hasLab ? 'Open in the LAB ↗' : 'See the LAB ↗'}</a></div>
  </div></section>`;
}

/** After joining: the library just opened. Shown until opened or closed. */
const BANNER_KEY = 'ftb-library-banner';
const bannerSeen = () => { try { return localStorage.getItem(BANNER_KEY) === 'seen'; } catch { return true; } };
const bannerDone = () => { try { localStorage.setItem(BANNER_KEY, 'seen'); } catch { /* private mode */ } };
function libBanner() {
  if (bannerSeen() || !(state.me || account.joined())) return '';
  return `<div class="libban" role="status">
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.2 5.6L20 9l-4.5 3.8L17 19l-5-3.2L7 19l1.5-6.2L4 9l5.8-.4z" fill="none" stroke="#C9A24A" stroke-width="1.6" stroke-linejoin="round"/></svg>
    <div><b>Your library just got fuller.</b><p>With your free account: the three Founder’s Blueprint manuals, Built to Lead (99 practical tools) and Worth Building (32 leadership frameworks). A New Way of Winning is on its way.</p></div>
    <button type="button" class="cta" data-go="library">Open my library →</button>
    <button type="button" class="x" data-banner="close" aria-label="Close"><svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>
  </div>`;
}

/** At the top of the programme, quietly: if a step is hard, a 1:1 is
 *  always there. Founders who already have The Boardroom see the line about
 *  their session; nobody is told it is urgent. */
function helpNote() {
  const have = holds(state.tier, 'session');
  return `<aside class="helpnote" aria-label="Help with a step">
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="none" stroke="#C9A24A" stroke-width="1.5"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.6" fill="none" stroke="#C9A24A" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="#C9A24A"/></svg>
    <p><b>Finding a step hard?</b> That is where the work is. ${have ? `Bring it to your next session with ${esc(mentor.first)}, or` : `You can always book a 1:1 session with ${esc(mentor.first)}, or`} ask in <button type="button" class="linkish" data-go="ask">Ask Alexandru</button>.</p>
    ${have ? '' : `<a class="helpgo" href="${esc(BOOKING)}" target="_blank" rel="noopener">Book a 1:1 ↗</a>`}
  </aside>`;
}

/** The North Star, inside the programme: for the founder's first five visits to
 *  the programme, a banner that sends them back to the North Star for feedback
 *  and material. Closing it ends it early. Counted once per page load. */
const CB_KEY = 'ftb-compass-banner', CB_TIMES = 5;
const cbSeen = () => { try { return Number(localStorage.getItem(CB_KEY) || 0); } catch { return CB_TIMES; } };
const cbSet = (n) => { try { localStorage.setItem(CB_KEY, String(n)); } catch { /* private mode */ } };
let cbCounted = false;
function compassBanner() {
  if (!(state.me || account.joined())) return '';
  let n = cbSeen();
  if (n >= CB_TIMES) return '';
  if (!cbCounted) { cbCounted = true; cbSet(++n); }
  return `<a class="cban" href="/compass/" aria-label="Open your Leader’s North Star: feedback in all four domains, your plans and your numbers">
    <span class="cban-dial" aria-hidden="true"><svg viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="29" fill="none" stroke="#C9A24A" stroke-width="1.6"/><circle cx="32" cy="32" r="23" fill="none" stroke="#594A32"/>
      <g stroke="#C9A24A" stroke-width="1.4"><line x1="32" y1="3" x2="32" y2="9"/><line x1="32" y1="55" x2="32" y2="61"/><line x1="3" y1="32" x2="9" y2="32"/><line x1="55" y1="32" x2="61" y2="32"/></g>
      <circle cx="32" cy="11" r="2.6" fill="#A8623A"/><circle cx="53" cy="32" r="2.6" fill="#4C7355"/><circle cx="32" cy="53" r="2.6" fill="#36607F"/><circle cx="11" cy="32" r="2.6" fill="#9A7418"/>
      <g class="cban-needle"><path d="M32 14 L36 32 L32 35 L28 32Z" fill="#E3C47E"/><path d="M32 50 L36 32 L32 29 L28 32Z" fill="#594A32"/></g><circle cx="32" cy="32" r="3" fill="#C9A24A"/></svg></span>
    <span class="cban-txt"><span class="cban-k">Your Leader’s North Star</span><b>Lost on a level? Your North Star knows the way.</b>
      <span class="cban-p">Feedback in all four domains, your step-by-step plans and your numbers, all in one place. Come back whenever you need direction.</span></span>
    <span class="cban-go">Open my North Star →</span>
  </a>
  <button type="button" class="cban-x" data-cban="close" aria-label="Hide the North Star banner"><svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>`;
}

// ── Your account plans ──────────────────────────────────────────────────────
// From the North Star, in this founder's order (GET /api/plans). One step per
// domain this week: the first one not yet done. Each opens to its full text
// and can be ticked. The count is the plans' own; it is not the North Star
// launchpad.
let acctPlans = null;
const BANDS = { now: 'Needs you now', shape: 'Taking shape', strength: 'A strength' };
/** Which steps are open, so a redraw after a tick leaves them open. */
const openSteps = new Set();
if (typeof document !== 'undefined') document.addEventListener('toggle', (e) => { const d = e.target; if (d.dataset && d.dataset.step) { if (d.open) openSteps.add(d.dataset.step); else openSteps.delete(d.dataset.step); } }, true);
function planStep(st, band) {
  const done = !!acctPlans.done[st.id];
  const row = (k, v) => (v ? `<p><b>${k}</b> ${esc(v)}</p>` : '');
  return `<details class="pl-step${done ? ' done' : ''}" data-step="${esc(st.id)}"${openSteps.has(st.id) ? ' open' : ''}>
    <summary><span class="pl-dk" style="background:var(--${esc(st.domain)})"></span><span class="pl-t">${esc(st.title)}</span><span class="pl-open">Open</span></summary>
    <div class="pl-body">
      ${row('Why it matters:', st.why)}${row('What to do:', st.what)}${row('About:', st.about)}${row('Done looks like:', st.done)}
      ${st.ask ? `<p class="pl-ask">“${esc(st.ask)}”</p>` : ''}
      ${st.note ? `<p class="pl-note"><b>${esc(BANDS[band] || '')}${st.noteFor ? ` (${esc(st.noteFor)})` : ''}:</b> ${esc(st.note)}</p>` : ''}
      <label class="pl-tick"><input type="checkbox" data-plantick="${esc(st.id)}"${done ? ' checked' : ''}> Done</label>
    </div></details>`;
}
function plansCard() {
  const P = acctPlans;
  if (!P || !P.ok) return '';
  const first = P.domains[0];
  const rows = P.domains.map((d) => {
    const next = d.steps.find((x) => !P.done[x.id]);
    return `<div class="pl-dom">
      <p class="pl-dn" style="color:var(--${esc(d.id)})">${esc(d.name)}${d.bandName ? ` · <span>${esc(d.bandName)}</span>` : ''}</p>
      ${d.said.length ? `<p class="pl-said">You said: ${esc(d.said.join(' · '))}</p>` : ''}
      ${d.goal ? `<p class="pl-goal">⚑ ${esc(d.goal)}</p>` : ''}
      ${next ? planStep(next, d.band) : '<p class="pl-all">All four steps done in this domain.</p>'}
    </div>`;
  }).join('');
  const w = P.whatif, wNext = w && w.steps.find((x) => !P.done[x.id]);
  return `<section class="gp-wrap pl" id="plans" aria-labelledby="pl-h">
    <p class="eyebrow">Your account plans · ${P.count} of ${P.total} steps done</p>
    <h2 class="gp-h" id="pl-h">${P.compass ? `${esc(first.name)} opens first` : 'Your four domains, one step each week'}</h2>
    <p class="gp-lede">${P.compass ? 'Your lowest domain from the North Star leads. One step per domain this week.' : 'Take the North Star and your lowest domain moves to the front. One step per domain each week.'}
      ${P.compass ? '' : ' <a href="/compass">Open the North Star →</a>'}</p>
    <div class="pl-grid">${rows}</div>
    ${w ? `<div class="pl-dom pl-whatif"><p class="pl-dn">Your plan for this change · ${esc(w.name)}</p>${wNext ? planStep(wNext, null) : '<p class="pl-all">All four steps done.</p>'}</div>` : ''}
    <p class="savenote">Times are about, not promises.</p>
  </section>`;
}
async function loadPlans() {
  if (!account.joined()) return;
  const p = await account.plans();
  if (p && p.ok) { acctPlans = p; if (view === 'home') render(); }
}

function emphasisName(st, lv) {
  const e = STAGES[st].emphasis[lv - 1];
  const d = DOMAINS.find((x) => x.k === e);
  return d ? LEAD[d.k] : 'All four';
}

// ── Render ───────────────────────────────────────────────────────────────────
function drawNav() {
  const unread = inbox ? inbox.unread : 0, answers = askUnread();
  $('#tnav').innerHTML = account.joined() && !['signin', 'redirect', 'loading'].includes(view)
    ? `<button type="button" data-go="home" ${view === 'home' ? 'aria-current="page"' : ''}>Your Ground Plan${unread ? `<span class="tdot" aria-label="${unread} unread ${unread === 1 ? 'note' : 'notes'}"></span>` : ''}</button><button type="button" data-go="work" ${view === 'work' ? 'aria-current="page"' : ''}>The programme</button><button type="button" data-go="library" ${view === 'library' ? 'aria-current="page"' : ''}>Library</button><button type="button" data-go="ask" ${view === 'ask' ? 'aria-current="page"' : ''}>Ask Alexandru${answers ? `<span class="tdot" aria-label="${answers} new ${answers === 1 ? 'answer' : 'answers'}"></span>` : ''}</button>${holds(state.tier, 'session') ? '' : `<a class="tbook" href="${esc(BOOKING)}" target="_blank" rel="noopener">${bookIcon}Book my 1:1 with Alexandru</a>`}`
    : '';
}

function render() {
  const st = state.stage || 'build';
  document.body.classList.toggle('inwork', view === 'work');
  drawNav();
  if ((view === 'work' || view === 'home') && !LEVELS[st]) {
    // Only this founder's stage is loaded, and only when needed.
    $('#main').innerHTML = '<section class="band qband"><div class="wrap narrow"><p class="sec-lede" role="status">Opening your programme…</p></div></section>';
    loadStage(st).then(render).catch(() => { $('#main').innerHTML = '<section class="band qband"><div class="wrap narrow"><p class="sec-lede" role="alert">We could not open your programme just now. Check your connection and reload.</p></div></section>'; });
    return;
  }
  // The dashboard (Your Ground Plan, the programme, the Library, Ask
  // Alexandru) keeps the music, the light and Focus mode.
  if (!DASHBOARD.includes(view)) cabinetHidden();
  $('#main').innerHTML = view === 'work'
    ? `<div class="shell"><div class="railwrap" id="railwrap">${railHTML(st)}</div><div class="work" id="work"><div id="cban" class="cbanwrap">${compassBanner()}</div><div id="libban">${libBanner()}</div>${helpNote()}<div id="mod">${moduleHTML(st)}</div></div></div>`
    : view === 'home' ? homeView()
    : view === 'library' ? libraryView()
    : view === 'ask' ? askView()
    : view === 'signin' ? signinView()
    : '<section class="band qband"><div class="wrap narrow"><p class="sec-lede" role="status">One moment…</p></div></section>';
  if (view === 'home') cabinetShown();
  else if (DASHBOARD.includes(view)) dashboardShown();
  // The Lamp's candles count the domain on screen, in the programme only.
  M.setCandles(view === 'work' ? answered(st, level, dom) : -1);
}
const DASHBOARD = ['home', 'work', 'library', 'ask'];

/** Redraw only the module, so the rail does not flicker and its scroll holds. */
function redrawModule() {
  const w = $('#work');
  if (!w) return render();

  const m = $('#mod');
  if (m) m.innerHTML = moduleHTML(state.stage || 'build'); else w.innerHTML = moduleHTML(state.stage || 'build');
  w.scrollTo ? w.scrollTo({ top: 0, behavior: 'instant' }) : null;
  const r = $('#rail'); if (r) refreshRail();
  M.setCandles(answered(state.stage || 'build', level, dom));
}
function refreshRail() {
  const st = state.stage || 'build';
  const wrap = $('#railwrap');
  if (wrap) wrap.innerHTML = railHTML(st);
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('button, a.cta');
  if (!b) return;
  if (b.dataset.go === 'rail') { document.body.classList.toggle('railopen'); return; }
  if (b.dataset.cab) {
    if (cabinetClick(b)) return;
    if (b.dataset.cab === 'stand') { changingStage = true; render(); const c = document.querySelector('.gp-stand'); if (c) c.scrollIntoView({ block: 'center' }); const p = document.querySelector('.stand-pick button'); if (p) p.focus({ preventScroll: true }); return; }
    if (b.dataset.cab === 'plans') { const c = document.getElementById('plans'); if (c) c.scrollIntoView({ block: 'start' }); else location.href = '/compass/'; return; }
  }
  if (b.dataset.cban === 'close') { cbSet(CB_TIMES); const h = $('#cban'); if (h) h.innerHTML = ''; return; }
  if (b.dataset.banner === 'close') { bannerDone(); const h = $('#libban'); if (h) h.innerHTML = ''; return; }
  if (b.dataset.go === 'library') bannerDone();
  if (b.dataset.go) {
    view = b.dataset.go; document.body.classList.remove('railopen'); render();
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (view === 'ask') openAsk();
    return;
  }
  if (b.hasAttribute('data-stagechange')) { changingStage = !changingStage; render(); const p = document.querySelector('.stand-pick button'); if (p) p.focus(); return; }
  if (b.dataset.keepstage) { nudgeDone(b.dataset.keepstage); render(); return; }
  if (b.dataset.setstage) { if (b.dataset.nudge) nudgeDone(b.dataset.nudge); setStage(b.dataset.setstage); return; }
  if (b.dataset.eye) {
    const inp = document.getElementById(b.dataset.eye), show = inp && inp.type === 'password';
    if (inp) inp.type = show ? 'text' : 'password';
    b.setAttribute('aria-pressed', String(!!show)); b.setAttribute('aria-label', (show ? 'Hide ' : 'Show ') + b.getAttribute('aria-label').replace(/^(Show|Hide) /, ''));
    return;
  }
  if (b.dataset.gotit) {
    const id = b.dataset.gotit, m = inbox && inbox.messages.find((x) => x.id === id);
    if (m) { m.read_at = new Date().toISOString(); inbox.unread = inbox.messages.filter((x) => !x.read_at).length; }
    account.messageRead(id).catch(() => {});
    render(); return;
  }
  if (b.dataset.replyto) { replyTo = replyTo === b.dataset.replyto ? null : b.dataset.replyto; render(); const t = document.querySelector('.note-reply textarea'); if (t) t.focus(); return; }
  if (b.dataset.signout !== undefined) { account.signOut(); location.replace('/road2/'); return; }
  if (b.hasAttribute('data-link')) { sendSigninLink(); return; }
  if (b.dataset.stage) { state.stage = b.dataset.stage; save(); view = 'work'; render(); window.scrollTo({ top: 0, behavior: 'instant' }); return; }
  if (b.dataset.level) {
    level = +b.dataset.level; dom = 'self'; view = 'work';
    document.body.classList.remove('railopen');
    render(); window.scrollTo({ top: 0, behavior: 'instant' }); return;
  }
  if (b.dataset.dom) { dom = b.dataset.dom; redrawModule(); return; }
});

async function sendSigninLink() {
  const msg = $('#si-msg'), email = ($('#si-email') || {}).value || '';
  const say = (t) => { if (msg) msg.textContent = t; };
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email.trim())) return say('Type your email first, then tap this again.');
  try { const r = await account.signinLink(email.trim(), 'start', true); say(r.message); }
  catch (ex) { say(ex && ex.message && !/fetch|network|load failed/i.test(ex.message) ? ex.message : 'We could not send a link just now. Try again in a minute.'); }
}

document.addEventListener('submit', async (e) => {
  const f = e.target;
  if (f.id === 'signinform') {
    e.preventDefault();
    const msg = $('#si-msg'), email = $('#si-email').value.trim(), pw = $('#si-pw').value;
    const say = (t) => { msg.textContent = t; };
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) return say('That email does not look complete.');
    if (!pw) return say('Type your password, or use “Email me a sign-in link”.');
    try { await account.login(email, pw); view = 'home'; try { history.replaceState(null, '', '/ground-plan/#home'); } catch { /* old browser */ } comeHome(); }
    catch (ex) { say(ex && ex.message && !/fetch|network|load failed/i.test(ex.message) ? ex.message : 'We could not reach the account service just now.'); }
    return;
  }
  if (f.id === 'pwform') {
    e.preventDefault();
    const msg = $('#pwmsg'), a = $('#pw1').value, c = $('#pw2').value;
    const say = (t) => { msg.textContent = t; };
    if (a.length < 10) return say('At least 10 characters, please.');
    if (a !== c) return say('The two passwords are different.');
    try { const r = await account.setPassword(a, c); hasPassword = true; $('#pw1').value = ''; $('#pw2').value = ''; say(r.changed ? 'Your password is changed.' : 'Your password is set.'); }
    catch (ex) { say(ex && ex.message && !/fetch|network|load failed/i.test(ex.message) ? ex.message : 'It did not save. Try again in a minute.'); }
    return;
  }
  if (f.id === 'askform') {
    e.preventDefault();
    const t = f.querySelector('textarea'), msg = f.querySelector('.joinerr'), body = t.value.trim();
    if (!body) { msg.textContent = 'Write your question first.'; t.focus(); return; }
    const lv = parseInt($('#ask-level').value, 10), dm = $('#ask-dom').value;
    try {
      await account.note({ body, level: lv || undefined, domain: dm || undefined });
      await openAsk();
      const m = document.querySelector('#askform .joinerr'); if (m) m.textContent = 'Sent. It is in the thread above.';
    } catch (ex) { msg.textContent = ex && ex.message && !/fetch|network|load failed/i.test(ex.message) ? ex.message : 'It did not send. Your question is still here; try again in a minute.'; }
    return;
  }
  if (f.matches('form[data-reply]')) {
    e.preventDefault();
    const t = f.querySelector('textarea'), msg = f.querySelector('.joinerr'), m = inbox && inbox.messages.find((x) => x.id === f.dataset.reply);
    if (!t.value.trim()) return;
    try {
      await account.note({ body: (m ? `Re: ${m.subject}\n\n` : '') + t.value.trim() });
      t.value = ''; msg.textContent = 'Sent. Alexandru and the team will see it.';
    } catch (ex) { msg.textContent = ex && ex.message ? ex.message : 'It did not send. Try again in a minute.'; }
  }
});

document.addEventListener('change', (e) => {
  const t = e.target.closest('input[data-plantick]');
  if (!t || !acctPlans) return;
  const id = t.dataset.plantick, on = t.checked, was = acctPlans.done[id];
  if (on) acctPlans.done[id] = new Date().toISOString(); else delete acctPlans.done[id];
  acctPlans.count = Object.keys(acctPlans.done).length;
  account.tick(id, on).then((r) => { if (r && Number.isInteger(r.count)) acctPlans.count = r.count; render(); })
    .catch(() => { if (was) acctPlans.done[id] = was; else delete acctPlans.done[id]; acctPlans.count = Object.keys(acctPlans.done).length; render(); });
});

document.addEventListener('input', (e) => {
  const w = e.target.closest('input[data-w]');
  if (w) {
    state.work[w.dataset.w] = w.value;
    save();
    account.touch('work', w.dataset.w, w.value);
    const st = state.stage || 'build', fw = fwFor(st, level, dom);
    const host = fw && document.querySelector(`[data-rhost="${fw.k}"]`);
    if (host) host.innerHTML = windowHTML(fw, st, level, dom);
    return;
  }
  const a = e.target.closest('textarea[data-k]');
  if (!a) return;
  const st = state.stage || 'build';
  const was = levelDone(st, level);
  const hadIt = !!(state.answers[a.dataset.k] || '').trim();
  state.answers[a.dataset.k] = a.value;
  save();
  account.touch('answers', a.dataset.k, a.value);
  a.closest('.step').classList.toggle('done', !!a.value.trim());
  // The Lamp: a newly written answer plays a chord and lights a candle.
  if (!hadIt && a.value.trim()) M.answered(answered(st, level, dom)); else if (hadIt && !a.value.trim()) M.setCandles(answered(st, level, dom));

  const n = levelDone(st, level);
  const c = $('#lvcount'), f = document.querySelector('.lvtrack i');
  if (c) c.textContent = `${n} of 28 answered`;
  if (f) f.style.width = (n / 28 * 100) + '%';
  const tab = document.querySelector(`.mtab[data-k="${dom}"] em`);
  if (tab) tab.textContent = `${answered(st, level, dom)}/7`;

  // Crossing a boundary changes what the page should say, so redraw then —
  // and only then, so typing never costs a re-render.
  if ((was === 28) !== (n === 28) || (was === 27 && n === 28)) { redrawModule(); return; }
  if (answered(st, level, dom) === 7 || answered(st, level, dom) === 6) {
    const foot = document.querySelector('.donext p');
    if (foot) foot.textContent = answered(st, level, dom) === 7
      ? `All seven written. ${DOMAINS.find((d) => d.k === dom).n} is done.`
      : `${answered(st, level, dom)} of 7 written in ${DOMAINS.find((d) => d.k === dom).n}.`;
  }
  refreshRail();
});

/* Coming home: spend a sign-in link if there is one, then bring the account's
 * work, North Star, notes and plans here. The device copy wins on conflict — it
 * is the one the founder was just typing into. */
async function comeHome() {
  if (linkCode && view === 'loading') {
    try { history.replaceState(null, '', location.pathname + '#home'); } catch { /* old browser */ }
    try { await account.signinWith(linkCode); view = 'home'; }
    catch (ex) { view = 'signin'; render(); const m = $('#si-msg'); if (m) m.textContent = ex.message || 'That sign-in link did not work. Ask for a new one.'; return; }
  }
  if (view === 'redirect') return;
  render();
  if (!account.joined()) return;
  if (!profileMounted) { profileMounted = true; import('/profile-menu.js').then((m) => m.mount($('#pmhost'))).catch(() => {}); }
  const [r, msgs, th] = await Promise.all([account.pull(), account.messages(), account.thread()]);
  // The account this device remembers no longer exists (deleted): forget it
  // and its cached name, and ask to sign in.
  if (r && r.gone) { account.signOut(); state.me = null; save(); view = 'signin'; render(); return; }
  if (msgs && msgs.ok) inbox = msgs;
  if (th && th.ok) ask = th;
  if (r && r.ok) {
    for (const [k, v] of Object.entries(r.answers || {})) if (v && !state.answers[k]) state.answers[k] = v;
    for (const [k, v] of Object.entries(r.work || {})) if (v && !state.work[k]) state.work[k] = v;
    compassRec = r.compass || null;
    if (r.me) {
      state.me = { name: r.me.name, email: r.me.email };
      if (r.me.tier) state.tier = r.me.tier;
      hasPassword = !!r.me.hasPassword;
      signupType = r.me.signupType || null;
      if (r.me.mentor && r.me.mentor.first) mentor = r.me.mentor;
      pulled = true;
    }
    let sales = '';
    try { sales = (JSON.parse(localStorage.getItem('exploraself-profile') || 'null') || {}).stage || ''; } catch { /* private mode */ }
    // A stage change not yet on the account goes now, and the device keeps it.
    if (state.stageSync) {
      const p = state.stageSync;
      account.setStage(p.stage, p.from).then(() => { delete state.stageSync; save(); }).catch(() => {});
    }
    const chosen = !state.stageSync && r.me && r.me.stageChosen ? r.me.stage : '';
    state.stage = programmeStage({ chosen, local: state.stage, compass: compassRec && compassRec.stage, account: (r.me && r.me.stage) || sales });
    save();
  }
  render();
  if (view === 'ask') openAsk();
  if (resetAsk) openReset();
  else if (hashNow === '#account') openReset('');
  loadPlans();
}
/** From a password-reset email: the password box, open and in view. */
let profileMounted = false;
function openReset(say = 'Choose your new password here. At least 10 characters.') {
  resetAsk = false;
  view = 'home'; render();
  const box = document.querySelector('.pw-box');
  if (!box) return;
  box.open = true;
  const m = $('#pwmsg'); if (m) m.textContent = say;
  box.scrollIntoView({ block: 'center' });
  const f = $('#pw1'); if (f) f.focus({ preventScroll: true });
}
comeHome();
