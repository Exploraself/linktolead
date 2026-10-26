// The Founder's Blueprint — the programme.
//
// Three screens: the entrance (diagnostic), the map (twelve levels), and a
// level (four domains, seven steps each). A locked level opens its gate
// instead of nothing, and the gate says plainly what opens it.
//
// Answers live on the device while this is in preview. Nothing is sent
// anywhere and nothing is asserted about a payment or a subscription.

import { DOMAINS, SEVEN, STAGES, WEEKS, LADDER, LEVELS, DIAGNOSTIC, gateFor, levelFor, isWritten, weekTitle } from './content.js';
import { FW_BUILD } from './fw-build.js';
import { FW_GROW } from './fw-grow.js';
import { FW_SCALE } from './fw-scale.js';
import { result as fwResult } from './frameworks.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const KEY = 'ftb-v1';

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } };

let state = Object.assign({ stage: '', scores: null, answers: {}, work: {}, diag: {}, unlocked: 3 }, load());
if (!state.work) state.work = {};
let view = state.stage ? 'map' : 'start';
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
const isOpen = (lv) => lv <= (state.unlocked || 3);

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
  const tot = { self: 0, people: 0, work: 0, market: 0 };
  DIAGNOSTIC.forEach((q, i) => { if (q.d !== 'stage') tot[q.d] += Number(state.diag[i]) || 0; });
  const pct = {}; DOMAINS.forEach((d) => pct[d.k] = Math.round(tot[d.k] / 4 * 100));
  const st = state.diag[need - 1];
  state.stage = st; state.scores = pct; save();

  const thin = DOMAINS.slice().sort((a, b) => pct[a.k] - pct[b.k])[0];
  const S = STAGES[st];
  const wk = S.emphasis.findIndex((e) => e === thin.k);
  const startLevel = wk < 0 ? 1 : wk + 1;

  return `<div class="result"><div class="rgrid">
    <div><p class="eyebrow">Where you stand</p><div class="bars">${DOMAINS.map((d) => `<div class="bar" style="color:var(--${d.k})">
      <span class="bn">${d.n}</span><span class="track"><i style="width:${pct[d.k]}%;background:var(--${d.k})"></i></span><span class="bv">${pct[d.k]}%</span></div>`).join('')}</div></div>
    <div class="verdict">
      <span class="stage-pill">${esc(S.n)}</span>
      <h3>Thinnest right now: ${esc(thin.n.toLowerCase())} — ${esc(thin.full.toLowerCase())}</h3>
      <p>${esc(S.lede)} Across the four, ${esc(thin.n.toLowerCase())} is where you have least to point at, and in a founder ${esc(S.n.toLowerCase())} that is the one that compounds fastest if it is left alone.</p>
      <p class="first">Start here<b>Level ${startLevel} — ${esc(weekTitle(st, startLevel))}</b></p>
      <button class="cta" data-go="map">Open your Blueprint →</button>
    </div></div></div>`;
}

