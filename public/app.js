// The Founder's Blueprint — the programme, and the founder's home base.
//
// /start is where a founder with an account comes home: their Base Camp
// (built from their North Star), the map of twelve levels, and a level (four
// domains, seven steps each). A locked level opens its gate instead of
// nothing, and the gate says plainly what opens it. Without an account, /start
// sends the visitor to the North Star sales page to make one, or shows sign-in.
//
// Answers save to the device first, and to the account when the founder has
// one. Nothing is asserted about a payment or a subscription.

import { DOMAINS, SEVEN, STAGES, WEEKS, LADDER, LEVELS, SHEETS, SECTIONS, loadStage,
  gateFor, levelFor, isWritten, weekTitle, videoFor, levelVideo, nextGain, holds,
  LEAD, BOOKING, LIBRARY } from './content.js';
import { entry, programmeStage, groundPlan, stageNudge } from './home.js';
import { cabinetHTML, cabinetShown, cabinetHidden, cabinetClick, dashboardShown, levelDots, compassStripHTML } from './cabinet.js';
import { result as fwResult } from './frameworks.js';
import { report } from './feedback.js';
import * as account from './account.js';
import { launchpadCardHTML, downloadLaunchpadPlan, launchpadOnlineHTML, launchpadFor } from './launchpad-plan.js';
import { slot as googleSlot } from './google.js';
import { videoBlock } from './video-talk.js';
import * as M from './music.js';
import { LEVELS4, CHAPTERS4, DOMS, UNITS, CLOSES, wkey, tapOf, slideOf, wordOf, shown, domainUnits, levelUnits,
  lines4, sentence, reading, fieldsOf, fill, stepsOf, stepDone, firstOf, planOf, plainOf, doneOf, takeOf, notyetOf,
  sureOf, gotOf, GOT, tally, countedFor, READ_QUOTES, carriedFrom, blueprint, BUILD4, fillB, buildPage, stepsWritten } from './levels-v4.js';

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
/** Arrived from "Sign out" in the profile menu: say so on the sign-in screen. */
const signedOut = (() => { try { return new URLSearchParams(location.search).get('out') === '1'; } catch { return false; } })();
/** Arrived from a password-reset email: open the password box once signed in. */
let resetAsk = (() => { try { return new URLSearchParams(location.search).get('reset') === '1'; } catch { return false; } })();
let view = linkCode ? 'loading' : entry({ joined: account.joined(), old: oldEntrance, hash: hashNow });
if (view === 'redirect') { try { location.replace('/north3/#join'); } catch { /* no location */ } }
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
/** Version 4 (31 Oct 2026): progress counts the tap, the slide and the
 *  sentence in each domain, so a level is twelve units (UNITS). The earlier
 *  seven-step answers stay saved, untouched. */
function answered(st, lv, dk) {
  return domainUnits(state.work, lv, DOMS.indexOf(dk));
}
function levelDone(st, lv) {
  return levelUnits(state.work, lv);
}
/** A level's name and promise, from Version 4. */
const titleOf = (st, n) => { const x = LEVELS4[n - 1]; return x ? `${x.word} · ${x.title}` : weekTitle(st, n); };
const promise4 = (st, n) => (LEVELS4[n - 1] ? LEVELS4[n - 1].promise : promiseOf(st, n));
// (level access now comes from levelState and the tier — see the workspace below)

// ── The Base Camp home base ───────────────────────────────────────────────
// The front door is the North Star sales page; /start is where a founder with an
// account comes home. Before the North Star: how this works, in three steps.
// After it: their Base Camp, from their own answers, then the programme.

const eye = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';
/** A password box with its show / hide button. */
const COPYI = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
/* Show and copy (31 Oct): a password field cannot be copied while hidden, so
 * a new password has its own copy button. */
const pwField = (id, label, auto) => `<label class="pwf"><span>${label}</span><span class="pwrow"><input id="${id}" type="password" autocomplete="${auto}" minlength="10"><button type="button" class="pweye" data-eye="${id}" aria-label="Show ${label.toLowerCase()}" aria-pressed="false">${eye}</button>${auto === 'new-password' ? `<button type="button" class="pweye" data-copypw="${id}" aria-label="Copy ${label.toLowerCase()}">${COPYI}</button>` : ''}</span></label>`;

/** A promise's first sentence: what that level leaves you with by Sunday. */
const promiseOf = (st, n) => { const L = (LEVELS[st] || {})[n]; return L && L.promise ? L.promise.split(/(?<=\.)\s+(?=[A-Z])/)[0] : ''; };
/** The founder's first name, from their account as read on this visit. */
const firstName = () => (pulled && state.me && state.me.name ? state.me.name.split(' ')[0] : '');

/** The first level not yet finished and open to this founder. */
function nextLevel(st) {
  for (let n = 1; n <= 12; n++) if (levelDone(st, n) < UNITS) return reachable(st, n) ? n : Math.max(1, n - 1);
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
      <li class="gp-move"><span class="gp-mn">01</span><b>Find where you stand</b><p>Eight plain questions, rough numbers, and feedback in all four domains. Free.</p><a class="cta" href="/northstar">Open the North Star →</a></li>
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
  while (lv < 12 && levelDone(st, lv) === UNITS) lv++;
  // The incubator band: FULL accounts only, once the account has been read.
  const full = pulled && signupType !== 'simple';
  const band = full ? { level: lv, title: titleOf(st, lv), done: levelDone(st, lv), total: UNITS,
    dots: levelDots(lv, (n) => levelDone(st, n), (n) => holds(state.tier || 'free', gateFor(n)), UNITS) } : null;
  return {
    first, name: state.me && state.me.name, tier: state.tier || 'free',
    stageName: STAGES[st] && STAGES[st].n, aimName: null, startHere: gp && gp.weakest ? gp.weakest.name : null,
    bands, plans: P ? { count: P.count, total: P.total, next } : null,
    prog: { level: lv, title: titleOf(st, lv), done: levelDone(st, lv), total: UNITS },
    askUnread: askUnread(), band,
  };
}

function homeView() {
  const st = state.stage || 'build';
  const gp = compassRec && window.CompassEngine ? groundPlan(compassRec, window.CompassEngine, { STAGES, weekTitle: titleOf, promise: promise4 }) : null;
  const first = firstName();
  return `<div class="gp">
    ${cabinetHTML(cabinetData(st, gp, first))}
    ${compassStripHTML(!!compassRec, compassRec && compassRec.taken ? compassRec.taken.length : 1)}
    ${launchpadCardHTML({ thin: (state.me && state.me.thin) || '' })}
    ${notesHTML()}
    ${nudgeHTML(st)}
    ${gp ? planHTML(gp, st) : `<section class="gp-wrap gp-two gp-grid">${standHTML(st)}</section>${howItWorks(st)}`}
    ${accountHTML()}
  </div>`;
}

/** Signing in on this device: email and password, or a one-time email link. */
function signinView() {
  return `<section class="band qband"><div class="wrap narrow">
    <p class="eyebrow">${compass} Your Base Camp</p>
    <h1 class="qh">Sign in</h1>
    <p class="sec-lede">Continue with Google, or your email and password. Signed up with your name and email only, or forgotten your password? We email you a link that signs you in on this device.</p>
    <form class="joinbox bare" id="signinform" novalidate>
      ${googleSlot()}
      <div class="joinrow">
        <label><span>Email</span><input id="si-email" type="email" autocomplete="email" required></label>
        ${pwField('si-pw', 'Password', 'current-password')}
      </div>
      <button class="cta" type="submit">Sign in →</button>
      <span class="si-help"><button class="lib-link" type="button" data-reset>Forgot your password?</button><button class="lib-link" type="button" data-link>No password? Email me a sign-in link</button></span>
      <p class="joinerr" id="si-msg" role="status"></p>
      <p class="savenote">New here? <a href="/north3/#join">Create your free account →</a></p>
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
  if (levelDone(st, n) === UNITS) return 'done';
  if (n === 1) return 'open';
  // A level opens when the one before it is finished. The gate is the work,
  // not the clock — and the tier gate sits on top of it, further down.
  return levelDone(st, n - 1) === UNITS ? 'open' : 'waiting';
}
function reachable(st, n) {
  return holds(state.tier, gateFor(n)) && levelState(st, n) !== 'waiting';
}

/** The library at the top of the rail: four doors into the Library view. */
const LIB_ICONS = [
  ['3 manuals', 'The three manuals', '<path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z" fill="none" stroke="#B4975F" stroke-width="1.6" stroke-linejoin="round"/>'],
  ['99 tools', 'Built to Lead, 99 tools', '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z" fill="none" stroke="#B4975F" stroke-width="1.6" stroke-linejoin="round"/>'],
  ['32 frameworks', 'Worth Building, 32 frameworks', '<rect x="3" y="3" width="7" height="7" rx="1" fill="none" stroke="#B4975F" stroke-width="1.6"/><rect x="14" y="3" width="7" height="7" rx="1" fill="none" stroke="#B4975F" stroke-width="1.6"/><rect x="3" y="14" width="7" height="7" rx="1" fill="none" stroke="#B4975F" stroke-width="1.6"/><rect x="14" y="14" width="7" height="7" rx="1" fill="none" stroke="#B4975F" stroke-width="1.6"/>'],
  ['12 principles', 'A New Way of Winning, 12 principles', '<circle cx="12" cy="12" r="9" fill="none" stroke="#B4975F" stroke-width="1.6"/><path d="M12 6l2 6-2 1.5-2-1.5z" fill="#B4975F"/>'],
];
const libIcons = () => `<div class="rlib"><p class="eyebrow">Your library · now open</p><div class="rlibrow">${LIB_ICONS.map(([t, label, svg]) =>
  `<button type="button" class="libi${t === 'Soon' ? ' soon' : ''}" data-go="library" aria-label="${esc(label)}"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">${svg}</svg>${esc(t)}</button>`).join('')}</div></div>`;
const bookIcon = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

/** The Leader’s North Star, always in the rail, just above The Boardroom. */
const railStar = `<a class="rstar" href="/northstar/" aria-label="Open your Leader’s North Star: where you stand in all four domains">
  <svg class="rstar-i" width="40" height="40" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="#B4975F" stroke-width="1.6"/><circle cx="32" cy="32" r="23" fill="none" stroke="#3B4C70"/>
    <g stroke="#B4975F" stroke-width="1.4"><line x1="32" y1="3" x2="32" y2="9"/><line x1="32" y1="55" x2="32" y2="61"/><line x1="3" y1="32" x2="9" y2="32"/><line x1="55" y1="32" x2="61" y2="32"/></g>
    <circle cx="32" cy="11" r="2.6" fill="#A8623A"/><circle cx="53" cy="32" r="2.6" fill="#4C7355"/><circle cx="32" cy="53" r="2.6" fill="#36607F"/><circle cx="11" cy="32" r="2.6" fill="#9A7418"/>
    <g class="cban-needle"><path d="M32 14 L36 32 L32 35 L28 32Z" fill="#D6BF8F"/><path d="M32 50 L36 32 L32 29 L28 32Z" fill="#3B4C70"/></g><circle cx="32" cy="32" r="3" fill="#B4975F"/></svg>
  <span><small>The Leader’s North Star</small><b>Where you stand, in all four domains</b><em>Open my North Star →</em></span></a>`;
function railHTML(st) {
  const marks = { done: '✓', open: '', waiting: '·', locked: '🔒' };
  return `<nav class="rail" id="rail" aria-label="The twelve levels">
    <div class="railtop">
      <p class="eyebrow">${esc(STAGES[st].n)}</p>
      <h2>Your Blueprint</h2>
      <p class="railsub">${esc(STAGES[st].blurb)}</p>
      <button type="button" class="rbp" data-go="blueprint">Open my Blueprint: everything you have written →</button>
    </div>
    ${libIcons()}
    ${SECTIONS.map((sec) => {
      const owned = holds(state.tier, sec.k);
      const rung = LADDER.find((r) => r.key === sec.k);
      const tag = sec.k === 'session' ? '1:1' : rung ? rung.price : '';
      return `${sec.k === 'session' ? railStar : ''}<section class="rsec${owned ? '' : ' shut'}">
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
            <span class="rtxt"><b>${esc(titleOf(st, n))}</b>${done ? `<em>${done} of ${UNITS}</em>` : ''}</span>
            <span class="rmark ${stt}" aria-hidden="true">${marks[stt] || ''}</span>
            <span class="vh">${stt === 'done' ? 'finished' : stt === 'locked' ? 'not yet open' : stt === 'waiting' ? 'opens when the level before is finished' : 'open'}</span>
          </button></li>`;
        }).join('')}</ul>
        <p class="rnote">${esc(sec.note)}</p>
        ${sec.k === 'session' && !owned ? `<a class="rbook" href="${esc(BOOKING)}" target="_blank" rel="noopener">${bookIcon}Book my 1:1 with Alexandru</a>` : ''}
      </section>`;
    }).join('')}
    <a class="rsummit" href="/northstar/summit">
      <small>THE TOP</small>
      <b>The Summit</b>
      <span>Everything, and Alexandru every week · $1,989</span>
    </a>
  </nav>`;
}

