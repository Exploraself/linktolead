/* The study room: music, light and Focus mode for Your Base Camp, the
 * Library and Ask Alexandru (the dashboard). One player for the whole
 * dashboard; the Cabinet's record player and the mini player both drive it.
 *
 * The music (4 Nov 2026, Alexandru: "cancel the existing music and add 2
 * categories, classic and modern") is real recordings, kept in the R2 bucket
 * music-background in two folders, Classic/ and Modern/, and listed and
 * streamed by /api/music. Upload a file to a folder and it appears here:
 * nothing to change in code. The pieces of a category play one after the
 * other, round and round. The six pieces the browser used to play are gone,
 * and the Energy slider with them (it only shaped those).
 *
 * Light (dimmer ↔ brighter) lays a warm shade over the whole page. The Lamp
 * (Focus mode's third part) turns that shade into a pool of lamplight that
 * follows the question the founder is writing, and the room answers the
 * work: each finished answer plays a soft chord and lights one of seven
 * candles for the domain. Study mode and Focus mode are the two presets of
 * music, light and the Lamp together.
 *
 * Never plays before a click: the browser forbids it and so do we. Two
 * minutes on the dashboard (Your Base Camp, the programme, the Library,
 * Ask Alexandru) brings one quiet invitation (once a day at most).
 * Under prefers-reduced-motion nothing spins or slides. Settings are kept on
 * this browser only (localStorage 'es-music'). */

const KEY = 'es-music';
const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const put = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };

