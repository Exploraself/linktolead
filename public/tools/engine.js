/* One free tool on its own page (/runway/, /bottleneck/, /off-switch/):
 * the cover → the way in (a full free account, public/tools/gate.js) → one
 * question per screen → the first number → the full reading, with one button
 * to The Leader's North Star.
 *
 * Answers save to this device first, always (localStorage, try/catch), so a
 * reload or a dropped connection loses nothing. The reading and the answers
 * are copied to the account once, when the founder reaches the reading
 * (/api/tools), so Alexandru and the team can read them before a session.
 * The tool's words, sums and readings are in tools-data.js. */
import { byKey, RM, esc, money, MONEY_STEPS, NS_URL, DAYS, dayLong, FOUR, drawCard, loadFonts } from '/tools/tools-data.js';
import { byKey as coverOf, coverHTML } from '/tools/catalog.js';
import * as G from '/tools/gate.js';
import * as A from '/account.js';

const root = document.getElementById('tool');
const KEY = root.dataset.tool;
const t = byKey(KEY), cover = coverOf(KEY);
const body = root.querySelector('.body'), bar = root.querySelector('.prog i');
const STORE = 'ftb-tool-' + KEY;
const saved = () => { try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch { return null; } };
const keep = (x) => { try { localStorage.setItem(STORE, JSON.stringify(x)); } catch { /* private mode */ } };

let acct = { kind: 'checking', me: null };
const st = { key: 'cover', a: {}, draft: {}, exact: {}, name: '', show: false, acted: false, lock: false, sent: false };
{ const s = saved(); if (s && s.a && typeof s.a === 'object') st.a = s.a; }

const visibleQs = (a) => t.qs.filter((q) => !q.cond || q.cond(a));
const keysOf = () => ['cover', ...visibleQs(st.a).map((q) => 'q:' + q.id), 'insight', 'result'];
const val = (x, a) => (typeof x === 'function' ? x(a) : x);
const done = () => visibleQs(st.a).every((q) => q.optional || st.a[q.id] !== undefined);
const api = (path, payload) => fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: A.token(), tool: KEY, ...payload }) }).catch(() => null);

function go(dir) {
  const ks = keysOf(), i = ks.indexOf(st.key);
  st.key = ks[Math.max(0, Math.min(ks.length - 1, (i < 0 ? 0 : i) + dir))];
  st.acted = true; render();
}

function render() {
  const ks = keysOf(), i = ks.indexOf(st.key);
  bar.style.width = (st.key === 'cover' || st.key === 'gate' ? 0 : Math.round(i / (ks.length - 1) * 100)) + '%';
  if (st.key === 'gate') return;
  let html = '';
  if (st.key === 'cover') html = coverScreen();
  else if (st.key.startsWith('q:')) { const qs = visibleQs(st.a), qi = qs.findIndex((q) => 'q:' + q.id === st.key); html = questionHTML(qs[qi], qi, qs.length); }
  else if (st.key === 'insight') html = insightHTML();
  else if (st.key === 'result') html = resultHTML();
  body.innerHTML = `<div class="scr${RM.matches ? '' : ' enter'}">${html}</div>`;
  if (st.key === 'result') { paintCard(); sendDone(); }
  if (st.acted) focusScreen();
}

function openLabel() {
  if (acct.kind === 'full') return `Open ${esc(cover.name)} <span aria-hidden="true">→</span>`;
  if (acct.kind === 'missing') return `Open ${esc(cover.name)} <span aria-hidden="true">→</span>`;
  if (acct.kind === 'checking') return `Open ${esc(cover.name)} <span aria-hidden="true">→</span>`;
  return 'Open with a free account <span aria-hidden="true">→</span>';
}
function coverScreen() {
  const s = saved(), back = s && s.done;
  const hello = acct.kind === 'full' && G.firstOf(acct.me) ? `<p class="eyebrow" style="margin-bottom:8px">Welcome back, ${esc(G.firstOf(acct.me))}</p>` : '';
  return `<div class="start">${coverHTML(cover)}
    <div>${hello}<h1 class="qh big">${esc(t.intro.h === cover.headText ? t.name : t.intro.h)}</h1>
      <p class="lede">${esc(t.intro.p)}</p>
      <div class="okrow" style="margin-top:24px"><button class="btn big" data-act="open" data-primary>${openLabel()}</button><span class="kbd">or press Enter ↵</span></div>
      ${back ? '<p class="alt"><button class="linkbtn" data-act="last">See my last reading</button></p>' : ''}
      <p class="fine">${esc(t.intro.fine)}${acct.kind === 'full' ? '' : ' One account opens every tool, The Leader’s North Star and The Founder Launchpad.'}</p>
    </div></div>`;
}

