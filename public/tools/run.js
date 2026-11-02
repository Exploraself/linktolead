/* One tool page (/runway/, /bottleneck/, /off-switch/): the cover, the
 * access step (a full free account, access.js), then the tool one question at
 * a time, the first number, and the result with the four lines, the book
 * quote, the share card and ONE button to The Leader's North Star.
 *
 * The screens are the approved preview's (Tonight 04, 1 Nov 2026), ported;
 * engine.js holds every word and sum. Answers save to this device first,
 * always (localStorage, wrapped in try/catch), so a reload picks up where the
 * founder was; the result also goes to their account (/api/tools), and waits
 * in an outbox when the network is away. */
import { TOOLS as CATALOG } from '/tools/catalog.js';
import { BY_PAGE, FOUR, DAYS, MONEY_STEPS, NS_URL, esc, money, weeks, dayLong, drawCard } from '/tools/engine.js';
import { access, record, flush } from '/tools/access.js';
import { cover } from '/tools/cover.js';

const id = document.body.dataset.tool;
const T = BY_PAGE[id], C = CATALOG[id];
const RM = (() => { try { return window.matchMedia('(prefers-reduced-motion: reduce)'); } catch { return { matches: false }; } })();
const KEY = `es-tool-${id}`;
const main = document.getElementById('main');

/* The first number each result is summed up by, for the founder's account
 * and /mentor. Their own numbers only. */
const SUMMARY = {
  runway: (a) => { const c = T.calc(a); return c.free <= 0 ? `${money(-c.free)} short before the month starts` : `About ${weeks(c.A)} of runway`; },
  bottleneck: (a) => `${a.waiting} ${a.waiting === 1 ? 'decision' : 'decisions'} waiting · about ${a.stop}% stops without them`,
  'off-switch': (a) => { const c = T.calc(a); return `${c.worked} of 7 evenings had work · ${a.extra} ${a.extra === 1 ? 'hour' : 'hours'} outside planned hours`; },
};

// ── State, kept on this device ─────────────────────────────────────────────
const fresh = () => ({ key: 'q:' + T.qs[0].id, a: {}, draft: {}, exact: {}, show: false, acted: false, sent: '' });
let st = fresh(), who = { first: '', email: '', preview: false }, opened = false, door = null;
function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (v && v.a && typeof v.a === 'object') st = { ...fresh(), key: v.key || fresh().key, a: v.a, show: !!v.show, sent: v.sent || '' };
  } catch { /* nothing kept */ }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify({ key: st.key, a: st.a, show: st.show, sent: st.sent, at: new Date().toISOString() })); } catch { /* private mode */ } }

// ── The opening: the cover, then the access step ──────────────────────────
function opening() {
  document.title = `${C.name} · ${C.line} · ExploraSelf`;
  main.innerHTML = `<section class="open" aria-label="${esc(C.name)}">
      ${cover(C, { h1: true })}
      <div id="access"></div>
    </section>
    <section class="run" id="run" hidden aria-label="${esc(C.name)}">
      <div class="frame">
        <div class="tbar"><span class="tdom">${esc(T.domain)}</span><span class="tname">${esc(C.name)} · Free</span></div>
        <div class="prog" aria-hidden="true"><i></i></div>
        <div class="body" id="tool-body"></div>
      </div>
    </section>`;
  door = access(document.getElementById('access'), { tool: C, onOpen: start });
}

/** The access step said yes: the tool opens where the founder left it. */
function start(w) {
  who = w || who;
  if (!opened && !who.preview) { opened = true; record(id, 'open'); }
  main.querySelector('.open').hidden = true;
  document.getElementById('run').hidden = false;
  st.acted = true;
  render();
}
/** Back from the first question: the cover again. */
function toCover() {
  document.getElementById('run').hidden = true;
  main.querySelector('.open').hidden = false;
  if (door && !who.preview) door.refresh();
  window.scrollTo({ top: 0, behavior: RM.matches ? 'auto' : 'smooth' });
}

// ── The flow ───────────────────────────────────────────────────────────────
const visibleQs = (a) => T.qs.filter((q) => !q.cond || q.cond(a));
const keysOf = () => [...visibleQs(st.a).map((q) => 'q:' + q.id), 'insight', 'result'];
const val = (x, a) => (typeof x === 'function' ? x(a) : x);
const root = () => document.getElementById('run');
function go(dir) {
  const ks = keysOf(), i = ks.indexOf(st.key);
  if (dir < 0 && i <= 0) return toCover();
  st.key = ks[Math.max(0, Math.min(ks.length - 1, (i < 0 ? 0 : i) + dir))];
  st.acted = true; save(); render();
}

