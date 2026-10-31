// The heat engine for /road2/: a small field that diffuses and cools, drawn
// through the inferno scale of a thermal camera. Nodes are heat sources that
// ease toward a target; particles carry heat from where they start to the
// node they head for; a pointer can probe the field. No dependencies.
//
// Every field stops when it is off screen, and under reduced motion (or the
// page's motion switch) it settles once and is drawn as a still frame.

/** The inferno scale, as stops along 0..1. */
const STOPS = [[0, '#000004'], [0.13, '#1B0C41'], [0.25, '#4A0C6B'], [0.38, '#781C6D'], [0.5, '#A52C60'],
  [0.63, '#CF4446'], [0.75, '#ED6925'], [0.88, '#FB9B06'], [0.95, '#F7D13D'], [1, '#FCFFA4']];
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
/** 256 colours, one per heat level. */
export const LUT = (() => {
  const out = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let k = 0;
    while (k < STOPS.length - 2 && t > STOPS[k + 1][0]) k++;
    const [t0, c0] = STOPS[k], [t1, c1] = STOPS[k + 1], f = (t - t0) / (t1 - t0 || 1);
    const a = hex(c0), b = hex(c1);
    for (let j = 0; j < 3; j++) out[i * 3 + j] = a[j] + (b[j] - a[j]) * f;
  }
  return out;
})();
/** The colour at heat t (0..1), as css. */
export const heatColor = (t) => { const i = Math.max(0, Math.min(255, Math.round(t * 255))) * 3; return `rgb(${LUT[i]},${LUT[i + 1]},${LUT[i + 2]})`; };