// ── The map ──────────────────────────────────────────────────────────────────
function mapView() {
  const st = state.stage || 'build';
  const S = STAGES[st];
  return `<section class="band"><div class="wrap">
    <p class="eyebrow">Your Blueprint</p>
    <h2 class="sec">Every level touches all four. One of them leads.</h2>
    <p class="sec-lede">Level one is level one of all four domains. Level two goes a layer deeper in all four. You never leave a domain behind — but each level has an emphasis, and the emphasis is decided by where you are.</p>

    <div class="switch">${Object.entries(STAGES).map(([k, v]) => `<button class="sbtn" type="button" data-stage="${k}" aria-pressed="${k === st}">
      <strong>${esc(v.n)}</strong><small>${esc(v.blurb)}</small></button>`).join('')}</div>

    <div class="levels">${WEEKS[st].map((_, i) => {
      const lv = i + 1, title = weekTitle(st, lv), g = gateFor(lv), e = S.emphasis[i];
      const d = DOMAINS.find((x) => x.k === e);
      const done = levelDone(st, lv);
      return `<button class="lrow" type="button" data-level="${lv}">
        <span class="lno">${String(lv).padStart(2, '0')}</span>
        <span class="ltitle">${esc(title)}</span>
        <span class="lemph" style="color:${d ? `var(--${d.k})` : 'var(--gold-ink)'}">${d ? esc(d.n) : 'All four'}</span>
        <span class="lgate g-${g}">${isOpen(lv) ? (isWritten(st, lv) ? (done ? `${done}/28` : 'Open') : 'In preparation') : gateLabel(g)}</span>
      </button>`;
    }).join('')}</div>

    <p class="eyebrow" style="margin-top:40px">The ladder</p>
    <h2 class="sec">Free where it proves itself. Paid where it needs him.</h2>
    <div class="ladder">${LADDER.map((r) => `<article class="rung ${r.key}">
      <span class="wk">${r.from ? `Levels ${r.from}–${r.to}` : 'Everything'}</span>
      <div><h4>${esc(r.n)}</h4><p>${esc(r.what)}</p></div>
      <span class="price">${esc(r.price)}</span></article>`).join('')}</div>
  </div></section>`;
}
const gateLabel = (g) => ({ free: 'Free', session: '1:1 session', lab: 'LAB', hub: 'HUB' }[g] || '');

// ── A level ──────────────────────────────────────────────────────────────────
function levelView() {
  const st = state.stage || 'build';
  const L = levelFor(st, level);
  const title = weekTitle(st, level);

  if (!isOpen(level)) {
    const g = gateFor(level);
    const rung = LADDER.find((r) => r.key === g);
    return `<section class="band"><div class="wrap">
      <button class="ghost" data-go="map" style="margin-top:0">← Back to your Blueprint</button>
      <p class="eyebrow" style="margin-top:26px">Level ${level}</p>
      <h2 class="sec">${esc(title)}</h2>
      <div class="gate">
        <p class="eyebrow">${compass} What opens this</p>
        <h3>${esc(rung.n)}</h3>
        <p>${esc(rung.what)}</p>
        <span class="price">${esc(rung.price)}</span>
        ${rung.url ? `<a class="cta" href="${esc(rung.url)}" target="_blank" rel="noopener">See what it includes ↗</a>` : '<a class="cta" href="https://exploraself.com/unshakeable" target="_blank" rel="noopener">Start with the audit ↗</a>'}
      </div>
      <p class="savenote">Levels one to three stay free and open, whatever you decide here.</p>
    </div></section>`;
  }

  if (!L) {
    return `<section class="band"><div class="wrap">
      <button class="ghost" data-go="map" style="margin-top:0">← Back to your Blueprint</button>
      <p class="eyebrow" style="margin-top:26px">Level ${level}</p>
      <h2 class="sec">${esc(title)}</h2>
      <p class="sec-lede">This level is written and not yet published here. The three free levels are complete; the rest arrive level by level, and nothing is shown before it is finished.</p>
      <button class="ghost" data-go="map">Back to your Blueprint</button>
    </div></section>`;
  }

  const done = levelDone(st, level);
  const D = L[dom];
  const fw = fwFor(st, level, dom);
  return `<section class="band"><div class="wrap">
    <button class="ghost" data-go="map" style="margin-top:0">← Back to your Blueprint</button>
    <p class="eyebrow" style="margin-top:26px">Level ${level} · ${esc(STAGES[st].n)}</p>
    <h2 class="sec">${esc(title)}</h2>

    <div class="promise">
      <p class="eyebrow">The promise of this level</p>
      <p class="ptext">${esc(L.promise)}</p>
      <div class="pmeta"><span>Emphasis: <b>${esc(emphasisName(st, level))}</b></span><span id="lvlCount">${done} of 28 answered</span></div>
      <div class="ptrack"><i id="lvlFill" style="width:${done / 28 * 100}%"></i></div>
    </div>

    <div class="dtabs">${DOMAINS.map((d) => `<button class="dtab" type="button" data-dom="${d.k}" aria-pressed="${d.k === dom}">
      <strong>${d.n}</strong><span>${esc(L[d.k].title)}</span><em>${answered(st, level, d.k)} of 7</em></button>`).join('')}</div>

    <div class="steps">${D.steps.map((q, i) => {
      const v = state.answers[aKey(st, level, dom, i)] || '';
      return `<div class="step${v.trim() ? ' done' : ''}">
        <span class="snum">${i + 1}</span>
        <div>
          <p class="sname">${SEVEN[i].n}</p>
          <p class="swhy">${esc(SEVEN[i].why)}</p>
          <p class="sask">${esc(q)}</p>
          <textarea id="s-${st}-${level}-${dom}-${i}" data-k="${aKey(st, level, dom, i)}" rows="2" placeholder="Write it here" aria-label="${SEVEN[i].n}">${esc(v)}</textarea>
          ${fw && fw.after === i + 1 ? worksheetHTML(fw, st, level, dom) : ''}
        </div></div>`;
    }).join('')}</div>
    <p class="savenote">Saved on this device as you type. A level closes when all twenty-eight are answered — not before.</p>
  </div></section>`;
}
function emphasisName(st, lv) {
  const e = STAGES[st].emphasis[lv - 1];
  const d = DOMAINS.find((x) => x.k === e);
  return d ? d.n : 'All four';
}