/** The two shelves of music, as the bucket's two folders. */
export const CATS = {
  classic: { n: 'Classic', d: 'Piano, strings, the great composers' },
  modern: { n: 'Modern', d: 'Calm, steady music of today' },
};
export const MODES = {
  study: { n: 'Study mode', d: 'Classic music, calm, the light softened', cat: 'classic', light: 82, lamp: false },
  focus: { n: 'Focus mode', d: 'Dimmed room, modern music, and the Lamp', cat: 'modern', light: 48, lamp: true },
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const num = (v, d) => (v != null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : d);
/** The founder's settings, with safe defaults. */
export function settings() {
  let s = {};
  try { s = JSON.parse(get(KEY) || '{}') || {}; } catch { s = {}; }
  return {
    cat: CATS[s.cat] ? s.cat : 'classic',
    track: typeof s.track === 'string' && s.track.includes('/') ? s.track : '',
    vol: clamp(num(s.vol, num(get('cab-vol'), 55)), 0, 100),
    light: clamp(num(s.light, 100), 0, 100),
    mode: MODES[s.mode] ? s.mode : '',
    lamp: s.lamp === true,
  };
}
let S = settings();
const keep = () => put(KEY, JSON.stringify(S));

/** How dark the shade is for a light setting: 100 = none, 0 = deep dusk. */
export const shade = (light) => Math.round((1 - clamp(light, 0, 100) / 100) * 0.62 * 100) / 100;

/* ── The music library (/api/music) ──────────────────────────────────────── */
let LIB = { classic: [], modern: [] }, libState = 'idle', libP = null;
/** Fetch the two lists once; again only after a failure. */
export function load() {
  if (libState === 'ready' || libState === 'loading') return libP;
  if (typeof fetch !== 'function') { libState = 'failed'; return Promise.resolve(); }
  libState = 'loading';
  libP = fetch('/api/music').then((r) => r.json()).then((j) => {
    LIB = { classic: Array.isArray(j.classic) ? j.classic : [], modern: Array.isArray(j.modern) ? j.modern : [] };
    libState = 'ready';
    if (!pieces().some((p) => p.key === S.track)) S.track = '';
    tell();
  }).catch(() => { libState = 'failed'; tell(); });
  return libP;
}
/** The pieces on one shelf. */
export const pieces = (cat = S.cat) => LIB[cat] || [];
/** The piece chosen now (or the shelf's first), or null when the shelf is empty. */
export function now() { const l = pieces(); return l.find((p) => p.key === S.track) || l[0] || null; }
/** What the players show as the title. */
export function nowTitle() {
  const p = now();
  if (p) return p.title;
  return libState === 'ready' || libState === 'failed' ? 'No music yet' : 'Study music';
}
/** For tests: set the library by hand. */
export function _setLibrary(lib) { LIB = { classic: lib.classic || [], modern: lib.modern || [] }; libState = 'ready'; }

/* ── The player ──────────────────────────────────────────────────────────── */
let au = null, playing = false, fadeT = null, errors = 0;
const src = (p) => `/api/music?f=${encodeURIComponent(p.key)}`;
const level = () => (S.vol / 100) * 0.8;
function audio() {
  if (au) return au;
  au = new Audio(); au.preload = 'none';
  au.addEventListener('ended', () => next());
  au.addEventListener('playing', () => { errors = 0; });
  au.addEventListener('error', () => {
    if (!playing) return;
    errors++;
    if (errors >= Math.max(1, pieces().length)) { playing = false; failed = true; tell(); return; }
    next();
  });
  return au;
}
function fade(to, ms, done) {
  if (!au) return;
  clearInterval(fadeT);
  const a = au, from = a.volume, steps = Math.max(1, Math.round(ms / 50));
  let i = 0;
  fadeT = setInterval(() => {
    i++; a.volume = clamp(from + (to - from) * (i / steps), 0, 1);
    if (i >= steps) { clearInterval(fadeT); fadeT = null; if (done) done(); }
  }, 50);
}
/** Put the chosen piece in the player (if it is not there already). */
function cue() {
  const p = now(); if (!p) return false;
  const a = audio();
  if (a.dataset.key !== p.key) { a.dataset.key = p.key; a.src = src(p); }
  return true;
}
/** The next piece on the shelf, round and round. */
function next() {
  const l = pieces(); if (!l.length) return;
  const i = l.findIndex((p) => p.key === (now() || {}).key);
  S.track = l[(i + 1) % l.length].key; keep();
  if (cue() && playing) { const a = audio(); if (l.length === 1) a.currentTime = 0; a.volume = level(); a.play().catch(() => {}); }
  tell();
}

/* ── Playing ─────────────────────────────────────────────────────────────── */
const subs = new Set();
/** Called with no arguments whenever anything changes (playing, settings). */
export const onChange = (fn) => { subs.add(fn); return () => subs.delete(fn); };
const tell = () => subs.forEach((fn) => { try { fn(); } catch { /* a painter failed */ } });
export const isOn = () => playing;
export let failed = false;

export function play() {
  if (typeof Audio === 'undefined') { failed = true; tell(); return; }
  const go = () => {
    if (!cue()) { playing = false; tell(); return; }
    const a = audio(); failed = false; playing = true;
    clearInterval(fadeT); fadeT = null; a.volume = 0;
    const pr = a.play();
    if (pr && pr.then) pr.then(() => fade(level(), 1500), () => { playing = false; tell(); });
    else fade(level(), 1500);
    tell();
  };
  if (libState === 'ready') go(); else { const l = load(); if (l && l.then) l.then(go); }
}
export function pause() {
  if (!au || !playing) { playing = false; tell(); return; }
  playing = false;
  const a = au;
  fade(0, 900, () => { if (!playing) a.pause(); });
  tell();
}
let userPaused = false;
export function toggle() { if (isOn()) { userPaused = true; pause(); } else { userPaused = false; play(); } }
export const pausedByFounder = () => userPaused;

/** The room answers the work: a soft rising chord over the music. */
let cctx = null;
function chime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    cctx = cctx || new AC(); cctx.resume();
    const t = cctx.currentTime + 0.05, v = 0.06 * (S.vol / 100);
    [72, 76, 79, 84].forEach((m, i) => {
      const o = cctx.createOscillator(), g = cctx.createGain(), at = t + i * 0.09;
      o.type = 'sine'; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
      g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v, at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, at + 2.2);
      o.connect(g); g.connect(cctx.destination); o.start(at); o.stop(at + 2.3);
    });
  } catch { /* no sound: the candle still lights */ }
}

