/* The two writing tools of the Growth Toolkit on their own pages
 * (/reel-structure/, /branding-structure/): the cover → the way in (an
 * account, or a code by email, public/tools/gate.js) → one field per screen →
 * the result, built only from the founder's own words.
 *
 * Same rules as the number tools (public/tools/engine.js, untouched): answers
 * save to this device first, always (localStorage, try/catch); with an
 * account, the answers and a one-line result are copied once, when the
 * founder reaches the result (/api/tools), so Alexandru and the team can read
 * them before a session. With a code's pass they stay on the device.
 * The words and the sums are in writer-data.js. */
import { writerByKey, reelTiming, reelScriptLabelled, teleprompterHref, goldCandidates, askMessage, splitWords, partOf, wordsIn, secondsFor, secsText, clock, REEL_MAX } from '/tools/writer-data.js';
import { byKey as coverOf, coverHTML } from '/tools/catalog.js';
import * as G from '/tools/gate.js';
import * as A from '/account.js';

const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NS_URL = 'https://linktolead.exploraself.com/northstar/';

const root = document.getElementById('tool');
const KEY = root.dataset.tool;
const t = writerByKey(KEY), cover = coverOf(KEY);
const body = root.querySelector('.body'), bar = root.querySelector('.prog i');
const STORE = 'ftb-tool-' + KEY;
const saved = () => { try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch { return null; } };
const keep = (x) => { try { localStorage.setItem(STORE, JSON.stringify(x)); } catch { /* private mode */ } };

let acct = { kind: 'checking', me: null };
const st = { key: 'cover', a: {}, asked: [false, false, false], name: '', acted: false, sent: false };
{ const s = saved(); if (s && s.a && typeof s.a === 'object') st.a = s.a; if (s && Array.isArray(s.asked)) st.asked = s.asked.slice(0, 3).map(Boolean); }

const keysOf = () => ['cover', ...t.qs.map((q) => 'q:' + q.id), 'result'];
const remember = (done = false) => keep({ a: st.a, asked: st.asked, done, at: new Date().toISOString() });
const TZ = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; } })();
const api = (payload) => fetch('/api/tools', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: A.token(), tool: KEY, tz: TZ, ...payload }) }).catch(() => null);
const currentQ = () => (st.key.startsWith('q:') ? t.qs.find((q) => 'q:' + q.id === st.key) : null);

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
  else if (st.key.startsWith('q:')) { const qi = t.qs.findIndex((q) => 'q:' + q.id === st.key); html = questionHTML(t.qs[qi], qi); }
  else if (st.key === 'result') html = t.kind === 'reel' ? reelResult() : brandResult();
  body.innerHTML = `<div class="scr${RM.matches ? '' : ' enter'}">${html}</div>`;
  grow(body.querySelector('textarea[data-text]'));
  if (st.key === 'result') sendDone();
  if (st.acted) focusScreen();
}

function coverScreen() {
  const s = saved(), back = s && s.done;
  const hello = acct.kind === 'full' && G.firstOf(acct.me) ? `<p class="eyebrow" style="margin-bottom:8px">Welcome back, ${esc(G.firstOf(acct.me))}</p>` : '';
  const open = acct.kind === 'guest' ? 'Open it free <span aria-hidden="true">→</span>' : `Open ${esc(cover.name)} <span aria-hidden="true">→</span>`;
  return `<div class="start">${coverHTML(cover)}
    <div>${hello}<h1 class="qh big">${esc(t.intro.h)}</h1>
      <p class="lede">${esc(t.intro.p)}</p>
      <div class="okrow" style="margin-top:24px"><button class="btn big" data-act="open" data-primary>${open}</button><span class="kbd">or press Enter ↵</span></div>
      ${back ? `<p class="alt"><button class="linkbtn" data-act="last">${t.kind === 'reel' ? 'See my last script' : 'See my last page'}</button></p>` : ''}
      <p class="fine">${esc(t.intro.fine)}${acct.kind === 'guest' ? ' With an account it opens at once; without one, we email you your own code.' : ''}</p>
    </div></div>`;
}

