/* Light and dark, on every page. Loaded in <head> before any style is drawn,
 * so a page never flashes the wrong light.
 *
 * The founder's pick ('light' or 'dark') is kept on this browser
 * (localStorage 'es-theme'). With no pick, the page follows the device and
 * changes with it. The switch cycles Device → Light → Dark; a button with
 * data-theme-set="device|light|dark" (the profile menu) sets one. The old Cabinet
 * pick ('cab-theme') is carried over once.
 *
 * Sets <html data-theme="light|dark"> and data-theme-pick="device|light|dark",
 * and fires 'es-theme' on window whenever the light changes. */
(function () {
  var K = 'es-theme', root = document.documentElement, mq = null;
  function read() { try { return localStorage.getItem(K); } catch (e) { return null; } }
  function write(v) { try { if (v) localStorage.setItem(K, v); else localStorage.removeItem(K); } catch (e) { /* private mode */ } }
  try {
    if (!read()) { var old = localStorage.getItem('cab-theme'); if (old === 'light' || old === 'dark') write(old); }
  } catch (e) { /* private mode */ }
  try { mq = window.matchMedia('(prefers-color-scheme: dark)'); } catch (e) { mq = null; }
  function pick() { var p = read(); return p === 'light' || p === 'dark' ? p : 'device'; }
  function current() { var p = pick(); return p === 'device' ? (mq && mq.matches ? 'dark' : 'light') : p; }
  var ICON = {
    device: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none"/></svg>',
    light: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    dark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>'
  };
  var NAME = { device: 'Light follows your device', light: 'Light', dark: 'Dark' };
  function paintButtons() {
    var p = pick(), b = document.querySelectorAll('[data-theme-switch]');
    var seg = document.querySelectorAll('[data-theme-set]');
    for (var j = 0; j < seg.length; j++) seg[j].setAttribute('aria-pressed', String(seg[j].getAttribute('data-theme-set') === p));
    for (var i = 0; i < b.length; i++) {
      b[i].innerHTML = ICON[p];
      var next = p === 'device' ? 'light' : p === 'light' ? 'dark' : 'device';
      b[i].setAttribute('aria-label', NAME[p] + '. Switch to ' + NAME[next].toLowerCase());
      b[i].title = NAME[p];
    }
  }
  function apply() {
    var t = current();
    root.setAttribute('data-theme', t);
    root.setAttribute('data-theme-pick', pick());
    root.style.colorScheme = t;
    var m = document.querySelector('meta[name="color-scheme"]');
    if (m) m.setAttribute('content', t);
    paintButtons();
    try { window.dispatchEvent(new CustomEvent('es-theme', { detail: { theme: t, pick: pick() } })); } catch (e) { /* old browser */ }
  }
  function set(v) { write(v === 'light' || v === 'dark' ? v : null); apply(); }
  function cycle() { var p = pick(); set(p === 'device' ? 'light' : p === 'light' ? 'dark' : 'device'); }
  apply();
  if (mq) { var on = function () { if (pick() === 'device') apply(); }; if (mq.addEventListener) mq.addEventListener('change', on); else if (mq.addListener) mq.addListener(on); }
  window.ESTheme = { get: current, pick: pick, set: set, cycle: cycle };

  var CSS = '.es-ts{display:inline-grid;place-items:center;width:40px;height:40px;flex:none;border-radius:50%;border:1px solid rgba(201,162,74,.65);background:rgba(20,16,11,.55);color:#E3C47E;cursor:pointer;padding:0;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:background .3s,transform .3s}'
    + '.es-ts:hover{background:rgba(20,16,11,.8)}.es-ts:focus-visible{outline:2px solid #C9A24A;outline-offset:3px}'
    + '[data-theme-switch] svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}'
    + '.es-ts.float{position:fixed;left:max(14px,env(safe-area-inset-left,0px));bottom:max(14px,env(safe-area-inset-bottom,0px));z-index:70;box-shadow:0 10px 24px -12px rgba(0,0,0,.6)}'
    + '@media print{.es-ts{display:none}}@media (prefers-reduced-motion:reduce){.es-ts{transition:none}}';
  /* The switch: in <span id="themehost"> when the page has one, else a small
   * round button floating bottom-left. */
  function mount() {
    if (!document.getElementById('es-ts-style')) { var s = document.createElement('style'); s.id = 'es-ts-style'; s.textContent = CSS; document.head.appendChild(s); }
    if (document.querySelector('[data-theme-switch]')) { paintButtons(); return; }
    if (root.hasAttribute('data-no-theme-switch')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'es-ts'; b.setAttribute('data-theme-switch', '');
    var host = document.getElementById('themehost');
    if (host) host.appendChild(b); else { b.className += ' float'; document.body.appendChild(b); }
    paintButtons();
  }
  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;
    var t = e.target.closest('[data-theme-switch]'); if (t) { cycle(); return; }
    var v = e.target.closest('[data-theme-set]'); if (v) set(v.getAttribute('data-theme-set'));
  });
  window.ESTheme.paint = paintButtons;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