// ── A level, as a notebook: the Crown, Version 4 ───────────────────────────
// The level, its promise and its four domains on the left page; one move on
// the right: tap the line that sounds like you, slide to the honest number,
// write one sentence, then read four lines back. Enter moves on. Everything
// else (the levels, the library, the music, Focus, the light, Ask Alexandru,
// a 1:1) waits in the Crown at the bottom of the screen.
const pad = (n) => String(n).padStart(2, '0');
/** The screen on the right page: an index into stepsOf(level) (one field on
 *  screen at a time). null: where the founder left off, decided on drawing. */
let qi = null;
/** Can the founder work in this level now? Owned and open. */
function writable(st) {
  return holds(state.tier, gateFor(level)) && levelState(st, level) !== 'waiting' && !!LEVELS4[level - 1];
}
const steps = () => stepsOf(level);
const stepAt = (i) => steps()[i] || [-1, 'week'];
/** A screen that asks for an answer needs one before Next; the slides keep
 *  where they start, and the screens that only show are always ready. */
const ASKS = ['got', 'tap', 'blank', 'day', 'carry', 'carryday', 'bask', 'bstep', 'bday'];
const ready = (i) => { const s = stepAt(i); return !ASKS.includes(s[1]) || stepDone(state.work, level, s); };
const lastStep = () => steps().length - 1;
/** The domain the North Star found weakest (0 to 3), or -1: it gets the
 *  "Start here" mark, and its action is the week's one move. */
function startHere() {
  try {
    const gp = compassRec && window.CompassEngine ? groundPlan(compassRec, window.CompassEngine, { STAGES, weekTitle: titleOf, promise: promise4 }) : null;
    if (gp && gp.weakest) return DOMS.indexOf(gp.weakest.id);
  } catch { /* no North Star yet */ }
  return DOMS.indexOf((state.me && state.me.thin) || '');
}
const STAGE_NOTE = { build: 'building', grow: 'growing', scale: 'scaling' };
const DAYS7 = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SUREW = [[30, 'a long shot'], [60, 'maybe'], [80, 'likely'], [100, 'certain']];
const sureWord = (v) => (SUREW.find(([m]) => v <= m) || SUREW[3])[1];
/** The founder's Growth Plan words (full accounts), read once per visit: where
 *  a domain covers the same ground, the screen shows them back. */
let gpWords = null, gpAsked = false;
function growthWords() {
  if (gpAsked || !account.joined()) return;
  gpAsked = true;
  account.growthPlan().then((r) => {
    if (!r || !r.words || !Object.keys(r.words).length) return;
    gpWords = r.words;
    if (view === 'work') drawBook(false);
    if (view === 'blueprint') growthText().then(() => { if (view === 'blueprint') render(); });
  }).catch(() => {});
}
/** The Growth Plan's own words (its steps and lines), loaded only for the
 *  Blueprint's ninth part. */
let gpTextP = null;
function growthText() {
  if (window.GrowthPlan) return Promise.resolve(window.GrowthPlan);
  if (!gpTextP) gpTextP = new Promise((ok) => { const sc = document.createElement('script'); sc.src = '/northstar/growth-plan.js'; sc.onload = () => ok(window.GrowthPlan || null); sc.onerror = () => ok(null); document.head.appendChild(sc); });
  return gpTextP;
}
/** The ninth part: the inner side, from the founder's Growth Plan (full
 *  accounts who wrote in it). Each step with words, its lines filled in. */
function innerSide() {
  const G = window.GrowthPlan;
  if (!G || !gpWords) return '';
  const steps = G.domains.flatMap((dm) => dm.steps.map((st2) => ({ dm, st: st2 })))
    .filter(({ st: st2 }) => Object.keys(gpWords).some((k) => k.startsWith(`${st2.id}.`) && String(gpWords[k]).trim()));
  if (!steps.length) return '';
  const lineOf = (id, lines) => { let n = 0; return lines.map((l) => esc(l).replace(/_{3,}/g, () => { n += 1; const v = String(gpWords[`${id}.${n}`] || '').trim(); return v ? `<mark>${esc(v)}</mark>` : '<span class="ln"></span>'; })); };
  return `<section class="bp-sec" id="bp-inner" aria-labelledby="bph-inner">
    <h2 id="bph-inner">The inner side</h2><p class="bp-about">From your Growth Plan: the truth you hide, the root, out loud, the fear, twelve weeks measured.</p>
    ${steps.map(({ dm, st: st2 }) => `<article class="bp-it" style="--c:${esc(dm.col)}"><p class="bp-src">${esc(dm.name)} · ${esc(st2.move)}</p><h3>${esc(st2.title)}</h3>
      <div class="bp-take"><ol>${lineOf(st2.id, st2.lines).map((l) => `<li>${l}</li>`).join('')}</ol></div></article>`).join('')}
  </section>`;
}
/** "From your Growth Plan": their own words, on the screen that asks the same. */
function gpBack(p, at) {
  if (!p || !p.gp || p.gp.at !== at || !gpWords) return '';
  const said = p.gp.ids.map((id) => String(gpWords[id] || '').trim()).filter(Boolean);
  return said.length ? `<p class="cw-gp"><b>From your Growth Plan · step ${p.gp.step}</b> ${said.map((x) => `“${esc(x)}”`).join(' · ')}</p>` : '';
}
/** Keep one answer: on this device first, then the account, in batches. */
// ── One step before the first answer (31 Oct 2026, Alexandru) ──────────────
// One universal rule, whatever sales page a founder came from: an account
// without its full details (company, what they want most, industry,
// password; /api/state says which) is asked once, at its first answer, for
// only what it lacks. The answer they were giving is held and applied after
// the save, so nothing is lost. Accounts that are complete never see it.
let missing = [];
const needsAccount = () => account.joined() && pulled && missing.length > 0;
let heldAnswer = null;
function askAccount(then) {
  heldAnswer = then || null;
  import('/reset-box.js').then((m) => m.openComplete({ name: state.me && state.me.name, email: state.me && state.me.email, missing,
    done: () => {
      if (missing.includes('password')) hasPassword = true;
      missing = []; signupType = 'full';
      const go = heldAnswer; heldAnswer = null;
      if (go) go();
      saidNote('Your account is complete. Your answer is saved.');
    } })).catch(() => { heldAnswer = null; });
}
function saidNote(msg) {
  const n = document.createElement('div');
  n.setAttribute('role', 'status'); n.textContent = msg;
  Object.assign(n.style, { position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)', zIndex: 130, background: '#14100B', color: '#F6EEDD', padding: '12px 18px', borderRadius: '999px', font: '600 14px Inter, Arial, sans-serif', boxShadow: '0 10px 30px rgba(0,0,0,.35)', maxWidth: 'calc(100vw - 32px)', textAlign: 'center' });
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3200);
}
// The slider and the sentence: asked before the first move, not after.
document.addEventListener('pointerdown', (e) => {
  const v = e.target && e.target.closest && e.target.closest('input[data-v4s], input[data-v4u]');
  if (!v || !needsAccount()) return;
  e.preventDefault();
  askAccount(() => { const x = document.getElementById(v.id); if (x) x.focus(); });
}, true);
document.addEventListener('focusin', (e) => {
  const v = e.target && e.target.closest && e.target.closest('input[data-v4s], input[data-v4f], input[data-v4u], input[data-lp]');
  if (!v || !needsAccount()) return;
  v.blur();
  askAccount(() => { const x = document.getElementById(v.id); if (x) x.focus(); });
});

function keep4(d, k, v, lv = level) {
  // Safety net: a move that reached here some other way waits for the account too.
  if (needsAccount()) { askAccount(() => keep4(d, k, v, lv)); return; }
  const key = wkey(lv, d, k);
  state.work[key] = String(v);
  save();
  account.touch('work', key, String(v));
}

function bookHTML(st) {
  const x = LEVELS4[level - 1];
  const g = gateFor(level);
  let right = '';
  if (!holds(state.tier, g)) {
    const rung = LADDER.find((r) => r.key === g);
    right = `<div class="gate">
        <p class="eyebrow">${compass} What opens this</p>
        <h3>${esc(rung.n)}</h3><p>${esc(rung.what)}</p>
        <span class="price">${esc(rung.price)}</span>
        ${rung.url ? `<a class="cta" href="${esc(rung.url)}" target="_blank" rel="noopener">See what it includes ↗</a>` : ''}
      </div>`;
  } else if (levelState(st, level) === 'waiting') {
    const prev = levelDone(st, level - 1);
    right = `<div class="wait">
        <p class="eyebrow">Not yet</p>
        <h3>Finish level ${pad(level - 1)} first</h3>
        <p>${prev} of its ${UNITS} moves are done. This level opens when all of them are, because every move here builds on the ones before it.</p>
        <button class="cta" type="button" data-level="${level - 1}">Back to level ${pad(level - 1)}</button>
      </div>`;
  }
  const open = !right;
  if (open && (qi === null || qi > lastStep())) qi = firstOf(state.work, level);
  if (open) dom = DOMS[Math.max(0, stepAt(qi)[0])];
  return `<div class="book${open ? '' : ' shut'}">
    <aside class="leaf leaf-l" id="leafl" aria-label="Level ${pad(level)} and its four domains">${leftHTML(st, x, open)}</aside>
    <section class="leaf leaf-r" aria-label="${open ? 'This move' : 'This level'}">${right || pageHTML(st, x)}</section>
  </div>`;
}