function questionHTML(q, qi, total) {
  const a = st.a, hid = `${t.id}-${q.id}-h`, did = `${t.id}-${q.id}-d`;
  let ctl = '';
  if (q.type === 'tap') {
    ctl = `<div class="opts" role="group" tabindex="-1" aria-labelledby="${hid}" aria-describedby="${did}">` + q.options.map((o, k) => `<button class="opt" data-act="pick" data-v="${k}" aria-pressed="${a[q.id] === k}"><span class="key" aria-hidden="true">${k + 1}</span><span>${esc(o)}</span></button>`).join('') + '</div>';
  } else if (q.type === 'day') {
    ctl = `<div class="opts days" role="group" tabindex="-1" aria-labelledby="${hid}" aria-describedby="${did}">` + DAYS.map((d, k) => `<button class="opt" data-act="pick" data-v="${k}" aria-pressed="${a[q.id] === k}" aria-label="${k === 0 ? 'Today, ' : k === 1 ? 'Tomorrow, ' : ''}${esc(dayLong(d))}"><span class="key" aria-hidden="true">${k + 1}</span><b>${k === 0 ? 'Today' : k === 1 ? 'Tomorrow' : esc(d.toLocaleDateString('en-US', { weekday: 'short' }))}</b><small>${esc(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))}</small></button>`).join('') + '</div>';
  } else if (q.type === 'slide' || q.type === 'money') {
    const isMoney = q.type === 'money', has = a[q.id] !== undefined;
    const min = isMoney ? (q.minIdx || 0) : val(q.min, a), max = isMoney ? MONEY_STEPS.length - 1 : val(q.max, a);
    let pos = st.draft[q.id] !== undefined ? st.draft[q.id] : has ? (isMoney ? nearestIdx(a[q.id]) : a[q.id]) : val(q.start, a);
    pos = Math.max(min, Math.min(max, pos));
    const touched = has || st.draft[q.id] !== undefined;
    const shown = isMoney ? (has && st.draft[q.id] === undefined ? a[q.id] : MONEY_STEPS[pos]) : pos;
    const vtxt = isMoney ? money(shown) : q.fmt(shown), wtxt = isMoney ? '' : q.words(shown);
    ctl = `<div class="readout"><output class="val${touched ? '' : ' idle'}" data-val aria-hidden="true">${esc(touched ? vtxt : (isMoney ? '$ —' : '—'))}</output><span class="words" data-words>${touched ? esc(wtxt) : 'Move the slider to your number'}</span></div>`;
    if (isMoney && st.exact[q.id]) {
      ctl += `<label class="exact" for="${t.id}-${q.id}-x"><span aria-hidden="true">$</span><input id="${t.id}-${q.id}-x" type="text" inputmode="numeric" autocomplete="off" data-exact aria-labelledby="${hid}" aria-describedby="${did}" value="${has ? esc(String(a[q.id])) : ''}" placeholder="0"></label>
        <div style="margin-top:8px"><button class="linkbtn" data-act="exact">Use the slider instead</button></div>`;
    } else {
      ctl += `<input id="${t.id}-${q.id}-r" type="range" min="${min}" max="${max}" step="${isMoney ? 1 : q.step}" value="${pos}" data-range aria-labelledby="${hid}" aria-describedby="${did}" aria-valuetext="${esc(touched ? vtxt + (wtxt ? ' ' + wtxt : '') : 'not set yet')}">
        <div class="ends"><span>${esc(isMoney ? money(MONEY_STEPS[min]) : val(q.ends[0], a))}</span><span>${esc(isMoney ? money(MONEY_STEPS[max]) + '+' : val(q.ends[1], a))}</span></div>
        ${isMoney ? '<div style="margin-top:6px"><button class="linkbtn" data-act="exact">Type the exact amount</button></div>' : ''}`;
    }
    ctl += '<div class="okrow"><button class="btn" data-act="ok" data-primary>OK <span aria-hidden="true">✓</span></button><span class="kbd">or press Enter ↵</span></div><p class="nudge" data-nudge role="status"></p>';
  } else if (q.type === 'text') {
    ctl = `<input class="txt" id="${t.id}-${q.id}-t" type="text" autocomplete="off" maxlength="80" data-text aria-labelledby="${hid}" aria-describedby="${did}" placeholder="${esc(q.ph || '')}" value="${esc(a[q.id] || '')}">
      <div class="okrow"><button class="btn" data-act="ok" data-primary>OK <span aria-hidden="true">✓</span></button><span class="kbd">or press Enter ↵</span>${q.optional ? '<button class="linkbtn" data-act="skip">Skip</button>' : ''}</div><p class="nudge" data-nudge role="status"></p>`;
  }
  return `<div class="qtop"><button class="back" data-act="back">← Back</button><span class="count">Question ${qi + 1} of ${total}</span></div>
    <h2 class="qh" id="${hid}">${esc(val(q.q, a))}</h2>
    <p class="hint" id="${did}">${esc(q.hint)}</p>
    <div class="ctl">${ctl}</div>`;
}
const nearestIdx = (v) => { let best = 0; MONEY_STEPS.forEach((m, i) => { if (Math.abs(m - v) < Math.abs(MONEY_STEPS[best] - v)) best = i; }); return best; };