function render() {
  const body = document.getElementById('tool-body');
  if (!keysOf().includes(st.key)) st.key = keysOf()[0];
  const ks = keysOf(), i = ks.indexOf(st.key);
  root().querySelector('.prog i').style.width = Math.round((i + 1) / ks.length * 100) + '%';
  let html = '';
  if (st.key.startsWith('q:')) { const qs = visibleQs(st.a), qi = qs.findIndex((q) => 'q:' + q.id === st.key); html = questionHTML(qs[qi], qi, qs.length); }
  else if (st.key === 'insight') html = insightHTML();
  else if (st.key === 'result') html = resultHTML();
  body.innerHTML = `<div class="scr${RM.matches ? '' : ' enter'}">${html}</div>`;
  if (st.key === 'result') { paintCard(); keep(); }
  if (st.acted) focusScreen();
}

function questionHTML(q, qi, total) {
  const a = st.a, hid = `${id}-${q.id}-h`, did = `${id}-${q.id}-d`;
  let ctl = '';
  if (q.type === 'tap') {
    ctl = `<div class="opts" role="group" tabindex="-1" aria-labelledby="${hid}" aria-describedby="${did}">` + q.options.map((o, k) => `<button type="button" class="opt" data-act="pick" data-v="${k}" aria-pressed="${a[q.id] === k}"><span class="key" aria-hidden="true">${k + 1}</span><span>${esc(o)}</span></button>`).join('') + '</div>';
  } else if (q.type === 'day') {
    ctl = `<div class="opts days" role="group" tabindex="-1" aria-labelledby="${hid}" aria-describedby="${did}">` + DAYS.map((d, k) => `<button type="button" class="opt" data-act="pick" data-v="${k}" aria-pressed="${a[q.id] === k}" aria-label="${k === 0 ? 'Today, ' : k === 1 ? 'Tomorrow, ' : ''}${esc(dayLong(d))}"><span class="key" aria-hidden="true">${k + 1}</span><b>${k === 0 ? 'Today' : k === 1 ? 'Tomorrow' : esc(d.toLocaleDateString('en-US', { weekday: 'short' }))}</b><small>${esc(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))}</small></button>`).join('') + '</div>';
  } else if (q.type === 'slide' || q.type === 'money') {
    const isMoney = q.type === 'money';
    const has = a[q.id] !== undefined;
    const min = isMoney ? (q.minIdx || 0) : val(q.min, a), max = isMoney ? MONEY_STEPS.length - 1 : val(q.max, a);
    let pos;
    if (st.draft[q.id] !== undefined) pos = st.draft[q.id];
    else if (has) pos = isMoney ? nearestIdx(a[q.id]) : a[q.id];
    else pos = val(q.start, a);
    pos = Math.max(min, Math.min(max, pos));
    const touched = has || st.draft[q.id] !== undefined;
    const shown = isMoney ? (has && st.draft[q.id] === undefined ? a[q.id] : MONEY_STEPS[pos]) : pos;
    const vtxt = isMoney ? money(shown) : q.fmt(shown);
    const wtxt = isMoney ? '' : q.words(shown);
    const exact = isMoney && st.exact[q.id];
    ctl = `<div class="readout"><output class="val${touched ? '' : ' idle'}" data-val aria-hidden="true">${esc(touched ? vtxt : (isMoney ? '$ —' : '—'))}</output><span class="words" data-words>${touched ? esc(wtxt) : 'Move the slider to your number'}</span></div>`;
    if (exact) {
      ctl += `<label class="exact" for="${id}-${q.id}-x"><span aria-hidden="true">$</span><input id="${id}-${q.id}-x" type="text" inputmode="numeric" autocomplete="off" data-exact aria-labelledby="${hid}" aria-describedby="${did}" value="${has ? esc(String(a[q.id])) : ''}" placeholder="0"></label>
        <div style="margin-top:8px"><button type="button" class="linkbtn" data-act="exact">Use the slider instead</button></div>`;
    } else {
      ctl += `<input id="${id}-${q.id}-r" type="range" min="${min}" max="${max}" step="${isMoney ? 1 : q.step}" value="${pos}" data-range aria-labelledby="${hid}" aria-describedby="${did}" aria-valuetext="${esc(touched ? vtxt + (wtxt ? ' ' + wtxt : '') : 'not set yet')}">
        <div class="ends"><span>${esc(isMoney ? money(MONEY_STEPS[min]) : val(q.ends[0], a))}</span><span>${esc(isMoney ? money(MONEY_STEPS[max]) + '+' : val(q.ends[1], a))}</span></div>
        ${isMoney ? '<div style="margin-top:6px"><button type="button" class="linkbtn" data-act="exact">Type the exact amount</button></div>' : ''}`;
    }
    ctl += `<div class="okrow"><button type="button" class="btn" data-act="ok" data-primary>OK <span aria-hidden="true">✓</span></button><span class="kbd">or press Enter ↵</span></div><p class="nudge" data-nudge role="status"></p>`;
  } else if (q.type === 'text') {
    ctl = `<input class="txt" id="${id}-${q.id}-t" type="text" autocomplete="off" maxlength="80" data-text aria-labelledby="${hid}" aria-describedby="${did}" placeholder="${esc(q.ph || '')}" value="${esc(a[q.id] || '')}">
      <div class="okrow"><button type="button" class="btn" data-act="ok" data-primary>OK <span aria-hidden="true">✓</span></button><span class="kbd">or press Enter ↵</span>${q.optional ? '<button type="button" class="linkbtn" data-act="skip">Skip</button>' : ''}</div><p class="nudge" data-nudge role="status"></p>`;
  }
  return `<div class="qtop"><button type="button" class="back" data-act="back">← Back</button><span class="count">Question ${qi + 1} of ${total}</span></div>
    <h2 class="qh" id="${hid}">${esc(val(q.q, a))}</h2>
    <p class="hint" id="${did}">${esc(q.hint)}</p>
    <div class="ctl">${ctl}</div>`;
}
const nearestIdx = (v) => { let best = 0; MONEY_STEPS.forEach((m, i) => { if (Math.abs(m - v) < Math.abs(MONEY_STEPS[best] - v)) best = i; }); return best; };

