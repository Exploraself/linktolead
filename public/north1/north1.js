/* /north1/, the Leadership Compass sales page.
 *
 * 1. Every "Start" link goes to /compass/ with this visitor's own utm_* tags;
 *    with none, utm_source=north1, so sign-ups from this page can be told
 *    apart.
 * 2. The sample question answers on the page only: nothing is saved or sent.
 * 3. The example compass shape and the stars over the climb are drawn here.
 * 4. Motion: blocks rise in as they reach the screen (IntersectionObserver).
 *    Only when the visitor allows motion; without script the page is
 *    complete as it is. */
(function () {
  'use strict';
  var root = document.documentElement, ns = 'http://www.w3.org/2000/svg';

  /* 1 · The links */
  var here = new URLSearchParams(location.search), keep = new URLSearchParams();
  here.forEach(function (v, k) { if (/^utm_[a-z]{1,20}$/.test(k) && v.length <= 120) keep.set(k, v); });
  if (!keep.has('utm_source')) keep.set('utm_source', 'north1');
  var to = '/compass/?' + keep.toString();
  document.querySelectorAll('a[data-cta]').forEach(function (a) { a.href = to; });

  /* 2 · The sample question */
  var SAID = [
    'That’s an honest place to start. The Compass helps you write it down first, because the rest of the business leans on it.',
    'Worth checking. In the Compass you find one real example before you count it as yes.',
    'Good ground to build on. The Compass asks seven more like this, across all four domains.',
    'Clear on this one. Now see whether the other three domains are as clear.'
  ];
  var ans = document.getElementById('ans'), out = document.getElementById('tryout');
  if (ans && out) ans.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-a]'); if (!b) return;
    ans.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    out.innerHTML = '<b>' + SAID[+b.dataset.a] + '</b><a href="' + to + '">Answer all eight in the Compass →</a>';
    out.hidden = false;
  });

  /* 3 · The example shape: four domains, one lower */
  var radar = document.getElementById('radar');
  if (radar) {
    var c = 180, M = 112, ang = [-90, 0, 90, 180], vals = [4, 3, 2, 3], cols = ['var(--self)', 'var(--people)', 'var(--work)', 'var(--market)'];
    var pt = function (a, r) { a = a * Math.PI / 180; return [c + r * Math.cos(a), c + r * Math.sin(a)]; };
    var g = '';
    [1, 2, 3, 4, 5].forEach(function (k) { g += '<polygon points="' + ang.map(function (a) { return pt(a, M * k / 5).join(','); }).join(' ') + '" fill="none" stroke="var(--line)"/>'; });
    ang.forEach(function (a) { var p = pt(a, M); g += '<line x1="' + c + '" y1="' + c + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="var(--line)"/>'; });
    var pts = ang.map(function (a, i) { return pt(a, M * vals[i] / 5); });
    var poly = pts.map(function (p) { return p.join(','); }).join(' ');
    var len = 0; for (var i = 0; i < 4; i++) { var p = pts[i], q = pts[(i + 1) % 4]; len += Math.hypot(q[0] - p[0], q[1] - p[1]); }
    g += '<polygon class="shape-fill" points="' + poly + '" fill="var(--gold)" fill-opacity=".2"/>';
    g += '<polygon class="shape-line" points="' + poly + '" fill="none" stroke="var(--gold)" stroke-width="2" style="--len:' + Math.ceil(len) + '"/>';
    pts.forEach(function (p, i) { g += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="' + cols[i] + '"/>'; });
    g += '<text x="180" y="44" text-anchor="middle">Lead yourself</text><text x="352" y="160" text-anchor="end">Lead your people</text><text x="180" y="330" text-anchor="middle">Lead your business</text><text x="8" y="160">Lead the market</text>';
    radar.innerHTML = g;
  }

  /* The climb: the trail's length for the drawing, and a few stars */
  var trail = document.querySelector('.climb .trail');
  if (trail && trail.getTotalLength) trail.style.setProperty('--len', String(Math.ceil(trail.getTotalLength())));
  var S = document.getElementById('stars');
  if (S) for (var k = 0; k < 24; k++) {
    var s = document.createElementNS(ns, 'circle');
    s.setAttribute('class', 'star'); s.setAttribute('cx', String(20 + Math.random() * 480)); s.setAttribute('cy', String(10 + Math.random() * 110));
    s.setAttribute('r', String(Math.random() * 1.2 + .4)); s.setAttribute('fill', '#F3EAD7'); s.setAttribute('opacity', '.5');
    s.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
    S.appendChild(s);
  }

  /* 4 · Motion */
  var calm = false;
  try { calm = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { calm = false; }
  if (calm || !('IntersectionObserver' in window)) return;
  root.classList.add('motion');
  var io = new IntersectionObserver(function (list) {
    list.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  // Anything already on screen at load shows at once, so the first frame is complete.
  requestAnimationFrame(function () {
    document.querySelectorAll('.rv').forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('in'); });
  });
})();