function insightHTML() {
  const x = t.insight(st.a);
  return `<div class="qtop"><button class="back" data-act="back">← Back</button><span class="count">Your first number</span></div>
    <p class="eyebrow">From your own answers</p>
    <h2 class="big-n">${esc(x.big)}</h2>
    <p class="big-l">${esc(x.line)}</p>
    ${x.calcline ? `<p class="calcline">${esc(x.calcline)}</p>` : ''}
    <div class="vis">${x.vis}</div>
    <div class="tease"><p>Your full reading adds:</p><ul>${x.tease.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>
    <div class="okrow" style="margin-top:22px"><button class="btn big" data-act="next" data-primary>Show my full reading <span aria-hidden="true">→</span></button><span class="kbd">or press Enter ↵</span></div>`;
}

function resultHTML() {
  const r = t.result(st.a, st);
  const rowsH = r.rows.map(([l, v, s]) => `<div class="row"><span>${esc(l)}${s ? `<small>${esc(s)}</small>` : ''}</span><b>${esc(v)}</b></div>`).join('')
    + `<div class="row total"><span>${esc(r.total[0])}${r.total[2] ? `<small>${esc(r.total[2])}</small>` : ''}</span><b>${esc(r.total[1])}</b></div>`;
  const othersH = r.others.length ? `<div class="sec"><span class="eyebrow">Other ways to read it</span><div class="rows">${r.others.map(([l, v, s]) => `<div class="row"><span>${esc(l)}${s ? `<small>${esc(s)}</small>` : ''}</span><b>${esc(v)}</b></div>`).join('')}</div></div>` : '';
  const linesH = r.lines.map((ln, k) => `<div class="line"><div class="lab">${FOUR[k][0]}<em>${FOUR[k][1]}</em></div><p>${ln}</p></div>`).join('');
  return `<div class="qtop"><button class="back" data-act="back">← Back</button><span class="count">Your reading</span></div>
    <h2 class="res-h" tabindex="-1" data-focus>${r.h}</h2>
    <p class="res-sub">${esc(r.sub)}</p>
    <div class="sec"><span class="eyebrow">The sum</span><div class="rows">${rowsH}</div></div>
    ${othersH}
    <div class="sec"><span class="eyebrow">Four lines, from your answers</span><div class="lines">${linesH}</div></div>
    <div class="ask"><p>${esc(r.ask)}</p><small>THE COST OF WAITING · A QUESTION ONLY YOU CAN ANSWER</small></div>
    <div class="step"><p class="eyebrow">Your step this week</p><p class="when">${esc(r.when)}</p><p>${esc(r.action)}</p>
      <div class="okrow"><button class="btn ghost" data-act="copystep">Copy my step</button></div><p class="status" data-status-step role="status"></p></div>
    <blockquote class="quote">“${esc(r.quote.t)}”<cite>${esc(r.quote.src)}</cite></blockquote>
    <div class="sec cardbox"><span class="eyebrow">Your share card</span>
      <img alt="Your share card for ${esc(t.name)}" data-card width="1200" height="630">
      <div class="cardctl"><label><input type="checkbox" data-shownum ${st.show ? 'checked' : ''}> Show my number on the card</label>
        <button class="linkbtn" data-act="copyimg">Copy image</button><button class="linkbtn" data-act="copycap">Copy a caption</button></div>
      <p class="status" data-status-card role="status">Off by default: no private numbers unless you tick the box. Long-press or right-click the card to save it.</p></div>
    <div class="ns"><p class="eyebrow">Your next step · free</p><h3>See the whole picture.</h3><p>${esc(r.bridge)}</p>
      <a class="btn big" href="${NS_URL}?utm_source=tools&amp;utm_medium=${encodeURIComponent(KEY)}">Open The Leader’s North Star <span aria-hidden="true">→</span></a>
      <p class="fine">Free · No card · Eight plain questions</p></div>
    <p class="honest">${r.honest}</p>
    <div class="again"><button class="linkbtn" data-act="restart">Start again</button><a class="linkbtn" href="/tools/">All your tools</a></div>`;
}

