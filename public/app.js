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
  LEAD, BOOKING, DISCOVERY, LIBRARY, HUB_NOTE, payHref } from './content.js';
import { entry, programmeStage, groundPlan, stageNudge, PROGRAMME } from './home.js';
import { cabinetHTML, cabinetShown, cabinetHidden, cabinetClick, dashboardShown, levelDots, compassStripHTML } from './cabinet.js';
import { result as fwResult } from './frameworks.js';
import { report } from './feedback.js';
import * as account from './account.js';
import { launchpadCardHTML, downloadLaunchpadPlan, launchpadOnlineHTML, launchpadFor } from './launchpad-plan.js';
import { slot as googleSlot } from './google.js';
import { videoBlock } from './video-talk.js';
import * as M from './music.js';
import { ICONS } from './tools/icons.js';
import { ACTIONS4, SIZES4, SIZE_STAGE, actionsAt, sizeFor } from './actions-v4.js';
import { LEVELS4, CHAPTERS4, DOMS, UNITS, CLOSES, wkey, tapOf, slideOf, wordOf, shown, domainUnits, levelUnits,
  lines4, sentence, reading, fieldsOf, fill, stepsOf, stepDone, firstOf, planOf, plainOf, doneOf, takeOf, notyetOf,
  sureOf, gotOf, GOT, tally, countedFor, READ_QUOTES, carriedFrom, blueprint, BUILD4, fillB, buildPage, stepsWritten, SESSIONS4,
  tapReply, slideReply, blankCheck, blankNote, smallOf, SMALL_UNDER, DIRECTION4, directionOf, goalFor, dayKeyOf, buildStarted, strong,
  WELCOME_AT, welcomeOf, WHERE4, whereOf, whereWords, sizeOf, beatsOf, askOf, askWords, TYPES4, typeName, typeOf, readBack, switchOf, skipsStep, slideAt } from './levels-v4.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEY = 'ftb-v1';

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } };

let state = Object.assign({ stage: '', answers: {}, work: {}, tier: 'free', me: null }, load());
// A stage saved by an older page ("growing", "leading") or damaged is read as
// its programme stage, or none: an unknown one had no levels to load, so the
// first render asked for them again and again, and Base Camp never drew.
state.stage = PROGRAMME[state.stage] || '';
/** Team accounts (Alexandru, 2 Nov 2026): every level open, in any order, so
 *  the team can read and test the whole programme. Only the server says so
 *  (/api/state me.openAll, from the signed-in account's own email); every
 *  founder keeps the ladder and the order. */