export function set(patch) {
  const was = { cat: S.cat, track: S.track };
  S = { ...S, ...patch };
  if (!CATS[S.cat]) S.cat = 'classic';
  if (S.cat !== was.cat && !('track' in patch)) S.track = '';
  S.vol = clamp(num(S.vol, 55), 0, 100); S.light = clamp(num(S.light, 100), 0, 100);
  keep();
  if (au && (S.cat !== was.cat || S.track !== was.track)) { if (cue() && playing) { au.volume = level(); au.play().catch(() => {}); } }
  else if (au && playing && !fadeT) au.volume = level();
  dim();
  tell();
}
export const current = () => ({ ...S });

/** Study or Focus: music, light and the Lamp together. The same mode again
 *  turns it off and lets the light back up. Starts the music (a click). */
export function mode(k) {
  if (S.mode === k || !MODES[k]) { set({ mode: '', light: 100, lamp: false }); return; }
  const m = MODES[k];
  set({ mode: k, cat: m.cat, light: m.light, lamp: m.lamp });
  userPaused = false;
  if (!isOn()) play();
}

/* ── The light ───────────────────────────────────────────────────────────── */
let here = false;
function dim() {
  if (typeof document === 'undefined') return;
  let d = document.getElementById('mp-dim');
  const lampOn = here && S.lamp;
  const a = here ? (lampOn ? Math.max(.55, shade(S.light) + .3) : shade(S.light)) : 0;
  if (!d) {
    if (!a) return;
    d = document.createElement('div'); d.id = 'mp-dim'; d.setAttribute('aria-hidden', 'true'); document.body.appendChild(d);
  }
  d.style.opacity = String(Math.min(.92, a));
  d.classList.toggle('focus', here && S.mode === 'focus' && !lampOn);
  d.classList.toggle('lamp', lampOn);
  if (lampOn) aim(); else d.classList.remove('aimed');
  candles();
}

/* ── The Lamp ────────────────────────────────────────────────────────────── */
/** The pool of light: around the question being written, else the middle. */
let target = null, aimQueued = false;
function aim() {
  const d = document.getElementById('mp-dim'); if (!d) return;
  const el = target && document.body.contains(target) ? target : null;
  if (!el) { d.classList.remove('aimed'); return; }
  const r = el.getBoundingClientRect();
  d.style.setProperty('--lx', `${Math.round(r.left + r.width / 2)}px`);
  d.style.setProperty('--ly', `${Math.round(r.top + r.height / 2)}px`);
  d.style.setProperty('--lw', `${Math.round(Math.max(260, r.width * .75))}px`);
  d.style.setProperty('--lh', `${Math.round(Math.max(180, r.height * .9))}px`);
  d.classList.add('aimed');
}
const reAim = () => { if (aimQueued || !S.lamp) return; aimQueued = true; requestAnimationFrame(() => { aimQueued = false; aim(); }); };

/** The seven candles for the domain on screen: lit = answers written. */
let lit = -1;
export function setCandles(n) { lit = Number.isFinite(n) ? Math.max(0, Math.min(7, n)) : -1; candles(); }
function candles() {
  if (typeof document === 'undefined') return;
  let c = document.getElementById('mp-candles');
  const show = here && S.lamp && lit >= 0;
  if (!show) { if (c) c.hidden = true; return; }
  if (!c) { c = document.createElement('div'); c.id = 'mp-candles'; c.className = 'mp-candles'; c.setAttribute('role', 'status'); document.body.appendChild(c); }
  c.hidden = false;
  c.setAttribute('aria-label', `${lit} of 7 answers written in this domain`);
  c.innerHTML = Array.from({ length: 7 }, (_, i) => `<i class="${i < lit ? 'on' : ''}"></i>`).join('');
}
/** A finished answer: one more candle, and the room plays it back. */
export function answered(n) {
  setCandles(n);
  if (playing && S.lamp) chime();
  const c = document.getElementById('mp-candles');
  if (c) { const last = c.querySelectorAll('i.on'); const i = last[last.length - 1]; if (i) i.classList.add('new'); }
}