// ── Render ───────────────────────────────────────────────────────────────────
function render() {
  $('#tnav').innerHTML = [['start', 'The entrance'], ['map', 'Your Blueprint']]
    .map(([v, n]) => `<button type="button" data-go="${v}" ${view === v ? 'aria-current="page"' : ''}>${n}</button>`).join('');
  $('#main').innerHTML = view === 'level' ? levelView() : view === 'map' ? mapView() : startView();
  if (view === 'start') { const h = $('#resultHost'); if (h) h.innerHTML = resultBlock(); }
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.go) { view = b.dataset.go; render(); window.scrollTo({ top: 0, behavior: 'instant' }); return; }
  if (b.dataset.diag !== undefined) {
    const i = +b.dataset.diag, raw = b.dataset.val;
    state.diag[i] = /^\d+$/.test(raw) ? +raw : raw;
    save();
    document.querySelectorAll(`[data-diag="${i}"]`).forEach((x) => x.setAttribute('aria-pressed', 'false'));
    b.setAttribute('aria-pressed', 'true');
    const h = $('#resultHost'); if (h) h.innerHTML = resultBlock();
    return;
  }
  if (b.dataset.stage) { state.stage = b.dataset.stage; save(); render(); return; }
  if (b.dataset.level) { level = +b.dataset.level; dom = 'self'; view = 'level'; render(); window.scrollTo({ top: 0, behavior: 'instant' }); return; }
  if (b.dataset.dom) { dom = b.dataset.dom; render(); return; }
});

document.addEventListener('input', (e) => {
  const w = e.target.closest('input[data-w]');
  if (w) {
    state.work[w.dataset.w] = w.value;
    save();
    const st = state.stage || 'build', fw = fwFor(st, level, dom);
    const host = fw && document.querySelector(`[data-rhost="${fw.k}"]`);
    if (host) host.innerHTML = windowHTML(fw, st, level, dom);
    return;
  }
  const a = e.target.closest('textarea[data-k]');
  if (!a) return;
  state.answers[a.dataset.k] = a.value;
  save();
  a.closest('.step').classList.toggle('done', !!a.value.trim());
  const st = state.stage || 'build', n = levelDone(st, level);
  const c = $('#lvlCount'), f = $('#lvlFill');
  if (c) c.textContent = `${n} of 28 answered`;
  if (f) f.style.width = (n / 28 * 100) + '%';
  const tab = document.querySelector(`.dtab[data-dom="${dom}"] em`);
  if (tab) tab.textContent = `${answered(st, level, dom)} of 7`;
});

render();
