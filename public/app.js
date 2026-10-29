// The Founder's Blueprint — the programme.
//
// Three screens: the entrance (diagnostic), the map (twelve levels), and a
// level (four domains, seven steps each). A locked level opens its gate
// instead of nothing, and the gate says plainly what opens it.
//
// Answers save to the device first, and to the account when the founder has
// one. Nothing is asserted about a payment or a subscription.

import { DOMAINS, SEVEN, STAGES, WEEKS, LADDER, LEVELS, DIAGNOSTIC, SECTIONS, JOURNEY,
  gateFor, levelFor, isWritten, weekTitle, videoFor, nextGain, holds, referee,
  LEAD, BOOKING, groundPlan, LIBRARY } from './content.js';
import { FW_BUILD } from './fw-build.js';
import { FW_GROW } from './fw-grow.js';
import { FW_SCALE } from './fw-scale.js';
import { result as fwResult } from './frameworks.js';
import { report } from './feedback.js';
import * as account from './account.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEY = 'ftb-v1';

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } };

let state = Object.assign({ stage: '', scores: null, answers: {}, work: {}, diag: {}, tier: 'free', me: null }, load());
if (!state.work) state.work = {};
// 'quiz' → 'join' → 'read' → 'work'. The landing page at / sells it; this
// page starts at the questions and never shows the reading before the join.
// A returning founder lands on their Ground Plan until they have started writing,
// then back where the work is.
let view = !state.stage ? 'quiz' : (state.me || account.joined() ? (Object.keys(state.answers || {}).length ? 'work' : 'read') : 'join');
// /start#library opens the library for anyone who has joined.
try { if (location.hash === '#library' && (state.me || account.joined())) view = 'library'; } catch { /* no location */ }
let level = 1, dom = 'self';

const compass = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2.5 21.5 12 12 21.5 2.5 12 12 2.5Z"/><path d="m12 5.7 2 4.3 4.3 2-4.3 2-2 4.3-2-4.3-4.3-2 4.3-2 2-4.3Z" fill="currentColor" stroke="none"/></svg>';

// ── Progress ─────────────────────────────────────────────────────────────────
const aKey = (st, lv, dk, i) => `${st}.${lv}.${dk}.${i}`;

// ── Worksheets ───────────────────────────────────────────────────────────────
// A worksheet belongs to one domain of one level and sits under the clarity
// point it serves. Entries are kept apart from the written answers, so a level
// still closes on the twenty-eight and never on arithmetic.
const SHEETS = { build: FW_BUILD, grow: FW_GROW, scale: FW_SCALE };
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

// ── The entrance ─────────────────────────────────────────────────────────────
// Three screens, in this order, and never out of it. The ten questions get a
// screen to themselves, because a diagnostic finishes far more often when it
// is the only thing on the page. Then we ask who they are. Then — and only
// then — the reading. The landing page at / does the selling; by the time a
// founder arrives here they have already decided to find out.

/** Have the nine been answered? */
function diagDone() {
  return Object.keys(state.diag).length >= DIAGNOSTIC.length;
}

/** Work out the stage, the thin domain and the four scores, and keep them.
 *  Runs the moment the ninth answer lands, so the join can carry the verdict
 *  up with it even though the founder has not seen the reading yet. */
function settle() {
  const score = { self: 0, people: 0, work: 0, market: 0 };
  DIAGNOSTIC.forEach((q, i) => { if (score[q.d] !== undefined) score[q.d] += Number(state.diag[i]) || 0; });
  const said = state.diag[DIAGNOSTIC.findIndex((q) => q.d === 'stage')];
  const want = state.diag[DIAGNOSTIC.findIndex((q) => q.d === 'want')];
  if (!said || !want) return null;

  const r = referee({ said, want, score });
  state.stage = r.assigned;
  state.scores = {}; DOMAINS.forEach((d) => state.scores[d.k] = Math.round(score[d.k] / 4 * 100));
  state.referee = { kind: r.kind, said, want, assigned: r.assigned, thin: r.thin };
  state.raw = score;
  save();
  return r;
}