/* ── The mini player ─────────────────────────────────────────────────────── */
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
const DISC = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" fill="#0B0907"/><g fill="none" stroke="#2E2822" stroke-width=".7"><circle cx="20" cy="20" r="16"/><circle cx="20" cy="20" r="13"/><circle cx="20" cy="20" r="10"/></g><path d="M8 13A14 14 0 0 1 22 6" fill="none" stroke="#F3EBD2" stroke-opacity=".18" stroke-width="3"/><circle cx="20" cy="20" r="6.5" fill="#B4975F"/><circle cx="20" cy="20" r="1.2" fill="#1C1309"/></svg>';

/** The player's markup, from the settings. */
export function playerHTML(s = S, playing = false, open = false) {
  const t = now(), list = pieces(s.cat), cat = CATS[s.cat];
  const what = failed ? 'Music is not available right now' : t ? `${cat.n} · ${list.length} ${list.length === 1 ? 'piece' : 'pieces'}` : libState === 'ready' || libState === 'failed' ? 'No music on this shelf yet' : 'Loading the music…';
  return `<button type="button" class="mp-pill" data-mp="open" aria-expanded="${open}" aria-controls="mp-win">
    <span class="mp-disc">${DISC}</span>
    <span class="mp-pt"><b>${esc(nowTitle())}</b><small>${playing ? (s.mode ? esc(MODES[s.mode].n) : 'Playing') : 'Study music'}</small></span>
    <span class="mp-eq" aria-hidden="true"><i></i><i></i><i></i></span>
  </button>
  <div class="mp-win" id="mp-win" role="dialog" aria-label="Study music, light and focus"${open ? '' : ' hidden'}>
    <div class="mp-head"><div><p class="mp-k">Your study room</p><h2>Music &amp; light</h2></div>
      <button type="button" class="mp-x" data-mp="close" aria-label="Close the player"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
    <div class="mp-now"><button type="button" class="mp-play" data-mp="play" aria-label="${playing ? 'Pause the music' : 'Play the music'}">${playing ? PAUSE : PLAY}</button>
      <div><b>${esc(nowTitle())}</b><span>${esc(what)}</span></div></div>
    <div class="mp-cats" role="group" aria-label="Choose the music">${Object.entries(CATS).map(([k, v]) => `<button type="button" class="mp-cat" data-mp-cat="${k}" aria-pressed="${s.cat === k}">${esc(v.n)}</button>`).join('')}</div>
    <fieldset class="mp-tracks"><legend>${esc(cat.n)}: ${esc(cat.d)}</legend>
      ${list.length ? list.map((p) => `<label><input type="radio" name="mp-track" value="${esc(p.key)}"${t && p.key === t.key ? ' checked' : ''}><span>${esc(p.title)}</span></label>`).join('')
        : `<p class="mp-empty">${libState === 'ready' || libState === 'failed' ? 'No music on this shelf yet.' : 'Loading the music…'}</p>`}
    </fieldset>
    <div class="mp-sls"><label class="mp-sl"><span class="mp-sk">Light</span><span class="mp-ends"><em>Dimmer</em><input type="range" id="mp-light" min="0" max="100" step="1" value="${s.light}" aria-label="Light: dimmer to brighter"><em>Brighter</em></span></label>
    <label class="mp-sl mp-vol"><span class="mp-sk">Volume</span><span class="mp-ends"><em></em><input type="range" id="mp-vol" min="0" max="100" step="1" value="${s.vol}" aria-label="Volume"><em></em></span></label></div>
    <label class="mp-lamp"><input type="checkbox" id="mp-lamp"${s.lamp ? ' checked' : ''}><span><b>The Lamp</b><small>A pool of light on the question you’re writing. Each answer you finish plays a chord and lights a candle.</small></span></label>
    <div class="mp-modes" role="group" aria-label="Modes">
      ${Object.entries(MODES).map(([k, v]) => `<button type="button" class="mp-mode" data-mp-mode="${k}" aria-pressed="${s.mode === k}"><b>${esc(v.n)}</b><small>${esc(v.d)}</small></button>`).join('')}
    </div>
    <p class="mp-fine">Music from the ExploraSelf library. It pauses when you leave this tab.</p>
  </div>`;
}