/** The left page: the level, its floor, the belief it changes, its promise,
 *  and the four domains with how far each has come. */
function leftHTML(st, x, open) {
  const done = levelDone(st, level);
  const ch = CHAPTERS4.find((c) => c.lv.includes(level - 1));
  const cur = stepAt(qi === null ? 0 : qi)[0];
  const head = `<button type="button" class="cw-sx" data-crown="steps" aria-label="Close the steps">×</button>
    <p class="eyebrow">Level ${pad(level)} · ${esc(ch ? ch.name : '')}</p>
    <h2 class="cw-t">${esc(x.word)}. <em>${esc(x.title)}.</em></h2>
    <p class="cw-floor">${esc(x.floor)}</p>
    <div class="lvtrack"><i style="width:${done / UNITS * 100}%"></i></div>
    <p class="lvcount" id="lvcount">${done} of ${UNITS} done</p>`;
  const all = `<button type="button" class="cw-all" data-go="rail">☰ All twelve levels</button>`;
  if (!open) return `${head}${all}`;
  const doms = x.d.map((D, d) => {
    const u = domainUnits(state.work, level, d), now = d === cur;
    return `<li><button type="button" class="cw-s${u === 3 ? ' done' : ''}${now ? ' now' : ''}" data-qd="${d}"${now ? ' aria-current="step"' : ''}>
      <span class="cw-n cw-letter" style="background:var(--${DOMS[d]})">${esc(D.l)}</span>
      <span class="cw-st"><b>${esc(D.name)}</b><i>${esc(LEAD[DOMS[d]])} · ${u} of 3</i></span></button></li>`;
  }).join('');
  return `${head}
    <p class="cw-belief">From <b>“${esc(x.old)}”</b><br>to <b>“${esc(x.neu)}”</b></p>
    <ol class="cw-steps cw-doms4">${doms}</ol>
    <p class="cw-promise"><b>By Sunday.</b> ${esc(x.promise)}</p>
    ${CLOSES[level] != null ? `<p class="cw-chapnote">This level closes ${esc(CHAPTERS4[CLOSES[level]].name)}. Your chapter reading comes after it.</p>` : ''}
    <p class="cw-more"><a href="#cw-video">▶ This level’s teaching</a><button type="button" class="cw-all" data-go="blueprint">My Blueprint</button>${all}</p>`;
}

/** The right page: one field on screen (31 Oct 2026, the Blueprint
 *  skeleton). Tap, slide, one blank at a time, the day as a tap, "Done when"
 *  with how sure, four lines back; the week as four actions; last week's four
 *  first; the chapter reading and one action carried forward. */
const KIND = { got: 'Last week', tap: 'Tap', slide: 'Slide', blank: 'Write once', day: 'The day', done: 'Done when',
  lines: 'Your four lines', week: 'Your week', reading: 'Chapter reading', carry: 'Carry one forward', carryday: 'Its day',
  bask: 'Build it', bstep: 'Build it', bday: 'Its day', bpage: 'Your page' };
/** The sentence, with the blank being written lit and the rest as written so far. */
function sentenceAt(w, lv, d, cur) {
  return LEVELS4[lv - 1].d[d].f.map((p) => {
    if (typeof p === 'string') return esc(p);
    const v = (w[wkey(lv, d, p[0])] || '').trim();
    return `<span class="cw-f${p[0] === cur ? ' on' : ''}${v ? ' has' : ''}" data-fk="${esc(p[0])}">${esc(v || p[1])}</span>`;
  }).join('');
}
/** Seven days as taps, and a date for anything further. */
function dayPick(d, key, v) {
  return `<div class="cw-days" role="group" aria-labelledby="cwq">${DAYS7.map((n, k) => `<button type="button" class="cw-o cw-day" data-v4day="${n}" aria-pressed="${v === n}"><kbd aria-hidden="true">${k + 1}</kbd><span>${n.slice(0, 3)}</span></button>`).join('')}</div>
    <label class="cw-bl" for="cwin">Or a date</label>
    <input id="cwin" class="cw-in cw-date" data-v4f="${d}.${key}" value="${esc(DAYS7.includes(v) ? '' : v)}" placeholder="e.g. 14 Nov" enterkeyhint="next" autocomplete="off">`;
}
/** The four actions of a level, the Start-here one first. */
function weekList(lv, sh) {
  const w = state.work, x = LEVELS4[lv - 1], order = sh >= 0 ? [sh, ...[0, 1, 2, 3].filter((k) => k !== sh)] : [0, 1, 2, 3];
  return `<ol class="cw-week">${order.map((k, i) => {
    const u = sureOf(w, lv, k);
    return `<li style="--c:var(--${DOMS[k]})"><p class="cw-wk">${sh >= 0 && i === 0 ? '★ My one move' : `Goal ${sh >= 0 ? i : i + 1}`} · ${esc(LEAD[DOMS[k]])}</p>
      <p class="cw-wa">${fill(x.d[k].fb[3], w, lv, k)}</p>
      <p class="cw-dw"><b>Done when</b> ${doneOf(w, lv, k)}${u != null ? ` <span class="cw-u">· ${u}% sure</span>` : ''}</p></li>`;
  }).join('')}</ol>`;
}
/** Build it: one page after each chapter reading, mostly from answers
 *  already given (BUILD4). One field on screen, then the page. */
function buildHTML(st, kind, key, ci) {
  const w = state.work, B = BUILD4[level], v = (w[wkey(level, 'b', key)] || '').trim();
  if (kind === 'bask') {
    const a = [...B.asks, ...(B.who ? [B.who] : [])].find((x) => x[0] === key);
    return `${key === B.asks[0][0] ? `<p class="cw-ins"><b>Why it matters</b> ${esc(B.ins)}</p>` : ''}
      <h3 class="cw-q" id="cwq">${esc(a[1])}</h3>
      <input id="cwin" class="cw-in" data-v4f="b.${esc(key)}" value="${esc(v)}" placeholder="e.g. ${esc(a[2])}" aria-labelledby="cwq" enterkeyhint="next" autocomplete="off" autocapitalize="sentences">
      <p class="cw-keys">A few words is enough · <kbd>Enter ↵</kbd> next</p>`;
  }
  if (kind === 'bstep') {
    const n = Number(key.slice(1)), done = stepsWritten(w, level);
    return `<p class="cw-sent cw-sent-s">${fillB('{task}. It starts when {when}.', w, level)}</p>
      ${done.length ? `<ol class="cw-steps4">${done.map((x, i) => `<li${i + 1 === n ? ' class="on"' : ''}>${esc(x)}</li>`).join('')}</ol>` : ''}
      <h3 class="cw-q" id="cwq">Step ${n}${n > 3 ? ' <em>(or leave it empty: that was the last)</em>' : ''}</h3>
      <input id="cwin" class="cw-in" data-v4f="b.${esc(key)}" value="${esc(v)}" placeholder="${n === 1 ? 'e.g. Open the order list for the week' : 'The next step, as an instruction'}" aria-labelledby="cwq" enterkeyhint="next" autocomplete="off" autocapitalize="sentences">
      <p class="cw-keys">One step, as an instruction a stranger could follow · up to ten · <kbd>Enter ↵</kbd> next</p>`;
  }
  if (kind === 'bday') {
    return `<h3 class="cw-q" id="cwq">${esc(B.day)}</h3>${dayPick('b', 'day', v)}
      <p class="cw-keys"><kbd>1–7</kbd> choose a day · <kbd>Enter ↵</kbd> next</p>`;
  }
  const next = CHAPTERS4[ci + 1];
  return `<h3 class="cw-q">${esc(B.title)}. <em>Built from what you wrote.</em></h3>
    <section class="cw-page" aria-label="${esc(B.title)}">${buildPage(w, level).map(([label, html]) => `<div><h4>${esc(label)}</h4><p>${html}</p></div>`).join('')}</section>
    <p class="cw-dw"><b>Done when</b> ${fillB(B.done, w, level)}</p>
    <p class="cw-more"><button type="button" class="cw-copy cw-copyweek" data-copypage>Copy the page</button><button type="button" class="cw-all" data-go="blueprint">See it in your Blueprint</button></p>
    ${next && LEVELS4[level] ? `<div class="gain"><p class="gaint">${esc(next.n)} · ${esc(next.name)}</p><p class="gainp">${esc(next.about)}</p>
      <button class="cta" type="button" data-level="${level + 1}">${holds(state.tier, gateFor(level + 1)) ? `Open level ${pad(level + 1)}` : 'See what opens it'}</button></div>`
      : `<p class="cw-planner">Twelve weeks, written. <button type="button" class="cw-all" data-go="blueprint">Open your Blueprint</button></p>`}`;
}
/** The chapter reading, after the Version 4 reading: what was done, how good
 *  the estimates were, the beliefs, where the founder began, his words. */