/** Rebuild the reading from what was settled earlier, with no side effects. */
function reading() {
  if (!state.referee) return settle();
  const { said, want } = state.referee;
  const score = state.raw || { self: 0, people: 0, work: 0, market: 0 };
  return referee({ said, want, score });
}

// ── Screen one: the ten questions, alone ────────────────────────────────────
function quizView() {
  const done = Object.keys(state.diag).length, need = DIAGNOSTIC.length;
  return `${acctPlans ? `<div class="gp">${plansCard()}</div>` : ''}<section class="band qband"><div class="wrap narrow">
    <a class="backlink" href="/">← Back</a>
    <p class="eyebrow">${compass} The entrance</p>
    <h1 class="qh">Let’s find where you actually stand</h1>
    <p class="sec-lede">Answer as last week actually went, not as you meant it to go — nobody grades this. It decides which stage you are in, which of the four domains is costing you most, and which level you start on. Two minutes.</p>
    <div class="qcount" role="status"><span class="qbar"><i style="width:${Math.round(done / need * 100)}%"></i></span>
      <span class="qnum">${done} of ${need} answered</span></div>
    <div class="quiz">${DIAGNOSTIC.map((q, i) => `<div class="q${state.diag[i] !== undefined ? ' got' : ''}">
      <p class="dl">${esc(q.label)}</p><h4><span class="qi">${i + 1}</span>${esc(q.q)}</h4>
      <div class="opts">${q.o.map((o) => `<button class="opt" type="button" aria-pressed="${state.diag[i] === o[1]}" data-diag="${i}" data-val="${esc(String(o[1]))}">${esc(o[0])}</button>`).join('')}</div>
    </div>`).join('')}</div>
    <div id="resultHost"></div>
  </div></section>`;
}

/** The foot of the quiz: nothing until all ten are in, then the way on. */
function quizFoot() {
  if (!diagDone()) {
    const left = DIAGNOSTIC.length - Object.keys(state.diag).length;
    return `<p class="qleft">${left} to go, and your Ground Plan is drawn.</p>`;
  }
  return `<div class="qdone">
    <p class="eyebrow">${compass} All ten answered</p>
    <h3>Your Ground Plan is drawn</h3>
    <p>It shows the stage you are actually in, which of the four is costing you most, and your first three moves. ${account.joined() || state.me ? '' : 'Tell us where to keep it and it opens.'}</p>
    <button class="cta" data-go="${account.joined() || state.me ? 'read' : 'join'}">${account.joined() || state.me ? 'See my Ground Plan →' : 'See where I stand →'}</button>
  </div>`;
}

// ── Screen two: who are you ──────────────────────────────────────────────────
function joinView() {
  return `<section class="band qband"><div class="wrap narrow">
    <button class="backlink" type="button" data-go="quiz">← Back to the questions</button>
    <p class="eyebrow">${compass} Ten of ten</p>
    <h1 class="qh">Where shall we send your Ground Plan?</h1>
    <p class="sec-lede">It is drawn and waiting on the other side of this form. An account also lets your work follow you from this screen to your phone — and lets Alexandru and the team read what you wrote before you ever speak to them.</p>
    <form class="joinbox bare" id="joinbox" novalidate>
      <div class="joinrow">
        <label><span>First name</span><input id="jf" name="fname" autocomplete="given-name" required></label>
        <label><span>Last name</span><input id="jl" name="lname" autocomplete="family-name" required></label>
        <label><span>Email</span><input id="je" name="email" type="email" autocomplete="email" required></label>
        <label><span>Your business</span><input id="jc" name="company" autocomplete="organization" required></label>
        <label><span>Phone</span><input id="jp" name="phone" type="tel" autocomplete="tel" required></label>
      </div>
      <button class="cta" type="submit" id="jgo">Open my Ground Plan →</button>
      <p class="joinerr" id="jerr" hidden></p>
      <p class="savenote">Free, and the first three levels stay free. No card, now or later.</p>
    </form>
  </div></section>`;
}