const team = () => account.joined() && !!state.openAll;
const tierNow = () => (team() ? 'premium' : (state.tier || 'free'));
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
let level = 1, dom = 'self';
// A level in the address (#programme-6, from Back and Forward or a link) opens that level.
{ const m = /^#programme-(\d{1,2})(-q)?$/.exec(hashNow); if (m) level = Math.min(12, Math.max(1, +m[1]));
  // Arriving on the layer's own address opens the level; the layer itself opens from its button.
  if (m && m[2]) { try { history.replaceState(null, '', `${location.pathname}${location.search}#programme-${level}`); } catch { /* old browser */ } } }
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
// Plain words on every surface outside a level (AGENTS.md 10): “What you believe”,
// not “SEED · What you believe”. The level word appears inside the level.
const titleOf = (st, n) => { const x = LEVELS4[n - 1]; return x ? x.title : weekTitle(st, n); };
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
      <li class="gp-move"><span class="gp-mn">03</span><b>${holds(tierNow(), 'session') ? 'Book The Boardroom' : 'Unlock The Boardroom'}</b><p>Sit at the table. Unlock the full North Star.</p>${boardroomCta('cta')}</li>
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
        ${boardroomCta('gp-line')}</div>
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
    dots: levelDots(lv, (n) => levelDone(st, n), (n) => holds(tierNow(), gateFor(n)), UNITS) } : null;
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
    ${workbookHTML()}
    ${productsHTML()}
    ${accountHTML()}
    ${refundHTML()}
  </div>`;
}

/** Download your workbook (Alexandru, 3 Nov 2026): "Personal Leadership LAB ·
 *  The Workbook", only for founders whose step holds it (The LAB, The HUB, The
 *  Summit; functions/api/workbook.js checks again). It is paid: the file sits
 *  in a private bucket, never at a public address. */
const WORKBOOK_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 6c-2.5-2-6-2.5-9-2v14c3-.5 6.5 0 9 2 2.5-2 6-2.5 9-2V4c-3-.5-6.5 0-9 2zM12 6v14"/></svg>';
const DL_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/></svg>';
const WORKBOOK_TIERS = ['lab', 'hub', 'premium'];
function workbookHTML() {
  if (!WORKBOOK_TIERS.includes(state.tier || 'free')) return '';
  return `<section class="gp-wrap gp-workbook" aria-labelledby="wb-h">
    <div class="wb"><span class="rf-ic">${WORKBOOK_IC}</span><span class="wb-t"><b id="wb-h">Your LAB workbook</b><small>Personal Leadership LAB · The Workbook. Thirteen steps on paper, 94 pages to print and write in.</small></span>
    <a class="cta wb-btn" href="${esc(account.workbookHref())}">${DL_IC}Download your workbook</a></div>
  </section>`;
}

/** What they bought from exploraself.com, always one tap away (Alexandru,
 *  6 Nov 2026: a Base Camp tile "Unshakeable · open", so the buyer can get
 *  back in from here, not only from the letter). The link is their own access
 *  (functions/_stripe.js productsOf); the page it opens asks Stripe again. */
const PRODUCT_TILE = {
  unshakeable: { title: 'Unshakeable · open', text: 'The Unshakeable Assessment, your Personal Leadership Audit, on exploraself.com.', go: 'Open my Unshakeable Audit',
    // Not bought yet (Alexandru, 6 Nov 2026: "let's add in base camp"): the same tile, to get it.
    // The words are the pay page's own (public/pay/pay.js PITCH); never "free".
    sell: { title: 'Unshakeable · $9.99', text: 'The full Personal Leadership Audit, with your results and a printable certificate, on exploraself.com.', go: 'Get my Unshakeable Audit', href: 'https://exploraself.com/unshakeable' } },
};
const productTile = (step, T, href, icon) => `<section class="gp-wrap gp-workbook" aria-labelledby="pr-${esc(step)}">
    <div class="wb"><span class="rf-ic">${icon}</span><span class="wb-t"><b id="pr-${esc(step)}">${esc(T.title)}</b><small>${esc(T.text)}</small></span>
    <a class="cta wb-btn" href="${esc(href)}">${esc(T.go)} →</a></div>
  </section>`;
function productsHTML() {
  const mine = owned.filter((p) => PRODUCT_TILE[p.step] && /^https:\/\/exploraself\.com\//.test(p.access || ''));
  const open = mine.map((p) => productTile(p.step, PRODUCT_TILE[p.step], p.access, CHECK_IC));
  // The way to get it shows once the account has said what it owns, so a buyer never sees it first.
  const sell = pulled ? Object.entries(PRODUCT_TILE).filter(([k, T]) => T.sell && !mine.some((p) => p.step === k)).map(([k, T]) => productTile(k, T.sell, T.sell.href, AUDIT_IC)) : [];
  return [...open, ...sell].join('');
}
const AUDIT_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="5" y="3.5" width="14" height="18" rx="2"/><path d="M9 3.5h6v3H9z"/><path d="m8.5 11 1.5 1.5 2.5-2.5M8.5 16.5l1.5 1.5 2.5-2.5M14.5 11.5h1.5M14.5 17h1.5"/></svg>';
const CHECK_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9.5"/></svg>';

/** Ask for a refund (Alexandru, 2 Nov 2026): in every founder's Base Camp.
 *  They choose the programme they paid for and confirm their name and email;
 *  the request goes to /mentor → Refunds and Alexandru gets in touch himself.
 *  It never says a refund was made (AGENTS.md 6). */
const REFUND_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.2c-.5-.9-1.5-1.4-2.6-1.4-1.5 0-2.6.8-2.6 2 0 2.7 5.4 1.4 5.4 4.2 0 1.2-1.2 2.1-2.8 2.1-1.2 0-2.3-.6-2.8-1.5M12 6.2v1.6M12 16.1v1.6"/></svg>';
let refundSent = '';
function refundHTML() {
  const me = state.me || {}, rungs = [...['session', 'lab', 'hub', 'premium'].map((k) => [k, LADDER.find((r) => r.key === k)]), ['unshakeable', { price: '$9.99' }]].filter(([, r]) => r);
  const NAMES = { session: 'The Boardroom', lab: 'The LAB', hub: 'The HUB', premium: 'The Summit', unshakeable: 'The Unshakeable Assessment' };
  return `<section class="gp-wrap gp-refund" aria-labelledby="rf-h">
    <details class="rf"${refundSent ? ' open' : ''}><summary><span class="rf-ic">${REFUND_IC}</span><span><b id="rf-h">Ask for a refund</b><small>Not right for you? Alexandru gets in touch with you personally.</small></span></summary>
    ${refundSent ? `<p class="rf-sent" role="status" tabindex="-1"><b>Sent.</b> Alexandru gets in touch with you personally, at ${esc(refundSent)}. A copy of your request is on its way to that address.</p>`
    : `<form id="refundform" class="rf-form" novalidate>
      <fieldset class="rf-steps"><legend>Which programme did you pay for?</legend>
        ${rungs.map(([k, r]) => `<label><input type="radio" name="rf-step" value="${k}"><span>${esc(NAMES[k])} · ${esc(r.price)}</span></label>`).join('')}
      </fieldset>
      <label class="rf-l"><span>Your name</span><input id="rf-name" autocomplete="name" value="${esc(me.name || '')}"></label>
      <label class="rf-l"><span>The email you paid with</span><input id="rf-email" type="email" autocomplete="email" value="${esc(me.email || '')}"></label>
      <button class="cta" type="submit">Send my request</button>
      <p class="joinerr" id="rf-msg" role="status"></p>
    </form>`}</details>
  </section>`;
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
  if (n === 1 || team()) return 'open';
  // A level opens when the one before it is finished. The gate is the work,
  // not the clock — and the tier gate sits on top of it, further down.
  return levelDone(st, n - 1) === UNITS ? 'open' : 'waiting';
}
function reachable(st, n) {
  return holds(tierNow(), gateFor(n)) && levelState(st, n) !== 'waiting';
}

/** The library in the rail (Alexandru, 3 Nov 2026): one clear door, no
 *  counts. The books, the manuals and the planners are all inside. */
const railLib = `<button type="button" class="rlibdoor" data-go="library">
  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z" fill="none" stroke="#B4975F" stroke-width="1.6" stroke-linejoin="round"/></svg>
  <span><small>Your library</small><b>The manuals and books, free with your account</b><em>Open my library →</em></span></button>`;

/** 12 Days to Start Winning, as a bonus in the rail (the Decisions chat's
 *  spec, 2 Nov 2026): a pop-up in place, POST /api/course start, and "Done.
 *  Wait for the surprises: check your email." Already on: the day it is on. */
let daysSub = null, daysAsked = false, daysStep = 'ask';
function daysLoad() {
  if (daysAsked || !account.joined()) return;
  daysAsked = true;
  fetch(`/api/course?t=${encodeURIComponent(account.token())}`).then((r) => (r.ok ? r.json() : null))
    .then((d) => { if (d && d.ok) { daysSub = d.sub; refreshRail(); } }).catch(() => {});
}
const SUN_IC = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B4975F" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>';
function railDays() {
  if (!account.joined()) return `<a class="rdays" href="/12-days/">${SUN_IC}<span><small>A bonus for you</small><b>12 Days to Start Winning</b><em>See the 12 mornings →</em></span></a>`;
  daysLoad();
  const on = daysSub && !daysSub.stopped;
  if (on) {
    const d = daysSub.day;
    const line = d >= 13 ? 'All 12 days are done' : d >= 1 ? `Day ${d} of 12` : 'Day 1 comes tomorrow from 8:00, your time';
    return `<a class="rdays on" href="/12-days/">${SUN_IC}<span><small>Your 12 days are on</small><b>12 Days to Start Winning</b><em>${esc(line)}</em></span></a>`;
  }
  return `<button type="button" class="rdays" data-days="open">${SUN_IC}<span><small>A bonus for you</small><b>12 Days to Start Winning</b><em>${daysSub && daysSub.stopped ? 'Start again →' : 'Start free →'}</em></span></button>`;
}
function daysBoxHTML() {
  const body = daysStep === 'done'
    ? `<h2 id="dbh">Done. Wait for the surprises: check your email.</h2>
       <p>The first letter is on its way now. Day 1 comes tomorrow from 8:00, your time. Nothing within the hour? Look in your spam folder.</p>
       <button type="button" class="cta" data-days="close">Back to my Blueprint</button>`
    : `<p class="dk">A bonus for you</p><h2 id="dbh">12 Days to Start Winning</h2>
       <p>12 mornings. One principle and one ten-minute move in your inbox before the day starts. Free.</p>
       <button type="button" class="cta" data-days="yes"${daysStep === 'sending' ? ' disabled' : ''}>${daysStep === 'sending' ? 'Sending…' : 'Yes, send them to me'}</button>
       <button type="button" class="dnot" data-days="close">Not now</button>
       <p class="joinerr" id="dmsg" role="status"></p>`;
  return `<div class="dcard">${SUN_IC}${body}</div>`;
}
function daysOpen() {
  daysStep = 'ask';
  let box = document.getElementById('daysbox');
  if (!box) { box = document.createElement('div'); box.id = 'daysbox'; box.className = 'dbox'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'dbh'); document.body.appendChild(box); }
  box.innerHTML = daysBoxHTML(); box.hidden = false;
  const y = box.querySelector('[data-days="yes"]'); if (y) y.focus();
}
function daysShut() { const box = document.getElementById('daysbox'); if (box) box.hidden = true; const b = document.querySelector('.rdays'); if (b) b.focus({ preventScroll: true }); }
async function daysYes() {
  const box = document.getElementById('daysbox');
  daysStep = 'sending'; box.innerHTML = daysBoxHTML();
  try {
    const r = await fetch('/api/course', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: account.token(), action: 'start', tz: Intl.DateTimeFormat().resolvedOptions().timeZone || '' }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.ok) throw new Error(d.error || 'That did not go through. Try again in a minute.');
    daysSub = d.sub; daysStep = 'done'; box.innerHTML = daysBoxHTML(); refreshRail();
    const c = box.querySelector('[data-days="close"]'); if (c) c.focus();
  } catch (ex) {
    daysStep = 'ask'; box.innerHTML = daysBoxHTML();
    const m = box.querySelector('#dmsg'); if (m) m.textContent = ex.message || 'We could not reach the letters just now. Try again in a minute.';
  }
}
const bookIcon = '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
/** The Boardroom's button: pay first while it is locked (/pay/, Stripe), then
 *  book the 1:1 (Alexandru, 2 Nov 2026). */
function boardroomCta(cls) {
  if (holds(tierNow(), 'session')) return `<a class="${cls}" href="${esc(bookHref())}">Book my 1:1 with Alexandru →</a>`;
  const r = LADDER.find((x) => x.key === 'session');
  return `<a class="${cls}" href="${esc(payHref('session'))}">Unlock The Boardroom · ${esc(r ? r.price : '')} →</a>`;
}

/** The Leader’s North Star, always in the rail, at the top under the
 *  Blueprint button (Alexandru, 2 Nov 2026: "move it up"), with its premium
 *  line (3 Nov 2026: "wow, I need it right now"; honest: no price, no
 *  scarcity, the same claim as his approved booking-gift words), in his own
 *  voice and signed ("make them as from me"). */
const railStar = `<a class="rstar" href="/northstar/" aria-label="Open your Leader’s North Star: where you stand in all four domains. By the way: this is the reading my team and I use to see a business clearly. Here it’s yours, free. Alexandru">
  <svg class="rstar-i" width="40" height="40" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="#B4975F" stroke-width="1.6"/><circle cx="32" cy="32" r="23" fill="none" stroke="#3B4C70"/>
    <g stroke="#B4975F" stroke-width="1.4"><line x1="32" y1="3" x2="32" y2="9"/><line x1="32" y1="55" x2="32" y2="61"/><line x1="3" y1="32" x2="9" y2="32"/><line x1="55" y1="32" x2="61" y2="32"/></g>
    <circle cx="32" cy="11" r="2.6" fill="#A8623A"/><circle cx="53" cy="32" r="2.6" fill="#4C7355"/><circle cx="32" cy="53" r="2.6" fill="#36607F"/><circle cx="11" cy="32" r="2.6" fill="#9A7418"/>
    <g class="cban-needle"><path d="M32 14 L36 32 L32 35 L28 32Z" fill="#D6BF8F"/><path d="M32 50 L36 32 L32 29 L28 32Z" fill="#3B4C70"/></g><circle cx="32" cy="32" r="3" fill="#B4975F"/></svg>
  <span><small>The Leader’s North Star</small><b>Where you stand, in all four domains</b><i class="rstar-p">By the way: this is the reading my team and I use to see a business clearly, from solo founders to large companies. Here it’s yours, free. <span class="rstar-by">Alexandru</span></i><em>Open my North Star →</em></span></a>`;
/** The Boardroom's own page, just above Levels 04–05 while they are shut,
 *  with a small gift: Alexandru gives it in the 1:1 (2 Nov 2026). */
const GIFT_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="8.5" width="17" height="4.5" rx="1"/><path d="M5 13v7.5h14V13M12 8.5v12"/><path d="M12 8.5C10.4 4.8 6.4 4.3 6.4 6.8c0 1.7 3.2 1.7 5.6 1.7Zm0 0c1.6-3.7 5.6-4.2 5.6-1.7 0 1.7-3.2 1.7-5.6 1.7Z"/></svg>';
const railGift = `<a class="rgift" href="/boardroom/" aria-label="The Boardroom: see what it holds. A gift inside, from Alexandru">
  <span class="rgift-i">${GIFT_ICON}</span>
  <span><small>The Boardroom · Levels 04–05</small><b>See what it holds</b><em>A gift inside, from Alexandru →</em></span></a>`;
function railHTML(st) {
  const marks = { done: '✓', open: '', waiting: '·', locked: '🔒' };
  return `<nav class="rail" id="rail" aria-label="The twelve levels">
    <div class="railtop">
      <p class="eyebrow">${esc(STAGES[st].n)}</p>
      <h2>Your Blueprint</h2>
      <p class="railsub">${esc(STAGES[st].blurb)}</p>
      <button type="button" class="rbp" data-go="blueprint">Open my Blueprint: everything you have written →</button>
    </div>
    ${railStar}
    ${railLib}
    ${railDays()}
    ${SECTIONS.map((sec) => {
      const owned = holds(tierNow(), sec.k);
      const rung = LADDER.find((r) => r.key === sec.k);
      const tag = sec.k === 'session' ? '1:1' : rung ? rung.price : '';
      return `${sec.k === 'session' && !owned ? railGift : ''}<section class="rsec${owned ? '' : ' shut'}">
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
        ${!owned && rung ? `<a class="rbook" href="${esc(payHref(sec.k))}">${MB_LOCK}Unlock · ${esc(rung.price)}</a>` : sec.k === 'session' ? `<a class="rbook" href="${esc(bookHref())}">${bookIcon}Book my 1:1 with Alexandru</a>` : ''}
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
  return holds(tierNow(), gateFor(level)) && levelState(st, level) !== 'waiting' && !!LEVELS4[level - 1];
}
const steps = () => stepsOf(level);
const stepAt = (i) => steps()[i] || [-1, 'week'];
/** A screen that asks for an answer needs one before Next; the slides keep
 *  where they start, and the screens that only show are always ready. */
const ASKS = ['wask', 'where', 'still', 'got', 'tap', 'blank', 'day', 'carry', 'carryday', 'bask', 'bstep', 'bday'];
const ready = (i) => { const s = stepAt(i); return !ASKS.includes(s[1]) || !!slideAt(level, s) || stepDone(state.work, level, s); };
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
// ── The full account: after the Launchpad, and before any download ─────────
// (Alexandru, 6 Nov 2026: "they get to the Launchpad, and when they try to
// download anything, full account; when they try to access the Boardroom,
// first payment, then full account.") An account with only a first name and
// email answers Levels 01 to 03 freely. Its first answer from Level 04 on
// (the Boardroom, paid first) and any download from the library ask once for
// only what it lacks (company, what they want most, industry, password;
// /api/state says which). The answer they were giving is held and applied
// after the save, so nothing is lost. Complete accounts never see it.
let missing = [];
/** Products bought from exploraself.com, with the links that open them (api/state.js); kept in memory only. */
let owned = [];
/** The last level of The Founder Launchpad (free, name and email). */
const LAUNCHPAD_TOP = 3;
const lacksFull = () => account.joined() && pulled && missing.length > 0;
const needsAccount = (lv = level) => lacksFull() && lv > LAUNCHPAD_TOP;
let heldAnswer = null;
/** Whoever pays has a full account (Alexandru, 6 Nov 2026: "If somebody pays …
 *  It means they have full account."): an account that bought a product or a
 *  step and is still short is asked, once per visit, as it arrives in Base
 *  Camp (also after a sign-in link, which always lands here). */
let paidAsked = false;
const paidShort = () => lacksFull() && (owned.length > 0 || (state.tier || 'free') !== 'free');
function askPaid() {
  if (paidAsked || !paidShort()) return;
  paidAsked = true;
  askAccount(() => render(), 'paid');
}
function askAccount(then, lock = '') {
  heldAnswer = then || null;
  import('/reset-box.js').then((m) => m.openComplete({ name: state.me && state.me.name, email: state.me && state.me.email, missing, lock,
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
// A download from the library: the full account first, then the book.
document.addEventListener('click', (e) => {
  const a = e.target && e.target.closest && e.target.closest('a[href*="/api/library?item="]');
  if (!a || !lacksFull()) return;
  e.preventDefault();
  const href = a.href;
  askAccount(() => { location.href = href; }, 'library');
}, true);
// The slider and the sentence: asked before the first move, not after.
document.addEventListener('pointerdown', (e) => {
  const v = e.target && e.target.closest && e.target.closest('input[data-v4s], input[data-v4u], input[data-qs]');
  if (!v || !needsAccount()) return;
  e.preventDefault();
  askAccount(() => { const x = document.getElementById(v.id); if (x) x.focus(); });
}, true);
document.addEventListener('focusin', (e) => {
  const v = e.target && e.target.closest && e.target.closest('input[data-v4s], input[data-v4f], input[data-v4u], input[data-lp], input[data-qs]');
  if (!v || !needsAccount()) return;
  v.blur();
  askAccount(() => { const x = document.getElementById(v.id); if (x) x.focus(); });
});

function keep4(d, k, v, lv = level) {
  // Safety net: a move that reached here some other way waits for the account too.
  if (needsAccount(lv)) { askAccount(() => keep4(d, k, v, lv)); return; }
  const key = wkey(lv, d, k);
  state.work[key] = String(v);
  save();
  account.touch('work', key, String(v));
}

function bookHTML(st) {
  const x = LEVELS4[level - 1];
  const g = gateFor(level);
  let right = '';
  if (!holds(tierNow(), g)) {
    const rung = LADDER.find((r) => r.key === g);
    right = `<div class="gate">
        <p class="eyebrow">${compass} What opens this</p>
        <h3>${esc(rung.n)}</h3><p>${esc(rung.what)}</p>
        <span class="price">${esc(rung.price)}</span>
        <a class="cta" href="${esc(payHref(g))}">Unlock for ${esc(rung.price)} →</a>
        ${rung.url ? `<a class="gp-line" href="${esc(rung.url)}" target="_blank" rel="noopener">See what it includes ↗</a>` : ''}
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
  const inFm = open && fm;
  return `<div class="book${open ? '' : ' shut'}">
    <aside class="leaf leaf-l" id="leafl" aria-label="Level ${pad(level)} and its four domains">${leftHTML(st, x, open)}</aside>
    <section class="leaf leaf-r"${inFm ? ` role="dialog" aria-modal="true" aria-label="Level ${pad(level)}, one question at a time"` : ` aria-label="${open ? 'Where you are in this level' : 'This level'}"`}>${right || (inFm ? pageHTML(st, x) : goHTML(st, x))}</section>
  </div>`;
}

/** "Before you start" (Alexandru, 3 Nov 2026): the elephant in the room and
 *  the founder's version are the first row of the list, drawn as an intro so
 *  they never look like a part of the level. One tap opens them. */
const INTRO = ['welcome', 'wask', 'door', 'where', 'you', 'still'];
const introIdx = () => steps().map((s, i) => [s, i]).filter(([s]) => INTRO.includes(s[1])).map(([, i]) => i);
function introRowHTML() {
  const ix = introIdx();
  if (!ix.length) return '';
  const S = steps(), done = ix.every((i) => stepDone(state.work, level, S[i]) || skipsStep(state.work, S[i]));
  const now = qi != null && ix.includes(qi);
  return `<li><button type="button" class="cw-s cw-intro${done ? ' done' : ''}${now ? ' now' : ''}" data-intro="${ix[0]}"${now ? ' aria-current="step"' : ''}>
      <span class="cw-n cw-letter cw-il">${WL_IC[0]}</span>
      <span class="cw-st"><b>Before you start <span class="cw-itag">Intro</span></b><i>${esc(elephantName())} · your version · ${done ? 'done ✓' : 'about 2 min'}</i></span></button></li>`;
}
/** Twelve squares, three for each part: each one opens its own move, so any
 *  question is one tap away (Alexandru, 3 Nov 2026: "go back to the first"). */
const MOVE = ['tap', 'slide', 'blank'];
function squaresHTML() {
  const S = steps(), sq = [0, 1, 2, 3].map((d) => {
    const u = domainUnits(state.work, level, d), name = LEAD[DOMS[d]];
    return `<span class="sq-g">${[0, 1, 2].map((j) => {
      const at = S.findIndex((s) => s[0] === d && (j < 2 ? s[1] === MOVE[j] : s[1] === 'blank' || s[1] === 'day'));
      return `<button type="button" class="sq${j < u ? ' on' : ''}" style="--c:var(--${DOMS[d]})" data-sq="${at}" aria-label="${esc(name)}, move ${j + 1} of 3${j < u ? ', done' : ''}"></button>`;
    }).join('')}</span>`;
  }).join('');
  return `<div class="sqs" role="group" aria-label="The twelve moves of this level">${sq}</div>`;
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
    <p class="lvcount" id="lvcount">${done} of ${UNITS} done</p>
    ${open ? squaresHTML() : ''}`;
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
    <ol class="cw-steps cw-doms4">${introRowHTML()}${doms}</ol>
    <p class="cw-promise"><b>By Sunday.</b> ${esc(x.promise)}</p>
    ${CLOSES[level] != null ? `<p class="cw-chapnote">This level closes ${esc(CHAPTERS4[CLOSES[level]].name)}. Your chapter reading comes after it.</p>` : ''}
    <p class="cw-more"><a href="#cw-video">▶ This level’s teaching</a><button type="button" class="cw-all" data-go="blueprint">My Blueprint</button>${all}</p>`;
}

// ── Focus mode (Alexandru, 2 Nov 2026; the spec of 13:41 on issue #113) ────
// The questions open in one full-screen layer: one question, its answer right
// under it, Next right under the answer. Done ✓ closes it and the founder is
// back at the levels, where the new tick shows. It is the only way to answer.
let fm = false, fmT = 0;
/** "Lead yourself · 3 of 5": where the founder is, in plain words. */
function fmWhere(d, kind) {
  if (kind === 'welcome') return `${esc(elephantName())} · ${stepAt(qi)[2] + 1} of 4`;
  if (kind === 'wask') { const A = welcomeOf(level).asks; return `${esc(elephantName())} · question ${A.findIndex((a) => a.k === stepAt(qi)[2]) + 1} of ${A.length}`; }
  if (kind === 'where') { const [n, of] = doorAt(); return `Where you are now · ${n} of ${of}`; }
  if (kind === 'still' || kind === 'you' || kind === 'door') return 'Where you are now';
  if (kind === 'begin') return `Level ${pad(level)} begins`;
  if (kind === 'got') return `Last week · ${d + 1} of 4`;
  if (d >= 0) {
    const mine = steps().map((s, i) => [s, i]).filter(([s]) => s[0] === d && s[1] !== 'got');
    return `${esc(LEAD[DOMS[d]])} · ${mine.findIndex(([, i]) => i === qi) + 1} of ${mine.length}`;
  }
  return kind === 'week' ? 'Your week' : kind === 'dirlook' ? 'Your direction, again' : kind[0] === 'b' ? 'Build it' : 'Your chapter reading';
}
/** Everything behind the layer is set aside, so Tab stays inside it. */
const FM_BEHIND = ['body > .top', 'body > .skip', 'body > .foot', '.leaf-l', '#under', '.cw-drawer', '.cw-dveil', '#crown', '.crown-wrap', '#cban', '#libban', '.mp'];
function fmInert(on) {
  for (const sel of FM_BEHIND) document.querySelectorAll(sel).forEach((x) => { if (on) x.setAttribute('inert', ''); else x.removeAttribute('inert'); });
}
function fmOpen(at) {
  if (at != null && at >= 0) qi = at;
  fm = true;
  try {
    const url = `${location.pathname}${location.search}#programme-${level}-q`;
    if (/-q$/.test(location.hash)) history.replaceState(null, '', url); else history.pushState(null, '', url);
  } catch { /* old browser */ }
  document.body.classList.add('fmopen');
  drawBook();
}
/** Close the layer here (the answers are already saved, as they were given). */
function fmShut() {
  if (!fm) return;
  fm = false; clearTimeout(fmT);
  document.body.classList.remove('fmopen');
  fmInert(false);
  drawBook(false); refreshRail();
  const b = document.querySelector('[data-fmopen]'); if (b) b.focus({ preventScroll: true });
}
/** Close it from a button or Esc: through the browser's history when the
 *  layer added a step, so Back and Forward stay in order. */
function fmClose() {
  if (!fm) return;
  if (/-q$/.test(location.hash)) { try { history.back(); return; } catch { /* old browser */ } }
  fmShut();
}
/** A tap moves on by itself after a short pause, unless it shows a reply to read. */
function fmAuto() {
  clearTimeout(fmT);
  if (!fm) return;
  const at = qi;
  fmT = setTimeout(() => { if (fm && qi === at && ready(qi)) moveQ(1); }, 450);
}
/** The right page, when the layer is closed: where the founder is, and the way in. */
function goHTML(st, x) {
  const [d, kind] = stepAt(qi), done = levelDone(st, level), started = done > 0 || qi > 0;
  const at = kind === 'welcome' || kind === 'wask' ? `Before you start · the elephant in the room` : kind === 'door' || kind === 'where' || kind === 'still' || kind === 'you' ? 'Before you start · your version' : kind === 'begin' ? `Level ${pad(level)} begins` : kind === 'got' ? 'Last week’s four actions'
    : d >= 0 ? LEAD[DOMS[d]] : kind === 'week' ? 'Your week' : kind === 'dirlook' ? 'Your direction, again' : kind[0] === 'b' ? 'Build it' : 'Your chapter reading';
  return `<button type="button" class="cw-phone" data-crown="steps" aria-label="Show every step of this level">
      <span><i aria-hidden="true"></i>Level ${pad(level)} · ${done} of ${UNITS} done</span><span aria-hidden="true">All steps ▾</span></button>
    <div class="fm-go">
      <p class="eyebrow">Level ${pad(level)} · ${esc(x.title)}</p>
      <h3 class="cw-q">${started ? (done === UNITS && kind === 'week' ? 'Your week is written.' : 'Pick up where you left off.') : `Start Level ${pad(level)}.`}</h3>
      <p class="fm-at">Next: <b>${esc(at)}</b></p>
      ${introSavedHTML()}
      <p class="cw-promise"><b>By Sunday.</b> ${esc(x.promise)}</p>
      <button type="button" class="cta fm-open" data-fmopen>${started ? 'Continue →' : 'Start →'}</button>
      <p class="fm-hint">One question at a time, on the whole screen. Done ✓ or Esc brings you back here.</p>
    </div>`;
}
/** The 1:1 booking opens in the same tab and knows the way back (Alexandru,
 *  3 Nov 2026: "I was in the program, take me there, not to Base Camp"). */
const bookHref = () => `${BOOKING}${BOOKING.includes('?') ? '&' : '?'}back=${encodeURIComponent(location.pathname + location.hash)}`;
/** Closed in the middle of "Before you start" (Alexandru, 3 Nov 2026: "it
 *  tells me 8 of 12 done; it seems it hasn't recorded my work"): the twelve
 *  count only the four parts, so the intro says itself what is kept. */
function introSavedHTML() {
  const ix = introIdx(), S = steps();
  const asks = ix.filter((i) => ['wask', 'where', 'you', 'still'].includes(S[i][1]) && !skipsStep(state.work, S[i]));
  const got = asks.filter((i) => stepDone(state.work, level, S[i])).length;
  if (!got || got === asks.length) return '';
  return `<p class="fm-saved" role="status">✓ Saved: ${got} of ${asks.length} answers in Before you start. The 12 squares count only the four parts that come after it.</p>`;
}
/** The elephant in the room (Alexandru, 2 Nov 2026): before Levels 01, 04,
 *  06 and 10, four screens one at a time (we understand you, it is possible,
 *  the puzzle, here you are), in Alexandru's own voice, then three taps or
 *  sliders. Personal: the first name, and from Level 04 on, the founder's
 *  own answers. A Summit founder has Greatness at Level 01. */
/** The elephant, walking in (Alexandru, 3 Nov 2026: "a huge elephant making
 *  a step, and here we are … focus, let's go"). A line drawing in the gold
 *  accent; it walks once, and stands still for anyone who asked for less
 *  motion (focus.css). Decorative: the words say it all. */
const ELEPHANT = `<svg class="ele" viewBox="0 0 230 132" aria-hidden="true" focusable="false">
  <path class="ele-ground" d="M6 122h218" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="2 7"/>
  <g class="ele-walk" fill="currentColor">
    <rect class="lg lg2" x="70" y="80" width="15" height="40" rx="7" opacity=".72"/>
    <rect class="lg lg4" x="128" y="80" width="15" height="40" rx="7" opacity=".72"/>
    <path d="M38 52c-6 6-8 14-6 22" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
    <ellipse cx="96" cy="64" rx="58" ry="36"/>
    <rect class="lg lg1" x="52" y="82" width="16" height="40" rx="7.5"/>
    <rect class="lg lg3" x="112" y="82" width="16" height="40" rx="7.5"/>
    <circle cx="160" cy="54" r="27"/>
    <path d="M178 66c8 10 10 26 6 40-1 5 3 8 8 7" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
    <ellipse cx="146" cy="58" rx="15" ry="21" fill="none" stroke="#FFFFFF" stroke-width="2.6" opacity=".85"/>
    <circle cx="171" cy="47" r="2.6" fill="#FFFFFF"/>
    <path d="M182 70l8 6" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>
  </g>
</svg>`;
const WL_IC = [
  '<path d="M4 5.5h11v8H8.5L4 17z"/><path d="M15 9h5v8l-3-2.5h-6V13.5"/>',
  '<path d="M3 19.5 9.5 8l3.5 6 2-3 6 8.5z"/><path d="M9.5 8V3.5l4 1.5-4 1.5"/>',
  '<path d="M5 8h3.2a2 2 0 1 1 3.6 0H15v3.2a2 2 0 1 1 0 3.6V18H5z"/>',
  '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h5a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h5"/>'].map((d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`);
/** A star, for the way back to the North Star. */
const NS_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z"/></svg>';
const isSummit = () => (state.tier || 'free') === 'premium' && !team();
/** This welcome's name: Your hidden potential, The future you, … */
function elephantName() {
  const W = welcomeOf(level);
  return W ? (isSummit() && W.summit && W.summit.name) || W.name : '';
}
/** What the founder told us before, read back from Level 04 on. */
function toldHTML() {
  const w = state.work, bits = [], ty = whereWords(w, 'stage');
  if (ty) bits.push(`Your version: <b>${esc(ty)}</b>.`);
  if (level === 4 && askWords(w, 1, 'stops')) bits.push(`In Level 01, what stopped you most: “${esc(askWords(w, 1, 'stops'))}”.`);
  if (level === 6 && askWords(w, 4, 'past')) bits.push(`In Level 04 you said old habits ran ${esc(askWords(w, 4, 'past'))} of your week.`);
  if (level === 10 && askWords(w, 6, 'only')) bits.push(`In Level 06 you said ${esc(askWords(w, 6, 'only'))} of the work could only be done by you.`);
  if (whereWords(w, 'win')) bits.push(`In twelve weeks: “${esc(whereWords(w, 'win'))}”.`);
  return bits.length ? `<p class="wl-told">${bits.join(' ')}</p>` : '';
}
/** The way back to the North Star: its number is the hidden potential. */
const nsHTML = () => `<p class="wl-ns"><span class="wl-ic">${NS_IC}</span><span>${compassRec
  ? 'By the way: go back to your North Star. It shows this as one number: the strength you see in yourself that is not at work yet.'
  : 'By the way: take the North Star. It shows this as one number: how much of the strength you see in yourself is not at work yet.'}
  <a href="/northstar/" target="_blank" rel="noopener">${compassRec ? 'Go to my North Star' : 'Take the North Star'} ↗</a></span></p>`;
function welcomeHTML(i = 0) {
  const W = welcomeOf(level);
  if (!W) return '';
  const all = beatsOf(level, isSummit()), B = all[i] || all[0], first = firstName();
  const lvs = []; for (let n = W.lv[0]; n <= W.lv[1]; n++) lvs.push(n);
  return `<div class="wl">
    <p class="wl-eb">The elephant in the room · ${esc(elephantName())}</p>
    <p class="wl-step"><span class="wl-ic">${WL_IC[i]}</span>${i + 1} of 4 · ${esc(B.t)}</p>
    <h3 class="cw-q" id="cwq">${esc(B.h.replace('{, first}', first ? `, ${first}` : ''))}</h3>
    <p class="wl-p">${esc(B.p)}</p>
    ${B.told && level > 1 ? toldHTML() : ''}
    ${B.ns ? nsHTML() : ''}
    ${B.q ? `<blockquote class="wl-q"><small>What a business is</small><p>“${esc(B.q)}”</p></blockquote>` : ''}
    ${i === 3 ? `<div class="wl-have"><h4>By the end, you will have:</h4><ol>${lvs.map((n) => `<li><span>Level ${pad(n)}</span><p>${esc(LEVELS4[n - 1].promise)}</p></li>`).join('')}</ol></div>
    <p class="wl-sign">Alexandru</p>` : ''}
  </div>`;
}
/** Where the founder is in the door: [n, of], counting only the questions that apply. */
function doorAt() {
  const on = steps().filter((s) => s[1] === 'where' && !skipsStep(state.work, s));
  return [Math.max(1, on.findIndex((s) => s[2] === stepAt(qi)[2]) + 1), on.length];
}
/** A tap question of a welcome or the door. name: "w:<key>" or "d:<key>". */
function tapsHTML(topic, q, hint, opts, picked, name, after = '') {
  return `${topic}<h3 class="cw-q" id="cwq">${esc(q)}</h3>
    ${hint ? `<p class="cw-hint">${esc(hint)}</p>` : ''}
    <div class="cw-opts" role="group" aria-labelledby="cwq">${opts.map((o, i) => `<button type="button" class="cw-o" data-qt="${name}:${i}" aria-pressed="${picked === i}"><kbd aria-hidden="true">${i + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div>
    ${after}<p class="cw-keys"><kbd>1–${opts.length}</kbd> choose</p>`;
}
/** A slider of a welcome or the door, with its "not yet" taps under it. */
const qShown = (S, n) => `${S.pre || ''}${n}${S.unit || ''}`;
function slideQHTML(topic, q, hint, S, x, v, name) {
  const num = typeof v === 'number' ? v : null, at = num == null ? S.d : num, alt = typeof v === 'string' && /^x\d$/.test(v) ? Number(v.slice(1)) : -1;
  return `${topic}<h3 class="cw-q" id="cwq">${esc(q)}</h3>
    ${hint ? `<p class="cw-hint">${esc(hint)}</p>` : ''}
    <div class="cw-slide${alt >= 0 ? ' cw-off' : ''}"><div class="cw-big"><span id="cwbig">${alt >= 0 ? '–' : esc(qShown(S, at))}</span></div>
    <input type="range" id="cwr" data-qs="${name}" min="${S.min}" max="${S.max}" step="${S.step}" value="${at}" style="--p:${(at - S.min) / (S.max - S.min) * 100}%" aria-labelledby="cwq">
    <div class="cw-ends"><span>${esc(S.e[0])}</span><span>${esc(S.e[1])}</span></div></div>
    ${x && x.length ? `<div class="cw-opts cw-alt" role="group" aria-label="Or">${x.map((o, i) => `<button type="button" class="cw-o" data-qx="${name}:${i}" aria-pressed="${alt === i}"><span>${esc(o)}</span></button>`).join('')}</div>` : ''}
    <p class="cw-keys"><kbd>← →</kbd> slide · <kbd>Enter ↵</kbd> next</p>`;
}
/** A welcome answer, or a door answer: saved on the account like every answer. */
function keepAsk(name, v) {
  const [t, k] = name.split(':');
  if (t === 'w') keep4('w', k, v); else keepWhere(k, v);
}
/** The four versions as taps: on "your version" (Level 01) and "Still …?" (04, 06, 10). */
function typesHTML(picked, mark) {
  return `<div class="cw-opts cw-types" role="group" aria-labelledby="cwq">${TYPES4.map((x, i) => `<button type="button" class="cw-o cw-type" data-type="${x.k}" aria-pressed="${x.k === picked}"><kbd aria-hidden="true">${i + 1}</kbd><span><b>${esc(x.n)}</b><small>${esc(x.sub)}${x.k === mark ? ' · what your numbers say' : ''}</small></span></button>`).join('')}</div>`;
}
/** The switch (Alexandru, 2 Nov 2026): the founder's own answers say they
 *  are further on than they told us. We say so, and offer the version that
 *  fits; "Keep mine" is remembered. On the week, and in My Blueprint. */
function switchHTML() {
  const sw = switchOf(state.work);
  if (!sw) return '';
  const T = TYPES4.find((t) => t.k === sw.to);
  return `<div class="cw-switch" role="region" aria-label="Your version"><p class="eyebrow">Your version</p>
    <p><b>Your answers say you have moved up.</b> ${esc(sw.why)} That is ${esc(T.n.toLowerCase())}, not ${esc(typeName(sw.from).toLowerCase())}. So now we adapt: ${esc(T.means.charAt(0).toLowerCase() + T.means.slice(1))}</p>
    <p class="cw-more"><button type="button" class="cta" data-switch="${sw.to}">That’s me: switch to ${esc(T.n.toLowerCase())}</button><button type="button" class="cw-all" data-keepsize="${sw.to}">Keep mine</button></p></div>`;
}
/** "Still …?" at 04, 06 and 10: moving up shows a reply, so it waits to be read. */
let movedUp = null;
/** "Where are you now?": saved on the account like every answer. A new
 *  number of customers or people paid asks for the version again. Before a
 *  first sale, the questions about selling are cleared. */
function keepWhere(k, v) {
  if (needsAccount()) { askAccount(() => keepWhere(k, v)); return; }
  const set = (key, val) => { state.work[key] = String(val); account.touch('work', key, String(val)); };
  const was = state.work[`w.v4.where.${k}`];
  if ((k === 'cust' || k === 'team') && was != null && was !== '' && String(was) !== String(v)) set('w.v4.where.stage', '');
  if (k === 'cust' && +v === 0) for (const x of ['sales', 'reach', 'back', 'margin']) if (state.work[`w.v4.where.${x}`]) set(`w.v4.where.${x}`, '');
  set(`w.v4.where.${k}`, v);
  save();
}

/** The right page: one field on screen (31 Oct 2026, the Blueprint
 *  skeleton). Tap, slide, one blank at a time, the day as a tap, "Done when"
 *  with how sure, four lines back; the week as four actions; last week's four
 *  first; the chapter reading and one action carried forward. */
const KIND = { begin: 'The level begins', door: 'Where you are now', welcome: 'The elephant in the room', wask: 'The elephant in the room', where: 'Where you are now', you: 'Your version', still: 'Where you are now', got: 'Last week', idea: 'The idea', tap: 'Tap', slide: 'Slide', blank: 'Write once', day: 'The day', done: 'Done when',
  lines: 'Your four lines', week: 'Your week', reading: 'Chapter reading', carry: 'Carry one forward', carryday: 'Its day', dirlook: 'Your direction, again',
  bask: 'Build it', bstep: 'Build it', bday: 'Its day', bpage: 'Your page' };
/** Inform → Reform → Transform (2 Nov 2026): the replies and checks, drawn
 *  on the screen and again as the founder slides or types. */
const replyHTML = (head, text) => (text ? `<b>${head}</b> ${esc(text)}` : '');
function checkHTML(d, key) {
  const c = blankCheck(state.work, level, d, key);
  return c ? `<span class="${c.good ? 'ok' : 'hint'}"><i aria-hidden="true">${c.good ? '✓' : '→'}</i> ${esc(c.text)}</span>` : '';
}
/** Under SMALL_UNDER per cent sure, the smaller step is offered now, not only
 *  after a Sunday "Not yet". Shown once the founder has moved the slider (or
 *  saved a value other than the starting 50). */
const sureMoved = new Set();
function smallHTML(d) {
  const w = state.work, u = sureOf(w, level, d), p = planOf(level, d);
  if (!p || !p.notyet || u == null || u >= SMALL_UNDER || (u === 50 && !sureMoved.has(`${level}.${d}`))) return '';
  const on = smallOf(w, level, d);
  return `<div class="cw-small"><p><b>Under ${SMALL_UNDER}% sure.</b> ${notyetOf(w, level, d)}</p>
    <button type="button" class="cw-o cw-smallbtn" data-v4small="${d}" aria-pressed="${on}"><span>${on ? '✓ The smaller step is in your week' : 'Use the smaller step this week'}</span></button></div>`;
}
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
      <p class="cw-wa">${smallOf(w, lv, k) ? notyetOf(w, lv, k) : fill(x.d[k].fb[3], w, lv, k)}</p>
      <p class="cw-dw"><b>Done when</b> ${doneOf(w, lv, k)}${u != null ? ` <span class="cw-u">· ${u}% sure</span>` : ''}</p></li>`;
  }).join('')}</ol>`;
}
/** The next 1:1, where it comes up in the programme (SESSIONS4): what it is
 *  for, what to bring, and the booking form. Nothing is asserted about a
 *  payment: the gate of the next level says plainly what opens it. */
function sessionCard(lv) {
  const S = SESSIONS4.find((x) => x.after === lv);
  if (!S) return '';
  return `<div class="cw-sess"><p class="eyebrow">${compass} Next · 1:1 with Alexandru and the team</p>
    <p class="gaint">Session ${S.n} · ${esc(S.name)}</p><p class="gainp"><b>Bring:</b> ${esc(S.bring)}</p>
    <a class="cta" href="${esc(bookHref())}">Book Session ${S.n} →</a></div>`;
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
    ${sessionCard(level)}
    ${next && LEVELS4[level] ? `<div class="gain"><p class="gaint">${esc(next.n)} · ${esc(next.name)}</p><p class="gainp">${esc(next.about)}</p>
      <button class="cta" type="button" data-level="${level + 1}">${holds(tierNow(), gateFor(level + 1)) ? `Open level ${pad(level + 1)}` : 'See what opens it'}</button></div>`
      : `<p class="cw-planner">Twelve weeks, written. <button type="button" class="cw-all" data-go="blueprint">Open your Blueprint</button></p>`}`;
}
/** Your direction, again (Alexandru, 2 Nov 2026): after each chapter reading
 *  (Levels 05, 09, 12) the founder reads My direction with what the chapter
 *  taught them, and says it still holds or opens it to sharpen it. The
 *  values stay locked unless changed on purpose; where unsure, ask a
 *  customer (rule 15). Kept as w.v4.<lv>.r.dir = "kept|edit <date>". */
const DIR_LOOK = ['mission', 'vision', 'values', 'goalBiz', 'goalLead'];
function dirLookHTML() {
  const w = state.work, D = directionOf(w), said = String(w[wkey(level, 'r', 'dir')] || ''), any = DIRECTION4.some((F) => D[F.k]);
  const head = level === 12 ? 'Twelve levels. <em>Your direction for the next twelve weeks.</em>' : `${level === 5 ? 'Five' : 'Nine'} levels in. <em>Read your direction again.</em>`;
  const rows = DIR_LOOK.map((k) => DIRECTION4.find((F) => F.k === k)).filter(Boolean).map((F) => `<div><dt>${esc(F.label)}${F.lock ? ' <small>locked in: changed only on purpose</small>' : ''}</dt><dd>${D[F.k] ? esc(D[F.k]) : '<span class="cw-dl-none">Not written yet</span>'}</dd></div>`).join('');
  return `<h3 class="cw-q" id="cwq">${head}</h3>
    <p class="cw-hint">${any ? 'Read each line with what you know now. If a customer would not recognise it, sharpen it. Not sure? Ask a customer, not yourself.' : 'Your direction is not written yet. Write it now, with what these levels taught you: who you serve, and what changes for them.'}</p>
    ${any ? `<dl class="cw-dirl">${rows}</dl>` : ''}
    <div class="cw-opts" role="group" aria-labelledby="cwq">
      ${any ? `<button type="button" class="cw-o" data-dirlook="keep" aria-pressed="${said.startsWith('kept')}"><kbd aria-hidden="true">1</kbd><span>It still holds</span></button>` : ''}
      <button type="button" class="cw-o" data-dirlook="edit" aria-pressed="${said.startsWith('edit')}"><kbd aria-hidden="true">${any ? 2 : 1}</kbd><span>${any ? 'Sharpen it in My direction' : 'Write my direction'}</span></button>
    </div>
    ${said ? `<p class="cw-said">${said.startsWith('kept') ? 'You read it again and it still holds' : 'You opened it to sharpen it'}, ${esc(dayOf(said.split(' ')[1] || ''))}.</p>` : ''}`;
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
  // Focus mode (Alexandru, 2 Nov 2026): the top line is a thin progress bar,
  // where the founder is ("Lead yourself · 3 of 5") and Back.
  const top = `<div class="fm-top"><div class="fm-bar" aria-hidden="true"><i style="width:${Math.round(qi / Math.max(1, total - 1) * 100)}%"></i></div>
    <div class="fm-row"><span class="fm-where">${fmWhere(d, kind)}${d >= 0 && kind !== 'got' && d === startHere() ? ' · ★ Start here' : ''}</span>
    <button type="button" class="fm-x" data-fmclose aria-label="Close, and go back to the levels">Close ✕</button></div></div>
    <p class="cw-lab vh">${label} · ${KIND[kind]}</p>`;
  void seg;
  let body = '';
  if (kind === 'welcome') body = welcomeHTML(key);
  else if (kind === 'door') {
    // The bridge from the elephant to the door (Alexandru, 3 Nov 2026: "I
    // transition without understanding what's happening").
    const of = steps().filter((s) => s[1] === 'where' && !skipsStep(state.work, s)).length;
    body = `<p class="wl-eb">The elephant in the room · named ✓</p>
      <h3 class="cw-q" id="cwq">Now, <em>where you are today.</em></h3>
      <p class="wl-p">${of} quick taps and sliders about your business as it is today: customers, sales, time and team. From them, the course picks your version, so every example and every action fits you.</p>
      <p class="wl-p">No right answers. The honest number is the useful one.</p>`;
  }
  else if (kind === 'begin') {
    body = `<div class="bg-scene" aria-hidden="true">${ELEPHANT}</div>
      <p class="wl-eb">Before you start · done ✓</p>
      <h3 class="cw-q bg-h" id="cwq">Here you are. <em>Level ${pad(level)} begins.</em></h3>
      <p class="bg-title">${esc(x.title)}</p>
      <p class="wl-p">Focus now: one question at a time. Tap the line that sounds like you, slide to the honest number, write one sentence. Ten minutes is enough for today.</p>
      <ol class="bg-parts">${x.d.map((D, i) => `<li><span class="cw-letter" style="background:var(--${DOMS[i]})">${esc(D.l)}</span><span><small>Part ${i + 1} of 4 · ${esc(LEAD[DOMS[i]])}</small><b>${esc(D.name)}</b></span></li>`).join('')}</ol>
      <p class="cw-promise"><b>By Sunday.</b> ${esc(x.promise)}</p>`;
  }
  else if (kind === 'wask') {
    const A = askOf(level, key), raw = w[wkey(level, 'w', key)], v = raw == null || raw === '' ? null : /^x\d$/.test(raw) ? raw : Number(raw);
    const topic = `<p class="wl-eb">The elephant in the room · ${esc(elephantName())}</p>`;
    let after = '';
    if (A.was && v != null) {
      const then = askWords(w, A.was[0], A.was[1]), now = A.o[v];
      if (then) after = `<div class="cw-reply" role="status">${replyHTML(`Since Level ${pad(A.was[0])}`, then === now ? `The same: “${then}”. It has a name now. Bring it to your session, and we look at it together.` : `It was “${then}”. Now it is “${now}”. Bring both to your session: what moved, and why.`)}</div>`;
    }
    body = A.s ? slideQHTML(topic, A.q, A.hint, A.s, A.x, v, `w:${key}`) : tapsHTML(topic, A.q, A.hint, A.o, v ?? -1, `w:${key}`, after);
  } else if (kind === 'where') {
    const Q = WHERE4.find((q) => q.k === key), a = whereOf(w), [n, of] = doorAt();
    const topic = `<p class="cw-topic">Where you are now · ${n} of ${of}</p>`;
    body = Q.s ? slideQHTML(topic, Q.q, Q.hint, Q.s, Q.x, a[key], `d:${key}`) : tapsHTML(topic, Q.q, Q.hint, Q.o, a[key] ?? -1, `d:${key}`);
  } else if (kind === 'you') {
    const t = typeOf(w) || 'solo', cur = sizeOf(w) || t, T = TYPES4.find((x) => x.k === cur), lines = readBack(w);
    body = `<p class="cw-topic">Where you are now · your version</p>
      <h3 class="cw-q" id="cwq">Your version: ${esc(T.n)}.</h3>
      <p class="cw-hint">${esc(T.means)} If that changes, the levels tell you, and the version changes with you.</p>
      ${typesHTML(cur, t)}
      ${cur !== t ? `<div class="cw-reply" role="status">${replyHTML('Your numbers say', `${typeName(t)}. You chose ${T.n.toLowerCase()}: the examples follow your choice, and you can change it any time in My Blueprint.`)}</div>` : ''}
      ${lines.length ? `<section class="wl-read" aria-labelledby="wlrd"><h4 id="wlrd">Your numbers, read back</h4><ul>${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></section>` : ''}
      <p class="cw-keys"><kbd>1–4</kbd> change it · <kbd>Enter ↵</kbd> that’s me</p>`;
  } else if (kind === 'still') {
    const had = sizeOf(w), mine = w[wkey(level, 'w', 'stage')], picked = mine != null && mine !== '' ? sizeOf({ 'w.v4.where.stage': mine }) : '', sw = switchOf(w);
    const T = TYPES4.find((x) => x.k === picked);
    body = `<p class="cw-topic">Where you are now</p>
      <h3 class="cw-q" id="cwq">${had ? `Still ${esc(typeName(had).toLowerCase())}?` : 'Which of the four are you today?'}</h3>
      <p class="cw-hint">${sw ? `${esc(sw.why)} That sounds like ${esc(typeName(sw.to).toLowerCase())}.` : 'Tap the one that is true today. The examples and actions follow it.'}</p>
      ${typesHTML(picked, sw ? sw.to : '')}
      ${movedUp && T ? `<div class="cw-reply" role="status">${replyHTML('You have moved up', `From ${typeName(movedUp).toLowerCase()} to ${T.n.toLowerCase()}. So from here we adapt: ${T.means.charAt(0).toLowerCase() + T.means.slice(1)}`)}</div>` : ''}
      <p class="cw-keys"><kbd>1–4</kbd> choose</p>`;
  } else if (kind === 'got') {
    const g = gotOf(w, level - 1, d), u = sureOf(w, level - 1, d);
    body = `<h3 class="cw-q" id="cwq">Last week: <em>did it happen?</em></h3>
      <div class="cw-was"><p>${fill(D.fb[3], w, level - 1, d)}</p><p class="cw-dw"><b>Done when</b> ${doneOf(w, level - 1, d)}</p></div>
      <div class="cw-opts" role="group" aria-labelledby="cwq">${GOT.map((o, k) => `<button type="button" class="cw-o" data-got="${k}" aria-pressed="${g === k}"><kbd aria-hidden="true">${k + 1}</kbd><span>${o}</span></button>`).join('')}</div>
      ${g == null ? '<p class="cw-keys"><kbd>1–3</kbd> choose · a no is information, not a verdict</p>'
        : `<p class="cw-said">${u != null ? `You were ${u}% sure. ` : ''}It happened: ${['yes', 'partly', 'not yet'][g]}.</p>${g > 0 ? `<p class="cw-smaller">${notyetOf(w, level - 1, d)}</p>` : ''}`}`;
  } else if (kind === 'idea') {
    body = `<p class="cw-topic">${esc(p.topic)}</p>
      <h3 class="cw-q cw-idea" id="cwq">${esc(p.idea)}</h3>
      <details class="cw-why"><summary>Why it matters</summary><p>${esc(p.ins)}</p></details>
      <p class="cw-keys"><kbd>Enter ↵</kbd> next</p>`;
  } else if (kind === 'tap') {
    const t = tapOf(w, level, d), why = tapReply(level, d, t);
    growthWords();
    body = `${p ? `<p class="cw-topic">${esc(p.topic)}</p>` : ''}${gpBack(p, 't')}<h3 class="cw-q" id="cwq">${D.t.q}</h3>
      <div class="cw-opts" role="group" aria-labelledby="cwq">${D.t.o.map((o, k) => `<button type="button" class="cw-o" data-v4t="${k}" aria-pressed="${t === k}"><kbd aria-hidden="true">${k + 1}</kbd><span>${esc(o)}</span></button>`).join('')}</div>
      ${why ? `<div class="cw-reply" role="status">${replyHTML('Why it doesn’t hold', why)}</div>` : ''}
      <p class="cw-keys"><kbd>1–${D.t.o.length}</kbd> choose · <kbd>Enter ↵</kbd> next</p>`;
  } else if (kind === 'slide') {
    let v = slideOf(w, level, d);
    if (v == null) { v = D.s.d; keep4(d, 's', v); }
    const pc = (v - D.s.min) / (D.s.max - D.s.min) * 100;
    body = `<h3 class="cw-q" id="cwq">${esc(D.s.q)}</h3>
      <div class="cw-slide"><div class="cw-big"><span id="cwbig">${esc(shown(D.s, v))}</span><small id="cwword">${D.s.raw ? '' : esc(wordOf(D.s, v))}</small></div>
      <input type="range" id="cwr" data-v4s="${d}" min="${D.s.min}" max="${D.s.max}" step="${D.s.step}" value="${v}" style="--p:${pc}%" aria-labelledby="cwq">
      <div class="cw-ends"><span>${esc(D.s.e[0])}</span><span>${esc(D.s.e[1])}</span></div></div>
      ${D.s.cost ? `<div class="cw-reply" id="cwcost" role="status">${replyHTML('What it costs', slideReply(level, d, v))}</div>` : ''}
      <p class="cw-keys"><kbd>← →</kbd> slide · <kbd>Enter ↵</kbd> next</p>`;
  } else if (kind === 'blank') {
    const fs = fieldsOf(D), f = fs.find((x2) => x2[0] === key) || fs[0], first = fs[0][0] === key, v = w[wkey(level, d, key)] || '';
    const note = p && p.stage && p.stage[STAGE_NOTE[st]];
    body = `${first && p && !p.idea ? `<p class="cw-ins"><b>Why it matters</b> ${esc(p.ins)}</p>` : ''}
      <h3 class="cw-sent" id="cwq">${sentenceAt(w, level, d, key)}</h3>
      ${gpBack(p, key)}
      <label class="cw-bl" for="cwin">${esc(f[1])}</label>
      <input id="cwin" class="cw-in" data-v4f="${d}.${esc(key)}" value="${esc(v)}" placeholder="e.g. ${esc(f[2])}" enterkeyhint="next" autocomplete="off" autocapitalize="sentences">
      ${D.ck && D.ck[key] ? `<p class="cw-chk" id="cwchk" aria-live="polite">${checkHTML(d, key)}</p>` : ''}
      ${blankNote(level, d, key) ? `<p class="cw-mnote">${esc(blankNote(level, d, key))}</p>` : ''}
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
      <div id="cwsmall">${smallHTML(d)}</div>
      <p class="cw-keys">On Sunday, the next level asks what happened · <kbd>Enter ↵</kbd> next</p>`;
  } else if (kind === 'lines') {
    const t = takeOf(w, level, d);
    body = `<h3 class="cw-q">${esc(D.name)}, <em>in four lines.</em></h3>
      <div class="cw-fb">${lines4(w, level, d).map((l, i) => `<div class="cw-fl"><h4>${l[0]}<small>${l[1]}</small></h4><div><p>${l[2]}</p>${i === 3 ? `<p class="cw-dw"><b>Done when</b> ${doneOf(w, level, d)}</p>` : ''}</div></div>`).join('')}</div>
      ${t ? `<section class="cw-take" aria-labelledby="cwtk-${d}"><p class="cw-tk">Yours to keep · it goes into your Blueprint</p>
        <h4 id="cwtk-${d}">${t.title}</h4><ol>${t.lines.map((l) => `<li>${l}</li>`).join('')}</ol>
        <button type="button" class="cw-copy" data-copytake="${d}">Copy</button></section>` : ''}
      ${ACTIONS4[`${level}.${d}`] ? `<p class="cw-five">Your five actions for ${esc(LEAD[DOMS[d]])} this week, written for your size, are in My Blueprint. <button type="button" class="cw-all" data-go="blueprint" data-bpto="week">See them</button></p>` : ''}`;
  } else if (kind === 'week') {
    const sh = startHere(), pc = CLOSES[level - 1] != null ? carriedFrom(w, level - 1) : null, next = LEVELS4[level];
    body = `<h3 class="cw-q">Your week. <em>Four actions, each with its day.</em></h3>
      ${weekList(level, sh)}
      ${switchHTML()}
      ${ACTIONS4[`${level}.0`] ? `<p class="cw-five">These four are yours, from your sentences. With them, sixteen more at your size: twenty this week, in My Blueprint. <button type="button" class="cw-all" data-go="blueprint" data-bpto="week">Open This week</button></p>` : ''}
      ${pc ? `<p class="cw-carry"><b>Carried forward from your reading</b> ${fill(LEVELS4[pc[0] - 1].d[pc[1]].fb[3], w, pc[0], pc[1])}${w[wkey(level - 1, 'r', 'on')] ? ` · by ${esc(w[wkey(level - 1, 'r', 'on')])}` : ''}</p>` : ''}
      <p class="cw-planner">Write them on your Planner’s Monday page: ${sh >= 0 ? 'the first as <b>My one move</b>, the other three as <b>Three goals</b>' : 'the one you most want to avoid as <b>My one move</b>, the other three as <b>Three goals</b>'}. On Sunday, the next level asks what happened.</p>
      <p class="cw-more"><button type="button" class="cw-copy cw-copyweek" data-copyweek>Copy my week</button><button type="button" class="cw-all" data-go="blueprint">See it in your Blueprint</button></p>
      ${ci == null ? sessionCard(level) : ''}
      ${ci != null ? `<p class="cw-note">This closes ${esc(CHAPTERS4[ci].name)}. Your chapter reading is next.</p>`
        : next ? `<div class="gain"><p class="eyebrow">${compass} What level ${pad(level + 1)} gives you</p><p class="gaint">${esc(next.word)} · ${esc(next.title)}</p><p class="gainp">${esc(next.promise)}</p>
          ${levelDone(st, level) === UNITS ? `<button class="cta" type="button" data-level="${level + 1}">${holds(tierNow(), gateFor(level + 1)) ? `Open level ${pad(level + 1)}` : 'See what opens it'}</button>` : `<p class="cw-note">It opens when all ${UNITS} moves here are done: ${UNITS - levelDone(st, level)} to go.</p>`}</div>` : ''}`;
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
        <button class="cta" type="button" data-level="${level + 1}">${holds(tierNow(), gateFor(level + 1)) ? `Open level ${pad(level + 1)}` : 'See what opens it'}</button></div>`
        : `<p class="cw-planner">Twelve weeks, written. <button type="button" class="cw-all" data-go="blueprint">Open your Blueprint</button></p>`}`;
  }
  else if (kind === 'dirlook') body = dirLookHTML();
  else if (kind === 'bask' || kind === 'bstep' || kind === 'bday' || kind === 'bpage') body = buildHTML(st, kind, key, ci);
  const last = qi >= lastStep(), domainEnd = kind === 'lines' && d < 3;
  const asksN = kind === 'welcome' && key === 3 ? welcomeOf(level).asks.length : 0;
  const nextLabel = kind === 'begin' ? 'Let’s go →' : kind === 'door' ? 'Start →' : kind === 'welcome' ? (key === 3 ? (asksN ? `${asksN === 1 ? 'One quick question' : `${asksN} quick questions`} →` : 'Next →') : 'Next →') : kind === 'you' ? 'That’s me →' : kind === 'lines' ? 'See my week →' : kind === 'week' && ci != null ? 'My chapter reading →' : 'Next ↵';
  return `${top}${body}
    <footer class="cw-foot">
      ${qi > 0 ? '<button type="button" class="cw-back" data-qmove="-1">← Back</button>' : ''}
      ${last || domainEnd ? `<button type="button" class="cw-next" data-fmdone="${domainEnd ? 'next' : 'end'}">Done ✓</button>`
        : `<button type="button" class="cw-next" data-qmove="1"${ready(qi) ? '' : ' disabled'}>${nextLabel}</button>`}
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
    if (k === 'book') return holds(tierNow(), 'session') ? `<a class="jw" ${pos} href="${esc(bookHref())}">${ico}</a>` : `<a class="jw" ${pos} href="${esc(payHref('session'))}">${ico}</a>`;
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
  document.body.classList.toggle('fmopen', fm && writable(st));
  fmInert(fm && writable(st));
  if (focus) {
    const r = document.querySelector('.leaf-r');
    const f = document.querySelector('#cwr') || document.querySelector('.leaf-r .cw-in:not(.cw-date)')
      || document.querySelector('.leaf-r .cw-o[aria-pressed="true"]') || document.querySelector('.leaf-r .cw-o') || document.querySelector('.leaf-r .cw-next:not([disabled])') || document.querySelector('.leaf-r .cw-lab');
    if (f) { if (!/^(INPUT|BUTTON)$/.test(f.tagName)) f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
    if (r && r.getBoundingClientRect().top < 0) r.scrollIntoView({ block: 'start' });
  }
  M.setCandles(answered(st, level, dom));
}
function moveQ(d) {
  const st = state.stage || 'build';
  if (view !== 'work' || !writable(st) || qi === null) return;
  if (d > 0 && !ready(qi)) return;
  const [, kind, key] = stepAt(qi);
  if (d > 0 && kind === 'welcome' && key === 3 && !state.work[wkey(level, 'w', 'seen')]) keep4('w', 'seen', '1');
  // A slider keeps where it starts: Next saves it as shown.
  const S = d > 0 && slideAt(level, stepAt(qi));
  if (S && !stepDone(state.work, level, stepAt(qi))) keepAsk(`${kind === 'wask' ? 'w' : 'd'}:${key}`, S.s.d);
  // "That's me": the version the numbers point to, unless the founder chose another.
  if (d > 0 && kind === 'you' && !String(state.work['w.v4.where.stage'] ?? '')) keepWhere('stage', SIZE_STAGE[typeOf(state.work) || 'solo']);
  movedUp = null;
  let to = Math.max(0, Math.min(lastStep(), qi + d));
  // A door question that does not apply (no customers yet) is passed over.
  while (to > 0 && to < lastStep() && skipsStep(state.work, stepAt(to))) to += d > 0 ? 1 : -1;
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
/** Every answer, in the eight parts: the full document, opened from My playbook. */
function blueprintDoc() {
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
      <p class="bp-act no-print"><button type="button" class="cta" data-print>Print it, or save it as a PDF</button><button type="button" class="cw-all" data-bpdoc="0">← My Blueprint</button><button type="button" class="cw-all" data-go="work">Back to the programme</button></p>
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

// ── My Blueprint (Alexandru, 2 Nov 2026) ─────────────────────────────────────
// The founder's playbook, brought back up to the practical (AGENTS.md 10, 11):
// light and white, one thing at a time. Five tabs: My direction (written once,
// one field per screen), This week (four actions), My playbook (every level),
// Strengths and My journey. Built only from the founder's own answers.
let bpTab = 'book', dirAt = null, dirBack = false, bpDoc = false;
const mbI = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
const MB_TABS = [
  ['book', 'My Blueprint', mbI('<path d="M12 6.6C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.6 2-1.6 5-2.1 8-1.6V5c-3-.5-6 0-8 1.6z"/><path d="M12 6.6v13"/>')],
  ['week', 'This week', mbI('<rect x="3.5" y="5" width="17" height="15" rx="2.2"/><path d="M3.5 9.5h17M8 3v4M16 3v4M9 14.6l2 2 4-4"/>')],
  ['dir', 'My direction', mbI('<circle cx="12" cy="12" r="9"/><path d="m15.6 8.4-2.2 5-5 2.2 2.2-5z"/>')],
  ['strong', 'Strengths', mbI('<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>')],
  ['path', 'My journey', mbI('<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h5a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h5"/>')]];
const MB_LOCK = mbI('<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>');
const MB_ASK = mbI('<path d="M4 5.5h16v10H9l-5 4z"/><path d="M9.5 9.2a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.7-.9 1.3M12 14.6v.1"/>');
const DOM_LEAD = DOMS.map((k) => LEAD[k]);
const mbv = (lv, d, k) => String(state.work[wkey(lv, d, k)] ?? '').trim();
/** A domain of a level is written once its sentence has a word in it. */
const begun = (lv, d) => { const L = LEVELS4[lv - 1]; return !!L && fieldsOf(L.d[d]).some(([k]) => mbv(lv, d, k)); };
const levelBegun = (lv) => [0, 1, 2, 3].some((d) => begun(lv, d));
/** This week's level: the latest one the founder has started writing. */
function weekLevel() {
  for (let n = 12; n >= 1; n--) if (levelBegun(n)) return n;
  return 0;
}
/** Twelve weeks from today, as the goal screens say it. */
const twelveOn = () => { try { return new Date(Date.now() + 84 * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return 'twelve weeks from today'; } };
const doneThisWeek = (lv) => (lv ? [0, 1, 2, 3].filter((d) => gotOf(state.work, lv, d) === 0).length : 0);

function dirPane() {
  const D = directionOf(state.work), n = DIRECTION4.length;
  if (dirAt == null && !DIRECTION4.some((F) => D[F.k])) dirAt = 0;
  if (dirAt != null && dirAt >= 0 && dirAt < n) {
    const i = dirAt, F = DIRECTION4[i], last = DIRECTION4.findIndex((x, j) => j > i && !D[x.k]) < 0 || dirBack;
    return `<form class="mb-one" data-dirform="${i}" novalidate>
      <p class="mb-step">${i + 1} of ${n} · ${esc(F.label)}</p>
      <h2 class="mb-q"><label for="mb-in">${esc(F.q)}</label></h2>
      <p class="mb-hint" id="mb-hint">${esc(F.hint.replace('{by}', twelveOn()))}</p>
      ${F.k === 'goalBiz' && !D[F.k] && whereWords(state.work, 'win') ? `<p class="mb-ask">${MB_ASK}<span>In Level 01 you said: “${esc(whereWords(state.work, 'win'))}”. Make it one number, with its date.</span></p>` : ''}
      <input id="mb-in" class="mb-input" type="text" maxlength="300" autocomplete="off" value="${esc(D[F.k])}" placeholder="${esc(F.ph)}" aria-describedby="mb-hint mb-err">
      <p class="mb-err" id="mb-err" role="status"></p>
      ${D[F.k] ? '' : `<p><button type="button" class="mb-text mb-skip" data-dirskip="${i}">Skip for now</button></p>`}
      <div class="mb-btns">
        <button type="button" class="mb-text" data-dirat="${i > 0 && !dirBack ? i - 1 : 'list'}">Back</button>
        <button type="submit" class="mb-btn">${F.lock ? `${MB_LOCK}Lock them in` : last ? 'Save' : 'Next'}</button>
      </div>
      ${F.ask ? `<p class="mb-ask">${MB_ASK}<span>${esc(F.ask)}</span></p>` : ''}
      <p class="mb-ex"><span>Example · ${esc(F.ex[0])}</span>${esc(F.ex[1])}</p>
    </form>`;
  }
  const left = DIRECTION4.findIndex((F) => !D[F.k]);
  const looked = [12, 9, 5].map((lv) => [lv, String(state.work[wkey(lv, 'r', 'dir')] || '')]).find(([, v]) => v);
  return `<h2 class="mb-h2" tabindex="-1">My direction</h2>
    <p class="mb-lead">Written once, in your words, about you and your customers. Every action in This week serves one of your two goals.</p>
    ${looked ? `<p class="mb-sub">Read again after Level ${pad(looked[0])}, ${esc(dayOf(looked[1].split(' ')[1] || ''))}: ${looked[1].startsWith('kept') ? 'it still held' : 'you opened it to sharpen it'}.</p>` : ''}
    ${left >= 0 ? `<p class="mb-next"><button type="button" class="mb-btn" data-dirat="${left}">${DIRECTION4.some((F) => D[F.k]) ? 'Continue' : 'Start'}: ${esc(DIRECTION4[left].label.toLowerCase())}</button></p>` : ''}
    <dl class="mb-dir">${DIRECTION4.map((F, i) => `<div><dt>${esc(F.label)}${F.lock && D[F.k] ? ` <span class="mb-locked">${MB_LOCK}locked in</span>` : ''}</dt>
      <dd>${D[F.k] ? esc(D[F.k]) : '<span class="mb-not">Not written yet</span>'}</dd>
      <dd class="no-print"><button type="button" class="mb-text" data-dirat="${i}" data-dirone="1" aria-label="${D[F.k] ? 'Change' : 'Write'} ${esc(F.label.toLowerCase())}">${D[F.k] ? 'Change' : 'Write it'}</button></dd></div>`).join('')}</dl>`;
}

/** Twenty actions a level (Alexandru, 2 Nov 2026): five in each area, at the
 *  founder's size. Each tick keeps its date (w.v4.<level>.<area>.a<0-4>);
 *  the Do tick is also Sunday's "Done" for that area. Do comes first. */
const DO_FIRST = [2, 0, 1, 3, 4];
const isoToday = () => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
const dayOf = (iso) => { try { return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); } catch { return iso; } };
const mbSize = () => sizeFor(sizeOf(state.work));
const actOn = (lv, d, i) => (i === 2 ? gotOf(state.work, lv, d) === 0 : !!mbv(lv, d, `a${i}`));
const actsDone = (lv) => [0, 1, 2, 3].reduce((n, d) => n + [0, 1, 2, 3, 4].filter((i) => actOn(lv, d, i)).length, 0);
function actHTML(lv, d, i, a) {
  const w = state.work, D = LEVELS4[lv - 1].d[d], own = i === 2 && begun(lv, d), wait = i === 2 && !own;
  const on = actOn(lv, d, i), at = mbv(lv, d, `a${i}`);
  const plain = own ? plainOf(D.fb[3], w, lv, d) : esc(a.t);
  return `<li class="${i === 2 ? 'mb-dostep' : ''}${on ? ' mb-on' : ''}${wait ? ' mb-off' : ''}">
    ${wait ? '<span class="mb-box" aria-hidden="true"></span>' : `<button type="button" class="mb-box" role="checkbox" aria-checked="${on}" data-mbact="${lv}:${d}:${i}" aria-label="Done: ${plain.replace(/"/g, '&quot;')}"></button>`}
    <div><p class="mb-meta"><b>${a.step}</b> · ${a.says}</p><p class="mb-do">${own ? fill(D.fb[3], w, lv, d) : esc(a.t)}</p>
    ${own ? `<p class="mb-sub">Done when: <span class="mb-ink">${doneOf(w, lv, d)}</span></p>` : a.ex ? `<p class="mb-sub">${esc(a.exLabel)}: ${esc(a.ex)}</p>` : ''}
    ${wait ? `<p class="no-print"><button type="button" class="mb-text" data-level="${lv}">Write your sentence in Level ${pad(lv)}</button></p>` : ''}
    ${i === 2 && (gotOf(w, lv, d) === 1 || gotOf(w, lv, d) === 2) ? `<p class="mb-sub">${GOT[gotOf(w, lv, d)]} on Sunday. The smaller step: ${notyetOf(w, lv, d)}</p>` : ''}
    ${on && at ? `<p class="mb-when">Done ${esc(dayOf(at))}</p>` : ''}</div></li>`;
}
function sizesHTML() {
  const cur = mbSize(), known = !!sizeOf(state.work);
  return `<div class="mb-sizes no-print" role="group" aria-label="Written for">${SIZES4.map(([k, n]) => `<button type="button" data-mbsize="${k}" aria-pressed="${k === cur}">${esc(n)}</button>`).join('')}</div>
    ${known ? '' : '<p class="mb-sub">Pick your size: the actions change with it. Until then, they are written for a founder selling alone.</p>'}`;
}
function weekPane() {
  const w = state.work, lv = weekLevel(), G = directionOf(w);
  if (lv && ACTIONS4[`${lv}.0`] && !(lv === 12 && lastSunday())) {
    const L = LEVELS4[lv - 1], size = mbSize();
    return `<h2 class="mb-h2" tabindex="-1">This week: 20 things to do</h2>
      <p class="mb-lead">From Level ${pad(lv)}, ${esc(L.title)}. Five in each area of your business, written for your size. <b>Do</b> is your own action, from your sentence: Sunday asks about it.</p>
      ${switchHTML()}${sizesHTML()}
      <p class="mb-count"><b>${actsDone(lv)}</b> of 20 done</p>
      ${L.d.map((D, d) => {
        const p = planOf(lv, d), k = goalFor(d), A = actionsAt(lv, d, size);
        return `<section class="mb-area" aria-labelledby="mba-${d}"><h3 id="mba-${d}">${esc(DOM_LEAD[d])}<small>${p ? esc(p.topic) : ''}${G[k] ? ` · serves: ${esc(G[k])}` : ''}</small></h3>
          <ul class="mb-acts">${DO_FIRST.map((i) => actHTML(lv, d, i, A[i])).join('')}</ul></section>`;
      }).join('')}
      <p class="mb-row no-print"><button type="button" class="mb-btn" data-print>Print my week</button></p>`;
  }
  if (!lv) return `<h2 class="mb-h2" tabindex="-1">This week</h2>
    <p class="mb-lead">Your first four actions come from Level 01, ${esc(LEVELS4[0].title)}: one in each area of your business.</p>
    <p class="mb-next"><button type="button" class="mb-btn" data-level="1">Start Level 01 →</button></p>`;
  const L = LEVELS4[lv - 1], last = lv === 12 ? lastSunday() : '';
  if (last) return `<h2 class="mb-h2" tabindex="-1">This week</h2>${last}`;
  const goalLine = (d) => {
    const k = goalFor(d), F = DIRECTION4.find((x) => x.k === k);
    return G[k] ? `<b>${esc(G[k])}</b>` : `<button type="button" class="mb-text" data-dirat="${DIRECTION4.indexOf(F)}" data-dirone="1" data-bptab="dir">Write ${esc(F.label.replace('My ', 'your ').replace(' for 12 weeks', ''))}</button>`;
  };
  return `<h2 class="mb-h2" tabindex="-1">This week: 4 things to do</h2>
    <p class="mb-lead">From Level ${pad(lv)}, ${esc(L.title)}. One in each area of your business. Tick each one when it is done.</p>
    <ul class="mb-acts">${L.d.map((D, d) => {
      if (!begun(lv, d)) return `<li class="mb-off"><span class="mb-box" aria-hidden="true"></span><div><p class="mb-meta">${esc(DOM_LEAD[d])}</p><p class="mb-do">Not written yet.</p>
        <p class="no-print"><button type="button" class="mb-text" data-level="${lv}">Write it in Level ${pad(lv)}</button></p></div></li>`;
      const g = gotOf(w, lv, d), day = mbv(lv, d, dayKeyOf(lv, d));
      return `<li${g === 0 ? ' class="mb-on"' : ''}><button type="button" class="mb-box" role="checkbox" aria-checked="${g === 0}" data-mbgot="${lv}:${d}" aria-label="Done: ${plainOf(D.fb[3], w, lv, d).replace(/"/g, '&quot;')}"></button>
        <div><p class="mb-meta">${day ? `${esc(day)} · ` : ''}${esc(DOM_LEAD[d])}</p><p class="mb-do">${fill(D.fb[3], w, lv, d)}</p>
        <p class="mb-sub">Serves: ${goalLine(d)}</p><p class="mb-sub">Done when: <span class="mb-ink">${doneOf(w, lv, d)}</span></p>
        ${g === 1 || g === 2 ? `<p class="mb-sub">${GOT[g]} on Sunday. The smaller step: ${notyetOf(w, lv, d)}</p>` : ''}</div></li>`;
    }).join('')}</ul>
    <p class="mb-row no-print"><button type="button" class="mb-btn" data-print>Print my week</button></p>`;
}

/** The Blueprint (Alexandru, 2 Nov 2026): "the Blueprint is not fillable. It
 *  is filled while they do the work. Before they do the work they can see
 *  the Blueprint, all twelve modules with the chapters and titles, filled only
 *  with what they have accomplished, so it pulls them forward." My Blueprint
 *  opens here. At the top, the plan: twelve levels in three chapters, four
 *  squares each, coloured only when the founder has written that part (and
 *  marked once Sunday says it was done). Under it, every level with its title
 *  and its four parts: the founder's own sentence and result where it is done,
 *  an empty frame that says what fills it where it is not, and the gate where
 *  the level is not open. Nothing here asks a question. */
const AREA_C = ['#8C5A3C', '#4C6B55', '#3E5C78', '#8A6A1F'];
function planGrid(w, now, o = {}) {
  return `<div class="bpx-plan" aria-hidden="true">${CHAPTERS4.map((C) => `<div class="bpx-chp"><p>${esc(C.name)}</p><div class="bpx-lvs">${C.lv.map((i) => {
    const n = i + 1, open = o.example || holds(tierNow(), gateFor(n));
    return `<span class="bpx-l${open ? '' : ' lock'}${n === now ? ' now' : ''}${n === o.fresh ? ' fresh' : ''}"><b>${pad(n)}</b><span class="bpx-q">${[0, 1, 2, 3].map((d) => `<i class="${begun(n, d) ? 'on' : ''}${gotOf(w, n, d) === 0 ? ' did' : ''}" style="--c:${AREA_C[d]}"></i>`).join('')}</span></span>`;
  }).join('')}</div></div>`).join('')}</div>`;
}
/** Your next square (Alexandru, 2 Nov 2026): the first part not yet written,
 *  in order, so the founder always sees exactly what to fill next. */
function nextSquare(st) {
  for (let n = 1; n <= 12; n++) for (let d = 0; d < 4; d++) if (LEVELS4[n - 1] && !begun(n, d)) return { n, d, open: holds(tierNow(), gateFor(n)), waiting: levelState(st, n) === 'waiting' };
  return null;
}
function nextHTML(st) {
  const x = nextSquare(st);
  if (!x) return `<div class="bpx-next all"><span class="bpx-nsq all" aria-hidden="true"></span><p><small>Every square is filled</small><b>Twelve levels, in your own words.</b> Print it, and bring it to your next session.</p></div>`;
  const p = planOf(x.n, x.d), rung = LADDER.find((r) => r.key === gateFor(x.n));
  const btn = !x.open ? `<a class="mb-btn mb-gold" href="${esc(payHref(gateFor(x.n)))}">${MB_LOCK}Open it · ${esc(rung.price)}</a>`
    : x.waiting ? `<button type="button" class="mb-btn mb-gold" data-level="${x.n - 1}">Finish Level ${pad(x.n - 1)} →</button>`
    : `<button type="button" class="mb-btn mb-gold" data-level="${x.n}">Fill it →</button>`;
  return `<div class="bpx-next"><span class="bpx-nsq" style="--c:${AREA_C[x.d]}" aria-hidden="true"></span>
    <p><small>Your next square</small><b>Level ${pad(x.n)} · ${esc(DOM_LEAD[x.d])}</b>${p ? ` ${esc(p.topic)}` : ''}</p><span class="no-print">${btn}</span></div>`;
}
/** A small moment when a level is finished (Alexandru, 2 Nov 2026): its four
 *  squares are filled, and one quiet line says so, once (w.v4.<lv>.w.inbp,
 *  kept beside the welcome's marks, never counted as an answer). */
let bpFresh = 0;
function freshLevel() {
  if (bpFresh) return bpFresh;
  for (let n = 12; n >= 1; n--) {
    if (![0, 1, 2, 3].every((d) => begun(n, d))) continue;
    const key = wkey(n, 'w', 'inbp');
    if (state.work[key]) return 0;
    state.work[key] = '1'; save(); account.touch('work', key, '1');
    bpFresh = n; return n;
  }
  return 0;
}
/** See a finished Blueprint (Alexandru, 2 Nov 2026): Rosa, marked as an
 *  example (AGENTS.md 12), drawn by the same code from her saved answers. */
let bpExample = null, bpExampleWho = '';
function examplePane() {
  const real = state.work;
  state.work = bpExample;
  try {
    return `<div class="bpx-ex" tabindex="-1"><p><b>An example, not a real founder.</b> ${esc(bpExampleWho)} This is her Blueprint after twelve levels: every square filled from her own answers. Yours fills the same way.</p>
      <button type="button" class="mb-btn" data-bpex="0">← Back to my Blueprint</button></div>${bookPane({ example: true })}`;
  } finally { state.work = real; }
}
function bookPane(o = {}) {
  const w = state.work, st = state.stage || 'build', now = weekLevel() || 1, isOpen = (n) => !!o.example || holds(tierNow(), gateFor(n));
  const fresh = o.example ? 0 : freshLevel();
  const parts = LEVELS4.reduce((n, L) => n + [0, 1, 2, 3].filter((d) => begun(L.n, d)).length, 0);
  const levelCard = (L) => {
    const n = L.n, rung = LADDER.find((r) => r.key === gateFor(n)), open = isOpen(n), ls = o.example ? 'done' : levelState(st, n), on = levelBegun(n);
    const tag = !open ? `<span class="mb-tag">${MB_LOCK}${esc(rung.price)}</span>`
      : ls === 'done' ? '<span class="mb-tag mb-done">Written ✓</span>'
      : n === now && on ? '<span class="mb-tag mb-now">This week</span>'
      : on ? '<span class="mb-tag">Started</span>' : '';
    const areas = L.d.map((D, d) => {
      const p = planOf(n, d), g = gotOf(w, n, d), mine = begun(n, d), tk = mine ? takeOf(w, n, d) : null;
      const head = `<p class="bpx-ak"><span>${esc(DOM_LEAD[d])}</span>${p ? ` · ${esc(p.topic)}` : ''}</p>`;
      if (!mine) {
        const why = !open ? `Opens with ${({ session: 'The Boardroom', lab: 'The LAB', hub: 'The HUB', premium: 'The Summit' })[gateFor(n)] || 'the next step'}` : ls === 'waiting' ? `Fills in at Level ${pad(n)}, after Level ${pad(n - 1)}` : `Fills in when you write it in Level ${pad(n)}`;
        return `<li class="bpx-a empty" style="--c:${AREA_C[d]}">${head}<p class="bpx-wait">${why}</p></li>`;
      }
      const twenty = ACTIONS4[`${n}.${d}`] ? [0, 1, 2, 3, 4].filter((i) => actOn(n, d, i)).length : null;
      return `<li class="bpx-a on" style="--c:${AREA_C[d]}">${head}
        <p class="bpx-do">${fill(D.fb[3], w, n, d)}</p>
        <p class="bpx-dw"><b>Done when</b> ${doneOf(w, n, d)}</p>
        <p class="bpx-res">${g === 0 ? '<span class="bpx-did">Done ✓</span>' : g === 1 ? '<span class="bpx-part">Partly</span>' : g === 2 ? '<span class="bpx-not">Not yet</span>' : '<span class="bpx-wk">This week</span>'}${twenty != null ? ` <span class="bpx-n5">${twenty} of 5 actions done</span>` : ''}</p>
        ${tk ? `<details class="bpx-take"><summary>${esc(tk.title)}</summary><ol>${tk.lines.map((l) => `<li>${l}</li>`).join('')}</ol></details>` : ''}
        ${twenty != null ? `<details class="bpx-take bpx-acts"><summary>Its five actions · ${twenty} done</summary><ol class="mb-five">${DO_FIRST.map((i) => { const A = actionsAt(n, d, mbSize())[i], own = i === 2;
          return `<li class="${actOn(n, d, i) ? 'mb-on' : ''}"><b>${A.step}</b> ${own ? fill(D.fb[3], w, n, d) : esc(A.t)}${actOn(n, d, i) ? ' <span class="mb-when">Done ✓</span>' : ''}</li>`; }).join('')}</ol></details>` : ''}</li>`;
    }).join('');
    const foot = !open ? `<p class="no-print bpx-go"><a class="mb-btn mb-gold" href="${esc(payHref(gateFor(n)))}">${MB_LOCK}Open it · ${esc(rung.price)}</a></p>`
      : !on && ls !== 'waiting' ? `<p class="no-print bpx-go"><button type="button" class="mb-btn" data-level="${n}">Open Level ${pad(n)} →</button></p>` : '';
    const built = BUILD4[n] && buildStarted(w, n) ? `<details class="bpx-take bpx-built"><summary>The page you built: ${esc(BUILD4[n].title)}</summary><dl>${buildPage(w, n).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl></details>` : '';
    return `<article class="bpx-lv${on ? ' on' : ''}${open ? '' : ' lock'}${n === now && !o.example ? ' now' : ''}" aria-labelledby="bpx-${n}">
      <header><p class="bpx-num">Level ${pad(n)}</p><h3 id="bpx-${n}">${esc(L.title)}</h3>${tag}</header>
      ${on ? '' : `<p class="bpx-promise"><b>By the end:</b> ${esc(L.promise)}</p>`}
      <ol class="bpx-areas">${areas}</ol>${built}${foot}</article>`;
  };
  const who = (state.me && state.me.name) || '';
  let today = ''; try { today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { /* old browser */ }
  return `${o.example ? '' : `<div class="bpx-ph" aria-hidden="true"><p>The Founder’s Blueprint</p><h2>${esc(who || 'My Blueprint')}</h2><p>Drawn on ${esc(today)}, only from ${who ? esc(who.split(' ')[0]) + '’s' : 'my'} own answers · ${parts ? `Level ${pad(now)} of 12` : 'Level 01 of 12'}</p></div>`}
    <h2 class="mb-h2" tabindex="-1">${o.example ? 'Rosa’s Blueprint' : 'Your Blueprint'}</h2>
    <p class="mb-lead">All twelve levels, from the first day. It fills in only with what ${o.example ? 'she has' : 'you have'} written and done: nothing here is a form.</p>
    ${fresh ? `<p class="bpx-fresh" role="status"><span aria-hidden="true">✓</span> Level ${pad(fresh)} is in your Blueprint.</p>` : ''}
    ${planGrid(w, now, { example: o.example, fresh })}
    ${o.example ? '' : nextHTML(st)}
    <p class="bpx-sum">${o.example ? 'Every square filled, from her own answers.' : parts ? `Every coloured square is a part of your business you have worked out, in your own words.` : 'Every square fills with colour when you write that part in its level. The first four are in Level 01.'}
      ${o.example ? '' : '<button type="button" class="mb-text no-print" data-bpex="1">See a finished Blueprint (an example) →</button>'}</p>
    ${CHAPTERS4.map((C, ci) => `<section class="bpx-ch" aria-labelledby="bpx-c${ci}"><header class="bpx-chh"><p>${esc(C.n)} · Levels ${pad(C.lv[0] + 1)}–${pad(C.lv[C.lv.length - 1] + 1)}</p><h3 id="bpx-c${ci}">${esc(C.name)}</h3><p class="bpx-about">${esc(C.about)}</p></header>
      ${C.lv.map((i) => levelCard(LEVELS4[i])).join('')}</section>`).join('')}
    ${o.example ? '<p class="mb-row no-print"><button type="button" class="mb-btn" data-bpex="0">← Back to my Blueprint</button></p>' : `<p class="mb-row no-print"><button type="button" class="mb-btn" data-print>Print my Blueprint</button><button type="button" class="mb-text" data-bpdoc="1">Every answer, in eight parts</button></p>
    <p class="bpx-tb" aria-hidden="true"><span>The Founder’s Blueprint</span><span>${esc(who)}</span><span>${esc(today)}</span><span>ExploraSelf · Alexandru Cojocari</span></p>`}`;
}

function strongPane() {
  const w = state.work, hi = [], lo = [];
  [0, 1, 2, 3].forEach((d) => {
    let lv = 0;
    for (let n = 12; n >= 1 && !lv; n--) if (begun(n, d) && slideOf(w, n, d) != null) lv = n;
    if (!lv) return;
    const l4 = lines4(w, lv, d), from = `<span>${esc(DOM_LEAD[d])} · Level ${pad(lv)}</span>`;
    if (strong(w, lv, d)) hi.push(`<p>${from}${l4[2][2]}</p>`);
    else lo.push(`<p>${from}${l4[1][2]} <em>Start here: ${l4[3][2]}</em></p>`);
  });
  if (!hi.length && !lo.length) return `<h2 class="mb-h2" tabindex="-1">Strengths</h2>
    <p class="mb-lead">Your strengths show here after your first level. They come only from your own answers.</p>
    <p class="mb-next"><button type="button" class="mb-btn" data-level="1">Start Level 01 →</button></p>`;
  return `<h2 class="mb-h2" tabindex="-1">Strengths</h2>
    <p class="mb-lead">From your own answers, in the latest level of each area.</p>
    <div class="mb-two">
      ${hi.length ? `<div class="mb-list"><h3>You are strong at</h3>${hi.join('')}</div>` : ''}
      ${lo.length ? `<div class="mb-list"><h3>Needs you first</h3>${lo.join('')}</div>` : ''}
    </div>`;
}

function pathPane() {
  const w = state.work, rows = [];
  const taken = (compassRec && compassRec.taken) || [];
  if (taken.length) {
    let at = ''; try { at = new Date(taken[taken.length - 1]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); } catch { /* old browser */ }
    rows.push(['North Star', `The Leader’s North Star, taken${taken.length > 1 ? ` ${taken.length} times` : ''}${at ? `, last on ${esc(at)}` : ''}.`]);
  }
  for (let n = 1; n <= 12; n++) {
    if (!levelBegun(n)) continue;
    const L = LEVELS4[n - 1], t = tally(w, [n]), wr = [0, 1, 2, 3].filter((d) => begun(n, d)).length;
    rows.push([`Level ${pad(n)}`, `${esc(L.title)}: ${wr === 4 ? 'all four areas written' : `${wr} of 4 areas written`}. ${t.n ? `${t.done} of ${t.n} actions done${t.part ? `, ${t.part} partly` : ''}${t.not ? `, ${t.not} not yet` : ''}.` : 'Sunday’s check comes when the next level opens.'}`]);
    const ci = CLOSES[n];
    if (ci != null && mbv(n, 'r', 'carry')) rows.push(['Reading', `${esc(CHAPTERS4[ci].name)}: chapter reading done, one action carried forward.`]);
  }
  // Every action ticked, in the order it was done (the record Alexandru asked for).
  const ticks = [];
  for (const [k, v] of Object.entries(w)) {
    const m = /^w\.v4\.(\d{1,2})\.([0-3])\.a([0-4])$/.exec(k);
    if (!m || !/^\d{4}-\d{2}-\d{2}$/.test(String(v))) continue;
    const lv = +m[1], d = +m[2], i = +m[3], A = actionsAt(lv, d, mbSize())[i];
    if (!A) continue;
    const own = i === 2 && begun(lv, d);
    ticks.push([String(v), `Level ${pad(lv)} · ${esc(DOM_LEAD[d])} · <b>${A.step}</b> ${own ? plainOf(LEVELS4[lv - 1].d[d].fb[3], w, lv, d) : esc(A.t)}`]);
  }
  ticks.sort((a, b) => a[0].localeCompare(b[0]));
  if (!rows.length) return `<h2 class="mb-h2" tabindex="-1">My journey</h2>
    <p class="mb-lead">Your journey starts with Level 01, ${esc(LEVELS4[0].title)}.</p>
    <p class="mb-next"><button type="button" class="mb-btn" data-level="1">Start Level 01 →</button></p>`;
  return `<h2 class="mb-h2" tabindex="-1">My journey</h2>
    <p class="mb-lead">What you have done so far, in order.</p>
    <ol class="mb-tl">${rows.map(([k, v]) => `<li><span class="mb-tlk">${k}</span><span>${v}</span></li>`).join('')}</ol>
    ${ticks.length ? `<h3 class="mb-ch">Done, day by day</h3><ol class="mb-tl">${ticks.map(([d, v]) => `<li><span class="mb-tlk">${esc(dayOf(d))}</span><span>${v}</span></li>`).join('')}</ol>` : ''}`;
}

function blueprintView() {
  if (bpDoc) return blueprintDoc();
  const name = (state.me && state.me.name) || '', lv = weekLevel();
  const pane = bpExample && bpTab === 'book' ? examplePane() : bpTab === 'week' ? weekPane() : bpTab === 'dir' ? dirPane() : bpTab === 'strong' ? strongPane() : bpTab === 'path' ? pathPane() : bookPane();
  return `<section class="mb" aria-labelledby="mb-h"><div class="mb-in">
    <header class="mb-who"><p class="mb-k">My Blueprint</p><h1 id="mb-h">${name ? esc(name) : 'My Blueprint'}</h1>
      <p>${lv ? `Level ${pad(lv)} of 12 · ${esc(LEVELS4[lv - 1].title)} · ${ACTIONS4[`${lv}.0`] ? `${actsDone(lv)} of 20` : `${doneThisWeek(lv)} of 4`} done this week` : 'Twelve levels · it fills in as you go'}</p></header>
    <div class="mb-tabs no-print" role="tablist" aria-label="My Blueprint">${MB_TABS.map(([k, n, ic]) => `<button type="button" role="tab" id="mb-t-${k}" aria-controls="mb-p" aria-selected="${bpTab === k}" tabindex="${bpTab === k ? 0 : -1}" data-bptab="${k}">${ic}<span>${n}</span></button>`).join('')}</div>
    <section class="mb-pane" id="mb-p" role="tabpanel" aria-labelledby="mb-t-${bpTab}">${pane}</section>
    <nav class="mb-links no-print" aria-label="More">
      <a class="mb-ns" href="/northstar/">The Leader’s North Star <span>The reading my team and I use with businesses of every size. Here it’s yours, free. — Alexandru</span></a>
      <button type="button" data-go="work">The programme <span>Level ${pad(lv || 1)}</span></button>
    </nav>
  </div></section>`;
}
/** After a redraw of My Blueprint: the field, the box or the heading gets the focus. */
function mbFocus(sel) {
  const x = (sel && document.querySelector(sel)) || document.getElementById('mb-in') || document.querySelector('.mb-h2');
  if (x) x.focus({ preventScroll: true });
}

function libraryView() {
  const joined = account.joined() || !!state.me;
  // No account yet: the short box (/road3/#join); a download then asks the
  // full account, only what is missing (Alexandru, 6 Nov 2026).
  const hasLab = holds(tierNow(), 'lab'), hasHub = holds(tierNow(), 'hub');
  const dl = '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 20h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const manuals = LIBRARY.manuals.map((m) => `<li class="lib-man${m.k === state.stage ? ' lib-yours' : ''}">
      <span class="bk3 bk3-man bk3-${m.k}" aria-hidden="true"><span class="bk3-cover"><small>The Founder’s Blueprint</small><b>${esc(STAGES[m.k].n)}</b></span><i class="bk3-spine"></i></span>
      <span class="lib-mtext"><b>${esc(m.n)}</b><small>${esc(m.sub)} · ${m.pages} pages${m.k === state.stage ? ' · your stage' : ''}</small></span>
      ${joined ? `<a class="lib-btn" href="${esc(account.libraryHref(m.k))}">${dl}Download PDF</a>` : `<a class="lib-btn" href="/road3/#join">Make your free account to download</a>`}
    </li>`).join('');
  const card = (b) => (b.soon
    ? `<li class="lib-book lib-soon">${b.cover ? `<span class="bk3"><img src="${esc(b.cover)}" alt="${esc(b.n)} cover" loading="lazy"><i class="bk3-spine"></i></span>` : '<span class="bk3" aria-hidden="true"><span class="bk3-cover bk3-blank">In preparation</span></span>'}
        <span class="lib-btext"><span class="lib-kick">${esc(b.kicker)}</span><b>${esc(b.n)}</b><small>${esc(b.sub)}</small><em>In preparation</em></span></li>`
    : b.hub
    // HUB material (Alexandru, 4 Nov 2026): the cover with its note under it,
    // the free first pages and its own page for everyone; "Download your copy"
    // for The HUB and The Summit (functions/api/library.js checks again).
    ? `<li class="lib-book lib-hubbook"><span class="lib-hubcov"><a class="bk3${b.tall ? ' bk3-tall' : ''}" href="${esc(b.page)}" target="_blank" rel="noopener" aria-label="${esc(b.n)}: see what’s inside"><img src="${esc(b.cover)}" alt="${esc(b.n)} cover" loading="lazy"><i class="bk3-spine"></i></a><em class="lib-hubnote">${esc(HUB_NOTE)}</em></span>
        <span class="lib-btext"><span class="lib-kick">${esc(b.kicker)}</span><b>${esc(b.n)}</b><small>${esc(b.sub)}</small>
        <span class="lib-acts">${joined && hasHub ? `<a href="${esc(account.libraryHref(b.k))}">${dl}Download your copy</a>` : ''}<a href="${esc(b.preview)}" target="_blank" rel="noopener">Read the first pages →</a><a href="${esc(b.page)}" target="_blank" rel="noopener">See what’s inside →</a></span></span></li>`
    : `<li class="lib-book"><span class="bk3${b.tall ? ' bk3-tall' : ''}"><img src="${esc(b.cover)}" alt="${esc(b.n)} cover" loading="lazy"><i class="bk3-spine"></i></span>
        <span class="lib-btext"><span class="lib-kick">${esc(b.kicker)}</span><b>${esc(b.n)}</b><small>${esc(b.sub)}</small>
        <span class="lib-acts"><a href="${esc(b.preview)}" target="_blank" rel="noopener">Preview the first pages →</a>
        ${joined ? `<a href="${esc(account.libraryHref(b.k))}">${dl}Free digital copy</a>` : `<a class="lib-link" href="/road3/#join">Make your free account for the free digital copy</a>`}
        ${b.online ? `<a class="lib-online" href="${esc(b.online)}">Fill it in online →</a>` : ''}
        ${b.print === false ? '' : `<span class="lib-print">${b.print ? `<a href="${esc(b.print)}" target="_blank" rel="noopener">Print edition ↗</a>` : 'Print edition coming'}</span>`}</span></span></li>`);
  const books = LIBRARY.books.map(card).join('');
  const growth = (LIBRARY.growth || []).map(card).join('');
  const L = LIBRARY.lab;
  return `<section class="band qband lib"><div class="wrap">
    <p class="eyebrow">${compass} Library &amp; working materials</p>
    <h1 class="qh">Everything that goes with the work</h1>
    <p class="sec-lede">Your plan and your planner come first: the action, week by week. The three manuals are the programme on paper, to print and fill by hand. The books sit alongside it — the thinking the levels are built from.${joined ? '' : ' A free account opens every free download.'}</p>
    ${growth ? `<h2 class="lib-h">Your plan and your planner</h2>
    <ul class="lib-books">${growth}</ul>` : ''}
    <h2 class="lib-h">The Founder’s Blueprint · the manuals</h2>
    <ul class="lib-mans">${manuals}</ul>
    <h2 class="lib-h">The books</h2>
    <ul class="lib-books">${books}</ul>
    <div class="lib-lab"><div><span class="lib-kick">With the LAB</span><b>${esc(L.n)}</b><small>${esc(L.sub)} · ${L.pages} pages</small></div>
      ${hasLab
        // Theirs with their step (3 Nov 2026, the whole check): the download
        // itself (functions/api/workbook.js), not the page that sells the LAB.
        ? `<a class="lib-btn" href="${esc(account.workbookHref())}">Download your workbook</a>`
        : `<a class="lib-btn" href="${esc(L.url)}" target="_blank" rel="noopener">See the LAB ↗</a>`}</div>
  </div></section>`;
}

/** After joining: the library just opened. Shown until opened or closed. */
const BANNER_KEY = 'ftb-library-banner';
const bannerSeen = () => { try { return localStorage.getItem(BANNER_KEY) === 'seen'; } catch { return true; } };
const bannerDone = () => { try { localStorage.setItem(BANNER_KEY, 'seen'); } catch { /* private mode */ } };
/** Shown once (Alexandru, 3 Nov 2026): the first time, for this visit only. */
let libThisVisit = false;
function libBanner() {
  if (!(state.me || account.joined())) return '';
  if (!libThisVisit) { if (bannerSeen()) return ''; libThisVisit = true; bannerDone(); }
  return `<div class="libban" role="status">
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.2 5.6L20 9l-4.5 3.8L17 19l-5-3.2L7 19l1.5-6.2L4 9l5.8-.4z" fill="none" stroke="#B4975F" stroke-width="1.6" stroke-linejoin="round"/></svg>
    <div><b>Your library just got fuller.</b><p>With your free account: the North Star’s Massive Growth Plan, The Leader’s Growth Planner 2027, the three Founder’s Blueprint manuals, Worth Building (32 leadership frameworks) and A New Way of Winning (12 principles). Built to Lead and The Founder’s Growth Manual: ${esc(HUB_NOTE[0].toLowerCase() + HUB_NOTE.slice(1))}.</p></div>
    <button type="button" class="cta" data-go="library">Open my library →</button>
    <button type="button" class="x" data-banner="close" aria-label="Close"><svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>
  </div>`;
}

/** The North Star, inside the programme: for the founder's first five visits to
 *  the programme, a banner that sends them back to the North Star for feedback
 *  and material. Closing it ends it early. Counted once per page load. */
const CB_KEY = 'ftb-compass-banner', CB_TIMES = 1;
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
    ? `<button type="button" data-go="home" ${view === 'home' ? 'aria-current="page"' : ''}>Your Base Camp${unread ? `<span class="tdot" aria-label="${unread} unread ${unread === 1 ? 'note' : 'notes'}"></span>` : ''}</button><button type="button" data-go="work" ${view === 'work' ? 'aria-current="page"' : ''}>The programme</button><button type="button" data-go="blueprint" ${view === 'blueprint' ? 'aria-current="page"' : ''}>My Blueprint</button><button type="button" data-go="library" ${view === 'library' ? 'aria-current="page"' : ''}>Library</button><a class="ttools" href="/tools/">${ICONS.toolkit}Growth Toolkit</a><button type="button" data-go="ask" ${view === 'ask' ? 'aria-current="page"' : ''}>Ask Alexandru${answers ? `<span class="tdot" aria-label="${answers} new ${answers === 1 ? 'answer' : 'answers'}"></span>` : ''}</button>${holds(tierNow(), 'session') ? '' : `<a class="tbook" href="${esc(DISCOVERY)}">${bookIcon}Book a free discovery call</a>`}`
    : '';
}

/** Back and Forward walk Base Camp (Alexandru, 2 Nov 2026; rule 13): every
 *  change of view, or of level, is a step in the browser's history, so Back
 *  goes to the last place inside Base Camp instead of leaving it. */
const HASHES = { home: '#home', blueprint: '#blueprint', library: '#library', ask: '#ask', launchpad: '#launchpad' };
function remember() {
  const h = view === 'work' ? `#programme-${level}` : HASHES[view];
  if (!h || location.hash === h) return;
  try { history.pushState(null, '', location.pathname + location.search + h); } catch { /* old browser */ }
}
addEventListener('popstate', () => {
  if (!account.joined()) return;
  const h = location.hash, q = /^#programme-(\d{1,2})-q$/.exec(h);
  // Forward into the layer opens it again; Back out of it closes it.
  if (q && view === 'work' && level === +q[1]) { if (!fm) { fm = true; document.body.classList.add('fmopen'); drawBook(); } return; }
  if (fm && !q) { fmShut(); if (h === `#programme-${level}` && view === 'work') return; }
  const m = /^#programme-(\d{1,2})(?:-q)?$/.exec(h);
  if (m) { level = Math.min(12, Math.max(1, +m[1])); dom = 'self'; qi = null; view = 'work'; }
  else view = entry({ joined: true, old: oldEntrance, hash: h });
  fm = !!q && view === 'work';
  bpDoc = false; dirAt = null; dirBack = false;
  document.body.classList.remove('railopen', 'crownopen', 'stepsopen');
  render(); window.scrollTo({ top: 0, behavior: 'instant' });
  if (view === 'ask') openAsk();
});

/** The top bar's height, so the always-on level bar sits right under it. */
function topbar() {
  const t = document.querySelector('.top');
  if (t) document.documentElement.style.setProperty('--topbar', `${Math.round(t.getBoundingClientRect().height)}px`);
}
addEventListener('resize', topbar, { passive: true });
function render() {
  const st = state.stage || 'build';
  document.body.classList.toggle('inwork', view === 'work');
  document.body.classList.toggle('mbview', view === 'blueprint' && !bpDoc);
  document.body.classList.remove('crownopen', 'stepsopen');
  drawNav();
  topbar();
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
  if (view !== 'work') fm = false;
  document.body.classList.toggle('fmopen', view === 'work' && fm && writable(st));
  fmInert(view === 'work' && fm && writable(st));
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
  // Focus mode: open, close, and Done ✓ (at the end of a domain, the next
  // domain is where the founder picks up).
  if (b.hasAttribute('data-fmopen')) { fmOpen(b.dataset.fmopen ? +b.dataset.fmopen : null); return; }
  if (b.hasAttribute('data-fmclose')) { fmClose(); return; }
  if (b.dataset.fmdone) { if (b.dataset.fmdone === 'next') moveQ(1); fmClose(); return; }
  if (b.dataset.qt || b.dataset.qx) {
    const alt = !!b.dataset.qx, [t, k, i] = (b.dataset.qt || b.dataset.qx).split(':');
    keepAsk(`${t}:${k}`, alt ? `x${i}` : +i);
    drawBook(false);
    const x = document.querySelector(`.cw-o[data-q${alt ? 'x' : 't'}="${b.dataset.qt || b.dataset.qx}"]`); if (x) x.focus({ preventScroll: true });
    // Level 04 shows what Level 01 said: it waits to be read.
    if (!(t === 'w' && askOf(level, k) && askOf(level, k).was)) fmAuto();
    return;
  }
  if (b.dataset.type) {
    const kind = stepAt(qi)[1], was = sizeOf(state.work), order = TYPES4.map((x) => x.k);
    keepWhere('stage', SIZE_STAGE[b.dataset.type]);
    if (kind === 'still') {
      keep4('w', 'stage', SIZE_STAGE[b.dataset.type]);
      movedUp = order.indexOf(b.dataset.type) > order.indexOf(was) && was ? was : null;
    }
    drawBook(false);
    const x = document.querySelector(`.cw-o[data-type="${b.dataset.type}"]`); if (x) x.focus({ preventScroll: true });
    if (kind === 'still' && !movedUp) fmAuto();
    return;
  }
  if (b.dataset.switch) { keepWhere('stage', SIZE_STAGE[b.dataset.switch]); render(); return; }
  if (b.dataset.keepsize) { keepWhere('keep', b.dataset.keepsize); render(); return; }
  if (b.hasAttribute('data-print')) { document.querySelectorAll('.mb details').forEach((x) => { x.open = true; }); window.print(); return; }
  if (b.dataset.lpdone) {
    if (needsAccount()) { const k = b.dataset.lpdone; askAccount(() => { const x = document.querySelector(`[data-lpdone="${k}"]`); if (x) x.click(); }); return; }
    const on = !state.work[b.dataset.lpdone], v = on ? new Date().toISOString().slice(0, 10) : '';
    state.work[b.dataset.lpdone] = v; save(); account.touch('work', b.dataset.lpdone, v);
    b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Done ✓' : 'Mark it done';
    const li = b.closest('.lpo-a'); if (li) li.classList.toggle('on', on);
    return;
  }
  if (b.dataset.days === 'open') { daysOpen(); return; }
  if (b.dataset.days === 'yes') { daysYes(); return; }
  if (b.dataset.days === 'close') { daysShut(); return; }
  if (b.dataset.intro != null || b.dataset.sq != null) { const at = +(b.dataset.intro ?? b.dataset.sq); if (at >= 0) { document.body.classList.remove('stepsopen'); fmOpen(at); } return; }
  if (b.dataset.qd) { document.body.classList.remove('stepsopen'); fmOpen(steps().findIndex((x) => x[0] === +b.dataset.qd && x[1] !== 'got')); return; }
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
    if (+b.dataset.got === 0) fmAuto();
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
  if (b.dataset.v4small != null) {
    const d = +b.dataset.v4small;
    keep4(d, 'small', smallOf(state.work, level, d) ? '' : '1');
    const sb = $('#cwsmall'); if (sb) sb.innerHTML = smallHTML(d);
    const x = document.querySelector('[data-v4small]'); if (x) x.focus({ preventScroll: true });
    return;
  }
  if (b.dataset.v4t) {
    const d = stepAt(qi)[0], st = state.stage || 'build', had = answered(st, level, dom);
    keep4(d, 't', +b.dataset.v4t);
    drawBook(false);
    const x = document.querySelector(`.cw-o[data-v4t="${b.dataset.v4t}"]`); if (x) x.focus({ preventScroll: true });
    if (answered(st, level, dom) > had) M.answered(answered(st, level, dom));
    refreshRail();
    if (!tapReply(level, d, +b.dataset.v4t)) fmAuto();
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
  // My Blueprint: the tabs, My direction one field at a time, This week's ticks.
  if (b.dataset.dirat != null) {
    bpTab = 'dir'; bpDoc = false; dirBack = !!b.dataset.dirone;
    dirAt = b.dataset.dirat === 'list' ? -1 : +b.dataset.dirat;
    if (dirAt < 0) dirBack = false;
    render(); mbFocus(); return;
  }
  if (b.dataset.dirskip != null) {
    const i = +b.dataset.dirskip, D = directionOf(state.work), nx = DIRECTION4.findIndex((x, j) => j > i && !D[x.k]);
    dirAt = nx < 0 ? -1 : nx; dirBack = false;
    render(); mbFocus(); return;
  }
  if (b.dataset.bptab) { bpTab = b.dataset.bptab; bpDoc = false; bpExample = null; dirAt = null; dirBack = false; render(); mbFocus(`#mb-t-${bpTab}`); return; }
  // Your direction, again: it still holds (saved, and on), or sharpen it in My direction.
  if (b.dataset.dirlook) {
    const edit = b.dataset.dirlook === 'edit';
    keep4('r', 'dir', `${edit ? 'edit' : 'kept'} ${isoToday()}`);
    if (!edit) { drawBook(false); const x = document.querySelector('[data-dirlook="keep"]'); if (x) x.focus({ preventScroll: true }); fmAuto(); return; }
    fmShut();
    bpDoc = false; bpExample = null; bpTab = 'dir'; dirBack = false;
    dirAt = DIRECTION4.some((F) => directionOf(state.work)[F.k]) ? -1 : 0;
    view = 'blueprint'; render(); remember(); window.scrollTo({ top: 0, behavior: 'instant' }); mbFocus();
    return;
  }
  if (b.dataset.bpex) {
    if (b.dataset.bpex === '0') { bpExample = null; render(); mbFocus('.mb-h2'); return; }
    import('./blueprint-example.js').then((m) => { bpExample = m.EXAMPLE; bpExampleWho = m.EXAMPLE_WHO; bpTab = 'book'; render(); mbFocus('.bpx-ex'); }).catch(() => {});
    return;
  }
  if (b.dataset.bpdoc) { bpDoc = b.dataset.bpdoc === '1'; render(); window.scrollTo({ top: 0, behavior: 'instant' }); return; }
  if (b.dataset.mbact) {
    const [lv, d, i] = b.dataset.mbact.split(':').map(Number), on = actOn(lv, d, i);
    if (needsAccount(lv)) { askAccount(() => { const x = document.querySelector(`[data-mbact="${lv}:${d}:${i}"]`); if (x) x.click(); }); return; }
    keep4(d, `a${i}`, on ? '' : isoToday(), lv);
    if (i === 2) keep4(d, 'got', on ? '' : 0, lv);
    render(); mbFocus(`[data-mbact="${lv}:${d}:${i}"]`); return;
  }
  if (b.dataset.mbsize) {
    if (sizeOf(state.work) !== b.dataset.mbsize) keepWhere('stage', SIZE_STAGE[b.dataset.mbsize]);
    render(); mbFocus(`[data-mbsize="${b.dataset.mbsize}"]`); return;
  }
  if (b.dataset.mbgot) {
    const [lv, d] = b.dataset.mbgot.split(':').map(Number);
    if (needsAccount(lv)) { askAccount(() => { const x = document.querySelector(`[data-mbgot="${lv}:${d}"]`); if (x) x.click(); }); return; }
    keep4(d, 'got', gotOf(state.work, lv, d) === 0 ? '' : 0, lv);
    render(); mbFocus(`[data-mbgot="${lv}:${d}"]`); return;
  }
  if (b.dataset.go === 'blueprint') { bpDoc = false; bpExample = null; dirAt = null; dirBack = false; if (b.dataset.bpto) bpTab = b.dataset.bpto; }
  if (b.dataset.go === 'library') bannerDone();
  if (b.dataset.go) {
    view = b.dataset.go; document.body.classList.remove('railopen'); render(); remember();
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
    render(); remember(); window.scrollTo({ top: 0, behavior: 'instant' }); return;
  }
  if (b.dataset.dom) { dom = b.dataset.dom; qi = null; redrawModule(); return; }
});

/* My Blueprint's tabs: the arrow keys, Home and End move between them. */
// The 12 Days pop-up: Esc closes it.
document.addEventListener('keydown', (e) => {
  const box = document.getElementById('daysbox');
  if (e.key === 'Escape' && box && !box.hidden) { e.stopImmediatePropagation(); daysShut(); }
}, true);
document.addEventListener('keydown', (e) => {
  const t = e.target && e.target.closest && e.target.closest('.mb-tabs [role="tab"]');
  if (!t || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault();
  const n = MB_TABS.length, i = MB_TABS.findIndex(([k]) => k === t.dataset.bptab);
  const j = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (i + (e.key === 'ArrowRight' ? 1 : n - 1)) % n;
  bpTab = MB_TABS[j][0]; dirAt = null; dirBack = false; render(); mbFocus(`#mb-t-${bpTab}`);
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
    if (fm) { e.preventDefault(); fmClose(); return; }
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
  if (/^[1-9]$/.test(e.key) && ['wask', 'where', 'you', 'still', 'tap', 'got', 'day', 'carry', 'carryday', 'dirlook', 'bday'].includes(stepAt(qi)[1]) && !slideAt(level, stepAt(qi)) && t.tagName !== 'INPUT') {
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

/** ?next= on the sign-in page (the pay page sends founders here to sign in):
 *  after signing in they go back there. A path on this site only. */
const nextAfterSignin = () => { try { return account.safeNext(new URLSearchParams(location.search).get('next')); } catch { return ''; } };
/** Signed in on the sign-in page: back to where they came from, or home. */
function signedInHere() {
  const nx = nextAfterSignin();
  if (nx) { location.href = nx; return; }
  view = 'home'; try { history.replaceState(null, '', '/ground-plan/#home'); } catch { /* old browser */ } comeHome();
}

/** "Continue with Google" on the sign-in page (google.js): signed in, or a new
 *  free account, then Your Base Camp, like the password sign-in. */
function mountGoogle() {
  const el = document.querySelector('#signinform .g-slot');
  if (!el) return;
  import('./google.js').then((g) => g.mount(el, { source: 'home',
    onDone: () => signedInHere(),
    onError: (m) => { const msg = $('#si-msg'); if (msg) msg.textContent = m; } })).catch(() => {});
}

/** No account for this email (Alexandru, 2 Nov 2026): say so on the spot,
 *  with the free account form one tap away, the email already in it. */
function noAccountHere(email, text) {
  const msg = $('#si-msg');
  if (msg) msg.innerHTML = `${esc(text || `There’s no account for ${email} yet.`)} <a class="si-make" href="${esc(account.joinHref(email, nextAfterSignin() || '/ground-plan/'))}">Make my free account →</a>`;
}

async function sendSigninLink() {
  const msg = $('#si-msg'), email = ($('#si-email') || {}).value || '';
  const say = (t) => { if (msg) msg.textContent = t; };
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email.trim())) return say('Type your email first, then tap this again.');
  try { const r = await account.signinLink(email.trim(), 'start', true, nextAfterSignin() || '/ground-plan/'); if (r.noAccount) noAccountHere(email.trim(), r.message); else say(r.message); }
  catch (ex) { say(ex && ex.message && !/fetch|network|load failed/i.test(ex.message) ? ex.message : 'We could not send a link just now. Try again in a minute.'); }
}

document.addEventListener('submit', async (e) => {
  const f = e.target;
  // My direction: one field, saved to the device first, then to the account.
  if (f.dataset && f.dataset.dirform != null) {
    e.preventDefault();
    const i = +f.dataset.dirform, inp = $('#mb-in'), v = inp ? inp.value.trim().slice(0, 300) : '';
    if (!v) { const m = $('#mb-err'); if (m) m.textContent = 'Write one line, or skip it for now.'; if (inp) inp.focus(); return; }
    const keepDir = () => {
      const key = `w.v4.dir.${DIRECTION4[i].k}`;
      state.work[key] = v; save(); account.touch('work', key, v);
      const D = directionOf(state.work), nx = DIRECTION4.findIndex((x, j) => j > i && !D[x.k]);
      dirAt = dirBack || nx < 0 ? -1 : nx; if (dirAt < 0) dirBack = false;
      render(); mbFocus();
    };
    if (needsAccount()) { askAccount(keepDir); return; }
    keepDir(); return;
  }
  if (f.id === 'signinform') {
    e.preventDefault();
    const msg = $('#si-msg'), email = $('#si-email').value.trim(), pw = $('#si-pw').value;
    const say = (t) => { msg.textContent = t; };
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) return say('That email does not look complete.');
    if (!pw) return say('Type your password, or use “Email me a sign-in link”.');
    try { await account.login(email, pw); signedInHere(); }
    catch (ex) {
      if (ex && ex.data && ex.data.noAccount) return noAccountHere(email, ex.message);
      say(ex && ex.message && !/fetch|network|load failed/i.test(ex.message) ? ex.message : 'We could not reach the account service just now.');
    }
    return;
  }
  if (f.id === 'refundform') {
    e.preventDefault();
    const msg = $('#rf-msg'), pick = f.querySelector('input[name="rf-step"]:checked'), name = $('#rf-name').value.trim(), email = $('#rf-email').value.trim();
    const say = (t) => { msg.textContent = t; };
    if (!pick) return say('Choose the programme you paid for.');
    if (!name) return say('Write your name.');
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) return say('Write the email you paid with.');
    const go = f.querySelector('button[type="submit"]'); go.disabled = true; say('Sending…');
    try { await account.refund({ step: pick.value, name, email }); refundSent = email; render(); const s = document.querySelector('.rf-sent'); if (s) s.focus({ preventScroll: false }); }
    catch (ex) { go.disabled = false; say(ex && ex.message && !/fetch|network|load failed/i.test(ex.message) ? ex.message : 'It did not send. Try again in a minute.'); }
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
  // The elephant in the room and the door: their sliders save as they move.
  const qs = e.target.closest('input[data-qs]');
  if (qs) {
    const [t, k] = qs.dataset.qs.split(':'), Q = t === 'w' ? askOf(level, k) : WHERE4.find((x) => x.k === k), n = +qs.value;
    keepAsk(qs.dataset.qs, n);
    qs.style.setProperty('--p', `${(n - Q.s.min) / (Q.s.max - Q.s.min) * 100}%`);
    const big = $('#cwbig'); if (big) big.textContent = qShown(Q.s, n);
    const box = qs.closest('.cw-slide'); if (box) box.classList.remove('cw-off');
    document.querySelectorAll('.leaf-r [data-qx]').forEach((x) => x.setAttribute('aria-pressed', 'false'));
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
    const du = +v.dataset.v4u;
    sureMoved.add(`${level}.${du}`);
    if (n >= SMALL_UNDER && smallOf(state.work, level, du)) keep4(du, 'small', '');
    const sb = $('#cwsmall'); if (sb) sb.innerHTML = smallHTML(du);
    return;
  }
  if (v.dataset.v4s != null) {
    const d = +v.dataset.v4s, D = LEVELS4[level - 1].d[d], n = +v.value;
    keep4(d, 's', n);
    v.style.setProperty('--p', `${(n - D.s.min) / (D.s.max - D.s.min) * 100}%`);
    const big = $('#cwbig'), wd = $('#cwword');
    if (big) big.textContent = shown(D.s, n);
    if (wd) wd.textContent = D.s.raw ? '' : wordOf(D.s, n);
    const cost = $('#cwcost'); if (cost) cost.innerHTML = replyHTML('What it costs', slideReply(level, d, n));
  } else {
    const [d, k] = v.dataset.v4f.split('.');
    keep4(d === 'r' || d === 'b' ? d : +d, k, v.value);
    // The sentence above fills in as the founder types; nothing redraws.
    const f = document.querySelector(`.cw-f[data-fk="${k}"]`);
    if (f) { f.textContent = v.value.trim() || (fieldsOf(LEVELS4[level - 1].d[+d] || { f: [] }).find((x) => x[0] === k) || [0, ''])[1]; f.classList.toggle('has', !!v.value.trim()); }
    const chk = $('#cwchk'); if (chk && d !== 'r' && d !== 'b') chk.innerHTML = checkHTML(+d, k);
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
      state.openAll = !!r.me.openAll;
      hasPassword = !!r.me.hasPassword;
      signupType = r.me.signupType || null;
      missing = Array.isArray(r.me.missing) ? r.me.missing.filter((k) => ['company', 'interest', 'industry', 'password'].includes(k)) : [];
      owned = Array.isArray(r.me.products) ? r.me.products : [];
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
  else askPaid();
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