function insightHTML() {
  const x = T.insight(st.a);
  return `<div class="qtop"><button type="button" class="back" data-act="back">← Back</button><span class="count">Your first number</span></div>
    <p class="eb">From your own answers</p>
    <h2 class="big-n">${esc(x.big)}</h2>
    <p class="big-l">${esc(x.line)}</p>
    ${x.calcline ? `<p class="calcline">${esc(x.calcline)}</p>` : ''}
    <div class="vis">${x.vis}</div>
    <div class="tease"><p>Your full reading adds:</p><ul>${x.tease.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>
    <div class="okrow" style="margin-top:22px"><button type="button" class="btn big" data-act="next" data-primary>Show my full reading <span aria-hidden="true">→</span></button><span class="kbd">or press Enter ↵</span></div>`;
}

function resultHTML() {
  const r = T.result(st.a, { name: who.first });
  const rowsH = r.rows.map(([l, v, s]) => `<div class="row"><span>${esc(l)}${s ? `<small>${esc(s)}</small>` : ''}</span><b>${esc(v)}</b></div>`).join('')
    + `<div class="row total"><span>${esc(r.total[0])}${r.total[2] ? `<small>${esc(r.total[2])}</small>` : ''}</span><b>${esc(r.total[1])}</b></div>`;
  const othersH = r.others.length ? `<div class="sec"><span class="eb">Other ways to read it</span><div class="rows">${r.others.map(([l, v, s]) => `<div class="row"><span>${esc(l)}${s ? `<small>${esc(s)}</small>` : ''}</span><b>${esc(v)}</b></div>`).join('')}</div></div>` : '';
  const linesH = r.lines.map((ln, k) => `<div class="line"><div class="lab">${FOUR[k][0]}<em>${FOUR[k][1]}</em></div><p>${ln}</p></div>`).join('');
  return `<div class="qtop"><button type="button" class="back" data-act="back">← Back</button><span class="count">Your reading</span></div>
    <h2 class="res-h" tabindex="-1" data-focus>${r.h}</h2>
    <p class="res-sub">${esc(r.sub)}</p>
    <div class="sec"><span class="eb">The sum</span><div class="rows">${rowsH}</div></div>
    ${othersH}
    <div class="sec"><span class="eb">Four lines, from your answers</span><div class="lines">${linesH}</div></div>
    <div class="ask"><p>${esc(r.ask)}</p><small>THE COST OF WAITING · A QUESTION ONLY YOU CAN ANSWER</small></div>
    <div class="step"><p class="eb">Your step this week</p><p class="when">${esc(r.when)}</p><p>${esc(r.action)}</p>
      <div class="okrow"><button type="button" class="btn ghost" data-act="copystep">Copy my step</button></div><p class="status" data-status-step role="status"></p></div>
    <blockquote class="quote">“${esc(r.quote.t)}”<cite>${esc(r.quote.src)}</cite></blockquote>
    <div class="sec cardbox"><span class="eb">Your share card</span>
      <img alt="Your share card for ${esc(C.name)}" data-card width="1200" height="630">
      <div class="cardctl"><label><input type="checkbox" data-shownum ${st.show ? 'checked' : ''}> Show my number on the card</label>
        <button type="button" class="linkbtn" data-act="copyimg">Copy image</button><button type="button" class="linkbtn" data-act="copycap">Copy a caption</button></div>
      <p class="status" data-status-card role="status">Off by default: no private numbers unless you tick the box. Long-press or right-click the card to save it.</p></div>
    <div class="ns"><p class="eb">Your next step · free</p><h3>See the whole picture.</h3><p>${esc(r.bridge)}</p>
      <a class="btn big" href="${NS_URL}">Open The Leader’s North Star <span aria-hidden="true">→</span></a>
      <p class="fine">Free · No card · Eight plain questions</p></div>
    <p class="honest">${r.honest}</p>
    <div class="again"><button type="button" class="linkbtn" data-act="restart">Start again</button></div>`;
}