// ── Screen three: the reading ────────────────────────────────────────────────
function readView() {
  const r = reading();
  if (!r) return quizView();
  const gp = groundPlan(state.diag, r);
  const first = state.me ? state.me.name.split(' ')[0] : '';
  const st = r.assigned;
  const N = ['None', 'One', 'Two', 'Three'];
  const promise = (n) => {
    const L = (LEVELS[st] || {})[n];
    const p = L && L.promise ? L.promise.split(/(?<=\.)\s+(?=[A-Z])/)[0] : '';
    return p;
  };

  const told = gp.answers.map((a) => `<div class="gp-dom">
      <div class="gp-dl"><span style="color:var(--${a.k})">${esc(a.n)}</span><span>${a.score} / 4${a.k === r.thin ? ' · thinnest' : ''}</span></div>
      <div class="gp-track"><i style="width:${a.score * 25}%;background:var(--${a.k})"></i></div>
      <p class="gp-said">${a.said.map((t) => `“${esc(t)}”`).join(' · ')}</p>
    </div>`).join('');

  const costs = gp.costs.length
    ? `<h2 class="gp-h">${N[gp.costs.length]} of your answers ${gp.costs.length === 1 ? 'has' : 'have'} a price. <em>You are paying it every week.</em></h2>
      <div class="gp-costs">${gp.costs.map((c) => `<div class="gp-cost">
        <span class="gp-ck gp-${c.k}">${esc(c.n)}</span>
        <p class="gp-cs">You answered: <i>“${esc(c.said)}”</i></p>
        <p class="gp-cc">${esc(c.cost)}</p></div>`).join('')}</div>
      <p class="gp-close">None of this gets more expensive overnight. It gets more familiar — and familiar is harder to change than expensive.</p>`
    : `<h2 class="gp-h">None of your answers carries an obvious price. <em>The work now is keeping it that way.</em></h2>`;

  const moves = [1, 2, 3].map((n) => `<li class="gp-move">
      <span class="gp-mn">${String(n).padStart(2, '0')}</span>
      <b>${esc(weekTitle(st, n))}</b>
      <p>${esc(promise(n))}</p></li>`).join('');

  const node = (cls, mark, title, sub) => `<li class="gp-node ${cls}"><span class="gp-dot">${mark}</span><b>${title}</b>${sub}</li>`;
  const flag = '<svg width="26" height="30" viewBox="0 0 26 30" aria-hidden="true"><path d="M4 2v27" stroke="currentColor" stroke-width="2"/><path d="M5 3h17l-4 6 4 6H5z" fill="var(--gold)" stroke="currentColor" stroke-width="1.5"/></svg>';
  const road = [
    node('gp-here', '', 'You, today', `<span>${esc(STAGES[st].n)}</span>`),
    ...[1, 2, 3].map((n) => node('gp-free', String(n).padStart(2, '0'), esc(weekTitle(st, n)), '<span class="gp-fr">Free</span>')),
    node('gp-next', '1:1', 'The Boardroom', '<span>With Alexandru · levels 04–05</span>'),
    node('gp-later', '06–12', 'LAB, then HUB', '<span>Levels 06–12</span>'),
    node('gp-goal', flag, esc(STAGES[r.want] ? STAGES[r.want].n : ''), `<span class="gp-ww">“${esc(gp.wantWords)}”</span><span>your words</span>`),
  ].join('');

  return `<div class="gp">
  ${plansCard()}
  <section class="gp-wrap gp-top">
    <p class="eyebrow">${compass} Your Ground Plan</p>
    <h1 class="gp-title">${esc(first ? `${first}, here is your Ground Plan.` : 'Here is your Ground Plan.')}</h1>
    <p class="gp-lede">Built from your ten answers. Nothing here is a guess about you — every line points back to something you chose.</p>
  </section>

  <section class="gp-wrap gp-two">
    <div class="gp-card"><p class="gp-k">What you told us</p>${told}</div>
    <div class="gp-card gp-verdict ${r.kind}">
      <span class="gp-pill">Start in ${esc(STAGES[st].n)}</span>
      <h2>${esc(r.head)}</h2>
      <p>${esc(r.body)}</p>
      <p>${esc(r.ambition)}</p>
      ${r.kind === 'ahead' ? `<p class="sure"><b>Sure you are past this?</b> Then take it at speed. Levels 01 to 03 are free — answer them as precisely as you can, and the reading at the end of level 03 will say plainly whether you were right.</p>` : ''}
    </div>
  </section>

  <section class="gp-dark"><div class="gp-wrap">
    <p class="gp-k gp-gold">What waiting costs you</p>
    ${costs}
  </div></section>

  <section class="gp-wrap gp-moves">
    <p class="eyebrow">Your next three moves · free</p>
    <h2 class="gp-h">Three levels, then a conversation with Alexandru.</h2>
    <p class="gp-lede">Each level is 28 short answers about things you can open and count — your calendar, your invoices, your customers. Nothing to prepare. It is all in front of you.</p>
    <ol class="gp-mlist">${moves}<li class="gp-move gp-then">
      <span class="gp-mt">Then</span><b>The Boardroom: a session with Alexandru</b>
      <p>Alexandru and the team read what you wrote before you speak. The session opens levels 04–05.</p></li></ol>
    <div class="gp-btns">
      <button class="cta" type="button" data-level="1">Start Level 01 →</button>
      <a class="gp-line" href="${esc(BOOKING)}" target="_blank" rel="noopener">Book my session with Alexandru</a>
    </div>
  </section>

  <section class="gp-wrap gp-road">
    <p class="eyebrow">Where this road goes</p>
    <h2 class="gp-h">From where you are to where you said you want to be.</h2>
    <div class="gp-scroll"><ol class="gp-nodes" aria-label="The road from today to your goal">${road}</ol></div>
    <p class="gp-lede">Every step on this road is something you finish, not something you wait for. The first one is open now.</p>
    <button class="cta" type="button" data-level="1">Start Level 01 →</button>
    <p class="savenote">${account.joined() ? 'Your work is saved to your account and follows you between devices.' : 'Your work is saved on this device.'}</p>
  </section>
  </div>`;
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
      <button class="ghost" type="button" data-dom="${next.k}">Next: ${next.n} →</button></div>`;
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
      ${joined ? `<a class="lib-btn" href="${esc(m.file)}" download>${dl}Download PDF</a>` : `<button type="button" class="lib-btn" data-go="${diagDone() ? 'join' : 'quiz'}">Join to download</button>`}
    </li>`).join('');
  const books = LIBRARY.books.map((b) => b.soon
    ? `<li class="lib-book lib-soon">${b.cover ? `<span class="bk3"><img src="${esc(b.cover)}" alt="${esc(b.n)} cover" loading="lazy"><i class="bk3-spine"></i></span>` : '<span class="bk3" aria-hidden="true"><span class="bk3-cover bk3-blank">In preparation</span></span>'}
        <span class="lib-btext"><span class="lib-kick">${esc(b.kicker)}</span><b>${esc(b.n)}</b><small>${esc(b.sub)}</small><em>In preparation</em></span></li>`
    : `<li class="lib-book"><span class="bk3"><img src="${esc(b.cover)}" alt="${esc(b.n)} cover" loading="lazy"><i class="bk3-spine"></i></span>
        <span class="lib-btext"><span class="lib-kick">${esc(b.kicker)}</span><b>${esc(b.n)}</b><small>${esc(b.sub)}</small>
        <span class="lib-acts"><a href="${esc(b.preview)}" target="_blank" rel="noopener">Preview the first pages →</a>
        ${joined ? `<a href="${esc(b.file)}" download>${dl}Free digital copy</a>` : `<button type="button" class="lib-link" data-go="${diagDone() ? 'join' : 'quiz'}">Join for the free digital copy</button>`}
        <span class="lib-print">${b.print ? `<a href="${esc(b.print)}" target="_blank" rel="noopener">Print edition ↗</a>` : 'Print edition coming'}</span></span></span></li>`).join('');
  const L = LIBRARY.lab;
  return `<section class="band qband lib"><div class="wrap">
    <p class="eyebrow">${compass} Library &amp; working materials</p>
    <h1 class="qh">Everything that goes with the work</h1>
    <p class="sec-lede">The three manuals are the programme on paper, to print and fill by hand. The books sit alongside it — the thinking the levels are built from.${joined ? '' : ' One join opens every download.'}</p>
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

// ── Your account plans ──────────────────────────────────────────────────────
// From the Compass, in this founder's order (GET /api/plans). One step per
// domain this week: the first one not yet done. Each opens to its full text
// and can be ticked. The count is the plans' own; it is not the Compass
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
    <p class="gp-lede">${P.compass ? 'Your lowest domain from the Compass leads. One step per domain this week.' : 'Take the Compass and your lowest domain moves to the front. One step per domain each week.'}
      ${P.compass ? '' : ' <a href="/compass">Open the Compass →</a>'}</p>
    <div class="pl-grid">${rows}</div>
    ${w ? `<div class="pl-dom pl-whatif"><p class="pl-dn">Your plan for this change · ${esc(w.name)}</p>${wNext ? planStep(wNext, null) : '<p class="pl-all">All four steps done.</p>'}</div>` : ''}
    <p class="savenote">Times are about, not promises.</p>
  </section>`;
}
async function loadPlans() {
  if (!account.joined()) return;
  const p = await account.plans();
  if (p && p.ok) { acctPlans = p; if (view === 'read' || view === 'quiz') render(); }
}