function readingMore(ci) {
  const w = state.work, lvs = countedFor(ci), t = tally(w, lvs), C = CHAPTERS4[ci], Q = READ_QUOTES[ci], sh = startHere(), r = reading(w, ci);
  return `<div class="cw-rm">
    <section><h4>What you did</h4><p>${t.n ? `${t.done} done, ${t.part} partly, ${t.not} not yet: the ${t.n} actions you checked on Sunday, levels ${pad(lvs[0])} to ${pad(lvs[lvs.length - 1])}.` : 'No Sunday answers yet. Each level asks about the week before it, first.'}</p></section>
    <section><h4>How you estimate</h4><p>${t.est ? `Your estimates were <b>${t.est}</b>: on average you were ${Math.round(t.hoped * 100)}% sure, and you did about ${Math.round(t.real * 100)}% of what you set.` : 'Not enough Sunday answers yet to compare.'} The same three words as your Planner’s Sunday page.</p></section>
    <section><h4>What you believed, what you believe now</h4><ul>${C.lv.map((i) => `<li><s>“${esc(LEVELS4[i].old)}”</s> “${esc(LEVELS4[i].neu)}”</li>`).join('')}</ul></section>
    <section><h4>Where you began</h4><p>${sh >= 0 ? `Your North Star said start with ${esc(LEAD[DOMS[sh]])}. Across this chapter your answers put ${esc(LEAD[DOMS[r.lo]])} lowest${sh === r.lo ? ', so it is still where you lean.' : '.'}` : 'Take the North Star, and this line will compare where you began with where you are now.'}</p></section>
    <blockquote class="cw-quote">“${esc(Q.q)}”<cite>Alexandru · ${esc(Q.src)}</cite></blockquote>
  </div>`;
}
function pageHTML(st, x) {
  const [d, kind, key] = stepAt(qi), w = state.work, total = lastStep() + 1;
  const prev = LEVELS4[level - 2], D = d >= 0 ? (kind === 'got' ? prev.d[d] : x.d[d]) : null, p = d >= 0 && kind !== 'got' ? planOf(level, d) : null;
  const ci = CLOSES[level];
  const seg = Array.from({ length: total }, (_, i) => `<i class="${i < qi ? 'done' : ''}${i === qi ? ' now' : ''}" data-i="${i}"></i>`).join('');
  const label = kind === 'got' ? `Last week · Level ${pad(level - 1)} · ${esc(LEAD[DOMS[d]])}`
    : D ? `${esc(D.l)} · ${esc(D.name)} · ${esc(LEAD[DOMS[d]])}` : kind === 'week' ? `Level ${pad(level)} · ${esc(x.word)} · your week`
    : kind[0] === 'b' && BUILD4[level] ? `Build it · ${esc(BUILD4[level].title)}` : 'Your chapter reading';
  const top = `<button type="button" class="cw-phone" data-crown="steps" aria-label="Show the four domains of this level">
      <span><i aria-hidden="true"></i>Level ${pad(level)} · ${esc(x.word)} · ${qi + 1} of ${total}</span><span aria-hidden="true">Domains ▾</span></button>
    <div class="cw-seg" aria-hidden="true">${seg}</div>
    <p class="cw-lab"${D ? ` style="color:var(--${DOMS[d]})"` : ''}>${label} <span class="cw-kind">${KIND[kind]}</span>${d >= 0 && kind !== 'got' && d === startHere() ? ' <span class="cw-start">★ Start here</span>' : ''}</p>`;
  let body = '';
  if (kind === 'got') {
    const g = gotOf(w, level - 1, d), u = sureOf(w, level - 1, d);
    body = `<h3 class="cw-q" id="cwq">Last week: <em>did it happen?</em></h3>
      <div class="cw-was"><p>${fill(D.fb[3], w, level - 1, d)}</p><p class="cw-dw"><b>Done when</b> ${doneOf(w, level - 1, d)}</p></div>
      <div class="cw-opts" role="group" aria-labelledby="cwq">${GOT.map((o, k) => `<button type="button" class="cw-o" data-got="${k}" aria-pressed="${g === k}"><kbd aria-hidden="true">${k + 1}</kbd><span>${o}</span></button>`).join('')}</div>
      ${g == null ? '<p class="cw-keys"><kbd>1–3</kbd> choose · a no is information, not a verdict</p>'
        : `<p class="cw-said">${u != null ? `You were ${u}% sure. ` : ''}It happened: ${['yes', 'partly', 'not yet'][g]}.</p>${g > 0 ? `<p class="cw-smaller">${notyetOf(w, level - 1, d)}</p>` : ''}`}`;
  } else if (kind === 'tap') {
    const t = tapOf(w, level, d);
    growthWords();
    body = `${p ? `<p class="cw-topic">${esc(p.topic)}</p>` : ''}${gpBack(p, 't')}<h3 class="cw-q" id="cwq">${D.t.q}</h3>
      <div class="cw-opts" role="group" aria-labelledby="cwq">${D.t.o.map((o, k) => `<button type="button" class="cw-o" data-v4t="${k}" aria-pressed="${t === k}"><kbd aria-hidden="true">${k + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div>
      <p class="cw-keys"><kbd>1–${D.t.o.length}</kbd> choose · <kbd>Enter ↵</kbd> next</p>`;
  } else if (kind === 'slide') {
    let v = slideOf(w, level, d);
    if (v == null) { v = D.s.d; keep4(d, 's', v); }
    const pc = (v - D.s.min) / (D.s.max - D.s.min) * 100;
    body = `<h3 class="cw-q" id="cwq">${esc(D.s.q)}</h3>
      <div class="cw-slide"><div class="cw-big"><span id="cwbig">${esc(shown(D.s, v))}</span><small id="cwword">${D.s.raw ? '' : esc(wordOf(D.s, v))}</small></div>
      <input type="range" id="cwr" data-v4s="${d}" min="${D.s.min}" max="${D.s.max}" step="${D.s.step}" value="${v}" style="--p:${pc}%" aria-labelledby="cwq">
      <div class="cw-ends"><span>${esc(D.s.e[0])}</span><span>${esc(D.s.e[1])}</span></div></div>
      <p class="cw-keys"><kbd>← →</kbd> slide · <kbd>Enter ↵</kbd> next</p>`;
  } else if (kind === 'blank') {
    const fs = fieldsOf(D), f = fs.find((x2) => x2[0] === key) || fs[0], first = fs[0][0] === key, v = w[wkey(level, d, key)] || '';
    const note = p && p.stage && p.stage[STAGE_NOTE[st]];
    body = `${first && p ? `<p class="cw-ins"><b>Why it matters</b> ${esc(p.ins)}</p>` : ''}
      <h3 class="cw-sent" id="cwq">${sentenceAt(w, level, d, key)}</h3>
      ${gpBack(p, key)}
      <label class="cw-bl" for="cwin">${esc(f[1])}</label>
      <input id="cwin" class="cw-in" data-v4f="${d}.${esc(key)}" value="${esc(v)}" placeholder="e.g. ${esc(f[2])}" enterkeyhint="next" autocomplete="off" autocapitalize="sentences">
      ${first && note ? `<p class="cw-stage"><b>${esc(STAGES[st] ? STAGES[st].n : '')}</b> ${esc(note)}</p>` : ''}
      <p class="cw-keys">A few words is enough · <kbd>Enter ↵</kbd> next</p>`;
  } else if (kind === 'day') {
    const v = (w[wkey(level, d, key)] || '').trim();
    body = `${key === 'on' ? '' : `<p class="cw-sent cw-sent-s">${sentenceAt(w, level, d, key)}</p>`}
      <h3 class="cw-q" id="cwq">${key === 'on' ? plainOf(p.on, w, level, d) : 'Which day?'}</h3>
      ${dayPick(d, key, v)}
      <p class="cw-keys"><kbd>1–7</kbd> choose a day · <kbd>Enter ↵</kbd> next</p>`;
  } else if (kind === 'done') {
    let u = sureOf(w, level, d);
    if (u == null) { u = 50; keep4(d, 'sure', u); }
    body = `<div class="cw-was cw-donebox"><p class="cw-dw"><b>Done when</b> ${doneOf(w, level, d)}</p></div>
      <h3 class="cw-q" id="cwq">How sure are you that this is done <em>by Sunday?</em></h3>
      <div class="cw-slide"><div class="cw-big"><span id="cwbig">${u}%</span><small id="cwword">${esc(sureWord(u))}</small></div>
      <input type="range" id="cwr" data-v4u="${d}" min="0" max="100" step="10" value="${u}" style="--p:${u}%" aria-labelledby="cwq">
      <div class="cw-ends"><span>Not sure</span><span>Certain</span></div></div>
      <p class="cw-keys">On Sunday, the next level asks what happened · <kbd>Enter ↵</kbd> next</p>`;
  } else if (kind === 'lines') {
    const t = takeOf(w, level, d);
    body = `<h3 class="cw-q">${esc(D.name)}, <em>in four lines.</em></h3>
      <div class="cw-fb">${lines4(w, level, d).map((l, i) => `<div class="cw-fl"><h4>${l[0]}<small>${l[1]}</small></h4><div><p>${l[2]}</p>${i === 3 ? `<p class="cw-dw"><b>Done when</b> ${doneOf(w, level, d)}</p>` : ''}</div></div>`).join('')}</div>
      ${t ? `<section class="cw-take" aria-labelledby="cwtk-${d}"><p class="cw-tk">Yours to keep · it goes into your Blueprint</p>
        <h4 id="cwtk-${d}">${t.title}</h4><ol>${t.lines.map((l) => `<li>${l}</li>`).join('')}</ol>
        <button type="button" class="cw-copy" data-copytake="${d}">Copy</button></section>` : ''}`;
  } else if (kind === 'week') {
    const sh = startHere(), pc = CLOSES[level - 1] != null ? carriedFrom(w, level - 1) : null, next = LEVELS4[level];
    body = `<h3 class="cw-q">Your week. <em>Four actions, each with its day.</em></h3>
      ${weekList(level, sh)}
      ${pc ? `<p class="cw-carry"><b>Carried forward from your reading</b> ${fill(LEVELS4[pc[0] - 1].d[pc[1]].fb[3], w, pc[0], pc[1])}${w[wkey(level - 1, 'r', 'on')] ? ` · by ${esc(w[wkey(level - 1, 'r', 'on')])}` : ''}</p>` : ''}
      <p class="cw-planner">Write them on your Planner’s Monday page: ${sh >= 0 ? 'the first as <b>My one move</b>, the other three as <b>Three goals</b>' : 'the one you most want to avoid as <b>My one move</b>, the other three as <b>Three goals</b>'}. On Sunday, the next level asks what happened.</p>
      <p class="cw-more"><button type="button" class="cw-copy cw-copyweek" data-copyweek>Copy my week</button><button type="button" class="cw-all" data-go="blueprint">See it in your Blueprint</button></p>
      ${ci != null ? `<p class="cw-note">This closes ${esc(CHAPTERS4[ci].name)}. Your chapter reading is next.</p>`
        : next ? `<div class="gain"><p class="eyebrow">${compass} What level ${pad(level + 1)} gives you</p><p class="gaint">${esc(next.word)} · ${esc(next.title)}</p><p class="gainp">${esc(next.promise)}</p>
          ${levelDone(st, level) === UNITS ? `<button class="cta" type="button" data-level="${level + 1}">${holds(state.tier, gateFor(level + 1)) ? `Open level ${pad(level + 1)}` : 'See what opens it'}</button>` : `<p class="cw-note">It opens when all ${UNITS} moves here are done: ${UNITS - levelDone(st, level)} to go.</p>`}</div>` : ''}`;
  } else if (kind === 'reading') {
    body = `${readingHTML(ci)}${readingMore(ci)}`;
  } else if (kind === 'carry') {
    const lvs = countedFor(ci), all = lvs.flatMap((lv) => [0, 1, 2, 3].map((k) => [lv, k, gotOf(w, lv, k)]));
    const open = all.filter((a) => a[2] === 1 || a[2] === 2), list = open.length ? open : all, cur = w[wkey(level, 'r', 'carry')] || '';
    body = `<h3 class="cw-q" id="cwq">Carry one forward. <em>${open.length ? 'The undone action that matters most.' : 'Everything you checked was done. Keep one as a habit.'}</em></h3>
      <div class="cw-opts" role="group" aria-labelledby="cwq">${list.map(([lv, k, g], i) => `<button type="button" class="cw-o cw-co" data-carry="${lv}.${k}" aria-pressed="${cur === `${lv}.${k}`}"><kbd aria-hidden="true">${i < 9 ? i + 1 : ''}</kbd>
        <span><small>Level ${pad(lv)} · ${esc(LEAD[DOMS[k]])}${g != null ? ` · ${GOT[g].toLowerCase()}` : ''}</small><span>${fill(LEVELS4[lv - 1].d[k].fb[3], w, lv, k)}</span></span></button>`).join('')}</div>`;
  } else if (kind === 'carryday') {
    const c = carriedFrom(w, level), v = (w[wkey(level, 'r', 'on')] || '').trim();
    body = `${c ? `<div class="cw-was"><p>${fill(LEVELS4[c[0] - 1].d[c[1]].fb[3], w, c[0], c[1])}</p><p class="cw-dw"><b>Done when</b> ${doneOf(w, c[0], c[1])}</p></div>` : ''}
      <h3 class="cw-q" id="cwq">Which day <em>this week?</em></h3>
      ${dayPick('r', 'on', v)}
      ${BUILD4[level] ? `<p class="cw-planner">Next: one page, built from what you wrote. ${esc(BUILD4[level].title)}.</p>` : CHAPTERS4[ci + 1] && LEVELS4[level] ? `<div class="gain"><p class="gaint">${esc(CHAPTERS4[ci + 1].n)} · ${esc(CHAPTERS4[ci + 1].name)}</p><p class="gainp">${esc(CHAPTERS4[ci + 1].about)}</p>
        <button class="cta" type="button" data-level="${level + 1}">${holds(state.tier, gateFor(level + 1)) ? `Open level ${pad(level + 1)}` : 'See what opens it'}</button></div>`
        : `<p class="cw-planner">Twelve weeks, written. <button type="button" class="cw-all" data-go="blueprint">Open your Blueprint</button></p>`}`;
  }
  else if (kind === 'bask' || kind === 'bstep' || kind === 'bday' || kind === 'bpage') body = buildHTML(st, kind, key, ci);
  const last = qi >= lastStep();
  const nextLabel = kind === 'lines' ? (d < 3 ? 'Next domain →' : 'See my week') : kind === 'week' && ci != null ? 'My chapter reading' : 'Next ↵';
  return `${top}${body}
    <footer class="cw-foot">
      <button type="button" class="cw-back" data-qmove="-1"${qi === 0 ? ' disabled' : ''}>← Back</button>
      ${last ? '<span></span>' : `<button type="button" class="cw-next" data-qmove="1"${ready(qi) ? '' : ' disabled'}>${nextLabel}</button>`}
    </footer>`;
}

/** The chapter reading after levels 05, 09 and 12: the four domains across
 *  the chapter, from the founder's own sliders, and the four movements. */
function readingHTML(ci) {
  const r = reading(state.work, ci), DN = DOMAINS.map((d) => LEAD[d.k]);
  const pts = r.scores.map((sc, d) => { const a = -Math.PI / 2 + d * Math.PI / 2, rad = 20 + sc * 100; return [150 + Math.cos(a) * rad, 140 + Math.sin(a) * rad]; });
  const rings = [40, 70, 100, 120].map((rr) => `<rect x="${150 - rr}" y="${140 - rr}" width="${2 * rr}" height="${2 * rr}" transform="rotate(45 150 140)" fill="none" stroke="var(--line)"/>`).join('');
  const radar = `<svg class="cw-radar" viewBox="0 0 300 290" role="img" aria-label="Where your four domains stand across ${esc(r.chapter.name)}">${rings}
    <polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="rgba(180,151,95,.22)" stroke="var(--gold)" stroke-width="2"/>
    ${pts.map((p, d) => `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="var(--${DOMS[d]})"/>`).join('')}
    <text x="150" y="10" text-anchor="middle">YOURSELF</text><text x="292" y="144" text-anchor="end">PEOPLE</text><text x="150" y="285" text-anchor="middle">BUSINESS</text><text x="8" y="144">MARKET</text></svg>`;
  const words = r.chapter.lv.map((i) => LEVELS4[i].word).join(', ');
  return `<h3 class="cw-q">${esc(r.chapter.name)}, <em>read together.</em></h3>
    <div class="cw-reading">${radar}<div class="cw-fb">
      <div class="cw-fl"><h4>Where you were<small>Admit it.</small></h4><p>Across ${esc(words.replace(/, (?=[^,]*$)/, ' and '))}, your lowest corner was ${esc(DN[r.lo])}: ${Math.round(r.scores[r.lo] * 10)} out of 10, from your own answers.</p></div>
      <div class="cw-fl"><h4>Where you struggle<small>Don’t fight it.</small></h4><p>${esc(DN[r.lo])} asks the most of you now. The next chapter leans there first.</p></div>
      <div class="cw-fl"><h4>Where you shine<small>Don’t ignore it.</small></h4><p>${esc(DN[r.hi])} is your strongest, at ${Math.round(r.scores[r.hi] * 10)} out of 10. Lead with it while you build the rest.</p></div>
      <div class="cw-fl"><h4>What you will do<small>Exactly.</small></h4><ol>${r.exact.map((e) => `<li>${e}</li>`).join('')}</ol></div>
    </div></div>
    <p class="cw-star"><small>Your North Star${r.next ? ` for ${esc(r.next.name)}` : ' for the next twelve weeks'}</small>${r.star}</p>
    <p class="cw-note">Read only from what you tapped, slid and wrote. Nothing is assumed about you, and nothing is compared with anybody else.</p>`;
}

/** Under the book: the level's teaching, this domain's film, and the stage. */
function underHTML(st) {
  if (!writable(st)) return '';
  const x = LEVELS4[level - 1];
  const lv = levelVideo(st, level), vid = videoFor(st, level, dom);
  return `<div class="cw-under" id="cw-video">
    ${videoBlock({ key: `${st}.${level}`, title: lv.title || `${x.word} · ${x.title}`, sub: lv.sub || x.promise, src: lv.src, poster: lv.poster })}
    ${vid ? `<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/${esc(vid)}" title="${esc(x.title)}"
      loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>` : ''}
    ${stageStrip(st)}
  </div>`;
}

/** The Crown: one button, bottom centre. Tap it and seven jewels open in an
 *  arc. Swipe it left or right to turn the page; hold it for Focus. On a
 *  phone, Back and Next sit either side of it. */
const JEWELS = [
  ['rail', 'Levels', '<path d="M4 7h16M4 12h16M4 17h10"/>'],
  ['library', 'Library', '<path d="M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"/>'],
  ['music', 'Music', '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'],
  ['focus', 'Focus', '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>'],
  ['light', 'Light', '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>'],
  ['ask', 'Ask Alexandru', '<path d="M4 5h16v11H9l-5 4z"/>'],
  ['book', 'Book 1:1', '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>'],
];
const crownMark = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M12 2.5 21.5 12 12 21.5 2.5 12z"/><path d="m12 6 1.8 4.2L18 12l-4.2 1.8L12 18l-1.8-4.2L6 12l4.2-1.8z" fill="currentColor" stroke="none"/></svg>';
const crownClose = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
function crownHTML() {
  const jewel = ([k, n, svg], i) => {
    const a = Math.PI - (i * Math.PI) / 6;
    const pos = `style="--cx:${Math.cos(a).toFixed(3)};--cy:${(-Math.sin(a)).toFixed(3)}"`;
    const ico = `<span class="jw-i"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${svg}</svg></span>${esc(n)}`;
    if (k === 'book') return `<a class="jw" ${pos} href="${esc(BOOKING)}" target="_blank" rel="noopener">${ico}</a>`;
    if (k === 'library' || k === 'ask' || k === 'rail') return `<button type="button" class="jw" ${pos} data-go="${k}">${ico}</button>`;
    return `<button type="button" class="jw" ${pos} data-crown="${k}"${k === 'focus' ? ' aria-pressed="false"' : ''}>${ico}</button>`;
  };
  return `<div class="crown-wrap" id="crown">
    <button type="button" class="crown-veil" data-crown="close" tabindex="-1" aria-label="Close the Crown"></button>
    <p class="crown-hint">Turn the Crown: swipe it left or right to move between questions. Hold it for Focus.</p>
    <nav class="crown-arc" id="crown-arc" aria-label="The Crown">${JEWELS.map(jewel).join('')}</nav>
    <div class="crown-row">
      <button type="button" class="cw-pb" data-qmove="-1" aria-label="Previous question"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>
      <button type="button" class="crown" id="crownb" aria-expanded="false" aria-controls="crown-arc"
        aria-label="The Crown: levels, library, music, focus, light, Ask Alexandru, book a 1:1">${crownMark}</button>
      <button type="button" class="cw-pb nx" data-qmove="1" aria-label="Next question"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>
    </div>
    <p class="cw-pk">The keyboard’s Next key also moves on</p>
  </div>`;
}
function workHTML(st) {
  return `<div class="cw">
    <div id="cban" class="cbanwrap">${compassBanner()}</div><div id="libban">${libBanner()}</div>
    <p class="cw-hush"><i aria-hidden="true"></i>Quiet while you write · the tools return when you pause</p>
    <div id="mod">${bookHTML(st)}</div>
    <div id="under">${underHTML(st)}</div>
  </div>
  <button type="button" class="cw-dveil" data-go="rail" tabindex="-1" aria-label="Close the levels"></button>
  <aside class="cw-drawer" aria-label="The twelve levels">
    <button type="button" class="cw-dx" data-go="rail" aria-label="Close the levels">×</button>
    <div id="railwrap">${railHTML(st)}</div>
  </aside>
  ${crownHTML()}`;
}

/** Turn the page: draw the book again at move `qi`, and put the focus on
 *  the first thing to answer. */
function drawBook(focus = true) {
  const st = state.stage || 'build';
  const m = $('#mod');
  if (!m) return render();
  m.innerHTML = bookHTML(st);
  document.body.classList.toggle('cw-shut', !writable(st));
  if (focus) {
    const r = document.querySelector('.leaf-r');
    const f = document.querySelector('#cwr') || document.querySelector('.leaf-r .cw-in:not(.cw-date)')
      || document.querySelector('.leaf-r .cw-o[aria-pressed="true"]') || document.querySelector('.leaf-r .cw-o') || document.querySelector('.leaf-r .cw-lab');
    if (f) { if (!/^(INPUT|BUTTON)$/.test(f.tagName)) f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
    if (r && r.getBoundingClientRect().top < 0) r.scrollIntoView({ block: 'start' });
  }
  M.setCandles(answered(st, level, dom));
}
function moveQ(d) {
  const st = state.stage || 'build';
  if (view !== 'work' || !writable(st) || qi === null) return;
  if (d > 0 && !ready(qi)) return;
  let to = Math.max(0, Math.min(lastStep(), qi + d));
  // Build it: after the third step, an empty step is the end of the process,
  // and Back skips the empty ones.
  const emptyStep = (i) => stepAt(i)[1] === 'bstep' && !String(state.work[wkey(level, 'b', stepAt(i)[2])] || '').trim();
  if (d > 0 && emptyStep(qi)) to = steps().findIndex((x, i) => i > qi && x[1] !== 'bstep');
  if (d < 0) while (to > 0 && emptyStep(to) && Number(stepAt(to)[2].slice(1)) > 1) to -= 1;
  if (to < 0 || to === qi) return;
  qi = to;
  drawBook();
}

/** The Crown opening and closing. */
function crownOpen(on) {
  const w = $('#crown'), b = $('#crownb');
  if (!w || !b) return;
  document.body.classList.toggle('crownopen', on);
  b.setAttribute('aria-expanded', String(on));
  b.setAttribute('aria-label', on ? 'Close the Crown' : 'The Crown: levels, library, music, focus, light, Ask Alexandru, book a 1:1');
  b.innerHTML = on ? crownClose : crownMark;
  const f = w.querySelector('[data-crown="focus"]');
  if (f) f.setAttribute('aria-pressed', String(M.current().mode === 'focus'));
  if (on) { const j = w.querySelector('.jw'); if (j) j.focus({ preventScroll: true }); }
}
/** Writing quietens the room: the Crown, the header and the player step back,
 *  and return when the founder pauses. */
let hushT = 0;
function hush() {
  document.body.classList.add('cw-hushed');
  clearTimeout(hushT);
  hushT = setTimeout(() => document.body.classList.remove('cw-hushed'), 1600);
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
/** The founder's Blueprint (31 Oct 2026, the skeleton's week 12): what the
 *  twelve weeks write, in eight sections, from the founder's own answers and
 *  nothing else: how they lead, their people, what they sell, marketing,
 *  sales, money, systems and the next twelve weeks. Printable. */
/** Week 13: Level 12's four actions have no level after them to ask, so the
 *  Blueprint asks; then the North Star again, to compare with where they began. */
function lastSunday() {
  const w = state.work, L = LEVELS4[11];
  if (!L.d.every((D, d) => fieldsOf(D).some(([k]) => String(w[wkey(12, d, k)] || '').trim()))) return '';
  const all = L.d.every((_, d) => gotOf(w, 12, d) != null), t = tally(w, LEVELS4.map((x) => x.n));
  return `<section class="bp-last" id="bp-last" aria-labelledby="bpl-h"><p class="eyebrow">Week 13 · the last Sunday</p>
    <h2 id="bpl-h">${all ? 'Twelve weeks, counted.' : 'Did Level 12’s four happen?'}</h2>
    ${all ? `<p>${t.done} of the ${t.n} actions you checked were done, ${t.part} partly${t.est ? `, and your estimates were ${t.est}` : ''}. Now take the North Star again, and see where you stand against where you began.</p>
      <p class="no-print"><a class="cta" href="/northstar/">Take the North Star again →</a></p>`
      : `<ol class="bp-lg">${L.d.map((D, d) => { const g = gotOf(w, 12, d); return `<li><p>${fill(D.fb[3], w, 12, d)}</p><div class="bp-lgb no-print" role="group" aria-label="Did it happen?">${GOT.map((o, k) => `<button type="button" data-lastgot="${d}:${k}" aria-pressed="${g === k}">${o}</button>`).join('')}</div></li>`; }).join('')}</ol>`}
  </section>`;
}
function blueprintView() {
  growthWords();
  if (gpWords && !window.GrowthPlan) growthText().then(() => { if (view === 'blueprint') render(); });
  const w = state.work, B = blueprint(w), t = tally(w, LEVELS4.map((L) => L.n));
  const written = B.reduce((n, S) => n + S.items.filter((i) => i.started).length, 0), all = B.reduce((n, S) => n + S.items.length, 0);
  const name = (state.me && state.me.name) || '';
  return `<section class="bp"><div class="bp-in">
    <header class="bp-head">
      <p class="eyebrow">${compass} The Founder’s Blueprint</p>
      <h1>${name ? `${esc(name)}’s Blueprint` : 'Your Blueprint'}</h1>
      <p class="bp-lede">Everything the twelve weeks write, in your own words: how you lead, your people, what you sell, your marketing, your sales, your money, your systems and your next twelve weeks. It fills in as you go.</p>
      <p class="bp-stat"><b>${written}</b> of ${all} parts written${t.n ? ` · <b>${t.done}</b> of the ${t.n} actions you checked were done${t.est ? ` · your estimates were ${t.est}` : ''}` : ''}</p>
      <p class="bp-act no-print"><button type="button" class="cta" data-print>Print it, or save it as a PDF</button><button type="button" class="cw-all" data-go="work">Back to the programme</button></p>
    </header>
    ${lastSunday()}
    <nav class="bp-toc no-print" aria-label="The parts of your Blueprint">${B.map((S) => `<a href="#bp-${S.k}">${esc(S.n)}</a>`).join('')}${innerSide() ? '<a href="#bp-inner">The inner side</a>' : ''}</nav>
    ${B.map((S) => `<section class="bp-sec" id="bp-${S.k}" aria-labelledby="bph-${S.k}">
      <h2 id="bph-${S.k}">${esc(S.n)}</h2><p class="bp-about">${esc(S.about)}</p>
      ${S.builds.map((bd) => bd.started ? `<article class="bp-build"><p class="bp-src">Built after Level ${pad(bd.lv)}</p><h3>${esc(bd.title)}</h3>
        <dl>${bd.page.map(([label, html]) => `<dt>${esc(label)}</dt><dd>${html}</dd>`).join('')}</dl></article>` : '').join('')}
      ${launchpadFor(S.k, w).map((a) => `<article class="bp-it bp-lp"><p class="bp-src">Launchpad plan${a.done ? ` · done ${esc(a.done)}` : ''}</p><h3>${esc(a.title)}</h3>
        <div class="bp-take"><ol>${a.lines.map((l) => `<li>${l}</li>`).join('')}</ol></div></article>`).join('')}
      ${S.items.map((it) => `<article class="bp-it${it.started ? '' : ' empty'}" style="--c:var(--${DOMS[it.d]})">
        <p class="bp-src">Level ${pad(it.lv)} · ${esc(it.word)} · ${esc(it.name)}</p>
        <h3>${esc(it.topic)}</h3>
        ${it.started ? `<p class="bp-s">${it.sentence}</p>
          <div class="bp-take"><h4>${it.take.title}</h4><ol>${it.take.lines.map((l) => `<li>${l}</li>`).join('')}</ol></div>`
          : `<p class="bp-wait">Written in Level ${pad(it.lv)}. <button type="button" class="cw-all no-print" data-level="${it.lv}">Open it</button></p>`}
      </article>`).join('')}
    </section>`).join('')}
    ${innerSide()}
  </div></section>`;
}

function libraryView() {
  const joined = account.joined() || !!state.me;
  const hasLab = holds(state.tier, 'lab');
  const dl = '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 20h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const manuals = LIBRARY.manuals.map((m) => `<li class="lib-man${m.k === state.stage ? ' lib-yours' : ''}">
      <span class="bk3 bk3-man bk3-${m.k}" aria-hidden="true"><span class="bk3-cover"><small>The Founder’s Blueprint</small><b>${esc(STAGES[m.k].n)}</b></span><i class="bk3-spine"></i></span>
      <span class="lib-mtext"><b>${esc(m.n)}</b><small>${esc(m.sub)} · ${m.pages} pages${m.k === state.stage ? ' · your stage' : ''}</small></span>
      ${joined ? `<a class="lib-btn" href="${esc(account.libraryHref(m.k))}" download>${dl}Download PDF</a>` : `<a class="lib-btn" href="/north3/#join">Create a free account to download</a>`}
    </li>`).join('');
  const card = (b) => (b.soon
    ? `<li class="lib-book lib-soon">${b.cover ? `<span class="bk3"><img src="${esc(b.cover)}" alt="${esc(b.n)} cover" loading="lazy"><i class="bk3-spine"></i></span>` : '<span class="bk3" aria-hidden="true"><span class="bk3-cover bk3-blank">In preparation</span></span>'}
        <span class="lib-btext"><span class="lib-kick">${esc(b.kicker)}</span><b>${esc(b.n)}</b><small>${esc(b.sub)}</small><em>In preparation</em></span></li>`
    : `<li class="lib-book"><span class="bk3${b.tall ? ' bk3-tall' : ''}"><img src="${esc(b.cover)}" alt="${esc(b.n)} cover" loading="lazy"><i class="bk3-spine"></i></span>
        <span class="lib-btext"><span class="lib-kick">${esc(b.kicker)}</span><b>${esc(b.n)}</b><small>${esc(b.sub)}</small>
        <span class="lib-acts"><a href="${esc(b.preview)}" target="_blank" rel="noopener">Preview the first pages →</a>
        ${joined ? `<a href="${esc(account.libraryHref(b.k))}" download>${dl}Free digital copy</a>` : `<a class="lib-link" href="/north3/#join">Create a free account for the free digital copy</a>`}
        ${b.online ? `<a class="lib-online" href="${esc(b.online)}">Fill it in online →</a>` : ''}
        ${b.print === false ? '' : `<span class="lib-print">${b.print ? `<a href="${esc(b.print)}" target="_blank" rel="noopener">Print edition ↗</a>` : 'Print edition coming'}</span>`}</span></span></li>`);
  const books = LIBRARY.books.map(card).join('');
  const growth = (LIBRARY.growth || []).map(card).join('');
  const L = LIBRARY.lab;
  return `<section class="band qband lib"><div class="wrap">
    <p class="eyebrow">${compass} Library &amp; working materials</p>
    <h1 class="qh">Everything that goes with the work</h1>
    <p class="sec-lede">Your plan and your planner come first: the action, week by week. The three manuals are the programme on paper, to print and fill by hand. The books sit alongside it — the thinking the levels are built from.${joined ? '' : ' A free account opens every download.'}</p>
    ${growth ? `<h2 class="lib-h">Your plan and your planner</h2>
    <ul class="lib-books">${growth}</ul>` : ''}
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
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.2 5.6L20 9l-4.5 3.8L17 19l-5-3.2L7 19l1.5-6.2L4 9l5.8-.4z" fill="none" stroke="#B4975F" stroke-width="1.6" stroke-linejoin="round"/></svg>
    <div><b>Your library just got fuller.</b><p>With your free account: the North Star’s Massive Growth Plan, The Leader’s Growth Planner 2027, the three Founder’s Blueprint manuals, Built to Lead (99 practical tools), Worth Building (32 leadership frameworks) and A New Way of Winning (12 principles).</p></div>
    <button type="button" class="cta" data-go="library">Open my library →</button>
    <button type="button" class="x" data-banner="close" aria-label="Close"><svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>
  </div>`;
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
  return `<a class="cban" href="/northstar/" aria-label="Open your Leader’s North Star: feedback in all four domains, your plans and your numbers">
    <span class="cban-dial" aria-hidden="true"><svg viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="29" fill="none" stroke="#B4975F" stroke-width="1.6"/><circle cx="32" cy="32" r="23" fill="none" stroke="#594A32"/>
      <g stroke="#B4975F" stroke-width="1.4"><line x1="32" y1="3" x2="32" y2="9"/><line x1="32" y1="55" x2="32" y2="61"/><line x1="3" y1="32" x2="9" y2="32"/><line x1="55" y1="32" x2="61" y2="32"/></g>
      <circle cx="32" cy="11" r="2.6" fill="#A8623A"/><circle cx="53" cy="32" r="2.6" fill="#4C7355"/><circle cx="32" cy="53" r="2.6" fill="#36607F"/><circle cx="11" cy="32" r="2.6" fill="#9A7418"/>
      <g class="cban-needle"><path d="M32 14 L36 32 L32 35 L28 32Z" fill="#D6BF8F"/><path d="M32 50 L36 32 L32 29 L28 32Z" fill="#594A32"/></g><circle cx="32" cy="32" r="3" fill="#B4975F"/></svg></span>
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
      ${P.compass ? '' : ' <a href="/northstar">Open the North Star →</a>'}</p>
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
    ? `<button type="button" data-go="home" ${view === 'home' ? 'aria-current="page"' : ''}>Your Base Camp${unread ? `<span class="tdot" aria-label="${unread} unread ${unread === 1 ? 'note' : 'notes'}"></span>` : ''}</button><button type="button" data-go="work" ${view === 'work' ? 'aria-current="page"' : ''}>The programme</button><button type="button" data-go="library" ${view === 'library' ? 'aria-current="page"' : ''}>Library</button><button type="button" data-go="ask" ${view === 'ask' ? 'aria-current="page"' : ''}>Ask Alexandru${answers ? `<span class="tdot" aria-label="${answers} new ${answers === 1 ? 'answer' : 'answers'}"></span>` : ''}</button>${holds(state.tier, 'session') ? '' : `<a class="tbook" href="${esc(BOOKING)}" target="_blank" rel="noopener">${bookIcon}Book my 1:1 with Alexandru</a>`}`
    : '';
}

function render() {
  const st = state.stage || 'build';
  document.body.classList.toggle('inwork', view === 'work');
  document.body.classList.remove('crownopen', 'stepsopen');
  drawNav();
  if ((view === 'work' || view === 'home') && !LEVELS[st]) {
    // Only this founder's stage is loaded, and only when needed.
    $('#main').innerHTML = '<section class="band qband"><div class="wrap narrow"><p class="sec-lede" role="status">Opening your programme…</p></div></section>';
    loadStage(st).then(render).catch(() => { $('#main').innerHTML = '<section class="band qband"><div class="wrap narrow"><p class="sec-lede" role="alert">We could not open your programme just now. Check your connection and reload.</p></div></section>'; });
    return;
  }
  // The dashboard (Your Base Camp, the programme, the Library, Ask
  // Alexandru) keeps the music, the light and Focus mode.
  if (!DASHBOARD.includes(view)) cabinetHidden();
  $('#main').innerHTML = view === 'work'
    ? workHTML(st)
    : view === 'home' ? homeView()
    : view === 'library' ? libraryView()
    : view === 'blueprint' ? blueprintView()
    : view === 'launchpad' ? launchpadOnlineHTML({ values: state.work, thin: (state.me && state.me.thin) || '' })
    : view === 'ask' ? askView()
    : view === 'signin' ? signinView()
    : '<section class="band qband"><div class="wrap narrow"><p class="sec-lede" role="status">One moment…</p></div></section>';
  if (view === 'home') cabinetShown();
  else if (DASHBOARD.includes(view)) dashboardShown();
  if (view === 'signin') mountGoogle();
  // The Lamp's candles count the domain on screen, in the programme only.
  M.setCandles(view === 'work' ? answered(st, level, dom) : -1);
  if (view === 'work') document.body.classList.toggle('cw-shut', !writable(st));
}
const DASHBOARD = ['home', 'work', 'library', 'ask', 'blueprint', 'launchpad'];

/** A new domain or level: redraw the book and what sits under it, so the
 *  page does not jump and the drawer of levels keeps its scroll. */
function redrawModule() {
  if (!$('#mod')) return render();
  const u = $('#under'); if (u) u.innerHTML = underHTML(state.stage || 'build');
  drawBook(false);
  window.scrollTo({ top: 0, behavior: 'instant' });
  refreshRail();
}
function refreshRail() {
  const st = state.stage || 'build';
  const wrap = $('#railwrap');
  if (wrap) wrap.innerHTML = railHTML(st);
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('button, a.cta');
  if (!b) return;
  // The Launchpad Action Plan (31 Oct): twenty actions, five per domain, as a PDF.
  if (b.hasAttribute('data-lpp')) {
    const full = (state.me && state.me.name) || '';
    downloadLaunchpadPlan(b, { first: full.split(' ')[0] || '', full, stage: (STAGES[state.stage || 'build'] || {}).n || '', thin: (state.me && state.me.thin) || '', values: state.work });
    return;
  }
  if (b.id === 'crownb') { if (crownSwallow) { crownSwallow = false; return; } crownOpen(!document.body.classList.contains('crownopen')); return; }
  if (b.dataset.crown) {
    const k = b.dataset.crown;
    if (k === 'steps') { document.body.classList.toggle('stepsopen'); if (document.body.classList.contains('stepsopen')) { const n = document.querySelector('.cw-s.now') || document.querySelector('.leaf-l .mtab'); if (n) n.focus({ preventScroll: true }); } return; }
    crownOpen(false);
    if (k === 'music') M.openPlayer();
    else if (k === 'light') M.openPlayer('mp-light');
    else if (k === 'focus') M.mode('focus');
    else { const c = $('#crownb'); if (c) c.focus({ preventScroll: true }); }
    return;
  }
  if (b.dataset.qmove) { moveQ(+b.dataset.qmove); return; }
  if (b.hasAttribute('data-print')) { window.print(); return; }
  if (b.dataset.lpdone) {
    if (needsAccount()) { const k = b.dataset.lpdone; askAccount(() => { const x = document.querySelector(`[data-lpdone="${k}"]`); if (x) x.click(); }); return; }
    const on = !state.work[b.dataset.lpdone], v = on ? new Date().toISOString().slice(0, 10) : '';
    state.work[b.dataset.lpdone] = v; save(); account.touch('work', b.dataset.lpdone, v);
    b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Done ✓' : 'Mark it done';
    const li = b.closest('.lpo-a'); if (li) li.classList.toggle('on', on);
    return;
  }
  if (b.dataset.qd) { qi = steps().findIndex((x) => x[0] === +b.dataset.qd && x[1] === 'tap'); document.body.classList.remove('stepsopen'); drawBook(); return; }
  // Every answer waits for a complete account first (the account box), then lands.
  const ans = ['v4t', 'got', 'v4day', 'carry'].find((k) => b.dataset[k] != null);
  if (ans && needsAccount()) {
    const v = b.dataset[ans], at = `.leaf-r .cw-o[data-${ans === 'v4t' ? 'v4t' : ans === 'v4day' ? 'v4day' : ans}="${v}"]`;
    askAccount(() => { const x = document.querySelector(at); if (x) x.click(); });
    return;
  }
  // Last week: Done, Partly, Not yet. Saved on the level it belongs to.
  if (b.dataset.got != null) {
    const d = stepAt(qi)[0];
    keep4(d, 'got', +b.dataset.got, level - 1);
    drawBook(false);
    const x = document.querySelector(`.cw-o[data-got="${b.dataset.got}"]`); if (x) x.focus({ preventScroll: true });
    return;
  }
  // A day, as a tap: saved, and on to the next screen.
  if (b.dataset.v4day) {
    const [d, kd, k] = stepAt(qi);
    keep4(d < 0 ? (kd === 'bday' ? 'b' : 'r') : d, k || 'on', b.dataset.v4day);
    refreshRail();
    const at = qi;
    drawBook(false);
    setTimeout(() => { if (qi === at) moveQ(1); }, 160);
    return;
  }
  if (b.dataset.carry) {
    keep4('r', 'carry', b.dataset.carry);
    const at = qi;
    drawBook(false);
    setTimeout(() => { if (qi === at) moveQ(1); }, 160);
    return;
  }
  // The week, as plain text for the Planner, a calendar or a note.
  if (b.hasAttribute('data-copyweek')) {
    const x = LEVELS4[level - 1], items = [...document.querySelectorAll('.cw-week li')].map((li, i) => `${i + 1}. ${li.querySelector('.cw-wk').textContent.trim()}\n   ${li.querySelector('.cw-wa').textContent.replace(/\s+/g, ' ').trim()}\n   ${li.querySelector('.cw-dw').textContent.replace(/\s+/g, ' ').trim()}`);
    const text = [`My week · Level ${pad(level)} · ${x.word}`, ...items].join('\n');
    const doneCopy = (ok) => { b.textContent = ok ? 'Copied' : 'Select and copy'; setTimeout(() => { b.textContent = 'Copy my week'; }, 1600); };
    try { navigator.clipboard.writeText(text).then(() => doneCopy(true), () => doneCopy(false)); } catch { doneCopy(false); }
    return;
  }
  if (b.hasAttribute('data-copypage')) {
    const pg = document.querySelector('.cw-page'), text = pg ? [BUILD4[level].title, ...[...pg.querySelectorAll('div')].map((x) => `${x.querySelector('h4').textContent}: ${x.querySelector('p').textContent.replace(/\s+/g, ' ').trim()}`)].join('\n') : '';
    const doneCopy = (ok) => { b.textContent = ok ? 'Copied' : 'Select and copy'; setTimeout(() => { b.textContent = 'Copy the page'; }, 1600); };
    try { navigator.clipboard.writeText(text).then(() => doneCopy(true), () => doneCopy(false)); } catch { doneCopy(false); }
    return;
  }
  // The last Sunday (after Level 12), asked on the Blueprint.
  if (b.dataset.lastgot) {
    const [d, g] = b.dataset.lastgot.split(':').map(Number);
    keep4(d, 'got', g, 12);
    render();
    const h = document.getElementById('bp-last'); if (h) h.scrollIntoView({ block: 'start' });
    return;
  }
  // What the founder keeps, as plain text for a message or a note.
  if (b.dataset.copytake != null) {
    const box = b.closest('.cw-take');
    const lineOf = (li) => { const c = li.cloneNode(true); c.querySelectorAll('.ln').forEach((x) => { x.textContent = '____'; }); return c.textContent.replace(/\s+/g, ' ').trim(); };
    const text = box ? [box.querySelector('h4').textContent, ...[...box.querySelectorAll('li')].map(lineOf)].join('\n') : '';
    const doneCopy = (ok) => { b.textContent = ok ? 'Copied' : 'Select and copy'; setTimeout(() => { b.textContent = 'Copy'; }, 1600); };
    try { navigator.clipboard.writeText(text).then(() => doneCopy(true), () => doneCopy(false)); } catch { doneCopy(false); }
    return;
  }
  if (b.dataset.v4t) {
    const d = stepAt(qi)[0], st = state.stage || 'build', had = answered(st, level, dom);
    keep4(d, 't', +b.dataset.v4t);
    drawBook(false);
    const x = document.querySelector(`.cw-o[data-v4t="${b.dataset.v4t}"]`); if (x) x.focus({ preventScroll: true });
    if (answered(st, level, dom) > had) M.answered(answered(st, level, dom));
    refreshRail();
    return;
  }
  if (b.dataset.go === 'rail') {
    document.body.classList.remove('crownopen', 'stepsopen');
    const on = document.body.classList.toggle('railopen');
    if (on) { const h = document.querySelector('.rlev.here') || document.querySelector('.cw-dx'); if (h) h.focus({ preventScroll: true }); if (h && h.scrollIntoView) h.scrollIntoView({ block: 'center' }); }
    return;
  }
  if (b.dataset.cab) {
    if (cabinetClick(b)) return;
    if (b.dataset.cab === 'stand') { changingStage = true; render(); const c = document.querySelector('.gp-stand'); if (c) c.scrollIntoView({ block: 'center' }); const p = document.querySelector('.stand-pick button'); if (p) p.focus({ preventScroll: true }); return; }
    if (b.dataset.cab === 'plans') { const c = document.getElementById('plans'); if (c) c.scrollIntoView({ block: 'start' }); else location.href = '/northstar/'; return; }
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
  if (b.dataset.signout !== undefined) { account.signOut(); location.replace('/north3/'); return; }
  // The reset, in its own box (31 Oct): /reset-box.js.
  if (b.hasAttribute('data-reset') || b.hasAttribute('data-link')) { const email = (($('#si-email') || {}).value || '').trim(); import('/reset-box.js').then((m) => m.openReset({ email, mode: b.hasAttribute('data-link') ? 'link' : 'reset' })).catch(() => sendSigninLink()); return; }
  if (b.dataset.copypw) {
    const f = document.getElementById(b.dataset.copypw); if (!f || !f.value) return;
    const done = (ok) => { b.textContent = ok ? '✓' : '—'; setTimeout(() => { b.innerHTML = COPYI; }, 1400); };
    navigator.clipboard.writeText(f.value).then(() => done(true), () => done(false));
    return;
  }
  if (b.dataset.stage) { state.stage = b.dataset.stage; save(); view = 'work'; render(); window.scrollTo({ top: 0, behavior: 'instant' }); return; }
  if (b.dataset.level) {
    level = +b.dataset.level; dom = 'self'; view = 'work'; qi = null;
    document.body.classList.remove('railopen');
    render(); window.scrollTo({ top: 0, behavior: 'instant' }); return;
  }
  if (b.dataset.dom) { dom = b.dataset.dom; qi = null; redrawModule(); return; }
});

/* The Launchpad plan online: Enter goes to the next blank. */
document.addEventListener('keydown', (e) => {
  if (view !== 'launchpad' || e.key !== 'Enter' || !e.target.matches || !e.target.matches('input[data-lp]')) return;
  e.preventDefault();
  const all = [...document.querySelectorAll('input[data-lp]')], i = all.indexOf(e.target);
  if (all[i + 1]) all[i + 1].focus();
});

/* The keys of the notebook. Enter: the next question (Shift + Enter, a new
 * line; a phone's Next key sends Enter too). Escape: close what is open. */
document.addEventListener('keydown', (e) => {
  if (view !== 'work') return;
  const body = document.body;
  if (e.key === 'Escape') {
    if (body.classList.contains('crownopen')) { crownOpen(false); const c = $('#crownb'); if (c) c.focus(); return; }
    if (body.classList.contains('railopen')) { body.classList.remove('railopen'); return; }
    if (body.classList.contains('stepsopen')) { body.classList.remove('stepsopen'); return; }
    return;
  }
  const t = e.target;
  if (e.altKey || e.ctrlKey || e.metaKey || e.isComposing || !t || !t.closest) return;
  const inPage = t.closest('.leaf-r') || t === document.body;
  if (!inPage || t.closest('.cw-foot, .gain, .gate, .wait')) return;
  // Number keys choose on a tap.
  if (/^[1-9]$/.test(e.key) && ['tap', 'got', 'day', 'carry', 'carryday', 'bday'].includes(stepAt(qi)[1]) && t.tagName !== 'INPUT') {
    const b = document.querySelectorAll('.leaf-r .cw-o')[Number(e.key) - 1];
    if (b) { e.preventDefault(); b.click(); }
    return;
  }
  if (e.key !== 'Enter' || e.shiftKey) return;
  // In a blank, Enter is the next screen (once something is written).
  if (t.dataset && t.dataset.v4f) { e.preventDefault(); moveQ(1); return; }
  // On an answer, Enter chooses it (if it isn't yet) and moves on. A day or
  // an action carried forward moves on by itself once chosen.
  if (t.classList && (t.classList.contains('cw-day') || t.classList.contains('cw-co'))) {
    e.preventDefault();
    if (t.getAttribute('aria-pressed') !== 'true') t.click(); else moveQ(1);
    return;
  }
  if (t.classList && t.classList.contains('cw-o')) {
    e.preventDefault();
    if (t.getAttribute('aria-pressed') !== 'true') t.click();
    moveQ(1); return;
  }
  e.preventDefault(); moveQ(1);
});

/* The Crown turns: a swipe left is the next question, a swipe right the one
 * before; held still for a moment, it starts Focus. A tap opens it. */
let crownSwallow = false, cDown = null;
/** After a swipe or a hold, the click that may follow is not a tap. */
const swallow = () => { crownSwallow = true; setTimeout(() => { crownSwallow = false; }, 400); };
document.addEventListener('pointerdown', (e) => {
  const b = e.target.closest && e.target.closest('#crownb');
  if (!b || document.body.classList.contains('crownopen')) return;
  cDown = { x: e.clientX, y: e.clientY, held: false, timer: setTimeout(() => {
    if (!cDown) return;
    cDown.held = true; swallow();
    M.mode('focus');
    b.classList.add('held'); setTimeout(() => b.classList.remove('held'), 700);
  }, 650) };
});
document.addEventListener('pointermove', (e) => {
  if (cDown && Math.hypot(e.clientX - cDown.x, e.clientY - cDown.y) > 12) clearTimeout(cDown.timer);
});
const crownUp = (e) => {
  if (!cDown) return;
  const d = cDown; cDown = null; clearTimeout(d.timer);
  if (d.held || e.type === 'pointercancel') return;
  const dx = e.clientX - d.x, dy = e.clientY - d.y;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swallow(); moveQ(dx < 0 ? 1 : -1); }
};
document.addEventListener('pointerup', crownUp);
document.addEventListener('pointercancel', crownUp);

/** "Continue with Google" on the sign-in page (google.js): signed in, or a new
 *  free account, then Your Base Camp, like the password sign-in. */
function mountGoogle() {
  const el = document.querySelector('#signinform .g-slot');
  if (!el) return;
  import('./google.js').then((g) => g.mount(el, { source: 'home',
    onDone: () => { view = 'home'; try { history.replaceState(null, '', '/ground-plan/#home'); } catch { /* old browser */ } comeHome(); },
    onError: (m) => { const msg = $('#si-msg'); if (msg) msg.textContent = m; } })).catch(() => {});
}

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
  // The Launchpad plan, online: each blank saves as the founder types.
  const lp = e.target.closest('input[data-lp]');
  if (lp) {
    state.work[lp.dataset.lp] = lp.value;
    save();
    account.touch('work', lp.dataset.lp, lp.value);
    lp.size = Math.max(6, Math.min(28, lp.value.length + 2));
    return;
  }
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
  // Version 4: the slider and the sentence save as they move.
  const v = e.target.closest('input[data-v4s], input[data-v4f], input[data-v4u]');
  if (!v || view !== 'work') return;
  const st = state.stage || 'build', had = answered(st, level, dom);
  if (v.dataset.v4u != null) {
    const n = +v.value;
    keep4(+v.dataset.v4u, 'sure', n);
    v.style.setProperty('--p', `${n}%`);
    const big = $('#cwbig'), wd = $('#cwword');
    if (big) big.textContent = `${n}%`;
    if (wd) wd.textContent = sureWord(n);
    return;
  }
  if (v.dataset.v4s != null) {
    const d = +v.dataset.v4s, D = LEVELS4[level - 1].d[d], n = +v.value;
    keep4(d, 's', n);
    v.style.setProperty('--p', `${(n - D.s.min) / (D.s.max - D.s.min) * 100}%`);
    const big = $('#cwbig'), wd = $('#cwword');
    if (big) big.textContent = shown(D.s, n);
    if (wd) wd.textContent = D.s.raw ? '' : wordOf(D.s, n);
  } else {
    const [d, k] = v.dataset.v4f.split('.');
    keep4(d === 'r' || d === 'b' ? d : +d, k, v.value);
    // The sentence above fills in as the founder types; nothing redraws.
    const f = document.querySelector(`.cw-f[data-fk="${k}"]`);
    if (f) { f.textContent = v.value.trim() || (fieldsOf(LEVELS4[level - 1].d[+d] || { f: [] }).find((x) => x[0] === k) || [0, ''])[1]; f.classList.toggle('has', !!v.value.trim()); }
    // A date written over a day tap: the tap lets go.
    document.querySelectorAll('.cw-day[aria-pressed="true"]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
    hush();
  }
  // The Lamp: a move newly done plays a chord and lights a candle.
  const now = answered(st, level, dom);
  if (now > had) M.answered(now); else if (now < had) M.setCandles(now);
  const n = levelDone(st, level);
  const c = $('#lvcount'), f = document.querySelector('.lvtrack i');
  if (c) c.textContent = `${n} of ${UNITS} done`;
  if (f) f.style.width = `${n / UNITS * 100}%`;
  const row = document.querySelector(`.cw-s[data-qd="${DOMS.indexOf(dom)}"]`);
  if (row) { row.classList.toggle('done', now === 3); const i = row.querySelector('i'); if (i) i.textContent = `${LEAD[dom]} · ${now} of 3`; }
  const nx = document.querySelector('.cw-next'); if (nx) nx.disabled = !ready(qi);
  refreshRail();
});