/** The reading reached: kept on this device, then copied to the account once. */
function sendDone() {
  keep({ a: st.a, done: true, at: new Date().toISOString() });
  if (st.sent || !A.joined()) return;
  st.sent = true;
  const x = t.insight(st.a);
  api('/api/tools', { step: 'done', answers: st.a, summary: x.big });
}

async function paintCard() {
  const img = body.querySelector('[data-card]');
  if (!img) return;
  try { img.src = await drawCard(t, st.a, st.show); }
  catch { const s = body.querySelector('[data-status-card]'); if (s) s.textContent = 'The card could not be drawn in this browser.'; }
}

function focusScreen() {
  const el = body.querySelector('[data-focus]') || body.querySelector('.opt[aria-pressed="true"]') || body.querySelector('[data-exact], [data-range], [data-text], .opts, [data-primary]');
  if (el) { try { el.focus({ preventScroll: true }); } catch { el.focus(); } }
  const top = root.getBoundingClientRect().top;
  if (top < 0 || (st.key === 'result' && top > innerHeight * 0.5)) root.scrollIntoView({ block: 'start', behavior: RM.matches ? 'auto' : 'smooth' });
}

/* ── Opening the tool ───────────────────────────────────────── */
function start(me) {
  acct = { kind: 'full', me };
  st.name = G.firstOf(me);
  api('/api/tools', { step: 'open' });
  const first = visibleQs(st.a)[0];
  st.key = 'q:' + first.id; st.acted = true; render();
}
async function openTool() {
  if (acct.kind === 'checking' || acct.kind === 'offline') acct = await G.state();
  if (acct.kind === 'full') return start(acct.me);
  st.key = 'gate'; bar.style.width = '0%';
  G.open(body, { name: cover.name, path: cover.href, st: acct, ready: start, cancel: () => { st.key = 'cover'; render(); } });
}

/* ── Events ─────────────────────────────────────────────────── */
const currentQ = () => (st.key.startsWith('q:') ? t.qs.find((q) => 'q:' + q.id === st.key) : null);
const nudge = (msg) => { const n = body.querySelector('[data-nudge]'); if (n) n.textContent = msg; };
const remember = () => keep({ a: st.a, done: false });

body.addEventListener('click', (e) => {
  if (st.key === 'gate') return;
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, q = currentQ();
  if (act === 'open') return openTool();
  if (act === 'last') { st.key = 'result'; st.acted = true; return render(); }
  if (act === 'next') return go(1);
  if (act === 'back') { if (q) delete st.draft[q.id]; if (st.key === visibleQs(st.a).map((x) => 'q:' + x.id)[0]) { st.key = 'cover'; st.acted = true; return render(); } return go(-1); }
  if (act === 'pick') {
    if (!q || st.lock) return;
    st.a[q.id] = Number(b.dataset.v); st.lock = true; remember();
    body.querySelectorAll('.opt').forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    setTimeout(() => { st.lock = false; go(1); }, RM.matches ? 60 : 220);
    return;
  }
  if (act === 'exact') { st.exact[q.id] = !st.exact[q.id]; return render(); }
  if (act === 'skip') { st.a[q.id] = ''; remember(); return go(1); }
  if (act === 'restart') { st.a = {}; st.draft = {}; st.exact = {}; st.show = false; st.sent = false; keep({ a: {}, done: false }); st.key = 'q:' + visibleQs(st.a)[0].id; st.acted = true; return render(); }
  if (act === 'ok') return ok();
  if (act === 'copystep') return copyText(t.result(st.a, st), '[data-status-step]', true);
  if (act === 'copycap') return copyText(t.result(st.a, st), '[data-status-card]', false);
  if (act === 'copyimg') return copyImage();
});