let mounted = false, open = false, closing = false, opening = false;
const still = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Open the panel: it rises and fades in (2 Nov 2026), once, not on every repaint. */
function showWin() { closing = false; opening = !open; open = true; paintPlayer(); }
/** Close it: it sinks and fades out, then is hidden. Nothing moves under reduced motion. */
function hideWin(then) {
  const w = document.querySelector('#mp .mp-win');
  const done = () => { if (!closing) return; closing = false; open = false; paintPlayer(); if (then) then(); };
  if (!open || closing) return;
  if (!w || w.hidden || still()) { closing = true; done(); return; }
  closing = true; w.classList.add('mp-out');
  w.addEventListener('animationend', done, { once: true });
  setTimeout(done, 260);
}
function paintPlayer() {
  const root = document.getElementById('mp');
  if (!root) return;
  const focusIn = root.contains(document.activeElement) ? document.activeElement.id || document.activeElement.dataset.mp || document.activeElement.dataset.mpMode : '';
  root.classList.toggle('playing', isOn());
  root.hidden = !here;
  root.innerHTML = playerHTML(S, isOn(), open);
  const w = root.querySelector('.mp-win');
  if (w && closing) w.classList.add('mp-out');
  else if (w && opening && !still()) { w.classList.add('mp-in'); w.addEventListener('animationend', () => w.classList.remove('mp-in'), { once: true }); }
  opening = false;
  if (focusIn) { const f = root.querySelector(`#${CSS.escape(focusIn)}, [data-mp="${focusIn}"], [data-mp-mode="${focusIn}"]`); if (f) f.focus({ preventScroll: true }); }
}
/** Open the player from elsewhere (the Crown's Music and Light). With an id,
 *  that control takes the focus, e.g. 'mp-light' for the light slider. */
export function openPlayer(focusId) {
  if (typeof document === 'undefined') return;
  mount(); showWin();
  const root = document.getElementById('mp'); if (!root) return;
  const f = (focusId && root.querySelector(`#${CSS.escape(focusId)}`)) || root.querySelector('.mp-play');
  if (f) f.focus({ preventScroll: true });
}
function mount() {
  if (mounted || typeof document === 'undefined') return;
  mounted = true;
  load();
  const root = document.createElement('div');
  root.id = 'mp'; root.className = 'mp'; root.hidden = true;
  document.body.appendChild(root);
  onChange(paintPlayer);
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.mp === 'open') { if (open) hideWin(); else { showWin(); const p = root.querySelector('.mp-play'); if (p) p.focus({ preventScroll: true }); } return; }
    if (b.dataset.mp === 'close') { hideWin(() => { const p = root.querySelector('.mp-pill'); if (p) p.focus({ preventScroll: true }); }); return; }
    if (b.dataset.mp === 'play') { toggle(); return; }
    if (b.dataset.mpMode) { mode(b.dataset.mpMode); return; }
    if (b.dataset.mpCat) { set({ cat: b.dataset.mpCat }); return; }
  });
  // Sliders change the sound and light as they move, and redraw only on release.
  root.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'mp-light') { S.light = +t.value; keep(); dim(); }
    else if (t.id === 'mp-vol') { S.vol = +t.value; keep(); if (au && playing && !fadeT) au.volume = level(); }
  });
  root.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'mp-track') set({ track: t.value });
    else if (t.id === 'mp-lamp') set({ lamp: t.checked });
    else if (/^mp-(light|vol)$/.test(t.id)) tell();
  });
  root.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) hideWin(() => { const p = root.querySelector('.mp-pill'); if (p) p.focus(); }); });
  // A click anywhere outside the open player closes it (31 Oct). Not the
  // Crown's own buttons: they open it.
  document.addEventListener('pointerdown', (e) => {
    if (!open || !e.target.closest || e.target.closest('#mp, .crown-wrap, .cw-wrap, [data-mp]')) return;
    hideWin();
  });
  // The Lamp follows the question being written.
  document.addEventListener('focusin', (e) => { const f = e.target.closest && e.target.closest('textarea, input.wcell'); if (f) { target = f.closest('.step, .cw-write') || f; reAim(); } });
  window.addEventListener('scroll', reAim, { passive: true });
  window.addEventListener('resize', reAim);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (isOn()) { resume = true; pause(); } } else if (here && resume) { resume = false; play(); }
  });
  // The first click on the dashboard starts the music, if the founder allows it.
  const first = (e) => {
    if (!here || quiet || e.target.closest('#mp, [data-cab="play"], #cab-auto, .mp-ask')) return;
    if (get('cab-music') !== 'off' && !userPaused && !isOn()) play();
    document.removeEventListener('pointerdown', first); document.removeEventListener('keydown', first);
  };
  document.addEventListener('pointerdown', first); document.addEventListener('keydown', first);
}
let resume = false, quiet = false;