/** The result goes to the founder's account once for each set of answers. */
function keep() {
  if (who.preview) return;
  const sig = JSON.stringify(st.a);
  if (st.sent === sig) return;
  const r = T.result(st.a, { name: '' }), c = T.calc(st.a);
  const sums = Object.fromEntries(Object.entries(c).filter(([, v]) => typeof v === 'number' && Number.isFinite(v)).map(([k, v]) => [k, Math.round(v * 100) / 100]));
  const day = DAYS[st.a.day || 0];
  st.sent = sig; save();
  record(id, 'result', { summary: SUMMARY[id](st.a), answers: st.a, sums, day: day ? day.toISOString().slice(0, 10) : null, step: `${r.when}: ${r.action}` });
}

async function paintCard() {
  const img = root().querySelector('[data-card]');
  if (!img) return;
  try { img.src = await drawCard(document.getElementById('cardcv'), T, st.a, st.show); }
  catch { const s = root().querySelector('[data-status-card]'); if (s) s.textContent = 'The card could not be drawn in this browser.'; }
}

function focusScreen() {
  const r = root();
  const el = r.querySelector('[data-focus]') || r.querySelector('.opt[aria-pressed="true"]') || r.querySelector('[data-exact], [data-range], [data-text], .opts, [data-primary]');
  if (el) { try { el.focus({ preventScroll: true }); } catch { el.focus(); } }
  const frame = r.querySelector('.frame'), top = frame.getBoundingClientRect().top;
  if (top < 0 || (st.key === 'result' && top > window.innerHeight * .5)) frame.scrollIntoView({ block: 'start', behavior: RM.matches ? 'auto' : 'smooth' });
}

// ── Events ─────────────────────────────────────────────────────────────────
const currentQ = () => (st.key.startsWith('q:') ? T.qs.find((q) => 'q:' + q.id === st.key) : null);
const nudge = (msg) => { const n = root().querySelector('[data-nudge]'); if (n) n.textContent = msg; };

function onClick(e) {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, q = currentQ();
  if (act === 'next') return go(1);
  if (act === 'back') { if (q) delete st.draft[q.id]; return go(-1); }
  if (act === 'pick') {
    if (!q || st.lock) return;
    const v = Number(b.dataset.v); st.a[q.id] = v; st.lock = true; save();
    root().querySelectorAll('.opt').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    setTimeout(() => { st.lock = false; go(1); }, RM.matches ? 60 : 220);
    return;
  }
  if (act === 'exact') { st.exact[q.id] = !st.exact[q.id]; render(); return; }
  if (act === 'skip') { st.a[q.id] = ''; return go(1); }
  if (act === 'restart') { st = { ...fresh(), acted: true }; save(); return render(); }
  if (act === 'ok') return ok();
  if (act === 'copystep') return copyText(T.result(st.a, { name: who.first }), '[data-status-step]', true);
  if (act === 'copycap') return copyText(T.result(st.a, { name: who.first }), '[data-status-card]', false);
  if (act === 'copyimg') return copyImage();
}