export class Field {
  /** canvas: the element to draw in. gw, gh: the grid. */
  constructor(canvas, { gw = 150, gh = 96, decay = 0.955, gain = 0.9 } = {}) {
    this.c = canvas; this.ctx = canvas.getContext('2d');
    this.gw = gw; this.gh = gh; this.decay = decay; this.gain = gain;
    this.h = new Float32Array(gw * gh); this.t = new Float32Array(gw * gh);
    this.off = document.createElement('canvas'); this.off.width = gw; this.off.height = gh;
    this.octx = this.off.getContext('2d'); this.img = this.octx.createImageData(gw, gh);
    this.nodes = []; this.parts = []; this.probe = null; this.spawn = null; this.tick = 0;
    this.resize();
  }
  /** Match the canvas to its box, and the grid to its shape, so heat stays round. */
  resize() {
    const r = this.c.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
    if (!r.width || !r.height) return;
    this.c.width = Math.max(1, Math.round(r.width * d)); this.c.height = Math.max(1, Math.round(r.height * d));
    const gh = Math.max(40, Math.min(220, Math.round(this.gw * r.height / r.width)));
    if (gh === this.gh) return;
    this.gh = gh; this.h = new Float32Array(this.gw * gh); this.t = new Float32Array(this.gw * gh);
    this.off.height = gh; this.img = this.octx.createImageData(this.gw, gh);
  }
  /** A heat source at x, y (0..1). `heat` eases toward `target`. */
  node(id, x, y, { heat = 1, r = 9 } = {}) { const n = { id, x, y, heat, target: heat, r, kick: 0 }; this.nodes.push(n); return n; }
  get(id) { return this.nodes.find((n) => n.id === id); }
  /** A sudden flare on a node, that settles back to its target. */
  flare(id, amount = 3) { const n = this.get(id); if (n) n.kick += amount; }
  splat(x, y, r, a) {
    const { gw, gh, h } = this, cx = x * gw, cy = y * gh, rr = r * r;
    const x0 = Math.max(0, Math.floor(cx - r * 2)), x1 = Math.min(gw - 1, Math.ceil(cx + r * 2));
    const y0 = Math.max(0, Math.floor(cy - r * 2)), y1 = Math.min(gh - 1, Math.ceil(cy + r * 2));
    for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) {
      const dx = i - cx, dy = j - cy;
      h[j * gw + i] += a * Math.exp(-(dx * dx + dy * dy) / rr);
    }
  }
  step(moving = true) {
    const { gw, gh, h, t } = this;
    this.tick++;
    for (const n of this.nodes) {
      n.heat += (n.target - n.heat) * 0.04;
      n.kick *= 0.94;
      const flicker = moving ? 1 + Math.sin(this.tick * 0.07 + n.x * 9) * 0.06 + (Math.random() - 0.5) * 0.08 : 1;
      this.splat(n.x, n.y, n.r, (n.heat + n.kick) * 0.12 * flicker);
    }
    if (moving && this.spawn) {
      if (this.parts.length < this.spawn.max && Math.random() < this.spawn.rate) this.parts.push(this.spawn.make());
      for (let k = this.parts.length - 1; k >= 0; k--) {
        const p = this.parts[k], to = this.get(p.to);
        if (!to) { this.parts.splice(k, 1); continue; }
        const dx = to.x - p.x, dy = to.y - p.y, d = Math.hypot(dx, dy);
        if (d < 0.02) { this.parts.splice(k, 1); if (p.hit) p.hit(to); continue; }
        // a little sideways drift, so the trails curve like real flow
        p.vx = p.vx * 0.9 + (dx / d) * p.speed * 0.1 + (-dy / d) * p.curl * 0.1;
        p.vy = p.vy * 0.9 + (dy / d) * p.speed * 0.1 + (dx / d) * p.curl * 0.1;
        p.x += p.vx; p.y += p.vy;
        this.splat(p.x, p.y, 2.2, p.heat);
      }
    }
    if (this.probe) this.splat(this.probe.x, this.probe.y, 6, 0.35);
    // diffuse and cool
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const k = j * gw + i;
      const l = i > 0 ? h[k - 1] : h[k], r = i < gw - 1 ? h[k + 1] : h[k];
      const u = j > 0 ? h[k - gw] : h[k], d = j < gh - 1 ? h[k + gw] : h[k];
      t[k] = (h[k] * 4 + l + r + u + d) / 8 * this.decay;
    }
    this.h.set(t);
  }
  draw() {
    const { h, img, gain } = this, px = img.data;
    for (let k = 0; k < h.length; k++) {
      const v = 1 - Math.exp(-h[k] * gain), i = Math.min(255, (v * 255) | 0) * 3, o = k * 4;
      px[o] = LUT[i]; px[o + 1] = LUT[i + 1]; px[o + 2] = LUT[i + 2]; px[o + 3] = 255;
    }
    this.octx.putImageData(img, 0, 0);
    const { ctx, c } = this;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this.off, 0, 0, c.width, c.height);
  }
  /** Run silently until the field settles, then draw one frame. */
  settle(n = 160) { for (let i = 0; i < n; i++) this.step(false); this.draw(); }
  /** The heat at x, y (0..1), 0..1. */
  read(x, y) { const i = Math.min(this.gw - 1, Math.max(0, Math.round(x * this.gw))), j = Math.min(this.gh - 1, Math.max(0, Math.round(y * this.gh))); return 1 - Math.exp(-this.h[j * this.gw + i] * this.gain); }
}

/** Runs every field that is on screen, one frame each, unless `still()`. */
export function runner(still) {
  const live = new Set();
  let raf = 0;
  const frame = () => {
    raf = 0;
    if (still()) { live.forEach((f) => f.settle(40)); return; }
    live.forEach((f) => { f.step(true); f.draw(); if (f.onFrame) f.onFrame(); });
    if (live.size) raf = requestAnimationFrame(frame);
  };
  const go = () => { if (!raf && live.size) raf = requestAnimationFrame(frame); };
  return {
    watch(f) {
      try { new ResizeObserver(() => { f.resize(); if (still()) f.settle(); }).observe(f.c); } catch { /* old browser: resized on window resize */ }
      try {
        new IntersectionObserver((es) => { es.forEach((e) => (e.isIntersecting ? live.add(f) : live.delete(f))); go(); }).observe(f.c);
      } catch { live.add(f); go(); }
    },
    kick: go,
  };
}
