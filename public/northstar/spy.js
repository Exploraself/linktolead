/* The menu follows the reading (30 Oct). As the founder scrolls, a soft light
 * glides to the section on screen, its name brightens, and a thin line down
 * the menu fills with how far through the page they are. Clicking still jumps
 * as before (app.js). Under reduced motion the light moves without gliding. */
(function () {
  var ORDER = [['overview', 's-overview'], ['clear', 's-clear'], ['people', 's-people'], ['numbers', 's-numbers'], ['plan', 's-whatif'], ['method', 's-method']];
  var nav = document.getElementById('nav');
  if (!nav) return;
  var glow = document.createElement('span'); glow.className = 'nl-glow'; glow.setAttribute('aria-hidden', 'true');
  var prog = document.createElement('span'); prog.className = 'nav-prog'; prog.setAttribute('aria-hidden', 'true');
  prog.innerHTML = '<i></i>';
  var current = '', ticking = false;

  function mount() {
    if (glow.parentNode !== nav) nav.appendChild(glow);
    if (prog.parentNode !== nav) nav.appendChild(prog);
  }
  function active() {
    // The section whose top has most recently passed a line a third down the
    // screen, in the order the page actually shows them.
    var line = window.innerHeight * 0.32, pick = ORDER[0][0], best = -Infinity, low = -Infinity, lowId = pick;
    for (var i = 0; i < ORDER.length; i++) {
      var el = document.getElementById(ORDER[i][1]);
      if (!el || el.offsetParent === null) continue;
      var top = el.getBoundingClientRect().top;
      if (top <= line && top > best) { best = top; pick = ORDER[i][0]; }
      if (top > low) { low = top; lowId = ORDER[i][0]; }
    }
    // At the very bottom, the lowest section on the page is the one being read.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) pick = lowId;
    return pick;
  }
  function place() {
    mount();
    var id = active();
    window.__nsSpy = id;
    var btns = nav.querySelectorAll('.nl[data-go]'), on = null;
    for (var i = 0; i < btns.length; i++) {
      var me = btns[i].getAttribute('data-go') === id;
      btns[i].classList.toggle('on', me);
      if (me) { btns[i].setAttribute('aria-current', 'true'); on = btns[i]; } else btns[i].removeAttribute('aria-current');
    }
    if (on) {
      glow.style.transform = 'translate(' + on.offsetLeft + 'px,' + on.offsetTop + 'px)';
      glow.style.width = on.offsetWidth + 'px'; glow.style.height = on.offsetHeight + 'px';
      glow.classList.add('show');
      // On a phone the menu is a row: keep the lit item in view.
      if (id !== current && nav.scrollWidth > nav.clientWidth + 4) nav.scrollTo({ left: Math.max(0, on.offsetLeft - 16), behavior: 'smooth' });
    }
    current = id;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    prog.firstChild.style.transform = 'scaleY(' + (max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0) + ')';
    ticking = false;
  }
  function soon() { if (!ticking) { ticking = true; requestAnimationFrame(place); } }
  window.addEventListener('scroll', soon, { passive: true });
  window.addEventListener('resize', soon);
  // app.js redraws the menu: put the light back on it.
  new MutationObserver(function () { if (glow.parentNode !== nav || prog.parentNode !== nav) soon(); }).observe(nav, { childList: true });
  if (document.readyState === 'complete') soon(); else window.addEventListener('load', soon);
  setTimeout(soon, 400);
})();