function emphasisName(st, lv) {
  const e = STAGES[st].emphasis[lv - 1];
  const d = DOMAINS.find((x) => x.k === e);
  return d ? LEAD[d.k] : 'All four';
}

// ── Render ───────────────────────────────────────────────────────────────────
function render() {
  const st = state.stage || 'build';
  document.body.classList.toggle('inwork', view === 'work');
  $('#tnav').innerHTML = state.stage && state.me
    ? `<button type="button" data-go="read" ${view === 'read' ? 'aria-current="page"' : ''}>Your Ground Plan</button><button type="button" data-go="work" ${view === 'work' ? 'aria-current="page"' : ''}>The programme</button><button type="button" data-go="library" ${view === 'library' ? 'aria-current="page"' : ''}>Library</button>${holds(state.tier, 'session') ? '' : `<a class="tbook" href="${esc(BOOKING)}" target="_blank" rel="noopener">${bookIcon}Book my 1:1 with Alexandru</a>`}`
    : '';
  $('#main').innerHTML = view === 'work'
    ? `<div class="shell"><div class="railwrap" id="railwrap">${railHTML(st)}</div><div class="work" id="work"><div id="libban">${libBanner()}</div><div id="mod">${moduleHTML(st)}</div></div></div>`
    : view === 'join' ? joinView()
    : view === 'read' ? readView()
    : view === 'library' ? libraryView()
    : quizView();
  if (view === 'quiz') { const h = $('#resultHost'); if (h) h.innerHTML = quizFoot(); }
}

