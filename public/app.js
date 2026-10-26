// The Founder's Blueprint — the programme.
//
// Three screens: the entrance (diagnostic), the map (twelve levels), and a
// level (four domains, seven steps each). A locked level opens its gate
// instead of nothing, and the gate says plainly what opens it.
//
// Answers live on the device while this is in preview. Nothing is sent
// anywhere and nothing is asserted about a payment or a subscription.

import { DOMAINS, SEVEN, STAGES, WEEKS, LADDER, LEVELS, DIAGNOSTIC, SECTIONS, JOURNEY,
  gateFor, levelFor, isWritten, weekTitle, videoFor, nextGain, holds, referee } from './content.js';
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
let view = state.stage ? 'work' : 'start';
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
function startView() {
  return `<section class="band hero"><div class="wrap">
    <p class="eyebrow">${compass} ExploraSelf · Link to Lead</p>
    <h1>The Founder&rsquo;s Blueprint</h1>
    <p class="sub">Twelve weeks. Four domains. One founder.</p>
    <p class="lede">A founder does not fail at one thing. They run out of clarity in one of four places: who they are, how they handle people, how the work actually runs, and what the market is telling them. This finds which one is costing you most right now, then takes you through all four, a level at a time.</p>
    <div class="facts">
      <span class="fact">12 levels</span><span class="fact">4 domains every level</span>
      <span class="fact">7 clarity points each</span><span class="fact">First 3 levels free</span>
      <span class="fact">No email to begin</span>
    </div>
  </div></section>

  <section class="band jband"><div class="wrap">
    <p class="eyebrow">${compass} How this goes</p>
    <h2 class="sec">Four steps, and you are already on the first</h2>
    <ol class="journey">${JOURNEY.map((j, i) => `<li class="jstep${i === 0 ? ' now' : ''}">
      <span class="jn">${i + 1}</span>
      <div><p class="jwhen">${esc(j.n)}</p><h3>${esc(j.t)}</h3><p class="jd">${esc(j.d)}</p></div>
    </li>`).join('')}</ol>
    <p class="jfoot">Nobody skips a level and nothing is graded. The questions below decide which twelve levels you walk and which of the four domains they lean on \u2014 not how much of it you do.</p>
  </div></section>

  <section class="band"><div class="wrap">
    <p class="eyebrow">The entrance</p>
    <h2 class="sec">Nine questions, and we tell you the truth</h2>
    <p class="sec-lede">Nothing is unlocked and no email is asked. Answer these and the Blueprint says where you stand across the four domains, which one is thinnest, and which level to start on.</p>
    <div class="quiz">${DIAGNOSTIC.map((q, i) => `<div class="q">
      <p class="dl">${esc(q.label)}</p><h4>${esc(q.q)}</h4>
      <div class="opts">${q.o.map((o) => `<button class="opt" type="button" aria-pressed="${state.diag[i] === o[1]}" data-diag="${i}" data-val="${esc(String(o[1]))}">${esc(o[0])}</button>`).join('')}</div>
    </div>`).join('')}</div>
    <div id="resultHost"></div>
  </div></section>`;
}