/* ── The invitation ──────────────────────────────────────────────────────── */
const ASK_KEY = 'es-focus-ask', ASK_AFTER = 120;
let seconds = 0, clock = null;
const today = () => new Date().toISOString().slice(0, 10);
/** Whether the two-minute invitation may still show today. */
export function mayAsk(now = today()) { return get(ASK_KEY) !== now && S.mode !== 'focus'; }
function ask() {
  if (!here || isOn() || !mayAsk() || document.getElementById('mp-ask')) return;
  put(ASK_KEY, today());
  const d = document.createElement('div');
  d.id = 'mp-ask'; d.className = 'mp-ask'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-labelledby', 'mp-ask-h');
  d.innerHTML = `<span class="mp-disc big">${DISC}</span>
    <div><p class="mp-k">Two minutes in</p><p class="mp-ask-h" id="mp-ask-h">Start the music here, dim the light and turn on Focus mode.</p>
    <div class="mp-ask-b"><button type="button" class="mp-yes" data-ask="yes">Turn on Focus mode</button><button type="button" class="mp-no" data-ask="no">Not now</button></div></div>`;
  document.body.appendChild(d);
  const close = () => { d.remove(); };
  d.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.ask === 'yes') mode('focus');
    close();
  });
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  const y = d.querySelector('.mp-yes'); if (y) y.focus({ preventScroll: true });
}
function startClock() {
  if (clock || typeof window === 'undefined') return;
  clock = setInterval(() => {
    if (!here || document.hidden) return;
    seconds++;
    if (seconds >= ASK_AFTER) { clearInterval(clock); clock = null; ask(); }
  }, 1000);
}

/* ── Entering and leaving the dashboard ──────────────────────────────────── */
/** The founder is on a dashboard view (Your Base Camp, Library, Ask). */
export function enter(opts = {}) {
  // quiet: a page where the founder opened the player themselves (the North
  // Star's Crown). No first-click start and no two-minute invitation there.
  if (opts.quiet) quiet = true;
  mount();
  here = true;
  if (resume) { resume = false; play(); }
  dim(); paintPlayer(); if (!quiet) startClock();
}
/** The founder left the dashboard (the programme): music fades, light lifts. */
export function leave() {
  here = false;
  if (isOn()) { resume = true; pause(); }
  open = false; closing = false;
  dim(); paintPlayer();
  const a = document.getElementById('mp-ask'); if (a) a.remove();
}
