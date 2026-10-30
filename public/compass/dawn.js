/* The dawn before The Summit: a night sky, a gold ridge drawing itself from
 * left to right, the five stops of Link to Lead lighting up in order, a glow
 * rising behind the peak and a flag on the summit.
 *
 * It plays each time it scrolls into view and rests when out of view. With
 * prefers-reduced-motion it is one still picture, fully drawn. On narrow
 * screens only the first and last stops are labelled, so nothing overlaps. */
'use strict';
(function () {
  const cv = document.getElementById('dawn');
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d');
  const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; } };
  const STOPS = [['Founder Launchpad', 0.14], ['The Boardroom', 0.32], ['Personal Leadership LAB', 0.5], ['Business HUB', 0.68], ['The Summit', 0.86]];
  const N = 120;
  let W = 0, H = 0, stars = [], ridge = [], t0 = performance.now(), running = false, visible = false;

  function setup() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    if (!W || !H) return;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    stars = Array.from({ length: Math.round(W / 9) }, () => ({ x: rnd() * W, y: rnd() * H * 0.55, r: rnd() * 1.3 + 0.3, ph: rnd() * 6.28 }));
    // The ridge rises from the left to the peak at 86%, then falls. Lower on
    // phones, so the caption above keeps clear of the flag.
    const rise = W < 560 ? 0.42 : 0.55;
    ridge = [];
    for (let i = 0; i <= N; i++) {
      const x = i / N, base = x <= 0.86 ? x / 0.86 : 1 - (x - 0.86) / 0.14 * 0.55;
      const wob = Math.sin(x * 23) * 0.035 + Math.sin(x * 57) * 0.015;
      ridge.push([x * W, H - 40 - H * rise * Math.max(0, base + (x < 0.84 ? wob * (1 - x) : 0))]);
    }
  }
  const yAt = (fx) => ridge[Math.max(0, Math.min(N, Math.round(fx * N)))][1];

  function draw(T, still) {
    ctx.clearRect(0, 0, W, H);
    const peakX = W * 0.86, peakY = yAt(0.86);
    const g = Math.min(1, T / 4.5);
    const glow = ctx.createRadialGradient(peakX, peakY + 30, 0, peakX, peakY + 30, H * (0.35 + 0.4 * g));
    glow.addColorStop(0, `rgba(243,222,154,${0.35 * g})`); glow.addColorStop(0.4, `rgba(111,147,184,${0.18 * g})`); glow.addColorStop(1, 'rgba(111,147,184,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    for (const s of stars) {
      ctx.globalAlpha = still ? 0.55 : 0.35 + 0.35 * Math.sin(T * 1.6 + s.ph);
      ctx.fillStyle = '#EEF2F7'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // The far range, then the near ridge, drawn up to where the line has reached.
    ctx.fillStyle = '#0E0A07'; ctx.beginPath(); ctx.moveTo(0, H);
    ridge.forEach(([x, y], i) => ctx.lineTo(x, y + 26 + Math.sin(i * 0.3) * 6)); ctx.lineTo(W, H); ctx.fill();
    const prog = Math.min(1, T / 3), upto = Math.floor(prog * N);
    ctx.fillStyle = '#140E09'; ctx.beginPath(); ctx.moveTo(0, H); ridge.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(W, H); ctx.fill();
    ctx.strokeStyle = '#6F93B8'; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= upto; i++) { const [x, y] = ridge[i]; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
    if (!still && prog >= 1) {
      ctx.setLineDash([2, 9]); ctx.lineDashOffset = -T * 18; ctx.strokeStyle = 'rgba(247,242,231,.55)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ridge.forEach(([x, y], i) => (i ? ctx.lineTo(x, y - 7) : ctx.moveTo(x, y - 7))); ctx.stroke(); ctx.setLineDash([]);
    }
    STOPS.forEach(([name, fx], i) => {
      if (prog < fx - 0.02) return;
      const x = fx * W, y = yAt(fx), last = i === STOPS.length - 1;
      const pulse = still ? 0.5 : (Math.sin(T * 2.4 - i) + 1) / 2;
      ctx.fillStyle = `rgba(169,192,217,${0.15 + 0.2 * pulse})`; ctx.beginPath(); ctx.arc(x, y, last ? 16 : 10, 0, 6.283); ctx.fill();
      ctx.fillStyle = last ? '#F3DE9A' : '#6F93B8'; ctx.beginPath(); ctx.arc(x, y, last ? 6 : 4.5, 0, 6.283); ctx.fill();
      if (last) {
        ctx.strokeStyle = '#EEF2F7'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x, y - 38); ctx.stroke();
        const wv = still ? 0 : Math.sin(T * 3) * 2.5;
        ctx.fillStyle = '#6F93B8'; ctx.beginPath();
        ctx.moveTo(x, y - 38); ctx.lineTo(x + 20, y - 34 + wv); ctx.lineTo(x + 15, y - 29 + wv * 0.5); ctx.lineTo(x + 20, y - 24 + wv); ctx.lineTo(x, y - 25); ctx.fill();
      }
      if (W > 560 || last || i === 0) {
        ctx.font = `${last ? '600 13px' : '500 11px'} "Inter", Arial, sans-serif`;
        ctx.fillStyle = last ? '#F3DE9A' : '#B8C6D6';
        // Keep every label inside the picture.
        const w = ctx.measureText(name).width;
        // The Summit sits above the ridge, left of the flag; the others below their stop.
        let lx = last ? x - 12 - w : x - w / 2;
        lx = Math.max(8, Math.min(W - 8 - w, lx));
        ctx.textAlign = 'left'; ctx.fillText(name, lx, last ? y - 22 : y + 22);
      }
    });
  }

  function loop(now) {
    if (!visible || document.hidden || reduced()) { running = false; return; }
    draw((now - t0) / 1000, false);
    requestAnimationFrame(loop);
  }
  function play() {
    if (!W) setup();
    if (!W) return;
    if (reduced()) { draw(99, true); return; }
    t0 = performance.now();
    if (!running) { running = true; requestAnimationFrame(loop); }
  }

  setup();
  if (W) draw(reduced() ? 99 : 0, reduced());
  window.addEventListener('resize', () => { setup(); if (W) { if (reduced() || !visible) draw(99, true); } });
  // A hidden tab rests too, and plays again when it comes back.
  document.addEventListener('visibilitychange', () => { if (document.hidden) { visible = false; } else if (cv.getBoundingClientRect().top < innerHeight && cv.getBoundingClientRect().bottom > 0) { visible = true; play(); } });
  try {
    new IntersectionObserver((es) => es.forEach((e) => {
      const was = visible; visible = e.isIntersecting;
      if (visible && !was) play();
    }), { threshold: 0.4 }).observe(cv);
  } catch { visible = true; play(); }
})();