/** Redraw only the module, so the rail does not flicker and its scroll holds. */
function redrawModule() {
  const w = $('#work');
  if (!w) return render();

  const m = $('#mod');
  if (m) m.innerHTML = moduleHTML(state.stage || 'build'); else w.innerHTML = moduleHTML(state.stage || 'build');
  w.scrollTo ? w.scrollTo({ top: 0, behavior: 'instant' }) : null;
  const r = $('#rail'); if (r) refreshRail();
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
  if (b.dataset.banner === 'close') { bannerDone(); const h = $('#libban'); if (h) h.innerHTML = ''; return; }
  if (b.dataset.go === 'library') bannerDone();
  if (b.dataset.go) {
    view = b.dataset.go; document.body.classList.remove('railopen'); render();
    window.scrollTo({ top: 0, behavior: 'instant' }); return;
  }
  if (b.dataset.diag !== undefined) {
    const i = +b.dataset.diag, raw = b.dataset.val;
    state.diag[i] = /^\d+$/.test(raw) ? +raw : raw;
    save();
    document.querySelectorAll(`[data-diag="${i}"]`).forEach((x) => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', 'true');
    // The verdict is worked out and kept the moment the ninth answer lands, so
    // the join can carry it. What it says stays behind the form until then.
    if (diagDone()) settle();
    const q = b.closest('.q'); if (q) q.classList.add('got');
    const c = $('.qbar i'), n = $('.qnum'), done = Object.keys(state.diag).length;
    if (c) c.style.width = Math.round(done / DIAGNOSTIC.length * 100) + '%';
    if (n) n.textContent = `${done} of ${DIAGNOSTIC.length} answered`;
    const h = $('#resultHost'); if (h) h.innerHTML = quizFoot();
    return;
  }
  if (b.dataset.stage) { state.stage = b.dataset.stage; save(); view = 'work'; render(); window.scrollTo({ top: 0, behavior: 'instant' }); return; }
  if (b.dataset.level) {
    level = +b.dataset.level; dom = 'self'; view = 'work';
    document.body.classList.remove('railopen');
    render(); window.scrollTo({ top: 0, behavior: 'instant' }); return;
  }
  if (b.dataset.dom) { dom = b.dataset.dom; redrawModule(); return; }
});