function ok() {
  const q = currentQ(), r = root();
  if (!q) return;
  if (q.type === 'text') { st.a[q.id] = r.querySelector('[data-text]').value.trim().slice(0, 80); return go(1); }
  if (q.type === 'money' && st.exact[q.id]) {
    const raw = r.querySelector('[data-exact]').value.replace(/[$,\s]/g, '');
    const n = Number(raw);
    if (raw === '' || !Number.isFinite(n) || n < 0) return nudge('Type a whole amount in dollars, like 12500.');
    if (q.minIdx && n <= 0) return nudge('A normal month needs at least one cost. Type your best guess.');
    st.a[q.id] = Math.round(n); delete st.draft[q.id]; return go(1);
  }
  if (q.type === 'slide' || q.type === 'money') {
    if (st.draft[q.id] === undefined && st.a[q.id] === undefined) return nudge('Move the slider to your number first. Arrow keys work too.');
    if (st.draft[q.id] !== undefined) st.a[q.id] = q.type === 'money' ? MONEY_STEPS[st.draft[q.id]] : st.draft[q.id];
    delete st.draft[q.id];
    // A smaller "hours worked" can leave "hours that needed you" above it.
    if (q.id === 'hours' && st.a.need !== undefined && st.a.need > st.a.hours) delete st.a.need;
    return go(1);
  }
}

function onInput(e) {
  const q = currentQ(), r = root();
  if (!q) return;
  if (e.target.matches('[data-range]')) {
    const pos = Number(e.target.value); st.draft[q.id] = pos;
    const isMoney = q.type === 'money', v = isMoney ? MONEY_STEPS[pos] : pos;
    const vt = isMoney ? money(v) : q.fmt(v), wt = isMoney ? '' : q.words(v);
    const out = r.querySelector('[data-val]'); out.textContent = vt; out.classList.remove('idle');
    r.querySelector('[data-words]').textContent = wt;
    e.target.setAttribute('aria-valuetext', vt + (wt ? ' ' + wt : ''));
    nudge('');
  }
  if (e.target.matches('[data-exact]')) {
    const n = Number(e.target.value.replace(/[$,\s]/g, ''));
    const out = r.querySelector('[data-val]');
    if (e.target.value.trim() !== '' && Number.isFinite(n)) { out.textContent = money(n); out.classList.remove('idle'); }
    nudge('');
  }
  if (e.target.matches('[data-text]')) nudge('');
}

function onChange(e) { if (e.target.matches('[data-shownum]')) { st.show = e.target.checked; save(); paintCard(); } }

function onKey(e) {
  const tag = e.target.tagName, isText = e.target.matches('input[type=text], input[type=email]');
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    if (tag === 'BUTTON' || tag === 'A' || e.target.matches('input[type=checkbox]')) return;
    const p = root().querySelector('[data-primary]');
    if (p) { e.preventDefault(); p.click(); }
    return;
  }
  if (!isText && !e.metaKey && !e.ctrlKey && !e.altKey && /^[1-9]$/.test(e.key)) {
    const o = root().querySelectorAll('.opt')[Number(e.key) - 1];
    if (o) { e.preventDefault(); o.click(); }
  }
}

async function copyText(r, sel, step) {
  const s = root().querySelector(sel);
  const text = step ? `${r.when}: ${r.action}` : r.caption;
  try { await navigator.clipboard.writeText(text); s.textContent = step ? 'Copied. Paste it into your calendar.' : 'Caption copied.'; }
  catch { s.textContent = 'Copy didn’t work in this browser. Select the text and copy it.'; }
}
async function copyImage() {
  const s = root().querySelector('[data-status-card]'), cv = document.getElementById('cardcv');
  try {
    await drawCard(cv, T, st.a, st.show);
    if (!window.ClipboardItem || !navigator.clipboard || !navigator.clipboard.write) throw new Error('no clipboard');
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': new Promise((res) => cv.toBlob(res, 'image/png')) })]);
    s.textContent = 'Image copied. Paste it into your post.';
  } catch { s.textContent = 'This browser didn’t allow copying the image. Long-press or right-click the card to save it.'; }
}

// ── Start ──────────────────────────────────────────────────────────────────
if (T && C) {
  load();
  opening();
  const run = root();
  run.addEventListener('click', onClick);
  run.addEventListener('keydown', onKey);
  run.addEventListener('input', onInput);
  run.addEventListener('change', onChange);
  flush();
}
