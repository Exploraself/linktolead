/* The Horizon hero: a quiet star sky behind the dial (30 Oct).
   Light on purpose: ~120 dots on one canvas, drawn only while the hero is on
   screen and the tab is visible. With reduced motion the stars are drawn once
   and stay still. No dependencies. */
(function () {
  var c = document.getElementById('hz-sky');
  if (!c || !c.getContext) return;
  var x = c.getContext('2d'), stars = [], w = 0, h = 0, on = true, raf = 0;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size() {
    var r = c.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    w = c.width = Math.round(r.width * d); h = c.height = Math.round(r.height * d);
    stars = [];
    var n = Math.round(Math.min(140, r.width * r.height / 4200));
    for (var i = 0; i < n; i++) stars.push({ x: Math.random() * w, y: Math.random() * h * 0.6, r: (Math.random() * 1.1 + 0.3) * d, p: Math.random() * 6.28, s: 0.4 + Math.random() * 1.2 });
    draw(0);
  }
  function draw(t) {
    x.clearRect(0, 0, w, h); x.fillStyle = '#CFDCEA';
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      x.globalAlpha = still ? 0.55 : 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t / 1000 * s.s + s.p));
      x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.2832); x.fill();
    }
  }
  function loop(t) { draw(t); raf = on ? requestAnimationFrame(loop) : 0; }
  function go() { if (!still && on && !document.hidden && !raf) raf = requestAnimationFrame(loop); }
  size();
  window.addEventListener('resize', size);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else go(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { on = e[0].isIntersecting; if (on) go(); else { cancelAnimationFrame(raf); raf = 0; } }).observe(c);
  }
  go();
})();