document.addEventListener('submit', async (e) => {
  const f = e.target.closest('#joinbox');
  if (!f) return;
  e.preventDefault();
  const err = $('#jerr'), go = $('#jgo');
  const val = (id) => { const el = $(id); return el ? el.value.trim() : ''; };
  const first = val('#jf'), last = val('#jl'), email = val('#je'),
        company = val('#jc'), phone = val('#jp');
  const show = (m) => { if (err) { err.textContent = m; err.hidden = false; } };
  if (!first || !last) return show('First and last name, so Alexandru and the team know who they are reading.');
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) return show('That does not look like an email address.');
  if (!company) return show('What the business is called.');
  if (!phone) return show('A phone number, so the team can reach you about the session.');
  if (err) err.hidden = true;
  if (go) { go.disabled = true; go.textContent = 'One moment…'; }
  try {
    await account.join({ first, last, email, phone, company,
      stage: state.stage, thin: state.referee && state.referee.thin, diag: state.diag });
    state.me = { name: `${first} ${last}`, email }; save();
    // Everything already written on this device goes up with the first sync.
    for (const [k, v] of Object.entries(state.answers)) account.touch('answers', k, v);
    for (const [k, v] of Object.entries(state.work)) account.touch('work', k, v);
    account.flush();
    view = 'read'; render(); window.scrollTo({ top: 0, behavior: 'instant' });
  } catch (ex) {
    // The account is a convenience, never a gate. Let them in regardless.
    const why = ex && ex.message && !/fetch|network|load failed/i.test(ex.message)
      ? ex.message
      : 'We could not reach the account service just now.';
    show(why + ' Your work is saved on this device — carry on, and it will sync when we can reach it.');
    if (go) { go.disabled = false; go.textContent = 'Open my Ground Plan anyway →'; go.dataset.go = 'read'; }
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
  state.answers[a.dataset.k] = a.value;
  save();
  account.touch('answers', a.dataset.k, a.value);
  a.closest('.step').classList.toggle('done', !!a.value.trim());

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

render();

loadPlans();

// If this founder has an account, their work follows them here. The device
// copy wins on conflict — it is the one they were just typing into.
(async () => {
  if (!account.joined()) return;
  const r = await account.pull();
  if (!r || !r.ok) return;
  let changed = false;
  for (const [k, v] of Object.entries(r.answers || {})) if (v && !state.answers[k]) { state.answers[k] = v; changed = true; }
  for (const [k, v] of Object.entries(r.work || {})) if (v && !state.work[k]) { state.work[k] = v; changed = true; }
  if (r.me) {
    state.me = { name: r.me.name, email: r.me.email };
    if (r.me.stage) state.stage = r.me.stage;
    if (r.me.tier) state.tier = r.me.tier;
    changed = true;
  }
  if (changed) { save(); render(); }
})();