/* Coming home: spend a sign-in link if there is one, then bring the account's
 * work, North Star, notes and plans here. The device copy wins on conflict — it
 * is the one the founder was just typing into. */
async function comeHome() {
  if (linkCode && view === 'loading') {
    try { history.replaceState(null, '', location.pathname + '#home'); } catch { /* old browser */ }
    try { await account.signinWith(linkCode); view = 'home'; }
    catch (ex) {
      // Already signed in on this device (the link was opened twice, or late):
      // no need to stop them at the door, unless they came to reset a password.
      if (account.joined() && !resetAsk) view = 'home';
      else { view = 'signin'; render(); const m = $('#si-msg'); if (m) m.textContent = ex.message || 'That sign-in link did not work. Type your email below and we’ll send a fresh one.'; return; }
    }
  }
  if (view === 'redirect') return;
  render();
  if (signedOut && view === 'signin') {
    const m = $('#si-msg');
    if (m) { m.textContent = 'You’re signed out. Everything you wrote is saved; sign in any time to pick it up again.'; m.style.color = 'var(--goldink, #7A5C16)'; m.style.fontWeight = '600'; }
    try { history.replaceState(null, '', location.pathname + location.hash); } catch { /* old browser */ }
  }
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
      state.me = { name: r.me.name, email: r.me.email, thin: r.me.thin || '' };
      if (r.me.tier) state.tier = r.me.tier;
      hasPassword = !!r.me.hasPassword;
      signupType = r.me.signupType || null;
      missing = Array.isArray(r.me.missing) ? r.me.missing.filter((k) => ['company', 'interest', 'industry', 'password'].includes(k)) : [];
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
  // Came in through the North Star and opening the Blueprint for the first
  // time: confirm name and email once (tag linktolead-crossed-blueprint).
  if (!resetAsk && r && r.me && r.me.origin === 'northstar' && !(r.me.crossed || []).includes('blueprint')) {
    const [first, ...rest] = String(r.me.name || '').split(' ');
    import('/reset-box.js').then((m) => m.openConfirm({ to: 'blueprint', first, last: rest.join(' '), email: r.me.email,
      done: ({ first: f, last: l }) => { state.me = { ...(state.me || {}), name: [f, l].filter(Boolean).join(' ') }; save(); render(); } })).catch(() => {});
  }
  if (resetAsk) newPassword();
  else if (hashNow === '#account') openReset('');
  loadPlans();
}
/** From a password-reset email (31 Oct): its own box, "Choose a new
 *  password", then "Your new password is saved". The password box in Your
 *  account stays as the way back if the box cannot load. */
function newPassword() {
  resetAsk = false;
  import('/reset-box.js').then((m) => m.openNewPassword({ email: state.me && state.me.email,
    save: async (a, c) => { const r = await account.setPassword(a, c); hasPassword = true; return r; },
    done: () => { view = 'home'; render(); } }))
    .catch(() => openReset());
}
/** The password box in Your account, open and in view. */
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

/* The rail sticks just under the header, never beneath it: the header's
 * height (it wraps on narrower screens) is kept in --toph. */
(() => {
  try {
    const set = () => { const t = document.querySelector('.top'); if (t) document.documentElement.style.setProperty('--toph', t.offsetHeight + 'px'); };
    set();
    window.addEventListener('resize', set);
    const t = document.querySelector('.top');
    if (t && window.ResizeObserver) new ResizeObserver(set).observe(t);
  } catch { /* old browser: the rail sticks at the top */ }
})();