/* ── One field per screen ───────────────────────────────────── */
const grow = (el) => { if (!el) return; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
function questionHTML(q, qi) {
  const a = st.a, hid = `${KEY}-${q.id}-h`, did = `${KEY}-${q.id}-d`;
  let ctl = '';
  const okRow = (label = 'OK') => `<div class="okrow"><button class="btn" data-act="ok" data-primary>${label} <span aria-hidden="true">✓</span></button><span class="kbd">or press Enter ↵</span></div><p class="nudge" data-nudge role="status"></p>`;
  if (q.type === 'line' || q.type === 'edit') {
    const v = q.type === 'edit' && a[q.id] === undefined ? q.draft(a) : (a[q.id] || '');
    // A text area that grows with the line, so a full sentence stays in view
    // on a phone; Enter is still Next (one field per screen).
    ctl = `<textarea class="txt area" id="${KEY}-${q.id}-t" rows="1" autocomplete="off" maxlength="200" data-text aria-labelledby="${hid}" aria-describedby="${did}" placeholder="${esc(q.ph || '')}">${esc(v)}</textarea>`
      + (q.timed ? `<p class="secs" data-secs aria-live="polite">${secsLine(q, v)}</p>` : '')
      + (q.type === 'edit' ? `<p class="secs" data-wc>${wcLine(v)}</p>` : '')
      + okRow();
  } else if (q.type === 'pick3') {
    const picked = Array.isArray(a.gold) ? a.gold : [];
    const words = goldCandidates(a);
    ctl = words.length
      ? `<div class="chips" role="group" aria-labelledby="${hid}" aria-describedby="${did}">${words.map((w) => `<button class="chip" data-act="chip" data-w="${esc(w)}" aria-pressed="${picked.includes(w)}">${esc(w)}</button>`).join('')}</div>
        <p class="secs" data-picked>${pickedLine(picked)}</p>`
      : '<p class="hint">Your lines are very short, so there are no words to pick yet. Go back and write a full sentence or two, or move on.</p>';
    ctl += okRow(words.length ? 'OK' : 'Move on');
  } else if (q.type === 'words3') {
    const list = Array.isArray(a[q.id]) ? a[q.id] : [];
    ctl = `<div class="wordin"><input class="txt" id="${KEY}-${q.id}-t" type="text" autocomplete="off" maxlength="40" data-word aria-labelledby="${hid}" aria-describedby="${did}" placeholder="${esc(q.ph || '')}"${list.length >= 3 ? ' disabled' : ''}>
        <button class="btn ghost" data-act="addword"${list.length >= 3 ? ' disabled' : ''}>Add</button></div>
      <div class="chips" data-list style="margin-top:14px">${list.map((w, k) => `<button class="chip on" data-act="delword" data-i="${k}" aria-label="Remove ${esc(w)}">${esc(w)}<span class="x" aria-hidden="true">×</span></button>`).join('')}</div>
      <p class="secs">${list.length} of 3</p>` + okRow();
  }
  return `<div class="qtop"><button class="back" data-act="back">← Back</button><span class="count">${esc(t.kind === 'reel' ? 'Step' : 'Question')} ${qi + 1} of ${t.qs.length}</span></div>
    <h2 class="qh" id="${hid}">${esc(q.q)}</h2>
    <p class="hint" id="${did}">${esc(q.hint)}</p>
    <div class="ctl">${ctl}</div>`;
}
/** Under a Reel line: this line's seconds, and the whole script so far. */
function secsLine(q, v) {
  const n = wordsIn(v), s = secondsFor(n), p = partOf(q.id);
  const all = reelTiming({ ...st.a, [q.id]: v });
  const over = p && p.ids.length === 1 && s > p.max + 0.5;
  return `<span class="${over ? 'over' : ''}">${n ? `<b>${n} ${n === 1 ? 'word' : 'words'} · ${secsText(s)}</b>` : 'Type your line'}${p && p.ids.length === 1 ? ` · aim for ${p.max} s or less` : ''}</span><span class="sofar">So far: ${clock(all.secs)} of ${clock(REEL_MAX)}</span>`;
}
const wcLine = (v) => { const n = wordsIn(v); return `${n} ${n === 1 ? 'word' : 'words'}${n > 20 ? ' · over 20: try a shorter one' : ''}`; };
const pickedLine = (p) => (p.length === 3 ? `<b>3 of 3:</b> ${p.map(esc).join(' · ')}` : `${p.length} of 3 chosen`);

/* ── The Reel: the script, second by second ─────────────────── */
function goldify(text, gold) {
  const h = esc(text);
  if (!gold.length) return h;
  // One pass over the escaped text, every occurrence, any case.
  const alt = gold.map((w) => esc(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).sort((x, y) => y.length - x.length).join('|');
  return h.replace(new RegExp(`(?<![\\p{L}\\p{N}&#])(${alt})(?![\\p{L}\\p{N}])`, 'giu'), '<mark class="gold">$1</mark>');
}
function reelResult() {
  const a = st.a, T = reelTiming(a), gold = Array.isArray(a.gold) ? a.gold : [];
  const first = st.name;
  const h = `${first ? esc(first) + ', your' : 'Your'} Reel runs ${esc(T.verdict.h)}.`;
  const lines = T.parts.filter((p) => p.text).map((p) => `<div class="sline"><div class="lab">${esc(p.label)}<small>${clock(p.from)}–${clock(p.to)}</small></div>
      <div><p>${goldify(p.text, gold)}</p>${p.note ? `<p class="flag">${esc(p.note)}</p>` : ''}</div></div>`).join('');
  const total = Math.max(REEL_MAX, T.secs);
  const segs = T.parts.filter((p) => p.secs > 0).map((p, k) => `<i class="seg s${k % 2}" style="width:${(p.secs / total * 100).toFixed(2)}%" title="${esc(p.label)}"></i>`).join('');
  return `<div class="qtop"><button class="back" data-act="back">← Back</button><span class="count">Your Reel</span></div>
    <p class="eyebrow">Your Reel, ready to film</p>
    <h2 class="res-h" tabindex="-1" data-focus>${h}</h2>
    <p class="res-sub">For ${esc(String(a.who || 'one person').replace(/[.!?]+$/, ''))}. ${T.words} words at a calm pace (140 a minute, the same as the Teleprompter). ${esc(T.verdict.line)}</p>
    <div class="sec"><span class="eyebrow">The length</span>
      <div class="tl" role="img" aria-label="${esc(`${Math.round(T.secs)} seconds of ${REEL_MAX}`)}">${segs}<b class="tl-40" style="left:${(REEL_MAX / total * 100).toFixed(2)}%"></b></div>
      <div class="ends"><span>0:00</span><span>${clock(REEL_MAX)}${T.secs > REEL_MAX + 0.5 ? ` · yours ${clock(T.secs)}` : ''}</span></div></div>
    <div class="sec printpage"><span class="eyebrow">The script, second by second</span><div class="script">${lines}</div>
      ${gold.length ? `<div class="goldrow" aria-label="Your three gold words">${gold.map((w) => `<span>${esc(w)}</span>`).join('')}</div><p class="secs">Captions on the whole time. These three in gold, everything else in white.</p>` : ''}</div>
    <div class="okrow" style="margin-top:22px"><a class="btn big gold" href="${esc(teleprompterHref(a))}">Open in the Teleprompter <span aria-hidden="true">→</span></a>
      <button class="btn ghost" data-act="copyscript">Copy the script</button><button class="linkbtn" data-act="print">Print</button></div>
    <p class="status" data-status-script role="status"></p>
    <div class="sec"><span class="eyebrow">On camera</span><ul class="rules">
      <li>Complete sentences only. Never stop in the middle of one.</li>
      <li>In the hold, change the picture every 2 to 3 seconds: a cut, a zoom, a word on screen.</li>
      <li>Captions on, three words in gold.</li>
      <li>One call to action, at the end. Only one.</li></ul></div>
    ${stepBox()}
    ${nsBox()}
    <p class="honest">The seconds are counted from your own words at a calm pace. A faster or slower voice changes them a little; the Teleprompter’s timer shows the real length when you film.</p>
    <div class="again"><button class="linkbtn" data-act="restart">Start again</button><a class="linkbtn" href="/tools/">Your Growth Toolkit</a></div>`;
}

/* ── The brand on one page ──────────────────────────────────── */
function brandResult() {
  const a = st.a, first = st.name;
  const always = Array.isArray(a.always) ? a.always : [], never = Array.isArray(a.never) ? a.never : [];
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const prob = String(a.problem || '').trim().replace(/^[“"']+|[”"']+$/g, '');
  const row = (lab, v) => `<div class="bp-row"><div class="lab">${esc(lab)}</div><div>${v}</div></div>`;
  return `<div class="qtop"><button class="back" data-act="back">← Back</button><span class="count">Your page</span></div>
    <p class="eyebrow">Your brand on one page</p>
    <h2 class="res-h" tabindex="-1" data-focus>${first ? `${esc(first)}, here` : 'Here'} is how your customers should be able to say it.</h2>
    <p class="res-sub">Every line is yours. Print it, keep it where you write your posts and your offers, and check each new one against it.</p>
    <div class="sec printpage"><div class="brandpage">
      <p class="eyebrow">My brand on one page</p>
      <p class="bp-one">${esc(a.oneliner || '')}</p>
      <div class="bp-grid">
        ${row('Who I serve', esc(a.who))}
        ${row('Their problem, in their words', `<q>${esc(prob)}</q>`)}
        ${row('From → to', `<div class="bp-ft"><div><small>From</small>${esc(a.from)}</div><span class="arr" aria-hidden="true">→</span><div class="to"><small>To</small>${esc(a.to)}</div></div>`)}
        ${row('My proof', esc(a.proof))}
        ${row('They should feel', `<div class="bp-words">${always.map((w) => `<span>${esc(w)}</span>`).join('')}</div>`)}
        ${row('Never', `<div class="bp-words never">${never.map((w) => `<span>${esc(w)}</span>`).join('')}</div>`)}
      </div>
      <p class="bp-foot">${first ? esc(first) + ' · ' : ''}${esc(date)} · Growth Toolkit · ExploraSelf</p>
    </div></div>
    <div class="okrow" style="margin-top:20px"><button class="btn big" data-act="print">Print or save as PDF</button><button class="btn ghost" data-act="copyone">Copy my one-liner</button></div>
    <p class="status" data-status-one role="status"></p>
    <div class="sec"><span class="eyebrow">Ask three customers: “Is this you?”</span>
      <p class="hint" style="margin-top:0">You are not sure until they say it. Send this to three customers you have served, and change their name at the top.</p>
      <pre class="msg" data-msg>${esc(askMessage(a, first))}</pre>
      <div class="okrow"><button class="btn" data-act="copymsg">Copy the message</button></div><p class="status" data-status-msg role="status"></p>
      <div class="asked" role="group" aria-label="Who you asked">${[0, 1, 2].map((k) => `<label class="check"><input type="checkbox" data-asked="${k}"${st.asked[k] ? ' checked' : ''}> Customer ${k + 1} asked</label>`).join('')}</div></div>
    ${stepBox()}
    ${nsBox()}
    <p class="honest">Nothing on this page was written for you: it is your words, put in order. The one-liner is a draft from your answers until you say it out loud and it sounds like you.</p>
    <div class="again"><button class="linkbtn" data-act="restart">Start again</button><a class="linkbtn" href="/tools/">Your Growth Toolkit</a></div>`;
}

const stepBox = () => `<div class="step"><p class="eyebrow">Your step this week</p><p>${esc(t.step)}</p>
  <div class="okrow"><button class="btn ghost" data-act="copystep">Copy my step</button></div><p class="status" data-status-step role="status"></p></div>`;
const nsBox = () => `<div class="ns"><p class="eyebrow">Your next step · free</p><h3>See the whole picture.</h3>
  <p>${t.kind === 'reel' ? 'A Reel speaks to the market. The Leader’s North Star shows where you stand in all four areas: you, your people, your business and your market.' : 'Your brand is how the market sees you. The Leader’s North Star shows where you stand in all four areas: you, your people, your business and your market.'}</p>
  <a class="btn big" href="${NS_URL}?utm_source=tools&amp;utm_medium=${encodeURIComponent(KEY)}">Open The Leader’s North Star <span aria-hidden="true">→</span></a>
  <p class="fine">Free · No card · Eight plain questions</p></div>`;

/** The result reached: kept on this device, then copied to the account once. */
function sendDone() {
  remember(true);
  if (st.sent || !A.joined()) return;
  st.sent = true;
  api({ step: 'done', answers: st.a, summary: t.summary(st.a) });
}

function focusScreen() {
  // With three words in, focus goes to OK (Enter on a word would remove it).
  const el = body.querySelector('[data-focus]') || body.querySelector('[data-text]') || body.querySelector('[data-word]:not([disabled])')
    || body.querySelector('.chip[data-act="chip"]') || body.querySelector('[data-primary]');
  if (el) { try { el.focus({ preventScroll: true }); } catch { el.focus(); } }
  if (el && el.matches('[data-text]')) { const n = el.value.length; try { el.setSelectionRange(n, n); } catch { /* not a text field */ } }
  const top = root.getBoundingClientRect().top;
  if (top < 0 || (st.key === 'result' && top > innerHeight * 0.5)) root.scrollIntoView({ block: 'start', behavior: RM.matches ? 'auto' : 'smooth' });
}

/* ── Opening the tool ───────────────────────────────────────── */
function start(me) {
  acct = me ? { kind: 'full', me } : { kind: 'pass', me: null };
  st.name = G.firstOf(me);
  if (A.joined()) api({ step: 'open' });
  st.key = 'q:' + t.qs[0].id; st.acted = true; render();
}
async function openTool() {
  if (acct.kind === 'checking' || acct.kind === 'offline') acct = await G.state();
  if (acct.kind === 'full' && (await G.needsConfirm())) {
    st.key = 'gate'; bar.style.width = '0%';
    return G.confirmMe(body, { me: acct.me, tool: KEY, ready: start, cancel: () => { st.key = 'cover'; render(); } });
  }
  if (acct.kind === 'full' || acct.kind === 'pass') return start(acct.me);
  st.key = 'gate'; bar.style.width = '0%';
  G.open(body, { name: cover.name, path: cover.href, st: acct, ready: start, cancel: () => { st.key = 'cover'; render(); } });
}

/* ── Events ─────────────────────────────────────────────────── */
const nudge = (msg) => { const n = body.querySelector('[data-nudge]'); if (n) n.textContent = msg; };

function ok() {
  const q = currentQ(); if (!q) return;
  if (q.type === 'line' || q.type === 'edit') {
    const v = body.querySelector('[data-text]').value.replace(/\s*\n+\s*/g, ' ').trim().slice(0, 200);
    if (!v) return nudge('Write one line first. A rough line is fine; you can change it later.');
    st.a[q.id] = v;
    // A changed script can drop a gold word that is no longer in it.
    if (t.kind === 'reel' && Array.isArray(st.a.gold)) { const c = goldCandidates(st.a, 999); st.a.gold = st.a.gold.filter((w) => c.includes(w)); }
    remember(); return go(1);
  }
  if (q.type === 'pick3') {
    const p = Array.isArray(st.a.gold) ? st.a.gold : [], n = goldCandidates(st.a).length;
    if (n >= 3 && p.length !== 3) return nudge(`Tap ${3 - p.length} more ${3 - p.length === 1 ? 'word' : 'words'}. Three in all.`);
    remember(); return go(1);
  }
  if (q.type === 'words3') {
    const inp = body.querySelector('[data-word]');
    if (inp && inp.value.trim()) addWords(q);
    const list = st.a[q.id] || [];
    if (list.length < 3) return nudge(`Add ${3 - list.length} more ${3 - list.length === 1 ? 'word' : 'words'}. Three in all.`);
    remember(); return go(1);
  }
}
function addWords(q) {
  const inp = body.querySelector('[data-word]'), list = Array.isArray(st.a[q.id]) ? st.a[q.id] : [];
  for (const w of splitWords(inp.value)) if (list.length < 3 && !list.some((x) => x.toLowerCase() === w.toLowerCase())) list.push(w.slice(0, 30));
  st.a[q.id] = list; remember(); st.acted = true; render();
}

body.addEventListener('click', (e) => {
  if (st.key === 'gate') return;
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act, q = currentQ();
  if (act === 'open') return openTool();
  if (act === 'last') { st.key = 'result'; st.acted = true; return render(); }
  if (act === 'back') { if (st.key === 'q:' + t.qs[0].id) { st.key = 'cover'; st.acted = true; return render(); } return go(-1); }
  if (act === 'ok') return ok();
  if (act === 'chip' && q) {
    const w = b.dataset.w, p = Array.isArray(st.a.gold) ? st.a.gold.slice() : [];
    const i = p.indexOf(w);
    if (i >= 0) p.splice(i, 1); else if (p.length < 3) p.push(w); else return nudge('Three words already. Tap one to take it off first.');
    st.a.gold = p; remember(); nudge('');
    body.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(p.includes(c.dataset.w))));
    body.querySelector('[data-picked]').innerHTML = pickedLine(p);
    return;
  }
  if (act === 'addword' && q) return addWords(q);
  if (act === 'delword' && q) { (st.a[q.id] || []).splice(Number(b.dataset.i), 1); remember(); st.acted = true; return render(); }
  if (act === 'restart') { st.a = {}; st.asked = [false, false, false]; st.sent = false; remember(); st.key = 'q:' + t.qs[0].id; st.acted = true; return render(); }
  if (act === 'print') { try { window.print(); } catch { /* no print here */ } return; }
  if (act === 'copyscript') return copy(reelScriptLabelled(st.a), '[data-status-script]', 'Script copied, with its seconds.');
  if (act === 'copyone') return copy(st.a.oneliner || '', '[data-status-one]', 'One-liner copied.');
  if (act === 'copymsg') return copy(askMessage(st.a, st.name), '[data-status-msg]', 'Message copied. Change [name] before you send it.');
  if (act === 'copystep') return copy(t.step, '[data-status-step]', 'Copied. Paste it into your calendar.');
});

body.addEventListener('input', (e) => {
  const q = currentQ(); if (!q) return;
  if (e.target.matches('[data-text]')) {
    nudge(''); grow(e.target);
    const s = body.querySelector('[data-secs]'); if (s && q.timed) s.innerHTML = secsLine(q, e.target.value);
    const w = body.querySelector('[data-wc]'); if (w) w.textContent = wcLine(e.target.value);
  }
  if (e.target.matches('[data-word]')) nudge('');
});
body.addEventListener('change', (e) => {
  if (e.target.matches('[data-asked]')) { st.asked[Number(e.target.dataset.asked)] = e.target.checked; remember(true); }
});
body.addEventListener('keydown', (e) => {
  if (st.key === 'gate') return;
  if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
  if (e.target.matches('[data-word]')) { e.preventDefault(); const q = currentQ(); if (e.target.value.trim()) return addWords(q); return ok(); }
  if (e.target.matches('button, a, input[type=checkbox]')) return;
  const p = body.querySelector('[data-primary]'); if (p) { e.preventDefault(); p.click(); }
});
// Enter on the cover, before anything has focus.
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && st.key === 'cover' && e.target === document.body) { e.preventDefault(); openTool(); } });

async function copy(text, sel, said) {
  const s = body.querySelector(sel);
  try { await navigator.clipboard.writeText(text); if (s) s.textContent = said; }
  catch { if (s) s.textContent = 'Copy didn’t work in this browser. Select the text and copy it.'; }
}

/* ── Start ──────────────────────────────────────────────────── */
render();
G.state().then((s) => {
  acct = s;
  if (s.me) st.name = G.firstOf(s.me);
  if (st.key === 'cover') render();
});
import('/profile-menu.js').then((m) => m.mount(document.getElementById('pmhost'), { guest: true })).catch(() => {});