function ok() {
  const q = currentQ(); if (!q) return;
  if (q.type === 'text') { st.a[q.id] = body.querySelector('[data-text]').value.trim().slice(0, 80); remember(); return go(1); }
  if (q.type === 'money' && st.exact[q.id]) {
    const raw = body.querySelector('[data-exact]').value.replace(/[$,\s]/g, ''), n = Number(raw);
    if (raw === '' || !Number.isFinite(n) || n < 0) return nudge('Type a whole amount in dollars, like 12500.');
    if (q.minIdx && n <= 0) return nudge('A normal month needs at least one cost. Type your best guess.');
    st.a[q.id] = Math.round(n); delete st.draft[q.id]; remember(); return go(1);
  }
  if (q.type === 'slide' || q.type === 'money') {
    if (st.draft[q.id] === undefined && st.a[q.id] === undefined) return nudge('Move the slider to your number first. Arrow keys work too.');
    if (st.draft[q.id] !== undefined) st.a[q.id] = q.type === 'money' ? MONEY_STEPS[st.draft[q.id]] : st.draft[q.id];
    delete st.draft[q.id];
    // A smaller "hours worked" can leave "hours that needed you" above it.
    if (q.id === 'hours' && st.a.need !== undefined && st.a.need > st.a.hours) delete st.a.need;
    remember(); return go(1);
  }
}

body.addEventListener('input', (e) => {
  const q = currentQ(); if (!q) return;
  if (e.target.matches('[data-range]')) {
    const pos = Number(e.target.value); st.draft[q.id] = pos;
    const isMoney = q.type === 'money', v = isMoney ? MONEY_STEPS[pos] : pos;
    const vt = isMoney ? money(v) : q.fmt(v), wt = isMoney ? '' : q.words(v);
    const out = body.querySelector('[data-val]'); out.textContent = vt; out.classList.remove('idle');
    body.querySelector('[data-words]').textContent = wt;
    e.target.setAttribute('aria-valuetext', vt + (wt ? ' ' + wt : ''));
    nudge('');
  }
  if (e.target.matches('[data-exact]')) {
    const n = Number(e.target.value.replace(/[$,\s]/g, '')), out = body.querySelector('[data-val]');
    if (e.target.value.trim() !== '' && Number.isFinite(n)) { out.textContent = money(n); out.classList.remove('idle'); }
    nudge('');
  }
  if (e.target.matches('[data-text]')) nudge('');
});
body.addEventListener('change', (e) => { if (e.target.matches('[data-shownum]')) { st.show = e.target.checked; paintCard(); } });
body.addEventListener('keydown', (e) => {
  if (st.key === 'gate') return;
  const isText = e.target.matches('input[type=text], input[type=email]');
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    if (e.target.matches('button, a, input[type=checkbox]')) return;
    const p = body.querySelector('[data-primary]'); if (p) { e.preventDefault(); p.click(); }
    return;
  }
  if (!isText && !e.metaKey && !e.ctrlKey && !e.altKey && /^[1-9]$/.test(e.key)) {
    const o = body.querySelectorAll('.opt')[Number(e.key) - 1]; if (o) { e.preventDefault(); o.click(); }
  }
});
// Enter on the cover, before anything has focus.
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && st.key === 'cover' && e.target === document.body) { e.preventDefault(); openTool(); } });

async function copyText(r, sel, step) {
  const s = body.querySelector(sel), text = step ? `${r.when}: ${r.action}` : r.caption;
  try { await navigator.clipboard.writeText(text); s.textContent = step ? 'Copied. Paste it into your calendar.' : 'Caption copied.'; }
  catch { s.textContent = 'Copy didn’t work in this browser. Select the text and copy it.'; }
}
async function copyImage() {
  const s = body.querySelector('[data-status-card]'), cv = document.getElementById('cardcv');
  try {
    await drawCard(t, st.a, st.show);
    if (!window.ClipboardItem || !navigator.clipboard || !navigator.clipboard.write) throw new Error('no clipboard');
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': new Promise((res) => cv.toBlob(res, 'image/png')) })]);
    s.textContent = 'Image copied. Paste it into your post.';
  } catch { s.textContent = 'This browser didn’t allow copying the image. Long-press or right-click the card to save it.'; }
}

/* ── Start ──────────────────────────────────────────────────── */
render();
loadFonts();
G.state().then((s) => {
  acct = s;
  if (s.me) st.name = G.firstOf(s.me);
  if (st.key === 'cover') render();
});
import('/profile-menu.js').then((m) => m.mount(document.getElementById('pmhost'), { guest: true })).catch(() => {});