function resultBlock() {
  const need = DIAGNOSTIC.length;
  if (Object.keys(state.diag).length < need) return '';

  // Out of 4 per domain, from the eight domain questions.
  const score = { self: 0, people: 0, work: 0, market: 0 };
  DIAGNOSTIC.forEach((q, i) => { if (score[q.d] !== undefined) score[q.d] += Number(state.diag[i]) || 0; });
  const said = state.diag[DIAGNOSTIC.findIndex((q) => q.d === 'stage')];
  const want = state.diag[DIAGNOSTIC.findIndex((q) => q.d === 'want')];
  if (!said || !want) return '';

  const r = referee({ said, want, score });
  state.stage = r.assigned;
  state.scores = {}; DOMAINS.forEach((d) => state.scores[d.k] = Math.round(score[d.k] / 4 * 100));
  state.referee = { kind: r.kind, said, want, assigned: r.assigned, thin: r.thin };
  save();

  return `<div class="result">
    <div class="rgrid">
      <div><p class="eyebrow">What your answers show</p><div class="bars">${DOMAINS.map((d) => `<div class="bar" style="color:var(--${d.k})">
        <span class="bn">${d.n}</span><span class="track"><i style="width:${state.scores[d.k]}%;background:var(--${d.k})"></i></span><span class="bv">${score[d.k]}/4</span></div>`).join('')}</div>
        <p class="barnote">Four points a domain, from the eight questions. ${esc(r.thinD.n)} is thinnest, so this stage leans on it.</p></div>
      <div class="verdict ${r.kind}">
        <span class="stage-pill">${esc(STAGES[r.assigned].n)}</span>
        <h3>${esc(r.head)}</h3>
        <p>${esc(r.body)}</p>
        <p class="amb">${esc(r.ambition)}</p>
        ${r.kind === 'ahead' ? `<p class="sure"><b>Sure you are past this?</b> Then take it at speed. Levels 01 to 03 are free and the questions are short \u2014 answer them as precisely as you can, and the reading at the end will say plainly whether you were right. If it says you were, nothing is holding you.</p>` : ''}
        <p class="first">Everybody starts here<b>Level 01 \u2014 ${esc(weekTitle(r.assigned, 1))}</b></p>
        ${account.joined() || state.me
          ? `<button class="cta" data-go="work">Open your Blueprint \u2192</button>
             <p class="savenote">Your work is saved to your account and follows you between devices.</p>`
          : `<form class="joinbox" id="joinbox" novalidate>
              <p class="eyebrow">${compass} Keep this, and walk in</p>
              <h4>Where should we keep your answers?</h4>
              <p class="joinwhy">Your work saves to this device either way. An account means it follows you to your phone \u2014 and means Alexandru can read what you wrote before you ever speak to him.</p>
              <div class="joinrow">
                <label><span>Your name</span><input id="jn" name="name" autocomplete="name" required></label>
                <label><span>Email</span><input id="je" name="email" type="email" autocomplete="email" required></label>
                <label><span>Phone <em>optional</em></span><input id="jp" name="phone" type="tel" autocomplete="tel"></label>
              </div>
              <button class="cta" type="submit" id="jgo">Start week one</button>
              <p class="joinerr" id="jerr" hidden></p>
              <p class="savenote">Free, and the first three weeks stay free. No card, now or later.</p>
            </form>`}
      </div></div></div>`;
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

function railHTML(st) {
  const marks = { done: '✓', open: '', waiting: '·', locked: '🔒' };
  return `<nav class="rail" id="rail" aria-label="The twelve levels">
    <div class="railtop">
      <p class="eyebrow">${esc(STAGES[st].n)}</p>
      <h2>Your Blueprint</h2>
      <p class="railsub">${esc(STAGES[st].blurb)}</p>
    </div>
    ${SECTIONS.map((sec) => {
      const owned = holds(state.tier, sec.k);
      const rung = LADDER.find((r) => r.key === sec.k);
      return `<section class="rsec${owned ? '' : ' shut'}">
        <header class="rsh">
          <div><p class="rsn">${esc(sec.n)}</p><p class="rss">${esc(sec.sub)}</p></div>
          ${owned ? '<span class="rtag open">Open</span>' : `<span class="rtag">${esc(rung ? rung.price : '')}</span>`}
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
      </section>`;
    }).join('')}
    <div class="rprem">
      <p class="eyebrow">Everything, with him in it</p>
      <h4>Premium</h4>
      <p>All twelve levels, the LAB, the HUB and every resource — and Alexandru mentoring you every week.</p>
      <span class="price">$1,989</span>
    </div>
  </nav>`;
}

// ── A module ─────────────────────────────────────────────────────────────────
function moduleHTML(st) {
  const L = levelFor(st, level);
  const title = weekTitle(st, level);
  const g = gateFor(level);
  const owned = holds(state.tier, g);
  const tabs = DOMAINS.map((d) => `<button type="button" class="mtab" data-dom="${d.k}" data-k="${d.k}"
      aria-pressed="${d.k === dom}"><b>${d.n}</b><em>${answered(st, level, d.k)}/7</em></button>`).join('');

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
    <div class="mtabs" role="tablist">${tabs}</div>
    <article class="mod">
      <header class="modh">
        <span class="dkey" style="background:var(--${dom})"></span>
        <div><p class="eyebrow">${esc(DOMAINS.find((d) => d.k === dom).n)} · ${esc(DOMAINS.find((d) => d.k === dom).full)}</p>
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
    <button class="ghost" type="button" data-dom="self">Back to Self</button></div>`;
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
    <p class="eyebrow">Level ${String(level).padStart(2, '0')} · ${esc(STAGES[st].n)} · emphasis ${esc(emphasisName(st, level).toLowerCase())}</p>
    <h2>${esc(title)}</h2>
    <div class="lvtrack"><i style="width:${done / 28 * 100}%"></i></div>
    <p class="lvcount" id="lvcount">${done} of 28 answered</p>
  </header>`;
}

function emphasisName(st, lv) {
  const e = STAGES[st].emphasis[lv - 1];
  const d = DOMAINS.find((x) => x.k === e);
  return d ? d.n : 'All four';
}

// ── Render ───────────────────────────────────────────────────────────────────
function render() {
  const st = state.stage || 'build';
  document.body.classList.toggle('inwork', view === 'work');
  $('#tnav').innerHTML = state.stage
    ? `<button type="button" data-go="start">The entrance</button><button type="button" data-go="work" ${view === 'work' ? 'aria-current="page"' : ''}>The programme</button>`
    : '';
  $('#main').innerHTML = view === 'work'
    ? `<div class="shell"><div class="railwrap" id="railwrap">${railHTML(st)}</div><div class="work" id="work">${moduleHTML(st)}</div></div>`
    : startView();
  if (view === 'start') { const h = $('#resultHost'); if (h) h.innerHTML = resultBlock(); }
}

/** Redraw only the module, so the rail does not flicker and its scroll holds. */
function redrawModule() {
  const w = $('#work');
  if (!w) return render();

// If this founder has an account, their work follows them here.
(async () => {
  if (!account.joined()) return;
  const r = await account.pull();
  if (!r || !r.ok) return;
  let changed = false;
  for (const [k, v] of Object.entries(r.answers || {})) if (v && !state.answers[k]) { state.answers[k] = v; changed = true; }
  for (const [k, v] of Object.entries(r.work || {})) if (v && !state.work[k]) { state.work[k] = v; changed = true; }
  if (r.me) { state.me = { name: r.me.name, email: r.me.email }; if (r.me.stage) state.stage = r.me.stage; if (r.me.tier) state.tier = r.me.tier; changed = true; }
  if (changed) { save(); render(); }
})();
  w.innerHTML = moduleHTML(state.stage || 'build');
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
    const h = $('#resultHost'); if (h) h.innerHTML = resultBlock();
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
  const name = $('#jn').value.trim(), email = $('#je').value.trim(), phone = $('#jp').value.trim();
  const show = (m) => { if (err) { err.textContent = m; err.hidden = false; } };
  if (!name) return show('Your name, so he knows who he is reading.');
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) return show('That does not look like an email address.');
  if (err) err.hidden = true;
  if (go) { go.disabled = true; go.textContent = 'One moment…'; }
  try {
    await account.join({ name, email, phone, stage: state.stage, thin: state.referee && state.referee.thin, diag: state.diag });
    state.me = { name, email }; save();
    // Everything already written on this device goes up with the first sync.
    for (const [k, v] of Object.entries(state.answers)) account.touch('answers', k, v);
    for (const [k, v] of Object.entries(state.work)) account.touch('work', k, v);
    account.flush();
    view = 'work'; render(); window.scrollTo({ top: 0, behavior: 'instant' });
  } catch (ex) {
    // The account is a convenience, never a gate. Let them in regardless.
    const why = ex && ex.message && !/fetch|network|load failed/i.test(ex.message)
      ? ex.message
      : 'We could not reach the account service just now.';
    show(why + ' Your work is saved on this device — carry on, and it will sync when we can reach it.');
    if (go) { go.disabled = false; go.textContent = 'Start week one anyway'; go.dataset.go = 'work'; }
  }
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
